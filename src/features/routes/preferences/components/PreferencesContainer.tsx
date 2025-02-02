'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import CardStack from '@/features/common/swipe/components/CardStack';
import { Event } from '@/types/firestoreDocument';
import { Timestamp } from 'firebase/firestore';

const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    eventVector: [1, 2, 3],
    eventTitleJa: '夏祭り花火大会',
    eventDescriptionJa: '夏祭り花火大会の説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: '夏祭り花火大会の場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '3',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '4',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '5',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '6',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '7',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '8',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '9',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '10',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '11',
    eventVector: [1, 2, 3],
    eventTitleJa: 'ロックフェスティバル',
    eventDescriptionJa: 'ロックフェスティバルの説明',
    eventDateYYYYMMDD: '2025-01-01',
    eventLocationNameJa: 'ロックフェスティバルの場所',
    eventLocationCity: '東京都',
    eventSourceUrl: 'https://example.com',
    eventEmoji: '🎉',
    eventCategoryEn: 'event',
    eventDate: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export function PreferencesContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preferences, setPreferences] = useState<Record<number, boolean>>({});

  const handleSwipe = (direction: 'left' | 'right') => {
    setPreferences((prev) => ({
      ...prev,
      [currentIndex]: direction === 'right',
    }));
    setCurrentIndex((prev) => prev + 1);
  };

  const progress = (currentIndex / SAMPLE_EVENTS.length) * 100;

  if (currentIndex >= SAMPLE_EVENTS.length) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <h2 className='text-2xl font-bold mb-4'>ありがとうございます！</h2>
        <p className='text-center mb-8'>
          あなたの好みを元に、おすすめのイベントを表示します。
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
          {currentIndex + 1} / {SAMPLE_EVENTS.length}
        </p>
      </div>

      <CardStack
        events={SAMPLE_EVENTS}
        onIndexChange={setCurrentIndex}
        currentIndex={currentIndex}
      />
    </div>
  );
}
