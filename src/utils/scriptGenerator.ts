import { MMProject } from "@/types/schema";
import {
  TOKYO_ACTIONS,
  FIELD_ACTIONS,
  DAY4_TOKYO_ACTIONS,
  DAY4_FIELD_ACTIONS,
  DAY5_TOKYO_ACTIONS,
  DAY5_FIELD_ACTIONS,
} from "@/components/GmDashboard";

/**
 * 企画概要・プロット紹介 Markdown 生成
 */
export function generateSynopsisMarkdown(project: MMProject): string {
  let md = `# ${project.title}\n## ${project.subtitle}\n\n`;
  md += `- **想定プレイ時間**: 約${project.durationHours}時間\n`;
  md += `- **プレイヤー人数**: ${project.playerCount}名（GM必須）\n`;
  md += `- **ジャンル**: 協力型インシデント・ミステリー / パニックサスペンス\n\n`;

  md += `## 🌟 1. 作品コンセプト・世界観\n${project.concept}\n\n`;

  md += `## 🎭 2. プレイヤー体験 (Player Experience)\n${project.targetExperience}\n\n`;

  md += `## 📜 3. プロット紹介 (あらすじ・真相・解決法)\n${project.plotSummary}\n\n`;

  md += `## 💡 4. コアギミック (生態系捕食 × クジラ言語パズル × メッセージリレー)\n${project.gimmickOverview}\n\n`;

  md += `## 👥 5. 登場人物一覧（対策チーム ${project.playerCount}名: 東京司令部2名 ＋ 小笠原現地${project.playerCount === 5 ? "3名" : "4名"}）\n`;
  project.characters.forEach((c) => {
    md += `### ${c.name} (${c.profession})\n`;
    md += `- **配置**: ${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}\n`;
    md += `- **公開プロフィール**: ${c.handout.publicProfile}\n`;
    md += `- **初期所持品**: ${c.initialItems.join("、")}\n`;
    md += `- **固有能力**:\n`;
    c.capabilities.forEach((cap) => {
      md += `  - [Day ${cap.targetPhase}] **${cap.name}**: ${cap.description}\n`;
    });
    md += `\n`;
  });

  md += `## 📅 6. 7日間のインシデント進行概要\n`;
  project.timeline.forEach((t) => {
    md += `### Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
    md += `- **事象**: ${t.incidentOverview}\n`;
    md += `- **東京司令部**: ${t.hqResponse}\n`;
    md += `- **現地救難隊**: ${t.fieldResponse}\n\n`;
  });

  return md;
}

/**
 * 企画概要 プレーンテキスト生成 (.txt用)
 */
export function generateSynopsisPlainText(project: MMProject): string {
  let text = `=================================================================\n`;
  text += `【シナリオ企画概要書】\n`;
  text += `タイトル: ${project.title}\n`;
  text += `サブタイトル: ${project.subtitle}\n`;
  text += `プレイ人数: ${project.playerCount}名（GM必須） ｜ 想定時間: 約${project.durationHours}時間\n`;
  text += `=================================================================\n\n`;

  text += `■ 1. 作品コンセプト・世界観\n`;
  text += `${project.concept}\n\n`;

  text += `■ 2. プレイヤー体験（Player Experience）\n`;
  text += `${project.targetExperience}\n\n`;

  text += `■ 3. プロット紹介（あらすじ・真相・解決法）\n`;
  text += `${project.plotSummary}\n\n`;

  text += `■ 4. コアギミック・独自性（生態系捕食 × クジラ言語パズル × メッセージリレー）\n`;
  text += `${project.gimmickOverview}\n\n`;

  text += `■ 5. 登場人物（海難救助対策チーム ${project.playerCount}名: 東京司令部2名 ＋ 小笠原現地${project.playerCount === 5 ? "3名" : "4名"}）\n`;
  project.characters.forEach((c) => {
    text += `・${c.name} (${c.profession}) [${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}]\n`;
    text += `  概要: ${c.handout.publicProfile}\n`;
    text += `  初期所持品: ${c.initialItems.join("、")}\n`;
    text += `  固有能力: ${c.capabilities.map((cap) => `[Day ${cap.targetPhase}] ${cap.name}`).join("、")}\n\n`;
  });

  text += `■ 6. 7日間のインシデント進行フロー\n`;
  project.timeline.forEach((t) => {
    text += `・Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
    text += `  概要: ${t.incidentOverview}\n`;
  });
  text += `\n=================================================================\n`;

  return text;
}

/**
 * 完全シナリオ台本 Markdown 生成 (.md用)
 * 全設定・全HO・全Day進行台本（プレイヤーができること・資料・結果・GMセリフ）・全エビデンス・暗号パズルを完全網羅
 */
export function generateFullScriptMarkdown(project: MMProject): string {
  let md = `# ${project.title}\n## ${project.subtitle}\n\n`;
  md += `- **想定プレイ時間**: 約${project.durationHours}時間\n`;
  md += `- **プレイヤー人数**: ${project.playerCount}名（GM必須）\n`;
  md += `- **ジャンル**: 協力型インシデント・ミステリー / パニックサスペンス\n\n`;
  md += `---\n\n`;

  // --- 第1章：企画概要 ＆ プロット ---
  md += `## 🌟 第1章：作品コンセプト ＆ プロット概要\n\n`;
  md += `### 1-1. コンセプト\n${project.concept}\n\n`;
  md += `### 1-2. プレイヤー体験 (Player Experience)\n${project.targetExperience}\n\n`;
  md += `### 1-3. プロット紹介（真相・あらすじ・解決の全貌）\n${project.plotSummary}\n\n`;
  md += `### 1-4. コアギミック (生態系捕食 × クジラ言語パズル × メッセージリレー)\n${project.gimmickOverview}\n\n`;
  md += `---\n\n`;

  // --- 第2章：キャラクターハンドアウト ---
  md += `## 👥 第2章：登場人物ハンドアウト（全${project.playerCount}名: 東京司令部2名 ＋ 小笠原現地${project.playerCount === 5 ? "3名" : "4名"}）\n\n`;
  project.characters.forEach((c) => {
    md += `### ${c.name} (${c.profession})\n`;
    md += `- **所属・配置**: ${c.location === "headquarters" ? "東京本庁・司令部" : "小笠原・現地救難隊"}\n`;
    md += `- **公開プロフィール**: ${c.handout.publicProfile}\n`;
    md += `- **秘匿動機・目的**: ${c.handout.secretObjective}\n\n`;

    md += `#### 【キャラクター内面ドラマ】\n`;
    md += `- **誇り (Pride)**: ${c.handout.internalDrama?.pride || "なし"}\n`;
    md += `- **後ろめたさ (Guilt)**: ${c.handout.internalDrama?.guilt || "なし"}\n`;
    md += `- **喪失体験 (Loss)**: ${c.handout.internalDrama?.loss || "なし"}\n\n`;

    md += `#### 【初期所持品】\n`;
    c.initialItems.forEach((item) => {
      md += `- ${item}\n`;
    });
    md += `\n`;

    md += `#### 【固有能力・できること】\n`;
    c.capabilities.forEach((cap) => {
      md += `- **Day ${cap.targetPhase}: ${cap.name}**\n  ${cap.description}\n`;
    });
    md += `\n`;

    md += `#### 【イントロダクション】\n${c.introduction}\n\n`;
    md += `#### 【ハンドアウト本文】\n${c.handout.handoutBody}\n\n`;
    md += `---\n\n`;
  });

  // --- 第3章：7日間タイムライン完全進行台本 ---
  md += `## 📅 第3章：7日間インシデント進行 ＆ 完全GMシナリオ台本\n\n`;

  // Day 1
  md += `### 【Day 1】父島南西沖 (0 km) - 荒海からのメーデー・漂流予測と遭難船救助\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 民間チャーター船（40t）が全電源喪失。AIS停波、衛星死角。\n`;
  md += `- **東京司令部の行動**: PC1が遭難船スペック（風圧流リーウェイ率3〜4%）を提示。PC2が衛星死角（ひまわり解像度限界・雨雲）と南西強風15m/s（約30ノット）を報告。航法計算（東へ2ktの黒潮支流 × 北東へ1.5ktの風圧流）から東北東の漂流予測地点を割り出す。\n`;
  if (project.playerCount === 5) {
    md += `- **現地救難隊の行動**: PC3が救難艇で急行し、暗礁手前で接舷・救助。PC4が海洋気象ブイ実測データ（真東2kt）と遭難直前無線ログを提示し、暗礁手前での突入ルートを計算。PC5が潮目水温データを提示して海流の持続を証明。\n`;
  } else {
    md += `- **現地救難隊の行動**: PC3が救難艇で急行し、暗礁手前で接舷・救助。PC4が海洋ブイ海流データを提示。PC5が潮目水温データを提示。PC6が現場海域の海図と暗礁位置・遭難直前無線ログを照合。\n`;
  }
  md += `- **開示される資料・証拠**: [ev-drift-map] 漂流予測計算海図、[ev-satellite-blindspot] 衛星捜索制約レポート、[ev-diver-box-photo] 救助された謎のダイバーグループと大型冷凍ボックスの写真、[ev-captain-testimony] 船長証言（『巨大な影に船底を叩かれた』）、[ev-radio-fragment] 途絶した遭難無線ログ。\n`;
  md += `- **調査結果と疑惑**: 船長『巨大生物を見た』vs 謎のダイバーグループ『魚の調査サンプルだ』と食い違い、ダイバーたちは海から引き揚げて箱に入れた約30kgほどのずっしり重いプラスチック冷凍ボックスを持ち去る。\n\n`;

  // Day 2
  md += `### 【Day 2】西之島沖 (約180 km) - 異変の顕在化・西之島噴火と深海シグネチャー\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 西之島周辺の海底火山が突発的大噴火。水深800m以深を日速約150km（時速約6km / 3.3ノット）で北上する超巨大影を捕捉。\n`;
  md += `- **東京司令部のアクション（3択中1枠合議選択）**:\n`;
  TOKYO_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **現地救難隊のアクション（4択中2枠合議選択）**:\n`;
  FIELD_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **調査結果**: Day 1遭難船のスクリュー付着物からダイオウイカの触手筋肉組織を特定。しかし数百メートルの巨大影との間にサイズ矛盾が生じる。移動震源の通過後に火山が噴火した因果関係が判明。\n\n`;

  // Day 3
  md += `### 【Day 3】孀婦岩〜鳥島沖 (約400 km) - 洋上ソナー索敵作戦・写真分析と防衛合議\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 鳥島沖海底カルデラの連動大爆発。海自・海保ヘリによる洋上ソナー索敵作戦。\n`;
  md += `- **プレイヤーの作戦行動**:\n`;
  md += `  - ソノブイ投下（セクターA〜C、深度1〜3）により、セクターB-3で目標の生体反射音を捕捉。\n`;
  md += `  - ヘリによる航空写真撮影（または波形スキャン）を実行。\n`;
  md += `  - 海洋生物学者（PC5）に写真鑑定を相談し、防衛庁リエゾン（PC2）に防衛出動の要否を諮問。\n`;
  md += `  - 対策本部全員による合議を経て、司令官（PC1）が防衛出動・迎撃方針を最終決定。\n`;
  md += `- **調査結果**: 海面直下の巨大な影は単一生物ではなく、無数の触手や個体が絡み合った【超巨大群体（コロニー）】である外形構造を把握。アクティブソナー照射に対して一時潜航・回避行動をとる。\n\n`;

  // Day 4
  md += `### 【Day 4】須美寿島〜青ヶ島沖 (約550 km) - 須美寿島沖海底噴火・富士山到達危機と東京・小笠原クロス調査\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 須美寿島〜青ヶ島沖の海底カルデラ噴火。八丈島で火山性群発微動が頻発。日速約150kmで北上する火山フロントが数日後に【富士山直下】に到達し、破局的大噴火を誘発する絶対的危機が発覚。\n`;
  md += `- **東京側アクション（3択中1枠合議選択）**:\n`;
  DAY4_TOKYO_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **小笠原現地アクション（4択中2枠合議選択）**:\n`;
  DAY4_FIELD_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **調査結果**: 1ヶ月前の流星雨で司令官（PC1）だけが拾い東京へ持ち帰っていた小さな隕石片から特異な結晶構造・微弱な残留磁気を検出し、小笠原近海の落下地質記録から海底に約30kg規模のまとまった隕石塊が沈んでいた可能性が判明。港の貨物台帳から、Day 1で謎のダイバーグループが運んだ冷凍ボックス（約30kg）の送り先が【静岡県・富士山麓の民家】宛てと判明！ 小笠原大神宮古文書から、太古に怪異を鎮めた『盟約の祝詞』が存在し、船で海に出て長い筒（海中筒）を海中に差し入れて唱える作法であることが判明。ただし内容は秘伝で元神主は死去、子ども達は東京に出ている。\n`;
  md += `- **防衛庁の通達**: 内閣法制局の壁（外国の武力攻撃ではないため防衛出動不可）を突破し、『害獣駆除名目』での海上自衛隊部隊の緊急動員が決定される。\n\n`;

  // Day 5
  md += `### 【Day 5】八丈島〜御蔵島沖 (約700 km) - 御蔵島沖噴火・富士山地下微動開始・自衛隊機密遮断と魚雷撃退作戦の結末\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **発生事象**: 御蔵島沖海底噴火に伴い八丈島で震度3。最も恐れていた【富士山地下深部からの火山性微動】が観測開始。メディア各社が富士山連動噴火の危機を報道。\n`;
  md += `- **防衛庁の機密遮断**: 自衛隊は作戦行動を最高軍事機密指定し、対策本部への情報提供を遮断。対策チームは独自調査を展開。\n`;
  md += `- **東京側アクション（2択中1枠合議選択）**:\n`;
  DAY5_TOKYO_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **現地アクション（3択中2枠合議選択）**:\n`;
  DAY5_FIELD_ACTIONS.forEach((act) => {
    md += `  - **[${act.id}] ${act.title}** (${act.organization}): ${act.summary}\n`;
  });
  md += `- **自衛隊通常兵器の敗北**: 八丈島〜御蔵島沖で海自潜水艦の魚雷一斉射撃が敢行されるも、直撃した物体は泥のように瞬時に再結合。通常兵器が通用しない絶望に直面。\n`;
  md += `- **防衛庁からの緊急意見照会**: 『通常兵器で倒せないなら、あいつらは一体どうやって一つの個体として統率しているのか？』という至急諮問がPC2経由でPC5に寄せられる。\n\n`;

  // Day 6
  md += `### 【Day 6】三宅島〜伊豆大島沖 (約830 km) - 一時沈静化から終盤の再浮上へ ＆ 4大証拠の連鎖と8語新言語祝詞の完成・海自ソナー網装填\n\n`;
  md += `#### 1. 状況とプレイヤーができること\n`;
  md += `- **戦況推移**: 魚雷攻撃を警戒して物体は深海1,200mへ一時潜航。前半は微動が一時沈静化するも、終盤に駿河トラフ境界へ向けて急速に再浮上し、富士山微動が突如復活・激化（破局噴火まで残り24時間）。\n`;
  md += `- **東京班の夜間捜査による自動回収**: Day 5で選ばれなかった東京情報（謎のダイバーグループによる富士山麓への約30kg海底隕石の搬入特定 または 元神主子どもの口伝）が朝までに100%揃う。\n`;
  md += `- **4段階の開示ロジック（証拠の梯子）**:\n`;
  md += `  1. 【祝詞儀礼の存在】: 噴火や巨大生物出現時、神社では海へ出て祝詞を唱える儀式があった。\n`;
  md += `  2. 【海中筒の音響物理】: 水面での音響反射（インピーダンス不整合）を防ぐため、筒を海中に突っ込んで唱えていた。\n`;
  md += `  3. 【巨大イカ塊捕食の伝承】: 古文書に『巨大生物は隕石を追って海底火山を刺激する』『過去にもマッコウクジラを呼び寄せて巨大なイカの塊りを捕食させた』と記録。\n`;
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
  project.evidences.forEach((e) => {
    const owner = project.characters.find((c) => c.id === e.ownerId);
    md += `### [Day ${e.foundPhase}] ${e.title} (${owner?.name || "全員"})\n`;
    md += `- **ID**: \`${e.id}\`\n`;
    md += `- **カテゴリ**: ${e.category}\n`;
    md += `- **内容**: ${e.description}\n\n`;
  });
  md += `---\n\n`;

  // --- 第5章：クジラ言語・暗号マトリクス ---
  md += `## 🐋 第5章：クジラ言語・暗号マトリクス（8語新言語祝詞の体系）\n\n`;
  md += `### 5-1. 単語リスト（11語）\n`;
  project.crypticWords.forEach((w) => {
    md += `- **[${w.symbol}] ${w.meaning}** (\`${w.id}\` / ${w.audioFrequency}Hz / ${w.clickPattern.length}連打): ${w.description}\n`;
  });
  md += `\n`;
  md += `### 5-2. 完成メッセージ文法ルール\n`;
  md += `- **正解シーケンス**: [人間] ➔ [クジラ] ➔ [約束] ➔ [海の下の火山] ➔ [北に向かう] ➔ [探せ] ➔ [巨大な餌] ➔ [集まれ]\n`;
  md += `- **完成文面**: 『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』\n`;
  md += `- **文法解説**: 太古の盟約の証である「人とクジラの約束」を冒頭に提示し、怪異が潜む「海の下の火山を北へ探せ」という位置・行動指示を与え、最後に「巨大な餌に集まれ」という本能的捕食号令で太平洋全域のクジラ群を駿河湾へ集結させる3部構成。\n`;

  return md;
}
