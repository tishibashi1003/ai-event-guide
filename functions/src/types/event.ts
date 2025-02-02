import { z } from "zod";

/**
 * 検索結果として返されるイベント情報の Zod スキーマ
 */
export const OutputEventSchema = z.object({
  /** イベントのタイトル */
  eventTitleJa: z.string(),
  /** イベントの詳細説明 */
  eventDescriptionJa: z.string(),
  /** イベントの開始日時（YYYY-MM-DD HH:mm:ss形式） */
  eventStartDateYYYYMMDD: z.string(),
  /** イベントの終了日時（YYYY-MM-DD HH:mm:ss形式） */
  eventEndDateYYYYMMDD: z.string(),
  /** イベントの開催場所名 */
  eventLocationNameJa: z.string(),
  /** イベントの年齢制限（例: "18歳以上", "制限なし"など） */
  eventAgeRestriction: z.string(),
  /** イベントの料金情報 */
  eventPriceInfoAdult: z.number(),
  eventPriceInfoChild: z.number(),
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
