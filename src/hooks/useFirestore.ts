import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, DocumentReference, CollectionReference, DocumentData, query, where, orderBy, limit as firestoreLimit, Query, WhereFilterOp, OrderByDirection, documentId } from 'firebase/firestore';
import useSWR, { mutate } from 'swr';
import { getFirebase } from '@/utils/firebase/config';
import { FirestoreError } from 'firebase/firestore';

// SSRチェック
const isServer = () => typeof window === 'undefined';

export type FirestoreDocResult<T> = {
  data: T | undefined;
  error: FirestoreError | null;
  isLoading: boolean;
};

export type FirestoreCollectionResult<T> = {
  data: (T & { id: string })[] | undefined;
  error: FirestoreError | null;
  isLoading: boolean;
};

export type FirestoreUpdateOperations = {
  update: <T>(newData: Partial<T>) => Promise<void>;
  set: <T>(newData: T) => Promise<void>;
  remove: () => Promise<void>;
};

export type FirestoreCollectionUpdateOperations = {
  add: <T>(newData: T, customId?: string) => Promise<string>;
  refresh: () => Promise<void>;
};

export type QueryOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: [string, WhereFilterOp, any][];
  orderBy?: [string, OrderByDirection][];
  limit?: number;
};

// Firestoreドキュメントを取得するためのフェッチャー
export const docFetcher = async <T>(docRef: DocumentReference) => {
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error('Document does not exist');
  }
  return snapshot.data() as T;
};

// 複数のドキュメントを取得するためのフェッチャー
export const docsFetcher = async <T>(
  collectionPath: string,
  ids: string[]
): Promise<T[]> => {
  if (!ids.length) return [];
  if (isServer()) return [];

  const { db } = getFirebase();
  if (!db) return [];

  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, where(documentId(), 'in', ids));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
};

// IDの順序を維持しながらドキュメントをソートする
export const sortDocsByIds = <T extends { id: string }>(
  docs: T[],
  ids: string[]
): T[] => {
  return ids
    .map(id => docs.find(doc => doc.id === id))
    .filter((doc): doc is T => doc !== undefined);
};

// Firestoreコレクションを取得するためのフェッチャー
const collectionFetcher = async <T>(queryRef: CollectionReference<DocumentData> | Query<DocumentData>) => {
  const snapshot = await getDocs(queryRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (T & { id: string })[];
};

// 単一ドキュメントを取得するためのフック
export function useFirestoreDoc<T>(path: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    path && !isServer() ? ['doc', path] : null,
    path ? async () => {
      const { db } = getFirebase();
      if (!db) return undefined;
      return docFetcher<T>(doc(db, path));
    } : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// コレクションを取得するためのフック
export function useFirestoreCollection<T>(
  path: string | null | undefined,
  options?: QueryOptions
) {
  const { data, error, isLoading } = useSWR(
    path && !isServer() ? ['collection', path, options] : null,
    path ? async () => {
      const { db } = getFirebase();
      if (!db) return [];

      const collectionRef = collection(db, path) as CollectionReference<DocumentData>;
      let queryRef: Query<DocumentData> = collectionRef;

      if (options) {
        const constraints = [];

        // 条件の追加
        if (options.conditions) {
          for (const [field, op, value] of options.conditions) {
            constraints.push(where(field, op, value));
          }
        }

        // ソート順の追加
        if (options.orderBy) {
          for (const [field, direction] of options.orderBy) {
            constraints.push(orderBy(field, direction));
          }
        }

        // 件数制限の追加
        if (options.limit) {
          constraints.push(firestoreLimit(options.limit));
        }

        queryRef = query(collectionRef, ...constraints);
      }

      return collectionFetcher<T>(queryRef);
    } : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}

// Firestoreドキュメントの更新用フック
export function useFirestoreUpdate(path: string) {
  if (isServer()) {
    return {
      update: async () => { },
      set: async () => { },
      remove: async () => { },
    };
  }

  const { db } = getFirebase();
  if (!db) {
    return {
      update: async () => { },
      set: async () => { },
      remove: async () => { },
    };
  }

  const docRef = doc(db, path);

  return {
    // データの更新
    update: async <T>(newData: Partial<T>) => {
      try {
        await updateDoc(docRef, newData as DocumentData);
        await mutate(['doc', path]);
      } catch (err) {
        console.error('Error updating document:', err);
        throw err;
      }
    },
    // データの置き換え
    set: async <T>(newData: T) => {
      try {
        await setDoc(docRef, newData as DocumentData);
        await mutate(['doc', path]);
      } catch (err) {
        console.error('Error setting document:', err);
        throw err;
      }
    },
    // ドキュメントの削除
    remove: async () => {
      try {
        await deleteDoc(docRef);
        await mutate(['doc', path], null);
      } catch (err) {
        console.error('Error deleting document:', err);
        throw err;
      }
    },
  };
}

// Firestoreコレクションの更新用フック
export function useFirestoreCollectionUpdate(path: string) {
  if (isServer()) {
    return {
      add: async () => '',
      refresh: async () => { },
    };
  }

  const { db } = getFirebase();
  if (!db) {
    return {
      add: async () => '',
      refresh: async () => { },
    };
  }

  const collectionRef = collection(db, path);

  return {
    // 新規ドキュメントの追加
    add: async <T>(newData: T, customId?: string) => {
      try {
        const newDocRef = customId
          ? doc(collectionRef, customId)
          : doc(collectionRef);
        await setDoc(newDocRef, newData as DocumentData);
        await mutate(['collection', path]);
        return newDocRef.id;
      } catch (err) {
        console.error('Error adding document:', err);
        throw err;
      }
    },
    // コレクションの再取得
    refresh: () => mutate(['collection', path]),
  };
}
