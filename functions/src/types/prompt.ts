import { z } from "zod";

/**
 * 検索結果として返されるイベント情報の Zod スキーマ
 */
export const OutputEventSchema = z.object({
  /** イベントのタイトル */
  eventTitleJa: z.string(),
  eventTitleEn: z.string(),
  /** イベントの詳細説明 */
  eventDescriptionJa: z.string(),
  eventDescriptionEn: z.string(),
  /** イベントの日時（YYYY-MM-DD HH:mm:ss形式） */
  eventDateYYYYMMDD: z.string(),
  /** イベントの開催場所名 */
  eventLocationNameJa: z.string(),
  eventLocationNameEn: z.string(),
  /** イベントの開催場所の市区町村 */
  eventLocationCityJa: z.string(),
  eventLocationCityEn: z.string(),
  /** イベントのURL */
  eventSourceUrl: z.string(),
  /** イベントのアイコン */
  eventEmoji: z.string(),
  /** イベントのカテゴリー */
  eventCategoryEn: z.string(),
});

/**
 * 検索結果として返されるイベント情報の型
 */
export type OutputEvent = z.infer<typeof OutputEventSchema>;

export const AddressSchema = z.object({
  prefecture: z.string(),
  // city: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
