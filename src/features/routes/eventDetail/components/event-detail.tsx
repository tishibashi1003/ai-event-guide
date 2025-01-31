import React from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Tag,
  ChevronDown,
  MapIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Event } from '@/features/common/event/type';
interface EventDetailProps {
  event: Event | null;
  onBack: () => void;
}

export default function EventDetail({ event, onBack }: EventDetailProps) {
  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <header className='relative'>
        <Image
          src={event?.image || '/placeholder.svg'}
          alt={event?.title || ''}
          className='w-full h-64 object-cover'
          width={100}
          height={100}
        />
        <button
          onClick={onBack}
          className='absolute top-4 left-4 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg'
        >
          <ArrowLeft size={24} className='text-black' />
        </button>
      </header>

      <main className='flex-1 px-4 py-6'>
        <h1 className='text-2xl font-bold text-black mb-4'>{event?.title}</h1>

        <div className='flex items-center text-[#808080] mb-2'>
          <Calendar size={18} className='mr-2' />
          <span>{event?.date}</span>
        </div>

        <div className='flex items-center text-[#808080] mb-2'>
          <MapPin size={18} className='mr-2' />
          <span>{event?.location}</span>
        </div>

        <div className='flex items-center mb-2'>
          <Tag size={18} className='mr-2 text-[#F5A623]' />
          <span className='font-semibold text-[#F5A623]'>{event?.price}</span>
        </div>

        <div className='flex items-center mb-4'>
          <Users size={18} className='mr-2 text-[#FFD700]' />
          <span className='text-[#FFD700]'>{event?.ageRange}</span>
        </div>

        <div className='flex flex-wrap gap-2 mb-6'>
          {event?.categories.map((category, index) => (
            <span
              key={index}
              className='px-3 py-1 bg-[#FFD700] text-black rounded-full'
            >
              {category}
            </span>
          ))}
        </div>

        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-black mb-2'>
            イベント詳細
          </h2>
          <p className='text-black'>{event?.description}</p>
          <button className='flex items-center text-[#FFD700] mt-2'>
            <span className='mr-1'>もっと見る</span>
            <ChevronDown size={16} />
          </button>
        </div>

        <div>
          <h2 className='text-lg font-semibold text-black mb-2'>地図</h2>
          <div className='bg-[#808080] h-40 rounded-lg flex items-center justify-center'>
            <MapIcon size={32} className='text-[#FFD700]' />
          </div>
        </div>
      </main>

      <footer className='p-4'>
        <button className='w-full bg-[#FFD700] text-black py-3 rounded-lg font-semibold'>
          ココいく！
        </button>
      </footer>
    </div>
  );
}
