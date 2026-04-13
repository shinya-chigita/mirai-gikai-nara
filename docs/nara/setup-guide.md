# みらい議会ー奈良県版 セットアップガイド

## 概要

「みらい議会ー奈良県版」は、チームみらいの「みらい議会」→ 川崎版（GondoTakashi氏）をさらにForkし、奈良県議会向けにカスタマイズしたものです。

## 前提条件

- Node.js 20以上
- pnpm 9以上
- Docker（ローカルSupabase用）

## ローカル環境の起動手順

### 1. リポジトリのクローン

```bash
git clone <your-repo-url> mirai-gikai-nara
cd mirai-gikai-nara
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集し、以下を設定：
- `AI_GATEWAY_API_KEY` — OpenAI APIキー（AIチャット機能に必要）
- その他のキーはローカル開発時はデフォルトで動作します

### 4. Supabaseの起動

```bash
npx supabase start
```

初回起動時はDockerイメージのダウンロードに時間がかかります。

### 5. データベースのリセットとシードデータ投入

```bash
pnpm db:reset
```

これでマイグレーションの適用とシードデータの投入が行われます。

### 6. 開発サーバーの起動

```bash
pnpm dev
```

- Web: http://localhost:3000（WEB_PORTで変更可能）
- Admin: http://localhost:3001（ADMIN_PORTで変更可能）

## カスタマイズ済みの内容

### 設定ファイル（site.config.ts）
- `web/src/config/site.config.ts` — サイト名、議会名、URL、運営者情報
- `admin/src/config/site.config.ts` — Admin画面の設定

### シードデータ
- `packages/seed/main/data.ts` — 定例会、会派、委員会、議案のサンプルデータ
- `packages/seed/main/bill-contents-data.ts` — 議案の詳細コンテンツ

### テーマカラー
- `web/src/app/globals.css` — プライマリカラー（#8b2252 / 奈良の古代紫）
- `web/public/manifest.json` — PWAのテーマカラー

### 用語の置換
- 市議会 → 県議会
- 市民 → 県民
- 川崎市 → 奈良県

## 議案データの投入

サンプルデータはデモ用です。実際の奈良県議会の議案を追加するには：

1. **Admin画面**（http://localhost:3001）にログイン
2. 「定例会管理」から定例会を追加
3. 「議案管理」から議案を作成
4. 議案コンテンツ（やさしく / 詳しく）を登録

または、`packages/seed/main/data.ts` を編集してシードデータとして投入することもできます。

## 本番デプロイ

### Supabase
1. [Supabase](https://supabase.com) でプロジェクトを作成
2. マイグレーションを適用: `npx supabase db push`
3. 環境変数に本番URLとキーを設定

### Vercel
1. Web / Admin それぞれをVercelプロジェクトとしてデプロイ
2. 環境変数を設定（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 等）

## 運営者情報

- 運営: First Step
- 連絡先: https://first-step.icu
- メール: info@first-step.icu
