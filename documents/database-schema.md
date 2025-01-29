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
- embedding_vector（VECTOR）

### saved_events

- user_id, event_id（複合インデックス）
- save_type

### user_preference_vectors

- user_id（UNIQUE）
- preference_vector（VECTOR）

## 外部キー制約

1. swiped_events.user_id → users.id
2. saved_events.user_id → users.id
3. saved_events.event_id → swiped_events.id
4. user_preferences.user_id → users.id
5. user_preference_vectors.user_id → users.id

## 注意事項

1. VECTOR タイプのカラムは、Firebase Data Connect の PostgreSQL で提供されるベクトル検索機能を利用します
2. JSON タイプのカラムは、柔軟な設定データの保存に使用します
3. タイムスタンプは自動的に更新されるように設定します
4. UUID は自動生成されるように設定します
5. イベント情報は基本的に Vertex AI Studio と Genkit を使用してリアルタイムに取得し、スワイプしたイベントのみをデータベースに保存します
6. 周辺施設情報（お子様ランチ、授乳室、おむつ替え等）も Vertex AI Studio と Genkit を使用してリアルタイムに取得します
7. users.preference_vector は以下のように更新されます：
   - 各スワイプ操作直後に即時更新（like は 0.2、dislike は-0.1 の重みで調整）
   - 新規ユーザーの場合は初期設定から初期ベクトルを生成
   - ユーザーによる好みのリセット時に再初期化
   - 常にベクトルを正規化して保存
8. イベントの開始日時・終了日時は保存し、以下の用途で使用します：
   - 保存済みイベントの日付順表示
   - 過去のイベント履歴の参照
   - イベントの有効期限管理
9. 所要時間は現在地からの車での所要時間を想定していますが、将来的に公共交通機関の所要時間も追加することを検討します
10. カテゴリの重み付けは以下の方法で動的に計算します：
    - swiped_events テーブルの interaction_type（like/dislike/save）を基に算出
    - 直近 30 日間のユーザーの行動履歴から重み付けを計算
    - カテゴリごとの重みはレコメンデーションエンジンで使用
