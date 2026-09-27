# データスキーマ仕様書 (Data Schema Specification)

本ドキュメントでは、MM-Workbench が扱うコアデータの型定義を規定する。

```typescript
// ==========================================
// 1. プロジェクト基本設定
// ==========================================
export interface ProjectMeta {
  id: string;
  title: string;
  logline: string; // 作品の一行要約
  genreTheme: string; // 世界観・テーマ（例: コズミックホラー、古典本格など）
  playerCount: number; // プレイ人数
  estimatedDurationMin: number; // 想定所要時間
  hasGm: boolean; // GM要否
  informationStyle: 'all_open' | 'secret_trading' | 'hybrid'; // 情報公開形式
  customRules: string[]; // 特殊ルール（例: 密談なし、解釈差分制など）
}

// ==========================================
// 2. キャラクター & ハンドアウト (HO)
// ==========================================
export interface CharacterInternalDrama {
  pride: string; // 専門職としての誇り・自負
  guilt: string; // 後ろめたさ・過去の過失・秘密
  loss: string; // 喪失体験・トラウマ・後悔
}

export interface HandoutContent {
  publicProfile: string; // 全員に開示される表向きのプロフィール
  secretObjective: string; // 個別勝利条件・真の目的
  internalDrama: CharacterInternalDrama; // 内面ドラマ
  backgroundTimeline: string; // 事件当日の個人タイムライン
  handoutBody: string; // HO本文テキスト
  gmActionGuide?: string; // フェーズ移行時の裏アクション等の指示書
}

export interface Character {
  id: string;
  name: string;
  roleType: 'suspect' | 'investigator' | 'neutral' | 'special';
  isCulpritCandidate: boolean; // 容疑者候補か否か
  profession: string; // 職業・役割
  handout: HandoutContent;
}

// ==========================================
// 3. 情報トランプ（公開証拠 × 個別知識マトリクス）
// ==========================================
export interface PublicEvidence {
  id: string;
  title: string; // 証拠名
  foundPhase: number; // 発見されるフェーズ
  objectiveDescription: string; // 誰が見ても明らかな客観的事実
}

export interface InterpretationLink {
  id: string;
  evidenceId: string; // 紐づく公開証拠ID
  characterId: string; // 解釈可能なキャラクターID
  specializedKnowledge: string; // 当該PCが持つ専門知識
  derivedConclusion: string; // 掛け合わせによって導き出される新事実
  isCrucialForSolution: boolean; // 真相解明に必須か
}

// ==========================================
// 4. 多重ロック整合性検証 (Multi-Lock Validation)
// ==========================================
export interface LockCriterion {
  id: string;
  name: string; // 条件名（例: 犯行可能場所、特定動機、魔術/特殊ルール適合）
  description: string; // 条件の詳細定義
}

export interface CandidateLockStatus {
  characterId: string;
  // 各ロック条件を満たしているか (true: 犯人該当可能, false: アリバイ・反証あり)
  locks: Record<string, boolean>;
  rebuttalNote: string; // 反証理由やミスリードの解説
}

// ==========================================
// 5. リソース & イベントフロー
// ==========================================
export interface PhaseStep {
  phaseNumber: number;
  title: string;
  goals: string[];
  publicEvents: string[];
  secretEvents: string[]; // 裏アクションなど
}

export interface ResourceCounter {
  id: string;
  name: string; // 例: 特定アイテムの残弾数、儀式進行度など
  maxCapacity: number;
  currentValue: number;
  consumptionLog: { phase: number; description: string }[];
}

// ==========================================
// 全体プロジェクトルート
// ==========================================
export interface MMProject {
  meta: ProjectMeta;
  characters: Character[];
  evidences: PublicEvidence[];
  matrixLinks: InterpretationLink[];
  lockCriteria: LockCriterion[];
  candidateStatuses: CandidateLockStatus[];
  phases: PhaseStep[];
  resources: ResourceCounter[];
}
```
