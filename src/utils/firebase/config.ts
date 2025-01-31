import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';


// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require('../../../credentials.firebase.json');

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(serviceAccount) : getApps()[0];
export const auth = getAuth(app);
