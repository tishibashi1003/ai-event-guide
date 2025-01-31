'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Calendar, Users, Tag, Star, X, Check } from 'lucide-react';
import { type OutputEvent } from '@/features/routes/search/type';
import { searchGrounding } from '../serverActions/genkit';
import Image from 'next/image';
import SearchLoading from './searchLoading';
import { type Event } from '@/features/common/event/type';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';

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
            もうすぐ
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'custom'
                ? 'bg-[#FFD700] text-black rounded-full shadow-md'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            いつでも
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
            <motion.div
              key={currentEvent.id}
              className='w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing'
              initial={{
                scale: 0.8,
                opacity: 0,
                y: direction === 'down' ? -300 : 0,
                x:
                  direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
              }}
              animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
              exit={{
                x:
                  direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                y: direction === 'down' ? 300 : 0,
                opacity: 0,
                scale: 0.8,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag='x'
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              onClick={handleCardClick}
            >
              <div className='relative'>
                <Image
                  src={currentEvent.image || '/placeholder.svg'}
                  alt={currentEvent.title}
                  className='w-full h-48 object-cover'
                  width={100}
                  height={48}
                />
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3'>
                  <h2 className='text-lg font-bold text-white mb-1'>
                    {currentEvent.title}
                  </h2>
                  <div className='flex items-center text-white opacity-90'>
                    <Calendar size={14} className='mr-1' />
                    <span className='text-xs'>{currentEvent.date}</span>
                  </div>
                </div>
              </div>
              <div className='p-3 bg-[#F8F8F8]'>
                <div className='flex items-center mb-2'>
                  <Tag size={16} className='mr-2 text-[#D18700]' />
                  <span className='text-sm font-semibold text-[#D18700]'>
                    {currentEvent.price}
                  </span>
                </div>
                <div className='flex items-center mb-3'>
                  <Users size={16} className='mr-2 text-[#B39700]' />
                  <span className='text-sm text-[#B39700]'>
                    {currentEvent.ageRange}
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {currentEvent.categories.map((category, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-[#FFD700] bg-opacity-30 text-[#8A7500] text-xs font-medium rounded-full'
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className='text-sm text-[#595959] line-clamp-3'>
                  {currentEvent.description}
                </div>
              </div>
            </motion.div>
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
