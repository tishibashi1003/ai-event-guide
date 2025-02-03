'use client';

import { useEffect, useState } from 'react';
import { Event, EventInteractionHistory } from '@/types/firestoreDocument';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { Star } from 'lucide-react';
import { useAuth } from '@/features/common/auth/AuthContext';
import {
  Timestamp,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/utils/firebase/config';
import { toast } from '@/hooks/toast/useToast';
import { generateUserProfileVector } from '@/features/routes/preferences/utils/vector';

interface Props {
  eventId: string;
}

export default function EventDetailContainer({ eventId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: event, isLoading } = useFirestoreDoc<Event>(
    `events/${eventId}`
  );

  useEffect(() => {
    if (!isLoading && !event) {
      console.error('イベントが見つかりません');
      router.push('/search');
    }
  }, [event, isLoading, router]);

  const handleGoingClick = async () => {
    if (!user || !event || isProcessing) return;

    try {
      setIsProcessing(true);
      await addDoc(
        collection(db, `users/${user.uid}/eventInteractionHistories`),
        {
          userId: user.uid,
          eventId: event.id,
          eventVector: event.eventVector,
          interactionType: 'kokoiku',
          createdAt: Timestamp.now(),
        }
      );

      // 直近15件の履歴を取得
      const historiesRef = collection(
        db,
        `users/${user.uid}/eventInteractionHistories`
      );
      const historiesQuery = query(
        historiesRef,
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const historiesSnapshot = await getDocs(historiesQuery);

      // ユーザーベクトルを生成
      const userVector = generateUserProfileVector(
        historiesSnapshot.docs.map((doc) =>
          doc.data()
        ) as EventInteractionHistory[]
      );

      // ユーザードキュメントを更新
      const userRef = doc(db, `users/${user.uid}`);
      await setDoc(
        userRef,
        {
          userVector: userVector,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

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

  if (isLoading) {
    return <Loading />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-200'>
        <div className='flex items-center h-16 px-4'>
          <button
            onClick={() => router.push('/search')}
            className='flex items-center text-gray-600 hover:text-gray-900'
          >
            <ArrowLeftIcon className='w-6 h-6 mr-2' />
            <span>戻る</span>
          </button>
        </div>
      </header>

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

            <div className='flex justify-center mt-4'>
              <button
                onClick={handleGoingClick}
                disabled={isProcessing || !user}
                className='w-auto h-16 px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                <Star className='w-6 h-6 mr-2 fill-current' />
                {isProcessing ? '処理中...' : 'ココいく！'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
