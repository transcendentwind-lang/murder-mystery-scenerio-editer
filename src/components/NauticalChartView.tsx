"use client";

import React, { useState, useRef } from "react";
import {
  Compass,
  Download,
  Printer,
  Eye,
  EyeOff,
  Wind,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Info,
  Navigation,
  FileText,
} from "lucide-react";

interface NauticalChartViewProps {
  onBackToDashboard?: () => void;
}

export const NauticalChartView: React.FC<NauticalChartViewProps> = ({ onBackToDashboard }) => {
  // 表示モード: 'investigation' (プレイヤー用白図) | 'tactical' (対策本部作戦図)
  const [viewMode, setViewMode] = useState<"investigation" | "tactical">("tactical");

  // レイヤー表示トグル
  const [showWindVector, setShowWindVector] = useState(true);
  const [showCurrentVector, setShowCurrentVector] = useState(true);
  const [showReefDanger, setShowReefDanger] = useState(true);
  const [showResultVector, setShowResultVector] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBathymetry, setShowBathymetry] = useState(true);

  const svgRef = useRef<SVGSVGElement>(null);

  // プレイヤー配布用モードに切り替え
  const setPlayerMode = () => {
    setViewMode("investigation");
    setShowWindVector(false);
    setShowCurrentVector(false);
    setShowReefDanger(false);
    setShowResultVector(false);
  };

  // 対策本部解析モードに切り替え
  const setTacticalMode = () => {
    setViewMode("tactical");
    setShowWindVector(true);
    setShowCurrentVector(true);
    setShowReefDanger(true);
    setShowResultVector(true);
  };

  // SVGダウンロード
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `小笠原南西海域_航海用海図_W2704_${viewMode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PNGダウンロード (印刷・オフライン用)
  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `小笠原南西海域_航海用海図_W2704_${viewMode}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // 印刷
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部コントロールバー */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-700/30 text-cyan-400 border border-cyan-500/30">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                小笠原南西海域 航海用海図（W-2704）
              </h2>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[11px] font-mono text-cyan-300 border border-cyan-800">
                縮尺 1:50,000 / 1目盛り = 1海里 (NM)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Day 1 漂流予測パズル：海流（2.0kt 真東）× 風浪（1.5kt 北東）ベクトル合成検証
            </p>
          </div>
        </div>

        {/* モード切替 ＆ アクションボタン */}
        <div className="flex items-center gap-2.5">
          {/* 視点切替 */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={setPlayerMode}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "investigation"
                  ? "bg-slate-700 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="プレイヤー配布用：ベクトル答えなしの白図"
            >
              <EyeOff className="h-3.5 w-3.5" />
              プレイヤー提示用（白図）
            </button>
            <button
              onClick={setTacticalMode}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "tactical"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="対策本部解析用：風・海流・暗礁・正解ベクトル全表示"
            >
              <Eye className="h-3.5 w-3.5" />
              対策本部解析図（全情報）
            </button>
          </div>

          {/* 出力ボタン */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
              title="印刷用PNG画像を保存"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              PNG保存
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
              title="ベクターSVGファイルを保存"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              SVG保存
            </button>
            <button
              onClick={handlePrint}
              className="rounded p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="ブラウザ印刷ダイアログを開く"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* メインレイアウト：左側に海図本体、右側にパズル解説＆レイヤー操作 */}
      <div className="grid flex-1 grid-cols-12 gap-5 overflow-hidden">
        {/* 左側：海図レンダリングエリア (SVG) */}
        <div className="col-span-8 flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a] p-3 shadow-inner overflow-hidden relative">
          <div className="h-full w-full max-h-[820px] max-w-[1100px] flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 700"
              className="h-full w-full select-none rounded shadow-2xl"
              style={{ backgroundColor: "#fdfefe" }}
            >
              <defs>
                {/* 矢印マーカー */}
                <marker
                  id="arrow-current"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                </marker>
                <marker
                  id="arrow-wind"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488" />
                </marker>
                <marker
                  id="arrow-result"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
                </marker>

                {/* 暗礁危険区域の斜線パターン */}
                <pattern
                  id="reef-pattern"
                  width="12"
                  height="12"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="2.5" opacity="0.3" />
                </pattern>

                {/* 浅瀬グラデーション */}
                <radialGradient id="shallow-grad" cx="880" cy="120" r="240" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fdfefe" stopOpacity="0.1" />
                </radialGradient>
              </defs>

              {/* 背景：海図用紙のオフホワイト地 */}
              <rect x="0" y="0" width="1000" height="700" fill="#fcfdfd" />

              {/* 浅瀬・陸地（右上：父島南西端の浅海） */}
              {showBathymetry && (
                <>
                  <circle cx="920" cy="80" r="280" fill="url(#shallow-grad)" />
                  <path
                    d="M 880 0 Q 860 60 890 110 T 960 140 L 1000 130 L 1000 0 Z"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  <text x="920" y="55" fontSize="11" fontWeight="bold" fill="#475569" letterSpacing="2">
                    父島 (南西端)
                  </text>
                  <text x="895" y="72" fontSize="9" fill="#64748b">
                    CHICHI-JIMA
                  </text>

                  {/* 等深線 (Bathymetric contours) */}
                  <path
                    d="M 650 0 C 670 120 720 220 840 280 C 910 320 950 350 1000 370"
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                  <text x="730" y="210" fontSize="9" fill="#0284c7" transform="rotate(35 730 210)">
                    -200m
                  </text>

                  <path
                    d="M 450 0 C 480 180 560 350 720 480 C 820 560 900 620 1000 660"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="1"
                  />
                  <text x="560" y="320" fontSize="9" fill="#3b82f6" transform="rotate(40 560 320)">
                    -500m
                  </text>

                  <path
                    d="M 280 0 C 310 240 400 480 580 620 L 680 700"
                    fill="none"
                    stroke="#bfdbfe"
                    strokeWidth="0.8"
                  />
                  <text x="380" y="420" fontSize="9" fill="#60a5fa" transform="rotate(45 380 420)">
                    -1000m
                  </text>

                  {/* 散布水深値 (Soundings in metres) */}
                  <g fontSize="9" fill="#64748b" fontFamily="monospace">
                    <text x="860" y="160">68</text>
                    <text x="780" y="130">142</text>
                    <text x="820" y="220">195</text>
                    <text x="720" y="270">310</text>
                    <text x="640" y="210">285</text>
                    <text x="760" y="390">420</text>
                    <text x="600" y="430">650</text>
                    <text x="470" y="260">580</text>
                    <text x="360" y="280">1120</text>
                    <text x="420" y="520">1240</text>
                    <text x="250" y="450">1850</text>
                    <text x="180" y="260">2100</text>
                    <text x="150" y="520">2320</text>
                  </g>
                </>
              )}

              {/* 緯度経度グリッド線 (1目盛り = 1海里 = 80px) */}
              {showGrid && (
                <g stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2 3">
                  {/* 経度線 (垂直) */}
                  <line x1="120" y1="40" x2="120" y2="660" />
                  <line x1="200" y1="40" x2="200" y2="660" />
                  <line x1="280" y1="40" x2="280" y2="660" />
                  <line x1="360" y1="40" x2="360" y2="660" />
                  <line x1="440" y1="40" x2="440" y2="660" />
                  <line x1="520" y1="40" x2="520" y2="660" />
                  <line x1="600" y1="40" x2="600" y2="660" />
                  <line x1="680" y1="40" x2="680" y2="660" />
                  <line x1="760" y1="40" x2="760" y2="660" />
                  <line x1="840" y1="40" x2="840" y2="660" />
                  <line x1="920" y1="40" x2="920" y2="660" />

                  {/* 緯度線 (水平) */}
                  <line x1="60" y1="100" x2="960" y2="100" />
                  <line x1="60" y1="180" x2="960" y2="180" />
                  <line x1="60" y1="260" x2="960" y2="260" />
                  <line x1="60" y1="340" x2="960" y2="340" />
                  <line x1="60" y1="420" x2="960" y2="420" />
                  <line x1="60" y1="500" x2="960" y2="500" />
                  <line x1="60" y1="580" x2="960" y2="580" />
                </g>
              )}

              {/* 外枠（ボーダー）：航海用海図の本格的マージンと目盛り */}
              {/* 外枠ダブルライン */}
              <rect x="58" y="38" width="904" height="624" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              <rect x="62" y="42" width="896" height="616" fill="none" stroke="#0f172a" strokeWidth="0.8" />

              {/* 緯度・経度の目盛り数値 */}
              <g fontSize="10" fontWeight="bold" fill="#0f172a" fontFamily="monospace">
                {/* 経度 (上・下) */}
                <text x="270" y="32">142°05'E</text>
                <text x="510" y="32">142°08'E</text>
                <text x="750" y="32">142°11'E</text>

                <text x="270" y="676">142°05'E</text>
                <text x="510" y="676">142°08'E</text>
                <text x="750" y="676">142°11'E</text>

                {/* 緯度 (左・右) */}
                <text x="10" y="184">27°06'N</text>
                <text x="10" y="344">27°04'N</text>
                <text x="10" y="504">27°02'N</text>

                <text x="965" y="184">27°06'N</text>
                <text x="965" y="344">27°04'N</text>
                <text x="965" y="504">27°02'N</text>
              </g>

              {/* 方位盤（コンパスローズ：Compass Rose） */}
              <g transform="translate(180, 180)">
                {/* 外円（度数目盛り） */}
                <circle cx="0" cy="0" r="85" fill="none" stroke="#64748b" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="78" fill="none" stroke="#94a3b8" strokeWidth="0.6" />

                {/* 10度刻みの細線 */}
                {Array.from({ length: 36 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-85"
                    x2="0"
                    y2={i % 9 === 0 ? "-70" : i % 3 === 0 ? "-74" : "-78"}
                    stroke="#475569"
                    strokeWidth={i % 9 === 0 ? "1.5" : "0.7"}
                    transform={`rotate(${i * 10} 0 0)`}
                  />
                ))}

                {/* 16方位テキスト */}
                <text x="0" y="-89" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">N</text>
                <text x="94" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">E</text>
                <text x="0" y="98" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">S</text>
                <text x="-94" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">W</text>
                <text x="64" y="-62" textAnchor="middle" fontSize="9" fill="#475569">NE</text>
                <text x="64" y="68" textAnchor="middle" fontSize="9" fill="#475569">SE</text>
                <text x="-64" y="68" textAnchor="middle" fontSize="9" fill="#475569">SW</text>
                <text x="-64" y="-62" textAnchor="middle" fontSize="9" fill="#475569">NW</text>

                {/* 磁北偏差の破線矢印 (Var 7°05' W) */}
                <line
                  x1="0"
                  y1="50"
                  x2="0"
                  y2="-75"
                  stroke="#dc2626"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  transform="rotate(-7.1 0 0)"
                />
                <text
                  x="-12"
                  y="-62"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#dc2626"
                  transform="rotate(-7.1 0 0)"
                >
                  磁北 7°W
                </text>

                {/* 中心スター */}
                <path
                  d="M 0 -22 L 4 -6 L 20 0 L 4 6 L 0 22 L -4 6 L -20 0 L -4 -6 Z"
                  fill="#0f172a"
                />
                <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
              </g>

              {/* 縮尺スケールバー（左下） */}
              <g transform="translate(100, 610)">
                <rect x="0" y="0" width="240" height="7" fill="#0f172a" />
                <rect x="0" y="0" width="80" height="7" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
                <rect x="160" y="0" width="80" height="7" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
                <text x="0" y="-4" fontSize="9" fontWeight="bold" fill="#0f172a">0</text>
                <text x="80" y="-4" fontSize="9" fontWeight="bold" fill="#0f172a">1 NM</text>
                <text x="160" y="-4" fontSize="9" fontWeight="bold" fill="#0f172a">2 NM</text>
                <text x="240" y="-4" fontSize="9" fontWeight="bold" fill="#0f172a">3 海里 (NM)</text>
                <text x="120" y="20" textAnchor="middle" fontSize="9" fill="#64748b">
                  SCALE 1:50,000 (1海里 = 80px)
                </text>
              </g>

              {/* 海図公式タイトル枠（カルトゥーシュ：右下） */}
              <g transform="translate(680, 500)">
                <rect
                  x="0"
                  y="0"
                  width="250"
                  height="135"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  rx="3"
                />
                <rect x="3" y="3" width="244" height="129" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
                <text x="125" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" letterSpacing="1">
                  日本 小笠原諸島
                </text>
                <text x="125" y="38" textAnchor="middle" fontSize="14" fontWeight="extrabold" fill="#0f172a">
                  父島南西海域
                </text>
                <text x="125" y="52" textAnchor="middle" fontSize="9" fill="#475569" letterSpacing="1">
                  SOUTH-WEST OF CHICHI-JIMA
                </text>
                <line x1="20" y1="60" x2="230" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                <text x="125" y="74" textAnchor="middle" fontSize="9" fill="#334155">
                  縮尺 1:50,000 / 水深：メートル (m)
                </text>
                <text x="125" y="88" textAnchor="middle" fontSize="8" fill="#64748b">
                  世界測地系 (WGS-84) 準拠
                </text>
                <text x="125" y="102" textAnchor="middle" fontSize="8" fill="#64748b">
                  救難対策本部 緊急合同作戦用海図
                </text>
                <text x="125" y="118" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1">
                  CHART NO. W-2704
                </text>
              </g>

              {/* ======================================================== */}
              {/* 事件プロット ＆ 漂流パズル作図レイヤー */}
              {/* ======================================================== */}

              {/* 座標定義 (基準スケール: 1海里 = 80px) */}
              {/* 発信地点 S: (360, 360) */}
              {/* 地点A (北東): S + 1.5NM北東 (dx=+85, dy=-85) => (445, 275) */}
              {/* 地点B (真東): S + 2.0NM真東 (dx=+160, dy=0) => (520, 360) */}
              {/* 地点C (東・暗礁群): S + 3.0NM真東 (dx=+240, dy=0) => (600, 360) */}
              {/* 地点D (正解・東北東): S + (海流160, 0) + (風85, -85) => (605, 275) */}

              {/* 東側の危険暗礁群（地点C周辺） */}
              <g>
                {/* 危険暗礁サークル */}
                <ellipse
                  cx="610"
                  cy="360"
                  rx="65"
                  ry="50"
                  fill={showReefDanger ? "url(#reef-pattern)" : "none"}
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                />

                {/* 海図の暗礁・洗岩記号 (+) */}
                <g stroke="#b91c1c" strokeWidth="1.8">
                  <line x1="595" y1="340" x2="605" y2="340" /><line x1="600" y1="335" x2="600" y2="345" />
                  <line x1="620" y1="350" x2="630" y2="350" /><line x1="625" y1="345" x2="625" y2="355" />
                  <line x1="585" y1="365" x2="595" y2="365" /><line x1="590" y1="360" x2="590" y2="370" />
                  <line x1="615" y1="375" x2="625" y2="375" /><line x1="620" y1="370" x2="620" y2="380" />
                </g>

                {showReefDanger && (
                  <g>
                    <rect x="555" y="415" width="110" height="22" fill="#fef2f2" stroke="#dc2626" rx="3" />
                    <text x="610" y="430" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#b91c1c">
                      ⚠️ 浅礁・座礁危険水域
                    </text>
                  </g>
                )}
              </g>

              {/* 作戦解析レイヤー：ベクトル作図（風・海流・平行四辺形） */}
              {viewMode === "tactical" && (
                <g>
                  {/* 海流ベクトル（真東 2.0ノット × 1時間 = 2.0海里 = 160px） */}
                  {showCurrentVector && (
                    <g>
                      <line
                        x1="360"
                        y1="360"
                        x2="520"
                        y2="360"
                        stroke="#0284c7"
                        strokeWidth="3.5"
                        markerEnd="url(#arrow-current)"
                      />
                      <rect x="400" y="368" width="105" height="18" fill="#f0f9ff" stroke="#38bdf8" rx="2" />
                      <text x="452" y="381" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1">
                        黒潮支流 2.0kt (真東)
                      </text>
                    </g>
                  )}

                  {/* 風圧流ベクトル（南西風15m/s → 北東へ約1.5ノット = 1.5海里 = 120px, dx=85, dy=-85） */}
                  {showWindVector && (
                    <g>
                      <line
                        x1="360"
                        y1="360"
                        x2="445"
                        y2="275"
                        stroke="#0d9488"
                        strokeWidth="3.5"
                        strokeDasharray="6 3"
                        markerEnd="url(#arrow-wind)"
                      />
                      <rect x="360" y="280" width="115" height="18" fill="#f0fdfa" stroke="#2dd4bf" rx="2" />
                      <text x="417" y="293" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f766e">
                        風圧流 約1.5kt (北東)
                      </text>
                    </g>
                  )}

                  {/* ベクトル合成の補助線（平行四辺形の点線） */}
                  {showResultVector && (
                    <g>
                      {/* 海流矢印の先 (520,360) から風ベクトル (dx=85, dy=-85) で地点D (605, 275) へ */}
                      <line
                        x1="520"
                        y1="360"
                        x2="605"
                        y2="275"
                        stroke="#0d9488"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      {/* 風矢印の先 (445,275) から海流ベクトル (dx=160, dy=0) で地点D (605, 275) へ */}
                      <line
                        x1="445"
                        y1="275"
                        x2="605"
                        y2="275"
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />

                      {/* 合成移動ベクトル（発信地点から地点Dへの太い赤矢印） */}
                      <line
                        x1="360"
                        y1="360"
                        x2="605"
                        y2="275"
                        stroke="#dc2626"
                        strokeWidth="4"
                        markerEnd="url(#arrow-result)"
                      />
                      <rect x="470" y="300" width="125" height="20" fill="#fef2f2" stroke="#f87171" rx="3" />
                      <text x="532" y="314" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#b91c1c">
                        合成漂流ベクトル (東北東)
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* 遭難信号 発信地点（メーデー地点 S: 360, 360） */}
              <g transform="translate(360, 360)">
                <circle cx="0" cy="0" r="16" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
                <circle cx="0" cy="0" r="28" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
                {/* ×印 */}
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="-8" y1="8" x2="8" y2="-8" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />

                <rect x="-140" y="-45" width="130" height="34" fill="#ffffff" stroke="#dc2626" strokeWidth="1.5" rx="3" />
                <text x="-75" y="-30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">
                  SOS発信位置 (09:00)
                </text>
                <text x="-75" y="-16" textAnchor="middle" fontSize="9" fill="#475569">
                  40t民間船・全電源喪失
                </text>
              </g>

              {/* 漂流予測 候補地点（A, B, C, D）のプロット */}
              {/* 地点A (445, 275) */}
              <g transform="translate(445, 275)">
                <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">A</text>
                <rect x="-45" y="-32" width="90" height="18" fill="#ffffff" stroke="#94a3b8" rx="2" />
                <text x="0" y="-20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">
                  地点A (北東1.5NM)
                </text>
                {viewMode === "tactical" && (
                  <text x="0" y="24" textAnchor="middle" fontSize="8" fill="#0d9488" fontWeight="bold">
                    【風のみ考慮】
                  </text>
                )}
              </g>

              {/* 地点B (520, 360) */}
              <g transform="translate(520, 360)">
                <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">B</text>
                <rect x="-45" y="18" width="90" height="18" fill="#ffffff" stroke="#94a3b8" rx="2" />
                <text x="0" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">
                  地点B (真東2.0NM)
                </text>
                {viewMode === "tactical" && (
                  <text x="0" y="45" textAnchor="middle" fontSize="8" fill="#0284c7" fontWeight="bold">
                    【海流のみ考慮】
                  </text>
                )}
              </g>

              {/* 地点C (600, 360) */}
              <g transform="translate(600, 360)">
                <circle cx="0" cy="0" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">C</text>
                <rect x="-55" y="-32" width="110" height="18" fill="#ffffff" stroke="#f87171" rx="2" />
                <text x="0" y="-20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#b91c1c">
                  地点C (東3.0NM 暗礁)
                </text>
                {viewMode === "tactical" && (
                  <text x="0" y="24" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="bold">
                    【座礁沈没エリア】
                  </text>
                )}
              </g>

              {/* 地点D (605, 275) : 正解救助目標地点 */}
              <g transform="translate(605, 275)">
                <circle
                  cx="0"
                  cy="0"
                  r={viewMode === "tactical" ? "18" : "14"}
                  fill={viewMode === "tactical" ? "#dcfce7" : "#ffffff"}
                  stroke={viewMode === "tactical" ? "#16a34a" : "#0f172a"}
                  strokeWidth={viewMode === "tactical" ? "3" : "2"}
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={viewMode === "tactical" ? "#15803d" : "#0f172a"}
                >
                  D
                </text>

                <rect
                  x="-75"
                  y="-40"
                  width="150"
                  height={viewMode === "tactical" ? "30" : "18"}
                  fill="#ffffff"
                  stroke={viewMode === "tactical" ? "#22c55e" : "#94a3b8"}
                  strokeWidth={viewMode === "tactical" ? "2" : "1"}
                  rx="3"
                />
                <text
                  x="0"
                  y="-27"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={viewMode === "tactical" ? "#15803d" : "#334155"}
                >
                  地点D (東北東海域)
                </text>
                {viewMode === "tactical" && (
                  <text x="0" y="-14" textAnchor="middle" fontSize="9" fontWeight="extrabold" fill="#16a34a">
                    ⭐ 1時間後 到達予測・救助地点
                  </text>
                )}
              </g>
            </svg>
          </div>
        </div>

        {/* 右側：パズル解説 ＆ レイヤー操作 ＆ 情報対照表 */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* レイヤー表示切り替えパネル */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Compass className="h-4 w-4 text-cyan-400" />
              作戦レイヤー表示切り替え
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-teal-400" />
                  <span className="font-medium text-slate-200">風向・風圧流ベクトル (PC1)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showWindVector}
                  onChange={(e) => setShowWindVector(e.target.checked)}
                  className="rounded border-slate-700 text-teal-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-sky-400" />
                  <span className="font-medium text-slate-200">表層海流ベクトル (PC4/PC5)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCurrentVector}
                  onChange={(e) => setShowCurrentVector(e.target.checked)}
                  className="rounded border-slate-700 text-sky-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-slate-200">東側暗礁群・座礁危険域 (PC3)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showReefDanger}
                  onChange={(e) => setShowReefDanger(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 cursor-pointer hover:border-slate-700 transition">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">合成予測線 ＆ 正解地点D</span>
                </div>
                <input
                  type="checkbox"
                  checked={showResultVector}
                  onChange={(e) => setShowResultVector(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* 6人の情報トランプ対照表（パズルの解法ロジック） */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
              <Info className="h-4 w-4" />
              Day 1 漂流予測パズルの論理構造
            </h3>

            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-teal-300">① 風の影響 (PC1)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  南西の強風15m/s。40t船の受風面積から【北東へ約1.5ノット】押し流される（1時間で北東へ1.5海里）。風だけ見ると「地点A」へ向かう。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-sky-300">② 海流の影響 (PC4 ＆ PC5)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  黒潮支流の表層流は【真東へ2.0ノット】。水温データから冷水塊との潮目に乗っており減衰なし。海流だけ見ると「地点B」へ向かう。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-indigo-300">③ 船の姿勢 (PC6 無線ログ)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  『真横から波を受けている』＝船は風に煽られつつ、横から海流をまともに受けて両方の力を同時に受けている証明。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-red-300">④ 危険の回避 (PC3 海難救助)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  真東3.0海里には危険な暗礁群（地点C）。風浪の三角波で叩きつけられたら船は座礁沈没する。
                </p>
              </div>

              <div className="rounded border border-emerald-900/60 bg-emerald-950/30 p-2.5">
                <span className="font-bold text-emerald-300">🎯 結論：地点D救急急行</span>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  北東（風）＋ 真東（海流）のベクトル合成＝【東北東の地点D】。暗礁群の手前で先回り捕捉し、救出オペレーションを成功させる！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
