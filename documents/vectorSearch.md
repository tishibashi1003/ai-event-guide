はい、承知いたしました。重み付けロジックを `like`, `dislike`, `share` の行動の種類によって変更し、その他は変更せずに手順書を再作成します。

---

# 実行結果報告（改訂版）

## 概要

ユーザーのイベント閲覧傾向に基づく類似度検索の実装について、具体的な手順を提案いたします。

## 実装ステップ

1.  **ユーザーの閲覧履歴の収集**

    ```typescript:functions/src/types/userEventHistory.ts
    type UserEventHistory = {
      userId: string;
      eventId: string;
      action: 'like' | 'dislike' | 'share';
      timestamp: Timestamp;
    };
    ```

2.  **ユーザープロファイルベクトルの生成**

    ```typescript:functions/src/utils/userVector.ts
    async function generateUserProfileVector(histories: UserEventHistory[]): Promise<number[]> {
      // 直近のN件の履歴を取得
      const recentHistories = histories
        .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
        .slice(0, 10);

      // イベントベクトルの重み付き平均を計算
      // より最近の閲覧履歴と行動の種類によって重みを設定
      const weightedVectors = await Promise.all(
        recentHistories.map(async (history, index) => {
          let weight = 0;
          switch (history.action) {
            case 'like':
              weight = 1 / (index + 1) * 1.2; // like は少し高めの重み
              break;
            case 'dislike':
              weight = 1 / (index + 1) * 0.8; // dislike は少し低めの重み
              break;
            case 'share':
              weight = 1 / (index + 1) * 1.5; // share は高めの重み
              break;
          }

          const eventDoc = await db.collection('events').doc(history.eventId).get();
          const eventVector = eventDoc.data()?.eventVector;
            if (!eventVector) {
                console.error(`Event vector not found for event ID: ${history.eventId}`);
                return Array(768).fill(0); // デフォルトのゼロベクトルで代替
            }
          return eventVector.map((v: number) => v * weight);
        })
      );

       // ベクトルの平均を計算
      if (weightedVectors.length === 0) {
            console.warn('No weighted vectors to average.');
            return Array(768).fill(0); // ゼロベクトルを返す
      }
      return weightedVectors[0].map((_: number, i: number) =>
        weightedVectors.reduce((sum, vec) => sum + vec[i], 0) / weightedVectors.length
      );
    }
    ```

3.  **類似度検索の実装**

    ```typescript:functions/src/utils/similarEvents.ts
    async function findSimilarEvents(userVector: number[], limit: number = 10) {
      const eventsRef = db.collection('events');

      return await eventsRef
        .select('*')
        .where('eventStartDate', '>', Timestamp.now())
        .orderBy('eventStartDate')
        .vectorSearch({
          vector: userVector,
          field: 'eventVector',
          namespace: 'events',
          distance: 'COSINE',
          maxResults: limit
        });
    }
    ```

4.  **API エンドポイントの実装**

    ```typescript:functions/src/index.ts
    exports.getPersonalizedEvents = onCall(async (request) => {
      const { userId } = request.data;

      // ユーザーの閲覧履歴を取得
      const histories = await db
        .collection('userEventHistories')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      // ユーザープロファイルベクトルを生成
      const userVector = await generateUserProfileVector(
        histories.docs.map(doc => doc.data() as UserEventHistory)
      );

      // 類似イベントを検索
      const similarEvents = await findSimilarEvents(userVector);

      return {
        events: similarEvents.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    });
    ```

## 注意点・改善提案

1.  **パフォーマンスの最適化**

    - ユーザープロファイルベクトルをキャッシュして定期的に更新
    - 閲覧履歴の重み付けロジックの調整

2.  **データ構造の設計**

    - イベントベクトルのインデックス作成
      ```typescript
      await db
        .collection('events')
        .doc('vector-search')
        .create({
          indexes: [
            {
              name: 'events_vector',
              dimensions: 768, // text-embedding-004の次元数
              metric: 'COSINE',
            },
          ],
        });
      ```

3.  **セキュリティルール**
    ```typescript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /userEventHistories/{document} {
          allow read: if request.auth.uid == resource.data.userId;
          allow write: if request.auth.uid == request.resource.data.userId;
        }
      }
    }
    ```

## 実装の流れ

1.  まず`userEventHistories`コレクションを作成し、ユーザーの閲覧履歴を記録
2.  ユーザープロファイルベクトルの生成ロジックを実装
3.  Firestore のベクトル検索インデックスを設定
4.  類似度検索 API を実装
5.  フロントエンドからの呼び出しを実装

これにより、ユーザーの興味に基づいたパーソナライズされたイベント推薦が可能になります。

---

## 変更点

- `UserEventHistory` の `action` の型を `'like' | 'dislike' | 'share'` に変更しました。
- `generateUserProfileVector` 関数内で、`action` の種類に応じて重みを調整するように変更しました。
  - `like` は `1 / (index + 1) * 1.2`
  - `dislike` は `1 / (index + 1) * 0.8`
  - `share` は `1 / (index + 1) * 1.5`
- イベントベクトルが存在しない場合に、ログ出力とデフォルトのゼロベクトルを返すようにしました。
- `weightedVectors` が空の場合に、ログ出力とデフォルトのゼロベクトルを返すようにしました。

---

## 注意点

- 重み付けの数値は調整可能です。必要に応じて変更してください。
- イベントベクトルが存在しない場合の処理は、必要に応じて変更してください。
- キャッシュ戦略やエラーハンドリングの実装は、別途検討してください。

---
