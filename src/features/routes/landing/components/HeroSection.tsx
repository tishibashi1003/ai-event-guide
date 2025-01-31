'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HeroSectionProps } from '../type';

export const HeroSection = ({ className }: HeroSectionProps) => {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Shapes */}
      <div className='absolute inset-0 overflow-hidden'>
        <svg
          className='absolute top-0 left-0 w-full h-full'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
        >
          <circle cx='0' cy='0' r='30' fill='#FDE68A' fillOpacity='0.5' />
          <circle cx='100' cy='10' r='20' fill='#FCD34D' fillOpacity='0.4' />
          <path
            d='M50 0 L100 50 L50 100 L0 50 Z'
            fill='#FBBF24'
            fillOpacity='0.3'
          />
          <rect
            x='80'
            y='70'
            width='30'
            height='30'
            fill='#F59E0B'
            fillOpacity='0.2'
          />
        </svg>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-20 relative z-10'>
        <div className='max-w-3xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
            週末をもっと楽しく、もっとワクワクに
          </h1>
          <p className='text-xl md:text-2xl text-gray-600 mb-12'>
            家族みんなの「好き」から、素敵な週末のお出かけ先を見つけよう
          </p>
          <Button
            size='lg'
            className='rounded-full bg-amber-400 hover:bg-amber-500'
            asChild
          >
            <Link href='/auth'>
              無料で始める
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
