import { Timestamp } from "firebase-admin/firestore";

/**
 * YYYYMMDDフォーマットの文字列をFirestore Timestampに変換する
 * @param dateStr YYYYMMDD形式の文字列 (例: "20240215")
 * @returns Firestore Timestamp
 */
export const convertYYYYMMDDToTimestamp = (dateStr: string): Timestamp => {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // JavaScriptの月は0-11
  const day = parseInt(dateStr.substring(6, 8));

  const date = new Date(year, month, day);
  return Timestamp.fromDate(date);
};
