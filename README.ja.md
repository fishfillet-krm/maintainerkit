# MaintainerKit

[English](README.md)

MaintainerKitは、Codexを含むAIエージェントがOSSリポジトリを安全に継続保守できるよう、
リポジトリ情報、作業ルール、Issueトリアージ、実装計画を整備するオープンソースCLIです。

## 安全設計

- `init`は既存ファイルを既定で上書きしません。
- GitHubへの書き込み、PR作成、外部AI API呼び出しは行いません。
- 認証、認可、セキュリティ、課金、デプロイ、リリースは人間承認が必要と判定します。
- 生成された計画にはリスクとPre-PRチェックリストを必ず含めます。

## 必要環境

- Node.js 20以上
- 開発時はpnpm 10.34.2

## インストール

```bash
npm install --global maintainerkit
maintainerkit --help
```

グローバルインストールせず、`npx maintainerkit --help`でも実行できます。

## 基本コマンド

```bash
maintainerkit init
maintainerkit triage --file issue.md
maintainerkit plan --text "設定ファイルがない場合は既定設定で起動する"
maintainerkit plan --file issue.md --prompt-only
```

## 開発

```bash
pnpm install
pnpm verify
```

詳細な仕様、制約、ロードマップは英語版READMEおよび`docs/`を参照してください。
