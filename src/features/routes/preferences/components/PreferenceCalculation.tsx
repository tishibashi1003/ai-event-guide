import { motion } from 'framer-motion';

export function PreferenceCalculation() {
  return (
    <div className='relative w-64 h-64'>
      <motion.div
        className='absolute inset-0'
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
          <circle
            cx='50'
            cy='50'
            r='45'
            fill='none'
            stroke='#FCD34D'
            strokeWidth='2'
            strokeLinecap='round'
            strokeDasharray='1 8'
          />
        </svg>
      </motion.div>

      <motion.div
        className='absolute inset-0 flex items-center justify-center'
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <svg width='120' height='120' viewBox='0 0 120 120'>
          {/* キャラクター */}
          <circle cx='60' cy='60' r='50' fill='#FDE68A' />
          <circle cx='45' cy='50' r='5' fill='#1F2937' />
          <circle cx='75' cy='50' r='5' fill='#1F2937' />
          <path
            d='M50 70 Q60 80 70 70'
            stroke='#1F2937'
            strokeWidth='3'
            fill='none'
          />

          {/* 電卓 */}
          <rect x='30' y='85' width='60' height='30' fill='#4B5563' rx='5' />
          <rect x='35' y='90' width='50' height='10' fill='#E5E7EB' rx='2' />

          {/* 数字のアニメーション */}
          <motion.text
            x='60'
            y='98'
            fontSize='12'
            fill='#111827'
            textAnchor='middle'
            animate={{
              opacity: [1, 0, 1],
              translateY: [0, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            123...
          </motion.text>
        </svg>
      </motion.div>

      {/* 飛び散る数字 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className='absolute text-yellow-500 font-bold text-sm'
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
            y: [0, -30 - i * 10],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.4,
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          {Math.floor(Math.random() * 10)}
        </motion.div>
      ))}
    </div>
  );
}
