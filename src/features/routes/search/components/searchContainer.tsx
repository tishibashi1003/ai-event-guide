'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, type PanInfo } from 'framer-motion';
import { Star, X, Check } from 'lucide-react';
import { type OutputEvent } from '@/features/routes/search/type';
import { searchGrounding } from '../serverActions/genkit';
import SearchLoading from './searchLoading';
import { type Event } from '@/features/common/event/type';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';
import EventCard from './EventCard';

const convertOutputEventToEvent = (outputEvent: OutputEvent): Event => {
  return {
    id: outputEvent.sourceUrl, // URLをIDとして使用
    title: outputEvent.eventTitle,
    image: '/placeholder.svg', // デフォルトの画像を使用
    date: `${outputEvent.eventStartDate} - ${outputEvent.eventEndDate}`,
    location: outputEvent.locationName,
    price: `大人: ${outputEvent.priceInfo.adult}円, 子供: ${outputEvent.priceInfo.child}円`,
    ageRange: outputEvent.ageRestriction,
    categories: [], // カテゴリーは後で追加
    description: outputEvent.eventDescription,
  };
};

export default function SearchContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<
    'right' | 'left' | 'up' | 'down' | null
  >(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekend' | 'custom'>('weekend');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const events = activeTab === 'weekend' ? searchResults : searchResults;

  const currentEvent = events.length > 0 ? events[currentIndex] : null;

  useEffect(() => {
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    async function fetchSearchResult() {
      setIsLoading(true);
      try {
        const result = await searchGrounding();
        if (result.success && result.data) {
          const convertedEvents = result.data.map(convertOutputEventToEvent);
          setSearchResults(convertedEvents);
        }
      } catch (error) {
        console.error('イベント検索中にエラーが発生しました:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSearchResult();
  }, []);

  const handleSwipe = useCallback(
    (swipeDirection: 'right' | 'left' | 'up' | 'down') => {
      if (!currentEvent) return;

      setDirection(swipeDirection);
      setTimeout(() => {
        if (swipeDirection === 'down') {
          console.log('Added to KokoIku list:', currentEvent.title);
        }
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
        setDirection(null);
      }, 300);
    },
    [currentEvent, events.length]
  );

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!currentEvent) return;

    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      handleSwipe('left');
    } else if (swipe > swipeConfidenceThreshold) {
      handleSwipe('right');
    }
  };

  const handleCardClick = useCallback(() => {
    if (currentEvent) {
      setShowDetail(true);
    }
  }, [currentEvent]);

  if (showDetail && currentEvent) {
    return (
      <EventDetail event={currentEvent} onBack={() => setShowDetail(false)} />
    );
  }

  return (
    <div className='flex flex-col h-[80vh]'>
      <header className='flex flex-col items-center justify-between p-4'>
        <div className='flex w-full max-w-xs bg-[#F0F0F0] rounded-full p-1'>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'weekend'
                ? 'bg-[#FFD700] text-black rounded-full shadow-md'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('weekend')}
          >
            今週
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'custom'
                ? 'bg-[#FFD700] text-black rounded-full shadow-md'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            もうすぐ
          </button>
        </div>
      </header>

      <main className='flex-grow flex justify-center items-center px-2 py-0.5 overflow-hidden'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center space-y-4'>
            <SearchLoading />
          </div>
        ) : currentEvent ? (
          <AnimatePresence initial={false}>
            <EventCard
              event={currentEvent}
              direction={direction}
              onDragEnd={handleDragEnd}
              onClick={handleCardClick}
            />
          </AnimatePresence>
        ) : (
          <div className='text-center text-[#808080]'>
            <p className='text-lg font-semibold mb-1'>イベントがありません</p>
            <p className='text-sm'>
              現在、この分類のイベントは登録されていません。
            </p>
          </div>
        )}
      </main>

      {!isLoading && (
        <footer className='flex justify-around items-center p-2 pt-6 max-w-md mx-auto w-full bg-white'>
          <button
            className='w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#FF3B30] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#FFEEEE] focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:ring-opacity-50'
            onClick={() => handleSwipe('left')}
            disabled={!currentEvent || isLoading}
          >
            <X className='w-6 h-6' />
          </button>
          <button
            className='w-auto h-16 px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50'
            onClick={() => handleSwipe('down')}
            disabled={!currentEvent || isLoading}
          >
            <Star className='w-6 h-6 mr-2 fill-current' />
            ココいく！
          </button>
          <button
            className='w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#34C759] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#EEFFF5] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-opacity-50'
            onClick={() => handleSwipe('right')}
            disabled={!currentEvent || isLoading}
          >
            <Check className='w-6 h-6' />
          </button>
        </footer>
      )}
    </div>
  );
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
