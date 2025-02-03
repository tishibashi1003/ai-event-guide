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

export default function SearchContainer() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekend' | 'custom'>('weekend');
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);

  // 日付範囲の設定（今日から7日後まで）
  const today = new Date('2025-02-10'); // テスト用の固定日付
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // ISO文字列に変換（YYYY-MM-DD形式）
  // const startDate = today.toISOString().split('T')[0]; // 2025-02-10
  // const endDate = nextWeek.toISOString().split('T')[0]; // 2025-02-17
  const startDate = '2025-02-10';
  const endDate = '2025-02-28';

  // 今週のイベントデータの取得（useFirestoreを使用）
  const startTimestamp = Timestamp.fromDate(today);
  const endTimestamp = Timestamp.fromDate(nextWeek);
  const { data: weeklyEvents = [], isLoading: isLoadingWeekly } =
    useFirestoreCollection<Event>('events', {
      conditions: [
        ['eventDate', '>=', startTimestamp],
        ['eventDate', '<=', endTimestamp],
      ],
      orderBy: [['eventDate', 'asc']],
      limit: 20,
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
    user
      ? {
          userId: user.uid,
          startDate,
          endDate,
        }
      : null
  );

  console.log('🚀  SearchContainer  data:', weeklyEvents, similarEventsData);

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
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where(documentId(), 'in', similarEventsData.eventIds)
        );
        const eventsSnapshot = await getDocs(eventsQuery);

        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        const sortedEvents = similarEventsData.eventIds
          .map((id) => eventsData.find((event) => event.id === id))
          .filter((event): event is Event => event !== undefined);

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
