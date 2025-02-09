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
      <div className='container relative z-10 px-4 py-20 mx-auto'>
        <div className='max-w-3xl mx-auto text-center'>
          <h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl'>
            週末をもっと楽しく
            <br />
            もっとワクワクに
          </h1>
          <p className='mb-12 text-xl text-gray-600 md:text-2xl'>
            家族みんなの「好き」から、ステキな週末のお出かけ先を見つけよう
          </p>
          <Button
            size='lg'
            className='rounded-full bg-amber-400 hover:bg-amber-500'
            asChild
          >
            <Link href='/login'>
              無料で始める
              <ArrowRight className='w-4 h-4 ml-2' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
