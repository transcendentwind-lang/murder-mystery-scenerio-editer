"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MMProject,
  Character,
  EvidenceItem,
  IncidentStep,
  DocumentThemeId,
  DocumentAccentColor,
  DocumentPaperStyle,
  DocumentBorderStyle,
  DocumentDesignOverride,
  VisualBoardItem,
  GmProgressionNote,
  EvidenceVisibility,
} from "@/types/schema";
import {
  Sparkles,
  Printer,
  Save,
  Check,
  Users,
  FileText,
  Map,
  Radio,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Palette,
  Stamp,
  Building2,
  Hash,
  Type,
  Layers,
  ShieldAlert,
  Lock,
  Unlock,
  Upload,
  Compass,
  Crosshair,
  Activity,
  Grid,
  Clock,
  CheckSquare,
  Volume2,
  BookOpen,
  RotateCcw,
} from "lucide-react";

interface DocumentDesignStudioProps {
  project: MMProject;
  onUpdateProject: (updater: MMProject | ((prev: MMProject) => MMProject)) => void;
  onSendAiPrompt?: (prompt: string) => void;
}

type StudioCategory = "handouts" | "evidences" | "visuals" | "gm_guides";

// テーマ定義マスター
const THEME_PRESETS: Record<
  DocumentThemeId,
  {
    name: string;
    badge: string;
    description: string;
    defaultAccent: DocumentAccentColor;
    defaultPaper: DocumentPaperStyle;
    defaultBorder: DocumentBorderStyle;
    defaultFont: "serif" | "sans" | "mono";
    defaultStamp: string;
    defaultHeader: string;
  }
> = {
  classified_dossier: {
    name: "極秘人物ファイル・指令書",
    badge: "個人HO推奨",
    description: "濃紺ヘッダー帯・IDバッジを備えた個人配布用ブリーフィングシート",
    defaultAccent: "indigo",
    defaultPaper: "dossier_cream",
    defaultBorder: "double_official",
    defaultFont: "sans",
    defaultStamp: "極秘指令 / EYES ONLY",
    defaultHeader: "総合危機管理対策本部・人事記録局",
  },
  official_report: {
    name: "公文書・機密調査報告書",
    badge: "公的証拠推奨",
    description: "官公庁・調査機関の公式報告書スタイル。3連承認印枠・文書番号・斜め赤スタンプ付き",
    defaultAccent: "crimson",
    defaultPaper: "clean_white",
    defaultBorder: "double_official",
    defaultFont: "serif",
    defaultStamp: "取扱注意 / CONFIDENTIAL",
    defaultHeader: "特命調査委員会・公式記録文書",
  },
  ancient_scroll: {
    name: "古文書・伝承記録・手記",
    badge: "伝承・日誌推奨",
    description: "和紙・羊皮紙調の温かみある背景と古典飾り枠、朱印風落款を備えた歴史資料・手記スタイル",
    defaultAccent: "amber",
    defaultPaper: "warm_parchment",
    defaultBorder: "classic_ornament",
    defaultFont: "serif",
    defaultStamp: "門外不出・古記録",
    defaultHeader: "伝承文献編纂室・史料保管庫",
  },
  digital_telemetry: {
    name: "通信傍受ログ・科学観測データ",
    badge: "通信・解析推奨",
    description: "計測方眼グリッド・テクニカルコーナー枠・波形インジケーターを備えた科学・通信レポート",
    defaultAccent: "cyan",
    defaultPaper: "blueprint_grid",
    defaultBorder: "tech_corner",
    defaultFont: "mono",
    defaultStamp: "TELEMETRY VERIFIED",
    defaultHeader: "広域観測ネットワーク・信号解析班",
  },
  medical_forensic: {
    name: "鑑識・生体分析・救護カルテ",
    badge: "鑑定・医療推奨",
    description: "検体識別バー・クロスヘア標識・分析所見ボックスを備えた科学鑑定・医療記録シート",
    defaultAccent: "emerald",
    defaultPaper: "clean_white",
    defaultBorder: "minimal_line",
    defaultFont: "sans",
    defaultStamp: "検体分析済 / BIO-LAB",
    defaultHeader: "先端生体科学研究所・救護医療班",
  },
  field_expedition: {
    name: "現地調査隊・緊急フィールドノート",
    badge: "現場記録推奨",
    description: "ハザードストライプ帯と現場メモ枠を備えた、緊迫感ある現地調査・目撃記録スタイル",
    defaultAccent: "amber",
    defaultPaper: "dossier_cream",
    defaultBorder: "hazard_stripe",
    defaultFont: "sans",
    defaultStamp: "現場緊急報告 / FIELD LOG",
    defaultHeader: "現地前線指揮所・緊急救難隊",
  },
  modern_sleek: {
    name: "モダン・ミステリーシート",
    badge: "汎用・高視認性",
    description: "余白とタイポグラフィを活かした、どんな世界観でも読みやすい洗練された配布シート",
    defaultAccent: "slate",
    defaultPaper: "clean_white",
    defaultBorder: "minimal_line",
    defaultFont: "sans",
    defaultStamp: "INVESTIGATION FILE",
    defaultHeader: "SCENARIO ARCHIVE SYSTEM",
  },
  gm_tactical_binder: {
    name: "GM進行マスターバインダー",
    badge: "GM進行推奨",
    description: "時間配分・読み上げト書きボックス・2拠点対比・開示チェックリストを整理したGM専用進行表",
    defaultAccent: "indigo",
    defaultPaper: "clean_white",
    defaultBorder: "tech_corner",
    defaultFont: "sans",
    defaultStamp: "GM MASTER ONLY",
    defaultHeader: "GAME MASTER TACTICAL CONTROL",
  },
  gm_script_book: {
    name: "GM朗読・演出台本スタイル",
    badge: "GM演出推奨",
    description: "情景描写の読み上げとBGM/演出キュー、PC個別誘導を見やすく配置した舞台台本風シート",
    defaultAccent: "crimson",
    defaultPaper: "dossier_cream",
    defaultBorder: "double_official",
    defaultFont: "serif",
    defaultStamp: "DIRECTOR SCRIPT",
    defaultHeader: "NARRATIVE DIRECTION & CUE SHEET",
  },
};

// アクセントカラー別のスタイルパレット（画面表示用・印刷両対応）
const ACCENT_STYLES: Record<
  DocumentAccentColor,
  {
    headerBg: string;
    headerText: string;
    borderMain: string;
    borderSub: string;
    badgeBg: string;
    badgeText: string;
    stampBorder: string;
    stampText: string;
    sectionTitleText: string;
    sectionTitleBg: string;
    highlightBoxBg: string;
    highlightBoxBorder: string;
    hexPrimary: string;
    hexLight: string;
  }
> = {
  indigo: {
    headerBg: "bg-indigo-950",
    headerText: "text-indigo-50",
    borderMain: "border-indigo-900",
    borderSub: "border-indigo-300",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-900",
    stampBorder: "border-red-700/80",
    stampText: "text-red-700/85",
    sectionTitleText: "text-indigo-950",
    sectionTitleBg: "bg-indigo-100/80",
    highlightBoxBg: "bg-indigo-50/70",
    highlightBoxBorder: "border-indigo-300",
    hexPrimary: "#1e1b4b",
    hexLight: "#eef2ff",
  },
  crimson: {
    headerBg: "bg-rose-950",
    headerText: "text-rose-50",
    borderMain: "border-rose-900",
    borderSub: "border-rose-300",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-900",
    stampBorder: "border-red-700",
    stampText: "text-red-700",
    sectionTitleText: "text-rose-950",
    sectionTitleBg: "bg-rose-100/80",
    highlightBoxBg: "bg-rose-50/70",
    highlightBoxBorder: "border-rose-300",
    hexPrimary: "#4c0519",
    hexLight: "#fff1f2",
  },
  emerald: {
    headerBg: "bg-emerald-950",
    headerText: "text-emerald-50",
    borderMain: "border-emerald-900",
    borderSub: "border-emerald-300",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
    stampBorder: "border-emerald-800",
    stampText: "text-emerald-800",
    sectionTitleText: "text-emerald-950",
    sectionTitleBg: "bg-emerald-100/80",
    highlightBoxBg: "bg-emerald-50/70",
    highlightBoxBorder: "border-emerald-300",
    hexPrimary: "#022c22",
    hexLight: "#ecfdf5",
  },
  amber: {
    headerBg: "bg-amber-950",
    headerText: "text-amber-50",
    borderMain: "border-amber-900",
    borderSub: "border-amber-400/80",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-950",
    stampBorder: "border-red-800/85",
    stampText: "text-red-800/85",
    sectionTitleText: "text-amber-950",
    sectionTitleBg: "bg-amber-200/60",
    highlightBoxBg: "bg-amber-100/40",
    highlightBoxBorder: "border-amber-400/80",
    hexPrimary: "#451a03",
    hexLight: "#fffbeb",
  },
  cyan: {
    headerBg: "bg-cyan-950",
    headerText: "text-cyan-50",
    borderMain: "border-cyan-900",
    borderSub: "border-cyan-300",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-950",
    stampBorder: "border-cyan-800",
    stampText: "text-cyan-800",
    sectionTitleText: "text-cyan-950",
    sectionTitleBg: "bg-cyan-100/80",
    highlightBoxBg: "bg-cyan-50/70",
    highlightBoxBorder: "border-cyan-300",
    hexPrimary: "#083344",
    hexLight: "#ecfeff",
  },
  slate: {
    headerBg: "bg-slate-900",
    headerText: "text-slate-50",
    borderMain: "border-slate-800",
    borderSub: "border-slate-300",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-900",
    stampBorder: "border-red-700/80",
    stampText: "text-red-700/80",
    sectionTitleText: "text-slate-900",
    sectionTitleBg: "bg-slate-200/80",
    highlightBoxBg: "bg-slate-100/80",
    highlightBoxBorder: "border-slate-300",
    hexPrimary: "#0f172a",
    hexLight: "#f8fafc",
  },
};

// 用紙背景スタイル
const PAPER_STYLES: Record<DocumentPaperStyle, { name: string; className: string; bgCss: string }> = {
  clean_white: {
    name: "クリアホワイト（標準A4紙）",
    className: "bg-white text-slate-900",
    bgCss: "#ffffff",
  },
  dossier_cream: {
    name: "機密ファイル・クリーム紙",
    className: "bg-[#faf8f2] text-slate-900",
    bgCss: "#faf8f2",
  },
  warm_parchment: {
    name: "古文書・和紙羊皮紙トーン",
    className: "bg-[#f5eedc] text-stone-900",
    bgCss: "#f5eedc",
  },
  blueprint_grid: {
    name: "科学解析・方眼レポート紙",
    className:
      "bg-[#f4f9fc] text-slate-900 bg-[linear-gradient(to_right,#e2eef5_1px,transparent_1px),linear-gradient(to_bottom,#e2eef5_1px,transparent_1px)] bg-[size:20px_20px]",
    bgCss: "#f4f9fc",
  },
};

// デフォルトの全体提示ビジュアル資料一覧を生成するヘルパー
function getDefaultVisualBoards(project: MMProject): VisualBoardItem[] {
  if (project.visualBoards && project.visualBoards.length > 0) {
    return project.visualBoards;
  }
  const step1 = project.timeline?.[0];
  const step2 = project.timeline?.[1];
  const step3 = project.timeline?.[2];
  const step5 = project.timeline?.[4];
  const step6 = project.timeline?.[5];

  return [
    {
      id: "vis-route-map",
      title: `${project.title} ― 広域進行ルート・距離観測マップ`,
      subtitle: "全フェーズの移動軌跡と観測ポイント一覧",
      boardType: "route_map",
      dayNumber: 1,
      captionTitle: "【広域状況ブリーフィング】",
      captionBody:
        "本図は事象発生地点から最終防衛ラインに至る広域位置関係と、各フェーズにおける観測地点・累積移動距離を示した全体共有マップである。各班は現在位置と到達予測時間を常に照合すること。",
      annotations: [
        "各フェーズの進行に伴い、観測地点が北上・移動していく軌跡を示す",
        "司令部と現地班の情報共有により、次フェーズの到達予測地点を特定可能",
        "地図上の各ポイント名・距離・状況メモは直接クリックして書き換え可能です",
      ],
      showGmSecrets: false,
    },
    {
      id: "vis-day1-map",
      title: step1 ? `Phase 1 現場見取り図：${step1.locationName}` : "Phase 1 初期現場周辺マップ",
      subtitle: step1 ? step1.situationTitle : "初期事象発生ポイントと周辺配置図",
      boardType: "day1_map",
      dayNumber: 1,
      captionTitle: "【初期現場状況・配置記録】",
      captionBody:
        step1?.incidentOverview ||
        "初期事象が発生した現場周辺の戦術見取り図。気象・通信の乱れおよび現場到着時の初期配置を示す。",
      annotations: [
        `現場対応: ${step1?.fieldResponse || "初期状況の確認と安全確保"}`,
        `後方対応: ${step1?.hqResponse || "広域モニタリングと通信回線の確保"}`,
      ],
      showGmSecrets: false,
    },
    {
      id: "vis-aerial-photo",
      title: step2 ? `緊急偵察撮影記録：${step2.locationName}` : "緊急航空偵察・撮影記録フレーム",
      subtitle: "高高度偵察機による現場撮影および画像解析レポート",
      boardType: "aerial_photo",
      dayNumber: 2,
      captionTitle: "【画像解析班・初期所見】",
      captionBody:
        "現場上空より撮影された視覚記録。異常な航跡波および巨大な影の輪郭が確認される。各専門家は自身の知見と照合し、対象物の特性を分析されたい。",
      annotations: [
        "撮影高度: 1,500ft / 光学・赤外線デュアルセンサー記録",
        "海面直下に通常船舶とは異なる巨大なシルエットと特有の波紋を検出",
        "※任意の画像ファイルをアップロードしてこの写真枠に差し替えることも可能です",
      ],
      showGmSecrets: false,
    },
    {
      id: "vis-sector-grid",
      title: step3 ? `広域索敵座標グリッド（36セクター）：${step3.locationName}` : "広域索敵用 6×6 座標グリッドマップ",
      subtitle: "A-1 〜 F-6 セクター別探知・捜索ワークシート",
      boardType: "sector_grid",
      dayNumber: 3,
      captionTitle: "【索敵・探知ルールと座標マップ】",
      captionBody:
        "対象エリアを36のセクター（A-1〜F-6）に分割した戦術索敵図。プレイヤーは手番ごとに調査したい座標を指定し、観測結果から対象物の現在位置を特定する。",
      annotations: [
        "直下探知：対象が存在するセクターを直接指定した場合、即座に捕捉成功",
        "隣接反応：対象の上下左右・斜め隣接セクターを指定した場合、至近反応を検知",
        "探知妨害：環境ノイズ源の周囲では信号が散乱し探知不能となる場合がある",
      ],
      showGmSecrets: false,
    },
    {
      id: "vis-seismic-chart",
      title: step5 ? `広域観測波形・連動リスク予測図：${step5.locationName}` : "広域観測波形・リスク推移チャート",
      subtitle: "移動震源と地殻・環境影響の相関グラフ",
      boardType: "seismic_chart",
      dayNumber: 5,
      captionTitle: "【観測データ統合解析チャート】",
      captionBody:
        step5?.incidentOverview ||
        "各観測点における異常振動波形と、進行ルート上の連鎖リスクを示した解析図。放置した場合の最終到達ラインへの影響予測を含む。",
      annotations: [
        "通常の自然現象とは異なる周期的なパルス波形を検出",
        "移動ルート上の特定ポイントを通過するごとに影響指数が段階的に上昇",
      ],
      showGmSecrets: false,
    },
    {
      id: "vis-cryptic-sheet",
      title: step6 ? `信号・暗号パターン解読ワークシート` : "信号・暗号パターン解読シート",
      subtitle: "観測された記号配列と意味の照合記録表",
      boardType: "cryptic_sheet",
      dayNumber: 6,
      captionTitle: "【解読ワークシート（全体共有資料）】",
      captionBody:
        project.crypticGrammar?.ruleDescription ||
        "各プレイヤーが保有する手がかりを持ち寄り、記号の意味と正しい並び順（文法規則）を特定するための全体共有シート。",
      annotations: [
        "各記号の音響・波形パターンと、各自の専門文献・記録を照合すること",
        "「プレイヤー配布用（空欄ワークシート）」と「GM確認用（正解入り）」を切り替え可能",
      ],
      showGmSecrets: false,
    },
  ];
}

// デフォルトのGM進行ノートを取得するヘルパー
function getGmNoteForDay(project: MMProject, dayNumber: number): GmProgressionNote {
  if (project.gmNotes && project.gmNotes[dayNumber]) {
    return project.gmNotes[dayNumber];
  }
  const step = project.timeline.find((t) => t.dayNumber === dayNumber) || project.timeline[0];
  return {
    dayNumber,
    targetMinutes: dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25,
    readAloudScript:
      step?.incidentOverview ||
      `【Day ${dayNumber} 導入読み上げ】\n状況をプレイヤー全員に提示し、各班のアクション選択および情報共有を開始してください。`,
    gmCheckpoints: [
      `Day ${dayNumber} 開始時に全体状況をアナウンスし、制限時間（目安 ${
        dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25
      }分）をタイマーセットする`,
      `このフェーズで開示可能な証拠（${(step?.revealedEvidenceIds || []).length}件）の取得条件を確認する`,
      `議論が停滞している場合は、各PCの「固有能力」や「専門知識」の活用を促す`,
    ],
    bgmCue:
      dayNumber <= 2
        ? "静かな緊迫感・環境音（深海・無線ノイズ）"
        : dayNumber <= 5
        ? "捜査・解析フェーズBGM（中テンポ・サスペンス）"
        : "クライマックス・決断BGM（高揚感のあるオーケストラ）",
  };
}

// ドキュメント固有のデザイン設定を取得するヘルパー
function getDesignForKey(
  project: MMProject,
  docKey: string,
  category: StudioCategory,
  evidenceCategory?: EvidenceItem["category"]
): DocumentDesignOverride {
  if (project.documentDesigns && project.documentDesigns[docKey]) {
    return project.documentDesigns[docKey];
  }

  let defaultTheme: DocumentThemeId = "official_report";
  if (category === "handouts") {
    defaultTheme = "classified_dossier";
  } else if (category === "evidences") {
    if (evidenceCategory === "data" || evidenceCategory === "audio") {
      defaultTheme = "digital_telemetry";
    } else if (evidenceCategory === "sample") {
      defaultTheme = "medical_forensic";
    } else if (evidenceCategory === "testimony") {
      defaultTheme = "field_expedition";
    } else {
      defaultTheme = "official_report";
    }
  } else if (category === "visuals") {
    defaultTheme = "digital_telemetry";
  } else if (category === "gm_guides") {
    defaultTheme = "gm_tactical_binder";
  }

  const preset = THEME_PRESETS[defaultTheme];
  return {
    themeId: defaultTheme,
    accentColor: preset.defaultAccent,
    paperStyle: preset.defaultPaper,
    borderStyle: preset.defaultBorder,
    fontFamily: preset.defaultFont,
    stampText: preset.defaultStamp,
    organizationHeader: preset.defaultHeader,
    documentCode: `REF-${docKey.toUpperCase().slice(0, 10)}`,
    footerNote: `${project.title} ― 公式配布・進行資料`,
  };
}

// Gemini AI プロンプトからデザイン枠設定を生成するインテリジェント関数
function generateDesignFromAiPrompt(
  prompt: string,
  currentDesign: DocumentDesignOverride,
  projectTitle: string
): { nextDesign: DocumentDesignOverride; explanation: string } {
  const p = prompt.toLowerCase();
  let themeId: DocumentThemeId = currentDesign.themeId;
  let accentColor: DocumentAccentColor = currentDesign.accentColor;
  let paperStyle: DocumentPaperStyle = currentDesign.paperStyle;
  let borderStyle: DocumentBorderStyle = currentDesign.borderStyle;
  let fontFamily: "serif" | "sans" | "mono" = currentDesign.fontFamily;
  let stampText = currentDesign.stampText;
  let organizationHeader = currentDesign.organizationHeader;

  if (
    p.includes("古文書") ||
    p.includes("神社") ||
    p.includes("伝承") ||
    p.includes("和紙") ||
    p.includes("歴史") ||
    p.includes("日誌") ||
    p.includes("手記") ||
    p.includes("羊皮紙")
  ) {
    themeId = "ancient_scroll";
    accentColor = "amber";
    paperStyle = "warm_parchment";
    borderStyle = "classic_ornament";
    fontFamily = "serif";
    stampText = p.includes("神社") ? "社務秘蔵・禁帯出" : "古記録・伝承史料";
    organizationHeader = p.includes("神社")
      ? "古社社務所・伝承古記録保管庫"
      : "歴史文献・航海手記アーカイブ";
  } else if (
    p.includes("通信") ||
    p.includes("ソナー") ||
    p.includes("デジタル") ||
    p.includes("波形") ||
    p.includes("衛星") ||
    p.includes("観測") ||
    p.includes("サイバー") ||
    p.includes("電文")
  ) {
    themeId = "digital_telemetry";
    accentColor = "cyan";
    paperStyle = "blueprint_grid";
    borderStyle = "tech_corner";
    fontFamily = "mono";
    stampText = p.includes("緊急") ? "緊急傍受電文 / URGENT" : "TELEMETRY LOG / 解析済";
    organizationHeader = "広域通信傍受・海洋音響解析ネットワーク";
  } else if (
    p.includes("医療") ||
    p.includes("カルテ") ||
    p.includes("鑑定") ||
    p.includes("生体") ||
    p.includes("解剖") ||
    p.includes("科学") ||
    p.includes("分析") ||
    p.includes("研究所")
  ) {
    themeId = "medical_forensic";
    accentColor = "emerald";
    paperStyle = "clean_white";
    borderStyle = "minimal_line";
    fontFamily = "sans";
    stampText = "検体分析・医療機密 / BIO-LAB";
    organizationHeader = "先端生体科学鑑定室・緊急医療救護班";
  } else if (
    p.includes("極秘") ||
    p.includes("防衛") ||
    p.includes("公文書") ||
    p.includes("政府") ||
    p.includes("警察") ||
    p.includes("海保") ||
    p.includes("指令") ||
    p.includes("赤")
  ) {
    themeId = "official_report";
    accentColor = "crimson";
    paperStyle = "clean_white";
    borderStyle = "double_official";
    fontFamily = "serif";
    stampText = "極秘・取扱注意 / TOP SECRET";
    organizationHeader = "政府総合危機管理対策本部・特命調査室";
  } else if (
    p.includes("現場") ||
    p.includes("緊急") ||
    p.includes("警報") ||
    p.includes("フィールド") ||
    p.includes("救難")
  ) {
    themeId = "field_expedition";
    accentColor = "amber";
    paperStyle = "dossier_cream";
    borderStyle = "hazard_stripe";
    fontFamily = "sans";
    stampText = "現場至急報 / FIELD ALERT";
    organizationHeader = "現地前線対策本部・緊急捜索救難隊";
  } else if (
    p.includes("gm") ||
    p.includes("進行") ||
    p.includes("台本") ||
    p.includes("朗読")
  ) {
    themeId = p.includes("台本") || p.includes("朗読") ? "gm_script_book" : "gm_tactical_binder";
    accentColor = p.includes("台本") ? "crimson" : "indigo";
    paperStyle = "clean_white";
    borderStyle = "tech_corner";
    fontFamily = p.includes("台本") ? "serif" : "sans";
    stampText = "GM進行マスター専用";
    organizationHeader = `${projectTitle} ― GM進行・演出管理シート`;
  } else if (
    p.includes("モダン") ||
    p.includes("シンプル") ||
    p.includes("スッキリ") ||
    p.includes("現代")
  ) {
    themeId = "modern_sleek";
    accentColor = "slate";
    paperStyle = "clean_white";
    borderStyle = "minimal_line";
    fontFamily = "sans";
    stampText = "INVESTIGATION RECORD";
    organizationHeader = `${projectTitle} ― 調査資料アーカイブ`;
  } else {
    themeId = "classified_dossier";
    accentColor = "indigo";
    paperStyle = "dossier_cream";
    borderStyle = "double_official";
    fontFamily = "sans";
    stampText = "CONFIDENTIAL / 特命配布資料";
    organizationHeader = `${projectTitle} ― 特命対策チーム記録`;
  }

  return {
    nextDesign: {
      ...currentDesign,
      themeId,
      accentColor,
      paperStyle,
      borderStyle,
      fontFamily,
      stampText,
      organizationHeader,
      customPromptUsed: prompt,
    },
    explanation: `Geminiデザインエンジンにより「${THEME_PRESETS[themeId].name}」をベースに、用紙質感（${PAPER_STYLES[paperStyle].name}）・スタンプ（${stampText}）・発令ヘッダーを自動構成しました。`,
  };
}

export const DocumentDesignStudio: React.FC<DocumentDesignStudioProps> = ({
  project,
  onUpdateProject,
  onSendAiPrompt,
}) => {
  const [category, setCategory] = useState<StudioCategory>("handouts");
  const [selectedCharId, setSelectedCharId] = useState<string>(project.characters[0]?.id || "pc-1");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    project.evidences[0]?.id || ""
  );
  const [evidenceDayFilter, setEvidenceDayFilter] = useState<number | "all">("all");
  const [selectedVisualId, setSelectedVisualId] = useState<string>("vis-route-map");
  const [selectedGmDay, setSelectedGmDay] = useState<number>(1);

  // 画面内テキスト直接編集モード vs 純粋プレビューモード
  const [isDirectEditMode, setIsDirectEditMode] = useState<boolean>(true);
  // 個人HOでのGM用ガイド表示切替（プレイヤー配布時はOFF推奨）
  const [showGmGuideInHo, setShowGmGuideInHo] = useState<boolean>(false);

  // Gemini デザイン生成プロンプト入力
  const [aiDesignPrompt, setAiDesignPrompt] = useState<string>("");
  const [aiDesignFeedback, setAiDesignFeedback] = useState<string>("");
  const [isDesignCustomizerOpen, setIsDesignCustomizerOpen] = useState<boolean>(false);

  // 保存フィードバック表示
  const [saveStatus, setSaveStatus] = useState<"saved" | "dirty" | "just_saved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("自動同期中");

  // 印刷対象領域のRef
  const printableSheetRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 視覚ボード一覧（プロジェクトに未保存の場合は初期ボードを使用）
  const visualBoards = getDefaultVisualBoards(project);

  // 現在選択されているアイテムの特定
  const activeChar =
    project.characters.find((c) => c.id === selectedCharId) || project.characters[0];

  const filteredEvidences =
    evidenceDayFilter === "all"
      ? project.evidences
      : project.evidences.filter((e) => e.foundPhase === evidenceDayFilter);

  const activeEvidence =
    project.evidences.find((e) => e.id === selectedEvidenceId) ||
    filteredEvidences[0] ||
    project.evidences[0];

  const activeVisual =
    visualBoards.find((v) => v.id === selectedVisualId) || visualBoards[0];

  const activeTimelineStep =
    project.timeline.find((t) => t.dayNumber === selectedGmDay) || project.timeline[0];

  const activeGmNote = getGmNoteForDay(project, selectedGmDay);

  // 現在のドキュメントキーとデザイン設定
  const currentDocKey =
    category === "handouts"
      ? `ho-${activeChar?.id || "pc-1"}`
      : category === "evidences"
      ? `ev-${activeEvidence?.id || "default"}`
      : category === "visuals"
      ? `vis-${activeVisual?.id || "default"}`
      : `gm-day-${selectedGmDay}`;

  const currentDesign = getDesignForKey(
    project,
    currentDocKey,
    category,
    activeEvidence?.category
  );

  const accent = ACCENT_STYLES[currentDesign.accentColor] || ACCENT_STYLES.indigo;
  const paper = PAPER_STYLES[currentDesign.paperStyle] || PAPER_STYLES.clean_white;
  const fontClass =
    currentDesign.fontFamily === "serif"
      ? "font-serif"
      : currentDesign.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // 変更通知＆保存ヘルパー
  const triggerSaveFeedback = () => {
    setSaveStatus("just_saved");
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    setTimeout(() => {
      setSaveStatus("saved");
    }, 2500);
  };

  // 明示的な「保存」ボタン押下処理（キーボードショートカット Cmd/Ctrl+S 対応）
  const handleManualSave = () => {
    onUpdateProject((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
    triggerSaveFeedback();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // デザイン設定の更新
  const handleUpdateDesign = (partial: Partial<DocumentDesignOverride>) => {
    const nextDesign: DocumentDesignOverride = {
      ...currentDesign,
      ...partial,
    };
    onUpdateProject((prev) => ({
      ...prev,
      documentDesigns: {
        ...(prev.documentDesigns || {}),
        [currentDocKey]: nextDesign,
      },
    }));
    triggerSaveFeedback();
  };

  // テーマプリセットの一括適用
  const handleSelectThemePreset = (themeId: DocumentThemeId) => {
    const preset = THEME_PRESETS[themeId];
    handleUpdateDesign({
      themeId,
      accentColor: preset.defaultAccent,
      paperStyle: preset.defaultPaper,
      borderStyle: preset.defaultBorder,
      fontFamily: preset.defaultFont,
      stampText: preset.defaultStamp,
      organizationHeader: preset.defaultHeader,
    });
  };

  // Gemini AI によるデザイン枠生成・適用
  const handleApplyAiDesign = (customPrompt?: string) => {
    const targetPrompt = (customPrompt ?? aiDesignPrompt).trim();
    if (!targetPrompt) return;

    const { nextDesign, explanation } = generateDesignFromAiPrompt(
      targetPrompt,
      currentDesign,
      project.title
    );
    handleUpdateDesign(nextDesign);
    setAiDesignFeedback(explanation);
    if (!customPrompt) {
      setAiDesignPrompt("");
    }
  };

  // ① キャラクター＆ハンドアウトの直接更新ヘルパー
  const handleUpdateActiveChar = (updater: (c: Character) => Character) => {
    if (!activeChar) return;
    onUpdateProject((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => (c.id === activeChar.id ? updater(c) : c)),
    }));
    triggerSaveFeedback();
  };

  // ② 証拠資料の直接更新ヘルパー
  const handleUpdateActiveEvidence = (updater: (ev: EvidenceItem) => EvidenceItem) => {
    if (!activeEvidence) return;
    onUpdateProject((prev) => ({
      ...prev,
      evidences: prev.evidences.map((e) => (e.id === activeEvidence.id ? updater(e) : e)),
    }));
    triggerSaveFeedback();
  };

  const handleAddNewEvidence = () => {
    const newId = `ev-${Date.now()}`;
    const newEv: EvidenceItem = {
      id: newId,
      title: "新規調査記録・証拠資料",
      description:
        "ここに証拠の詳細テキストを入力してください。デザイン画面内で直接クリックして文章を編集・保存できます。",
      ownerId: "all",
      foundPhase: typeof evidenceDayFilter === "number" ? evidenceDayFilter : 1,
      visibility: "public",
      category: "document",
      acquisitionCondition: "調査アクションまたはフェーズ進行により開示",
    };
    onUpdateProject((prev) => ({
      ...prev,
      evidences: [...prev.evidences, newEv],
    }));
    setSelectedEvidenceId(newId);
    triggerSaveFeedback();
  };

  // ③ 全体提示ビジュアルボードの更新ヘルパー
  const handleUpdateActiveVisual = (updater: (v: VisualBoardItem) => VisualBoardItem) => {
    if (!activeVisual) return;
    const currentBoards = getDefaultVisualBoards(project);
    const updatedBoards = currentBoards.map((b) =>
      b.id === activeVisual.id ? updater(b) : b
    );
    onUpdateProject((prev) => ({
      ...prev,
      visualBoards: updatedBoards,
    }));
    triggerSaveFeedback();
  };

  const handleAddCustomVisualBoard = () => {
    const newId = `vis-custom-${Date.now()}`;
    const newBoard: VisualBoardItem = {
      id: newId,
      title: "新規 全体提示マップ・現場写真資料",
      subtitle: "プレイヤー全員に公開・提示する視覚資料シート",
      boardType: "custom_image",
      dayNumber: 1,
      captionTitle: "【視覚資料・現場解説】",
      captionBody:
        "ここに地図や写真に関する解説テキストを入力してください。上の「画像をアップロード」ボタンから手持ちの画像・図面を配置することも可能です。",
      annotations: [
        "注目ポイント①：クリックして注釈テキストを直接編集できます",
        "注目ポイント②：現場の位置関係や目撃情報をここに記載します",
      ],
      showGmSecrets: false,
    };
    const currentBoards = getDefaultVisualBoards(project);
    onUpdateProject((prev) => ({
      ...prev,
      visualBoards: [...currentBoards, newBoard],
    }));
    setSelectedVisualId(newId);
    triggerSaveFeedback();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleUpdateActiveVisual((v) => ({
          ...v,
          imageUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ④ GM進行資料（タイムライン＆GMノート）の更新ヘルパー
  const handleUpdateActiveTimelineStep = (updater: (step: IncidentStep) => IncidentStep) => {
    if (!activeTimelineStep) return;
    onUpdateProject((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) =>
        t.dayNumber === activeTimelineStep.dayNumber ? updater(t) : t
      ),
    }));
    triggerSaveFeedback();
  };

  const handleUpdateActiveGmNote = (updater: (note: GmProgressionNote) => GmProgressionNote) => {
    const currentNote = getGmNoteForDay(project, selectedGmDay);
    const updatedNote = updater(currentNote);
    onUpdateProject((prev) => ({
      ...prev,
      gmNotes: {
        ...(prev.gmNotes || {}),
        [selectedGmDay]: updatedNote,
      },
    }));
    triggerSaveFeedback();
  };

  // デザインされたシートをそのままA4/PDF印刷する関数
  const handlePrintDesignedSheet = () => {
    if (!printableSheetRef.current) return;

    // 一時的に直接編集モードの補助ボタン等を非表示にしたHTMLを取得するため、クローンを作成してinput/textareaをテキスト化
    const clone = printableSheetRef.current.cloneNode(true) as HTMLElement;

    // クローン内のtextareaとinputの現在値をプレーンテキスト要素に置換（印刷時にスクロールバー等で切れないようにする）
    const origTextareas = printableSheetRef.current.querySelectorAll("textarea");
    const cloneTextareas = clone.querySelectorAll("textarea");
    origTextareas.forEach((orig, idx) => {
      const target = cloneTextareas[idx];
      if (target) {
        const div = document.createElement("div");
        div.className = target.className;
        div.style.whiteSpace = "pre-wrap";
        div.style.wordBreak = "break-word";
        div.style.border = "none";
        div.style.background = "transparent";
        div.style.padding = "0";
        div.textContent = orig.value;
        target.parentNode?.replaceChild(div, target);
      }
    });

    const origInputs = printableSheetRef.current.querySelectorAll("input[type='text'], input[type='number']");
    const cloneInputs = clone.querySelectorAll("input[type='text'], input[type='number']");
    origInputs.forEach((orig, idx) => {
      const target = cloneInputs[idx];
      if (target) {
        const span = document.createElement("span");
        span.className = target.className;
        span.style.border = "none";
        span.style.background = "transparent";
        span.textContent = (orig as HTMLInputElement).value;
        target.parentNode?.replaceChild(span, target);
      }
    });

    // 印刷不要な操作ボタン（.no-print）を除去
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());

    const htmlContent = clone.outerHTML;
    const printWin = document.createElement("iframe");
    printWin.style.position = "fixed";
    printWin.style.right = "0";
    printWin.style.bottom = "0";
    printWin.style.width = "0";
    printWin.style.height = "0";
    printWin.style.border = "0";
    document.body.appendChild(printWin);

    const doc = printWin.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${project.title} - デザイン配布資料印刷</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
      doc.close();
      setTimeout(() => {
        printWin.contentWindow?.focus();
        printWin.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printWin)) {
            document.body.removeChild(printWin);
          }
        }, 3000);
      }, 600);
    }
  };

  // 枠線スタイルのクラス計算
  const getBorderFrameClasses = () => {
    switch (currentDesign.borderStyle) {
      case "double_official":
        return `border-4 double ${accent.borderMain} shadow-xl`;
      case "classic_ornament":
        return `border-2 ${accent.borderMain} ring-4 ring-inset ${accent.borderSub} shadow-xl`;
      case "tech_corner":
        return `border-2 ${accent.borderMain} shadow-xl`;
      case "hazard_stripe":
        return `border-t-8 border-b-8 border-l-2 border-r-2 ${accent.borderMain} shadow-xl`;
      case "minimal_line":
      default:
        return `border ${accent.borderSub} shadow-lg`;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. 最上部ヘッダー：4大資料カテゴリー切替 ＆ 保存・印刷コントロール */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-6 py-3">
        {/* 4大資料カテゴリータブ */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setCategory("handouts")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "handouts"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4 text-emerald-400" />
            ① 個人向けハンドアウト
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {project.characters.length}名
            </span>
          </button>

          <button
            onClick={() => setCategory("evidences")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "evidences"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            ② 証拠資料（文書・カード）
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {project.evidences.length}件
            </span>
          </button>

          <button
            onClick={() => setCategory("visuals")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "visuals"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Map className="h-4 w-4 text-cyan-400" />
            ③ 全体提示の地図・写真
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {visualBoards.length}枚
            </span>
          </button>

          <button
            onClick={() => setCategory("gm_guides")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "gm_guides"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Radio className="h-4 w-4 text-rose-400" />
            ④ GM用の進行資料
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              全{project.timeline.length}フェーズ
            </span>
          </button>
        </div>

        {/* 右側：直接編集トグル・保存ボタン・デザイン印刷ボタン */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 編集モード切替 */}
          <button
            onClick={() => setIsDirectEditMode(!isDirectEditMode)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              isDirectEditMode
                ? "border-indigo-500/60 bg-indigo-950/70 text-indigo-200"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
            title="デザインされた画面の中でそのまま文字を書き換えるモードと、印刷前の純粋な完成プレビューを切り替えます"
          >
            {isDirectEditMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                画面内テキスト直接編集：ON
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                完成プレビュー表示中（クリックで編集へ）
              </>
            )}
          </button>

          {/* 明示的保存ボタン + 保存ステータス */}
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow ${
              saveStatus === "just_saved"
                ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
            title="編集したテキストとデザイン枠の設定をシナリオデータへ保存します（Cmd/Ctrl+S）"
          >
            {saveStatus === "just_saved" ? (
              <>
                <Check className="h-4 w-4" />
                保存しました！（{lastSavedTime}）
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                💾 修正内容を保存
              </>
            )}
          </button>

          {/* デザインされたまま印刷 / PDF保存 */}
          <button
            onClick={handlePrintDesignedSheet}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/25"
            title="現在のデザイン枠・スタンプ・配色のままA4印刷またはPDF保存します"
          >
            <Printer className="h-4 w-4" />
            🖨️ このデザインで印刷 / PDF保存
          </button>
        </div>
      </div>

      {/* 2. Gemini AI フレームワーク生成・デザイン着せ替えバー */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 min-w-[320px]">
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-2.5 py-1 text-xs font-bold text-indigo-300 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Gemini デザイン枠生成
            </div>
            <input
              type="text"
              value={aiDesignPrompt}
              onChange={(e) => setAiDesignPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyAiDesign();
              }}
              placeholder="どんな雰囲気の資料にしたいですか？（例：『防衛省の極秘調査報告書風』『神社の古い和紙の伝承記録風』『緊急の通信傍受ログ風』）"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => handleApplyAiDesign()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shrink-0 shadow"
            >
              ✨ デザイン枠を適用
            </button>
          </div>

          {/* ワンクリック・デザイン着せ替えチップ */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">枠テーマ切替:</span>
            {(
              [
                ["classified_dossier", "📁 極秘指令書"],
                ["official_report", "🏛️ 公文書・報告書"],
                ["ancient_scroll", "📜 古文書・手記"],
                ["digital_telemetry", "📡 通信・観測データ"],
                ["medical_forensic", "🔬 鑑定・カルテ"],
                ["gm_tactical_binder", "📋 GM進行表"],
              ] as [DocumentThemeId, string][]
            ).map(([tId, label]) => (
              <button
                key={tId}
                onClick={() => handleSelectThemePreset(tId)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  currentDesign.themeId === tId
                    ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                    : "border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => setIsDesignCustomizerOpen(!isDesignCustomizerOpen)}
              className={`ml-1 flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold transition ${
                isDesignCustomizerOpen
                  ? "border-amber-500/60 bg-amber-950/60 text-amber-200"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Palette className="h-3 w-3 text-amber-400" />
              細かい枠・色・スタンプ調整
            </button>
          </div>
        </div>

        {/* AIデザイン適用フィードバック */}
        {aiDesignFeedback && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-xs text-indigo-200">
            <span>✨ {aiDesignFeedback}</span>
            <button
              onClick={() => setAiDesignFeedback("")}
              className="text-slate-400 hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 詳細デザイン枠カスタマイザー（開閉式） */}
        {isDesignCustomizerOpen && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3 md:grid-cols-5">
            {/* 色調 */}
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                🎨 アクセント色調
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["indigo", "濃紺", "bg-indigo-700"],
                    ["crimson", "機密赤", "bg-rose-700"],
                    ["amber", "古文書琥珀", "bg-amber-700"],
                    ["cyan", "通信シアン", "bg-cyan-700"],
                    ["emerald", "鑑定緑", "bg-emerald-700"],
                    ["slate", "モノトーン", "bg-slate-700"],
                  ] as [DocumentAccentColor, string, string][]
                ).map(([colorKey, label, dotClass]) => (
                  <button
                    key={colorKey}
                    onClick={() => handleUpdateDesign({ accentColor: colorKey })}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold border transition ${
                      currentDesign.accentColor === colorKey
                        ? "border-white bg-slate-800 text-white"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 用紙の質感 */}
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                📄 用紙・背景テクスチャ
              </label>
              <select
                value={currentDesign.paperStyle}
                onChange={(e) =>
                  handleUpdateDesign({ paperStyle: e.target.value as DocumentPaperStyle })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
              >
                <option value="clean_white">クリアホワイト（標準A4紙）</option>
                <option value="dossier_cream">機密ファイル・クリーム紙</option>
                <option value="warm_parchment">古文書・和紙羊皮紙トーン</option>
                <option value="blueprint_grid">科学解析・方眼レポート紙</option>
              </select>
            </div>

            {/* 飾り枠・ボーダー */}
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                🖼️ 外枠（フレーム）装飾
              </label>
              <select
                value={currentDesign.borderStyle}
                onChange={(e) =>
                  handleUpdateDesign({ borderStyle: e.target.value as DocumentBorderStyle })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
              >
                <option value="double_official">公文書二重枠（公式・重厚）</option>
                <option value="classic_ornament">古典飾り罫（伝承・手記）</option>
                <option value="tech_corner">テクニカル枠（通信・科学）</option>
                <option value="hazard_stripe">緊急ハザード帯（現場報告）</option>
                <option value="minimal_line">ミニマル細線（モダン）</option>
              </select>
            </div>

            {/* 書体（フォント） */}
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                🔤 本文・見出し書体
              </label>
              <div className="flex gap-1.5">
                {(
                  [
                    ["sans", "ゴシック体"],
                    ["serif", "明朝体"],
                    ["mono", "等幅通信体"],
                  ] as ["sans" | "serif" | "mono", string][]
                ).map(([fKey, fLabel]) => (
                  <button
                    key={fKey}
                    onClick={() => handleUpdateDesign({ fontFamily: fKey })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                      currentDesign.fontFamily === fKey
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {fLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* スタンプ印字 */}
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-400">
                💮 スタンプ印字文言
              </label>
              <input
                type="text"
                value={currentDesign.stampText}
                onChange={(e) => handleUpdateDesign({ stampText: e.target.value })}
                placeholder="例: 極秘 / TOP SECRET"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. メイン作業エリア：左サイドバー（資料リスト選択）＋ 右メインキャンバス（デザイン内直接編集シート） */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* 左サイドバー：カテゴリー内の資料一覧 */}
        <div className="col-span-3 flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          {/* ① 個人ハンドアウト選択リスト */}
          {category === "handouts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  プレイヤー別ハンドアウト ({project.characters.length}名)
                </h3>
              </div>

              {/* プレイヤー配布用 / GMガイド表示トグル */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span className="font-semibold text-slate-300">
                    GM用誘導メモ枠をシート下部に含める
                  </span>
                  <input
                    type="checkbox"
                    checked={showGmGuideInHo}
                    onChange={(e) => setShowGmGuideInHo(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600"
                  />
                </label>
                <p className="mt-1 text-[10px] text-slate-500">
                  ※プレイヤーに配る際はOFF（非表示）のまま印刷してください
                </p>
              </div>

              <div className="space-y-2">
                {project.characters.map((c, idx) => {
                  const isSelected = c.id === activeChar?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCharId(c.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          PC-{idx + 1} /{" "}
                          {c.location === "headquarters" ? "司令部・後方" : "現地・フィールド"}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {
                            THEME_PRESETS[
                              getDesignForKey(project, `ho-${c.id}`, "handouts").themeId
                            ]?.badge
                          }
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-sm text-white">{c.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.profession}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ② 証拠資料選択リスト */}
          {category === "evidences" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  証拠・調査記録 ({filteredEvidences.length}件)
                </h3>
                <button
                  onClick={handleAddNewEvidence}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  新規証拠追加
                </button>
              </div>

              {/* フェーズ絞り込み */}
              <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                <button
                  onClick={() => setEvidenceDayFilter("all")}
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    evidenceDayFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  全て({project.evidences.length})
                </button>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setEvidenceDayFilter(d)}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      evidenceDayFilter === d
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredEvidences.map((ev) => {
                  const isSelected = ev.id === activeEvidence?.id;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                          Day {ev.foundPhase}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ev.category === "document"
                            ? "📄 文書記録"
                            : ev.category === "data"
                            ? "📊 観測データ"
                            : ev.category === "sample"
                            ? "🔬 検体・物証"
                            : ev.category === "testimony"
                            ? "🗣️ 証言調書"
                            : "📻 音声・通信"}
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white line-clamp-2">
                        {ev.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ③ 全体提示される地図や写真リスト */}
          {category === "visuals" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  全体提示マップ・写真 ({visualBoards.length}枚)
                </h3>
                <button
                  onClick={handleAddCustomVisualBoard}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  地図・写真追加
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                プレイヤー全員に提示・配布する地図・現場写真・解読ワークシートを選択し、注釈や解説文を直接編集できます。
              </p>

              <div className="space-y-2">
                {visualBoards.map((vb) => {
                  const isSelected = vb.id === activeVisual?.id;
                  return (
                    <button
                      key={vb.id}
                      onClick={() => setSelectedVisualId(vb.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                          Phase / Day {vb.dayNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {vb.boardType === "route_map"
                            ? "🗺️ 広域ルート図"
                            : vb.boardType === "day1_map"
                            ? "🧭 現場見取り図"
                            : vb.boardType === "aerial_photo"
                            ? "📷 空撮・現場写真"
                            : vb.boardType === "sector_grid"
                            ? "🎯 座標索敵マップ"
                            : vb.boardType === "seismic_chart"
                            ? "📈 観測波形図"
                            : vb.boardType === "cryptic_sheet"
                            ? "🔐 解読シート"
                            : "🖼️ カスタム図판"}
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white">{vb.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                        {vb.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ④ GM進行資料選択リスト */}
          {category === "gm_guides" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GM進行シート（全{project.timeline.length}フェーズ）
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                フェーズ別の読み上げスクリプト、時間配分、各班への誘導、開示証拠リストをデザインされた進行表の上で直接修正・保存できます。
              </p>

              <div className="space-y-2">
                {project.timeline.map((step) => {
                  const isSelected = step.dayNumber === selectedGmDay;
                  return (
                    <button
                      key={step.dayNumber}
                      onClick={() => setSelectedGmDay(step.dayNumber)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          Day {step.dayNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {step.locationName} ({step.distanceKm}km)
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white">
                        {step.situationTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右メインキャンバス：A4デザイン資料プレビュー ＆ 画面内直接テキスト編集 */}
        <div className="col-span-9 flex-1 overflow-y-auto bg-slate-900/90 p-6 md:p-10">
          {/* キャンバス上部ガイドバー */}
          <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {isDirectEditMode ? (
                <span>
                  💡 <strong>画面内直接編集モード</strong>：下のデザインされた用紙内の見出しや文章を<strong>直接クリックして書き換え</strong>できます（変更はリアルタイムで保存され、右上の「💾 修正内容を保存」でも確定できます）
                </span>
              ) : (
                <span>
                  👁️ <strong>完成プレビューモード</strong>：実際の配布・印刷時と同じ見た目を表示しています
                </span>
              )}
            </div>
          </div>

          {/* ====================================================================
              デザイン済みドキュメント用紙本体（A4相当・印刷ターゲット）
             ==================================================================== */}
          <div
            ref={printableSheetRef}
            className={`mx-auto max-w-4xl rounded-sm p-8 md:p-12 transition-all ${paper.className} ${fontClass} ${getBorderFrameClasses()} relative`}
          >
            {/* ----------------------------------------------------------------
                共通ドキュメントヘッダー（発令機関・文書番号・斜めスタンプ）
               ---------------------------------------------------------------- */}
            <div className={`mb-6 border-b-2 pb-4 ${accent.borderMain} relative`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  {/* 発令機関ヘッダー（直接編集可能） */}
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={currentDesign.organizationHeader}
                        onChange={(e) =>
                          handleUpdateDesign({ organizationHeader: e.target.value })
                        }
                        className="w-full max-w-md border-b border-dashed border-slate-400/60 bg-transparent px-1 py-0.5 text-xs font-bold tracking-widest focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                        title="クリックして発令機関・ヘッダー名を直接編集"
                      />
                    ) : (
                      <span>{currentDesign.organizationHeader}</span>
                    )}
                  </div>

                  {/* 文書コード・シナリオ名 */}
                  <div className="mt-1 flex items-center gap-3 text-[11px] font-mono opacity-70">
                    <span>FILE:</span>
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={currentDesign.documentCode}
                        onChange={(e) => handleUpdateDesign({ documentCode: e.target.value })}
                        className="w-40 border-b border-dashed border-slate-400/60 bg-transparent px-1 py-0.5 font-mono text-[11px] focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                        title="文書管理番号を直接編集"
                      />
                    ) : (
                      <span>{currentDesign.documentCode}</span>
                    )}
                    <span>｜</span>
                    <span>PROJECT: {project.title}</span>
                  </div>
                </div>

                {/* 斜めスタンプ枠（直接編集可能） */}
                <div
                  className={`rotate-[-4deg] border-2 px-3 py-1 text-center font-extrabold tracking-widest uppercase shadow-sm ${accent.stampBorder} ${accent.stampText}`}
                >
                  {isDirectEditMode ? (
                    <input
                      type="text"
                      value={currentDesign.stampText}
                      onChange={(e) => handleUpdateDesign({ stampText: e.target.value })}
                      className="w-44 bg-transparent text-center text-xs font-extrabold uppercase tracking-widest focus:bg-white/50 focus:outline-none"
                      title="スタンプの文言を直接編集"
                    />
                  ) : (
                    <span className="text-xs">{currentDesign.stampText}</span>
                  )}
                </div>
              </div>

              {/* 公文書テーマの場合の3連承認印欄 */}
              {currentDesign.themeId === "official_report" && (
                <div className="mt-3 flex justify-end">
                  <div className="grid grid-cols-3 border border-slate-400 text-center text-[10px]">
                    <div className="border-r border-slate-400 px-3 py-1">
                      <div className="border-b border-slate-300 pb-0.5 font-bold">最高責任者</div>
                      <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                        承認済
                      </div>
                    </div>
                    <div className="border-r border-slate-400 px-3 py-1">
                      <div className="border-b border-slate-300 pb-0.5 font-bold">情報分析官</div>
                      <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                        検印
                      </div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="border-b border-slate-300 pb-0.5 font-bold">記録担当</div>
                      <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                        登録
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================================
                ① 個人向けハンドアウト（PC配布資料）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "handouts" && activeChar && (
              <div className="space-y-6">
                {/* キャラクタータイトル帯 */}
                <div className={`rounded-md p-5 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded bg-white/15 px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider">
                      PLAYER HANDOUT / 個人別極秘ブリーフィング資料
                    </span>
                    <span className="text-xs opacity-85">
                      初期配置：
                      {activeChar.location === "headquarters"
                        ? "🏢 司令部・後方拠点"
                        : "⚓ 現地・フィールド拠点"}
                    </span>
                  </div>

                  {/* キャラクター名 ＆ 肩書（直接編集可能） */}
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-75">
                        氏名 / キャラクター名
                      </span>
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={activeChar.name}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({ ...c, name: e.target.value }))
                          }
                          className="mt-0.5 w-full rounded border border-white/30 bg-white/10 px-2.5 py-1 text-xl font-bold text-white focus:border-white focus:bg-white/20 focus:outline-none"
                        />
                      ) : (
                        <h1 className="text-2xl font-bold">{activeChar.name}</h1>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-75">
                        所属・職業・肩書
                      </span>
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={activeChar.profession}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              profession: e.target.value,
                            }))
                          }
                          className="mt-0.5 w-full rounded border border-white/30 bg-white/10 px-2.5 py-1 text-base font-semibold text-white focus:border-white focus:bg-white/20 focus:outline-none"
                        />
                      ) : (
                        <div className="mt-1 text-base font-semibold opacity-95">
                          {activeChar.profession}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 公開プロフィール枠 */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/70`}>
                  <div
                    className={`mb-2 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-bold ${accent.badgeBg} ${accent.badgeText}`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    【公開プロフィール（全員に開示される情報）】
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={3}
                      value={activeChar.handout.publicProfile}
                      onChange={(e) =>
                        handleUpdateActiveChar((c) => ({
                          ...c,
                          handout: { ...c.handout, publicProfile: e.target.value },
                        }))
                      }
                      className="w-full rounded border border-dashed border-slate-400 bg-white/80 p-2 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-xs leading-relaxed">
                      {activeChar.handout.publicProfile}
                    </p>
                  )}
                </div>

                {/* キャラクター内面ドラマ（誇り・後ろめたさ・喪失体験） */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/60`}>
                  <h3
                    className={`mb-3 border-b pb-1.5 text-xs font-bold uppercase tracking-wider ${accent.sectionTitleText} ${accent.borderSub}`}
                  >
                    ■ あなたの内面・行動指針（ロールプレイの核）
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded border border-slate-300/80 bg-white/80 p-3">
                      <div className="mb-1 text-[11px] font-bold text-indigo-900">
                        ✦ 誇り・自負 (Pride)
                      </div>
                      {isDirectEditMode ? (
                        <textarea
                          rows={3}
                          value={activeChar.handout.internalDrama.pride}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              handout: {
                                ...c.handout,
                                internalDrama: {
                                  ...c.handout.internalDrama,
                                  pride: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                          {activeChar.handout.internalDrama.pride}
                        </p>
                      )}
                    </div>

                    <div className="rounded border border-slate-300/80 bg-white/80 p-3">
                      <div className="mb-1 text-[11px] font-bold text-rose-900">
                        ✦ 後ろめたさ・秘密 (Guilt)
                      </div>
                      {isDirectEditMode ? (
                        <textarea
                          rows={3}
                          value={activeChar.handout.internalDrama.guilt}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              handout: {
                                ...c.handout,
                                internalDrama: {
                                  ...c.handout.internalDrama,
                                  guilt: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                          {activeChar.handout.internalDrama.guilt}
                        </p>
                      )}
                    </div>

                    <div className="rounded border border-slate-300/80 bg-white/80 p-3">
                      <div className="mb-1 text-[11px] font-bold text-amber-900">
                        ✦ 喪失体験・過去 (Loss)
                      </div>
                      {isDirectEditMode ? (
                        <textarea
                          rows={3}
                          value={activeChar.handout.internalDrama.loss}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              handout: {
                                ...c.handout,
                                internalDrama: {
                                  ...c.handout.internalDrama,
                                  loss: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                          {activeChar.handout.internalDrama.loss}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 初期所持品 ＆ 固有能力（2カラムボックス） */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  {/* 初期所持品 */}
                  <div className={`md:col-span-5 rounded-md border p-4 ${accent.borderSub} bg-white/70`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-xs font-bold ${accent.sectionTitleText}`}>
                        ■ 初期所持品・携行アイテム
                      </span>
                      {isDirectEditMode && (
                        <button
                          onClick={() =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              initialItems: [...(c.initialItems || []), "新規所持品アイテム"],
                            }))
                          }
                          className="no-print rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                        >
                          ＋ 追加
                        </button>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {(activeChar.initialItems || []).map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold">・</span>
                          {isDirectEditMode ? (
                            <>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const nextItems = [...activeChar.initialItems];
                                  nextItems[iIdx] = e.target.value;
                                  handleUpdateActiveChar((c) => ({
                                    ...c,
                                    initialItems: nextItems,
                                  }));
                                }}
                                className="flex-1 rounded border border-dashed border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateActiveChar((c) => ({
                                    ...c,
                                    initialItems: c.initialItems.filter((_, idx) => idx !== iIdx),
                                  }))
                                }
                                className="no-print text-slate-400 hover:text-red-600"
                                title="この所持品を削除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <span>{item}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 固有能力・できること */}
                  <div className={`md:col-span-7 rounded-md border p-4 ${accent.borderSub} bg-white/70`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-xs font-bold ${accent.sectionTitleText}`}>
                        ■ 固有能力・専門スキル（各フェーズで実行可能な権限）
                      </span>
                      {isDirectEditMode && (
                        <button
                          onClick={() =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              capabilities: [
                                ...(c.capabilities || []),
                                {
                                  id: `cap-${Date.now()}`,
                                  name: "新規専門スキル",
                                  description: "スキルの効果・調査内容を記載",
                                  targetPhase: 1,
                                },
                              ],
                            }))
                          }
                          className="no-print rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                        >
                          ＋ 能力追加
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(activeChar.capabilities || []).map((cap, cIdx) => (
                        <div
                          key={cap.id || cIdx}
                          className="rounded border border-slate-300/80 bg-white/90 p-2 text-xs"
                        >
                          {isDirectEditMode ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-600">Day</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={7}
                                  value={cap.targetPhase}
                                  onChange={(e) => {
                                    const nextCaps = [...activeChar.capabilities];
                                    nextCaps[cIdx] = {
                                      ...cap,
                                      targetPhase: parseInt(e.target.value, 10) || 1,
                                    };
                                    handleUpdateActiveChar((c) => ({
                                      ...c,
                                      capabilities: nextCaps,
                                    }));
                                  }}
                                  className="w-12 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-900"
                                />
                                <input
                                  type="text"
                                  value={cap.name}
                                  onChange={(e) => {
                                    const nextCaps = [...activeChar.capabilities];
                                    nextCaps[cIdx] = { ...cap, name: e.target.value };
                                    handleUpdateActiveChar((c) => ({
                                      ...c,
                                      capabilities: nextCaps,
                                    }));
                                  }}
                                  className="flex-1 rounded border border-dashed border-slate-300 bg-white px-2 py-0.5 font-bold text-slate-900"
                                />
                                <button
                                  onClick={() =>
                                    handleUpdateActiveChar((c) => ({
                                      ...c,
                                      capabilities: c.capabilities.filter(
                                        (_, idx) => idx !== cIdx
                                      ),
                                    }))
                                  }
                                  className="no-print text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                value={cap.description}
                                onChange={(e) => {
                                  const nextCaps = [...activeChar.capabilities];
                                  nextCaps[cIdx] = { ...cap, description: e.target.value };
                                  handleUpdateActiveChar((c) => ({
                                    ...c,
                                    capabilities: nextCaps,
                                  }));
                                }}
                                className="w-full rounded border border-dashed border-slate-300 bg-white p-1 text-xs text-slate-800"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold">
                                <span
                                  className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] ${accent.badgeBg} ${accent.badgeText}`}
                                >
                                  Day {cap.targetPhase}
                                </span>
                                {cap.name}
                              </div>
                              <div className="mt-0.5 text-slate-700 leading-relaxed">
                                {cap.description}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* イントロダクション（導入情景描写） */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/75`}>
                  <div
                    className={`mb-2 rounded px-2.5 py-1 text-xs font-bold ${accent.sectionTitleBg} ${accent.sectionTitleText}`}
                  >
                    ■ イントロダクション（導入ストーリー）
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={5}
                      value={activeChar.introduction}
                      onChange={(e) =>
                        handleUpdateActiveChar((c) => ({ ...c, introduction: e.target.value }))
                      }
                      className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-xs leading-relaxed">
                      {activeChar.introduction}
                    </div>
                  )}
                </div>

                {/* 事前タイムライン・経緯 */}
                {(activeChar.handout.backgroundTimeline || isDirectEditMode) && (
                  <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/75`}>
                    <div
                      className={`mb-2 rounded px-2.5 py-1 text-xs font-bold ${accent.sectionTitleBg} ${accent.sectionTitleText}`}
                    >
                      ■ 事前タイムライン・これまでの経緯
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={5}
                        value={activeChar.handout.backgroundTimeline || ""}
                        onChange={(e) =>
                          handleUpdateActiveChar((c) => ({
                            ...c,
                            handout: { ...c.handout, backgroundTimeline: e.target.value },
                          }))
                        }
                        placeholder="事件発生前〜直前の個人タイムラインや行動履歴を入力してください"
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-xs leading-relaxed">
                        {activeChar.handout.backgroundTimeline}
                      </div>
                    )}
                  </div>
                )}

                {/* ハンドアウト本文（詳細記憶・専門知識・個別情報） */}
                <div className={`rounded-md border-2 p-5 ${accent.borderMain} bg-white/90`}>
                  <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2">
                    <span className={`text-sm font-extrabold ${accent.sectionTitleText}`}>
                      ■ ハンドアウト詳細本文（あなたの記憶と固有知識）
                    </span>
                    {onSendAiPrompt && (
                      <button
                        onClick={() =>
                          onSendAiPrompt(
                            `【${activeChar.name}のハンドアウト推敲依頼】\n現在のデザイン枠（${THEME_PRESETS[currentDesign.themeId].name}）にふさわしい文体で、以下のハンドアウト本文をより臨場感あふれる文章にブラッシュアップしてください：\n\n${activeChar.handout.handoutBody}`
                          )
                        }
                        className="no-print flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500"
                      >
                        <Sparkles className="h-3 w-3" />
                        左のAIチャットで文体を推敲する
                      </button>
                    )}
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={16}
                      value={activeChar.handout.handoutBody}
                      onChange={(e) =>
                        handleUpdateActiveChar((c) => ({
                          ...c,
                          handout: { ...c.handout, handoutBody: e.target.value },
                        }))
                      }
                      className="w-full rounded border border-dashed border-slate-400 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-xs leading-relaxed">
                      {activeChar.handout.handoutBody}
                    </div>
                  )}
                </div>

                {/* GM管理用ガイド枠（オプションON時のみ表示） */}
                {showGmGuideInHo && (
                  <div className="rounded-md border-2 border-dashed border-rose-500 bg-rose-50/90 p-4">
                    <div className="mb-2 text-xs font-bold text-rose-900">
                      🔒 【GM専用進行・個別誘導ガイド】（※プレイヤー配布時は左メニューのチェックを外して非表示にできます）
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={4}
                        value={activeChar.handout.gmActionGuide || ""}
                        onChange={(e) =>
                          handleUpdateActiveChar((c) => ({
                            ...c,
                            handout: { ...c.handout, gmActionGuide: e.target.value },
                          }))
                        }
                        className="w-full rounded border border-rose-300 bg-white p-2 text-xs leading-relaxed text-slate-900"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-xs leading-relaxed text-rose-950">
                        {activeChar.handout.gmActionGuide || "特記事項なし"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                ② 証拠資料（テキスト中心の調査記録・文書）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "evidences" && activeEvidence && (
              <div className="space-y-6">
                {/* 証拠タイトル＆メタ情報ボックス */}
                <div className={`rounded-md p-5 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/20 px-2.5 py-0.5 font-mono font-bold">
                        EVIDENCE DOCUMENT / 証拠資料レコード
                      </span>
                      {isDirectEditMode ? (
                        <select
                          value={activeEvidence.foundPhase}
                          onChange={(e) =>
                            handleUpdateActiveEvidence((ev) => ({
                              ...ev,
                              foundPhase: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                          className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs font-bold text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>
                              開示フェーズ: Day {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded bg-amber-500/30 px-2 py-0.5 font-bold">
                          開示: Day {activeEvidence.foundPhase}
                        </span>
                      )}
                    </div>

                    {/* 公開区分・種別 */}
                    <div className="flex items-center gap-2">
                      {isDirectEditMode ? (
                        <>
                          <select
                            value={activeEvidence.category}
                            onChange={(e) =>
                              handleUpdateActiveEvidence((ev) => ({
                                ...ev,
                                category: e.target.value as EvidenceItem["category"],
                              }))
                            }
                            className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs text-white"
                          >
                            <option value="document">📄 文書・記録</option>
                            <option value="data">📊 観測・解析データ</option>
                            <option value="sample">🔬 検体・物証鑑定</option>
                            <option value="testimony">🗣️ 証言・聴取調書</option>
                            <option value="audio">📻 音声・通信ログ</option>
                          </select>
                          <select
                            value={activeEvidence.visibility}
                            onChange={(e) =>
                              handleUpdateActiveEvidence((ev) => ({
                                ...ev,
                                visibility: e.target.value as EvidenceVisibility,
                              }))
                            }
                            className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs text-white"
                          >
                            <option value="public">🌐 全体公開情報</option>
                            <option value="shareable">🤝 共有可能情報</option>
                            <option value="private">🔒 個別秘匿情報</option>
                          </select>
                        </>
                      ) : (
                        <span className="text-xs opacity-90">
                          区分:{" "}
                          {activeEvidence.visibility === "public"
                            ? "全体公開証拠"
                            : activeEvidence.visibility === "shareable"
                            ? "譲渡・共有可能証拠"
                            : "個別秘匿証拠"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 証拠タイトル（直接編集可能） */}
                  <div className="mt-3">
                    <span className="block text-[10px] uppercase tracking-wider opacity-75">
                      資料件名 / EVIDENCE TITLE
                    </span>
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={activeEvidence.title}
                        onChange={(e) =>
                          handleUpdateActiveEvidence((ev) => ({
                            ...ev,
                            title: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-white/30 bg-white/10 px-3 py-1.5 text-xl font-bold text-white focus:border-white focus:bg-white/20 focus:outline-none"
                      />
                    ) : (
                      <h1 className="mt-1 text-xl font-bold">{activeEvidence.title}</h1>
                    )}
                  </div>
                </div>

                {/* 入手条件・関連アクション枠 */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3 ${accent.highlightBoxBorder} ${accent.highlightBoxBg}`}
                >
                  <div className="flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      ■ 入手経路・開示トリガー条件（ACQUISITION CONDITION）
                    </span>
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={activeEvidence.acquisitionCondition || ""}
                        onChange={(e) =>
                          handleUpdateActiveEvidence((ev) => ({
                            ...ev,
                            acquisitionCondition: e.target.value,
                          }))
                        }
                        placeholder="例：Day 2 アクション調査 T-1 の実行により開示"
                        className="mt-0.5 w-full rounded border border-dashed border-slate-400 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900"
                      />
                    ) : (
                      <div className="mt-0.5 text-xs font-semibold">
                        {activeEvidence.acquisitionCondition || "フェーズ進行に伴い開示"}
                      </div>
                    )}
                  </div>
                </div>

                {/* テーマ別の装飾インジケーター（通信データや鑑定カルテの場合） */}
                {currentDesign.themeId === "digital_telemetry" && (
                  <div className="rounded border border-cyan-500/50 bg-cyan-950/90 p-3 font-mono text-[11px] text-cyan-200">
                    <div className="flex items-center justify-between border-b border-cyan-800 pb-1">
                      <span>SIGNAL TELEMETRY STREAM // VERIFIED</span>
                      <span>FREQ: 15-40Hz // DEPTH: 800m</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-cyan-400">
                      <span>▂▃▅▇█▇▅▃▂▁▂▄▆█▆▄▂▁▂▃▅▇█▇▅▃▂</span>
                      <span className="ml-2 text-[10px] text-cyan-300">
                        [ACOUSTIC / SEISMIC WAVEFORM RECORDED]
                      </span>
                    </div>
                  </div>
                )}

                {/* 証拠本文（メインテキスト・直接編集可能） */}
                <div className={`rounded-md border-2 p-6 ${accent.borderMain} bg-white/90 shadow-inner`}>
                  <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2">
                    <span className={`text-sm font-extrabold ${accent.sectionTitleText}`}>
                      ■ 調査報告・記録本文（RECORD BODY）
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ※枠内をクリックして直接テキストを修正・追記できます
                    </span>
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={14}
                      value={activeEvidence.description}
                      onChange={(e) =>
                        handleUpdateActiveEvidence((ev) => ({
                          ...ev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-dashed border-slate-400 bg-white p-3.5 text-sm leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {activeEvidence.description}
                    </div>
                  )}
                </div>

                {/* プレイヤー記入用メモ欄（配布資料としての実用枠） */}
                <div className="rounded-md border border-dashed border-slate-400 bg-white/50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    ✏️ 調査班・プレイヤー考察メモ欄（ANALYSIS & NOTES）
                  </div>
                  <div className="mt-2 h-16 border-b border-dotted border-slate-300" />
                </div>
              </div>
            )}

            {/* ================================================================
                ③ 全体提示される地図や写真（ビジュアル提示ボード）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "visuals" && activeVisual && (
              <div className="space-y-6">
                {/* ビジュアルボードタイトル帯 */}
                <div className={`rounded-md p-5 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded bg-white/20 px-2.5 py-0.5 font-mono font-bold">
                      VISUAL PRESENTATION BOARD / 全体提示マップ・視覚資料
                    </span>
                    <div className="flex items-center gap-2">
                      {/* 索敵マップや解読シートでの「プレイヤー配布用 vs GM正解表示」切替ボタン */}
                      {(activeVisual.boardType === "sector_grid" ||
                        activeVisual.boardType === "cryptic_sheet") && (
                        <button
                          onClick={() =>
                            handleUpdateActiveVisual((v) => ({
                              ...v,
                              showGmSecrets: !v.showGmSecrets,
                            }))
                          }
                          className={`no-print flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition ${
                            activeVisual.showGmSecrets
                              ? "bg-rose-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {activeVisual.showGmSecrets ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              🔒 GM確認用（正解・秘匿表示中）
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              👥 プレイヤー配布用（正解非表示）
                            </>
                          )}
                        </button>
                      )}

                      {/* カスタム画像アップロードボタン（すべてのビジュアル資料で利用可能） */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="no-print flex items-center gap-1 rounded bg-white/20 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/30"
                        title="手持ちの地図画像やイラスト・写真を読み込んで配置します"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        画像を差し替え/追加
                      </button>
                      {activeVisual.imageUrl && (
                        <button
                          onClick={() =>
                            handleUpdateActiveVisual((v) => ({ ...v, imageUrl: undefined }))
                          }
                          className="no-print rounded bg-rose-600/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-500"
                        >
                          画像をクリア
                        </button>
                      )}
                    </div>
                  </div>

                  {/* タイトル・サブタイトル（直接編集可能） */}
                  <div className="mt-3 space-y-1.5">
                    {isDirectEditMode ? (
                      <>
                        <input
                          type="text"
                          value={activeVisual.title}
                          onChange={(e) =>
                            handleUpdateActiveVisual((v) => ({ ...v, title: e.target.value }))
                          }
                          className="w-full rounded border border-white/30 bg-white/10 px-3 py-1 text-xl font-bold text-white focus:border-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={activeVisual.subtitle}
                          onChange={(e) =>
                            handleUpdateActiveVisual((v) => ({ ...v, subtitle: e.target.value }))
                          }
                          className="w-full rounded border border-white/30 bg-white/10 px-3 py-1 text-xs text-white/90 focus:border-white focus:outline-none"
                        />
                      </>
                    ) : (
                      <>
                        <h1 className="text-xl font-bold">{activeVisual.title}</h1>
                        <p className="text-xs opacity-90">{activeVisual.subtitle}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 図版・マップ・写真のビジュアルフレーム描画領域 */}
                <div className="rounded-lg border-2 border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-inner">
                  {/* カスタム画像がアップロードされている場合は最優先で額装表示 */}
                  {activeVisual.imageUrl && (
                    <div className="mb-5 overflow-hidden rounded border border-slate-700 bg-black p-2 text-center">
                      <img
                        src={activeVisual.imageUrl}
                        alt={activeVisual.title}
                        className="mx-auto max-h-[420px] w-auto object-contain"
                      />
                    </div>
                  )}

                  {/* (A) 広域進行ルートマップ (route_map) */}
                  {activeVisual.boardType === "route_map" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-cyan-400">
                        <span className="flex items-center gap-1.5">
                          <Compass className="h-4 w-4" />
                          WIDE-AREA TACTICAL ROUTE CHART // 7-PHASE PROGRESSION
                        </span>
                        <span>SCALE: 1/5,000,000</span>
                      </div>

                      {/* 各フェーズの位置関係・距離・名称を直接編集できるルートマップ図解 */}
                      <div className="relative space-y-2.5 pl-4 before:absolute before:bottom-4 before:left-7 before:top-4 before:w-0.5 before:bg-cyan-500/50">
                        {project.timeline.map((step) => (
                          <div
                            key={step.dayNumber}
                            className="relative flex items-start gap-4 rounded-lg border border-slate-800 bg-slate-900/90 p-3"
                          >
                            <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-950 font-mono text-xs font-bold text-cyan-300">
                              D{step.dayNumber}
                            </div>
                            <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-12">
                              <div className="md:col-span-4">
                                <span className="block text-[10px] font-mono text-cyan-400">
                                  観測地点 / 累積距離
                                </span>
                                {isDirectEditMode ? (
                                  <div className="mt-0.5 flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={step.locationName}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        onUpdateProject((prev) => ({
                                          ...prev,
                                          timeline: prev.timeline.map((t) =>
                                            t.dayNumber === step.dayNumber
                                              ? { ...t, locationName: val }
                                              : t
                                          ),
                                        }));
                                        triggerSaveFeedback();
                                      }}
                                      className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs font-bold text-white"
                                    />
                                    <input
                                      type="number"
                                      value={step.distanceKm}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value, 10) || 0;
                                        onUpdateProject((prev) => ({
                                          ...prev,
                                          timeline: prev.timeline.map((t) =>
                                            t.dayNumber === step.dayNumber
                                              ? { ...t, distanceKm: val }
                                              : t
                                          ),
                                        }));
                                        triggerSaveFeedback();
                                      }}
                                      className="w-16 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-right font-mono text-xs text-cyan-300"
                                    />
                                    <span className="text-[10px] text-slate-400">km</span>
                                  </div>
                                ) : (
                                  <div className="text-xs font-bold text-white">
                                    {step.locationName}{" "}
                                    <span className="font-mono text-cyan-400">
                                      ({step.distanceKm}km)
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-8">
                                <span className="block text-[10px] font-mono text-slate-400">
                                  フェーズ状況見出し
                                </span>
                                {isDirectEditMode ? (
                                  <input
                                    type="text"
                                    value={step.situationTitle}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      onUpdateProject((prev) => ({
                                        ...prev,
                                        timeline: prev.timeline.map((t) =>
                                          t.dayNumber === step.dayNumber
                                            ? { ...t, situationTitle: val }
                                            : t
                                        ),
                                      }));
                                      triggerSaveFeedback();
                                    }}
                                    className="mt-0.5 w-full rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs text-slate-200"
                                  />
                                ) : (
                                  <div className="text-xs text-slate-200">
                                    {step.situationTitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* (B) 初期現場見取り図 (day1_map) */}
                  {activeVisual.boardType === "day1_map" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-emerald-400">
                        <span>INCIDENT SITE TACTICAL DIAGRAM // PHASE 1</span>
                        <span>GRID REF: 27-05-N / 142-11-E</span>
                      </div>
                      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg border border-emerald-500/30 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:16px_16px]">
                        {/* 同心円レーダーリング */}
                        <div className="absolute h-52 w-52 rounded-full border border-emerald-500/30" />
                        <div className="absolute h-36 w-36 rounded-full border border-emerald-500/40" />
                        <div className="absolute h-20 w-20 rounded-full border border-dashed border-amber-400/60" />
                        <div className="z-10 flex flex-col items-center">
                          <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            ⚠️ 初期事象発生ポイント
                          </span>
                          <span className="mt-1 text-xs font-bold text-emerald-200">
                            {project.timeline[0]?.locationName || "現場海域"}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-4 rounded border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[10px] text-slate-300">
                          ⚓ 現地対応班：現場急行・痕跡採取ポイント
                        </div>
                        <div className="absolute right-4 top-3 rounded border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[10px] text-slate-300">
                          🏢 司令部：広域通信・衛星モニタリング圏内
                        </div>
                      </div>
                    </div>
                  )}

                  {/* (C) 空撮・現場写真フレーム (aerial_photo) */}
                  {activeVisual.boardType === "aerial_photo" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-xs text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <Crosshair className="h-4 w-4" />
                          RECONNAISSANCE OPTICAL / IR CAMERA FRAME
                        </span>
                        <span>ALT: 1500ft // SHUTTER: 1/2000s // ISO 800</span>
                      </div>
                      {!activeVisual.imageUrl && (
                        <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded border border-slate-700 bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-950 p-6">
                          {/* ファインダー十字とシルエット図解 */}
                          <div className="pointer-events-none absolute inset-4 border border-dashed border-white/20" />
                          <div className="h-16 w-72 rounded-full bg-black/75 blur-sm ring-4 ring-cyan-400/20" />
                          <div className="mt-3 rounded bg-black/70 px-3 py-1 font-mono text-xs text-cyan-300">
                            [推定全長 300〜400m 巨大シルエット ＆ 特有の航跡波パターン]
                          </div>
                          <div className="mt-2 text-[11px] text-slate-400">
                            ※右上の「画像を差し替え/追加」ボタンから任意の写真をこのフレームに配置できます
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* (D) 6×6 広域索敵グリッドマップ (sector_grid) */}
                  {activeVisual.boardType === "sector_grid" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-xs text-cyan-400">
                        <span>36-SECTOR TACTICAL SONAR GRID (A-1 〜 F-6)</span>
                        <span>
                          {activeVisual.showGmSecrets
                            ? "🔒 GM正解レイヤー表示中"
                            : "👥 プレイヤー配布用（白地図モード）"}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-3">
                        {["A", "B", "C", "D", "E", "F"].map((row) =>
                          [1, 2, 3, 4, 5, 6].map((col) => {
                            const secId = `${row}-${col}`;
                            const isTarget = activeVisual.showGmSecrets && secId === "B-3";
                            const isHazard =
                              activeVisual.showGmSecrets && (secId === "D-2" || secId === "E-2");
                            return (
                              <div
                                key={secId}
                                className={`flex h-12 flex-col items-center justify-center rounded border font-mono text-xs font-bold ${
                                  isTarget
                                    ? "border-rose-500 bg-rose-950/90 text-rose-200"
                                    : isHazard
                                    ? "border-amber-500 bg-amber-950/80 text-amber-200"
                                    : "border-slate-800 bg-slate-900/70 text-slate-300"
                                }`}
                              >
                                <span>{secId}</span>
                                {isTarget && (
                                  <span className="text-[9px] text-rose-300">🎯目標位置</span>
                                )}
                                {isHazard && (
                                  <span className="text-[9px] text-amber-300">⚠️探知障害</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* (E) 観測波形・リスク推移チャート (seismic_chart) */}
                  {activeVisual.boardType === "seismic_chart" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-xs text-rose-400">
                        <span className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4" />
                          SEISMIC & VOLCANIC CHAIN REACTION MONITOR
                        </span>
                        <span>ALERT LEVEL: CRITICAL</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 pt-2">
                        {project.timeline.map((step, idx) => {
                          const heightPct = Math.min(100, 20 + idx * 13);
                          return (
                            <div
                              key={step.dayNumber}
                              className="flex flex-col items-center rounded border border-slate-800 bg-slate-900 p-2"
                            >
                              <div className="text-[10px] font-mono text-slate-400">
                                Day {step.dayNumber}
                              </div>
                              <div className="my-2 flex h-24 w-full items-end justify-center rounded bg-slate-950 p-1">
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className={`w-full rounded-t ${
                                    idx >= 5
                                      ? "bg-rose-600"
                                      : idx >= 3
                                      ? "bg-amber-500"
                                      : "bg-cyan-500"
                                  }`}
                                />
                              </div>
                              <div className="text-center text-[10px] font-bold text-white truncate w-full">
                                {step.locationName}
                              </div>
                              <div className="text-[9px] font-mono text-slate-400">
                                {step.distanceKm}km
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* (F) 暗号・信号解読ワークシート (cryptic_sheet) */}
                  {activeVisual.boardType === "cryptic_sheet" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-xs text-indigo-300">
                        <span>SIGNAL DECODING WORKSHEET // 暗号・音響パルス照合表</span>
                        <span>
                          {activeVisual.showGmSecrets
                            ? "🔒 GM確認用（意味・正解表示中）"
                            : "👥 プレイヤー配布用（記入ワークシート）"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {(project.crypticWords || []).map((w, wIdx) => (
                          <div
                            key={w.id || wIdx}
                            className="flex items-center justify-between rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
                          >
                            <div>
                              <div className="font-mono text-sm font-bold text-amber-300">
                                {w.symbol}
                              </div>
                              <div className="text-[10px] text-slate-400">{w.soundPattern}</div>
                            </div>
                            <div className="text-right">
                              {activeVisual.showGmSecrets ? (
                                <span className="rounded bg-indigo-900/80 px-2.5 py-1 font-bold text-indigo-200">
                                  意味：{w.meaning}
                                </span>
                              ) : (
                                <span className="inline-block w-28 border-b border-dashed border-slate-500 py-1 text-center text-[10px] text-slate-500">
                                  （意味を記入）
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 図版キャプション・解説テキスト枠（直接編集可能） */}
                <div className={`rounded-md border-2 p-5 ${accent.borderMain} bg-white/90`}>
                  {isDirectEditMode ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={activeVisual.captionTitle}
                        onChange={(e) =>
                          handleUpdateActiveVisual((v) => ({
                            ...v,
                            captionTitle: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white px-2.5 py-1 text-sm font-extrabold text-slate-900"
                      />
                      <textarea
                        rows={4}
                        value={activeVisual.captionBody}
                        onChange={(e) =>
                          handleUpdateActiveVisual((v) => ({
                            ...v,
                            captionBody: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className={`text-sm font-extrabold ${accent.sectionTitleText}`}>
                        {activeVisual.captionTitle}
                      </h3>
                      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed">
                        {activeVisual.captionBody}
                      </p>
                    </div>
                  )}

                  {/* 注釈・ポイントリスト（直接追加・編集・削除可能） */}
                  <div className="mt-4 border-t border-slate-300 pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        📌 図版内の注目ポイント・注釈ラベル
                      </span>
                      {isDirectEditMode && (
                        <button
                          onClick={() =>
                            handleUpdateActiveVisual((v) => ({
                              ...v,
                              annotations: [
                                ...(v.annotations || []),
                                "新規注釈ラベル：クリックして内容を編集してください",
                              ],
                            }))
                          }
                          className="no-print rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                        >
                          ＋ 注釈を追加
                        </button>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {(activeVisual.annotations || []).map((ann, aIdx) => (
                        <li key={aIdx} className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-700">●</span>
                          {isDirectEditMode ? (
                            <>
                              <input
                                type="text"
                                value={ann}
                                onChange={(e) => {
                                  const next = [...activeVisual.annotations];
                                  next[aIdx] = e.target.value;
                                  handleUpdateActiveVisual((v) => ({
                                    ...v,
                                    annotations: next,
                                  }));
                                }}
                                className="flex-1 rounded border border-dashed border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateActiveVisual((v) => ({
                                    ...v,
                                    annotations: v.annotations.filter((_, idx) => idx !== aIdx),
                                  }))
                                }
                                className="no-print text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <span>{ann}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================
                ④ GM用の進行資料（フェーズ別進行表・読み上げ・誘導）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "gm_guides" && activeTimelineStep && (
              <div className="space-y-6">
                {/* GM進行ヘッダー帯 */}
                <div className={`rounded-md p-5 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded bg-rose-500/30 border border-rose-400/40 px-2.5 py-0.5 font-mono font-bold text-rose-100">
                      GAME MASTER PROGRESSION SHEET // Day {activeTimelineStep.dayNumber} 進行台本
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-300" />
                        目標進行時間:
                        {isDirectEditMode ? (
                          <input
                            type="number"
                            value={activeGmNote.targetMinutes}
                            onChange={(e) =>
                              handleUpdateActiveGmNote((n) => ({
                                ...n,
                                targetMinutes: parseInt(e.target.value, 10) || 20,
                              }))
                            }
                            className="w-14 rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-center font-mono text-xs font-bold text-white"
                          />
                        ) : (
                          <strong>{activeGmNote.targetMinutes}</strong>
                        )}
                        分
                      </span>
                    </div>
                  </div>

                  {/* フェーズタイトル・地点・距離（直接編集可能） */}
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-12">
                    <div className="md:col-span-8">
                      <span className="block text-[10px] uppercase tracking-wider opacity-75">
                        Day {activeTimelineStep.dayNumber} 状況タイトル
                      </span>
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={activeTimelineStep.situationTitle}
                          onChange={(e) =>
                            handleUpdateActiveTimelineStep((s) => ({
                              ...s,
                              situationTitle: e.target.value,
                            }))
                          }
                          className="mt-0.5 w-full rounded border border-white/30 bg-white/10 px-2.5 py-1 text-lg font-bold text-white"
                        />
                      ) : (
                        <h1 className="text-lg font-bold">{activeTimelineStep.situationTitle}</h1>
                      )}
                    </div>
                    <div className="md:col-span-4">
                      <span className="block text-[10px] uppercase tracking-wider opacity-75">
                        観測地点 / 累積距離(km)
                      </span>
                      {isDirectEditMode ? (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={activeTimelineStep.locationName}
                            onChange={(e) =>
                              handleUpdateActiveTimelineStep((s) => ({
                                ...s,
                                locationName: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-white/30 bg-white/10 px-2 py-1 text-sm font-semibold text-white"
                          />
                          <input
                            type="number"
                            value={activeTimelineStep.distanceKm}
                            onChange={(e) =>
                              handleUpdateActiveTimelineStep((s) => ({
                                ...s,
                                distanceKm: parseInt(e.target.value, 10) || 0,
                              }))
                            }
                            className="w-20 rounded border border-white/30 bg-white/10 px-2 py-1 text-right font-mono text-sm text-white"
                          />
                        </div>
                      ) : (
                        <div className="mt-1 text-sm font-semibold">
                          {activeTimelineStep.locationName} ({activeTimelineStep.distanceKm}km)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BGM・音響演出キュー枠 */}
                <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs text-slate-800">
                  <Volume2 className="h-4 w-4 text-indigo-700 shrink-0" />
                  <span className="font-bold shrink-0">演出・BGMキュー:</span>
                  {isDirectEditMode ? (
                    <input
                      type="text"
                      value={activeGmNote.bgmCue}
                      onChange={(e) =>
                        handleUpdateActiveGmNote((n) => ({ ...n, bgmCue: e.target.value }))
                      }
                      className="flex-1 rounded border border-dashed border-slate-400 bg-white px-2 py-0.5 text-xs text-slate-900"
                    />
                  ) : (
                    <span>{activeGmNote.bgmCue}</span>
                  )}
                </div>

                {/* 📢 導入読み上げ・発生事象ボックス（GMが声に出して読む枠） */}
                <div
                  className={`rounded-md border-2 p-5 ${accent.highlightBoxBorder} ${accent.highlightBoxBg}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded bg-indigo-900 px-2.5 py-1 text-xs font-bold text-white">
                      📢 【GM読み上げ・状況アナウンス（発生事象）】
                    </span>
                    <span className="text-[11px] text-slate-600">
                      ※タイムラインの発生事象データと自動連動しています
                    </span>
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={5}
                      value={activeTimelineStep.incidentOverview}
                      onChange={(e) =>
                        handleUpdateActiveTimelineStep((s) => ({
                          ...s,
                          incidentOverview: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-dashed border-indigo-400 bg-white p-3 text-xs font-semibold leading-relaxed text-slate-900"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-xs font-semibold leading-relaxed">
                      {activeTimelineStep.incidentOverview}
                    </div>
                  )}
                </div>

                {/* 🏢 司令部対応 vs ⚓ 現地救難隊対応（2カラム進行ガイド） */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/80`}>
                    <div className="mb-2 text-xs font-bold text-indigo-950">
                      🏢 司令部・後方拠点の動きと誘導ポイント
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={4}
                        value={activeTimelineStep.hqResponse}
                        onChange={(e) =>
                          handleUpdateActiveTimelineStep((s) => ({
                            ...s,
                            hqResponse: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-2 text-xs leading-relaxed text-slate-900"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">
                        {activeTimelineStep.hqResponse}
                      </p>
                    )}
                  </div>

                  <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/80`}>
                    <div className="mb-2 text-xs font-bold text-emerald-950">
                      ⚓ 現地・フィールド班の動きと誘導ポイント
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={4}
                        value={activeTimelineStep.fieldResponse}
                        onChange={(e) =>
                          handleUpdateActiveTimelineStep((s) => ({
                            ...s,
                            fieldResponse: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-2 text-xs leading-relaxed text-slate-900"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">
                        {activeTimelineStep.fieldResponse}
                      </p>
                    )}
                  </div>
                </div>

                {/* ✅ GM進行チェックポイント（直接追加・編集可能） */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/85`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <CheckSquare className="h-4 w-4 text-emerald-700" />
                      Day {activeTimelineStep.dayNumber} GM進行チェックリスト
                    </span>
                    {isDirectEditMode && (
                      <button
                        onClick={() =>
                          handleUpdateActiveGmNote((n) => ({
                            ...n,
                            gmCheckpoints: [
                              ...(n.gmCheckpoints || []),
                              "新規進行チェック項目を入力してください",
                            ],
                          }))
                        }
                        className="no-print rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                      >
                        ＋ チェック項目追加
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {(activeGmNote.gmCheckpoints || []).map((chk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                        {isDirectEditMode ? (
                          <>
                            <input
                              type="text"
                              value={chk}
                              onChange={(e) => {
                                const next = [...activeGmNote.gmCheckpoints];
                                next[idx] = e.target.value;
                                handleUpdateActiveGmNote((n) => ({
                                  ...n,
                                  gmCheckpoints: next,
                                }));
                              }}
                              className="flex-1 rounded border border-dashed border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-900"
                            />
                            <button
                              onClick={() =>
                                handleUpdateActiveGmNote((n) => ({
                                  ...n,
                                  gmCheckpoints: n.gmCheckpoints.filter((_, i) => i !== idx),
                                }))
                              }
                              className="no-print text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span>{chk}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 📂 このフェーズで開示される証拠一覧（早見表） */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/85`}>
                  <div className="mb-2 text-xs font-bold text-slate-900">
                    📂 Day {activeTimelineStep.dayNumber} で開示される証拠資料（
                    {
                      project.evidences.filter(
                        (e) => e.foundPhase === activeTimelineStep.dayNumber
                      ).length
                    }
                    件）
                  </div>
                  <div className="space-y-2">
                    {project.evidences
                      .filter((e) => e.foundPhase === activeTimelineStep.dayNumber)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded border border-slate-300 bg-white p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>📄 {ev.title}</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              条件: {ev.acquisitionCondition || "フェーズ開始時"}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-700 line-clamp-2">
                            {ev.description}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 🎭 各PCへの個別誘導・GM進行ガイド一覧 */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/85`}>
                  <div className="mb-2 text-xs font-bold text-slate-900">
                    🎭 プレイヤー別 GM個別誘導メモ（直接編集・HO連動）
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {project.characters.map((c) => (
                      <div
                        key={c.id}
                        className="rounded border border-slate-300 bg-white p-2.5 text-xs"
                      >
                        <div className="mb-1 font-bold text-indigo-950">
                          {c.name}（{c.profession}）
                        </div>
                        {isDirectEditMode ? (
                          <textarea
                            rows={2}
                            value={c.handout.gmActionGuide || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              onUpdateProject((prev) => ({
                                ...prev,
                                characters: prev.characters.map((ch) =>
                                  ch.id === c.id
                                    ? {
                                        ...ch,
                                        handout: { ...ch.handout, gmActionGuide: val },
                                      }
                                    : ch
                                ),
                              }));
                              triggerSaveFeedback();
                            }}
                            placeholder="このPCに対するGMからの声かけ・誘導指針を記入"
                            className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-[11px] text-slate-900"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-[11px] text-slate-700">
                            {c.handout.gmActionGuide || "特記事項なし"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------
                共通ドキュメントフッター（管理署名・ページ表記）
               ---------------------------------------------------------------- */}
            <div
              className={`mt-8 flex flex-wrap items-center justify-between border-t pt-3 text-[11px] opacity-75 ${accent.borderSub}`}
            >
              <div className="flex-1">
                {isDirectEditMode ? (
                  <input
                    type="text"
                    value={currentDesign.footerNote}
                    onChange={(e) => handleUpdateDesign({ footerNote: e.target.value })}
                    className="w-full max-w-md border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 text-[11px] focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                    title="フッターのクレジット・管理注記を直接編集"
                  />
                ) : (
                  <span>{currentDesign.footerNote}</span>
                )}
              </div>
              <div className="font-mono">
                {currentDesign.documentCode} // UNAUTHORIZED REPRODUCTION PROHIBITED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
