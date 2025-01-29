# データベーススキーマ設計

## テーブル構成

### users（ユーザー情報）

| カラム名          | 型           | 説明                               |
| ----------------- | ------------ | ---------------------------------- |
| id                | UUID         | プライマリーキー                   |
| firebase_uid      | VARCHAR(128) | Firebase 認証 ID                   |
| display_name      | VARCHAR(100) | 表示名                             |
| email             | VARCHAR(255) | メールアドレス                     |
| created_at        | TIMESTAMP    | 作成日時                           |
| updated_at        | TIMESTAMP    | 更新日時                           |
| preference_vector | VECTOR(1536) | ユーザーの好み（埋め込みベクトル） |
| last_login        | TIMESTAMP    | 最終ログイン日時                   |

### swiped_events（スワイプしたイベント情報）

| カラム名         | 型           | 説明                                |
| ---------------- | ------------ | ----------------------------------- |
| id               | UUID         | プライマリーキー                    |
| event_source_id  | VARCHAR(255) | 元イベントのソース ID               |
| user_id          | UUID         | スワイプしたユーザー ID             |
| title            | VARCHAR(255) | イベントタイトル                    |
| description      | TEXT         | イベント説明                        |
| start_date       | DATE         | 開始日                              |
| end_date         | DATE         | 終了日                              |
| location         | VARCHAR(255) | 開催場所                            |
| image_url        | VARCHAR(255) | イベント画像 URL                    |
| category         | VARCHAR(50)  | カテゴリ                            |
| target_age       | VARCHAR(50)  | 対象年齢層                          |
| price_range      | VARCHAR(50)  | 価格帯                              |
| embedding_vector | VECTOR(1536) | イベントの特徴ベクトル              |
| interaction_type | VARCHAR(20)  | 相互作用タイプ（like/dislike/save） |
| created_at       | TIMESTAMP    | 作成日時                            |

### user_preferences（ユーザー設定）

| カラム名              | 型          | 説明                    |
| --------------------- | ----------- | ----------------------- |
| id                    | UUID        | プライマリーキー        |
| user_id               | UUID        | ユーザー ID（外部キー） |
| preferred_categories  | JSON        | 好みのカテゴリ          |
| preferred_locations   | JSON        | 好みの場所              |
| price_preference      | VARCHAR(50) | 価格帯の設定            |
| notification_settings | JSON        | 通知設定                |
| created_at            | TIMESTAMP   | 作成日時                |
| updated_at            | TIMESTAMP   | 更新日時                |

## インデックス

### users

- firebase_uid（UNIQUE）
- email（UNIQUE）
- preference_vector（VECTOR）

### swiped_events

- user_id
- event_source_id
- start_date
- embedding_vector（VECTOR）

## 外部キー制約

1. swiped_events.user_id → users.id
2. user_preferences.user_id → users.id

## 注意事項

1. VECTOR タイプのカラムは、Firebase Data Connect の PostgreSQL で提供されるベクトル検索機能を利用します
2. JSON タイプのカラムは、柔軟な設定データの保存に使用します
3. タイムスタンプは自動的に更新されるように設定します
4. UUID は自動生成されるように設定します
5. イベント情報は基本的に Vertex AI Studio と Genkit を使用してリアルタイムに取得し、スワイプしたイベントのみをデータベースに保存します
6. users.preference_vector は以下のように更新されます：
   - 各スワイプ操作直後に即時更新（like は 0.2、dislike は-0.1 の重みで調整）
   - 新規ユーザーの場合は初期設定から初期ベクトルを生成
   - ユーザーによる好みのリセット時に再初期化
   - 常にベクトルを正規化して保存
