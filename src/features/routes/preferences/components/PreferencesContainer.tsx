'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Event } from '@/types/firestoreDocument';
import { Timestamp } from 'firebase/firestore';
import CardStack from './CardStack';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { PreferenceCalculation } from './PreferenceCalculation';

export function PreferencesContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {
    data: events,
    error,
    isLoading,
  } = useFirestoreCollection<Event>('events');

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
          あなたにぴったりなイベントを設定中...
        </p>
        <Button className='bg-yellow-400 hover:bg-yellow-500 text-white'>
          イベントを見る
        </Button>
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
      />
    </div>
  );
}
