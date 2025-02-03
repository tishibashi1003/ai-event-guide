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
} from 'firebase/firestore';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useFindSimilarEvents } from '@/hooks/useFirebaseFunction';

export default function SearchContainer() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekend' | 'custom'>('weekend');
  const [searchResults, setSearchResults] = useState<Event[]>([]);

  const events = activeTab === 'weekend' ? searchResults : searchResults;
  const currentEvent = events.length > 0 ? events[currentIndex] : null;

  // 日付範囲の設定（今日から7日後まで）
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // ISO文字列に変換（YYYY-MM-DD形式）
  const startDate = today.toISOString().split('T')[0];
  const endDate = nextWeek.toISOString().split('T')[0];

  // Cloud Functionsの呼び出し
  const {
    data: similarEventsData,
    error,
    isLoading,
  } = useFindSimilarEvents(
    user
      ? {
          userId: user.uid,
          startDate,
          endDate,
        }
      : null
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, []);

  // イベントデータの取得
  useEffect(() => {
    async function fetchEventDetails() {
      if (!similarEventsData?.success || !similarEventsData.eventIds.length) {
        setSearchResults([]);
        return;
      }

      try {
        // Firestoreからイベント詳細を取得
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

        // イベントIDの順序を維持するためにソート
        const sortedEvents = similarEventsData.eventIds
          .map((id) => eventsData.find((event) => event.id === id))
          .filter((event): event is Event => event !== undefined);

        setSearchResults(sortedEvents);
      } catch (error) {
        console.error('イベント詳細の取得中にエラーが発生しました:', error);
        setSearchResults([]);
      }
    }

    fetchEventDetails();
  }, [similarEventsData]);

  if (error) {
    console.error('イベント検索中にエラーが発生しました:', error);
  }

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
            おすすめ
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
