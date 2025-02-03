'use client';

import React, { useState, useEffect } from 'react';
import SearchLoading from './searchLoading';
import EventDetail from '@/features/routes/eventDetail/components/event-detail';
import CardStack from './CardStack';
import VerticalCard from './VerticalCard';
import { Event } from '@/types/firestoreDocument';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/utils/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { useAuth } from '@/features/common/auth/AuthContext';

export default function SearchContainer() {
  const { user } = useAuth();
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
      if (!user) return;

      setIsLoading(true);
      try {
        // Cloud Functionsのインスタンスを取得
        const functions = getFunctions();
        functions.region = 'asia-northeast1';
        const findSimilarEvents = httpsCallable(functions, 'findSimilarEvents');

        // 類似イベントのIDを取得
        const result = await findSimilarEvents({ userId: user.uid });
        const data = result.data as { success: boolean; eventIds: string[] };

        if (data.success && data.eventIds.length > 0) {
          // Firestoreからイベント詳細を取得
          const eventsRef = collection(db, 'events');
          const eventsQuery = query(
            eventsRef,
            where(documentId(), 'in', data.eventIds)
          );
          const eventsSnapshot = await getDocs(eventsQuery);

          const eventsData = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Event[];

          // イベントIDの順序を維持するためにソート
          const sortedEvents = data.eventIds
            .map((id) => eventsData.find((event) => event.id === id))
            .filter((event): event is Event => event !== undefined);

          setSearchResults(sortedEvents);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('イベント検索中にエラーが発生しました:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSearchResult();
  }, [user]);

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
