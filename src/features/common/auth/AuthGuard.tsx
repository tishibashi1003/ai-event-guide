'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading } from '@/components/ui/loading';
import { usePreferenceCheck } from './hooks';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { hasPreference } = usePreferenceCheck(user?.uid);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || (user && hasPreference === null)) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
