'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HeaderProps } from '../type';

export const Header = ({ className }: HeaderProps) => {
  return (
    <header
      className={`container mx-auto px-4 py-6 flex items-center justify-between relative z-10 ${className}`}
    >
      <div className='flex items-center gap-2'>
        <div className='w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center'>
          <span className='text-white text-2xl'>😊</span>
        </div>
        <span className='text-2xl font-bold text-amber-400'>ココいく</span>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' className='rounded-full' asChild>
          <Link href='/auth'>
            ログイン / 会員登録
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    </header>
  );
};
