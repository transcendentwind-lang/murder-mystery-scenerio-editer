# 起動・確認・公開手順

対象: AI・開発担当。確認日: 2026-11-09。利用者向けの画面操作は[USER_GUIDE.md](USER_GUIDE.md)を参照。

## 操作の担当

[AGENTS.md](../AGENTS.md)に従い、環境確認、起動・停止、依存関係、検証、コミット・プッシュはAIが実行する。利用者へターミナル操作や技術選択を委ねない。OSのインストール確認など、AIから操作できない画面だけ必要な操作を案内する。

以下のコマンドは担当AI・開発者用。既存の作業・サーバー・保存データを確認してから実行する。

## 起動方法

### Dockerを使う場合

DockerfileはNode.js 20 Alpineを使う。Docker Composeはソースを共有し、依存関係とNext.jsの生成物をコンテナ側に置く。

```bash
docker compose up -d --build
docker compose logs --tail=80 app
```

起動確認後、利用者には [http://localhost:3000](http://localhost:3000) を案内する。停止は次のコマンド。

```bash
docker compose down
```

### ローカルのNode.jsを使う場合

Node.js 20系はDocker・CIと合わせる基準。実際の環境と既存プロセスを確認して選ぶ。

```bash
npm ci
npm run dev
```

`npm run dev` は継続実行するプロセス。AIがセッションを保持し、停止も担当する。両方式で同時に同じポートを使わない。

## 変更の確認

文書だけの変更では、参照リンク、実装との一致、差分を確認する。実装変更では変更箇所に応じて画面・保存・出力を確認する。

```bash
git diff --check
npx tsc --noEmit
npm run build
```

後者2つは依存関係の導入後に実行する。通常ビルドは型エラーも確認する。静的公開用ビルドは設定上、TypeScript・ESLintエラーを無視するため、それだけで正常性を判定しない。

`npm run lint` は `next lint` を実行するが、現状はESLint依存関係・設定が揃っていないため、無人の必須チェックとしてそのまま使用しない。回帰テストは `npm test`（Playwright）で実行する。初回は `npx playwright install chromium` で検証用ブラウザを導入する。テストは専用ポート3107のサーバーと隔離ブラウザを使い、利用者のブラウザデータには触れない。未実行・失敗の確認を「合格」と記録しない。

通常の本番サーバーを確認する場合は、通常ビルド後に `npm run start` を使う。利用者のブラウザデータへ試験データを書かず、保存試験には隔離したデータを使う。

## ローカル追加作品

`public/local-projects.json` は任意のローカル追加作品ファイル。`MMProject[]` を配置すると、アプリ起動時に読込を試みる。`npm run dev`・`npm run build`・`npm run start` の事前処理で、ファイルがない場合だけ空配列 `[]` を自動生成し、追加作品がない環境でも404を出さない。既存ファイルは内容を検査・書換えせず保持する。同時実行でも上書きしないよう排他的に作成する。このファイルと `.local-projects/` はGit管理対象外。共通文書や公開ソースへ作品本文を転載しない。

Git管理対象外という設定は配信制御ではない。参加者向け静的ビルドでは完了処理が `out/local-projects.json` を除外する。`public/local-projects.json` の原本は保持する。他の公開ファイルについても、意図しない作品データがないことを確認する。

## 参加者画面の公開

[`next.config.mjs`](../next.config.mjs) と [GitHub Actions](../.github/workflows/deploy-sonar.yml) が構築方法を定義する。ワークフローのファイル名は実ファイルを正本とする。

1. mainへのpushでワークフローを開始する。
2. Node.js 20で `npm ci` を実行する。
3. `NEXT_PUBLIC_STATIC_EXPORT=1` でビルドし、`out/` に静的出力する。
4. ルートのHTMLを参加者用 `/sonar/` への転送に置き換え、`.nojekyll` を追加する。
5. `out/` を `gh-pages` ブランチへ配信する。

ローカルで静的出力を確認する場合のコマンド:

```bash
NEXT_PUBLIC_STATIC_EXPORT=1 npm run build
```

通常構成と静的構成は異なるため、既存サーバーと生成物の競合に注意して実行する。公開先のbasePathは `next.config.mjs` とワークフロー内の転送先に依存する。画面誘導と認証の限界は[ARCHITECTURE.md](ARCHITECTURE.md#実行と公開)を参照。

mainへのpushは文書だけの変更でも現在のワークフローを起動する。公開成功はpush成功とは別に確認する。リポジトリの設定と実行結果を確認せず、配信済みと報告しない。

## コミット・プッシュ

作業前に差分・ブランチ・リモートを確認する。他者の変更を混ぜず、今回の対象ファイルだけを指定してコミットする。検証後、運用ルールに従ってpushする。失敗した場合は原因と未完了範囲を報告し、履歴の強制書換えで解消しない。

## 文書更新時の確認

- 画面や保存挙動の変更: 利用ガイドと現在の構成を更新する。
- 型・JSON入出力の変更: データ項目と互換性の説明を更新する。
- 構想と実装状況の変更: 目指す体験の表を更新する。
- 方針・制約の重要な変更: 判断記録へ根拠と影響を追記する。
- 配布資料の文字が小さくなる変更: 運用ルールに従い、完了報告で対象箇所を明示する。


## 作品資料の配置と検証

資料の正本は `assets/scenarios/<作品ID>/`。作品本文・専用画面は `src/scenarios/<作品ID>/`。共通コードへ作品本文を追加しない。

```bash
npm run assets:check
npm run assets:prepare
```

前者は資料目録の網羅・欠損・ハッシュを検査する。後者は作者用の全資料と旧URL互換コピーを生成する。`dev`・`build`・`start` の前処理でも自動実行する。参加者向け静的ビルドでは目録で許可したファイルだけ配置し、完了処理で公開対象外ファイルが残っていないか検査する。生成した `public/scenarios`、`public/images`、`public/pdfs` を直接編集しない。

原本の再生成は[資料パッケージ](../assets/scenarios/project-deep-sea/README.md)と `sources/README.md` を参照する。正本のファイル更新時は目録のハッシュも更新する。静的ビルド後に作者用サーバーへ戻すときは `npm run assets:prepare` で全資料を再配置する。
