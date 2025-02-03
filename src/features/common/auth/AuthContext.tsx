'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import { auth, db } from '@/utils/firebase/config';
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      // ユーザーのイベントインタラクション履歴を削除
      const interactionsRef = collection(
        db,
        `users/${user.uid}/eventInteractionHistories`
      );
      const interactionsSnapshot = await getDocs(interactionsRef);
      const deleteInteractions = interactionsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteInteractions);

      // ユーザードキュメントを削除
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      // 最後にFirebase Authのアカウントを削除
      await deleteUser(user);
    } catch (error) {
      console.error('アカウント削除中にエラーが発生しました:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
