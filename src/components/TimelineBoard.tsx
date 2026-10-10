"use client";

import React, { useState } from "react";
import { IncidentStep, EvidenceItem, MMProject } from "@/types/schema";
import {
  Compass,
  MapPin,
  Radio,
  Shield,
  AlertTriangle,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
  Navigation,
  Globe,
  Maximize2,
  X,
  Flame,
  ShieldAlert,
  Clock,
  Image as ImageIcon,
  Search,
  Building2,
  Anchor,
  Volume2,
  HelpCircle,
  ExternalLink,
  Radar,
  Crosshair,
  Scroll,
  Users,
  Scale,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  TOKYO_ACTIONS,
  FIELD_ACTIONS,
  DAY4_TOKYO_ACTIONS,
  DAY4_FIELD_ACTIONS,
  DAY5_TOKYO_ACTIONS,
  DAY5_FIELD_ACTIONS,
} from "./GmDashboard";
import { THEATER_TIMELINE_POINTS } from "./NauticalChartView";
import { audioEngine } from "@/utils/audioSynth";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";
import { Day3TacticalMap } from "./Day3TacticalMap";
import { Day1NauticalMap } from "./Day1NauticalMap";

// Day 3 ヘリコプター洋上捜索（36セクター索敵盤）の定義
export const DAY3_SECTOR_ROWS = ["A", "B", "C", "D", "E", "F"] as const;
export const DAY3_SECTOR_COLS = [1, 2, 3, 4, 5, 6] as const;

export const CREATURE_SECTOR = "B-3";
export const HEAT_CLUTTER_SECTORS = ["D-2", "E-2"];

export interface SectorSonarResult {
  sectorId: string;
  status: "direct_hit" | "adjacent_detect" | "clutter_hazard" | "no_return";
  title: string;
  summary: string;
  details: string;
}

export function evaluateSectorSonar(sectorId: string): SectorSonarResult {
  const parts = sectorId.split("-");
  const row = parts[0];
  const col = parseInt(parts[1], 10);
  const rowIndex = DAY3_SECTOR_ROWS.indexOf(row as any);

  // 1. 直下ヒット（B-3）
  if (sectorId === CREATURE_SECTOR) {
    return {
      sectorId,
      status: "direct_hit",
      title: "🎯【直下探知・潜航目標捕捉！】",
      summary: "深度400mに巨大生体エコーを捕捉！ 目標が音波に反応して海面十数mへ浮上開始！",
      details:
        "水深400mより全長300〜400mの超巨大な生体シグネチャーを直下探知。アクティブソナーの強力なピン音に刺激されたのか、物体は急速に海面（水深10〜20m）へ浮上を開始した。ヘリ急行により目視および写真撮影が可能！",
    };
  }

  // 2. 熱水クラッター判定（D-2, E-2 またはその隣接8マス）
  const isAdjacentToClutter = HEAT_CLUTTER_SECTORS.some((clutter) => {
    const [cRow, cColStr] = clutter.split("-");
    const cCol = parseInt(cColStr, 10);
    const cRowIndex = DAY3_SECTOR_ROWS.indexOf(cRow as any);
    return Math.abs(rowIndex - cRowIndex) <= 1 && Math.abs(col - cCol) <= 1;
  });

  if (isAdjacentToClutter) {
    const isDirectClutter = HEAT_CLUTTER_SECTORS.includes(sectorId);
    return {
      sectorId,
      status: "clutter_hazard",
      title: isDirectClutter ? "💥【熱水プルーム直撃・測距不能】" : "⚠️【熱水クラッター障害・周囲探知不能】",
      summary: "投下セクター直下には不在確定。ただし海底熱水の微細気泡散乱により周囲探知は不能！",
      details:
        "直下には不在。しかし近隣の海底カルデラ（D-2/E-2）から噴出する微細気泡群と急激な水温躍層により、音波が激しく散乱・クラッター化。周囲セクターの生体エコーは完全に掻き消され探知不能。",
    };
  }

  // 3. 巨大生物の隣接マス（B-3の周囲8マス）
  const [bRow, bColStr] = CREATURE_SECTOR.split("-");
  const bCol = parseInt(bColStr, 10);
  const bRowIndex = DAY3_SECTOR_ROWS.indexOf(bRow as any);
  const isAdjacentToCreature = Math.abs(rowIndex - bRowIndex) <= 1 && Math.abs(col - bCol) <= 1;

  if (isAdjacentToCreature) {
    return {
      sectorId,
      status: "adjacent_detect",
      title: "📡【至近エコー捕捉・隣接セクター反応】",
      summary: "直下には不在。ただし約20km先の隣接セクターより極めて強力な生体反響を検知！",
      details:
        "投下地点の直下には不在。しかし隣接するマス（約20km先）の方向から、海底地殻を震わせる超低周波の生体パルス反響を受信！ 怪物は隣接セクターのいずれかに潜伏中！",
    };
  }

  // 4. 反応なし
  return {
    sectorId,
    status: "no_return",
    title: "⭕【反応なし・不在確定】",
    summary: "投下セクター直下および有効探知圏内に生体シグネチャーなし。",
    details:
      "海況は安定。反響音波を解析するも、探知半径20km圏内に巨大生物の音響反応は認められない。このセクターおよび周囲には不在と判定。",
  };
}

interface TimelineBoardProps {
  timeline: IncidentStep[];
  evidences: EvidenceItem[];
  project?: MMProject;
  onUpdateTimeline: (newTimeline: IncidentStep[]) => void;
  onNavigateToPuzzle?: () => void;
}

export const TimelineBoard: React.FC<TimelineBoardProps> = ({
  timeline,
  evidences,
  project,
  onUpdateTimeline,
  onNavigateToPuzzle,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const currentStep = timeline.find((t) => t.dayNumber === selectedDay) || timeline[0];

  // モーダル状態
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState(false);
  const [isDay1ChartModalOpen, setIsDay1ChartModalOpen] = useState(false);
  const [isDay4MapModalOpen, setIsDay4MapModalOpen] = useState(false);
  const [isDay5MapModalOpen, setIsDay5MapModalOpen] = useState(false);

  // Day 1 漂流海図の表示モード（白地図 vs 対策本部解析図）
  const [day1ViewMode, setDay1ViewMode] = useState<"investigation" | "tactical">("tactical");

  // Day 2 アクション選択状態
  const [day2TokyoAction, setDay2TokyoAction] = useState<string>("T-3");
  const [day2FieldActions, setDay2FieldActions] = useState<string[]>(["F-1", "F-3"]);

  // Day 3 ソナー投下パズル & 写真観測状態
  const [day3DroppedPoints, setDay3DroppedPoints] = useState<string[]>([]);
  const [day3TargetSector, setDay3TargetSector] = useState<string>("B-3");
  const [day3SearchOutcome, setDay3SearchOutcome] = useState<"none" | "success" | "failure">("none");
  const [day3ActivePhotoTab, setDay3ActivePhotoTab] = useState<"success" | "failure">("success");
  const [day3PhotoModal, setDay3PhotoModal] = useState<"success" | "failure" | null>(null);
  const [day3IsReportUnlocked, setDay3IsReportUnlocked] = useState<boolean>(false);
  const [day3IsPC6ModalOpen, setDay3IsPC6ModalOpen] = useState<boolean>(false);
  const [day3MapTab, setDay3MapTab] = useState<"tactical" | "overview">("tactical");
  const [day3MapMode, setDay3MapMode] = useState<"player" | "gm">("player");
  // Day 3 終盤合議 ＆ 司令官意思決定状態
  const [day3Pc5Opinion, setDay3Pc5Opinion] = useState<string>("colony_theory");
  const [day3Pc2Decision, setDay3Pc2Decision] = useState<string>("defense_action");
  const [day3HqFinalDecision, setDay3HqFinalDecision] = useState<string | null>(null);

  // Day 4 アクション選択状態（東京1枠、現地2枠）
  const [day4TokyoAction, setDay4TokyoAction] = useState<string>("T-4A");
  const [day4FieldActions, setDay4FieldActions] = useState<string[]>(["F-4A", "F-4B"]);
  // Day 4 終盤意思決定：進路予測（東京ルート vs 富士山ルート）
  const [day4DestinationDecision, setDay4DestinationDecision] = useState<"tokyo" | "fuji">("fuji");

  // Day 5 アクション選択状態（東京1枠、現地2枠）
  const [day5TokyoAction, setDay5TokyoAction] = useState<string>("T-5A");
  const [day5FieldActions, setDay5FieldActions] = useState<string[]>(["F-5A", "F-5B"]);

  // Day 6 クジラ言語 ＆ 新言語合成・海自ソナー網装填準備状態
  const [day6ActiveTab, setDay6ActiveTab] = useState<"tongue_click" | "sea_tube" | "coda_grammar" | "sonar_network">("tongue_click");
  const [day6ReadyStatus, setDay6ReadyStatus] = useState<"idle" | "testing" | "ready">("idle");
  const [day6SelectedWords, setDay6SelectedWords] = useState<string[]>([
    "word-human",
    "word-whale",
    "word-promise",
    "word-subsea-volcano",
    "word-go-north",
    "word-search",
    "word-giant-prey",
    "word-gather",
  ]);

  const handleDay6TestPlay = async () => {
    if (!audioEngine) return;
    setDay6ReadyStatus("testing");
    try {
      await audioEngine.playMessageSequence(day6SelectedWords, 1.0);
      setDay6ReadyStatus("ready");
    } catch {
      setDay6ReadyStatus("ready");
    }
  };

  // Day 7 決戦：海自ソナー網大出力放流 ＆ クジラたちのメッセージリレー状態
  const [day7BroadcastStatus, setDay7BroadcastStatus] = useState<"idle" | "broadcasting" | "received">("idle");
  const [day7RelayStatusText, setDay7RelayStatusText] = useState<string>("");
  const [day7RelayStage, setDay7RelayStage] = useState<number>(0);

  const handleDay7Broadcast = async () => {
    if (!audioEngine) return;
    setDay7BroadcastStatus("broadcasting");
    setDay7RelayStage(1);
    setDay7RelayStatusText("海自ソナー網より新言語メッセージを大出力放流中……");
    try {
      await audioEngine.playWhaleMessageRelayChorus((statusText, stageIndex) => {
        setDay7RelayStatusText(statusText);
        setDay7RelayStage(stageIndex);
      });
      setDay7BroadcastStatus("received");
    } catch {
      setDay7BroadcastStatus("received");
    }
  };

  // ESCキーで開いているモーダルを閉じる
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPhotoModalOpen(false);
        setIsTheaterModalOpen(false);
        setIsDay1ChartModalOpen(false);
        setIsDay4MapModalOpen(false);
        setIsDay5MapModalOpen(false);
        setDay3IsPC6ModalOpen(false);
        setDay3PhotoModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleDay2FieldAction = (id: string) => {
    setDay2FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleToggleDay4FieldAction = (id: string) => {
    setDay4FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleToggleDay5FieldAction = (id: string) => {
    setDay5FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleToggleDay3SonarDrop = (sectorId: string) => {
    setDay3DroppedPoints((prev) => {
      if (prev.includes(sectorId)) {
        return prev.filter((p) => p !== sectorId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), sectorId];
      }
      return [...prev, sectorId];
    });
    // 直下ヒットの場合は目標セクターも自動設定
    if (sectorId === CREATURE_SECTOR) {
      setDay3TargetSector(CREATURE_SECTOR);
    }
  };

  const handleResetDay3Sonar = () => {
    setDay3DroppedPoints([]);
    setDay3SearchOutcome("none");
    setDay3IsReportUnlocked(false);
  };

  const handleExecuteDay3HelicopterSearch = () => {
    const isSuccess = day3TargetSector === CREATURE_SECTOR;
    setDay3SearchOutcome(isSuccess ? "success" : "failure");
    setDay3ActivePhotoTab(isSuccess ? "success" : "failure");
    setDay3IsReportUnlocked(true);
    audioEngine?.playWordSound(isSuccess ? "word-enemy" : "word-alert");
  };

  const handleUpdateCurrentStep = (field: keyof IncidentStep, value: any) => {
    const updated = timeline.map((step) =>
      step.dayNumber === selectedDay ? { ...step, [field]: value } : step
    );
    onUpdateTimeline(updated);
  };

  const getRevealedEvidences = (evidenceIds: string[]) => {
    return evidences.filter((e) => evidenceIds.includes(e.id));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-5 text-slate-100">
      {/* 上部：北上インシデント進捗ライン (小笠原 ➔ 富士山 直下：約950km) */}
      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
              7日間 北上インシデント進捗ライン（小笠原・父島 ➔ 駿河湾・富士山直下：約1,000km）
            </h2>
          </div>
          <span className="text-[11px] font-mono text-indigo-300">
            巡航速度: 時速約6 km (約3.3ノット) ｜ 日速約140〜150 km ｜ 火山フロント縦断
          </span>
        </div>

        {/* タイムラインステップバー */}
        <div className="relative flex items-center justify-between pt-3 pb-1">
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-800" />
          <div
            className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-indigo-600 transition-all duration-300"
            style={{ width: `${((selectedDay - 1) / (timeline.length - 1)) * 95}%` }}
          />

          {timeline.map((step) => {
            const isSelected = step.dayNumber === selectedDay;
            const isPast = step.dayNumber <= selectedDay;
            return (
              <button
                key={step.dayNumber}
                onClick={() => setSelectedDay(step.dayNumber)}
                className="relative z-10 flex flex-col items-center group transition"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                    isSelected
                      ? "bg-indigo-500 text-white ring-4 ring-indigo-500/30 scale-110"
                      : isPast
                      ? "bg-slate-700 text-slate-200 group-hover:bg-slate-600"
                      : "bg-slate-900 text-slate-500 border border-slate-700"
                  }`}
                >
                  D{step.dayNumber}
                </div>
                <span
                  className={`mt-1 text-[11px] font-medium transition ${
                    isSelected ? "text-indigo-300 font-bold" : "text-slate-400"
                  }`}
                >
                  {step.locationName.split(" ")[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {step.distanceKm} km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* メイングリッド */}
      <div className="grid flex-1 grid-cols-12 gap-5 overflow-hidden">
        {/* 左側：このDayの状況 ＆ プレイヤー提供情報・作戦画面 */}
        <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-y-auto">
          {/* Dayヘッダー */}
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                DAY {currentStep.dayNumber}
              </span>
              <h3 className="text-sm font-bold text-white">
                {currentStep.situationTitle}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              <span>{currentStep.locationName}</span>
              <span className="font-mono text-slate-500">({currentStep.distanceKm} km地点)</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* 発生事象・地質異変 */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                発生事象・地質異変 (インシデント概要)
              </label>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStep.incidentOverview}
              </p>
            </div>

            {/* 二元対策状況 (東京 vs 現地) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-3">
                <label className="mb-1 flex items-center gap-1.5 font-bold text-blue-300">
                  <Shield className="h-3.5 w-3.5" />
                  東京司令部の動き (PC1, PC2)
                </label>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentStep.hqResponse}
                </p>
              </div>

              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                <label className="mb-1 flex items-center gap-1.5 font-bold text-emerald-300">
                  <Radio className="h-3.5 w-3.5" />
                  現地救難隊の動き (PC3〜PC6)
                </label>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentStep.fieldResponse}
                </p>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 🌟 Day別 プレイヤー提供コンテンツ＆作戦画面 */}
            {/* ======================================================== */}

            {/* --- DAY 1 プレイヤー提供情報：漂流海図 ＆ 救助パズル --- */}
            {selectedDay === 1 && (
              <div className="rounded-xl border border-cyan-800 bg-[#081325] p-4 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-xs text-white">
                        【プレイヤー提供情報】小笠原南西海域 航海用海図（CHART NO. W-2704）
                      </span>
                      <span className="ml-2 text-[10px] text-cyan-300 font-mono">
                        縮尺 1:50,000 / 緯度1分 = 1海里 (NM)
                      </span>
                    </div>
                  </div>

                  {/* モード切替タブ ＆ アクション */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                      <button
                        type="button"
                        onClick={() => setDay1ViewMode("investigation")}
                        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition ${
                          day1ViewMode === "investigation"
                            ? "bg-cyan-700 text-white shadow ring-1 ring-cyan-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="プレイヤー提示用：SOS地点中心の白地図"
                      >
                        <EyeOff className="h-3 w-3" />
                        白地図（プレイヤー提示用）
                      </button>
                      <button
                        type="button"
                        onClick={() => setDay1ViewMode("tactical")}
                        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition ${
                          day1ViewMode === "tactical"
                            ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="対策本部解析用：風・海流・暗礁・正解ベクトル全表示"
                      >
                        <Eye className="h-3 w-3" />
                        対策本部解析図（GM用）
                      </button>
                    </div>

                    <a
                      href={
                        day1ViewMode === "investigation"
                          ? "/images/day1_nautical_chart_white.svg"
                          : "/images/day1_nautical_chart_gm.svg"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition border border-slate-700"
                      title="別タブで原寸SVGを開く"
                    >
                      <ExternalLink className="h-3 w-3" /> 別タブで開く
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsDay1ChartModalOpen(true)}
                      className="flex items-center gap-1 rounded bg-cyan-700 hover:bg-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                    >
                      <Maximize2 className="h-3 w-3" /> 大画面で開く
                    </button>
                  </div>
                </div>

                {/* 海図プレビューカード（実SVGレンダリング） */}
                <div
                  onClick={() => setIsDay1ChartModalOpen(true)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-[#0f172a] aspect-[16/10] max-h-80 flex items-center justify-center p-2 shadow-2xl transition hover:border-cyan-500"
                  title="クリックして大画面で検証・作図"
                >
                  <Day1NauticalMap
                    mode={day1ViewMode === "investigation" ? "player" : "gm"}
                    className="w-full h-full object-contain transition duration-200 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                      📍 {day1ViewMode === "investigation" ? "【白地図】SOS発信位置・父島・南島・暗礁記号" : "【GM解析図】風圧流1.5kt ＋ 黒潮支流2.0kt ＝ 東北東2.5kt"}
                    </span>
                    <span className="rounded bg-cyan-600 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur flex items-center gap-1">
                      <Maximize2 className="h-3 w-3" /> クリックで大画面拡大
                    </span>
                  </div>
                </div>

                {/* 漂流予測パズル解説 */}
                <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-amber-400" />
                      🧩 Day 1 漂流予測の計算ロジック（プレイヤーたちが持ち寄る情報）:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {day1ViewMode === "investigation" ? "※白地図モード中（解答非表示）" : "※GM解析図モード中（解答表示）"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
                    <p>・<strong>PC1 (風)</strong>: 南西の強風15m/s ➔ 北東へ約1.5ノット押し流される</p>
                    <p>・<strong>PC4/5 (海流・潮目)</strong>: 黒潮支流の表層流は真東へ2.0ノット（減衰なし）</p>
                    <p>・<strong>PC6 (無線)</strong>: 『真横から波を受けている』＝風と海流双方の横波</p>
                    <p>・<strong>PC3 (海難救助)</strong>: 東側・南東側には危険な暗礁群。北東×真東の合成ベクトルである【東北東の漂流予測海域】へ急行して暗礁手前で救助成功！</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- DAY 2 プレイヤー提供情報：空撮写真 ＆ 合議制アクション --- */}
            {selectedDay === 2 && (
              <div className="rounded-xl border border-indigo-800 bg-[#0c1024] p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">
                      【プレイヤー提供情報】Day 2 合議制アクション ＆ 航空捜索報告
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                      東京: 1枠
                    </span>
                    <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                      現地: {day2FieldActions.length}/2枠
                    </span>
                  </div>
                </div>

                {/* 空撮写真プレビュー（T-3が選ばれている場合） */}
                {day2TokyoAction === "T-3" && (
                  <div className="rounded-lg border border-amber-900/60 bg-slate-950 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4" />
                        海上保安庁 羽田航空基地 MA722撮影 緊急偵察写真（熱水回避浮上時）
                      </span>
                      <button
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-500 transition shadow"
                      >
                        <Maximize2 className="h-3 w-3" /> 全画面拡大
                      </button>
                    </div>

                    <div
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="group relative cursor-pointer overflow-hidden rounded border border-slate-700 bg-black aspect-video max-h-52 flex items-center justify-center shadow"
                    >
                      <img
                        src="/images/aerial_recon_wide.jpg"
                        alt="西之島北西海域 空撮写真"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] text-slate-200">
                          西之島の噴煙下、海面直下（水深10〜20m）に生じたケルビン波と巨大な影（数分後、深海800mへ急速潜航）
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 合議制アクション操作パネル */}
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-indigo-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Building2 className="h-3.5 w-3.5" /> 東京司令部アクション（1つ選択）:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {TOKYO_ACTIONS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setDay2TokyoAction(a.id)}
                          className={`rounded-lg p-2 text-left border transition ${
                            day2TokyoAction === a.id
                              ? "border-indigo-500 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                              : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                          }`}
                        >
                          <div className="font-bold text-white text-[11px]">{a.id} {a.badge}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-teal-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Anchor className="h-3.5 w-3.5" /> 小笠原現地アクション（2つ選択）:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_ACTIONS.map((a) => {
                        const isSelected = day2FieldActions.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() => handleToggleDay2FieldAction(a.id)}
                            className={`rounded-lg p-2 text-left border transition ${
                              isSelected
                                ? "border-teal-500 bg-teal-950/70 shadow ring-1 ring-teal-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                              <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-teal-600 text-white" : "text-slate-500"}`}>
                                {isSelected ? "選択中" : "未選択"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* サスペンス・サイズ矛盾の結論 */}
                <div className="rounded-lg bg-red-950/30 border border-red-900/40 p-2.5 text-[11px] text-red-200">
                  <span className="font-bold text-amber-300">⚠️ Day 2 プレイヤーに考えてもらうサイズ矛盾:</span>
                  <p className="mt-0.5 text-slate-300">
                    F-1の鑑定でスクリューの付着物は深海600mの「ダイオウイカ」と特定された。しかし観測された影は「全長300〜400メートル」。通常のダイオウイカ（十数m）とは大きさが桁違い！群体である真相は伏せ、なぜ数百mもあるのかを議論させます。
                  </p>
                </div>
              </div>
            )}

            {/* --- DAY 3 プレイヤー提供情報：火山活動監視 ＆ ヘリコプター洋上索敵パズル --- */}
            {selectedDay === 3 && (
              <div className="rounded-xl border border-rose-800 bg-[#160b13] p-4 shadow-lg space-y-4">
                {/* ヘッダー */}
                <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="font-bold text-xs text-white">
                        【合同緊急任務】鳥島沖海底噴火 ＆ 長距離ヘリ洋上ソナー索敵作戦
                      </span>
                      <span className="ml-2 text-[10px] text-rose-300 font-mono">
                        海上保安庁・自衛隊 洋上給油連携オペレーション
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTheaterModalOpen(true)}
                    className="flex items-center gap-1 rounded bg-rose-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-600 transition shadow"
                  >
                    <Maximize2 className="h-3 w-3" /> 海図を全画面拡大
                  </button>
                </div>

                {/* ① GMオープニングアナウンス */}
                <div className="rounded-lg bg-amber-950/40 border border-amber-600/40 p-3 text-xs text-amber-200 space-y-1.5 shadow">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                    【合同対策本部 GMアナウンス】鳥島沖海底大噴火 ＆ 緊急洋上捜索命令
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    昨夜、西之島（Day 1）から北へ約380km離れた「鳥島沖海底カルデラ」において突発的な大規模水蒸気爆発が発生しました。24時間で約380km。時速約6km（日速約150km）の一定ペースで深海を北上する巨大物体が海底火山を次々と刺激している可能性が濃厚です。<br />
                    これを受け、小笠原基地より<strong>大型捜索ヘリ</strong>を緊急発進させ、洋上に展開する巡視船での洋上給油を中継して現場海域へ投入します。<br />
                    <strong>任務目標：『海図上の怪物の潜航位置を推測し、ソノブイを投下して相手との距離を割り出し、その姿（映像）を捉えよ！』</strong>
                  </p>
                </div>

                {/* ② 【海図・火山監視図】タブ切り替え表示エリア */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg space-y-3">
                  {/* 海図ヘッダー ＆ タブ切り替えバー */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    {/* タブ切り替えボタン群 */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
                      <button
                        type="button"
                        onClick={() => setDay3MapTab("tactical")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition shadow ${
                          day3MapTab === "tactical"
                            ? "bg-cyan-600 text-white ring-1 ring-cyan-400"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                        【作戦海図 W-3100】洋上ソナー索敵作戦図
                      </button>
                      <button
                        type="button"
                        onClick={() => setDay3MapTab("overview")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition shadow ${
                          day3MapTab === "overview"
                            ? "bg-rose-700 text-white ring-1 ring-rose-400"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5 text-rose-400" />
                        【火山活動監視図】伊豆・小笠原火山弧 全域
                      </button>
                    </div>

                    {/* アクションボタン群 */}
                    <div className="flex items-center gap-2">
                      <a
                        href={
                          day3MapTab === "tactical"
                            ? "/images/day3_sonar_tactical_chart.svg"
                            : "/images/eruption_monitoring_chart.svg"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-slate-300 transition border border-slate-700"
                        title="別タブで原寸SVGを開く"
                      >
                        <ExternalLink className="h-3 w-3" /> 別タブで開く
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setDay3MapTab("tactical");
                          setDay3MapMode("gm");
                          setIsTheaterModalOpen(true);
                        }}
                        className="flex items-center gap-1 rounded bg-rose-800 hover:bg-rose-700 px-2.5 py-1 text-[11px] font-bold text-white transition shadow border border-rose-700"
                        title="GM用マップ（真相・怪物の位置）を大画面で開く"
                      >
                        <ShieldAlert className="h-3 w-3 text-amber-300" /> GM用大画面
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTheaterModalOpen(true)}
                        className={`flex items-center gap-1 rounded px-3 py-1 text-[11px] font-bold text-white transition shadow ${
                          day3MapTab === "tactical"
                            ? "bg-cyan-700 hover:bg-cyan-600"
                            : "bg-rose-700 hover:bg-rose-600"
                        }`}
                      >
                        <Maximize2 className="h-3 w-3" /> 大画面で開く
                      </button>
                    </div>
                  </div>

                  {/* タブに応じたメイン表示部 */}
                  {day3MapTab === "tactical" ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl aspect-[16/10] max-h-96">
                        <Day3TacticalMap
                          defaultMode={day3MapMode}
                          onSelectDropPoint={(id) => handleToggleDay3SonarDrop(id)}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-300">
                        <span>
                          📍 <strong>縮尺 1:200,000</strong> ｜ 給油拠点: 海図左下 PLH-31「あきつしま」(セクターF-1) ｜ 1セクター: 約20km四方
                        </span>
                        <span className="text-cyan-400 font-mono">
                          全36セクター（6×6グリッド）索敵盤
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        onClick={() => setIsTheaterModalOpen(true)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-[#081325] aspect-video max-h-80 flex items-center justify-center shadow-lg"
                      >
                        <EruptionMonitoringChart day={3} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                          <span className="text-[11px] font-semibold text-slate-200">
                            🔴 広域噴火観測記録: 西之島(Day 1) ➔ 鳥島沖(Day 2) ｜ 北上速度: 時速約6km (日速約150km)
                          </span>
                          <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                            クリックして大画面拡大
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1">
                        <p>
                          ・<strong>連動噴火の確認</strong>：西之島から鳥島までの約380kmを24時間で正確に到達。深海を北上する物体の通過が海底火山を次々と刺激して噴火を誘発している動かぬ証拠。
                        </p>
                        <p>
                          ・<strong>未噴火警戒海域</strong>：北方に連なる須美寿島、青ヶ島、八丈島、伊豆諸島、駿河湾・富士山方面は現時点で未噴火（残り4日で本土直下に到達する計算）。
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ③ メイン協力パズル：アクティブソナー投下作戦（全36セクター索敵盤） */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3.5 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Radar className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-xs text-white">
                        【メイン協力パズル】アクティブ・ソノブイ投下（全36セクター索敵盤）
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-300">
                        ヘリ搭載ソノブイ:{" "}
                        <strong className={day3DroppedPoints.length === 3 ? "text-amber-400" : "text-cyan-400"}>
                          {3 - day3DroppedPoints.length}機 残り
                        </strong>{" "}
                        ({day3DroppedPoints.length} / 3 投下済)
                      </span>
                      {day3DroppedPoints.length > 0 && (
                        <button
                          onClick={handleResetDay3Sonar}
                          className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition"
                        >
                          リセット
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    怪物はDay 2朝の鳥島沖から時速約6kmで北上中。全36セクター（ROW-A〜F × COL-1〜6）の中から、ソノブイを投下する海域セクターをクリックして選定してください（最大3機）。<br />
                    <span className="text-slate-400">
                      ※海底カルデラ（D-2 / E-2）付近は海底熱水の微細気泡散乱（クラッター障害）により周囲探知が不能となります。海図の熱水域を避けて投下してください。
                    </span>
                  </p>

                  {/* 全36セクター グリッド盤（ROW-A〜F × COL-1〜6） */}
                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 overflow-x-auto">
                    <div className="min-w-[320px] space-y-1">
                      {/* 列番号ヘッダー */}
                      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-cyan-400 font-bold">
                        <div className="text-slate-500">ROW\COL</div>
                        {DAY3_SECTOR_COLS.map((c) => (
                          <div key={c}>- {c} -</div>
                        ))}
                      </div>

                      {/* 各行のセクターボタン */}
                      {DAY3_SECTOR_ROWS.map((r) => (
                        <div key={r} className="grid grid-cols-7 gap-1 items-center">
                          <div className="text-center font-mono text-[10px] text-cyan-400 font-bold">
                            {r}
                          </div>
                          {DAY3_SECTOR_COLS.map((c) => {
                            const sectorId = `${r}-${c}`;
                            const isDropped = day3DroppedPoints.includes(sectorId);
                            const evalRes = isDropped ? evaluateSectorSonar(sectorId) : null;
                            const isTarget = day3TargetSector === sectorId;
                            return (
                              <button
                                key={sectorId}
                                type="button"
                                onClick={() => handleToggleDay3SonarDrop(sectorId)}
                                className={`rounded p-1 text-center font-mono transition border relative flex flex-col items-center justify-center min-h-[38px] ${
                                  isDropped
                                    ? evalRes?.status === "direct_hit"
                                      ? "border-emerald-400 bg-emerald-950 text-emerald-200 ring-2 ring-emerald-400 shadow"
                                      : evalRes?.status === "adjacent_detect"
                                      ? "border-cyan-400 bg-cyan-950 text-cyan-200 ring-1 ring-cyan-400"
                                      : evalRes?.status === "clutter_hazard"
                                      ? "border-amber-500 bg-amber-950 text-amber-200 ring-1 ring-amber-400"
                                      : "border-slate-700 bg-slate-950 text-slate-400"
                                    : isTarget
                                    ? "border-cyan-500 bg-cyan-950/40 text-cyan-200"
                                    : "border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300"
                                }`}
                                title={`セクター ${sectorId} ${isDropped ? "（投下済）" : "（クリックで投下）"}`}
                              >
                                <span className="text-[10px] font-bold leading-none">{sectorId}</span>
                                {isDropped && evalRes && (
                                  <span className="text-[8px] font-semibold mt-0.5 leading-none">
                                    {evalRes.status === "direct_hit" && "🎯HIT"}
                                    {evalRes.status === "adjacent_detect" && "📡至近"}
                                    {evalRes.status === "clutter_hazard" && "⚠️障害"}
                                    {evalRes.status === "no_return" && "⭕不在"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 投下済みセクターのソナー反響ログ */}
                  {day3DroppedPoints.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        投下ソナー反響解析ログ ({day3DroppedPoints.length}機):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {day3DroppedPoints.map((sectorId) => {
                          const evalRes = evaluateSectorSonar(sectorId);
                          return (
                            <div
                              key={sectorId}
                              className={`rounded-lg border p-2.5 text-xs ${
                                evalRes.status === "direct_hit"
                                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-200"
                                  : evalRes.status === "adjacent_detect"
                                  ? "border-cyan-700 bg-cyan-950/40 text-cyan-200"
                                  : evalRes.status === "clutter_hazard"
                                  ? "border-amber-700 bg-amber-950/40 text-amber-200"
                                  : "border-slate-800 bg-slate-900/60 text-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                  セクター {sectorId}
                                </span>
                                <span className="text-[10px] font-bold">{evalRes.title}</span>
                              </div>
                              <p className="text-[11px] leading-tight font-medium">
                                {evalRes.summary}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                {evalRes.details}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 捜索ヘリ急行・セクター特定宣言バー */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          🚁 捜索ヘリ急行目標セクター選定:
                        </span>
                        <select
                          value={day3TargetSector}
                          onChange={(e) => setDay3TargetSector(e.target.value)}
                          className="rounded bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          {DAY3_SECTOR_ROWS.flatMap((r) =>
                            DAY3_SECTOR_COLS.map((c) => {
                              const sId = `${r}-${c}`;
                              return (
                                <option key={sId} value={sId}>
                                  セクター {sId}
                                </option>
                              );
                            })
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={() => setDay3TargetSector(CREATURE_SECTOR)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                        >
                          (B-3を選択)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecuteDay3HelicopterSearch}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        捜索ヘリ急行！ 浮上海域の目視・写真撮影を決行
                      </button>
                    </div>

                    {/* 実行結果バナー */}
                    {day3SearchOutcome === "success" && (
                      <div className="rounded-md border border-emerald-500/80 bg-emerald-950/60 p-2.5 text-emerald-200 text-xs flex items-start gap-2 shadow">
                        <Crosshair className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 animate-spin-slow" />
                        <div>
                          <strong className="text-white block font-bold">
                            🎉【セクター特定 成功！】（セクター B-3 水深400m）
                          </strong>
                          <p className="mt-0.5 text-[11px] text-emerald-300">
                            ソナー音波を捉えられた怪物が海面近く（水深10〜20m）へ急速浮上！ 急行した捜索ヘリが上空後方から目視確認し、巨大な触手と胴体の写真撮影に成功しました！
                          </p>
                          <span className="text-[10px] text-slate-300 mt-1 inline-block">
                            👇 下部の<strong>【洋上ヘリ航空偵察 写真記録】</strong>にて、撮影された高解像度写真と観測所見を確認できます。
                          </span>
                        </div>
                      </div>
                    )}

                    {day3SearchOutcome === "failure" && (
                      <div className="rounded-md border border-amber-600/80 bg-amber-950/60 p-2.5 text-amber-200 text-xs flex items-start gap-2 shadow">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block font-bold">
                            ⚠️【セクター特定 失敗（捜索空振り）】（セクター {day3TargetSector}）
                          </strong>
                          <p className="mt-0.5 text-[11px] text-amber-300">
                            指定したセクターに怪物は不在！ 約20km彼方の海面に怪物が起こした異常な大波を目視するも、ヘリが到達したときにはすでに深海800mへと急速潜航してしまっていました。
                          </p>
                          <span className="text-[10px] text-slate-300 mt-1 inline-block">
                            👇 下部の<strong>【洋上ヘリ航空偵察 写真記録】</strong>にて、撮影された遠方波紋写真と捜索失敗ログを確認できます。
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ④ 【Day 3 洋上ヘリ航空偵察 写真記録（光学・赤外線カメラ所見）】 */}
                <div className="rounded-xl border border-cyan-800/80 bg-[#071322] p-4 space-y-3 shadow-xl">
                  {/* ヘッダー ＆ 写真切り替えタブ */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-cyan-400" />
                      <div>
                        <span className="font-bold text-xs text-white">
                          【Day 3 洋上ヘリ航空偵察 写真記録】光学望遠カメラ所見
                        </span>
                        <span className="ml-2 text-[10px] text-cyan-300 font-mono">
                          海上保安庁 羽田航空基地 / 小笠原救難隊 捜索ヘリ撮影記録
                        </span>
                      </div>
                    </div>

                    {/* 成功 / 失敗 写真切り替えボタン */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
                      <button
                        type="button"
                        onClick={() => setDay3ActivePhotoTab("success")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                          day3ActivePhotoTab === "success"
                            ? "bg-emerald-600 text-white shadow ring-1 ring-emerald-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📷 【特定成功時】巨大生物 後方空撮写真
                      </button>
                      <button
                        type="button"
                        onClick={() => setDay3ActivePhotoTab("failure")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                          day3ActivePhotoTab === "failure"
                            ? "bg-amber-600 text-white shadow ring-1 ring-amber-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🌊 【特定失敗時】20km彼方 航跡波写真
                      </button>
                    </div>
                  </div>

                  {/* タブに応じた写真カード */}
                  {day3ActivePhotoTab === "success" ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                      {/* 写真プレビュー（左側 7カラム） */}
                      <div
                        onClick={() => setDay3PhotoModal("success")}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-emerald-800 bg-black md:col-span-7 aspect-video flex items-center justify-center shadow-lg"
                      >
                        <img
                          src="/images/day3_sonar_success_photo.jpg"
                          alt="巨大生物 後方空撮写真（特定成功）"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                          <span className="text-[11px] font-semibold text-emerald-200">
                            🎯 セクター特定成功：深度10〜20m浮上中・後方撮影
                          </span>
                          <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-white backdrop-blur flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" /> クリックで拡大
                          </span>
                        </div>
                      </div>

                      {/* 観測所見・テレメトリ（右側 5カラム） */}
                      <div className="md:col-span-5 flex flex-col justify-between rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-2 text-xs">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                            <span className="font-bold text-emerald-300 text-xs">
                              【特定成功：光学望遠カメラ観測調書】
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                              セクター B-3
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 mb-2">
                            <div>高度: <strong>2,500 ft (約760m)</strong></div>
                            <div>海域: <strong>鳥島北西 約40km</strong></div>
                            <div>速度: <strong>時速約6km 北上</strong></div>
                            <div>機材: <strong>通常光学望遠カメラ</strong></div>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                            <p>
                              ・<strong className="text-white">深海に溶け込む巨大な質量</strong>: 本体の輪郭線は特定の生物の形としては定まらず、<strong>海面下に潜む広大な深海シャドウ（漆黒の巨大質量）</strong>としてぼんやりと認識されるのみ。
                            </p>
                            <p>
                              ・<strong className="text-white">目視される無数の触手群</strong>: ぼやけた本体の後背部から、<strong>20本を超える無数の触手・触腕だけが海中を長く直線的にたなびく姿</strong>が鮮明に確認できる。
                            </p>
                            <p>
                              ・<strong className="text-white">繊細なケルビン波（航跡波）</strong>: 前進遊泳に伴い、海面にはごく控えめな薄い白波がV字型に広がり、巨大な質量が深海を時速約6kmで着実に北上している様子を捉えている。
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDay3PhotoModal("success")}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3.5 w-3.5" /> 成功写真を大画面で検証する
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                      {/* 写真プレビュー（左側 7カラム） */}
                      <div
                        onClick={() => setDay3PhotoModal("failure")}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-amber-800 bg-black md:col-span-7 aspect-video flex items-center justify-center shadow-lg"
                      >
                        <img
                          src="/images/day3_sonar_failure_photo.jpg"
                          alt="20km彼方 航跡波写真（特定失敗）"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                          <span className="text-[11px] font-semibold text-amber-200">
                            ⚠️ セクター特定失敗：約21km彼方に航跡波のみ確認
                          </span>
                          <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-white backdrop-blur flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" /> クリックで拡大
                          </span>
                        </div>
                      </div>

                      {/* 観測所見・テレメトリ（右側 5カラム） */}
                      <div className="md:col-span-5 flex flex-col justify-between rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-2 text-xs">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                            <span className="font-bold text-amber-300 text-xs">
                              【特定失敗：遠方目視観測調書】
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300">
                              RANGE: 21.3 KM
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 mb-2">
                            <div>高度: <strong>1,850 ft (約560m)</strong></div>
                            <div>距離: <strong>目標まで 約21 km</strong></div>
                            <div>海域: <strong>船舶なし（完全外洋）</strong></div>
                            <div>機材: <strong>通常光学望遠カメラ</strong></div>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                            <p>
                              ・<strong className="text-white">超遠方目視</strong>: 船舶の全くない広大な外洋の<strong>約21km彼方（水平線手前）</strong>に、巨大生物の起こした異常な海水隆起と白波の泡立ちを観測。
                            </p>
                            <p>
                              ・<strong className="text-white">ヘリ急行後</strong>: ヘリが現場へ到達したときには、怪物は接近を察知してすでに深海800m以深へ急速潜航してしまっており捉えられない。
                            </p>
                            <p>
                              ・<strong className="text-white">GM進行メモ</strong>: 特定失敗時はこの写真を提示し、「20km以上先で大波を目視したが、急行した時にはすでに潜航してしまっていた」と説明してください。
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDay3PhotoModal("failure")}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded bg-amber-700 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3.5 w-3.5" /> 失敗写真を大画面で検証する
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ④ PC6 専用個別ハンドアウト（神社の特別儀式：海に出て毎日祝詞を唱える言い伝え） */}
                <div className="rounded-xl border border-indigo-800 bg-[#0e0e24] p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Scroll className="h-4 w-4 text-indigo-400" />
                      <span className="font-bold text-xs text-white">
                        【PC6（神職）専用 個別ハンドアウト】社家に伝わる海鳴りの言い伝え
                      </span>
                    </div>
                    <button
                      onClick={() => setDay3IsPC6ModalOpen(true)}
                      className="rounded bg-indigo-600 hover:bg-indigo-500 px-2.5 py-0.5 text-[10px] font-bold text-white transition shadow"
                    >
                      個別シートを全画面で開く
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    「南の海にて火の山が連なりて火を吹き、海の中を巨大なる何ものかが北へと泳ぎ去るとき……島人は沖へ舟を漕ぎ出し、海に向かいて毎日、祝詞を唱えねばならぬ」
                  </p>
                  <div className="rounded bg-indigo-950/60 border border-indigo-900/80 p-2 text-[10px] text-amber-200">
                    ⚠️ <strong>【PC6 プレイヤー心得（重要制約）】</strong>:
                    現時点であなたが知っているのは<strong>「火山が連続で爆発し、巨大なものが海を移動するときには、海に出て毎日祝詞を唱える特別な儀式が存在する」ということだけ</strong>です。具体的な祝詞の文言や奏上方法は古文書にも記されておらず、現時点では一切分かりません。（Day 6までお預けとなります）
                  </div>
                </div>

                {/* ⑤ 【Day 3 終盤：写真鑑定相談・防衛判断 ＆ 合議制司令官最終意思決定パネル】 */}
                <div className="rounded-xl border border-amber-600/70 bg-[#15100e] p-4 space-y-4 shadow-xl">
                  {/* ヘッダー */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-amber-400" />
                      <div>
                        <span className="font-bold text-xs text-white">
                          【Day 3 終盤合同合議 ＆ 司令官最終意思決定】
                        </span>
                        <span className="ml-2 text-[10px] text-amber-300 font-mono">
                          海上保安庁の諮問（生物学鑑定 ＆ 防衛出動要否）と司令官（PC1）の決断
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="rounded bg-amber-950 px-2 py-0.5 font-bold text-amber-300 border border-amber-700">
                        合議制（全員参加）
                      </span>
                      <span className="rounded bg-rose-950 px-2 py-0.5 font-bold text-rose-300 border border-rose-700">
                        最終決定: PC1（司令官）
                      </span>
                    </div>
                  </div>

                  {/* 状況ナレーション */}
                  <div className="rounded-lg bg-amber-950/30 border border-amber-800/40 p-3 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Radio className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      【海上保安庁 警備救難部からの緊急諮問】
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      洋上ヘリが撮影した写真（海面下に潜む漆黒の巨大質量と20本以上の無数の触手群）を受け、現場の海上保安庁は緊迫しています。<br />
                      「全長数百mの潜航物体……これは到底、海上保安庁の巡視船や警察比例の原則で対応できる事態ではない」。<br />
                      海上保安庁は直ちに合同対策本部に対し、<strong>【海洋生物学者（PC5）への写真鑑定の相談】</strong>と、<strong>【防衛庁リエゾン（PC2）への自衛隊出動判断の要請】</strong>を行いました。全員で合議した上で、<strong>対策本部司令官（PC1）</strong>が最終意思決定を下します。
                    </p>
                  </div>

                  {/* ステップ1：海洋生物学者（PC5）への相談 */}
                  <div className="rounded-lg border border-teal-800/80 bg-teal-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-teal-900/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-teal-400" />
                        <span className="font-bold text-xs text-teal-200">
                          ① 海上保安庁 ➔ PC5（海洋生物学者）への相談: 写真の生物学的解釈
                        </span>
                      </div>
                      <span className="text-[10px] text-teal-300 font-mono bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        PC5 専門領域
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      「PC5准教授、この写真（海面下の巨大影と無数の触手）を生物学的にどう解釈されますか？通常のダイオウイカ（10本）と明らかに異なる20本以上の触手、そして数百mの巨大質量。専門家としての所見を提示してください」
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDay3Pc5Opinion("colony_theory")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc5Opinion === "colony_theory"
                            ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">見解A: 群体性仮説</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc5Opinion === "colony_theory" ? "bg-teal-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc5Opinion === "colony_theory" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          単一の生物としてこのサイズと触手数は解剖学的に不自然。<strong>数十〜百匹以上のダイオウイカが高密度に結合した超群体（コロニー）</strong>の可能性が濃厚。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay3Pc5Opinion("mutation_theory")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc5Opinion === "mutation_theory"
                            ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">見解B: 深海変異種仮説</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc5Opinion === "mutation_theory" ? "bg-teal-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc5Opinion === "mutation_theory" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          深海底の極限水圧・火山熱水環境で独自進化した<strong>未知の超巨大深海生物、あるいは変異体</strong>。複数の触手束を自律協調させて遊泳している。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay3Pc5Opinion("volcano_attraction")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc5Opinion === "volcano_attraction"
                            ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">見解C: 火山熱源誘引説</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc5Opinion === "volcano_attraction" ? "bg-teal-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc5Opinion === "volcano_attraction" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          西之島から鳥島へと海底火山を一直線に刺激して北上中。<strong>火山の熱源・電磁波を感知して誘引</strong>されており、本土直下の火山帯へ向かっている。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ステップ2：防衛庁リエゾン（PC2）への判断要請 */}
                  <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-indigo-400" />
                        <span className="font-bold text-xs text-indigo-200">
                          ② 海上保安庁 ➔ PC2（防衛庁リエゾン）への要請: 自衛隊出動の必要性判断
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        PC2 専門領域
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      「PC2リエゾン、海上保安庁法20条に基づく警察官職務執行法の範囲では、全長数百mの潜航物体に対する制圧・強制排除は不可能です。法的に自衛隊の防衛出動、あるいは治安出動・海上警備行動を要請すべきか、防衛庁としての判断を求めます」
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDay3Pc2Decision("defense_action")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc2Decision === "defense_action"
                            ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">判断A: 防衛出動（即時迎撃）</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc2Decision === "defense_action" ? "bg-indigo-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc2Decision === "defense_action" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          通常警察権での対処は不能。国家主権・国民生命への侵害と見なし、<strong>即刻『防衛出動』の閣議決定を具申</strong>。八丈島南方に潜水艦隊・護衛艦隊の迎撃ラインを展開すべき。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay3Pc2Decision("maritime_security")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc2Decision === "maritime_security"
                            ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">判断B: 海上警備行動（段階的展開）</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc2Decision === "maritime_security" ? "bg-indigo-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc2Decision === "maritime_security" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          未知の海洋生物に対する防衛出動適用は官邸での法理調整を要する。まず<strong>自衛隊法82条『海上警備行動』を発令</strong>して哨戒機・潜水艦で追尾し、迎撃態勢を整えるべき。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay3Pc2Decision("cautious_review")}
                        className={`rounded-lg p-2.5 text-left transition border ${
                          day3Pc2Decision === "cautious_review"
                            ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                            : "border-slate-800 bg-slate-950/70 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">判断C: 慎重姿勢・情報隠蔽懸念</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            day3Pc2Decision === "cautious_review" ? "bg-indigo-600 text-white" : "text-slate-500"
                          }`}>
                            {day3Pc2Decision === "cautious_review" ? "選択中" : "選択"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          水深400〜800mの超巨大生物に対し既存魚雷が有効か未知数。社会パニック回避のため官邸の完全隠蔽命令も予想されるため、<strong>兵器迎撃の前に実効性を精査</strong>すべき。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ステップ3：全PC参加の合議制ガイド */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/90 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        ③ 合同対策本部 全員による合議制（ディスカッション）
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ※合議制ですが、最終意思決定は司令官（PC1）が下します
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-indigo-300 block">PC1: 司令官</strong>
                        全体統括・官邸および防衛省との折衝・全責任の受託
                      </div>
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-indigo-300 block">PC2: 防衛庁リエゾン</strong>
                        軍事力投入の可否・交戦規定（ROE）の策定
                      </div>
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-teal-300 block">PC3: 救難隊長</strong>
                        島民避難・民間船の安全確保・現地海域の危険性
                      </div>
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-teal-300 block">PC4: 観測員</strong>
                        火山連動シミュレーションと本土到達カウントダウン
                      </div>
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-teal-300 block">PC5: 海洋生物学者</strong>
                        写真鑑定所見・超群体の可能性・火山熱源誘引の阻止
                      </div>
                      <div className="rounded bg-slate-950 p-2 border border-slate-800">
                        <strong className="text-teal-300 block">PC6: 神職</strong>
                        古文書の海鳴り・海に出て祝詞を唱える儀式の予兆
                      </div>
                    </div>
                  </div>

                  {/* ステップ4：司令官（PC1）の最終意思決定 */}
                  <div className="rounded-xl border border-rose-800/80 bg-rose-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-xs text-white">
                            ④ 【対策本部司令官（PC1） 最終意思決定】
                          </span>
                          <span className="ml-2 text-[10px] text-rose-300 font-mono">
                            全員の合議を受け、本部長として最終決定を下す
                          </span>
                        </div>
                      </div>
                      {day3HqFinalDecision && (
                        <span className="flex items-center gap-1 rounded bg-emerald-950 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> 決定確定済
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      議論・相談は合議制で行われますが、<strong>最終的な作戦方針の決定は司令官（PC1）が一任</strong>されます。<br />
                      PC5の生物学的見解（{day3Pc5Opinion === "colony_theory" ? "群体性仮説" : day3Pc5Opinion === "mutation_theory" ? "深海変異種仮説" : "火山熱源誘引説"}）およびPC2の防衛判断（{day3Pc2Decision === "defense_action" ? "防衛出動具申" : day3Pc2Decision === "maritime_security" ? "海上警備行動先行" : "慎重姿勢"}）を踏まえ、司令官としての方針を決定してください。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setDay3HqFinalDecision("defense_dispatch")}
                        className={`rounded-lg p-3 text-left transition border ${
                          day3HqFinalDecision === "defense_dispatch"
                            ? "border-rose-400 bg-rose-950/80 shadow-lg ring-2 ring-rose-400"
                            : "border-slate-800 bg-slate-950/80 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-rose-400" />
                            方針①: 防衛出動を正式要請（武力迎撃ライン展開）
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            day3HqFinalDecision === "defense_dispatch"
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {day3HqFinalDecision === "defense_dispatch" ? "決定済み" : "この方針で決定"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          「官邸・防衛省へ自衛隊の防衛出動を正式要請する！八丈島南方に潜水艦隊および対潜哨戒機による武力迎撃陣形を展開させ、同時に現地には島民避難準備を命じる！」
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay3HqFinalDecision("maritime_guard")}
                        className={`rounded-lg p-3 text-left transition border ${
                          day3HqFinalDecision === "maritime_guard"
                            ? "border-rose-400 bg-rose-950/80 shadow-lg ring-2 ring-rose-400"
                            : "border-slate-800 bg-slate-950/80 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Anchor className="h-3.5 w-3.5 text-cyan-400" />
                            方針②: 海上警備行動を発令（段階的迎撃 ＆ 避難優先）
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            day3HqFinalDecision === "maritime_guard"
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {day3HqFinalDecision === "maritime_guard" ? "決定済み" : "この方針で決定"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          「自衛隊へ海上警備行動を発令し、潜水艦による追尾・迎撃陣形を先行展開。防衛出動の法制調整を進めつつ、現地島民の避難誘導と火山監視の強化を優先させる！」
                        </p>
                      </button>
                    </div>

                    {/* 意思決定確定後のフィードバック＆Day 4への移行演出 */}
                    {day3HqFinalDecision && (
                      <div className="rounded-lg border border-emerald-500/80 bg-emerald-950/70 p-3.5 space-y-2 text-xs text-emerald-200 shadow-lg animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin-slow" />
                            <strong className="text-white text-xs">
                              🎉【Day 3 作戦全完了 ＆ 司令官最終意思決定 確定】
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDay3HqFinalDecision(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                          >
                            再検討する
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-100 leading-relaxed">
                          対策本部司令官（PC1）の英断に基づき、官邸および防衛省統合幕僚監部へ緊急打電が行われました。<br />
                          <strong>選定された方針</strong>: {day3HqFinalDecision === "defense_dispatch" ? "自衛隊への防衛出動正式要請（八丈島南方迎撃陣形の展開）" : "海上警備行動の発令（段階的追尾迎撃と島民避難先行）"}<br />
                          <strong>生物学的見解（PC5）</strong>: {day3Pc5Opinion === "colony_theory" ? "超群体（コロニー）仮説" : day3Pc5Opinion === "mutation_theory" ? "深海変異種仮説" : "火山熱源誘引説"}<br />
                          <strong>防衛庁判断（PC2）</strong>: {day3Pc2Decision === "defense_action" ? "防衛出動即時迎撃具申" : day3Pc2Decision === "maritime_security" ? "海上警備行動先行" : "慎重姿勢"}
                        </p>
                        <div className="rounded bg-black/40 border border-emerald-700/60 p-2 text-[11px] text-slate-200">
                          🌊 <strong>これにて【Day 3】の全事象が完結しました。</strong><br />
                          事態は【<strong>Day 4：須美寿島〜青ヶ島沖（須美寿島沖海底噴火・内閣不作為と防衛庁意見聴取・八丈島前線情報収集と現地4大真相調査）</strong>】へと繋がります！
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- DAY 4 プレイヤー提供情報：須美寿島沖海底噴火 ＆ 合議制アクション --- */}
            {selectedDay === 4 && (
              <div className="rounded-xl border border-red-800 bg-[#140810] p-4 shadow-lg space-y-4">
                {/* ヘッダー */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="font-bold text-xs text-white">
                        【Day 4 緊急事態】須美寿島〜青ヶ島沖海底噴火 ＆ 政府・現地真相調査作戦
                      </span>
                      <span className="ml-2 text-[10px] text-rose-300 font-mono">
                        須美寿〜青ヶ島沖 連動大爆発 ｜ 八丈島・青ヶ島 群発微動 ｜ 父島帰還
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                      現地組: 父島本島帰還
                    </span>
                    <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                      東京組: 八丈島・近海情報収集
                    </span>
                  </div>
                </div>

                {/* 部隊再配置＆八丈島情報収集バナー */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-teal-900/80 bg-teal-950/30 p-2.5 text-xs text-teal-200 flex items-start gap-2">
                    <Anchor className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold text-[11px]">
                        ⚓ 小笠原現地組（PC3〜PC6）：洋上展開終了・父島本島へ帰還
                      </strong>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                        長距離ヘリ捜索および巡視船給油ミッションを完遂し、父島二見港へ帰還。島民避難の受け入れと、島に残された記録の調査体制へ移行。
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-indigo-900/80 bg-indigo-950/30 p-2.5 text-xs text-indigo-200 flex items-start gap-2">
                    <Radio className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold text-[11px]">
                        📡 東京司令部（PC1, PC2）：八丈島前線情報の緊急収集
                      </strong>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                        八丈島総合開発センターおよび近海漁協との通信ホットラインを確立。火山性微動に怯える島民の肉声や、八丈島沖で操業する漁船の魚探（アクティブソナー）が捉えた海中物体の最新情報の照会・分析に着手。
                      </p>
                    </div>
                  </div>
                </div>

                {/* ① 海上保安庁 火山活動監視状況図（Day 4更新版） */}
                <div className="rounded-xl border border-rose-900/70 bg-[#0c1322] p-4 shadow-md space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-400" />
                      <div>
                        <span className="font-bold text-xs text-white">
                          【火山活動監視図 WGS84】須美寿島〜青ヶ島沖海底噴火 ＆ 地震観測（Day 4更新版）
                        </span>
                        <span className="ml-2 text-[10px] text-rose-300 font-mono">
                          CHART NO. V-2024 / 噴火ドミノ北上
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/images/eruption_monitoring_chart_day4.svg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition border border-slate-700"
                      >
                        <ExternalLink className="h-3 w-3" /> 別タブで開く
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsDay4MapModalOpen(true)}
                        className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                      >
                        <Maximize2 className="h-3 w-3" /> 大画面で開く
                      </button>
                    </div>
                  </div>

                  {/* 海図カード */}
                  <div
                    onClick={() => setIsDay4MapModalOpen(true)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-[#081325] aspect-[16/10] max-h-72 flex items-center justify-center p-2 shadow-2xl transition hover:border-rose-500"
                  >
                    <EruptionMonitoringChart
                      day={4}
                      className="w-full h-full object-contain transition duration-200 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                        🔴 【Day 3 噴火】須美寿〜青ヶ島沖海底カルデラ連動噴火 ｜ ⚡ 八丈島・青ヶ島 地震観測
                      </span>
                      <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> クリックで大画面拡大
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                    <p>
                      ・<strong>須美寿島〜青ヶ島沖の噴火地点</strong>：鳥島沖を通過した物体が北上を続け、須美寿島〜青ヶ島沖（31°40&apos;N, 139°50&apos;E）の海底カルデラで連動大爆発を誘発。海図西側の開けた海域に引き出し線で「🔴 Day 3 須美寿〜青ヶ島沖海底噴火」として他の地名に被らずプロット。
                    </p>
                    <p>
                      ・<strong>青ヶ島・八丈島の地震観測 ＆ 富士山到達危機</strong>：連動噴火に伴い、青ヶ島・八丈島で震度1〜2の火山性群発微動が連続観測。日速約150kmで北上するこの火山フロントは、伊豆諸島を通過して【富士山直下】へ到達し、破局的大噴火を引き起こす壊滅的危機をプレイヤー側が指摘・警戒すべき重要推理ポイントです。
                    </p>
                    <p>
                      ・<strong>司令官（PC1）が持ち帰った隕石片と怪物の北上動機</strong>：1ヶ月前に全員が目撃した流星雨の際、司令官（PC1）だけが海岸で拾って東京へ持ち帰っていた『小さな隕石のかけら』や、海底から引き揚げられた隕石を生物が追って北上しているのではないかという重大仮説を検討するフェーズです。500km以上離れた距離から小片が直接何かを誘引することは物理的に困難である一方、特異な結晶構造や微弱な残留磁気を持つ同一天体由来の破片であり、海底環境の変化や引き揚げられた約30kgの海底隕石が何らかの形で生物を引き寄せているのではないかという疑惑・可能性を、東京・小笠原双方の『隕石調査』を通じて議論します。
                    </p>
                  </div>
                </div>

                {/* ② Day 3 司令官決定に基づく内閣・防衛省の反応分岐バナー */}
                <div className="rounded-xl border border-amber-700/70 bg-[#16100e] p-3.5 space-y-2.5 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/60 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                      <Scale className="h-4 w-4 text-amber-400" />
                      【Day 3 意思決定の結末】政府（内閣官房）および防衛省からの返答
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
                      <span className="text-slate-400">Day 3 司令官の決断:</span>
                      <button
                        type="button"
                        onClick={() => setDay3HqFinalDecision("defense_dispatch")}
                        className={`px-2 py-0.5 rounded transition ${
                          (day3HqFinalDecision === "defense_dispatch" || !day3HqFinalDecision)
                            ? "bg-rose-700 text-white font-bold ring-1 ring-rose-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        防衛出動要請
                      </button>
                      <button
                        type="button"
                        onClick={() => setDay3HqFinalDecision("maritime_guard")}
                        className={`px-2 py-0.5 rounded transition ${
                          day3HqFinalDecision === "maritime_guard"
                            ? "bg-indigo-700 text-white font-bold ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        要請なし
                      </button>
                    </div>
                  </div>

                  {(day3HqFinalDecision === "defense_dispatch" || !day3HqFinalDecision) ? (
                    <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-3 text-xs text-rose-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                        🏛️ 【内閣・官邸からの返答：自衛隊防衛出動は見送り（内閣の不作為）】
                      </div>
                      <p className="text-[11px] text-slate-200 italic leading-relaxed">
                        「内閣総理大臣および官邸危機管理センターより通達。『鳥島〜青ヶ島沖の海底噴火と、海保の報告する未確認潜航物体との因果関係が科学的に立証されていない。防衛出動の要件（武力攻撃事態等）には該当せず、現段階での自衛隊部隊出動は見送る。当面は海上保安庁が情報収集および警戒にあたれ』」
                      </p>
                      <div className="rounded bg-rose-900/40 border border-amber-700/60 p-2.5 text-[11px] text-amber-100 space-y-1">
                        <strong className="text-amber-300 block font-bold flex items-center gap-1">
                          🛡️ 防衛庁・防衛省リエゾン（PC2）からの緊急打診：『この生物はどこへ向かっている見立てなのか？』
                        </strong>
                        <p className="italic text-slate-200 leading-relaxed">
                          「内閣は因果関係不明を理由に出動を保留したが、防衛庁としては深刻な脅威と認識している。内閣を説得し再上申を通すには、より確固たる論拠が必要だ。【この生物は一体どこへ向かっている見立てなのか？】対策本部の進路予測・分析を至急提示してほしい」
                        </p>
                      </div>
                      <p className="text-[10px] text-amber-200/90 font-medium">
                        💡 <strong>戦略的示唆</strong>: 司令官が必死に出動要請したにもかかわらず内閣は動かない一方、防衛庁から『どこへ向かっているのか』の意見聴取が行われます。対策本部（司令官・海洋生物学者・気象観測員ら）が提示する見立てや根拠（火山連動の北上軸・駿河湾や富士山直撃など）の論理性によって、<strong>防衛庁側が内閣を再説得できるかどうかの説得力・今後の部隊動員への働きかけが大きく左右されます</strong>。
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/40 p-3 text-xs text-indigo-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-300 text-xs">
                        <Radio className="h-4 w-4 text-indigo-400" />
                        🛡️ 【防衛省・統合幕僚監部からの緊急照会：生物の北上進路に関する意見聴取】
                      </div>
                      <p className="text-[11px] text-slate-200 italic leading-relaxed">
                        「防衛省運用企画局および海上幕僚監部より合同対策本部へ緊急照会。『対策本部が防衛出動を要請しなかった判断は了解した。しかし自衛隊としても伊豆諸島の連続噴火と潜航物体に重大な関心を持っている。【この生物は一体どこへ向かっている見立てなのか？】進路および最終到達予測地点に関する対策本部の専門的意見を至急提出されたし』」
                      </p>
                      <p className="text-[10px] text-indigo-200/90 font-medium">
                        💡 <strong>戦略的示唆</strong>: 防衛出動を求めなかった対策本部に対し、防衛省側から生物の進路と目的についての意見が厳しく問われています。回答内容によって今後の防衛庁の警戒態勢や協力関係、内閣への働きかけが変わることが示唆されます。
                      </p>
                    </div>
                  )}
                </div>

                {/* ③ Day 4 合議制アクション操作パネル（東京1枠 ＋ 小笠原現地2枠） */}
                <div className="rounded-xl border border-indigo-900/60 bg-[#0c1024] p-4 shadow-md space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-xs text-white">
                        【Day 4 合議制アクション】東京司令部調査（3枠中1枠） ＆ 小笠原現地調査（4枠中2枠）
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                        東京: 1枠
                      </span>
                      <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                        現地: {day4FieldActions.length}/2枠
                      </span>
                    </div>
                  </div>

                  {/* 東京司令部アクション */}
                  <div>
                    <span className="font-bold text-indigo-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Building2 className="h-3.5 w-3.5" /> 東京司令部アクション（3枠中1枠選択：隕石調査 ｜ 八丈島火山性微動 ｜ 八丈島島民・魚探情報）:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {DAY4_TOKYO_ACTIONS.map((a) => {
                        const isSelected = day4TokyoAction === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setDay4TokyoAction(a.id)}
                            className={`rounded-lg p-2.5 text-left border transition ${
                              isSelected
                                ? "border-indigo-400 bg-indigo-950/80 shadow ring-1 ring-indigo-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                              <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
                                {isSelected ? "選択中" : "未選択"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 line-clamp-2 mt-1">{a.summary}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 小笠原現地アクション */}
                  <div>
                    <span className="font-bold text-teal-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Anchor className="h-3.5 w-3.5" /> 小笠原現地アクション（4枠中2枠選択：隕石調査 ｜ 神社調査 ｜ ダイバー追跡 ｜ 写真画像解析）:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {DAY4_FIELD_ACTIONS.map((a) => {
                        const isSelected = day4FieldActions.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleToggleDay4FieldAction(a.id)}
                            className={`rounded-lg p-2.5 text-left border transition ${
                              isSelected
                                ? "border-teal-400 bg-teal-950/80 shadow ring-1 ring-teal-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                isSelected ? "bg-teal-600 text-white" : "text-slate-500"
                              }`}>
                                {isSelected ? "選択中" : "未選択"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 line-clamp-2 mt-1">{a.summary}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ④ 【選択されたアクションの調査結果レポート（解禁情報詳細）】 */}
                <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      【Day 4 選択アクション 調査結果・機密レポート】
                    </span>
                    <span className="text-[10px] text-slate-400">
                      合議で選定した情報（東京1件 ＋ 現地2件）の詳細調書
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 東京側レポート */}
                    {(() => {
                      const tokyoActionObj = DAY4_TOKYO_ACTIONS.find((a) => a.id === day4TokyoAction);
                      if (!tokyoActionObj) return null;
                      return (
                        <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/30 p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between border-b border-indigo-900/60 pb-1">
                            <span className="font-bold text-indigo-300 text-[11px]">
                              🏢 {tokyoActionObj.id} {tokyoActionObj.badge}
                            </span>
                            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-1 rounded">
                              {tokyoActionObj.organization}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-[11px]">
                            {tokyoActionObj.summary}
                          </p>
                          <p className="text-[10px] text-slate-300 leading-relaxed">
                            {tokyoActionObj.detail}
                          </p>
                        </div>
                      );
                    })()}

                    {/* 現地側レポート（2件） */}
                    {day4FieldActions.map((fId) => {
                      const fObj = DAY4_FIELD_ACTIONS.find((a) => a.id === fId);
                      if (!fObj) return null;
                      return (
                        <div key={fObj.id} className="rounded-lg border border-teal-800/80 bg-teal-950/30 p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between border-b border-teal-900/60 pb-1">
                            <span className="font-bold text-teal-300 text-[11px]">
                              🏝️ {fObj.id} {fObj.badge}
                            </span>
                            <span className="text-[9px] font-mono text-teal-400 bg-teal-950 px-1 rounded">
                              {fObj.organization}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-[11px]">
                            {fObj.summary}
                          </p>
                          <p className="text-[10px] text-slate-300 leading-relaxed">
                            {fObj.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ⑤ 【Day 4 最終フェーズ】防衛庁への最終進路・生態報告 ＆ 「害獣駆除」方針通達 */}
                <div className="rounded-xl border border-amber-800/80 bg-[#16121a] p-4 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <span className="font-bold text-xs text-white">
                        【Day 4 最終意思決定】防衛庁への最終進路・生態報告 ＆ 「害獣駆除」方針通達
                      </span>
                    </div>
                    <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-800">
                      Day 4 結末フェーズ
                    </span>
                  </div>

                  {/* 質問1：進路予測 */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                      🧭 【問1】この巨大生物は一体どこを目指していると考えられるか？
                    </span>
                    <p className="text-[10px] text-slate-400">
                      各班の調査結果（隕石の残留磁気、火山フロント北上線、富士山麓民家への荷物）を踏まえ、対策本部としての見立てを選択してください。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDay4DestinationDecision("tokyo")}
                        className={`rounded-lg p-2.5 text-left border transition ${
                          day4DestinationDecision === "tokyo"
                            ? "border-amber-400 bg-amber-950/70 shadow ring-1 ring-amber-400"
                            : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-bold text-white text-[11px]">🗼 東京湾・首都直撃ルート</div>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          司令官（PC1）が唯一東京へ持ち帰っていた隕石片の痕跡を追尾している見立て。首都圏中枢への甚大な被害が懸念される。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay4DestinationDecision("fuji")}
                        className={`rounded-lg p-2.5 text-left border transition ${
                          day4DestinationDecision === "fuji"
                            ? "border-amber-400 bg-amber-950/70 shadow ring-1 ring-amber-400"
                            : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-bold text-white text-[11px]">🗻 富士山・駿河湾直撃ルート</div>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          火山フロントの北上直線および謎のダイバーグループが富士山麓の民家へ運んだ約30kgの荷物を追っている見立て。富士山噴火と駿河トラフ破局危機。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 質問2：生態分析報告 */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-300 text-[11px] block">
                      🔬 【問2：生物の正体・構造分析の報告】
                    </span>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      写真解析および観測結果に基づき、防衛庁へ<strong>『単一体の巨大生物ではなく、無数の深海生物や触手が絡み合い融合した【超巨大群体（コロニー）】である』</strong>という専門的見解を正式具申しました。
                    </p>
                  </div>

                  {/* 防衛庁からの公式通達 */}
                  <div className="rounded-lg border border-red-700/80 bg-red-950/40 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-red-300 text-xs">
                      <ShieldAlert className="h-4 w-4 text-red-400" />
                      🛡️ 【防衛庁・統合幕僚監部からの公式通達：「害獣駆除」名目での部隊出動決定】
                    </div>
                    <p className="text-[11px] text-slate-100 italic leading-relaxed">
                      「対策本部の進路予測（{day4DestinationDecision === "tokyo" ? "東京湾首都直撃ルート" : "富士山・駿河湾直撃ルート"}）および超巨大群体の報告を受理した。内閣法制局の厳格な法理判断により、外国からの武力攻撃ではない本件に対し「防衛出動」を発令することは依然として不可とされた。しかし、国民の生命・財産に対する切迫した危機を排除するため、防衛庁は内閣の承認を取り付け、<strong>【防衛出動ではなく、害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、自衛隊の全部隊動員を正式決定</strong>した！」
                    </p>
                    <div className="rounded bg-black/50 border border-red-800/60 p-2 text-[10px] text-slate-200">
                      💥 <strong>作戦方針</strong>: 海上自衛隊の潜水艦・護衛艦部隊を展開し、八丈島〜御蔵島沖（Day 5海域）にて通常兵器（最新鋭魚雷・爆雷）による一斉射撃・駆除作戦を敢行する！<br />
                      事態は【<strong>Day 5：通常兵器の敗北と絶望の真相</strong>】へと突入します。
                    </div>
                  </div>

                  {/* プレイヤー向け基礎知識解説 */}
                  <div className="rounded-lg border border-slate-700/80 bg-slate-900/95 p-3 text-[11px] text-slate-300 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                      <span>💡 【作戦知識の解説】なぜ「防衛出動」ではなく「害獣駆除」なのか？</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[10px]">
                      一般常識としては「未曾有の巨大生物の危機なのだから、すぐに自衛隊を出動させればいい」と思えますが、自衛隊法には極めて厳格な法理のルールが存在します。
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[10px] text-slate-300">
                      <li>
                        <strong className="text-white">防衛出動（自衛隊法第76条）</strong>：外国から武力攻撃を受けた際に国を守る命令。閣議決定や国会の承認が必要な上、<strong>外国の軍隊ではない「未知の生物」には法律上絶対に発令できません</strong>（内閣法制局の却下）。
                      </li>
                      <li>
                        <strong className="text-white">害獣駆除・災害派遣名目</strong>：国民の生命や人命に危害を及ぼす野生生物の駆除や災害排除を目的とする枠組み。「外国の侵略」という要件に縛られず、防衛大臣の決裁などで迅速に動かすことができます。
                      </li>
                    </ul>
                    <p className="text-[10px] text-amber-200/90 pt-1 border-t border-slate-800">
                      👉 <strong>結論</strong>：「法律の壁で手遅れになるのを防ぎ、現場に最新鋭魚雷・爆雷を今すぐ届けるための現実的な行政の知恵（ウルトラC）」として、この方針が採られました。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- DAY 5 プレイヤー提供情報：御蔵島沖噴火・富士山地下微動・自衛隊機密遮断と魚雷撃退作戦 --- */}
            {selectedDay === 5 && (
              <div className="space-y-4">
                {/* ① 海上保安庁 火山活動監視状況図（Day 5版：御蔵島沖海底噴火 ＆ 富士山地下微動開始） */}
                <div className="rounded-xl border border-rose-900/70 bg-[#0c1322] p-4 shadow-md space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-400" />
                      <div>
                        <span className="font-bold text-xs text-white">
                          【火山活動監視図 WGS84】御蔵島沖海底噴火 ＆ 富士山地下火山性微動観測（Day 5最新版）
                        </span>
                        <span className="ml-2 text-[10px] text-rose-300 font-mono">
                          CHART NO. V-2024 / 富士山連動危機
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="/images/eruption_monitoring_chart_day5.svg"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition border border-slate-700"
                      >
                        <ExternalLink className="h-3 w-3" /> 別タブで開く
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsDay5MapModalOpen(true)}
                        className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                      >
                        <Maximize2 className="h-3 w-3" /> 大画面で開く
                      </button>
                    </div>
                  </div>

                  {/* 海図カード */}
                  <div
                    onClick={() => setIsDay5MapModalOpen(true)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-[#081325] aspect-[16/10] max-h-72 flex items-center justify-center p-2 shadow-2xl transition hover:border-rose-500"
                  >
                    <EruptionMonitoringChart
                      day={5}
                      className="w-full h-full object-contain transition duration-200 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                        🔴 御蔵島沖海底噴火 ｜ ⚡ 八丈島 M4/震度3地震 ｜ ⚠️ 富士山地下 深部微動観測
                      </span>
                      <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> クリックで大画面拡大
                      </span>
                    </div>
                  </div>

                  {/* 海図要綱解説 */}
                  <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                    <p>
                      ・<strong>御蔵島沖の海底噴火（第4の噴火）</strong>：須美寿島沖を通過した物体が北上し、御蔵島沖（33°45&apos;N, 139°30&apos;E）の海底カルデラで連動爆発が発生。
                    </p>
                    <p>
                      ・<strong>八丈島への地震波及（M4.0・震度3）</strong>：御蔵島沖の海底噴火を震源とするマグニチュード4クラスの地震が発生し、八丈島全域で震度3の強い揺れを観測。
                    </p>
                    <p>
                      ・<strong>富士山直下・深部での火山性微動観測</strong>：最も恐れていた【富士山地下深部からの火山性微動】の発生を気象庁火山監視課が正式確認。物体の北上によって地下マグマ網が連動刺激されており、駿河トラフ到達・富士山破局噴火までの猶予時間は<strong>【残り48時間】</strong>と算出されました。
                    </p>
                  </div>
                </div>

                {/* ② 【全国緊急特報】メディア各社による「富士山連動大噴火」推論・パニック報道 */}
                <div className="rounded-xl border border-red-900/80 bg-[#1a0f12] p-4 shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                        NEWS FLASH
                      </span>
                      <span className="font-bold text-xs text-white">
                        【全国緊急特報】メディア各社による「富士山連動大噴火」推論報道
                      </span>
                    </div>
                    <span className="text-[10px] text-red-300 font-mono">11/27 午前 全国各局一斉速報</span>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-red-800/60 p-3 text-xs text-red-100 space-y-2">
                    <p className="leading-relaxed italic">
                      「――臨時ニュースをお伝えします。伊豆諸島を北上する連続海底噴火と群発地震を受け、気象庁は富士山地下深部において微弱な火山性微動が観測されたと発表しました。専門家は『小笠原から伊豆諸島、そして富士山へと連なるマグマ供給網が活性化しており、一連の震動ドミノが富士山の破局的大噴火を誘発する壊滅的恐れがある』との推論をテレビ・新聞で一斉に発表。首都圏をはじめ日本全土に激震とパニックが広がっています」
                    </p>
                    <div className="text-[10px] text-slate-300 border-t border-red-900/40 pt-1.5">
                      ⚠️ <strong>社会的情勢</strong>: 富士山噴火パニックにより首都圏機能の混乱が始まり、対策本部には全国からの問い合わせが殺到。事態の収拾が急務となっています。
                    </div>
                  </div>
                </div>

                {/* ③ 【防衛庁からの通達】軍事作戦の「機密指定」および情報遮断 ＆ プレイヤー独自行動の開始 */}
                <div className="rounded-xl border border-blue-900/80 bg-[#0e1626] p-4 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-xs text-white">
                        【防衛庁・統合幕僚監部通達】作戦行動の「極秘指定」および情報遮断
                      </span>
                    </div>
                    <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-800">
                      防衛庁リエゾン連絡
                    </span>
                  </div>

                  <div className="rounded-lg border border-blue-800/70 bg-blue-950/40 p-3 text-xs text-blue-100 space-y-2">
                    <p className="italic leading-relaxed">
                      「――対策本部および小笠原現地緊急チームの諸君、これまでの多大なる情報提供と索敵支援に心より感謝する。
                      しかし、昨日決定した『害獣駆除名目』に基づく海上自衛隊の潜水艦・護衛艦による実弾迎撃作戦は、これより<strong>【防衛最高軍事機密（特別保全対象）】</strong>へと移行する。
                      現場海域の交戦状況や部隊動向についての作戦情報は、ここを以て提供を遮断させていただく。貴隊は自衛隊の作戦干渉を解かれ、各自の管轄・調査任務へと戻られたし」
                    </p>
                    <div className="rounded bg-black/50 border border-blue-700/60 p-2.5 text-[11px] text-blue-200">
                      💡 <strong>プレイヤーたちの状況（自由行動の獲得）</strong>:
                      自衛隊が洋上で極秘撃滅作戦を展開している間、プレイヤーたちは軍事作戦の拘束から解放され、<strong>東京側および小笠原現地にて【独自に自由な行動・真相調査】を進めることが可能</strong>となります！
                    </div>
                  </div>
                </div>

                {/* ④ 【Day 5 独自調査アクション】東京・小笠原クロス調査 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-400" />
                      【Day 5 独自調査アクション】自衛隊の作戦中に真相を解明せよ（東京1枠 / 現地2枠）
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      東京組・現地組で手分けして調査を実行
                    </span>
                  </div>

                  {/* 東京側アクション（1枠選択） */}
                  <div className="rounded-xl border border-sky-900/70 bg-[#0e1628] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-sky-900/60 pb-1.5">
                      <span className="font-bold text-xs text-sky-300 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-sky-400" />
                        【東京側アクション（対策本部・公安・警察ルート）】 1枠選択
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDay5TokyoAction("T-5A")}
                        className={`rounded-lg p-2.5 text-left border transition ${
                          day5TokyoAction === "T-5A"
                            ? "border-sky-400 bg-sky-950/80 shadow ring-1 ring-sky-400"
                            : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-bold text-white text-[11px]">
                          【T-5A】富士山麓民家の捜索照会（静岡県警・公安協力）
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                          Day 4で判明した送付先民家への立ち入り捜査。すでに民家はもぬけの殻であり、謎のダイバーグループが運んだ大型冷凍ボックスの中身は、海から引き揚げて箱に収めた<strong>「重さ約30kgの海底隕石（隕石としては十分に大きな塊）」</strong>であったと発覚。すでに富士山麓の山林深くへ極秘搬入された後であり、捜索は時間切れとなる。
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDay5TokyoAction("T-5B")}
                        className={`rounded-lg p-2.5 text-left border transition ${
                          day5TokyoAction === "T-5B"
                            ? "border-sky-400 bg-sky-950/80 shadow ring-1 ring-sky-400"
                            : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-bold text-white text-[11px]">
                          【T-5B】都内・元神主の子どもの捜索（盟約祝詞の解読）
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                          小笠原大神宮の元神主の子どもを都内で特定し接触。亡き父が遺した言葉の中に「海へ向かって唱える祝詞の作法」や「神社の宝物殿に眠る古文書の点刻記号」に関する決定的な口伝記憶が存在することが裏付けられる。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 現地側アクション（2枠選択） */}
                  <div className="rounded-xl border border-emerald-900/70 bg-[#0d1e18] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-emerald-900/60 pb-1.5">
                      <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-emerald-400" />
                        【小笠原現地アクション（父島・研究室・古老・神社）】 4枠中2枠選択
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-mono">
                        選択中: {day5FieldActions.join(", ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {DAY5_FIELD_ACTIONS.map((action) => {
                        const isSelected = day5FieldActions.includes(action.id);
                        return (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => handleToggleDay5FieldAction(action.id)}
                            className={`rounded-lg p-2.5 text-left border transition ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-950/80 shadow ring-1 ring-emerald-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-[11px]">{action.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold">
                                {action.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-relaxed">
                              {action.summary}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ⑤ 【Day 5 結末（緊急入電）】防衛庁からの連絡：魚雷直撃・飽和攻撃の是非とPC5への緊急意見照会 */}
                <div className="rounded-xl border border-red-700/90 bg-[#1e0d13] p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-red-800/70 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
                      <span className="font-bold text-sm text-white">
                        【Day 5 結末：緊急入電】防衛庁より魚雷直撃報告 ＆ PC2経由での緊急意見照会
                      </span>
                    </div>
                    <span className="rounded bg-red-950 px-2.5 py-0.5 text-[10px] font-bold text-red-300 border border-red-800 animate-pulse">
                      軍部再照会・統率の謎
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/70 border border-red-800 p-3.5 space-y-2.5 text-xs text-red-100">
                    <div className="flex items-center gap-1.5 font-bold text-red-300 text-xs">
                      <span>📡 【八丈島〜御蔵島沖 作戦海域より防衛庁リエゾン（PC2）への緊急入電】</span>
                    </div>
                    <p className="italic leading-relaxed text-[11px] text-slate-100">
                      「――PC2、聞こえるか！ 防衛庁作戦本部だ……！
                      潜水艦部隊により、八丈島〜御蔵島沖にて魚雷群の一斉射撃を敢行した……直撃、命中した！
                      しかし……爆砕されたはずの巨大黒影は、無数の触手とダイオウイカが絡み合う超巨大群体であり、まるで泥のように瞬時に再結合した……！
                      軍部上層部は<strong>『命中している以上、さらに大量の魚雷を集中投入（飽和攻撃）すれば破砕できるはずだ』</strong>と主張している。
                      だが……それだけで本当に止められるのか？ 火力集中だけで適切なのか、極めて重大な疑念が生じている！」
                    </p>

                    <div className="rounded-lg bg-red-950/70 border border-red-700/80 p-3 text-[11px] text-red-200 space-y-1.5">
                      <strong className="text-red-300 block font-bold text-xs">
                        🔬 【防衛庁より海洋生物学者（PC5）への至急確認事項】
                      </strong>
                      <p className="leading-relaxed text-slate-200">
                        「PC2、直ちにあの生物のソナー写真を直接解析した<strong>海洋生物学者（PC5）</strong>の所見を確認してくれ！
                        もし通常兵器の集中攻撃で倒せないのだとすれば――
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-amber-200 font-semibold">
                        <li>奴らは一体どうやって、無数の個体を『一つの個体』として統率（情報伝達・再結合）しているのか？</li>
                        <li>そして、物体は富士山を含む噴火を一体どうやって制御（連動）しているのか？</li>
                      </ul>
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-red-800/60">
                        ※物体の北上により富士山地下の微動は激化中。駿河トラフ到達・破局噴火まで<strong>【残り48時間】</strong>。生物学的な統率メカニズムの解明が急務となる！
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- DAY 6 プレイヤー提供情報：祝詞クリック音 ＆ 海中筒 ＆ クジラ新言語ソナー網 --- */}
            {selectedDay === 6 && (
              <div className="rounded-xl border border-indigo-700/80 bg-[#0d0f22] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Radio className="h-5 w-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        【Day 6 作戦核心】舌クリック祝詞 × 海中筒 × マッコウクジラ新言語ソナー作戦
                      </h3>
                      <p className="text-[11px] text-indigo-300/80">
                        自衛隊攻撃による深海潜航（一時沈静化）から終盤の再浮上・微動復活へ ｜ 太古の巨大イカ捕食前例と新言語の創出
                      </p>
                    </div>
                  </div>
                  {onNavigateToPuzzle && (
                    <button
                      onClick={onNavigateToPuzzle}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md"
                    >
                      <ExternalLink className="h-4 w-4" /> 祝詞解読マトリクスへ
                    </button>
                  )}
                </div>

                {/* --- Day 6 戦況推移パネル：自衛隊攻撃による一時沈静化 ➔ 終盤の急激な再浮上と火山性微動復活 --- */}
                <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-400" />
                      【Day 6 状況推移：一時的な小康状態から破局直前の再浮上へ】
                    </span>
                    <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60">
                      富士山破局噴火まで残り 24時間
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="rounded bg-slate-900/80 border border-slate-800 p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Day 6 前半〜昼：一時的沈静化（潜航）</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        自衛隊の魚雷・爆雷攻撃を受け、物体は水深1,200m以下の超深海へ深く潜航。御蔵島沖の噴火は弱まり、八丈島および富士山地下の火山性微動はいったん沈静化の傾向を見せ、司令部に一時的な小康状態が訪れます。
                      </p>
                    </div>

                    <div className="rounded bg-rose-950/40 border border-rose-900/60 p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        <span>Day 6 夕刻〜夜：急激な再浮上 ＆ 微動復活！</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        深海ソナーが駿河トラフ境界へ向けて<strong>急速に再浮上する巨大影</strong>を探知！ 同時に富士山地下の火山性微動が突如として以前を超える大振幅で復活・再活性化。敵は死んでおらず、最終突入を開始したのです！
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- Day 6 東京班（PC1・PC2）完全連携：Day 5 未選択重要情報の自動回収パネル --- */}
                <div className="rounded-lg bg-indigo-950/40 border border-indigo-700/60 p-3.5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-200 flex items-center gap-1.5 text-xs">
                      <span className="text-base">🗼</span>
                      【東京対策本部（PC1・PC2）夜間捜査完了：Day 5 未調査情報の100%完全回収】
                    </span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-600/60 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Day 6 朝までに2大情報が100%出揃いました
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Day 5で選ばれなかった東京側アクションについても、東京の対策チーム（PC1警視庁公安部 ＆ PC2防衛庁リエゾン）が夜を徹して調査・照会を完遂！
                    Day 6開始時点で<strong>「謎のダイバーグループによる富士山麓への約30kg海底隕石の搬入特定」</strong>と<strong>「元神主の子どもの舌クリック口伝」</strong>の両方が手元に揃いました。
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    {/* T-5A: 約30kgの海底隕石の山林搬入 */}
                    <div className={`rounded-lg border p-3 space-y-1.5 transition ${
                      day5TokyoAction === "T-5A"
                        ? "bg-slate-900/90 border-emerald-700/80"
                        : "bg-indigo-950/60 border-cyan-500/80 shadow-md"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1">
                          ⛰️ 富士山麓・約30kgの海底隕石搬入追跡
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          day5TokyoAction === "T-5A"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-700"
                        }`}>
                          {day5TokyoAction === "T-5A" ? "Day 5で調査完了" : "Day 6朝に東京班より追加報告"}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        謎のダイバーグループが運んだ大型冷凍ボックスは、富士山麓の民家を経由し樹海深くへ搬入。中身は彼らが深海から引き揚げて箱に入れた<strong>「重さ約30kgの海底隕石（隕石としては十分に大きな塊）」</strong>。怪異が富士山を目指す真の動機（持ち出された海底隕石の追跡・接近）が確定！
                      </p>
                    </div>

                    {/* T-5B: 元神主の子どもの口伝 */}
                    <div className={`rounded-lg border p-3 space-y-1.5 transition ${
                      day5TokyoAction === "T-5B"
                        ? "bg-slate-900/90 border-emerald-700/80"
                        : "bg-indigo-950/60 border-cyan-500/80 shadow-md"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1">
                          ⛩️ 元神主の子どもの口伝証言録
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          day5TokyoAction === "T-5B"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-700"
                        }`}>
                          {day5TokyoAction === "T-5B" ? "Day 5で調査完了" : "Day 6朝に東京班より追加報告"}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        都内で発見された元神主の子どもへの聴取完了。『父は<strong>祝詞は日本語を声高に読むのではなく、舌を弾いてクリック音を鳴らし、海中筒へ通すことこそが真の祈りだ</strong>と語っていた』と判明！
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4本の柱 ナビゲーションタブ */}
                <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-indigo-900/40 text-xs">
                  <button
                    onClick={() => setDay6ActiveTab("tongue_click")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded font-semibold transition ${
                      day6ActiveTab === "tongue_click"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>👅 1. 舌クリック音の秘密</span>
                  </button>
                  <button
                    onClick={() => setDay6ActiveTab("sea_tube")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded font-semibold transition ${
                      day6ActiveTab === "sea_tube"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>🎋 2. 海中筒と太古の伝承</span>
                  </button>
                  <button
                    onClick={() => setDay6ActiveTab("coda_grammar")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded font-semibold transition ${
                      day6ActiveTab === "coda_grammar"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>🐋 3. 朝倉ノート＆クジラ言語</span>
                  </button>
                  <button
                    onClick={() => setDay6ActiveTab("sonar_network")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded font-semibold transition ${
                      day6ActiveTab === "sonar_network"
                        ? "bg-cyan-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>📡 4. 海自ソナー網 送信準備完了</span>
                  </button>
                </div>

                {/* --- タブ1: 舌クリック音（吸着破裂音）の秘密 --- */}
                {day6ActiveTab === "tongue_click" && (
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-indigo-900/50 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                          <span>👅 【古代祝詞の真実：喉の声ではなく、舌を弾く「吸着破裂音」】</span>
                        </h4>
                        <p className="text-slate-300 leading-relaxed">
                          神社の古文書に残された特殊な発音記号『吸音・弾舌』の解読により、島に伝わる古代祝詞は通常の人間の声（喉声）ではなく、<strong>舌を上顎・歯茎に強く打ち鳴らす「舌クリック音（吸着音）」</strong>で構成されていたことが判明。
                        </p>
                      </div>
                      <button
                        onClick={() => audioEngine?.playTongueClickSound(2400)}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-2 transition shadow"
                      >
                        <Volume2 className="h-4 w-4" /> 舌クリック音を試聴
                      </button>
                    </div>

                    {/* 重要な解明：祝詞の日本語自体は無意味 */}
                    <div className="rounded-lg bg-amber-950/30 border border-amber-800/60 p-3 space-y-1.5 text-[11px]">
                      <strong className="text-amber-200 block font-bold text-xs flex items-center gap-1.5">
                        ⚠️ 【核心の真相：祝詞を単純に日本語として読んだだけでは無力！】
                      </strong>
                      <p className="text-slate-200 leading-relaxed">
                        古文書の注記にはこう断言されています――『<strong>祝詞の言の葉（日本語の意味や音読）そのものに験があるにあらず。祝詞を唱うる口蓋の動きにて舌を弾き、神音（クリック音）を鳴らすことこそが誠の祈りなり。言の葉をただ声高に読むのみでは海面に弾かれ水底へ届かじ</strong>』。
                      </p>
                      <p className="text-slate-400 leading-relaxed border-t border-amber-900/40 pt-1">
                        ※文字や音響物理学を持たなかった太古の島人が、後世の人々に「マッコウクジラと交信できるクリック音列」を間違いなく再現・継承させるため、<strong>特定の口蓋・舌の動作を必然的に引き起こす『祝詞の型』</strong>として口伝パッケージングしていたのです！
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div className="rounded bg-red-950/40 border border-red-900/60 p-3 space-y-1">
                        <span className="font-bold text-red-300 block text-[11px]">❌ なぜ喉の声（日本語の音読）では届かないのか？</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          空気と海水の境界面（水面）では音響インピーダンスが約3,600倍も異なるため、<strong>喉の歌声・叫び声は99.9%が水面で跳ね返り反射</strong>され、水深数百メートルの深海には一切届きません。
                        </p>
                      </div>
                      <div className="rounded bg-emerald-950/40 border border-emerald-900/60 p-3 space-y-1">
                        <span className="font-bold text-emerald-300 block text-[11px]">⭕ 舌打ち（吸着破裂音）の物理的優位性</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          舌を弾く鋭い破裂音は、音響学的に立ち上がりが極めて急峻な<strong>「高圧インパルスパルス」</strong>であり、水深方向への直進性と透過特性が通常音声に比べ桁違いに優れています。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- タブ2: 古代の海中筒作法 ＆ 4段階の証拠開示ロジック --- */}
                {day6ActiveTab === "sea_tube" && (
                  <div className="space-y-4 bg-slate-950/60 p-4 rounded-lg border border-indigo-900/50 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                          <span>🎋 【海中筒（通海竹筒）の作法 ＆ 朝倉ノートへ繋がる4段階の証拠ロジック】</span>
                        </h4>
                        <p className="text-slate-300 leading-relaxed">
                          かつて小笠原の神職は、沖合の小舟から<strong>水深数メートルまで長い竹筒（海中筒）</strong>を直接差し入れ、その筒口に口を密着させて海中へ直接祝詞（舌クリック音）を放射していました。
                        </p>
                      </div>
                      <button
                        onClick={() => audioEngine?.playSeaTubeAcousticDemo()}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-2 transition shadow"
                      >
                        <Volume2 className="h-4 w-4" /> 海中筒の音響を試聴
                      </button>
                    </div>

                    {/* 4段階の開示ロジック（証拠の梯子） */}
                    <div className="rounded-lg bg-slate-900/90 border border-cyan-800/80 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-1.5">
                        <strong className="text-cyan-200 font-bold text-xs flex items-center gap-1.5">
                          🪜 【朝倉ノートの真価を引き出す4段階の証拠ロジック（開示順序）】
                        </strong>
                        <span className="text-[10px] text-cyan-400 font-mono">論理的必然性の連鎖</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        「なぜ今、朝倉教授のクジラ音響ノートが必要なのか？」は、以下の4つの証拠が順番に揃って初めてプレイヤー全員に完全に腑に落ちます：
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded bg-slate-950/80 border border-slate-800 p-2.5 space-y-1">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            ① 儀礼の存在
                          </span>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            噴火や巨大生物が現れた際、神社では沖へ出て海に向かって祝詞を読む儀礼が太古から行われていた。
                          </p>
                        </div>

                        <div className="rounded bg-slate-950/80 border border-slate-800 p-2.5 space-y-1">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            ② 祝詞の現存
                          </span>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            神社奥殿に祝詞の記録が現存する。しかし日本語の言霊ではなく、点刻記号（舌を弾くクリック音）の作法だった。
                          </p>
                        </div>

                        <div className="rounded bg-slate-950/80 border border-slate-800 p-2.5 space-y-1">
                          <span className="font-bold text-amber-300 flex items-center gap-1">
                            ③ 怪異の動機（古文書）
                          </span>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            古文書に『巨大生物は天より落ちた星の石（隕石）を集め、海底火山を目覚めさせている』と記録されていた。
                          </p>
                        </div>

                        <div className="rounded bg-slate-950/80 border border-slate-800 p-2.5 space-y-1">
                          <span className="font-bold text-emerald-300 flex items-center gap-1">
                            ④ 太古の歴史的解決前例
                          </span>
                          <p className="text-slate-300 text-[10px] leading-relaxed">
                            古文書に『人間が祝詞を読むことでマッコウクジラを呼び集め、巨大なイカの塊りを捕食させた』と記録されていた。
                          </p>
                        </div>
                      </div>

                      <div className="rounded bg-indigo-950/70 border border-indigo-700/80 p-2.5 text-[11px] text-indigo-200">
                        <strong className="text-amber-300">💡 4つの証拠から導かれる必然的結論:</strong>
                        <p className="mt-0.5 leading-relaxed text-slate-200">
                          「相手は通常兵器で倒せない巨大なイカの塊りだ。太古の先人はマッコウクジラを呼び集めて食べさせて解決した。
                          ならば我々もマッコウクジラに呼びかけねばならない――だが、太古の祝詞だけでは現代の広大な太平洋全域のクジラを統率できない。
                          <strong>クジラ自身が話す言語（コーダ）の文法と音響記録</strong>が必要だ！」 ➔ <strong>【タブ3：朝倉教授ノート】へ！</strong>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold text-slate-200">🌊 海中筒による音響透過効率：</span>
                        <span className="text-cyan-400 font-mono text-[10px]">音響インピーダンス整合技術</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-32 shrink-0 text-slate-400">海面での直接発声:</span>
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-red-500 h-full w-[0.1%]"></div>
                          </div>
                          <span className="w-16 text-right font-mono text-red-400">0.1%透過</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-32 shrink-0 text-slate-400">海中筒（竹筒）使用時:</span>
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-400 h-full w-[85%]"></div>
                          </div>
                          <span className="w-16 text-right font-mono text-emerald-400 font-bold">85.0%透過</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        ※現代では竹筒に代わり、海上自衛隊の超大出力低周波アクティブソナー網が「新時代の海中筒」となります。
                      </p>
                    </div>
                  </div>
                )}

                {/* --- タブ3: 朝倉教授ノート 3段階開示 ＆ クジラ言語（5大コーダ実録） --- */}
                {day6ActiveTab === "coda_grammar" && (
                  <div className="space-y-4 bg-slate-950/60 p-4 rounded-lg border border-indigo-900/50 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
                        <span>🐋 【故・朝倉教授の研究ノート：3段階の真実 ＆ クジラ言語（5大コーダ）】</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        海洋生物学者・朝倉教授が遺した研究資料は、一般人の常識を覆す基礎生態から、世界初のクジラ言語文法、そして実音響調査テープへと3段階で深まります。
                      </p>
                    </div>

                    {/* 第1段階：生態学的常識の補強 */}
                    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                          📖 第1段階：【生態学的常識の補強】マッコウクジラの潜水と深海捕食生態
                        </span>
                        <span className="text-[10px] text-slate-400">Day 3〜4事前開示 / 未選択でも常時確認可能</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 pt-1">
                        <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                          <strong className="text-cyan-200 block mb-0.5">① 深海1,000〜2,000mへの潜水</strong>
                          <span>大型鯨類の中で唯一、日光の届かない超深海・漸深層へ数十分間潜水可能。</span>
                        </div>
                        <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                          <strong className="text-cyan-200 block mb-0.5">② 筋肉中の超高濃度酸素</strong>
                          <span>筋肉にミオグロビンを極限まで蓄え、深海の超高水圧・無酸素環境で活動。</span>
                        </div>
                        <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                          <strong className="text-amber-200 block mb-0.5">③ ダイオウイカが主食！</strong>
                          <span>深海でダイオウイカ等の大型頭足類を捕食。胃から巨大な嘴が多数発見される。</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        ※一般プレイヤー向け補足：クジラがイカを食べることは決して突飛な設定ではなく、海洋生物学における確固たる自然の摂理です。
                      </p>
                    </div>

                    {/* 第2段階：クジラ言語仮説 */}
                    <div className="rounded-lg bg-slate-900/90 border border-indigo-900/60 p-3 space-y-1">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1">
                        🔬 第2段階：【クジラ言語仮説】クリック音の文法構造モデル
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        マッコウクジラが発するクリック音列（コーダ）は単なる障害物探査（エコーロケーション）ではなく、<strong>周波数・打数・間隔（ICI）</strong>の組み合わせによる文法構造を持った言語社会であるという仮説。人間の舌クリック音（吸着破裂音）と波形が酷似していることを証明。
                      </p>
                    </div>

                    {/* 第3段階：朝倉教授の海洋音響実録テープ ＆ 5大コーダ */}
                    <div className="rounded-lg bg-indigo-950/40 border border-indigo-700/80 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
                        <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                          📼 第3段階：【実音響調査記録】朝倉教授の5大コーダ実録テープ ＆ 行動対応ログ
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">小笠原海溝 実録データ</span>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {/* 1. 捕食コーダ */}
                        <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 space-y-1 text-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-400 text-[11px]">1. 捕食（獲物）</span>
                            <button
                              onClick={() => audioEngine?.playWordSound("word-prey")}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="音を聴く"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">3.6kHz / 高速バースト</span>
                          <p className="text-[9px] text-slate-400 leading-tight">仲間でイカを捕食する時の興奮音</p>
                        </div>

                        {/* 2. 危機コーダ */}
                        <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 space-y-1 text-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-red-400 text-[11px]">2. 危機（外敵）</span>
                            <button
                              onClick={() => audioEngine?.playWordSound("word-danger")}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="音を聴く"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">1.6kHz / 低音長間隔</span>
                          <p className="text-[9px] text-slate-400 leading-tight">危機・異変を仲間に警告する音</p>
                        </div>

                        {/* 3. 位置指示コーダ */}
                        <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 space-y-1 text-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-400 text-[11px]">3. 位置指示</span>
                            <button
                              onClick={() => audioEngine?.playWordSound("word-location")}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="音を聴く"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">2.5kHz / 長短交差</span>
                          <p className="text-[9px] text-slate-400 leading-tight">餌や危険の深度・方位を伝達</p>
                        </div>

                        {/* 4. 到達距離データ */}
                        <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 space-y-1 text-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300 text-[11px]">4. 到達距離</span>
                            <span className="text-[9px] text-amber-400 font-mono">SOFAR</span>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">水深1,000m 音響層</span>
                          <p className="text-[9px] text-slate-400 leading-tight">深海層で数百km彼方まで届く</p>
                        </div>

                        {/* 5. YESコーダ */}
                        <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 space-y-1 text-center">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-300 text-[11px]">5. YES（了解）</span>
                            <button
                              onClick={() => audioEngine?.playWordSound("word-yes")}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="音を聴く"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">2.9kHz / 高音2連打</span>
                          <p className="text-[9px] text-slate-400 leading-tight">仲間からの肯定・呼応シグナル</p>
                        </div>
                      </div>

                      {/* 祝詞多重ロック構文テスト */}
                      <div className="flex flex-col gap-2 rounded bg-slate-950 p-3 border border-slate-800 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-[11px]">
                            合成新言語メッセージ構文: <strong className="text-amber-300">「人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ」</strong>
                          </span>
                          <button
                            onClick={() =>
                              audioEngine?.playMessageSequence(
                                [
                                  "word-human",
                                  "word-whale",
                                  "word-promise",
                                  "word-subsea-volcano",
                                  "word-go-north",
                                  "word-search",
                                  "word-giant-prey",
                                  "word-gather",
                                ],
                                1.0
                              )
                            }
                            className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-500 transition shadow text-xs shrink-0"
                          >
                            <Volume2 className="h-4 w-4" /> 8語シーケンスをテスト試聴
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          構成: [人間・クジラ・約束] ➔ [海の下の火山・北に向かう・探せ] ➔ [巨大な餌・集まれ]
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- タブ4: 海自ソナー網 送信準備完了（翌朝・Day 7 決戦スタンバイ） --- */}
                {day6ActiveTab === "sonar_network" && (
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-cyan-900/60 text-xs">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                        <Radio className="h-4 w-4 text-cyan-400" />
                        <span>📡 【海上自衛隊ソナー網への新言語メッセージ装填 ＆ 翌朝作戦スタンバイ】</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        古代の「海中筒」の役割を、現代の<strong>海上自衛隊大出力アクティブソナー網（護衛艦・潜水艦・伊豆小笠原海底固定ソナー群 SOSUS）</strong>に接続。プレイヤー全員の知見が結集して完成した『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』の音響パケットを装填し、発信系統の最終テストを実施します。
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          🌐 ソナー網装填パケット: <span className="font-mono text-cyan-300">[約束] ➔ [海底火山・北・探せ] ➔ [巨大な餌・集まれ]</span>
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                          day6ReadyStatus === "idle"
                            ? "bg-slate-800 text-slate-400"
                            : day6ReadyStatus === "testing"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}>
                          {day6ReadyStatus === "idle" && "装填待機中"}
                          {day6ReadyStatus === "testing" && "信号伝送テスト中..."}
                          {day6ReadyStatus === "ready" && "装填完了・Day 7 作戦待機！"}
                        </span>
                      </div>

                      {/* 装填状況と翌朝決戦への案内 */}
                      <div className="rounded bg-black/40 border border-slate-800 p-3 space-y-2 text-[11px]">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>8語シーケンス信号の全周波数整合性を確認</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-mono text-[10px]">
                          「海自全潜水艦およびSOSUS網の送信機に新言語パルスが完全に同期されました。
                          実際の海中へのメガワット級大出力放流は、<strong>明日・Day 7の駿河湾最終決戦</strong>にて、怪異突入および魚雷攻撃のタイミングに合わせて実行されます！」
                        </p>
                      </div>

                      <button
                        onClick={handleDay6TestPlay}
                        disabled={day6ReadyStatus === "testing"}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 text-xs transition shadow-lg"
                      >
                        <Volume2 className="h-4 w-4" />
                        {day6ReadyStatus === "idle" && "海自ソナー網への装填信号をテスト試聴する"}
                        {day6ReadyStatus === "testing" && "信号テスト再生中……"}
                        {day6ReadyStatus === "ready" && "装填信号を再テスト試聴（Day 7決戦スタンバイ完了）"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- DAY 7 クライマックス大捕食 ＆ アンサング・ヒーローのエピローグ --- */}
            {selectedDay === 7 && (
              <div className="rounded-xl border border-emerald-700/80 bg-[#061814] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-5 w-5 text-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        【Day 7 決戦】駿河湾口・魚雷飽和攻撃 ＆ マッコウクジラ深海大捕食作戦
                      </h3>
                      <p className="text-[11px] text-emerald-300/80">
                        水深600〜1,000mの境界戦 ｜ 魚雷による群体粉砕アシスト × クジラ群の完全捕食消滅
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-600/60">
                    作戦海域：駿河湾口〜湾奥（水深600〜1,000m）
                  </span>
                </div>

                {/* 戦況状況と水深設定 */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                        🎯 目標潜航深度：水深 600m 〜 1,000m
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">魚雷有効限界スレスレ</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Day 5の迎撃を警戒した怪異は、海面に浮上せず<strong>水深600〜1,000mの深海</strong>を維持して駿河トラフへ突入。通常兵器の魚雷が水圧で圧壊する限界ギリギリの領域に潜み続けます。
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                        🐋 マッコウクジラ群：超深海からの挟撃包囲
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">筋肉中酸素（ミオグロビン）</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      筋肉に大量の酸素を蓄え、深海1,000〜2,000mに潜水できるマッコウクジラだけが、怪異の下方・退路を完全に塞ぎ、深海の闇から一斉に食らいつくことができます！
                    </p>
                  </div>
                </div>

                {/* 作戦展開の2重奏 */}
                <div className="rounded-lg bg-slate-900/90 border border-emerald-900/60 p-3.5 space-y-2.5 text-xs">
                  <span className="font-bold text-white text-xs block border-b border-slate-800 pb-1.5">
                    ⚔️ 【自衛隊 × マッコウクジラ群：深海統合掃討オペレーションの全貌】
                  </span>

                  <div className="grid grid-cols-3 gap-2.5 text-[11px]">
                    <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                      <strong className="text-cyan-400 block font-semibold">① 海自アクティブソナー照射</strong>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        大出力ソナーが怪異へPing音を照射。これがクジラ群にとって「あそこに獲物がいる！」という最高の音響標的マーカーとなる。
                      </p>
                    </div>

                    <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                      <strong className="text-amber-400 block font-semibold">② 海自潜水艦・重魚雷一斉飽和攻撃</strong>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        限界深度へ撃ち込まれた重魚雷が全弾直撃！ 爆風で巨大群体をバラバラに粉砕し、クジラが捕食しやすい一口サイズへと引き裂く！
                      </p>
                    </div>

                    <div className="rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1">
                      <strong className="text-emerald-400 block font-semibold">③ クジラ大群の深海大捕食（消滅）</strong>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        再結合しようとするダイオウイカの個体を、数百頭のクジラが深海で片っ端から噛み砕き貪り喰らい尽くす。怪異は完全に胃袋へ消滅！
                      </p>
                    </div>
                  </div>

                  {/* --- Day 7 クライマックス音響：海自ソナー網放流 ＆ クジラたちのメッセージリレー（歌のバトン） --- */}
                  <div className="rounded-lg bg-slate-950/90 border border-cyan-800/80 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span className="font-bold text-cyan-300 text-xs">
                          📡 【全海域ソナー網放流 ＆ クジラたちのメッセージリレー（歌のバトン）】
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                        day7BroadcastStatus === "idle"
                          ? "bg-slate-800 text-slate-400"
                          : day7BroadcastStatus === "broadcasting"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {day7BroadcastStatus === "idle" && "放流準備完了・待機中"}
                        {day7BroadcastStatus === "broadcasting" && `放流中・リレー進行中 (${day7RelayStage}/7)`}
                        {day7BroadcastStatus === "received" && "太平洋全域リレー完了・大捕食突入！"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                      海自全ソナー網（SOSUS）より『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』を大出力放流。
                      一頭のクジラが「了解」を返し、自ら同じ歌を歌いながら北上。その歌に応えて遠くの仲間たちが次々に了解と歌をリレーし、太平洋全域から駿河トラフへ大集結します！
                    </p>

                    {/* メッセージリレー進行インジケーター */}
                    {day7BroadcastStatus !== "idle" && (
                      <div className="rounded-lg bg-slate-950/90 border border-indigo-700/60 p-3 space-y-2 text-[11px] animate-fade-in shadow-inner">
                        <div className="flex items-center justify-between text-indigo-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                            【深海ハイドロフォン観測：クジラたちのメッセージリレー（歌のバトン）】
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            進行度: {day7RelayStage} / 7
                          </span>
                        </div>

                        {/* リアルタイムステータステキスト */}
                        <div className="rounded bg-black/60 border border-cyan-900/50 p-2.5 text-cyan-200 font-mono text-[11px] leading-relaxed">
                          {day7RelayStatusText || "ソナー網よりパルス放流中……"}
                        </div>

                        {/* 4段階リレーステップ */}
                        <div className="grid grid-cols-4 gap-1.5 text-[10px] pt-1">
                          <div
                            className={`p-1.5 rounded border text-center transition ${
                              day7RelayStage >= 1
                                ? "bg-cyan-950/60 border-cyan-500/80 text-cyan-200 font-bold"
                                : "bg-slate-900/40 border-slate-800 text-slate-500"
                            }`}
                          >
                            ① ソナー網放流
                          </div>
                          <div
                            className={`p-1.5 rounded border text-center transition ${
                              day7RelayStage >= 3
                                ? "bg-cyan-950/60 border-cyan-500/80 text-cyan-200 font-bold"
                                : "bg-slate-900/40 border-slate-800 text-slate-500"
                            }`}
                          >
                            ② 第1クジラ了解
                          </div>
                          <div
                            className={`p-1.5 rounded border text-center transition ${
                              day7RelayStage >= 4
                                ? "bg-indigo-950/60 border-indigo-500/80 text-indigo-200 font-bold"
                                : "bg-slate-900/40 border-slate-800 text-slate-500"
                            }`}
                          >
                            ③ 自ら歌い北上
                          </div>
                          <div
                            className={`p-1.5 rounded border text-center transition ${
                              day7RelayStage >= 6
                                ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-bold"
                                : "bg-slate-900/40 border-slate-800 text-slate-500"
                            }`}
                          >
                            ④ 太平洋全域リレー
                          </div>
                        </div>
                      </div>
                    )}

                    {day7BroadcastStatus === "received" && (
                      <div className="rounded bg-emerald-950/60 border border-emerald-600/80 p-3 text-[11px] text-emerald-200 space-y-1.5 animate-fade-in">
                        <strong className="block text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> 太平洋全域のメッセージリレー完了・大集結を確認！
                        </strong>
                        <p className="text-slate-200 leading-relaxed font-mono">
                          「一匹のクジラが【了解】を返して自ら歌いながら北上し、その歌に呼応して太平洋全域の仲間たちがメッセージをリレー！
                          駿河湾沖、伊豆諸島、鳥島沖から無数のマッコウクジラ群が駿河トラフ水深1,000mの戦域へ超高速で突入しました！
                          魚雷で粉砕された怪異を片っ端から噛み砕き、貪り喰らい尽くしていきます！」
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleDay7Broadcast}
                      disabled={day7BroadcastStatus === "broadcasting"}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-indigo-500 disabled:opacity-50 py-3 text-xs font-bold text-white transition shadow-lg"
                    >
                      <Volume2 className="h-4 w-4" />
                      {day7BroadcastStatus === "idle" && "【作戦発動】大出力ソナー放流 ＆ クジラたちのメッセージリレー（歌のバトン）を開始"}
                      {day7BroadcastStatus === "broadcasting" && "メッセージ放流 ＆ 太平洋全域リレー進行中……"}
                      {day7BroadcastStatus === "received" && "メッセージリレー音響を再演する（クジラ群との同調）"}
                    </button>
                  </div>
                </div>

                {/* エピローグ：アンサング・ヒーロー（語られざる英雄たち） */}
                <div className="rounded-lg bg-gradient-to-br from-slate-950 via-[#0a121e] to-slate-950 border border-indigo-700/60 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
                    <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                      <span>🕊️ 【エピローグ：語られざる英雄たち（Unsung Heroes）】</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">作戦終結・事後記録</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                    <div className="rounded bg-black/40 border border-slate-800 p-2.5 space-y-1">
                      <strong className="text-slate-200 block">📜 政府・自衛隊の公式発表（表の歴史）:</strong>
                      <p className="italic text-slate-300 leading-relaxed font-mono text-[10px]">
                        「海上自衛隊潜水艦部隊による通常兵器（最新鋭重魚雷の一斉飽和攻撃）により、水深600〜1,000mの怪異を撃退・完全殲滅に成功。軍部上層部は火力の勝利と総括し、世間は自衛隊の防衛作戦の成功に歓喜した」
                      </p>
                    </div>

                    <div className="rounded bg-indigo-950/40 border border-indigo-800/60 p-2.5 space-y-1">
                      <strong className="text-amber-300 block">⭐ 6人だけが知る真実（アンサング・ヒーロー）:</strong>
                      <p className="italic text-slate-200 leading-relaxed font-mono text-[10px]">
                        「魚雷だけでは倒せなかった。深海でクジラたちがすべてを喰らい尽くしてくれたからこそ、日本は救われたのだ。だが、6人はその手柄を主張せず、自衛隊へ譲った。自分たちだけの誇りとして胸に秘め、静かに日常へ帰っていく――」
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側：このDayに解禁・関係するエビデンスカード */}
        <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                DAY {currentStep.dayNumber} 解禁エビデンス ({currentStep.revealedEvidenceIds.length}件)
              </h4>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
            {getRevealedEvidences(currentStep.revealedEvidenceIds).length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                このDayに新たに解禁される直接証拠はありません（会議・意思決定フェーズ）
              </div>
            ) : (
              getRevealedEvidences(currentStep.revealedEvidenceIds).map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-xs text-indigo-300">{ev.title}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      {ev.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ev.description}
                  </p>
                  {ev.acquisitionCondition && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400/90">
                      <ChevronRight className="h-3 w-3" />
                      <span>{ev.acquisitionCondition}</span>
                    </div>
                  )}
                  {ev.id === "ev-aerial-recon-report" && (
                    <button
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-amber-200 transition"
                    >
                      <ImageIcon className="h-3 w-3" /> 空撮写真をモーダルで確認
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌟 各種大画面モーダル */}
      {/* ======================================================== */}

      {/* Day 2 空撮写真モーダル */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    海上保安庁 羽田航空基地 MA722撮影 緊急偵察写真
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    撮影日時: Day 2 08:42 | 撮影高度: 3,000ft | 撮影位置: 西之島北西約25海里
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src="/images/aerial_recon_wide.jpg"
                alt="西之島北西海域 空撮写真"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-amber-300">
                【画像解析所見（海上保安庁 警備救難部 航空分析班）】
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ・背景（写真上方）に西之島海底火山の噴煙が明瞭に確認できる。<br />
                ・中央部海面に、時速約6km（約3.3ノット）で北上する水面下物体が形成した明瞭なV字型の<strong>ケルビン波（航跡波）</strong>を観測。<br />
                ・ケルビン波が海面に現れていることから、撮影当時、対象は海底火山の高温熱水を回避するために一時的に<strong>水深10〜20mの海面直下スレスレまで急浮上</strong>していたと推定される。<br />
                ・水面下に透けて見える影の推定全長は<strong>300〜400メートル</strong>。<br />
                ・なお、撮影から数分後、影は急速に水深800m以深の深海へ潜航し、光学視界から消失した。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Day 3 作戦海図 ＆ 火山活動監視図モーダル */}
      {isTheaterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsTheaterModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {day3MapTab === "tactical"
                      ? "【作戦海図 W-3100】鳥島〜須美寿島海域 ヘリコプター洋上ソナー索敵作戦図"
                      : "海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺 全域）"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    JAPAN COAST GUARD &amp; SDF TACTICAL MARITIME CHART (WGS84)
                  </p>
                </div>
              </div>

              {/* タブ切り替え ＆ アクションボタン */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDay3MapTab("tactical")}
                    className={`px-3 py-1 rounded font-semibold transition ${
                      day3MapTab === "tactical"
                        ? "bg-cyan-600 text-white shadow ring-1 ring-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    作戦海図 W-3100
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay3MapTab("overview")}
                    className={`px-3 py-1 rounded font-semibold transition ${
                      day3MapTab === "overview"
                        ? "bg-rose-700 text-white shadow ring-1 ring-rose-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    火山活動監視図
                  </button>
                </div>

                {/* 作戦海図時の プレイヤー / GM モードトグル */}
                {day3MapTab === "tactical" && (
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setDay3MapMode("player")}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        day3MapMode === "player"
                          ? "bg-cyan-600 text-white shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      プレイヤー表示
                    </button>
                    <button
                      type="button"
                      onClick={() => setDay3MapMode("gm")}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        day3MapMode === "gm"
                          ? "bg-rose-600 text-white shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      GM真相表示（怪物の位置）
                    </button>
                  </div>
                )}

                <a
                  href={day3MapTab === "tactical" ? "/images/day3_sonar_tactical_chart.svg" : "/images/eruption_monitoring_chart.svg"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="原寸ベクターSVGを別タブで表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsTheaterModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる (Escキーでも閉じられます)"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部 */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#07111e] flex items-center justify-center min-h-[460px]">
              {day3MapTab === "tactical" ? (
                <Day3TacticalMap
                  defaultMode={day3MapMode}
                  onSelectDropPoint={(id) => handleToggleDay3SonarDrop(id)}
                />
              ) : (
                <div className="w-full h-full p-2 flex items-center justify-center">
                  <EruptionMonitoringChart day={3} className="w-full h-full max-h-[70vh] object-contain select-none" />
                </div>
              )}
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300">
              {day3MapTab === "tactical" ? (
                <div className="flex items-center justify-between text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-cyan-300">【海図作戦要項】</span>
                    全36セクター（1区画 約20km四方）。海況と海底地形を分析し、クリアな海盆平原にソノブイを投下して索敵を実施せよ。
                  </div>
                  <div className="font-mono text-slate-400">
                    給油拠点: 海図左下 PLH-31「あきつしま」(セクターF-1)
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-rose-300">【広域噴火観測】</span>
                    Day 1 西之島 ➔ Day 2 鳥島沖。時速約6km（日速約150km）のペースで海底火山を刺激しながら北上中。
                  </div>
                  <span className="font-mono text-cyan-400">未噴火警戒域: 須美寿島〜伊豆半島</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day 1 漂流海図 大画面モーダル */}
      {isDay1ChartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsDay1ChartModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    小笠原南西海域 航海用海図（CHART NO. W-2704）
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      {day1ViewMode === "investigation" ? "白地図（プレイヤー提示用）" : "対策本部解析図（GM用）"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:50,000 / 緯度1分(1&apos;) = 1海里 (NM) | 中心: 27°04.0&apos;N, 142°06.0&apos;E (SOS地点)
                  </p>
                </div>
              </div>

              {/* モード切り替えタブ ＆ アクションボタン群 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("investigation")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "investigation"
                        ? "bg-cyan-700 text-white shadow ring-1 ring-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <EyeOff className="h-3 w-3" />
                    白地図（プレイヤー用）
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("tactical")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "tactical"
                        ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    対策本部解析図（GM用）
                  </button>
                </div>

                <a
                  href={
                    day1ViewMode === "investigation"
                      ? "/images/day1_nautical_chart_white.svg"
                      : "/images/day1_nautical_chart_gm.svg"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="別タブで原寸SVGを開く"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>

                <button
                  type="button"
                  onClick={() => setIsDay1ChartModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる (Escキーでも閉じられます)"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部（実SVGレンダリング） */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] p-2 flex items-center justify-center min-h-[460px]">
              <div className="w-full h-full max-h-[72vh] flex items-center justify-center">
                <Day1NauticalMap
                  mode={day1ViewMode === "investigation" ? "player" : "gm"}
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1.5">
              {day1ViewMode === "investigation" ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-cyan-300 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5" />
                      【プレイヤー提示用 白地図】漂流予測パズル作図要領:
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      ※解答・ベクトルは非表示になっています
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    救難信号発信位置（海図中心：27°04.0&apos;N, 142°06.0&apos;E）を中心に、北東に父島・南島、東側（740, 350）および南東側（660, 480）に危険な暗礁群が点在しています。<br />
                    各PCの専門知識（風向風速15m/s、表層流速2.0kt、潮目、船の姿勢）を合成し、救難艇が急行すべき漂流予測海域を自力で作図計算してください。
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-300 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5" />
                      【対策本部解析図（GM用）】漂流予測の正解とベクトル合成:
                    </strong>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      ⭐ 救助海域: 東北東へ約2.5海里（暗礁群の手前北側）
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    南西強風15m/sによる風圧流（北東へ約1.5kt）＋ 黒潮支流（真東へ2.0kt）のベクトル合成 ＝ <strong>【東北東へ約2.5kt】</strong>。<br />
                    東側および南東側の危険な暗礁群を北側にすり抜け、発信から1時間後の遭難船（東北東2.5NM地点）を捕捉。暗礁手前で間一髪、船長とダイバーたちの救助に成功します！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day 3 PC6 個別ハンドアウト モーダル */}
      {day3IsPC6ModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setDay3IsPC6ModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl border border-indigo-700/70 bg-[#0c0d1e] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-700 text-indigo-400">
                  <Scroll className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    【PC6（神職）専用 個別ハンドアウト】
                  </h3>
                  <p className="text-[11px] text-indigo-300 font-medium">
                    小笠原・大神神社 社家に伝わる秘事口伝 ＆ 古代儀式の記録
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDay3IsPC6ModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* 伝承の文言（引用枠） */}
              <div className="rounded-xl border border-indigo-800/80 bg-slate-950/80 p-4 shadow-inner">
                <div className="text-[11px] font-bold text-indigo-400 mb-2 flex items-center gap-1.5">
                  <span>📜</span> 社家相伝の言い伝え（祖父から聞かされた口伝）
                </div>
                <blockquote className="border-l-2 border-indigo-500 pl-3.5 py-1 text-slate-200 text-xs leading-relaxed italic">
                  「南の海にて火の山が連なりて火を吹き、海の中を巨大なる何ものかが北へと泳ぎ去るとき……<br />
                  島人は沖へ舟を漕ぎ出し、海に向かいて毎日、祝詞を唱えねばならぬ。<br />
                  さすれば海鳴りは鎮まり、災いは海の深みへと帰らん」
                </blockquote>
              </div>

              {/* 背景説明 */}
              <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-1.5 text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-200 text-xs block">
                  ◆ 現地で起こっている事態との符合
                </span>
                <p>
                  西之島（Day 1）の大噴火に続き、昨夜は鳥島沖（Day 2）の海底カルデラが噴火した。
                  海保や対策本部は「巨大な物体が時速約6kmで海中を北上している」と結論づけている。<br />
                  この状況は、幼い頃に聞かされた『火の山が連なりて火を吹き、海の中を巨大なる何ものかが北へ泳ぎ去る』という伝承の情景と完全に一致している。
                </p>
              </div>

              {/* 最重要ルール・制約 */}
              <div className="rounded-xl bg-amber-950/40 border border-amber-600/60 p-4 space-y-2 text-amber-200 shadow">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  【PC6 プレイヤーの心得と重要制約】
                </div>
                <div className="text-[11px] leading-relaxed space-y-1.5 text-slate-300">
                  <p>
                    1. <strong className="text-white">Day 3であなたが知っている限界</strong>：<br />
                    「火山が連続で爆発し、巨大なものが海を移動しているときには、海に出て毎日祝詞を唱える特別な儀式が存在する」という<strong>【事実の存在】まで</strong>です。
                  </p>
                  <p>
                    2. <strong className="text-white">祝詞の具体的な文言・所作は一切不明（厳禁事項）</strong>：<br />
                    具体的にどんな文言を唱えるのか、どのような抑揚・音階で奏上するのかは、社記の本文が一部欠損・封印されているため、<strong>現時点ではあなたにも全く分かりません</strong>。（※Day 6の恩師の研究ノートおよび音響解析を経て初めて判明します）
                  </p>
                  <p>
                    3. <strong className="text-white">他プレイヤーとの情報共有</strong>：<br />
                    「海に出て毎日祝詞を唱えなければならない儀式がある」という伝承の存在は、合議の席で自由に明かして構いません。
                  </p>
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDay3IsPC6ModalOpen(false)}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white transition shadow"
              >
                ハンドアウトを閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day 3 洋上ヘリ航空偵察 写真拡大モーダル（成功 / 失敗） */}
      {day3PhotoModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          onClick={() => setDay3PhotoModal(null)}
        >
          <div
            className="relative max-w-5xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                    day3PhotoModal === "success"
                      ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                      : "bg-amber-950 border-amber-700 text-amber-400"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {day3PhotoModal === "success"
                      ? "【特定成功】海上保安庁 捜索ヘリ撮影 巨大生物 後方空撮写真"
                      : "【特定失敗】海上保安庁 捜索ヘリ撮影 20km彼方 航跡波・急潜航写真"}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        day3PhotoModal === "success"
                          ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                          : "bg-amber-950 border-amber-800 text-amber-300"
                      }`}
                    >
                      {day3PhotoModal === "success" ? "セクター B-3 直上" : "目標より約20km離脱"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {day3PhotoModal === "success"
                      ? "ALT: 2,500 FT | CAM: OPTICAL TELEPHOTO (NATURAL) | TARGET: UNKNOWN-MASSIVE COLONY"
                      : "ALT: 1,850 FT | CAM: OPTICAL TELEPHOTO (NATURAL) | TARGET: DIVED / EMPTY OCEAN"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 成功 / 失敗 切り替え */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDay3PhotoModal("success")}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      day3PhotoModal === "success"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    成功写真
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay3PhotoModal("failure")}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      day3PhotoModal === "failure"
                        ? "bg-amber-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    失敗写真
                  </button>
                </div>
                <button
                  onClick={() => setDay3PhotoModal(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 写真画像 */}
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center flex-1 max-h-[62vh]">
              <img
                src={
                  day3PhotoModal === "success"
                    ? "/images/day3_sonar_success_photo.jpg"
                    : "/images/day3_sonar_failure_photo.jpg"
                }
                alt={day3PhotoModal === "success" ? "巨大生物 後方空撮写真" : "20km彼方 航跡波写真"}
                className="w-full h-auto max-h-[62vh] object-contain select-none"
              />
            </div>

            {/* 解説ノート */}
            <div
              className={`mt-3 rounded-lg border p-3 text-xs text-slate-300 space-y-1 ${
                day3PhotoModal === "success"
                  ? "bg-emerald-950/30 border-emerald-900/60"
                  : "bg-amber-950/30 border-amber-900/60"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={day3PhotoModal === "success" ? "text-emerald-300" : "text-amber-300"}>
                  {day3PhotoModal === "success"
                    ? "【特定成功 画像解析所見（海上保安庁 警備救難部 航空分析班）】"
                    : "【特定失敗 捜索空振り記録（海上保安庁 警備救難部 航空分析班）】"}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {day3PhotoModal === "success" ? "北上速度: 約6 km/h" : "潜航速度: 急速深海移行"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {day3PhotoModal === "success" ? (
                  <>
                    ・高度2,500フィート、捜索ヘリ通常光学望遠カメラより前進遊泳する巨大生物の後方からの撮影に成功。<br />
                    ・本体の輪郭線は海中に溶け込み特定の生物の形としては定まらないが、<strong>海面下に巨大な漆黒の質量（超群体）が潜んでいること</strong>が深海シャドウとして確認できる。<br />
                    ・その不鮮明な本体から、<strong>無数に増殖した膨大な触手群（20本以上）だけが海中を長く直線的にたなびく姿</strong>をはっきりと捉えている。<br />
                    ・海面には前進遊泳に伴う繊細で控えめなV字型のケルビン波が薄く広がっており、巨大な生体質量が深海を静かに北上継続中。
                  </>
                ) : (
                  <>
                    ・高度1,850フィート、捜索ヘリ通常光学望遠カメラによる遠方観測。船舶が一切存在しない広大で荒涼とした外洋の<strong>約21km彼方（水平線手前）</strong>に、巨大生物の引き起こした異常な海水隆起と白波の泡立ちを捕捉。<br />
                    ・しかしヘリが急行したときには、怪物はヘリの接近を警戒してすでに深海800m以深へ急速潜航してしまっていた。<br />
                    ・直接の姿を捉えることはできなかったが、海面に残された波の規模から全長数百mの質量が実在することを裏付けている。
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Day 4 火山活動監視図 大画面モーダル */}
      {isDay4MapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsDay4MapModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-rose-800 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    海上保安庁 火山活動監視状況図（Day 4：須美寿島〜青ヶ島沖海底噴火 ＆ 地震観測）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    JAPAN COAST GUARD VOLCANIC MONITORING CHART (CHART NO. V-2024 / WGS84)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/images/eruption_monitoring_chart_day4.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsDay4MapModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部 */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#07111e] flex items-center justify-center min-h-[460px] p-2">
              <EruptionMonitoringChart day={4} className="w-full h-full max-h-[70vh] object-contain select-none" />
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-300">【Day 4 観測要綱】</span>
                須美寿島〜青ヶ島沖の海底カルデラ噴火（Day 3マーク）および青ヶ島・八丈島での火山性微動（震度1〜2）を網羅。他の島名や地形と被らないよう海図西側に配置。
              </div>
              <span className="font-mono text-cyan-400">連動速度: 時速約6km 北上</span>
            </div>
          </div>
        </div>
      )}

      {/* Day 5 火山活動監視図 大画面モーダル */}
      {isDay5MapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsDay5MapModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-rose-800 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    海上保安庁 火山活動監視状況図（Day 5：御蔵島沖海底噴火 ＆ 富士山地下深部微動観測）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    JAPAN COAST GUARD VOLCANIC MONITORING CHART (CHART NO. V-2024 / WGS84)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/images/eruption_monitoring_chart_day5.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsDay5MapModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部 */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#07111e] flex items-center justify-center min-h-[460px] p-2">
              <EruptionMonitoringChart day={5} className="w-full h-full max-h-[70vh] object-contain select-none" />
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-300">【Day 5 観測要綱】</span>
                御蔵島沖海底カルデラ噴火、八丈島でのM4.0・震度3地震波及、および富士山地下深部での火山性微動観測を反映。
              </div>
              <span className="font-mono text-rose-400 font-bold">駿河トラフ到達・破局噴火まで残り48時間</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

