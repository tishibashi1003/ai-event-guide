# Firestore データベース設計

## コレクション階層構造

```
firestore/
├── users/                    # ルートコレクション: ユーザー情報
│   ├── {userId}/            # ユーザードキュメント（設定と好みベクトルを含む）
│   │   └── interactions/    # サブコレクション: ユーザーのイベント操作履歴
│   │       └── {interactionId}/
└── events/                  # ルートコレクション: イベント情報
    └── {eventId}/
```

### 階層構造の説明

1. **users コレクション**

   - ユーザー情報を管理するルートコレクション
   - ユーザードキュメントに設定と好みベクトルを含む
   - イベント操作履歴をサブコレクションとして管理

2. **interactions サブコレクション**

   - ユーザーのイベントに対する操作履歴を保存
   - like/dislike/save/kokoniiku などの操作を記録
   - 時系列での分析や推薦システムの学習に使用

3. **events コレクション**
   - グラウンディングで取得した全イベント情報を保存
   - ベクトル検索に対応したインデックスを持つ
   - バッチ処理による一括更新を前提とした設計

### クエリパターン

1. **イベント推薦時**

```typescript
// 1. ユーザー情報（好みベクトル含む）を取得
const userDoc = await db.collection('users').doc(userId).get();

// 2. ベクトル検索でイベントを取得
const events = await db
  .collection('events')
  .where('status', '==', 'active')
  .findNearest({
    vectorField: 'embeddingVector',
    queryVector: userDoc.data().preferenceVector,
  })
  .get();
```

2. **ユーザー操作履歴の取得**

```typescript
// 直近の操作履歴を取得
const interactions = await db
  .collection('users')
  .doc(userId)
  .collection('interactions')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();
```

## コレクション構成

### users（ユーザー情報）

```typescript
interface User {
  uid: string; // Firebase Auth UID
  preferenceVector: number[]; // ユーザーの好み（最大2,048次元）
  // ユーザー設定
  preferredCategories: string[]; // 好みのカテゴリ
  postalCode: string; // 郵便番号
  prefecture: string; // 都道府県
  city: string; // 市区町村
  pricePreference: string; // 価格帯の設定
  // タイムスタンプ
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
  lastVectorUpdateAt: Timestamp; // 好みベクトル最終更新日時
}
```

### events（イベント情報）

```typescript
interface Event {
  id: string; // Firestore Auto ID
  eventSourceId: string; // 元イベントのソース ID（グラウンディング元での ID）
  title: string; // イベントタイトル
  description: string; // イベント説明
  startDate: Timestamp; // 開始日時
  endDate: Timestamp; // 終了日時
  address: string; // 開催場所の住所
  travelTimeCar: number; // 車での所要時間（分）
  imageUrl: string; // イベント画像 URL
  category: string; // カテゴリ
  targetAge: string; // 対象年齢層
  priceRange: string; // 価格帯
  embeddingVector: number[]; // イベントの特徴ベクトル（最大2,048次元）
  status: 'active' | 'ended' | 'cancelled'; // イベントのステータス
  source: string; // データソース（例: 'jalan', 'asoview' など）
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
}
```

### user_interactions（ユーザーのイベント操作履歴）

```typescript
interface UserInteraction {
  id: string; // Firestore Auto ID
  userId: string; // ユーザー ID
  eventId: string; // イベント ID
  interactionType: 'like' | 'dislike' | 'save' | 'kokoniiku'; // 操作タイプ
  createdAt: Timestamp; // 作成日時
}
```

## インデックス設定

### ベクトル検索インデックス

```typescript
// events コレクションのベクトル検索インデックス
{
  collectionGroup: "events",
  queryScope: "COLLECTION",
  fields: [
    {
      fieldPath: "embeddingVector",
      dimensions: 1536,
      vectorSearchConfiguration: "vector-search-config"
    }
  ]
}
```

### 複合インデックス

```typescript
// イベント検索用インデックス
{
  collectionGroup: "events",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "startDate", order: "ASCENDING" }
  ]
}

// ユーザー操作履歴用インデックス
{
  collectionGroup: "user_interactions",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "interactionType", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}
```

## セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー認証のヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }

    // 自分のデータかどうかをチェック
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // ユーザー情報
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);

      // ユーザー操作履歴
      match /interactions/{interactionId} {
        allow read: if isAuthenticated() && isOwner(userId);
        allow create: if isAuthenticated() && isOwner(userId);
        allow delete: if isAuthenticated() && isOwner(userId);
      }
    }

    // イベント情報
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if false; // バッチ処理からのみ書き込み可能
    }
  }
}
```

## 注意事項

1. ベクトル検索の制限

   - 最大ベクトル次元数: 2,048
   - クエリ結果の最大件数: 1,000
   - リアルタイムスナップショットリスナーは非サポート

2. レコメンデーションスコアの計算

   - コサイン類似度（ベクトル類似度）の重み: 0.7
   - カテゴリマッチの重み: 0.3
   - 直近 30 日間のいいねしたカテゴリを考慮

3. イベントの有効期限管理

   - 開始日時・終了日時を使用
   - 終了したイベントは status を 'ended' に更新
   - 過去のイベント履歴は分析用に保持

4. 所要時間情報
   - 現在地からの車での所要時間を保存
   - 将来的に公共交通機関の所要時間も追加予定
