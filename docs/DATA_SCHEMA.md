# データ項目

確認日: 2026-11-09。型定義の正本は [`src/types/schema.ts`](../src/types/schema.ts)。本書は意味と参照関係を説明する。型を変更した場合は本書も更新し、型定義全体の複製は置かない。

## プロジェクトのルート

`MMProject` がJSON書出しの単位。`?` は型上の任意項目であり、画面での編集可否を意味しない。

| 項目 | 型 | 意味 |
|---|---|---|
| `id?` | `string` | 作品ID。画面の専用処理の分岐にも使用 |
| `createdAt?`, `updatedAt?` | `string` | 作成・更新日時 |
| `title`, `subtitle` | `string` | 題名・副題 |
| `concept`, `targetExperience` | `string` | 世界観・コンセプト、目指す体験 |
| `plotSummary`, `gimmickOverview` | `string` | プロット紹介、仕掛けの概要 |
| `playerCount` | `number` | 参加人数 |
| `durationHours` | `number` | 想定時間。単位は時間 |
| `hasGm` | `boolean` | GMの有無 |
| `characters` | `Character[]` | 登場人物とHO |
| `evidences` | `EvidenceItem[]` | 証拠・配布情報 |
| `timeline` | `IncidentStep[]` | フェーズ進行 |
| `crypticWords` | `CrypticWord[]` | 記号・音響などの語彙 |
| `crypticGrammar` | `CrypticGrammar` | 語順・組合せ規則 |
| `matrixLinks?` | `InterpretationLink[]` | 証拠と個別知識の対応 |
| `lockCriteria?` | `LockCriterion[]` | ロック条件 |
| `candidateStatuses?` | `CandidateLockStatus[]` | 人物別の条件状態と反証メモ |
| `documentDesigns?` | `Record<string, DocumentDesignOverride>` | 文書キーごとの外観設定 |
| `visualBoards?` | `VisualBoardItem[]` | 図・写真の設定 |
| `gmNotes?` | `Record<number, GmProgressionNote>` | フェーズ番号ごとの進行メモ |
| `specialCharacterCards?` | `SpecialCharacterCard[]` | 個別配布カード |
| `nagatsuPhaseCards?` | `NagatsuPhaseCard[]` | 進行アナウンスカード。型・項目名に既存の作品由来識別子が残る |

## 人物・HO

| 型 | 主な項目と意味 |
|---|---|
| `Character` | `id`, `name`, `roleType`, `isCulpritCandidate`, `profession`, `location`, `introduction`, `capabilities`, `initialItems`, `handout` |
| `HandoutContent` | `publicProfile`（公開プロフィール）、`internalDrama`（内面）、`backgroundTimeline`（行動・記憶）、`handoutBody`（本文）、`gmActionGuide?`（GM向け指示） |
| `CharacterInternalDrama` | `pride`, `loss` は必須文字列。`guilt?` は任意文字列。組み込み作品の同期では `guilt` を除去 |
| `CharacterCapability` | `id`, `name`, `description`, `targetPhase`, `unlockedEvidenceIds?`。能力と関連証拠の情報を保持するが、自動実行を意味しない |

`roleType` は `suspect / investigator / neutral / special`。`location` は `headquarters / field / other`。`initialItems` は文字列配列。型にある能力・所持品の項目が、すべての作品で使用・表示されるとは限らない。

## 証拠と進行

| 型 | 項目と意味 |
|---|---|
| `EvidenceItem` | `id`, `title`, `description`, `ownerId`, `foundPhase`, `visibility`, `category` が必須。`frontTitleHtml?`, `glossaryNote?`, `acquisitionCondition?` は任意 |
| `IncidentStep` | `dayNumber`, `locationName`, `distanceKm`, `situationTitle`, `incidentOverview`, `hqResponse`, `fieldResponse`, `revealedEvidenceIds` が必須。`resourceStatus?` は任意 |

`ownerId` は人物IDまたは `all`。`visibility` は `private / shareable / public`、`category` は `document / data / sample / testimony / audio / research_note`。公開区分は制作上の分類であり、端末別の配信制御を実装するものではない。

`dayNumber` は汎用作品でもフェーズ番号として利用する。`hqResponse` は全体議論・表の調査、`fieldResponse` は個別行動・裏進行。`distanceKm` は数値の進行指標、`resourceStatus` は状態の自由記述で、自動残数計算はしない。

## 情報トランプと多重ロック

| 型 | 項目と意味 |
|---|---|
| `InterpretationLink` | `id`, `evidenceId`, `characterId`, `specializedKnowledge`, `derivedConclusion`, `isCrucialForSolution`。証拠・人物のIDと解釈を関連付ける |
| `LockCriterion` | `id`, `name`, `description`。条件軸の定義 |
| `CandidateLockStatus` | `characterId`, `locks: Record<string, boolean>`, `rebuttalNote`。`locks` のキーは条件ID |

多重ロック集計は全人物を対象に、全条件の真偽を参照する。`isCulpritCandidate` だけで集計対象を限定しない。該当者1人という結果は、条件文や反証文の意味の正しさを保証しない。

## 語彙と組合せ

- `CrypticWord`: `id`, `symbol`, `meaning`, `soundPattern`, `assignedCharId`, `clueSource`。
- `CrypticGrammar`: `ruleDescription`, `correctSequence: string[]`, `combinedMessage`, `holderCharId`。

`correctSequence` は語彙IDの順序。知識の保有者は人物IDで参照する。独立した参加者画面は選択中の作品からこれらを受け取らず、組み込みデータを使う。

## 資料・進行メモ

| 型 | 項目と意味 |
|---|---|
| `DocumentDesignOverride` | `themeId`, `accentColor`, `paperStyle`, `borderStyle`, `fontFamily`, `stampText`, `organizationHeader`, `documentCode`, `footerNote`, `customPromptUsed?` |
| `VisualBoardItem` | `id`, `title`, `subtitle`, `boardType`, `dayNumber` と、任意の `captionTitle`, `captionBody`, `annotations`, `imageUrl`, `showGmSecrets`, `orientation`, `hasWhiteMargin` |
| `GmProgressionNote` | `dayNumber`, `targetMinutes`, `readAloudScript`, `gmCheckpoints: string[]`, `bgmCue` |
| `SpecialCharacterCard` | `id`, `cardCode`, `characterId`, `characterName`, `profession`, `revealDayLabel`, `revealDayNumber`, `title`, `description`, `categoryLabel`, `accentHex`。任意の `frontTitleHtml`, `rubyHtml`, `glossaryNote`, `fivePlayerFallbackNote` |
| `NagatsuPhaseCard` | `id`, `cardCode`, `dayNumber`, `timingBadge`, `title`, `description`, `rubyHtml`, `accentHex`。`frontTitleHtml?` は任意 |

テーマ・色・紙面・枠線の許容値は正本の型を参照。`boardType` は既定値に加えて文字列も許容する。保存された外観設定やカードが、そのまますべての画面で採用される保証はない。既定資料を参照する処理が残るためである。`customPromptUsed` という項目も外部AIの実行記録を保証しない。

## 参照関係と互換性

- `evidenceId`, `revealedEvidenceIds`, `unlockedEvidenceIds` は証拠IDを参照する。
- `characterId`, `assignedCharId`, `holderCharId` は人物IDを参照する。
- 条件状態は条件ID、GMメモはフェーズ番号、外観設定は文書キーで関連付ける。
- 参照先の存在や全項目の型を厳密に検査するJSONスキーマ検証はない。`normalizeProject` の不足項目補完は、互換性の保証ではない。
- JSONインポート時の入口の確認は題名・人物データの有無が中心。新しい作品IDを割り当てて追加し、既存作品を上書きしない。
- 保存処理には組み込み作品の置換・削除がある。保持範囲は[ARCHITECTURE.md](ARCHITECTURE.md#組み込み作品の同期という制約)を参照。

旧文書の `ProjectMeta` とルートの `meta`、`PublicEvidence`、`PhaseStep`、`ResourceCounter`、`phases`、`resources`、`secretObjective` は現在の正本にない。旧形式を現行のJSON契約として使わない。分単位の旧想定時間と `durationHours` も同じ単位ではない。


## 作品本文と別に保持する当日進行

`mm_workbench_progress_v1:<URLエンコードした作品ID>:<項目名>` をブラウザ内の保存キーとする。これは `MMProject` の項目ではなく、作品JSONの対象外。

- `gm.currentDay` と `timeline.selectedDay`: 各画面で選択中のフェーズ番号。
- `investigations`: 日番号ごとの `{ tokyo: string, field: string[] }`。調査IDを保持し、GM・タイムラインで共用。
- `timer`: `{ elapsedMs: number, startedAt: number | null }`。停止中は `startedAt` が `null`。計測中は開始からの経過時間を加算。
- `shared.*`: 両画面で共用する調査選択・命名入力。`gm.*`、`timeline.*`: 各画面の判断・入力・結果。

表示用モーダルや音声の再生途中の状態は保存しない。
