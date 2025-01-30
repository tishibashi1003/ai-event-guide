export interface UserPreference {
  id: string;
  userId: string;
  preferred_categories: string[];
  postal_code?: string;
  prefecture?: string;
  city?: string;
  price_preference?: string;
  preference_vector?: number[];
  created_at: Date;
  updated_at: Date;
}
