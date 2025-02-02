# Firebase Functions ドキュメント

## 概要

このプロジェクトは Firebase Cloud Functions を使用して、HTTPS リクエストを処理するサーバーレス関数を実装しています。

## 機能一覧

### addmessage

HTTPS リクエストを受け取り、Firestore にメッセージを保存する関数です。

- **エンドポイント**: `https://<region>-<project-id>.cloudfunctions.net/addmessage`
- **メソッド**: GET
- **パラメータ**:
  - `text`: 保存するメッセージテキスト
- **レスポンス**:
  ```json
  {
    "result": "Message with ID: <document-id> added."
  }
  ```

## 技術スタック

- Node.js 18
- TypeScript 4.9.0
- Firebase Admin SDK 12.1.0
- Firebase Functions 4.7.0

## 開発環境のセットアップ

1. 依存関係のインストール

```bash
yarn install
```

2. ローカル開発サーバーの起動

```bash
yarn serve
```

3. TypeScript のビルドウォッチモード

```bash
yarn build:watch
```

## デプロイ方法

### 特定の関数のデプロイ

```bash
firebase deploy --only functions:xxxx --region asia-northeast1
```

### 全関数のデプロイ

```bash
yarn deploy
```

## 利用可能なスクリプト

- `yarn lint`: ESLint によるコード品質チェック
- `yarn build`: TypeScript のビルド
- `yarn build:watch`: TypeScript の自動ビルド（開発時）
- `yarn serve`: ローカル開発サーバーの起動
- `yarn shell`: Firebase Functions シェルの起動
- `yarn logs`: デプロイされた関数のログを表示

## プロジェクト構造

```
functions/
├── src/
│   └── index.ts      # 関数の実装
├── lib/              # ビルド後のJavaScriptファイル
├── package.json      # 依存関係とスクリプト
└── tsconfig.json     # TypeScript設定
```

## 注意事項

- Node.js 18 環境が必要です
- デプロイ前に必ず `yarn build` を実行してください
- 本番環境にデプロイする前に、`yarn lint` でコードの品質をチェックすることを推奨します
