# 現在の構成

確認日: 2026-11-09。現在の実装を説明する文書。目指す体験は[PRODUCT_VISION.md](PRODUCT_VISION.md)、利用手順は[USER_GUIDE.md](USER_GUIDE.md)を参照。

## 実装の構成

Next.js 14系のApp Router、React 18系、TypeScript、Tailwind CSS、Lucide Reactで構成する。依存関係と実行コマンドの正本は [`package.json`](../package.json)。外部AI用SDK・API接続は現在実装されていない。

| 層 | 主なファイル | 役割 |
|---|---|---|
| 画面の統合 | [`src/app/page.tsx`](../src/app/page.tsx) | 選択作品、タブ、更新と保存の連携 |
| 作品管理 | [`ProjectManagerModal.tsx`](../src/components/ProjectManagerModal.tsx) | 作成・切り替え・複製・削除・JSON入出力 |
| 制作 | [`TimelineBoard.tsx`](../src/components/TimelineBoard.tsx)、[`CharactersEvidenceManager.tsx`](../src/components/CharactersEvidenceManager.tsx) | フェーズ・人物・証拠・情報対応表・条件表 |
| 当日の進行 | [`GmDashboard.tsx`](../src/components/GmDashboard.tsx) | フェーズ別進行、証拠確認、タイマー |
| 資料と出力 | [`DocumentDesignStudio.tsx`](../src/components/DocumentDesignStudio.tsx)、[`TextExportView.tsx`](../src/components/TextExportView.tsx)、[`scriptGenerator.ts`](../src/utils/scriptGenerator.ts) | プレビュー・印刷・テキスト生成 |
| 保存 | [`projectStorage.ts`](../src/utils/projectStorage.ts) | localStorage、初期化、補完、JSON書き出し |
| データ定義 | [`schema.ts`](../src/types/schema.ts) | 保存データのTypeScript型 |
| 参加者画面 | [`src/app/sonar/page.tsx`](../src/app/sonar/page.tsx) | 組み込みデータによる独立した音響操作画面 |

## 画面とAI機能

初期表示では作品管理モーダルが開く。作品選択後は、進行、人物・証拠、GM進行、資料、企画・出力のタブで作業する。対応作品には音響操作タブも表示する。旧設計のAIと編集画面の2ペイン構成は現在使わない。

`AiChatPanel.tsx` とチャット状態は残るが、メイン画面にチャットを描画していない。`handleSendMessage` は遅延後に定型文を追加する処理で、モデル推論ではない。資料画面の「推敲」もプロンプト用の状態更新に留まり、現在の画面からAI回答や本文反映へつながらない。APIキーの入力・保持・送信方法は実装済み仕様として扱わない。

## 保存と読込

1. 作品更新をReactの状態へ反映し、`saveProjectToStorage` でブラウザのlocalStorageへ保存する。
2. 一覧は `mm_workbench_projects_v1`、選択中のIDは `mm_workbench_active_project_id_v1` に保存する。
3. `getStoredProjects` は保存データを読み、組み込み作品の同期と `normalizeProject` による不足項目の補完を行う。
4. 起動時に `/local-projects.json` の読込を試み、ローカル追加作品があれば一覧へ統合する。通常の新規作品は同じIDの追加プリセットで毎回全面更新する構成ではない。
5. JSON書き出しは渡された作品オブジェクトをファイル化する。共有データベースや端末間の自動同期はない。

保存失敗はコンソールへ記録する処理で、画面表示だけでは永続化成功を保証できない。保存場所はブラウザ・プロファイル・接続先ごとに分かれる。

### 組み込み作品の同期という制約

現在の分岐は作品種別の設定ではなく固定の作品IDを基準とする。組み込み作品では、人物・HO、作品概要、証拠、タイムライン、図版、専用カードなどをコード側の定義で再設定する。保存時にも既存証拠の題名・本文などをコード側へ合わせる。情報トランプ・ロック条件・候補状態は除去する。

このため、組み込み作品と新規作品では編集の保持範囲が異なる。組み込み作品のHO本文、証拠本文、進行概要が再読込後に戻ること、新規作品では保持されることを、実処理とメモリ内のlocalStorageで確認した。これは現状の制約であり、恒久的な仕様として承認したものではない。

## 汎用機能と作品専用処理

新規作品では汎用のフェーズ編集、人物・証拠管理、情報トランプ、多重ロック表、GM進行コンソールを利用する。組み込み作品では専用の進行・図・演出と6人／7人切替を使用し、犯人特定向けの情報トランプ・多重ロック画面は出さない。

分離は未完了。資料画面の既定図版・進行文・カードや、台本生成の一部には組み込み作品向け処理が残る。資料画面の本文直接編集は `isDirectEditMode = false` で無効。画面名や残存コードを、そのまま利用可能な機能の根拠にしない。

## 検証機能の範囲

- 情報トランプは、証拠・人物・知識・導出結論の手入力と表示を行う。情報偏重や参加者欠落時の行き詰まりを自動判定する処理は確認できない。
- 多重ロックは、各人物について全条件が真となるかを集計し、該当者0人・1人・複数人を表示する。文章の意味、条件の独立性、反証の妥当性は判定しない。未設定状態も肯定条件としては扱わない。
- リソースはフェーズの `resourceStatus` という自由記述。容量・現在値・消費履歴を計算する独立カウンターはない。

## 実行と公開

作者・GM向けはローカルの `/`、参加者用の独立画面は `/sonar`。独立画面は常に組み込みデータを参照し、作者が選択・編集した作品とは同期しない。

通常サーバーでは [`src/middleware.ts`](../src/middleware.ts) がlocalhost・127.0.0.1以外のホスト名による `/` アクセスを `/sonar` へ誘導する。これは画面誘導であり、編集機能全体のアクセス制御ではない。

GitHub Actionsはmainへのpushを契機に静的出力し、ルートページを参加者画面への転送に差し替えて `gh-pages` へ配信する。静的配信ではmiddlewareは動作しない。参加者画面のパスワード照合もブラウザ内の実装であり、サーバー認証ではない。構築・公開の詳細は[SETUP.md](SETUP.md)を参照。
