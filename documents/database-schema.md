# データベーススキーマ設計

## テーブル構成

### users（ユーザー情報）

| カラム名     | 型           | 説明             |
| ------------ | ------------ | ---------------- |
| id           | UUID         | プライマリーキー |
| firebase_uid | VARCHAR(128) | Firebase 認証 ID |
| display_name | VARCHAR(100) | 表示名           |
| email        | VARCHAR(255) | メールアドレス   |
| created_at   | TIMESTAMP    | 作成日時         |
| updated_at   | TIMESTAMP    | 更新日時         |
| last_login   | TIMESTAMP    | 最終ログイン日時 |

### swiped_events（スワイプしたイベント情報）

| カラム名         | 型           | 説明                                |
| ---------------- | ------------ | ----------------------------------- |
| id               | UUID         | プライマリーキー                    |
| event_source_id  | VARCHAR(255) | 元イベントのソース ID               |
| user_id          | UUID         | スワイプしたユーザー ID             |
| title            | VARCHAR(255) | イベントタイトル                    |
| description      | TEXT         | イベント説明                        |
| start_date       | TIMESTAMP    | 開始日時                            |
| end_date         | TIMESTAMP    | 終了日時                            |
| address          | VARCHAR(255) | 開催場所の住所                      |
| travel_time_car  | INTEGER      | 車での所要時間（分）                |
| image_url        | VARCHAR(255) | イベント画像 URL                    |
| category         | VARCHAR(50)  | カテゴリ                            |
| target_age       | VARCHAR(50)  | 対象年齢層                          |
| price_range      | VARCHAR(50)  | 価格帯                              |
| embedding_vector | VECTOR(1536) | イベントの特徴ベクトル              |
| interaction_type | VARCHAR(20)  | 相互作用タイプ（like/dislike/save） |
| created_at       | TIMESTAMP    | 作成日時                            |

### saved_events（保存済みイベント）

| カラム名   | 型          | 説明                         |
| ---------- | ----------- | ---------------------------- |
| id         | UUID        | プライマリーキー             |
| user_id    | UUID        | ユーザー ID                  |
| event_id   | UUID        | イベント ID                  |
| save_type  | VARCHAR(20) | 保存タイプ（save/kokoniiku） |
| created_at | TIMESTAMP   | 作成日時                     |
| updated_at | TIMESTAMP   | 更新日時                     |

### user_preferences（ユーザー設定）

| カラム名             | 型          | 説明                    |
| -------------------- | ----------- | ----------------------- |
| id                   | UUID        | プライマリーキー        |
| user_id              | UUID        | ユーザー ID（外部キー） |
| preferred_categories | TEXT[]      | 好みのカテゴリ          |
| postal_code          | VARCHAR(8)  | 郵便番号                |
| prefecture           | VARCHAR(20) | 都道府県                |
| city                 | VARCHAR(50) | 市区町村                |
| price_preference     | VARCHAR(50) | 価格帯の設定            |
| created_at           | TIMESTAMP   | 作成日時                |
| updated_at           | TIMESTAMP   | 更新日時                |

### user_preference_vectors（ユーザーの好みベクトル）

| カラム名          | 型           | 説明                               |
| ----------------- | ------------ | ---------------------------------- |
| id                | UUID         | プライマリーキー                   |
| user_id           | UUID         | ユーザー ID（外部キー）            |
| preference_vector | VECTOR(1536) | ユーザーの好み（埋め込みベクトル） |
| created_at        | TIMESTAMP    | 作成日時                           |
| updated_at        | TIMESTAMP    | 更新日時                           |

## インデックス

### users

- firebase_uid（UNIQUE）
- email（UNIQUE）

### swiped_events

- user_id
- event_source_id
- start_date
- embedding_vector USING ivfflat (vector_cosine_ops)

### saved_events

- user_id, event_id（複合インデックス）
- save_type

### user_preference_vectors

- user_id（UNIQUE）
- preference_vector USING ivfflat (vector_cosine_ops)

## 外部キー制約

1. swiped_events.user_id → users.id
2. saved_events.user_id → users.id
3. saved_events.event_id → swiped_events.id
4. user_preferences.user_id → users.id
5. user_preference_vectors.user_id → users.id

## 注意事項

1. VECTOR タイプのカラムは、Firebase Data Connect の PostgreSQL で提供されるベクトル検索機能を利用します
2. タイムスタンプは自動的に更新されるように設定します
3. UUID は自動生成されるように設定します
4. イベント情報は基本的に Vertex AI Studio と Genkit を使用してリアルタイムに取得し、スワイプしたイベントのみをデータベースに保存します
5. 周辺施設情報（お子様ランチ、授乳室、おむつ替え等）も Vertex AI Studio と Genkit を使用してリアルタイムに取得します
6. レコメンデーションスコアは以下の計算式で算出されます：
   - コサイン類似度（ベクトル類似度）の重み: 0.7
   - カテゴリマッチの重み: 0.3
   - 直近 30 日間のいいねしたカテゴリを考慮
7. イベントの開始日時・終了日時は保存し、以下の用途で使用します：
   - 保存済みイベントの日付順表示
   - 過去のイベント履歴の参照
   - イベントの有効期限管理
8. 所要時間は現在地からの車での所要時間を想定していますが、将来的に公共交通機関の所要時間も追加することを検討します

## Row Level Security (RLS) 設定

### 1. RLS の有効化

```sql
-- 全テーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swiped_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preference_vectors ENABLE ROW LEVEL SECURITY;
```

### 2. ポリシーの設定

```sql
-- usersテーブルのポリシー
CREATE POLICY users_self_access ON users
  FOR ALL
  USING (firebase_uid = current_user);

-- swiped_eventsテーブルのポリシー
CREATE POLICY swiped_events_self_access ON swiped_events
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

CREATE POLICY swiped_events_self_insert ON swiped_events
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

CREATE POLICY swiped_events_self_update ON swiped_events
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

-- saved_eventsテーブルのポリシー
CREATE POLICY saved_events_self_access ON saved_events
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

CREATE POLICY saved_events_self_insert ON saved_events
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

CREATE POLICY saved_events_self_delete ON saved_events
  FOR DELETE
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

-- user_preference_vectorsテーブルのポリシー
CREATE POLICY vectors_self_access ON user_preference_vectors
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));

CREATE POLICY vectors_self_update ON user_preference_vectors
  FOR UPDATE
  USING (user_id IN (
    SELECT id FROM users
    WHERE firebase_uid = current_user
  ));
```

### 3. 管理者アクセス用ポリシー

```sql
-- 管理者ロールの作成
CREATE ROLE app_admin;

-- 管理者用のバイパスポリシー（読み取りのみ）
CREATE POLICY admin_read_access ON users
  FOR SELECT
  USING (current_user = 'app_admin');

CREATE POLICY admin_read_access ON swiped_events
  FOR SELECT
  USING (current_user = 'app_admin');

CREATE POLICY admin_read_access ON saved_events
  FOR SELECT
  USING (current_user = 'app_admin');

CREATE POLICY admin_read_access ON user_preference_vectors
  FOR SELECT
  USING (current_user = 'app_admin');
```

### 4. アプリケーションサービスアカウント用ポリシー

```sql
-- アプリケーションサービス用ロール
CREATE ROLE app_service;

-- イベント収集用のポリシー（バッチ処理用）
CREATE POLICY service_events_batch ON swiped_events
  FOR INSERT
  WITH CHECK (current_user = 'app_service');

-- ベクトル更新用のポリシー（AI処理用）
CREATE POLICY service_vectors_batch ON user_preference_vectors
  FOR UPDATE
  USING (current_user = 'app_service');
```
