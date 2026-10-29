"use client";

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
import { printCharacterHandoutsB5 } from "@/utils/scriptGenerator";
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
  onUpdateProject: (updater: MMProject | ((prev: MMProject) => MMProject)) => void;
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

// GM演出用ナレーション ＆ NPCセリフ台本（各Day初期値：合同対策本部 首席オペレーター 長津視点）
const DEFAULT_GM_NARRATIONS: Record<number, string> = {
  1: `【フェーズ1：緊急回線接続 ＆ 各員自己紹介】
（🎙️ 首席オペレーター 長津）:
「――東京本部および小笠原現地チームへ緊急入信。当回線は海上保安庁・関係機関合同の緊急対策回線です。小笠原南西沖にて民間チャーター船『パパズドルフィン（総トン数約40t）』が突如全電源を喪失、AIS（自動船舶識別装置）も停波し、救難信号を発信した直後に通信が途絶いたしました。救難信号の発信から現在20分が経過しております。これより合同海難救助チームを開設します。朝潮危機管理官をはじめ各員、氏名・所属・現場で担える専門役割の点呼および自己紹介をお願いいたします」

【フェーズ2：遭難海図展開 ＆ 漂流捜索方針の決定】
（🎙️ 首席オペレーター 長津）:
「――救難信号の発信から現在20分が経過しております。大型スクリーンに【漂流海図】を展開いたしました。朝潮危機管理官（PC1）、坂凪救難担当官（PC3）、太刀魚観測員（PC4）、浪寄准教授（PC5）をはじめ各員、救難艇が現場海域に到着するまでの所要時間や暗礁群の配置、風・海流を考慮し、到着時点での漂流位置を推測して急行させるべき捜索海域の決定をお願いいたします」

【フェーズ4：救助判定 ＆ 成否分岐アナウンス（最大2回まで指定可能）】

▼ 🟢 分岐1：1回目の指定で【東北東の漂流予測海域】を正解した場合（失敗0回 ➔ 証言2つとも取得）
（🎙️ 首席オペレーター 長津 / NG-01）:
「――坂凪救難担当官率いる現場救難艇より入電！ 東北東の漂流予測海域へ全速到達、暗礁群をすり抜け激しく漂流する遭難船『パパズドルフィン』を捕捉・接舷！ 初瀬救護担当（PC6）も収容準備願います。荒波の中で間一髪、船長とダイバーたちの全員救出に成功いたしました！」
※ペナルティなし：【EV-08：船長の証言】と【EV-07：大型冷凍ボックス（ダイバーの証言）】の2つともその場で開示・配布します。

▼ 🟡 分岐2：1回目の指定が外れた場合（もう一度だけ地点を再指定［リトライ］可能）
（🎙️ 首席オペレーター 長津）:
「――現場救難艇より至急電！ 指定された海域へ到着しましたが、激しい波浪と視界不良のなか船影を発見できません！ このままでは暗礁群へ流されます！ もう一度だけ、海流と風圧流、そして救難信号からの経過時間（20分＋航行40分＝合計1時間）を再計算し、急行すべき海域を再指定してください！」

  ├─ 🟡 2回目の指定で正解した場合（失敗1回 ➔ Day 1では証言を【1つだけ】取得、残り1つはDay 2以降の調査枠へ）
  （🎙️ 首席オペレーター 長津）:
  「――現場救難艇より入電！ 再指定された東北東の海域にて、暗礁群スレスレを漂流する遭難船を発見・救助に成功しました！ ただし捜索に時間を要したため、本日中に聴取・確認できるのは【船長の証言（EV-08）】または【ダイバーの大型冷凍ボックス（EV-07）】のどちらか1つだけとなります！（残る1つは明日Day 2以降の調査カードとして取得可能になります）」

  └─ 🔴 2回目の指定も外れた場合（失敗2回 ➔ 自動的に救助成功、ただしDay 1での証言取得は【0個】・2つともDay 2以降の調査枠へ）
  （🎙️ 首席オペレーター 長津）:
  「――現場救難艇より入電！ 指定海域からは外れておりましたが、東北東の暗礁群手前を漂流していた遭難船を現場隊が目視で辛うじて発見し、緊急曳航・救助に成功いたしました！ しかし、救助作業と荒天対応に全力を割いたため、本日の現場聴取は打ち切りとなります。船長およびダイバーに関する2つの証言記録（EV-08・EV-07）は、明日Day 2以降の調査カードとして取得可能になります！」

【NPC 船長（EV-08「船長の証言」取得時）】:
民間チャーター船「パパズドルフィン」の船長からの事情聴取調書。船長は荒波で不安定な足場でもしっかりとした足取りで救難艇へと乗り込んできた。
「お世話をかけますが、船は二見港まで曳航いただけますか。お客さんが怪我なくて、とにかく助かってよかった。船はスクリューが何かに巻き付かれたように故障して、計器類も電源も壊れてお手上げになっちゃったんだ。船の下に何かいたみたいだけど、あれはクジラなんかじゃないと思うねぇ。クジラなら潮吹きや潜水の際の尾が見えたりという行動があるもんだけど、そんな様子はなかったんでね」
「今日乗せたダイバーたちはこの1ヶ月前ぐらいから頻繁にダイブを繰り返していて、だいぶ手慣れた様子だった。あのあとすぐに帰ると言っていたよ。海は怖いねぇ、あとでちょっと神社にお参りしてくるようにするよ」

【NPC 謎のダイバーグループ（EV-07「大型冷凍ボックス」取得時）】:
救助された謎のダイバーグループは、酸素ボンベなどの装備は船に残したまま、魚釣り用の少し大型のプラスチック製冷凍ボックス（クーラーボックス）を抱えて救難艇に乗り込んできた。海から引き揚げて箱に入れられるサイズだが、重さ約30kgほどのずっしりとした異常な重量感があった。
「助かりました。船の下に何かいたみたいですね、ただの大型クジラですよ。この箱ですか？ 近辺での魚の生態調査で採集した魚が入っているんです。大変でしたがこれで目的のものが無事に収集できましたので、これ以上皆様にご迷惑をおかけすることはありません。この便を逃すとしばらく戻れないですからね」
そう言い残し、彼らは直後に出港した定期船「おがさわら丸」で箱と共に小笠原諸島を去っていった。`,

  2: `【フェーズ1：状況通達 ＆ 緊急チーム維持命令】
（🎙️ 首席オペレーター 長津）:
「長津です。皆様、お疲れ様です。気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です。現場海域の船舶の避難は完了していますが、新しい指示がでています。
西之島周辺海域を中心として『火山性の地殻振動』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に一度に手を回す余裕はありませんので、優先度を決めて調査をお願いします。」

【GMからの案内（Day 1の失敗ペナルティ繰越対応を含む）】:
「今回の調査では、東京本部側では3つの調査項目から1つ、小笠原現地では4つの調査項目（※Day 1で未取得の証言カードがある場合はそれも加えた項目）から2つを選ぶことができます。このタイミング以降では選択されなかった情報は、あとのタイミングの行動で調べることができます」

【GM演出上の最重要注意（ネタバレ防止メモ）】
※このDay 2の段階では、「ダイオウイカの超群体である」という正体は絶対に明かさないでください。プレイヤーたちには「ダイオウイカの触手のはずなのに、なぜ数百mもの超巨大な影なのか？」「海底火山を噴火させながら北上しているものは一体何なのか？」という強烈なサイズ矛盾とサスペンスを抱かせ、議論を深めてもらいます。`,

  3: `【フェーズ1：鳥島沖海底大噴火 ＆ 緊急洋上捜索命令】
（🎙️ 首席オペレーター 長津）:
「――小笠原基地より小笠原現地メンバーを乗せた大型捜索ヘリが緊急発進いたしました。鳥島沖での探索活動を行うため、巡視船『あきつしま』で洋上給油を行い、鳥島沖の噴火海域でアクティブソナー付きのソノブイ（計3基）を投下して巨大生物の現在位置を特定してください」

【フェーズ2：アクティブソノブイ調査終了後の状況案内 ＆ 北上予測要請（長津アナウンスカード NG-02）】
（🎙️ 首席オペレーター 長津）:
「――洋上捜索ヘリより入電！ アクティブソナーにより鳥島沖の深海で巨大生物の現在位置を捕捉いたしました！ なお、これまでの海底噴火の時刻と巨大生物の動きには明確な関連があるように思えます。もしこのまま北上した場合、この先どうなるか検討が必要です。各員のデータから物体の移動スピードを算出し、明日（Day 4）はどのあたりまで北上するか予想を出してください！」
※ここで太刀魚（EV-16: 西之島〜鳥島沖 距離観測データ）、貝浜（EV-17: 鳥島沖 ソノブイ探知記録）、浪寄（EV-18: 遭難船救助・目撃時刻調書）の3名へそれぞれ証拠資料を配布し、移動速度（約150km/日）と明日（Day 4）の北上予測（明神礁周辺）を検討させてください。
※GM進行メモ（失敗時の影響について）：もしプレイヤーが移動速度やDay 4到達予測地点の計算をミスしても、物語上大きな影響やペナルティは出ません（翌Day 4冒頭の明神礁噴火の事実によって自然に軌道修正されます）。

【フェーズ5：写真データ受信 ＆ 合同対策本部への諮問（長津アナウンスカード NG-03）】
（🎙️ 首席オペレーター 長津）:
「――洋上捜索ヘリより至急電！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大質量、そして20本以上の無数の触手群を確認！ 現場の海上保安庁警備救難部より、当合同対策チームへ緊急の諮問が下されております」

① 海上保安庁 ➔ 浪寄准教授（PC5: 海洋生物学者）への相談:
「浪寄准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大質量について、生物学的な所見を提示してください」

② 海上保安庁 ➔ 貝浜リエゾン（PC2: 防衛省リエゾン）への要請:
「貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則ではこの規模の目標に対処不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」

【防衛庁・官邸からの緊急諮問：呼称（コードネーム）決定と指揮官最終決断の要請（長津アナウンスカード NG-04）】
（🎙️ 首席オペレーター 長津）:
「――防衛庁および内閣官房より至急諮問が入電！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当対策チームで決定してほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、朝潮危機管理官、指揮官として自衛隊への防衛出動を要請するか、または海上警備行動を発令するか最終意思決定をお願いいたします！」
※チームで合議させ、以降はこの決定したコードネームを用いて呼称させます（防衛出動／警備行動のどちらを選んでもDay 4終盤で同じ結果へ合流します）。`,

  4: `【フェーズ1：明神礁海底噴火 ＆ 火山活動・地震観測報告】
（🎙️ 首席オペレーター 長津）:
「――各員へ緊急報告です。未明、鳥島沖の北方に位置する【明神礁】周辺にて新たな海底噴火が発生。さらに八丈島および青ヶ島の地震計が火山性微動を断続的に探知しています。防衛庁のパッシブソナーによる潜航物体の位置と火山性微動の発生源は完全に一致しており、物体は【日速約150km】で正確に北上を続けています。政府および防衛庁より『この生物は一体どこへ向かい、何を引き起こす見立てなのか、対策本部の専門的予測を至急提出してほしい』との緊急照会が入っています。なお事態の緊迫化を受け、本日より当対策本部は調査枠制限を撤廃する【即応総力体制】へ移行します！」

【フェーズ2：前日の意思決定に応じた政府・防衛省の反応通達（分岐）】

▼ パターンA：前日に「自衛隊へ攻撃（防衛出動）を依頼した」場合
（🎙️ 首席オペレーター 長津）:
「――昨日、朝潮危機管理官より上申された防衛出動要請について、官邸危機管理センターおよび内閣総理大臣より公式通達が入電しました。『海底噴火と未確認潜航物体との因果関係が科学的に立証されておらず、外国からの武力攻撃事態にも該当しないため、現段階での自衛隊部隊の出動は見送る。海上保安庁は引き続き警戒および情報収集にあたれ』……内閣による防衛出動は見送りと決定されました。しかし、防衛庁・海上幕僚監部からは『内閣を再説得するためにも、この生物が一体どこへ向かい、何を引き起こす見立てなのか、対策本部の専門的予測を至急提出してほしい』との緊急打診が入っております」

▼ パターンB：前日に「自衛隊へ攻撃を依頼しなかった（見送った）」場合
（🎙️ 首席オペレーター 長津）:
「――防衛庁運用企画局および海上幕僚監部より、合同対策本部へ緊急照会が入電いたしました。『対策本部が防衛出動の要請を見送った判断は了解した。しかし、自衛隊としても伊豆諸島の連続噴火と潜航物体を国家安全保障上の重大な懸念と捉えている。この生物は一体どこへ向かっている見立てなのか？ 最終到達予測地点に関する対策本部の専門的意見を至急提出されたし』との照会です」

【フェーズ3：即応総力体制への移行 ＆ 全情報の一括開示アナウンス】
（🎙️ 首席オペレーター 長津）:
「――物体は日速約150kmで北上中、このままでは数日中に伊豆諸島マグマ網を経て富士山直下に到達し、破局的連動噴火を誘発する恐れがあります！ 国家存亡の危機を受け、当合同対策本部はこれより【即応総力体制】へ移行いたします！ これまでの調査枠制限をすべて撤廃し、東京本部および小笠原現地の各班が収集したすべての重要調査資料（都内・元神主の子どもの捜索、朝倉教授の研究日誌・野帳、小笠原社記原本など）を一括して全開示いたします！ 各員、総力を結集して情報の照合と真相の解明を急いでください！」

【フェーズ4：最終目的地の結論分岐（「富士山」 vs 「東京湾」）】
※対策本部として、巨大生物の最終目的地が【富士山（駿河湾）】か【東京湾】かを結論づけさせます。
・🟢「富士山（駿河湾）」と結論づけた場合：自衛隊が三宅島〜御蔵島沖の最適ラインへ遅滞なく展開します。
・🟡「東京湾」と結論づけた場合：機械的なペナルティはありませんが、自衛隊の主力部隊が東京湾側へ展開してしまうため攻撃が遅れ、翌Day 5では【より駿河湾に近い位置】で攻撃することになります。さらに【Day 6の岸部局長との交渉で嫌味を言われる】ことになります。

【フェーズ5：防衛省・統合幕僚監部通達（害獣駆除方針決定・長津アナウンスカード NG-05）】
（🎙️ 首席オペレーター 長津）:
「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊全部隊の動員を正式決定いたしました！ 通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」`,

  5: `【フェーズ1：民間放送局の臨時ニュース（富士山地下微動 ＆ 伊豆七島避難準備指示）】
（🎙️ 首席オペレーター 長津）:
「――民間放送局の臨時ニュースをお伝えします。『伊豆諸島を北上する連続海底噴火と群発地震を受け、気象庁は富士山地下深部において微弱な火山性微動が観測されたと発表しました。政府は万一に備えて災害対策本部を設置しており、速報として「伊豆七島の活火山について噴火警戒レベルを【レベル3（入山規制）】に引き上げ、さらに【レベル4（避難準備）】に上がった場合に備えて島民へ避難準備を指示したこと、また富士山については突然の噴火が起きたとしてもただちに避難が必要となることはない」という声明を発表しています。この後、9時からは専門家を呼んでこの連鎖噴火の影響について議論を深めていきます』」

【フェーズ1.5：防衛庁・火山噴火予知連絡会からの至急指令「富士山噴火猶予時間の計算」】
（🎙️ 首席オペレーター 長津）:
「――防衛庁および火山噴火予知連絡会より至急指令が入電！『駿河湾奥までの残距離は【約240km】、現在の巡航速度は【時速5km】。危機到達まであと何時間の猶予があるのか直ちに計算して報告せよ！』とのことです！ 各員、至急計算をお願いします！」

【フェーズ2：防衛省通達（軍事機密指定による情報遮断）】
（🎙️ 首席オペレーター 長津）:
「――防衛省より緊急回線で入電。『これより自衛隊が実施する実弾迎撃作戦は【最高軍事機密】に移行する。交戦状況に関する情報提供はここを以て遮断する。対策本部は作戦干渉を解かれ、独自の調査任務に戻られたし』との通達です」

【フェーズ3：防衛省より貝浜（PC2）への緊急ホットライン（長津アナウンスカード NG-06）】
（🎙️ 首席オペレーター 長津）:
「――暗号ホットラインに着信！ 貝浜リエゾン（PC2）へ、防衛省作戦本部より直通無線が接続されました！」

※【Day 4で「東京湾」と結論づけていた場合の追加描写】：
「（防衛省作戦本部）：昨日、対策本部が『目標は東京湾へ向かう』と結論づけたため、我が海自部隊は東京湾防衛ラインへ展開していたが、目標が三宅島から西の駿河トラフへ変針したため急遽転進せざるを得ず、迎撃が大幅に遅れ【より駿河湾に近い位置】での攻撃となった！」

【防衛省作戦本部】:
「――貝浜、防衛省作戦本部だ！ 魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。しかし、目標が発している特有の振動が起きておらず、それにあわせて火山性の周期的な微動が収まっていることを確認できている。アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが、疑問が残る。浪寄准教授（PC5）の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ なぜ富士山を目指すのか？！」`,

  6: `【朝8時ブリーフィング：巨大生物の完全回復・北上再開 ＆ 富士山微動再開】
（🎙️ 首席オペレーター 長津）:
「――予想通りというべきか、本日の【朝8時】の時点で巨大生物がほとんど同じ大きさまで回復。駿河トラフ境界に向けて北上を再開しています。それにあわせて【富士山地下の火山性微動が再開】しました。駿河湾までは【24時間ほどで到達する見込み】で、防衛庁からは速やかに対策をまとめるようにと指示がでています。なお、東京班が徹夜で回収した残りの捜査資料と、朝倉教授の遺品である実録音響データをすべて開示します！」

【GM進行メモ：クジラ言語の解読時間と『狂気の深淵を覗く』使用時の5分延長ルール】
※クジラ言語アプリを用いた新言語祝詞（2語×4組）の解読・組み立て時間は【目安15分】です。
※もし解読の途中でプレイヤーがアプリ内の【狂気の深淵を覗き込み、クジラの言語をより理解する】ボタンを押した場合は、すべての言語（全24語）の意味が判明しますが、それを全員で共有して構文（2語×4組）に組み立てる時間が必要になるため、解読の制限時間を【5分延長】してください。

【長津の電話交渉前アナウンス（新言語祝詞の音声完成後・Day 6 途中① 指令書 ＆ SP-07連動）】
（🎙️ 首席オペレーター 長津）:
「――クジラを呼び寄せる新言語祝詞の音声が完成しましたね！ しかし、防衛庁の上層部は『さらなる魚雷の飽和攻撃』の準備を進めており、通常のルートで上申しても潜水艦で祝詞の音声を流すような作戦は到底承認されません。……朝潮危機管理官、皆さん、実は防衛庁で自衛隊部隊の運用を統括する最高責任者・【運用企画局長の岸部（きしべ）】は私の親戚（叔父）にあたりまして、直通の連絡先を持っています。厳格な現実主義者ですが、科学的な根拠と計算に基づく進言であれば耳を傾けてくれるはずです。準備が整い次第、回線を繋ぎますので直接説得を頼みます！」

【防衛庁 運用企画局長・岸部（きしべ）との直接電話交渉】
（ツーツーツー……ガチャッ）

▼ 🟢 通常時（Day 4で「富士山」と結論づけていた場合）の第一声：
（🎙️ 防衛庁 運用企画局長・岸部）:
「――防衛庁運用企画局長の岸部だ。長津からの緊急回線とはな……合同対策本部の諸君、こんな深夜に一体何の用件だね？」

▼ 🟡 分岐演出（Day 4で「東京湾」と結論づけていた場合）の嫌味入り第一声：
（🎙️ 防衛庁 運用企画局長・岸部）:
「――防衛庁運用企画局長の岸部だ。……ほう、一昨日は『巨大生物は東京湾へ向かう』と報告して我が海上自衛隊の展開を遅らせ、結果として駿河湾の目と鼻の先まで押し込まれる原因を作った対策本部の諸君か。その節は実に貴重なご高説をありがとう。で、こんな深夜に今度は一体どんな名案を持ってきたというのだね？」

【岸部局長の反論による思考誘導スクリプト（重要：岸部局長は愚かではなく、反論によってプレイヤーに解答を導き出させる）】
※プレイヤーが「クジラの祝詞（コーダ配列）」を提示して説得を試みた際、もし以下の条件（SOFAR層・移動時間）が抜けていた場合は、岸部局長が鋭く反論してプレイヤーに考えさせます。

  ├─ ⚠️ 反論誘導①：「なぜ通常兵器ではなくクジラなのか？」が曖昧な場合
  （🎙️ 岸部局長）：
  「海自の魚雷で仕留めきれなかったのは事実だ。だが、だからといって古文書の祝詞でクジラを呼ぶだと？ なぜ大量の魚雷による飽和攻撃ではなく、クジラでなければならんのだ？！」
  ➔ プレイヤーから「魚雷の爆発衝撃は海底マグマを刺激して富士山噴火を誘発する危険があること」「ダイオウイカの天敵はマッコウクジラであること」を引き出す。

  ├─ ⚠️ 反論誘導②：「音響層（水深1,000mのSOFAR層／潜水艦）」が抜けていた場合
  （🎙️ 岸部局長）：
  「待て。その祝詞とやらがクジラを呼ぶ信号だとして、一体どうやって広大な太平洋にいるクジラへその音を届けるつもりだ？！ 海面や浅い海からスピーカーで音を出したところで、水中の音は数キロ先で減衰して消えるぞ！ 何百キロも先のクジラにまで音を届ける具体的な『海の層』と『手段』を示せ！」
  ➔ この反論により、プレイヤー（太刀魚・貝浜ら）に考えさせ、【水深1,000mのSOFAR層（深海音響チャネル）まで潜水艦で潜航して大出力放流する（＋クジラの共鳴リレー）】という解答を導き出させる！

  └─ ⚠️ 反論誘導③：「移動時間（クジラが集まるのに6〜8時間＝今夜送信が必要）」が抜けていた場合
  （🎙️ 岸部局長）：
  「潜水艦で深海から音を流す理屈はわかった。だが、なぜ『今夜、この深夜』のうちに緊急で潜水艦を動かさねばならんのだ？！ 明日の朝、目標が駿河湾に現れてから音を流せば十分ではないのか？ それとも何か、クジラは音さえ聞けば一瞬で駿河湾へ瞬間移動してくるとでも思っているのか？！」
  ➔ この反論により、プレイヤー（浪寄ら）に考えさせ、【太平洋のクジラが泳いで駿河湾に集まるには6〜8時間かかるため、明朝の決戦に間に合わせるには今夜（深夜）のうちに発信しなければならない】という解答を導き出させる！

【交渉成立・岸部局長の決断】
（🎙️ 防衛庁 運用企画局長・岸部）:
「――……なるほど。通常兵器の無力化と火山刺激の破滅リスク、そして深海SOFAR層による音響伝達とクジラの遊泳時間（6〜8時間）の逆算か。机上の空論ではなく、極めて冷徹な計算に基づいているな。……いいだろう。防衛庁運用企画局長として、私が全責任を背負おう。直ちに第1潜水隊群へ緊急出動を下令する。潜水艦を深海1,000mのSOFAR層へ急速潜航させ、貴官らの祝詞音源を大出力放流させる。また、明朝の現場部隊へは『実弾魚雷の即時発射を抑制し、クジラの捕食を見届けて待機せよ』と通達しよう。――明朝の運命、君たちに託すぞ」

【フェーズ4.5：深夜の潜水艦SOFAR層での新言語祝詞・放流開始（長津アナウンスカード NG-07）】
（🎙️ 首席オペレーター 長津）:
「――海上自衛隊の潜水艦が水深1,000mの深海SOFAR層へ到達！ 大出力深海ハイドロスピーカーより、新言語祝詞の放流を開始いたしました！ 音波は深海音響チャネル（SOFAR層）とクジラたちの共鳴に乗って、太平洋全域へと急速に拡散しています！ あとは夜明けの決戦までに、マッコウクジラの大群が駿河湾へ集結してくれるのを祈りましょう！」`,

  7: `【フェーズ1：運命の夜明け・クジラ群の到達と生体ソナー大捕食】
（🎙️ 首席オペレーター 長津）:
「――夜明けを迎えました。目標は水深600〜1,000mを維持して駿河湾奥へ突入！ 湾奥に展開する海上自衛隊の潜水艦部隊および深海ソナー網より、順次リアルタイムの探知状況と気象庁の火山観測データが入電いたします！」
「――怪異が水深600〜1,000mを維持して駿河湾奥へ突入！ 湾奥に陣取る海自潜水艦部隊は、昨夜の約束通り魚雷発射管を開きながらも『攻撃抑制』を死守し、固唾を呑んで待機しています。直後――深海ソナーに無数のクリック音反響！ 昨夜から放流を続けた祝詞に応え、夜を徹して太平洋を泳いできたマッコウクジラ群が駿河湾深海へ到達！ クジラたちは自らの頭部から放つ生体ソナー（エコーロケーション）で怪異を探知し、本能のまま深海へ一斉潜航・大捕食を敢行！ 怪異の超群体は完全に呑み込まれ、富士山地下深部の火山性微動は完全停止！ 自衛隊の実弾は一発も撃たれず発射中止（スタンドダウン）となりました！」

【フェーズ2：首席オペレーター 長津 感涙の作戦成功アナウンス（長津アナウンスカード NG-08）】
（🎙️ 首席オペレーター 長津）:
「――各員へ緊急報告！ 海自潜水艦の深海音響探知により、前代未聞の巨大な生体音響反応を探知！ ……クジラです！ 昨夜から放流を続けた祝詞に応え、太平洋沖から夜を徹して泳いできたマッコウクジラの大群が駿河湾深海へ到達いたしました！ クジラたちの生体ソナーが水深800mの怪異を捉え、一斉に深海へ突入……大捕食を開始！ 怪異の同調音がクジラたちの音波に呑み込まれ、太古の盟約通り大獲物を喰らい尽くしました！
――気象庁火山監視課より緊急電！ 富士山地下深部における火山性微動、急激に減衰……完全に停止！ 防衛省・自衛艦隊司令部より全潜水艦へ通達入電、『目標の完全消滅を確認。魚雷発射管閉鎖、全部隊攻撃中止（スタンドダウン）』！ 自衛隊の実弾は一発も撃たれることなく、海底火山を刺激するリスクも完全に消滅いたしました！
……勝ったのです。朝潮危機管理官、貝浜リエゾン、坂凪隊長、太刀魚観測員、浪寄准教授、初瀬さん……！ 太古から受け継がれた海の約束と、みなさんが結集した科学と勇気が……この国を、日本を救いました……っ！！」

【フェーズ3：海上自衛隊幹部からの直通電話（政治的思惑と最終選択の提示）】
（長津の歓声が響く司令室。突如、防衛省直通のホットライン赤電話が鳴り響く）
（🎙️ 防衛省・自衛艦隊幹部）:
「――朝潮君、貝浜君、聞こえるかね。
……まずは、事態をここまで抑え込んだ君たちの尽力には感謝する。
だがね……自衛隊の出動まで閣議決定しておいて、自衛隊側は何の活動もしなかったというのは、世間にも国会にも説明ができないんでね。ここは、海上自衛隊の出動を決めた総理が国民に説明するために、少し稼働したいと言っている。
このあと、駿河湾沖合に向けて、自衛隊側から『害獣駆除の掃討攻撃（爆雷・魚雷投下）』を一斉に行わせる。そもそも、クジラの攻撃で相手が完全に消滅したという確固たる証拠があるわけでもないだろう？
世間には『海上自衛隊が役に立った』という証明にもなるし、総理も自分の決断に自信が持てる。
君たちの功績を出さず、国家防衛上の機密として処理したい。だが、君たちの功績として発表し、海上自衛隊は何もせずに解決できたとすることも、今ならばできる。クジラの祝詞などの詳細は伏せるがね。機転を効かせたヒーローとしてメディアにも取り上げてもらうことになる。今、どちらを選ぶか決めてほしい。このあとの政府の発表内容に関わる」
※GM進行メモ: ここで一度プレイヤーたちに、「①功績を秘匿し自衛隊の戦果とするか」「②自分たちの功績として公表し自衛隊の活動を不要とするか」を合議・決断させてください。

（プレイヤーの回答を受けた後）
（🎙️ 防衛省・自衛艦隊幹部）:
「……わかった。このあと、政府からの発表がある。
いずれにしても、君たちが正しかった。感謝する」
（ツーツーツー……と静かに終話音が響く）

【フェーズ4：テレビ臨時ニュース（政府公式発表の全国報道・2パターン分岐）】
（画面が切り替わり、ニューススタジオの引き締まったアナウンサーの声が流れる）

▼ パターンA：「功績を出さず、海上自衛隊の戦果として処理する」を選んだ場合（長津アナウンスカード NG-09）
（🎙️ ニュースアナウンサー）:
「――ここで、政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。
伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、一連の危機事態が完全に沈静化したと発表しました。
政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が、海底のマグマ網を刺激し、富士山の火山活動を誘発していた可能性が高いことが判明しました。
これに対し、政府の『有害鳥獣駆除』方針に基づき緊急出動していた海上自衛隊が、今朝未明、駿河湾口沖合の深海においてこの巨大生物を捕捉。潜水艦部隊および護衛艦による一斉射撃と実弾掃討作戦を敢行し、海上自衛隊の迅速な武力行使によって、この巨大生物を完全に撃滅・駆除したとのことです。
巨大生物の駆除に伴い、気象庁は本日午前、富士山地下深部における火山性微動が完全に停止したことを確認。これを受け、政府および気象庁は、富士山の噴火警戒レベルを【レベル1（活火山であることに留意）】へと引き下げました。また、伊豆諸島各島に出されていた避難準備指示もすべて解除されました。
会見の最後で総理大臣は、『自衛隊の果敢な決断と迅速な行動が、国土と国民の生命を守り抜いた』と、部隊の功績を高く評価する声明を発表しています――」

▼ パターンB：「対策本部の功績として発表し、自衛隊は何もせず解決したとする」を選んだ場合（長津アナウンスカード NG-10）
（🎙️ ニュースアナウンサー）:
「――ここで、政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。
伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、一連の危機事態が完全に沈静化したと発表しました。
政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が、海底のマグマ網を刺激し、富士山の火山活動を誘発していた可能性が高いことが判明しました。
政府は万一に備えて海上自衛隊を出動させていましたが、今朝未明、海上保安庁・気象庁・海洋科学大学などによる『合同海難対策本部』の特別チームが機転を効かせ、深海へ特別な薬を撃ち込む独自の無力化作戦を敢行。見事にこの巨大生物を沈静化・駆除することに成功したため、海上自衛隊による武力攻撃は不要となったとのことです。
巨大生物の無力化に伴い、気象庁は本日午前、富士山地下深部における火山性微動が完全に停止したことを確認。これを受け、政府および気象庁は、富士山の噴火警戒レベルを【レベル1（活火山であることに留意）】へと引き下げました。また、伊豆諸島各島に出されていた避難準備指示もすべて解除されました。
会見の最後で総理大臣は、『一発の砲火も交えることなく、現場の機転と科学の力で日本を救った合同対策本部のメンバーたちは、まさに我が国の誇りでありヒーローである』と、その功績を最大限に称える声明を発表しています――」

【フェーズ5：エピローグ（それぞれの日常へ）】
テレビから流れる臨時ニュースと、日本中を包む安堵のざわめきを背に、合同海難対策本部のメンバーたちは静かにデスクを片付け、それぞれの日常へと戻っていく。`,
};

// GM進行チェックリストのデフォルト値（各Day最新シナリオ連動）
const DEFAULT_GM_CHECKPOINTS: Record<number, string[]> = {
  1: [
    "【Day 1 開始時】朝潮（PC1）へ特別配布カード『SP-01：黒い小さな隕石のかけら（初期）』を渡し、あわせて『Day 1 対策本部・日次ブリーフィング＆指揮官ミッションシート』（7名時は長津経由）を手渡して各員の点呼・自己紹介を行わせる（目標時間: 30分）",
    "遭難海図を展開し、海流（真東2.0kt）・風圧流（北東1.5kt）・経過時間（現在20分経過＋航行40分＝1時間後）を整理させ、救難艇を急行させるべき海域を指定させる",
    "【失敗時の処理】1回目の指定で外れた場合は「もう一度だけ再指定（リトライ）」を許可し、2回目も外れた場合は自動的に救助成功として進行する",
    "【証言カードのペナルティ処理】1発成功時は『船長の証言（EV-08）』と『大型冷凍ボックス（EV-07）』の両方をDay 1で取得。1回失敗時は1枚のみ取得（残り1枚はDay 2以降の調査枠へ）。2回失敗時は0枚（2枚ともDay 2以降の調査枠へ繰り越し）",
  ],
  2: [
    "【Day 2 開始時】坂凪（PC3）へ特別配布カード『SP-02：朝倉教授の最期』、太刀魚（PC4）へ特別配布カード『SP-03：SOFAR層の特異性』をそれぞれ配布し、朝潮（7名時は長津経由）へ『Day 2 ブリーフィング＆指揮官ミッションシート』を手渡す（目標時間: 25分）",
    "東京側（3択中1つ）と小笠原現地（4択＋Day 1未取得証言カードの中から2つ）の調査枠を提示する（※選択されなかった情報はあとの行動で調査可能と案内する）",
    "選択された証拠を開示し、「ダイオウイカの組織なのに、なぜ数百mもの超巨大な影なのか？」というサイズ矛盾を合議させる",
    "※GM注意（ネタバレ防止）：この段階では「ダイオウイカの超群体」という真相は絶対に明かさないこと",
  ],
  3: [
    "【Day 3 開始時】貝浜（PC2）へ特別配布カード『SP-04：文民統制の仕組み』を配布し、朝潮（7名時は長津経由）へ『Day 3 ブリーフィング＆指揮官ミッションシート』を手渡してソノブイ3基による索敵任務を開始させる（目標時間: 25分）",
    "作戦海図（W-3100）上でソノブイ投下地点を決定させ、巨大生物の現在位置（セクターB-3）を特定させる",
    "ソノブイ終了後、長津アナウンス（連動噴火と北上予想要請）を行い、太刀魚（EV-16: 距離データ）、貝浜（EV-17: ソノブイ探知時間 16:00）、浪寄（EV-18: Day1救助時間 08:00）の3名へ証拠を配布する",
    "経過56時間・距離約350kmから、移動速度（約150km/日）と明日（Day 4 明神礁周辺）の到達地点を計算・合議させる（※計算ミスがあってもペナルティはなく、翌朝の明神礁噴火で自然に軌道修正される）",
    "深海写真（漆黒の巨大質量と20本以上の触手）を開示し、浪寄准教授（生物所見）と貝浜リエゾン（特別配布カード『文民統制の仕組み』に基づく法的判断）へ諮問する",
    "防衛庁・官邸からの緊急諮問として、未確認巨大生物の公式呼称（コードネーム: ワタツミ／クスルフ／独自命名）を合議・決定させる",
    "朝潮危機管理官（PC1）に自衛隊への防衛出動要請、または海上警備行動発令の最終意思決定を行わせる（※どちらを選んでもDay 4終盤で同じ結果へ合流）",
    "合同対策本部の調査枠（東京側1枠、小笠原現地側2枠）を選択させ、証拠資料を開示する",
  ],
  4: [
    "【Day 4 開始時】初瀬（PC6）へ特別配布カード『SP-05：神社の祝詞の複製』を配布し、朝潮（7名時は長津経由）へ『Day 4 ブリーフィング＆指揮官ミッションシート』を手渡す（目標時間: 25分）",
    "このまま北上すると伊豆諸島マグマ網を経て【富士山地下マグマ網】へ直撃・破局噴火を招く危機を共有させる",
    "合同対策本部が即応総力体制へ移行し、調査枠制限を撤廃して未取得だった全証拠資料を一括開示する",
    "対策本部として巨大生物の最終目的地（富士山か東京湾か）を結論づけさせる（※『東京湾』と結論づけた場合、機械的ペナルティはないが、Day 5での自衛隊の攻撃位置がより駿河湾に近い位置へ遅れ、Day 6の岸部局長交渉で嫌味を言われる）",
    "防衛省が「害獣駆除（災害派遣）」として海自全部隊動員・実弾迎撃作戦を決定した通達（NG-05）を読み上げる",
  ],
  5: [
    "【Day 5 開始時】浪寄（PC5）へ特別配布カード『SP-06：マッコウクジラクリック音の距離限界と集合に必要な時間』を配布し、朝潮（7名時は長津経由）へ『Day 5 ブリーフィング＆指揮官ミッションシート』を手渡す（目標時間: 25分）",
    "残距離240km・時速5kmから、富士山噴火までの猶予時間（48時間）を計算させる",
    "朝倉教授のクジラ構文規則（EV-30：『了解した』以外のクジラ言語はすべて2語成語のペアを単位として会話する規則）等を開示し、「超群体であること」「クジラの捕食対象であること」「なぜ富士山を目指すのか」の真相に迫らせる",
    "終盤、防衛省作戦本部から貝浜への直通無線（NG-06 ＆ Day 5 途中①指令書）を演出し、「微動は収まったが、アクティブソナーでゆっくり深海に沈み込みながら元の大きさに戻っている傾向が確認できる。どうして魚雷命中後に復活してしまうのか？なぜ富士山を目指すのか？」を浪寄准教授らに確認させる（※Day 4で東京湾と答えていた場合は、より駿河湾に近い位置での遅滞攻撃になった旨を添える）",
  ],
  6: [
    "【Day 6 開始時】7名プレイ時は長津（PC7）へ特別配布カード『SP-07：防衛庁 運用企画局長とのコネクション』を配布し、朝潮（7名時は長津経由）へ『Day 6 ブリーフィング＆指揮官ミッションシート（朝8時時点：巨大生物の完全回復・北上再開と火山性微動再開、駿河湾到達まで24時間）』を手渡す（目標時間: 30分）",
    "東京班が徹夜で回収した残りの資料、朝倉教授の音響実録4件（EV-31〜34）と2語成語の構文規則、初瀬の『神社の祝詞の複製』と元神主遺族（吉備津）の証言を統合し、クジラを招集する「新言語祝詞」（【人間とクジラ＋約束】【海の下の火山＋探せ】【北＋集まれ】【大きい・たくさんの餌＋攻撃せよ】の2語×4組）を完成させる（解読時間目安：15分）",
    "【『狂気の深淵を覗く』使用時の5分延長ルール】プレイヤーがクジラ言語アプリで『狂気の深淵を覗く』を使用した場合は、全24語の意味が判明するため、それを全員で共有して構文（2語×4組）に組み立てる時間として解読の制限時間を【5分延長】する",
    "祝詞音声の完成後、朝潮へ『Day 6 途中① 指令書』を渡し、長津が親戚（叔父）である防衛庁運用企画局長・岸部（きしべ）への直通回線を繋いで（7名時はPC7長津が宣言）、朝潮・貝浜を中心に電話交渉を行わせる（※Day 4で東京湾と結論づけていた場合は、岸部局長から嫌味を言わせる）",
    "【岸部局長の反論による思考誘導】祝詞の解読ができていれば、もし『水深1,000mのSOFAR層（潜水艦）』や『クジラの移動時間（6〜8時間＝今夜の送信が必要）』が抜けていても、岸部局長が鋭く反論・質問することでプレイヤー自身にその場で考えさせて解答を導き出させる",
    "岸部局長の作戦承諾と第1潜水隊群への緊急出動下令、明朝の現場部隊への「魚雷攻撃抑制（スタンドダウン）」通達を読み上げ、続けて深夜の潜水艦による深海SOFAR層での祝詞音声放流開始（NG-07）をアナウンスする",
  ],
  7: [
    "【Day 7 開始時】GMから朝潮（7名時は長津経由）へ『Day 7 ブリーフィング＆指揮官ミッションシート』を手渡し、祝詞に応えて夜通し泳いできたマッコウクジラ群の駿河湾到達・怪異の大捕食・富士山微動の完全停止を劇的に描写する（目標時間: 30分）",
    "長津が涙ながらに各員の名前を呼び（7名時はPC7長津またはGM）、日本が救われた歓喜と全部隊攻撃中止（スタンドダウン）を告げる",
    "防衛省幹部からの直通電話を演出し、「①功績を出さず国家防衛機密として自衛隊が掃討したことにするか」「②対策本部が機転を効かせて解決したヒーローとして発表し自衛隊の活動を不要にするか」の選択をプレイヤーに委ね、「いずれにしても、君たちが正しかった。感謝する」と結ぶ",
    "プレイヤーの選択に応じたテレビ臨時ニュース（パターンA：自衛隊による撃滅報道 ／ パターンB：対策本部が特別な薬剤を撃ち込み自衛隊の活動不要で解決したとするヒーロー報道）を読み上げる",
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
      merged.push(existingMap[initItem.id] || initItem);
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
      !existing.readAloudScript.includes("長津") ||
      (dayNumber === 1 && (!existing.readAloudScript.includes("パパズドルフィン") || !existing.readAloudScript.includes("最大2回まで指定可能"))) ||
      (dayNumber === 2 && !existing.readAloudScript.includes("優先度を決めて調査をお願いします")) ||
      (dayNumber === 3 && (!existing.readAloudScript.includes("NG-02") || !existing.readAloudScript.includes("NG-04"))) ||
      (dayNumber === 4 && (!existing.readAloudScript.includes("即応総力体制") || !existing.readAloudScript.includes("最終目的地の結論分岐"))) ||
      (dayNumber === 5 && (!existing.readAloudScript.includes("時速5km") || !existing.readAloudScript.includes("どうして魚雷の命中後に復活してしまうのか"))) ||
      (dayNumber === 6 && (!existing.readAloudScript.includes("朝8時") || !existing.readAloudScript.includes("5分延長") || existing.readAloudScript.includes("作戦名（オペレーション名）"))) ||
      (dayNumber === 7 && (!existing.readAloudScript.includes("NG-08") || !existing.readAloudScript.includes("いずれにしても、君たちが正しかった")));

    const script = isOldDefaultScript ? defaultNarration : existing.readAloudScript;

    const isOldCheckpoints =
      !Array.isArray(existing.gmCheckpoints) ||
      existing.gmCheckpoints.length <= 3 ||
      existing.gmCheckpoints[0].includes("全体状況をアナウンスし、制限時間") ||
      (dayNumber === 1 && !existing.gmCheckpoints.some((c) => c.includes("証言カードのペナルティ処理"))) ||
      (dayNumber === 5 && !existing.gmCheckpoints.some((c) => c.includes("どうして魚雷命中後に復活してしまうのか"))) ||
      (dayNumber === 6 && (!existing.gmCheckpoints.some((c) => c.includes("朝8時")) || !existing.gmCheckpoints.some((c) => c.includes("5分延長")) || existing.gmCheckpoints.some((c) => c.includes("作戦名")))) ||
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

export const DocumentDesignStudio: React.FC<DocumentDesignStudioProps> = ({
  project,
  onUpdateProject,
  onSendAiPrompt,
}) => {
  const [category, setCategory] = useState<StudioCategory>("handouts");
  const [handoutViewMode, setHandoutViewMode] = useState<
    "sheet" | "cards" | "daily_briefings" | "nagatsu_cards"
  >("sheet");
  const [briefingFilterMode, setBriefingFilterMode] = useState<
    "all" | "midday" | "start"
  >("all");
  const [selectedCharId, setSelectedCharId] = useState<string>((project.characters || [])[0]?.id || "pc-1");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    (project.evidences || [])[0]?.id || ""
  );
  const [evidenceDayFilter, setEvidenceDayFilter] = useState<number | "all" | "glossary">("all");
  const [evidenceViewMode, setEvidenceViewMode] = useState<"cards_a4" | "single">("cards_a4");
  const [selectedVisualId, setSelectedVisualId] = useState<string>("vis-day1-white");
  const [visualOrientation, setVisualOrientation] = useState<"portrait" | "landscape_rotated">("landscape_rotated");
  const [selectedGmDay, setSelectedGmDay] = useState<number>(1);
  const [gmGuideViewMode, setGmGuideViewMode] = useState<"flowchart" | "daily_sheet">("flowchart");

  // 画面内テキスト直接編集モードは常にOFF（完成プレビュー固定）
  const isDirectEditMode = false;

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
          e.id !== "ev-coda-spectrogram" &&
          e.id !== "ev-folk-song-rhythm" &&
          !e.title.includes("古謡") &&
          !e.title.includes("スペクトログラム") &&
          !e.title.includes("スペクロログラム")
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

  const timelineList = project.timeline || [];
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
    // 全体提示の地図・写真カテゴリの場合は、A4用紙（余白0mm・画像のみ最大化・90度回転配置）で印刷
    if (category === "visuals" && activeVisual?.imageUrl) {
      const imgUrl = activeVisual.imageUrl;
      const isRotated = visualOrientation === "landscape_rotated";
      const isWithMargin = activeVisual.hasWhiteMargin ?? (activeVisual.id === "vis-day2-aerial");

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
  <title>${activeVisual.title}</title>
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
      margin: ${isB5HandoutSheet ? "8mm 9mm" : isSingleEvidenceSheet ? "12mm" : "8mm"};
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
      font-size: ${isB5HandoutSheet ? "10pt" : "11px"};
      line-height: ${isB5HandoutSheet ? "1.5" : "1.45"};
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    @media print {
      .card-pair-row {
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        margin-bottom: 8mm !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .card-pair-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8mm !important;
      }
      .card-face-134mm {
        height: 134mm !important;
        min-height: 134mm !important;
        max-height: 134mm !important;
        box-shadow: none !important;
        overflow: hidden !important;
      }
    }
    ruby {
      ruby-align: center;
      white-space: nowrap;
    }
    rt {
      font-size: 6px !important;
      line-height: 1 !important;
      letter-spacing: -0.03em !important;
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
              全{project.timeline.length}フェーズ
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
                  個人向けハンドアウト ({project.characters.length}名)
                </h3>
              </div>

              {/* 区分切替（2列グリッド・インディゴ選択で統一） */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
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
                    全て(12)
                  </button>
                  <button
                    onClick={() => setBriefingFilterMode("start")}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      briefingFilterMode === "start"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    各Day開始時(7)
                  </button>
                  <button
                    onClick={() => setBriefingFilterMode("midday")}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      briefingFilterMode === "midday"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    途中追加(5)
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {project.characters.map((c, idx) => {
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
                <button
                  onClick={handleAddCustomVisualBoard}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  地図・写真追加
                </button>
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
                {visualBoards.map((vb) => {
                  const isSelected = vb.id === activeVisual?.id;
                  return (
                    <button
                      key={vb.id}
                      onClick={() => {
                        setSelectedVisualId(vb.id);
                        if (vb.orientation) {
                          setVisualOrientation(vb.orientation);
                        }
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
                  GM進行資料（全{project.timeline.length}フェーズ）
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
                {project.timeline.map((step) => {
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
        <div className="col-span-9 flex-1 overflow-y-auto bg-slate-900/90 p-6 md:p-10">
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
                          {project.title} ― 個人ハンドアウト本紙（B5規格・全{project.characters.length}名）
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
                              activeChar ? [activeChar] : project.characters,
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
                          合同海難対策本部 記録資料
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
                          PC-{project.characters.findIndex((c) => c.id === activeChar.id) + 1}
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
                              value={activeChar.handout.publicProfile}
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
                              {activeChar.handout.publicProfile}
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
                                    `【${activeChar.name}の自己紹介・記憶の推敲依頼】\n以下の「あなたの記憶」と「自己紹介」をより自然で臨場感ある文章にブラッシュアップしてください：\n\n【あなたの記憶】\n${activeChar.introduction}\n\n【自己紹介】\n${activeChar.handout.handoutBody}`
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
                              value={activeChar.handout.handoutBody}
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
                              {formatJapaneseParagraphs(activeChar.handout.handoutBody)}
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
                              className="w-full rounded border border-dashed border-amber-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-amber-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                              {formatJapaneseParagraphs(activeChar.handout.internalDrama.pride)}
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
                              className="w-full rounded border border-dashed border-slate-300 bg-white p-1.5 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                              {formatJapaneseParagraphs(activeChar.handout.internalDrama.loss)}
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
                      <span>合同海難対策本部 記録 // JIS B5 規格ハンドアウト</span>
                      <span className="font-mono">B5 1/1 頁</span>
                    </div>
                  </div>
                ) : handoutViewMode === "cards" ? (
                  /* ------------------------------------------------------------
                     🃏 特別配布カード（全7枚・各カードの表面＋本文面ペア表示・A4 1/4サイズ固定）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 特別配布カード（全7枚・A4 1/4サイズ固定）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          特別配布カード一覧（全7枚・証拠カード同一サイズ）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          A4 4分割（均一サイズ）で印刷 / PDF保存
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const cardsSource =
                        project.specialCharacterCards && project.specialCharacterCards.length === 7
                          ? project.specialCharacterCards
                          : SPECIAL_CHARACTER_CARDS;

                      return (
                        <div className="space-y-6 print:space-y-0">
                          {cardsSource.map((card, idx) => {
                            const charShort = card.characterName.split("（")[0];
                            const cardLabel = `特別配布カード（${charShort}）`;
                            const isSelected = card.characterId === activeChar.id;

                            return (
                              <div
                                key={card.id}
                                onClick={() => setSelectedCharId(card.characterId)}
                                className={`card-pair-row cursor-pointer rounded-lg border p-4 transition print:border-0 print:bg-transparent print:p-0 print:ring-0 print:mb-[8mm] break-inside-avoid ${
                                  idx % 2 === 0 && idx > 0 ? "page-break-before" : ""
                                } ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/30"
                                    : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                                }`}
                              >
                                <div className="card-pair-grid grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-[8mm]">
                                  {/* 左：表面（A4 1/4サイズ固定・カラー） */}
                                  <div
                                    className="card-face-134mm rounded-md border-2 p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none"
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
                                        海上保安庁・合同海難対策本部
                                      </div>
                                      {card.frontTitleHtml ? (
                                        <div
                                          className="text-xl font-black text-slate-900 leading-snug"
                                          dangerouslySetInnerHTML={{ __html: card.frontTitleHtml }}
                                        />
                                      ) : (
                                        <div className="text-xl font-black text-slate-900 leading-snug">
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

                                  {/* 右：本文面（A4 1/4サイズ固定・カラー） */}
                                  <div
                                    className="card-face-134mm rounded-md border-2 bg-white p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none"
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

                                      <div
                                        className={`${
                                          card.glossaryNote
                                            ? "text-[11px] leading-[1.48]"
                                            : "text-xs leading-relaxed"
                                        } text-slate-800 whitespace-pre-wrap text-justify`}
                                      >
                                        {renderColoredCardBody(card.description)}
                                      </div>
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
                                </div>
                              </div>
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
                      {DAILY_COMMANDER_BRIEFINGS.filter((b) =>
                        briefingFilterMode === "all"
                          ? true
                          : briefingFilterMode === "midday"
                          ? Boolean(b.isMidDayAddition)
                          : !b.isMidDayAddition
                      ).map((b, idx) => (
                        <div
                          key={b.id}
                          className={`rounded-md border-2 bg-white p-4 shadow-sm space-y-2.5 break-inside-avoid ${
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
                                className="text-xs leading-[2.05] text-slate-800 font-medium [&_ruby]:whitespace-nowrap [&_rt]:text-[6.8px] [&_rt]:leading-none [&_rt]:tracking-tighter [&_rt]:text-slate-600 [&_rt]:font-normal"
                                dangerouslySetInnerHTML={{ __html: b.nagatsuBriefingRubyHtml }}
                              />
                            ) : (
                              <p className="text-xs leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
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
                            <ul className="space-y-1.5 text-xs leading-relaxed text-slate-800 list-none">
                              {b.asashioMissions.map((m, mIdx) => (
                                <li key={mIdx} className="flex items-start gap-2">
                                  <span className="mt-0.5 inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                                  <span>{renderColoredCardBody(m)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                            <span>{b.gmHandoutNote}</span>
                            <span className="font-mono font-bold">{b.sheetCode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ------------------------------------------------------------
                     🎙️ 長津（PC7）専用 フェーズ進行＆ミッション達成時アナウンスカード一覧（全10枚）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="no-print border-b-2 border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 長津（PC7）専用 フェーズ進行＆ミッション達成時アナウンスカード（全10枚・A4 1/4サイズ固定）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          長津（PC7）専用・途中＆達成時アナウンスカード一覧（NG-01〜NG-10）
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          A4 4分割（均一サイズ）で印刷 / PDF保存
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 print:space-y-0">
                      {NAGATSU_PHASE_CARDS.map((nc, idx) => (
                        <div
                          key={nc.id}
                          className={`card-pair-row rounded-lg border border-slate-200 bg-slate-50/40 p-4 print:border-0 print:bg-transparent print:p-0 print:mb-[8mm] break-inside-avoid ${
                            idx % 2 === 0 && idx > 0 ? "page-break-before" : ""
                          }`}
                        >
                          <div className="card-pair-grid grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-[8mm]">
                            {/* 左：表面（A4 1/4サイズ固定） */}
                            <div className="card-face-134mm rounded-md border-2 border-slate-800 bg-[#fafaf9] p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none">
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
                                  海上保安庁・合同海難対策本部
                                </div>
                                {nc.frontTitleHtml ? (
                                  <div
                                    className="text-xl font-black text-slate-900 leading-snug"
                                    dangerouslySetInnerHTML={{ __html: nc.frontTitleHtml }}
                                  />
                                ) : (
                                  <div className="text-xl font-black text-slate-900 leading-snug">
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

                            {/* 右：本文面（A4 1/4サイズ固定） */}
                            <div className="card-face-134mm rounded-md border-2 border-slate-700 bg-white p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none">
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

                                <div className="border-b-2 border-slate-900 pb-1.5 mb-2.5">
                                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                                    {nc.title}
                                  </h4>
                                </div>

                                <div
                                  className="text-xs leading-[1.95] text-slate-800 text-left [&_ruby]:whitespace-nowrap [&_rt]:text-[6.2px] [&_rt]:leading-none [&_rt]:tracking-tighter [&_rt]:text-slate-600 [&_rt]:font-normal"
                                  dangerouslySetInnerHTML={{ __html: nc.rubyHtml }}
                                />
                              </div>

                              <div className="border-t border-dashed border-slate-300 pt-2 mt-3 flex items-center justify-end text-xs">
                                <span className="font-mono font-bold text-slate-500">
                                  {nc.cardCode} / 10
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        {project.title} ― 証拠資料カード一覧（A4 1/4サイズ固定・下部余白の用語解説付き）
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        証拠カード一覧（表示中：{filteredEvidences.length}枚 ／ 全{allEvidences.length}枚・特別配布カード同一サイズ）
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrintDesignedSheet}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        A4 4分割（均一サイズ）で印刷 / PDF保存
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 print:space-y-0">
                    {filteredEvidences.map((ev, idx) => {
                      const globalIdx = allEvidences.findIndex((e) => e.id === ev.id) + 1;
                      const evCode = `EV-${String(globalIdx).padStart(2, "0")}`;
                      const ownerChar = project.characters.find((c) => c.id === ev.ownerId);
                      const ownerShort = ownerChar
                        ? ownerChar.name.split("（")[0]
                        : "全体公開";
                      const isSelected = ev.id === activeEvidence?.id;
                      const cardColor = getEvidenceCardColorTheme(ev.ownerId, ev.foundPhase);
                      const formattedFrontTitleHtml = formatEvidenceFrontTitleHtml(
                        ev.title,
                        ev.frontTitleHtml
                      );

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvidenceId(ev.id)}
                          className={`card-pair-row cursor-pointer rounded-lg border p-4 transition print:border-0 print:bg-transparent print:p-0 print:ring-0 print:mb-[8mm] break-inside-avoid ${
                            idx % 2 === 0 && idx > 0 ? "page-break-before" : ""
                          } ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/30"
                              : "border-slate-200 bg-slate-50/40 hover:border-slate-300"
                          }`}
                        >
                          <div className="card-pair-grid grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-[8mm]">
                            {/* 左：表面（A4 1/4サイズ固定・カラー＆意味区切り改行） */}
                            <div
                              className="card-face-134mm rounded-md border-2 p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none"
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
                                  海上保安庁・合同海難対策本部
                                </div>
                                <div
                                  className="text-xl font-black text-slate-900 leading-snug px-2"
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

                            {/* 右：本文面＋下部余白の用語解説（A4 1/4サイズ固定・カラー） */}
                            <div
                              className="card-face-134mm rounded-md border-2 bg-white p-5 flex flex-col justify-between min-h-[380px] print:h-[134mm] shadow-sm print:shadow-none"
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
                                  className={`${
                                    ev.glossaryNote
                                      ? "text-[11px] leading-[1.46]"
                                      : "text-xs leading-relaxed"
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                activeEvidence && (() => {
                  const ownerChar = project.characters.find((c) => c.id === activeEvidence.ownerId);
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
                                  {project.characters.map((c) => (
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
            {category === "visuals" && activeVisual && (() => {
              const isWithMargin = activeVisual.hasWhiteMargin ?? (activeVisual.id === "vis-day2-aerial");
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
                        onClick={() =>
                          handleUpdateActiveVisual((v) => ({
                            ...v,
                            hasWhiteMargin: !isWithMargin,
                          }))
                        }
                        className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                      >
                        {isWithMargin ? "🖼️ 現在：白い余白あり" : "🖼️ 現在：全面最大（余白なし）"}
                      </button>

                      {/* 証拠資料と同一位置・同一色のA4印刷ボタン */}
                      <button
                        type="button"
                        onClick={handlePrintDesignedSheet}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        この図・写真をA4印刷 / PDF保存
                      </button>
                    </div>
                  </div>

                  {/* A4プレビューキャンバス（デザイン枠や余計な文字を完全排除し、画像のみをA4比率で最大表示） */}
                  <div className="flex justify-center py-2">
                    <div className="relative w-full max-w-[700px] aspect-[210/297] bg-white shadow-2xl rounded-sm overflow-hidden flex items-center justify-center border border-slate-300">
                      {activeVisual.imageUrl ? (
                        visualOrientation === "landscape_rotated" ? (
                          /* 横長画像を90度回転させてA4縦（210mm × 297mm）にプレビュー（余白あり時は88%に縮小） */
                          <div
                            className="absolute flex items-center justify-center overflow-hidden"
                            style={{
                              width: isWithMargin ? "calc(88% * 297 / 210)" : "calc(100% * 297 / 210)",
                              height: isWithMargin ? "88%" : "100%",
                              transform: "rotate(90deg)",
                              transformOrigin: "center center",
                            }}
                          >
                            <img
                              src={activeVisual.imageUrl}
                              alt={activeVisual.title}
                              className={`max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none ${
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
                              } w-auto h-auto object-contain select-none pointer-events-none`}
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
                      <a
                        href="/pdfs/gm-branching-flowchart.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        フローチャートを印刷 / PDF保存（A4・1枚）
                      </a>
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
                      <a
                        href="/pdfs/gm-complete-progression-guide.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        進行資料を一括印刷 / PDF保存（Day 1〜7）
                      </a>
                    </div>
                  </div>

                  {/* ============================================================
                      【1ページ目】：GM演出・読み上げ台本シート（証拠資料と同じ白・スレート・インディゴ基調）
                     ============================================================ */}
                  <div className="space-y-5">
                    {/* 🎙️ GM立ち位置・役柄ガイダンスバナー */}
                    <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <Radio className="h-4 w-4 text-indigo-600 shrink-0" />
                          🎙️ GM役柄・進行方式：【6名時：GMが長津を担当 ／ 7名時：PC7が長津を担当】
                        </span>
                        <span className="text-[11px] text-slate-600">
                          ｜ 各Day開始時に朝潮（PC1）へ『Day別指令シート』を手渡し、朝潮の指揮で会議を開始させます
                        </span>
                      </div>
                    </div>

                    {/* GM進行ヘッダー帯（スレートダークで統一） */}
                    <div className="rounded-md p-4 bg-slate-900 text-white shadow">
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex-1 min-w-[260px]">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-300">
                            Day {activeTimelineStep.dayNumber} 状況タイトル
                          </span>
                          <h1 className="mt-0.5 text-lg font-bold leading-tight">
                            {activeTimelineStep.situationTitle}
                          </h1>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-300">
                              観測地点
                            </span>
                            <div className="mt-1 text-sm font-semibold">
                              {activeTimelineStep.locationName}
                            </div>
                          </div>

                          <div className="border-l border-white/25 pl-4">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-300">
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
                    <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-800">
                      <Volume2 className="h-4 w-4 text-indigo-700 shrink-0" />
                      <span className="font-bold shrink-0">演出・BGMキュー:</span>
                      <span>{activeGmNote.bgmCue}</span>
                    </div>

                    {/* 📢 GM演出用ナレーション ＆ NPCセリフ台本 */}
                    <div className="rounded-md border-2 border-slate-800 bg-slate-50/50 p-5">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                          📢 【GM演出用ナレーション ＆ NPCセリフ台本】
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Day {activeTimelineStep.dayNumber} 読み上げスクリプト
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-xs font-semibold leading-relaxed font-mono text-slate-900 bg-white p-4 rounded border border-slate-200 select-text">
                        {activeGmNote.readAloudScript}
                      </div>
                    </div>

                    {/* 🔀 Day別の成功・失敗分岐詳細 */}
                    {(() => {
                      const dayFc = GM_DAY_FLOWCHARTS.find(
                        (f) => f.dayNumber === activeTimelineStep.dayNumber
                      );
                      if (!dayFc) return null;
                      return (
                        <div className="rounded-lg border-2 border-slate-800 bg-white p-4 space-y-3 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>🔀</span>
                              <span>
                                Day {dayFc.dayNumber} 分岐・対応指針（{dayFc.decisionTaskTitle}）
                              </span>
                            </span>
                            <span className="rounded bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {dayFc.hasFailureBranch ? "分岐・反論誘導あり" : "失敗要素なし"}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {dayFc.branches.map((br) => (
                              <div
                                key={br.id}
                                className="rounded border border-slate-300 bg-slate-50/60 p-3 text-xs space-y-1"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-slate-900">
                                  <span>{br.conditionLabel}</span>
                                  <span className="font-mono text-[10.5px] text-indigo-900">
                                    {br.nextStepArrow}
                                  </span>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-800">
                                  ➔ {br.outcomeTitle}
                                </div>
                                <div className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white rounded p-2.5 border border-slate-200">
                                  {br.gmActionAndDialogue}
                                </div>
                                {br.penaltyOrCarryOver && (
                                  <div className="text-[10.5px] font-bold text-rose-800">
                                    📌 {br.penaltyOrCarryOver}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ✅ GM進行チェックポイント */}
                    <div className="rounded-md border border-slate-300 p-4 bg-white shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                          Day {activeTimelineStep.dayNumber} GM進行チェックリスト
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {(activeGmNote.gmCheckpoints || []).map((chk, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-800">
                            <span className="inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 📂 このフェーズで開示される証拠資料 */}
                    <div className="rounded-md border border-slate-300 p-3.5 bg-white shadow-sm">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>
                          📂 Day {activeTimelineStep.dayNumber} 開示証拠資料（
                          {
                            allEvidences.filter(
                              (e) => e.foundPhase === activeTimelineStep.dayNumber
                            ).length
                          }
                          件）
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allEvidences
                          .filter((e) => e.foundPhase === activeTimelineStep.dayNumber)
                          .map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <span className="text-indigo-600 font-mono text-xs">📄</span>
                              <span>{ev.title}</span>
                            </div>
                          ))}
                        {allEvidences.filter((e) => e.foundPhase === activeTimelineStep.dayNumber)
                          .length === 0 && (
                          <span className="text-xs text-slate-500 italic">
                            このフェーズで開示される証拠はありません
                          </span>
                        )}
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
