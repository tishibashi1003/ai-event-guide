'use client';

import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Calendar, Users, Tag } from 'lucide-react';
import Image from 'next/image';
import { type Event } from '@/features/common/event/type';

interface EventCardProps {
  event: Event;
  direction: 'right' | 'left' | 'up' | 'down' | null;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => void;
  onClick: () => void;
}

export default function EventCard({
  event,
  direction,
  onDragEnd,
  onClick,
}: EventCardProps) {
  return (
    <motion.div
      key={event.id}
      className='w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing'
      initial={{
        scale: 0.8,
        opacity: 0,
        y: direction === 'down' ? -300 : 0,
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
      }}
      animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
      exit={{
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
        y: direction === 'down' ? 300 : 0,
        opacity: 0,
        scale: 0.8,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag='x'
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className='relative'>
        <Image
          src={event.image || '/placeholder.svg'}
          alt={event.title}
          className='w-full h-48 object-cover'
          width={100}
          height={48}
        />
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3'>
          <h2 className='text-lg font-bold text-white mb-1'>{event.title}</h2>
          <div className='flex items-center text-white opacity-90'>
            <Calendar size={14} className='mr-1' />
            <span className='text-xs'>{event.date}</span>
          </div>
        </div>
      </div>
      <div className='p-3 bg-[#F8F8F8]'>
        <div className='flex items-center mb-2'>
          <Tag size={16} className='mr-2 text-[#D18700]' />
          <span className='text-sm font-semibold text-[#D18700]'>
            {event.price}
          </span>
        </div>
        <div className='flex items-center mb-3'>
          <Users size={16} className='mr-2 text-[#B39700]' />
          <span className='text-sm text-[#B39700]'>{event.ageRange}</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {event.categories.map((category, index) => (
            <span
              key={index}
              className='px-3 py-1 bg-[#FFD700] bg-opacity-30 text-[#8A7500] text-xs font-medium rounded-full'
            >
              {category}
            </span>
          ))}
        </div>
        <div className='text-sm text-[#595959] line-clamp-3'>
          {event.description}
        </div>
      </div>
    </motion.div>
  );
}
