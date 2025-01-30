import React from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const SwipeContainer: React.FC<SwipeContainerProps> = ({
  children,
  onSwipe,
}) => {
  const handleDragEnd = (e: MouseEvent, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      drag='x'
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className='relative w-full h-full'
    >
      {children}
    </motion.div>
  );
};
