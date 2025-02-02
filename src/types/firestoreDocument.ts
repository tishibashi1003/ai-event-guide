import { Timestamp } from 'firebase/firestore';
import { z } from "zod";

/**
 * 検索結果として返されるイベント情報の Zod スキーマ
 */
export const EventSchema = z.object({
  /** イベントのタイトル */
  eventTitleJa: z.string(),
  /** イベントの詳細説明 */
  eventDescriptionJa: z.string(),
  /** イベントの日時（YYYY-MM-DD HH:mm:ss形式） */
  eventDateYYYYMMDD: z.string(),
  /** イベントの開催場所名 */
  eventLocationNameJa: z.string(),
  /** イベントの開催場所の市区町村 */
  eventLocationCity: z.string(),
  /** イベントのURL */
  eventSourceUrl: z.string(),
  /** イベントのアイコン */
  eventEmoji: z.string(),
  /** イベントのカテゴリー */
  eventCategoryEn: z.string(),
  /** イベントのベクトル表現 */
  eventVector: z.array(z.number()),
});

export const UserSchema = z.object({
  uid: z.string(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
});

export const EventSwipeHistorySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  action: z.enum(['like', 'dislike', 'kokoikku']),
  eventVector: z.array(z.number()),
  timestamp: z.instanceof(Timestamp)
});

export type User = z.infer<typeof UserSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventSwipeHistory = z.infer<typeof EventSwipeHistorySchema>;
