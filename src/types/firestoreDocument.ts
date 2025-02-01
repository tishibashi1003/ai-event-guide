import { Timestamp } from 'firebase/firestore';

export type User = {
  uid: string;
  preferenceVector: number[];
  preferredCategories: string[];
  postalCode: string;
  prefecture: string;
  city: string;
  pricePreference: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastVectorUpdateAt: Timestamp;
}
