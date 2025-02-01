import { User } from '@/types/firestoreDocument';
import { db } from '@/utils/firebase/config';
import { doc, getDoc, setDoc, Timestamp, Firestore } from 'firebase/firestore';

export const createUser = async (uid: string): Promise<void> => {
  const userRef = doc(db as Firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const newUser: User = {
      uid,
      preferenceVector: [], // 初期値は空配列
      preferredCategories: [], // 初期値は空配列
      postalCode: '',
      prefecture: '',
      city: '',
      pricePreference: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastVectorUpdateAt: Timestamp.now(),
    };

    await setDoc(userRef, newUser);
  }
};
