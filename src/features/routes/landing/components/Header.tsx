'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HeaderProps } from '../type';
import LogoHorizontal from '@/components/logo/LogoHorizontal';

export const Header = ({ className }: HeaderProps) => {
  return (
    <header
      className={`px-8 py-4 flex items-center justify-between relative z-10 bg-white w-full ${className}`}
    >
      <div className='flex items-center gap-2'>
        <LogoHorizontal />
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' className='rounded-full' asChild>
          <Link href='/login'>
            ログイン / 会員登録
            <ArrowRight className='w-4 h-4 ml-2' />
          </Link>
        </Button>
      </div>
    </header>
  );
};
