import { User } from 'firebase/auth';

export type AuthUser = User | null;

export type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};
