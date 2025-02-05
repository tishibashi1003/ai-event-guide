'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// SSRチェック
const isServer = () => typeof window === 'undefined';

// SSR時のダミーインスタンス
const dummyInstance = {
  app: null,
  auth: null,
  db: null,
  appCheck: null,
};

class FirebaseClient {
  private static instance: FirebaseClient;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private appCheck: AppCheck | null = null;
  private initialized = false;

  private constructor() {
    // プライベートコンストラクタ
  }

  public static getInstance(): FirebaseClient {
    if (!FirebaseClient.instance) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  public getFirebase() {
    // SSRの場合はダミーインスタンスを返す
    if (isServer()) {
      return dummyInstance;
    }

    // 初期化されていない場合は初期化を試みる
    if (!this.initialized) {
      try {
        this.initialize();
      } catch (error) {
        console.error('Firebase initialization error:', error);
        return dummyInstance;
      }
    }

    return {
      app: this.app,
      auth: this.auth,
      db: this.db,
      appCheck: this.appCheck,
    };
  }

  private initialize() {
    if (this.initialized) return;

    try {
      // Firebase Appの初期化
      this.app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

      // Authの初期化
      this.auth = getAuth(this.app);

      // Firestoreの初期化
      this.db = initializeFirestore(this.app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      });

      // App Checkの初期化（必要な場合のみ）
      if (process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY) {
        if (process.env.NODE_ENV === 'development') {
          // @ts-expect-error FIREBASE_APPCHECK_DEBUG_TOKENはグローバルに定義されていない
          window.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_DEBUG_TOKEN;
        }

        this.appCheck = initializeAppCheck(this.app, {
          provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
}

// 型安全なFirebaseインスタンスを取得する関数
export function getFirebase() {
  const instance = FirebaseClient.getInstance().getFirebase();
  return {
    app: instance.app as FirebaseApp,
    auth: instance.auth as Auth,
    db: instance.db as Firestore,
    appCheck: instance.appCheck as AppCheck | null,
  };
}

// 後方互換性のために個別のエクスポートも提供
// SSRの場合はnullを返す
export const app = isServer() ? null : getFirebase().app;
export const auth = isServer() ? null : getFirebase().auth;
export const db = isServer() ? null : getFirebase().db;
export const appCheck = isServer() ? null : getFirebase().appCheck;
