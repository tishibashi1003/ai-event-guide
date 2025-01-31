'use client';

import React, { useState, useEffect } from 'react';
import { type OutputEvent } from '@/features/routes/search/type';
import { searchGrounding } from '../serverActions/genkit';
import SearchLoading from './searchLoading';
import { type Event } from '@/features/common/event/type';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';
import CardStack from './CardStack';
const convertOutputEventToEvent = (outputEvent: OutputEvent): Event => {
  return {
    id: outputEvent.sourceUrl, // URLをIDとして使用
    title: outputEvent.eventTitle,
    emoji: outputEvent.eventEmoji,
    date: `${outputEvent.eventStartDate} - ${outputEvent.eventEndDate}`,
    location: outputEvent.locationName,
    price: `大人: ${outputEvent.priceInfo.adult}円, 子供: ${outputEvent.priceInfo.child}円`,
    ageRange: outputEvent.ageRestriction,
    category: outputEvent.eventCategory,
    description: outputEvent.eventDescription,
  };
};

export default function SearchContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
          console.log(
            '🚀  fetchSearchResult  convertedEvents:',
            convertedEvents
          );
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

  if (showDetail && currentEvent) {
    return (
      <EventDetail event={currentEvent} onBack={() => setShowDetail(false)} />
    );
  }

  return (
    <div className='flex flex-col h-[80vh] max-w-sm mx-auto'>
      <header className='flex flex-col items-center justify-between p-4'>
        <div className='flex w-full max-w-xs bg-[#F0F0F0] rounded-full p-1'>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'weekend'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('weekend')}
          >
            今週
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'custom'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            もうすぐ
          </button>
        </div>
      </header>

      <main className='flex-grow flex justify-center items-center px-2 py-0.5 overflow-hidden w-full'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center space-y-4'>
            <SearchLoading />
          </div>
        ) : currentEvent ? (
          <CardStack events={events} />
        ) : (
          <div className='text-center text-[#808080]'>
            <p className='text-lg font-semibold mb-1'>イベントがありません</p>
            <p className='text-sm'>
              現在、この分類のイベントは登録されていません。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
