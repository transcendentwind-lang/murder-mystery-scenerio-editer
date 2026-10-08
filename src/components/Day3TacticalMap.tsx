"use client";

import React, { useState } from "react";
import { Eye, ShieldAlert, Crosshair, Anchor, Flame, Wind, Navigation, AlertTriangle } from "lucide-react";

interface Day3TacticalMapProps {
  className?: string;
  defaultMode?: "player" | "gm";
  selectedDropPointId?: string | null;
  onSelectDropPoint?: (id: string) => void;
}

export const Day3TacticalMap: React.FC<Day3TacticalMapProps> = ({
  className = "w-full h-full",
  defaultMode = "player",
  selectedDropPointId = null,
  onSelectDropPoint,
}) => {
  const [mode, setMode] = useState<"player" | "gm">(defaultMode);

  return (
    <div className="relative flex flex-col w-full h-full bg-[#07111e] rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 上部マップコントロールバー */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <Navigation className="h-4 w-4 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white tracking-wide">
                海上保安庁・自衛隊 合同作戦海図 W-3100
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                縮尺 1:200,000 / WGS84
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              鳥島〜須美寿島海域 ヘリコプター洋上ソナー索敵作戦図（Day 3 作戦盤）
            </p>
          </div>
        </div>

        {/* プレイヤー用 / GM用 切り替えトグル */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMode("player")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              mode === "player"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            プレイヤー用マップ
          </button>
          <button
            onClick={() => setMode("gm")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              mode === "gm"
                ? "bg-rose-600 text-white shadow animate-pulse"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            GM用マップ（真相・怪物の位置）
          </button>
        </div>
      </div>

      {/* SVG メイン海図 */}
      <div className="relative flex-1 w-full h-full min-h-[520px] bg-[#07111e] flex items-center justify-center p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 800"
          className="w-full h-full max-h-[75vh] object-contain"
          style={{
            background: "#07111e",
            fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
          }}
        >
          <defs>
            {/* 海盆・海溝グラデーション */}
            <radialGradient id="trench-deep" cx="80%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#020813" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#07111e" stopOpacity="0" />
            </radialGradient>

            {/* 噴煙（スモーククラウド）グラデーション */}
            <radialGradient id="ash-cloud-grad" cx="40%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#78350f" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#451a03" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
            </radialGradient>

            {/* 熱水プルーム（気泡クラッター）パターンハッチング */}
            <pattern id="plume-dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="#f59e0b" opacity="0.4" />
              <circle cx="9" cy="9" r="2.0" fill="#f97316" opacity="0.5" />
              <circle cx="9" cy="3" r="1.0" fill="#ef4444" opacity="0.4" />
            </pattern>

            {/* ソナー音波伝搬アニメーション用フィルター */}
            <filter id="sonar-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 怪獣シグネチャーの赤色光彩 */}
            <filter id="monster-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix type="matrix" values="1 0 0 0 1   0 0.2 0 0 0   0 0 0.2 0 0  0 0 0 1 0"/>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景深海 */}
          <rect width="1000" height="800" fill="#07111e" />
          {/* 海溝部暗色 */}
          <rect x="750" y="50" width="220" height="700" fill="url(#trench-deep)" />

          {/* ======================================================== */}
          {/* 1. 経緯度グリッド線 ＆ 目盛 */}
          {/* ======================================================== */}
          {/* 経度線 (139.0°E 〜 141.0°E, 幅760px: 1° = 380px) */}
          <line x1="120" y1="50" x2="120" y2="750" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="120" y="42" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">139°00&apos;E</text>
          <text x="120" y="768" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">139°00&apos;E</text>

          <line x1="310" y1="50" x2="310" y2="750" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="310" y="42" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">139°30&apos;E</text>
          <text x="310" y="768" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">139°30&apos;E</text>

          <line x1="500" y1="50" x2="500" y2="750" stroke="#334155" strokeWidth="1.2" strokeDasharray="4,4" />
          <text x="500" y="42" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">140°00&apos;E</text>
          <text x="500" y="768" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">140°00&apos;E</text>

          <line x1="690" y1="50" x2="690" y2="750" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="690" y="42" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">140°30&apos;E</text>
          <text x="690" y="768" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">140°30&apos;E</text>

          <line x1="880" y1="50" x2="880" y2="750" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="880" y="42" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">141°00&apos;E</text>
          <text x="880" y="768" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">141°00&apos;E</text>

          {/* 緯度線 (30.0°N 〜 32.8°N, 高640px: 1° = 228.6px) */}
          <line x1="90" y1="720" x2="910" y2="720" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="80" y="724" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">30°00&apos;N</text>

          <line x1="90" y1="605" x2="910" y2="605" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="80" y="609" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">30°30&apos;N</text>

          <line x1="90" y1="491" x2="910" y2="491" stroke="#334155" strokeWidth="1.2" strokeDasharray="4,4" />
          <text x="80" y="495" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">31°00&apos;N</text>

          <line x1="90" y1="377" x2="910" y2="377" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="80" y="381" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">31°30&apos;N</text>

          <line x1="90" y1="263" x2="910" y2="263" stroke="#334155" strokeWidth="1.2" strokeDasharray="4,4" />
          <text x="80" y="267" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">32°00&apos;N</text>

          <line x1="90" y1="148" x2="910" y2="148" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <text x="80" y="152" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">32°30&apos;N</text>

          {/* ======================================================== */}
          {/* 2. 作戦セクターグリッド（TACTICAL GRIDS） */}
          {/* ======================================================== */}
          {/* セクター区切り線（薄い青のブロック） */}
          <g stroke="#0e3a5a" strokeWidth="1" strokeDasharray="6,4" fill="none">
            {/* 水平線 */}
            <line x1="120" y1="263" x2="880" y2="263" />
            <line x1="120" y1="491" x2="880" y2="491" />
            {/* 垂直線 */}
            <line x1="380" y1="50" x2="380" y2="750" />
            <line x1="640" y1="50" x2="640" y2="750" />
          </g>

          {/* セクター識別ラベル */}
          <g fill="#38bdf8" opacity="0.35" fontSize="13" fontWeight="bold" fontFamily="monospace">
            <text x="140" y="80">SECTOR-1 [NORTH-WEST]</text>
            <text x="400" y="80">SECTOR-2 [NORTH-AXIS]</text>
            <text x="660" y="80">SECTOR-3 [NORTH-EAST]</text>
            <text x="140" y="295">SECTOR-4 [MID-WEST]</text>
            <text x="400" y="295">SECTOR-5 [MID-AXIS]</text>
            <text x="660" y="295">SECTOR-6 [MID-EAST]</text>
            <text x="140" y="525">SECTOR-7 [SOUTH-WEST]</text>
            <text x="400" y="525">SECTOR-8 [SOUTH-AXIS]</text>
            <text x="660" y="525">SECTOR-9 [SOUTH-EAST]</text>
          </g>

          {/* ======================================================== */}
          {/* 3. 火山フロント構造線（海底海嶺・海山列） */}
          {/* ======================================================== */}
          <path
            d="M 620 740 Q 580 500 520 380 T 410 160"
            fill="none"
            stroke="#991b1b"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            opacity="0.6"
          />
          <text x="475" y="280" fill="#f87171" fontSize="10" opacity="0.75" transform="rotate(-65 475 280)">
            ◀ 伊豆・小笠原火山フロント軸（海底海嶺）
          </text>

          {/* ======================================================== */}
          {/* 4. 主要島嶼（地形） */}
          {/* ======================================================== */}
          {/* 青ヶ島 (32°27'N, 139°46'E -> x:411, y:160) */}
          <g transform="translate(411, 160)">
            <ellipse rx="7" ry="9" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#facc15" />
            <text x="14" y="4" fill="#ffffff" fontSize="12" fontWeight="bold">青ヶ島</text>
            <text x="14" y="16" fill="#86efac" fontSize="9" fontFamily="monospace">Aogashima (32°27&apos;N)</text>
          </g>

          {/* 須美寿島 (31°26'N, 140°03'E -> x:519, y:392) */}
          <g transform="translate(519, 392)">
            <ellipse rx="5" ry="6" fill="#166534" stroke="#4ade80" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="2" fill="#facc15" />
            <text x="12" y="4" fill="#ffffff" fontSize="12" fontWeight="bold">須美寿島</text>
            <text x="12" y="16" fill="#86efac" fontSize="9" fontFamily="monospace">Sumisu Jima (31°26&apos;N)</text>
          </g>

          {/* 鳥島 (30°29'N, 140°18'E -> x:614, y:610) */}
          <g transform="translate(614, 610)">
            <ellipse rx="8" ry="8" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#ef4444" />
            <text x="-12" y="-12" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="end">鳥島</text>
            <text x="-12" y="0" fill="#86efac" fontSize="9" fontFamily="monospace" textAnchor="end">Torishima (30°29&apos;N)</text>
          </g>

          {/* ======================================================== */}
          {/* 5. 鳥島沖海底カルデラ ＆ 噴煙範囲（最重要） */}
          {/* ======================================================== */}
          {/* 海底カルデラ中心 (x:639, y:613) */}
          <g transform="translate(639, 613)">
            {/* カルデラ外輪カルデラリム（水深凹地） */}
            <circle cx="0" cy="0" r="28" fill="#1e1b4b" opacity="0.6" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
            <circle cx="0" cy="0" r="16" fill="#4c0519" opacity="0.8" stroke="#fb7185" strokeWidth="1.5" />
            
            {/* 噴火中心パルス */}
            <circle cx="0" cy="0" r="8" fill="#ef4444" className="animate-ping" opacity="0.75" />
            <circle cx="0" cy="0" r="6" fill="#f43f5e" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />

            {/* カルデラ表記 */}
            <text x="34" y="-10" fill="#f43f5e" fontSize="13" fontWeight="bold">
              ★ 鳥島沖海底カルデラ（噴火震源地）
            </text>
            <text x="34" y="6" fill="#fda4af" fontSize="10">
              Day 2突発的大水蒸気爆発 | 水深-800m
            </text>
            <text x="34" y="18" fill="#fda4af" fontSize="9" fontFamily="monospace">
              30°28&apos;N, 140°22&apos;E (直径約9km)
            </text>
          </g>

          {/* 噴煙柱および降灰・微細気泡拡散オーバル（南西風により北東へ拡大） */}
          <g>
            {/* 上空噴煙雲・降灰域 (中心 x:690, y:560, rx:95, ry:60, 回転: -25度) */}
            <ellipse
              cx="700"
              cy="580"
              rx="105"
              ry="65"
              transform="rotate(-25 700 580)"
              fill="url(#ash-cloud-grad)"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity="0.85"
            />
            
            {/* 風向ベクトル矢印 */}
            <line x1="610" y1="650" x2="720" y2="520" stroke="#f87171" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="725,515 712,522 721,531" fill="#f87171" />
            <text x="640" y="670" fill="#fca5a5" fontSize="10" fontWeight="bold">
              風向: 南西 ➔ 北東 (噴煙・火山灰拡散軸)
            </text>

            <rect x="680" y="520" width="165" height="42" rx="4" fill="#0f172a" opacity="0.85" stroke="#ef4444" strokeWidth="1" />
            <text x="688" y="536" fill="#fca5a5" fontSize="10" fontWeight="bold">
              ⚠️ 噴煙柱高度 8,000m 拡散域
            </text>
            <text x="688" y="552" fill="#cbd5e1" fontSize="9">
              航空危険空域 (NOTAM) / 降灰域
            </text>
          </g>

          {/* ======================================================== */}
          {/* 6. GM専用：音響クラッター障害危険圏（半径25km） */}
          {/* ======================================================== */}
          {mode === "gm" && (
            <g className="animate-fade-in">
              {/* ポイントA（鳥島北東）の25km危険円 */}
              <g transform="translate(639, 613)">
                <circle cx="0" cy="0" r="54" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="-52" y="70" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  [熱水クラッター障害圏 R=25km]
                </text>
              </g>

              {/* ポイントB（須美寿島東）の熱水噴出孔群と25km危険円 */}
              <g transform="translate(722, 396)">
                <circle cx="0" cy="0" r="54" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="0" cy="0" r="8" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                <text x="-45" y="-14" fill="#fb923c" fontSize="11" fontWeight="bold">
                  ♨ 須美寿東 海底熱水域
                </text>
                <text x="-45" y="70" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  [熱水クラッター障害圏 R=25km]
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* 7. 洋上給油巡視船（PLH-31 あきつしま）位置 ＆ 航路 */}
          {/* ======================================================== */}
          {/* 巡視船座標 (30°55'N, 139°25'E -> x:278, y:510) */}
          <g transform="translate(278, 510)">
            {/* 安全補給海域サークル */}
            <circle cx="0" cy="0" r="22" fill="#0369a1" opacity="0.3" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* 巡視船シンボル (船アイコン) */}
            <polygon points="-14,5 14,5 18,-2 10,-6 -10,-6 -14,5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            {/* ヘリ甲板マーク */}
            <circle cx="6" cy="0" r="4" fill="none" stroke="#ffffff" strokeWidth="1" />
            <text x="6" y="2.5" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">H</text>
            <rect x="-8" y="-9" width="8" height="4" fill="#e0f2fe" />

            {/* ラベル */}
            <rect x="25" y="-18" width="185" height="46" rx="4" fill="#082f49" opacity="0.9" stroke="#0ea5e9" strokeWidth="1" />
            <text x="32" y="-4" fill="#38bdf8" fontSize="11" fontWeight="bold">
              ⚓ 海上保安庁 PLH-31「あきつしま」
            </text>
            <text x="32" y="10" fill="#e0f2fe" fontSize="9">
              ヘリ甲板搭載・洋上給油中継拠点 (FARP)
            </text>
            <text x="32" y="22" fill="#7dd3fc" fontSize="8.5" fontFamily="monospace">
              30°55&apos;N, 139°25&apos;E (静穏深海域に待機)
            </text>

            {/* ヘリ哨戒ルート破線 */}
            <path
              d="M 18 -15 Q 150 -50 250 -100"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeDasharray="4,3"
            />
            <text x="120" y="-70" fill="#bae6fd" fontSize="9" fontWeight="bold">
              ✈ 捜索ヘリ洋上進出ルート
            </text>
          </g>

          {/* ======================================================== */}
          {/* 8. ソナー投下可能地点（グリッド候補 A〜F） */}
          {/* ======================================================== */}
          {/* ポイントA（x:785, y:567） */}
          <g
            transform="translate(785, 567)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-A")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点A [セクターα]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">鳥島北東カルデラ外海</text>
          </g>

          {/* ポイントB（x:722, y:396） */}
          <g
            transform="translate(722, 396)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-B")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点B [セクターβ]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">須美寿島東・海嶺東側</text>
          </g>

          {/* ポイントC（クリア: x:405, y:530） */}
          <g
            transform="translate(405, 530)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-C")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点C [セクターγ]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">鳥島北西・静穏海盆</text>
          </g>

          {/* ポイントD（クリア: x:310, y:377） */}
          <g
            transform="translate(310, 377)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-D")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点D [セクターδ]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">須美寿島西・海嶺西平原</text>
          </g>

          {/* ポイントE（クリア: x:278, y:244） */}
          <g
            transform="translate(278, 244)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-E")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点E [セクターε]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">青ヶ島南西・深海盆</text>
          </g>

          {/* ポイントF（クリア: x:215, y:110） */}
          <g
            transform="translate(215, 110)"
            className="cursor-pointer"
            onClick={() => onSelectDropPoint && onSelectDropPoint("drop-F")}
          >
            <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#34d399" />
            <text x="16" y="-6" fill="#34d399" fontSize="11" fontWeight="bold">地点F [セクターζ]</text>
            <text x="16" y="8" fill="#a7f3d0" fontSize="8.5">八丈島南西・北方沖</text>
          </g>

          {/* ======================================================== */}
          {/* 9. GM用マップ限定表示：巨大生物の現在位置 ＆ 三辺測量交点 */}
          {/* ======================================================== */}
          {mode === "gm" && (
            <g className="animate-fade-in">
              {/* 三辺測量ソナー反響円 */}
              {/* ポイントCからの距離円 (32km ≒ 半径68px) */}
              <circle
                cx="405"
                cy="530"
                r="125"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                opacity="0.6"
              />
              <text x="405" y="668" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                反響半径: 32km (地点C)
              </text>

              {/* ポイントDからの距離円 (20km ≒ 半径78px) */}
              <circle
                cx="310"
                cy="377"
                r="82"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                opacity="0.6"
              />
              <text x="235" y="445" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                反響半径: 20km (地点D)
              </text>

              {/* ポイントEからの距離円 (28km ≒ 半径110px) */}
              <circle
                cx="278"
                cy="244"
                r="194"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                opacity="0.4"
              />

              {/* 巨大生物の現在位置（須美寿島西方沖・深度400m: x:386, y:408） */}
              <g transform="translate(386, 408)">
                {/* 警戒エリア赤パルス */}
                <circle cx="0" cy="0" r="42" fill="#ef4444" opacity="0.2" className="animate-ping" />
                <circle cx="0" cy="0" r="26" fill="#7f1d1d" opacity="0.6" stroke="#ef4444" strokeWidth="2" />

                {/* 巨大生物シルエット（イカ・怪獣の巨大影） */}
                <g transform="rotate(-15) scale(0.95)" filter="url(#monster-glow)">
                  <path
                    d="M 0 -22 C -8 -10 -10 10 0 24 C 10 10 8 -10 0 -22 Z"
                    fill="#f43f5e"
                  />
                  {/* 触手・触角 */}
                  <path
                    d="M -3 20 Q -10 32 -14 42 M 3 20 Q 10 32 14 42 M -1 22 Q -5 36 -6 46 M 1 22 Q 5 36 6 46"
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                {/* 北上進行ベクトル矢印 */}
                <line x1="0" y1="-26" x2="0" y2="-75" stroke="#ef4444" strokeWidth="3" />
                <polygon points="0,-82 -6,-70 6,-70" fill="#ef4444" />
                <text x="8" y="-55" fill="#fca5a5" fontSize="10" fontWeight="bold">
                  北上進行ベクトル (時速約6km / 深度400m)
                </text>

                {/* GM解説情報ボックス */}
                <rect x="-195" y="48" width="235" height="52" rx="4" fill="#0f172a" opacity="0.95" stroke="#ef4444" strokeWidth="1.5" />
                <text x="-185" y="64" fill="#ef4444" fontSize="11" fontWeight="bold">
                  🚨 【GM真相】潜航目標・現在位置
                </text>
                <text x="-185" y="79" fill="#f87171" fontSize="9.5">
                  全長300〜400m 巨大生体質量（深度400m）
                </text>
                <text x="-185" y="93" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                  座標: 31°22&apos;N, 139°42&apos;E (須美寿島西方約35km)
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* 10. 海図凡例（LEGEND） */}
          {/* ======================================================== */}
          <g transform="translate(30, 620)">
            <rect width="210" height="110" rx="6" fill="#091424" opacity="0.92" stroke="#1e293b" strokeWidth="1.2" />
            <text x="12" y="18" fill="#94a3b8" fontSize="10" fontWeight="bold">【海図凡例 / LEGEND】</text>

            {/* カルデラ */}
            <circle cx="20" cy="34" r="5" fill="#f43f5e" />
            <text x="32" y="37" fill="#cbd5e1" fontSize="9">海底カルデラ（噴火震源地）</text>

            {/* 給油巡視船 */}
            <polygon points="14,52 26,52 28,46 22,44 16,44" fill="#0284c7" />
            <text x="32" y="50" fill="#cbd5e1" fontSize="9">洋上給油巡視船 PLH「あきつしま」</text>

            {/* ソナー投下地点 */}
            <circle cx="20" cy="67" r="5" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <text x="32" y="70" fill="#cbd5e1" fontSize="9">ソナー投下候補グリッド (A〜F)</text>

            {/* 噴煙拡散域 */}
            <ellipse cx="20" cy="84" rx="7" ry="4" fill="#dc2626" opacity="0.7" />
            <text x="32" y="87" fill="#cbd5e1" fontSize="9">噴煙柱・降灰拡散域 (8,000m)</text>
          </g>

          {/* 方位盤（コンパスローズ） */}
          <g transform="translate(930, 110)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="-28" x2="0" y2="28" stroke="#475569" strokeWidth="1" />
            <line x1="-28" y1="0" x2="28" y2="0" stroke="#475569" strokeWidth="1" />
            <polygon points="0,-28 -5,-10 0,-15 5,-10" fill="#38bdf8" />
            <polygon points="0,28 -5,10 0,15 5,10" fill="#64748b" />
            <text x="0" y="-32" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
            <text x="0" y="40" fill="#64748b" fontSize="9" textAnchor="middle">S</text>
            <text x="36" y="3" fill="#64748b" fontSize="9" textAnchor="middle">E</text>
            <text x="-36" y="3" fill="#64748b" fontSize="9" textAnchor="middle">W</text>
          </g>
        </svg>
      </div>

      {/* 下部ステータスバー */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {mode === "player" ? (
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Eye className="h-3.5 w-3.5" /> プレイヤー提示中: 潜航目標の位置は伏せられています。
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-semibold animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5" /> GM閲覧中: 深度400m潜航座標および三辺測量交点を表示中。
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span>給油中継: PLH-31（須美寿島南西）</span>
          <span>投下制限: 最大3機</span>
          {mode === "gm" && <span className="text-amber-400">熱水プルーム障害: R=25km</span>}
        </div>
      </div>
    </div>
  );
};
