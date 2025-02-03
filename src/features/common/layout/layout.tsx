'use client';

import type React from 'react';
import { useState } from 'react';
import { Search, Star, User, Heart, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import LogoHorizontal from '@/components/logo/LogoHorizontal';
interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export default function Layout({ children, currentPath }: LayoutProps) {
  const { scrollY } = useScroll();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const direction = latest > lastScrollY ? 'down' : 'up';
    if (direction === 'down' && latest > 50) {
      setIsHeaderVisible(false);
    } else if (direction === 'up') {
      setIsHeaderVisible(true);
    }
    setLastScrollY(latest);
  });

  const menuItems = [
    { path: '/search', label: 'さがす', icon: Search },
    { path: '/kokoiku', label: 'ココいく', icon: Star },
    { path: '/settings', label: '設定', icon: Settings },
  ];

  return (
    <div className='min-h-screen bg-white max-w-sm mx-auto'>
      {/* ヘッダー */}
      <motion.header
        className='fixed top-0 left-0 right-0 z-50 shadow-sm bg-white/95 backdrop-blur-sm'
        initial={{ y: 0 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className='flex items-center justify-center h-16 px-4'>
          <LogoHorizontal />
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      <main className='min-h-screen pt-16 pb-20'>{children}</main>

      {/* フッターナビゲーション */}
      <nav className='fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-sm'>
        <div className='flex items-center justify-around h-16 max-w-md px-6 mx-auto'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className='flex flex-col items-center justify-center w-20'
              >
                <div
                  className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                    isActive ? 'text-[#FFD700]' : 'text-[#808080]'
                  }`}
                >
                  <Icon
                    size={24}
                    className='mb-1'
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className='text-xs font-medium'>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId='nav-indicator'
                      className='absolute bottom-0 w-12 h-0.5 bg-[#FFD700]'
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
