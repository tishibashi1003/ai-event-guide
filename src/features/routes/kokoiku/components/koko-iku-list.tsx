'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Tag } from 'lucide-react';
import { kokoIkuListEvents } from '../type';

export default function KokoIkuList() {
  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <header className='flex items-center justify-between p-4 border-b border-gray-100'>
        <h1 className='text-2xl font-bold text-[#FFD700]'>ココいくリスト</h1>
      </header>

      <main className='flex-1 p-4'>
        <div className='grid gap-4'>
          {kokoIkuListEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg'
            >
              <div className='flex'>
                <img
                  src={event.image || '/placeholder.svg'}
                  alt={event.title}
                  className='w-24 h-24 object-cover'
                />
                <div className='p-3 flex-1'>
                  <h2 className='font-bold text-lg mb-1 text-[#4A4A4A]'>
                    {event.title}
                  </h2>
                  <div className='flex items-center text-[#808080] text-sm mb-1'>
                    <Calendar size={14} className='mr-1' />
                    <span>{event.date}</span>
                  </div>
                  <div className='flex items-center text-[#808080] text-sm'>
                    <MapPin size={14} className='mr-1' />
                    <span>
                      {event.location} • {event.distance}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
