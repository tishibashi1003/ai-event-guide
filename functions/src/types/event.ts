import { z } from "zod";

/**
 * イベントの料金情報を表す Zod スキーマ
 */
export const PriceInfoSchema = z.object({
  /** 大人料金（円） */
  adult: z.number(),
  /** 子供料金（円） */
  child: z.number(),
});

/**
 * 検索結果として返されるイベント情報の Zod スキーマ
 */
export const OutputEventSchema = z.object({
  /** イベントのタイトル */
  eventTitle: z.string(),
  /** イベントの詳細説明 */
  eventDescription: z.string(),
  /** イベントの開始日時（YYYY-MM-DD HH:mm:ss形式） */
  eventStartDate: z.string(),
  /** イベントの終了日時（YYYY-MM-DD HH:mm:ss形式） */
  eventEndDate: z.string(),
  /** イベントの開催場所名 */
  locationName: z.string(),
  /** イベントの年齢制限（例: "18歳以上", "制限なし"など） */
  ageRestriction: z.string(),
  /** イベントの料金情報 */
  priceInfo: PriceInfoSchema,
  /** イベントのURL */
  sourceUrl: z.string(),
  /** イベントのアイコン */
  eventEmoji: z.string(),
  /** イベントのカテゴリー */
  eventCategory: z.string(),
});

/**
 * 検索結果として返されるイベント情報の型
 */
export type OutputEvent = z.infer<typeof OutputEventSchema>;

export const AddressSchema = z.object({
  prefecture: z.string(),
  city: z.string(),
});

export type Address = z.infer<typeof AddressSchema>;
