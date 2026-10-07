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
  Globe,
  Maximize2,
  X,
  Flame,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  MapPin,
  Layers,
} from "lucide-react";

export const THEATER_TIMELINE_POINTS = [
  {
    day: 1,
    name: "父島南西沖（小笠原）",
    distance: "0 km",
    depth: "約1,200m",
    status: "遭難船救助完了",
    summary: "民間船の全電源喪失。海流・風のベクトル合成計算で漂流船を救助。スクリューにダイオウイカの触手。",
    coords: "27°05'N, 142°11'E",
    tag: "Day 1 救助",
    color: "cyan",
  },
  {
    day: 2,
    name: "西之島沖",
    distance: "約130 km",
    depth: "約2,000m",
    status: "海底火山突発噴火",
    summary: "西之島海底火山の突発大噴火。熱水回避のため水深10〜20mに急浮上したケルビン波と数百mの影を空撮。",
    coords: "27°15'N, 140°53'E",
    tag: "Day 2 噴火",
    color: "amber",
  },
  {
    day: 3,
    name: "孀婦岩 〜 鳥島沖",
    distance: "約420 km",
    depth: "約3,500m",
    status: "鳥島カルデラ連動噴火",
    summary: "時速6kmでの北上ペースと連動噴火が確定。火山フロント沿いに北上する怪異と過去の歴史調査。",
    coords: "30°29'N, 140°18'E",
    tag: "Day 3 現在地",
    color: "rose",
  },
  {
    day: 4,
    name: "須美寿島 〜 青ヶ島沖",
    distance: "約600 km",
    depth: "約4,000m",
    status: "有人島接近・避難葛藤",
    summary: "伊豆諸島有人島（青ヶ島・八丈島）への接近。東京司令部と現地救難隊の間で情報隠蔽と避難の対立激化。",
    coords: "32°27'N, 139°46'E",
    tag: "Day 4 予測",
    color: "indigo",
  },
  {
    day: 5,
    name: "八丈島 〜 三宅島沖",
    distance: "約800 km",
    depth: "約2,500m",
    status: "自衛隊魚雷迎撃・無効化",
    summary: "海上自衛隊の重魚雷が直撃するも泥のように瞬時再結合。通常兵器による武力阻止の完全失敗。",
    coords: "34°05'N, 139°31'E",
    tag: "Day 5 予測",
    color: "purple",
  },
  {
    day: 6,
    name: "伊豆大島 〜 駿河湾入口",
    distance: "約950 km",
    depth: "約1,500m",
    status: "駿河トラフ深海潜航",
    summary: "物体は駿河トラフ深海へ突入。恩師の録音テープと古文書から、マッコウクジラ言語パズルを解析。",
    coords: "34°44'N, 138°50'E",
    tag: "Day 6 予測",
    color: "blue",
  },
  {
    day: 7,
    name: "駿河トラフ奥 〜 富士山直下",
    distance: "約1,000 km",
    depth: "陸上地下",
    status: "破局噴火リミット・大捕食",
    summary: "富士山マグマ溜まり到達まで残り数時間。全ソナー網からクジラ召喚祝詞を放流し数千頭で大捕食作戦決行。",
    coords: "35°21'N, 138°44'E",
    tag: "Day 7 決戦",
    color: "emerald",
  },
];

interface NauticalChartViewProps {
  onBackToDashboard?: () => void;
}

export const NauticalChartView: React.FC<NauticalChartViewProps> = ({ onBackToDashboard }) => {
  // 海図種別: 'theater_wide' (広域作戦海図 W1001: 小笠原〜富士山) | 'day1_drift' (局所漂流海図 W2704: Day 1 SOS救助)
  const [chartType, setChartType] = useState<"theater_wide" | "day1_drift">("theater_wide");
  const [isTheaterModalOpen, setIsTheaterModalOpen] = useState(false);
  const [selectedDayFocus, setSelectedDayFocus] = useState<number>(3);

  // 表示モード: 'investigation' (プレイヤー用白図: 中心がSOS地点、父島・南島、暗礁記号のみ) | 'tactical' (対策本部作戦図: ベクトル・解答全表示)
  const [viewMode, setViewMode] = useState<"investigation" | "tactical">("investigation");

  // レイヤー表示トグル (対策本部モード時に有効)
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
    a.download = `小笠原南西海域_航海用海図_W2704_${viewMode === "investigation" ? "白図_プレイヤー提示用" : "対策本部解析図"}.svg`;
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
        a.download = `小笠原南西海域_航海用海図_W2704_${viewMode === "investigation" ? "白図_プレイヤー提示用" : "対策本部解析図"}.png`;
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
      {/* 最上部：海図種別切り替えタブ */}
      <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
        <button
          onClick={() => setChartType("theater_wide")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition shadow ${
            chartType === "theater_wide"
              ? "bg-indigo-600 text-white ring-2 ring-indigo-400/50"
              : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Globe className="h-4 w-4 text-cyan-400" />
          【広域作戦海図 W1001】小笠原〜伊豆〜富士山 縦断監視マップ (Day 2-7)
        </button>
        <button
          onClick={() => setChartType("day1_drift")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition shadow ${
            chartType === "day1_drift"
              ? "bg-cyan-700 text-white ring-2 ring-cyan-400/50"
              : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Navigation className="h-4 w-4 text-teal-400" />
          【局所漂流海図 W2704】小笠原南西海域 SOS救助パズル (Day 1)
        </button>
      </div>

      {chartType === "theater_wide" ? (
        /* 広域作戦海図 W1001 */
        <div className="grid flex-1 grid-cols-12 gap-5 overflow-hidden">
          {/* 左側：作戦マップ画面 */}
          <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-[#070d18] p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">
                  防衛省・海保庁 統合司令部作戦ディスプレイ（NORTH-WEST PACIFIC THEATER）
                </span>
                <span className="rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800 animate-pulse">
                  LIVE TRACKING
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                  時速: 約6.0km (3.3kt) | 深度: 800m以深 | 方位: 355°(北北西)
                </span>
                <button
                  onClick={() => setIsTheaterModalOpen(true)}
                  className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> 全画面拡大
                </button>
              </div>
            </div>

            {/* 高精細画像マップ */}
            <div
              onClick={() => setIsTheaterModalOpen(true)}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-black aspect-video flex items-center justify-center shadow-2xl"
            >
              <img
                src="/images/theater_map_wide.jpg"
                alt="小笠原〜富士山 縦断作戦海図"
                className="h-full w-full object-contain transition duration-300 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                <span className="text-xs font-semibold text-slate-200">
                  赤破線: 火山フロント（連動噴火線） | 橙色線: 接触体アルファ北上追跡ルート (Day 1〜7)
                </span>
                <span className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[11px] text-indigo-300 backdrop-blur">
                  <Maximize2 className="h-3 w-3" /> クリックで拡大表示
                </span>
              </div>
            </div>

            {/* 下部：地質・作戦メカニズムの解説 */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-rose-900/60 bg-rose-950/20 p-3">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  火山フロント連動の科学的立証
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  小笠原から富士山まで一直線に伸びる伊豆・小笠原・マリアナ島弧（IBM弧）。水深800m以深のプレート境界沿いを北上する巨大質量の通過が、直下のマグマ溜まりをドミノ倒しのように刺激し連動噴火を誘発している。
                </p>
              </div>

              <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  終着点：富士山直下の破局噴火阻止
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  駿河トラフ最深部は富士山直下の巨大マグマ溜まりへ直結。物体が到達すれば連動して富士山が大破局噴火を起こす。Day 7（駿河湾内）での阻止が人類の絶対タイムリミット。
                </p>
              </div>
            </div>
          </div>

          {/* 右側：Day 1〜7 トラッキング詳細パネル */}
          <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h4 className="font-bold text-xs text-white">7日間 縦断タイムライン詳細</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">全長約1,000 km</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {THEATER_TIMELINE_POINTS.map((pt) => {
                const isFocused = selectedDayFocus === pt.day;
                return (
                  <div
                    key={pt.day}
                    onClick={() => setSelectedDayFocus(pt.day)}
                    className={`cursor-pointer rounded-lg border p-2.5 text-xs transition ${
                      isFocused
                        ? "border-indigo-500 bg-indigo-950/50 shadow-md ring-1 ring-indigo-400/50"
                        : "border-slate-800 bg-slate-950/70 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            pt.day === 3
                              ? "bg-rose-600 text-white animate-pulse"
                              : isFocused
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          Day {pt.day}
                        </span>
                        <span className="font-bold text-white text-xs">{pt.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{pt.distance}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                      {pt.summary}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">
                      <span>深度: {pt.depth}</span>
                      <span className="font-mono text-cyan-400">{pt.coords}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Day 1 局所漂流海図 W2704 */
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 上部コントロールバー */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-700/30 text-cyan-400 border border-cyan-500/30">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    小笠原南西海域 航海用海図（CHART NO. W-2704）
                  </h2>
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-[11px] font-mono text-cyan-300 border border-cyan-800">
                    中心: SOS発信位置 / 縮尺 1:50,000 / 緯度1分(1&apos;) = 1海里 (NM)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewMode === "investigation"
                    ? "【プレイヤー提示用】SOS地点を中心とし、父島・南島および複数箇所の暗礁記号が配置された白地図。漂流先を自力で計算します。"
                    : "【対策本部解析図】海流（2.0kt 真東）× 風浪（1.5kt 北東）の合成ベクトルと東・南東暗礁群の回避ルート全表示。"}
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
                      ? "bg-cyan-700 text-white shadow ring-1 ring-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="プレイヤー提示用：SOS地点中心の白地図"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  白地図（プレイヤー提示用）
                </button>
                <button
                  onClick={setTacticalMode}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === "tactical"
                      ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="対策本部解析用：風・海流・暗礁・正解ベクトル全表示"
                >
                  <Eye className="h-3.5 w-3.5" />
                  対策本部解析図（GM・全情報）
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
                  <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="2.5" opacity="0.35" />
                </pattern>

                {/* 浅瀬グラデーション（南島・父島沿岸） */}
                <radialGradient id="shallow-grad-ogasawara" cx="890" cy="110" r="260" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fdfefe" stopOpacity="0.05" />
                </radialGradient>
              </defs>

              {/* 背景：海図用紙のオフホワイト地 */}
              <rect x="0" y="0" width="1000" height="700" fill="#fcfdfd" />

              {/* 浅瀬・陸地（右上：北東方向にある南島 ＆ 父島南西海岸） */}
              {showBathymetry && (
                <>
                  <circle cx="890" cy="110" r="260" fill="url(#shallow-grad-ogasawara)" />

                  {/* 父島（南西海岸・南崎・ハートロック方面） */}
                  <path
                    d="M 870 0 Q 860 60 890 100 T 960 120 L 1000 110 L 1000 0 Z"
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth="1.8"
                  />
                  <text x="910" y="45" fontSize="12" fontWeight="bold" fill="#1e293b" letterSpacing="2">
                    父 島
                  </text>
                  <text x="895" y="62" fontSize="9" fontWeight="semibold" fill="#475569" letterSpacing="1">
                    CHICHI-JIMA
                  </text>
                  <text x="890" y="76" fontSize="8" fill="#64748b">
                    (南崎・ジョンビーチ)
                  </text>

                  {/* 南島（父島の南西沖約1kmにある島） */}
                  {/* 南島海嶺・カルスト礁 */}
                  <path
                    d="M 790 140 C 805 125 825 130 835 150 C 840 170 820 185 800 180 C 785 175 780 155 790 140 Z"
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth="1.6"
                  />
                  {/* 南島周辺の小岩礁 */}
                  <circle cx="778" cy="165" r="3.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                  <circle cx="842" cy="140" r="2.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                  <ellipse cx="810" cy="158" rx="4" ry="2" fill="#bae6fd" /> {/* 扇池の入江 */}

                  <text x="805" y="198" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                    南 島
                  </text>
                  <text x="805" y="210" textAnchor="middle" fontSize="8" fill="#475569">
                    MINAMI-JIMA
                  </text>
                  <text x="850" y="145" fontSize="7.5" fill="#0284c7" fontStyle="italic">
                    南島瀬戸
                  </text>

                  {/* 等深線 (Bathymetric contours) */}
                  <path
                    d="M 680 0 C 700 130 750 240 850 300 C 920 340 960 360 1000 375"
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                  <text x="760" y="225" fontSize="9" fill="#0284c7" transform="rotate(35 760 225)">
                    -200m
                  </text>

                  <path
                    d="M 480 0 C 510 180 600 350 750 490 C 850 570 920 620 1000 655"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="1"
                  />
                  <text x="590" y="315" fontSize="9" fill="#3b82f6" transform="rotate(38 590 315)">
                    -500m
                  </text>

                  <path
                    d="M 300 0 C 330 220 420 460 600 620 L 680 700"
                    fill="none"
                    stroke="#bfdbfe"
                    strokeWidth="0.8"
                  />
                  <text x="400" y="420" fontSize="9" fill="#60a5fa" transform="rotate(45 400 420)">
                    -1000m
                  </text>

                  {/* 散布水深値 (Soundings in metres) */}
                  <g fontSize="9" fill="#64748b" fontFamily="monospace">
                    <text x="870" y="145">52</text>
                    <text x="825" y="115">84</text>
                    <text x="750" y="130">125</text>
                    <text x="840" y="240">210</text>
                    <text x="720" y="270">340</text>
                    <text x="630" y="200">290</text>
                    <text x="760" y="410">450</text>
                    <text x="610" y="430">620</text>
                    <text x="440" y="240">540</text>
                    <text x="360" y="270">980</text>
                    <text x="410" y="520">1150</text>
                    <text x="250" y="450">1780</text>
                    <text x="170" y="250">2150</text>
                    <text x="140" y="520">2380</text>
                    <text x="560" y="580">1420</text>
                  </g>
                </>
              )}

              {/* 緯度経度グリッド線 (1目盛り = 1海里 = 80px, 中心SOS: 500, 350) */}
              {showGrid && (
                <g stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2 3">
                  {/* 経度線 (垂直) */}
                  <line x1="100" y1="40" x2="100" y2="660" />
                  <line x1="180" y1="40" x2="180" y2="660" />
                  <line x1="260" y1="40" x2="260" y2="660" />
                  <line x1="340" y1="40" x2="340" y2="660" />
                  <line x1="420" y1="40" x2="420" y2="660" />
                  <line x1="500" y1="40" x2="500" y2="660" stroke="#94a3b8" strokeWidth="0.9" /> {/* 経度中心線 */}
                  <line x1="580" y1="40" x2="580" y2="660" />
                  <line x1="660" y1="40" x2="660" y2="660" />
                  <line x1="740" y1="40" x2="740" y2="660" />
                  <line x1="820" y1="40" x2="820" y2="660" />
                  <line x1="900" y1="40" x2="900" y2="660" />

                  {/* 緯度線 (水平) */}
                  <line x1="60" y1="110" x2="960" y2="110" />
                  <line x1="60" y1="190" x2="960" y2="190" />
                  <line x1="60" y1="270" x2="960" y2="270" />
                  <line x1="60" y1="350" x2="960" y2="350" stroke="#94a3b8" strokeWidth="0.9" /> {/* 緯度中心線 */}
                  <line x1="60" y1="430" x2="960" y2="430" />
                  <line x1="60" y1="510" x2="960" y2="510" />
                  <line x1="60" y1="590" x2="960" y2="590" />
                </g>
              )}

              {/* 外枠（ボーダー）：航海用海図の本格的マージンと目盛り */}
              <rect x="58" y="38" width="904" height="624" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              <rect x="62" y="42" width="896" height="616" fill="none" stroke="#0f172a" strokeWidth="0.8" />

              {/* 緯度・経度の目盛り数値 (中心 500,350 が 27°04'N, 142°06'E) */}
              <g fontSize="10" fontWeight="bold" fill="#0f172a" fontFamily="monospace">
                {/* 経度 (上・下) */}
                <text x="245" y="32">142°03&apos;E</text>
                <text x="485" y="32">142°06&apos;E</text>
                <text x="725" y="32">142°09&apos;E</text>

                <text x="245" y="676">142°03&apos;E</text>
                <text x="485" y="676">142°06&apos;E</text>
                <text x="725" y="676">142°09&apos;E</text>

                {/* 緯度 (左・右) */}
                <text x="8" y="194">27°06&apos;N</text>
                <text x="8" y="354">27°04&apos;N</text>
                <text x="8" y="514">27°02&apos;N</text>

                <text x="965" y="194">27°06&apos;N</text>
                <text x="965" y="354">27°04&apos;N</text>
                <text x="965" y="514">27°02&apos;N</text>
              </g>

              {/* 方位盤（コンパスローズ：Compass Rose）- 左上に配置 */}
              <g transform="translate(180, 160)">
                {/* 外円（度数目盛り） */}
                <circle cx="0" cy="0" r="80" fill="none" stroke="#64748b" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="73" fill="none" stroke="#94a3b8" strokeWidth="0.6" />

                {/* 10度刻みの細線 */}
                {Array.from({ length: 36 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-80"
                    x2="0"
                    y2={i % 9 === 0 ? "-65" : i % 3 === 0 ? "-70" : "-73"}
                    stroke="#475569"
                    strokeWidth={i % 9 === 0 ? "1.5" : "0.7"}
                    transform={`rotate(${i * 10} 0 0)`}
                  />
                ))}

                {/* 16方位テキスト */}
                <text x="0" y="-84" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">N (0°)</text>
                <text x="88" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">E (90°)</text>
                <text x="0" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">S (180°)</text>
                <text x="-88" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">W (270°)</text>
                <text x="60" y="-58" textAnchor="middle" fontSize="8.5" fill="#475569">NE (45°)</text>
                <text x="60" y="64" textAnchor="middle" fontSize="8.5" fill="#475569">SE (135°)</text>
                <text x="-60" y="64" textAnchor="middle" fontSize="8.5" fill="#475569">SW (225°)</text>
                <text x="-60" y="-58" textAnchor="middle" fontSize="8.5" fill="#475569">NW (315°)</text>

                {/* 磁北偏差の破線矢印 (Var 7°05' W) */}
                <line
                  x1="0"
                  y1="45"
                  x2="0"
                  y2="-70"
                  stroke="#dc2626"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  transform="rotate(-7.1 0 0)"
                />
                <text
                  x="-12"
                  y="-58"
                  fontSize="7.5"
                  fontWeight="bold"
                  fill="#dc2626"
                  transform="rotate(-7.1 0 0)"
                >
                  磁北 7°W
                </text>

                {/* 中心スター */}
                <path
                  d="M 0 -20 L 4 -5 L 18 0 L 4 5 L 0 20 L -4 5 L -18 0 L -4 -5 Z"
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
                  SCALE 1:50,000 (緯度1分 = 1海里 = 80px)
                </text>
              </g>

              {/* 海図公式タイトル枠（カルトゥーシュ：右下） */}
              <g transform="translate(680, 490)">
                <rect
                  x="0"
                  y="0"
                  width="250"
                  height="145"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  rx="3"
                />
                <rect x="3" y="3" width="244" height="139" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
                <text x="125" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" letterSpacing="1">
                  日本 小笠原諸島
                </text>
                <text x="125" y="38" textAnchor="middle" fontSize="14" fontWeight="extrabold" fill="#0f172a">
                  父島南西海域
                </text>
                <text x="125" y="52" textAnchor="middle" fontSize="9" fill="#475569" letterSpacing="1">
                  SOUTH-WEST OF CHICHI-JIMA
                </text>
                <line x1="20" y1="58" x2="230" y2="58" stroke="#cbd5e1" strokeWidth="1" />
                <text x="125" y="72" textAnchor="middle" fontSize="9" fill="#334155">
                  縮尺 1:50,000 / 水深：メートル (m)
                </text>
                <text x="125" y="85" textAnchor="middle" fontSize="8" fill="#64748b">
                  世界測地系 (WGS-84) 準拠
                </text>
                <text x="125" y="98" textAnchor="middle" fontSize="8" fill="#64748b">
                  海上保安庁 海洋情報部 基準図
                </text>
                <text x="125" y="112" textAnchor="middle" fontSize="8" fill="#475569" fontStyle="italic">
                  注: 現場海流・風浪は急変する場合あり
                </text>
                <text x="125" y="130" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1">
                  CHART NO. W-2704
                </text>
              </g>

              {/* ======================================================== */}
              {/* 海図本来の暗礁記号（東側 ＆ 南東側 の2箇所に設定） */}
              {/* ======================================================== */}

              {/* ① 東側の暗礁群（発信地点から真東へ約3海里: 740, 350） */}
              <g>
                {/* 対策本部モード時のみ危険ハッチングと警告ラベルを表示 */}
                {viewMode === "tactical" && showReefDanger && (
                  <ellipse
                    cx="740"
                    cy="350"
                    rx="55"
                    ry="40"
                    fill="url(#reef-pattern)"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                  />
                )}

                {/* 海図記号としての暗礁・洗岩（＋記号・点線） */}
                <ellipse
                  cx="740"
                  cy="350"
                  rx="42"
                  ry="28"
                  fill="none"
                  stroke={viewMode === "tactical" ? "#ef4444" : "#94a3b8"}
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <g stroke={viewMode === "tactical" ? "#b91c1c" : "#475569"} strokeWidth="1.5">
                  <line x1="720" y1="340" x2="730" y2="340" /><line x1="725" y1="335" x2="725" y2="345" />
                  <line x1="750" y1="345" x2="760" y2="345" /><line x1="755" y1="340" x2="755" y2="350" />
                  <line x1="730" y1="360" x2="740" y2="360" /><line x1="735" y1="355" x2="735" y2="365" />
                  <line x1="745" y1="365" x2="755" y2="365" /><line x1="750" y1="360" x2="750" y2="370" />
                </g>
                <text x="740" y="330" textAnchor="middle" fontSize="8" fill={viewMode === "tactical" ? "#dc2626" : "#64748b"}>
                  + + 東暗礁群 + +
                </text>
                <text x="740" y="388" textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">
                  (最浅水深 3.2m)
                </text>

                {viewMode === "tactical" && showReefDanger && (
                  <g>
                    <rect x="685" y="400" width="110" height="20" fill="#fef2f2" stroke="#dc2626" rx="3" />
                    <text x="740" y="414" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b91c1c">
                      ⚠️ 東側 座礁危険礁
                    </text>
                  </g>
                )}
              </g>

              {/* ② 南東側の暗礁群（発信地点から南東へ約2.5海里: 660, 480） - 新規追加！ */}
              <g>
                {/* 対策本部モード時のみ危険ハッチングと警告ラベルを表示 */}
                {viewMode === "tactical" && showReefDanger && (
                  <ellipse
                    cx="660"
                    cy="480"
                    rx="50"
                    ry="35"
                    fill="url(#reef-pattern)"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                  />
                )}

                {/* 海図記号としての暗礁・洗岩（＋記号・点線） */}
                <ellipse
                  cx="660"
                  cy="480"
                  rx="38"
                  ry="25"
                  fill="none"
                  stroke={viewMode === "tactical" ? "#ef4444" : "#94a3b8"}
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <g stroke={viewMode === "tactical" ? "#b91c1c" : "#475569"} strokeWidth="1.5">
                  <line x1="645" y1="470" x2="655" y2="470" /><line x1="650" y1="465" x2="650" y2="475" />
                  <line x1="670" y1="475" x2="680" y2="475" /><line x1="675" y1="470" x2="675" y2="480" />
                  <line x1="655" y1="490" x2="665" y2="490" /><line x1="660" y1="485" x2="660" y2="495" />
                </g>
                <text x="660" y="460" textAnchor="middle" fontSize="8" fill={viewMode === "tactical" ? "#dc2626" : "#64748b"}>
                  + + 南東浅礁群 + +
                </text>
                <text x="660" y="515" textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">
                  (最浅水深 4.8m)
                </text>

                {viewMode === "tactical" && showReefDanger && (
                  <g>
                    <rect x="605" y="525" width="110" height="20" fill="#fef2f2" stroke="#dc2626" rx="3" />
                    <text x="660" y="539" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b91c1c">
                      ⚠️ 南東 浅礁洗岩域
                    </text>
                  </g>
                )}
              </g>

              {/* ======================================================== */}
              {/* 遭難信号 発信地点（海図の中心: 500, 350） */}
              {/* ======================================================== */}
              <g transform="translate(500, 350)">
                <circle cx="0" cy="0" r="16" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.6" />
                <circle cx="0" cy="0" r="28" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
                {/* ×印 */}
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="-8" y1="8" x2="8" y2="-8" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />

                {/* 座標プレート（左上に配置し、東・北東の作図空間を邪魔しない） */}
                <rect x="-165" y="-55" width="155" height="48" fill="#ffffff" stroke="#dc2626" strokeWidth="1.5" rx="3" />
                <text x="-87" y="-40" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">
                  SOS発信位置 (09:00)
                </text>
                <text x="-87" y="-26" textAnchor="middle" fontSize="9" fontWeight="medium" fill="#0f172a">
                  27°04.0&apos;N, 142°06.0&apos;E
                </text>
                <text x="-87" y="-13" textAnchor="middle" fontSize="8" fill="#64748b">
                  民間船(40t) 全電源喪失・AIS停波
                </text>
              </g>

              {/* ======================================================== */}
              {/* 作戦解析レイヤー（対策本部モード時のみ表示） */}
              {/* ======================================================== */}
              {viewMode === "tactical" && (
                <g>
                  {/* 海流ベクトル（中心 500,350 から真東 2.0NM = 160px => 660, 350） */}
                  {showCurrentVector && (
                    <g>
                      <line
                        x1="500"
                        y1="350"
                        x2="660"
                        y2="350"
                        stroke="#0284c7"
                        strokeWidth="3.5"
                        markerEnd="url(#arrow-current)"
                      />
                      <rect x="535" y="358" width="125" height="18" fill="#f0f9ff" stroke="#38bdf8" rx="2" />
                      <text x="597" y="371" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0369a1">
                        黒潮支流 2.0kt (真東2.0NM)
                      </text>

                      {/* 海流のみの到達点 */}
                      <circle cx="660" cy="350" r="5" fill="#0284c7" />
                      <text x="660" y="395" textAnchor="middle" fontSize="8" fill="#0284c7" fontWeight="bold">
                        (海流のみ進んだ場合)
                      </text>
                    </g>
                  )}

                  {/* 風圧流ベクトル（中心 500,350 から北東へ 1.5NM = dx:+85, dy:-85 => 585, 265） */}
                  {showWindVector && (
                    <g>
                      <line
                        x1="500"
                        y1="350"
                        x2="585"
                        y2="265"
                        stroke="#0d9488"
                        strokeWidth="3.5"
                        strokeDasharray="6 3"
                        markerEnd="url(#arrow-wind)"
                      />
                      <rect x="500" y="265" width="125" height="18" fill="#f0fdfa" stroke="#2dd4bf" rx="2" />
                      <text x="562" y="278" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f766e">
                        風圧流 約1.5kt (北東1.5NM)
                      </text>

                      {/* 風のみの到達点 */}
                      <circle cx="585" cy="265" r="5" fill="#0d9488" />
                      <text x="585" y="250" textAnchor="middle" fontSize="8" fill="#0d9488" fontWeight="bold">
                        (風のみ進んだ場合)
                      </text>
                    </g>
                  )}

                  {/* ベクトル合成の補助線（平行四辺形の点線） */}
                  {showResultVector && (
                    <g>
                      {/* 海流矢印先 (660,350) から風ベクトル (dx:+85, dy:-85) => 合成点 (745, 265) へ */}
                      <line
                        x1="660"
                        y1="350"
                        x2="745"
                        y2="265"
                        stroke="#0d9488"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      {/* 風矢印先 (585,265) から海流ベクトル (dx:+160, dy:0) => 合成点 (745, 265) へ */}
                      <line
                        x1="585"
                        y1="265"
                        x2="745"
                        y2="265"
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />

                      {/* 合成移動ベクトル（中心 500,350 から目標点 745,265 への太い赤矢印） */}
                      <line
                        x1="500"
                        y1="350"
                        x2="745"
                        y2="265"
                        stroke="#dc2626"
                        strokeWidth="4"
                        markerEnd="url(#arrow-result)"
                      />
                      <rect x="610" y="295" width="130" height="20" fill="#fef2f2" stroke="#f87171" rx="3" />
                      <text x="675" y="309" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#b91c1c">
                        合成漂流ベクトル (東北東)
                      </text>

                      {/* 1時間後の到達予測・救助海域 (745, 265) */}
                      <g transform="translate(745, 265)">
                        <circle cx="0" cy="0" r="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="3" />
                        <circle cx="0" cy="0" r="28" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2" />
                        <rect x="-85" y="-45" width="170" height="32" fill="#ffffff" stroke="#22c55e" strokeWidth="2" rx="3" />
                        <text x="0" y="-31" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill="#15803d">
                          ⭐ 到達予測・救助目標海域
                        </text>
                        <text x="0" y="-17" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#16a34a">
                          (発信地点から東北東へ約2.5海里)
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* 右側：パズル解説 ＆ レイヤー操作 ＆ 情報対照表 */}
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* レイヤー表示切り替えパネル */}
          {viewMode === "tactical" ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
                <Compass className="h-4 w-4 text-cyan-400" />
                対策本部 解析レイヤー切り替え
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
                    <span className="font-medium text-slate-200">東側・南東側 暗礁座礁危険域 (PC3)</span>
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
                    <span className="font-medium text-slate-200">合成予測線 ＆ 救助目標海域</span>
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
          ) : (
            <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-4 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-2">
                <Info className="h-4 w-4" />
                プレイヤー提示用 白地図について
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                この白地図は<strong>SOS発信位置を中心</strong>とし、北東方向に<strong>南島および父島南西海岸</strong>が描かれています。また海図上には<strong>東側と南東側に暗礁記号</strong>が記されています。
              </p>
              <div className="mt-3 rounded border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] text-slate-400 space-y-1.5">
                <p>・<strong>中心</strong>: SOS発信位置（27°04&apos;N, 142°06&apos;E）</p>
                <p>・<strong>北東方向</strong>: 南島 ＆ 父島南西海岸</p>
                <p>・<strong>暗礁記号</strong>: 東側および南東側に洗岩・浅礁記号（＋）</p>
                <p>・<strong>縮尺</strong>: 緯度1分（1&apos;）＝ 1海里（NM）＝ 80px</p>
                <p>・<strong>コンパスローズ</strong>: 左上に配置（真北0°/東90°/南西225°）</p>
              </div>
            </div>
          )}

          {/* 6人の情報トランプ対照表（パズルの解法ロジック） */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
              <Compass className="h-4 w-4" />
              Day 1 漂流予測の計算ロジック
            </h3>

            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-teal-300">① 風の影響 (PC1)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  南西の強風15m/s。船体は【北東へ約1.5ノット】押し流される（1時間で北東へ1.5海里）。風だけ追うと北東の南島手前へ向かってしまう。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-sky-300">② 海流の影響 (PC4 ＆ PC5)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  黒潮支流の表層流は【真東へ2.0ノット】。水温データから冷水塊との潮目に乗っており減衰なし（1時間で真東へ2.0海里）。海流だけ追うと真東へ向かってしまう。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-indigo-300">③ 船の姿勢 (PC6 無線ログ)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  『真横から波を受けている』＝風に煽られながら横から海流をまともに受けており、風と海流の双方が合わさって漂流している動かぬ証拠。
                </p>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="font-bold text-red-300">④ 暗礁の罠 (PC3 海難救助)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  真東3海里に「東暗礁群」、南東2.5海里に「南東浅礁群」。海流単体や風の弱まりで東〜南東に流されると、荒波の三角波で座礁沈没する致命的危険がある。
                </p>
              </div>

              <div className="rounded border border-emerald-900/60 bg-emerald-950/30 p-2.5">
                <span className="font-bold text-emerald-300">🎯 結論：東と南東の暗礁を抜けた東北東海域へ急行</span>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  北東1.5海里（風）＋ 真東2.0海里（海流）のベクトル合成＝【東北東へ約2.5海里】！東と南東の暗礁を北側にすり抜けた海域で先回り捕捉し、救出成功となる。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* 広域作戦海図 全画面モーダル */}
      {isTheaterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsTheaterModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    防衛省・海上保安庁 合同作戦海図 W1001（小笠原〜富士山 火山フロント縦断監視図）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    OPERATION &quot;DEEP CALL&quot; STRATEGIC THEATER MAP | 縮尺 1:1,000,000 | 座標系: WGS84
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTheaterModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
              <img
                src="/images/theater_map_wide.jpg"
                alt="小笠原〜富士山 縦断作戦海図"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="text-slate-300">
                ※ 赤色破線：火山フロント（海底カルデラ連動噴火線） | 橙色実線：深海接触体（時速6km北上）
              </span>
              <span className="font-mono text-indigo-400">
                DAY 1 (父島 0km) ➔ DAY 3 (鳥島 420km) ➔ DAY 7 (富士山 1,000km)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
