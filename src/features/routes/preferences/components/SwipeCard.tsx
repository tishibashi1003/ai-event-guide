import type React from 'react';
import { useEffect } from 'react';
import {
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import { Event } from '@/types/firestoreDocument';
import { Building2, Calendar, MapPin, Users } from 'lucide-react';

// 日付を年月日形式に変換する関数
const formatDateYYYYMMDD = (dateStr: string): string => {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}年${month}月${day}日`;
};

interface SwipeCardProps {
  event: Event;
  onSwipe: (direction: 'left' | 'right') => void;
  swipeDirection: 'left' | 'right' | null;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  onSwipe,
  swipeDirection,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const controls = useAnimation();

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -100) {
      onSwipe('left');
    } else if (info.offset.x > 100) {
      onSwipe('right');
    }
  };

  useEffect(() => {
    if (swipeDirection === 'left') {
      controls
        .start({ x: -300, opacity: 0, transition: { duration: 0.6 } })
        .then(() => onSwipe('left'));
    } else if (swipeDirection === 'right') {
      controls
        .start({ x: 300, opacity: 0, transition: { duration: 0.6 } })
        .then(() => onSwipe('right'));
    }
  }, [swipeDirection, controls, onSwipe]);

  return (
    <motion.div
      style={{
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        x,
        rotate,
        opacity,
      }}
      drag='x'
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div className='bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 h-40 flex items-center justify-center relative'>
        <div className='text-center p-4 z-10'>
          <span className='text-5xl'>{event.eventEmoji}</span>
          <p className='mt-3 font-medium text-yellow-800 text-md'>
            {event.eventCategoryEn}
          </p>
        </div>
      </div>

      <div className='p-6 space-y-4 bg-white'>
        <h2 className='text-xl font-bold text-gray-800'>
          {event.eventTitleJa}
        </h2>

        <div className='flex items-center gap-4'>
          <div className='flex items-center text-gray-600'>
            <Calendar className='w-5 h-5 mr-2 text-yellow-500' />
            <span>{formatDateYYYYMMDD(event.eventDateYYYYMMDD)}</span>
          </div>

          <div className='flex items-center text-gray-600'>
            <Building2 className='w-5 h-5 mr-2 text-yellow-500' />
            <span>{event.eventLocationCityJa}</span>
          </div>
        </div>

        <div className='flex items-center text-gray-600 text-sm'>
          <MapPin className='w-4 h-4 mr-2 text-yellow-500' />
          <span>{event.eventLocationNameJa}</span>
        </div>

        <p className='text-gray-700 line-clamp-3'>{event.eventDescriptionJa}</p>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
