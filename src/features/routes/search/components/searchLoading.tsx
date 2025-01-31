'use client';

import { motion } from 'framer-motion';

const MagnifyingGlass = () => (
  <motion.div
    animate={{
      x: [0, 20, 0, -20, 0],
      y: [0, -15, 20, -15, 0],
      rotate: [0, -8, 8, -8, 0],
      scale: [1, 1.1, 0.9, 1.1, 1],
    }}
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    }}
  >
    <motion.svg
      width='120'
      height='120'
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <motion.circle
        cx='50'
        cy='50'
        r='35'
        stroke='#FFD700'
        strokeWidth='8'
        fill='white'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      />
      <motion.line
        x1='77'
        y1='77'
        x2='105'
        y2='105'
        stroke='#FFD700'
        strokeWidth='8'
        strokeLinecap='round'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      />
      <motion.circle
        cx='50'
        cy='50'
        r='4'
        fill='#FFD700'
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
    </motion.svg>
  </motion.div>
);

const Star = ({ delay, duration }: { delay: number; duration: number }) => (
  <motion.div
    className='absolute w-2 h-2 bg-yellow-100 rounded-full'
    initial={{ opacity: 0, scale: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [0, -20, -40, -60],
    }}
    transition={{
      duration: duration,
      repeat: Number.POSITIVE_INFINITY,
      delay: delay,
      ease: 'easeInOut',
      times: [0, 0.1, 0.9, 1],
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

export default function GoldenSmoothLoopingCuteSearchAnimation() {
  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen overflow-hidden'>
      {[...Array(40)].map((_, i) => (
        <Star
          key={i}
          delay={Math.random() * 5}
          duration={5 + Math.random() * 5}
        />
      ))}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <MagnifyingGlass />
      </motion.div>
      <motion.p
        className='mt-4 text-sm font-medium text-[#595959]'
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        開催予定のイベントを検索中...
      </motion.p>
    </div>
  );
}
