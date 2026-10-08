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
} from "lucide-react";
import { TOKYO_ACTIONS, FIELD_ACTIONS } from "./GmDashboard";
import { THEATER_TIMELINE_POINTS } from "./NauticalChartView";
import { audioEngine } from "@/utils/audioSynth";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";
import { Day3TacticalMap } from "./Day3TacticalMap";

// Day 3 ヘリコプター洋上捜索（ソナー投下地点）の定義
export interface SonarDropPoint {
  id: string;
  name: string;
  sectorLabel: string;
  coordinates: string;
  isPlumeHazard: boolean; // 熱水プルームの罠か？
  distanceKm?: number;    // 成功時の反響距離 (km)
  hazardReason?: string;  // 失敗時の理由
  description: string;
}

export const DAY3_SONAR_POINTS: SonarDropPoint[] = [
  {
    id: "drop-A",
    name: "ポイントA: 鳥島北東カルデラ海域",
    sectorLabel: "セクターα",
    coordinates: "30°40'N, 140°45'E",
    isPlumeHazard: true,
    hazardReason: "鳥島海底カルデラ中心から25km以内の熱水プルーム域！ 火山性微細気泡群による激しい音響クラッターで波形が飽和し、測距不能（自動失敗）！",
    description: "Day 2に噴火した鳥島海底カルデラから約18km（25km危険圏内）。気泡と熱水が激しく滞留する危険海域。",
  },
  {
    id: "drop-B",
    name: "ポイントB: 須美寿島東・海底火山フロント帯",
    sectorLabel: "セクターβ",
    coordinates: "31°25'N, 140°35'E",
    isPlumeHazard: true,
    hazardReason: "須美寿島東の海底熱水噴出孔群から25km以内の警戒域！ 急激な水温躍層による音波屈折と気泡乱反射で探知不能（NO RETURN / 自動失敗）！",
    description: "熱水噴出孔群から約15km（25km危険圏内）。活動的海底海嶺部で海底湧昇流が激しい。",
  },
  {
    id: "drop-C",
    name: "ポイントC: 鳥島北西・深海静穏域",
    sectorLabel: "セクターγ",
    coordinates: "30°50'N, 139°45'E",
    isPlumeHazard: false,
    distanceKm: 32,
    description: "火山フロントから西へ外れた、水深2,500mの静穏な海盆平原。熱水の影響がなくクリア。",
  },
  {
    id: "drop-D",
    name: "ポイントD: 須美寿島西・海嶺西側平原",
    sectorLabel: "セクターδ",
    coordinates: "31°30'N, 139°30'E",
    isPlumeHazard: false,
    distanceKm: 20,
    description: "海嶺西側の安定した音響伝搬層を持つ海域。障害物がなくソナー反響の通りが良い。",
  },
  {
    id: "drop-E",
    name: "ポイントE: 青ヶ島南西・深海盆",
    sectorLabel: "セクターε",
    coordinates: "32°05'N, 139°25'E",
    isPlumeHazard: false,
    distanceKm: 28,
    description: "青ヶ島南方、海嶺西縁に広がる音響ノイズの極めて少ない深海セクター。",
  },
  {
    id: "drop-F",
    name: "ポイントF: 八丈島南西・沖合海域",
    sectorLabel: "セクターζ",
    coordinates: "32°45'N, 139°10'E",
    isPlumeHazard: false,
    distanceKm: 75,
    description: "北方の警戒海域。目標からはやや離れているが海況は安定。",
  },
];

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

  // Day 1 漂流海図の表示モード（白地図 vs 対策本部解析図）
  const [day1ViewMode, setDay1ViewMode] = useState<"investigation" | "tactical">("tactical");

  // Day 2 アクション選択状態
  const [day2TokyoAction, setDay2TokyoAction] = useState<string>("T-3");
  const [day2FieldActions, setDay2FieldActions] = useState<string[]>(["F-1", "F-3"]);

  // Day 3 ソナー投下パズル状態
  const [day3DroppedPoints, setDay3DroppedPoints] = useState<string[]>([]);
  const [day3IsReportUnlocked, setDay3IsReportUnlocked] = useState<boolean>(false);
  const [day3IsPC6ModalOpen, setDay3IsPC6ModalOpen] = useState<boolean>(false);
  const [day3MapTab, setDay3MapTab] = useState<"tactical" | "overview">("tactical");
  const [day3MapMode, setDay3MapMode] = useState<"player" | "gm">("player");

  const handleToggleDay2FieldAction = (id: string) => {
    setDay2FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleToggleDay3SonarDrop = (id: string) => {
    setDay3DroppedPoints((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleResetDay3Sonar = () => {
    setDay3DroppedPoints([]);
    setDay3IsReportUnlocked(false);
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
                <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">
                      【プレイヤー提供情報】小笠原南西海域 航海用海図（CHART NO. W-2704）
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setDay1ViewMode(day1ViewMode === "investigation" ? "tactical" : "investigation")
                      }
                      className="rounded border border-cyan-700 bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-900 transition"
                    >
                      {day1ViewMode === "investigation"
                        ? "対策本部解析図を表示"
                        : "白地図（プレイヤー用）に戻す"}
                    </button>
                    <button
                      onClick={() => setIsDay1ChartModalOpen(true)}
                      className="flex items-center gap-1 rounded bg-cyan-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-cyan-600 transition"
                    >
                      <Maximize2 className="h-3 w-3" /> 大画面で開く
                    </button>
                  </div>
                </div>

                {/* 海図プレビューカード */}
                <div
                  onClick={() => setIsDay1ChartModalOpen(true)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-white aspect-[16/9] max-h-56 flex items-center justify-center p-2 shadow-inner"
                >
                  <div className="text-center text-slate-800">
                    <Compass className="h-10 w-10 mx-auto text-cyan-700 mb-1 animate-spin-slow" />
                    <p className="font-bold text-xs text-slate-900">
                      小笠原南西海域 航海用海図 W-2704 ({day1ViewMode === "investigation" ? "白地図" : "対策本部解析図"})
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      中心: SOS発信位置 / 北東: 父島・南島 / 東・南東: 暗礁群 / ベクトル合成: 東北東へ2.5NM
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded bg-cyan-700 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      <Eye className="h-3 w-3" /> クリックして海図を操作・作図
                    </span>
                  </div>
                </div>

                {/* 漂流予測パズル解説 */}
                <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-amber-300">
                    🧩 漂流予測の計算ロジック（プレイヤーたちが持ち寄る情報）:
                  </span>
                  <p>・<strong>PC1 (風)</strong>: 南西の強風15m/s ➔ 北東へ約1.5ノット押し流される</p>
                  <p>・<strong>PC4/5 (海流・潮目)</strong>: 黒潮支流の表層流は真東へ2.0ノット（減衰なし）</p>
                  <p>・<strong>PC6 (無線)</strong>: 『真横から波を受けている』＝風と海流双方の横波</p>
                  <p>・<strong>PC3 (海難救助)</strong>: 東側・南東側には危険な暗礁群。北東×真東の合成ベクトルである【東北東の漂流予測海域】へ急行して暗礁手前で救助成功！</p>
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

                {/* ② Day 3 作戦海図 ＆ 広域火山監視図プレビュー（タブ切り替え） */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setDay3MapTab("tactical")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                          day3MapTab === "tactical"
                            ? "bg-cyan-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        【メイン作戦海図 W-3100】ソノブイ投下・噴煙・給油艦
                      </button>
                      <button
                        onClick={() => setDay3MapTab("overview")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                          day3MapTab === "overview"
                            ? "bg-rose-700 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        【広域監視図】伊豆・小笠原火山弧 全域
                      </button>
                    </div>

                    <button
                      onClick={() => setIsTheaterModalOpen(true)}
                      className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                      大画面で全機能を開く
                    </button>
                  </div>

                  {/* マップコンポーネント表示部 */}
                  {day3MapTab === "tactical" ? (
                    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl aspect-[16/10] max-h-96">
                      <Day3TacticalMap
                        defaultMode={day3MapMode}
                        onSelectDropPoint={(id) => handleToggleDay3SonarDrop(id)}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsTheaterModalOpen(true)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-[#081325] aspect-video max-h-80 flex items-center justify-center shadow-lg"
                    >
                      <EruptionMonitoringChart className="h-full w-full object-contain transition duration-300 group-hover:scale-102" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-slate-200">
                          🔴 広域噴火観測記録: 西之島(Day 1) ➔ 鳥島沖(Day 2)（時速6km北上）
                        </span>
                        <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                          クリックで拡大
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ③ メイン協力パズル：アクティブソナー3点投下作戦 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Radar className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-xs text-white">
                        【メイン協力パズル】アクティブ・ソノブイ投下（三辺測量索敵）
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
                    怪物はDay 2朝の鳥島沖から時速約6kmで北上中。ヘリからソノブイを投下する海域セクターを合議で選んでください。<br />
                    <span className="text-amber-300 font-semibold">
                      ※海底カルデラや熱水噴出孔から【半径25km以内（約13.5海里）】に投下すると、火山性微細気泡群による激しい音響クラッター障害で自動失敗（測距不能）となります！
                    </span>
                  </p>

                  {/* 投下候補セクターグリッド */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DAY3_SONAR_POINTS.map((pt) => {
                      const isDropped = day3DroppedPoints.includes(pt.id);
                      return (
                        <button
                          key={pt.id}
                          onClick={() => handleToggleDay3SonarDrop(pt.id)}
                          className={`rounded-lg p-2 text-left border transition relative overflow-hidden ${
                            isDropped
                              ? pt.isPlumeHazard
                                ? "border-red-600 bg-red-950/80 shadow ring-1 ring-red-500"
                                : "border-cyan-500 bg-cyan-950/80 shadow ring-1 ring-cyan-400"
                              : "border-slate-800 bg-slate-900/60 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">
                              {pt.sectorLabel}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isDropped
                                  ? pt.isPlumeHazard
                                    ? "bg-red-700 text-white animate-pulse"
                                    : "bg-cyan-600 text-white"
                                  : "text-slate-500 bg-slate-950"
                              }`}
                            >
                              {isDropped ? (pt.isPlumeHazard ? "💥 投下失敗" : "📡 測距成功") : "未投下"}
                            </span>
                          </div>
                          <div className="font-bold text-white text-[11px] mt-1 line-clamp-1">
                            {pt.name.split(":")[1]}
                          </div>
                          <div className="text-[9px] font-mono text-slate-400">{pt.coordinates}</div>

                          {/* 投下後の結果表示 */}
                          {isDropped && (
                            <div className="mt-1.5 pt-1 border-t border-slate-700/60 text-[10px]">
                              {pt.isPlumeHazard ? (
                                <p className="text-red-300 font-semibold leading-tight">
                                  {pt.hazardReason}
                                </p>
                              ) : (
                                <p className="text-cyan-300 font-bold">
                                  反響エコー捕捉！ 目標まで距離: 約<strong>{pt.distanceKm} km</strong>
                                </p>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* 3投完了時の結果判定 ＆ レポートアンロック */}
                  {day3DroppedPoints.length === 3 && (
                    <div className="mt-3 rounded-lg border border-cyan-800 bg-cyan-950/40 p-3 space-y-2">
                      {day3DroppedPoints.filter((id) => !DAY3_SONAR_POINTS.find((p) => p.id === id)?.isPlumeHazard).length >= 2 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                              <Crosshair className="h-4 w-4 text-cyan-400 animate-spin-slow" />
                              【三辺測量 成功】怪物の現在位置を特定（須美寿島西方・水深約400m）！
                            </span>
                            {!day3IsReportUnlocked && (
                              <button
                                onClick={() => setDay3IsReportUnlocked(true)}
                                className="rounded bg-cyan-600 hover:bg-cyan-500 px-3 py-1 text-xs font-bold text-white shadow transition animate-bounce"
                              >
                                ヘリ急行！ 映像・音響データを捉える
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            熱水プルーム域を回避し、複数地点からの音響エコーの交点を特定。時速約6kmの北上ベクトルと完全に合致する座標を割り出しました。
                          </p>

                          {/* 解放された観測レポート */}
                          {day3IsReportUnlocked && (
                            <div className="mt-3 rounded-lg border border-rose-700 bg-slate-950 p-3 text-xs space-y-2 shadow-2xl animate-fade-in">
                              <div className="flex items-center gap-2 border-b border-rose-900/60 pb-1.5">
                                <ImageIcon className="h-4 w-4 text-rose-400" />
                                <span className="font-bold text-white">
                                  【長距離ヘリ洋上観測所見】深度400m 北上物体 撮影・測位レポート
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                ・ヘリの吊下式高感度ソナーおよび暗視光学機器により、水深約400mの中層を北上する<strong>「全長300〜400メートルの巨大な生体シグネチャー」</strong>の姿を鮮明に記録。<br />
                                ・移動速度は実測値で<strong>時速約6km（日速約150km）</strong>。鳥島から正確に北上していることが現場観測で100%確定。<br />
                                ・<strong>【破局タイムリミット】</strong>：このまま北上を続けた場合、<strong>残り4日（Day 7）で駿河湾・富士山直下に到達</strong>し、本土規模の大破局噴火を誘発することが科学的に確定した。
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-red-300 text-xs">
                          ⚠️ <strong>【探知失敗】</strong> 熱水プルームの乱反射により有効な測距データが不足しています。熱水プルーム域を避けて再度ソナー投下を行ってください。（「リセット」をクリック）
                        </div>
                      )}
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
                    onClick={() => setDay3MapTab("tactical")}
                    className={`px-3 py-1 rounded font-semibold transition ${
                      day3MapTab === "tactical"
                        ? "bg-cyan-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    作戦海図 W-3100 (Day 3)
                  </button>
                  <button
                    onClick={() => setDay3MapTab("overview")}
                    className={`px-3 py-1 rounded font-semibold transition ${
                      day3MapTab === "overview"
                        ? "bg-rose-700 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    広域火山監視図 (全域)
                  </button>
                </div>

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
                  onClick={() => setIsTheaterModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
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
                    鳥島沖カルデラから半径25kmの熱水気泡障害圏（自動失敗）を回避し、クリアな平原海盆にソノブイを投下して三辺測量を実施せよ。
                  </div>
                  <div className="font-mono text-slate-400">
                    給油拠点: 須美寿島南西 PLH-31「あきつしま」
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
            className="relative max-w-5xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    小笠原南西海域 航海用海図（CHART NO. W-2704）漂流予測パズル
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:50,000 / 緯度1分(1&apos;) = 1海里 (NM) | {day1ViewMode === "investigation" ? "白地図（プレイヤー提示用）" : "対策本部解析図（ベクトル全表示）"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setDay1ViewMode(day1ViewMode === "investigation" ? "tactical" : "investigation")
                  }
                  className="rounded border border-cyan-700 bg-cyan-950 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition"
                >
                  {day1ViewMode === "investigation" ? "解析図に切り替え" : "白地図に切り替え"}
                </button>
                <button
                  onClick={() => setIsDay1ChartModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#fdfefe] p-4 text-slate-900">
              <div className="h-full w-full flex flex-col items-center justify-center text-center">
                <Compass className="h-16 w-16 text-cyan-700 mb-2 animate-spin-slow" />
                <h4 className="font-bold text-base text-slate-900">
                  {day1ViewMode === "investigation"
                    ? "【プレイヤー提示用 白地図】SOS発信地点 ＆ 父島・南島・暗礁群"
                    : "【対策本部解析図】北東1.5NM（風）＋ 真東2.0NM（海流）＝ 東北東2.5NMへ急行"}
                </h4>
                <p className="text-xs text-slate-600 max-w-xl mt-2 leading-relaxed">
                  {day1ViewMode === "investigation"
                    ? "救難信号発信位置を中心とし、北東に父島・南島、東側および南東側に危険な暗礁群が点在。各プレイヤーの専門情報（風・海流・潮目・船の姿勢）を合成して自力で作図計算します。"
                    : "南西強風15m/sによる風圧流（北東へ1.5kt）と黒潮支流（真東へ2.0kt）の合成ベクトル＝東北東へ約2.5kt。東・南東暗礁群を北側にすり抜け、1時間後の遭難船を捕捉・救助成功！"}
                </p>
                <div className="mt-4 rounded bg-slate-100 p-3 border border-slate-300 text-left text-xs text-slate-700 space-y-1">
                  <p>・<strong>中心地点</strong>: 救難信号発信位置（全電源喪失・漂流開始）</p>
                  <p>・<strong>東暗礁群 / 南東浅礁群</strong>: 三角波による座礁沈没危険海域（回避必須）</p>
                  <p>・<strong>正解救助海域</strong>: 東北東へ約2.5海里（暗礁群の手前北側）</p>
                </div>
              </div>
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
    </div>
  );
};

