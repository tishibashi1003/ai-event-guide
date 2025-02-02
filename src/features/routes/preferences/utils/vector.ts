import { EventInteractionHistory } from "@/types/firestoreDocument";

export const generateUserProfileVector = (histories: EventInteractionHistory[]): number[] => {
  // 直近のN件の履歴を取得
  const recentHistories = histories
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
    .slice(0, 10);

  // イベントベクトルの重み付き平均を計算
  // より最近の閲覧履歴と行動の種類によって重みを設定
  const weightedVectors = recentHistories.map((history, index) => {
    let weight = 0;
    switch (history.action) {
      case 'like':
        weight = 1 / (index + 1) * 1.2; // like は少し高めの重み
        break;
      case 'dislike':
        weight = 1 / (index + 1) * 0.8; // dislike は少し低めの重み
        break;
      case 'kokoikku':
        weight = 1 / (index + 1) * 1.5; // kokoikku は高めの重み
        break;
    }
    return history.eventVector.map((v: number) => v * weight);
  })

  // ベクトルの平均を計算
  if (weightedVectors.length === 0) {
    console.warn('No weighted vectors to average.');
    return Array(768).fill(0); // ゼロベクトルを返す
  }
  return weightedVectors[0].map((_: number, i: number) =>
    weightedVectors.reduce((sum, vec) => sum + vec[i], 0) / weightedVectors.length
  );
}
