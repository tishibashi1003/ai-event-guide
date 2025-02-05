## 1. プロジェクト概要

### コンセプト

「AI があなたの好みを学習し、週末のお出かけプランを完全サポート！グラウンディングで収集した最新のイベント情報と、AI プランニング機能で、子育て世代の週末をもっと楽しく、もっと便利に！」

### 目的

子育て世代向けに、AI を活用したパーソナライズされたイベント推薦と、きめ細かな外出プランニングを提供するアプリを開発します。

### 主要機能

1. **ユーザー体験**

   - LP からのスムーズな Google 認証
   - 初回ログイン時の好みイベント設定
   - 好みに基づくパーソナライズされたイベント表示

2. **イベント表示**

   - 今週のイベント一覧表示
   - 今後開催予定のイベント表示
   - AI による好み分析とベクトル類似検索
   - グラウンディングによる最新イベント情報の自動収集
   - イベントクリック分析による興味関心データの収集

3. **AI プランニング機能**
   - イベント会場までのルート提案
   - 周辺ランチスポットの推薦
   - 子連れ向け施設情報（おむつ替え、授乳室など）の提供
   - 時間帯に応じた最適なプランニング

### 技術スタック

#### フロントエンド

- Next.js
- Tailwind CSS

#### バックエンド

- Cloud Functions for Firebase
- Firestore
- Firebase Hosting
- Cloud Workflows

#### AI/ML

- Vertex AI Studio
- OpenRouter API
- Genkit

#### 認証/セキュリティ

- Firebase Authentication（Google 認証）
- Firebase App Check

#### データ収集/処理

- Vertex AI Studio
- Cloud Workflows（AI プランニング）

---

## 2. アーキテクチャ

### フロントエンド (Next.js)

- ランディングページ（LP）によるユーザー導入
- Google 認証によるスムーズなログインフロー
- 3 つの主要ページ（ホーム、イベント詳細、設定）を実装
- 今週/今後のイベント一覧表示
- AI プランニング機能との連携
- Cloud Firestore を利用したユーザー情報の取得と更新

### バックエンド (Firebase)

#### Cloud Functions for Firebase

- ベクトル類似検索の処理
- ユーザーのイベント興味関心データの収集と分析
  - イベント一覧でのクリック情報の収集
  - クリックされたイベントの特徴分析
  - ユーザーの興味傾向の自動更新

#### Cloud Firestore

- ユーザー情報、イベント情報、設定データの管理
- ベクトル検索機能による類似イベントの検索
- イベントクリックログの保存と分析
  - クリックされたイベントのタイムスタンプ
  - クリック時のコンテキスト情報（一覧表示位置など）
  - クリック後のユーザー行動データ

#### Firebase Hosting

- Next.js アプリケーションのホスティング
- Cloud Run を利用した効率的なデプロイ

### グラウンディング (Vertex AI Studio & Genkit)

- Web サイトからのイベント情報の自動収集
- OpenRouter API を利用したテキスト解析

### AI (Vertex AI & OpenRouter)

#### イベント分析

- イベントの特徴抽出とベクトル化
- ユーザーの好みとイベントのマッチング
- 類似イベントの検索と推薦
- クリックログ分析による推薦精度の向上
  - クリック率の高いイベントタイプの分析
  - ユーザーセグメントごとの興味傾向分析
  - 時間帯・曜日による興味変化の分析

#### AI プランニング

- イベント参加に必要な総合的なプラン生成
- 移動手段とルートの最適化
- 周辺施設情報の統合
- 天候や時間帯を考慮したプラン調整

### ワークフロー管理

#### Cloud Workflows

- AI プランニングの AI オーケストレーション

### その他

- Firebase Authentication でユーザー認証を実装します。
- Firebase Cloud Storage でイベントの画像や動画を保存します。
- Firebase Cloud Messaging でプッシュ通知機能を実装します。

---

## 3. 開発計画

### フェーズ 1: 環境構築とデータモデル設計

- Firebase プロジェクトの作成と設定
- Cloud Firestore のセットアップとセキュリティルールの設定
- データベーススキーマの設計（ユーザー情報とスワイプ済みイベント用）
- ベクトルインデックスの作成と設定
- Vertex AI Studio と Genkit の設定
- Next.js プロジェクトの作成

### フェーズ 2: イベント情報収集システムの構築

- Vertex AI Studio と Genkit を利用したリアルタイムイベント情報収集の実装
- Gemini API を利用したイベント情報のテキスト分析、ベクトル埋め込み
- Cloud Firestore のベクトルインデックスを利用したユーザーの好みベクトル生成のロジック実装
- スワイプ済みイベント情報の保存機能実装

### フェーズ 3: フロントエンド実装

- Next.js でスワイプ式 UI を実装
- イベント詳細画面、設定画面、プロフィール画面を実装
- Cloud Firestore を利用したデータ取得と更新
- ユーザー認証機能の実装
- ローカルデータキャッシュの実装

### フェーズ 4: イベント推薦機能実装

- イベントクリックログ収集システムの実装
  - クリックイベントの収集と保存
  - クリックコンテキストの分析
  - ユーザー行動データの統合
- Cloud Firestore のベクトル検索機能を利用したイベント絞り込み
- クリックログ分析に基づく推薦精度の向上
  - クリック率分析
  - ユーザーセグメント分析
  - 時間帯別傾向分析
- 初回ユーザー向けの推薦ロジックの実装
  - 人気イベントの表示
  - カテゴリバランスの考慮
  - 初期設定に基づく推薦

### フェーズ 5: テストとデバッグ

- 各機能の動作テスト
- UI/UX の改善
- パフォーマンス最適化

---

## 4. ハッカソンでのアピールポイント

- **Google Cloud のフル活用**: AI プロダクトとコンピュートプロダクトを組み合わせた、実践的なアーキテクチャ
- **パーソナライズ機能**: Gemini API を活用した、高度なイベント推薦機能
- **Next.js の活用**: サーバーサイドレンダリングで高速なフロントエンドを実現
- **Cloud Firestore**: ベクトル検索とリアルタイムデータ同期による効率的なデータ管理と検索
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
