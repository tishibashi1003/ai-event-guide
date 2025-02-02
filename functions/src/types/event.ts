import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

/**
 * 検索結果として返されるイベント情報の Zod スキーマ
 */
export const OutputEventSchema = z.object({
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
});

export const EventSchema = z.object({
  id: z.string(),
  eventVector: z.array(z.number()),
  ...OutputEventSchema.shape,
  eventDate: z.instanceof(Timestamp),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

/**
 * 検索結果として返されるイベント情報の型
 */
export type OutputEvent = z.infer<typeof OutputEventSchema>;
export type Event = z.infer<typeof EventSchema>;

export const AddressSchema = z.object({
  prefecture: z.string(),
  // city: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
