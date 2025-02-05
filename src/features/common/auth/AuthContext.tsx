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
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  Auth,
} from 'firebase/auth';
import {
  auth as firebaseAuth,
  db as firebaseDb,
} from '@/utils/firebase/config';
import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Firebase インスタンスの取得
  const auth = firebaseAuth as Auth;
  const db = firebaseDb as Firestore;

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    if (!auth || !db) throw new Error('Firebase is not initialized');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // ユーザードキュメントが存在しない場合は作成
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        router.push('/search');
        return result;
      }
      await setDoc(
        userDocRef,
        {
          uid: result.user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      router.push('/preferences');
      return result;
    } catch (error) {
      console.error('Googleログイン中にエラーが発生しました:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!user || !db || !auth) throw new Error('Firebase is not initialized');
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
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        signInWithGoogle,
      }}
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
