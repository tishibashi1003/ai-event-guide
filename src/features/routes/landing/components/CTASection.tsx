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
      <h2 className='text-3xl md:text-4xl font-bold mb-6'>
        さあ、素敵な週末を見つけましょう
      </h2>
      <p className='text-xl text-gray-600 mb-8'>
        新しい週末の楽しみ方を見つけてみませんか
      </p>
      <Button
        size='lg'
        className='rounded-full bg-amber-400 hover:bg-amber-500'
        asChild
      >
        <Link href='/auth'>
          ログイン / 会員登録
          <ArrowRight className='ml-2 h-4 w-4' />
        </Link>
      </Button>
    </section>
  );
};
