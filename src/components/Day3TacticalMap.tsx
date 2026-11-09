"use client";

import React, { useState } from "react";
import { Eye, ShieldAlert, Crosshair, Anchor, Flame, Wind, Navigation, AlertTriangle } from "lucide-react";

interface Day3TacticalMapProps {
  className?: string;
  defaultMode?: "player" | "gm";
  mode?: "player" | "gm";
  onModeChange?: (mode: "player" | "gm") => void;
  showModeControls?: boolean;
  fitToContainer?: boolean;
  selectedDropPointId?: string | null;
  onSelectDropPoint?: (id: string) => void;
}

export const Day3TacticalMap: React.FC<Day3TacticalMapProps> = ({
  className = "w-full",
  defaultMode = "player",
  mode: controlledMode,
  onModeChange,
  showModeControls = true,
  fitToContainer = false,
  selectedDropPointId = null,
  onSelectDropPoint,
}) => {
  const [localMode, setLocalMode] = useState<"player" | "gm">(defaultMode);
  const mode = controlledMode ?? localMode;
  const setMode = (nextMode: "player" | "gm") => {
    setLocalMode(nextMode);
    onModeChange?.(nextMode);
  };

  return (
    <div data-tactical-map data-mode={mode} className={`relative flex min-w-0 flex-col bg-[#07111e] rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none ${className}`}>
      {/* 上部マップコントロールバー */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur z-20">
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
        {showModeControls && <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            aria-pressed={mode === "player"}
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
            aria-pressed={mode === "gm"}
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
        </div>}
      </div>

      {/* SVG メイン海図 */}
      <div className={`relative w-full bg-[#07111e] flex items-center justify-center p-1 ${fitToContainer ? "flex-1 min-h-0" : "min-h-[520px]"}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1180 800"
          className={fitToContainer ? "block w-full h-full min-h-0" : "block w-full h-auto"}
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
            {/* 寸法表示用マーカー */}
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-dim-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 8 2 L 0 5 L 8 8 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* 背景深海 */}
          <rect width="1180" height="800" fill="#07111e" />
          {/* 海溝部暗色 */}
          <rect x="750" y="50" width="410" height="700" fill="url(#trench-deep)" />

          {/* 枠外情報欄との境界線 */}
          <line x1="895" y1="50" x2="895" y2="750" stroke="#1e293b" strokeWidth="1.2" strokeDasharray="3,3" />

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
          {/* 2. 作戦セクターグリッド（6 × 6 = 全36セクター） */}
          {/* ======================================================== */}
          {/* セクター区切り線（薄いシアンの破線：全幅760px ÷ 6 = 126.67px / 高572px ÷ 6 = 95.33px） */}
          <g stroke="#0284c7" strokeWidth="1" strokeDasharray="4,4" opacity="0.45" fill="none">
            {/* 垂直セクター線（x: 120, 246.7, 373.3, 500, 626.7, 753.3, 880） */}
            <line x1="246.7" y1="148" x2="246.7" y2="720" />
            <line x1="373.3" y1="148" x2="373.3" y2="720" />
            <line x1="500.0" y1="148" x2="500.0" y2="720" />
            <line x1="626.7" y1="148" x2="626.7" y2="720" />
            <line x1="753.3" y1="148" x2="753.3" y2="720" />

            {/* 水平セクター線（y: 148, 243.3, 338.7, 434, 529.3, 624.7, 720） */}
            <line x1="120" y1="243.3" x2="880" y2="243.3" />
            <line x1="120" y1="338.7" x2="880" y2="338.7" />
            <line x1="120" y1="434.0" x2="880" y2="434.0" />
            <line x1="120" y1="529.3" x2="880" y2="529.3" />
            <line x1="120" y1="624.7" x2="880" y2="624.7" />
          </g>

          {/* セクター作戦枠外枠（強調） */}
          <rect x="120" y="148" width="760" height="572" fill="none" stroke="#0ea5e9" strokeWidth="1.8" opacity="0.75" />

          {/* 列ヘッダー（上端 1〜6） */}
          <g fill="#38bdf8" opacity="0.8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            <text x="183.3" y="140">COL-1</text>
            <text x="310.0" y="140">COL-2</text>
            <text x="436.7" y="140">COL-3</text>
            <text x="563.3" y="140">COL-4</text>
            <text x="690.0" y="140">COL-5</text>
            <text x="816.7" y="140">COL-6</text>
          </g>

          {/* 行ヘッダー（左端 A〜F） */}
          <g fill="#38bdf8" opacity="0.8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="end">
            <text x="112" y="200">ROW-A</text>
            <text x="112" y="295">ROW-B</text>
            <text x="112" y="390">ROW-C</text>
            <text x="112" y="485">ROW-D</text>
            <text x="112" y="580">ROW-E</text>
            <text x="112" y="675">ROW-F</text>
          </g>

          {/* 36セクター識別ラベル（各マス左上にスタイリッシュに表示） */}
          <g fill="#38bdf8" opacity="0.38" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {/* 行 A */}
            <text x="126" y="163">A-1</text>
            <text x="253" y="163">A-2</text>
            <text x="380" y="163">A-3</text>
            <text x="506" y="163">A-4</text>
            <text x="633" y="163">A-5</text>
            <text x="760" y="163">A-6</text>
            {/* 行 B */}
            <text x="126" y="258">B-1</text>
            <text x="253" y="258">B-2</text>
            <text x="380" y="258">B-3</text>
            <text x="506" y="258">B-4</text>
            <text x="633" y="258">B-5</text>
            <text x="760" y="258">B-6</text>
            {/* 行 C */}
            <text x="126" y="353">C-1</text>
            <text x="253" y="353">C-2</text>
            <text x="380" y="353">C-3</text>
            <text x="506" y="353">C-4</text>
            <text x="633" y="353">C-5</text>
            <text x="760" y="353">C-6</text>
            {/* 行 D */}
            <text x="126" y="449">D-1</text>
            <text x="253" y="449">D-2</text>
            <text x="380" y="449">D-3</text>
            <text x="506" y="449">D-4</text>
            <text x="633" y="449">D-5</text>
            <text x="760" y="449">D-6</text>
            {/* 行 E */}
            <text x="126" y="544">E-1</text>
            <text x="253" y="544">E-2</text>
            <text x="380" y="544">E-3</text>
            <text x="506" y="544">E-4</text>
            <text x="633" y="544">E-5</text>
            <text x="760" y="544">E-6</text>
            {/* 行 F */}
            <text x="126" y="639">F-1</text>
            <text x="253" y="639">F-2</text>
            <text x="380" y="639">F-3</text>
            <text x="506" y="639">F-4</text>
            <text x="633" y="639">F-5</text>
            <text x="760" y="639">F-6</text>
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
          {/* 6. GM専用：音響クラッター障害危険圏（半径20km ＝ 約1セクター） */}
          {/* ======================================================== */}
          {mode === "gm" && (
            <g className="animate-fade-in">
              {/* ポイント1：鳥島沖海底カルデラ（E-5）の20km危険円 */}
              <g transform="translate(639, 613)">
                <circle cx="0" cy="0" r="52" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="-52" y="68" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  [E-5 カルデラクラッター障害圏 R=20km]
                </text>
              </g>

              {/* ポイント2：須美寿東（C-5）の熱水噴出孔群と20km危険円 */}
              <g transform="translate(722, 396)">
                <circle cx="0" cy="0" r="52" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="0" cy="0" r="7" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                <text x="-45" y="-12" fill="#fb923c" fontSize="10.5" fontWeight="bold">
                  ♨ 須美寿東 海底熱水域
                </text>
                <text x="-45" y="68" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  [C-5 熱水クラッター障害圏 R=20km]
                </text>
              </g>

              {/* ポイント3：セクターD-2（西鳥島海山）の熱水噴出孔群と20km危険円 */}
              <g transform="translate(310, 482)">
                <circle cx="0" cy="0" r="52" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="0" cy="0" r="7" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                <text x="-48" y="-12" fill="#fb923c" fontSize="10.5" fontWeight="bold">
                  ♨ 西鳥島海山 海底熱水域 (D-2)
                </text>
                <text x="-52" y="68" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  [D-2 熱水クラッター障害圏 R=20km]
                </text>
              </g>
            </g>
          )}

          {/* 7. 洋上給油巡視船（PLH-31 あきつしま）画面左下配置 */}
          {/* ======================================================== */}
          {/* 巡視船座標 (画面左下・セクターF-1海域: x:160, y:680) */}
          <g transform="translate(160, 680)">
            {/* 安全補給海域サークル */}
            <circle cx="0" cy="0" r="22" fill="#0369a1" opacity="0.3" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* 巡視船シンボル (船アイコン) */}
            <polygon points="-14,5 14,5 18,-2 10,-6 -10,-6 -14,5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            {/* ヘリ甲板マーク */}
            <circle cx="6" cy="0" r="4" fill="none" stroke="#ffffff" strokeWidth="1" />
            <text x="6" y="2.5" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">H</text>
            <rect x="-8" y="-9" width="8" height="4" fill="#e0f2fe" />

            {/* ラベル（船の右側にすっきり横並び配置） */}
            <rect x="26" y="-20" width="200" height="40" rx="4" fill="#082f49" opacity="0.95" stroke="#0ea5e9" strokeWidth="1" />
            <text x="34" y="-6" fill="#38bdf8" fontSize="10.5" fontWeight="bold">
              ⚓ 大型巡視船 PLH-31「あきつしま」
            </text>
            <text x="34" y="6" fill="#e0f2fe" fontSize="8.5">
              ヘリ洋上給油中継拠点 (FARP) ｜ 待機海域
            </text>
            <text x="34" y="16" fill="#7dd3fc" fontSize="8" fontFamily="monospace">
              30°08&apos;N, 139°10&apos;E (セクターF-1)
            </text>
          </g>

          {/* ======================================================== */}
          {/* 8. GM用マップ限定表示：巨大生物の現在位置（セクターB-3） ＆ ソナー判定円 */}
          {/* ======================================================== */}
          {mode === "gm" && (
            <g className="animate-fade-in">
              {/* 巨大生物の現在位置（セクターB-3中心: x:437, y:291） */}
              <g transform="translate(437, 291)">
                {/* 判定目安円1：隣接セクター判定圏（半径 約115px ＝ 約20km圏） */}
                <circle
                  cx="0"
                  cy="0"
                  r="115"
                  fill="#38bdf8"
                  fillOpacity="0.05"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="6,4"
                  opacity="0.7"
                />
                <text x="0" y="128" fill="#38bdf8" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  隣接セクター判定圏 (R≒20km: B2, B4, A3, C3, 斜めセクター)
                </text>

                {/* 判定目安円2：直上至近距離反響圏（半径 35px） */}
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  fill="#ef4444"
                  fillOpacity="0.1"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />

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

                {/* GM解説情報ボックス（左下に配置して視認性確保） */}
                <rect x="-215" y="38" width="245" height="66" rx="5" fill="#0f172a" opacity="0.95" stroke="#ef4444" strokeWidth="1.5" />
                <text x="-205" y="55" fill="#ef4444" fontSize="11" fontWeight="bold">
                  🚨 【GM真相】潜航目標・現在位置（B-3）
                </text>
                <text x="-205" y="70" fill="#f87171" fontSize="9.5">
                  全長300〜400m 巨大生体質量（深度400m）
                </text>
                <text x="-205" y="84" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                  直上: B-3 ｜ 隣接(反響約20km): B2/B4/A3/C3/斜め
                </text>
                <text x="-205" y="97" fill="#7dd3fc" fontSize="8" fontFamily="monospace">
                  座標: 31°52&apos;N, 139°48&apos;E (セクターB-3 / 水深400m)
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* 9. 作戦枠外：海図情報パネル（方位盤 ＆ 凡例 ＆ 仕様欄 ＆ ソノブイ探知範囲図） */}
          {/* ======================================================== */}
          {/* 方位盤（コンパスローズ：枠外右上） */}
          <g transform="translate(1037, 84)">
            <circle cx="0" cy="0" r="22" fill="none" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#475569" strokeWidth="1" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#475569" strokeWidth="1" />
            <polygon points="0,-22 -4,-8 0,-12 4,-8" fill="#38bdf8" />
            <polygon points="0,22 -4,8 0,12 4,8" fill="#64748b" />
            <text x="0" y="-26" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">N</text>
            <text x="0" y="33" fill="#64748b" fontSize="8.5" textAnchor="middle">S</text>
            <text x="30" y="3" fill="#64748b" fontSize="8.5" textAnchor="middle">E</text>
            <text x="-30" y="3" fill="#64748b" fontSize="8.5" textAnchor="middle">W</text>
          </g>

          {/* 海図凡例（LEGEND：枠外中央右・青い四角の外側） */}
          <g transform="translate(915, 124)">
            <rect width="245" height="176" rx="6" fill="#091424" opacity="0.95" stroke="#1e293b" strokeWidth="1.2" />
            <text x="14" y="18" fill="#94a3b8" fontSize="10.5" fontWeight="bold">【海図凡例 / LEGEND】</text>

            {/* 36作戦セクター */}
            <rect x="16" y="29" width="11" height="11" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="2,2" />
            <text x="34" y="38" fill="#e0f2fe" fontSize="9" fontWeight="bold">36作戦セクター (6×6グリッド)</text>
            <text x="34" y="49" fill="#7dd3fc" fontSize="8" fontFamily="monospace">1区画: 約20km四方 (東西約20km×南北約20km)</text>

            {/* 給油巡視船 */}
            <polygon points="16,66 28,66 30,60 24,58 18,58" fill="#0284c7" />
            <text x="34" y="64" fill="#e0f2fe" fontSize="9" fontWeight="bold">大型巡視船 PLH「あきつしま」</text>
            <text x="34" y="75" fill="#94a3b8" fontSize="8">画面左下 セクターF-1海域 (待機中)</text>

            {/* カルデラ */}
            <circle cx="22" cy="91" r="5.5" fill="#f43f5e" />
            <text x="34" y="91" fill="#fda4af" fontSize="9" fontWeight="bold">鳥島沖海底カルデラ</text>
            <text x="34" y="102" fill="#94a3b8" fontSize="8">Day 2突発的大爆発 震源地</text>

            {/* 噴煙拡散域 */}
            <ellipse cx="22" cy="118" rx="7.5" ry="4.5" fill="#dc2626" opacity="0.75" />
            <text x="34" y="118" fill="#fca5a5" fontSize="9" fontWeight="bold">噴煙柱・降灰拡散域 (8,000m)</text>
            <text x="34" y="129" fill="#94a3b8" fontSize="8">航空危険空域 (NOTAM)</text>

            {/* 火山フロント軸 */}
            <line x1="16" y1="145" x2="28" y2="145" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
            <text x="34" y="145" fill="#cbd5e1" fontSize="9" fontWeight="bold">伊豆・小笠原火山フロント軸</text>
            <text x="34" y="156" fill="#94a3b8" fontSize="8">海底海嶺・マグマ上昇帯</text>

            {/* GM真相時のみ凡例に熱水クラッターも記載 */}
            {mode === "gm" && (
              <>
                <circle cx="22" cy="167" r="5" fill="url(#plume-dots)" stroke="#f97316" strokeWidth="1" />
                <text x="34" y="170" fill="#fb923c" fontSize="8" fontWeight="bold">海底熱水音響障害圏 (R=20km: D-2/C-5/E-5)</text>
              </>
            )}
          </g>

          {/* 作戦海図仕様スペック欄（枠外中央右） */}
          <g transform="translate(915, 308)">
            <rect width="245" height="86" rx="6" fill="#0c192c" opacity="0.95" stroke="#1e293b" strokeWidth="1.2" />
            <text x="14" y="18" fill="#38bdf8" fontSize="10.5" fontWeight="bold">【作戦海図仕様 / W-3100】</text>
            <text x="14" y="34" fill="#cbd5e1" fontSize="8.5">縮尺: 1:200,000 ｜ 漸長緯度図法 (WGS-84)</text>
            <text x="14" y="48" fill="#cbd5e1" fontSize="8.5">管轄: 海上保安庁・関係機関 合同対策本部</text>
            <text x="14" y="64" fill="#38bdf8" fontSize="8.5" fontWeight="bold">作戦セクター規格:</text>
            <text x="14" y="76" fill="#7dd3fc" fontSize="8" fontFamily="monospace">全36セクター (COL-1〜6 × ROW-A〜F)</text>
          </g>

          {/* 1セクター規格サンプル図（文字の重なりを解消・約20km表記に統一） */}
          <g transform="translate(915, 402)">
            <rect width="245" height="146" rx="6" fill="#091424" opacity="0.95" stroke="#1e293b" strokeWidth="1.2" />
            <text x="14" y="18" fill="#38bdf8" fontSize="10.5" fontWeight="bold">【1セクター規格サンプル図】</text>

            {/* 青い四角枠のサンプルセクター（タイトルと重ならないようy=46に配置） */}
            <g transform="translate(82, 46)">
              {/* 青い枠のセクター四角形 */}
              <rect
                x="0"
                y="0"
                width="116"
                height="72"
                fill="#0284c7"
                fillOpacity="0.14"
                stroke="#0ea5e9"
                strokeWidth="2"
                rx="2"
              />
              <text x="8" y="15" fill="#38bdf8" fontSize="8.5" fontWeight="bold" fontFamily="monospace">SAMPLE</text>
              <text x="58" y="42" fill="#e0f2fe" fontSize="10.5" fontWeight="bold" textAnchor="middle">1セクター</text>

              {/* 横幅寸法線 (横 約20km) */}
              <line x1="0" y1="-11" x2="116" y2="-11" stroke="#38bdf8" strokeWidth="1.2" markerStart="url(#arrow-dim-rev)" markerEnd="url(#arrow-dim)" />
              <rect x="25" y="-19" width="66" height="15" rx="3" fill="#082f49" stroke="#0ea5e9" strokeWidth="0.8" />
              <text x="58" y="-8" fill="#e0f2fe" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">横 約20km</text>

              {/* 縦高寸法線 (縦 約20km) */}
              <line x1="-12" y1="0" x2="-12" y2="72" stroke="#38bdf8" strokeWidth="1.2" markerStart="url(#arrow-dim-rev)" markerEnd="url(#arrow-dim)" />
              <rect x="-46" y="28" width="64" height="15" rx="3" fill="#082f49" stroke="#0ea5e9" strokeWidth="0.8" />
              <text x="-14" y="39" fill="#e0f2fe" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">縦 約20km</text>
            </g>

            {/* 下部説明テキスト */}
            <text x="122.5" y="136" fill="#7dd3fc" fontSize="8.5" fontFamily="monospace" textAnchor="middle">
              東西 約20km × 南北 約20km (全36区画)
            </text>
          </g>

          {/* ソノブイ投下時の有効探知範囲（3×3セクター図解） */}
          <g transform="translate(915, 556)">
            <rect width="245" height="194" rx="6" fill="#091424" opacity="0.95" stroke="#1e293b" strokeWidth="1.2" />
            <text x="14" y="18" fill="#38bdf8" fontSize="10.5" fontWeight="bold">【ソノブイ有効探知範囲（例）】</text>
            <text x="14" y="32" fill="#cbd5e1" fontSize="8">投下セクターと縦・横・斜め1セクターを同時検出</text>

            {/* 3×3 セクターミニ図解 (左側に配置: 各マス 34×28px = 102×84px) */}
            <g transform="translate(14, 42)">
              {/* 1行目 (左上・上・右上) */}
              <rect x="0" y="0" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="17" y="17" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              <rect x="34" y="0" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="51" y="17" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              <rect x="68" y="0" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="85" y="17" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              {/* 2行目 (左・中心[投下]・右) */}
              <rect x="0" y="28" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="17" y="45" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              {/* 中心：投下セクター */}
              <rect x="34" y="28" width="34" height="28" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.8" />
              <text x="51" y="41" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">投下</text>
              <text x="51" y="51" fill="#bae6fd" fontSize="6.5" textAnchor="middle">(中心)</text>

              <rect x="68" y="28" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="85" y="45" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              {/* 3行目 (左下・下・右下) */}
              <rect x="0" y="56" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="17" y="73" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              <rect x="34" y="56" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="51" y="73" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              <rect x="68" y="56" width="34" height="28" fill="#0c4a6e" fillOpacity="0.55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
              <text x="85" y="73" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" textAnchor="middle">探知</text>

              {/* アクティブソナー音波の広がりリング */}
              <circle cx="51" cy="42" r="24" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
              <circle cx="51" cy="42" r="44" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3,2" opacity="0.85" />
              {/* 3×3外枠 */}
              <rect x="0" y="0" width="102" height="84" fill="none" stroke="#0ea5e9" strokeWidth="1.5" rx="2" />
            </g>

            {/* 右側：凡例・解説 */}
            <g transform="translate(124, 46)">
              {/* 投下セクター */}
              <rect x="0" y="0" width="12" height="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" rx="1.5" />
              <text x="16" y="10" fill="#e0f2fe" fontSize="8.5" fontWeight="bold">投下セクター</text>
              <text x="16" y="21" fill="#94a3b8" fontSize="7.5">直上・至近距離探知</text>

              {/* 周囲8セクター */}
              <rect x="0" y="32" width="12" height="12" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" rx="1.5" />
              <text x="16" y="42" fill="#7dd3fc" fontSize="8.5" fontWeight="bold">周囲8セクター</text>
              <text x="16" y="53" fill="#94a3b8" fontSize="7.5">縦・横・斜め1セクター</text>
              <text x="16" y="64" fill="#38bdf8" fontSize="7.5" fontWeight="bold">アクティブソナー探知</text>
            </g>

            {/* 下部まとめボックス */}
            <rect x="12" y="134" width="221" height="50" rx="4" fill="#082f49" opacity="0.8" stroke="#0ea5e9" strokeWidth="1" />
            <text x="122.5" y="149" fill="#38bdf8" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              計9セクター（3×3区画）をアクティブ探知
            </text>
            <text x="122.5" y="163" fill="#e0f2fe" fontSize="7.5" textAnchor="middle">
              投下した1区画＋縦・横・斜め1区画（周囲8マス）に
            </text>
            <text x="122.5" y="175" fill="#e0f2fe" fontSize="7.5" textAnchor="middle">
              存在する海中目標の反響を検出可能
            </text>
          </g>
        </svg>
      </div>

      {/* 下部ステータスバー */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {mode === "player" ? (
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Eye className="h-3.5 w-3.5" /> プレイヤー提示中: 潜航目標の位置は伏せられています。
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-semibold animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5" /> GM閲覧中: 目標位置（セクターB-3・深度400m）および索敵判定圏を表示中。
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
          <span>給油中継: PLH-31（海図左下・セクターF-1）</span>
          <span>1セクター: 約20km四方</span>
          {mode === "gm" && <span className="text-amber-400">熱水判定: 直上=探知不能 / 隣接=直下不在確定＆周囲妨害</span>}
        </div>
      </div>
    </div>
  );
};
