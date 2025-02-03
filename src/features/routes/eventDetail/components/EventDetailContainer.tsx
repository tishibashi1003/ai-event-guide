'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/types/firestoreDocument';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { Loading } from '@/components/ui/loading';
import { Star } from 'lucide-react';

interface Props {
  eventId: string;
}

export default function EventDetailContainer({ eventId }: Props) {
  const router = useRouter();
  const { data: event, isLoading } = useFirestoreDoc<Event>(
    `events/${eventId}`
  );

  useEffect(() => {
    if (!isLoading && !event) {
      console.error('イベントが見つかりません');
      router.push('/search');
    }
  }, [event, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-200'>
        <div className='flex items-center h-16 px-4'>
          <button
            onClick={() => router.push('/search')}
            className='flex items-center text-gray-600 hover:text-gray-900'
          >
            <ArrowLeftIcon className='w-6 h-6 mr-2' />
            <span>戻る</span>
          </button>
        </div>
      </header>

      <main className='flex-1 p-4'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>
            {event.eventEmoji} {event.eventTitleJa}
          </h1>

          <div className='space-y-6'>
            {/* 日時 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>開催日時</h2>
              <p className='mt-2 text-gray-600'>
                {event.eventDate.toDate().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>

            {/* 場所 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>開催場所</h2>
              <p className='mt-2 text-gray-600'>{event.eventLocationNameJa}</p>
              <p className='mt-1 text-sm text-gray-500'>
                {event.eventLocationCity}
              </p>
            </div>

            {/* 説明 */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                イベント詳細
              </h2>
              <p className='mt-2 text-gray-600 whitespace-pre-wrap'>
                {event.eventDescriptionJa}
              </p>
            </div>

            <div className='flex justify-center mt-4'>
              <button className='w-auto h-16 px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50'>
                <Star className='w-6 h-6 mr-2 fill-current' />
                ココいく！
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
