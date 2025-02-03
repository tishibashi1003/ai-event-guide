'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Building2, History } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { Event, EventInteractionHistory } from '@/types/firestoreDocument';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/ui/loading';
import { formatDate } from '@/utils/day';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/utils';

export default function KokoikuContainer() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showPastEvents, setShowPastEvents] = useState(false);

  const { data: interactions, isLoading: interactionsLoading } =
    useFirestoreCollection<EventInteractionHistory>(
      user ? `users/${user.uid}/eventInteractionHistories` : null,
      user
        ? {
            conditions: [['action', '==', 'kokoiku']],
          }
        : undefined
    );

  const eventIds =
    interactions?.map((interaction) => interaction.eventId) || [];

  const { data: events, isLoading: eventsLoading } =
    useFirestoreCollection<Event>(
      eventIds.length > 0 ? 'events' : null,
      eventIds.length > 0
        ? {
            conditions: [['id', 'in', eventIds]],
          }
        : undefined
    );

  const isLoading = authLoading || interactionsLoading || eventsLoading;

  const now = new Date();
  const upcomingEvents = events?.filter(
    (event) => event.eventDate.toDate() >= now
  );
  const pastEvents = events?.filter((event) => event.eventDate.toDate() < now);

  if (!user && !authLoading) {
    return (
      <div className='flex flex-col min-h-screen bg-white'>
        <header className='flex items-center justify-between p-4 border-b border-gray-100'>
          <h1 className='text-2xl font-bold text-[#FFD700]'>ココいくリスト</h1>
        </header>
        <main className='flex-1 p-4'>
          <div className='flex flex-col items-center justify-center h-full text-gray-500'>
            <p>ログインしてください</p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen bg-white'>
        <header className='flex items-center justify-between p-4 border-b border-gray-100'>
          <h1 className='text-2xl font-bold text-[#FFD700]'>ココいくリスト</h1>
        </header>
        <main className='flex-1 p-4'>
          <div className='flex items-center justify-center h-full'>
            <Loading />
          </div>
        </main>
      </div>
    );
  }

  const renderEvents = (eventList: Event[] | undefined) => {
    if (!eventList || eventList.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center h-full text-gray-500'>
          <p>
            {showPastEvents
              ? '過去のイベントはありません'
              : 'まだココいくリストに登録されたイベントがありません'}
          </p>
        </div>
      );
    }

    return (
      <div className='grid gap-4'>
        {eventList.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg cursor-pointer'
            onClick={() => router.push(`/event/${event.id}`)}
          >
            <div className='p-3 flex-1'>
              <h2 className='font-bold text-lg mb-1 text-[#4A4A4A]'>
                {event.eventEmoji} {event.eventTitleJa}
              </h2>
              <div className='flex gap-2'>
                <div className='flex items-center text-[#808080] text-sm '>
                  <Calendar size={14} className='mr-1' />
                  <span>{formatDate(event.eventDate.toDate())}</span>
                </div>
                <div className='flex items-center text-[#808080] text-sm'>
                  <MapPin size={14} className='mr-1' />
                  <span>{event.eventLocationCityJa}</span>
                </div>
              </div>
              <div className='flex items-center text-[#808080] text-sm'>
                <Building2 size={14} className='mr-1' />
                <span>{event.eventLocationNameJa}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <header className='flex items-center justify-between p-4 border-b border-gray-100'>
        <h1 className='text-2xl font-bold text-gray-700'>ココいくリスト</h1>
        <button
          onClick={() => setShowPastEvents(!showPastEvents)}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors',
            showPastEvents
              ? 'bg-gray-100 text-gray-700'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <History size={14} />
          <span>過去のイベント</span>
        </button>
      </header>

      <main className='flex-1 p-4'>
        {renderEvents(showPastEvents ? pastEvents : upcomingEvents)}
      </main>
    </div>
  );
}
