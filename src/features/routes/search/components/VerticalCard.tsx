import type React from 'react';
import { motion } from 'framer-motion';
import { type Event } from '@/features/common/event/type';
import { Calendar, Users } from 'lucide-react';

interface VerticalCardProps {
  event: Event;
  onClick?: () => void;
}

const VerticalCard: React.FC<VerticalCardProps> = ({ event, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className='w-full mb-4 cursor-pointer'
      onClick={onClick}
    >
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 h-32 flex items-center justify-center relative'>
          <div className='text-center p-4 z-10'>
            <span className='text-4xl'>{event.emoji}</span>
            <p className='mt-2 font-medium text-yellow-800 text-sm'>
              {event.category}
            </p>
          </div>
        </div>

        <div className='p-4 space-y-3'>
          <h2 className='text-lg font-bold text-gray-800 line-clamp-2'>
            {event.title}
          </h2>

          <div className='flex items-center text-gray-600 text-sm'>
            <Calendar className='w-4 h-4 mr-2 text-yellow-500' />
            <span>{event.date}</span>
          </div>

          <div className='flex items-center text-gray-600 text-sm'>
            <Users className='w-4 h-4 mr-2 text-yellow-500' />
            <span>{event.price}</span>
          </div>

          <p className='text-gray-700 text-sm line-clamp-2'>
            {event.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VerticalCard;
