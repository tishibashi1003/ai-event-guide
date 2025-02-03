'use client';

import { Calendar, MapPin, Star, Sparkles } from 'lucide-react';
import type { AppPreviewSectionProps } from '../type';
import Image from 'next/image';

export const AppPreviewSection = ({ className }: AppPreviewSectionProps) => {
  return (
    <section className={`container mx-auto px-4 py-20 ${className}`}>
      <div className='relative'>
        <div className='absolute inset-0 bg-amber-100 rounded-3xl -rotate-1'></div>
        <div className='relative bg-white rounded-3xl p-8 rotate-1'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            <div>
              <h2 className='text-3xl font-bold mb-6'>
                家族の思い出作りを、もっと楽しく
              </h2>
              <p className='text-gray-600 mb-6'>
                家族みんなの興味や好みを理解して、ぴったりな週末のお出かけスポットをご提案。スワイプするだけのカンタン操作で、新しい発見が待っています。
              </p>
              <ul className='space-y-4'>
                <li className='flex items-center gap-2'>
                  <MapPin className='w-5 h-5 text-amber-500' />
                  <span>近くの人気スポットを発見</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5 text-amber-500' />
                  <span>週末限定イベントをチェック</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Star className='w-5 h-5 text-amber-500' />
                  <span>お気に入りを保存</span>
                </li>
              </ul>
            </div>
            <div className='relative'>
              <Image
                src='/app-preview.png'
                alt='アプリのプレビュー'
                width={300}
                height={600}
                className='rounded-xl shadow-lg'
              />
              <div className='absolute -bottom-6 -right-6 bg-amber-400 rounded-full p-4 shadow-lg'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
