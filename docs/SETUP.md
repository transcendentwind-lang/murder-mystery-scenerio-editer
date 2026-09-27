# 環境構築・初回セットアップ手順書 (Setup Guide)

本プロジェクトの開発環境準備および、ホストマシン側の初期設定ガイドです。

---

## 1. ホスト環境の初期準備 (ユーザー作業)

Mac環境でGitおよびDockerを正常に動作させるため、以下の手順を実施してください。

### ① Xcode Command Line Tools のインストール（必須）
Macのターミナルで `git` コマンドを使用可能にするために必要です。

1. Macの「ターミナル.app」を開きます。
2. 以下のコマンドを実行します：
   ```bash
   xcode-select --install
   ```
3. 画面に「コマンドライン・デベロッパ・ツールをインストールしますか？」というダイアログが表示されるので、**「インストール」**をクリックして完了を待ちます（所要時間：2〜5分）。
4. 完了後、ターミナルで以下を実行し、バージョンが表示されれば成功です：
   ```bash
   git --version
   ```

### ② Git ユーザー情報の設定（プッシュ用）
コミット・プッシュを行うために、Gitのユーザー名とメールアドレスを設定します：

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### ③ Docker Desktop の起動確認
Dockerを使って開発サーバーを立ち上げるため、Dockerが起動している必要があります。

1. Macの「アプリケーション」フォルダから **Docker** を起動します。
2. メニューバーのクジラアイコンが緑色（Engine running）になるのを確認します。
3. ターミナルで以下を実行し、エラーなく情報が表示されることを確認します：
   ```bash
   docker ps
   ```

---

## 2. Dockerによる開発サーバー起動

ホストマシンに Node.js 等をインストールする必要はありません。Dockerコンテナ内で起動します。

```bash
# プロジェクトルートで実行
docker compose up
```

起動が完了すると、以下のURLでアクセス可能になります：
- **Web UI**: [http://localhost:3000](http://localhost:3000)

※ ホスト側のコードを変更すると、コンテナ内にリアルタイムで反映されます（ホットリロード対応）。

---

## 3. Gitの初回コミット & プッシュ手順

ファイル作成後、以下の手順でGitHubへファーストコミットおよびプッシュを行います：

```bash
# 1. 変更ファイルをステージング
git add .

# 2. 初回コミット
git commit -m "feat: initial commit for MM-Workbench (architecture, docker setup, skeleton UI)"

# 3. リモートへプッシュ (mainブランチ)
git push -u origin main
```
