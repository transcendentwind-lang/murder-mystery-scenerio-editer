import { scenarioAssetUrl } from "@/scenarios/catalog";

/**
 * 『マッコウクジラ音響言語解析システム』プレイヤー提示用シート（A4縦・表裏2ページ）印刷／PDF出力
 * ・1ページ目（表面）：メインタイトル、大型QRコード、アクセスパスワード（whale-study）
 * ・2ページ目（裏面）：操作案内3項目 ＋ 実画面と完全一致する4つの画面サンプル
 *   ① 時間変化・音響波形ログ
 *   ② 【クジラの行動観測モニター】
 *   ③ 🔊 海中にクリック音を流す（発信）ボタン（＋1つ戻す・クリア）
 *   ④ クリック音ボタンのサンプル（音 #01：『ゴゴゴゴ…』海の下の火山 ／ 音 #03：『カ・カ・カカッ！』【未解明：？？？】）
 * ※GitHubのURLは一切記載しない
 */
export function printWhaleSonarGuideA4(
  mode: "both" | "front" | "back" = "both"
): void {
  const showFront = mode === "both" || mode === "front";
  const showBack = mode === "both" || mode === "back";

  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>マッコウクジラ音響言語解析システム - プレイヤー提示資料</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
    }
    .a4-page {
      width: 100%;
      max-width: 184mm;
      margin: 0 auto;
      background: #ffffff;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .page-break {
      page-break-after: always !important;
      break-after: page !important;
    }
    .outer-frame-front {
      width: 100%;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 5mm 6mm;
      display: flex;
      flex-direction: column;
      gap: 4mm;
      background: #ffffff;
    }
    .outer-frame-back {
      width: 100%;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 4mm 5.5mm;
      display: flex;
      flex-direction: column;
      gap: 2.4mm;
      background: #ffffff;
    }
    .header-banner {
      background: #f0f9ff;
      color: #0f172a;
      border-radius: 7px;
      padding: 3mm 5mm;
      text-align: center;
      border: 1.5px solid #0284c7;
      border-bottom: 3px solid #0284c7;
    }
    .header-sub {
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #0369a1;
      margin-bottom: 0.8mm;
    }
    .header-title {
      font-size: 17pt;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 1mm 0;
    }
    .qr-card {
      border: 2.5px solid #0f172a;
      border-radius: 10px;
      padding: 4mm 5.5mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .qr-card img {
      width: 60mm;
      height: 60mm;
      object-fit: contain;
      display: block;
    }
    .qr-caption {
      margin-top: 1.8mm;
      font-size: 9pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.04em;
    }
    .pw-box {
      border: 2px solid #0891b2;
      background: #ecfeff;
      border-radius: 9px;
      padding: 3.2mm 5mm;
      text-align: center;
    }
    .pw-label {
      font-size: 9pt;
      font-weight: 800;
      color: #0e7490;
      letter-spacing: 0.08em;
      margin-bottom: 1.2mm;
    }
    .pw-value {
      font-family: "Courier New", Consolas, monospace;
      font-size: 23pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #0f172a;
      background: #ffffff;
      border: 2px solid #06b6d4;
      border-radius: 6px;
      padding: 1.2mm 5.5mm;
      display: inline-block;
      line-height: 1.1;
    }
    .pw-note {
      margin-top: 1.2mm;
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
    }
    .steps-box {
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 3mm 4.5mm;
    }
    .steps-title {
      font-size: 9pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1.8mm;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 0.8mm;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 2.2mm;
      font-size: 9pt;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.38;
      margin-bottom: 1.4mm;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-badge {
      width: 5mm;
      height: 5mm;
      border-radius: 999px;
      background: #0f172a;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.2pt;
      font-weight: 700;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 1.2mm;
    }

    /* 裏面（2ページ目：操作ガイド＆画面サンプル・1ページ完全収容） */
    .guide-lead-box {
      border: 1.5px solid #0891b2;
      background: #f0fdff;
      border-radius: 7px;
      padding: 2.2mm 3.5mm;
    }
    .guide-lead-title {
      font-size: 9pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1mm;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .guide-bullet {
      display: flex;
      align-items: flex-start;
      gap: 1.8mm;
      font-size: 8.3pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.32;
      margin-bottom: 0.8mm;
    }
    .guide-bullet:last-child {
      margin-bottom: 0;
    }
    .guide-dot {
      color: #0891b2;
      font-weight: 900;
      flex-shrink: 0;
    }

    /* スマホ画面サンプル枠（トナー節約・コンパクト1ページ収容） */
    .mock-phone-frame {
      background: #f8fafc;
      color: #0f172a;
      border: 1.5px solid #475569;
      border-radius: 9px;
      padding: 2.2mm 3mm;
      display: flex;
      flex-direction: column;
      gap: 1.8mm;
    }
    .mock-phone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1mm;
    }
    .mock-phone-header-title {
      font-size: 8pt;
      font-weight: 900;
      color: #0369a1;
      letter-spacing: 0.03em;
    }
    .mock-phone-header-badge {
      font-size: 6.8pt;
      font-weight: 700;
      color: #334155;
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
    }
    .sample-block {
      position: relative;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #ffffff;
      padding: 1.6mm 2.4mm;
    }
    .callout-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1mm;
    }
    .callout-tag {
      display: inline-flex;
      align-items: center;
      gap: 1mm;
      background: #e0f2fe;
      border: 1px solid #0284c7;
      color: #0369a1;
      font-size: 7.4pt;
      font-weight: 900;
      padding: 0.2mm 1.8mm;
      border-radius: 999px;
    }
    .callout-desc {
      font-size: 7pt;
      font-weight: 700;
      color: #334155;
    }

    /* ① 波形ログサンプル */
    .waveform-box {
      border: 1px solid #0284c7;
      background: #f8fafc;
      border-radius: 5px;
      overflow: hidden;
    }
    .waveform-header {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 0.8mm 2mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.2pt;
      font-weight: 800;
      color: #0369a1;
    }
    .waveform-replay {
      font-size: 6.5pt;
      background: #ffffff;
      border: 1px solid #0284c7;
      color: #0369a1;
      border-radius: 3px;
      padding: 0.2mm 1.4mm;
      font-weight: 800;
    }

    /* ② クジラの行動観測モニターサンプル */
    .monitor-box {
      border: 1px solid #94a3b8;
      background: #f8fafc;
      border-radius: 5px;
      padding: 1.4mm 2.5mm;
      text-align: center;
    }
    .monitor-title {
      font-size: 7.8pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 0.4mm;
    }
    .monitor-sub {
      font-size: 7pt;
      font-weight: 600;
      color: #334155;
      line-height: 1.3;
    }

    /* ③ 海中にクリック音を流す（発信）サンプル */
    .seq-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.8mm;
    }
    .seq-bar-label {
      font-size: 7.4pt;
      font-weight: 900;
      color: #0369a1;
    }
    .seq-ctrl-btns {
      display: flex;
      gap: 1mm;
    }
    .seq-ctrl-btn {
      background: #f8fafc;
      border: 1px solid #64748b;
      color: #1e293b;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
      font-size: 6.8pt;
      font-weight: 800;
    }
    .seq-slot-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 1mm 1.8mm;
      display: flex;
      align-items: center;
      gap: 1.2mm;
      margin-bottom: 1mm;
    }
    .seq-chip {
      background: #eef2ff;
      border: 1px solid #4f46e5;
      color: #1e1b4b;
      border-radius: 3px;
      padding: 0.3mm 1.5mm;
      font-size: 7.2pt;
      font-weight: 800;
    }
    .transmit-btn {
      width: 100%;
      background: #e0f2fe;
      border: 1.5px solid #0284c7;
      color: #0f172a;
      border-radius: 5px;
      padding: 1.1mm 2.5mm;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 900;
      letter-spacing: 0.03em;
    }

    /* ④ クリック音ボタンサンプル（音 #01 ＆ 音 #03） */
    .sample-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2mm;
    }
    .sound-card {
      background: #f8fafc;
      border-radius: 6px;
      padding: 1.4mm 2mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sound-card-locked {
      border: 1.5px solid #d97706;
    }
    .sound-card-unsolved {
      border: 1.5px solid #64748b;
    }
    .sound-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sound-code {
      background: #ffffff;
      border: 1px solid #64748b;
      color: #0369a1;
      font-family: monospace;
      font-size: 7.2pt;
      font-weight: 900;
      padding: 0.2mm 1.4mm;
      border-radius: 3px;
    }
    .sound-preview-btn {
      background: #e0f2fe;
      border: 1px solid #0284c7;
      color: #0369a1;
      font-size: 6.8pt;
      font-weight: 800;
      padding: 0.2mm 1.4mm;
      border-radius: 3px;
    }
    .sound-onomatopoeia {
      margin-top: 0.8mm;
      font-size: 8.2pt;
      font-weight: 900;
      color: #92400e;
    }
    .sound-meaning-locked {
      margin-top: 0.6mm;
      display: inline-block;
      background: #fef3c7;
      border: 1px solid #d97706;
      color: #92400e;
      font-size: 7.5pt;
      font-weight: 900;
      padding: 0.3mm 1.5mm;
      border-radius: 3px;
    }
    .sound-meaning-unsolved {
      margin-top: 0.6mm;
      font-size: 7.5pt;
      font-weight: 800;
      color: #475569;
    }
    .sound-card-footer {
      margin-top: 1mm;
      padding-top: 0.8mm;
      border-top: 1px solid #cbd5e1;
    }
    .sound-locked-note {
      font-size: 6.8pt;
      font-weight: 800;
      color: #b45309;
    }
    .sound-assign-btn {
      width: 100%;
      background: #eef2ff;
      border: 1px solid #4f46e5;
      color: #312e81;
      border-radius: 3px;
      padding: 0.5mm 1.2mm;
      text-align: center;
      font-size: 7.2pt;
      font-weight: 900;
    }
  </style>
</head>
<body>
  ${
    showFront
      ? `<!-- =========================================================================
       1ページ目（表面）：QRコード ＆ アクセスパスワード提示シート（A4・1ページ完全収容）
       ========================================================================= -->
  <div class="a4-page ${showBack ? "page-break" : ""}">
    <div class="outer-frame-front">
      <div class="header-banner">
        <div class="header-sub">MARINE MAMMAL ACOUSTIC ANALYSIS TERMINAL</div>
        <h1 class="header-title">『マッコウクジラ音響言語解析システム』</h1>
      </div>

      <div class="qr-section">
        <div class="qr-card">
          <img src="${scenarioAssetUrl("releases/images/sonar_qr.png")}" alt="マッコウクジラ音響言語解析システム QRコード" />
          <div class="qr-caption">📱 スマートフォンのカメラで読み取ってください</div>
        </div>
      </div>

      <div class="pw-box">
        <div class="pw-label">🔑 アクセスパスワード（半角英数字・ハイフンあり）</div>
        <div>
          <span class="pw-value">whale-study</span>
        </div>
        <div class="pw-note">※上記のパスワードを入力して「ロック解除」を押すとシステムが起動します</div>
      </div>

      <div class="steps-box">
        <div class="steps-title">【システムへの接続手順と使い方】</div>
        <div class="step-item">
          <span class="step-badge">1</span>
          <span>スマートフォンのカメラで上のQRコードを読み取り、専用画面を開いてください。</span>
        </div>
        <div class="step-item">
          <span class="step-badge">2</span>
          <span>パスワード欄に <strong>whale-study</strong> と入力してロックを解除してください。</span>
        </div>
        <div class="step-item">
          <span class="step-badge">3</span>
          <span>詳しい画面の見方と操作方法は、<strong>裏面</strong>をご覧ください。</span>
        </div>
      </div>

      <div class="footer-bar">
        <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（表面）</span>
        <span>${mode === "both" ? "1 / 2" : "1 / 1"}</span>
      </div>
    </div>
  </div>`
      : ""
  }

  ${
    showBack
      ? `<!-- =========================================================================
       2ページ目（裏面）：画面サンプル ＆ 操作説明シート（A4・1ページ完全収容）
       ========================================================================= -->
  <div class="a4-page">
    <div class="outer-frame-back">
      <div class="header-banner" style="padding: 2mm 4mm;">
        <div class="header-sub" style="font-size: 7pt; margin-bottom: 0.4mm;">SYSTEM OPERATION GUIDE &amp; SCREEN SAMPLES</div>
        <h1 class="header-title" style="font-size: 13.5pt;">『マッコウクジラ音響言語解析システム』画面説明</h1>
      </div>

      <!-- プレイヤー向け操作説明（ご指定の3項目） -->
      <div class="guide-lead-box">
        <div class="guide-lead-title">💡 システムの操作方法</div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>クリック音ボタンを押して海中にクリック音を鳴らすと、それに対するクジラの行動が観察できます。</span>
        </div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>別の内容を流すときは、一度流したクリック音をクリアすることをお勧めします。</span>
        </div>
        <div class="guide-bullet">
          <span class="guide-dot">●</span>
          <span>言語について想定できたら、日本語を当てはめるボタンを押すことでクリック音を解析していくことができます。</span>
        </div>
      </div>

      <!-- スマートフォン画面サンプル（4つの主要パーツ） -->
      <div class="mock-phone-frame">
        <div class="mock-phone-header">
          <span class="mock-phone-header-title">📱 スマートフォン画面サンプル（主要4パート）</span>
          <span class="mock-phone-header-badge">実際の操作画面イメージ</span>
        </div>

        <!-- ① 時間変化・音響波形ログ -->
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">① 時間変化・音響波形ログ</span>
            <span class="callout-desc">鳴らしたクリック音の波形が時間変化で記録され、再生後も形が残ります</span>
          </div>
          <div class="waveform-box">
            <div class="waveform-header">
              <span>📈 時間変化・音響波形ログ（再生後も形が残ります）</span>
              <span class="waveform-replay">▶ もう一度再生</span>
            </div>
            <svg viewBox="0 0 600 64" width="100%" height="36" style="display:block; background:#ffffff;">
              <!-- グリッド線 -->
              <line x1="0" y1="16" x2="600" y2="16" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="34" x2="600" y2="34" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="0" y1="52" x2="600" y2="52" stroke="#e2e8f0" stroke-width="1" />
              <line x1="300" y1="0" x2="300" y2="64" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
              <!-- ラベル -->
              <text x="12" y="12" fill="#0369a1" font-size="9" font-family="monospace" font-weight="bold">1. 音 #01『ゴゴゴゴ…』(海の下の火山)</text>
              <text x="312" y="12" fill="#0369a1" font-size="9" font-family="monospace" font-weight="bold">2. 音 #03『カ・カ・カカッ！』</text>
              <!-- 波形1（低周波の連続振動：ゴゴゴゴ…） -->
              <path d="M 15 34 Q 25 16, 35 34 T 55 34 T 75 34 T 95 34 T 115 34 T 135 34 T 155 34 T 175 34 T 195 34 T 215 34 T 235 34 T 255 34 L 285 34" fill="none" stroke="#d97706" stroke-width="2" />
              <!-- 波形2（鋭いパルス：カ・カ・カカッ！） -->
              <path d="M 315 34 L 335 34 L 340 13 L 345 56 L 350 34 L 385 34 L 390 13 L 395 56 L 400 34 L 435 34 L 440 11 L 445 58 L 450 16 L 455 52 L 460 34 L 580 34" fill="none" stroke="#0284c7" stroke-width="2" />
            </svg>
          </div>
        </div>

        <!-- ② クジラの行動観測モニター -->
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">② クジラの行動観測モニター</span>
            <span class="callout-desc">海中にクリック音を流した結果、クジラがどう動いたかが文字で表示されます</span>
          </div>
          <div class="monitor-box">
            <div class="monitor-title">【クジラの行動観測モニター】</div>
            <div class="monitor-sub">
              クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、ここにクジラの行動が文字で表示されます。
            </div>
          </div>
        </div>

        <!-- ③ 海中にクリック音を流す（発信）のボタン ＆ クリアボタン -->
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">③ 発信ボタン ＆ クリア操作</span>
            <span class="callout-desc">選んだ音を海中に流します（別の内容を流す時は「クリア」を押します）</span>
          </div>
          <div class="seq-bar-header">
            <span class="seq-bar-label">発信するクリック音パターン（2語ごと判定）</span>
            <div class="seq-ctrl-btns">
              <span class="seq-ctrl-btn">⌫ 1つ戻す</span>
              <span class="seq-ctrl-btn" style="border-color:#d97706; background:#fef3c7; color:#92400e;">↺ クリア</span>
            </div>
          </div>
          <div class="seq-slot-box">
            <span class="seq-chip"><span style="color:#0369a1; font-family:monospace;">1.</span> 海の下の火山</span>
            <span style="color:#64748b; font-weight:bold; font-size:7.5pt;">＋</span>
            <span class="seq-chip"><span style="color:#0369a1; font-family:monospace;">2.</span> 音 #03（カ・カ・カカッ！）</span>
          </div>
          <div class="transmit-btn">
            🔊 海中にクリック音を流す（発信）
          </div>
        </div>

        <!-- ④ クリック音ボタンのサンプル（音 #01 と 音 #03） -->
        <div class="sample-block">
          <div class="callout-row">
            <span class="callout-tag">④ クリック音ボタンのサンプル</span>
            <span class="callout-desc">左：最初から意味が判明している音 ／ 右：未解明の音（日本語をあてはめ可能）</span>
          </div>
          <div class="sample-cards-grid">
            <!-- サンプル1：音 #01（ゴゴゴゴ… ＝ 海の下の火山） -->
            <div class="sound-card sound-card-locked">
              <div>
                <div class="sound-card-top">
                  <span class="sound-code">音 #01</span>
                  <span class="sound-preview-btn">🔊 試聴</span>
                </div>
                <div class="sound-onomatopoeia">『ゴゴゴゴ…』</div>
                <div>
                  <span class="sound-meaning-locked">🔒 海の下の火山</span>
                </div>
              </div>
              <div class="sound-card-footer">
                <div class="sound-locked-note">✔ 朝倉教授記録により確定</div>
              </div>
            </div>

            <!-- サンプル2：音 #03（カ・カ・カカッ！ ＝ 未解明） -->
            <div class="sound-card sound-card-unsolved">
              <div>
                <div class="sound-card-top">
                  <span class="sound-code">音 #03</span>
                  <span class="sound-preview-btn">🔊 試聴</span>
                </div>
                <div class="sound-onomatopoeia">『カ・カ・カカッ！』</div>
                <div class="sound-meaning-unsolved">【未解明：？？？】</div>
              </div>
              <div class="sound-card-footer">
                <div class="sound-assign-btn">🏷️ 日本語をあてはめる</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（裏面：画面サンプル＆操作案内）</span>
        <span>${mode === "both" ? "2 / 2" : "1 / 1"}</span>
      </div>
    </div>
  </div>`
      : ""
  }
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(fullHtml);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 450);
  }
}
