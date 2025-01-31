'use client';

import { useState } from 'react';
import { User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { Switch } from '@/features/routes/search/components/switch';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useRouter } from 'next/navigation';

export const ProfileContainer = () => {
  const [notifications, setNotifications] = useState(true);
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  return (
    <div className='max-w-md min-h-screen p-4 mx-auto bg-white'>
      <div className='flex items-center mb-8'>
        <div className='w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center'>
          <User size={32} className='text-white' />
        </div>
        <div className='ml-4'>
          <h2 className='text-xl font-bold'>ゲストユーザー</h2>
          <p className='text-[#808080]'>アカウントを作成する</p>
        </div>
      </div>

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Bell size={20} className='text-[#4A4A4A] mr-3' />
            <span>通知</span>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <button className='flex items-center w-full py-2'>
          <Shield size={20} className='text-[#4A4A4A] mr-3' />
          <span>プライバシー設定</span>
        </button>

        <button className='flex items-center w-full py-2'>
          <HelpCircle size={20} className='text-[#4A4A4A] mr-3' />
          <span>ヘルプ＆サポート</span>
        </button>

        <hr className='my-4' />

        <button
          onClick={handleLogout}
          className='flex items-center w-full py-2 text-[#FF3B30]'
        >
          <LogOut size={20} className='mr-3' />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
};
