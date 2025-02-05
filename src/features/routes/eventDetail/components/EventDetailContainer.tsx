'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Event,
  EventInteractionHistory,
  User,
} from '@/types/firestoreDocument';
import { useRouter } from 'next/navigation';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { Star, Sparkles, Baby } from 'lucide-react';
import { useAuth } from '@/features/common/auth/AuthContext';
import {
  Timestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  vector,
  Firestore,
} from 'firebase/firestore';
import { db as firebaseDb } from '@/utils/firebase/config';
import { toast } from '@/hooks/toast/useToast';
import { generateUserProfileVector } from '@/features/routes/preferences/utils/vector';
import { useFindSimilarEvents } from '@/hooks/useFirebaseFunction';
import { docsFetcher, sortDocsByIds } from '@/hooks/useFirestore';
import { executeWorkflow } from '../serverActions/planning';
import ReactMarkdown from 'react-markdown';

interface Props {
  eventId: string;
}

export default function EventDetailContainer({ eventId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [isPlanningLoading, setIsPlanningLoading] = useState(false);
  const [planningResult, setPlanningResult] = useState<string | null>(null);
  const [considerBaby, setConsiderBaby] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [startLocationError, setStartLocationError] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsFeedback, setNpsFeedback] = useState('');
  const [hasSubmittedNps, setHasSubmittedNps] = useState(false);

  // Firestore インスタンスの取得
  const db = firebaseDb as Firestore;

  const { data: event, isLoading: isEventLoading } = useFirestoreDoc<Event>(
    `events/${eventId}`
  );
  const {
    data: eventInteractionHistory,
    isLoading: isEventInteractionHistoryLoading,
    mutate: mutateEventInteractionHistory,
  } = useFirestoreDoc<EventInteractionHistory>(
    `users/${user?.uid}/eventInteractionHistories/${eventId}`
  );

  // 類似イベントの取得
  const { data: similarEventsData } = useFindSimilarEvents(
    event
      ? {
          userId: user?.uid || 'anonymous',
          startDate: event.eventDate.toDate().toISOString().split('T')[0],
          limit: 5,
        }
      : null
  );

  // 類似イベントデータの取得
  useEffect(() => {
    async function fetchSimilarEvents() {
      if (!similarEventsData?.success || !similarEventsData.eventIds.length) {
        setSimilarEvents([]);
        return;
      }

      try {
        const eventsData = await docsFetcher<Event>(
          'events',
          similarEventsData.eventIds
        );
        const sortedEvents = sortDocsByIds(
          eventsData,
          similarEventsData.eventIds
        );
        setSimilarEvents(sortedEvents);
      } catch (error) {
        console.error('類似イベントの取得中にエラーが発生しました:', error);
        setSimilarEvents([]);
      }
    }

    fetchSimilarEvents();
  }, [similarEventsData]);

  const updateUserVectorClickKokoiku = useCallback(async () => {
    if (!user || !event || !db) return;

    const newDoc: Pick<EventInteractionHistory, 'action' | 'updatedAt'> = {
      action: 'kokoiku',
      updatedAt: Timestamp.now(),
    };

    await setDoc(
      doc(db, `users/${user.uid}/eventInteractionHistories`, event.id),
      newDoc,
      { merge: true }
    );

    const historiesQuery = query(
      collection(db, `users/${user.uid}/eventInteractionHistories`),
      orderBy('createdAt', 'desc'),
      limit(15)
    );
    const historiesSnapshot = await getDocs(historiesQuery);
    const userVector = generateUserProfileVector(
      historiesSnapshot.docs.map((doc) =>
        doc.data()
      ) as EventInteractionHistory[]
    );

    const newUserDoc: User = {
      // @ts-expect-error  zod で vector を定義できない
      preferenceVector: vector(userVector),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, `users/${user.uid}`), newUserDoc, { merge: true });
  }, [user, event, db]);

  const handleGoingClick = async () => {
    if (!user || !event || isProcessing || !db) return;

    try {
      setIsProcessing(true);
      await updateUserVectorClickKokoiku();
      // 状態を即座に更新
      await mutateEventInteractionHistory();
      toast({
        title: 'ここいくに保存しました',
        description: 'マイページのここいくリストから確認できます',
      });
    } catch (error) {
      console.error('参加意思の登録中にエラーが発生しました:', error);
      toast({
        title: 'エラーが発生しました',
        description: '時間をおいて再度お試しください',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanningGeneration = async () => {
    if (!event || !user || !db) return;

    try {
      setIsPlanningLoading(true);
      const result = await executeWorkflow({
        eventLocation: event.eventLocationCityJa,
        eventPlace: event.eventLocationNameJa,
        eventCity: event.eventLocationCityJa,
        eventTitle: event.eventTitleJa,
        considerBaby,
        startLocation: startLocation || event.eventLocationCityJa,
      });
      if (result) {
        setPlanningResult(result);
        // AIプランを保存
        const historiesRef = doc(
          db,
          `users/${user.uid}/eventInteractionHistories`,
          event.id
        );
        const addData: Pick<
          EventInteractionHistory,
          'aiPlanning' | 'updatedAt'
        > = {
          aiPlanning: result,
          updatedAt: Timestamp.now(),
        };
        console.log('🚀  handlePlanningGeneration  addData:', addData);
        await setDoc(historiesRef, addData, { merge: true });
      }
    } catch (error) {
      console.error('AIプランの生成に失敗しました:', error);
      toast({
        title: 'エラーが発生しました',
        description:
          'AIプランの生成に失敗しました。時間をおいて再度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setIsPlanningLoading(false);
    }
  };

  const handleNpsSubmit = async () => {
    if (!user || !event || !db || npsScore === null) return;

    try {
      const historiesRef = doc(
        db,
        `users/${user.uid}/eventInteractionHistories`,
        event.id
      );

      const addData: Pick<EventInteractionHistory, 'npsData' | 'updatedAt'> = {
        npsData: {
          score: npsScore,
          feedback: npsFeedback,
          createdAt: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      };

      await setDoc(historiesRef, addData, { merge: true });
      setHasSubmittedNps(true);
      toast({
        title: 'フィードバックを送信しました',
        description: 'ご協力ありがとうございます',
      });
    } catch (error) {
      console.error('NPSの保存に失敗しました:', error);
      toast({
        title: 'エラーが発生しました',
        description: '時間をおいて再度お試しください',
        variant: 'destructive',
      });
    }
  };

  if (isEventLoading || isEventInteractionHistoryLoading) {
    return <Loading />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <main className='flex-1 p-4'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>
            {event.eventEmoji} {event.eventTitleJa}
          </h1>

          <div className='space-y-6'>
            {/* 日時 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>開催日時</h2>
              <p className='mt-2 text-gray-600'>
                {event.eventDate.toDate().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>

            {/* 場所 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>開催場所</h2>
              <p className='mt-2 text-gray-600'>{event.eventLocationNameJa}</p>
              <p className='mt-1 text-sm text-gray-500'>
                {event.eventLocationCityJa}
              </p>
            </div>

            {/* 説明 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                イベント詳細
              </h2>
              <p className='mt-2 text-gray-600 whitespace-pre-wrap'>
                {event.eventDescriptionJa}
              </p>
            </div>

            <div dangerouslySetInnerHTML={{ __html: event.renderedContent }} />

            {/* メインアクション */}
            <div className='flex justify-center mt-6'>
              <button
                onClick={handleGoingClick}
                disabled={
                  isProcessing ||
                  !user ||
                  eventInteractionHistory?.action === 'kokoiku'
                }
                className='w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                <Star className='w-6 h-6 mr-2 fill-current' />
                {isProcessing
                  ? '処理中...'
                  : eventInteractionHistory?.action === 'kokoiku'
                  ? 'ココいく済み'
                  : 'ココいく！'}
              </button>
            </div>

            {/* AIプランセクション */}
            <div className='mt-12 rounded-xl overflow-hidden border border-purple-100'>
              <div className='px-6 py-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-b border-purple-100'>
                <h2 className='text-base font-medium text-gray-900 flex items-center'>
                  <Sparkles className='w-4 h-4 text-purple-500 mr-2' />
                  AI があなたの週末をサポート
                </h2>
                <p className='mt-1 text-sm text-gray-500'>
                  {eventInteractionHistory?.aiPlanning
                    ? 'AIが生成したおすすめプランです'
                    : '周辺施設や移動時間を考慮した、おすすめプランを AI が提案します'}
                </p>
              </div>

              <div className='p-6 bg-white'>
                {planningResult == null &&
                !eventInteractionHistory?.aiPlanning ? (
                  <div className='flex flex-col items-center justify-center text-center'>
                    {!eventInteractionHistory?.aiPlanning && (
                      <>
                        <div className='w-full max-w-sm space-y-4 mb-6'>
                          <div className='flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg'>
                            <div className='flex items-center space-x-2'>
                              <Baby className='w-4 h-4 text-purple-500' />
                              <span className='text-sm text-gray-700'>
                                おむつ替えスポットを考慮
                              </span>
                            </div>
                            <button
                              onClick={() => setConsiderBaby(!considerBaby)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                considerBaby ? 'bg-purple-500' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  considerBaby
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className='space-y-2'>
                            <label className='block text-sm text-gray-700 text-left'>
                              出発地
                              <span className='text-red-500 ml-1'>*</span>
                            </label>
                            <input
                              type='text'
                              value={startLocation}
                              onChange={(e) => {
                                setStartLocation(e.target.value);
                                setStartLocationError(false);
                              }}
                              onBlur={() => {
                                setStartLocationError(!startLocation.trim());
                              }}
                              placeholder='例：岐阜市'
                              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-25 ${
                                startLocationError
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            />
                            {startLocationError ? (
                              <p className='text-xs text-red-500 text-left'>
                                出発地を入力してください
                              </p>
                            ) : (
                              <p className='text-xs text-gray-500 text-left'>
                                市区町村単位で入力してください
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!startLocation.trim()) {
                              setStartLocationError(true);
                              return;
                            }
                            handlePlanningGeneration();
                          }}
                          disabled={
                            isPlanningLoading ||
                            startLocationError ||
                            !startLocation.trim()
                          }
                          className={`
                            w-full sm:w-auto h-10 px-6
                            bg-gradient-to-r from-purple-500/10 to-blue-500/10
                            hover:from-purple-500/20 hover:to-blue-500/20
                            rounded-full flex items-center justify-center
                            text-gray-700 text-sm font-medium
                            transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-25
                            disabled:opacity-50 disabled:cursor-not-allowed
                            relative overflow-hidden
                            ${isPlanningLoading ? 'animate-pulse' : ''}
                          `}
                        >
                          <Sparkles
                            className={`w-4 h-4 mr-2 text-purple-500 transition-transform ${
                              isPlanningLoading
                                ? 'animate-[spin_3s_linear_infinite]'
                                : ''
                            }`}
                          />
                          <span
                            className={`relative ${
                              isPlanningLoading ? 'animate-pulse' : ''
                            }`}
                          >
                            {isPlanningLoading ? (
                              <>
                                プラン作成中
                                <span className='inline-block animate-[bounce_1.4s_infinite]'>
                                  .
                                </span>
                                <span className='inline-block animate-[bounce_1.4s_0.2s_infinite]'>
                                  .
                                </span>
                                <span className='inline-block animate-[bounce_1.4s_0.4s_infinite]'>
                                  .
                                </span>
                              </>
                            ) : eventInteractionHistory?.aiPlanning ? (
                              'プランは生成済みです'
                            ) : (
                              'プランを作成する'
                            )}
                          </span>
                          {isPlanningLoading && (
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -skew-x-12' />
                          )}
                        </button>
                        <p className='mt-3 text-xs text-gray-500'>
                          ※ プランの生成には20秒ほどかかります <br /> ※
                          プランの生成は1イベントにつき1度だけです
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className='prose prose-sm max-w-none text-gray-600 [&>h3]:text-base [&>h3]:font-medium [&>h3]:text-gray-900 [&>h3:not(:first-child)]:mt-6'>
                    <ReactMarkdown>
                      {planningResult || eventInteractionHistory?.aiPlanning}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* NPSセクション - プランが生成された後に表示 */}
              {(planningResult || eventInteractionHistory?.aiPlanning) &&
                !hasSubmittedNps &&
                !eventInteractionHistory?.npsData && (
                  <div className='p-6 border-t border-purple-100'>
                    <h3 className='text-base font-medium text-gray-900 mb-4'>
                      AIプランニングの評価をお願いします
                    </h3>

                    {/* NPS スコア選択 */}
                    <div className='mb-6'>
                      <p className='text-sm text-gray-600 mb-3'>
                        このAIプランを友人や家族にお勧めしたいと思いますか？
                      </p>
                      <div className='flex justify-between gap-1'>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button
                            key={score}
                            onClick={() => setNpsScore(score)}
                            className={`
                            w-8 h-8 rounded-full text-sm font-medium
                            ${
                              npsScore === score
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                            }
                            transition-colors duration-200
                          `}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <div className='flex justify-between mt-1'>
                        <span className='text-xs text-gray-500'>
                          全く思わない
                        </span>
                        <span className='text-xs text-gray-500'>
                          とても思う
                        </span>
                      </div>
                    </div>

                    {/* フィードバックテキスト */}
                    <div className='mb-4'>
                      <textarea
                        value={npsFeedback}
                        onChange={(e) => setNpsFeedback(e.target.value)}
                        placeholder='AIプランについてのご意見やご感想をお聞かせください（任意）'
                        className='w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-25'
                        rows={3}
                      />
                    </div>

                    {/* 送信ボタン */}
                    <button
                      onClick={handleNpsSubmit}
                      disabled={npsScore === null}
                      className={`
                      w-full py-2 px-4 rounded-lg text-sm font-medium
                      ${
                        npsScore !== null
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                      transition-colors duration-200
                    `}
                    >
                      評価を送信する
                    </button>
                  </div>
                )}

              {/* 送信済みメッセージ */}
              {(hasSubmittedNps || eventInteractionHistory?.npsData) && (
                <div className='p-6 border-t border-purple-100'>
                  <p className='text-sm text-gray-600 text-center'>
                    評価のご協力ありがとうございました 🙏
                  </p>
                </div>
              )}
            </div>

            {/* 類似イベント */}
            {similarEvents.length > 0 && (
              <div className='mt-12'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4 mt-24'>
                  他のおすすめイベント
                </h2>
                <div className='space-y-4'>
                  {similarEvents.map((similarEvent) => (
                    <div
                      key={similarEvent.id}
                      onClick={() => router.push(`/event/${similarEvent.id}`)}
                      className='p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200'
                    >
                      <div className='flex items-start'>
                        <div className='text-2xl mr-3'>
                          {similarEvent.eventEmoji}
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-900'>
                            {similarEvent.eventTitleJa}
                          </h3>
                          <p className='text-sm text-gray-600 mt-1'>
                            {similarEvent.eventDate
                              .toDate()
                              .toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long',
                              })}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            {similarEvent.eventLocationNameJa}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
