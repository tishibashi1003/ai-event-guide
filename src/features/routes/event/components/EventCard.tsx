import React from 'react';
import Image from 'next/image';
import { Event } from '../type';

interface EventCardProps {
  event: Event;
  onSave?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSave }) => {
  return (
    <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
      <div className='relative h-48'>
        <Image
          src={event.image || '/images/default-event.jpg'}
          alt={event.title}
          layout='fill'
          objectFit='cover'
        />
      </div>
      <div className='p-4'>
        <h3 className='text-xl font-bold mb-2'>{event.title}</h3>
        <p className='text-gray-600 mb-4'>{event.description}</p>
        <div className='flex justify-between items-center'>
          <div>
            <p className='text-sm text-gray-500'>{event.location}</p>
            <p className='text-sm text-gray-500'>{event.date}</p>
          </div>
          {onSave && (
            <button
              onClick={onSave}
              className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
            >
              ココいく！
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
