'use client';

import LogoHorizontal from '@/components/logo/LogoHorizontal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/common/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useFirestoreCollectionUpdate } from '@/hooks/useFirestore';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import type { User } from '@/types/firestoreDocument';
import { getFirebase } from '@/utils/firebase/config';
import { useEffect, useState } from 'react';

export const LoginContainer = () => {
  const { signInWithGoogle, signInAnonymously } = useAuth();
  const router = useRouter();
  const { add } = useFirestoreCollectionUpdate('users');
  const [isClient, setIsClient] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const { db } = getFirebase();

      if (!db) {
        console.error('Firestore is not initialized');
        return;
      }

      if (result?.user) {
        // ユーザードキュメントの存在確認
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // ドキュメントが存在しない場合のみ作成
        if (!userDocSnap.exists()) {
          const userData: User = {
            uid: result.user.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isAnonymous: false,
          };

          await add<User>(userData, result.user.uid);
        }

        router.push('/search');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setIsAnonymousLoading(true);
      const result = await signInAnonymously();
      const { db } = getFirebase();

      if (!db) {
        console.error('Firestore is not initialized');
        return;
      }

      if (result?.user) {
        // ユーザードキュメントの存在確認
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // ドキュメントが存在しない場合のみ作成
        if (!userDocSnap.exists()) {
          const userData: User = {
            uid: result.user.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isAnonymous: true,
          };

          await add<User>(userData, result.user.uid);
        }

        router.push('/search');
      }
    } catch (error) {
      console.error('❌ Anonymous login error:', error);
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  // SSRの場合はローディング表示
  if (!isClient) {
    return (
      <div className='flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-amber-50 to-white'>
        <Card className='w-full max-w-md'>
          <div className='flex items-center justify-center mt-6 mb-4'>
            <LogoHorizontal />
          </div>
          <p className='text-sm text-center text-gray-600'>読み込み中...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-amber-50 to-white'>
      <Card className='w-full max-w-md'>
        <div className='flex items-center justify-center mt-6 mb-4'>
          <LogoHorizontal />
        </div>
        <p className='text-sm text-center text-gray-600'>
          Googleアカウントでログイン・会員登録
        </p>
        <CardContent>
          <Button className='w-full mb-4' onClick={handleGoogleLogin}>
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Googleでログイン / 会員登録
          </Button>
          <div className='relative mb-4'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 text-gray-500 bg-white'>または</span>
            </div>
          </div>
          <Button
            variant='outline'
            className='w-full mb-4'
            onClick={handleAnonymousLogin}
            disabled={isAnonymousLoading}
          >
            {isAnonymousLoading ? (
              <>
                <svg
                  className='w-4 h-4 mr-2 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                ログイン中...
              </>
            ) : (
              'ゲストとして利用する'
            )}
          </Button>
          <div className='mt-2 text-center'>
            <Link
              href='/'
              className='inline-flex items-center text-sm text-gray-600 hover:underline'
            >
              <ArrowLeft className='w-4 h-4 mr-1' />
              トップページに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
