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
} from "lucide-react";
import { TOKYO_ACTIONS, FIELD_ACTIONS } from "./GmDashboard";
import { THEATER_TIMELINE_POINTS } from "./NauticalChartView";
import { audioEngine } from "@/utils/audioSynth";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";

// Day 3 アクションの定義
export const DAY3_TOKYO_ACTIONS = [
  {
    id: "D3-T1",
    title: "T-1: 気象庁・火山噴火予知連 広域深海圧力解析",
    organization: "気象庁 地震火山部",
    evidenceId: "ev-volcano-chain-log",
    badge: "地質解析",
    summary: "鳥島海底カルデラの噴火トリガーが「深海800mを通過した巨大質量」による地殻圧力変化であることを科学的に立証。",
    detail: "海底火山の爆発は偶然ではなく、物体が火山フロント沿いに北上する物理的刺激によって順次引き起こされている事実が完全に確定する。",
  },
  {
    id: "D3-T2",
    title: "T-2: 防衛省 広域ソナー探知 ＆ 本土到達タイムリミット算出",
    organization: "防衛省 / 海上自衛隊",
    evidenceId: "ev-eruption-countdown",
    badge: "防衛分析",
    summary: "物体が一時的に中層・海面付近へ再浮上しようとしている音響反応を検知。残り4日（Day 7）で駿河湾・富士山直下に到達する破局リミットを確定。",
    detail: "時速6km（日速約150km）の一定速度を維持。このままではDay 7に富士山直下の巨大マグマ溜まりに到達し、日本列島規模の大破局噴火が誘発される。",
  },
  {
    id: "D3-T3",
    title: "T-3: 国立国会図書館・海洋気象アーカイブ調査（過去の歴史・地質史）",
    organization: "国立国会図書館 / 地質調査所",
    evidenceId: "ev-cult-cargo",
    badge: "歴史文献",
    summary: "明治・大正期の伊豆諸島群発噴火記録を調査。南から順番に連動噴火した特異な過去記録と、海難の変異記録を発見。",
    detail: "過去数百年間にわたり、周期的にこの海域で不可解な局所的連動噴火と巨大海洋生物の目撃が語り継がれていた歴史的痕跡が浮かび上がる。",
  },
];

export const DAY3_FIELD_ACTIONS = [
  {
    id: "D3-F1",
    title: "F-1: 海上保安庁巡視船による鳥島沖観測レポート（再浮上物体の確認）",
    organization: "海上保安庁 警備救難部",
    evidenceId: "ev-sonar-shadow",
    badge: "洋上観測",
    summary: "鳥島南方に展開する大型巡視船からの緊急打電。噴煙の中、海面を大きく盛り上げて再浮上しようとする超巨大な影を目視確認。",
    detail: "海面下で蠢く影は全長数百メートル。高熱の海底火山熱水を回避しながら、正確に北上ルートを維持している。",
  },
  {
    id: "D3-F2",
    title: "F-2: 小笠原の捕鯨船航海日誌・漁業史調査（過去の歴史・生態系）",
    organization: "二見港 郷土資料館",
    evidenceId: "ev-folk-song-rhythm",
    badge: "捕鯨歴史",
    summary: "かつて小笠原を母港としていた捕鯨船の古い日誌を発掘。『深海より現れし黒き魔物と、マッコウクジラの群れが死闘を繰り広げた』記録。",
    detail: "クジラが怪異の天敵であり、太古からこの海で捕食関係にあったことを示唆する極めて重要な歴史的証言（Day 6への伏線）。",
  },
  {
    id: "D3-F3",
    title: "F-3: 島の古い神社・社家の郷土伝承調査（過去の歴史・信仰伝承）",
    organization: "父島 大神山神社 社務所",
    evidenceId: "ev-ancient-shrine-scroll",
    badge: "神事伝承",
    summary: "島に古くから伝わる言い伝え。『海鳴りと共に黒き魔物が通るとき、島人は海に祈りを捧げて災厄を逃れた』という太古の伝承の端緒。",
    detail: "先祖が遺した土蔵の記録の中に、怪異を鎮めるための神事や古い祝詞が存在していた手がかりを発見する。",
  },
  {
    id: "D3-F4",
    title: "F-4: 西之島〜鳥島間 海底観測ブイ・水温異常の現場解析（PC4/PC5）",
    organization: "気象庁 小笠原観測所",
    evidenceId: "ev-volcano-chain-log",
    badge: "海洋観測",
    summary: "物体が通過した航跡に沿って局所的な水温上昇と熱水噴出が起きており、物体の通過が海底火山を誘発している物理的確証を立証。",
    detail: "地殻の断層に沿って、時速約6kmの速度で地温・水温の異常スパイクが北上している波形データを完璧に特定。",
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

  // Day 3 アクション選択状態
  const [day3TokyoAction, setDay3TokyoAction] = useState<string>("D3-T1");
  const [day3FieldActions, setDay3FieldActions] = useState<string[]>(["D3-F2", "D3-F3"]);

  const handleToggleDay2FieldAction = (id: string) => {
    setDay2FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleToggleDay3FieldAction = (id: string) => {
    setDay3FieldActions((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
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

            {/* --- DAY 3 プレイヤー提供情報：火山活動監視状況図 ＆ 歴史調査 --- */}
            {selectedDay === 3 && (
              <div className="rounded-xl border border-rose-800 bg-[#160b13] p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="font-bold text-xs text-white">
                        【プレイヤー提供情報】海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺）
                      </span>
                      <span className="ml-2 text-[10px] text-rose-300 font-mono">
                        噴火日程記録: 西之島(Day 1) ➔ 鳥島沖(Day 2)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTheaterModalOpen(true)}
                    className="flex items-center gap-1 rounded bg-rose-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-600 transition shadow"
                  >
                    <Maximize2 className="h-3 w-3" /> 全画面拡大表示
                  </button>
                </div>

                {/* プレイヤー提示用：噴火監視状況図（日本語版） */}
                <div
                  onClick={() => setIsTheaterModalOpen(true)}
                  className="group relative cursor-pointer overflow-hidden rounded border border-slate-700 bg-[#081325] aspect-video max-h-56 flex items-center justify-center shadow-lg"
                >
                  <EruptionMonitoringChart className="h-full w-full object-contain transition duration-300 group-hover:scale-102" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                    <span className="text-[11px] font-semibold text-slate-200">
                      🔴 噴火観測記録: 西之島(Day 1) ｜ 鳥島沖(Day 2)（時系列記録から物体の動向を分析）
                    </span>
                    <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                      クリックで拡大
                    </span>
                  </div>
                </div>

                {/* Day 3 合議制アクション選択 */}
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-indigo-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Building2 className="h-3.5 w-3.5" /> 東京司令部アクション（1つ選択）:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {DAY3_TOKYO_ACTIONS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setDay3TokyoAction(a.id)}
                          className={`rounded-lg p-2 text-left border transition ${
                            day3TokyoAction === a.id
                              ? "border-rose-500 bg-rose-950/70 shadow ring-1 ring-rose-400"
                              : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                          }`}
                        >
                          <div className="font-bold text-white text-[11px]">{a.title.split(":")[0]} {a.badge}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1 mb-1.5">
                      <Anchor className="h-3.5 w-3.5" /> 小笠原現地アクション（過去の歴史調査 2つ選択）:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {DAY3_FIELD_ACTIONS.map((a) => {
                        const isSelected = day3FieldActions.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() => handleToggleDay3FieldAction(a.id)}
                            className={`rounded-lg p-2 text-left border transition ${
                              isSelected
                                ? "border-amber-500 bg-amber-950/70 shadow ring-1 ring-amber-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[11px]">{a.title.split(":")[0]} {a.badge}</span>
                              <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-amber-600 text-white" : "text-slate-500"}`}>
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

                {/* 火山連動と歴史調査の考察 */}
                <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-rose-300">
                    🔬 火山連動と過去の歴史調査の意義:
                  </span>
                  <p>・<strong>火山連動の立証</strong>: 物体の時速6kmでの北上ペースと、鳥島海底カルデラの大爆発が完全に時間一致。物体の通過が海底火山を刺激していることが科学的に確定。</p>
                  <p>・<strong>過去の歴史調査</strong>: 現代兵器が効くか不透明な中、小笠原の捕鯨船日誌（クジラとの死闘）や神社の古い言い伝えを調査することで、Day 6のクジラ言語パズルへの決定的な布石を打ちます。</p>
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

      {/* Day 3 火山活動監視状況図モーダル */}
      {isTheaterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsTheaterModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    JAPAN COAST GUARD - VOLCANIC ACTIVITY MONITORING REPORT (WGS84) | 観測記録海図
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/images/eruption_monitoring_chart.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition"
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

            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#081325] flex items-center justify-center p-2 min-h-[420px]">
              <EruptionMonitoringChart className="w-full h-full max-h-[68vh] object-contain select-none" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between font-semibold text-rose-300">
                <span>【噴火日程および連動性観測所見】</span>
                <span className="font-mono text-cyan-400">移動速度: 時速約6km (日速約150km)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ・<strong>西之島（Day 1 噴火）</strong>：突発的大規模噴火発生。周辺船舶へ緊急退避命令。<br />
                ・<strong>鳥島沖（Day 2 噴火）</strong>：鳥島海底カルデラが連動大爆発。噴煙高度数千メートル。<br />
                ・<strong>北上ベクトル</strong>：西之島から鳥島までの距離は約380km。24時間で正確に到達しており、時速約6km（日速約150km）のペースで深海を北上する物体が、通過した先々の火山を順次爆発させている動かぬ証拠。<br />
                ・<strong>未噴火警戒域</strong>：北方の青ヶ島、八丈島、三宅島、伊豆大島、富士山方面は現時点で未噴火。
              </p>
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
    </div>
  );
};
