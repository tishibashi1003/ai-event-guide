'use client';

import React, { useState, useEffect } from 'react';
import SearchLoading from './searchLoading';
import VerticalCard from './VerticalCard';
import { Event } from '@/types/firestoreDocument';
import { getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useFindSimilarEvents } from '@/hooks/useFirebaseFunction';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { docsFetcher, sortDocsByIds } from '@/hooks/useFirestore';
import { useRouter } from 'next/navigation';
import {
  doc,
  setDoc,
  vector,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/utils/firebase/config';
import { generateUserProfileVector } from '@/features/routes/preferences/utils/vector';
import { EventInteractionHistory, User } from '@/types/firestoreDocument';
import { Loader2 } from 'lucide-react';

export default function SearchContainer() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>(
    'recommended'
  );
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [allRecommendedEvents, setAllRecommendedEvents] = useState<Event[]>([]);
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingEventId, setProcessingEventId] = useState<string | null>(
    null
  );

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

  // 今後のイベントデータの取得
  const { data: futureEvents = [], isLoading: isLoadingFuture } =
    useFirestoreCollection<Event>('events', {
      conditions: dateRange.startDate
        ? [['eventDate', '>=', dateRange.endTimestamp]]
        : [],
      orderBy: [['eventDate', 'asc']],
    });

  const events =
    activeTab === 'recommended'
      ? [
          ...recommendedEvents,
          ...weeklyEvents.filter(
            (weeklyEvent) =>
              !recommendedEvents.some(
                (recEvent) => recEvent.id === weeklyEvent.id
              )
          ),
        ]
      : [
          ...allRecommendedEvents,
          ...futureEvents.filter(
            (futureEvent) =>
              !allRecommendedEvents.some(
                (recEvent) => recEvent.id === futureEvent.id
              )
          ),
        ];

  // Cloud Functionsの呼び出し（今週のおすすめイベント）
  const {
    data: similarEventsData,
    error: weeklyError,
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

  // Cloud Functionsの呼び出し（今後のおすすめイベント）
  const {
    data: allSimilarEventsData,
    error: allError,
    isLoading: isLoadingAllRecommended,
  } = useFindSimilarEvents(
    user && dateRange.endDate
      ? {
          userId: user.uid,
          startDate: (() => {
            const nextDay = new Date(dateRange.endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay.toISOString().split('T')[0];
          })(),
          limit: 5,
        }
      : null
  );

  // おすすめイベントデータの取得（今週）
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

  // おすすめイベントデータの取得（今後）
  useEffect(() => {
    async function fetchAllRecommendedEvents() {
      if (
        !allSimilarEventsData?.success ||
        !allSimilarEventsData.eventIds.length
      ) {
        setAllRecommendedEvents([]);
        return;
      }

      try {
        const eventsData = await docsFetcher<Event>(
          'events',
          allSimilarEventsData.eventIds
        );
        const sortedEvents = sortDocsByIds(
          eventsData,
          allSimilarEventsData.eventIds
        );
        setAllRecommendedEvents(sortedEvents);
      } catch (error) {
        console.error(
          '今後のおすすめイベントの取得中にエラーが発生しました:',
          error
        );
        setAllRecommendedEvents([]);
      }
    }

    fetchAllRecommendedEvents();
  }, [allSimilarEventsData]);

  if (weeklyError || allError) {
    console.error(
      'イベント検索中にエラーが発生しました:',
      weeklyError || allError
    );
  }

  const isLoading =
    isLoadingRecommended ||
    isLoadingAllRecommended ||
    isLoadingWeekly ||
    isLoadingFuture;

  const handleEventClick = async (event: Event) => {
    if (!user || !event || isProcessing || !db) return;

    try {
      setIsProcessing(true);
      setProcessingEventId(event.id);

      const eventHistoryRef = doc(
        db,
        `users/${user.uid}/eventInteractionHistories`,
        event.id
      );

      const eventHistoryDoc = await getDoc(eventHistoryRef);
      const eventHistory = eventHistoryDoc.data() as EventInteractionHistory;

      // イベントクリックの記録
      const newDoc: EventInteractionHistory = {
        userId: user.uid,
        eventId: event.id,
        eventVector: event.eventVector,
        action:
          eventHistory?.action === 'kokoiku' ? eventHistory?.action : 'view',
        createdAt: eventHistory?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
        clickContext: {
          source: activeTab,
          isRecommended:
            activeTab === 'recommended'
              ? recommendedEvents.some((recEvent) => recEvent.id === event.id)
              : allRecommendedEvents.some(
                  (recEvent) => recEvent.id === event.id
                ),
        },
      };

      await setDoc(eventHistoryRef, newDoc, { merge: true });

      // ユーザーの好みベクトルを更新
      const historiesRef = collection(
        db,
        `users/${user.uid}/eventInteractionHistories`
      );
      const historiesQuery = query(
        historiesRef,
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const historiesSnapshot = await getDocs(historiesQuery);
      const userVector = generateUserProfileVector(
        historiesSnapshot.docs.map((doc) =>
          doc.data()
        ) as EventInteractionHistory[]
      );

      const userRef = doc(db, `users/${user.uid}`);
      const newUserDoc: User = {
        // @ts-expect-error vector が zod で定義されていないため
        preferenceVector: vector(userVector),
        updatedAt: Timestamp.now(),
      };

      await setDoc(userRef, newUserDoc, { merge: true });

      // イベント詳細ページへ遷移
      router.push(`/event/${event.id}`);
    } catch (error) {
      console.error('イベントクリックの記録中にエラーが発生しました:', error);
    } finally {
      setIsProcessing(false);
      setProcessingEventId(null);
    }
  };

  return (
    <div className='flex flex-col h-screen max-w-sm mx-auto'>
      <header className='flex flex-col items-center justify-between flex-shrink-0 p-4'>
        <div className='flex w-full max-w-xs bg-[#F0F0F0] rounded-full p-1'>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'recommended'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('recommended')}
          >
            今週のおすすめ
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-[#FFD700] text-yellow-800 rounded-full'
                : 'text-[#808080] hover:bg-[#E0E0E0] rounded-full'
            }`}
            onClick={() => setActiveTab('all')}
          >
            今後のイベント
          </button>
        </div>
        {activeTab === 'recommended' && (
          <p className='mt-3 text-xs text-gray-300 text-center'>
            <span className='text-yellow-300 font-medium'>Pick Up </span>=
            あなたの興味に合わせたおすすめ
          </p>
        )}
        {activeTab === 'all' && (
          <p className='mt-3 text-xs text-gray-300 text-center'>
            今週のおすすめ以降に開催予定のイベント
          </p>
        )}
      </header>

      <main className='flex-1 overflow-hidden'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-full space-y-4'>
            <SearchLoading />
          </div>
        ) : events.length > 0 ? (
          <div className='h-full px-4 pb-4 overflow-y-auto'>
            {events.map((event) => (
              <div key={event.id} className='relative mb-4'>
                <VerticalCard
                  event={event}
                  onClick={() => handleEventClick(event)}
                  isRecommended={
                    activeTab === 'recommended'
                      ? recommendedEvents.some(
                          (recEvent) => recEvent.id === event.id
                        )
                      : allRecommendedEvents.some(
                          (recEvent) => recEvent.id === event.id
                        )
                  }
                />
                {isProcessing && processingEventId === event.id && (
                  <div className='absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-50 top-0 left-0'>
                    <Loader2 className='w-6 h-6 text-gray-400 animate-spin' />
                  </div>
                )}
              </div>
            ))}
          </div>
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
