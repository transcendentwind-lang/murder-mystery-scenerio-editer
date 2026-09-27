/**
 * MM-Workbench - コアデータモデル定義
 * 特定のシナリオに依存しない汎用的なマーダーミステリー設計スキーマ
 */

export type RoleType = 'suspect' | 'investigator' | 'neutral' | 'special';

export interface CharacterInternalDrama {
  pride: string;       // 専門職としての誇り・自負
  guilt: string;       // 後ろめたさ・過去の過失・秘密
  loss: string;        // 喪失体験・トラウマ・後悔
}

export interface HandoutContent {
  publicProfile: string;     // 全員に開示される表向きのプロフィール
  secretObjective: string;   // 個別勝利条件・真の目的
  internalDrama: CharacterInternalDrama; // 内面ドラマ
  backgroundTimeline: string; // 事件当日の個人タイムライン
  handoutBody: string;       // HO本文テキスト
  gmActionGuide?: string;    // フェーズ移行時の裏アクション等の指示書
}

export interface Character {
  id: string;
  name: string;
  roleType: RoleType;
  isCulpritCandidate: boolean; // 容疑者候補か否か
  profession: string;          // 職業・肩書
  handout: HandoutContent;
}

export interface PublicEvidence {
  id: string;
  title: string;              // 証拠名
  foundPhase: number;         // 発見フェーズ
  objectiveDescription: string; // 客観的事実
}

export interface InterpretationLink {
  id: string;
  evidenceId: string;         // 紐づく公開証拠ID
  characterId: string;        // 解釈可能なキャラクターID
  specializedKnowledge: string; // 当該PCが持つ専門知識
  derivedConclusion: string;  // 導き出される新事実
  isCrucialForSolution: boolean;
}

export interface LockCriterion {
  id: string;
  name: string;               // 条件名（例: 犯行可能場所、特定動機など）
  description: string;
}

export interface CandidateLockStatus {
  characterId: string;
  locks: Record<string, boolean>; // criterionId -> true(該当)/false(反証あり)
  rebuttalNote: string;           // アリバイや反証理由
}

export interface PhaseStep {
  phaseNumber: number;
  title: string;
  goals: string[];
  publicEvents: string[];
  secretEvents: string[];
}

export interface ProjectMeta {
  id: string;
  title: string;
  logline: string;
  genreTheme: string;
  playerCount: number;
  estimatedDurationMin: number;
  hasGm: boolean;
  informationStyle: 'all_open' | 'secret_trading' | 'hybrid';
  customRules: string[];
}

export interface MMProject {
  meta: ProjectMeta;
  characters: Character[];
  evidences: PublicEvidence[];
  matrixLinks: InterpretationLink[];
  lockCriteria: LockCriterion[];
  candidateStatuses: CandidateLockStatus[];
  phases: PhaseStep[];
}
