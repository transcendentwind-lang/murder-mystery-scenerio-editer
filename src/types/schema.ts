/**
 * MM-Workbench - コアデータモデル定義
 * 特定のシナリオに依存しない汎用的なゲームデザイン構造
 */

export type RoleType = 'suspect' | 'investigator' | 'neutral' | 'special';

export interface CharacterInternalDrama {
  pride: string;       // 専門職としての誇り・自負
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
  category: 'document' | 'data' | 'sample' | 'testimony' | 'audio' | 'research_note';
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

export type DocumentThemeId =
  | 'classified_dossier'
  | 'official_report'
  | 'ancient_scroll'
  | 'digital_telemetry'
  | 'medical_forensic'
  | 'field_expedition'
  | 'modern_sleek'
  | 'gm_tactical_binder'
  | 'gm_script_book';

export type DocumentAccentColor = 'indigo' | 'crimson' | 'emerald' | 'amber' | 'cyan' | 'slate';
export type DocumentPaperStyle = 'clean_white' | 'warm_parchment' | 'dossier_cream' | 'blueprint_grid';
export type DocumentBorderStyle = 'double_official' | 'classic_ornament' | 'tech_corner' | 'hazard_stripe' | 'minimal_line';

export interface DocumentDesignOverride {
  themeId: DocumentThemeId;
  accentColor: DocumentAccentColor;
  paperStyle: DocumentPaperStyle;
  borderStyle: DocumentBorderStyle;
  fontFamily: 'serif' | 'sans' | 'mono';
  stampText: string;           // 例: "極秘 / TOP SECRET", "取扱注意", "社務古記録", "緊急電文"
  organizationHeader: string;  // 例: "統合危機管理対策本部", "現地調査班"
  documentCode: string;        // 例: "DOC-01-A", "HO-PC1"
  footerNote: string;          // フッター署名・管理注記
  customPromptUsed?: string;   // AI生成時のプロンプト履歴
}

export interface VisualBoardItem {
  id: string;
  title: string;
  subtitle: string;
  boardType:
    | 'route_map'
    | 'day1_map_white'
    | 'day1_map_gm'
    | 'aerial_photo'
    | 'day3_tactical'
    | 'day3_photo'
    | 'day3_eruption'
    | 'day4_eruption'
    | 'day5_eruption'
    | 'day6_eruption'
    | 'day7_eruption'
    | 'day1_map'
    | 'sector_grid'
    | 'seismic_chart'
    | 'cryptic_sheet'
    | 'custom_image'
    | string;
  dayNumber: number;
  captionTitle?: string;
  captionBody?: string;
  annotations?: string[];
  imageUrl?: string;
  showGmSecrets?: boolean;
  orientation?: 'portrait' | 'landscape_rotated';
  hasWhiteMargin?: boolean;
}

export interface GmProgressionNote {
  dayNumber: number;
  targetMinutes: number;
  readAloudScript: string;
  gmCheckpoints: string[];
  bgmCue: string;
}

export interface SpecialCharacterCard {
  id: string;
  cardCode: string;            // 例: "SP-01"
  characterId: string;         // 例: "pc-1"
  characterName: string;       // 例: "朝潮（あさしお）"
  profession: string;          // 例: "海上保安庁東京本部 危機管理官"
  revealDayLabel: string;      // 例: "初期配布", "Day 2 配布"
  revealDayNumber: number;     // 1〜6 (初期は1)
  title: string;               // カードタイトル
  frontTitleHtml?: string;     // オモテ面改行整形用
  description: string;         // カード詳細テキスト
  categoryLabel: string;       // 例: "特別配布カード・所持品", "特別配布カード・専用記憶"
  accentHex: string;           // バッジ背景色
  fivePlayerFallbackNote?: string; // 5名プレイ時・6名プレイ時の代替配布注記
}

export interface MMProject {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  subtitle: string;
  concept: string;             // 作品コンセプト・世界観
  targetExperience: string;    // プレイヤーが味わう体験
  plotSummary: string;         // プロット紹介（あらすじ・真相・解決法）
  gimmickOverview: string;     // コアギミックの紹介
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
  documentDesigns?: Record<string, DocumentDesignOverride>;
  visualBoards?: VisualBoardItem[];
  gmNotes?: Record<number, GmProgressionNote>;
  specialCharacterCards?: SpecialCharacterCard[];
}


