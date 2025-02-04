'use client';

import { useEffect, useState } from 'react';
import {
  Event,
  EventInteractionHistory,
  User,
} from '@/types/firestoreDocument';
import { useRouter } from 'next/navigation';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { Star, Sparkles } from 'lucide-react';
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
  where,
  vector,
} from 'firebase/firestore';
import { db } from '@/utils/firebase/config';
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
  const { data: event, isLoading } = useFirestoreDoc<Event>(
    `events/${eventId}`
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

  const updateUserVector = async (
    action: EventInteractionHistory['action']
  ) => {
    if (!user || !event) return;

    // 既存のインタラクションを確認
    const historiesRef = collection(
      db,
      `users/${user.uid}/eventInteractionHistories`
    );
    const existingQuery = query(
      historiesRef,
      where('eventId', '==', event.id),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const existingSnapshot = await getDocs(existingQuery);
    const existingInteraction = existingSnapshot.docs[0]?.data()?.action as
      | EventInteractionHistory['action']
      | undefined;

    if (action === 'view') {
      if (existingInteraction === 'kokoiku' || existingInteraction === 'like') {
        return; // 既に kokoiku の場合は何もしない
      }
    }

    const newDoc: EventInteractionHistory = {
      userId: user.uid,
      eventId: event.id,
      eventVector: event.eventVector,
      action,
      createdAt: Timestamp.now(),
    };

    await setDoc(
      doc(db, `users/${user.uid}/eventInteractionHistories`, event.id),
      newDoc
    );

    const historiesQuery = query(
      historiesRef,
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
  };

  useEffect(() => {
    if (!isLoading && !event) {
      console.error('イベントが見つかりません');
      router.push('/search');
      return;
    }

    const recordView = async () => {
      try {
        await updateUserVector('view');
      } catch (error) {
        console.error('閲覧履歴の記録中にエラーが発生しました:', error);
      }
    };

    recordView();
  }, [user, event, isLoading, router]);

  const handleGoingClick = async () => {
    if (!user || !event || isProcessing) return;

    try {
      setIsProcessing(true);
      await updateUserVector('kokoiku');
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
    if (!event) return;

    try {
      setIsPlanningLoading(true);
      const result = await executeWorkflow({
        eventLocation: event.eventLocationCityJa,
        eventPlace: event.eventLocationNameJa,
        eventCity: event.eventLocationCityJa,
        eventTitle: event.eventTitleJa,
      });
      if (result) {
        setPlanningResult(result);
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

  if (isLoading) {
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
                disabled={isProcessing || !user}
                className='w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                <Star className='w-6 h-6 mr-2 fill-current' />
                {isProcessing ? '処理中...' : 'ココいく！'}
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
                  周辺施設や移動時間を考慮した、おすすめプランを AI が提案します
                </p>
              </div>

              <div className='p-6 bg-white'>
                {!planningResult ? (
                  <div className='flex flex-col items-center justify-center text-center'>
                    <button
                      onClick={handlePlanningGeneration}
                      disabled={isPlanningLoading || !user}
                      className='w-full sm:w-auto h-10 px-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-25 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Sparkles className='w-4 h-4 mr-2 text-purple-500' />
                      {isPlanningLoading
                        ? 'プラン作成中...'
                        : 'プランを作成する'}
                    </button>
                    <p className='mt-3 text-xs text-gray-500'>
                      ※ プランの生成には20秒ほどかかります
                    </p>
                  </div>
                ) : (
                  <div className='prose prose-sm max-w-none text-gray-600 [&>h3]:text-base [&>h3]:font-medium [&>h3]:text-gray-900 [&>h3:not(:first-child)]:mt-6'>
                    <ReactMarkdown>{planningResult}</ReactMarkdown>
                  </div>
                )}
              </div>
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
