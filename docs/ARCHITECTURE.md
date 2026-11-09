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
| 作品パッケージ | [`catalog.ts`](../src/scenarios/catalog.ts)、`src/scenarios/<作品ID>/`、`assets/scenarios/<作品ID>/` | 編集権限・専用機能の判定、作品本文・専用資料・正本の分離 |
| 汎用資料編集 | [`GenericDocumentStudio.tsx`](../src/components/GenericDocumentStudio.tsx)、[`genericScriptGenerator.ts`](../src/utils/genericScriptGenerator.ts) | 選択作品のデータだけで編集・プレビュー・出力 |
| 資料一覧 | [`ScenarioMaterialLibrary.tsx`](../src/components/ScenarioMaterialLibrary.tsx) | 目録の全資料を参照・プレビュー・ダウンロード |
| 保存 | [`projectStorage.ts`](../src/utils/projectStorage.ts) | localStorage、初期化、補完、JSON書き出し |
| 進行状態 | [`useProjectProgress.ts`](../src/hooks/useProjectProgress.ts)、[`progressStorage.ts`](../src/utils/progressStorage.ts)、[`useInvestigationSelections.ts`](../src/hooks/useInvestigationSelections.ts) | 作品別の進行・タイマー保持、調査選択の確認と共通化 |
| 音声と波形 | [`wordAudio.ts`](../src/utils/wordAudio.ts)、[`audioSynth.ts`](../src/utils/audioSynth.ts) | 共通の発音定義・予定表、Web Audio出力時計による同期 |
| データ定義 | [`schema.ts`](../src/types/schema.ts) | 保存データのTypeScript型 |
| 参加者画面 | [`src/app/sonar/page.tsx`](../src/app/sonar/page.tsx)、[`src/app/sonar/layout.tsx`](../src/app/sonar/layout.tsx) | 組み込みデータによる独立した音響操作画面、参加者画面専用のページタイトル |

## 画面とAI機能

初期表示では作品管理モーダルが開く。作品一覧の更新日時は日本時間（Asia/Tokyo）の `MM/dd HH:mm`（月/日 時:分）で表示し、サーバーとブラウザーのタイムゾーンが異なっても初期表示を一致させる。更新日時は補足情報と同じ行内で右寄せ・上下中央揃えにし、ほかの補足情報より1px小さく表示する。画面幅930px以上では更新日時を補足情報欄と同じ行の右端に固定し、長い補足情報は項目ごとに折り返す。それ未満では空き幅に応じて日時を含む行も折り返せる。日時自体は改行しない。作品選択後は、進行、人物・証拠、GM進行、資料、企画・出力のタブで作業する。対応作品には音響操作タブも表示する。旧設計のAIと編集画面の2ペイン構成は現在使わない。

`AiChatPanel.tsx` とチャット状態は残るが、メイン画面にチャットを描画していない。`handleSendMessage` は遅延後に定型文を追加する処理で、モデル推論ではない。資料画面の「推敲」もプロンプト用の状態更新に留まり、現在の画面からAI回答や本文反映へつながらない。APIキーの入力・保持・送信方法は実装済み仕様として扱わない。

画面の説明文・操作案内・警告は「です・ます調」とし、ボタン名・見出しは簡潔な表記を使う。シナリオ本文・台詞の文体とは分ける。

現在表示されるAI関連文言と非表示の旧コードは[Web画面の文言調査](UI_TEXT_AUDIT.md)を参照。

`Day3TacticalMap.tsx` は単独利用時に内部の表示モードを使い、タイムラインでは親から `mode` と `onModeChange` を渡して通常・拡大表示の状態を共有する。拡大表示では内部の切り替えボタンを隠し、外側の操作へ統一する。通常プレビューは図の縦横比と操作欄に必要な高さを確保し、拡大表示のみ `fitToContainer` で表示枠へ収める。写真は固有の画像寸法に依存せず枠幅に追従し、狭い画面では観測所見と縦に並ぶ。

専用の `DistributionStudio.tsx` は資料区分に応じて人物・指令書・アナウンスカードの一覧を切り替える。指令書の一覧と紙面は共通の絞り込み結果を参照し、指令書・カードの選択IDで紙面を強調する。選択や区分変更時は右側のキャンバスだけを該当資料へスクロールし、カードは本文面へ移動する。印刷用の全カードと表裏の配置を維持し、選択の強調枠を印刷しない。

## 保存と読込

1. 作品更新をReactの状態へ反映し、`saveProjectToStorage` でブラウザのlocalStorageへ保存する。
2. 一覧は `mm_workbench_projects_v1`、選択中のIDは `mm_workbench_active_project_id_v1` に保存する。
3. `getStoredProjects` は保存データを読み、組み込み作品の同期と `normalizeProject` による不足項目の補完を行う。
4. 起動・ビルドの事前処理 `prepare-local-projects.mjs` で、任意の `public/local-projects.json` がない場合だけ空配列を作成する。既存ファイルは上書きしない。画面起動時に `/local-projects.json` の読込を試み、ローカル追加作品があれば一覧へ統合する。通常の新規作品は同じIDの追加プリセットで毎回全面更新する構成ではない。
5. JSON書き出しは渡された作品オブジェクトをファイル化する。共有データベースや端末間の自動同期はない。

`saveProjectToStorage` は保存成功をbooleanで返す。成功後に保存完了を表示し、失敗時は警告と再保存の操作を出す。未保存の画面データと失敗状態は作品切り替え後もメモリ内に保持する。保存場所はブラウザ・プロファイル・接続先ごとに分かれる。

### 組み込み作品の正本と編集権限

組み込み作品の原稿は `src/scenarios/<作品ID>/data.ts` 等に置く。`catalog.ts` の登録作品IDで読み取り専用と判定し、画面の編集入口と `handleUpdateProject`、保存・削除処理の両方で変更を防ぐ。ブラウザ内の旧作品データは初回に `mm_workbench_builtin_recovery_v1` へ退避し、資料一覧から書き出せる。正本の読込に旧編集を混ぜない。題名の一致では組み込み作品と判定しない。

人数構成は作品本文の `playerCount` を更新せず、進行ストアの `playerCount` に保持する。表示時に原本から対応構成を選ぶ。新規作品・意図的に複製した編集用作品は書込可能。`scenarioPackId` は専用機能の明示的な参照であり、編集権限とは独立する。

## 汎用機能と作品専用処理

資料画面の入口で、組み込み作品の専用閲覧・印刷と編集用作品の汎用エディタを分岐する。汎用画面は当該作品の人物・証拠・図版・GMメモだけを参照する。未設定は空欄・未作成として扱い、他作品の図版・台本・カードで補わない。企画書・台本の出力も、専用機能の明示的な参照がない作品では汎用生成器を使う。

作品資料の正本は `assets/scenarios/<作品ID>/` に集約し、`manifest.json` で全ファイルを登録する。`sources` は編集原本、`releases` は現行配布物、`archive` は比較用保管資料。トップディレクトリにあったPDFは現行ファイルと一致しないため内容を改変せず保管する。資料一覧はこの目録を直接参照する。

`prepare-scenario-assets.mjs` は目録とファイル・ハッシュを照合し、作者環境では全資料を、参加者向け静的ビルドでは許可された資料だけを `public/scenarios` へ配置する。旧 `/images`・`/pdfs` URLも公開対象だけ同じ正本から互換コピーを生成する。生成フォルダはGit管理しない。静的ビルド後は `finalize-participant-export.mjs` で対象外資料とローカル追加作品データの混入を検査・除外する。ローカル追加作品の原本自体は削除しない。

公開対象の絞り込みは配布ファイルの管理であり、アプリ全体の認証やソース秘匿を保証するものではない。

## 検証機能の範囲

- 情報トランプは、証拠・人物・知識・導出結論の手入力と表示を行う。情報偏重や参加者欠落時の行き詰まりを自動判定する処理は確認できない。
- 多重ロックは、各人物について全条件が真となるかを集計し、該当者0人・1人・複数人を表示する。文章の意味、条件の独立性、反証の妥当性は判定しない。未設定状態も肯定条件としては扱わない。
- リソースはフェーズの `resourceStatus` という自由記述。容量・現在値・消費履歴を計算する独立カウンターはない。

## 実行と公開

作者・GM向けはローカルの `/`、参加者用の独立画面は `/sonar`。独立画面は常に組み込みデータを参照し、作者が選択・編集した作品とは同期しない。

通常サーバーでは [`src/middleware.ts`](../src/middleware.ts) がlocalhost・127.0.0.1以外のホスト名による `/` アクセスを `/sonar` へ誘導する。これは画面誘導であり、編集機能全体のアクセス制御ではない。

GitHub Actionsはmainへのpushを契機に静的出力し、ルートページを参加者画面への転送に差し替えて `gh-pages` へ配信する。静的配信ではmiddlewareは動作しない。参加者画面のパスワード照合もブラウザ内の実装であり、サーバー認証ではない。構築・公開の詳細は[SETUP.md](SETUP.md)を参照。


## 進行状態と再生の寿命

`progressStorage.ts` は作品IDと項目名から独立したlocalStorageキーを作り、`useSyncExternalStore` で画面へ通知する。GMとタイムラインの調査選択は一つの値として保持し、後日の無効な選択の解除を承認後にまとめて反映する。タイマーは経過ミリ秒と計測開始時刻を保持するため、画面を離れた間も経過時間を算出できる。進行状態は作品JSONの外にあり、複製・JSON書き出しには含めない。保存失敗時は画面内の状態を保持して警告する。

`ResetProgressButton.tsx` は組み込み・汎用の両GM画面に配置する。ネイティブの確認ダイアログでキャンセルを初期フォーカスにし、確定後に `resetProjectProgress` を呼ぶ。選択作品の保存キー（人数設定を除く）を削除し、メモリにある値は各フックが登録した初期値へ戻してから通知する。未表示の画面の保存値も削除し、タイマーを停止する。作品JSON・資料・他作品は変更しない。保存領域の操作に失敗した場合は画面内の初期化と保存失敗を通知する。

音声語彙の発音定義は `wordAudio.ts` に集約する。波形と音声へ同じ予定表を渡し、全発音をWeb Audioへ事前予約する。描画は出力タイムスタンプを優先し、未対応時は音声時計から出力遅延を引いた値を使う。波形付き再生は同時に一件だけ実行し、画面破棄時に予約音と描画ループを中止する。

並べた音の再生中表示は、波形内の再生順とシーケンス内のボタン位置を対応付ける。単音の確認ではクリックした位置だけを強調し、同じ音が複数並ぶ場合も区別する。音一覧からの試聴ではシーケンスのボタンを強調しない。
