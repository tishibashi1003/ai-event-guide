'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Event, EventInteractionHistory } from '@/types/firestoreDocument';
import CardStack from './CardStack';
import {
  useFirestoreCollection,
  useFirestoreUpdate,
} from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { PreferenceCalculation } from './PreferenceCalculation';
import { generateUserProfileVector } from '../utils/vector';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, Timestamp, vector } from 'firebase/firestore';
import { getFirebase } from '@/utils/firebase/config';

export function PreferencesContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string>('岐阜県');
  const [hasSelectedRegion, setHasSelectedRegion] = useState(false);
  const [interactionHistory, setInteractionHistory] = useState<
    EventInteractionHistory[]
  >([]);
  const { user } = useAuth();
  const router = useRouter();

  // Firestore インスタンスの取得
  const { db } = getFirebase();

  const handleRegionSelect = () => {
    if (!selectedRegion) return;
    setHasSelectedRegion(true);
  };

  const {
    data: events,
    error,
    isLoading,
  } = useFirestoreCollection<Event>('events', {
    limit: 10,
    orderBy: [['eventDate', 'asc']],
  });

  const { set: setUserData } = useFirestoreUpdate(
    user ? `users/${user.uid}` : ''
  );

  const getInteractionPath = useCallback(
    (eventId: string) =>
      user ? `users/${user.uid}/eventInteractionHistories/${eventId}` : '',
    [user]
  );

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!events || currentIndex >= events.length || !user) return;

    const event = events[currentIndex];
    const action = direction === 'right' ? 'like' : 'dislike';

    const newHistory: EventInteractionHistory = {
      userId: user.uid,
      eventId: event.id,
      eventVector: event.eventVector,
      action,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    setInteractionHistory((prev) => [...prev, newHistory]);
  };

  const onCalculateAndSave = useCallback(async () => {
    if (!user) return;

    try {
      for (const history of interactionHistory) {
        const collectionRef = doc(db, getInteractionPath(history.eventId));
        await setDoc(collectionRef, {
          ...history,
          eventVector: history.eventVector,
          createdAt: Timestamp.now(),
        });
      }

      // ユーザーの好みを計算
      const userVector = generateUserProfileVector(interactionHistory);

      // ユーザーのベクトルを更新
      await setUserData({
        preferenceVector: vector(userVector),
        updatedAt: Timestamp.now(),
      });

      // ５秒待機して分析中の演出を表示
      await new Promise((resolve) => setTimeout(resolve, 5000));

      router.push('/search');
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [user, db, interactionHistory, setUserData, router, getInteractionPath]);

  useEffect(() => {
    if (events && currentIndex >= (events?.length ?? 0)) {
      onCalculateAndSave();
    }
  }, [currentIndex, events, onCalculateAndSave]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <p>エラーが発生しました。</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!hasSelectedRegion) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 pt-0 pb-24'>
        <div className='w-full max-w-sm space-y-8'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900'>
              お住まいの地域を
              <br />
              教えてください
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              あなたの地域に合わせたイベントをご紹介します
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled
                className='w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-50 cursor-not-allowed'
              >
                <option value='岐阜県'>岐阜県</option>
                <option value='愛知県'>愛知県</option>
                <option value='三重県'>三重県</option>
              </select>
              <p className='text-xs text-gray-500 text-center'>
                ※ 現在はデモ版のため岐阜県以外の設定ができません
              </p>
            </div>

            <button
              onClick={handleRegionSelect}
              className='w-full py-3 px-4 rounded-full text-base font-medium transition-all duration-300 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white hover:opacity-90'
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <p>イベントが見つかりませんでした。</p>
      </div>
    );
  }

  const progress = (currentIndex / events.length) * 100;

  if (currentIndex >= events.length) {
    return (
      <div className='flex flex-col items-center justify-center h-full mt-8'>
        <PreferenceCalculation />
        <p className='text-center text-gray-600 my-8'>
          あなたの好みを分析中...
        </p>
      </div>
    );
  }

  return (
    <div className='relative h-[600px] w-full max-w-sm mx-auto'>
      <div className='absolute top-0 left-0 right-0 h-2 bg-gray-200 z-10'>
        <motion.div
          className='h-full bg-yellow-400'
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className='pt-4 pb-2 text-center'>
        <h2 className='text-xl font-bold mt-8'>
          あなたの興味のあるイベントを
          <br />
          教えてください！
        </h2>
        <p className='text-sm text-gray-600 mt-2'>
          {currentIndex + 1} / {events.length}
        </p>
      </div>

      <CardStack
        events={events}
        onIndexChange={setCurrentIndex}
        currentIndex={currentIndex}
        onSwipe={handleSwipe}
      />
    </div>
  );
}
