# Firestore データベース設計

## コレクション構成

### users（ユーザー情報）

```typescript
interface User {
  uid: string; // Firebase Auth UID
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
}
```

### swiped_events（スワイプしたイベント情報）

```typescript
interface SwipedEvent {
  id: string; // Firestore Auto ID
  eventSourceId: string; // 元イベントのソース ID
  userId: string; // スワイプしたユーザー ID
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
  interactionType: 'like' | 'dislike' | 'save'; // 相互作用タイプ
  createdAt: Timestamp; // 作成日時
}
```

### saved_events（保存済みイベント）

```typescript
interface SavedEvent {
  id: string; // Firestore Auto ID
  userId: string; // ユーザー ID
  eventId: string; // イベント ID
  saveType: 'save' | 'kokoniiku'; // 保存タイプ
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
}
```

### user_preferences（ユーザー設定）

```typescript
interface UserPreference {
  id: string; // Firestore Auto ID
  userId: string; // ユーザー ID
  preferredCategories: string[]; // 好みのカテゴリ
  postalCode: string; // 郵便番号
  prefecture: string; // 都道府県
  city: string; // 市区町村
  pricePreference: string; // 価格帯の設定
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
}
```

### user_preference_vectors（ユーザーの好みベクトル）

```typescript
interface UserPreferenceVector {
  id: string; // Firestore Auto ID
  userId: string; // ユーザー ID
  preferenceVector: number[]; // ユーザーの好み（最大2,048次元）
  createdAt: Timestamp; // 作成日時
  updatedAt: Timestamp; // 更新日時
}
```

## インデックス設定

### ベクトル検索インデックス

```typescript
// swiped_events コレクションのベクトル検索インデックス
{
  collectionGroup: "swiped_events",
  queryScope: "COLLECTION",
  fields: [
    {
      fieldPath: "embeddingVector",
      dimensions: 1536,
      vectorSearchConfiguration: "vector-search-config"
    }
  ]
}

// user_preference_vectors コレクションのベクトル検索インデックス
{
  collectionGroup: "user_preference_vectors",
  queryScope: "COLLECTION",
  fields: [
    {
      fieldPath: "preferenceVector",
      dimensions: 1536,
      vectorSearchConfiguration: "vector-search-config"
    }
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
    }

    // スワイプしたイベント
    match /swiped_events/{eventId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // 保存済みイベント
    match /saved_events/{savedId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // ユーザー設定
    match /user_preferences/{prefId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow write: if isAuthenticated() && isOwner(request.resource.data.userId);
    }

    // ユーザーの好みベクトル
    match /user_preference_vectors/{vectorId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow write: if isAuthenticated() && isOwner(request.resource.data.userId);
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
   - 保存済みイベントの日付順表示
   - 過去のイベント履歴の参照

4. 所要時間情報
   - 現在地からの車での所要時間を保存
   - 将来的に公共交通機関の所要時間も追加予定
