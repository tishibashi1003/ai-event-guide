# ディレクトリ構造設計ガイドライン

## 基本構造

```
src/
├── app/          ... ルーティングに関するコンポーネント
├── features/     ... ロジック + コンポーネントをまとめたもの
│   ├── common/   ... 共通部分
│   └── routes/   ... 特定のページで使うもの
├── components/   ... ロジックがない共通コンポーネント
├── hooks/        ... 共通ロジックの内、React Hooksがあるもの
├── utils/        ... 共通ロジックの内、React Hooksがないもの
└── constants/    ... 定数を定義したファイル
```

## 各ディレクトリの役割と規約

### `app/`

- Next.js App Router のルーティングに関するコンポーネントを配置
- Server Component のみを配置（"use client"を記述しない）
- データフェッチやページレイアウトの定義を行う
- 複雑なロジックは`features/`に切り出す

### `features/`

機能単位でコンポーネントとロジックをまとめたディレクトリ

#### `features/common/`

- 複数のページで使用される機能
- 例：地図表示（map）など
- 構成：
  ```
  common/
  ├── feature-name/
  │   ├── components/  ... UIコンポーネント
  │   ├── hooks.ts     ... カスタムフック
  │   └── type.ts      ... 型定義
  ```

#### `features/routes/`

- 特定のページでのみ使用される機能
- 例：イベント詳細、イベント一覧、行き先（kokoiku）など
- 構成：
  ```
  routes/
  ├── feature-name/
  │   ├── components/  ... UIコンポーネント
  │   ├── hooks.ts     ... カスタムフック（必要な場合）
  │   └── type.ts      ... 型定義
  ```

### `components/`

- ロジックを持たない純粋な UI コンポーネント
- 複数の機能で再利用可能なもの
- 例：ボタン、入力フォーム、モーダルなど
- Props で渡された値の表示や、イベントのコールバックのみを行う

### `utils/`

- React Hooks を使用しない共通ロジック
- 純粋な関数として実装
- 例：日付フォーマット、バリデーション、計算ロジックなど

### `constants/`

- アプリケーション全体で使用する定数
- 定数は`as const`で型を固定する
- 例：
  - `paths.ts` ... ルーティングパス
  - `styles.ts` ... カラーコードやスペーシング

## 命名規則

### ファイル名

- コンポーネント: `PascalCase.tsx`
- その他: `kebab-case.ts`

### ディレクトリ名

- `features/`配下: `kebab-case`
- その他: `camelCase`

## 新機能追加時のフロー

1. 機能の範囲を確認

   - 複数ページで使用 → `features/common/`
   - 特定ページのみ → `features/routes/`

2. 必要なファイルを作成

   ```
   feature-name/
   ├── components/     ... UIコンポーネント
   ├── hooks.ts        ... ロジック（必要な場合）
   └── type.ts         ... 型定義
   ```

3. 共通部分の切り出し
   - UI の共通化 → `components/`
   - ロジックの共通化 → `hooks/` or `utils/`
   - 定数の共通化 → `constants/`

## コードの依存関係

- 循環参照を避けるため、以下の順序で依存関係を作る
  1. `constants/` → `utils/` → `components/`
  2. `features/common/` → `features/routes/`
  3. `features/` → `app/`

## テストディレクトリ構造

```
__tests__/
├── components/   ... コンポーネントのテスト
├── hooks/        ... カスタムフックのテスト
└── utils/        ... ユーティリティ関数のテスト
```

## 注意事項

- `app/`ディレクトリには最小限のコードのみを配置
- ロジックは可能な限り`features/`に切り出す
- 共通コンポーネントは`components/`に切り出す
- 型定義は各機能のディレクトリの`type.ts`に配置
- 環境変数は`.env`ファイルで管理し、型定義は`types/env.d.ts`に配置
