/**
 * 日付を「YYYY年MM月DD日」形式にフォーマットする
 * @param date フォーマットする日付
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
