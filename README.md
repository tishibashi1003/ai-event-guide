# 「ココいく」Getting Started

## 必要要件

- Node.js v20.0.0 以上
- yarn 1.22.19 以上
- Firebase CLI ツール
- Google Cloud CLI ツール

## 環境構築

1. リポジトリのクローン

```bash
git clone https://github.com/your-username/ai-event-guide.git
cd ai-event-guide
```

2. 依存関係のインストール

```bash
# ルートディレクトリで実行
yarn install

# Cloud Functions用の依存関係をインストール
cd functions
yarn install
cd ..
```

3. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local`ファイルを編集し、必要な環境変数を設定してください：
本番環境で実行する際は Secret Manager へ環境変数を設定してください。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

GOOGLE_GENAI_API_KEY=your_google_genai_api_key
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_WORKFLOWS_PROJECT_ID=your_google_cloud_workflows_project_id
```

4. Firebase プロジェクトの設定

```bash
# Firebase CLIにログイン
firebase login

# プロジェクトの初期化（既存のファイルは上書きしないでください）
firebase init
```

5. Cloud Workflows の設定（Google Cloud コンソール）

   - ワークフロー名: ai-planning
   - 場所: asia-northeast1
   - ソース: workflows/eventSearch.yaml

6. AppCheck の設定

   - ローカルだけで動かす場合は src/utils/firebase/config.ts の 90 行目あたりの App Check 関連の処理をコメントアウトしてください。

7. 開発サーバーの起動

```bash
yarn dev
```

## デプロイ

1. プロダクションビルドの作成

```bash
yarn build
```

2. Firebase へのデプロイ

```bash
firebase deploy --only hosting
firebase deploy --only functions:scheduledGetEventFunction
firebase deploy --only functions:findSimilarEvents
```
