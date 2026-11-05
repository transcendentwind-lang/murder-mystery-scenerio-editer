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
import { GM_DAY_FLOWCHARTS } from "@/utils/gmFlowchartData";

/**
 * 企画概要・プロット紹介 Markdown 生成
 */
export function generateSynopsisMarkdown(project: MMProject): string {
  const chars = project?.characters || [];
  const timeline = project?.timeline || [];
  const playerCount = project?.playerCount || chars.length || 6;

  let md = `# ${project?.title || "無題のシナリオ"}\n\n`;
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
    md += `- **公開プロフィール**: ${c.handout?.publicProfile || ""}\n\n`;
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
    text += `  概要: ${c.handout?.publicProfile || ""}\n\n`;
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
 * キャラクターハンドアウト一覧（本紙）Markdown 生成
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

  let md = `# ${project?.title || "無題のシナリオ"}\n\n`;
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

  // --- 第3章：7日間タイムライン完全進行台本 ---
  md += `## 📅 第3章：7日間インシデント進行 ＆ 完全GMシナリオ台本\n\n`;

  // Day 1
  md += `### 【Day 1】父島南西沖 (0 km) - 荒海からのメーデー・漂流予測と遭難船救助\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 民間チャーター船（40t）が全電源喪失。AIS停波、衛星死角。\n`;
  md += `- **海上保安庁東京本部の行動**: 朝潮（PC1）が遭難船スペック（40t船体は風速の5%で風下へ流される特性）を提示。貝浜（PC2）が衛星・AIS使用不能を報告し、海流と風圧流から現在地を割り出す「平行四辺形のベクトル合成法」を提示。\n`;
  md += `- **現地救難隊の行動**: 太刀魚（PC4）が海洋気象ブイ流速データ（真東へ2.0kt）と現場強風（南西から約30kt）を提示してPC1と連動計算（30kt × 5% ＝ 北東へ1.5kt）。浪寄（PC5）が現場海域に到着するまでの所要時間（約40分）を提示し、長津アナウンスの「発信から現在20分経過」と合わせて「1時間後の到着地点」を推測。初瀬（PC6）が遭難直前無線ログを共有。坂凪（PC3）が暗礁海図と照合し、真東の暗礁群を避けて東北東の漂流予測海域へ巡視船で急行・接舷救助。\n`;
  md += `- **開示される資料・証拠**: [ev-vessel-leeway-data] 遭難船スペック ＆ 風圧流データ、[ev-satellite-blindspot] 衛星状況報告書、[ev-reef-chart] 暗礁海図、[ev-ocean-buoy-current] 海洋ブイデータ、[ev-temperature-front] 現場海域への航海所要時間データ、[ev-radio-fragment] 遭難無線ログ、[ev-diver-box-photo] 大型冷凍ボックス、[ev-captain-testimony] 船長の証言。\n`;
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
  md += `- **ソノブイ索敵終了後 オペレーター緊急指令 ＆ 3名への情報開示（速度・到達予測の算出）**:\n`;
  md += `  - 🎙️ **総合オペレーター 長津のアナウンス**:「噴火時刻と巨大生物の動きに関連があるように思えます。もしこのまま北上した場合、この先どうなるか検討が必要だと思います。物体の移動スピードと、現時点で、明日はどのあたりまで北上するか予想を出してください」\n`;
  md += `  - 📦 **3名へ配備される証拠カード（情報トランプ構造）**:\n`;
  md += `    - 太刀魚（PC4）: 『西之島〜鳥島沖 距離観測データ』（西之島0km地点 ➔ 鳥島沖カルデラ 336km）\n`;
  md += `    - 貝浜（PC3）: 『鳥島沖 ソノブイ探知記録』（鳥島沖での探知・確認時刻: Day 3 16:00）\n`;
  md += `    - 浪寄（PC5）: 『遭難船救助・目撃時刻調書』（Day 1遭難船救助・巨大影目撃時刻: Day 1 08:00）\n`;
  md += `  - 💡 **推理・計算ロジック（GM正解メモ）**:\n`;
  md += `    - 経過時間: Day 1 08:00 ➔ Day 3 16:00 ＝ 56時間\n`;
  md += `    - 移動速度: 336 km ÷ 56時間 ＝ 時速 6.0 km（日速 約144 km）\n`;
  md += `    - 翌日（Day 4）の北上予想: 鳥島沖からさらに約144km北上し、須美寿島〜明神礁付近に到達すると算出。\n`;
  md += `- **東京側アクション（3択中1枠合議選択 / 翌日以降繰り越し可能）**:\n`;
  (DAY3_TOKYO_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **小笠原現地アクション（4択中2枠合議選択 / 翌日以降繰り越し可能）**:\n`;
  (DAY3_FIELD_ACTIONS || []).forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization})\n    - 要約: ${act.summary}\n    - 詳細: ${act.detail}\n`;
  });
  md += `- **調査結果**: 海面直下の巨大な影は単一生物ではなく、無数の触手や個体が絡み合った【超巨大群体（コロニー）】である外形構造を把握。1ヶ月前の流星雨で朝潮危機管理官（PC1）が拾い東京へ持ち帰っていた小さな隕石片の分析や八丈島微動解析等に着手。\n`;
  md += `  - 海洋生物学者（PC5）に写真鑑定を相談し、防衛省リエゾン（PC2）に防衛出動の要否を諮問。\n`;
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
  md += `- **防衛省の通達**: 内閣法制局の壁（外国の武力攻撃ではないため防衛出動不可）を突破し、『害獣駆除名目』での海上自衛隊部隊の緊急動員が決定される。\n\n`;

  // Day 5
  md += `### 【Day 5】八丈島〜御蔵島沖 (約700 km) - 御蔵島沖噴火・富士山地下微動開始・噴火タイムリミット算出と海自魚雷攻撃後の深海回復\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 御蔵島沖海底噴火に伴い八丈島で震度3。最も恐れていた【富士山地下深部からの火山性微動】が観測開始。残距離240km・時速5kmから、富士山噴火までの猶予時間（48時間）を算出。\n`;
  md += `- **防衛省の機密遮断**: 自衛隊は作戦行動を最高軍事機密指定し、対策本部への情報提供を遮断。\n`;
  md += `- **Day 5 総力調査アクション**: 自衛隊迎撃の間、新設された【F-5A クジラの鳴音（コーダ）構文規則草稿】および未調査プールを開示。\n`;
  md += `- **海自潜水艦の魚雷命中と深海での回復傾向**: 終盤、防衛省作戦本部から貝浜（PC2）へ直通無線（NG-06 ＆ Day 5 途中①指令書）が入電。魚雷群が命中したと思われ、特有の振動と火山性の周期的な微動は一時収まったものの、アクティブソナー（ソナー探知）では【ゆっくりと深海に沈み込みながら、元の大きさに戻っている傾向】が確認される。\n`;
  md += `- **防衛省作戦本部からの緊急意見照会**: 『上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが疑問が残る。あいつらはどうして魚雷の命中後に復活してしまうのか？ なぜ富士山を目指すのか？』という至急諮問がPC2経由で浪寄准教授（PC5）らに寄せられる。\n\n`;

  // Day 6
  md += `### 【Day 6】三宅島〜駿河トラフ境界沖 (約830 km) - 朝8時の完全回復・北上再開と新言語祝詞の完成 ＆ 岸部局長との緊急電話交渉と深夜SOFAR放流\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **戦況推移（朝8時ブリーフィング）**: 朝8時の時点で巨大生物がほとんど同じ大きさまで回復し、駿河トラフ境界に向けて北上を再開。それにあわせて富士山地下の火山性微動も再開。駿河湾までは24時間ほどで到達する見込みとなり、防衛省から速やかに対策をまとめるよう指示が出る。\n`;
  md += `- **東京班の夜間捜査による自動回収**: Day 5で選ばれなかった東京情報および朝倉教授の実録音響データ4件（EV-31〜34）が朝までに100%揃う。\n`;
  md += `- **4段階の開示ロジック（証拠の梯子）**:\n`;
  md += `  1. 【祝詞儀礼の存在】: 噴火や巨大生物出現時、神社では海へ出て祝詞を唱える儀式があった。\n`;
  md += `  2. 【海中筒の音響物理】: 水面での音響反射（インピーダンス不整合）を防ぐため、筒を海中に突っ込んで唱えていた。\n`;
  md += `  3. 【巨大イカ塊捕食の伝承】: 古文書に『巨大生物は地磁気と隕石が放つ特殊な物質を追って北上し、海底付近で特別な振動を起こして海底火山を刺激する』『過去にもマッコウクジラを呼び寄せて巨大なイカの塊りを捕食させた』と記録。\n`;
  md += `  4. 【朝倉ノートのクジラ言語】: 2語成語の構文規則と実録コーダ（人間とクジラ＋約束、海の下の火山＋探せ、北＋集まれ、大きい・たくさんの餌＋攻撃せよ）。\n`;
  md += `- **祝詞の神髄**: 日本語の文言そのものではなく、口蓋と舌を強く弾く『吸着破裂音（舌クリック音）』こそが本体。\n`;
  md += `- **『狂気の深淵を覗く』使用時の5分猶予 ＆ 心停止・救命（声かけ）ルール**: アプリで『狂気の深淵を覗く』を使用した場合は5分間の猶予（解読時間＋5分延長）の後、覗いたPCが心臓発作・心停止に陥る。GMの心停止宣言から数分以内に、坂凪（PC3）または初瀬（PC6）による救命処置の口頭宣言（東京班のPCが倒れた場合は通信越しの遠隔救命指示の宣言）と、初瀬の直観（「意識のない人間の耳にも最後まで声は届く」）に基づく仲間からの『名前を呼んで「戻ってこい」「まだ死ぬな」と声をかける』宣言が行われれば息を吹き返す（※身体接触や演技は一切不要）。\n`;
  md += `- **防衛省運用企画局長・岸部との直接電話交渉（Day 6 途中①指令書） ＆ 潜水艦SOFAR層深夜放流（NG-07）**:\n`;
  md += `  - 長津オペレーターの仲介（親戚である岸部局長への直通回線接続）を受け、朝潮危機管理官（PC1）と貝浜リエゾン（PC2）を中心に合同対策本部全員が岸部局長とのホットライン交渉に挑む。\n`;
  md += `  - 『通常兵器の無力化と火山刺激リスク vs マッコウクジラによる捕食』『水深1,000mのSOFAR層（潜水艦）での大出力放流』『クジラが集まるまでの移動時間（6〜8時間＝今夜送信が必要）』の論点を提示（不足時は岸部局長の反論で思考誘導）し、承認を取り付ける。\n`;
  md += `  - 海上自衛隊の第1潜水隊群が深海1,000mのSOFAR層へ急速潜航し、水中スピーカー（水中音響送信機）から人工音源の大出力放流を開始（NG-07）。翌朝の実弾攻撃抑制・待機（スタンドバイ）を確立させる。\n\n`;

  // Day 7
  md += `### 【Day 7】駿河湾付近 (約950 km) - 運命の夜明け・クジラ群の大捕食と微動完全停止 ＆ 政府公式発表の選択とエピローグ\n\n`;
  md += `#### 1. 結末とエピローグシークエンス\n`;
  md += `- **戦況と水深設定（朝ブリーフィング）**: 現状、富士山地下の火山性微動は継続しており、目標は水深600〜1,000mを維持して駿河湾付近まで接近。周辺海域に展開する自衛隊潜水艦部隊は合意通り魚雷発射管を開きながらも攻撃を抑制して待機。\n`;
  md += `- **エピローグシークエンスの全貌**:\n`;
  md += `  1. 【運命の夜明け・クジラ群の到達と生体ソナー大捕食】\n`;
  md += `     - 昨夜から放流された人工音源に応え、夜を徹して太平洋を泳いできたマッコウクジラ群が駿河湾深海へ到達！\n`;
  md += `     - クジラたちは自らの頭部から放つ生体ソナー（エコーロケーション）で巨大生物を探知し、本能のまま深海へ一斉潜航・大捕食を敢行！\n`;
  md += `     - 巨大生物の超群体は完全に呑み込まれ、富士山地下深部の火山性微動は完全停止。自衛隊は一発の実弾も撃たず発射中止（スタンドダウン）。\n`;
  md += `  2. 【総合オペレーター長津 作戦成功アナウンス（NG-08）】\n`;
  md += `     - 合同対策本部司令室で水中聴音網（パッシブソナー網）および深海ソナー探知のログを見守る長津オペレーターによる作戦成功アナウンス。\n`;
  md += `  3. 【海上自衛隊幹部からの直通電話（政治的思惑と最終選択）】\n`;
  md += `     - 防衛省幹部から直通電話が入り、「①功績を出さず国家防衛機密として自衛隊が掃討したことにするか」「②対策本部の功績として発表し自衛隊は何もせず解決したとするか」の選択が委ねられる。\n`;
  md += `  4. 【テレビ臨時ニュース（政府公式発表の全国報道・2パターン分岐）】\n`;
  md += `     - プレイヤーの選択に応じ、パターンA（NG-09：海上自衛隊が撃滅と報道）またはパターンB（NG-10：合同対策本部が特別な薬で無力化したヒーローとして報道）が流れる。\n`;
  md += `  5. 【エピローグ（それぞれの日常へ）】\n`;
  md += `     - 朝潮の指揮で合同対策本部を解散し、メンバーたちはそれぞれの日常へと帰還する。\n\n`;
  md += `---\n\n`;

  // --- 第3章別冊：GM用進行資料「各Dayごとの成功・失敗分岐フローチャート」 ---
  md += `## 🔀 第3章別冊：各Dayごとの成功・失敗分岐フローチャート（GM進行資料）\n\n`;
  GM_DAY_FLOWCHARTS.forEach((fc) => {
    md += `### ${fc.dayTitle}（${fc.hasFailureBranch ? "成功・失敗・反論分岐あり" : "失敗要素なし・共通進行"}）\n`;
    md += `- **判断・推理ポイント**: ${fc.decisionTaskTitle}\n`;
    md += `- **正解・達成条件**: ${fc.correctConditionSummary}\n`;
    md += `- **基本進行フロー**:\n`;
    fc.flowSteps.forEach((s) => {
      md += `  - ${s}\n`;
    });
    md += `- **成功・失敗・反論による分岐と処理**:\n`;
    fc.branches.forEach((br) => {
      md += `  - **${br.conditionLabel}** (${br.nextStepArrow})\n`;
      md += `    - **結果**: ${br.outcomeTitle}\n`;
      md += `    - **GM処理・セリフ**: ${br.gmActionAndDialogue.replace(/\n/g, " / ")}\n`;
      if (br.penaltyOrCarryOver) {
        md += `    - **ペナルティ・引き継ぎ**: ${br.penaltyOrCarryOver}\n`;
      }
    });
    md += `- **GM進行の要点**: ${fc.gmKeyNote}\n\n`;
  });
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
    md += `- **内容**: ${e.description}\n`;
    if (e.glossaryNote) {
      md += `- **用語解説（下部余白）**: ${e.glossaryNote}\n`;
    }
    md += `\n`;
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
  md += `- **文法解説**: ${project?.crypticGrammar?.ruleDescription || "太古の盟約の証である「人とクジラの約束」を冒頭に提示し、巨大生物が潜む「海の下の火山を北へ探せ」という位置・行動指示を与え、最後に「巨大な餌に集まれ」という本能的捕食号令で太平洋全域のクジラ群を駿河湾へ集結させる3部構成。"}\n`;

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

/**
 * HTMLエスケープヘルパー
 */
function escapeHtmlForB5(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * JIS B5サイズ（182mm × 257mm）用 キャラクターハンドアウト単体HTML生成
 * 構成：所属・氏名、公開プロフィール、自己紹介、あなたの内面（誇り＆喪失）、あなたの記憶
 * ※秘匿目標・所持品リスト・後ろめたさは排除した完全協力型高密度レイアウト
 */
export function generateB5HandoutSingleHtml(
  c: Character,
  projectTitle: string,
  index: number
): string {
  const memoryText = [c.introduction, c.handout?.backgroundTimeline]
    .filter(Boolean)
    .join("\n\n");

  const locationText =
    c.location === "headquarters" ? "海上保安庁東京本部" : "小笠原・現地救難隊";

  return `
  <div class="b5-sheet">
    <!-- ヘッダー -->
    <div class="header-band">
      <div class="header-left">
        <span class="sub-title">合同対策本部 記録資料</span>
        <span class="project-title">『${escapeHtmlForB5(projectTitle)}』</span>
      </div>
      <div class="header-right">
        <span class="confidential-badge">【非公開・個人ハンドアウト】</span>
        <span class="location-badge">拠点：${locationText}</span>
      </div>
    </div>

    <!-- 所属・氏名 IDプレート -->
    <div class="id-plate">
      <div class="id-info">
        <div class="profession-label">${escapeHtmlForB5(c.profession)}</div>
        <div class="character-name">${escapeHtmlForB5(c.name)}</div>
      </div>
      <div class="id-meta">
        <div class="pc-badge">PC-${index + 1}</div>
      </div>
    </div>

    <!-- 公開情報エリア（2列対称グリッド） -->
    <div class="grid-2col">
      <!-- 公開プロフィール -->
      <div class="card card-public">
        <div class="card-header">
          <span class="card-title">🌐 【公開情報】全員に公開できるプロフィール</span>
          <span class="card-sub-hint">（自己紹介で開示）</span>
        </div>
        <div class="card-content">
          ${escapeHtmlForB5(c.handout?.publicProfile || "").replace(/\n/g, "<br/>")}
        </div>
      </div>

      <!-- 自己紹介（開始時台詞） -->
      <div class="card card-intro">
        <div class="card-header intro-header">
          <span class="card-title">💬 【公開情報】自己紹介（開始時ロールプレイ台詞）</span>
        </div>
        <div class="card-content quote-content">
          ${escapeHtmlForB5(c.handout?.handoutBody || "").replace(/\n/g, "<br/>")}
        </div>
      </div>
    </div>

    <!-- 非公開情報：あなたの内面（2列対称グリッド） -->
    <div class="internal-drama-section">
      <div class="section-title-bar">
        <span class="section-title">🔒 あなたの内面（非公開）・行動指針</span>
        <span class="section-notice">※他プレイヤーには非公開（ロールプレイの軸となります）</span>
      </div>
      <div class="grid-2col">
        <!-- 誇り・信条 -->
        <div class="card card-pride">
          <div class="card-sub-header pride-header">✦ 誇り・信条・行動指針</div>
          <div class="card-content">
            ${escapeHtmlForB5(c.handout?.internalDrama?.pride || "").replace(/\n/g, "<br/>")}
          </div>
        </div>

        <!-- 過去の喪失・悔恨 -->
        <div class="card card-loss">
          <div class="card-sub-header loss-header">✦ 過去の喪失・悔恨</div>
          <div class="card-content">
            ${escapeHtmlForB5(c.handout?.internalDrama?.loss || "").replace(/\n/g, "<br/>")}
          </div>
        </div>
      </div>
    </div>

    <!-- 非公開情報：あなたの記憶（全幅） -->
    <div class="card card-memory">
      <div class="card-header memory-header">
        <span class="card-title">📖 あなたの記憶（当日の状況・背景情報）</span>
        <span class="memory-badge">非公開情報：他プレイヤーには見せないでください</span>
      </div>
      <div class="memory-content">
        ${escapeHtmlForB5(memoryText).replace(/\n/g, "<br/>")}
      </div>
    </div>

    <!-- フッター -->
    <div class="footer-band">
      <span>合同対策本部 記録 // JIS B5 規格ハンドアウト</span>
      <span class="page-num">B5 1/1 頁</span>
    </div>
  </div>
  `;
}

/**
 * B5印刷用共通スタイルシート定義
 */
export const B5_HANDOUT_PRINT_STYLES = `
  @page {
    size: B5 portrait;
    margin: 8mm 9mm;
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
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Segoe UI", Roboto, Meiryo, sans-serif;
    font-size: 10pt;
    line-height: 1.48;
  }
  .b5-sheet {
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .b5-page-break {
    page-break-after: always !important;
    break-after: page !important;
  }
  .header-band {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 4px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sub-title {
    font-size: 8pt;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
  }
  .project-title {
    font-size: 9.5pt;
    font-weight: 900;
    color: #0f172a;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .confidential-badge {
    background: #0f172a;
    color: #ffffff;
    font-size: 7.5pt;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.05em;
  }
  .location-badge {
    border: 1px solid #cbd5e1;
    background: #f1f5f9;
    color: #334155;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .id-plate {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    border-radius: 5px;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .profession-label {
    font-size: 8pt;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 2px;
  }
  .character-name {
    font-size: 15pt;
    font-weight: 900;
    letter-spacing: 0.03em;
    color: #ffffff;
  }
  .id-meta {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }
  .pc-badge {
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.12);
    color: #ffffff;
    font-family: monospace;
    font-size: 8.5pt;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 3px;
    letter-spacing: 0.08em;
  }
  .coop-status {
    font-size: 7pt;
    font-weight: 700;
    color: #6ee7b7;
  }
  .grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .card {
    border-radius: 5px;
    border: 1px solid #cbd5e1;
    padding: 7px 9px;
    background: #ffffff;
  }
  .card-public {
    background: #f8fafc;
  }
  .card-intro {
    background: #eef2ff;
    border-color: #c7d2fe;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }
  .card-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #1e293b;
  }
  .card-sub-hint {
    font-size: 7pt;
    color: #64748b;
  }
  .card-content {
    font-size: 8.5pt;
    line-height: 1.48;
    color: #1e293b;
  }
  .quote-content {
    font-style: italic;
    border-left: 3px solid #6366f1;
    padding-left: 6px;
    color: #0f172a;
  }
  .internal-drama-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .section-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2px;
  }
  .section-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #0f172a;
  }
  .section-notice {
    font-size: 7pt;
    color: #64748b;
  }
  .card-pride {
    background: #fffbeb;
    border-color: #fde68a;
  }
  .pride-header {
    font-size: 8pt;
    font-weight: 700;
    color: #78350f;
    border-bottom: 1px solid #fde68a;
    padding-bottom: 2px;
    margin-bottom: 4px;
  }
  .card-loss {
    background: #f8fafc;
    border-color: #e2e8f0;
  }
  .loss-header {
    font-size: 8pt;
    font-weight: 700;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 2px;
    margin-bottom: 4px;
  }
  .card-memory {
    background: #ffffff;
    border-color: #cbd5e1;
    padding: 8px 10px;
  }
  .memory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }
  .memory-badge {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #be123c;
    font-size: 7pt;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 3px;
  }
  .memory-content {
    font-size: 8.5pt;
    line-height: 1.58;
    color: #0f172a;
  }
  .footer-band {
    margin-top: 2px;
    border-top: 1px solid #e2e8f0;
    padding-top: 3px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7pt;
    color: #64748b;
  }
  .coop-note {
    font-weight: 600;
    color: #475569;
  }
  .page-num {
    font-family: monospace;
  }
`;

/**
 * JIS B5サイズ印刷ダイアログ実行（単体または全員分一括）
 */
export function printCharacterHandoutsB5(
  characters: Character[],
  projectTitle: string,
  selectedCharId?: string
): void {
  const targetChars = selectedCharId
    ? characters.filter((c) => c.id === selectedCharId)
    : characters;

  if (targetChars.length === 0) return;

  const pagesHtml = targetChars
    .map((c, idx) => {
      const origIndex = characters.findIndex((orig) => orig.id === c.id);
      const sheetHtml = generateB5HandoutSingleHtml(
        c,
        projectTitle,
        origIndex >= 0 ? origIndex : idx
      );
      const isLast = idx === targetChars.length - 1;
      return `<div class="${isLast ? "" : "b5-page-break"}">${sheetHtml}</div>`;
    })
    .join("\n");

  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtmlForB5(projectTitle)} - B5 個人ハンドアウト</title>
  <style>
    ${B5_HANDOUT_PRINT_STYLES}
  </style>
</head>
<body>
  ${pagesHtml}
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
    }, 350);
  }
}

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
export function printWhaleSonarGuideA4(): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>マッコウクジラ音響言語解析システム - プレイヤー提示資料（A4・表裏2ページ）</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
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
      width: 210mm;
      height: 297mm;
      padding: 14mm 15mm;
      margin: 0 auto;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .outer-frame {
      width: 100%;
      height: 100%;
      border: 2.5px solid #0f172a;
      border-radius: 10px;
      padding: 9mm 10mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }
    .header-banner {
      background: #f0f9ff;
      color: #0f172a;
      border-radius: 8px;
      padding: 5.5mm 7mm;
      text-align: center;
      border: 2px solid #0284c7;
      border-bottom: 4px solid #0284c7;
    }
    .header-sub {
      font-size: 9.5pt;
      font-weight: 800;
      letter-spacing: 0.18em;
      color: #0369a1;
      margin-bottom: 2mm;
    }
    .header-title {
      font-size: 21pt;
      font-weight: 900;
      letter-spacing: 0.06em;
      color: #0f172a;
      margin: 0;
      line-height: 1.25;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 4mm 0;
    }
    .qr-card {
      border: 3px solid #0f172a;
      border-radius: 14px;
      padding: 7mm;
      background: #ffffff;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .qr-card img {
      width: 86mm;
      height: 86mm;
      object-fit: contain;
      display: block;
    }
    .qr-caption {
      margin-top: 3mm;
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
    }
    .pw-box {
      border: 3px solid #0891b2;
      background: #ecfeff;
      border-radius: 12px;
      padding: 5.5mm 8mm;
      text-align: center;
    }
    .pw-label {
      font-size: 11pt;
      font-weight: 800;
      color: #0e7490;
      letter-spacing: 0.1em;
      margin-bottom: 2mm;
    }
    .pw-value {
      font-family: "Courier New", Consolas, monospace;
      font-size: 31pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #0f172a;
      background: #ffffff;
      border: 2px solid #06b6d4;
      border-radius: 8px;
      padding: 2.5mm 8mm;
      display: inline-block;
      line-height: 1.1;
    }
    .pw-note {
      margin-top: 2mm;
      font-size: 9.5pt;
      font-weight: 700;
      color: #334155;
    }
    .steps-box {
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 10px;
      padding: 5mm 6mm;
    }
    .steps-title {
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 3mm;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 1.5mm;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 3.5mm;
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.5;
      margin-bottom: 2.5mm;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-badge {
      width: 6.5mm;
      height: 6.5mm;
      border-radius: 999px;
      background: #0f172a;
      color: #ffffff;
      font-size: 10pt;
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
      font-size: 8.5pt;
      font-weight: 700;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 2.5mm;
    }

    /* 裏面（2ページ目：操作ガイド＆画面サンプル） */
    .guide-lead-box {
      border: 2px solid #0891b2;
      background: #f0fdff;
      border-radius: 10px;
      padding: 4.5mm 5.5mm;
    }
    .guide-lead-title {
      font-size: 11.5pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 2.5mm;
      display: flex;
      align-items: center;
      gap: 2mm;
    }
    .guide-bullet {
      display: flex;
      align-items: flex-start;
      gap: 2.5mm;
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.55;
      margin-bottom: 2mm;
    }
    .guide-bullet:last-child {
      margin-bottom: 0;
    }
    .guide-dot {
      color: #0891b2;
      font-weight: 900;
      flex-shrink: 0;
    }

    /* スマホ画面サンプル枠（トナー節約・ライトトーン再現） */
    .mock-phone-frame {
      background: #f8fafc;
      color: #0f172a;
      border: 2px solid #475569;
      border-radius: 14px;
      padding: 4.5mm 5mm;
      display: flex;
      flex-direction: column;
      gap: 3.5mm;
    }
    .mock-phone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 2mm;
    }
    .mock-phone-header-title {
      font-size: 9.5pt;
      font-weight: 900;
      color: #0369a1;
      letter-spacing: 0.04em;
    }
    .mock-phone-header-badge {
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 4px;
      padding: 0.8mm 2mm;
    }
    .sample-block {
      position: relative;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      background: #ffffff;
      padding: 3mm 3.5mm;
    }
    .callout-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2mm;
    }
    .callout-tag {
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
      background: #e0f2fe;
      border: 1.5px solid #0284c7;
      color: #0369a1;
      font-size: 8.5pt;
      font-weight: 900;
      padding: 0.6mm 2.5mm;
      border-radius: 999px;
    }
    .callout-desc {
      font-size: 8.5pt;
      font-weight: 700;
      color: #334155;
    }

    /* ① 波形ログサンプル */
    .waveform-box {
      border: 1.5px solid #0284c7;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
    }
    .waveform-header {
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
      padding: 1.5mm 3mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 8.5pt;
      font-weight: 800;
      color: #0369a1;
    }
    .waveform-replay {
      font-size: 7.5pt;
      background: #ffffff;
      border: 1px solid #0284c7;
      color: #0369a1;
      border-radius: 4px;
      padding: 0.5mm 2mm;
      font-weight: 800;
    }

    /* ② クジラの行動観測モニターサンプル */
    .monitor-box {
      border: 1.5px solid #94a3b8;
      background: #f8fafc;
      border-radius: 8px;
      padding: 3mm 4mm;
      text-align: center;
    }
    .monitor-title {
      font-size: 9.5pt;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1mm;
    }
    .monitor-sub {
      font-size: 8.5pt;
      font-weight: 600;
      color: #334155;
      line-height: 1.45;
    }

    /* ③ 海中にクリック音を流す（発信）サンプル */
    .seq-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5mm;
    }
    .seq-bar-label {
      font-size: 8.5pt;
      font-weight: 900;
      color: #0369a1;
    }
    .seq-ctrl-btns {
      display: flex;
      gap: 1.5mm;
    }
    .seq-ctrl-btn {
      background: #f8fafc;
      border: 1px solid #64748b;
      color: #1e293b;
      border-radius: 5px;
      padding: 0.8mm 2.2mm;
      font-size: 8pt;
      font-weight: 800;
    }
    .seq-slot-box {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 7px;
      padding: 2mm 2.5mm;
      display: flex;
      align-items: center;
      gap: 2mm;
      margin-bottom: 2mm;
    }
    .seq-chip {
      background: #eef2ff;
      border: 1.5px solid #4f46e5;
      color: #1e1b4b;
      border-radius: 5px;
      padding: 0.8mm 2.2mm;
      font-size: 8.5pt;
      font-weight: 800;
    }
    .transmit-btn {
      width: 100%;
      background: #e0f2fe;
      border: 2px solid #0284c7;
      color: #0f172a;
      border-radius: 8px;
      padding: 2.2mm 4mm;
      text-align: center;
      font-size: 10.5pt;
      font-weight: 900;
      letter-spacing: 0.04em;
    }

    /* ④ クリック音ボタンサンプル（音 #01 ＆ 音 #03） */
    .sample-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5mm;
    }
    .sound-card {
      background: #f8fafc;
      border-radius: 9px;
      padding: 2.8mm 3mm;
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
      font-size: 8.5pt;
      font-weight: 900;
      padding: 0.5mm 2mm;
      border-radius: 4px;
    }
    .sound-preview-btn {
      background: #e0f2fe;
      border: 1px solid #0284c7;
      color: #0369a1;
      font-size: 8pt;
      font-weight: 800;
      padding: 0.6mm 2mm;
      border-radius: 5px;
    }
    .sound-onomatopoeia {
      margin-top: 1.8mm;
      font-size: 10pt;
      font-weight: 900;
      color: #92400e;
    }
    .sound-meaning-locked {
      margin-top: 1.5mm;
      display: inline-block;
      background: #fef3c7;
      border: 1.5px solid #d97706;
      color: #92400e;
      font-size: 9pt;
      font-weight: 900;
      padding: 0.8mm 2.2mm;
      border-radius: 5px;
    }
    .sound-meaning-unsolved {
      margin-top: 1.5mm;
      font-size: 9pt;
      font-weight: 800;
      color: #475569;
    }
    .sound-card-footer {
      margin-top: 2mm;
      padding-top: 1.8mm;
      border-top: 1px solid #cbd5e1;
    }
    .sound-locked-note {
      font-size: 8pt;
      font-weight: 800;
      color: #b45309;
    }
    .sound-assign-btn {
      width: 100%;
      background: #eef2ff;
      border: 1.5px solid #4f46e5;
      color: #312e81;
      border-radius: 6px;
      padding: 1.2mm 2mm;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <!-- =========================================================================
       1ページ目（表面）：QRコード ＆ アクセスパスワード提示シート
       ========================================================================= -->
  <div class="a4-page page-break">
    <div class="outer-frame">
      <div class="header-banner">
        <div class="header-sub">MARINE MAMMAL ACOUSTIC ANALYSIS TERMINAL</div>
        <h1 class="header-title">『マッコウクジラ音響言語解析システム』</h1>
      </div>

      <div class="qr-section">
        <div class="qr-card">
          <img src="/images/sonar_qr.png" alt="マッコウクジラ音響言語解析システム QRコード" />
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
          <span>詳しい画面の見方と操作方法は、<strong>裏面（次ページ）</strong>をご覧ください。</span>
        </div>
      </div>

      <div class="footer-bar">
        <span>マッコウクジラ音響言語解析システム ― プレイヤー提示用シート（表面）</span>
        <span>1 / 2</span>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       2ページ目（裏面）：画面サンプル ＆ 操作説明シート
       ========================================================================= -->
  <div class="a4-page">
    <div class="outer-frame">
      <div class="header-banner" style="padding: 4.5mm 6mm;">
        <div class="header-sub" style="font-size: 8.5pt;">SYSTEM OPERATION GUIDE &amp; SCREEN SAMPLES</div>
        <h1 class="header-title" style="font-size: 17.5pt;">『マッコウクジラ音響言語解析システム』画面説明</h1>
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
            <svg viewBox="0 0 600 92" width="100%" height="68" style="display:block; background:#ffffff;">
              <!-- グリッド線 -->
              <line x1="0" y1="23" x2="600" y2="23" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="46" x2="600" y2="46" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="0" y1="69" x2="600" y2="69" stroke="#e2e8f0" stroke-width="1" />
              <line x1="300" y1="0" x2="300" y2="92" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />
              <!-- ラベル -->
              <text x="12" y="16" fill="#0369a1" font-size="10" font-family="monospace" font-weight="bold">1. 音 #01『ゴゴゴゴ…』(海の下の火山)</text>
              <text x="312" y="16" fill="#0369a1" font-size="10" font-family="monospace" font-weight="bold">2. 音 #03『カ・カ・カカッ！』</text>
              <!-- 波形1（低周波の連続振動：ゴゴゴゴ…） -->
              <path d="M 15 46 Q 25 20, 35 46 T 55 46 T 75 46 T 95 46 T 115 46 T 135 46 T 155 46 T 175 46 T 195 46 T 215 46 T 235 46 T 255 46 L 285 46" fill="none" stroke="#d97706" stroke-width="2.2" />
              <!-- 波形2（鋭いパルス：カ・カ・カカッ！） -->
              <path d="M 315 46 L 335 46 L 340 14 L 345 78 L 350 46 L 385 46 L 390 14 L 395 78 L 400 46 L 435 46 L 440 12 L 445 80 L 450 20 L 455 74 L 460 46 L 580 46" fill="none" stroke="#0284c7" stroke-width="2.2" />
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
              クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、<br />
              ここにクジラの行動が文字で表示されます。
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
            <span style="color:#64748b; font-weight:bold; font-size:9pt;">＋</span>
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
        <span>2 / 2</span>
      </div>
    </div>
  </div>
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



