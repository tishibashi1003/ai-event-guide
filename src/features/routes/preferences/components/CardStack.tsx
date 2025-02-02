import type React from 'react';
import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Event } from '@/types/firestoreDocument';
import SwipeCard from './SwipeCard';

interface CardStackProps {
  events: Event[];
  onIndexChange: (index: number) => void;
  currentIndex?: number;
}

const CardStack: React.FC<CardStackProps> = ({
  events,
  onIndexChange,
  currentIndex: externalIndex = 0,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
    null
  );

  const handleSwipe = () => {
    setSwipeDirection(null);
    onIndexChange(externalIndex + 1);
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (externalIndex < events.length) {
      setSwipeDirection(direction);
    }
  };

  const isLastCard = externalIndex >= events.length;

  return (
    <div className='relative w-full px-2'>
      <div className='relative h-[400px]'>
        {!isLastCard ? (
          <SwipeCard
            key={externalIndex}
            event={events[externalIndex]}
            onSwipe={handleSwipe}
            swipeDirection={swipeDirection}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-white rounded-lg shadow-md'>
            <p className='text-md font-bold text-gray-500'>
              これ以上イベントはありません。
            </p>
          </div>
        )}
      </div>
      <div className='flex justify-between items-center'>
        <footer className='flex justify-around items-center p-2 pt-6 max-w-md mx-auto w-full bg-white'>
          <button
            className='w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#FF3B30] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#FFEEEE] focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:ring-opacity-50'
            onClick={() => triggerSwipe('left')}
            disabled={isLastCard}
          >
            <X className='w-6 h-6' />
          </button>
          {/* <button
            className='w-auto h-16 px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50'
            onClick={() => triggerSwipe('right')}
            disabled={isLastCard}
          >
            <Star className='w-6 h-6 mr-2 fill-current' />
            ココいく！
          </button> */}
          <button
            className='w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#34C759] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#EEFFF5] focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:ring-opacity-50'
            onClick={() => triggerSwipe('right')}
            disabled={isLastCard}
          >
            <Check className='w-6 h-6' />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CardStack;
