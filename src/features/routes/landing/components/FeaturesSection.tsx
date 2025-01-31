'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Sparkles, Star } from 'lucide-react';
import type { FeaturesSectionProps } from '../type';

export const FeaturesSection = ({ className }: FeaturesSectionProps) => {
  return (
    <section className={`container mx-auto px-4 py-20 ${className}`}>
      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='border-none bg-white/50 backdrop-blur'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-amber-100'>
              <Sparkles className='w-6 h-6 text-amber-600' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>AIパーソナライズ</h3>
            <p className='text-gray-600'>
              あなたの「好き」を学習し、最高の週末体験をご提案
            </p>
          </CardContent>
        </Card>

        <Card className='border-none bg-white/50 backdrop-blur'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-amber-100'>
              <Calendar className='w-6 h-6 text-amber-600' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>週末限定イベント</h3>
            <p className='text-gray-600'>
              最新の週末イベント情報をリアルタイムで更新
            </p>
          </CardContent>
        </Card>

        <Card className='border-none bg-white/50 backdrop-blur'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-amber-100'>
              <Star className='w-6 h-6 text-amber-600' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>簡単操作</h3>
            <p className='text-gray-600'>
              スワイプするだけの直感的な操作で理想の週末が見つかる
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
