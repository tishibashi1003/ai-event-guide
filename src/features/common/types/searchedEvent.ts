import { z } from "genkit";

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
export const SearchedEventSchema = z.object({
  /** イベントのタイトル */
  title: z.string(),
  /** イベントの詳細説明 */
  description: z.string(),
  /** イベントの開催日時（YYYY-MM-DD HH:mm:ss形式） */
  event_date: z.string(),
  /** イベントの開催場所名 */
  location_name: z.string(),
  /** イベント会場の緯度 */
  latitude: z.number(),
  /** イベント会場の経度 */
  longitude: z.number(),
  /** イベントの年齢制限（例: "18歳以上", "制限なし"など） */
  age_restriction: z.string(),
  /** イベントの料金情報 */
  price_info: PriceInfoSchema,
});

/**
 * 検索結果として返されるイベント情報の型
 */
export type SearchedEvent = z.infer<typeof SearchedEventSchema>;
