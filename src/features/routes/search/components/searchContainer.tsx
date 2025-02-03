'use client';

import React, { useState, useEffect } from 'react';
import SearchLoading from './searchLoading';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';
import CardStack from './CardStack';
import VerticalCard from './VerticalCard';
import { Event } from '@/types/firestoreDocument';
import { db } from '@/utils/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useFindSimilarEvents } from '@/hooks/useFirebaseFunction';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { docsFetcher, sortDocsByIds } from '@/hooks/useFirestore';

export default function SearchContainer() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekend' | 'custom'>('weekend');
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
    startTimestamp: Timestamp;
    endTimestamp: Timestamp;
  }>({
    startDate: '',
    endDate: '',
    startTimestamp: Timestamp.now(),
    endTimestamp: Timestamp.now(),
  });

  useEffect(() => {
    // 日付範囲の設定（今日から7日後まで）
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    setDateRange({
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      startTimestamp: Timestamp.fromDate(today),
      endTimestamp: Timestamp.fromDate(nextWeek),
    });
  }, []);

  // 今週のイベントデータの取得（useFirestoreを使用）
  const { data: weeklyEvents = [], isLoading: isLoadingWeekly } =
    useFirestoreCollection<Event>('events', {
      conditions: dateRange.startDate
        ? [
            ['eventDate', '>=', dateRange.startTimestamp],
            ['eventDate', '<=', dateRange.endTimestamp],
          ]
        : [],
      orderBy: [['eventDate', 'asc']],
    });

  const events =
    activeTab === 'weekend'
      ? [
          ...recommendedEvents,
          ...weeklyEvents.filter(
            (weeklyEvent) =>
              !recommendedEvents.some(
                (recEvent) => recEvent.id === weeklyEvent.id
              )
          ),
        ]
      : [...recommendedEvents, ...weeklyEvents];
  const currentEvent = events.length > 0 ? events[currentIndex] : null;

  // Cloud Functionsの呼び出し（おすすめイベント）
  const {
    data: similarEventsData,
    error,
    isLoading: isLoadingRecommended,
  } = useFindSimilarEvents(
    user && dateRange.startDate
      ? {
          userId: user.uid,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 5,
        }
      : null
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, []);

  // おすすめイベントデータの取得
  useEffect(() => {
    async function fetchRecommendedEvents() {
      if (!similarEventsData?.success || !similarEventsData.eventIds.length) {
        setRecommendedEvents([]);
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
        setRecommendedEvents(sortedEvents);
      } catch (error) {
        console.error('おすすめイベントの取得中にエラーが発生しました:', error);
        setRecommendedEvents([]);
      }
    }

    fetchRecommendedEvents();
  }, [similarEventsData]);

  if (error) {
    console.error('イベント検索中にエラーが発生しました:', error);
  }

  if (showDetail && currentEvent) {
    return (
      <EventDetail event={currentEvent} onBack={() => setShowDetail(false)} />
    );
  }

  const isLoading = isLoadingRecommended || isLoadingWeekly;

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
            今週のおすすめ
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'custom'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            ぜんぶ
          </button>
        </div>
        {activeTab === 'weekend' && (
          <p className='mt-3 text-xs text-gray-300 text-center'>
            <span className='text-yellow-300 font-medium'>Pick Up </span>=
            あなたの興味に合わせたおすすめ
          </p>
        )}
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
                  isRecommended={recommendedEvents.some(
                    (recEvent) => recEvent.id === event.id
                  )}
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
