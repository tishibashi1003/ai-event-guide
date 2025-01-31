'use client';

import { motion } from 'framer-motion';
import React from 'react';

const MagnifyingGlass = () => (
  <motion.div
    initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
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
      delay: 0.5, // 少し遅延を加えて、最初の状態を見せる
    }}
  >
    <svg
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
        initial={{ pathLength: 1 }} // 最初から完全な円を表示
        animate={{ pathLength: [1, 0, 1] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          delay: 0.5,
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
        initial={{ pathLength: 1 }} // 最初から完全な線を表示
        animate={{ pathLength: [1, 0, 1] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          delay: 0.5,
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
          delay: 0.5,
        }}
      />
    </svg>
  </motion.div>
);

const Star = ({
  delay,
  duration,
  left,
  top,
}: {
  delay: number;
  duration: number;
  left: number;
  top: number;
}) => (
  <motion.div
    className='absolute w-2 h-2 bg-[#FFD700] rounded-full'
    initial='hidden'
    animate='visible'
    variants={{
      hidden: {
        opacity: 0,
        scale: 0,
        y: 0,
      },
      visible: {
        opacity: [0, 0.3, 0.3, 0],
        scale: [0, 1, 1, 0],
        y: [0, -20, -40, -60],
        transition: {
          duration: duration,
          repeat: Number.POSITIVE_INFINITY,
          delay: delay,
          ease: 'easeInOut',
          times: [0, 0.1, 0.9, 1],
        },
      },
    }}
    style={{
      left: `${left}%`,
      top: `${top}%`,
    }}
  />
);

export default function SearchLoading() {
  const stars = React.useMemo(() => {
    const SEED = 12345; // 固定のシード値
    const random = (base: number) => {
      const x = Math.sin(SEED * base) * 10000;
      return Number(Math.abs(x - Math.floor(x)).toFixed(4));
    };

    return Array.from({ length: 40 }, (_, i) => {
      const left = Number((random(i * 4 + 1) * 100).toFixed(4));
      const top = Number((random(i * 4 + 2) * 100).toFixed(4));
      const delay = Number((random(i * 4 + 3) * 5).toFixed(4));
      const duration = Number((5 + random(i * 4 + 4) * 5).toFixed(4));

      return { left, top, delay, duration };
    });
  }, []);

  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen overflow-hidden'>
      {stars.map((star, i) => (
        <Star
          key={i}
          delay={star.delay}
          duration={star.duration}
          left={star.left}
          top={star.top}
        />
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <MagnifyingGlass />
      </motion.div>
      <motion.p
        className='mt-4 text-sm font-medium text-[#FFD700]'
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.span
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          開催予定のイベントを検索中...
        </motion.span>
      </motion.p>
    </div>
  );
}
