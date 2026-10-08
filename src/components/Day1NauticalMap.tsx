"use client";

import React, { useRef } from "react";

interface Day1NauticalMapProps {
  mode?: "player" | "gm";
  className?: string;
  showWindVector?: boolean;
  showCurrentVector?: boolean;
  showReefDanger?: boolean;
  showResultVector?: boolean;
  showGrid?: boolean;
  showBathymetry?: boolean;
}

export const Day1NauticalMap: React.FC<Day1NauticalMapProps> = ({
  mode = "player",
  className = "w-full h-full",
  showWindVector = true,
  showCurrentVector = true,
  showReefDanger = true,
  showResultVector = true,
  showGrid = true,
  showBathymetry = true,
}) => {
  const isGm = mode === "gm";

  return (
    <svg
      viewBox="0 0 1000 700"
      className={`select-none rounded shadow-2xl ${className}`}
      style={{ backgroundColor: "#fcfdfd" }}
    >
      <defs>
        {/* 矢印マーカー */}
        <marker
          id="d1-arrow-current"
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
          id="d1-arrow-wind"
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
          id="d1-arrow-result"
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
          id="d1-reef-pattern"
          width="12"
          height="12"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="2.5" opacity="0.35" />
        </pattern>

        {/* 浅瀬グラデーション（南島・父島沿岸） */}
        <radialGradient id="d1-shallow-grad-ogasawara" cx="890" cy="110" r="260" gradientUnits="userSpaceOnUse">
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
          <circle cx="890" cy="110" r="260" fill="url(#d1-shallow-grad-ogasawara)" />

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

          {/* 南島（父島の南西沖約1kmにあるカルスト礁島） */}
          <path
            d="M 790 140 C 805 125 825 130 835 150 C 840 170 820 185 800 180 C 785 175 780 155 790 140 Z"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="1.6"
          />
          {/* 南島周辺の小岩礁 */}
          <circle cx="778" cy="165" r="3.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
          <circle cx="842" cy="140" r="2.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
          <ellipse cx="810" cy="158" rx="4" ry="2" fill="#bae6fd" />

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
          <line x1="500" y1="40" x2="500" y2="660" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="580" y1="40" x2="580" y2="660" />
          <line x1="660" y1="40" x2="660" y2="660" />
          <line x1="740" y1="40" x2="740" y2="660" />
          <line x1="820" y1="40" x2="820" y2="660" />
          <line x1="900" y1="40" x2="900" y2="660" />

          {/* 緯度線 (水平) */}
          <line x1="60" y1="110" x2="960" y2="110" />
          <line x1="60" y1="190" x2="960" y2="190" />
          <line x1="60" y1="270" x2="960" y2="270" />
          <line x1="60" y1="350" x2="960" y2="350" stroke="#94a3b8" strokeWidth="0.9" />
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
        <circle cx="0" cy="0" r="80" fill="none" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="73" fill="none" stroke="#94a3b8" strokeWidth="0.6" />

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

        <text x="0" y="-84" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">N (0°)</text>
        <text x="88" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">E (90°)</text>
        <text x="0" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">S (180°)</text>
        <text x="-88" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">W (270°)</text>
        <text x="60" y="-58" textAnchor="middle" fontSize="8.5" fill="#475569">NE (45°)</text>
        <text x="60" y="64" textAnchor="middle" fontSize="8.5" fill="#475569">SE (135°)</text>
        <text x="-60" y="64" textAnchor="middle" fontSize="8.5" fill="#475569">SW (225°)</text>
        <text x="-60" y="-58" textAnchor="middle" fontSize="8.5" fill="#475569">NW (315°)</text>

        {/* 磁北偏差の破線矢印 */}
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
        <text x="125" y="112" textAnchor="middle" fontSize="8" fill={isGm ? "#dc2626" : "#475569"} fontStyle="italic">
          {isGm ? "【対策本部解析図：全ベクトル・危険域表示】" : "【プレイヤー提示用：白地図】"}
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
        {isGm && showReefDanger && (
          <ellipse
            cx="740"
            cy="350"
            rx="55"
            ry="40"
            fill="url(#d1-reef-pattern)"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeDasharray="5 3"
          />
        )}

        <ellipse
          cx="740"
          cy="350"
          rx="42"
          ry="28"
          fill="none"
          stroke={isGm ? "#ef4444" : "#94a3b8"}
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <g stroke={isGm ? "#b91c1c" : "#475569"} strokeWidth="1.5">
          <line x1="720" y1="340" x2="730" y2="340" /><line x1="725" y1="335" x2="725" y2="345" />
          <line x1="750" y1="345" x2="760" y2="345" /><line x1="755" y1="340" x2="755" y2="350" />
          <line x1="730" y1="360" x2="740" y2="360" /><line x1="735" y1="355" x2="735" y2="365" />
          <line x1="745" y1="365" x2="755" y2="365" /><line x1="750" y1="360" x2="750" y2="370" />
        </g>
        <text x="740" y="330" textAnchor="middle" fontSize="8" fill={isGm ? "#dc2626" : "#64748b"}>
          + + 東暗礁群 + +
        </text>
        <text x="740" y="388" textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">
          (最浅水深 3.2m)
        </text>

        {isGm && showReefDanger && (
          <g>
            <rect x="685" y="400" width="110" height="20" fill="#fef2f2" stroke="#dc2626" rx="3" />
            <text x="740" y="414" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b91c1c">
              ⚠️ 東側 座礁危険礁
            </text>
          </g>
        )}
      </g>

      {/* ② 南東側の暗礁群（発信地点から南東へ約2.5海里: 660, 480） */}
      <g>
        {isGm && showReefDanger && (
          <ellipse
            cx="660"
            cy="480"
            rx="50"
            ry="35"
            fill="url(#d1-reef-pattern)"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeDasharray="5 3"
          />
        )}

        <ellipse
          cx="660"
          cy="480"
          rx="38"
          ry="25"
          fill="none"
          stroke={isGm ? "#ef4444" : "#94a3b8"}
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <g stroke={isGm ? "#b91c1c" : "#475569"} strokeWidth="1.5">
          <line x1="645" y1="470" x2="655" y2="470" /><line x1="650" y1="465" x2="650" y2="475" />
          <line x1="670" y1="475" x2="680" y2="475" /><line x1="675" y1="470" x2="675" y2="480" />
          <line x1="655" y1="490" x2="665" y2="490" /><line x1="660" y1="485" x2="660" y2="495" />
        </g>
        <text x="660" y="460" textAnchor="middle" fontSize="8" fill={isGm ? "#dc2626" : "#64748b"}>
          + + 南東浅礁群 + +
        </text>
        <text x="660" y="515" textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">
          (最浅水深 4.8m)
        </text>

        {isGm && showReefDanger && (
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
      {/* 作戦解析レイヤー（GM・対策本部モード時のみ表示） */}
      {/* ======================================================== */}
      {isGm && (
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
                markerEnd="url(#d1-arrow-current)"
              />
              <rect x="535" y="358" width="125" height="18" fill="#f0f9ff" stroke="#38bdf8" rx="2" />
              <text x="597" y="371" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0369a1">
                黒潮支流 2.0kt (真東2.0NM)
              </text>
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
                markerEnd="url(#d1-arrow-wind)"
              />
              <rect x="500" y="265" width="125" height="18" fill="#f0fdfa" stroke="#2dd4bf" rx="2" />
              <text x="562" y="278" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f766e">
                風圧流 約1.5kt (北東1.5NM)
              </text>
              <circle cx="585" cy="265" r="5" fill="#0d9488" />
              <text x="585" y="250" textAnchor="middle" fontSize="8" fill="#0d9488" fontWeight="bold">
                (風のみ進んだ場合)
              </text>
            </g>
          )}

          {/* ベクトル合成の補助線（平行四辺形の点線） ＆ 合成ベクトル */}
          {showResultVector && (
            <g>
              <line
                x1="660"
                y1="350"
                x2="745"
                y2="265"
                stroke="#0d9488"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
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
                markerEnd="url(#d1-arrow-result)"
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
  );
};
