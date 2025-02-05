import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';


// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require('../../../credentials.firebase.json');

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(serviceAccount) : getApps()[0];
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
});

// App Checkの初期化
// 開発環境の場合はデバッグトークンを有効化
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error FIREBASE_APPCHECK_DEBUG_TOKENはグローバルに定義されていない
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_DEBUG_TOKEN;
}

// reCAPTCHA Enterpriseの初期化
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY!),
  isTokenAutoRefreshEnabled: true
});
