import { MMProject, Character } from "@/types/schema";
import {
  TOKYO_ACTIONS,
  FIELD_ACTIONS,
  DAY3_TOKYO_ACTIONS,
  DAY3_FIELD_ACTIONS,
  DAY4_TOKYO_ACTIONS,
  DAY4_FIELD_ACTIONS,
  DAY5_TOKYO_ACTIONS,
  DAY5_FIELD_ACTIONS,
} from "@/components/GmDashboard";

/**
 * 企画概要・プロット紹介 Markdown 生成
 */
export function generateSynopsisMarkdown(project: MMProject): string {
  const chars = project?.characters || [];
  const timeline = project?.timeline || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let md = `# ${project?.title || "無題のシナリオ"}\n## ${project?.subtitle || ""}\n\n`;
  md += `- **想定プレイ時間**: 約${project?.durationHours ?? 3.5}時間\n`;
  md += `- **プレイヤー人数**: ${playerCount}名（GM必須）\n`;
  md += `- **ジャンル**: 協力型インシデント・ミステリー / パニックサスペンス\n\n`;

  md += `## 🌟 1. 作品コンセプト・世界観\n${project?.concept || ""}\n\n`;

  md += `## 🎭 2. プレイヤー体験 (Player Experience)\n${project?.targetExperience || ""}\n\n`;

  md += `## 📜 3. プロット紹介 (あらすじ・真相・解決法)\n${project?.plotSummary || ""}\n\n`;

  md += `## 💡 4. コアギミック (生態系捕食 × クジラ言語パズル × メッセージリレー)\n${project?.gimmickOverview || ""}\n\n`;

  md += `## 👥 5. 登場人物一覧（対策チーム ${playerCount}名: 海上保安庁東京本部2名 ＋ 小笠原現地${playerCount === 5 ? "3名" : "4名"}）\n`;
  chars.forEach((c) => {
    md += `### ${c.name} (${c.profession})\n`;
    md += `- **配置**: ${c.location === "headquarters" ? "海上保安庁東京本部" : "小笠原現場"}\n`;
    md += `- **公開プロフィール**: ${c.handout?.publicProfile || ""}\n`;
    md += `- **初期所持品**: ${(c.initialItems || []).join("、")}\n`;
    md += `- **固有能力**:\n`;
    (c.capabilities || []).forEach((cap) => {
      md += `  - [Day ${cap.targetPhase}] **${cap.name}**: ${cap.description}\n`;
    });
    md += `\n`;
  });

  md += `## 📅 6. 7日間のインシデント進行概要\n`;
  timeline.forEach((t) => {
    md += `### Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
    md += `- **事象**: ${t.incidentOverview}\n`;
    md += `- **海上保安庁東京本部**: ${t.hqResponse}\n`;
    md += `- **現地救難隊**: ${t.fieldResponse}\n\n`;
  });

  return md;
}

/**
 * 企画概要 プレーンテキスト生成 (.txt用)
 */
export function generateSynopsisPlainText(project: MMProject): string {
  const chars = project?.characters || [];
  const timeline = project?.timeline || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let text = `=================================================================\n`;
  text += `【シナリオ企画概要書】\n`;
  text += `タイトル: ${project?.title || "無題のシナリオ"}\n`;
  text += `サブタイトル: ${project?.subtitle || ""}\n`;
  text += `プレイ人数: ${playerCount}名（GM必須） ｜ 想定時間: 約${project?.durationHours ?? 3.5}時間\n`;
  text += `=================================================================\n\n`;

  text += `■ 1. 作品コンセプト・世界観\n`;
  text += `${project?.concept || ""}\n\n`;

  text += `■ 2. プレイヤー体験（Player Experience）\n`;
  text += `${project?.targetExperience || ""}\n\n`;

  text += `■ 3. プロット紹介（あらすじ・真相・解決法）\n`;
  text += `${project?.plotSummary || ""}\n\n`;

  text += `■ 4. コアギミック・独自性（生態系捕食 × クジラ言語パズル × メッセージリレー）\n`;
  text += `${project?.gimmickOverview || ""}\n\n`;

  text += `■ 5. 登場人物（海難救助対策チーム ${playerCount}名: 海上保安庁東京本部2名 ＋ 小笠原現地${playerCount === 5 ? "3名" : "4名"}）\n`;
  chars.forEach((c) => {
    text += `・${c.name} (${c.profession}) [${c.location === "headquarters" ? "海上保安庁東京本部" : "小笠原現場"}]\n`;
    text += `  概要: ${c.handout?.publicProfile || ""}\n`;
    text += `  初期所持品: ${(c.initialItems || []).join("、")}\n`;
    text += `  固有能力: ${(c.capabilities || []).map((cap) => `[Day ${cap.targetPhase}] ${cap.name}`).join("、")}\n\n`;
  });

  text += `■ 6. 7日間のインシデント進行フロー\n`;
  timeline.forEach((t) => {
    text += `・Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
    text += `  概要: ${t.incidentOverview}\n`;
  });
  text += `\n=================================================================\n`;

  return text;
}

/**
 * キャラクターハンドアウト本紙（6つの構成要素のみ）単体セクション生成ヘルパー
 */
export function formatCharacterHandoutMarkdown(c: Character): string {
  const memoryText = [c.introduction, c.handout?.backgroundTimeline]
    .filter(Boolean)
    .join("\n\n");

  let md = `### ${c.profession}　${c.name}\n`;
  md += `- **所属・氏名**: ${c.profession}　${c.name}\n`;
  md += `- **全員に公開できるプロフィール**: ${c.handout?.publicProfile || "なし"}\n\n`;

  md += `#### 【あなたの内面（公開されないもの）・行動指針】\n`;
  md += `- **誇り・信条・行動指針**: ${c.handout?.internalDrama?.pride || "なし"}\n`;
  md += `- **過去の喪失・悔恨**: ${c.handout?.internalDrama?.loss || "なし"}\n\n`;

  md += `#### 【あなたの記憶】\n${memoryText || "なし"}\n\n`;
  md += `#### 【自己紹介】\n${c.handout?.handoutBody || "なし"}\n\n`;

  md += `---\n\n`;
  return md;
}

/**
 * 別配付カード（初期所持品・携行アイテム ＆ 固有能力・専門スキル）単体セクション生成ヘルパー
 */
export function formatCharacterCardsMarkdown(c: Character): string {
  let md = `### 🃏 ${c.name}（${c.profession}）配布カード\n\n`;

  md += `#### 【初期所持品・携行アイテムカード】\n`;
  (c.initialItems || []).forEach((item, idx) => {
    md += `- **[所持品カード ${idx + 1}]** ${item}\n`;
  });
  md += `\n`;

  md += `#### 【固有能力・専門スキルカード】\n`;
  (c.capabilities || []).forEach((cap, idx) => {
    md += `- **[スキルカード ${idx + 1} / Day ${cap.targetPhase}] ${cap.name}**\n  ${cap.description}\n`;
  });
  md += `\n---\n\n`;
  return md;
}

/**
 * キャラクターハンドアウト一覧（本紙 ＋ 別配付カード）Markdown 生成
 */
export function generateHandoutsOnlyMarkdown(project: MMProject): string {
  const chars = project?.characters || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let md = `# ${project?.title || "無題のシナリオ"} ― 個人ハンドアウト全集\n`;
  md += `- **編成モード**: ${playerCount}名プレイ版（海上保安庁東京本部2名 ＋ 小笠原現地${playerCount === 5 ? "3名" : "4名"}）\n`;
  md += `- **構成**: 所属・氏名 ／ 全員に公開できるプロフィール ／ あなたの内面（公開されないもの）・行動指針 ／ あなたの記憶 ／ 自己紹介\n\n`;
  md += `---\n\n`;

  chars.forEach((c) => {
    md += formatCharacterHandoutMarkdown(c);
  });

  md += `# 🃏 別配付カード一覧（初期所持品・携行アイテム ／ 固有能力・専門スキル）\n\n`;
  md += `※以下の初期所持品および固有能力は、ハンドアウト本紙とは別のカードとして各プレイヤーに配布します。\n\n---\n\n`;
  chars.forEach((c) => {
    md += formatCharacterCardsMarkdown(c);
  });

  return md;
}

/**
 * 別配付カード（初期所持品・固有能力）のみ Markdown 生成
 */
export function generateCharacterCardsOnlyMarkdown(project: MMProject): string {
  const chars = project?.characters || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let md = `# ${project?.title || "無題のシナリオ"} ― 別配付カード全集（${playerCount}名編成）\n`;
  md += `- **内容**: 各プレイヤーにハンドアウト本紙とは別で配布する「初期所持品・携行アイテムカード」および「固有能力・専門スキルカード」\n\n`;
  md += `---\n\n`;

  chars.forEach((c) => {
    md += formatCharacterCardsMarkdown(c);
  });

  return md;
}

/**
 * 完全シナリオ台本 Markdown 生成 (.md用)
 * 全設定・全HO・全Day進行台本（プレイヤーができること・資料・結果・GMセリフ）・全エビデンス・暗号パズルを完全網羅
 */
export function generateFullScriptMarkdown(project: MMProject): string {
  const chars = project?.characters || [];
  const evidences = project?.evidences || [];
  const crypticWords = project?.crypticWords || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let md = `# ${project?.title || "無題のシナリオ"}\n## ${project?.subtitle || ""}\n\n`;
  md += `- **想定プレイ時間**: 約${project?.durationHours ?? 3.5}時間\n`;
  md += `- **プレイヤー人数**: ${playerCount}名（GM必須）\n`;
  md += `- **ジャンル**: 協力型インシデント・ミステリー / パニックサスペンス\n\n`;
  md += `---\n\n`;

  // --- 第1章：企画概要 ＆ プロット ---
  md += `## 🌟 第1章：作品コンセプト ＆ プロット概要\n\n`;
  md += `### 1-1. コンセプト\n${project?.concept || ""}\n\n`;
  md += `### 1-2. プレイヤー体験 (Player Experience)\n${project?.targetExperience || ""}\n\n`;
  md += `### 1-3. プロット紹介（真相・あらすじ・解決の全貌）\n${project?.plotSummary || ""}\n\n`;
  md += `### 1-4. コアギミック (生態系捕食 × クジラ言語パズル × メッセージリレー)\n${project?.gimmickOverview || ""}\n\n`;
  md += `---\n\n`;

  // --- 第2章：キャラクターハンドアウト（本紙・6項目） ---
  md += `## 👥 第2章：個人ハンドアウト本紙（全${playerCount}名: 海上保安庁東京本部2名 ＋ 小笠原現地${playerCount === 5 ? "3名" : "4名"}）\n\n`;
  chars.forEach((c) => {
    md += formatCharacterHandoutMarkdown(c);
  });

  // --- 第2章別冊：別配付カード（初期所持品・固有能力） ---
  md += `## 🃏 第2章別冊：別配付カード一覧（初期所持品・携行アイテム ＆ 固有能力・専門スキル）\n\n`;
  chars.forEach((c) => {
    md += formatCharacterCardsMarkdown(c);
  });

  // --- 第3章：7日間タイムライン完全進行台本 ---
  md += `## 📅 第3章：7日間インシデント進行 ＆ 完全GMシナリオ台本\n\n`;

  // Day 1
  md += `### 【Day 1】父島南西沖 (0 km) - 荒海からのメーデー・漂流予測と遭難船救助\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 民間チャーター船（40t）が全電源喪失。AIS停波、衛星死角。\n`;
  md += `- **海上保安庁東京本部の行動**: 朝潮（PC1）が遭難船スペック（40t船体は風速の5%で風下へ流される特性）を提示。貝浜（PC2）が衛星・AIS使用不能を報告し、海流と風圧流から現在地を割り出す「平行四辺形のベクトル合成法」を提示。\n`;
  if (playerCount === 5) {
    md += `- **現地救難隊の行動**: 太刀魚（PC4: 5名統合版）が海洋気象ブイ流速データ（真東へ2.0kt）と現場海域の強風（南西から約30kt）を提示してPC1と連動計算（30kt × 5% ＝ 北東へ1.5kt）。浪寄（PC5）が潮目水温データを提示して海流の持続を証明。坂凪（PC3）が暗礁海図と照合し、真東の暗礁群を避けて東北東の漂流予測海域へ救難艇で急行・接舷救助。\n`;
  } else {
    md += `- **現地救難隊の行動**: 太刀魚（PC4）が海洋気象ブイ流速データ（真東へ2.0kt）と現場強風（南西から約30kt）を提示してPC1と連動計算（30kt × 5% ＝ 北東へ1.5kt）。浪寄（PC5）が潮目水温データを提示して海流持続を証明。初瀬（PC6）が遭難直前無線ログを共有。坂凪（PC3）が暗礁海図と照合し、真東の暗礁群を避けて東北東の漂流予測海域へ救難艇で急行・接舷救助。\n`;
  }
  md += `- **開示される資料・証拠**: [ev-vessel-leeway-data] 遭難船スペック＆風圧流データ、[ev-satellite-blindspot] 気象・軌道衛星 状況報告書＆ベクトル合成法、[ev-reef-chart] 小笠原南西海域・暗礁海図、[ev-ocean-buoy-current] 海洋気象ブイ表層流速データ＆現場風向風速、[ev-temperature-front] 潮目水温解析図、[ev-radio-fragment] 遭難無線ログ、[ev-diver-box-photo] 冷凍ボックスの写真、[ev-captain-testimony] 船長証言記録。\n`;
  md += `- **調査結果と疑惑**: 船長『巨大生物を見た』vs 謎のダイバーグループ『魚の調査サンプルだ』と食い違い、ダイバーたちは海から引き揚げて箱に入れた約30kgほどのずっしり重いプラスチック冷凍ボックスを持ち去る。\n\n`;

  // Day 2
  md += `### 【Day 2】西之島沖 (約180 km) - 異変の顕在化・西之島噴火と深海シグネチャー\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 西之島周辺の海底火山が突発的大噴火。水深800m以深を日速約150km（時速約6km / 3.3ノット）で北上する超巨大影を捕捉。\n`;
  md += `- **海上保安庁東京本部のアクション（3択中1枠合議選択）**:\n`;
  (TOKYO_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **現地救難隊のアクション（4択中2枠合議選択）**:\n`;
  (FIELD_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **調査結果**: Day 1遭難船のスクリュー付着物からダイオウイカの触手筋肉組織を特定。しかし数百メートルの巨大影との間にサイズ矛盾が生じる。また巨大生物が海底付近で海底地震を起こすような特別な振動を発生させ、それが海底火山を刺激・噴火させている因果関係が判明。\n\n`;

  // Day 3
  md += `### 【Day 3】孀婦岩〜鳥島沖 (約400 km) - 洋上ソナー索敵作戦・Day 3合議制調査・写真分析と防衛合議\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 鳥島沖海底カルデラの連動大爆発。海自・海保ヘリによる洋上ソナー索敵作戦。\n`;
  md += `- **プレイヤーの作戦行動**:\n`;
  md += `  - ソノブイ投下（セクターA〜C、深度1〜3）により、セクターB-3で目標の生体反射音を捕捉。\n`;
  md += `  - ヘリによる航空写真撮影（または波形スキャン）を実行。\n`;
  md += `- **東京側アクション（3択中1枠合議選択 / 翌日以降繰り越し可能）**:\n`;
  (DAY3_TOKYO_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **小笠原現地アクション（4択中2枠合議選択 / 翌日以降繰り越し可能）**:\n`;
  (DAY3_FIELD_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **調査結果**: 海面直下の巨大な影は単一生物ではなく、無数の触手や個体が絡み合った【超巨大群体（コロニー）】である外形構造を把握。1ヶ月前の流星雨で朝潮危機管理官（PC1）が拾い東京へ持ち帰っていた小さな隕石片の分析や八丈島微動解析等に着手。\n`;
  md += `  - 海洋生物学者（PC5）に写真鑑定を相談し、防衛庁リエゾン（PC2）に防衛出動の要否を諮問。\n`;
  md += `  - 対策本部全員による合議を経て、海上保安庁東京本部の危機管理官（PC1）が防衛出動・迎撃方針を最終決定。\n\n`;

  // Day 4
  md += `### 【Day 4】明神礁 (約550 km) - 明神礁海底噴火・富士山到達危機と深層クロス調査（Day 3繰り越し蓄積対応）\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 明神礁の海底カルデラ噴火。八丈島で火山性群発微動が頻発。日速約150kmで北上する火山フロントが数日後に【富士山直下】に到達し、破局的大噴火を誘発する絶対的危機が発覚。\n`;
  md += `- **東京側アクション（新設2枠 ＋ Day 3未選択枠から1枠合議選択）**:\n`;
  (DAY4_TOKYO_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **小笠原現地アクション（新設2枠 ＋ Day 3未選択枠から2枠合議選択）**:\n`;
  (DAY4_FIELD_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **調査結果**: 巨大生物は「地磁気」と「隕石が放つ特殊な物質」の2つを感知して北上している可能性が浮上。さらに小笠原・八丈島・三宅島の神社に保管・奉納されていた複数の隕石が盗難にあっており、それらが『青ヶ島沖・八丈島付近・三宅島付近』の海に落とされていた上、小笠原の海から引き揚げられたクーラーボックスが謎のダイバーグループによって【静岡県・富士山麓の民家】宛てに運ばれ、さらに車で山麓へ運ばれていたことが判明！ 朝倉教授の研究室ノートから人とクジラの盟約口伝が発掘される。\n`;
  md += `- **防衛庁の通達**: 内閣法制局の壁（外国の武力攻撃ではないため防衛出動不可）を突破し、『害獣駆除名目』での海上自衛隊部隊の緊急動員が決定される。\n\n`;

  // Day 5
  md += `### 【Day 5】八丈島〜御蔵島沖 (約700 km) - 御蔵島沖噴火・富士山地下微動開始・未選択プール総力調査と魚雷撃退作戦の結末\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 御蔵島沖海底噴火に伴い八丈島で震度3。最も恐れていた【富士山地下深部からの火山性微動】が観測開始。メディア各社が富士山連動噴火の危機を報道。\n`;
  md += `- **防衛庁の機密遮断**: 自衛隊は作戦行動を最高軍事機密指定し、対策本部への情報提供を遮断。\n`;
  md += `- **Day 5 総力調査アクション**: 自衛隊迎撃の間、新設された【F-5A クジラの鳴音（コーダ）構文規則草稿】およびDay 3〜4で未調査だった全プールから東京1枠・現地2枠を選択して総ざらい開示。\n`;
  md += `- **自衛隊通常兵器の敗北**: 八丈島〜御蔵島沖で海自潜水艦の魚雷一斉射撃が敢行されるも、直撃した物体は泥のように瞬時に再結合。通常兵器が通用しない絶望に直面。\n`;
  md += `- **防衛庁からの緊急意見照会**: 『通常兵器で倒せないなら、あいつらは一体どうやって一つの個体として統率しているのか？ そしてどうやって海底火山や富士山を刺激し北上しているのか？』という至急諮問がPC2経由でPC5に寄せられる。\n\n`;

  // Day 6
  md += `### 【Day 6】三宅島〜伊豆大島沖 (約830 km) - 一時沈静化から終盤の再浮上へ ＆ 4大証拠の連鎖と8語新言語祝詞の完成・海自ソナー網装填\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **戦況推移**: 魚雷攻撃を警戒して物体は深海1,200mへ一時潜航。前半は微動が一時沈静化するも、終盤に駿河トラフ境界へ向けて急速に再浮上し、富士山微動が突如復活・激化（破局噴火まで残り24時間）。\n`;
  md += `- **東京班の夜間捜査による自動回収**: Day 5で選ばれなかった東京情報（謎のダイバーグループによる富士山麓への荷物搬入＆神社から盗まれた複数隕石の海域投棄の特定、または元神主子どもの口伝）が朝までに100%揃う。\n`;
  md += `- **4段階の開示ロジック（証拠の梯子）**:\n`;
  md += `  1. 【祝詞儀礼の存在】: 噴火や巨大生物出現時、神社では海へ出て祝詞を唱える儀式があった。\n`;
  md += `  2. 【海中筒の音響物理】: 水面での音響反射（インピーダンス不整合）を防ぐため、筒を海中に突っ込んで唱えていた。\n`;
  md += `  3. 【巨大イカ塊捕食の伝承】: 古文書に『巨大生物は地磁気と隕石が放つ特殊な物質を追って北上し、海底付近で特別な振動を起こして海底火山を刺激する』『過去にもマッコウクジラを呼び寄せて巨大なイカの塊りを捕食させた』と記録。\n`;
  md += `  4. 【朝倉ノートのクジラ言語】: クジラには5大コーダ（捕食、危機、位置指示、SOFAR到達距離、YES了解）が存在。\n`;
  md += `- **祝詞の神髄**: 日本語の文言そのものではなく、口蓋と舌を強く弾く『吸着破裂音（舌クリック音）』こそが本体。\n`;
  md += `- **8語新言語祝詞の完成パズル**:\n`;
  md += `  - 祝詞3語 [人間・クジラ・約束] ➔ 地理・方位 [海の下の火山・北に向かう・探せ] ➔ 捕食号令 [巨大な餌・集まれ]\n`;
  md += `  - 完成文面: **『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』**\n`;
  md += `- **海自ソナー網への装填スタンバイ**: PC1の軍事アクセス開放とPC2の音響コンソール接続により、海自全潜水艦・護衛艦・固定ソナー網（SOSUS）へ信号パケットを同期装填。翌朝・Day 7決戦での大出力放流に向けてスタンバイ完了！\n\n`;

  // Day 7
  md += `### 【Day 7】駿河湾口〜湾奥 (約950 km) - 駿河湾口決戦・魚雷飽和攻撃（粉砕アシスト）× クジラたちのメッセージリレー × 深海大捕食\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **戦況と水深設定**: 怪異は水深600〜1,000m（通常魚雷の耐圧限界スレスレ）を維持して駿河トラフ境界へ突入。富士山破局噴火まで残り数時間。\n`;
  md += `- **深海統合掃討オペレーションの全貌**:\n`;
  md += `  1. 【海自潜水艦部隊 重魚雷一斉飽和攻撃（一口サイズへの粉砕アシスト）】\n`;
  md += `     - 防衛庁リエゾン（PC2）の座標指示に基づき、限界深度へ重魚雷の一斉射撃を敢行。\n`;
  md += `     - 爆炎により巨大群体を一時的にバラバラに粉砕・分断。ソナー照射で標的マーカーを付与。\n`;
  md += `  2. 【全海域メガワット級ソナー網放流 ＆ クジラたちのメッセージリレー（歌のバトン）】\n`;
  md += `     - 全ソナー網（SOSUS）より『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』を大出力放流。\n`;
  md += `     - 至近海域の1頭のマッコウクジラが【了解】（YESコーダ：2,900Hz 2連打）を返信！\n`;
  md += `     - そのクジラが自ら同じ8語の歌を歌いながら北へ遊泳開始！\n`;
  md += `     - 沖合数十kmの第2クジラが【了解】を返し、歌をカノン（輪唱）状にリレー継承！\n`;
  md += `     - 太平洋全域（伊豆諸島・小笠原・鳥島沖）から無数の了解と歌声がこだまし、海中シンフォニーが鳴り響く！\n`;
  md += `  3. 【マッコウクジラ群の深海大捕食（完全消滅 ＆ 微動停止）】\n`;
  md += `     - リレーされた歌に導かれ、筋肉に酸素を蓄えた数百頭のマッコウクジラ群が駿河トラフ水深1,000mの闇へ一斉突入！\n`;
  md += `     - 魚雷で散り散りになったダイオウイカを片っ端から噛み砕き、貪り喰らい尽くす！\n`;
  md += `     - 怪異は完全に胃袋へと消滅し、富士山の火山性微動が完全に停止。日本壊滅は回避された！\n`;
  md += `- **（※エンディング演出の詳細は保留）**\n\n`;
  md += `---\n\n`;

  // --- 第4章：証拠マスター一覧 ---
  md += `## 📋 第4章：証拠（エビデンス）マスター一覧\n\n`;
  evidences.forEach((e) => {
    const owner = chars.find((c) => c.id === e.ownerId);
    md += `### [Day ${e.foundPhase}] ${e.title} (${owner?.name || "全員"})\n`;
    md += `- **ID**: \`${e.id}\`\n`;
    md += `- **カテゴリ**: ${e.category}\n`;
    if (e.acquisitionCondition) {
      md += `- **入手条件**: ${e.acquisitionCondition}\n`;
    }
    md += `- **内容**: ${e.description}\n\n`;
  });
  md += `---\n\n`;

  // --- 第5章：クジラ言語・暗号マトリクス ---
  md += `## 🐋 第5章：クジラ言語・暗号マトリクス（8語新言語祝詞の体系）\n\n`;
  md += `### 5-1. 単語リスト（${crypticWords.length}語）\n`;
  crypticWords.forEach((w) => {
    const holder = chars.find((c) => c.id === w.assignedCharId);
    md += `- **[${w.symbol}] ${w.meaning}** (\`${w.id}\` / 音響特性: ${w.soundPattern || "―"} / 保有担当: ${holder?.name || w.assignedCharId || "全員"} / 出典: ${w.clueSource || "―"})\n`;
  });
  md += `\n`;
  md += `### 5-2. 完成メッセージ文法ルール\n`;
  md += `- **正解シーケンス**: [人間] ➔ [クジラ] ➔ [約束] ➔ [海の下の火山] ➔ [北に向かう] ➔ [探せ] ➔ [巨大な餌] ➔ [集まれ]\n`;
  md += `- **完成文面**: 『${project?.crypticGrammar?.combinedMessage || "人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ"}』\n`;
  md += `- **文法解説**: ${project?.crypticGrammar?.ruleDescription || "太古の盟約の証である「人とクジラの約束」を冒頭に提示し、怪異が潜む「海の下の火山を北へ探せ」という位置・行動指示を与え、最後に「巨大な餌に集まれ」という本能的捕食号令で太平洋全域のクジラ群を駿河湾へ集結させる3部構成。"}\n`;

  return md;
}

/**
 * HTMLエスケープヘルパー
 */
function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * ブラウザ標準の印刷ダイアログ（A4白背景・インク節約・改ページ対応）を起動するユーティリティ
 * ポップアップブロックに邪魔されないよう隠しiframe方式で即座に印刷プレビューを開きます
 */
export function printDocumentText(title: string, markdownOrText: string): void {
  if (typeof window === "undefined") return;

  // Markdownテキストを見やすいHTML構造へ簡易変換
  const lines = (markdownOrText || "").split("\n");
  let htmlBody = "";
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("# ")) {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<h1>${escapeHtml(line.slice(2))}</h1>`;
    } else if (line.startsWith("## ")) {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<h2>${escapeHtml(line.slice(3))}</h2>`;
    } else if (line.startsWith("### ")) {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<h3>${escapeHtml(line.slice(4))}</h3>`;
    } else if (line.startsWith("#### ")) {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<h4>${escapeHtml(line.slice(5))}</h4>`;
    } else if (line === "---") {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<hr class="section-divider" />`;
    } else if (line.startsWith("- ") || line.startsWith("  - ")) {
      if (!inList) { htmlBody += "<ul>"; inList = true; }
      const isSub = line.startsWith("  - ");
      const content = escapeHtml(isSub ? line.slice(4) : line.slice(2))
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      htmlBody += `<li class="${isSub ? "sub-item" : ""}">${content}</li>`;
    } else if (line === "") {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      htmlBody += `<div class="spacer"></div>`;
    } else {
      if (inList) { htmlBody += "</ul>"; inList = false; }
      const formatted = escapeHtml(line)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      htmlBody += `<p>${formatted}</p>`;
    }
  }
  if (inList) {
    htmlBody += "</ul>";
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 16mm;
    }
    body {
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.65;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 18pt;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 8px;
      color: #0f172a;
    }
    h2 {
      font-size: 14pt;
      background: #f1f5f9;
      border-left: 5px solid #334155;
      padding: 6px 10px;
      margin-top: 22px;
      margin-bottom: 10px;
      color: #0f172a;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 8px;
      color: #1e293b;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      margin-top: 12px;
      margin-bottom: 4px;
      color: #334155;
      page-break-after: avoid;
    }
    p {
      margin: 4px 0;
      white-space: pre-wrap;
    }
    ul {
      margin: 4px 0 8px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
    }
    li.sub-item {
      margin-left: 16px;
      list-style-type: circle;
    }
    code {
      font-family: monospace;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 9.5pt;
    }
    hr.section-divider {
      border: none;
      border-top: 1px dashed #94a3b8;
      margin: 18px 0;
    }
    .spacer {
      height: 6px;
    }
  </style>
</head>
<body>
  ${htmlBody}
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
    }, 250);
  }
}

