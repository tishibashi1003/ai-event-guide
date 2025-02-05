import { Timestamp } from "firebase-admin/firestore";

/**
 * YYYYMMDDまたはYYYY-MM-DDフォーマットの文字列をFirestore Timestampに変換する
 * @param dateStr YYYYMMDD形式の文字列 (例: "20240215") または YYYY-MM-DD形式の文字列 (例: "2024-02-15")
 * @returns Firestore Timestamp
 */
export const convertYYYYMMDDToTimestamp = (dateStr: string): Timestamp => {
  // ハイフンを削除して8桁の数字文字列に正規化
  const normalizedDateStr = dateStr.replace(/-/g, '');

  if (normalizedDateStr.length !== 8) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYYMMDD or YYYY-MM-DD`);
  }

  const year = parseInt(normalizedDateStr.substring(0, 4));
  const month = parseInt(normalizedDateStr.substring(4, 6)) - 1; // JavaScriptの月は0-11
  const day = parseInt(normalizedDateStr.substring(6, 8));

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components: year=${year}, month=${month + 1}, day=${day}`);
  }

  const date = new Date(year, month, day);

  // 日付の妥当性チェック
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return Timestamp.fromDate(date);
};
