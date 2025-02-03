'use client';

import { LogOut, UserX } from 'lucide-react';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SettingsContainer = () => {
  const { signOut, deleteAccount } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.push('/login');
    } catch (error) {
      console.error('アカウント削除中にエラーが発生しました:', error);
    }
  };

  return (
    <div className='max-w-md min-h-screen p-4 mx-auto bg-white'>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-gray-900'>設定</h1>
        <hr className='my-4' />

        <button
          onClick={handleLogout}
          className='flex items-center w-full py-2 text-gray-700 hover:text-gray-900 transition-colors'
        >
          <LogOut size={20} className='mr-3' />
          <span>ログアウト</span>
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className='flex items-center w-full py-2 text-[#FF3B30] hover:text-[#FF3B30]/90 transition-colors'>
              <UserX size={20} className='mr-3' />
              <span>退会する</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消すことができません。アカウントを削除すると、すべてのデータが完全に削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className='bg-[#FF3B30] hover:bg-[#FF3B30]/90'
              >
                退会する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
