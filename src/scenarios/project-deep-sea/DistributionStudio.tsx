"use client";

import { scenarioAssetUrl } from "@/scenarios/catalog";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  SpecialCharacterCard,
} from "@/types/schema";
import {
  initialVisualBoards,
  initialProject,
  DAILY_COMMANDER_BRIEFINGS,
  SPECIAL_CHARACTER_CARDS,
  NAGATSU_PHASE_CARDS,
} from "@/utils/initialProjectData";
import { GM_DAY_FLOWCHARTS } from "@/utils/gmFlowchartData";
import { GmOnePageFlowchart } from "@/components/GmOnePageFlowchart";
import {
  printCharacterHandoutsB5,
  printWhaleSonarGuideA4,
} from "@/utils/scriptGenerator";
import {
  Sparkles,
  Printer,
  Save,
  Check,
  Users,
  FileText,
  Map as MapIcon,
  Radio,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Palette,
  Stamp,
  Building2,
  Anchor,
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
  RotateCw,
  ExternalLink,
  Maximize2,
} from "lucide-react";

interface DocumentDesignStudioProps {
  project: MMProject;
  onUpdateProject: (updater: MMProject | ((prev: MMProject) => MMProject)) => boolean;
  saveError?: boolean;
  onSendAiPrompt?: (prompt: string) => void;
}

type StudioCategory = "handouts" | "evidences" | "visuals" | "gm_guides";

/**
 * 日本語の段落文章整形ヘルパー
 * カギカッコ（「や『）以外で始まる段落の先頭に全角スペース（　）を付与して字下げする
 */
const formatJapaneseParagraphs = (text: string): string => {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      // カギカッコや特殊記号で始まる段落は字下げしない
      if (
        trimmed.startsWith("「") ||
        trimmed.startsWith("『") ||
        trimmed.startsWith("（") ||
        trimmed.startsWith("【") ||
        trimmed.startsWith("・") ||
        trimmed.startsWith("-") ||
        trimmed.startsWith("―")
      ) {
        return trimmed;
      }
      // すでに全角スペースで始まっている場合はそのまま
      if (line.startsWith("　")) {
        return line;
      }
      return `　${trimmed}`;
    })
    .join("\n");
};

/**
 * 証拠カード表面タイトルの改行整形ヘルパー
 * ・明示的な frontTitleHtml があればそれを優先
 * ・「および」が含まれる場合は「および<br>」で改行
 */
const formatEvidenceFrontTitleHtml = (title: string, explicitHtml?: string): string => {
  if (explicitHtml) return explicitHtml;
  if (!title) return "";
  if (title.includes("および")) {
    return title.replace(/および/g, "および<br>");
  }
  return title;
};

/**
 * 証拠カードの所持PC・開示Dayに応じたカラーテーマを返すヘルパー
 */
const getEvidenceCardColorTheme = (ownerId: string, foundPhase: number) => {
  const charMap: Record<
    string,
    {
      badgeBg: string;
      borderHex: string;
      headerHex: string;
      dividerHex: string;
      frontBgHex: string;
    }
  > = {
    "char-asashio": {
      badgeBg: "#1e40af",
      borderHex: "#1e3a8a",
      headerHex: "#1e40af",
      dividerHex: "#93c5fd",
      frontBgHex: "#f8fafc",
    },
    "char-kaihama": {
      badgeBg: "#3730a3",
      borderHex: "#312e81",
      headerHex: "#3730a3",
      dividerHex: "#a5b4fc",
      frontBgHex: "#f8fafc",
    },
    "char-sakanagi": {
      badgeBg: "#0f766e",
      borderHex: "#115e59",
      headerHex: "#0f766e",
      dividerHex: "#5eead4",
      frontBgHex: "#f8fafc",
    },
    "char-tachiuo": {
      badgeBg: "#0369a1",
      borderHex: "#075985",
      headerHex: "#0369a1",
      dividerHex: "#7dd3fc",
      frontBgHex: "#f8fafc",
    },
    "char-namiyose": {
      badgeBg: "#6d28d9",
      borderHex: "#5b21b6",
      headerHex: "#6d28d9",
      dividerHex: "#c4b5fd",
      frontBgHex: "#f8fafc",
    },
    "char-hatsuse": {
      badgeBg: "#b45309",
      borderHex: "#92400e",
      headerHex: "#b45309",
      dividerHex: "#fcd34d",
      frontBgHex: "#fffbeb",
    },
  };

  const dayMap: Record<
    number,
    { dayBg: string; dayBorder: string; dayText: string }
  > = {
    1: { dayBg: "#eff6ff", dayBorder: "#93c5fd", dayText: "#1d4ed8" },
    2: { dayBg: "#f0fdfa", dayBorder: "#5eead4", dayText: "#0f766e" },
    3: { dayBg: "#f0f9ff", dayBorder: "#7dd3fc", dayText: "#0369a1" },
    4: { dayBg: "#fffbeb", dayBorder: "#fcd34d", dayText: "#b45309" },
    5: { dayBg: "#fff1f2", dayBorder: "#fda4af", dayText: "#be123c" },
    6: { dayBg: "#faf5ff", dayBorder: "#d8b4fe", dayText: "#6d28d9" },
  };

  const charTheme = charMap[ownerId] || {
    badgeBg: "#0f766e",
    borderHex: "#1e3a8a",
    headerHex: "#0f766e",
    dividerHex: "#93c5fd",
    frontBgHex: "#f8fafc",
  };
  const dayTheme = dayMap[foundPhase] || dayMap[1];

  return { ...charTheme, ...dayTheme };
};

/**
 * カード裏面（詳細内容）のカラーハイライト描画ヘルパー
 * ・【重要内容】をクリムゾンレッド太字＋淡いローズ背景で強調
 * ・『発言・証言引用』をディープインディゴ色（内部の【】も維持）で強調
 */
const renderBracketHighlights = (segment: string, keyPrefix: string): React.ReactNode => {
  const parts = segment.split(/(【[^】]+】)/g);
  return parts.map((part, i) => {
    if (part.startsWith("【") && part.endsWith("】")) {
      return (
        <span
          key={`${keyPrefix}-b-${i}`}
          className="font-extrabold rounded-[2px] px-0.5"
          style={{ color: "#b91c1c", backgroundColor: "#fff1f2" }}
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
};

const renderColoredCardBody = (text: string): React.ReactNode => {
  if (!text) return null;
  const quoteParts = text.split(/(『[^』]+』)/g);
  return quoteParts.map((part, idx) => {
    if (part.startsWith("『") && part.endsWith("』")) {
      return (
        <span
          key={`q-${idx}`}
          className="font-semibold"
          style={{ color: "#1e3a8a" }}
        >
          {renderBracketHighlights(part, `q-${idx}`)}
        </span>
      );
    }
    return renderBracketHighlights(part, `p-${idx}`);
  });
};

/**
 * カード下部余白の初心者向け用語解説（「※〇〇とは：…」）をカラー整形して描画するヘルパー
 */
const renderColoredGlossaryNote = (note: string): React.ReactNode => {
  if (!note) return null;
  const lines = note.split("\n");
  return lines.map((line, idx) => {
    const colonIdx = line.indexOf("：");
    if (colonIdx !== -1) {
      const head = line.slice(0, colonIdx + 1);
      const body = line.slice(colonIdx + 1);
      return (
        <div key={idx} className={idx > 0 ? "mt-0.5" : ""}>
          <span className="font-extrabold" style={{ color: "#0369a1" }}>
            {head}
          </span>
          <span style={{ color: "#1e293b" }}>{body}</span>
        </div>
      );
    }
    return (
      <div key={idx} className={idx > 0 ? "mt-0.5" : ""} style={{ color: "#1e293b" }}>
        {line}
      </div>
    );
  });
};

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
    defaultHeader: "GM用進行シート",
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

// GM進行資料：各Dayのフェーズ別構造化データ（開始タイミング・条件 ／ 長津アナウンス囲み枠 ／ GMアナウンス・進行ガイド）
interface GmStructuredPhase {
  phaseNumber: string;
  phaseTitle: string;
  startTrigger: string;
  handoutBadges?: string[];
  nagatsuAnnouncements?: {
    sourceLabel: string;
    text: string;
  }[];
  gmAnnouncements?: {
    branchBadge?: string;
    tone?: "emerald" | "amber" | "rose" | "slate";
    speakerLabel: string;
    text: string;
    cardActionNote?: string;
  }[];
  gmGuides?: string[];
}

const GM_DAY_STRUCTURED_PHASES: Record<number, GmStructuredPhase[]> = {
  1: [
    {
      phaseNumber: "DAY 1 フェーズ 1",
      phaseTitle: "緊急対策回線の開設 ＆ 各員の点呼・自己紹介",
      startTrigger: "ゲーム開始時（全員がキャラクターハンドアウトを読み終えた時点）",
      handoutBadges: [
        "SP-01：黒い小さな隕石のかけら（朝潮へ配布）",
        "DAY 1 指令書（朝潮へ配布 ※7名時は長津経由）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 1 指令書』の長津ブリーフィングと同文",
          text: "「東京本部および小笠原現地チームへ緊急入信。小笠原南西沖にて民間チャーター船『パパズドルフィン（総トン数約40t）』が突如全電源を喪失、AIS（自動船舶識別装置）も停波し、救難信号を発信した直後に通信が途絶いたしました。救難信号の発信から現在20分が経過しております。これより合同海難救助チームを開設します」",
        },
      ],
      gmGuides: [
        "朝潮（PC1）へ『DAY 1 指令書』を手渡し（7名プレイ時は長津が上段を読み上げてから朝潮へ手渡し）、ミッション①に従ってメンバー全員の点呼・自己紹介（氏名・所属・専門分野）を進行させます。",
      ],
    },
    {
      phaseNumber: "DAY 1 フェーズ 2",
      phaseTitle: "漂流海図の展開 ＆ 初期証拠カードの開示・捜索海域の決定",
      startTrigger: "全員の自己紹介が完了した直後",
      handoutBadges: [
        "全体提示：漂流海図（白地図）",
        "初期証拠カード6枚（PC1〜PC6のDay 1初期保有カードを開示可能にする）",
      ],
      gmGuides: [
        "朝潮（PC1）の指揮（ミッション②・③）のもと、各自の初期証拠カードを公開・共有させます。",
        "海流（真東へ2.0ノット）・南西強風による風圧流（30kt×5%＝北東へ1.5ノット）・経過時間（救難信号から現在20分＋現場到着まで40分＝合計1時間後）を合成させ、巡視船を急行させる捜索海域（正解：【東北東の漂流予測海域】）をチームで決定してGMへ宣言させます。",
      ],
    },
    {
      phaseNumber: "DAY 1 フェーズ 3",
      phaseTitle: "救助判定 ＆ 成否分岐ごとのGMアナウンス・証言カード配布",
      startTrigger: "プレイヤーが巡視船を急行させる「捜索海域」をGMへ宣言した時点（※最大2回まで地点指定可能）",
      handoutBadges: [
        "EV-08：船長の証言（成否に応じて配布）",
        "EV-07：大型冷凍ボックス（成否に応じて配布）",
      ],
      gmAnnouncements: [
        {
          branchBadge: "🟢 分岐1：1回目の指定で【東北東の漂流予測海域】を正解した場合（失敗0回 ➔ 証言カード2枚とも配布）",
          tone: "emerald",
          speakerLabel: "📢 GMからのアナウンス",
          text: "「巡視船が指定された東北東の海域へ急行し、暗礁群の手前で漂流していた遭難船『パパズドルフィン』を発見・接舷しました！ 荒波のなか間一髪で船長とダイバーたちの全員救出に成功しました。救助された船長とダイバーグループから、それぞれ証言と荷物の情報が得られましたのでカードを2枚ともお渡しします」",
          cardActionNote:
            "👉 GMのカード配布処理：『EV-08：船長の証言』と『EV-07：大型冷凍ボックス』の【2枚とも】その場でプレイヤーへ渡します。",
        },
        {
          branchBadge: "🟡 分岐2-A：1回目の指定が外れた場合（もう一度だけ再指定［リトライ］を促す）",
          tone: "amber",
          speakerLabel: "📢 GMからのアナウンス",
          text: "「指定された海域へ巡視船が急行しましたが、波浪と視界不良のなか船影を発見できません！ もう一度だけ、海流（真東2.0kt）と風圧流（北東1.5kt）、そして救難信号からの経過時間（現在20分＋航行40分＝合計1時間）を再計算し、急行すべき海域を再指定してください！」",
          cardActionNote:
            "👉 GMの進行処理：プレイヤーにもう一度だけ合議させ、2回目の捜索海域を指定させます。",
        },
        {
          branchBadge: "🟡 分岐2-B：2回目の再指定で【東北東の漂流予測海域】を正解した場合（失敗1回 ➔ 証言カード1枚のみ配布）",
          tone: "amber",
          speakerLabel: "📢 GMからのアナウンス",
          text: "「再指定された東北東の海域にて、暗礁群スレスレを漂流する遭難船を発見・救助に成功しました！ ただし捜索に時間を要したため、本日（Day 1）中に確認できるのは『船長の証言（EV-08）』または『大型冷凍ボックス（EV-07）』のどちらか1枚のみとなります（残る1枚は明日Day 2以降の調査枠として選択可能になります）」",
          cardActionNote:
            "👉 GMのカード配布処理：プレイヤーが選んだ【1枚のみ】をその場で渡します（残る1枚はDay 2以降の現地調査枠へ繰り越します）。",
        },
        {
          branchBadge: "🔴 分岐3：2回目の再指定も外れた場合（失敗2回 ➔ 自動救助成功・Day 1での証言カード配布は0枚）",
          tone: "rose",
          speakerLabel: "📢 GMからのアナウンス",
          text: "「指定海域からは外れていましたが、東北東の暗礁群手前を漂流していた遭難船を現場隊が目視で辛うじて発見し、緊急曳航・救助に成功しました！ しかし救助作業と荒天対応に全力を割いたため、本日の現場聴取は打ち切りとなります。『船長の証言（EV-08）』と『大型冷凍ボックス（EV-07）』の2枚は、明日Day 2以降の調査枠として選択可能になります」",
          cardActionNote:
            "👉 GMのカード配布処理：Day 1ではカードを渡さず、【2枚とも】Day 2以降の現地調査枠へ繰り越します。",
        },
      ],
    },
  ],

  2: [
    {
      phaseNumber: "DAY 2 フェーズ 1",
      phaseTitle: "西之島沖の突発海底噴火 ＆ 即応体制維持の通達",
      startTrigger: "Day 1の救助・証言カード確認が終わり、Day 2へ移行した時点",
      handoutBadges: [
        "SP-02：朝倉教授の最期（坂凪へ配布）",
        "SP-03：SOFAR層の特異性（太刀魚へ配布）",
        "DAY 2 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：Day 2 西之島沖噴火・微動監視海図",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 2 指令書』の長津ブリーフィングと同文",
          text: "「気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です。西之島周辺海域を中心として『火山性の地殻振動』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に一度に手を回す余裕はありませんので、優先度を決めて調査をお願いします。」",
        },
      ],
      gmGuides: [
        "坂凪（PC3）へ『SP-02』、太刀魚（PC4）へ『SP-03』を配布し、朝潮（PC1）へ『DAY 2 指令書』を手渡します。",
      ],
    },
    {
      phaseNumber: "DAY 2 フェーズ 2",
      phaseTitle: "優先調査項目の選択（東京1枠・小笠原2枠） ＆ 調査結果の共有",
      startTrigger: "長津のブリーフィング終了後、朝潮（PC1）が調査項目の選定（ミッション①）を開始した時点",
      handoutBadges: [
        "東京本部の調査カード（3択から1枚配布）",
        "小笠原現地の調査カード（4択［＋Day 1未取得証言カード］から2枚配布）",
      ],
      gmAnnouncements: [
        {
          tone: "slate",
          speakerLabel: "📢 GMからのアナウンス（調査枠の案内）",
          text: "「今回の調査では、東京本部側では3つの調査項目から1つ、小笠原現地では4つの調査項目（※Day 1で未取得の証言カードがある場合はそれも加えた項目）から2つを選ぶことができます。ここで選択されなかった情報は、明日（Day 3）以降の調査枠で調べることができます」",
          cardActionNote:
            "👉 GMのカード配布処理：プレイヤーが合議して選んだ調査項目の証拠カードを配布し、全員で共有・議論させます。",
        },
      ],
    },
  ],

  3: [
    {
      phaseNumber: "DAY 3 フェーズ 1",
      phaseTitle: "鳥島沖の海底噴火 ＆ 洋上ソノブイ索敵作戦の開始",
      startTrigger: "Day 2の調査共有が完了し、Day 3へ移行した時点",
      handoutBadges: [
        "SP-04：文民統制の仕組み（貝浜へ配布）",
        "DAY 3 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：鳥島沖ソノブイ作戦海図（W-3100）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 3 指令書』の長津ブリーフィングと同文",
          text: `「気象庁より緊急アラートを受信いたしました。昨日の西之島での噴火に続き、本日はさらに北方に位置する【鳥島沖】にて海底火山の噴火が発生しました。周辺海域では昨日と同様の『火山性の地殻振動』とともに、再び巨大生物の目撃情報が寄せられており、上層部より『巨大生物の現在位置を特定し、可能であれば写真でその姿を捉えてほしい』との緊急要請が出ています。
　これより小笠原基地から小笠原現地メンバーを乗せた大型捜索ヘリコプターが現場へ向かいますが、ヘリコプターでは鳥島沖まで航続距離に問題があるため、途中の海域に展開している大型巡視船『あきつしま』で洋上給油を受けて鳥島沖に展開してください。
　現場海域ではアクティブソナー付きのソノブイ（計3基）を投下して巨大生物の現在位置を特定し、浮上してくることがあれば写真撮影を試みてください。また、午後にはヘリコプターは帰投できますので、索敵と並行して本日の優先調査も進めてください」`,
        },
      ],
      gmGuides: [
        "朝潮（PC1）の指揮（ミッション①）で作戦海図（W-3100）上にソノブイ3基の投下ポイントを決定させ、巨大生物の現在位置（セクターB-3）を特定させます。",
        "あわせてDay 3の優先調査枠（東京1枠・小笠原現地2枠 ※前日未選択分を含む）も選択させ、該当する証拠カードを配布します（ミッション②）。※もしソノブイ索敵でB-3の特定に失敗した場合は、不鮮明な遠方写真を解析するため、小笠原現地の調査枠（2枠）のうち1枠を自動的に『F-3D：撮影した画像の分析（EV-25）』へ充当します（残り1枠を他から選択）。",
      ],
    },
    {
      phaseNumber: "DAY 3 フェーズ 2",
      phaseTitle: "目標捕捉 ＆ 北上速度・明日（Day 4）の到達位置予測",
      startTrigger: "ソノブイ索敵によって鳥島沖の巨大生物の現在位置（セクターB-3）を特定（または失敗時に広域残響から位置を捕捉）した直後",
      handoutBadges: [
        "長津カード NG-02",
        "DAY 3 途中① 指令書（朝潮へ配布）",
        "太刀魚へ配布：西之島〜鳥島沖 距離観測データ（約350km）",
        "貝浜へ配布：鳥島沖 ソノブイ探知記録（Day 3 17:00）",
        "浪寄へ配布：遭難船救助・目撃時刻調書（Day 1 09:00 西之島近海）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 3 途中① 指令書』および『長津カード NG-02（Day 3 途中①）』と同文",
          text: "「――洋上捜索ヘリより入電！ アクティブソナーにより鳥島沖の深海で巨大生物の現在位置を捕捉いたしました！ なお、これまでの海底噴火の時刻と巨大生物の動きには明確な関連があるように思えます。もしこのまま北上した場合、この先どうなるか検討が必要です。各員のデータから物体の移動スピードを算出し、明日（Day 4）はどのあたりまで北上するか予想を出してください！」",
        },
      ],
      gmGuides: [
        "太刀魚・貝浜・浪寄の3名へ距離・時刻データを配布し、【Day 1 09:00（西之島近海）➔ Day 3 17:00（鳥島沖）＝ 56時間、約350km ÷ 56時間 ＝ 時速6.25km（日速約150km）】と明日（Day 4）の北上予測地点（明神礁周辺）を算出・報告させます。",
      ],
    },
    {
      phaseNumber: "DAY 3 フェーズ 3",
      phaseTitle: "深海写真の受信 ＆ 専門家2名（浪寄・貝浜）への緊急諮問",
      startTrigger: "プレイヤーが移動スピードとDay 4の北上予測地点を算出し終えた直後",
      handoutBadges: [
        "長津カード NG-03",
        "DAY 3 途中② 指令書（朝潮へ配布）",
        "全体提示（索敵成功時）：洋上ソナー索敵撮影写真（近接浮上・索敵成功時）",
        "全体提示（索敵失敗時）：洋上ソナー索敵撮影写真（遠距離・索敵失敗時）＋ 浪寄へ『EV-25：撮影した画像の分析』を自動公開（現地調査1枠を消費）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 3 途中② 指令書』および『長津カード NG-03（Day 3 途中②）』と同文",
          text: "「――洋上捜索ヘリより緊急入電！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大生物、そして20本以上の無数の触手群を確認！\n① 浪寄准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。\n② 貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則ではこの規模の目標に対処不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」",
        },
      ],
      gmGuides: [
        "【ソノブイ索敵成功時】成功時の撮影写真（近接浮上）のみを提示します（『EV-25：撮影した画像の分析』は小笠原現地調査でF-3Dを選択した場合にのみ開示されます）。",
        "【ソノブイ索敵失敗時】成功時の写真は提示せず、失敗時の撮影写真（遠距離・航跡波）のみを提示します。あわせて小笠原現地の調査枠（2枠）のうち1枠を自動充当して『EV-25：撮影した画像の分析』を公開（浪寄へ配布）し、失敗時の画像を分析した結果（超高感度強調処理）として20本以上の触手と超群体（コロニー）構造が判明した形で進行します。",
        "浪寄（PC5）から、撮影写真および分析結果に基づく生物学的所見を共有させます。",
        "貝浜（PC2）から『SP-04：文民統制の仕組み』に基づき、海上警備行動（警察比例の原則）と防衛出動（武力攻撃事態）の法的な違いと課題を共有させます。",
      ],
    },
    {
      phaseNumber: "DAY 3 フェーズ 4",
      phaseTitle: "公式呼称（コードネーム）決定 ＆ 指揮官の最終決断",
      startTrigger: "専門家2名の所見共有およびDay 3の優先調査カードの共有が完了した時点（Day 3終盤）",
      handoutBadges: [
        "長津カード NG-04",
        "DAY 3 途中③ 指令書（朝潮へ配布）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 3 途中③ 指令書』および『長津カード NG-04（Day 3 達成時）』と同文",
          text: "「――防衛省および内閣官房より至急諮問が入電！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、朝潮危機管理官、指揮官として自衛隊への防衛出動を要請するか、または海上警備行動を発令するか最終意思決定をお願いいたします！」",
        },
      ],
      gmGuides: [
        "チームで巨大生物の公式呼称（コードネーム）を決定させ、朝潮（PC1）に「自衛隊への防衛出動を要請する」か「海上警備行動を発令する（防衛出動は見送る）」かを最終決断させてDay 3を終了します（※どちらを選んでもDay 4終盤で同じ展開へ合流します）。",
      ],
    },
  ],

  4: [
    {
      phaseNumber: "DAY 4 フェーズ 1",
      phaseTitle: "明神礁の海底噴火 ＆ 即応総力体制（全未調査資料の一括開示）",
      startTrigger: "Day 3の最終決断が完了し、Day 4へ移行した時点",
      handoutBadges: [
        "SP-05：神社の祝詞の複製（初瀬へ配布）",
        "DAY 4 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：Day 4 明神礁噴火・八丈島微動監視海図",
        "一括全開示：Day 1〜Day 4の未取得だった全証拠カードをすべて配布",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 4 指令書』の長津ブリーフィングと同文",
          text: "「未明、鳥島沖の北方に位置する【明神礁】周辺にて新たな海底噴火が発生。さらに八丈島および青ヶ島の地震計が火山性微動を断続的に探知しています。防衛省の水中聴音網（パッシブソナー網）による巨大生物の位置と火山性微動の発生源は完全に一致しており、巨大生物は【日速約150km】で正確に北上を続けています。政府および防衛省より『この巨大生物は一体どこへ向かい、何を引き起こす見立てなのか、合同対策本部の専門的予測を至急提出してほしい』との緊急照会が入っています。なお事態の緊迫化を受け、本日より当合同対策本部は調査枠制限を撤廃する【即応総力体制】へ移行します！」",
        },
      ],
      gmAnnouncements: [
        {
          tone: "slate",
          speakerLabel: "📢 GMからの補足案内（前日の防衛出動要請に対する政府回答 ＆ 全資料の一括配布）",
          text: "「前日の朝潮危機管理官の決断について、官邸および内閣法制局より『未知の生物は外国からの武力攻撃に該当せず、噴火との因果関係も未立証のため、現時点での防衛出動は見送る。ただし内閣を再説得するためにも、この生物がどこへ向かい何を引き起こす見立てなのか対策本部の専門的予測を至急提出してほしい』との連絡が入っています。これより即応総力体制として、これまで未取得だった調査資料とDay 4の調査資料をすべて一括でお渡しします！」",
          cardActionNote:
            "👉 GMのカード配布処理：初瀬（PC6）へ『SP-05：神社の祝詞の複製』を渡し、Day 1〜Day 4で未取得だったすべての証拠カードを一括でプレイヤーへ配布します。",
        },
      ],
    },
    {
      phaseNumber: "DAY 4 フェーズ 2",
      phaseTitle: "北上原因の分析 ＆ 最終到達予測地点（「富士山」vs「東京湾」）の結論報告",
      startTrigger: "一括開示された全証拠カードの精査が進み、朝潮（PC1）が上層部への進路予測報告（ミッション②・③）をまとめた時点",
      gmGuides: [
        "巨大生物が北上する理由（①地磁気 ＋ ②小笠原・八丈島・三宅島の神社から盗まれ海へ順番に落とされた隕石の特殊物質、および約30kgの冷凍ボックスの配送先が『静岡県・富士山麓』であること）を整理させます。",
        "合同対策本部として、巨大生物の最終到達予測地点が【富士山（駿河湾）】か【東京湾】かを結論づけさせます。",
      ],
      gmAnnouncements: [
        {
          branchBadge: "🟢 結論分岐A：【富士山（駿河湾）】と結論づけた場合（正解ルート）",
          tone: "emerald",
          speakerLabel: "📋 GM進行記録（富士山ルート）",
          text: "Day 6の岸部運用企画局長との電話交渉が通常の第一声で進行します。",
        },
        {
          branchBadge: "🟡 結論分岐B：【東京湾】と結論づけた場合（Day 6岸部局長の嫌味分岐）",
          tone: "amber",
          speakerLabel: "📋 GM進行記録（東京湾ルート）",
          text: "Day 4・Day 5の進行も共通ですが、【Day 6の岸部運用企画局長との電話交渉で嫌味を言われる】ことになります（GMは東京湾と答えたことを控えておいてください）。",
        },
      ],
    },
    {
      phaseNumber: "DAY 4 フェーズ 3",
      phaseTitle: "防衛省「害獣駆除」方針による海上自衛隊の動員通達",
      startTrigger: "対策本部が最終到達予測地点（富士山または東京湾）を報告した直後（Day 4終盤）",
      handoutBadges: ["長津カード NG-05"],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『長津カード NG-05（Day 4 達成時）』と同文",
          text: "「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊の動員を正式決定いたしました！ 八丈島〜御蔵島沖にて通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」",
        },
      ],
    },
  ],

  5: [
    {
      phaseNumber: "DAY 5 フェーズ 1",
      phaseTitle: "御蔵島沖の海底噴火・富士山地下微動（残り48時間） ＆ 独自調査",
      startTrigger: "Day 4が終了し、Day 5へ移行した時点",
      handoutBadges: [
        "SP-06：マッコウクジラクリック音の距離限界と集合に必要な時間（浪寄へ配布）",
        "DAY 5 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：Day 5 御蔵島沖噴火・富士山微動監視海図",
        "Day 5 調査資料（朝倉教授の構文規則ノート EV-30 等）を配布",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 5 指令書』の長津ブリーフィングと同文",
          text: "「伊豆諸島を北上する連続海底噴火を受け、気象庁は【富士山地下深部において微弱な火山性微動が観測された】と発表、政府は伊豆七島の噴火警戒レベル引き上げと避難準備を指示しました。同時に防衛省および火山噴火予知連絡会より連絡が入電！『駿河湾奥までの残距離は【約240km】、現在の巡航速度は【時速5km】であり、危機到達まで【残り48時間】と思われる』とのことです。また、自衛隊が実施する実弾迎撃作戦は【最高軍事機密】に移行し情報提供が遮断されたため、合同対策本部は独自の調査任務を進めるよう通達が出ています」",
        },
      ],
      gmGuides: [
        "Day 5の調査資料（朝倉教授のクジラ言語・『了解した』以外はすべて2語成語のペアで会話する構文規則など）を精査させます。",
      ],
    },
    {
      phaseNumber: "DAY 5 フェーズ 2",
      phaseTitle: "魚雷命中後のソナー観測報告 ＆ 防衛省作戦本部からの緊急照会",
      startTrigger: "Day 5調査資料の精査が一通り進んだ時点（Day 5後半）",
      handoutBadges: [
        "長津カード NG-06",
        "DAY 5 途中① 指令書（朝潮へ配布）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 5 途中① 指令書』および『長津カード NG-06（Day 5 達成時）』と同文",
          text: "「――暗号ホットラインに着信！ 貝浜リエゾンへ、防衛省作戦本部より直通無線が接続されました！『魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。しかし、目標が発している特有の振動が起きておらず、それにあわせて火山性の周期的な微動が収まっていることを確認できている。アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが、疑問が残る。浪寄准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ なぜ富士山を目指すのか？！』とのことです！」",
        },
      ],
      gmGuides: [
        "対策本部として「①多数のダイオウイカの超群体（コロニー）であるため魚雷で一部を砕いても深海で再結合して元の大きさに戻ってしまうこと」「②富士山麓の民家へ運ばれた約30kgの隕石の特殊物質と地磁気に引き寄せられていること」を整理・回答させてDay 5を終了します。",
      ],
    },
  ],

  6: [
    {
      phaseNumber: "DAY 6 フェーズ 1",
      phaseTitle: "朝8時ブリーフィング（巨大生物の完全回復・北上再開） ＆ 全音響資料の開示",
      startTrigger: "Day 5が終了し、Day 6（決戦前日・朝8時）へ移行した時点",
      handoutBadges: [
        "SP-07：防衛省 運用企画局長とのコネクション（7名時は長津へ配布）",
        "DAY 6 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：Day 6 監視海図 ＆ クジラ音響解析ガイド（A4両面）",
        "Day 6 未回収資料 ＆ 朝倉教授の実録音響データ（EV-31〜34）を全開示",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 6 指令書』の長津ブリーフィングと同文",
          text: "「予想通りというべきか、本日の【朝8時】の時点で巨大生物がほとんど同じ大きさまで回復。駿河トラフ境界に向けて北上を再開しています。それにあわせて【富士山地下の火山性微動が再開】しました。駿河湾までは【24時間ほどで到達する見込み】で、防衛省からは速やかに対策をまとめるようにと指示がでています。なお、東京班が徹夜で回収した残りの捜査資料と、朝倉教授の遺品である実録音響データをすべて開示します！」",
        },
      ],
    },
    {
      phaseNumber: "DAY 6 フェーズ 2",
      phaseTitle: "朝倉教授の実録音響データの解析 ＆ 魚雷以外の方法で24時間以内に巨大生物を撃退する作戦の立案（目安15分）",
      startTrigger: "フェーズ1の資料開示直後、プレイヤーが『マッコウクジラ音響言語解析システム（/sonar）』にアクセスし、実録音響データの分析と撃退作戦の立案を開始した時点",
      gmGuides: [
        "【ミッション②・③の進行】伝統の祝詞（『人と勇魚の契り、大獲物ぞ、集ひ来よ』・4語）だけでは移動する巨大生物を追跡・迎撃するための位置や行動を伝えきれないため、システム上は最大8語（2語×4組）まで許容されています（8語すべてを固定枠として埋めることが必須なのではなく、クジラを駿河湾へ呼び寄せて巨大生物を捕食させる意図が成立していれば柔軟に正解として扱えます。標準的な構成例：【①人間とクジラ＋約束】【②海の下の火山＋探せ】【③北＋集まれ】【④大きい・たくさんの餌＋攻撃せよ】）。あわせて、24時間後の駿河湾到達までにどうやって巨大生物を撃退するか（深海SOFAR層での音響放流・クジラの移動時間6〜8時間）の作戦をまとめさせます。",
      ],
      gmAnnouncements: [
        {
          branchBadge: "⚠️ 条件分岐：プレイヤーがアプリ内の『狂気の深淵を覗く』ボタンを押した場合（押さなかった場合は発生しません）",
          tone: "rose",
          speakerLabel: "📢 GMからの心停止宣言 ＆ 救命（声かけ）処理（ボタン押下から5分間の猶予経過後に発生）",
          text: "【1. 心停止の宣言（ボタン押下から5分後・議論の一区切りまたは祝詞完成直後）】\n「……その時です。『狂気の深淵』を覗いてしまった〇〇さんが、突如として激しい心臓発作に襲われ、意識を失います。脈がなく、呼吸も止まっています――【心停止】です！ このまま数分が経過すれば絶命してしまいます！」\n\n【2. 蘇生条件（数分以内／身体接触や床に倒れる演技は不要・口頭宣言のみ）】\n① 坂凪（PC3）または初瀬（PC6）が「救命処置（心肺蘇生・AED）を行う（※東京本部のメンバーが倒れた場合は、通信越しに遠隔で救命処置を指示する）」と宣言する。\n② 初瀬（PC6）の直観（「意識がなくても耳には声が作用する」）に基づき、名前を呼んで「戻ってこい」「まだ死ぬな」と【声かけ】を行う。\n\n【3. 蘇生成功の宣言】\n「救命処置、そして皆さんの『戻ってこい』という呼びかけの声が、暗い深淵の底へと沈みかけていた〇〇さんの耳に届きました。……ドクン！！と力強く心臓が再び脈打ち、〇〇さんは息を吹き返します！」",
        },
      ],
    },
    {
      phaseNumber: "DAY 6 フェーズ 3",
      phaseTitle: "長津からの直通交渉提案（新言語祝詞の音声完成直後）",
      startTrigger: "プレイヤーが新言語祝詞（2語×4組）の音声信号を完成させた直後（および心停止イベントが発生した場合は蘇生完了後）",
      handoutBadges: [
        "DAY 6 途中① 指令書（朝潮へ配布 ※SP-07連動）",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 6 途中① 指令書』の長津アナウンスと同文",
          text: "「――クジラを呼び寄せる新言語祝詞の音声が完成しましたね！ しかし、防衛省の上層部は『さらなる魚雷の飽和攻撃』の準備を進めており、通常のルートで上申しても潜水艦で祝詞の音声を流すような作戦は到底承認されません。……朝潮危機管理官、皆さん、実は防衛省で自衛隊部隊の運用を統括する最高責任者・【運用企画局長の岸部（きしべ）】は私の親戚（叔父）にあたりまして、直通の連絡先を持っています。厳格な現実主義者ですが、科学的な根拠と計算に基づく進言であれば耳を傾けてくれるはずです。準備が整い次第、回線を繋ぎますので直接説得を頼みます！」",
        },
      ],
    },
    {
      phaseNumber: "DAY 6 フェーズ 4",
      phaseTitle: "防衛省 運用企画局長・岸部（きしべ）との直通電話交渉（GMロールプレイ）",
      startTrigger: "対策本部が説得の根拠（ミッション①）を整理し、長津を通じて岸部局長へ直通電話を繋いだ時点",
      gmAnnouncements: [
        {
          branchBadge: "🟢 第一声（通常）：Day 4で最終目的地を【富士山（駿河湾）】と結論づけていた場合",
          tone: "emerald",
          speakerLabel: "🎙️ NPC：防衛省 運用企画局長・岸部（GM）",
          text: "「――防衛省運用企画局長の岸部だ。長津からの緊急回線とはな……合同対策本部の諸君、こんな深夜に一体何の用件だね？」",
        },
        {
          branchBadge: "🟡 第一声（嫌味分岐）：Day 4で最終目的地を【東京湾】と結論づけていた場合",
          tone: "amber",
          speakerLabel: "🎙️ NPC：防衛省 運用企画局長・岸部（GM）",
          text: "「――防衛省運用企画局長の岸部だ。……ほう、一昨日は『巨大生物は東京湾へ向かう』と報告して我が海上自衛隊の展開を遅らせ、結果として駿河湾の目と鼻の先まで押し込まれる原因を作った対策本部の諸君か。その節は実に貴重なご高説をありがとう。で、こんな深夜に今度は一体どんな名案を持ってきたというのだね？」",
        },
        {
          branchBadge: "⚠️ 岸部局長の反論による思考誘導（プレイヤーの説明に不足がある場合、反論してその場で答えを導き出させる）",
          tone: "slate",
          speakerLabel: "🎙️ NPC：防衛省 運用企画局長・岸部（GM）",
          text: "①【なぜ魚雷の飽和攻撃ではなくクジラなのか？が曖昧な場合】\n「海自の魚雷で仕留めきれなかったのは事実だ。だが、なぜ大量の魚雷による飽和攻撃ではなく、クジラでなければならんのだ？！」\n➔ 『単一生物ではなく多数のダイオウイカの超巨大群体（コロニー）であるため、魚雷では深海で再結合して復活してしまうこと』『ダイオウイカの天敵はマッコウクジラであること』を引き出す。\n\n②【音響層（水深1,000mのSOFAR層／潜水艦の水中スピーカー）が抜けていた場合】\n「海面や浅い海からスピーカーで音を出したところで、水中の音は数キロ先で減衰して消えるぞ！ 何百キロも先のクジラへ音を届ける具体的な『海の層』と『手段』を示せ！」\n➔ 『水深1,000mのSOFAR層（深海音響チャネル）まで海自の潜水艦で潜航し、水中スピーカーで大出力放流する』解答を引き出す。\n\n③【移動時間（クジラが集結するのに6〜8時間＝今夜の発信が必要）が抜けていた場合】\n「なぜ『今夜、この深夜』のうちに緊急で潜水艦を動かさねばならんのだ？！ 明日の朝、目標が駿河湾に現れてから音を流せば十分ではないのか？！」\n➔ 『太平洋のクジラが泳いで駿河湾へ集結するには6〜8時間かかるため、明朝の決戦に間に合わせるには今夜のうちに発信しなければならない』解答を引き出す。",
        },
        {
          branchBadge: "✅ 3つの根拠が揃った時点：交渉成立・岸部局長の決断",
          tone: "emerald",
          speakerLabel: "🎙️ NPC：防衛省 運用企画局長・岸部（GM）",
          text: "「――……なるほど。超巨大群体に対する通常兵器の限界と天敵クジラによる捕食、そして深海SOFAR層による音響伝達とクジラの遊泳時間（6〜8時間）の逆算か。机上の空論ではなく、極めて冷徹な計算に基づいているな。……いいだろう。防衛省運用企画局長として、私が全責任を背負おう。直ちに第1潜水隊群へ緊急出動を下令する。潜水艦を深海1,000mのSOFAR層へ急速潜航させ、水中スピーカー（水中音響送信機）より貴官らの人工音源（祝詞音源）を大出力で放流させる。また、明朝の現場部隊へは『実弾魚雷の即時発射を抑制し、クジラの捕食を見届けて待機せよ』と通達しよう。――明朝の運命、君たちに託すぞ」",
        },
      ],
    },
    {
      phaseNumber: "DAY 6 フェーズ 5",
      phaseTitle: "深海SOFAR層での新言語祝詞・大出力放流開始",
      startTrigger: "岸部運用企画局長の説得に成功し、第1潜水隊群への緊急出動命令が下った直後（Day 6終盤）",
      handoutBadges: ["長津カード NG-07"],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『長津カード NG-07（Day 6 達成時）』と同文",
          text: "「――海上自衛隊の潜水艦が水深1,000mの深海SOFAR層へ到達！ 水中スピーカー（水中音響送信機）より、人工音源（新言語祝詞）の大出力での放流を開始いたしました！ 音波は深海音響チャネル（SOFAR層）に乗って、太平洋全域へと急速に拡散しています！ あとは夜明けの決戦までに、マッコウクジラの大群が駿河湾へ集結してくれるのを祈りましょう！」",
        },
      ],
    },
  ],

  7: [
    {
      phaseNumber: "DAY 7 フェーズ 1",
      phaseTitle: "最終決戦の夜明け ＆ 駿河湾への目標接近",
      startTrigger: "Day 6が終了し、Day 7（最終決戦の夜明け）へ移行した時点",
      handoutBadges: [
        "DAY 7 指令書（朝潮へ配布 ※7名時は長津経由）",
        "全体提示：Day 7 最終決戦監視海図",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『DAY 7 指令書』の長津ブリーフィングと同文",
          text: "「夜明けを迎えました。現状、【富士山地下の火山性微動は継続】しており、巨大生物は水深600〜1,000mを維持して【駿河湾付近まで接近】しています！ 周辺海域に展開する海上自衛隊の潜水艦部隊および水中聴音網（パッシブソナー網）より、順次リアルタイムの探知状況と気象庁の火山観測データが入電いたします！」",
        },
      ],
    },
    {
      phaseNumber: "DAY 7 フェーズ 2",
      phaseTitle: "マッコウクジラ大群の集結・深海大捕食 ＆ 富士山噴火危機の完全停止",
      startTrigger: "フェーズ1の開始ブリーフィングに続けて、深海ソナー探知および気象庁の火山観測データが入電した時点",
      handoutBadges: [
        "長津カード NG-08-1",
        "長津カード NG-08-2",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "『長津カード NG-08-1（Day 7 達成時①）』と同文",
          text: "「長津です。水中聴音網（パッシブソナー網）および海自潜水艦の深海ソナー探知から、クジラと思われる生物が100頭以上、駿河湾に集結しています。昨夜からの呼びかけに応えたものと考えられます。さらに太平洋全域から、後続の1,000頭近くが駿河湾への移動を示しています。\n　先ほどから、クジラが深海へと潜水を開始。水深1,000m付近の巨大生物への複数回の接触が見られます。大量のクジラが一斉に巨大生物に喰らいついていると考えられます。\n　深海ソナー探知の結果、巨大生物は大幅にその大きさが縮小しており、さきほどクジラとの区別がつかなくなりました。同時に、この巨大生物から発せられていた特有の振動も完全に停止しています」",
        },
        {
          sourceLabel: "『長津カード NG-08-2（Day 7 達成時②）』と同文",
          text: "「――気象庁火山監視課より緊急入電！ 富士山地下深部における火山性微動、急激に減衰しており、さきほど完全に停止が確認できました！\n　防衛省・自衛艦隊司令部より全潜水艦へ通達入電、『目標の完全消滅を確認。魚雷発射管閉鎖、全部隊攻撃中止（スタンドダウン）』の命令がありました！\n　このあと引き続き巨大生物が復活してこないか継続監視を行うようですが、現状クジラたちが、太古からの盟約に従って巨大生物を殲滅。富士山噴火を直前で停止できたと考えられます。\n　皆さん、やりました。我々と、クジラの勝利です」",
        },
      ],
    },
    {
      phaseNumber: "DAY 7 フェーズ 3",
      phaseTitle: "防衛省・自衛艦隊幹部からの直通電話（公表方法の最終選択）",
      startTrigger: "長津の作戦成功アナウンス（NG-08-2）が完了し、対策本部に安堵が広がった直後",
      gmAnnouncements: [
        {
          tone: "slate",
          speakerLabel: "🎙️ NPC：防衛省・自衛艦隊幹部（GM）",
          text: "「――朝潮君、貝浜君、聞こえるかね。\n……まずは、事態をここまで抑え込んだ君たちの尽力には感謝する。\nだがね……自衛隊の出動まで閣議決定しておいて、自衛隊側は何の活動もしなかったというのは、世間にも国会にも説明ができないんでね。ここは、海上自衛隊の出動を決めた総理が国民に説明するために、少し稼働したいと言っている。\nこのあと、駿河湾沖合に向けて、自衛隊側から『害獣駆除の掃討攻撃（爆雷・魚雷投下）』を一斉に行わせる。そもそも、クジラの攻撃で相手が完全に消滅したという確固たる証拠があるわけでもないだろう？\n世間には『海上自衛隊が役に立った』という証明にもなるし、総理も自分の決断に自信が持てる。\n君たちの功績を出さず、国家防衛上の機密として処理したい。だが、君たちの功績として発表し、海上自衛隊は何もせずに解決できたとすることも、今ならばできる。クジラの祝詞などの詳細は伏せるがね。機転を効かせたヒーローとしてメディアにも取り上げてもらうことになる。今、どちらを選ぶか決めてほしい。このあとの政府の発表内容に関わる」",
          cardActionNote:
            "👉 GM進行処理：プレイヤー全員で合議させ、【選択肢A：功績を出さず、海上自衛隊の戦果として処理する】か【選択肢B：合同対策本部の功績として発表し、自衛隊の武力攻撃は不要とする】を決断させます。\n💡【A案でもクジラを逃がせるガイド】：仮に選択肢Aを選んだ場合でも、プレイヤーがクジラへの退避メッセージ（例：「ド・ドーン・カッカッ（人間とクジラ）」「チ・トン・チ（約束）」「ポ・ポポン（南）」「タタ・タト・トン（逃げろ）」など、「逃げろ」を含むメッセージ）を送れば、クジラたちに魚雷・爆雷を回避してもらうことができます。",
        },
        {
          branchBadge: "🟣 条件分岐：プレイヤーが「爆雷を投下させず、かつ自衛隊も立てる第3の選択」を交渉してきた場合",
          tone: "amber",
          speakerLabel: "🎙️ NPC：防衛省・自衛艦隊幹部（岸部 / GM）",
          text: "「現場も無意味な攻撃を望んではいない。だが、その方法は総理の指示と違う行動をとることになる。あらためて進言するが、我々は総理に嘘を吐くことはできない。ご納得いただけるかは分からない」\n\n（※ここから先の交渉の成否や展開は、その場のGMの判断・裁量に委ねます。\n【第3の選択の参考案】：総理に嘘を吐くのではなく、『海上自衛隊の潜水艦による深海音響作戦が奏功して無力化・駆除できたこと』『無意味な実弾投下を避け、国民の生命と国土を守ることを最優先した結果であること』として報告・発表する形にまとめる等）",
        },
        {
          branchBadge: "プレイヤーの回答を受けた後の結びのセリフ",
          tone: "emerald",
          speakerLabel: "🎙️ NPC：防衛省・自衛艦隊幹部（GM）",
          text: "「……わかった。このあと、政府からの発表がある。\nいずれにしても、君たちが正しかった。感謝する」\n（ツーツーツー……と静かに終話音が響く）",
        },
      ],
    },
    {
      phaseNumber: "DAY 7 フェーズ 4",
      phaseTitle: "テレビ臨時ニュース（政府公式発表の全国報道・選択肢A/B分岐） ＆ 対策本部解散",
      startTrigger: "フェーズ3でプレイヤーが公表方法（選択肢AまたはB）を決断し、防衛省幹部との電話が切れた直後",
      handoutBadges: [
        "選択肢Aの場合：長津カード NG-09",
        "選択肢Bの場合：長津カード NG-10",
      ],
      nagatsuAnnouncements: [
        {
          sourceLabel: "【選択肢Aを選んだ場合】『長津カード NG-09（Day 7 報道A：自衛隊の戦果として処理）』と同文",
          text: "「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、一連の危機事態が完全に沈静化したと発表しました。政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が海底のマグマ網を刺激していた可能性が高いことが判明。これに対し、政府の『有害鳥獣駆除』方針に基づき緊急出動していた海上自衛隊が、今朝未明、駿河湾口沖合の深海においてこの巨大生物を捕捉。潜水艦部隊および護衛艦による実弾掃討作戦を敢行し、この巨大生物を完全に撃滅・駆除したとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『自衛隊の果敢な決断と迅速な行動が国土と国民の生命を守り抜いた』と声明を発表しています――」",
        },
        {
          sourceLabel: "【選択肢Bを選んだ場合】『長津カード NG-10（Day 7 報道B：合同対策本部の功績として公表）』と同文",
          text: "「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけての連続海底噴火と富士山の火山性微動について、内閣官房長官は先ほど、危機事態が完全に沈静化したと発表しました。西之島沖から駿河トラフへ北上していた『未確認の超巨大海洋生物』が海底マグマ網を刺激していたことが判明。政府は海上自衛隊を出動させていましたが、今朝未明、海上保安庁・気象庁・海洋科学大学などによる『合同対策本部』の特別チームが機転を効かせ、深海へ特別な薬を撃ち込む独自の無力化作戦を敢行。見事に巨大生物の駆除に成功し、自衛隊による武力攻撃は不要となったとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『一発の砲火も交えず、現場の機転と科学の力で日本を救った合同対策本部のメンバーは我が国の誇りでありヒーローである』と称える声明を発表しています――」",
        },
      ],
      gmGuides: [
        "臨時ニュースの読み上げ後、朝潮（PC1）からメンバー全員へ労いの言葉と「合同対策本部の解散宣言」（ミッション③）を行ってもらい、物語の幕を閉じます。",
      ],
    },
  ],
};

// GM演出用ナレーション ＆ NPCセリフ台本（テキスト編集欄用：GM_DAY_STRUCTURED_PHASESと同内容）
const DEFAULT_GM_NARRATIONS: Record<number, string> = {
  1: `■ DAY 1 フェーズ1：緊急対策回線の開設 ＆ 各員の点呼・自己紹介
⏱️ 開始タイミング・条件：ゲーム開始時（全員がキャラクターハンドアウトを読み終えた時点）
📦 配布資料：朝潮へ『SP-01：黒い小さな隕石のかけら』『DAY 1 指令書』（7名時は長津経由）

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 1 指令書』と同文） ━━┓
「東京本部および小笠原現地チームへ緊急入信。小笠原南西沖にて民間チャーター船『パパズドルフィン（総トン数約40t）』が突如全電源を喪失、AIS（自動船舶識別装置）も停波し、救難信号を発信した直後に通信が途絶いたしました。救難信号の発信から現在20分が経過しております。これより合同海難救助チームを開設します」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
・朝潮（PC1）の進行（ミッション①）で全員の点呼・自己紹介を行わせます。

■ DAY 1 フェーズ2：漂流海図の展開 ＆ 初期証拠カードの開示・捜索海域の決定
⏱️ 開始タイミング・条件：全員の自己紹介が完了した直後
📦 提示・配布：『漂流海図（白地図）』提示 ＋ Day 1初期証拠カード6枚を公開可能にする
・朝潮の指揮（ミッション②・③）のもと、海流（真東2.0kt）・風圧流（北東1.5kt）・経過時間（現在20分＋航行40分＝合計1時間後）を合成し、巡視船を急行させる捜索海域（正解：【東北東の漂流予測海域】）を決定させます。

■ DAY 1 フェーズ3：救助判定 ＆ 成否分岐ごとのGMアナウンス・証言カード配布
⏱️ 開始タイミング・条件：プレイヤーが巡視船を急行させる「捜索海域」をGMへ宣言した時点（最大2回まで指定可能）

▼ 🟢 分岐1：1回目の指定で【東北東の漂流予測海域】を正解した場合（失敗0回 ➔ 証言カード2枚とも配布）
【GMからのアナウンス】：
「巡視船が指定された東北東の海域へ急行し、暗礁群の手前で漂流していた遭難船『パパズドルフィン』を発見・接舷しました！ 荒波のなか間一髪で船長とダイバーたちの全員救出に成功しました。救助された船長とダイバーグループから、それぞれ証言と荷物の情報が得られましたのでカードを2枚ともお渡しします」
👉 GM対応：『EV-08：船長の証言』と『EV-07：大型冷凍ボックス』の【2枚とも】その場で渡します。

▼ 🟡 分岐2-A：1回目の指定が外れた場合（もう一度だけ地点の再指定［リトライ］を促す）
【GMからのアナウンス】：
「指定された海域へ巡視船が急行しましたが、波浪と視界不良のなか船影を発見できません！ もう一度だけ、海流（真東2.0kt）と風圧流（北東1.5kt）、そして救難信号からの経過時間（現在20分＋航行40分＝合計1時間）を再計算し、急行すべき海域を再指定してください！」

▼ 🟡 分岐2-B：2回目の再指定で正解した場合（失敗1回 ➔ 証言カード1枚のみ配布）
【GMからのアナウンス】：
「再指定された東北東の海域にて、暗礁群スレスレを漂流する遭難船を発見・救助に成功しました！ ただし捜索に時間を要したため、本日（Day 1）中に確認できるのは『船長の証言（EV-08）』または『大型冷凍ボックス（EV-07）』のどちらか1枚のみとなります（残る1枚は明日Day 2以降の調査枠として選択可能になります）」
👉 GM対応：プレイヤーが選んだ【1枚のみ】をその場で渡します（残る1枚はDay 2以降の調査枠へ繰り越し）。

▼ 🔴 分岐3：2回目の再指定も外れた場合（失敗2回 ➔ 自動救助成功・Day 1での証言カード配布は0枚）
【GMからのアナウンス】：
「指定海域からは外れていましたが、東北東の暗礁群手前を漂流していた遭難船を現場隊が目視で辛うじて発見し、緊急曳航・救助に成功しました！ しかし救助作業と荒天対応に全力を割いたため、本日の現場聴取は打ち切りとなります。『船長の証言（EV-08）』と『大型冷凍ボックス（EV-07）』の2枚は、明日Day 2以降の調査枠として選択可能になります」
👉 GM対応：Day 1ではカードを渡さず、【2枚とも】Day 2以降の調査枠へ繰り越します。`,

  2: `■ DAY 2 フェーズ1：西之島沖の突発海底噴火 ＆ 即応体制維持の通達
⏱️ 開始タイミング・条件：Day 1の救助・証言カード確認が終わり、Day 2へ移行した時点
📦 配布・提示：坂凪へ『SP-02』、太刀魚へ『SP-03』、朝潮へ『DAY 2 指令書』配布 ＋ 『Day 2 監視海図』提示

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 2 指令書』と同文） ━━┓
「気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です。西之島周辺海域を中心として『火山性の地殻振動』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に一度に手を回す余裕はありませんので、優先度を決めて調査をお願いします。」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 2 フェーズ2：優先調査項目の選択（東京1枠・小笠原2枠） ＆ 調査結果の共有
⏱️ 開始タイミング・条件：長津のブリーフィング終了後、朝潮（PC1）が調査項目の選定を開始した時点
【GMからの案内】：
「今回の調査では、東京本部側では3つの調査項目から1つ、小笠原現地では4つの調査項目（※Day 1で未取得の証言カードがある場合はそれも加えた項目）から2つを選ぶことができます。ここで選択されなかった情報は、明日（Day 3）以降の調査枠で調べることができます」`,

  3: `■ DAY 3 フェーズ1：鳥島沖の海底噴火 ＆ 洋上ソノブイ索敵作戦の開始
⏱️ 開始タイミング・条件：Day 2の調査共有が完了し、Day 3へ移行した時点
📦 配布・提示：貝浜へ『SP-04』、朝潮へ『DAY 3 指令書』配布 ＋ 『鳥島沖ソノブイ作戦海図（W-3100）』提示

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 3 指令書』と同文） ━━┓
「気象庁より緊急アラートを受信いたしました。昨日の西之島での噴火に続き、本日はさらに北方に位置する【鳥島沖】にて海底火山の噴火が発生しました。周辺海域では昨日と同様の『火山性の地殻振動』とともに、再び巨大生物の目撃情報が寄せられており、上層部より『巨大生物の現在位置を特定し、可能であれば写真でその姿を捉えてほしい』との緊急要請が出ています。
　これより小笠原基地から小笠原現地メンバーを乗せた大型捜索ヘリコプターが現場へ向かいますが、ヘリコプターでは鳥島沖まで航続距離に問題があるため、途中の海域に展開している大型巡視船『あきつしま』で洋上給油を受けて鳥島沖に展開してください。
　現場海域ではアクティブソナー付きのソノブイ（計3基）を投下して巨大生物の現在位置を特定し、浮上してくることがあれば写真撮影を試みてください。また、午後にはヘリコプターは帰投できますので、索敵と並行して本日の優先調査も進めてください」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 3 フェーズ2：目標捕捉 ＆ 北上速度・明日（Day 4）の到達位置予測
⏱️ 開始タイミング・条件：ソノブイ索敵で鳥島沖の巨大生物の現在位置（B-3）を特定した直後
📦 配布：長津へ『NG-02』、朝潮へ『DAY 3 途中① 指令書』、太刀魚（約350km）・貝浜（Day 3 17:00）・浪寄（Day 1 09:00 西之島近海）へ距離・時刻証拠3枚を配布
💡 正解メモ：Day 1 09:00（西之島近海）➔ Day 3 17:00（鳥島沖）＝ 56時間、約350km ÷ 56時間 ＝ 時速6.25km（日速約150km）

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 3 途中① 指令書』・『NG-02』と同文） ━━┓
「――洋上捜索ヘリより入電！ アクティブソナーにより鳥島沖の深海で巨大生物の現在位置を捕捉いたしました！ なお、これまでの海底噴火の時刻と巨大生物の動きには明確な関連があるように思えます。もしこのまま北上した場合、この先どうなるか検討が必要です。各員のデータから物体の移動スピードを算出し、明日（Day 4）はどのあたりまで北上するか予想を出してください！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 3 フェーズ3：深海写真の受信 ＆ 専門家2名（浪寄・貝浜）への緊急諮問
⏱️ 開始タイミング・条件：移動スピード（時速6.25km＝日速約150km）とDay 4北上予測（明神礁周辺）を算出し終えた直後
📦 配布・提示：長津へ『NG-03』、朝潮へ『DAY 3 途中② 指令書』、全体へ『成功時写真（失敗時は失敗時写真＋現地調査1枠を自動充当して浪寄へEV-25）』

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 3 途中② 指令書』・『NG-03』と同文） ━━┓
「――洋上捜索ヘリより緊急入電！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大生物、そして20本以上の無数の触手群を確認！
① 浪寄准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。
② 貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則ではこの規模の目標に対処不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 3 フェーズ4：公式呼称（コードネーム）決定 ＆ 指揮官の最終決断
⏱️ 開始タイミング・条件：浪寄・貝浜の所見共有とDay 3優先調査カードの共有が完了した時点（Day 3終盤）
📦 配布：長津へ『NG-04』、朝潮へ『DAY 3 途中③ 指令書』

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 3 途中③ 指令書』・『NG-04』と同文） ━━┓
「――防衛省および内閣官房より至急諮問が入電！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、朝潮危機管理官、指揮官として自衛隊への防衛出動を要請するか、または海上警備行動を発令するか最終意思決定をお願いいたします！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,

  4: `■ DAY 4 フェーズ1：明神礁の海底噴火 ＆ 即応総力体制（全未調査資料の一括開示）
⏱️ 開始タイミング・条件：Day 3の最終決断が完了し、Day 4へ移行した時点
📦 配布・提示：初瀬へ『SP-05』、朝潮へ『DAY 4 指令書』配布 ＋ Day 1〜Day 4の未取得だった全証拠カードを一括配布

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 4 指令書』と同文） ━━┓
「未明、鳥島沖の北方に位置する【明神礁】周辺にて新たな海底噴火が発生。さらに八丈島および青ヶ島の地震計が火山性微動を断続的に探知しています。防衛省の水中聴音網（パッシブソナー網）による巨大生物の位置と火山性微動の発生源は完全に一致しており、巨大生物は【日速約150km】で正確に北上を続けています。政府および防衛省より『この巨大生物は一体どこへ向かい、何を引き起こす見立てなのか、合同対策本部の専門的予測を至急提出してほしい』との緊急照会が入っています。なお事態の緊迫化を受け、本日より当合同対策本部は調査枠制限を撤廃する【即応総力体制】へ移行します！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 4 フェーズ2：北上原因の分析 ＆ 最終到達予測地点（「富士山」vs「東京湾」）の結論報告
⏱️ 開始タイミング・条件：全開示された証拠カードの精査が進み、朝潮が進路予測報告をまとめた時点
・🟢「富士山（駿河湾）」と結論づけた場合：Day 6の岸部局長との交渉が通常の第一声で進行します。
・🟡「東京湾」と結論づけた場合：【Day 6の岸部局長との交渉で嫌味を言われる】ことになります。

■ DAY 4 フェーズ3：防衛省「害獣駆除」方針による海上自衛隊の動員通達
⏱️ 開始タイミング・条件：対策本部が最終到達予測地点を報告した直後（Day 4終盤）
📦 配布：『長津カード NG-05』

┏━━ 📡 オペレーター（長津）のアナウンス（『長津カード NG-05』と同文） ━━┓
「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊の動員を正式決定いたしました！ 八丈島〜御蔵島沖にて通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,

  5: `■ DAY 5 フェーズ1：御蔵島沖の海底噴火・富士山地下微動（残り48時間） ＆ 独自調査
⏱️ 開始タイミング・条件：Day 4が終了し、Day 5へ移行した時点
📦 配布・提示：浪寄へ『SP-06』、朝潮へ『DAY 5 指令書』配布 ＋ 『Day 5 監視海図』・Day 5調査資料を開示

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 5 指令書』と同文） ━━┓
「伊豆諸島を北上する連続海底噴火を受け、気象庁は【富士山地下深部において微弱な火山性微動が観測された】と発表、政府は伊豆七島の噴火警戒レベル引き上げと避難準備を指示しました。同時に防衛省および火山噴火予知連絡会より連絡が入電！『駿河湾奥までの残距離は【約240km】、現在の巡航速度は【時速5km】であり、危機到達まで【残り48時間】と思われる』とのことです。また、自衛隊が実施する実弾迎撃作戦は【最高軍事機密】に移行し情報提供が遮断されたため、合同対策本部は独自の調査任務を進めるよう通達が出ています」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 5 フェーズ2：魚雷命中後のソナー観測報告 ＆ 防衛省作戦本部からの緊急照会
⏱️ 開始タイミング・条件：Day 5調査資料の精査が一通り進んだ時点（Day 5後半）
📦 配布：長津へ『NG-06』、朝潮へ『DAY 5 途中① 指令書』

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 5 途中① 指令書』・『NG-06』と同文） ━━┓
「――暗号ホットラインに着信！ 貝浜リエゾンへ、防衛省作戦本部より直通無線が接続されました！『魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。しかし、目標が発している特有の振動が起きておらず、それにあわせて火山性の周期的な微動が収まっていることを確認できている。アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが、疑問が残る。浪寄准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ なぜ富士山を目指すのか？！』とのことです！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,

  6: `■ DAY 6 フェーズ1：朝8時ブリーフィング（巨大生物の完全回復・北上再開） ＆ 全音響資料の開示
⏱️ 開始タイミング・条件：Day 5が終了し、Day 6（決戦前日・朝8時）へ移行した時点
📦 配布・提示：7名時は長津へ『SP-07』、朝潮へ『DAY 6 指令書』配布 ＋ 朝倉教授の実録音響データ（EV-31〜34）全開示

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 6 指令書』と同文） ━━┓
「予想通りというべきか、本日の【朝8時】の時点で巨大生物がほとんど同じ大きさまで回復。駿河トラフ境界に向けて北上を再開しています。それにあわせて【富士山地下の火山性微動が再開】しました。駿河湾までは【24時間ほどで到達する見込み】で、防衛省からは速やかに対策をまとめるようにと指示がでています。なお、東京班が徹夜で回収した残りの捜査資料と、朝倉教授の遺品である実録音響データをすべて開示します！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 6 フェーズ2：朝倉教授の実録音響データの解析 ＆ 魚雷以外の方法で24時間以内に巨大生物を撃退する作戦の立案（目安15分）
⏱️ 開始タイミング・条件：フェーズ1の資料開示直後、プレイヤーが『マッコウクジラ音響言語解析システム（/sonar）』にアクセスして分析・作戦立案を開始した時点
💡【クジラ言語の柔軟な判定】伝統の4語祝詞だけでは移動する巨大生物を追跡・迎撃する情報を伝えきれないため最大8語（2語×4組）まで許容されています。8語の穴埋めを強制する必要はなく、クジラを駿河湾へ呼び寄せて巨大生物を撃退する作戦がまとまればOKです（標準構成例：【人間とクジラ＋約束】【海の下の火山＋探せ】【北＋集まれ】【大きい・たくさんの餌＋攻撃せよ】）。
⚠️【条件分岐：アプリで『狂気の深淵を覗く』ボタンを押した場合（5分間の猶予経過後に発生）】
・5分経過後、覗いたPCが【心臓発作により心停止】したことをGMが口頭宣言します（演技・接触は不要）。
・蘇生条件：数分以内に①坂凪または初瀬による救命処置の宣言（東京班の場合は遠隔指示の宣言）＋②初瀬の直観に基づく『名前を呼んで戻ってこい・まだ死ぬなと声をかける』宣言があれば息を吹き返します。

■ DAY 6 フェーズ3：長津からの直通交渉提案（クジラへの呼びかけ音声と撃退作戦の立案直後）
⏱️ 開始タイミング・条件：プレイヤーがクジラを呼び寄せる音声信号と24時間以内の撃退作戦をまとめた直後
📦 配布：朝潮へ『DAY 6 途中① 指令書（SP-07連動）』

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 6 途中① 指令書』と同文） ━━┓
「――クジラを呼び寄せる新言語祝詞の音声が完成しましたね！ しかし、防衛省の上層部は『さらなる魚雷の飽和攻撃』の準備を進めており、通常のルートで上申しても潜水艦で祝詞の音声を流すような作戦は到底承認されません。……朝潮危機管理官、皆さん、実は防衛省で自衛隊部隊の運用を統括する最高責任者・【運用企画局長の岸部（きしべ）】は私の親戚（叔父）にあたりまして、直通の連絡先を持っています。厳格な現実主義者ですが、科学的な根拠と計算に基づく進言であれば耳を傾けてくれるはずです。準備が整い次第、回線を繋ぎますので直接説得を頼みます！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 6 フェーズ4：防衛省 運用企画局長・岸部（きしべ）との直通電話交渉（GMロールプレイ）
⏱️ 開始タイミング・条件：対策本部が説得の根拠を整理し、長津を通じて岸部局長へ直通電話を繋いだ時点
・🟢通常時第一声：「――防衛省運用企画局長の岸部だ。長津からの緊急回線とはな……合同対策本部の諸君、こんな深夜に一体何の用件だね？」
・🟡Day 4で『東京湾』と答えていた場合の嫌味第一声：「――防衛省運用企画局長の岸部だ。……ほう、一昨日は『巨大生物は東京湾へ向かう』と報告して我が海上自衛隊の展開を遅らせ、結果として駿河湾の目と鼻の先まで押し込まれる原因を作った対策本部の諸君か。その節は実に貴重なご高説をありがとう。で、こんな深夜に今度は一体どんな名案を持ってきたというのだね？」
・⚠️不足時の反論誘導：①なぜ魚雷の飽和攻撃ではなくクジラなのか？ ②水深1,000mのSOFAR層・潜水艦の水中スピーカー ③クジラの移動時間（6〜8時間＝今夜の発信が必要）の3点が揃うよう反論して導き出させます。
・✅交渉成立：「――……なるほど。超巨大群体に対する通常兵器の限界と天敵クジラによる捕食、そして深海SOFAR層による音響伝達とクジラの遊泳時間（6〜8時間）の逆算か。……いいだろう。防衛省運用企画局長として、私が全責任を背負おう。直ちに第1潜水隊群へ緊急出動を下令する。――明朝の運命、君たちに託すぞ」

■ DAY 6 フェーズ5：深海SOFAR層での新言語祝詞・大出力放流開始
⏱️ 開始タイミング・条件：岸部局長の説得に成功し、第1潜水隊群への緊急出動命令が下った直後（Day 6終盤）
📦 配布：長津へ『NG-07』

┏━━ 📡 オペレーター（長津）のアナウンス（『長津カード NG-07』と同文） ━━┓
「――海上自衛隊の潜水艦が水深1,000mの深海SOFAR層へ到達！ 水中スピーカー（水中音響送信機）より、人工音源（新言語祝詞）の大出力での放流を開始いたしました！ 音波は深海音響チャネル（SOFAR層）に乗って、太平洋全域へと急速に拡散しています！ あとは夜明けの決戦までに、マッコウクジラの大群が駿河湾へ集結してくれるのを祈りましょう！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,

  7: `■ DAY 7 フェーズ1：最終決戦の夜明け ＆ 駿河湾への目標接近
⏱️ 開始タイミング・条件：Day 6が終了し、Day 7（最終決戦の夜明け）へ移行した時点
📦 配布・提示：朝潮へ『DAY 7 指令書』配布 ＋ 『Day 7 最終決戦監視海図』提示

┏━━ 📡 オペレーター（長津）のアナウンス（『DAY 7 指令書』と同文） ━━┓
「夜明けを迎えました。現状、【富士山地下の火山性微動は継続】しており、巨大生物は水深600〜1,000mを維持して【駿河湾付近まで接近】しています！ 周辺海域に展開する海上自衛隊の潜水艦部隊および水中聴音網（パッシブソナー網）より、順次リアルタイムの探知状況と気象庁の火山観測データが入電いたします！」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 7 フェーズ2：マッコウクジラ大群の集結・深海大捕食 ＆ 富士山噴火危機の完全停止
⏱️ 開始タイミング・条件：フェーズ1の開始ブリーフィングに続けて、深海ソナー探知および火山観測データが入電した時点
📦 配布：長津へ『NG-08-1』『NG-08-2』

┏━━ 📡 オペレーター（長津）のアナウンス①（『長津カード NG-08-1』と同文） ━━┓
「長津です。水中聴音網（パッシブソナー網）および海自潜水艦の深海ソナー探知から、クジラと思われる生物が100頭以上、駿河湾に集結しています。昨夜からの呼びかけに応えたものと考えられます。さらに太平洋全域から、後続の1,000頭近くが駿河湾への移動を示しています。
　先ほどから、クジラが深海へと潜水を開始。水深1,000m付近の巨大生物への複数回の接触が見られます。大量のクジラが一斉に巨大生物に喰らいついていると考えられます。
　深海ソナー探知の結果、巨大生物は大幅にその大きさが縮小しており、さきほどクジラとの区別がつかなくなりました。同時に、この巨大生物から発せられていた特有の振動も完全に停止しています」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━ 📡 オペレーター（長津）のアナウンス②（『長津カード NG-08-2』と同文） ━━┓
「――気象庁火山監視課より緊急入電！ 富士山地下深部における火山性微動、急激に減衰しており、さきほど完全に停止が確認できました！
　防衛省・自衛艦隊司令部より全潜水艦へ通達入電、『目標の完全消滅を確認。魚雷発射管閉鎖、全部隊攻撃中止（スタンドダウン）』の命令がありました！
　このあと引き続き巨大生物が復活してこないか継続監視を行うようですが、現状クジラたちが、太古からの盟約に従って巨大生物を殲滅。富士山噴火を直前で停止できたと考えられます。
　皆さん、やりました。我々と、クジラの勝利です」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

■ DAY 7 フェーズ3：防衛省・自衛艦隊幹部からの直通電話（公表方法の最終選択）
⏱️ 開始タイミング・条件：長津の作戦成功アナウンス（NG-08-2）が完了した直後
【🎙️ NPC：防衛省・自衛艦隊幹部（GM）】：
「――朝潮君、貝浜君、聞こえるかね。……まずは、事態をここまで抑え込んだ君たちの尽力には感謝する。だがね……自衛隊の出動まで閣議決定しておいて、自衛隊側は何の活動もしなかったというのは、世間にも国会にも説明ができないんでね。ここは、海上自衛隊の出動を決めた総理が国民に説明するために、少し稼働したいと言っている。このあと、駿河湾沖合に向けて、自衛隊側から『害獣駆除の掃討攻撃（爆雷・魚雷投下）』を一斉に行わせる。……君たちの功績を出さず、国家防衛上の機密として処理したい。だが、君たちの功績として発表し、海上自衛隊は何もせずに解決できたとすることも、今ならばできる。クジラの祝詞などの詳細は伏せるがね。機転を効かせたヒーローとしてメディアにも取り上げてもらうことになる。今、どちらを選ぶか決めてほしい。このあとの政府の発表内容に関わる」
・💡【A案でもクジラを逃がせるガイド】：仮にA案を選んだ場合でも、クジラへの退避メッセージ（例：「ド・ドーン・カッカッ（人間とクジラ）」「チ・トン・チ（約束）」「ポ・ポポン（南）」「タタ・タト・トン（逃げろ）」など、「逃げろ」を含むメッセージ）を送れば、魚雷・爆雷を回避してもらうことができます。
・🟣【第3の選択（爆雷を投下させず、自衛隊を立てる選択）を交渉してきた場合】：
  幹部（岸部）：「現場も無意味な攻撃を望んではいない。だが、その方法は総理の指示と違う行動をとることになる。あらためて進言するが、我々は総理に嘘を吐くことはできない。ご納得いただけるかは分からない」
  （※その後の交渉はGMの裁量に委ねます。参考案：『自衛隊の深海音響作戦が奏功したこと』『国民の生命と国土を守ることを優先したこと』として総理に報告・発表する形にまとめる等）
（プレイヤーの回答を受けた後）：
「……わかった。このあと、政府からの発表がある。いずれにしても、君たちが正しかった。感謝する」

■ DAY 7 フェーズ4：テレビ臨時ニュース（選択肢A/B分岐） ＆ 対策本部解散
⏱️ 開始タイミング・条件：プレイヤーが公表方法（AまたはB）を決断し、防衛省幹部との電話が切れた直後
📦 配布：長津へ『NG-09（選択肢Aの場合）』または『NG-10（選択肢Bの場合）』

┏━━ 📡 オペレーター（長津）のアナウンス（選択肢A：『長津カード NG-09』と同文） ━━┓
「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、一連の危機事態が完全に沈静化したと発表しました。政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が海底のマグマ網を刺激していた可能性が高いことが判明。これに対し、政府の『有害鳥獣駆除』方針に基づき緊急出動していた海上自衛隊が、今朝未明、駿河湾口沖合の深海においてこの巨大生物を捕捉。潜水艦部隊および護衛艦による実弾掃討作戦を敢行し、この巨大生物を完全に撃滅・駆除したとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『自衛隊の果敢な決断と迅速な行動が国土と国民の生命を守り抜いた』と声明を発表しています――」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━ 📡 オペレーター（長津）のアナウンス（選択肢B：『長津カード NG-10』と同文） ━━┓
「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけての連続海底噴火と富士山の火山性微動について、内閣官房長官は先ほど、危機事態が完全に沈静化したと発表しました。西之島沖から駿河トラフへ北上していた『未確認の超巨大海洋生物』が海底マグマ網を刺激していたことが判明。政府は海上自衛隊を出動させていましたが、今朝未明、海上保安庁・気象庁・海洋科学大学などによる『合同対策本部』の特別チームが機転を効かせ、深海へ特別な薬を撃ち込む独自の無力化作戦を敢行。見事に巨大生物の駆除に成功し、自衛隊による武力攻撃は不要となったとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『一発の砲火も交えず、現場の機転と科学の力で日本を救った合同対策本部のメンバーは我が国の誇りでありヒーローである』と称える声明を発表しています――」
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
};

// GM進行チェックリストのデフォルト値（各Day最新シナリオ連動）
const DEFAULT_GM_CHECKPOINTS: Record<number, string[]> = {
  1: [
    "【Day 1 開始時】朝潮（PC1）へ特別配布カード『SP-01：黒い小さな隕石のかけら（初期）』を渡し、あわせて『Day 1 対策本部・日次ブリーフィング＆指揮官ミッションシート』（7名時は長津経由）を手渡して各員の点呼・自己紹介を行わせる（目標時間: 30分）",
    "遭難海図を展開し、海流（真東2.0kt）・風圧流（北東1.5kt）・経過時間（現在20分経過＋航行40分＝1時間後）を整理させ、巡視船を急行させるべき海域を指定させる",
    "【失敗時の処理】1回目の指定で外れた場合は「もう一度だけ再指定（リトライ）」を許可し、2回目も外れた場合は自動的に救助成功として進行する",
    "【証言カードのペナルティ処理】1発成功時は『船長の証言（EV-08）』と『大型冷凍ボックス（EV-07）』の両方をDay 1で取得。1回失敗時は1枚のみ取得（残り1枚はDay 2以降の調査枠へ）。2回失敗時は0枚（2枚ともDay 2以降の調査枠へ繰り越し）",
  ],
  2: [
    "【Day 2 開始時】坂凪（PC3）へ特別配布カード『SP-02：朝倉教授の最期』、太刀魚（PC4）へ特別配布カード『SP-03：SOFAR層の特異性』をそれぞれ配布し、朝潮（7名時は長津経由）へ『Day 2 ブリーフィング＆指揮官ミッションシート』を手渡す（目標時間: 25分）",
    "東京側（3択中1つ）と小笠原現地（4択＋Day 1未取得証言カードの中から2つ）の調査枠を提示する（※選択されなかった情報はあとの行動で調査可能と案内する）",
    "選択された証拠を開示し、「ダイオウイカの組織なのに、なぜ数百mもの超巨大な影なのか？」というサイズ矛盾を合議させる",
  ],
  3: [
    "【Day 3 開始時】貝浜（PC2）へ特別配布カード『SP-04：文民統制の仕組み』を配布し、朝潮（7名時は長津経由）へ『Day 3 ブリーフィング＆指揮官ミッションシート』を手渡してソノブイ3基による索敵任務を開始させる（目標時間: 25分）",
    "作戦海図（W-3100）上でソノブイ投下地点を決定させ、巨大生物の現在位置（セクターB-3）を特定させる",
    "ソノブイ終了後、長津アナウンス（連動噴火と北上予想要請）を行い、太刀魚（EV-16）、貝浜（EV-17）、浪寄（EV-18）の3名へ証拠を配布する",
    "【Day 1 09:00（西之島近海）➔ Day 3 17:00（鳥島沖）＝ 56時間、約350km ÷ 56時間 ＝ 時速6.25km（日速約150km）】と明日（Day 4 明神礁周辺）の到達地点を計算・合議させる",
    "【写真提示と失敗時処理】索敵成功時は『成功時の写真（近接浮上）』のみを提示。索敵失敗時は『失敗時の写真（遠距離・航跡波）』のみを提示し、小笠原現地の調査枠（2枠）のうち1枠を『F-3D：撮影した画像の分析（EV-25）』へ自動充当して浪寄へ公開する。その上で浪寄准教授（生物所見）と貝浜リエゾン（法的判断）へ諮問する",
    "防衛省・官邸からの緊急諮問として、未確認巨大生物の公式呼称（コードネーム: ワタツミ／クスルフ／独自命名）を合議・決定させる",
    "朝潮危機管理官（PC1）に自衛隊への防衛出動要請、または海上警備行動発令の最終意思決定を行わせる（※どちらを選んでもDay 4終盤で同じ結果へ合流）",
    "合同対策本部の調査枠（東京側1枠、小笠原現地側2枠 ※ソノブイ失敗時は現地1枠をEV-25で消費したため残り1枠）を選択させ、証拠資料を開示する",
  ],
  4: [
    "【Day 4 開始時】初瀬（PC6）へ特別配布カード『SP-05：神社の祝詞の複製』を配布し、朝潮（7名時は長津経由）へ『Day 4 ブリーフィング＆指揮官ミッションシート』を手渡す（目標時間: 25分）",
    "このまま北上すると伊豆諸島マグマ網を経て【富士山地下マグマ網】へ直撃・破局噴火を招く危機を共有させる",
    "合同対策本部が即応総力体制へ移行し、調査枠制限を撤廃して未取得だった全証拠資料を一括開示する",
    "対策本部として巨大生物の最終目的地（富士山か東京湾か）を結論づけさせる（※『東京湾』と結論づけた場合、Day 6の岸部局長交渉で嫌味を言われる）",
    "防衛省が「害獣駆除（災害派遣）」として海上自衛隊動員・実弾迎撃作戦を決定した通達（NG-05）を読み上げる",
  ],
  5: [
    "【Day 5 開始時】浪寄（PC5）へ特別配布カード『SP-06：マッコウクジラクリック音の距離限界と集合に必要な時間』を配布し、朝潮（7名時は長津経由）へ『Day 5 ブリーフィング＆指揮官ミッションシート（残距離240km・時速5kmから危機到達まで残り48時間と報告）』を手渡す（目標時間: 25分）",
    "朝倉教授のクジラ構文規則（EV-30：『了解した』以外はすべて2語成語のペアを単位として会話する規則）等を開示し、「超群体であること」「クジラの捕食対象であること」「なぜ富士山を目指すのか」の真相に迫らせる",
    "終盤、防衛省作戦本部から貝浜への直通無線（NG-06 ＆ Day 5 途中①指令書）を演出し、「微動は収まったが、アクティブソナー（ソナー探知）でゆっくり深海に沈み込みながら元の大きさに戻っている傾向が確認できる。どうして魚雷命中後に復活してしまうのか？なぜ富士山を目指すのか？」を浪寄准教授らに確認させる",
  ],
  6: [
    "【Day 6 開始時】7名プレイ時は長津（PC7）へ特別配布カード『SP-07：防衛省 運用企画局長とのコネクション』を配布し、朝潮（7名時は長津経由）へ『Day 6 ブリーフィング＆指揮官ミッションシート（朝8時時点：巨大生物の完全回復・北上再開と火山性微動再開、駿河湾到達まで24時間）』を手渡す（目標時間: 30分）",
    "【ミッション①・②・③】未回収資料と『小笠原社記』『神社の祝詞の複製』から太古の解決策（マッコウクジラによる捕食）を特定させ、朝倉教授の構文規則と4つの実録音響データ（EV-31〜34）を分析して『マッコウクジラ音響言語解析システム』へアクセスさせる。そのうえで、海上自衛隊の魚雷以外の方法で24時間後の駿河湾到達までにどうやって巨大生物を撃退するか、具体的な作戦をまとめさせる（※クジラ言語は4語では追跡・迎撃情報を伝えきれないため最大8語まで許容。標準構成例：【人間とクジラ＋約束】【海の下の火山＋探せ】【北＋集まれ】【大きい・たくさんの餌＋攻撃せよ】。解読・作戦立案目安：15分）",
    "【『狂気の深淵を覗く』使用時の5分猶予 ＆ 心停止・救命（声かけ）ルール】アプリで『狂気の深淵を覗く』を使用した場合は【5分の猶予（＋5分延長）】の後、覗いたPCが心臓発作・心停止に陥る。GMが心停止を宣言してから数分以内に、坂凪または初瀬による救命処置の口頭宣言（東京班が倒れた場合は通信越しの遠隔救命指示の宣言）＋初瀬の導きによる『名前を呼んで戻ってこい・まだ死ぬなと声をかける』宣言があれば息を吹き返す（※身体演技や接触は不要）",
    "クジラへの呼びかけ音声と撃退作戦がまとまった後、朝潮へ『Day 6 途中① 指令書』を渡し、長津が親戚（叔父）である防衛省運用企画局長・岸部（きしべ）への直通回線を繋いで（7名時はPC7長津が宣言）、朝潮・貝浜を中心に電話交渉を行わせる（※Day 4で東京湾と結論づけていた場合は、岸部局長から嫌味を言わせる）",
    "【岸部局長の反論による思考誘導】クジラを呼び寄せる作戦と音声がまとまっていれば、もし『水深1,000mのSOFAR層（潜水艦）』や『クジラの移動時間（6〜8時間＝今夜の送信が必要）』が抜けていても、岸部局長が鋭く反論・質問することでプレイヤー自身にその場で考えさせて解答を導き出させる",
    "岸部局長の作戦承諾と第1潜水隊群への緊急出動下令、明朝の現場部隊への「魚雷攻撃抑制（スタンドダウン）」通達を読み上げ、続けて深夜の潜水艦による深海SOFAR層での水中スピーカー（水中音響送信機）を用いた人工音源の大出力放流開始（NG-07）をアナウンスする",
  ],
  7: [
    "【Day 7 開始時】GMから朝潮（7名時は長津経由）へ『Day 7 ブリーフィング＆指揮官ミッションシート』を手渡し、祝詞に応えて夜通し泳いできたマッコウクジラ群の駿河湾到達・巨大生物の大捕食・富士山微動の完全停止を描写する（目標時間: 30分）",
    "長津が作戦成功アナウンス（NG-08-1・NG-08-2：水中聴音網および深海ソナー探知によるクジラ100頭以上の集結・1,000頭近くの移動、巨大生物の消滅、富士山微動停止、全部隊攻撃中止）を報告する",
    "防衛省幹部からの直通電話を演出し、「①功績を出さず国家防衛機密として自衛隊が掃討したことにするか」「②対策本部が機転を効かせて解決したヒーローとして発表し自衛隊の活動を不要にするか」の選択をプレイヤーに委ねる。もし「第3の選択」を交渉してきた場合は、その場のGM裁量で交渉を行う。最後に「いずれにしても、君たちが正しかった。感謝する」と結ぶ。",
    "プレイヤーの選択に応じたテレビ臨時ニュース（パターンA：自衛隊による撃滅報道 ／ パターンB：合同対策本部が特別な薬剤を撃ち込み自衛隊の活動不要で解決したとするヒーロー報道）を読み上げる",
    "朝潮の指揮で対策本部を解散し、エピローグの情景を読み上げてゲームを終了・感想戦へ移行する",
  ],
};

// デフォルトの全体提示ビジュアル資料一覧を取得するヘルパー（各Day図・写真網羅、古い海図は除外、新規追加ボードも自動マージ）
function getDefaultVisualBoards(project: MMProject): VisualBoardItem[] {
  if (
    project.visualBoards &&
    project.visualBoards.length > 0 &&
    project.visualBoards.some((v) => v.id === "vis-day7-eruption")
  ) {
    const existingMap: Record<string, VisualBoardItem> = {};
    project.visualBoards.forEach((v) => {
      existingMap[v.id] = v;
    });
    const merged: VisualBoardItem[] = [];
    for (const initItem of initialVisualBoards) {
      const existing = existingMap[initItem.id];
      merged.push(
        existing
          ? {
              ...existing,
              title: initItem.title,
              subtitle: initItem.subtitle,
              imageUrl: initItem.imageUrl,
              orientation: existing.orientation || initItem.orientation,
            }
          : initItem
      );
      delete existingMap[initItem.id];
    }
    for (const customItem of Object.values(existingMap)) {
      if (customItem.id !== "vis-route-map") {
        merged.push(customItem);
      }
    }
    return merged;
  }
  return initialVisualBoards.filter((v) => v.id !== "vis-route-map");
}

// デフォルトのGM進行ノートを取得するヘルパー
function getGmNoteForDay(project: MMProject, dayNumber: number): GmProgressionNote {
  const defaultNarration =
    DEFAULT_GM_NARRATIONS[dayNumber] ||
    `【Day ${dayNumber} 導入読み上げ】\n状況をプレイヤー全員に提示し、各班のアクション選択および情報共有を開始してください。`;

  const timeline = project.timeline || [];
  const step = timeline.find((t) => t.dayNumber === dayNumber) || timeline[0];

  const defaultCheckpoints =
    DEFAULT_GM_CHECKPOINTS[dayNumber] || [
      `Day ${dayNumber} 開始時に全体状況をアナウンスし、制限時間（目安 ${
        dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25
      }分）をタイマーセットする`,
      `このフェーズで開示可能な証拠（${(step?.revealedEvidenceIds || []).length}件）の取得条件を確認する`,
      `議論が停滞している場合は、各PCの「固有能力」や「専門知識」の活用を促す`,
    ];

  const defaultBgm =
    dayNumber <= 2
      ? "静かな緊迫感・環境音（深海・無線ノイズ）"
      : dayNumber <= 5
      ? "捜査・解析フェーズBGM（中テンポ・サスペンス）"
      : "クライマックス・決断BGM（高揚感のあるオーケストラ）";

  if (project.gmNotes && project.gmNotes[dayNumber]) {
    const existing = project.gmNotes[dayNumber];
    const isOldDefaultScript =
      !existing.readAloudScript ||
      existing.readAloudScript === step?.incidentOverview ||
      !existing.readAloudScript.includes("┏━━ 📡 オペレーター（長津）のアナウンス") ||
      existing.readAloudScript.includes("小笠原基地より小笠原現地メンバーを乗せた大型捜索ヘリが緊急発進") ||
      existing.readAloudScript.includes("ネタバレ防止") ||
      existing.readAloudScript.includes("何時間の猶予") ||
      existing.readAloudScript.includes("全部隊の動員") ||
      existing.readAloudScript.includes("NPC（船長") ||
      existing.readAloudScript.includes("【NPC 船長") ||
      existing.readAloudScript.includes("防衛庁") ||
      existing.readAloudScript.includes("怪異") ||
      existing.readAloudScript.includes("ハイドロスピーカー") ||
      existing.readAloudScript.includes("救難艇") ||
      existing.readAloudScript.includes("巨大質量") ||
      existing.readAloudScript.includes("警備救難部") ||
      (dayNumber === 3 && !existing.readAloudScript.includes("時速6.25km"));

    const script = isOldDefaultScript ? defaultNarration : existing.readAloudScript;

    const isOldCheckpoints =
      !Array.isArray(existing.gmCheckpoints) ||
      existing.gmCheckpoints.length < 3 ||
      existing.gmCheckpoints.some(
        (c) =>
          c.includes("ネタバレ防止") ||
          c.includes("猶予時間（48時間）を計算") ||
          c.includes("全部隊動員") ||
          c.includes("防衛庁") ||
          c.includes("怪異") ||
          c.includes("ハイドロスピーカー") ||
          c.includes("救難艇") ||
          c.includes("16:00") ||
          c.includes("08:00") ||
          c.includes("巨大質量") ||
          c.includes("計算ミスがあっても") ||
          c.includes("より駿河湾に近い位置") ||
          c.includes("機械的ペナルティ") ||
          c.includes("EV-16:")
      ) ||
      existing.gmCheckpoints[0].includes("全体状況をアナウンスし、制限時間") ||
      (dayNumber === 1 && !existing.gmCheckpoints.some((c) => c.includes("証言カードのペナルティ処理"))) ||
      (dayNumber === 3 && (!existing.gmCheckpoints.some((c) => c.includes("時速6.25km")) || !existing.gmCheckpoints.some((c) => c.includes("写真提示と失敗時処理")))) ||
      (dayNumber === 5 && !existing.gmCheckpoints.some((c) => c.includes("どうして魚雷命中後に復活してしまうのか"))) ||
      (dayNumber === 6 && (!existing.gmCheckpoints.some((c) => c.includes("朝8時")) || !existing.gmCheckpoints.some((c) => c.includes("心臓発作")) || existing.gmCheckpoints.some((c) => c.includes("作戦名")))) ||
      (dayNumber <= 6 && !existing.gmCheckpoints.some((c) => c.includes("特別配布カード")));

    const checkpoints = isOldCheckpoints ? defaultCheckpoints : existing.gmCheckpoints;

    return {
      ...existing,
      dayNumber,
      readAloudScript: script,
      gmCheckpoints: checkpoints,
      bgmCue: existing.bgmCue || defaultBgm,
      targetMinutes:
        existing.targetMinutes ||
        (dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25),
    };
  }

  return {
    dayNumber,
    targetMinutes: dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25,
    readAloudScript: defaultNarration,
    gmCheckpoints: defaultCheckpoints,
    bgmCue: defaultBgm,
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
    const existing = project.documentDesigns[docKey];
    if (category === "gm_guides" && existing.organizationHeader === "GAME MASTER TACTICAL CONTROL") {
      return {
        ...existing,
        organizationHeader: "GM用進行シート",
      };
    }
    return existing;
  }

  let defaultTheme: DocumentThemeId = "official_report";
  if (category === "handouts") {
    defaultTheme = "modern_sleek";
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

export const BuiltinDistributionStudio: React.FC<DocumentDesignStudioProps> = ({
  project,
  onUpdateProject,
  saveError = false,
  onSendAiPrompt,
}) => {
  const [category, setCategory] = useState<StudioCategory>("handouts");
  const [handoutViewMode, setHandoutViewMode] = useState<
    "sheet" | "cards" | "daily_briefings" | "nagatsu_cards"
  >("sheet");
  const [briefingFilterMode, setBriefingFilterMode] = useState<
    "all" | "midday" | "start"
  >("all");
  const [selectedBriefingId, setSelectedBriefingId] = useState(DAILY_COMMANDER_BRIEFINGS[0]?.id ?? "");
  const [selectedPhaseCardId, setSelectedPhaseCardId] = useState(NAGATSU_PHASE_CARDS[0]?.id ?? "");
  const filteredBriefings = useMemo(
    () => DAILY_COMMANDER_BRIEFINGS.filter((briefing) =>
      briefingFilterMode === "all" || Boolean(briefing.isMidDayAddition) === (briefingFilterMode === "midday")
    ),
    [briefingFilterMode]
  );
  const activeBriefingId = filteredBriefings.find((briefing) => briefing.id === selectedBriefingId)?.id
    ?? filteredBriefings[0]?.id;
  const activePhaseCardId = NAGATSU_PHASE_CARDS.find((card) => card.id === selectedPhaseCardId)?.id
    ?? NAGATSU_PHASE_CARDS[0]?.id;
  const [selectedCharId, setSelectedCharId] = useState<string>((project.characters || [])[0]?.id || "pc-1");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    (project.evidences || [])[0]?.id || ""
  );
  const [evidenceDayFilter, setEvidenceDayFilter] = useState<number | "all" | "glossary">("all");
  const [evidenceViewMode, setEvidenceViewMode] = useState<"cards_a4" | "single">("cards_a4");
  const [selectedVisualId, setSelectedVisualId] = useState<string>("vis-day1-white");
  const [visualOrientation, setVisualOrientation] = useState<"portrait" | "landscape_rotated">("landscape_rotated");
  const [visualMarginOverrides, setVisualMarginOverrides] = useState<Record<string, boolean>>({});
  const [selectedGmDay, setSelectedGmDay] = useState<number>(1);
  const [gmGuideViewMode, setGmGuideViewMode] = useState<"flowchart" | "daily_sheet">("flowchart");

  // 画面内テキスト直接編集モードは常にOFF（完成プレビュー固定）
  const isDirectEditMode = false;

  // Gemini デザイン生成プロンプト入力
  const [aiDesignPrompt, setAiDesignPrompt] = useState<string>("");
  const [aiDesignFeedback, setAiDesignFeedback] = useState<string>("");
  const [isDesignCustomizerOpen, setIsDesignCustomizerOpen] = useState<boolean>(false);

  // 保存フィードバック表示
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | "just_saved">("saved");
  useEffect(() => { setSaveStatus(saveError ? "error" : "saved"); }, [saveError]);
  const [lastSavedTime, setLastSavedTime] = useState<string>("自動同期中");

  // 印刷対象領域のRef
  const printableSheetRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);

  const scrollHandoutDocument = React.useCallback((id: string, kind: "briefing" | "phase-card") => {
    const canvas = previewCanvasRef.current;
    const target = printableSheetRef.current?.querySelector<HTMLElement>(
      `[data-handout-id="${CSS.escape(id)}"]${kind === "phase-card" ? '[data-handout-face="back"]' : ""}`
    );
    if (canvas && target) {
      canvas.scrollTo({ top: canvas.scrollTop + target.getBoundingClientRect().top - canvas.getBoundingClientRect().top - 16 });
    }
  }, []);

  useEffect(() => {
    if (category !== "handouts") return;
    if (handoutViewMode === "daily_briefings" && activeBriefingId) {
      scrollHandoutDocument(activeBriefingId, "briefing");
    } else if (handoutViewMode === "nagatsu_cards" && activePhaseCardId) {
      scrollHandoutDocument(activePhaseCardId, "phase-card");
    } else {
      previewCanvasRef.current?.scrollTo({ top: 0 });
    }
  }, [category, handoutViewMode, briefingFilterMode, activeBriefingId, activePhaseCardId, scrollHandoutDocument]);

  const selectHandoutDocument = (id: string, kind: "briefing" | "phase-card") => {
    if (kind === "briefing") setSelectedBriefingId(id);
    else setSelectedPhaseCardId(id);
    scrollHandoutDocument(id, kind);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 視覚ボード一覧（プロジェクトに未保存の場合は初期ボードを使用）
  const visualBoards = getDefaultVisualBoards(project);

  // 現在選択されているアイテムの特定
  const charactersList = project.characters || [];
  const activeChar =
    charactersList.find((c) => c.id === selectedCharId) || charactersList[0];

  // マスター証拠のマップ（最新の簡易タイトルと説明文）
  const masterEvidenceMap = useMemo(() => {
    const map: Record<string, EvidenceItem> = {};
    (initialProject.evidences || []).forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, []);

  const allEvidences = useMemo(() => {
    return (project.evidences || [])
      .filter(
        (e) =>
          e &&
          e.id !== "ev-coda-spectrogram" &&
          e.id !== "ev-folk-song-rhythm" &&
          !(e.title || "").includes("古謡") &&
          !(e.title || "").includes("スペクトログラム") &&
          !(e.title || "").includes("スペクロログラム")
      )
      .map((e) => {
        const master = masterEvidenceMap[e.id];
        return master
          ? {
              ...e,
              title: master.title,
              frontTitleHtml: e.frontTitleHtml ?? master.frontTitleHtml,
              description: master.description,
              glossaryNote: e.glossaryNote ?? master.glossaryNote,
            }
          : e;
      });
  }, [project.evidences, masterEvidenceMap]);
  const filteredEvidences =
    evidenceDayFilter === "all"
      ? allEvidences
      : evidenceDayFilter === "glossary"
      ? allEvidences.filter((e) => Boolean(e.glossaryNote))
      : allEvidences.filter((e) => e.foundPhase === evidenceDayFilter);

  const activeEvidence =
    allEvidences.find((e) => e.id === selectedEvidenceId) ||
    filteredEvidences[0] ||
    allEvidences[0];

  const activeVisual =
    visualBoards.find((v) => v.id === selectedVisualId) || visualBoards[0];

  const timelineList =
    Array.isArray(project.timeline) && project.timeline.length > 0
      ? project.timeline
      : initialProject.timeline;
  const activeTimelineStep =
    timelineList.find((t) => t.dayNumber === selectedGmDay) || timelineList[0];

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

  const saveFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (saveFeedbackTimer.current) clearTimeout(saveFeedbackTimer.current);
  }, []);

  const updateProjectAndNotify = (updater: MMProject | ((prev: MMProject) => MMProject)) => {
    if (saveFeedbackTimer.current) clearTimeout(saveFeedbackTimer.current);
    const saved = onUpdateProject(updater);
    setSaveStatus(saved ? "just_saved" : "error");
    if (saved) {
      setLastSavedTime(new Date().toLocaleTimeString());
      saveFeedbackTimer.current = setTimeout(() => setSaveStatus("saved"), 2500);
    }
    return saved;
  };

  // 明示的な「保存」ボタン押下処理（キーボードショートカット Cmd/Ctrl+S 対応）
  const handleManualSave = () => {
    updateProjectAndNotify((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
  };



  // デザイン設定の更新
  const handleUpdateDesign = (partial: Partial<DocumentDesignOverride>) => {
    const nextDesign: DocumentDesignOverride = {
      ...currentDesign,
      ...partial,
    };
    updateProjectAndNotify((prev) => ({
      ...prev,
      documentDesigns: {
        ...(prev.documentDesigns || {}),
        [currentDocKey]: nextDesign,
      },
    }));
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
    updateProjectAndNotify((prev) => ({
      ...prev,
      characters: (prev.characters || []).map((c) => (c.id === activeChar.id ? updater(c) : c)),
    }));
  };

  // ② 証拠資料の直接更新ヘルパー
  const handleUpdateActiveEvidence = (updater: (ev: EvidenceItem) => EvidenceItem) => {
    if (!activeEvidence) return;
    updateProjectAndNotify((prev) => ({
      ...prev,
      evidences: (prev.evidences || []).map((e) => (e.id === activeEvidence.id ? updater(e) : e)),
    }));
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
    updateProjectAndNotify((prev) => ({
      ...prev,
      evidences: [...(prev.evidences || []), newEv],
    }));
    setSelectedEvidenceId(newId);
  };

  // ③ 全体提示ビジュアルボードの更新ヘルパー
  const handleUpdateActiveVisual = (updater: (v: VisualBoardItem) => VisualBoardItem) => {
    if (!activeVisual) return;
    const currentBoards = getDefaultVisualBoards(project);
    const updatedBoards = currentBoards.map((b) =>
      b.id === activeVisual.id ? updater(b) : b
    );
    updateProjectAndNotify((prev) => ({
      ...prev,
      visualBoards: updatedBoards,
    }));
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
    updateProjectAndNotify((prev) => ({
      ...prev,
      visualBoards: [...currentBoards, newBoard],
    }));
    setSelectedVisualId(newId);
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
    updateProjectAndNotify((prev) => ({
      ...prev,
      timeline: (prev.timeline || []).map((t) =>
        t.dayNumber === activeTimelineStep.dayNumber ? updater(t) : t
      ),
    }));
  };

  const handleUpdateActiveGmNote = (updater: (note: GmProgressionNote) => GmProgressionNote) => {
    const currentNote = getGmNoteForDay(project, selectedGmDay);
    const updatedNote = updater(currentNote);
    updateProjectAndNotify((prev) => ({
      ...prev,
      gmNotes: {
        ...(prev.gmNotes || {}),
        [selectedGmDay]: updatedNote,
      },
    }));
  };

  // デザインされたシートをそのままA4/PDF印刷する関数
  const handlePrintDesignedSheet = () => {
    // 全体提示の地図・写真カテゴリの場合は、A4用紙（余白0mm・画像のみ最大化・90度回転配置）で印刷
    if (category === "visuals" && activeVisual?.imageUrl) {
      const imgUrl = activeVisual.imageUrl;
      const isRotated = visualOrientation === "landscape_rotated";
      const isWithMargin =
        visualMarginOverrides[activeVisual.id] ??
        activeVisual.hasWhiteMargin ??
        (activeVisual.id === "vis-day2-aerial");

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
  <title>&nbsp;</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #ffffff;
    }
    .print-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    ${
      isRotated
        ? isWithMargin
          ? `
    /* 横長画像を90度回転＋適度な白い余白（88%縮小でA4用紙に美しいマージンを形成） */
    .print-img {
      position: absolute;
      width: 88vh;
      height: 88vw;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    `
          : `
    /* 横長画像を90度回転させてA4縦用紙（210mm × 297mm）めいっぱいに最大化 */
    .print-img {
      position: absolute;
      width: 100vh;
      height: 100vw;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    `
        : isWithMargin
        ? `
    .print-img {
      width: 88vw;
      height: 88vh;
      object-fit: contain;
    }
    `
        : `
    .print-img {
      width: 100vw;
      height: 100vh;
      object-fit: contain;
    }
    `
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    <img src="${imgUrl}" class="print-img" alt="${activeVisual.title}" />
  </div>
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
        }, 800);
      }
      return;
    }

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

    const isB5HandoutSheet = category === "handouts" && handoutViewMode === "sheet";
    const isSingleEvidenceSheet = category === "evidences" && evidenceViewMode === "single";
    const isDuplexCardSheet =
      (category === "handouts" &&
        (handoutViewMode === "cards" || handoutViewMode === "nagatsu_cards")) ||
      (category === "evidences" && evidenceViewMode === "cards_a4");
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
      size: ${isSingleEvidenceSheet || isB5HandoutSheet ? "B5 portrait" : "A4 portrait"};
      margin: ${
        isDuplexCardSheet
          ? "0"
          : isB5HandoutSheet
          ? "8mm 9mm"
          : isSingleEvidenceSheet
          ? "12mm"
          : "8mm"
      };
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-size: ${isB5HandoutSheet ? "10pt" : "11px"};
      line-height: ${isB5HandoutSheet ? "1.5" : "1.45"};
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    @media print {
      .duplex-a4-page {
        position: relative !important;
        width: 210mm !important;
        height: 297mm !important;
        padding: 12mm 10mm !important;
        margin: 0 auto !important;
        border: none !important;
        background: #ffffff !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: hidden !important;
      }
      .duplex-a4-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .duplex-cut-guide-h {
        position: absolute !important;
        top: 148.5mm !important;
        left: 3mm !important;
        right: 3mm !important;
        height: 0 !important;
        border-top: 0.25mm dashed #cbd5e1 !important;
        pointer-events: none !important;
        z-index: 0 !important;
      }
      .duplex-cut-guide-v {
        position: absolute !important;
        left: 105mm !important;
        top: 3mm !important;
        bottom: 3mm !important;
        width: 0 !important;
        border-left: 0.25mm dashed #cbd5e1 !important;
        pointer-events: none !important;
        z-index: 0 !important;
      }
      .duplex-card-grid {
        position: relative !important;
        z-index: 1 !important;
        display: grid !important;
        grid-template-columns: 92mm 92mm !important;
        grid-template-rows: 133mm 133mm !important;
        column-gap: 6mm !important;
        row-gap: 7mm !important;
        width: 190mm !important;
        height: 273mm !important;
        margin: 0 auto !important;
      }
      .card-face-134mm {
        position: relative !important;
        z-index: 1 !important;
        width: 92mm !important;
        height: 133mm !important;
        min-height: 133mm !important;
        max-height: 133mm !important;
        padding: 4.2mm !important;
        box-shadow: none !important;
        overflow: hidden !important;
      }
      .card-body-12px {
        font-size: 12px !important;
      }
      .card-front-title-20px {
        font-size: 20px !important;
        line-height: 1.375 !important;
      }
      .card-empty-slot {
        width: 92mm !important;
        height: 133mm !important;
        min-height: 133mm !important;
        max-height: 133mm !important;
        border: none !important;
        background: transparent !important;
      }
    }
    ruby {
      ruby-align: center;
      white-space: nowrap;
    }
    rt {
      font-size: 7.5px !important;
      line-height: 1 !important;
      letter-spacing: -0.02em !important;
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

  // 全キャラクターの個人ハンドアウト（B5規格）を一括印刷
  const handlePrintAllCharactersB5 = () => {
    printCharacterHandoutsB5(project.characters, project.title);
  };

  // Day別（単一DayまたはDay 1〜Day 7一括）のGM進行資料をA4印刷 / PDF保存（複数ページまたぎ時に文字切れ・枠切れを起こさないページネーション対応）
  const handlePrintAllGmProgressionSheets = (targetDayNumber?: number) => {
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const targetSteps =
      typeof targetDayNumber === "number"
        ? (project.timeline || []).filter((s) => s.dayNumber === targetDayNumber)
        : project.timeline || [];

    const pagesHtml = targetSteps
      .map((step, idx) => {
        const note = getGmNoteForDay(project, step.dayNumber);
        const structuredPhases = GM_DAY_STRUCTURED_PHASES[step.dayNumber] || [];

        const phasesHtml =
          structuredPhases.length > 0
            ? structuredPhases
                .map((ph) => {
                  const badgesHtml =
                    ph.handoutBadges && ph.handoutBadges.length > 0
                      ? `<div class="print-no-split flex flex-wrap items-center gap-1.5">
                          <span class="text-[12px] font-extrabold text-slate-700">📦 配布・提示：</span>
                          ${ph.handoutBadges
                            .map(
                              (b) =>
                                `<span class="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[12px] font-bold text-slate-900">${escapeHtml(
                                  b
                                )}</span>`
                            )
                            .join("")}
                        </div>`
                      : "";

                  const nagatsuHtml =
                    ph.nagatsuAnnouncements && ph.nagatsuAnnouncements.length > 0
                      ? ph.nagatsuAnnouncements
                          .map(
                            (ng) => `
                          <div class="print-no-split rounded-lg border-2 border-indigo-700 bg-indigo-50/80 p-3 space-y-1.5">
                            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-1">
                              <span class="inline-block rounded bg-indigo-800 px-2.5 py-0.5 text-[12px] font-bold text-white">📡 【オペレーター（長津）からの案内】</span>
                              <span class="text-[12px] font-bold text-indigo-950">✅ ${escapeHtml(
                                ng.sourceLabel
                              )}</span>
                            </div>
                            <div class="whitespace-pre-wrap text-[12px] font-bold leading-relaxed text-slate-900 bg-white p-3 rounded border border-indigo-300">${escapeHtml(
                              ng.text
                            )}</div>
                          </div>`
                          )
                          .join("")
                      : "";

                  const gmAnnounceHtml =
                    ph.gmAnnouncements && ph.gmAnnouncements.length > 0
                      ? `<div class="space-y-2">
                          ${ph.gmAnnouncements
                            .map((ga) => {
                              const borderBg =
                                ga.tone === "emerald"
                                  ? "border-emerald-600 bg-emerald-50/70"
                                  : ga.tone === "amber"
                                  ? "border-amber-600 bg-amber-50/70"
                                  : ga.tone === "rose"
                                  ? "border-rose-600 bg-rose-50/70"
                                  : "border-slate-500 bg-slate-50";
                              return `
                              <div class="print-no-split rounded-lg border-2 ${borderBg} p-3 space-y-1.5">
                                ${
                                  ga.branchBadge
                                    ? `<div class="text-[12px] font-extrabold text-slate-900">${escapeHtml(
                                        ga.branchBadge
                                      )}</div>`
                                    : ""
                                }
                                <div class="text-[12px] font-bold text-slate-800">${escapeHtml(
                                  ga.speakerLabel
                                )}</div>
                                <div class="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-900 bg-white p-2.5 rounded border border-slate-300">${escapeHtml(
                                  ga.text
                                )}</div>
                                ${
                                  ga.cardActionNote
                                    ? `<div class="text-[12px] font-bold text-indigo-950 bg-indigo-100/70 border border-indigo-300 rounded px-2.5 py-1.5">${escapeHtml(
                                        ga.cardActionNote
                                      )}</div>`
                                    : ""
                                }
                              </div>`;
                            })
                            .join("")}
                        </div>`
                      : "";

                  const guidesHtml =
                    ph.gmGuides && ph.gmGuides.length > 0
                      ? `<div class="print-no-split rounded border border-slate-300 bg-slate-50 p-2.5 space-y-1">
                          ${ph.gmGuides
                            .map(
                              (g) =>
                                `<div class="text-[12px] leading-relaxed text-slate-800 font-medium">・${escapeHtml(
                                  g
                                )}</div>`
                            )
                            .join("")}
                        </div>`
                      : "";

                  return `
                  <div class="print-no-split rounded-lg border-2 border-slate-800 bg-white p-3 space-y-2">
                    <div class="print-no-split space-y-1.5">
                      <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-1.5">
                        <div class="flex items-center gap-2">
                          <span class="rounded bg-slate-900 px-2.5 py-0.5 text-[12px] font-extrabold text-white">${escapeHtml(
                            ph.phaseNumber
                          )}</span>
                          <span class="text-[13px] font-extrabold text-slate-900">${escapeHtml(
                            ph.phaseTitle
                          )}</span>
                        </div>
                      </div>
                      <div class="rounded border border-amber-400 bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-950">
                        ⏱️ 開始タイミング・発生条件：${escapeHtml(ph.startTrigger)}
                      </div>
                    </div>
                    ${badgesHtml}
                    ${nagatsuHtml}
                    ${gmAnnounceHtml}
                    ${guidesHtml}
                  </div>`;
                })
                .join("")
            : `<div class="whitespace-pre-wrap text-[12px] font-semibold leading-relaxed text-slate-900 bg-white p-3.5 rounded border border-slate-300">${escapeHtml(
                note.readAloudScript
              )}</div>`;

        return `
        <div class="${idx > 0 ? "page-break-before" : ""} space-y-3 text-[12px]">
          <div class="print-no-split space-y-2.5">
            <div class="rounded-md border border-slate-300 bg-slate-50 p-2.5 text-[12px] text-slate-800 font-bold">
              🎙️ GM役柄・進行方式：【6名時：GMが長津を担当 ／ 7名時：PC7が長津を担当】｜ 各Day開始時に朝潮（PC1）へ『Day別指令シート』を手渡し、朝潮の指揮で会議を開始させます
            </div>
            <div class="rounded-md p-3.5 bg-slate-900 text-white flex items-end justify-between gap-4">
              <div>
                <span class="block text-[12px] uppercase tracking-wider text-slate-300">Day ${
                  step.dayNumber
                } 状況タイトル</span>
                <h1 class="mt-0.5 text-base font-bold leading-tight">${escapeHtml(
                  step.situationTitle
                )}</h1>
              </div>
              <div class="flex items-center gap-4 text-[12px] shrink-0">
                <div>
                  <span class="block text-[12px] text-slate-300">観測地点</span>
                  <div class="font-semibold">${escapeHtml(step.locationName)}</div>
                </div>
                <div class="border-l border-white/25 pl-3">
                  <span class="block text-[12px] text-slate-300">目標進行時間</span>
                  <div class="font-semibold">${note.targetMinutes} 分</div>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            ${phasesHtml}
          </div>
          <div class="print-no-split rounded-md border border-slate-300 p-3.5 bg-white">
            <div class="mb-1.5 text-[12px] font-bold text-slate-900">✅ Day ${
              step.dayNumber
            } GM進行チェックリスト</div>
            <div class="space-y-1">
              ${(note.gmCheckpoints || [])
                .map(
                  (chk) => `
                <div class="print-no-split flex items-start gap-2 text-[12px] text-slate-800">
                  <span class="mt-1 inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0"></span>
                  <span>${escapeHtml(chk)}</span>
                </div>`
                )
                .join("")}
            </div>
          </div>
        </div>`;
      })
      .join("\n");

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
  <title>${escapeHtml(project.title)} - GM進行資料（${
        typeof targetDayNumber === "number" ? `Day ${targetDayNumber}` : "Day 1〜7 一括印刷"
      }）</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: sans-serif;
      overflow: visible !important;
      height: auto !important;
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    .print-no-split {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  </style>
</head>
<body>
  ${pagesHtml}
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
      }, 700);
    }
  };

  // 全19枚の全体提示地図・写真を一括でA4印刷 / PDF保存（タイトル・ファイル名等の一切の文字を入れず純粋な画像のみ出力）
  const handlePrintAllVisualBoards = () => {
    const boardsToPrint = visualBoards.filter((b) => Boolean(b.imageUrl));
    if (boardsToPrint.length === 0) return;

    const pagesHtml = boardsToPrint
      .map((b) => {
        const isRotated = (b.orientation || "landscape_rotated") === "landscape_rotated";
        const isWithMargin =
          visualMarginOverrides[b.id] ?? b.hasWhiteMargin ?? (b.id === "vis-day2-aerial");
        const imgClass = isRotated
          ? isWithMargin
            ? "img-rotated-margin"
            : "img-rotated-full"
          : isWithMargin
          ? "img-portrait-margin"
          : "img-portrait-full";
        return `<div class="visual-print-page"><img src="${b.imageUrl}" class="${imgClass}" alt="" /></div>`;
      })
      .join("\n");

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
  <title>&nbsp;</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .visual-print-page {
      position: relative;
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      break-after: page;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #ffffff;
    }
    .visual-print-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .img-portrait-full {
      width: 210mm;
      height: 297mm;
      object-fit: contain;
    }
    .img-portrait-margin {
      width: 184.8mm;
      height: 261.36mm;
      object-fit: contain;
    }
    .img-rotated-full {
      position: absolute;
      width: 297mm;
      height: 210mm;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    .img-rotated-margin {
      position: absolute;
      width: 261.36mm;
      height: 184.8mm;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
  </style>
</head>
<body>
  ${pagesHtml}
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
        }, 4000);
      }, 900);
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
      <p className="no-print border-b border-cyan-900 px-6 py-2 text-sm text-cyan-200">組み込み作品は閲覧専用です。資料の選択・印刷を利用できます。</p>
      {/* 1. 最上部ヘッダー：4大資料カテゴリー切替（色・配置を完全統一） */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-6 py-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setCategory("handouts")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "handouts"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            ① 個人向けハンドアウト
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {(project.characters || []).length}名
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
            <FileText className="h-4 w-4" />
            ② 証拠資料（文書・カード）
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {allEvidences.length}件
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
            <MapIcon className="h-4 w-4" />
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
            <Radio className="h-4 w-4" />
            ④ GM用の進行資料
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              全{(project.timeline || []).length}フェーズ
            </span>
          </button>
        </div>
      </div>

      {/* 2. メイン作業エリア：左サイドバー（区分選択＆リスト）＋ 右メインキャンバス（白紙プレビュー＆右上印刷ボタン） */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* 左サイドバー：すべてのタブで「証拠資料」と同一の色・レイアウトに統一 */}
        <div className="col-span-3 flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          {/* ① 個人ハンドアウト ＆ 別配付カード選択リスト */}
          {category === "handouts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {handoutViewMode === "daily_briefings"
                    ? `指令書 (${filteredBriefings.length}枚)`
                    : handoutViewMode === "nagatsu_cards"
                    ? `アナウンスカード (${NAGATSU_PHASE_CARDS.length}枚)`
                    : `個人向けハンドアウト (${charactersList.length}名)`}
                </h3>
              </div>

              {/* 区分切替（2列グリッド・インディゴ選択で統一） */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  data-handout-mode="sheet"
                  aria-pressed={handoutViewMode === "sheet"}
                  onClick={() => setHandoutViewMode("sheet")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    handoutViewMode === "sheet"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 本紙（B5）
                </button>
                <button
                  data-handout-mode="cards"
                  aria-pressed={handoutViewMode === "cards"}
                  onClick={() => setHandoutViewMode("cards")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    handoutViewMode === "cards"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🃏 特別カード
                </button>
                <button
                  data-handout-mode="daily_briefings"
                  aria-pressed={handoutViewMode === "daily_briefings"}
                  onClick={() => setHandoutViewMode("daily_briefings")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    handoutViewMode === "daily_briefings"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📋 Day別指令
                </button>
                <button
                  data-handout-mode="nagatsu_cards"
                  aria-pressed={handoutViewMode === "nagatsu_cards"}
                  onClick={() => setHandoutViewMode("nagatsu_cards")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    handoutViewMode === "nagatsu_cards"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎙️ 長津カード
                </button>
              </div>

              {/* Day別指令モード時は証拠資料と同じ形式で絞り込みチップを表示 */}
              {handoutViewMode === "daily_briefings" && (
                <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                  <button
                    onClick={() => setBriefingFilterMode("all")}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      briefingFilterMode === "all"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    全て({DAILY_COMMANDER_BRIEFINGS.length})
                  </button>
                  <button
                    onClick={() => setBriefingFilterMode("start")}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      briefingFilterMode === "start"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    各Day開始時({DAILY_COMMANDER_BRIEFINGS.filter((briefing) => !briefing.isMidDayAddition).length})
                  </button>
                  <button
                    onClick={() => setBriefingFilterMode("midday")}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      briefingFilterMode === "midday"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    途中追加({DAILY_COMMANDER_BRIEFINGS.filter((briefing) => briefing.isMidDayAddition).length})
                  </button>
                </div>
              )}

              {handoutViewMode === "daily_briefings" ? (
                <div className="space-y-2" role="group" aria-label="指令書一覧">
                  {filteredBriefings.map((briefing) => (
                    <button
                      key={briefing.id}
                      data-handout-list-id={briefing.id}
                      aria-pressed={briefing.id === activeBriefingId}
                      onClick={() => selectHandoutDocument(briefing.id, "briefing")}
                      className={`w-full rounded-xl border p-3 text-left transition ${briefing.id === activeBriefingId
                        ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                        : "border-slate-800 bg-slate-950/80 hover:border-slate-700"}`}
                    >
                      <div className="text-[10px] font-mono font-bold text-indigo-300">{briefing.sheetCode} ｜ {briefing.badgeLabel}</div>
                      <div className="mt-1.5 text-xs font-bold text-white">{briefing.title}</div>
                      {briefing.timingNote && <div className="mt-1 text-[11px] text-slate-400">{briefing.timingNote}</div>}
                    </button>
                  ))}
                </div>
              ) : handoutViewMode === "nagatsu_cards" ? (
                <div className="space-y-2" role="group" aria-label="アナウンスカード一覧">
                  {NAGATSU_PHASE_CARDS.map((card) => (
                    <button
                      key={card.id}
                      data-handout-list-id={card.id}
                      aria-pressed={card.id === activePhaseCardId}
                      onClick={() => selectHandoutDocument(card.id, "phase-card")}
                      className={`w-full rounded-xl border p-3 text-left transition ${card.id === activePhaseCardId
                        ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                        : "border-slate-800 bg-slate-950/80 hover:border-slate-700"}`}
                    >
                      <div className="text-[10px] font-mono font-bold text-indigo-300">{card.cardCode} ｜ {card.timingBadge}</div>
                      <div className="mt-1.5 text-xs font-bold text-white">{card.title}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(project.characters || []).map((c, idx) => {
                    const isSelected = c.id === activeChar?.id;
                    const spCard = SPECIAL_CHARACTER_CARDS.find((sc) => sc.characterId === c.id);
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
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              PC-{idx + 1}
                            </span>
                            <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                              {c.location === "headquarters" ? "東京本部" : "現地救難隊"}
                            </span>
                          </div>
                          {spCard && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {spCard.revealDayLabel}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 font-bold text-xs text-white">{c.name}</div>
                        <div className="mt-0.5 text-[11px] text-slate-400 truncate">{c.profession}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ② 証拠資料選択リスト */}
          {category === "evidences" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  証拠・調査記録 ({filteredEvidences.length}件)
                </h3>

              </div>

              {/* A4 4分割カード一覧 vs 個別カード詳細 切替 */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setEvidenceViewMode("cards_a4")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    evidenceViewMode === "cards_a4"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🃏 A4 4分割一覧
                </button>
                <button
                  onClick={() => setEvidenceViewMode("single")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    evidenceViewMode === "single"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 個別詳細
                </button>
              </div>

              {/* フェーズ・用語解説絞り込み */}
              <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                <button
                  onClick={() => setEvidenceDayFilter("all")}
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    evidenceDayFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  全て({allEvidences.length})
                </button>
                <button
                  onClick={() => setEvidenceDayFilter("glossary")}
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    evidenceDayFilter === "glossary"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="初心者向け用語解説（下部余白）が追加された16枚の証拠カードのみに絞り込みます"
                >
                  📖 用語解説付き({allEvidences.filter((e) => Boolean(e.glossaryNote)).length})
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
                  const globalIdx = allEvidences.findIndex((e) => e.id === ev.id) + 1;
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            EV-{String(globalIdx).padStart(2, "0")}
                          </span>
                          <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                            Day {ev.foundPhase}
                          </span>
                        </div>
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
                      {ev.glossaryNote && (
                        <div className="mt-1 text-[10px] text-slate-400 truncate">
                          📖 下部余白に用語解説あり
                        </div>
                      )}
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

              </div>

              {/* 印刷向き・余白設定（証拠資料と同じ2列ボタン形式に統一） */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setVisualOrientation("landscape_rotated")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    visualOrientation === "landscape_rotated"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🔄 A4縦最大化(90°回転)
                </button>
                <button
                  onClick={() => setVisualOrientation("portrait")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    visualOrientation === "portrait"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 通常向き(回転なし)
                </button>
              </div>

              <div className="space-y-2">
                {/* 📱 マッコウクジラ音響言語解析システム（QR＆画面説明・A4表裏2ページ） */}
                <button
                  onClick={() => {
                    setSelectedVisualId("vis-whale-sonar-qr-guide");
                    previewCanvasRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedVisualId === "vis-whale-sonar-qr-guide"
                      ? "border-cyan-400 bg-cyan-950/70 shadow-md ring-1 ring-cyan-400/50"
                      : "border-cyan-800/60 bg-slate-950/90 hover:border-cyan-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                      Day 6 / 全体提示
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300">
                      📱 QR＆画面説明（A4・2P）
                    </span>
                  </div>
                  <div className="mt-1.5 font-bold text-xs text-white">
                    『マッコウクジラ音響言語解析システム』
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-300 truncate">
                    表面：QR＆PW（whale-study）／裏面：画面サンプル＆操作説明
                  </div>
                </button>

                {visualBoards.map((vb) => {
                  const isSelected =
                    selectedVisualId !== "vis-whale-sonar-qr-guide" &&
                    vb.id === activeVisual?.id;
                  return (
                    <button
                      key={vb.id}
                      onClick={() => {
                        setSelectedVisualId(vb.id);
                        if (vb.orientation) {
                          setVisualOrientation(vb.orientation);
                        }
                        previewCanvasRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                          {vb.dayNumber === 0 ? "全域" : `Day ${vb.dayNumber}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {vb.boardType === "nautical_chart_white"
                            ? "🧭 白海図（PL用）"
                            : vb.boardType === "nautical_chart_gm"
                            ? "🎯 GM解析海図"
                            : vb.boardType === "aerial_photo"
                            ? "📷 航空偵察写真"
                            : vb.boardType === "tactical_chart" || vb.boardType === "sector_grid"
                            ? "🎯 索敵作戦図"
                            : vb.boardType === "sonar_photo"
                            ? "📷 索敵撮影写真"
                            : vb.boardType.includes("eruption") || vb.boardType === "seismic_chart"
                            ? "🌋 噴火観測図"
                            : vb.boardType === "day4_shrine_chronicle"
                            ? "📜 古文書・手記"
                            : vb.boardType === "theater_map" || vb.boardType === "route_map"
                            ? "🗺️ 広域作戦海図"
                            : "🖼️ 図版・写真"}
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  GM進行資料（全{(project.timeline || []).length}フェーズ）
                </h3>
              </div>

              {/* 区分切替（証拠資料と同一の2列グリッド・インディゴ選択で統一） */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setGmGuideViewMode("flowchart")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    gmGuideViewMode === "flowchart"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🔀 分岐チャート(A4)
                </button>
                <button
                  onClick={() => setGmGuideViewMode("daily_sheet")}
                  className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
                    gmGuideViewMode === "daily_sheet"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 Day別 進行資料
                </button>
              </div>

              <div className="space-y-2">
                {(project.timeline || []).map((step) => {
                  const isSelected = step.dayNumber === selectedGmDay;
                  const fc = GM_DAY_FLOWCHARTS.find((f) => f.dayNumber === step.dayNumber);
                  return (
                    <button
                      key={step.dayNumber}
                      onClick={() => {
                        setSelectedGmDay(step.dayNumber);
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                          Day {step.dayNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {fc?.hasFailureBranch ? "🔀 分岐あり" : step.locationName}
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

        {/* 右メインキャンバス：すべてのタブで「証拠資料」と同じ白い用紙コンテナに統一 */}
        <div ref={previewCanvasRef} data-handout-canvas className="col-span-9 flex-1 overflow-y-auto bg-slate-900/90 p-6 md:p-10">
          <div
            ref={printableSheetRef}
            className="mx-auto max-w-4xl bg-white text-slate-900 border border-slate-300 shadow-xl font-sans rounded-sm p-6 sm:p-7 print:p-0 print:border-0 print:shadow-none print:max-w-none transition-all relative"
          >

            {/* ================================================================
                ① 個人向けハンドアウト（6項目シンプル本紙 ＆ 別配付カード）
               ================================================================ */}
            {category === "handouts" && activeChar && (
              <div className="space-y-6">
                {handoutViewMode === "sheet" ? (
                  /* ------------------------------------------------------------
                     📄 個人ハンドアウト本紙（B5規格特化・無駄な余白ゼロ・高品位レイアウト）
                     ------------------------------------------------------------ */
                  <div className="space-y-5 print:space-y-2 font-sans">
                    {/* 証拠資料と同じ形式の画面上部タイトル ＆ 右上印刷ボタン行 */}
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 個人ハンドアウト本紙（B5規格・全{(project.characters || []).length}名）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          個人ハンドアウト本紙（選択中：{activeChar.name}）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            printCharacterHandoutsB5(
                              activeChar ? [activeChar] : project.characters || [],
                              project.title
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          このPCをB5印刷 / PDF保存
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintAllCharactersB5}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          全員分を一括B5印刷 / PDF保存
                        </button>
                      </div>
                    </div>

                    {/* ① シート最上部ヘッダー（公的機関ブリーフィング見出し） */}
                    <div className="border-b-2 border-slate-900 pb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                          合同対策本部 記録資料
                        </span>
                        <span className="text-[11px] font-black text-slate-900">
                          『{project.title}』
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-900 px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-white">
                          【非公開・個人ハンドアウト】
                        </span>
                        <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700">
                          拠点：
                          {activeChar.location === "headquarters"
                            ? "海上保安庁東京本部"
                            : "小笠原・現地救難隊"}
                        </span>
                      </div>
                    </div>

                    {/* ② 所属・氏名（堂々たるアイデンティティ・プレート） */}
                    <div className="rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="text-[10.5px] font-semibold text-slate-300 tracking-wider mb-0.5">
                          {isDirectEditMode ? (
                            <input
                              type="text"
                              value={activeChar.profession}
                              placeholder="所属・肩書"
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  profession: e.target.value,
                                }))
                              }
                              className="w-full max-w-md rounded border border-dashed border-slate-500 bg-slate-800/80 px-2 py-0.5 text-xs font-semibold text-white focus:outline-none"
                            />
                          ) : (
                            <span>{activeChar.profession}</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {isDirectEditMode ? (
                            <input
                              type="text"
                              value={activeChar.name}
                              placeholder="氏名"
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({ ...c, name: e.target.value }))
                              }
                              className="w-64 rounded border border-dashed border-slate-500 bg-slate-800/80 px-2 py-0.5 text-xl font-black text-white focus:outline-none"
                            />
                          ) : (
                            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                              {activeChar.name}
                            </h2>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className="rounded border border-slate-500 bg-white/10 px-2.5 py-1 font-mono text-xs font-bold text-white tracking-widest">
                          PC-{(project.characters || []).findIndex((c) => c.id === activeChar.id) + 1}
                        </span>
                      </div>
                    </div>

                    {/* ③ 【公開情報エリア】プロフィール ＆ 自己紹介（左右2分割グリッドで完全均等配置・無駄な余白ゼロ） */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 左列：全員に公開できるプロフィール */}
                      <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                            <h3 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                              <span>🌐</span>
                              <span>【公開情報】全員に公開できるプロフィール</span>
                            </h3>
                            <span className="text-[9px] text-slate-500 font-medium">（自己紹介で開示）</span>
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout?.publicProfile || ""}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: { ...c.handout, publicProfile: e.target.value },
                                }))
                              }
                              className="w-full rounded border border-dashed border-slate-400 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-[11.5px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                              {activeChar.handout?.publicProfile || ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 右列：自己紹介（ロールプレイ台詞） */}
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1.5 mb-2">
                            <h3 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                              <span>💬</span>
                              <span>【公開情報】自己紹介（開始時ロールプレイ台詞）</span>
                            </h3>
                            {onSendAiPrompt && (
                              <button
                                onClick={() =>
                                  onSendAiPrompt(
                                    `【${activeChar.name}の自己紹介・記憶の推敲依頼】\n以下の「あなたの記憶」と「自己紹介」をより自然で臨場感ある文章にブラッシュアップしてください：\n\n【あなたの記憶】\n${activeChar.introduction}\n\n【自己紹介】\n${activeChar.handout?.handoutBody || ""}`
                                  )
                                }
                                className="no-print flex items-center gap-1 rounded bg-indigo-700 px-2 py-0.5 text-[9.5px] font-bold text-white hover:bg-indigo-600 shadow-sm"
                              >
                                <Sparkles className="h-3 w-3" />
                                推敲
                              </button>
                            )}
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout?.handoutBody || ""}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: { ...c.handout, handoutBody: e.target.value },
                                }))
                              }
                              className="w-full rounded border border-dashed border-indigo-400 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-indigo-800 focus:outline-none"
                            />
                          ) : (
                            <blockquote className="border-l-2 border-indigo-500 pl-2 text-[11.5px] font-medium leading-relaxed italic text-slate-900 whitespace-pre-wrap">
                              {formatJapaneseParagraphs(activeChar.handout?.handoutBody || "")}
                            </blockquote>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ④ 【非公開情報エリア】あなたの内面・行動指針（左右2分割グリッド：誇り vs 喪失） */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-0.5">
                        <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-700" />
                          <span>あなたの内面（非公開）・行動指針</span>
                        </span>
                        <span className="text-[9.5px] text-slate-500">
                          ※他プレイヤーには非公開（あなたのロールプレイや判断の軸となります）
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 左列：誇り・信条・行動指針 */}
                        <div className="rounded-lg border border-amber-300/80 bg-amber-50/50 p-3">
                          <div className="text-[10.5px] font-bold text-amber-950 border-b border-amber-200/80 pb-1 mb-1.5 flex items-center gap-1">
                            <span>✦</span>
                            <span>誇り・信条・行動指針</span>
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout?.internalDrama?.pride || ""}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: {
                                    ...c.handout,
                                    internalDrama: {
                                      ...(c.handout?.internalDrama || { pride: "", loss: "" }),
                                      pride: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full rounded border border-dashed border-amber-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-amber-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                              {formatJapaneseParagraphs(activeChar.handout?.internalDrama?.pride || "")}
                            </p>
                          )}
                        </div>

                        {/* 右列：過去の喪失・悔恨 */}
                        <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3">
                          <div className="text-[10.5px] font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1">
                            <span>✦</span>
                            <span>過去の喪失・悔恨</span>
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout?.internalDrama?.loss || ""}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: {
                                    ...c.handout,
                                    internalDrama: {
                                      ...(c.handout?.internalDrama || { pride: "", loss: "" }),
                                      loss: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                              {formatJapaneseParagraphs(activeChar.handout?.internalDrama?.loss || "")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ⑤ 【非公開情報エリア】あなたの記憶（全幅・ゆったりと読める時系列・背景情報） */}
                    <div className="rounded-lg border border-slate-300 bg-white p-3.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                        <h3 className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-700" />
                          <span>あなたの記憶（当日の状況・背景情報）</span>
                        </h3>
                        <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
                          非公開情報：他プレイヤーには見せないでください
                        </span>
                      </div>
                      {isDirectEditMode ? (
                        <textarea
                          rows={8}
                          value={activeChar.introduction}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({ ...c, introduction: e.target.value }))
                          }
                          className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                        />
                      ) : (
                        <div className="text-[11.5px] leading-[1.7] text-slate-800 tracking-normal whitespace-pre-wrap">
                          {formatJapaneseParagraphs(activeChar.introduction)}
                        </div>
                      )}
                    </div>

                    {/* ⑥ B5フッター（公式記録フォーマット） */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-500">
                      <span>合同対策本部 記録 // JIS B5 規格ハンドアウト</span>
                      <span className="font-mono">B5 1/1 頁</span>
                    </div>
                  </div>
                ) : handoutViewMode === "cards" ? (
                  /* ------------------------------------------------------------
                     🃏 特別配布カード（全7枚・表紙のみページ＆内容のみページ交互・両面印刷対応）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 特別配布カード（全7枚・A4 4分割 両面印刷レイアウト）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          特別配布カード一覧（表紙ページ ／ 内容ページ分離・長辺とじ両面印刷対応）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          A4 両面印刷用（表紙／内容ページ）で印刷・PDF保存
                        </button>
                      </div>
                    </div>

                    <div className="no-print rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950 leading-relaxed">
                      <strong>🖨️ コンビニ・家庭用プリンタの両面印刷（長辺とじ）完全対応：</strong>
                      奇数ページに<strong>「表紙のみ（4枚）」</strong>、偶数ページに<strong>「内容のみ（4枚・裏表が重なるよう左右反転配置）」</strong>が交互に並びます。そのまま1つのPDFとして<strong>「両面印刷（長辺とじ）」</strong>で出力し、中央の破線に沿って十字に4分割カットすると、表裏がピタッと一致します。
                    </div>

                    {(() => {
                      const rawCardsSource =
                        project.specialCharacterCards && project.specialCharacterCards.length === 7
                          ? project.specialCharacterCards
                          : SPECIAL_CHARACTER_CARDS;
                      const cardsSource = rawCardsSource.map((c) => {
                        const master = SPECIAL_CHARACTER_CARDS.find((m) => m.id === c.id);
                        return master
                          ? {
                              ...c,
                              title: master.title,
                              frontTitleHtml: master.frontTitleHtml,
                              description: master.description,
                              rubyHtml: master.rubyHtml,
                              glossaryNote: master.glossaryNote,
                            }
                          : c;
                      });

                      const sheets: ((typeof cardsSource)[number] | null)[][] = [];
                      for (let i = 0; i < cardsSource.length; i += 4) {
                        sheets.push([
                          cardsSource[i] ?? null,
                          cardsSource[i + 1] ?? null,
                          cardsSource[i + 2] ?? null,
                          cardsSource[i + 3] ?? null,
                        ]);
                      }

                      const renderFrontFace = (
                        card: (typeof cardsSource)[number] | null,
                        slotKey: string
                      ) => {
                        if (!card) {
                          return (
                            <div
                              key={slotKey}
                              className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                            >
                              <span className="no-print">（空白枠：両面位置合わせ用）</span>
                            </div>
                          );
                        }
                        const charShort = (card.characterName || "").split("（")[0];
                        const cardLabel = `特別配布カード（${charShort}）`;
                        const isSelected = card.characterId === activeChar?.id;
                        return (
                          <div
                            key={slotKey}
                            onClick={() => setSelectedCharId(card.characterId)}
                            className={`card-face-134mm cursor-pointer rounded-md border-2 p-5 flex flex-col justify-between min-h-[380px] shadow-sm transition ${
                              isSelected ? "ring-2 ring-indigo-500 print:ring-0" : ""
                            }`}
                            style={{
                              borderColor: card.accentHex,
                              backgroundColor: "#f8fafc",
                            }}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className="rounded border px-2 py-0.5 font-bold"
                                style={{
                                  backgroundColor: "#eff6ff",
                                  borderColor: "#93c5fd",
                                  color: "#1e40af",
                                }}
                              >
                                {card.revealDayLabel}
                              </span>
                              <span
                                className="rounded px-2.5 py-0.5 font-bold text-white"
                                style={{ backgroundColor: card.accentHex }}
                              >
                                {cardLabel}
                              </span>
                            </div>

                            <div className="my-auto py-5 text-center space-y-2">
                              <div
                                className="text-[11px] font-bold tracking-widest"
                                style={{ color: card.accentHex }}
                              >
                                海上保安庁・合同対策本部
                              </div>
                              {card.frontTitleHtml ? (
                                <div
                                  className="card-front-title-20px text-[20px] text-xl font-black text-slate-900 leading-snug px-2"
                                  dangerouslySetInnerHTML={{ __html: card.frontTitleHtml }}
                                />
                              ) : (
                                <div className="card-front-title-20px text-[20px] text-xl font-black text-slate-900 leading-snug px-2">
                                  {card.title}
                                </div>
                              )}
                              <div
                                className="mx-auto w-4/5 border-t-2 pt-2 text-xs font-bold"
                                style={{
                                  borderColor: card.accentHex,
                                  color: card.accentHex,
                                }}
                              >
                                {cardLabel}
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-2 flex items-center justify-end">
                              <span
                                className="font-mono text-xs font-bold"
                                style={{ color: card.accentHex }}
                              >
                                {card.cardCode} / 07
                              </span>
                            </div>
                          </div>
                        );
                      };

                      const renderBackFace = (
                        card: (typeof cardsSource)[number] | null,
                        slotKey: string
                      ) => {
                        if (!card) {
                          return (
                            <div
                              key={slotKey}
                              className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                            >
                              <span className="no-print">（空白枠：両面位置合わせ用）</span>
                            </div>
                          );
                        }
                        const charShort = (card.characterName || "").split("（")[0];
                        const cardLabel = `特別配布カード（${charShort}）`;
                        const isSelected = card.characterId === activeChar?.id;
                        return (
                          <div
                            key={slotKey}
                            onClick={() => setSelectedCharId(card.characterId)}
                            className={`card-face-134mm cursor-pointer rounded-md border-2 bg-white p-5 flex flex-col justify-between min-h-[380px] shadow-sm transition ${
                              isSelected ? "ring-2 ring-indigo-500 print:ring-0" : ""
                            }`}
                            style={{ borderColor: card.accentHex }}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span
                                  className="rounded px-2.5 py-0.5 font-bold text-white"
                                  style={{ backgroundColor: card.accentHex }}
                                >
                                  {cardLabel}
                                </span>
                                <span
                                  className="rounded border px-2 py-0.5 font-bold"
                                  style={{
                                    backgroundColor: "#eff6ff",
                                    borderColor: "#93c5fd",
                                    color: "#1e40af",
                                  }}
                                >
                                  {card.revealDayLabel}
                                </span>
                              </div>

                              <div
                                className="border-b-2 pb-1.5 mb-2"
                                style={{ borderColor: card.accentHex }}
                              >
                                <h3
                                  className="text-base font-extrabold"
                                  style={{ color: "#0f172a" }}
                                >
                                  {card.title}
                                </h3>
                              </div>

                              {card.rubyHtml ? (
                                <div
                                  className="card-body-12px text-[12px] leading-[1.8] text-slate-800 text-left [&_ruby]:whitespace-nowrap [&_rt]:text-[7.5px] [&_rt]:leading-none [&_rt]:tracking-tight [&_rt]:text-slate-600 [&_rt]:font-semibold"
                                  dangerouslySetInnerHTML={{ __html: card.rubyHtml }}
                                />
                              ) : (
                                <div
                                  className={`card-body-12px text-[12px] ${
                                    card.glossaryNote ? "leading-[1.48]" : "leading-[1.6]"
                                  } text-slate-800 whitespace-pre-wrap text-justify`}
                                >
                                  {renderColoredCardBody(card.description)}
                                </div>
                              )}
                            </div>

                            <div className="mt-2 space-y-1.5">
                              {card.glossaryNote && (
                                <div
                                  className="rounded border px-2.5 py-1.5 text-[9.5px] leading-[1.35] whitespace-pre-wrap"
                                  style={{
                                    backgroundColor: "#f0f9ff",
                                    borderColor: "#7dd3fc",
                                  }}
                                >
                                  {renderColoredGlossaryNote(card.glossaryNote)}
                                </div>
                              )}
                              <div className="border-t border-dashed border-slate-300 pt-1.5 flex items-center justify-end text-xs">
                                <span
                                  className="font-mono font-bold"
                                  style={{ color: card.accentHex }}
                                >
                                  {card.cardCode} / 07
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-8 print:space-y-0">
                          {sheets.map((quad, sheetIdx) => {
                            const frontOrder = [quad[0], quad[1], quad[2], quad[3]];
                            // 長辺とじ両面印刷用：裏面は左右列を入れ替え（[左上=1, 右上=0, 左下=3, 右下=2]）
                            const backOrder = [quad[1], quad[0], quad[3], quad[2]];
                            const frontPageNum = sheetIdx * 2 + 1;
                            const backPageNum = sheetIdx * 2 + 2;

                            return (
                              <React.Fragment key={`sp-sheet-${sheetIdx}`}>
                                {/* 奇数ページ：表紙のみ 4枚 */}
                                <div className="space-y-2 print:space-y-0">
                                  <div className="no-print flex items-center justify-between rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
                                    <span>
                                      📄 第{sheetIdx + 1}シート 表面（{frontPageNum}ページ目）：【表紙のみ】4枚配置
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-300">
                                      配置順：左上 ➔ 右上 ➔ 左下 ➔ 右下
                                    </span>
                                  </div>
                                  <div className="duplex-a4-page rounded-lg border border-slate-200 bg-slate-50/40 p-4 relative">
                                    <div className="duplex-cut-guide-h hidden print:block" />
                                    <div className="duplex-cut-guide-v hidden print:block" />
                                    <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {frontOrder.map((c, slotIdx) =>
                                        renderFrontFace(c, `sp-f-${sheetIdx}-${slotIdx}`)
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* 偶数ページ：内容のみ 4枚（長辺とじ裏面合わせ左右反転） */}
                                <div className="space-y-2 print:space-y-0">
                                  <div className="no-print flex items-center justify-between rounded bg-indigo-900 px-3 py-1.5 text-xs font-bold text-white">
                                    <span>
                                      📄 第{sheetIdx + 1}シート 裏面（{backPageNum}ページ目）：【内容のみ】4枚配置
                                    </span>
                                    <span className="font-mono text-[11px] text-indigo-200">
                                      ※両面印刷（長辺とじ）で表紙と一致するよう左右列を反転配置済み
                                    </span>
                                  </div>
                                  <div className="duplex-a4-page rounded-lg border border-indigo-200 bg-indigo-50/20 p-4 relative">
                                    <div className="duplex-cut-guide-h hidden print:block" />
                                    <div className="duplex-cut-guide-v hidden print:block" />
                                    <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {backOrder.map((c, slotIdx) =>
                                        renderBackFace(c, `sp-b-${sheetIdx}-${slotIdx}`)
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ) : handoutViewMode === "daily_briefings" ? (
                  /* ------------------------------------------------------------
                     📋 Day別・朝潮＆長津ブリーフィング指令書（開始時7枚 ＋ 途中追加ミッション5枚 ＝ 全12枚）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 対策本部・日次ブリーフィング ＆ 途中追加指令シート（全12枚）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          Day別＆途中指令シート一覧（朝潮＆長津用）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          表示中の指令書を印刷 / PDF保存
                        </button>
                      </div>
                    </div>

                    <div className="space-y-5 print:space-y-4">
                      {filteredBriefings.map((b, idx) => (
                        <div
                          key={b.id}
                          data-handout-id={b.id}
                          data-selected={b.id === activeBriefingId}
                          className={`rounded-md border-2 bg-white p-4 shadow-sm space-y-2.5 break-inside-avoid ${b.id === activeBriefingId ? "ring-2 ring-indigo-500 print:ring-0" : ""} ${
                            idx % 2 === 0 && idx > 0 ? "page-break-before" : ""
                          }`}
                          style={{
                            borderColor: b.isMidDayAddition ? "#3730a3" : "#1e293b",
                          }}
                        >
                          <div
                            className="flex flex-wrap items-center justify-between gap-2 border-b-2 pb-2"
                            style={{
                              borderColor: b.isMidDayAddition ? "#3730a3" : "#1e293b",
                            }}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="rounded px-2.5 py-0.5 text-xs font-black text-white"
                                style={{
                                  backgroundColor: b.isMidDayAddition ? "#3730a3" : "#0f172a",
                                }}
                              >
                                {b.badgeLabel}
                              </span>
                              <h3 className="text-sm font-black text-slate-900">{b.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {b.linkedNagatsuCardCode && (
                                <span
                                  className="rounded border px-2 py-0.5 text-[11px] font-bold"
                                  style={{
                                    backgroundColor: "#eef2ff",
                                    borderColor: "#a5b4fc",
                                    color: "#312e81",
                                  }}
                                >
                                  {b.linkedNagatsuCardCode.startsWith("SP-")
                                    ? `🃏 特別配布カード ${b.linkedNagatsuCardCode} 連動`
                                    : `🎙️ 長津カード ${b.linkedNagatsuCardCode} と同時配布`}
                                </span>
                              )}
                              {b.targetMinutes && (
                                <span className="text-xs font-bold text-slate-600 font-mono">
                                  目標進行時間: {b.targetMinutes}分
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 上段：長津からの緊急通信ブリーフィング / 途中アナウンス */}
                          <div
                            className="rounded border p-3 space-y-1"
                            style={{
                              backgroundColor: b.isMidDayAddition ? "#f5f7ff" : "#f8fafc",
                              borderColor: b.isMidDayAddition ? "#c7d2fe" : "#cbd5e1",
                            }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span
                                className="text-xs font-extrabold"
                                style={{
                                  color: b.isMidDayAddition ? "#312e81" : "#1e293b",
                                }}
                              >
                                {b.nagatsuBriefingTitle}
                              </span>
                              {b.timingNote && (
                                <span className="text-[10.5px] font-semibold text-slate-500">
                                  配布タイミング：{b.timingNote}
                                </span>
                              )}
                            </div>
                            {b.nagatsuBriefingRubyHtml ? (
                              <p
                                className="text-[11px] leading-[1.82] text-slate-800 font-medium [&_ruby]:whitespace-nowrap [&_rt]:text-[7.5px] [&_rt]:leading-none [&_rt]:tracking-tight [&_rt]:text-slate-600 [&_rt]:font-semibold"
                                dangerouslySetInnerHTML={{ __html: b.nagatsuBriefingRubyHtml }}
                              />
                            ) : (
                              <p className="text-[11px] leading-[1.82] text-slate-800 font-medium whitespace-pre-wrap">
                                {b.nagatsuBriefingText}
                              </p>
                            )}
                          </div>

                          {/* 下段：危機管理官 朝潮（PC1）の指揮ミッション */}
                          <div className="rounded border border-slate-300 bg-white p-3 space-y-1.5">
                            <div
                              className="text-xs font-extrabold border-b border-slate-200 pb-1"
                              style={{
                                color: b.isMidDayAddition ? "#1e3a8a" : "#0f172a",
                              }}
                            >
                              {b.isMidDayAddition
                                ? "🧭 危機管理官 朝潮がこの局面で指揮・達成すべき追加ミッション"
                                : "🧭 危機管理官 朝潮がこのDayで指揮・達成すべきミッション"}
                            </div>
                            <ul className="space-y-1.5 text-[11px] leading-[1.75] text-slate-800 list-none">
                              {b.asashioMissions.map((m, mIdx) => (
                                <li key={mIdx} className="flex items-start gap-2">
                                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                                  <span>{renderColoredCardBody(m)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-end pt-1 border-t border-dashed border-slate-200">
                            <span className="font-mono font-bold">{b.sheetCode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ------------------------------------------------------------
                     🎙️ 長津（PC7）専用 フェーズ進行＆ミッション達成時アナウンスカード一覧（全11枚・表紙／内容ページ分離・両面印刷対応）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 長津（PC7）専用 フェーズ進行＆ミッション達成時アナウンスカード（全10枚・A4 4分割 両面印刷レイアウト）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          長津（PC7）専用・途中＆達成時アナウンスカード一覧（NG-02〜NG-10・NG-08は枝番2枚組）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          A4 両面印刷用（表紙／内容ページ）で印刷・PDF保存
                        </button>
                      </div>
                    </div>

                    <div className="no-print rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950 leading-relaxed">
                      <strong>🖨️ コンビニ・家庭用プリンタの両面印刷（長辺とじ）完全対応：</strong>
                      奇数ページに<strong>「表紙のみ（4枚）」</strong>、偶数ページに<strong>「内容のみ（4枚・裏表が重なるよう左右反転配置）」</strong>が交互に並びます。そのまま1つのPDFとして<strong>「両面印刷（長辺とじ）」</strong>で出力し、中央の破線に沿って十字に4分割カットすると、表裏がピタッと一致します。
                    </div>

                    {(() => {
                      const sheets: ((typeof NAGATSU_PHASE_CARDS)[number] | null)[][] = [];
                      for (let i = 0; i < NAGATSU_PHASE_CARDS.length; i += 4) {
                        sheets.push([
                          NAGATSU_PHASE_CARDS[i] ?? null,
                          NAGATSU_PHASE_CARDS[i + 1] ?? null,
                          NAGATSU_PHASE_CARDS[i + 2] ?? null,
                          NAGATSU_PHASE_CARDS[i + 3] ?? null,
                        ]);
                      }

                      const renderNagatsuFront = (
                        nc: (typeof NAGATSU_PHASE_CARDS)[number] | null,
                        slotKey: string
                      ) => {
                        if (!nc) {
                          return (
                            <div
                              key={slotKey}
                              className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                            >
                              <span className="no-print">（空白枠：両面位置合わせ用）</span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={slotKey}
                            data-handout-id={nc.id}
                            data-handout-face="front"
                            data-selected={nc.id === activePhaseCardId}
                            className={`card-face-134mm rounded-md border-2 border-slate-800 bg-[#fafaf9] p-5 flex flex-col justify-between min-h-[380px] shadow-sm ${nc.id === activePhaseCardId ? "ring-2 ring-indigo-500 print:ring-0" : ""}`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="rounded bg-slate-100 border border-slate-300 px-2 py-0.5 font-bold text-slate-800">
                                {nc.timingBadge}
                              </span>
                              <span
                                className="rounded px-2.5 py-0.5 font-bold text-white"
                                style={{ backgroundColor: nc.accentHex }}
                              >
                                長津アナウンスカード
                              </span>
                            </div>

                            <div className="my-auto py-5 text-center space-y-2">
                              <div className="text-[11px] font-bold tracking-widest text-slate-500">
                                海上保安庁・合同対策本部
                              </div>
                              {nc.frontTitleHtml ? (
                                <div
                                  className="card-front-title-20px text-[20px] text-xl font-black text-slate-900 leading-snug px-2"
                                  dangerouslySetInnerHTML={{ __html: nc.frontTitleHtml }}
                                />
                              ) : (
                                <div className="card-front-title-20px text-[20px] text-xl font-black text-slate-900 leading-snug px-2">
                                  {nc.title}
                                </div>
                              )}
                              <div className="mx-auto w-4/5 border-t border-slate-300 pt-2 text-xs font-bold text-slate-600">
                                長津アナウンスカード
                              </div>
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-2 flex items-center justify-end">
                              <span className="font-mono text-xs font-bold text-slate-500">
                                {nc.cardCode} / 10
                              </span>
                            </div>
                          </div>
                        );
                      };

                      const renderNagatsuBack = (
                        nc: (typeof NAGATSU_PHASE_CARDS)[number] | null,
                        slotKey: string
                      ) => {
                        if (!nc) {
                          return (
                            <div
                              key={slotKey}
                              className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                            >
                              <span className="no-print">（空白枠：両面位置合わせ用）</span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={slotKey}
                            data-handout-id={nc.id}
                            data-handout-face="back"
                            data-selected={nc.id === activePhaseCardId}
                            className={`card-face-134mm rounded-md border-2 border-slate-700 bg-white p-5 flex flex-col justify-between min-h-[380px] shadow-sm ${nc.id === activePhaseCardId ? "ring-2 ring-indigo-500 print:ring-0" : ""}`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span
                                  className="rounded px-2.5 py-0.5 font-bold text-white"
                                  style={{ backgroundColor: nc.accentHex }}
                                >
                                  長津アナウンスカード
                                </span>
                                <span className="rounded bg-slate-100 border border-slate-300 px-2 py-0.5 font-bold text-slate-800">
                                  {nc.timingBadge}
                                </span>
                              </div>

                              <div className="border-b-2 border-slate-900 pb-1.5 mb-2">
                                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                                  {nc.title}
                                </h4>
                              </div>

                              <div
                                className={`card-body-12px text-[12px] ${
                                  nc.cardCode === "NG-09" || nc.cardCode === "NG-10"
                                    ? "leading-[1.72]"
                                    : "leading-[1.82]"
                                } text-slate-800 text-left [&_ruby]:whitespace-nowrap [&_rt]:text-[7.5px] [&_rt]:leading-none [&_rt]:tracking-tight [&_rt]:text-slate-600 [&_rt]:font-semibold`}
                                dangerouslySetInnerHTML={{ __html: nc.rubyHtml }}
                              />
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-2 mt-2 flex items-center justify-end text-xs">
                              <span className="font-mono font-bold text-slate-500">
                                {nc.cardCode} / 10
                              </span>
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-8 print:space-y-0">
                          {sheets.map((quad, sheetIdx) => {
                            const frontOrder = [quad[0], quad[1], quad[2], quad[3]];
                            const backOrder = [quad[1], quad[0], quad[3], quad[2]];
                            const frontPageNum = sheetIdx * 2 + 1;
                            const backPageNum = sheetIdx * 2 + 2;

                            return (
                              <React.Fragment key={`ng-sheet-${sheetIdx}`}>
                                {/* 奇数ページ：表紙のみ 4枚 */}
                                <div className="space-y-2 print:space-y-0">
                                  <div className="no-print flex items-center justify-between rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
                                    <span>
                                      📄 第{sheetIdx + 1}シート 表面（{frontPageNum}ページ目）：【表紙のみ】4枚配置
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-300">
                                      配置順：左上 ➔ 右上 ➔ 左下 ➔ 右下
                                    </span>
                                  </div>
                                  <div className="duplex-a4-page rounded-lg border border-slate-200 bg-slate-50/40 p-4 relative">
                                    <div className="duplex-cut-guide-h hidden print:block" />
                                    <div className="duplex-cut-guide-v hidden print:block" />
                                    <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {frontOrder.map((c, slotIdx) =>
                                        renderNagatsuFront(c, `ng-f-${sheetIdx}-${slotIdx}`)
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* 偶数ページ：内容のみ 4枚（長辺とじ裏面合わせ左右反転） */}
                                <div className="space-y-2 print:space-y-0">
                                  <div className="no-print flex items-center justify-between rounded bg-indigo-900 px-3 py-1.5 text-xs font-bold text-white">
                                    <span>
                                      📄 第{sheetIdx + 1}シート 裏面（{backPageNum}ページ目）：【内容のみ】4枚配置
                                    </span>
                                    <span className="font-mono text-[11px] text-indigo-200">
                                      ※両面印刷（長辺とじ）で表紙と一致するよう左右列を反転配置済み
                                    </span>
                                  </div>
                                  <div className="duplex-a4-page rounded-lg border border-indigo-200 bg-indigo-50/20 p-4 relative">
                                    <div className="duplex-cut-guide-h hidden print:block" />
                                    <div className="duplex-cut-guide-v hidden print:block" />
                                    <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {backOrder.map((c, slotIdx) =>
                                        renderNagatsuBack(c, `ng-b-${sheetIdx}-${slotIdx}`)
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                ② 証拠資料（A4 4分割カード一覧 ＆ 個別カードの直接編集ビュー）
               ================================================================ */}
            {category === "evidences" && (
              evidenceViewMode === "cards_a4" ? (
                <div className="space-y-6">
                  <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-slate-500 block">
                        {project.title} ― 証拠資料カード一覧（A4 4分割 両面印刷レイアウト・下部余白の用語解説付き）
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        証拠カード一覧（表示中：{filteredEvidences.length}枚 ／ 全{allEvidences.length}枚・表紙ページ／内容ページ分離）
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrintDesignedSheet}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        A4 両面印刷用（表紙／内容ページ）で印刷・PDF保存
                      </button>
                    </div>
                  </div>

                  <div className="no-print rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950 leading-relaxed">
                    <strong>🖨️ コンビニ・家庭用プリンタの両面印刷（長辺とじ）完全対応：</strong>
                    奇数ページに<strong>「表紙のみ（4枚）」</strong>、偶数ページに<strong>「内容のみ（4枚・裏表が重なるよう左右反転配置）」</strong>が交互に並びます。そのまま1つのPDFとして<strong>「両面印刷（長辺とじ）」</strong>で出力し、中央の破線に沿って十字に4分割カットすると、表裏がピタッと一致します。
                  </div>

                  {(() => {
                    const sheets: (EvidenceItem | null)[][] = [];
                    for (let i = 0; i < filteredEvidences.length; i += 4) {
                      sheets.push([
                        filteredEvidences[i] ?? null,
                        filteredEvidences[i + 1] ?? null,
                        filteredEvidences[i + 2] ?? null,
                        filteredEvidences[i + 3] ?? null,
                      ]);
                    }

                    const renderEvidenceFront = (ev: EvidenceItem | null, slotKey: string) => {
                      if (!ev) {
                        return (
                          <div
                            key={slotKey}
                            className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                          >
                            <span className="no-print">（空白枠：両面位置合わせ用）</span>
                          </div>
                        );
                      }
                      const globalIdx = allEvidences.findIndex((e) => e.id === ev.id) + 1;
                      const evCode = `EV-${String(globalIdx).padStart(2, "0")}`;
                      const ownerChar = (project.characters || []).find((c) => c.id === ev.ownerId);
                      const ownerShort = ownerChar
                        ? (ownerChar.name || "").split("（")[0]
                        : "全体公開";
                      const isSelected = ev.id === activeEvidence?.id;
                      const cardColor = getEvidenceCardColorTheme(ev.ownerId, ev.foundPhase);
                      const formattedFrontTitleHtml = formatEvidenceFrontTitleHtml(
                        ev.title,
                        ev.frontTitleHtml
                      );

                      return (
                        <div
                          key={slotKey}
                          onClick={() => setSelectedEvidenceId(ev.id)}
                          className={`card-face-134mm cursor-pointer rounded-md border-2 p-5 flex flex-col justify-between min-h-[380px] shadow-sm transition ${
                            isSelected ? "ring-2 ring-indigo-500 print:ring-0" : ""
                          }`}
                          style={{
                            borderColor: cardColor.borderHex,
                            backgroundColor: cardColor.frontBgHex,
                          }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className="rounded border px-2 py-0.5 font-bold"
                              style={{
                                backgroundColor: cardColor.dayBg,
                                borderColor: cardColor.dayBorder,
                                color: cardColor.dayText,
                              }}
                            >
                              Day {ev.foundPhase} 開示
                            </span>
                            <span
                              className="rounded px-2.5 py-0.5 font-bold text-white"
                              style={{ backgroundColor: cardColor.badgeBg }}
                            >
                              証拠資料カード（{ownerShort}）
                            </span>
                          </div>

                          <div className="my-auto py-5 text-center space-y-2">
                            <div
                              className="text-[11px] font-bold tracking-widest"
                              style={{ color: cardColor.headerHex }}
                            >
                              海上保安庁・合同対策本部
                            </div>
                            <div
                              className="card-front-title-20px text-[20px] text-xl font-black text-slate-900 leading-snug px-2"
                              dangerouslySetInnerHTML={{ __html: formattedFrontTitleHtml }}
                            />
                            <div
                              className="mx-auto w-4/5 border-t-2 pt-2 text-xs font-bold"
                              style={{
                                borderColor: cardColor.dividerHex,
                                color: cardColor.headerHex,
                              }}
                            >
                              証拠資料カード（{ownerShort}）
                            </div>
                          </div>

                          <div className="border-t border-dashed border-slate-300 pt-2 flex items-center justify-end">
                            <span
                              className="font-mono text-xs font-bold"
                              style={{ color: cardColor.headerHex }}
                            >
                              {evCode} / {String(allEvidences.length).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      );
                    };

                    const renderEvidenceBack = (ev: EvidenceItem | null, slotKey: string) => {
                      if (!ev) {
                        return (
                          <div
                            key={slotKey}
                            className="card-empty-slot hidden md:flex print:block items-center justify-center rounded-md border border-dashed border-slate-200 min-h-[380px] text-xs text-slate-400"
                          >
                            <span className="no-print">（空白枠：両面位置合わせ用）</span>
                          </div>
                        );
                      }
                      const globalIdx = allEvidences.findIndex((e) => e.id === ev.id) + 1;
                      const evCode = `EV-${String(globalIdx).padStart(2, "0")}`;
                      const ownerChar = (project.characters || []).find((c) => c.id === ev.ownerId);
                      const ownerShort = ownerChar
                        ? (ownerChar.name || "").split("（")[0]
                        : "全体公開";
                      const isSelected = ev.id === activeEvidence?.id;
                      const cardColor = getEvidenceCardColorTheme(ev.ownerId, ev.foundPhase);

                      return (
                        <div
                          key={slotKey}
                          onClick={() => setSelectedEvidenceId(ev.id)}
                          className={`card-face-134mm cursor-pointer rounded-md border-2 bg-white p-5 flex flex-col justify-between min-h-[380px] shadow-sm transition ${
                            isSelected ? "ring-2 ring-indigo-500 print:ring-0" : ""
                          }`}
                          style={{ borderColor: cardColor.borderHex }}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span
                                className="rounded px-2.5 py-0.5 font-bold text-white"
                                style={{ backgroundColor: cardColor.badgeBg }}
                              >
                                証拠資料カード（{ownerShort}）
                              </span>
                              <span
                                className="rounded border px-2 py-0.5 font-bold"
                                style={{
                                  backgroundColor: cardColor.dayBg,
                                  borderColor: cardColor.dayBorder,
                                  color: cardColor.dayText,
                                }}
                              >
                                Day {ev.foundPhase} 開示
                              </span>
                            </div>

                            <div
                              className="border-b-2 pb-1.5 mb-2"
                              style={{ borderColor: cardColor.borderHex }}
                            >
                              <h3
                                className="text-base font-extrabold"
                                style={{ color: "#0f172a" }}
                              >
                                {ev.title}
                              </h3>
                            </div>

                            <div
                              className={`card-body-12px text-[12px] ${
                                ev.glossaryNote
                                  ? "leading-[1.48]"
                                  : "leading-[1.6]"
                              } text-slate-800 whitespace-pre-wrap text-justify`}
                            >
                              {renderColoredCardBody(ev.description)}
                            </div>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {ev.glossaryNote && (
                              <div
                                className="rounded border px-2.5 py-1.5 text-[9.5px] leading-[1.35] whitespace-pre-wrap"
                                style={{
                                  backgroundColor: "#f0f9ff",
                                  borderColor: "#7dd3fc",
                                }}
                              >
                                {renderColoredGlossaryNote(ev.glossaryNote)}
                              </div>
                            )}
                            <div className="border-t border-dashed border-slate-300 pt-1.5 flex items-center justify-end text-xs">
                              <span
                                className="font-mono font-bold"
                                style={{ color: cardColor.headerHex }}
                              >
                                {evCode} / {String(allEvidences.length).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-8 print:space-y-0">
                        {sheets.map((quad, sheetIdx) => {
                          const frontOrder = [quad[0], quad[1], quad[2], quad[3]];
                          const backOrder = [quad[1], quad[0], quad[3], quad[2]];
                          const frontPageNum = sheetIdx * 2 + 1;
                          const backPageNum = sheetIdx * 2 + 2;

                          return (
                            <React.Fragment key={`ev-sheet-${sheetIdx}`}>
                              {/* 奇数ページ：表紙のみ 4枚 */}
                              <div className="space-y-2 print:space-y-0">
                                <div className="no-print flex items-center justify-between rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
                                  <span>
                                    📄 第{sheetIdx + 1}シート 表面（{frontPageNum}ページ目）：【表紙のみ】4枚配置
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-300">
                                    配置順：左上 ➔ 右上 ➔ 左下 ➔ 右下
                                  </span>
                                </div>
                                <div className="duplex-a4-page rounded-lg border border-slate-200 bg-slate-50/40 p-4 relative">
                                  <div className="duplex-cut-guide-h hidden print:block" />
                                  <div className="duplex-cut-guide-v hidden print:block" />
                                  <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {frontOrder.map((evItem, slotIdx) =>
                                      renderEvidenceFront(evItem, `ev-f-${sheetIdx}-${slotIdx}`)
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 偶数ページ：内容のみ 4枚（長辺とじ裏面合わせ左右反転） */}
                              <div className="space-y-2 print:space-y-0">
                                <div className="no-print flex items-center justify-between rounded bg-indigo-900 px-3 py-1.5 text-xs font-bold text-white">
                                  <span>
                                    📄 第{sheetIdx + 1}シート 裏面（{backPageNum}ページ目）：【内容のみ】4枚配置
                                  </span>
                                  <span className="font-mono text-[11px] text-indigo-200">
                                    ※両面印刷（長辺とじ）で表紙と一致するよう左右列を反転配置済み
                                  </span>
                                </div>
                                <div className="duplex-a4-page rounded-lg border border-indigo-200 bg-indigo-50/20 p-4 relative">
                                  <div className="duplex-cut-guide-h hidden print:block" />
                                  <div className="duplex-cut-guide-v hidden print:block" />
                                  <div className="duplex-card-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {backOrder.map((evItem, slotIdx) =>
                                      renderEvidenceBack(evItem, `ev-b-${sheetIdx}-${slotIdx}`)
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                activeEvidence && (() => {
                  const ownerChar = (project.characters || []).find((c) => c.id === activeEvidence.ownerId);
                  const ownerName =
                    activeEvidence.ownerId === "all" || !activeEvidence.ownerId
                      ? "全体公開 / 現場資料"
                      : ownerChar
                      ? `${ownerChar.name}（${ownerChar.profession || "所持"}）`
                      : activeEvidence.ownerId;
                  const singleColor = getEvidenceCardColorTheme(
                    activeEvidence.ownerId,
                    activeEvidence.foundPhase
                  );

                  return (
                    <div className="space-y-6">
                      {/* 証拠資料一覧と同一形式の上部タイトル ＆ 右上印刷ボタン行 */}
                      <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold tracking-widest text-slate-500 block">
                            {project.title} ― 証拠資料カード 個別詳細（Day {activeEvidence.foundPhase} 開示）
                          </span>
                          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                            {activeEvidence.title}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePrintDesignedSheet}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            この証拠カードを印刷 / PDF保存
                          </button>
                        </div>
                      </div>

                      {/* B5カード ヘッダー＆メタ情報 */}
                      <div
                        className="rounded-lg border-2 p-4"
                        style={{
                          borderColor: singleColor.borderHex,
                          backgroundColor: singleColor.frontBgHex,
                        }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 text-xs">
                          {/* Day & 種別 */}
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded px-2.5 py-1 font-mono font-bold text-white shadow-sm"
                              style={{ backgroundColor: singleColor.badgeBg }}
                            >
                              証拠資料カード
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
                                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800"
                              >
                                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                  <option key={d} value={d}>
                                    開示: Day {d}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className="rounded border px-2 py-0.5 font-bold"
                                style={{
                                  backgroundColor: singleColor.dayBg,
                                  borderColor: singleColor.dayBorder,
                                  color: singleColor.dayText,
                                }}
                              >
                                開示フェーズ: Day {activeEvidence.foundPhase}
                              </span>
                            )}
                          </div>

                          {/* 所持者 & カテゴリ */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {isDirectEditMode ? (
                              <>
                                <select
                                  value={activeEvidence.ownerId || "all"}
                                  onChange={(e) =>
                                    handleUpdateActiveEvidence((ev) => ({
                                      ...ev,
                                      ownerId: e.target.value,
                                    }))
                                  }
                                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                >
                                  <option value="all">🌐 全体公開 / 現場</option>
                                  {(project.characters || []).map((c) => (
                                    <option key={c.id} value={c.id}>
                                      👤 {c.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={activeEvidence.category}
                                  onChange={(e) =>
                                    handleUpdateActiveEvidence((ev) => ({
                                      ...ev,
                                      category: e.target.value as EvidenceItem["category"],
                                    }))
                                  }
                                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                >
                                  <option value="document">📄 文書・記録</option>
                                  <option value="data">📊 観測・データ</option>
                                  <option value="sample">🔬 検体・物証</option>
                                  <option value="testimony">🗣️ 証言・調書</option>
                                  <option value="audio">📻 音声・ログ</option>
                                </select>
                              </>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 rounded px-2.5 py-0.5 font-bold text-white"
                                style={{ backgroundColor: singleColor.badgeBg }}
                              >
                                所持: {ownerName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 件名 / タイトル */}
                        <div className="mt-3">
                          <span
                            className="block text-[10px] font-bold tracking-wider uppercase"
                            style={{ color: singleColor.headerHex }}
                          >
                            資料件名
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
                              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-base font-bold text-slate-900 focus:border-slate-600 focus:outline-none"
                            />
                          ) : (
                            <h1 className="mt-1 text-lg font-extrabold text-slate-900">
                              {activeEvidence.title}
                            </h1>
                          )}
                        </div>
                      </div>

                      {/* 本文エリア（B5カードの適正サイズ） */}
                      <div
                        className="rounded-lg border-2 bg-white p-5 shadow-sm"
                        style={{ borderColor: singleColor.borderHex }}
                      >
                        <div
                          className="mb-2 flex items-center justify-between border-b-2 pb-2"
                          style={{ borderColor: singleColor.dividerHex }}
                        >
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: singleColor.headerHex }}
                          >
                            ■ 記録・本文内容
                          </span>
                          {isDirectEditMode && (
                            <span className="text-[10px] text-slate-400">
                              ※直接編集可能
                            </span>
                          )}
                        </div>
                        {isDirectEditMode ? (
                          <textarea
                            rows={10}
                            value={activeEvidence.description}
                            onChange={(e) =>
                              handleUpdateActiveEvidence((ev) => ({
                                ...ev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-dashed border-slate-300 bg-slate-50/50 p-3 text-sm leading-relaxed text-slate-900 focus:border-slate-500 focus:bg-white focus:outline-none"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                            {renderColoredCardBody(activeEvidence.description)}
                          </div>
                        )}
                      </div>

                      {/* 下部余白：初心者向け用語解説（「〜とは：…」） */}
                      {(activeEvidence.glossaryNote || isDirectEditMode) && (
                        <div
                          className="rounded-lg border p-4 shadow-sm"
                          style={{
                            backgroundColor: "#f0f9ff",
                            borderColor: "#7dd3fc",
                          }}
                        >
                          <div
                            className="mb-1.5 flex items-center justify-between border-b pb-1.5"
                            style={{ borderColor: "#bae6fd" }}
                          >
                            <span
                              className="text-xs font-extrabold"
                              style={{ color: "#0369a1" }}
                            >
                              📖 用語解説（カード下部余白に表示）
                            </span>
                            {isDirectEditMode && (
                              <span className="text-[10px] text-slate-400">
                                ※空欄にすると非表示になります
                              </span>
                            )}
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              placeholder="例：※風圧流（リーウェイ）とは：エンジンが止まった船などが、海面に出ている船体に風を受けることで、風下の方向へと押し流される現象のこと。"
                              value={activeEvidence.glossaryNote || ""}
                              onChange={(e) =>
                                handleUpdateActiveEvidence((ev) => ({
                                  ...ev,
                                  glossaryNote: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-dashed border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-slate-800 focus:border-slate-500 focus:outline-none"
                            />
                          ) : (
                            <div className="whitespace-pre-wrap text-xs leading-relaxed">
                              {renderColoredGlossaryNote(activeEvidence.glossaryNote || "")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              )
            )}

            {/* ================================================================
                ③ 全体提示される地図や写真（ビジュアル提示ボード）のA4印刷最大化ビュー
               ================================================================ */}
            {category === "visuals" && selectedVisualId === "vis-whale-sonar-qr-guide" && (
              <div className="space-y-8">
                {/* 画面上部タイトル ＆ 右上印刷ボタン行 */}
                <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-slate-500 block">
                      {project.title} ― プレイヤー提示用シート（A4縦・表裏2ページ）
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      『マッコウクジラ音響言語解析システム』（表面：QRコード＆PW ／ 裏面：画面サンプル＆操作説明）
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => printWhaleSonarGuideA4("both")}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      この提示資料（A4・表裏2ページ）を印刷 / PDF保存
                    </button>
                  </div>
                </div>

                {/* ------------------------------------------------------------
                    【1ページ目（表面）プレビュー】：メインタイトル・QRコード・パスワード（A4・1ページ収容・省トナー配色）
                   ------------------------------------------------------------ */}
                <div className="mx-auto max-w-[680px] rounded-xl border-2 border-slate-900 bg-white p-5 shadow-xl space-y-4 print:break-inside-avoid">
                  <div className="rounded-lg bg-sky-50 px-5 py-3.5 text-center text-slate-900 border-2 border-sky-600 border-b-4">
                    <div className="text-[10px] font-extrabold tracking-[0.18em] text-sky-700 mb-0.5">
                      MARINE MAMMAL ACOUSTIC ANALYSIS TERMINAL
                    </div>
                    <h1 className="text-xl font-black tracking-wider text-slate-900">
                      『マッコウクジラ音響言語解析システム』
                    </h1>
                  </div>

                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-sm flex flex-col items-center">
                      <img
                        src={scenarioAssetUrl("releases/images/sonar_qr.png")}
                        alt="マッコウクジラ音響言語解析システム QRコード"
                        className="h-52 w-52 object-contain"
                      />
                      <div className="mt-2 text-xs font-extrabold text-slate-900 tracking-wide">
                        📱 スマートフォンのカメラで読み取ってください
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-cyan-600 bg-cyan-50/80 p-3.5 text-center space-y-1.5">
                    <div className="text-[11px] font-extrabold tracking-widest text-cyan-900">
                      🔑 アクセスパスワード（半角英数字・ハイフンあり）
                    </div>
                    <div>
                      <span className="inline-block rounded-lg border-2 border-cyan-500 bg-white px-6 py-1.5 font-mono text-3xl font-black tracking-wider text-slate-900 shadow-sm">
                        whale-study
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">
                      ※上記のパスワードを入力して「ロック解除」を押すとシステムが起動します
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-3.5 space-y-1.5">
                    <div className="text-xs font-black text-slate-900 border-b border-slate-300 pb-1">
                      【システムへの接続手順と使い方】
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                        1
                      </span>
                      <span>
                        スマートフォンのカメラで上のQRコードを読み取り、専用画面を開いてください。
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                        2
                      </span>
                      <span>
                        パスワード欄に <strong className="font-mono text-sm underline">whale-study</strong> と入力してロックを解除してください。
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                        3
                      </span>
                      <span>
                        詳しい画面の見方と操作方法は、<strong>裏面</strong>をご覧ください。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300 pt-1.5 text-[10px] font-bold text-slate-500">
                    <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（表面）</span>
                    <span>1 / 2</span>
                  </div>
                </div>

                {/* ------------------------------------------------------------
                    【2ページ目（裏面）プレビュー】：操作説明3項目 ＆ 画面サンプル4パート（A4・1ページ収容・省トナー配色）
                   ------------------------------------------------------------ */}
                <div className="page-break-before mx-auto max-w-[680px] rounded-xl border-2 border-slate-900 bg-white p-5 shadow-xl space-y-3 print:break-inside-avoid">
                  <div className="rounded-lg bg-sky-50 px-4 py-2.5 text-center text-slate-900 border-2 border-sky-600 border-b-4">
                    <div className="text-[9.5px] font-extrabold tracking-[0.18em] text-sky-700">
                      SYSTEM OPERATION GUIDE &amp; SCREEN SAMPLES
                    </div>
                    <h2 className="text-lg font-black tracking-wider text-slate-900">
                      『マッコウクジラ音響言語解析システム』画面説明
                    </h2>
                  </div>

                  {/* ご指定のプレイヤー向け説明文（3項目） */}
                  <div className="rounded-lg border-2 border-cyan-600 bg-cyan-50/70 p-3 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>💡 システムの操作方法</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-extrabold text-slate-900 leading-snug">
                      <div className="flex items-start gap-1.5">
                        <span className="text-cyan-700 font-black">●</span>
                        <span>
                          クリック音ボタンを押して海中にクリック音を鳴らすと、それに対するクジラの行動が観察できます。
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-cyan-700 font-black">●</span>
                        <span>
                          別の内容を流すときは、一度流したクリック音をクリアすることをお勧めします。
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-cyan-700 font-black">●</span>
                        <span>
                          言語について想定できたら、日本語を当てはめるボタンを押すことでクリック音を解析していくことができます。
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* スマートフォン画面サンプル枠（4つの主要パーツ・1ページ完全収容） */}
                  <div className="rounded-xl border-2 border-slate-600 bg-slate-50 p-3 text-slate-900 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                      <span className="text-[11px] font-extrabold text-sky-800">
                        📱 スマートフォン画面サンプル（主要4パート）
                      </span>
                      <span className="rounded border border-slate-400 bg-white px-2 py-0.5 text-[9.5px] font-bold text-slate-700">
                        実際の操作画面イメージ
                      </span>
                    </div>

                    {/* ① 時間変化・音響波形ログ */}
                    <div className="rounded-lg border border-slate-300 bg-white p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="rounded-full border border-sky-600 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                          ① 時間変化・音響波形ログ
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">
                          鳴らしたクリック音の波形が時間変化で記録され、再生後も形が残ります
                        </span>
                      </div>
                      <div className="rounded border border-sky-600 bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-2.5 py-1 border-b border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-800">
                          <span>📈 時間変化・音響波形ログ（再生後も形が残ります）</span>
                          <span className="rounded bg-white border border-sky-600 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-800">
                            ▶ もう一度再生
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 600 64"
                          className="w-full h-12 block bg-white"
                        >
                          <line x1="0" y1="16" x2="600" y2="16" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="0" y1="34" x2="600" y2="34" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="52" x2="600" y2="52" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="300" y1="0" x2="300" y2="64" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="12" y="12" fill="#0369a1" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                            1. 音 #01『ゴゴゴゴ…』(海の下の火山)
                          </text>
                          <text x="312" y="12" fill="#0369a1" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                            2. 音 #03『カ・カ・カカッ！』
                          </text>
                          <path
                            d="M 15 34 Q 25 16, 35 34 T 55 34 T 75 34 T 95 34 T 115 34 T 135 34 T 155 34 T 175 34 T 195 34 T 215 34 T 235 34 T 255 34 L 285 34"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="2"
                          />
                          <path
                            d="M 315 34 L 335 34 L 340 13 L 345 56 L 350 34 L 385 34 L 390 13 L 395 56 L 400 34 L 435 34 L 440 11 L 445 58 L 450 16 L 455 52 L 460 34 L 580 34"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* ② クジラの行動観測モニター */}
                    <div className="rounded-lg border border-slate-300 bg-white p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="rounded-full border border-sky-600 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                          ② クジラの行動観測モニター
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">
                          海中にクリック音を流した結果、クジラがどう動いたかが文字で表示されます
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-400 bg-slate-50 p-2 text-center space-y-0.5">
                        <div className="text-[11px] font-extrabold text-slate-900">
                          【クジラの行動観測モニター】
                        </div>
                        <p className="text-[10px] font-semibold text-slate-700 leading-snug">
                          クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、ここにクジラの行動が文字で表示されます。
                        </p>
                      </div>
                    </div>

                    {/* ③ 海中にクリック音を流す（発信）のボタン ＆ クリアボタン */}
                    <div className="rounded-lg border border-slate-300 bg-white p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="rounded-full border border-sky-600 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                          ③ 発信ボタン ＆ クリア操作
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">
                          選んだ音を海中に流します（別の内容を流す時は「クリア」を押します）
                        </span>
                      </div>
                      <div className="space-y-1.5 rounded-lg border border-slate-300 bg-slate-50 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-sky-800">
                            発信するクリック音パターン（2語ごと判定）
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="rounded border border-slate-500 bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold text-slate-800">
                              ⌫ 1つ戻す
                            </span>
                            <span className="rounded border border-amber-600 bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-900">
                              ↺ クリア
                            </span>
                          </div>
                        </div>
                        <div className="rounded border border-slate-300 bg-white p-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-indigo-50 border border-indigo-600 px-2 py-0.5 text-[11px] font-extrabold text-indigo-950">
                            <span className="text-[9.5px] font-mono text-sky-700 mr-1">1.</span>
                            海の下の火山
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">＋</span>
                          <span className="rounded bg-indigo-50 border border-indigo-600 px-2 py-0.5 text-[11px] font-extrabold text-indigo-950">
                            <span className="text-[9.5px] font-mono text-sky-700 mr-1">2.</span>
                            音 #03（カ・カ・カカッ！）
                          </span>
                        </div>
                        <div className="w-full rounded-lg border-2 border-sky-600 bg-sky-100 py-1.5 px-3 text-center text-[11px] font-black text-slate-900 shadow-sm">
                          🔊 海中にクリック音を流す（発信）
                        </div>
                      </div>
                    </div>

                    {/* ④ クリック音ボタンのサンプル（音 #01 と 音 #03） */}
                    <div className="rounded-lg border border-slate-300 bg-white p-2.5 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="rounded-full border border-sky-600 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                          ④ クリック音ボタンのサンプル
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">
                          左：最初から意味が判明している音 ／ 右：未解明の音（日本語をあてはめ可能）
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* 音 #01：ゴゴゴゴ…（海の下の火山） */}
                        <div className="rounded-lg border-2 border-amber-600 bg-slate-50 p-2 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-white border border-slate-500 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-sky-800">
                                音 #01
                              </span>
                              <span className="rounded bg-sky-100 border border-sky-600 px-1.5 py-0.5 text-[9.5px] font-extrabold text-sky-800">
                                🔊 試聴
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] font-black text-amber-900">
                              『ゴゴゴゴ…』
                            </div>
                            <div className="mt-0.5">
                              <span className="inline-flex items-center gap-1 rounded bg-amber-100 border border-amber-600 px-1.5 py-0.5 text-[10px] font-black text-amber-900">
                                🔒 海の下の火山
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 pt-1 border-t border-slate-300 text-[9.5px] font-extrabold text-amber-800">
                            ✔ 朝倉教授記録により確定
                          </div>
                        </div>

                        {/* 音 #03：カ・カ・カカッ！（未解明） */}
                        <div className="rounded-lg border-2 border-slate-400 bg-slate-50 p-2 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-white border border-slate-500 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-sky-800">
                                音 #03
                              </span>
                              <span className="rounded bg-sky-100 border border-sky-600 px-1.5 py-0.5 text-[9.5px] font-extrabold text-sky-800">
                                🔊 試聴
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] font-black text-amber-900">
                              『カ・カ・カカッ！』
                            </div>
                            <div className="mt-0.5 text-[10px] font-extrabold text-slate-600">
                              【未解明：？？？】
                            </div>
                          </div>
                          <div className="mt-1.5 pt-1 border-t border-slate-300">
                            <div className="w-full rounded bg-indigo-50 border border-indigo-600 py-0.5 px-2 text-center text-[9.5px] font-black text-indigo-950">
                              🏷️ 日本語をあてはめる
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300 pt-1.5 text-[10px] font-bold text-slate-500">
                    <span>
                      マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（裏面：画面サンプル＆操作案内）
                    </span>
                    <span>2 / 2</span>
                  </div>
                </div>
              </div>
            )}
            {category === "visuals" &&
              selectedVisualId !== "vis-whale-sonar-qr-guide" &&
              activeVisual &&
              (() => {
              const isWithMargin =
                visualMarginOverrides[activeVisual.id] ??
                activeVisual.hasWhiteMargin ??
                (activeVisual.id === "vis-day2-aerial");
              return (
                <div className="space-y-6">
                  {/* 証拠資料と同じ形式の白いシート上部タイトル ＆ 右上印刷ボタン行 */}
                  <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-slate-500 block">
                        {project.title} ― 全体提示の地図・写真（{activeVisual.dayNumber === 0 ? "全域" : `Day ${activeVisual.dayNumber}`}）
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {activeVisual.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 白い余白切り替えボタン（シンプル統一） */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextMargin = !isWithMargin;
                          setVisualMarginOverrides((prev) => ({
                            ...prev,
                            [activeVisual.id]: nextMargin,
                          }));
                          handleUpdateActiveVisual((v) => ({
                            ...v,
                            hasWhiteMargin: nextMargin,
                          }));
                        }}
                        className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                      >
                        {isWithMargin ? "🖼️ 現在：白い余白あり" : "🖼️ 現在：全面最大（余白なし）"}
                      </button>

                      {/* 証拠資料と同一位置・同一色の個別A4印刷ボタン */}
                      <button
                        type="button"
                        onClick={handlePrintDesignedSheet}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        この図・写真をA4印刷 / PDF保存
                      </button>

                      {/* 全19枚の地図・写真を一括でPDF保存・印刷するボタン（個人向けハンドアウトの一括印刷と同形式） */}
                      <button
                        type="button"
                        onClick={handlePrintAllVisualBoards}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        全{visualBoards.length}枚の図・写真を一括A4印刷 / PDF保存
                      </button>
                    </div>
                  </div>

                  {/* A4プレビューキャンバス（デザイン枠や余計な文字を完全排除し、画像のみをA4比率で最大表示） */}
                  <div className="flex justify-center py-2">
                    <div
                      className="relative w-full max-w-[700px] aspect-[210/297] bg-white shadow-2xl rounded-sm overflow-hidden flex items-center justify-center border border-slate-300"
                      style={{ aspectRatio: "210 / 297" }}
                    >
                      {activeVisual.imageUrl ? (
                        visualOrientation === "landscape_rotated" ? (
                          /* 横長画像を90度回転させてA4縦（210mm × 297mm）にプレビュー（余白あり時は88%に縮小） */
                          <div
                            className="absolute flex items-center justify-center overflow-hidden"
                            style={{
                              width: isWithMargin ? "calc(88% * 297 / 210)" : "calc(100% * 297 / 210)",
                              height: isWithMargin ? "calc(88% * 210 / 297)" : "calc(100% * 210 / 297)",
                              transform: "rotate(90deg)",
                              transformOrigin: "center center",
                            }}
                          >
                            <img
                              src={activeVisual.imageUrl}
                              alt={activeVisual.title}
                              className={`max-w-full max-h-full w-full h-full object-contain select-none pointer-events-none ${
                                isWithMargin ? "shadow-md" : ""
                              }`}
                            />
                          </div>
                        ) : (
                          /* 通常向き（回転なし）プレビュー（余白あり時は88%に縮小） */
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isWithMargin ? "p-8" : "p-2"
                            }`}
                          >
                            <img
                              src={activeVisual.imageUrl}
                              alt={activeVisual.title}
                              className={`${
                                isWithMargin
                                  ? "max-w-[88%] max-h-[88%] shadow-md"
                                  : "max-w-full max-h-full"
                              } w-full h-full object-contain select-none pointer-events-none`}
                            />
                          </div>
                        )
                      ) : (
                        <div className="text-center p-8 text-slate-400 text-sm">
                          画像が設定されていません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* ================================================================
                ④ GM用の進行資料（成功・失敗分岐フローチャート ＆ フェーズ別進行表）
               ================================================================ */}
            {category === "gm_guides" && activeTimelineStep && (
              gmGuideViewMode === "flowchart" ? (
                <div className="space-y-6">
                  {/* 証拠資料と同一形式の上部タイトル ＆ 右上印刷ボタン行（フローチャート用1つ） */}
                  <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-slate-500 block">
                        {project.title} ― GM進行資料（A4・1枚完結 成功・失敗分岐フローチャート）
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        Day 1〜Day 7 成功・失敗分岐フローチャート図
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrintDesignedSheet}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        フローチャートを印刷 / PDF保存（A4・1枚）
                      </button>
                    </div>
                  </div>

                  {/* A4・1枚完結の視覚的成功・失敗分岐フローチャート図 */}
                  <GmOnePageFlowchart
                    projectTitle={project.title}
                    selectedDay={selectedGmDay}
                    onSelectDay={setSelectedGmDay}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 証拠資料と同一形式の上部タイトル ＆ 右上印刷ボタン行（進行資料一括印刷用1つ） */}
                  <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-slate-500 block">
                        {project.title} ― GM進行資料（Day {activeTimelineStep.dayNumber} 進行台本＆管理シート）
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        Day {activeTimelineStep.dayNumber}：{activeTimelineStep.situationTitle}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintAllGmProgressionSheets(activeTimelineStep.dayNumber)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        このDay {activeTimelineStep.dayNumber} のみを印刷 / PDF保存
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintAllGmProgressionSheets()}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        進行資料を一括印刷 / PDF保存（Day 1〜7）
                      </button>
                    </div>
                  </div>

                  {/* ============================================================
                      【GM進行資料】：フェーズ開始条件・長津アナウンス囲み枠・12px文字サイズ対応
                     ============================================================ */}
                  <div className="space-y-4 text-[12px]">
                    {/* 🎙️ GM立ち位置・役柄ガイダンスバナー */}
                    <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-[12px] text-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[12px]">
                          <Radio className="h-4 w-4 text-indigo-600 shrink-0" />
                          🎙️ GM役柄・進行方式：【6名時：GMが長津を担当 ／ 7名時：PC7が長津を担当】
                        </span>
                        <span className="text-[12px] text-slate-700">
                          ｜ 各Day開始時に朝潮（PC1）へ『Day別指令シート』を手渡し、朝潮の指揮で会議を開始させます
                        </span>
                      </div>
                    </div>

                    {/* GM進行ヘッダー帯（スレートダークで統一） */}
                    <div className="rounded-md p-4 bg-slate-900 text-white shadow">
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex-1 min-w-[260px]">
                          <span className="block text-[12px] uppercase tracking-wider text-slate-300">
                            Day {activeTimelineStep.dayNumber} 状況タイトル
                          </span>
                          <h1 className="mt-0.5 text-lg font-bold leading-tight">
                            {activeTimelineStep.situationTitle}
                          </h1>
                        </div>

                        <div className="flex items-center gap-4 text-[12px] shrink-0">
                          <div>
                            <span className="block text-[12px] uppercase tracking-wider text-slate-300">
                              観測地点
                            </span>
                            <div className="mt-1 text-sm font-semibold">
                              {activeTimelineStep.locationName}
                            </div>
                          </div>

                          <div className="border-l border-white/25 pl-4">
                            <span className="block text-[12px] uppercase tracking-wider text-slate-300">
                              目標進行時間
                            </span>
                            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                              <Clock className="h-3.5 w-3.5 text-indigo-300" />
                              <strong>{activeGmNote.targetMinutes}</strong>
                              <span>分</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BGM・音響演出キュー枠 */}
                    <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-[12px] text-slate-800">
                      <Volume2 className="h-4 w-4 text-indigo-700 shrink-0" />
                      <span className="font-bold shrink-0">演出・BGMキュー:</span>
                      <span>{activeGmNote.bgmCue}</span>
                    </div>

                    {/* 📢 フェーズ別 進行・アナウンス一覧（開始タイミング・長津囲み枠・GM案内） */}
                    {(() => {
                      const structuredPhases =
                        GM_DAY_STRUCTURED_PHASES[activeTimelineStep.dayNumber] || [];
                      if (structuredPhases.length === 0) {
                        return (
                          <div className="rounded-md border-2 border-slate-800 bg-slate-50/50 p-4">
                            <div className="whitespace-pre-wrap text-[12px] font-semibold leading-relaxed text-slate-900 bg-white p-4 rounded border border-slate-200 select-text">
                              {activeGmNote.readAloudScript}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-4">
                          {structuredPhases.map((ph, pIdx) => (
                            <div
                              key={pIdx}
                              className="rounded-lg border-2 border-slate-800 bg-white p-4 space-y-3 shadow-sm"
                            >
                              {/* フェーズ見出し */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-slate-900 px-2.5 py-0.5 text-[12px] font-extrabold text-white">
                                    {ph.phaseNumber}
                                  </span>
                                  <span className="text-[13px] font-extrabold text-slate-900">
                                    {ph.phaseTitle}
                                  </span>
                                </div>
                              </div>

                              {/* ⏱️ 開始タイミング・発生条件 */}
                              <div className="rounded border border-amber-400 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-950">
                                ⏱️ 開始タイミング・発生条件：{ph.startTrigger}
                              </div>

                              {/* 📦 配布・提示資料 */}
                              {ph.handoutBadges && ph.handoutBadges.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[12px] font-extrabold text-slate-700">
                                    📦 配布・提示：
                                  </span>
                                  {ph.handoutBadges.map((badge, bIdx) => (
                                    <span
                                      key={bIdx}
                                      className="rounded border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-900"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* 📡 オペレーター（長津）のアナウンス（太枠囲み） */}
                              {ph.nagatsuAnnouncements &&
                                ph.nagatsuAnnouncements.map((ng, nIdx) => (
                                  <div
                                    key={nIdx}
                                    className="rounded-lg border-2 border-indigo-700 bg-indigo-50/80 p-3.5 space-y-2 shadow-sm"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-1.5">
                                      <span className="inline-flex items-center gap-1.5 rounded bg-indigo-800 px-2.5 py-0.5 text-[12px] font-bold text-white">
                                        📡 【オペレーター（長津）からの案内】
                                      </span>
                                      <span className="text-[12px] font-bold text-indigo-950">
                                        ✅ {ng.sourceLabel}
                                      </span>
                                    </div>
                                    <div className="whitespace-pre-wrap text-[12px] font-bold leading-relaxed text-slate-900 bg-white p-3 rounded border border-indigo-300 select-text">
                                      {ng.text}
                                    </div>
                                  </div>
                                ))}

                              {/* 📢 GMからのアナウンス・NPCロールプレイ・条件分岐 */}
                              {ph.gmAnnouncements && ph.gmAnnouncements.length > 0 && (
                                <div className="space-y-2.5">
                                  {ph.gmAnnouncements.map((ga, gIdx) => {
                                    const toneStyle =
                                      ga.tone === "emerald"
                                        ? "border-emerald-600 bg-emerald-50/70"
                                        : ga.tone === "amber"
                                        ? "border-amber-600 bg-amber-50/70"
                                        : ga.tone === "rose"
                                        ? "border-rose-600 bg-rose-50/70"
                                        : "border-slate-500 bg-slate-50";
                                    return (
                                      <div
                                        key={gIdx}
                                        className={`rounded-lg border-2 ${toneStyle} p-3.5 space-y-1.5`}
                                      >
                                        {ga.branchBadge && (
                                          <div className="text-[12px] font-extrabold text-slate-900">
                                            {ga.branchBadge}
                                          </div>
                                        )}
                                        <div className="text-[12px] font-bold text-slate-800">
                                          {ga.speakerLabel}
                                        </div>
                                        <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-900 bg-white p-3 rounded border border-slate-300 select-text">
                                          {ga.text}
                                        </div>
                                        {ga.cardActionNote && (
                                          <div className="text-[12px] font-bold text-indigo-950 bg-indigo-100/70 border border-indigo-300 rounded px-3 py-1.5">
                                            {ga.cardActionNote}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* 📋 GM進行ガイド・注意事項 */}
                              {ph.gmGuides && ph.gmGuides.length > 0 && (
                                <div className="rounded border border-slate-300 bg-slate-50 p-3 space-y-1">
                                  {ph.gmGuides.map((guide, gIdx) => (
                                    <div
                                      key={gIdx}
                                      className="text-[12px] leading-relaxed text-slate-800 font-medium"
                                    >
                                      ・{guide}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* ✅ GM進行チェックポイント */}
                    <div className="rounded-md border border-slate-300 p-4 bg-white shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                          Day {activeTimelineStep.dayNumber} GM進行チェックリスト
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {(activeGmNote.gmCheckpoints || []).map((chk, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[12px] text-slate-800">
                            <span className="mt-1 inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
