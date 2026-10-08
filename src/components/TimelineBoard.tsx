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
import { TOKYO_ACTIONS, FIELD_ACTIONS, DAY4_TOKYO_ACTIONS, DAY4_FIELD_ACTIONS } from "./GmDashboard";
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

  // ESCキーで開いているモーダルを閉じる
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPhotoModalOpen(false);
        setIsTheaterModalOpen(false);
        setIsDay1ChartModalOpen(false);
        setIsDay4MapModalOpen(false);
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
                        <EruptionMonitoringChart className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
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
                          事態は【<strong>Day 4：須美寿島〜青ヶ島沖（スミス島沖海底噴火・内閣不作為とメディア緘口令・現地4大真相調査）</strong>】へと繋がります！
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- DAY 4 プレイヤー提供情報：スミス島沖海底噴火 ＆ 合議制アクション --- */}
            {selectedDay === 4 && (
              <div className="rounded-xl border border-red-800 bg-[#140810] p-4 shadow-lg space-y-4">
                {/* ヘッダー */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="font-bold text-xs text-white">
                        【Day 4 緊急事態】スミス島〜青ヶ島沖海底噴火 ＆ 政府・現地真相調査作戦
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
                    <span className="rounded bg-rose-950 px-2 py-0.5 font-bold text-rose-300 border border-rose-800">
                      東京組: 完全緘口令
                    </span>
                  </div>
                </div>

                {/* 部隊再配置＆メディア緘口令バナー */}
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

                  <div className="rounded-lg border border-red-900/80 bg-red-950/30 p-2.5 text-xs text-red-200 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold text-[11px]">
                        🚫 東京司令部（PC1, PC2）：メディア完全緘口令（情報統制命令）
                      </strong>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                        内閣官房・警察庁より最高機密指令。パニック防止を名目に全報道機関への情報開示を完全封鎖。伊豆諸島住民のSNS投稿も緊急検閲・削除対象。
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

                  <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1">
                    <p>
                      ・<strong>スミス島〜青ヶ島沖の噴火地点</strong>：鳥島沖を通過した物体が北上を続け、須美寿島〜青ヶ島沖（31°40&apos;N, 139°50&apos;E）の海底カルデラで連動大爆発を誘発。海図西側の開けた海域に引き出し線で「🔴 Day 3 須美寿〜青ヶ島沖海底噴火」として他の地名に被らずプロット。
                    </p>
                    <p>
                      ・<strong>青ヶ島・八丈島の地震観測</strong>：連動噴火に伴い、青ヶ島・八丈島で震度1〜2の火山性群発微動が連続観測。島民に不穏な動揺が広がっています。
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
                    <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-3 text-xs text-rose-200 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                        <ShieldAlert className="h-4 w-4 text-rose-400" />
                        🏛️ 【内閣・官邸からの返答：自衛隊防衛出動は見送り（内閣の不作為）】
                      </div>
                      <p className="text-[11px] text-slate-200 italic leading-relaxed">
                        「内閣総理大臣および官邸危機管理センターより通達。『鳥島〜青ヶ島沖の海底噴火と、海保の報告する未確認潜航物体との因果関係が科学的に立証されていない。防衛出動の要件（武力攻撃事態等）には該当せず、現段階での自衛隊部隊出動は見送る。当面は海上保安庁が警戒にあたれ』」
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ※対策本部司令官（PC1）の要請は、国家上層部の冷酷な不作為と法理の壁によって却下されました。自衛隊は動かず、現場の海上保安庁だけで対処せねばなりません。
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/40 p-3 text-xs text-indigo-200 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-indigo-300 text-xs">
                        <Radio className="h-4 w-4 text-indigo-400" />
                        🛡️ 【防衛省・統合幕僚監部からの緊急照会：生物の北上進路に関する意見聴取】
                      </div>
                      <p className="text-[11px] text-slate-200 italic leading-relaxed">
                        「防衛省運用企画局および海上幕僚監部より合同対策本部へ緊急照会。『対策本部が防衛出動を要請しなかった判断は了解した。しかし自衛隊としても伊豆諸島の連続噴火と潜航物体に重大な関心を持っている。この生物は一体どこに向かっているのか？ 進路および最終到達予測地点に関する対策本部の専門的意見を至急提出されたし』」
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ※防衛出動を求めなかった対策本部に対し、防衛省側から生物の進路と目的についての意見が厳しく問われています。
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
                        【合議制アクション】八丈島情報照会 ＆ 小笠原現地4大真相調査
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
                      <Building2 className="h-3.5 w-3.5" /> 東京司令部アクション（1つ選択：八丈島・メディア情報）:
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
                      <Anchor className="h-3.5 w-3.5" /> 小笠原現地アクション（4枠中2枠選択：神社・恩師・隕石・ダイバー）:
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
              </div>
            )}

            {/* --- DAY 6 プレイヤー提供情報：クジラ言語パズル ＆ 音響シミュレータ --- */}
            {selectedDay === 6 && (
              <div className="rounded-xl border border-indigo-800 bg-[#0e0e24] p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-indigo-400" />
                    <span className="font-bold text-xs text-white">
                      【プレイヤー提供情報】Day 6 クジラ言語パズル ＆ 深海音響シミュレータ
                    </span>
                  </div>
                  {onNavigateToPuzzle && (
                    <button
                      onClick={onNavigateToPuzzle}
                      className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> 専用パズル画面を開く
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  恩師・朝倉教授の未発表研究ノート、神社の古文書（祝詞の語順記号）、そして録音テープの実音響データから、マッコウクジラを誘導するクリック音（コーダ）の構文を解読します。
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 text-center">
                    <span className="font-bold text-indigo-300 block">単語1：敵（怪異）</span>
                    <span className="text-[10px] text-slate-400 font-mono">1.2kHz / 重低音均等</span>
                  </div>
                  <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 text-center">
                    <span className="font-bold text-indigo-300 block">単語2：獲物（ご馳走）</span>
                    <span className="text-[10px] text-slate-400 font-mono">3.5kHz / 高速連打</span>
                  </div>
                  <div className="rounded border border-indigo-900/60 bg-slate-950 p-2 text-center">
                    <span className="font-bold text-indigo-300 block">単語3：集まれ（号令）</span>
                    <span className="text-[10px] text-slate-400 font-mono">2.0kHz / 加速4連打</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-xs text-slate-300">
                    古文書の祝詞構文: <strong>「敵」＋「獲物」＋「集まれ」</strong>
                  </span>
                  <button
                    onClick={() => audioEngine?.playMessageSequence(["word-enemy", "word-prey", "word-gather"], 1.0)}
                    className="flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> クジラ召喚音声をテスト再生
                  </button>
                </div>
              </div>
            )}

            {/* --- DAY 7 クライマックス大捕食 --- */}
            {selectedDay === 7 && (
              <div className="rounded-xl border border-emerald-800 bg-[#071d15] p-4 shadow-lg space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-2">
                  <Flame className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-xs text-white">
                    【クライマックス】Day 7 駿河湾大捕食作戦 ＆ 全ソナー網祝詞放流
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  太平洋全域から数千頭のマッコウクジラが駿河湾へ超集結。怪異の超群体を片っ端から噛み砕き、深海の闇へと貪り食っていく大捕食オペレーションの完遂。
                </p>
                <button
                  onClick={() => audioEngine?.playMessageSequence(["word-enemy", "word-prey", "word-gather"], 1.0)}
                  className="w-full flex items-center justify-center gap-2 rounded bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                >
                  <Volume2 className="h-4 w-4" /> 全海域へ祝詞メッセージを放流する（作戦決行）
                </button>
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
                  <EruptionMonitoringChart className="w-full h-full max-h-[70vh] object-contain select-none" />
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
                スミス島〜青ヶ島沖の海底カルデラ噴火（Day 3マーク）および青ヶ島・八丈島での火山性微動（震度1〜2）を網羅。他の島名や地形と被らないよう海図西側に配置。
              </div>
              <span className="font-mono text-cyan-400">連動速度: 時速約6km 北上</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

