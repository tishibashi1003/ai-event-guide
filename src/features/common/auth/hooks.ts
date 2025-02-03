import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { User } from '@/types/firestoreDocument';
import { VectorValue } from 'firebase/firestore';

export const usePreferenceCheck = (uid: string | undefined) => {
  const [hasPreference, setHasPreference] = useState<boolean | null>(null);
  const router = useRouter();
  const path = uid ? `users/${uid}` : undefined;
  const { data: userData, error } = useFirestoreDoc<User>(path);

  useEffect(() => {
    if (!uid) {
      setHasPreference(null);
      return;
    }

    if (error) {
      console.error('Error fetching user data:', error);
      setHasPreference(null);
      return;
    }

    if (userData) {
      const vector = userData.preferenceVector as unknown as VectorValue;
      const hasVector = vector !== undefined && vector.toArray().length > 0;
      setHasPreference(hasVector);

      if (!hasVector) {
        router.push('/preferences');
      }
    }
  }, [uid, userData, error, router]);

  return { hasPreference };
};
