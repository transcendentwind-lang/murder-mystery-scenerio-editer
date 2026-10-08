"use client";

import React from "react";

interface EruptionMonitoringChartProps {
  className?: string;
  day?: number; // 3: Day 3時点 (西之島・鳥島沖のみ) | 4: Day 4時点 (須美寿〜青ヶ島沖噴火 ＆ 青ヶ島・八丈島地震)
}

export const EruptionMonitoringChart: React.FC<EruptionMonitoringChartProps> = ({
  className = "w-full h-full",
  day = 4,
}) => {
  const isDay4OrLater = day >= 4;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      className={className}
      style={{
        background: "#081325",
        fontFamily: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
      }}
    >
      <defs>
        {/* 深海グラデーション */}
        <radialGradient id="trench-glow" cx="75%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#020b18" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#081325" stopOpacity="0" />
        </radialGradient>
        {/* 噴火パルスマーカー */}
        <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* 地震波紋用グラデーション */}
        <radialGradient id="seismic-wave" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        {/* 矢印マーカー */}
        <marker
          id="arrow-vector"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
      </defs>

      {/* 背景海域 */}
      <rect width="1200" height="800" fill="#081325" />
      {/* 伊豆・小笠原海溝帯 */}
      <rect x="780.0" y="55" width="385.0" height="700" fill="url(#trench-glow)" opacity="0.7" />

      {/* 緯度経度グリッド線 */}
      <line x1="234.2" y1="55" x2="234.2" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="234.2" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">138°E</text>
      <text x="234.2" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">138°E</text>

      <line x1="403.5" y1="55" x2="403.5" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="403.5" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">139°E</text>
      <text x="403.5" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">139°E</text>

      <line x1="572.7" y1="55" x2="572.7" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="572.7" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">140°E</text>
      <text x="572.7" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">140°E</text>

      <line x1="741.9" y1="55" x2="741.9" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="741.9" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">141°E</text>
      <text x="741.9" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">141°E</text>

      <line x1="911.2" y1="55" x2="911.2" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="911.2" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">142°E</text>
      <text x="911.2" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">142°E</text>

      <line x1="1080.4" y1="55" x2="1080.4" y2="755" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="1080.4" y="45" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">143°E</text>
      <text x="1080.4" y="775" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">143°E</text>

      <line x1="65" y1="724.2" x2="1165" y2="724.2" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="728.2" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">26°N</text>

      <line x1="65" y1="662.2" x2="1165" y2="662.2" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="666.2" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">27°N</text>

      <line x1="65" y1="599.7" x2="1165" y2="599.7" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="603.7" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">28°N</text>

      <line x1="65" y1="536.6" x2="1165" y2="536.6" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="540.6" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">29°N</text>

      <line x1="65" y1="472.8" x2="1165" y2="472.8" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="476.8" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">30°N</text>

      <line x1="65" y1="408.4" x2="1165" y2="408.4" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="412.4" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">31°N</text>

      <line x1="65" y1="343.4" x2="1165" y2="343.4" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="347.4" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">32°N</text>

      <line x1="65" y1="277.6" x2="1165" y2="277.6" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="281.6" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">33°N</text>

      <line x1="65" y1="211.1" x2="1165" y2="211.1" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="215.1" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">34°N</text>

      <line x1="65" y1="143.8" x2="1165" y2="143.8" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="147.8" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">35°N</text>

      <line x1="65" y1="75.6" x2="1165" y2="75.6" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
      <text x="55" y="79.6" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">36°N</text>

      {/* 本州陸地 */}
      <polygon
        points="65.0,157.3 107.3,167.4 166.5,166.1 234.2,168.1 271.5,170.8 288.4,157.3 310.4,145.1 342.5,135.6 384.8,141.7 364.5,160.7 376.4,170.8 395.0,166.1 420.4,145.8 415.3,137.0 430.5,126.8 462.7,123.4 496.5,123.4 508.4,134.9 528.7,126.1 513.5,113.2 533.8,99.6 564.2,99.6 559.2,118.0 540.5,122.7 549.0,143.8 552.4,150.5 625.2,133.6 640.4,123.4 718.2,96.1 674.2,75.6 674.2,55.0 65.0,55.0"
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="1.8"
        opacity="0.95"
      />
      <text x="215" y="100" fill="#94a3b8" fontSize="13" fontWeight="bold" letterSpacing="2">
        本州（中部・関東）
      </text>
      <text x="135" y="160.7" fill="#64748b" fontSize="10">遠州灘</text>
      <text x="318.8" y="153.9" fill="#0284c7" fontSize="11" fontWeight="bold">駿河湾</text>
      <text x="454.2" y="133.6" fill="#0284c7" fontSize="11" fontWeight="bold">相模湾</text>
      <text x="538.8" y="113.2" fill="#0284c7" fontSize="10">東京湾</text>
      <text x="386.5" y="165.9" fill="#cbd5e1" fontSize="11" fontWeight="bold">伊豆半島</text>
      <text x="589.6" y="126.8" fill="#cbd5e1" fontSize="11">房総半島</text>

      {/* 富士山 */}
      <g transform="translate(357.8, 119.3)">
        <path d="M -10 10 L 0 -10 L 10 10 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
        <path d="M -4 -2 L 0 -10 L 4 -2 L 2 -1 L 0 -3 L -2 -1 Z" fill="#38bdf8" />
        <text x="14" y="-2" fill="#f8fafc" fontSize="12" fontWeight="bold">富士山</text>
        <text x="14" y="9" fill="#94a3b8" fontSize="9" fontFamily="monospace">(3,776m)</text>
      </g>

      {/* 東京 */}
      <g transform="translate(533.8, 97.5)">
        <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        <text x="8" y="-4" fill="#38bdf8" fontSize="11" fontWeight="bold">東京</text>
      </g>

      {/* 火山フロント（破線：伊豆・小笠原火山弧／北端：伊豆半島） */}
      <polyline
        points="719.9,647.3 630.2,486.3 623.5,442.0 581.2,379.9 555.0,345.0 533.8,313.2 537.2,270.3 493.2,205.7 469.5,162.0 422.0,150.0"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeDasharray="5,4"
        opacity="0.65"
      />
      <text
        x="635.0"
        y="295.0"
        fill="#f87171"
        fontSize="10"
        opacity="0.85"
        transform="rotate(80 635.0,295.0)"
      >
        --- 火山フロント (伊豆・小笠原火山弧：北端 伊豆半島) ---
      </text>

      {/* 伊豆諸島各島 */}
      {/* 伊豆大島 */}
      <ellipse cx="469.5" cy="162.0" rx="7" ry="9" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="481.5" y="165.0" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="start">伊豆大島</text>
      <text x="481.5" y="177.0" fill="#eab308" fontSize="9" textAnchor="start">未噴火（警戒海域）</text>

      {/* 利島 */}
      <ellipse cx="450.8" cy="176.2" rx="3" ry="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="442.8" y="179.2" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="end">利島</text>

      {/* 新島 */}
      <ellipse cx="447.5" cy="186.3" rx="4" ry="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="438.5" y="189.3" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="end">新島</text>

      {/* 神津島 */}
      <ellipse cx="427.2" cy="197.0" rx="4" ry="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="418.2" y="200.0" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="end">神津島</text>

      {/* 三宅島 */}
      <ellipse cx="493.2" cy="205.7" rx="6" ry="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="504.2" y="208.7" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="start">三宅島</text>
      <text x="504.2" y="220.7" fill="#eab308" fontSize="9" textAnchor="start">未噴火（警戒海域）</text>

      {/* 御蔵島 */}
      <ellipse cx="505.0" cy="219.8" rx="4" ry="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="514.0" y="222.8" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">御蔵島</text>

      {/* 八丈島 (Day 4: 火山性微動・軽度地震観測) */}
      <g>
        {isDay4OrLater && (
          <g transform="translate(537.2, 270.3)">
            {/* 地震波紋エフェクト */}
            <circle r="26" fill="url(#seismic-wave)" />
            <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
            <circle r="10" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.9" />
          </g>
        )}
        <ellipse cx="537.2" cy="270.3" rx="8" ry="10" fill="#1e293b" stroke={isDay4OrLater ? "#f59e0b" : "#64748b"} strokeWidth={isDay4OrLater ? 2 : 1.2} />
        <text x="550.2" y="268.3" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="start">八丈島</text>
        {isDay4OrLater ? (
          <g>
            <rect x="548" y="274" width="135" height="16" rx="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
            <text x="552" y="286" fill="#fbbf24" fontSize="9" fontWeight="bold">
              ⚡ 火山性微動（震度1〜2）観測
            </text>
          </g>
        ) : (
          <text x="550.2" y="285.3" fill="#eab308" fontSize="9" textAnchor="start">未噴火（警戒海域）</text>
        )}
      </g>

      {/* 八丈小島 */}
      <ellipse cx="520.2" cy="269.0" rx="3" ry="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="512.2" y="272.0" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="end">八丈小島</text>

      {/* 青ヶ島 (Day 4: 火山性微動・軽度地震観測) */}
      <g>
        {isDay4OrLater && (
          <g transform="translate(533.8, 313.2)">
            {/* 地震波紋エフェクト */}
            <circle r="24" fill="url(#seismic-wave)" />
            <circle r="16" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
            <circle r="8" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.9" />
          </g>
        )}
        <ellipse cx="533.8" cy="313.2" rx="4" ry="4" fill="#1e293b" stroke={isDay4OrLater ? "#f59e0b" : "#64748b"} strokeWidth={isDay4OrLater ? 2 : 1.2} />
        <text x="544.8" y="312.2" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="start">青ヶ島</text>
        {isDay4OrLater ? (
          <g>
            <rect x="543" y="318" width="135" height="16" rx="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
            <text x="547" y="330" fill="#fbbf24" fontSize="9" fontWeight="bold">
              ⚡ 火山性群発微小地震 観測
            </text>
          </g>
        ) : (
          <text x="542.8" y="328.2" fill="#eab308" fontSize="9" textAnchor="start">未噴火（警戒海域）</text>
        )}
      </g>

      {/* ベヨネース列岩 */}
      <ellipse cx="559.2" cy="351.2" rx="2" ry="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="566.2" y="354.2" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">ベヨネース列岩</text>

      {/* 須美寿島 */}
      <ellipse cx="581.2" cy="379.9" rx="3" ry="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="589.2" y="382.9" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">須美寿島</text>
      <text x="589.2" y="394.9" fill="#94a3b8" fontSize="9" textAnchor="start">スミス島</text>

      {/* ======================================================== */}
      {/* 🌟 Day 4 新規追加：須美寿島〜青ヶ島沖 海底噴火 (Day 3マーク) */}
      {/* ======================================================== */}
      {isDay4OrLater && (
        <g transform="translate(555.0, 345.0)">
          {/* 噴火パルスエフェクト */}
          <circle r="22" fill="#ef4444" opacity="0.35" filter="url(#glow-red)" />
          <circle r="12" fill="#dc2626" opacity="0.65" />
          {/* カルデラ中心点 */}
          <polygon
            points="0,-12 4,-4 11,-4 6,2 8,9 0,5 -8,9 -6,2 -11,-4 -4,-4"
            fill="#fbbf24"
            stroke="#b45309"
            strokeWidth="1"
          />
          <circle r="3" fill="#ffffff" />

          {/* 地名ラベル（噴火点直下） */}
          <text x="0" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
            須美寿島〜青ヶ島沖
          </text>
          <text x="0" y="35" fill="#cbd5e1" fontSize="8" fontFamily="monospace" textAnchor="middle">
            31°40&apos;N, 139°50&apos;E
          </text>

          {/* 引き出し線（西側・左側の広大な外洋へ伸ばし、他の島名と絶対被らない） */}
          <line x1="-12" y1="-4" x2="-45" y2="-12" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* 噴火記録バッジ（西側海域に配置・須美寿島や青ヶ島と完全分離） */}
          <g transform="translate(-255, -30)">
            <rect
              width="205"
              height="38"
              rx="4"
              fill="#991b1b"
              stroke="#fca5a5"
              strokeWidth="1.5"
              filter="url(#glow-red)"
            />
            <text x="102" y="16" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
              🔴 Day 3 須美寿〜青ヶ島沖海底噴火
            </text>
            <text x="102" y="29" fill="#fecaca" fontSize="9" fontFamily="monospace" textAnchor="middle">
              海底カルデラ連動噴火（Day 4朝 観測）
            </text>
          </g>
        </g>
      )}

      {/* 鳥島 (Day 2 噴火) */}
      <g transform="translate(623.5, 442.0)">
        <circle r="22" fill="#ef4444" opacity="0.3" filter="url(#glow-red)" />
        <circle r="12" fill="#dc2626" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="4.5" ry="5.5" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
        <polygon
          points="0,-12 4,-4 11,-4 6,2 8,9 0,5 -8,9 -6,2 -11,-4 -4,-4"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="1"
        />
        <circle r="3" fill="#ffffff" />
        <text x="-12" y="3" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="end">
          鳥島
        </text>
        <text x="-12" y="16" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
          30°29&apos;N, 140°18&apos;E
        </text>
        <line x1="8" y1="0" x2="26" y2="0" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
        <g transform="translate(26, -18)">
          <rect
            width="165"
            height="36"
            rx="4"
            fill="#991b1b"
            stroke="#fca5a5"
            strokeWidth="1.5"
            filter="url(#glow-red)"
          />
          <text x="82" y="15" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
            🔴 Day 2 鳥島沖海底噴火
          </text>
          <text x="82" y="28" fill="#fecaca" fontSize="9" fontFamily="monospace" textAnchor="middle">
            海底カルデラ連動大爆発
          </text>
        </g>
      </g>

      {/* 孀婦岩 */}
      <ellipse cx="630.2" cy="486.3" rx="2" ry="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="637.2" y="489.3" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">孀婦岩</text>

      {/* 西之島 (Day 1 噴火) */}
      <g transform="translate(719.9, 647.3)">
        <circle r="22" fill="#ef4444" opacity="0.3" filter="url(#glow-red)" />
        <circle r="12" fill="#dc2626" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="5" ry="6" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
        <polygon
          points="0,-12 4,-4 11,-4 6,2 8,9 0,5 -8,9 -6,2 -11,-4 -4,-4"
          fill="#fbbf24"
          stroke="#b45309"
          strokeWidth="1"
        />
        <circle r="3" fill="#ffffff" />
        <text x="14" y="4" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="start">
          西之島
        </text>
        <text x="14" y="18" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="start">
          27°15&apos;N, 140°53&apos;E
        </text>
        <line x1="-8" y1="-2" x2="-26" y2="-10" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
        <g transform="translate(-205, -28)">
          <rect
            width="175"
            height="36"
            rx="4"
            fill="#991b1b"
            stroke="#fca5a5"
            strokeWidth="1.5"
            filter="url(#glow-red)"
          />
          <text x="87" y="15" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
            🔴 Day 1 突発的大規模噴火
          </text>
          <text x="87" y="28" fill="#fecaca" fontSize="9" fontFamily="monospace" textAnchor="middle">
            火山灰・噴煙・周辺航行警報
          </text>
        </g>
      </g>

      {/* 聟島列島 */}
      <ellipse cx="933.2" cy="618.5" rx="4" ry="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="942.2" y="621.5" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">聟島列島</text>

      {/* 父島 */}
      <ellipse cx="943.3" cy="656.6" rx="7" ry="9" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="943.3" cy="656.6" r="2.5" fill="#38bdf8" />
      <text x="956.3" y="660.6" fill="#e2e8f0" fontSize="11" fontWeight="bold">父島</text>
      <text x="956.3" y="672.6" fill="#0284c7" fontSize="9">小笠原救難隊 本拠地（現地組帰還）</text>

      {/* 母島 */}
      <ellipse cx="936.5" cy="684.0" rx="6" ry="8" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="936.5" cy="684.0" r="2.5" fill="#38bdf8" />
      <text x="948.5" y="688.0" fill="#e2e8f0" fontSize="11" fontWeight="bold">母島</text>

      {/* 北硫黄島 */}
      <ellipse cx="789.3" cy="758.7" rx="4" ry="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="798.3" y="761.7" fill="#94a3b8" fontSize="10" fontWeight="normal" textAnchor="start">北硫黄島</text>

      {/* 海図外枠目盛りバー */}
      <rect x="65" y="55" width="1100" height="700" fill="none" stroke="#475569" strokeWidth="2" />

      {/* 上部公的ヘッダーバナー */}
      <rect x="0" y="0" width="1200" height="48" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <text x="24" y="22" fill="#ffffff" fontSize="13" fontWeight="bold">
        海上保安庁 海洋情報部 - 火山活動監視状況図（伊豆・小笠原海嶺）
      </text>
      <text x="24" y="38" fill="#94a3b8" fontSize="10" fontFamily="monospace">
        JAPAN COAST GUARD - VOLCANIC ACTIVITY MONITORING REPORT (CHART NO. V-2024 / WGS84)
      </text>

      <rect x="740" y="8" width="440" height="32" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <text x="960" y="28" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
        {isDay4OrLater
          ? "噴火記録：西之島(Day 1) ｜ 鳥島沖(Day 2) ｜ 須美寿〜青ヶ島沖(Day 3)"
          : "噴火観測記録：西之島(Day 1) ｜ 鳥島沖(Day 2)"}
      </text>

      {/* 左下：凡例パネル */}
      <g transform="translate(80, 600)">
        <rect width="280" height="140" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" opacity="0.95" />
        <text x="12" y="18" fill="#ffffff" fontSize="11" fontWeight="bold">【海図凡例 ＆ 観測要綱】</text>
        {/* 凡例1 */}
        <polygon points="18,34 21,30 26,30 23,35 25,40 18,37 12,40 14,35 10,30 15,30" fill="#ef4444" />
        <text x="32" y="36" fill="#fca5a5" fontSize="10" fontWeight="bold">
          噴火確認地点（Day 1 西之島 / Day 2 鳥島 / Day 3 須美寿〜青ヶ島沖）
        </text>
        {/* 凡例2 */}
        {isDay4OrLater && (
          <g>
            <circle cx="20" cy="54" r="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="32" y="58" fill="#fbbf24" fontSize="10" fontWeight="bold">
              ⚡ 火山性軽度地震・微動観測（青ヶ島・八丈島）
            </text>
          </g>
        )}
        {/* 凡例3 */}
        <line x1="12" y1="74" x2="28" y2="74" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
        <text x="34" y="78" fill="#94a3b8" fontSize="10">火山フロント (伊豆・小笠原火山弧：北端 伊豆半島)</text>
        {/* 凡例4 */}
        <circle cx="20" cy="94" r="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <text x="34" y="97" fill="#eab308" fontSize="10">未噴火（今後の北上警戒海域）</text>
        <text x="12" y="118" fill="#64748b" fontSize="8">※物体の時速約6km北上に伴い、マグマ溜まりが刺激され連動爆発</text>
      </g>

      {/* コンパスローズ (方位記号) */}
      <g transform="translate(1100, 120)">
        <circle r="32" fill="#0f172a" stroke="#334155" strokeWidth="1" opacity="0.9" />
        <polygon points="0,-28 5,-8 0,0 -5,-8" fill="#ef4444" />
        <polygon points="0,28 5,8 0,0 -5,8" fill="#64748b" />
        <polygon points="28,0 8,5 0,0 8,-5" fill="#64748b" />
        <polygon points="-28,0 -8,5 0,0 -8,-5" fill="#64748b" />
        <text x="0" y="-32" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">N</text>
        <text x="34" y="4" fill="#94a3b8" fontSize="9" textAnchor="start">E</text>
        <text x="0" y="40" fill="#94a3b8" fontSize="9" textAnchor="middle">S</text>
        <text x="-36" y="4" fill="#94a3b8" fontSize="9" textAnchor="end">W</text>
      </g>
    </svg>
  );
};
