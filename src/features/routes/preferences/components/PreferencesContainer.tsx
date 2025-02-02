'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Event, EventInteractionHistory } from '@/types/firestoreDocument';
import CardStack from './CardStack';
import {
  useFirestoreCollection,
  useFirestoreUpdate,
  useFirestoreCollectionUpdate,
} from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { PreferenceCalculation } from './PreferenceCalculation';
import { generateUserProfileVector } from '../utils/vector';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Timestamp, vector } from 'firebase/firestore';

export function PreferencesContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interactionHistory, setInteractionHistory] = useState<
    EventInteractionHistory[]
  >([]);
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: events,
    error,
    isLoading,
  } = useFirestoreCollection<Event>('events');

  const { set: setUserData } = useFirestoreUpdate(
    user ? `users/${user.uid}` : ''
  );

  const { add: addInteraction } = useFirestoreCollectionUpdate(
    user ? `users/${user.uid}/eventInteractionHistories` : ''
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
      timestamp: Timestamp.now(),
    };
    setInteractionHistory((prev) => [...prev, newHistory]);
  };

  const onCalculateAndSave = useCallback(async () => {
    if (!user) return;

    try {
      for (const history of interactionHistory) {
        await addInteraction({
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

      // router.push('/search');
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [interactionHistory, user, router, setUserData, addInteraction]);

  useEffect(() => {
    console.log('🚀  useEffect  events?.length:', currentIndex, events?.length);
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
