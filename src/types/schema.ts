/**
 * MM-Workbench - コアデータモデル定義
 * 特定のシナリオに依存しない汎用的なゲームデザイン構造
 */

export type RoleType = 'suspect' | 'investigator' | 'neutral' | 'special';

export interface CharacterInternalDrama {
  pride: string;       // 専門職としての誇り・自負
  guilt: string;       // 後ろめたさ・過去の過失・秘密
  loss: string;        // 喪失体験・トラウマ・後悔
}

export interface CharacterCapability {
  id: string;
  name: string;        // 能力・権限・アクション名
  description: string; // アクション内容・効果
  targetPhase: number; // 実行可能フェーズ/Day (1-7)
  unlockedEvidenceIds?: string[]; // このアクションで入手可能な証拠ID
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
  location: 'headquarters' | 'field' | 'other'; // 東京司令部/現地/その他
  introduction: string;        // イントロダクション（プレイヤー導入文）
  capabilities: CharacterCapability[]; // できること（固有能力・権限）
  initialItems: string[];      // 初期所持品（拾った小さな隕石など）
  handout: HandoutContent;
}

export type EvidenceVisibility = 'private' | 'shareable' | 'public';

export interface EvidenceItem {
  id: string;
  title: string;               // 証拠名
  description: string;         // 詳細テキスト
  ownerId: string;             // 入手者ID ('all' または characterId)
  foundPhase: number;          // 入手フェーズ/Day (1-7)
  visibility: EvidenceVisibility; // 公開区分 (個別秘匿 / 譲渡可能 / 全体公開)
  acquisitionCondition?: string;  // 入手条件・関連アクション
  category: 'document' | 'data' | 'sample' | 'testimony' | 'audio';
}

export interface IncidentStep {
  dayNumber: number;           // Day 1-7
  locationName: string;        // 地点名
  distanceKm: number;          // 累積移動距離 (km)
  situationTitle: string;      // 状況タイトル
  incidentOverview: string;    // 発生事象・地質異変
  hqResponse: string;          // 司令部・公的機関の動き
  fieldResponse: string;       // 現地救難隊の動き
  revealedEvidenceIds: string[]; // このDayで開示される証拠
}

export interface CrypticWord {
  id: string;
  symbol: string;              // パルス記号 (例: "●●●")
  meaning: string;             // 意味 (例: "自分", "集まれ", "警戒", "敵", "餌")
  soundPattern: string;        // 音響特性・テンポ
  assignedCharId: string;      // この知識を持つPC
  clueSource: string;          // 手がかりの由来 (研究ノート、古文書、古謡等)
}

export interface CrypticGrammar {
  ruleDescription: string;     // 文法規則の説明
  correctSequence: string[];   // 正しい単語IDの並び順
  combinedMessage: string;     // 合成されるメッセージ
  holderCharId: string;        // 文法規則を知るPC
}

export interface InterpretationLink {
  id: string;
  evidenceId: string;          // 紐づく公開証拠ID
  characterId: string;         // 解釈可能なキャラクターID
  specializedKnowledge: string; // 当該PCが持つ専門知識
  derivedConclusion: string;   // 導き出される新事実
  isCrucialForSolution: boolean;
}

export interface LockCriterion {
  id: string;
  name: string;                // 条件名
  description: string;
}

export interface CandidateLockStatus {
  characterId: string;
  locks: Record<string, boolean>; // criterionId -> true/false
  rebuttalNote: string;
}

export interface MMProject {
  title: string;
  subtitle: string;
  playerCount: number;
  durationHours: number;
  hasGm: boolean;
  characters: Character[];
  evidences: EvidenceItem[];
  timeline: IncidentStep[];
  crypticWords: CrypticWord[];
  crypticGrammar: CrypticGrammar;
  matrixLinks: InterpretationLink[];
  lockCriteria: LockCriterion[];
  candidateStatuses: CandidateLockStatus[];
}

