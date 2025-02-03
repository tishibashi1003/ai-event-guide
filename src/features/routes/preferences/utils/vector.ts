import { EventInteractionHistory } from "@/types/firestoreDocument";
import { VectorValue } from "firebase/firestore";

export const generateUserProfileVector = (histories: EventInteractionHistory[]): number[] => {
  const likeHistory = histories.filter((history) => history.action === 'like');
  // イベントベクトルの重み付き平均を計算
  const weightedVectors = likeHistory.map((history, index) => {
    let weight = 0;
    switch (history.action) {
      case 'view':
        weight = 1 / (index + 1) * 1.0; // dislike は少し低めの重み
        break;
      case 'like':
        weight = 1 / (index + 1) * 1.2; // like は少し高めの重み
        break;
      case 'kokoiku':
        weight = 1 / (index + 1) * 1.5; // kokoikku は高めの重み
        break;
    }
    const vectorArray = history.eventVector as unknown as VectorValue;
    return vectorArray.toArray().map((v: number) => v * weight);
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
