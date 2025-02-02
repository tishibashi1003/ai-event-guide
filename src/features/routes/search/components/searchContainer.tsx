'use client';

import React, { useState, useEffect } from 'react';
import SearchLoading from './searchLoading';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';
import CardStack from './CardStack';
import VerticalCard from './VerticalCard';
import { Event } from '@/types/firestoreDocument';
import { Timestamp } from 'firebase/firestore';

export default function SearchContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekend' | 'custom'>('weekend');
  const [searchResults, setSearchResults] = useState<Event[]>([
    {
      id: '1',
      eventVector: [1, 2, 3],
      eventTitleJa: 'イベントタイトル',
      eventDescriptionJa: 'イベント詳細',
      eventDateYYYYMMDD: '2025-01-01',
      eventLocationNameJa: 'イベント場所',
      eventLocationCity: 'イベント場所',
      eventSourceUrl: 'https://example.com',
      eventEmoji: '🎉',
      eventCategoryEn: 'event',
      eventDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      id: '2',
      eventVector: [4, 5, 6],
      eventTitleJa: 'イベントタイトル2',
      eventDescriptionJa: 'イベント詳細2',
      eventDateYYYYMMDD: '2025-01-02',
      eventLocationNameJa: 'イベント場所2',
      eventLocationCity: 'イベント場所2',
      eventSourceUrl: 'https://example.com',
      eventEmoji: '🎉',
      eventCategoryEn: 'event',
      eventDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ]);
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
      } catch (error) {
        console.error('イベント検索中にエラーが発生しました:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSearchResult();
  }, []);

  if (showDetail && currentEvent) {
    return (
      <EventDetail event={currentEvent} onBack={() => setShowDetail(false)} />
    );
  }

  return (
    <div className='flex flex-col h-screen max-w-sm mx-auto'>
      <header className='flex flex-col items-center justify-between flex-shrink-0 p-4'>
        <div className='flex w-full max-w-xs bg-[#F0F0F0] rounded-full p-1'>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'weekend'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('weekend')}
          >
            もうすぐ
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'custom'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            おすすめ
          </button>
        </div>
      </header>

      <main className='flex-1 overflow-hidden'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-full space-y-4'>
            <SearchLoading />
          </div>
        ) : currentEvent ? (
          activeTab === 'weekend' ? (
            <div className='h-full px-4 pb-4 overflow-y-auto'>
              {events.map((event) => (
                <VerticalCard
                  key={event.id}
                  event={event}
                  onClick={() => setShowDetail(true)}
                />
              ))}
            </div>
          ) : (
            <CardStack events={events} />
          )
        ) : (
          <div className='flex items-center justify-center h-full text-center text-[#808080]'>
            <div>
              <p className='mb-1 text-lg font-semibold'>イベントがありません</p>
              <p className='text-sm'>
                現在、この分類のイベントは登録されていません。
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
