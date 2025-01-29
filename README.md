## 1. プロジェクト概要

### コンセプト

「まるで魔法のように、スワイプするたびに、ワクワクする週末限定のお出かけ先が目の前に現れる！子連れ家族専属 AI コンシェルジュが、あなたの『好き』を学習し、最高の週末体験をパーソナライズ提案！」

### 目的

週末限定のイベント情報に特化した、パーソナライズされたイベント推薦アプリを開発します。

### 主要機能

- スワイプ式 UI によるイベント探索
- AI によるユーザーの好み学習とパーソナライズされたイベント推薦
- イベント情報のテキスト分析とカテゴリ分類
- ユーザーの過去の行動履歴を基にした好み学習
- Firebase Data Connect を利用したデータ管理とベクトル検索

### 技術スタック

- **フロントエンド**: Next.js (React ベースのフレームワーク)
- **バックエンド**: Firebase Data Connect (Cloud SQL for PostgreSQL ベースの GraphQL API)
- **AI**: Gemini API in Vertex AI (テキスト分析、ベクトル埋め込み、テキスト生成)
- **グラウンディング**: Vertex AI Studio & Genkit (リアルタイムイベント情報収集とデータ変換)
- **認証**: Firebase Authentication
- **ストレージ**: Firebase Cloud Storage
- **その他**: Firebase Cloud Messaging (プッシュ通知)

---

## 2. アーキテクチャ

### フロントエンド (Next.js)

- スワイプ式 UI を実装し、イベントカードを表示します
- ユーザーインターフェース（イベント詳細画面、設定画面、プロフィール画面など）を実装します
- Firebase Data Connect の GraphQL API を利用してユーザー情報の取得と更新を行います
- Vertex AI Studio と Genkit を利用してリアルタイムにイベント情報を取得します

### バックエンド (Firebase Data Connect)

- ユーザー情報、スワイプ済みイベント情報、設定データなどを管理します
- GraphQL API を提供し、Next.js アプリケーションからのクエリを処理します
- ベクトル検索機能を利用して、ユーザーの好みベクトルとイベントの埋め込みベクトルとの類似度を計算します

### グラウンディング (Vertex AI Studio & Genkit)

- Web サイトや API からリアルタイムにイベント情報を収集します
- 収集したイベント情報を Gemini API で利用可能な形に変換します
- ユーザーのスワイプ操作に応じて、新しいイベント情報を動的に取得します

### AI (Gemini API in Vertex AI)

- イベントの説明文やキャプションから、イベントのジャンル、雰囲気、ターゲット層などの特徴を抽出します
- ユーザーの好みベクトル（preference_vector）を以下のように更新します：
  - 各スワイプ操作直後に即時更新（like は正の重み、dislike は負の重みで調整）
  - 新規ユーザーの場合は初期設定から初期ベクトルを生成
  - ユーザーによる明示的なリセット時に再初期化
- ユーザーの好みベクトルとイベントの埋め込みベクトルを比較し、最適なイベントを推薦します
- イベントのキャプションや説明文を生成します

### その他

- Firebase Authentication でユーザー認証を実装します。
- Firebase Cloud Storage でイベントの画像や動画を保存します。
- Firebase Cloud Messaging でプッシュ通知機能を実装します。

---

## 3. 開発計画

### フェーズ 1: 環境構築とデータモデル設計

- Firebase プロジェクトの作成と設定
- Firebase Data Connect のセットアップ
- データベーススキーマの設計（ユーザー情報とスワイプ済みイベント用）
- Vertex AI Studio と Genkit の設定
- Next.js プロジェクトの作成

### フェーズ 2: イベント情報収集システムの構築

- Vertex AI Studio と Genkit を利用したリアルタイムイベント情報収集の実装
- Gemini API を利用したイベント情報のテキスト分析、ベクトル埋め込み
- ユーザーの好みベクトル生成のロジック実装
- スワイプ済みイベント情報の保存機能実装

### フェーズ 3: フロントエンド実装

- Next.js でスワイプ式 UI を実装
- イベント詳細画面、設定画面、プロフィール画面を実装
- Firebase Data Connect の GraphQL API を利用したデータ取得と更新
- ユーザー認証機能の実装
- ローカルデータキャッシュの実装

### フェーズ 4: イベント推薦機能実装

- Gemini API を利用したイベント推薦ロジックの実装
- Data Connect のベクトル検索機能を利用したイベント絞り込み
- ユーザーの評価を基にした推薦精度の向上
- 初回ユーザー向けのランダム表示と人気イベントの表示

### フェーズ 5: テストとデバッグ

- 各機能の動作テスト
- UI/UX の改善
- パフォーマンス最適化

---

## 4. ハッカソンでのアピールポイント

- **Google Cloud のフル活用**: AI プロダクトとコンピュートプロダクトを組み合わせた、実践的なアーキテクチャ
- **パーソナライズ機能**: Gemini API を活用した、高度なイベント推薦機能
- **Next.js の活用**: サーバーサイドレンダリングで高速なフロントエンドを実現
- **Firebase Data Connect**: GraphQL API とベクトル検索による効率的なデータ管理と検索
- **Vertex AI Studio & Genkit**: グラウンディングによる、最新のイベント情報収集とデータ変換
- **ユーザー体験**: スワイプ式 UI とパーソナライズされた推薦による、魅力的なユーザー体験

---

## 5. ハッカソンでの評価ポイント

- **革新性**: 新しい技術やアイデアを取り入れているか
- **実現可能性**: 実用的な機能や実装ができているか
- **完成度**: プロダクトの完成度が高いか
- **UI/UX**: ユーザーインターフェースやユーザー体験が優れているか
- **社会課題解決**: 子育て世代の週末のお出かけ問題を解決できるか

---

## 6. その他

- **初回ユーザーの体験**: オンボーディング、チュートリアル、初期スワイプ回数、フィードバックなどを考慮し、ユーザーがストレスなくアプリを利用できるような設計を心がけます。
- **スケーラビリティ**: 今回は考慮しないが、将来のユーザー数増加にも耐えうるようなアーキテクチャを意識します。

---

## このサマリを基に、チームで協力してハッカソンでの開発を進めていきましょう。
