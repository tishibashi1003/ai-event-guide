'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { CTASectionProps } from '../type';

export const CTASection = ({ className }: CTASectionProps) => {
  return (
    <section
      className={`container mx-auto px-4 py-20 text-center ${className}`}
    >
      <h2 className='mb-6 text-3xl font-bold md:text-4xl'>
        さあ、素敵な週末を見つけましょう
      </h2>
      <p className='mb-8 text-xl text-gray-600'>
        新しい週末の楽しみ方を見つけてみませんか
      </p>
      <Button
        size='lg'
        className='rounded-full bg-amber-400 hover:bg-amber-500'
        asChild
      >
        <Link href='/login'>
          ログイン / 会員登録
          <ArrowRight className='w-4 h-4 ml-2' />
        </Link>
      </Button>
    </section>
  );
};
