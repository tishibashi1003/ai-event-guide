'use client';

import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
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
      className='w-full max-w-sm overflow-hidden shadow-md cursor-grab active:cursor-grabbing rounded-lg border border-gray-200'
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
      <div className='bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 h-40 flex items-center justify-center relative'>
        <div className='text-center p-4 z-10'>
          <span className='text-5xl'>{event.emoji}</span>
          <p className='mt-3 font-medium text-yellow-800 text-md'>
            {event.category}
          </p>
        </div>
      </div>

      <div className='p-6 space-y-4 bg-white'>
        <h2 className='text-xl font-bold text-gray-800'>{event.title}</h2>

        <div className='flex items-center text-gray-600'>
          <Calendar className='w-5 h-5 mr-2 text-yellow-500' />
          <span>{event.date}</span>
        </div>

        <div className='flex items-center text-gray-600'>
          <Users className='w-5 h-5 mr-2 text-yellow-500' />
          <span>{event.price}</span>
        </div>

        <p className='text-gray-700 line-clamp-3'>{event.description}</p>
      </div>
    </motion.div>
  );
}
