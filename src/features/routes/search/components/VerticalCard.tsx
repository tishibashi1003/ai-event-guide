import type React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building2 } from 'lucide-react';
import { Event } from '@/types/firestoreDocument';
import { formatDate } from '@/utils/day';

interface VerticalCardProps {
  event: Event;
  onClick?: () => void;
  isRecommended?: boolean;
}

const VerticalCard: React.FC<VerticalCardProps> = ({
  event,
  onClick,
  isRecommended,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className='w-full mb-4 cursor-pointer'
      onClick={onClick}
    >
      <div className='bg-white rounded-lg shadow-md overflow-hidden relative'>
        {isRecommended && (
          <div className='absolute -right-9 top-4 rotate-45 bg-yellow-500 text-center text-white px-10 py-1 text-xs font-medium shadow-md z-20 '>
            Pick Up
          </div>
        )}
        <div className='bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 h-32 flex items-center justify-center relative'>
          <div className='text-center p-4 z-10'>
            <span className='text-4xl'>{event.eventEmoji}</span>
            <p className='mt-2 font-medium text-yellow-800 text-sm'>
              {event.eventCategoryEn}
            </p>
          </div>
        </div>

        <div className='p-4 space-y-3'>
          <h2 className='text-lg font-bold text-gray-800 line-clamp-2'>
            {event.eventTitleJa}
          </h2>

          <div className='flex items-center gap-4'>
            <div className='flex items-center text-gray-600 text-sm'>
              <Calendar className='w-4 h-4 mr-2 text-yellow-500' />
              <span>{formatDate(event.eventDate.toDate())}</span>
            </div>

            <div className='flex items-center text-gray-600 text-sm'>
              <Building2 className='w-4 h-4 mr-2 text-yellow-500' />
              <span>{event.eventLocationCityJa}</span>
            </div>
          </div>

          <div className='flex items-center text-gray-600 text-sm'>
            <MapPin className='w-4 h-4 mr-2 text-yellow-500' />
            <span>{event.eventLocationNameJa}</span>
          </div>

          <p className='text-gray-700 text-sm line-clamp-2'>
            {event.eventDescriptionJa}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VerticalCard;
