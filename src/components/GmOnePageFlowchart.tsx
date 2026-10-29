import React from "react";

interface GmOnePageFlowchartProps {
  projectTitle?: string;
  selectedDay?: number | null;
  onSelectDay?: (day: number) => void;
}

/**
 * A4用紙1枚（1ページ）にDay 1〜Day 7の全ての成功・失敗分岐がチャート図として収まるGM用進行資料コンポーネント
 */
export const GmOnePageFlowchart: React.FC<GmOnePageFlowchartProps> = ({
  projectTitle = "燃える海を渡る声",
  selectedDay = null,
  onSelectDay,
}) => {
  const getRowHighlight = (day: number) =>
    selectedDay === day ? "ring-2 ring-amber-400 shadow-md" : "";

  return (
    <div className="mx-auto w-full max-w-[794px] bg-white text-slate-900 font-sans p-4 sm:p-5 border border-slate-300 shadow-lg rounded-sm print:shadow-none print:border-0 print:p-0">
      {/* ==================== 最上部タイトル＆凡例ヘッダー ==================== */}
      <div className="border-b-2 border-slate-900 pb-2 mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-900 px-2 py-0.5 text-[9.5px] font-black tracking-wider text-amber-300 uppercase">
              GM FLOWCHART // A4・1枚完結
            </span>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
              『{projectTitle}』 Day 1〜Day 7 成功・失敗分岐フローチャート（GM進行資料）
            </h1>
          </div>
        </div>
        {/* チャート図凡例 */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-bold">
          <span className="inline-flex items-center gap-1 rounded border border-emerald-600 bg-emerald-50 px-1.5 py-0.5 text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            成功・通常ルート
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-amber-500 bg-amber-50 px-1.5 py-0.5 text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            再挑戦・反論誘導ルート
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-rose-600 bg-rose-50 px-1.5 py-0.5 text-rose-900">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            失敗・誤答ルート（ペナルティ／演出変化）
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-400 bg-slate-100 px-1.5 py-0.5 text-slate-800">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            失敗要素なし（共通進行）
          </span>
        </div>
      </div>

      {/* ==================== チャート図本体（Day 1 〜 Day 7 垂直連結） ==================== */}
      <div className="space-y-1">
        {/* ------------------------------------------------------------------
            【DAY 1】漂流予測・救助地点の指定
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(1)}
          className={`grid grid-cols-12 rounded-md border-2 border-indigo-900 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(1)}`}
        >
          {/* 左ピラー */}
          <div className="col-span-3 bg-indigo-950 text-white p-2 flex flex-col justify-between border-r border-indigo-900">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-950">
                  DAY 1
                </span>
                <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  🔀 分岐・ペナルティ有
                </span>
              </div>
              <div className="mt-1 text-[11px] font-black leading-tight">
                民間調査船の漂流予測
                <br />
                ＆ 救助地点の指定
              </div>
            </div>
            <div className="mt-1.5 rounded bg-white/10 p-1.5 text-[9.5px] leading-snug text-indigo-100 border border-white/15">
              <span className="font-bold text-amber-300">🎯 判定課題：</span>
              <br />
              発信20分経過＋到着40分＝1時間後の漂流地点（<strong className="text-white">東北東</strong>）を指定
            </div>
          </div>

          {/* 右チャート図 */}
          <div className="col-span-9 p-2 bg-slate-50/60 flex flex-col justify-center space-y-1.5 text-[10.5px]">
            {/* 1回目成功ルート */}
            <div className="flex items-center gap-1.5">
              <div className="w-28 shrink-0 rounded border border-indigo-300 bg-indigo-50 px-2 py-1 font-bold text-indigo-950 text-center text-[10px]">
                第1回 地点指定
              </div>
              <span className="font-mono font-black text-emerald-700 shrink-0">──▶</span>
              <div className="flex-1 rounded border-2 border-emerald-600 bg-emerald-50 px-2.5 py-1 flex items-center justify-between gap-2">
                <div>
                  <span className="font-black text-emerald-900">🟢【1回目で成功】</span>
                  <span className="ml-1.5 font-semibold text-slate-800">
                    2つのNPC証言（<code className="font-bold">EV-08 船長</code>・
                    <code className="font-bold">EV-07 冷凍箱</code>）を<strong>両方ともDay 1で獲得</strong>
                  </span>
                </div>
                <span className="font-mono text-[9.5px] font-bold text-emerald-800 shrink-0">
                  ──▶ Day 2へ
                </span>
              </div>
            </div>

            {/* 1回目失敗 ➔ 再挑戦（2回目判定）ツリー */}
            <div className="flex items-start gap-1.5 pl-3">
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <span className="font-mono font-black text-rose-700">└─▶</span>
                <div className="rounded border border-rose-500 bg-rose-50 px-2 py-1 font-bold text-rose-900 text-[9.5px] leading-tight text-center">
                  🔴 1回目失敗
                  <br />
                  <span className="text-[9px] text-rose-700">🔄 もう一度指定可</span>
                </div>
                <span className="font-mono font-black text-slate-600">──▶</span>
              </div>

              <div className="flex-1 space-y-1">
                {/* 2回目で成功 */}
                <div className="rounded border-2 border-amber-500 bg-amber-50 px-2.5 py-1 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-amber-900">🟡【2回目で成功】</span>
                    <span className="ml-1.5 text-slate-800">
                      NPC証言は<strong>1つだけ</strong>Day 1で獲得 ／{" "}
                      <strong className="text-rose-800 underline">
                        残り1つは翌日以降の証拠カードとして取得可能
                      </strong>
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] font-bold text-amber-900 shrink-0">
                    ──▶ Day 2へ
                  </span>
                </div>

                {/* 2回目も失敗 */}
                <div className="rounded border-2 border-rose-600 bg-rose-50 px-2.5 py-1 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-rose-900">🔴【2回目も失敗】</span>
                    <span className="ml-1.5 text-slate-800">
                      <strong>自動的に救助成功</strong>とする（Day 1獲得0個） ／{" "}
                      <strong className="text-rose-900 underline">
                        2つとも証言は翌日以降の証拠カードとして取得可能
                      </strong>
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] font-bold text-rose-900 shrink-0">
                    ──▶ Day 2へ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 2】西之島噴火・初期調査
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(2)}
          className={`grid grid-cols-12 rounded-md border border-slate-400 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(2)}`}
        >
          <div className="col-span-3 bg-slate-800 text-white p-2 flex items-center justify-between border-r border-slate-400">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-900">
                  DAY 2
                </span>
                <span className="rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-bold text-slate-100">
                  🔵 失敗要素なし
                </span>
              </div>
              <div className="mt-1 text-[11px] font-bold leading-tight">
                西之島噴火・初期調査
              </div>
            </div>
          </div>
          <div className="col-span-9 p-2 bg-slate-50/70 flex items-center justify-between gap-2 text-[10.5px]">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">
                🔵【共通進行】各PCが調査アクションを選択し、証拠カードを取得・共有
              </div>
              <div className="text-[10px] text-rose-900 font-semibold">
                📌 Day 1引き継ぎ反映：Day 1で未取得の証言カード（1枚または2枚）がある場合、このDay 2以降の証拠カード選択枠に追加して取得可能にする
              </div>
            </div>
            <span className="font-mono text-[9.5px] font-bold text-slate-700 shrink-0">
              ──▶ Day 3へ
            </span>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 3】ソノブイ投下・移動速度予測・法的根拠
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(3)}
          className={`grid grid-cols-12 rounded-md border border-slate-400 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(3)}`}
        >
          <div className="col-span-3 bg-slate-800 text-white p-2 flex flex-col justify-between border-r border-slate-400">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-900">
                  DAY 3
                </span>
                <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  🟢 物語影響なし
                </span>
              </div>
              <div className="mt-1 text-[11px] font-bold leading-tight">
                ソノブイ索敵・速度予測
                <br />
                ＆ 法的根拠の選択
              </div>
            </div>
          </div>
          <div className="col-span-9 p-2 bg-slate-50/70 grid grid-cols-2 gap-2 text-[10px]">
            {/* 前半：ソノブイ・速度予測 */}
            <div className="rounded border border-slate-300 bg-white p-1.5 flex flex-col justify-between">
              <div className="font-bold text-slate-900">
                ① ソノブイ投下（C-3・D-2・E-3）＆ 移動速度・到達予測
              </div>
              <div className="mt-1 flex items-center gap-1 text-[9.5px]">
                <span className="rounded bg-emerald-50 border border-emerald-400 px-1.5 py-0.5 font-bold text-emerald-900">
                  正解（6ノット・明神礁）
                </span>
                <span>／</span>
                <span className="rounded bg-amber-50 border border-amber-400 px-1.5 py-0.5 font-bold text-amber-900">
                  速度・到達地点ミス
                </span>
              </div>
              <div className="mt-1 text-[9.5px] text-slate-700 font-medium">
                ➔ <strong>ミスしても物語上大きな影響なし</strong>（翌朝の明神礁噴火で自然収束）
              </div>
            </div>

            {/* 後半：防衛出動 vs 海上警備行動 */}
            <div className="rounded border border-slate-300 bg-white p-1.5 flex flex-col justify-between">
              <div className="font-bold text-slate-900">
                ② 後半の選択：「防衛出動」 vs 「海上警備行動」
              </div>
              <div className="mt-1 flex items-center gap-1 text-[9.5px]">
                <span className="rounded bg-indigo-50 border border-indigo-300 px-1.5 py-0.5 font-bold text-indigo-900">
                  防衛出動を要請
                </span>
                <span>／</span>
                <span className="rounded bg-indigo-50 border border-indigo-300 px-1.5 py-0.5 font-bold text-indigo-900">
                  海上警備行動を継続
                </span>
              </div>
              <div className="mt-1 text-[9.5px] text-slate-700 font-medium">
                ➔ <strong>どちらを選んでも同じ結果</strong>（Day 4で「害獣駆除・災害派遣」に収束）
              </div>
            </div>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 4】明神礁噴火・古文書解読 ➔ 最終目的地の結論（富士山 vs 東京湾）
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(4)}
          className={`grid grid-cols-12 rounded-md border-2 border-indigo-900 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(4)}`}
        >
          <div className="col-span-3 bg-indigo-950 text-white p-2 flex flex-col justify-between border-r border-indigo-900">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-950">
                  DAY 4
                </span>
                <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  🔀 演出分岐あり
                </span>
              </div>
              <div className="mt-1 text-[11px] font-black leading-tight">
                明神礁噴火・古文書解読
                <br />
                ＆ 最終目的地の特定
              </div>
            </div>
            <div className="mt-1 rounded bg-white/10 p-1 text-[9.5px] text-indigo-100 border border-white/15">
              <span className="font-bold text-amber-300">🎯 判定課題：</span>
              個体（イワナガ）が目指す最終目的地は？
            </div>
          </div>

          <div className="col-span-9 p-2 bg-slate-50/60 flex flex-col justify-center space-y-1.5 text-[10.5px]">
            {/* 正解：富士山 */}
            <div className="rounded border-2 border-emerald-600 bg-emerald-50 px-2.5 py-1 flex items-center justify-between gap-2">
              <div>
                <span className="font-black text-emerald-900">🟢【正解：「富士山（駿河湾奥）」と結論】</span>
                <span className="ml-1.5 font-medium text-slate-800">
                  自衛隊が早期に駿河湾沖へ展開（通常位置で迎撃へ）
                </span>
              </div>
              <span className="font-mono text-[9.5px] font-bold text-emerald-900 shrink-0">
                ──▶ Day 5（通常）へ
              </span>
            </div>

            {/* 誤答：東京湾 */}
            <div className="rounded border-2 border-rose-600 bg-rose-50 px-2.5 py-1 flex items-center justify-between gap-2">
              <div>
                <span className="font-black text-rose-900">🔴【誤答：「東京湾」と結論】</span>
                <span className="ml-1.5 text-slate-800">
                  ペナルティなし ／ ⚠️{" "}
                  <strong className="text-rose-900 underline">
                    ① Day 5で自衛隊の攻撃が遅れ、より駿河湾に近い位置で攻撃
                  </strong>{" "}
                  ＋{" "}
                  <strong className="text-rose-900 underline">
                    ② Day 6の岸部局長との交渉で嫌味を言われる
                  </strong>
                </span>
              </div>
              <span className="font-mono text-[9.5px] font-bold text-rose-900 shrink-0">
                ──▶ Day 5（遅延）へ
              </span>
            </div>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 5】自衛隊攻撃・富士山噴火タイムリミット算出
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(5)}
          className={`grid grid-cols-12 rounded-md border border-slate-400 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(5)}`}
        >
          <div className="col-span-3 bg-slate-800 text-white p-2 flex items-center justify-between border-r border-slate-400">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-900">
                  DAY 5
                </span>
                <span className="rounded bg-slate-600 px-1.5 py-0.5 text-[9px] font-bold text-slate-100">
                  🔵 失敗要素なし
                </span>
              </div>
              <div className="mt-1 text-[11px] font-bold leading-tight">
                自衛隊の攻撃強行 ＆
                <br />
                噴火タイムリミット算出
              </div>
            </div>
          </div>
          <div className="col-span-9 p-2 bg-slate-50/70 flex items-center justify-between gap-2 text-[10.5px]">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">
                🔵【共通進行】攻撃により個体が12ノットへ倍速化 ➔ 富士山噴火まで【残り約30〜31時間】を算出
              </div>
              <div className="text-[10px] text-rose-900 font-semibold">
                📌 Day 4「東京湾」結論時の変化：自衛隊の展開が遅れたため、<strong>「より駿河湾に近い位置」で攻撃が行われた描写</strong>になる（以降の進行・数値は共通）
              </div>
            </div>
            <span className="font-mono text-[9.5px] font-bold text-slate-700 shrink-0">
              ──▶ Day 6へ
            </span>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 6】クジラの祝詞解読 ＆ 岸部局長との緊急交渉（反論誘導）
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(6)}
          className={`grid grid-cols-12 rounded-md border-2 border-indigo-900 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(6)}`}
        >
          <div className="col-span-3 bg-indigo-950 text-white p-2 flex flex-col justify-between border-r border-indigo-900">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-950">
                  DAY 6
                </span>
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                  🔀 反論誘導あり
                </span>
              </div>
              <div className="mt-1 text-[11px] font-black leading-tight">
                クジラの祝詞の解読 ＆
                <br />
                岸部局長との緊急交渉
              </div>
            </div>
            <div className="mt-1 space-y-1">
              <div className="rounded bg-indigo-900/90 p-1 text-[8.5px] leading-snug text-indigo-100 border border-indigo-400/40">
                ⏱️ 解読目安15分（『<strong>狂気の深淵を覗く</strong>』使用時は共有・構文作成のため<strong>＋5分延長</strong>）
              </div>
              <div className="rounded bg-rose-950/90 p-1 text-[8.5px] leading-snug text-rose-200 border border-rose-500/40">
                ※Day 4が「東京湾」だった場合、冒頭で岸部から<strong>嫌味</strong>が入る
              </div>
            </div>
          </div>

          <div className="col-span-9 p-2 bg-slate-50/60 flex flex-col justify-center space-y-1.5 text-[10.5px]">
            {/* 1発説得成功 */}
            <div className="rounded border-2 border-emerald-600 bg-emerald-50 px-2.5 py-1 flex items-center justify-between gap-2">
              <div>
                <span className="font-black text-emerald-900">
                  🟢【祝詞 ＋ ①音響層（水深1,000m SOFAR層） ＋ ②移動時間（6〜8時間）をすべて提示】
                </span>
                <span className="ml-1.5 font-bold text-slate-800">➔ 一発で交渉成立！</span>
              </div>
              <span className="font-mono text-[9.5px] font-bold text-emerald-900 shrink-0">
                ──▶ Day 7へ
              </span>
            </div>

            {/* 反論による誘導ルート */}
            <div className="rounded border-2 border-amber-500 bg-amber-50/90 p-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950">
                  🟡【祝詞は説得できるが、「音響層」や「移動時間」が抜けていた場合】➔ 岸部局長が反論して考えさせる
                </span>
                <span className="font-mono text-[9.5px] font-bold text-amber-950 shrink-0">
                  解答導出 ──▶ Day 7へ
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                <div className="rounded border border-amber-400 bg-white px-2 py-1 leading-snug">
                  <strong className="text-purple-900">💬 反論①（音響層への反論）：</strong>
                  「海面からスピーカーを垂らせば済む、なぜ潜水艦が要る？」
                  <br />➔ PLに<strong>『水深1,000mのSOFAR層で発信する必要がある』</strong>と解答を導かせる
                </div>
                <div className="rounded border border-amber-400 bg-white px-2 py-1 leading-snug">
                  <strong className="text-purple-900">💬 反論②（移動時間への反論）：</strong>
                  「明朝、駿河湾の入り口で鳴らせば十分だろう？」
                  <br />➔ PLに<strong>『クジラが集まるのに6〜8時間かかる（今夜送信が必要）』</strong>と解答を導かせる
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 連結矢印 */}
        <div className="flex justify-center items-center py-0 text-[10px] font-black text-slate-500 leading-none">
          ▼
        </div>

        {/* ------------------------------------------------------------------
            【DAY 7】駿河湾最終決戦 ＆ 公式発表方針の選択
           ------------------------------------------------------------------ */}
        <div
          onClick={() => onSelectDay?.(7)}
          className={`grid grid-cols-12 rounded-md border border-slate-500 bg-white overflow-hidden transition ${
            onSelectDay ? "cursor-pointer" : ""
          } ${getRowHighlight(7)}`}
        >
          <div className="col-span-3 bg-slate-900 text-white p-2 flex items-center justify-between border-r border-slate-500">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-black text-slate-950">
                  DAY 7
                </span>
                <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  🟢 最終決断（2分岐）
                </span>
              </div>
              <div className="mt-1 text-[11px] font-bold leading-tight">
                駿河湾最終決戦 ＆
                <br />
                公式発表方針の選択
              </div>
            </div>
          </div>
          <div className="col-span-9 p-2 bg-slate-50/70 grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded border-2 border-indigo-600 bg-indigo-50/70 px-2.5 py-1 flex flex-col justify-center">
              <div className="font-black text-indigo-950">
                🟦【A案：自衛隊の戦果として発表（NG-09）】
              </div>
              <div className="text-[9.5px] text-slate-700">
                怪獣と共鳴の真実を秘匿し、社会の混乱防止と組織の秩序を守る結末
              </div>
            </div>
            <div className="rounded border-2 border-amber-600 bg-amber-50/70 px-2.5 py-1 flex flex-col justify-center">
              <div className="font-black text-amber-950">
                🟧【B案：特命対策室の英雄的活躍として発表（NG-10）】
              </div>
              <div className="text-[9.5px] text-slate-700">
                クジラの祝詞による共鳴と真実を公表し、新たな時代の扉を開く結末
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
