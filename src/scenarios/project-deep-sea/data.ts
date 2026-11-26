import { sonarWords } from "./sonarWords";
import { scenarioAssetUrl } from "@/scenarios/catalog";
/**
 * MM-Workbench - 初期プロジェクトデータ
 * 汎用的なインシデント対策・非対称情報型ミステリー構造
 */

import { MMProject, NagatsuPhaseCard, SpecialCharacterCard, VisualBoardItem } from "@/types/schema";

const sonarWordSources = {
  "word-gather": { assignedCharId: "pc-5", clueSource: "海野教授ノート・群合流コーダ" },
  "word-alert": { assignedCharId: "pc-5", clueSource: "海野教授ノート・危険警戒コーダ" },
  "word-enemy": { assignedCharId: "pc-5", clueSource: "海野教授ノート・外敵検知コーダ" },
  "word-flee": { assignedCharId: "pc-5", clueSource: "海野教授ノート・緊急退避コーダ" },
  "word-child-feed": { assignedCharId: "pc-5", clueSource: "海野教授ノート・幼鯨授乳要求音" },
  "word-child-here": { assignedCharId: "pc-5", clueSource: "海野教授ノート・幼鯨位置発信コーダ" },
  "word-adult-here": { assignedCharId: "pc-5", clueSource: "海野教授ノート・成鯨位置発信コーダ" },
  "word-human": { assignedCharId: "pc-6", clueSource: "祝詞巻物・人音の点刻記号" },
  "word-whale": { assignedCharId: "pc-6", clueSource: "祝詞巻物・鯨神の点刻記号" },
  "word-you": { assignedCharId: "pc-5", clueSource: "海野教授ノート・対称呼びかけコーダ" },
  "word-promise": { assignedCharId: "pc-6", clueSource: "祝詞巻物・盟約の誓記号" },
  "word-go-east": { assignedCharId: "pc-2", clueSource: "音響航法方位コーダ（東）" },
  "word-go-west": { assignedCharId: "pc-2", clueSource: "音響航法方位コーダ（西）" },
  "word-go-north": { assignedCharId: "pc-2", clueSource: "音響航法方位コーダ（北）" },
  "word-greet": { assignedCharId: "pc-5", clueSource: "海野教授ノート・遭遇挨拶コーダ" },
  "word-subsea-volcano": { assignedCharId: "pc-4", clueSource: "気象観測所・海底火山音響ログ" },
  "word-calf": { assignedCharId: "pc-5", clueSource: "海野教授ノート・幼鯨呼称コーダ" },
  "word-giant-prey": { assignedCharId: "pc-3", clueSource: "大獲物のクリック音" },
  "word-normal-prey": { assignedCharId: "pc-5", clueSource: "海野教授ノート・通常捕食コーダ" },
  "word-attack": { assignedCharId: "pc-5", clueSource: "海野教授ノート・攻撃号令コーダ" },
  "word-search": { assignedCharId: "pc-5", clueSource: "海野教授ノート・索敵行動コーダ" },
  "word-ack": { assignedCharId: "pc-5", clueSource: "海野教授ノート・肯定応答クリック" },
  "word-human-whale": { assignedCharId: "pc-6", clueSource: "祝詞巻物・人と鯨の複合点刻記号" },
  "word-go-northeast": { assignedCharId: "pc-2", clueSource: "音響航法方位コーダ（北東）" },
  "word-go-northwest": { assignedCharId: "pc-2", clueSource: "音響航法方位コーダ（北西）" },
  "word-place-ogasawara": { assignedCharId: "pc-5", clueSource: "海野教授ノート・小笠原海域コーダ" },
  "word-place-hachijojima": { assignedCharId: "pc-5", clueSource: "海野教授ノート・八丈島海域コーダ" },
  "word-place-mikurajima": { assignedCharId: "pc-5", clueSource: "海野教授ノート・御蔵島海域コーダ" },
};

/**
 * 全体提示される地図・写真（印刷専用・タイムライン各Day網羅）
 */
export const initialVisualBoards: VisualBoardItem[] = [
  {
    id: "vis-day0-eruption-portrait",
    title: "【Day 0】伊豆・小笠原諸島 広域監視海図（白地図・プレイヤー書き込み用）",
    subtitle: "CHART NO. V-2024-PORTRAIT / A3・A4縦置き想定（上：本州・富士山 ／ 右下：父島・西に西之島）",
    boardType: "day0_eruption_portrait",
    dayNumber: 0,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day0.svg"),
    orientation: "portrait",
  },
  {
    id: "vis-day1-white",
    title: "【Day 1】小笠原南西海域 航海用海図（白地図・プレイヤー提示用）",
    subtitle: "CHART NO. W-2704 / SOS発信位置・父島・南島（※暗礁非表示）",
    boardType: "day1_map_white",
    dayNumber: 1,
    imageUrl: scenarioAssetUrl("releases/images/day1_nautical_chart_white.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day1-gm",
    title: "【Day 1】小笠原南西海域 航海用海図（GM解析図・解答ベクトル入り）",
    subtitle: "風圧流1.5kt ＋ 黒潮支流2.0kt ＝ 東北東2.5kt 合成漂流予測",
    boardType: "day1_map_gm",
    dayNumber: 1,
    imageUrl: scenarioAssetUrl("releases/images/day1_nautical_chart_gm.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day2-aerial",
    title: "【Day 2】羽田航空基地 MA722 緊急航空偵察写真",
    subtitle: "西之島北西海域・水深10〜20m急浮上時の巨大影",
    boardType: "aerial_photo",
    dayNumber: 2,
    imageUrl: scenarioAssetUrl("releases/images/aerial_recon_wide.jpg"),
    orientation: "landscape_rotated",
    hasWhiteMargin: true,
  },
  {
    id: "vis-day3-tactical",
    title: "【Day 3】鳥島沖 洋上ソナー索敵作戦図（36セクター索敵盤・プレイヤー提示用）",
    subtitle: "CHART NO. W-3100 / A-1〜F-6 セクター別音響索敵ワークシート",
    boardType: "day3_tactical",
    dayNumber: 3,
    imageUrl: scenarioAssetUrl("releases/images/day3_sonar_tactical_chart.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day3-tactical-gm",
    title: "【Day 3】鳥島沖 洋上ソナー索敵作戦図（GM解析図・目標位置＆熱水障害圏入り）",
    subtitle: "CHART NO. W-3100-GM / 潜航目標現在位置（B-3）＋周囲8マス探知圏 ＆ 音響障害3箇所（D-2・C-5・E-5）",
    boardType: "day3_tactical_gm",
    dayNumber: 3,
    imageUrl: scenarioAssetUrl("releases/images/day3_sonar_tactical_chart_gm.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day3-photo",
    title: "【Day 3】洋上ソナー索敵撮影写真（近接浮上・索敵成功時）",
    subtitle: "直下ソナー探知成功に伴い海面直下へ浮上した巨大群体の光学撮影記録",
    boardType: "day3_photo",
    dayNumber: 3,
    imageUrl: scenarioAssetUrl("releases/images/day3_sonar_success_photo.jpg"),
    orientation: "landscape_rotated",
    hasWhiteMargin: true,
  },
  {
    id: "vis-day3-photo-failure",
    title: "【Day 3】洋上ソナー索敵撮影写真（遠距離・索敵失敗時）",
    subtitle: "直下捕捉に至らず、遠方の海面にわずかな航跡・白波のみを捉えた記録写真",
    boardType: "day3_photo_failure",
    dayNumber: 3,
    imageUrl: scenarioAssetUrl("releases/images/day3_sonar_failure_photo.jpg"),
    orientation: "landscape_rotated",
    hasWhiteMargin: true,
  },
  {
    id: "vis-day3-eruption-portrait",
    title: "【Day 3】伊豆・小笠原火山弧 全域火山活動監視図",
    subtitle: "CHART NO. V-2024-P3 / A3・A4縦置き（西之島〜鳥島沖海底カルデラ噴火フロント）",
    boardType: "day3_eruption_portrait",
    dayNumber: 3,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day3.svg"),
    orientation: "portrait",
  },
  {
    id: "vis-day4-eruption-portrait",
    title: "【Day 4】明神礁 連動大噴火 ＆ 地震観測図",
    subtitle: "CHART NO. V-2024-P4 / A3・A4縦置き（噴火ドミノ北上・八丈島群発微動）",
    boardType: "day4_eruption_portrait",
    dayNumber: 4,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day4.svg"),
    orientation: "portrait",
  },
  {
    id: "vis-day4-shrine-chronicle",
    title: "【Day 4】小笠原社記（抄）",
    subtitle: "小笠原神社社蔵 / 享保十二年水無月 海底噴火と海鳴り・海中筒祈礼と鯨来襲の古文書原本",
    boardType: "day4_shrine_chronicle",
    dayNumber: 4,
    imageUrl: scenarioAssetUrl("releases/images/day4_shrine_chronicle.svg"),
    orientation: "landscape_rotated",
    hasWhiteMargin: true,
  },
  {
    id: "vis-day5-eruption-portrait",
    title: "【Day 5】御蔵島沖海底噴火 ＆ 富士山地下火山性微動観測図",
    subtitle: "CHART NO. V-2024-P5 / A3・A4縦置き（破局噴火まで残り48時間・伊豆大島微動観測）",
    boardType: "day5_eruption_portrait",
    dayNumber: 5,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day5.svg"),
    orientation: "portrait",
  },
  {
    id: "vis-day5-tokyo-search-map",
    title: "【Day 5】東京都内 広域捜索図（東京都心〜東京湾岸地域）",
    subtitle: "MAP NO. T-501 / 東京都内（江東区・千代田区・外神田・永田町・北の丸公園・上野・品川・竹芝桟橋）",
    boardType: "custom_image",
    dayNumber: 5,
    imageUrl: scenarioAssetUrl("releases/images/day5_tokyo_search_map.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day5-chichijima-search-map",
    title: "【Day 5】小笠原諸島・父島 現地調査図（二見湾・父島全域）",
    subtitle: "MAP NO. F-502 / 小笠原諸島・父島（小笠原研究所・パパズドルフィン・展望台・神社・気象観測所・水産センター・海洋センター・二見港）",
    boardType: "custom_image",
    dayNumber: 5,
    imageUrl: scenarioAssetUrl("releases/images/day5_chichijima_search_map.svg"),
    orientation: "landscape_rotated",
  },
  {
    id: "vis-day6-eruption-portrait",
    title: "【Day 6】巨大生物の完全回復・駿河トラフ北上再開 ＆ 富士山地下微動再開図",
    subtitle: "CHART NO. V-2024-P6 / A3・A4縦置き（朝8時回復・駿河トラフ境界へ北上再開・駿河湾到達まで24時間）",
    boardType: "day6_eruption_portrait",
    dayNumber: 6,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day6.svg"),
    orientation: "portrait",
  },
  {
    id: "vis-day7-eruption-portrait",
    title: "【Day 7】駿河湾付近への目標接近 ＆ 富士山地下火山性微動継続・最終決戦監視図",
    subtitle: "CHART NO. V-2024-P7 / A3・A4縦置き（駿河湾付近接近・水深600〜1,000m・マッコウクジラ大群集結）",
    boardType: "day7_eruption_portrait",
    dayNumber: 7,
    imageUrl: scenarioAssetUrl("releases/images/eruption_monitoring_chart_portrait_day7.svg"),
    orientation: "portrait",
  },
];

export const initialProject: MMProject = {
  id: "project-deep-sea",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-14T17:58:00.000Z",
  visualBoards: initialVisualBoards,
  title: "燃える海を渡る声",
  subtitle: "",
  concept:
    "現代日本の公的機関・合同対策本部を舞台に、日常の海難事故から始まり、海底火山の連続噴火と深海を北上する未確認巨大群体による日本破局噴火の危機へと段階的に侵食されていく、完全協力型インシデント・ミステリー。海上保安庁東京本部と小笠原現地の非対称な情報（大局的・制度的データ vs 生々しい現場感覚）を融合させて極限の事態に挑むパニックサスペンス。",
  targetExperience:
    "・リモート通信で結ばれた海上保安庁東京本部（海保・防衛省・気象庁）と小笠原現地（巡視船船長・潜水士・海洋生物学者）が、それぞれの専門知見を持ち寄り緊迫した危機を乗り越えるリアルタイム対策本部体験。\n・4段階の開示ロジック（祝詞儀礼の存在 ➔ 海中筒の音響物理 ➔ 古代のイカ塊捕食伝承 ➔ 海野ノートのクジラ言語）により、プレイヤー自身の手で謎が必然的に解き明かされていく知的興奮。\n・通常兵器（自衛隊魚雷）単独では再結合を許してしまう絶望に対し、「防衛省・自衛隊との極限交渉（潜水艦SOFAR層潜航・実弾攻撃抑制）」×「深夜の人工音源大出力放流と生体ソナー（エコーロケーション）で巨大生物を探知するマッコウクジラ群の深海大捕食」を組み合わせ、太古の盟約と科学の力で日本を救うカタルシス。\n・6人全員の知見（音響波形、祝詞口伝、古文書、海図、軍事ソナー、生物解剖）が揃わなければ絶対に完成しない完全協力型の情報統合パズル構造。",
  plotSummary:
    "【発端】古くから小笠原・八丈島・三宅島にはある程度の隕石が降っており、それぞれの島の神社に御神体（祀り石）として保管・奉納されていた。さらに1ヶ月前、小笠原諸島で見られた流星雨を登場人物全員が現地で目撃し、海上保安庁東京本部の危機管理官（PC1）のみが海岸で小さな隕石の欠片を拾って東京へ持ち帰っていた。同時に小笠原近海の海底には、海から引き揚げて箱に入れられる程度（重さ約30kg規模）ながら、隕石としては十分に大きな塊が沈んでいた。\n\n【事件（Day 1）】民間チャーター船（40t）が全電源喪失。AIS停波・衛星死角の中、海流（東へ2kt）と南西強風による風圧流（北東へ1.5kt）の合成計算から漂流地点を割り出し、暗礁手前で救助成功。船長『巨大生物を見た』vs 謎のダイバーグループ『魚の調査サンプルだ』と証言が食い違い、ダイバーたちは約30kgのずっしり重いプラスチック製大型冷凍ボックスを持ち去る。\n\n【展開（Day 2〜Day 4）】西之島海底火山の突発的連動噴火。水深800m以深を時速約6km（日速約150km / 3.3ノット）で北上する全長数百mの巨大な影を捕捉。この巨大生物は海底付近で【海底地震を起こすような特別な振動】を発生させ、それが海底火山を次々と刺激して噴火させていた。Day 3洋上ソナー索敵作戦（鳥島沖）とヘリ航空偵察により、単一生物ではなく無数の触手が融合した【超巨大群体（コロニー）】と判明。Day 4明神礁（海底火山）噴火と八丈島群発微動。日速150kmで北上する火山フロントが数日後に【富士山直下】へ到達し破局的大噴火を誘発する絶対的危機が発覚。調査の結果、巨大生物が北上できる理由は【①地磁気】と【②隕石が放つ特殊な物質】の2つであり、もともと小笠原・八丈島・三宅島の神社に保管・奉納されていた隕石が組織的に盗み出され、西之島・青ヶ島沖・八丈島付近・三宅島付近の海へ順番に落とされていた（飛び石状の誘導）ことが判明！ そして謎のダイバーグループが引き揚げた約30kgの冷凍ボックスの送り先は『静岡県・富士山麓の民家』と特定される。また小笠原神社の記録から、かつて巨大生物を鎮めた『盟約の祝詞』が存在し、海上で海中筒を用いて海中へ直接唱える作法であることが判明。防衛省は内閣法制局の壁を突破し、『害獣駆除名目』での海上自衛隊緊急動員を決定。\n\n【転換とソナー観測報告（Day 5）】御蔵島沖噴火に伴い、富士山地下深部で火山性微動が開始。駿河湾までの残距離240km・時速5kmから残り48時間の猶予を算出。防衛省は作戦を最高軍事機密指定し情報遮断。その後、八丈島〜御蔵島沖で海自の魚雷群が命中したと思われるが目標の活動停止は不明。目標特有の振動が起きておらず火山性微動も一時収まったが、アクティブソナー（ソナー探知）では【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認される。防衛省作戦本部より『上層部はさらなる魚雷の飽和攻撃で殲滅できると主張しているが疑問が残る。あいつらはどうして魚雷の命中後に復活してしまうのか？ なぜ富士山を目指すのか？』という緊急意見照会が寄せられる。\n\n【完全回復・北上再開と前夜スタンバイ（Day 6）】朝8時の時点で巨大生物がほとんど同じ大きさまで回復し、駿河トラフ境界に向けて北上を再開。それにあわせて富士山地下の火山性微動が再開し、駿河湾までは24時間ほどで到達する見込みとなる。東京班の徹夜捜査により未回収資料と海野教授の実録音響データが全開示。元神主遺族（吉備津）の口伝と初瀬の『神社の祝詞の複製』から、祝詞の神髄は喉の声ではなく『舌を弾く吸着破裂音（クリック音）』であり、伝統の祝詞が『人と勇魚、契り、小笠原へ、集ひ来よ、大獲物ぞ、集ひ来よ』（2語成語×3組）であると判明。そのままではクジラが小笠原へ集まってしまうため、海野教授のノートから2語成語を単位とするコーダ構文規則を解読し、新言語祝詞（『【人間とクジラ・約束】【海の下の火山・探せ】【北・集まれ】【大きい・たくさんの餌・攻撃せよ】』等）の音声信号が完成。長津の親戚（叔父）である防衛省運用企画局長・岸部（きしべ）との直通ホットラインを繋ぎ、通常兵器の限界と火山刺激リスク、深海1,000mのSOFAR層での人工音源の大出力放流、そしてクジラ集結にかかる移動時間（6〜8時間）を突きつけて説得！ 第1潜水隊群の潜水艦による深海SOFAR層からの事前放流と『翌朝の実弾攻撃抑制・待機』を合意させる。\n\n【決戦と解決（Day 7）】夜明けを迎え、現状も富士山地下の火山性微動は継続しており、目標は水深600〜1,000mを維持して駿河湾付近まで接近。海自潜水艦部隊が合意通り攻撃を抑制して待機するなか、昨夜から放流された祝詞に応え、夜を徹して太平洋を泳いできたマッコウクジラの大群（100頭以上、後続1,000頭近く）が駿河湾深海へ到達！ クジラたちは生体ソナー（エコーロケーション）で巨大生物を探知し、本能のまま深海へ一斉潜航・大捕食を敢行。巨大生物は大幅に縮小して消滅し、富士山地下深部の火山性微動は完全停止し、自衛隊は一発の実弾も撃たず発射中止（スタンドダウン）。直後、防衛省幹部から『功績を秘匿して自衛隊が撃滅したと発表するか、対策本部が機転を効かせて解決したヒーローとして公表するか選んでほしい。いずれにしても君たちが正しかった、感謝する』との入電。選択に応じた臨時ニュースを見届け、真実を知るメンバーたちは誇りを胸に日常へと帰還する。",
  gimmickOverview:
    "① 生態系の天敵（マッコウクジラ vs ダイオウイカ）を巨大生物撃退に転用する生物学的逆転の発想。\n② 巨大生物が海底火山を刺激する理由（海底付近で海底地震を起こすような特別な振動を発生させる）と、長距離を北上できる理由（①地磁気 ＋ ②小笠原・八丈島・三宅島の神社から組織的に盗まれ、青ヶ島沖・八丈島・三宅島付近に落とされた複数の隕石が放つ特殊な物質、および富士山麓へ運ばれた荷物）の論理的な解明。\n③ 自衛隊との極限交渉（潜水艦SOFAR層潜航・実弾攻撃抑制）× 深夜事前放流に応えたクジラ大群の深海完全捕食。\n④ 動物言語学（2語成語ペア連結モデル）に基づき、祝詞の吸着破裂音（舌クリック音）とマッコウクジラのコーダを融合させた祝詞クリック音列パズル（参考例：【人間とクジラ・約束】【海の下の火山・探せ】【北・集まれ】【大きい・たくさんの餌・攻撃せよ】）。\n⑤ 竹の海中筒による音響インピーダンス整合の歴史的伝承を、現代の海上自衛隊潜水艦による深海SOFAR層からの水中スピーカー（水中音響送信機）大出力放流へと昇華させる科学的スケール感。\n⑥ 政治的落としどころと名もなき英雄（アンサング・ヒーロー）：自衛隊による事後攻撃と政府の英雄報道を背に、真実を胸に日常へ帰還する6人の誇り高きエピローグ。",
  playerCount: 6,
  durationHours: 3,
  hasGm: true,

  characters: [
    {
      id: "pc-1",
      name: "朝潮（あさしお）",
      profession: "海上保安庁東京本部の危機管理官",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "headquarters",
      introduction:
        "　あなたは海上保安庁の東京本部の災害時などの緊急事態に即応する危機管理官だ。海上保安庁は海上での犯罪取り締まりや人命救助、海洋調査や海上交通と管理や整備を行う国土交通省の一部門だ。あなたの部門は特に海難事故や海上犯罪の摘発などの現場での対応を指揮する司令塔になっている。\n　1ヶ月前の小笠原出張中、満点の夜空に無数に流れる流星雨を目撃した。その際、大きな音と共に海岸に落ちた黒い小さな隕石の欠片を見つけた。あなたはこれを東京へ持ち帰り、執務室の机の奥に大切にしまっている。\n　本日、突如小笠原南方の海上で発生した民間チャーター船の全電源喪失事故の救難警報を受信し、小笠原現地との緊急合同対策本部を開設した。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile:
          "海上保安庁東京本部の総指揮官。冷静沈着で状況の把握と適切な公的機関や協力者との連携を行い、必要な判断を下す。災害などの緊急対応の経験を持つ。",
        internalDrama: {
          pride:
            "　国家と市民の安全を守る危機管理の責任者としての誇りを持つ。現在利用可能な人・物・情報を考えつつ、自分自身は専門家ではないため頭を下げて協力を依頼することもためらわずに行う。",
          loss: "　過去の船上火災の災害対応時に、現場に送った職員が犠牲になってしまった。そのときの判断が間違っていたかもしれないという責任を感じている。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「海上保安庁、東京本部の危機管理官の朝潮（あさしお）だ。本日より小笠原現地と東京を繋ぐ合同対策本部の指揮を執る。必要な情報は各自から集めるが、現場からの情報をあわせて必要な支援を追加で送ることもできる。不測の事態が起きても責任はこちらで取れるよう連携を密にしてほしい。人命救助は初動が重要だ。協力をよろしく頼む。」",
      },
    },
    {
      id: "pc-2",
      name: "貝浜（かいはま）",
      profession: "情報通信・音響分析官（防衛省リエゾン）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "headquarters",
      introduction:
        "　あなたは海上保安庁（海保）と防衛省の海上自衛隊を繋ぐ連絡役（リエゾン）であり、衛星通信・深海ソナー解析のスペシャリストである。あなたは海上自衛隊からの出向であるため、「海上自衛隊という軍事力の使用には非軍人の代表である内閣総理大臣の指揮が必要」だということをよく理解している。さらに非常時には海上保安庁から迅速に海上自衛隊へと連携する必要がある。\n　あなたは天体ショーとよく言われる日食や月食、流星雨を見にいくのが趣味だ。先日も1ヶ月前に一週間ほど休暇を取り、地元では曇るという予報を受けて、確実に流星雨を見るために小笠原諸島までやってきた。東京の浜松町から船に乗ること25時間程度、同じ東京ながら1000km離れた小笠原諸島で流星雨をたっぷりと堪能することができた。同時に小笠原諸島の美しさにも心を奪われた。\n　本日、遭難発生の緊急通信を受け、危機管理官への報告を行いその場で東京本部としてチーム編成された。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile:
          "海上保安庁東京本部の通信担当者。防衛省から出向しており、海上自衛隊との間の連絡役（リエゾン）も受け持つ。",
        internalDrama: {
          pride:
            "　深海ソナー探知をはじめ、各種の通信機器への信頼とその分析に自信を持っている。\n　海上保安庁（海の警察）と海上自衛隊（海の防衛戦力）との線引きをわきまえて行動する。",
          loss: "　以前海上自衛隊側への正確さが求められる報告において、スピードを優先したために連携がうまくいかず、「もしもこれが有事の際であればお前の判断で部下は死んでいるぞ」と叱責された経験がある。スピードを求められることの多い職場の中で、複数人で確認をすることで正確さを確保したいと考えている。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「防衛省から出向している情報通信・音響分析官の貝浜（かいはま）です。皆さんに現場海域の情報をお伝えします。東京側にいますが、私も先日小笠原を訪れたばかりです。一緒に海難救助を成功させましょう！」",
      },
    },

    {
      id: "pc-3",
      name: "坂凪（さかなぎ）",
      profession: "海上保安庁小笠原支部　巡視船船長",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "　あなたは海上保安庁の巡視船の船長であり、小笠原の海を知り尽くしたベテランのダイバーでもある。海難救助の特別な訓練も受けており、心肺蘇生やAEDなどの救命救急活動にも習熟した、今回の海難救難隊の現場リーダーだ。海上・海中での経験が長く、特に海難救助では初期段階で正しい判断を下す必要があることを痛感している。\n　小笠原の海で亡くなったあなたの姉は、白いクジラの子どもとよく一緒に泳いでいて、クジラと挨拶ができるといってクジラの声の真似（ズジーズズ）をして自慢していた。姉が亡くなってからしばらくは、あなたの姉が乗っていた船のまわりに白いクジラがやってきていた。あの個体はもしかすると本当に賢くて姉と会話をしていたのかもしれない。\n　少し調べてみると、クジラの中でマッコウクジラだけは深海に潜り、そこで眠ったり餌をとるようだ。餌は中型から大型のイカが中心になっている。しかし、一般に白いクジラは目立つために敵に見つかりやすく、よほど賢くなければ生き延びることはできないようだ。\n　1ヶ月前、島で他のメンバーとともに満天の星から降り注ぐ流星雨を眺めて楽しんだ。\n　本日の緊急救難信号の受信を受けた海上保安庁東京本部からの指令を受けて、直ちに荒天の海へ巡視船を出航させる準備を整えた。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile:
          "海上保安庁の巡視船船長。船長としての経験だけでなく、海難救助のプロフェッショナルでもある。",
        internalDrama: {
          pride:
            "　小笠原出身の海上保安庁職員として、この海のことは誰よりもよく知っているという一方、荒れた海や台風による怖さを何度も経験している。",
          loss: "　あなたは姉をこの海のダイビングの事故で亡くしている。姉が大好きだったこの海での事故を一つでも減らしたいと願っている。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「海上保安庁小笠原支部の救難担当官、坂凪（さかなぎ）です。巡視船の船長として、現地の救難部隊の指揮を執ります。私はここ小笠原で生まれ育ち、この海の美しさも、その恐ろしさも誰よりも知っています。現在海域は荒れていますが、東京本部としっかり連携し、一人残らず必ず救出してみせます。現場の対応は私に任せてください！」",
      },
    },
    // PC4: 純粋な海洋・気象観測員（6人プレイ本編用）
    {
      id: "pc-4",
      name: "太刀魚（たちうお）",
      profession: "気象庁 小笠原観測所 職員",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "　あなたは気象庁の小笠原観測所で働く気象・海洋・火山観測の専門員だ。この太平洋上に浮かぶ小笠原観測所は、台風や波の強さなどが他の地域と連動するため非常に重要な拠点となっている。また数年前に噴火して新しい島となった西之島周辺の海底火山など、火山の動きを定期的に監視することも欠かせない。\n　また、あなたの生まれた環境は少し特殊だ。あなたの両親は耳が聞こえない障害を持っている。両親とは違いあなた自身は話すことができるため、子どもの頃から手話と音声会話とが両方できるあなたは両親と他の大人との間の通訳をしてきた。それは海洋科学研究所のある教授から「コーダ（CODA；耳の聞こえない大人たちの子ども）」という役割なのだと言われていた。\n　1ヶ月ほど前、日本の本州付近が曇りとなった一方、あなた達が出した「小笠原は晴れるので流星雨の観測に最適」という情報が天文マニアを中心に大きな話題となり、多くの新たな観光客がやってくることにつながった。\n　本日、遭難事故の発生を受け、海上保安庁からの要請で海難救助の現地チームとして参加している。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile:
          "気象庁に所属する現場観測したデータを取得・分析する観測員。連携先とのコミュニケーションを大事にしている。",
        internalDrama: {
          pride:
            "　海洋・火山の情報は常に変わり続けるため、常に一歩先を考える必要がある。気象庁公式からの数値の報告だけでは人は動かない。",
          loss: "　過去の台風の接近に伴って島民に避難指示をしたが、具体的指示が伝わりにくく被害を大きくしてしまった。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「気象庁・小笠原観測所の観測員、太刀魚（たちうお）です。現場海域の海流や風速などのリアルタイムデータを分析してお渡しします。海の状況は刻一刻と変化するため、一歩先を見越して次々と最新情報をお伝えしていくことになるかと思いますが、救助に直結する生きた情報となるよう全力を尽くします。ご協力をよろしくお願いします！」",
      },
    },
    {
      id: "pc-5",
      name: "浪寄（なみより）",
      profession: "海洋科学大学 小笠原研究所 准教授",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "　あなたは海洋科学大学 小笠原研究所の准教授であり、深海生物の生態やクジラやイルカなどの動物行動学の研究を続けてきた。大学の恩師でもある海野（うみの）教授とは、クジラに言語があるという説を検証しようとして失敗する一方、あなたは深海生物の新種を見つけて評価されていた。しかし深海は特殊な環境であるため、新種が見つかっても何を食べ、どのように繁殖しているのかといった生態を記録することは難しく、あなたの研究は停滞している。\n　海野教授は数年前に海の事故で亡くなってしまい、研究は完成していない。彼は優秀なダイバーでよく海に潜っており、クジラの顔の近くに深海でダイオウイカを捕食したときの傷があったと報告していた。小笠原の深海には、ダイオウイカだけでなく巨大な未確認生物がまだまだいるのかもしれない。\n　1ヶ月ほど前に、小笠原の夜空に降り注いだ流星雨を見た。ずっと昔、海野教授と流星雨を見たとき、あの時、教授は「君は私の研究ではなく自分の研究分野でまず成功しなさい」と言い渡されていたのを思い出した。教授は、自分の研究がこれ以上の成果につながらないと考えていたようだった。\n　今回、救難信号の中に「スクリューに絡まったのは深海生物かもしれない」という情報があり、ボランティアとして協力を申し出た。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile:
          "海洋科学大学 小笠原研究所の研究者。深海生物の生態学や海棲哺乳類の動物行動学のスペシャリスト。",
        internalDrama: {
          pride:
            "　小笠原付近で新種の深海生物を発見、論文発表をして自分の名前を学名につけることができた。さらに深海の生き物の生態を調べたい。",
          loss: "　同じ大学の恩師の動物行動学の研究が証明できないでいるうちに、海の事故で亡くなってしまった。もっと教えを乞いたかった。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「海洋科学大学の小笠原研究所で准教授をしております、浪寄（なみより）です。普段は、小笠原のイルカ・クジラや深海生物のことを研究しています。今回の遭難船に深海生物が関わっている可能性があり、皆さんの救助活動にご迷惑をかけない形で参加させてもらいます。私も海難救助活動の経験もありますので協力できます。どうぞよろしくお願いします」",
      },
    },
    {
      id: "pc-6",
      name: "初瀬（はつせ）",
      profession: "小笠原役場勤務（救護担当）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "　あなたは小笠原諸島父島の旧家の家系だ。かつては東京でも災害救助などの活動に従事していた経験があり、その後島に戻って現在は小笠原役場に勤めている。古くから島を守ってきたという家の伝統があり、島の神社とのつながりも深い。\n　あなたは幼い時に海の事故・<ruby>離岸流<rt>りがんりゅう</rt></ruby>によって沖に流されてしまったことがある。そのとき、白いクジラの子どもがあなたを岸近くまで押して連れ帰ってきた経験がある。大人たちは信じてくれなかったが、それ以降白いクジラは明らかに海で泳ぐあなたを認識しているようだった。この白いクジラは、他のクジラと違って明らかに知能が高いとあなたは感じている。こうした知能の高い個体はやがて群れのリーダーになると言われている。\n　海難救助が起きた場合には、島に専門の救命救急病院がないことから救護担当として活躍しており、応急処置や心肺蘇生・AEDなどの救命救急活動の経験が豊富だ。また、あなたは心肺蘇生やAEDの使用だけでなく、「声かけ」が大事だということを直観的に知っている。具体的には、名前を呼びかけ、「戻ってこい」「まだ死ぬな」という言葉がけが、意識のないはずの人間の耳には作用すると信じている。\n　1ヶ月前、島の夜空に降り注ぐ流星雨を目撃した。ただの天体ショーだろうが、島に住む人間には良くない兆しだと伝わっているようだ。\n　また、最近になって八丈島・三宅島の神社に古くから奉納・保管されていた『祀り石』が何者かに盗み出される事件が相次いでおり、注意喚起を受けている。この祀り石は以前専門家に調べてもらったところ、もともと隕石だっただろうといわれているが、金銭的な価値はないようなので奇妙だと感じている。\n　今回、海上保安庁からの要請で救護活動の担当者としてチームに加わっている。",
      initialItems: [],
      capabilities: [],
      handout: {
        publicProfile: "温和で献身的な救護担当者。島の伝統や神事にも詳しい。",
        internalDrama: {
          pride:
            "　昔から続く家に生まれた責任感と人々を救助する使命感を持っている。新しい技術と古い歴史はあなたの中に息づいている。",
          loss: "　海が荒れていて救助の船を出せず、電話ごしに助けを求められていたにもかかわらず救助が間に合わなかった経験がある。\n　遠隔地であっても、スマートフォンなどを経由してその場の同乗者に指示を出し、声掛けをすればよかったという後悔が残る。",
        },
        backgroundTimeline: "",
        handoutBody:
          "「小笠原役場に勤務しており、今回のチームで救護担当を務めます初瀬（はつせ）です。普段から応急処置や初期救護の経験がありますので、海での負傷者や有毒生物との接触、意識不明の方が出た場合の救護対応は私に任せてください。今は一刻を争う状況です。現場の皆さん、そして東京本部と力を合わせて一人でも多く救い出しましょう！」",
      },
    },
  ],

  evidences: [
    {
      id: "ev-vessel-leeway-data",
      title: "遭難船スペックおよび風圧流データ",
      frontTitleHtml: "遭難船スペックおよび<br>風圧流データ",
      description: `　遭難した民間チャーター船（40t）の仕様書および現場海域の気象データ。
　40tの船体は風による風圧流（リーウェイ）により風下に流される。この重量の船体であれば、【風速の5％の速度】で流される。
　現地の風速（何ノットなのか）が必要になる。`,
      glossaryNote: `※風圧流（リーウェイ）とは：エンジンが止まった船などが、海面に出ている船体に風を受けることで、風下の方向へと押し流される現象のこと。\n※ノットとは：船や風・海流の速さを表す単位。「1ノット＝1時間に1海里（約1.85km）進む速さ」を意味する（例：2ノットで1時間流されると、海図の目盛りで2海里進む）。`,
      ownerId: "pc-1",
      foundPhase: 1,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 1: 朝潮（PC1）による遭難船スペック提示時",
    },
    {
      id: "ev-reef-chart",
      title: "暗礁海図",
      description: `　父島南西沖の暗礁の分布データ。この場所は海の下に大きな岩などがあり、船がその場所を通ると座礁して動けなくなってしまう。以下の2つの座標を中心とした半径約0.5海里（グリッド半マス分）の範囲には危険な暗礁群が連なっている。
・① 東暗礁群：【北緯27°04'N・東経142°09'E】周辺（SOS地点の真東・約3海里の海域／最浅水深3.2m）
・② 南東暗礁群：【北緯27°02.5'N・東経142°08'E】周辺（SOS地点の南東・約2.5海里の海域／最浅水深4.8m）
　もし遭難船が「海流（真東）」や「南東方向」へ流された場合、この暗礁帯に乗り上げて座礁してしまい、巡視船の接舷も困難となる。`,
      ownerId: "pc-3",
      foundPhase: 1,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 1: 坂凪（PC3）による暗礁海図照合時",
    },
    {
      id: "ev-ocean-buoy-current",
      title: "海洋ブイデータ",
      description: `　気象庁・海洋気象ブイによる実測表層流速データと現場海域の風速。
　現場海域の黒潮支流は【真東へ2.0ノット】で安定して流れており、風の影響とは独立して船を東へ押し流す主因となっている。
　また、現場海域の風速と風向は【南西側からの強風（約30ノット）】。船は風下である【北東方向】に流されている。
　船の大きさによって流される速度が違うため、船の大きさによる風圧流の割合（リーウェイ率）が必要だ。`,
      glossaryNote: `※海洋気象ブイとは：海に浮かべておき、その場所の風速・波の高さ・海流の速さなどを自動で測定して無線で送る観測装置のこと。\n※ノットとは：船や風・海流の速さを表す単位。「1ノット＝1時間に1海里（約1.85km）進む速さ」を意味する。\n※風圧流（リーウェイ）とは：エンジンが止まった船などが、船体に風を受けて風下の方向へと押し流される現象のこと。`,
      ownerId: "pc-4",
      foundPhase: 1,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 1: 太刀魚（PC4）による海洋ブイデータ提示時",
    },
    {
      id: "ev-temperature-front",
      title: "現場海域への航海所要時間データ",
      frontTitleHtml: "現場海域への<br>航海所要時間データ",
      description: `　あなたがこれまでの深海調査や海難救助協力で記録してきた、二見港から小笠原南西沖（遭難発生海域周辺）までの航海所要時間データ。
　現在の荒天・波浪状況下で巡視船が出港し、現場海域に到着するまでには【約40分】ほどかかる。
　救難信号の発信から現在までに経過した時間と合わせることで、巡視船が現場海域に到着する時点で遭難船が合計何時間（何分間）漂流しているかを推測できる。`,
      ownerId: "pc-5",
      foundPhase: 1,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 1: 浪寄（PC5）による現場海域への航海所要時間データ提示時",
    },
    {
      id: "ev-satellite-blindspot",
      title: "衛星状況報告書",
      description: `　静止気象衛星「ひまわり」は広域用のため解像度不足で小型船（40t）は視認不可。低軌道偵察衛星は軌道通過まで4時間かかる見込みで利用不能。全電源喪失でAIS（船体付属のGPS）も停波しており、衛星頼みの捜索は不可能と断定。
　しかし、現場海域の海流の速度と、船体が風によって流される速度が分かれば現在位置を特定できる。
　風の力と海流の力を合わせる【ベクトル合成（平行四辺形の法則）】は、二つの速度を地図上の方向として書き、そこから平行四辺形を描けば導き出せる。`,
      glossaryNote: `※AIS（自動船舶識別装置）とは：船の名前・現在位置・進む方向などを電波で自動的に発信し、周囲の船や海上保安庁に知らせる装置のこと（船の電源が落ちると発信も止まる）。\n※ベクトル合成とは：「海流に流される力」と「風に押される力」が同時に働くとき、地図上で2つの矢印から平行四辺形を描くことで、実際に船が進む方向と距離（対角線）を求める方法。`,
      ownerId: "pc-2",
      foundPhase: 1,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 1: 貝浜（PC2）による衛星・探査システム照会時",
    },
    {
      id: "ev-radio-fragment",
      title: "遭難無線ログ",
      description: `　救難信号途絶直前に海上保安庁が受信したノイズ混じりの微弱音声。
　『メーデー！メーデー！舵が効かない！【スクリューに何か深海生物のようなものが巻き付いて逃げ出せない！】真横から波（海流）を受けている！計器が全部――（激しいノイズで途絶）』。`,
      ownerId: "pc-6",
      foundPhase: 1,
      visibility: "shareable",
      category: "audio",
      acquisitionCondition: "Day 1: 初瀬（PC6）による救難無線ログ共有時",
    },
    {
      id: "ev-diver-box-photo",
      title: "大型冷凍ボックス",
      description: `　救助された2人のダイバー達は、酸素ボンベなどの装備は船に残したまま、魚釣り用の少し大型のプラスチック製冷凍ボックス（クーラーボックス）を抱えて巡視船に乗り込んできた。海から引き揚げて箱に入れられるサイズだが、【重さ約30kgほどのずっしりとした異常な重量感】があった。
　『もうダメかと思いました。船の下に何かいたみたいですね、ただの大型クジラですよ。この箱ですか？ 近辺での魚の生態調査で採集した魚が入っているんです。大変でしたがこれで目的のものが無事に収集できましたので、これ以上皆様にご迷惑をおかけすることはありません。助けていただき、本当にありがとうございました』
　容体が安定したとはいえ、専門の治療が必要になった彼らはお礼の言葉を伝え、緊急時のためのヘリコプターに乗り込んで箱と共に小笠原諸島を去っていった。`,
      ownerId: "pc-3",
      foundPhase: 1,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 1: 遭難船救助オペレーション成功時",
    },
    {
      id: "ev-captain-testimony",
      title: "船長の証言",
      description: `　救出された民間船「パパズドルフィン」船長からの事情聴取調書。
　『船は<ruby>二見港<rt>ふたみこう</rt></ruby>まで<ruby>曳航<rt>えいこう</rt></ruby>いただけますか。お客さんに怪我がなくて本当によかった。スクリューに何かが巻き付いて故障し、計器も電源も落ちてお手上げだったんだ。船の下に何かいたようだが、【あれはクジラなんかじゃないと思うねぇ。クジラなら潮吹きや潜水時の尾が見えるはずだが、そんな様子は一切なかった】んでね』
　『今日乗せたダイバーたちは【この1ヶ月前ぐらいから頻繁にダイブ】を繰り返していて手慣れた様子だった。すぐ帰ると言っていたよ。海は怖いねぇ、あとで神社にお参りしてくるよ』`,
      glossaryNote: `※曳航（えいこう）とは：故障して自力で動けなくなった船を、別の船がロープで引っ張って港まで運ぶこと。`,
      ownerId: "pc-6",
      foundPhase: 1,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 1: 救護所での事情聴取時",
    },
    {
      id: "ev-sonar-shadow",
      title: "水中聴音（ソナー）データ",
      description: `　防衛省の水中聴音網（パッシブソナー網）の探知ログの照会。
　この生物は自ら周期的な振動をしており、海中に重低音が響いていることが分かった。複数拠点に設置されている水中聴音網（パッシブソナー網）により、水中物体の位置と移動方向が推定できた。
　それによると、【水深800m以深を一定のペースで北上】する深海生物が伊豆・小笠原海溝沿いを移動中であると考えられる。`,
      glossaryNote: `※水中聴音網（パッシブソナー網）とは：自分からは音を出さず、海中に設置したマイクで「相手が出している音や振動」をじっと聞き取って位置や移動方向を探る装置のこと。`,
      ownerId: "pc-2",
      foundPhase: 2,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 2: 東京側アクション【T-1】実行時",
    },
    {
      id: "ev-evacuation-radio-log",
      title: "避難船舶の無線ログ",
      description: `　海上保安庁による西之島周辺避難船舶の交信記録。
　複数船舶より『噴火前に、見たこともないほど巨大な黒い生物の影が海中を移動していた。その後に西之島の噴火の煙が見えた』との入電が記録されていた。
　【巨大生物の通過が西之島の噴火に先行している】証言が複数ある。`,
      ownerId: "pc-1",
      foundPhase: 2,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 2: 東京側アクション【T-2】実行時",
    },
    {
      id: "ev-aerial-recon-report",
      title: "航空偵察レポート",
      description: `　海上保安庁の航空機「みずなぎ2号」による西之島周辺海域の航空偵察レポート。
　突発噴火に伴う海面の変色域（赤褐色）の拡大状況と、漂流する軽石筏の分布を撮影・記録。
　上空からの目視観測において、変色海域の縁辺部周辺に【長さ数十メートルに及ぶ黒い帯状の影】が波を立てながら動いていたとの観測員所見が付記され、水深10〜20mと見られる巨大な影と、明瞭な航跡波（ケルビン波）を撮影した写真が確認できた。`,
      glossaryNote: `※軽石筏（かるいしいかだ）とは：海底火山の噴火で浮き上がった大量の軽石が、海面に集まってイカダのように漂っているもの。\n※航跡波（ケルビン波）とは：船や巨大な物体が水面近くを進むときに、後ろへV字型に広がる波のこと。`,
      ownerId: "pc-1",
      foundPhase: 2,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 2: 東京側アクション【T-3】実行時",
    },
    {
      id: "ev-propeller-tissue",
      title: "生体組織鑑定",
      description: `　スクリューによってちぎれた生体組織を確認すると、軟体動物特有の柔軟性のある筋肉組織と、大きな吸盤とその内側に特徴的なリング状の硬い歯（キチン質の爪状構造）が並んでいた。
　水深600m以深に生息する【ダイオウイカの触手】と特定。Day 1で船を襲いスクリューを止めた生物の正体であることが判明した。
　しかし、記録されている通常のダイオウイカ（全長十数m）では、スクリューを止めるほどの力を出すことは考えにくい。`,
      glossaryNote: `※キチン質とは：エビやカニの殻や、イカの吸盤のギザギザした歯などを作っている、硬くて丈夫な天然の物質のこと。`,
      ownerId: "pc-5",
      foundPhase: 2,
      visibility: "shareable",
      category: "sample",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-1】実行時",
    },
    {
      id: "ev-fisherman-guide-testimony",
      title: "漁船・観光船長の証言",
      description: `　<ruby>二見港<rt>ふたみこう</rt></ruby>での事情聴取。
　通常の成体マッコウクジラ（15〜18m）とは比較にならない規格外の巨大さであり、クジラ特有の潮吹きも一切確認されなかった。触手のようなものがあり、【推定では100m近く】はあったという。
　また、北へと向かっていることと、水中に入れたマイクから【クジラとは異なる重低音の鳴き声のようなもの】を発していることが確認できた。`,
      ownerId: "pc-3",
      foundPhase: 2,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-2】実行時",
    },
    {
      id: "ev-diver-trauma-record",
      title: "ベテランダイバーの証言",
      description: `　西之島周辺海域で潜水作業を行っていたベテラン潜水士からの事情聴取調書。
　西之島近海の水深40mから深海を見下ろした際、【巨大な黒い影の中で無数の触手のようなものがうごめき、絡み合っている異様な姿】を目撃。
　海中では音源の方向が特定しにくいものの、繰り返し【その巨体から内臓を揺らすような激しい振動を感じ、しばらくして西之島が噴火】したと証言している。`,
      ownerId: "pc-6",
      foundPhase: 2,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-3】実行時",
    },
    {
      id: "ev-moving-epicenter",
      title: "海底地震計・特殊振動解析",
      frontTitleHtml: "海底地震計・<br>特殊振動解析",
      description: `　気象庁小笠原観測所の地震計データ。
　西之島の噴火以前に海底のマグマの上昇や熱水の移動に伴う振動周波を検知。
　この振動周波は南から北に向かって線を引くように伸びており、【西之島周辺のマグマが南側から刺激されていた】ことが判明した。また、火山の噴火にともなって地震も検出されている。`,
      glossaryNote: `※火山性微動とは：普通の地震とは異なり、地下や海底のマグマや熱水が動くときに発生する「小刻みで長く続く地面の揺れ」のこと。噴火の前兆として観測される。`,
      ownerId: "pc-4",
      foundPhase: 2,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-4】実行時",
    },
    {
      id: "ev-tokyo-meteorite-analysis",
      title: "隕石片の調査",
      description: `　1ヶ月前の流星雨の際、朝潮危機管理官が小笠原の海岸で拾い東京へ持ち帰っていた小さな隕石片の精密分析。
　この隕石は【強い磁気特性】を持ち、さらに【海水に浸けることで隕石内の微量金属が溶出】することが判明。
　また、これまでに地球上に落ちてきた隕石とも共通点が多く見られる。`,
      ownerId: "pc-1",
      foundPhase: 3,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 3以降: 東京側アクション【T-3A】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-hachijo-tremor-analysis",
      title: "八丈島の火山性微動の調査",
      frontTitleHtml: "八丈島の<br>火山性微動の調査",
      description: `　八丈島・青ヶ島の地震計データと防衛省の水中聴音網（パッシブソナー網）の解析。
　防衛省の水中聴音網（パッシブソナー網）での巨大生物の位置と、地震計データによる火山性微動とは同じ場所で起きている。【巨大生物が海底で起こす特別な振動が、海底のマグマ溜まりを刺激】している可能性がある。
　物体は一定の北上ペースを正確に維持し、伊豆諸島沿いの海底を北上し続けている。`,
      glossaryNote: `※水中聴音網（パッシブソナー網）とは：自分からは音を出さず、海中に設置したマイクで「相手が出している音や振動」を聞き取って位置を探る装置のこと。\n※火山性微動とは：普通の地震とは異なり、地下や海底のマグマや熱水が動くときに発生する「小刻みで長く続く地面の揺れ」のこと。`,
      ownerId: "pc-2",
      foundPhase: 3,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 3以降: 東京側アクション【T-3B】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-hachijo-resident-and-sonar",
      title: "八丈島の島民からの聞き取り調査",
      frontTitleHtml: "八丈島の島民からの<br>聞き取り調査",
      description: `　八丈島・三宅島の神社に古くから保管・奉納されていた【隕石が、この一カ月の間に何者かによって組織的に盗み出されていた】と発覚。
　さらに【青ヶ島沖や八丈島付近の海へ不審船から海中へ何らかの物体を投棄】していた目撃証言も得られた。`,
      ownerId: "pc-2",
      foundPhase: 3,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 3以降: 東京側アクション【T-3C】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-ogasawara-meteorite-analysis",
      title: "小笠原気象観測所での落下隕石記録の調査",
      frontTitleHtml: "小笠原気象観測所での<br>落下隕石記録の調査",
      description: `　気象庁小笠原観測所の地質データ。
　古くから小笠原諸島周辺には同種の隕石が落下していた記録がある。
　さらに1ヶ月前の流星雨の目撃証言から、【父島南西沖に一際大きな光を放つ流星が落下】したと推定される目撃証言が複数確認できた。`,
      ownerId: "pc-4",
      foundPhase: 3,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 3以降: 小笠原側アクション【F-3A】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-shrine-curse-stone",
      title: "神社での調査",
      description: `　小笠原神社の聞き取り調査。【神社の倉庫に保管されていた隕石が組織的に盗み出されていた】ことが発覚（八丈島・三宅島でも同様の盗難）。
　また、神主からは神社に伝わる古文書「盟約の<ruby>祝詞<rt>のりと</rt></ruby>」が存在し、巨大な生き物や火山の噴火が見られる場合には『船で海へ出て海中に長い筒を差し入れて読み上げる』ことになっていると聞き取った。ところが今回、この古文書も盗難にあっており、儀式が進められないという。
　現在の神主はこの祝詞の内容は分からず、もしこの祝詞を知っているとすると、就職のために東京に出た元神主の子どもである【<ruby>吉備津<rt>きびつ</rt></ruby>】または、島の旧家の出自を持つ神社に縁のある人物に確認するしかないという。`,
      ownerId: "pc-6",
      foundPhase: 3,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 3以降: 小笠原側アクション【F-3B】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-diver-shipping-waybill",
      title: "救助されたダイバーたちについての調査",
      frontTitleHtml: "救助されたダイバーたち<br>についての調査",
      description: `　小笠原・二見港の貨物船運送状（送り状）およびダイバーたちの足取り調査記録。
　救助されたダイバーたちが持ち出した【重さ約30kgの大型冷凍ボックス】は、定期船「おがさわら丸」で東京港へ輸送された後、チャーター便トラック（貸切トラック便）へ積み替えられていた。
　送り状の荷受人欄には【静岡県富士山麓の住所】が記されていたが、宛名は偽名・住所には居住の形跡がなかった。荷物そのものは現地での受け取り完了の記録が残っている。現時点ではこれ以上の足取りの追跡・捜索は困難と判断されている。`,
      ownerId: "pc-3",
      foundPhase: 3,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 3以降: 小笠原側アクション【F-3C】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-photo-deep-analysis",
      title: "撮影した画像の分析",
      description: `　Day 3に洋上捜索ヘリがカメラで捉えた写真の精密画像解析レポート。
　超高感度強調処理により、海面下約50mの漆黒の影には【20本以上の巨大な触手群】が存在することが判明。
　さらに触手の付け根部分を拡大すると、単一の巨大生物ではなく、無数のダイオウイカが互いの腕を絡め合い、泥状の分泌物で結合した【超群体（コロニー）】を形成している驚くべき構造が判明した。`,
      glossaryNote: `※群体（コロニー）とは：たくさんの生き物の個体が集まってくっつき合い、まるで「1つの巨大な生き物」のように一緒に行動している状態のこと。`,
      ownerId: "pc-5",
      foundPhase: 3,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 3以降: 小笠原側アクション【F-3D】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-asakura-notes-origin",
      title: "海野教授の研究日誌",
      frontTitleHtml: "<ruby>海野<rt>うみの</rt></ruby>教授の研究日誌",
      description: `　1981年、アリゾナ州立大学にて。恩師ロバート・S・ディーツ名誉教授のもとでプレート理論を研究する中、奇妙な現象に突き当たった。
　小笠原周辺の海底火山で微動や噴火が起きる直前、マッコウクジラたちが一斉に警戒行動を起こし、それが数百キロ彼方の群れにも伝わるのだ。
　SOFAR層の水中聴音網では、火山の爆発音の後にクジラのクリック音が複数回観測できる。【深海において、火山とクジラは音で繋がっている】――ディーツ教授は私とその検証を進める中で亡くなってしまった。`,
      glossaryNote: `※SOFAR（ソーファー）層とは：水深約800〜1,000mにある「音が遠くまで非常に届きやすい特別な海の層」のこと。\n※クリック音とは：マッコウクジラが鼻の奥を鳴らして出す「カッ、カッ」という短い打撃音のこと。`,
      ownerId: "pc-5",
      foundPhase: 4,
      visibility: "shareable",
      category: "research_note",
      acquisitionCondition: "Day 4以降: 小笠原側アクション【F-4A】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-asakura-notes-folklore",
      title: "海野教授の研究野帳",
      frontTitleHtml: "<ruby>海野<rt>うみの</rt></ruby>教授の研究野帳",
      description: `　小笠原諸島・古参漁師および旧神主への聞き取り覚書：
　■ 小笠原の漁師たちの伝承の聞き取り
　『昔、浅瀬に乗り上げ座礁しかけた鯨の母子を、島人たちが総出で船を出して潮をかけ、沖へ押し戻して助けた』『またある時、嵐で舟が難破し漂流しかけた島人が、鯨が背中に乗せて港口まで運んで命を救った』
　『それから島人の一人が海に出るたびに同じ鯨と出会うようになり、【島人と鯨とが助け合う約束を交わした】』
　■ 小笠原の老神主からの聞き取り
　『海で奇妙な怪物が現れると、海へ向かって<ruby>祝詞<rt>のりと</rt></ruby>を捧げることになっています。昔は海に潜ってやっていたようです。海では祝詞は唱えられませんので、先代がどうしていたのかは分かりませんが、【音を間違えるな】とだけ言われています』`,
      ownerId: "pc-5",
      foundPhase: 4,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 4以降: 小笠原側アクション【F-4A】等または浪寄准教授の手持ち資料",
    },
    {
      id: "ev-ancient-shrine-scroll",
      title: "小笠原社記（抄）",
      description: `　小笠原神社に保管されていた古い年代記（過去の異変記録）の精査。
　倉庫から盗難された「盟約の<ruby>祝詞<rt>のりと</rt></ruby>」の本文そのものは記載されていないものの、江戸時代中期の記録に、過去の海底噴火と海鳴り、そして海中筒から祈りを響かせると太古の契りに応ずるが如く【数多の鯨（勇魚）が集まり来たりて深海へ突入し、事態が沈静化】した記録が確認された。`,
      ownerId: "pc-6",
      foundPhase: 4,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 4以降: 小笠原側アクション【F-4D】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-shrine-lineage",
      title: "小笠原神社元神主の家族の捜索",
      frontTitleHtml: "小笠原神社元神主の<br>家族の捜索",
      description: `　数年前に東京へ転居した小笠原神社元神主の遺族【<ruby>吉備津<rt>きびつ</rt></ruby>】に対する聴取記録。
　生前の父から『<ruby>祝詞<rt>のりと</rt></ruby>は声高に日本語を読むのではなく、【舌を弾いてクリック音を海中筒から放つ】ものだ』と教わっていた。
　祝詞の音響構成は「（ド・ドーッカッカッ）（チ・トン・チ）（ボ・ボーン・ポポ）（カ・カ・カカッ！）（チチチチチチッ！）（カ・カ・カカッ！）」であり、日本語をあてはめたとき、その盟約の祝詞は『人と勇魚（いさな）、契り（ちぎり）、小笠原（おがさわら）へ、集ひ来よ（つどひこよ）、大獲物（おおえもの）ぞ、集ひ来よ（つどひこよ）』となる。`,
      glossaryNote: `※クリック音とは：舌を弾いたり、マッコウクジラが鼻の奥を鳴らしたりして出す「カッ、カッ」「チチチッ」という短い打撃音のこと。`,
      ownerId: "pc-2",
      foundPhase: 5,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 5以降: 東京側アクション【T-4B】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-asakura-notes-syntax",
      title: "クジラ構文規則の草稿（未発表原稿）",
      frontTitleHtml: "クジラ構文規則の草稿<br>（未発表原稿）",
      description: `　長年のソナー解析と行動観察により、彼らのクリック音（コーダ）には精緻な文法規則が存在することを突き止めた。まれに現れる知能の高いクジラは複雑な言語でも理解できるが、一般的なクジラは簡単な組み合わせしか使えていない。
　第一に、興味深いことに【了解した】を示す単発クリック音「（カッ）」のみが、例外的に【1語単独で機能】し応答として成立する。
　第二に、それ以外の状況指示や警告は、単語単体では意味をなさず【2語単位で1つの意味・行動指示（2語成語）】となって初めて行動を誘発するスイッチとなる。
　第三に、彼らは常にこの「2語成語のペア」を基本単位として会話しており、複雑な状況伝達においても【2語成語のペアを複数繋ぎ合わせる（2語＋2語＋…）】ことで長文を構成している。`,
      glossaryNote: `※クリック音・コーダとは：マッコウクジラが鼻の奥を鳴らして出す「カッ、カッ」「チチチッ」という短い打撃音のこと。その音の並び（リズムのパターン）を「コーダ」と呼び、仲間同士の会話に使われる。`,
      ownerId: "pc-5",
      foundPhase: 5,
      visibility: "shareable",
      category: "research_note",
      acquisitionCondition: "Day 5以降: 小笠原側アクション【F-5A】等で調査可能（翌日以降も繰り越し調査可能）",
    },
    {
      id: "ev-asakura-record-volcano",
      title: "実録音響 海底噴火と警戒",
      frontTitleHtml: "実録音響<br>海底噴火と警戒",
      description: `　観測日誌：海山列カルデラ噴火観測ログ（ハイドロフォン磁気テープNo.14）：
　海底火山の噴火で海面が赤錆色に濁っていたとき、海中に設置したマイクが噴火の音を捉えていた。その後、マッコウクジラのクリック音が響いてきた。
　「ゴゴゴゴ…と響く極低周波クリック音」と「ドォン……ドォン……という重低音の長く重いクリック音」が認められる。
　他の音源とも確認すると、【海の下の火山】＋【周囲を警戒せよ】の2語成語である可能性が高い。
　この2語のクリック音が海中に鳴り響くと、周辺海域の鯨群が一斉に進路を変え、付近から急速に退避行動を開始した。`,
      glossaryNote: `※ハイドロフォンとは：水中に沈めて、海の中の音（クジラの声や海底火山の音など）を録音・観測するための防水マイクのこと。`,
      ownerId: "pc-5",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
    {
      id: "ev-asakura-record-west",
      title: "実録音響 人工音誘導と応答",
      frontTitleHtml: "実録音響<br>人工音誘導と応答",
      description: `　実験：人工音響放流テスト（オープンリールテープNo.22）：
　深海用大型マイクから、人工合成した2語のクリック音を海中へ放流。前半は「（ピ・ポ・ポン）」、続けて「（カ・カ・カカッ！）」。私の仮説が正しければ【西】＋【集まれ】の2語成語となる。
　音響放流から約8秒後、海中からの音を検出。「短く澄んだ単発受諾クリック（カッ）」――【了解した】である！
　直後、近くの鯨の群れが一斉に進路を変え、西へと整然と移動を開始した。彼らは私の言葉を理解し、返事をしてくれたのだ！`,
      ownerId: "pc-5",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
    {
      id: "ev-asakura-record-feeding",
      title: "実録音響 イカによる餌付けと招集",
      frontTitleHtml: "実録音響<br>イカによる餌付けと招集",
      description: `　実験：深海生態調査（餌付け模擬実験記録・テープNo.35）：
　調査船のウインチから、切り身のイカを集めて海中へ投下したが、反応なし。生きているイカを集めて、カゴから解放してみると――
　すると深海から、「高音超高速ロングバースト（チチチチチチッ！）」、「加速する4連打（カ・カ・カカッ！）」が相次いで観測された。
　これは【大きい・たくさんの餌】＋【集まれ】の2語成語ではないかと思う。
　この2語のあと、さらに2頭のマッコウクジラが現れて、イカを食べているようだった。`,
      ownerId: "pc-5",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
    {
      id: "ev-asakura-record-lostcalf",
      title: "実録音響 仔クジラの捜索",
      frontTitleHtml: "実録音響<br>仔クジラの捜索",
      description: `　フィールド録音手記：母鯨の捜索行動（ハイドロフォン録音テープNo.41）：
　クジラの子どもが一人で泳いでいるのを見つけた。近くに母クジラの姿はなく、迷子のようだった。船でしばらく探すと母クジラとみられるクジラを確認した。水中にマイクをいれると、「中音2連長打（ト・トーン）」と「等間隔の探査パルス（タン・タン・タン）」というクリック音を繰り返していた。
　これは【クジラの子ども】＋【探せ】の2語成語ではないか。
　すると驚くべきことに、周囲数キロに散らばる仲間たちから次々に「短く澄んだ単発受諾クリック（カッ）」――すなわち【了解した】が返され、クジラの子どもが別のクジラに見つけ出されて母クジラと合流していた。`,
      glossaryNote: `※ハイドロフォンとは：水中に沈めて、海の中の音（クジラの声や海底火山の音など）を録音・観測するための防水マイクのこと。`,
      ownerId: "pc-5",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
  ],

  timeline: [
    {
      dayNumber: 1,
      locationName: "父島南西沖 (0 km)",
      distanceKm: 0,
      situationTitle: "荒海からのメーデー・漂流予測と遭難船救助",
      incidentOverview: "民間チャーター船（40t）が突如全電源喪失。AIS停波、衛星観測不能の中、救難信号発信からの経過時間（現在20分）と浪寄が提示する現場海域までの到着所要時間（約40分）から1時間後の漂流地点を推測し、海流と強風のベクトル合成から特定して暗礁手前で救助する。",
      hqResponse: "衛星死角の報告と航法計算支援。南西強風（15m/s）による風圧流（北東へ約1.5kt）と黒潮支流（真東へ2.0kt）の合成計算を実施。",
      fieldResponse: "太刀魚（PC4）が真東2.0ktの海流と南西強風30ktを提示、浪寄（PC5）が現場海域到着まで約40分かかることを提示（長津アナウンスの20分経過と合わせ計1時間後の位置を予測）。坂凪（PC3）率いる巡視船が暗礁群の手前、東北東の【漂流予測海域】へ急行。荒波の中で接舷し、船長と謎のダイバーグループを救出成功。初瀬（PC6）も救護準備を整え、ダイバーたちは魚の調査サンプルと称して約30kgの大型プラスチック冷凍ボックスを持ち去る。",
      revealedEvidenceIds: [
        "ev-vessel-leeway-data",
        "ev-satellite-blindspot",
        "ev-reef-chart",
        "ev-ocean-buoy-current",
        "ev-temperature-front",
        "ev-radio-fragment",
        "ev-diver-box-photo",
        "ev-captain-testimony",
      ],
    },
    {
      dayNumber: 2,
      locationName: "西之島沖 (約180 km)",
      distanceKm: 180,
      situationTitle: "異変の顕在化・西之島噴火と深海シグネチャー",
      incidentOverview: "西之島周辺の海底火山が突発的大規模噴火。船舶の避難誘導および安全確保のため、上層部より「合同対策本部の即応体制維持」が命じられる。周辺海域から巨大な影や海底地震のような異常振動の目撃情報が相次ぐ。",
      hqResponse: "海上保安庁東京本部側アクション（朝潮・貝浜）により、水深800mを時速約6kmで北上する全長数百mの巨大な影を特定。",
      fieldResponse: "小笠原現地側アクション（坂凪・太刀魚・浪寄・初瀬）により、Day 1の元凶がダイオウイカであると判明。さらに巨大生物が海底付近で『海底地震を起こすような特別な振動』を発生させ、それが海底火山を刺激して噴火を誘発した事実を解明。",
      revealedEvidenceIds: [
        "ev-sonar-shadow",
        "ev-evacuation-radio-log",
        "ev-aerial-recon-report",
        "ev-propeller-tissue",
        "ev-fisherman-guide-testimony",
        "ev-diver-trauma-record",
        "ev-moving-epicenter",
      ],
    },
    {
      dayNumber: 3,
      locationName: "孀婦岩〜鳥島沖 (約400 km)",
      distanceKm: 400,
      situationTitle: "鳥島沖海底爆発と巨大生物写真分析・防衛合議 ＆ Day 3初期調査アクション（東京2枠・現地2枠）",
      incidentOverview: "鳥島沖海底カルデラの連動大爆発。ヘリソナー索敵作戦によりセクターB-3で巨大生物の撮影・捕捉に成功（または航跡波を確認）。海上保安庁は撮影写真の生物学的解釈を浪寄准教授（PC5: 海洋生物学者）に相談し、海上自衛隊の防衛出動の要否を貝浜リエゾン（PC2: 防衛省リエゾン）に諮問。全員による合議を経て、海上保安庁東京本部の朝潮危機管理官（PC1）が最終意思決定を下す。同時に、東京本部と小笠原現地で初期情報収集アクション（東京2枠・現地2枠）を開始する（未選択分は翌日以降も繰り越し調査可能）。",
      hqResponse: "洋上ヘリ索敵の統括と写真解析。自衛隊出動判断の要請と対策本部合議の取りまとめ。並行して東京本部アクション（3枠中2枠選択：朝潮持ち帰り隕石片の地磁気・特殊物質分析／八丈島微動解析／八丈島・三宅島の神社隕石盗難と海域投棄情報）を実行。",
      fieldResponse: "捜索ヘリによる写真撮影任務の遂行と生物学的所見の提示、合議への参加。並行して小笠原現地アクション（4枠中2枠選択：太刀魚観測員の落下隕石分析／神社の奉納隕石盗難と盟約祝詞調査／謎のダイバーグループの貨物伝票追跡／写真画像深層解析）を実行。",
      revealedEvidenceIds: [
        "ev-tokyo-meteorite-analysis",
        "ev-hachijo-tremor-analysis",
        "ev-hachijo-resident-and-sonar",
        "ev-ogasawara-meteorite-analysis",
        "ev-shrine-curse-stone",
        "ev-diver-shipping-waybill",
        "ev-photo-deep-analysis",
      ],
    },
    {
      dayNumber: 4,
      locationName: "明神礁 (約550 km)",
      distanceKm: 550,
      situationTitle: "明神礁海底噴火・富士山到達危機と防衛省「害獣駆除」通達 ＆ 即応総力調査一括開示",
      incidentOverview: "明神礁の海底カルデラが連動大爆発（噴火後3日目噴火）。八丈島・青ヶ島では巨大生物の特別な振動による火山性群発微動が観測され、日速約150kmで北上する火山フロントが数日後に【富士山直下】に到達し破局的大噴火を誘発する壊滅的危険性をプレイヤー側が指摘。Day 4終盤には防衛省より『害獣駆除』方針による海上自衛隊動員の正式通達を受領。事態の急迫を受け、合同対策本部は即応総力体制へ移行。調査枠制限を撤廃し、各班が収集した全証拠資料（海野教授の研究日誌・野帳、小笠原社記原本など）を一括全開放する。",
      hqResponse: "富士山到達リスクの指摘と防衛省への最終進路報告。防衛省から『害獣駆除』方針による海上自衛隊動員の通達を受領。即応総力体制への移行に伴い、東京側・小笠原現地の調査枠制限を撤廃し、全重要調査資料を一括開示して真相究明へ邁進する。",
      fieldResponse: "小笠原現地アクションを実行。神社の盟約祝詞の儀礼作法と海野教授の学術原点を深掘りし、一括開示された全資料を統合してクジラ言語の解明へ急行する。",
      revealedEvidenceIds: [
        "ev-asakura-notes-origin",
        "ev-asakura-notes-folklore",
        "ev-ancient-shrine-scroll",
      ],
    },
    {
      dayNumber: 5,
      locationName: "八丈島〜御蔵島沖 (約700 km)",
      distanceKm: 700,
      situationTitle: "御蔵島沖海底噴火・魚雷攻撃の失敗（深海での復活）と防衛省照会 ＆ 東京・小笠原の分断同時進行マップ探索（吉備津捜索×友達6人の証言パズルと3施設回収）",
      incidentOverview: "御蔵島沖の海底カルデラで連動噴火が発生し、富士山地下深部での火山性微動（危機到達まで残り48時間）を観測。さらにDay 5冒頭、八丈島〜御蔵島沖で海上自衛隊の魚雷群が命中したものの、アクティブソナーでは【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認され、防衛省作戦本部より『あいつらはどうして魚雷の命中後に復活してしまうのか？（浪寄） 魚雷投下以外の方法があるか検討してほしい』との緊急照会（NG-06）が入電する。対策本部での議論を通じて『［A］盟約の祝詞と［B］海野教授の研究を調査し、天敵である［C］マッコウクジラを集める作戦が有効ではないか』という共通認識が確立。直ちに東京本部チーム（3名）と小笠原現地チーム（4名）に分かれ、地図を使った同時進行ミッション（1人2〜3アクション・最大21アクション）を開始する。東京側は『東京都内広域捜索マップ（全8拠点）』で江東区の本人住所から海洋研究開発機構・吉備津神社・国立国会図書館・海洋科学大学を経て竹芝桟橋ターミナルにいる【吉備津】を発見し、祝詞の口伝（EV-26）と【吉備津の直通連絡先】を入手するとともに、小笠原班からの依頼を受けて『⑤ 科学技術館』に勤める海野教授の元ダイビング仲間【柏木（かしわぎ）】から3つの機材（ダイブコンピュータ・水中マイク・防水カメラ）の保管場所を聞き出す。小笠原側は『父島現地調査マップ（A2・全8拠点）』の①小笠原研究所で研究資料は処分されたがバックアップや実データが残っているはずだと知り、島内の5拠点にいる友達5人（水産センターの湊・気象庁観測所の潮見・小笠原神社の神代・海洋センターの磯辺・パパズドルフィンの網野）と東京の柏木（計6人）の証言をパズルのように組み合わせ、立ち入り制限（小笠原神社＝初瀬のみ、気象庁観測所＝太刀魚のみ、水産センター＝誰でも）を活かして【①クジラ構文規則の草稿（EV-27）】【②解析システムのパスワード書類（whale-study）】【③実録音響データ4つ（EV-28〜31）】の3つすべてを回収する。",
      hqResponse: "冒頭で魚雷投下以外の有効な作戦（祝詞と海野教授の研究を調査し、マッコウクジラを集める方針）を合議。続いて『東京都内広域捜索マップ（全8拠点）』を用い、3人で手分けして吉備津の足取り（①江東区本人住所で容貌と勤務先判明 ➔ ②海洋研究開発機構 ➔ ③吉備津神社で国会図書館への預け入れ判明 ➔ ④国立国会図書館 ➔ ⑦海洋科学大学で海野教授の死去を知り竹芝へ ➔ ⑧竹芝桟橋ターミナル、※⑥国立科学博物館ではクジラのコーダ言語が判明）を追跡。あわせて小笠原班からの依頼で『⑤ 科学技術館』を訪ね、館内のCODA・AI手話音声変換の展示知見とともに、海野教授の友達6人目の【柏木（かしわぎ）】から3つの機材の保管場所（ダイブコンピュータ＝パパズドルフィンの倉庫、水中マイク＝水産センター低温庫、防水カメラ＝小笠原神社古文書整理棚）を聞き出して小笠原班へ無線共有する。",
      fieldResponse: "冒頭で浪寄が『単一生物ではなくダイオウイカの超巨大群体であるため魚雷後も深海で再結合して復活する』と回答。続いて『父島現地調査マップ（A2・全8拠点）』を用い、①小笠原研究所で研究資料は処分済みだが友達6人（湊・潮見・神代・磯辺・網野・東京の柏木）に聞けばバックアップが残っているはずだと把握。島内5拠点の友達と東京『⑤ 科学技術館』の柏木の証言を組み合わせて3つの機材（ダイブコンピュータ・水中マイク・防水カメラ）とパスワードの手がかりを解き明かし、小笠原神社（初瀬のみ）で①草稿（EV-27）、パパズドルフィン倉庫のダイブコンピュータ確認を経て気象庁観測所（太刀魚のみ）で②解析システムパスワード（whale-study）、水産センター（誰でも可）で③実録音響4つ（EV-28〜31）の3種すべてを回収する。",
      revealedEvidenceIds: [
        "ev-shrine-lineage",
        "ev-asakura-notes-syntax",
      ],
    },
    {
      dayNumber: 6,
      locationName: "駿河トラフ境界へ北上再開 (約830 km)",
      distanceKm: 830,
      situationTitle: "朝8時の完全回復・北上再開と新言語祝詞の完成 ＆ 防衛省運用企画局長・岸部との緊急交渉（潜水艦SOFAR層放流・攻撃抑制）",
      incidentOverview: "朝8時の時点で巨大生物がほとんど同じ大きさまで回復し、駿河トラフ境界に向けて北上を再開。それにあわせて富士山地下の火山性微動が再開し、駿河湾までは24時間ほどで到達する見込みとなる。ここで浪寄へ特別配布カード『SP-06：マッコウクジラクリック音の距離限界と集合に必要な時間（6〜8時間）』、7名時は長津へ『SP-07：岸部局長とのコネクション』が配布され、前日（Day 5）に東京・小笠原の同時進行ミッションで回収した吉備津の祝詞口伝（EV-26）および海野教授の3つの研究（①構文規則草稿 EV-27・②音響言語解析システム `/sonar`・③実録音響4つ EV-28〜31）を用いてクジラ言語の解読を開始。2語成語を単位とするコーダ構文規則を読み解き、新言語祝詞（参考例：『【人間とクジラ・約束】【海の下の火山・探せ】【北・集まれ】【大きい・たくさんの餌・攻撃せよ】』の2語×4組）の音声信号が完成。直後に『Day 6 途中①指令書』が配布され、長津の親戚（叔父）である防衛省運用企画局長・岸部（きしべ）との直通電話交渉を敢行。通常兵器の限界・深海1,000mのSOFAR層での人工音源の大出力放流・クジラの遊泳時間（6〜8時間）の逆算を突きつけて岸部局長を説得し、深夜のうちに海上自衛隊の潜水艦が深海SOFAR層から人工音源（新言語祝詞）の大出力放流を開始する（NG-07）。",
      hqResponse: "朝8時ブリーフィングにて巨大生物の完全回復・北上再開と富士山地下微動の再開（駿河湾到達まで24時間）を報告。祝詞完成後、長津の親戚コネクションにより防衛省運用企画局長・岸部との直通ホットラインを開設し、潜水艦の深海SOFAR層放流および『実弾攻撃抑制・待機』を正式承認させる。",
      fieldResponse: "小笠原現地組が昨日回収した海野教授の3つの研究（①コーダ構文規則草稿・②音響言語解析システム・③実録音響4つ）と浪寄の『SP-06』、初瀬の『SP-05（神社の祝詞の複製）』、太刀魚の『SP-03（SOFAR層）』を統合。東京班が突き止めた吉備津の口伝と照合し、小笠原ではなく北方（駿河湾）へ集結させるための新言語祝詞シーケンスを完成させる。",
      revealedEvidenceIds: [
        "ev-ancient-shrine-scroll",
        "ev-asakura-notes-syntax",
        "ev-asakura-record-volcano",
        "ev-asakura-record-west",
        "ev-asakura-record-feeding",
        "ev-asakura-record-lostcalf",
      ],
    },
    {
      dayNumber: 7,
      locationName: "駿河湾付近 (約950 km)",
      distanceKm: 950,
      situationTitle: "運命の駿河湾・クジラ群の大捕食と微動停止 ＆ 岸部からの小笠原チームへの言語解析依頼（last-mission：クジラからの感謝・完了の合図）と最終発表選択",
      incidentOverview: "夜明けを迎え、昨夜から放流された祝詞に応えて太平洋を泳いできたマッコウクジラ群（白いクジラを先頭に100頭以上、後続1,000頭近く）が駿河湾深海へ到達し、巨大生物を一斉捕食。巨大生物の特有の振動と富士山地下深部の火山性微動は完全停止する（NG-08-1・NG-08-2）。直後、防衛省幹部から『出動した自衛隊が何もしなかったでは説明がつかないため、事後の掃討攻撃（魚雷・爆雷投下）を行わせ自衛隊の戦果とするか、対策本部の功績として公表するか決めてほしい』との連絡が入り特別配布カード（Day 7 配布：SP-08〜14）が配布されるが、続けて岸部運用企画局長より追加の緊急連絡が入電！『①海上自衛隊の現場内で「撃つターゲットが確認できない、撃つ必然性はあるのか」という確認が複数起きていること、②クジラたちから同じコーダが繰り返し聞こえており、この内容を合同対策チームが知らないか確認してほしいこと、③小笠原現地チームの意見と言語解析を至急確認したく、総理の判断のための時間は稼いでおく』と依頼される。プレイヤー全員でアプリのコード入力から【last-mission】を入力して潜水艦が受信した4つのクジラ音声（A: ド・ドーッカッカッ＝人間とクジラ、B: チ・トン・チ＝約束、C: ポ・ルル・トーン＝未知の音、D: タ・タン・ドーン＝未知の音）を聴き、海野教授のサンプルにない未知の2音（C・D）についてDay 5で確保していた【吉備津の連絡先】へ確認すると、吉備津から『その音ならわかります。クジラからの合図で、人間に対して「ありがとう」「ごちそうさま」、または「（約束が）完了した」という意味だ』と判明！ これを岸部に伝えて魚雷発射の必要がないことを証明すると、岸部は『魚雷発射は中止する。総理には①自衛隊の作戦によって完全消滅したか、②合同対策本部の作戦が奏功し完全消滅は自衛隊が確認できたかのいずれかで説明がつく』と応じ、最終発表（自衛隊／自分たち）を選んでテレビ臨時ニュース（NG-09／NG-10）を見届け、物語は大団円を迎える。",
      hqResponse: "朝のブリーフィングでクジラ群の集結と巨大生物の完全捕食・富士山微動の停止を確認。岸部局長からの追加連絡を受け、小笠原現地チームとともに『last-mission』のクジラ音声を確認し、Day 5で入手していた吉備津の直通連絡先へ照会して未知のコーダの意味（ありがとう・ごちそうさま／完了）を特定。岸部へ魚雷発射不要を報告したうえで、最終発表の形式（自衛隊の作戦で完全消滅／合同対策本部の作戦が奏功し自衛隊が消滅確認）を決断して対策本部を解散する。",
      fieldResponse: "岸部局長から直々に『小笠原現地チームの意見と言語解析を至急確認したい』と頼まれ、アプリのコード入力【last-mission】から潜水艦が受信した4つのクジラ音声を解析。前半2音が【人間とクジラ】【約束】、後半の未知の2音が吉備津の口伝により【ありがとう・ごちそうさま／完了（約束を果たした合図）】であると突き止めて魚雷発射を完全に阻止し、自分たちが守ったクジラからの感謝の言葉を受け取って感動のフィナーレを迎える。",
      revealedEvidenceIds: [],
    },
  ],

  crypticWords: sonarWords.map((word) => ({ ...word, ...sonarWordSources[word.id] })),

  crypticGrammar: {
    ruleDescription: "太古の祝詞とクジラ言語（2語成語ペア）の融合構文：クジラ言語は2語単位で1つの意味・行動指示となり、そのペアを繋げて会話する。最終祝詞には複数の正解パターンがあり得るが、参考正解例として【人間とクジラ＋約束】【海の下の火山＋探せ】【北＋集まれ】【大きい・たくさんの餌＋攻撃せよ】の2語×4組（計8語）で構成される。",
    correctSequence: [
      "word-human-whale",
      "word-promise",
      "word-subsea-volcano",
      "word-search",
      "word-go-north",
      "word-gather",
      "word-giant-prey",
      "word-attack",
    ],
    combinedMessage: "【人間とクジラ・約束】【海の下の火山・探せ】【北・集まれ】【大きい・たくさんの餌・攻撃せよ】",
    holderCharId: "pc-6",
  },
};

/**
 * 6名プレイ用 PC4（純粋な海洋・気象観測員）
 */
export const pc4For6Players = {
  id: "pc-4",
  name: "太刀魚（たちうお）",
  profession: "気象庁 小笠原観測所 職員",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "field" as const,
  introduction:
    "　あなたは気象庁の小笠原観測所で働く気象・海洋・火山観測の専門員だ。この太平洋上に浮かぶ小笠原観測所は、台風や波の強さなどが他の地域と連動するため非常に重要な拠点となっている。また数年前に噴火して新しい島となった西之島周辺の海底火山など、火山の動きを定期的に監視することも欠かせない。\n　また、あなたの生まれた環境は少し特殊だ。あなたの両親は耳が聞こえない障害を持っている。両親とは違いあなた自身は話すことができるため、子どもの頃から手話と音声会話とが両方できるあなたは両親と他の大人との間の通訳をしてきた。それは海洋科学研究所のある教授から「コーダ（CODA；耳の聞こえない大人たちの子ども）」という役割なのだと言われていた。\n　1ヶ月ほど前、日本の本州付近が曇りとなった一方、あなた達が出した「小笠原は晴れるので流星雨の観測に最適」という情報が天文マニアを中心に大きな話題となり、多くの新たな観光客がやってくることにつながった。\n　本日、遭難事故の発生を受け、海上保安庁からの要請で海難救助の現地チームとして参加している。",
  initialItems: [],
  capabilities: [],
  handout: {
    publicProfile:
      "気象庁に所属する現場観測したデータを取得・分析する観測員。連携先とのコミュニケーションを大事にしている。",
    internalDrama: {
      pride:
        "　海洋・火山の情報は常に変わり続けるため、常に一歩先を考える必要がある。気象庁公式からの数値の報告だけでは人は動かない。",
      loss: "　過去の台風の接近に伴って島民に避難指示をしたが、具体的指示が伝わりにくく被害を大きくしてしまった。",
    },
    backgroundTimeline: "",
    handoutBody:
      "「気象庁・小笠原観測所の観測員、太刀魚（たちうお）です。現場海域の海流や風速などのリアルタイムデータを分析してお渡しします。海の状況は刻一刻と変化するため、一歩先を見越して次々と最新情報をお伝えしていくことになるかと思いますが、救助に直結する生きた情報となるよう全力を尽くします。ご協力をよろしくお願いします！」",
  },
};

/**
 * 6名プレイ用 PC6（救護班チーフ 兼 神職）
 */
export const pc6Character = {
  id: "pc-6",
  name: "初瀬（はつせ）",
  profession: "小笠原役場勤務（救護担当）",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "field" as const,
  introduction:
    "　あなたは小笠原諸島父島の旧家の家系だ。かつては東京でも災害救助などの活動に従事していた経験があり、その後島に戻って現在は小笠原役場に勤めている。古くから島を守ってきたという家の伝統があり、島の神社とのつながりも深い。\n　あなたは幼い時に海の事故・<ruby>離岸流<rt>りがんりゅう</rt></ruby>によって沖に流されてしまったことがある。そのとき、白いクジラの子どもがあなたを岸近くまで押して連れ帰ってきた経験がある。大人たちは信じてくれなかったが、それ以降白いクジラは明らかに海で泳ぐあなたを認識しているようだった。この白いクジラは、他のクジラと違って明らかに知能が高いとあなたは感じている。こうした知能の高い個体はやがて群れのリーダーになると言われている。\n　海難救助が起きた場合には、島に専門の救命救急病院がないことから救護担当として活躍しており、応急処置や心肺蘇生・AEDなどの救命救急活動の経験が豊富だ。また、あなたは心肺蘇生やAEDの使用だけでなく、「声かけ」が大事だということを直観的に知っている。具体的には、名前を呼びかけ、「戻ってこい」「まだ死ぬな」という言葉がけが、意識のないはずの人間の耳には作用すると信じている。\n　1ヶ月前、島の夜空に降り注ぐ流星雨を目撃した。ただの天体ショーだろうが、島に住む人間には良くない兆しだと伝わっているようだ。\n　また、最近になって八丈島・三宅島の神社に古くから奉納・保管されていた『祀り石』が何者かに盗み出される事件が相次いでおり、注意喚起を受けている。この祀り石は以前専門家に調べてもらったところ、もともと隕石だっただろうといわれているが、金銭的な価値はないようなので奇妙だと感じている。\n　今回、海上保安庁からの要請で救護活動の担当者としてチームに加わっている。",
  initialItems: [],
  capabilities: [],
  handout: {
    publicProfile: "温和で献身的な救護担当者。島の伝統や神事にも詳しい。",
    internalDrama: {
      pride:
        "　昔から続く家に生まれた責任感と人々を救助する使命感を持っている。新しい技術と古い歴史はあなたの中に息づいている。",
      loss: "　海が荒れていて救助の船を出せず、電話ごしに助けを求められていたにもかかわらず救助が間に合わなかった経験がある。\n　遠隔地であっても、スマートフォンなどを経由してその場の同乗者に指示を出し、声掛けをすればよかったという後悔が残る。",
    },
    backgroundTimeline: "",
    handoutBody:
      "「小笠原役場に勤務しており、今回のチームで救護担当を務めます初瀬（はつせ）です。普段から応急処置や初期救護の経験がありますので、海での負傷者や有毒生物との接触、意識不明の方が出た場合の救護対応は私に任せてください。今は一刻を争う状況です。現場の皆さん、そして東京本部と力を合わせて一人でも多く救い出しましょう！」",
  },
};

/**
 * 各Day開始時にGMから朝潮（PC1）および長津（PC7：7名プレイ時）へ渡す
 * 「対策本部・日次ブリーフィング ＆ 指揮官ミッションシート」データ（Day 1〜Day 7）
 */
export interface DailyCommanderBriefing {
  id: string;
  dayNumber: number;
  badgeLabel: string;
  sheetCode: string;
  isMidDayAddition?: boolean;
  linkedNagatsuCardCode?: string;
  timingNote?: string;
  title: string;
  targetMinutes?: number;
  nagatsuBriefingTitle: string;
  nagatsuBriefingText: string;
  nagatsuBriefingRubyHtml?: string;
  asashioMissions: string[];
  gmHandoutNote: string;
}

export const DAILY_COMMANDER_BRIEFINGS: DailyCommanderBriefing[] = [
  {
    id: "cmd-day1-start",
    dayNumber: 1,
    badgeLabel: "DAY 1 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY01",
    timingNote: "Day 1 開始時配布",
    title: "【Day 1】民間チャーター船の全電源喪失・漂流救難作戦",
    targetMinutes: 15,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      "「東京本部および小笠原現地チームへ緊急入信。小笠原南西沖にて民間チャーター船『パパズドルフィン（総トン数約40t）』が突如全電源を喪失、AIS（自動船舶識別装置）も停波し、救難信号を発信した直後に通信が途絶いたしました。救難信号の発信から現在20分が経過しております。それでは朝潮危機管理官、よろしくお願いします」",
    nagatsuBriefingRubyHtml:
      "「東京本部および<ruby>小笠原<rt>おがさわら</rt></ruby>現地チームへ緊急入信。<ruby>小笠原<rt>おがさわら</rt></ruby><ruby>南西沖<rt>なんせいおき</rt></ruby>にて民間チャーター船『パパズドルフィン（総トン数約40t）』が突如全電源を喪失、<ruby>AIS<rt>エーアイエス</rt></ruby>（<ruby>自動<rt>じどう</rt></ruby><ruby>船舶<rt>せんぱく</rt></ruby><ruby>識別<rt>しきべつ</rt></ruby><ruby>装置<rt>そうち</rt></ruby>）も<ruby>停波<rt>ていは</rt></ruby>し、救難信号を発信した直後に通信が<ruby>途絶<rt>とぜつ</rt></ruby>いたしました。救難信号の発信から現在20分が経過しております。それでは<ruby>朝潮<rt>あさしお</rt></ruby>危機管理官、よろしくお願いします」",
    asashioMissions: [
      "【ミッション①：各員の点呼・自己紹介の進行】リーダーとして東京本部・小笠原現地のメンバー全員に自己紹介（氏名・所属・専門分野）を行わせ、最後に「それではこれより合同海難救助チームを設立する」とまとめてください。",
      "【ミッション②：現場海域の気象・海象および到着所要時間の集約】各メンバーが保有している初期情報（船の特徴、風向・風速、海流、現場海域に到着するまでの所要時間、周辺の暗礁など）を報告させ、遭難船がどのような影響を受けているか整理してください。",
      "【ミッション③：捜索海域の決定と巡視船の派遣指示】集まった情報（発信からの経過時間と現場到着までの所要時間、風圧流・海流）から「巡視船が現場海域に到着する時点で遭難船が漂流している海域（方角・位置）」を推測・割り出し、坂凪（PC3）の巡視船を急行させる海域を決定して指示を下してください。",
    ],
    gmHandoutNote:
      "Day 1開始時にGMから朝潮（PC1）へ渡してください（7名プレイ時は長津（PC7）が上段の緊急入信を読み上げ、朝潮へ手渡してミッションを開始します）。",
  },
  {
    id: "cmd-day2-start",
    dayNumber: 2,
    badgeLabel: "DAY 2 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY02",
    timingNote: "Day 2 開始時配布",
    title: "【Day 2】西之島沖の突発海底噴火と巨大潜航影の優先調査",
    targetMinutes: 10,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      "「気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です。西之島周辺海域を中心として『火山性の地殻振動』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に一度に手を回す余裕はありませんので、優先度を決めて調査をお願いします。」",
    nagatsuBriefingRubyHtml:
      "「気象庁および上層部より緊急アラートを受信いたしました。<ruby>西之島沖<rt>にしのしまおき</rt></ruby>にて海底火山の<ruby>突発<rt>とっぱつ</rt></ruby><ruby>噴火<rt>ふんか</rt></ruby>が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【<ruby>即応<rt>そくおう</rt></ruby><ruby>体制<rt>たいせい</rt></ruby>を維持】せよとの通達です。<ruby>西之島<rt>にしのしま</rt></ruby>周辺海域を中心として『火山性の<ruby>地殻<rt>ちかく</rt></ruby><ruby>振動<rt>しんどう</rt></ruby>』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に一度に手を回す余裕はありませんので、優先度を決めて調査をお願いします。」",
    asashioMissions: [
      "【ミッション①：優先調査項目の選定と指示】現在実行可能な調査リストの中から、東京本部側（3項目中2つ）と小笠原現地側（4項目中2つ）でそれぞれどの調査を優先して行うか合議し、決定してください。",
      "【ミッション②：調査報告の共有と状況整理】各自が持ち帰った調査結果（昨日救助した船の調査や、西之島周辺の観測データなど）を全員で共有し、海中で何が起きているのか見解を整理してください。",
    ],
    gmHandoutNote:
      "Day 2開始時にGMから朝潮（PC1）（7名時は長津経由）へ渡してください。",
  },
  {
    id: "cmd-day3-start",
    dayNumber: 3,
    badgeLabel: "DAY 3 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY03",
    timingNote: "Day 3 開始時配布",
    title: "【Day 3】鳥島沖の海底噴火と洋上ソノブイ索敵作戦",
    targetMinutes: 30,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      `「気象庁より緊急アラートを受信いたしました。昨日の西之島での噴火に続き、本日はさらに北方に位置する【鳥島沖】にて海底火山の噴火が発生しました。周辺海域では昨日と同様の『火山性の地殻振動』とともに、再び巨大生物の目撃情報が寄せられており、上層部より『巨大生物の現在位置を特定し、可能であれば写真でその姿を捉えてほしい』との緊急要請が出ています。
　これより小笠原基地から小笠原現地メンバーを乗せた大型捜索ヘリコプターが現場へ向かいますが、ヘリコプターでは鳥島沖まで航続距離に問題があるため、途中の海域に展開している大型巡視船『あきつしま』で洋上給油を受けて鳥島沖に展開してください。
　現場海域ではアクティブソナー付きのソノブイ（計3基）を投下して巨大生物の現在位置を特定し、浮上してくることがあれば写真撮影を試みてください。また、午後にはヘリコプターは帰投できますので、索敵と並行して本日の優先調査も進めてください」`,
    nagatsuBriefingRubyHtml:
      `「気象庁より緊急アラートを受信いたしました。昨日の<ruby>西之島<rt>にしのしま</rt></ruby>での噴火に続き、本日はさらに北方に位置する【<ruby>鳥島沖<rt>とりしまおき</rt></ruby>】にて海底火山の噴火が発生しました。周辺海域では昨日と同様の『火山性の<ruby>地殻振動<rt>ちかくしんどう</rt></ruby>』とともに、再び巨大生物の目撃情報が寄せられており、上層部より『巨大生物の現在位置を特定し、可能であれば写真でその姿を捉えてほしい』との緊急要請が出ています。<br>　これより<ruby>小笠原<rt>おがさわら</rt></ruby>基地から<ruby>小笠原<rt>おがさわら</rt></ruby>現地メンバーを乗せた大型捜索ヘリコプターが現場へ向かいますが、ヘリコプターでは<ruby>鳥島沖<rt>とりしまおき</rt></ruby>まで<ruby>航続<rt>こうぞく</rt></ruby>距離に問題があるため、途中の海域に展開している大型<ruby>巡視船<rt>じゅんしせん</rt></ruby>『あきつしま』で<ruby>洋上<rt>ようじょう</rt></ruby><ruby>給油<rt>きゅうゆ</rt></ruby>を受けて<ruby>鳥島沖<rt>とりしまおき</rt></ruby>に展開してください。<br>　現場海域ではアクティブソナー付きのソノブイ（計3基）を投下して巨大生物の現在位置を特定し、浮上してくることがあれば写真撮影を試みてください。また、午後にはヘリコプターは<ruby>帰投<rt>きとう</rt></ruby>できますので、索敵と並行して本日の優先調査も進めてください」`,
    asashioMissions: [
      "【ミッション①：ソノブイ投下ポイントの決定と位置特定・撮影】作戦海図（W-3100）を展開し、ソノブイ3基をどの海域（セクター）へ投下するか合議して決定し、巨大生物の現在位置を特定して写真撮影を試みさせてください。",
      "【ミッション②：追加の優先調査（東京2枠・現地2枠）の選定】並行して進める本日の調査項目（東京本部3項目から2つ、小笠原現地4項目から2つ ※前日未選択分を含む）を決定し、情報を収集させてください。",
    ],
    gmHandoutNote:
      "Day 3開始時にGMから朝潮（PC1）（7名時は長津経由）へ渡してください。",
  },
  {
    id: "cmd-day3-mid1",
    dayNumber: 3,
    badgeLabel: "DAY 3 途中① 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY03-MID1",
    isMidDayAddition: true,
    linkedNagatsuCardCode: "NG-02・NG-03",
    timingNote: "ソノブイ索敵完了・深海写真提示時に配布（長津カード NG-02・NG-03 と同時）",
    title: "【Day 3 途中①】目標捕捉・北上速度報告と深海写真の受信・専門家2名への緊急諮問",
    nagatsuBriefingTitle: "📡 長津からの緊急入電アナウンス（NG-02・NG-03）",
    nagatsuBriefingText:
      "「――洋上捜索ヘリより入電！ アクティブソナーにより鳥島沖の深海で巨大生物の現在位置を捕捉いたしました！ これまでの移動経路と時刻から算出すると、巨大生物は【時速約6km・日速約150km】のペースで北上を続けており、このまま進めば明日（Day 4）にはさらに北方の【明神礁（みょうじんしょう）周辺】へ到達する見込みです！\n　続けて洋上捜索ヘリより緊急入電！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大生物、そして20本以上の無数の触手群を確認！\n① 浪寄准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。\n② 貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則ではこの規模の目標に対処不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」",
    nagatsuBriefingRubyHtml:
      "「――洋上捜索ヘリより<ruby>入電<rt>にゅうでん</rt></ruby>！ アクティブソナーにより<ruby>鳥島沖<rt>とりしまおき</rt></ruby>の深海で巨大生物の現在位置を捕捉いたしました！ これまでの移動経路と時刻から算出すると、巨大生物は【時速約6km・<ruby>日速<rt>にっそく</rt></ruby>約150km】のペースで北上を続けており、このまま進めば明日（Day 4）にはさらに北方の【<ruby>明神礁<rt>みょうじんしょう</rt></ruby>周辺】へ到達する見込みです！<br>　続けて洋上捜索ヘリより<ruby>緊急<rt>きんきゅう</rt></ruby><ruby>入電<rt>にゅうでん</rt></ruby>！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む<ruby>漆黒<rt>しっこく</rt></ruby>の巨大生物、そして20本以上の無数の<ruby>触手群<rt>しょくしゅぐん</rt></ruby>を確認！<br>① <ruby>浪寄<rt>なみより</rt></ruby>准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。<br>② <ruby>貝浜<rt>かいはま</rt></ruby>リエゾン、海上保安庁法20条に基づく<ruby>警察<rt>けいさつ</rt></ruby><ruby>比例<rt>ひれい</rt></ruby>の<ruby>原則<rt>げんそく</rt></ruby>ではこの規模の目標に対処不可能です。法的に自衛隊の<ruby>防衛<rt>ぼうえい</rt></ruby><ruby>出動<rt>しゅつどう</rt></ruby>、あるいは<ruby>海上<rt>かいじょう</rt></ruby><ruby>警備<rt>けいび</rt></ruby><ruby>行動<rt>こうどう</rt></ruby>を要請すべきか、防衛省としての判断を求めます」",
    asashioMissions: [
      "【追加ミッション①：浪寄准教授（PC5）からの生物学的所見の聴取】深海写真に写った「20本以上の無数の触手と数百mの巨大生物」について、浪寄准教授に生物学的な見解を提示させてください。",
      "【追加ミッション②：貝浜リエゾン（PC2）からの法的・防衛的見解の聴取】海上保安庁の警察比例の原則を超える事態に対し、自衛隊の「防衛出動」と「海上警備行動」のどちらを要請すべきか、文民統制の仕組みを踏まえて貝浜リエゾンに判断を示させてください。",
    ],
    gmHandoutNote:
      "Day 3でソノブイ索敵が終わり深海写真を提示する際、長津にアナウンスカード「NG-02」「NG-03」を渡し、朝潮にはこの「Day 3 途中① 指令書」を渡してください。",
  },
  {
    id: "cmd-day3-mid2",
    dayNumber: 3,
    badgeLabel: "DAY 3 途中② 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY03-MID2",
    isMidDayAddition: true,
    linkedNagatsuCardCode: "NG-04",
    timingNote: "専門家2名の所見共有・優先調査の後に配布（長津カード NG-04 と同時）",
    title: "【Day 3 途中②】呼称（コードネーム）決定と指揮官最終決断の要請",
    nagatsuBriefingTitle: "📡 長津からの緊急入電アナウンス（NG-04）",
    nagatsuBriefingText:
      "「――防衛省および内閣官房より至急諮問が入電！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、朝潮危機管理官、指揮官として自衛隊への防衛出動を要請するか、または海上警備行動を発令するか最終意思決定をお願いいたします！」",
    nagatsuBriefingRubyHtml:
      "「――防衛省および<ruby>内閣<rt>ないかく</rt></ruby><ruby>官房<rt>かんぼう</rt></ruby>より至急<ruby>諮問<rt>しもん</rt></ruby>が<ruby>入電<rt>にゅうでん</rt></ruby>！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き<ruby>海神<rt>わたつみ</rt></ruby>に由来する【ワタツミ】、もしくは海洋古伝承の<ruby>異形神<rt>いぎょうしん</rt></ruby>に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、<ruby>朝潮<rt>あさしお</rt></ruby>危機管理官、指揮官として自衛隊への<ruby>防衛<rt>ぼうえい</rt></ruby><ruby>出動<rt>しゅつどう</rt></ruby>を要請するか、または<ruby>海上<rt>かいじょう</rt></ruby><ruby>警備<rt>けいび</rt></ruby><ruby>行動<rt>こうどう</rt></ruby>を発令するか最終意思決定をお願いいたします！」",
    asashioMissions: [
      "【追加ミッション①：未確認巨大生物の公式呼称（コードネーム）の決定】「ワタツミ」「クスルフ」またはチーム独自の名称から、合同対策本部としての公式呼称を合議して決定してください。",
      "【追加ミッション②：自衛隊への要請方針（防衛出動 または 海上警備行動）の最終決断】総指揮官として、自衛隊への「防衛出動」を要請するか「海上警備行動」を発令するか最終意思決定を下してください。",
    ],
    gmHandoutNote:
      "Day 3終盤の最終決断タイミングで、長津にアナウンスカード「NG-04」を渡し、朝潮にはこの「Day 3 途中② 指令書」を渡してください。",
  },
  {
    id: "cmd-day4-start",
    dayNumber: 4,
    badgeLabel: "DAY 4 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY04",
    timingNote: "Day 4 開始時配布",
    title: "【Day 4】明神礁の海底噴火・即応総力体制への移行と進路予測",
    targetMinutes: 25,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      "「未明、鳥島沖の北方に位置する【明神礁】周辺にて新たな海底噴火が発生。さらに八丈島および青ヶ島の地震計が火山性微動を断続的に探知しています。防衛省の水中聴音網（パッシブソナー網）による巨大生物の位置と火山性微動の発生源は完全に一致しており、巨大生物は【日速約150km】で正確に北上を続けています。政府および防衛省より『この巨大生物は一体どこへ向かい、何を引き起こす見立てなのか、合同対策本部の専門的予測を至急提出してほしい』との緊急照会が入っています。なお事態の緊迫化を受け、本日より当合同対策本部は調査枠制限を撤廃する【即応総力体制】へ移行します！」",
    nagatsuBriefingRubyHtml:
      "「<ruby>未明<rt>みめい</rt></ruby>、<ruby>鳥島沖<rt>とりしまおき</rt></ruby>の北方に位置する【<ruby>明神礁<rt>みょうじんしょう</rt></ruby>】周辺にて新たな海底噴火が発生。さらに<ruby>八丈島<rt>はちじょうじま</rt></ruby>および<ruby>青ヶ島<rt>あおがしま</rt></ruby>の地震計が<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>を断続的に探知しています。防衛省の水中<ruby>聴音網<rt>ちょうおんもう</rt></ruby>（パッシブソナー網）による巨大生物の位置と<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>の発生源は完全に一致しており、巨大生物は【<ruby>日速<rt>にっそく</rt></ruby>約150km】で正確に北上を続けています。政府および防衛省より『この巨大生物は一体どこへ向かい、何を引き起こす見立てなのか、合同対策本部の専門的予測を至急提出してほしい』との緊急照会が入っています。なお事態の緊迫化を受け、本日より当合同対策本部は調査枠制限を撤廃する【<ruby>即応<rt>そくおう</rt></ruby><ruby>総力<rt>そうりょく</rt></ruby><ruby>体制<rt>たいせい</rt></ruby>】へ移行します！」",
    asashioMissions: [
      "【ミッション①：即応総力体制による未調査資料の全回収と情報整理】調査制限の撤廃に伴い、これまで未選択だったすべての調査報告・資料を開示させ、東京・現地のメンバー全員で手分けして内容を精査してください。",
      "【ミッション②：北上原因の分析と最終到達予測地点の決定・報告】集まった証拠資料から「なぜこの巨大生物は海底火山を噴火させながら一直線に北上しているのか」の理由を分析したうえで、このまま北上を続けた場合に最終的にどこへ向かい、どんな危機を引き起こす見立てなのか、合同対策本部としての予測結論をまとめて報告してください。",
    ],
    gmHandoutNote:
      "Day 4開始時にGMから朝潮（PC1）（7名時は長津経由）へ渡してください。",
  },
  {
    id: "cmd-day5-start",
    dayNumber: 5,
    badgeLabel: "DAY 5 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY05",
    timingNote: "Day 5 開始時配布（長津カード NG-06 連動）",
    title: "【Day 5】御蔵島沖の海底噴火・海上自衛隊の魚雷攻撃失敗（深海での復活）と防衛省からの緊急照会",
    targetMinutes: 20,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告 ＆ NG-06）",
    nagatsuBriefingText:
      "「伊豆諸島を北上する連続海底噴火を受け、気象庁は【富士山地下深部において微弱な火山性微動が観測された】と発表しました。駿河湾奥までの残距離は【約240km】、現在の巡航速度は【時速5km】であり、危機到達まで【残り48時間】と思われます。そしてたった今、暗号ホットラインに着信！ 貝浜リエゾンへ、防衛省作戦本部より直通無線が接続されました！『八丈島〜御蔵島沖にて魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。目標特有の振動が起きておらず火山性微動も一時収まっているが、アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが、疑問が残る。浪寄准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ 魚雷投下以外の方法があるか検討してほしい』とのことです！」",
    nagatsuBriefingRubyHtml:
      "「<ruby>伊豆<rt>いず</rt></ruby><ruby>諸島<rt>しょとう</rt></ruby>を北上する連続海底噴火を受け、気象庁は【富士山地下深部において微弱な<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>が観測された】と発表しました。<ruby>駿河湾奥<rt>するがわんおく</rt></ruby>までの残距離は【約240km】、現在の<ruby>巡航<rt>じゅんこう</rt></ruby><ruby>速度<rt>そくど</rt></ruby>は【時速5km】であり、危機到達まで【残り48時間】と思われます。そしてたった今、暗号ホットラインに着信！ <ruby>貝浜<rt>かいはま</rt></ruby>リエゾンへ、防衛省作戦本部より直通無線が接続されました！『<ruby>八丈島<rt>はちじょうじま</rt></ruby>〜<ruby>御蔵島沖<rt>みくらじまおき</rt></ruby>にて魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。目標特有の振動が起きておらず<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>も一時収まっているが、アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する<ruby>飽和<rt>ほうわ</rt></ruby><ruby>攻撃<rt>こうげき</rt></ruby>で<ruby>殲滅<rt>せんめつ</rt></ruby>できると主張しているが、疑問が残る。<ruby>浪寄<rt>なみより</rt></ruby>准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ 魚雷投下以外の方法があるか検討してほしい』とのことです！」",
    asashioMissions: [
      "【ミッション①：魚雷命中後に復活してしまう理由の回答】浪寄准教授に「どうして魚雷が命中した後に元の大きさへ復活してしまうのか（生物の正体と魚雷飽和攻撃の限界）」を防衛省作戦本部へ回答させてください。",
      "【ミッション②：魚雷投下以外の有効な作戦の検討】魚雷では倒せない以上、どのような方法であれば巨大生物を撃退できるのか全員で議論し、調査すべき手がかりと作戦の方向性をまとめてください。",
    ],
    gmHandoutNote:
      "Day 5開始時にGMから朝潮（PC1）（7名時は長津経由・NG-06連動）へ渡してください。",
  },
  {
    id: "cmd-day5-mid1",
    dayNumber: 5,
    badgeLabel: "DAY 5 途中① 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY05-MID1",
    isMidDayAddition: true,
    timingNote: "魚雷復活の理由と魚雷投下以外の作戦（祝詞・海野教授の研究の調査とクジラ召喚）を確認した直後に配布（東京都内マップ ＆ 父島A2マップ展開時）",
    title: "【Day 5 途中①】東京本部 × 小笠原現地 分断・同時進行マップ捜索ミッション（吉備津の捜索 ＆ 海野研究3種の回収）",
    nagatsuBriefingTitle: "📡 長津からの広域捜索オペレーション通達",
    nagatsuBriefingText:
      "「――通常兵器である魚雷では超巨大群体の再結合を止められない以上、残された希望は太古の『盟約の祝詞』と『海野教授のクジラ言語研究』だけです！ これより当合同対策本部は、東京本部チームと小笠原現地チームの二手に分かれて同時進行で緊急捜索を開始します！\n　①【東京本部チーム（3名）】は『東京都内 広域捜索マップ（全8拠点）』を使用し、小笠原神社元神主の子どもである【吉備津（きびつ）】を探し出してください。最初の手がかりとして、吉備津という名前と『① 本人住所（江東区）』が判明しています（電話番号は不明です）。\n　②【小笠原現地チーム（4名）】は『父島 現地調査マップ（全8拠点）』を使用し、海野教授のバックアップや実データとして残されている3つの研究――【①クジラ構文規則の草稿】【②解析システムのパスワードを記した書類】【③実録音響データ（4つ）】をすべて探し出してください！」",
    nagatsuBriefingRubyHtml:
      "「――通常兵器である魚雷では超巨大<ruby>群体<rt>ぐんたい</rt></ruby>の再結合を止められない以上、残された希望は太古の『盟約の<ruby>祝詞<rt>のりと</rt></ruby>』と『<ruby>海野<rt>うみの</rt></ruby>教授のクジラ言語研究』だけです！ これより当合同対策本部は、東京本部チームと<ruby>小笠原<rt>おがさわら</rt></ruby>現地チームの二手に分かれて同時進行で緊急捜索を開始します！<br>　①【東京本部チーム（3名）】は『東京都内 広域捜索マップ（全8拠点）』を使用し、<ruby>小笠原<rt>おがさわら</rt></ruby>神社元神主の子どもである【<ruby>吉備津<rt>きびつ</rt></ruby>】を探し出してください。最初の手がかりとして、<ruby>吉備津<rt>きびつ</rt></ruby>という名前と『① 本人住所（<ruby>江東区<rt>こうとうく</rt></ruby>）』が判明しています（電話番号は不明です）。<br>　②【<ruby>小笠原<rt>おがさわら</rt></ruby>現地チーム（4名）】は『<ruby>父島<rt>ちちじま</rt></ruby> 現地調査マップ（全8拠点）』を使用し、<ruby>海野<rt>うみの</rt></ruby>教授のバックアップや実データとして残されている3つの研究――【①クジラ構文規則の草稿】【②解析システムのパスワードを記した書類】【③実録音響データ（4つ）】をすべて探し出してください！」",
    asashioMissions: [
      "【東京本部ミッション：吉備津（きびつ）の足取り追跡と小笠原班への調査支援】東京マップ（全8拠点）でまず『①本人住所（江東区）』を調べ、そこから足取りを追って吉備津本人を発見し、「盟約の祝詞」の口伝（EV-26）と「吉備津の直通連絡先」を入手してください（小笠原班から東京の拠点調査を依頼された場合は連携して対応してください）。",
      "【小笠原現地ミッション：海野教授の友達6人の証言から3つの研究を回収】父島マップ（全8拠点）でまず『①小笠原研究所』などを調べ、海野教授に協力していた6人の友達の証言を東京班とも連携して突き合わせ、小笠原神社（初瀬）・気象庁小笠原観測所（太刀魚）・小笠原水産センター（誰でも可）から【①草稿】【②解析システムパスワード】【③実録音響4つ】の3つすべてを回収してください。",
    ],
    gmHandoutNote:
      "Day 5冒頭の防衛省照会（なぜ復活するか・魚雷投下以外の有効な作戦）の合議後、東京マップと父島A2マップを広げてこの「Day 5 途中① 指令書」を渡してください。両チームの探索完了時にEV-26〜EV-31が開示されます。",
  },
  {
    id: "cmd-day6-start",
    dayNumber: 6,
    badgeLabel: "DAY 6 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY06",
    timingNote: "Day 6 開始時配布",
    title: "【Day 6】巨大生物の完全回復・北上再開と打開策の確立",
    targetMinutes: 20,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      "「予想通りというべきか、本日の【朝8時】の時点で巨大生物がほとんど同じ大きさまで回復。駿河トラフ境界に向けて北上を再開しています。それにあわせて【富士山地下の火山性微動が再開】しました。駿河湾までは【24時間ほどで到達する見込み】で、防衛省からは速やかに対策をまとめるようにと指示がでています。なお、東京班が徹夜で回収した残りの捜査資料と、海野教授の遺品である実録音響データをすべて開示します！」",
    nagatsuBriefingRubyHtml:
      "「予想通りというべきか、本日の【朝8時】の時点で巨大生物がほとんど同じ大きさまで回復。<ruby>駿河<rt>するが</rt></ruby>トラフ境界に向けて北上を再開しています。それにあわせて【富士山地下の<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>が再開】しました。<ruby>駿河湾<rt>するがわん</rt></ruby>までは【24時間ほどで到達する見込み】で、防衛省からは速やかに対策をまとめるようにと指示がでています。なお、東京班が徹夜で回収した残りの捜査資料と、<ruby>海野<rt>うみの</rt></ruby>教授の遺品である実録音響データをすべて開示します！」",
    asashioMissions: [
      "【ミッション①：<ruby>海野<rt>うみの</rt></ruby>教授の実録音響データの解析】海野教授の構文規則（EV-27）と4つの実録音響データ（EV-28〜31）を分析、マッコウクジラ音響言語解析システムにアクセスしてください。",
      "【ミッション②：海上自衛隊の魚雷以外の方法で24時間以内に巨大生物を撃退する作戦を立案】これまでの全ての情報から、24時間後の駿河湾到達までにどうやって巨大生物を撃退するか、具体的な作戦をまとめてください。",
    ],
    gmHandoutNote:
      "Day 6開始時にGMから朝潮（PC1）（7名時は長津経由）へ渡してください。",
  },
  {
    id: "cmd-day6-mid1",
    dayNumber: 6,
    badgeLabel: "DAY 6 途中① 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY06-MID1",
    isMidDayAddition: true,
    linkedNagatsuCardCode: "SP-07",
    timingNote: "「新言語祝詞」の音声信号が完成した直後に配布（長津の特別配布カード SP-07 連動）",
    title: "【Day 6 途中①】防衛省 岸部運用企画局長への直通交渉",
    nagatsuBriefingTitle: "📡 長津からの申し出アナウンス（SP-07連動）",
    nagatsuBriefingText:
      "「――クジラを呼び寄せる新言語祝詞の音声が完成しましたね！ しかし、防衛省の上層部は『さらなる魚雷の飽和攻撃』の準備を進めており、通常のルートで上申しても潜水艦で祝詞の音声を流すような作戦は到底承認されません。……朝潮危機管理官、皆さん、実は防衛省で自衛隊部隊の運用を統括する最高責任者・【運用企画局長の岸部（きしべ）】は私の親戚（叔父）にあたりまして、直通の連絡先を持っています。厳格な現実主義者ですが、科学的な根拠と計算に基づく進言であれば耳を傾けてくれるはずです。準備が整い次第、回線を繋ぎますので直接説得を頼みます！」",
    nagatsuBriefingRubyHtml:
      "「――クジラを呼び寄せる新言語<ruby>祝詞<rt>のりと</rt></ruby>の音声が完成しましたね！ しかし、防衛省の上層部は『さらなる魚雷の<ruby>飽和<rt>ほうわ</rt></ruby><ruby>攻撃<rt>こうげき</rt></ruby>』の準備を進めており、通常のルートで上申しても潜水艦で<ruby>祝詞<rt>のりと</rt></ruby>の音声を流すような作戦は到底承認されません。……<ruby>朝潮<rt>あさしお</rt></ruby>危機管理官、皆さん、実は防衛省で自衛隊部隊の運用を統括する最高責任者・【<ruby>運用<rt>うんよう</rt></ruby><ruby>企画<rt>きかく</rt></ruby><ruby>局長<rt>きょくちょう</rt></ruby>の<ruby>岸部<rt>きしべ</rt></ruby>】は私の親戚（叔父）にあたりまして、直通の連絡先を持っています。厳格な現実主義者ですが、科学的な根拠と計算に基づく進言であれば耳を傾けてくれるはずです。準備が整い次第、回線を繋ぎますので直接説得を頼みます！」",
    asashioMissions: [
      "【追加ミッション①：岸部運用企画局長を説得するための論理整理】直通回線を繋ぐ前に、「なぜ魚雷の飽和攻撃ではなくクジラでなければならないのか」「どの深海層からどうやって音を届けるのか」「なぜ明朝ではなく今夜のうちに潜水艦を動かさなければならないのか」の根拠を整理してください。",
      "【追加ミッション②：岸部運用企画局長との直接電話交渉と出動承認の獲得】長津に指示して岸部運用企画局長へ直通電話を繋ぎ、直接交渉して作戦の承認と海上自衛隊（第1潜水隊群）の協力を取り付けてください。",
    ],
    gmHandoutNote:
      "Day 6で「新言語祝詞」の音声信号が完成した段階で、朝潮へこの「Day 6 途中① 指令書」を渡してください（岸部局長の説得成功後に長津カード「NG-07」を読み上げます）。",
  },
  {
    id: "cmd-day7-start",
    dayNumber: 7,
    badgeLabel: "DAY 7 指令書",
    sheetCode: "COMMAND-BRIEFING-DAY07",
    timingNote: "Day 7 開始時配布",
    title: "【Day 7】最終決戦の観測と合同対策本部の幕引き",
    targetMinutes: 15,
    nagatsuBriefingTitle: "📡 長津からの緊急通信ブリーフィング（状況報告）",
    nagatsuBriefingText:
      "「夜明けを迎えました。現状、【富士山地下の火山性微動は継続】しており、巨大生物は水深600〜1,000mを維持して【駿河湾付近まで接近】しています！ 周辺海域に展開する海上自衛隊の潜水艦部隊および水中聴音網（パッシブソナー網）より、順次リアルタイムの探知状況と気象庁の火山観測データが入電いたします！」",
    nagatsuBriefingRubyHtml:
      "「夜明けを迎えました。現状、【富士山地下の<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>は継続】しており、巨大生物は水深600〜1,000mを維持して【<ruby>駿河湾<rt>するがわん</rt></ruby>付近まで接近】しています！ 周辺海域に展開する海上自衛隊の<ruby>潜水艦<rt>せんすいかん</rt></ruby><ruby>部隊<rt>ぶたい</rt></ruby>および水中<ruby>聴音網<rt>ちょうおんもう</rt></ruby>（パッシブソナー網）より、順次リアルタイムの探知状況と気象庁の火山観測データが<ruby>入電<rt>にゅうでん</rt></ruby>いたします！」",
    asashioMissions: [
      "【ミッション①：政府・防衛省上層部からの最終通達への応対】事態収束後、防衛省・政府側から今回の事案の取り扱いについて連絡が入った場合は、合同対策本部の総指揮官としてこれに応対してください。",
      "【ミッション②：合同対策本部の解散宣言】すべての対応が完了した後、「皆さん、これで合同対策本部を解散します。お疲れ様でした」と解散を宣言してください。",
    ],
    gmHandoutNote:
      "Day 7開始時にGMから朝潮（PC1）（7名時は長津経由）へ渡してください。",
  },
];
/**
 * 7名プレイ用 PC7（海上保安庁東京本部 総合オペレーター：長津）
 * ※6名プレイ時はGM（進行役NPC）が担当し、7名プレイ時はプレイヤーが担当する
 */
export const pc7Character = {
  id: "pc-7",
  name: "長津（ながつ）",
  profession: "海上保安庁東京本部　総合オペレーター",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "headquarters" as const,
  introduction:
    "　あなたは海上保安庁の東京本部に勤務する総合オペレーターだ。全国の管区や巡視船、航空機、気象庁、そして小笠原現地と東京本部を結ぶあらゆる通信回線からの連絡を受けることができ、各所への連絡も可能だ。\n　あなたは祖父を海で亡くしている。日本の南の海上で、あなたの祖父の乗る船が突如音信不通になった。この海底火山の爆発音は、深海の<ruby>SOFAR<rt>ソーファー</rt></ruby>層を通ってアメリカに設置された水中マイク（ハイドロフォン）で検知されていた。そのため、日本では原因不明だった船は、海底火山の爆発に巻き込まれたと判明した。\n　あなたはその海の恐ろしさを感じながらも、海の上の安全を守るために海上保安庁を目指すことにした。あなたの家族や親戚にも海上自衛隊や海上保安庁に勤めている人間が多い。これは、祖父の何かが自分たちに引き継がれているからなのかもしれない。\n　祖父はよく「海の中は見えない。だから海の中で起きていることを想像する力が必要だ」と言っていた。\n　1ヶ月前、あなたは小笠原の離島通信中継局の定期点検のため現地へ出張しており、他のメンバーと同じく満天の夜空から降り注ぐ美しい流星雨を目撃した。朝潮危機管理官は、夜の浜辺で何かを大事そうにハンカチに包んで持ち帰っている様子だった。\n　本日、小笠原南西沖での民間チャーター船「パパズドルフィン（40t）」の救難信号とAIS停波を最初に検知したあなたは、直ちに朝潮危機管理官へ緊急報告を上げ、東京本部と小笠原現地を繋ぐ合同海難対策本部の通信回線を開設した。",
  initialItems: [],
  capabilities: [],
  handout: {
    publicProfile:
      "海上保安庁東京本部の総合オペレーター。東京本部と小笠原現地を結ぶ司令室の要。",
    internalDrama: {
      pride:
        "　『自分が繋ぐ一本の通信回線と、一瞬の情報整理の正確さが、現場の救難隊員と国民の命を繋ぐ最後の命綱である』というオペレーターとしての強い誇りを持っている。総指揮官である朝潮を誰よりも信頼し、補佐している。",
      loss:
        "　約70年程前、海上保安庁の船が海底火山の調査中に遭難事故に遭い乗組員全員が犠牲になったことがある。あなたの祖父はその船に乗り組んでおり、海上保安庁の職員として殉職してしまった。二度と同じような事故を繰り返させないという強い思いを持っている。",
    },
    backgroundTimeline: "",
    handoutBody:
      "「海上保安庁東京本部の長津（ながつ）です。当対策本部の総合オペレーターとして、東京と小笠原現地、および気象庁・関係各所からの緊急入電の集約を担当します。全員無事でこの危機を乗り切りましょう、よろしくお願いいたします！」",
  },
};

/**
 * 特別配布カード（全7枚・証拠資料と同サイズ・順次開示）
 */
export const SPECIAL_CHARACTER_CARDS: SpecialCharacterCard[] = [
  {
    id: "sp-card-1",
    cardCode: "SP-01",
    characterId: "pc-1",
    characterName: "朝潮（あさしお）",
    profession: "海上保安庁東京本部の危機管理官",
    revealDayLabel: "初期配布",
    revealDayNumber: 1,
    title: "黒い小さな隕石のかけら",
    frontTitleHtml: "黒い小さな<br>隕石のかけら",
    description: `　あなたが1ヶ月前に小笠原を訪れ、満天の流星雨を眺めた際、海岸近くで偶然拾って持ち帰った黒く光る小さな石のかけら。
　手のひらに収まるほどの大きさだが、見た目に反してずっしりとした奇妙な重みがあり、【方位磁針を近づけると針がわずかに振れるほどの磁気】を帯びている。
　専門機関で調べれば、この石の特異な性質が分かるかもしれない。一刻を争うタイミングでの公開は混乱を招くだろう。適切なタイミングで共有しよう。`,
    categoryLabel: "特別配布カード（朝潮）",
    accentHex: "#1e40af",
  },
  {
    id: "sp-card-2",
    cardCode: "SP-02",
    characterId: "pc-3",
    characterName: "坂凪（さかなぎ）",
    profession: "海上保安庁小笠原支部　巡視船船長",
    revealDayLabel: "Day 2 配布",
    revealDayNumber: 2,
    title: "海野教授の最期",
    frontTitleHtml: "<ruby>海野<rt>うみの</rt></ruby>教授の最期",
    description: `　数年前、海洋科学大学の<ruby>海野<rt>うみの</rt></ruby>教授が小笠原の沖合で単独ダイビング中に意識を失い、あなたの乗る海上保安庁の巡視船によって緊急救助された際の記憶。
　甲板へ引き揚げられた海野教授は、深海の冷水に晒されすでに命の灯が消えかけていたが、救命処置を施すあなたの腕を強く掴み、青白く震える唇でこう言い残して息を引き取った。
　『私には時間が残されていなかった。……私は、【狂気の深淵】をのぞいてしまった……あの白いクジラがコーダだったんだ』`,
    categoryLabel: "特別配布カード（坂凪）",
    accentHex: "#0f766e",
  },
  {
    id: "sp-card-3",
    cardCode: "SP-03",
    characterId: "pc-4",
    characterName: "太刀魚（たちうお）",
    profession: "気象庁 小笠原観測所 職員",
    revealDayLabel: "Day 4 配布",
    revealDayNumber: 4,
    title: "SOFAR層の特異性",
    frontTitleHtml: "SOFAR層の特異性",
    description: `　あなたは海洋音響学におけるSOFAR層の観測特性について熟知している。
　海面下約800〜1,000m付近には、水温の低下と水圧の上昇が釣り合い、海中で最も音の速度が遅くなる【SOFAR（ソーファー）層】が存在する。
　音には速度の遅い層へ屈折して閉じ込められる性質があるため、この【水深1,000mで放たれた音】（特に減衰しにくい低周波音や強力なパルス音）は、海面や海底にぶつかって消えることなく、層の中をトンネルのように伝わり【最大10,000km（1万km）彼方まで到達】する。`,
    glossaryNote: `※SOFAR（ソーファー）層とは：水深約800〜1,000mにある「音が海面や海底に逃げず、遠くまで非常に届きやすい特別な海の層」のこと。`,
    categoryLabel: "特別配布カード（太刀魚）",
    accentHex: "#0284c7",
  },
  {
    id: "sp-card-4",
    cardCode: "SP-04",
    characterId: "pc-2",
    characterName: "貝浜（かいはま）",
    profession: "情報通信・音響分析官（防衛省リエゾン）",
    revealDayLabel: "Day 3 配布",
    revealDayNumber: 3,
    title: "文民統制の仕組み",
    frontTitleHtml: "文民統制の仕組み",
    description: `　日本における自衛隊の行動と文民統制（シビリアン・コントロール）に関する法規メモ。
　自衛隊は強大な実力組織であるため、その出動には厳格な法的根拠と政治的承認（内閣総理大臣や防衛大臣の命令・閣議決定等）が不可欠である。
　① 【海上警備行動】：海上保安庁の能力を超える事態に対し、防衛大臣が総理大臣の承認を得て発令できるが、武器使用は警察比例の原則に縛られる。
　② 【防衛出動】：外部からの武力攻撃事態に対して総理大臣が発令できる。自然災害や未知の海洋生物は「外国の武力攻撃」ではないため、原則として適用できない。`,
    glossaryNote: `※文民統制とは：自衛隊などの実力組織を、軍人ではなく選挙で選ばれた総理大臣などの政治家が指揮・監督する仕組み。\n※警察比例の原則とは：相手の危険度を超えるような過剰な武器（魚雷やミサイルなど）を使ってはならないという警察行動上の制限ルール。`,
    categoryLabel: "特別配布カード（貝浜）",
    accentHex: "#334155",
  },
  {
    id: "sp-card-5",
    cardCode: "SP-05",
    characterId: "pc-6",
    characterName: "初瀬（はつせ）",
    profession: "小笠原役場勤務（救護担当）",
    revealDayLabel: "Day 4 配布",
    revealDayNumber: 4,
    title: "神社の祝詞の複製",
    frontTitleHtml: "神社の祝詞の複製",
    description: `　小笠原神社の宝物庫から盗み出された古文書「盟約の祝詞」について、あなたの実家（旧家）に控えとして保管されていた複製。
　巻物の冒頭には、祝詞の内容と共に注釈が記されている。
　祝詞として『人と勇魚の契り　小笠原へ集ひ来よ　大獲物ぞ　集ひ来よ』とあり、注釈として『――祝詞の言の葉そのものに験があるにあらず。言の葉をただ声高に唱うるのみでは届かじ。定めの順を違えず、海の中へと音を響かせよ』と記載されている。`,
    rubyHtml: `　小笠原神社の宝物庫から盗み出された古文書「盟約の<ruby>祝詞<rt>のりと</rt></ruby>」について、あなたの実家（旧家）に控えとして保管されていた複製。<br>　巻物の冒頭には、祝詞の内容と共に注釈が記されている。<br>　祝詞として『人と<ruby>勇魚<rt>いさな</rt></ruby>の<ruby>契<rt>ちぎ</rt></ruby>り　<ruby>小笠原<rt>おがさわら</rt></ruby>へ<ruby>集<rt>つど</rt></ruby>ひ<ruby>来<rt>こ</rt></ruby>よ　<ruby>大獲物<rt>おおえもの</rt></ruby>ぞ　<ruby>集<rt>つど</rt></ruby>ひ<ruby>来<rt>こ</rt></ruby>よ』とあり、注釈として『――祝詞の<ruby>言の葉<rt>ことのは</rt></ruby>そのものに<ruby>験<rt>しるし</rt></ruby>があるにあらず。<ruby>言の葉<rt>ことのは</rt></ruby>をただ<ruby>声高<rt>こわだか</rt></ruby>に<ruby>唱<rt>とな</rt></ruby>うるのみでは届かじ。定めの順を<ruby>違<rt>たが</rt></ruby>えず、海の中へと<ruby>音<rt>ね</rt></ruby>を響かせよ』と記載されている。`,
    categoryLabel: "特別配布カード（初瀬）",
    accentHex: "#b45309",
  },
  {
    id: "sp-card-6",
    cardCode: "SP-06",
    characterId: "pc-5",
    characterName: "浪寄（なみより）",
    profession: "海洋科学大学 小笠原研究所 准教授",
    revealDayLabel: "Day 6 配布",
    revealDayNumber: 6,
    title: "マッコウクジラクリック音の距離限界と集合に必要な時間",
    frontTitleHtml: "マッコウクジラ<br>クリック音の距離限界と<br>集合に必要な時間",
    description: `　あなたのマッコウクジラに関しての生態学的知見。
　マッコウクジラが発するクリック音は、通常の海域では数十kmほどで減衰してしまう。過去の事例では、この盟約の<ruby>祝詞<rt>のりと</rt></ruby>は海面近くでしか聞こえなかったはずで、クジラ側が特別な行動をしているのかもしれない。
　あるいは音が減衰しない深海層を通じて、水中スピーカー（水中音響送信機）で深海に人工音源を大出力で放流することで、広大な海域の群れへ一斉に伝達することができる。
　ただし、現在小笠原〜伊豆諸島沖の太平洋に散らばっているマッコウクジラの群れが、音を受け取ってから全速力で泳いで特定の海域（本州沿岸や駿河湾など）へ集結するまでには、その遊泳速度を考慮すると【6〜8時間の移動時間】が必要となる。`,
    categoryLabel: "特別配布カード（浪寄）",
    accentHex: "#4338ca",
  },
  {
    id: "sp-card-7",
    cardCode: "SP-07",
    characterId: "pc-7",
    characterName: "長津（ながつ）",
    profession: "海上保安庁東京本部　総合オペレーター",
    revealDayLabel: "Day 6 配布",
    revealDayNumber: 6,
    title: "防衛省 運用企画局長とのコネクション",
    frontTitleHtml: "防衛省 運用企画局長との<br>コネクション",
    description: `　防衛省において自衛隊部隊の運用や潜水艦の行動計画を統括する実務の最高責任者・【運用企画局長の岸部（きしべ）】は、実はあなたの親戚（叔父）にあたる人物である。
　岸部局長は厳格な現実主義者であり、曖昧な推測やオカルトめいた話では絶対に首を縦に振らないが、科学的な根拠と冷徹な計算に基づく進言であれば、深夜であっても直通電話で耳を傾け、【自身の責任で第1潜水隊群（潜水艦部隊）を動かす権限】を持っている。
　合同対策本部のメンバーがクジラを呼ぶ<ruby>祝詞<rt>のりと</rt></ruby>の音源を完成させたなら、あなたのこの個人的コネクションを使って、岸部局長との直通ホットラインを繋ぐことができる。`,
    categoryLabel: "特別配布カード（長津）",
    accentHex: "#be123c",
  },
  {
    id: "sp-card-8",
    cardCode: "SP-08",
    characterId: "pc-1",
    characterName: "朝潮（あさしお）",
    profession: "海上保安庁東京本部の危機管理官",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "組織の論理",
    frontTitleHtml: "組織の論理",
    description: `　海上自衛隊の出動は総理大臣の決断と閣議決定に基づく公式方針であり、昨夜、防衛省の岸部運用企画局長もその権限のもとで我々の要請に応え、潜水艦部隊を動かしてくれた。
　国家機関の組織に属する人間として、上位からの命令や、協力してくれた岸部局長の顔を立てることは当然の責務である。もし「自衛隊は何もせず解決した」と発表すれば、政府や防衛省の立場を損なうことになる。
　【クジラを巻き込んでの発砲もやむなし】として、【海上自衛隊の戦果として処理する案】を選ぶべきだ。`,
    categoryLabel: "特別配布カード（朝潮）",
    accentHex: "#1d4ed8",
  },
  {
    id: "sp-card-9",
    cardCode: "SP-09",
    characterId: "pc-2",
    characterName: "貝浜（かいはま）",
    profession: "情報通信・音響分析官（防衛省リエゾン）",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "組織の論理",
    frontTitleHtml: "組織の論理",
    description: `　海上自衛隊の出動は総理大臣の決断と閣議決定に基づく公式方針であり、昨夜、防衛省の岸部運用企画局長もその権限のもとで我々の要請に応え、潜水艦部隊を動かしてくれた。
　国家機関の組織に属する人間として、上位からの命令や、協力してくれた岸部局長の顔を立てることは当然の責務である。もし「自衛隊は何もせず解決した」と発表すれば、政府や防衛省の立場を損なうことになる。
　【クジラを巻き込んでの発砲もやむなし】として、【海上自衛隊の戦果として処理する案】を選ぶべきだ。
　特に国会を止めてまで時間を作って防衛大臣と総理に決断をさせている。海上自衛隊はともかく、総理や防衛大臣のような立場がまた同じようなことが起きた場合に防衛予算の削減や決断の遅れが出ないことが大事ではないだろうか。`,
    categoryLabel: "特別配布カード（貝浜）",
    accentHex: "#1d4ed8",
  },
  {
    id: "sp-card-10",
    cardCode: "SP-10",
    characterId: "pc-7",
    characterName: "長津（ながつ）",
    profession: "海上保安庁東京本部　総合オペレーター",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "組織の論理",
    frontTitleHtml: "組織の論理",
    description: `　海上自衛隊の出動は総理大臣の決断と閣議決定に基づく公式方針であり、昨夜、防衛省の岸部運用企画局長もその権限のもとで我々の要請に応え、潜水艦部隊を動かしてくれた。
　国家機関の組織に属する人間として、上位からの命令や、協力してくれた岸部局長の顔を立てることは当然の責務である。もし「自衛隊は何もせず解決した」と発表すれば、政府や防衛省の立場を損なうことになる。
　【クジラを巻き込んでの発砲もやむなし】として、【海上自衛隊の戦果として処理する案】を選ぶべきだ。
　モニターを観察し続けているあなたは、もしもう一度クジラにメッセージを送ったとしても、全速力で駆けつけ、戦い終わったばかりのクジラ達はメッセージに反応しないのではないかと思えた。`,
    categoryLabel: "特別配布カード（長津）",
    accentHex: "#1d4ed8",
  },
  {
    id: "sp-card-11",
    cardCode: "SP-11",
    characterId: "pc-3",
    characterName: "坂凪（さかなぎ）",
    profession: "海上保安庁小笠原支部　巡視船船長",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "組織と現場の狭間",
    frontTitleHtml: "組織と現場の狭間",
    description: `　あなたは海上保安庁の船長であり、上位からの命令や、潜水艦を動かしてくれた岸部局長の顔を立てるため【クジラを巻き込んでの発砲もやむなし】とする組織の論理も理解できる。
　しかし、駿河湾の群れの先頭にいる「白いクジラ」は、かつて亡き姉と挨拶を交わし、<ruby>海野<rt>うみの</rt></ruby>教授が最期に『あの白いクジラがコーダだったんだ』と言い残した個体だ。非常に知能が発達し人間とコーダで意思疎通が可能な、100頭に1頭いるかいないかのリーダー個体であり、もし発砲でこのクジラが死ねば【人間とクジラの盟約が途切れる可能性】がある。`,
    categoryLabel: "特別配布カード（坂凪）",
    accentHex: "#7e22ce",
  },
  {
    id: "sp-card-12",
    cardCode: "SP-12",
    characterId: "pc-4",
    characterName: "太刀魚（たちうお）",
    profession: "気象庁 小笠原観測所 職員",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "盟約断絶の危機",
    frontTitleHtml: "盟約断絶の危機",
    description: `　駿河湾の100頭以上の先頭にいる「白いクジラ」こそ、非常に知能が発達し人間とコーダ（クリック音）で意思疎通が可能な、100頭に1頭いるかいないかのリーダー個体だ。
　あなたが手話と音声言語の間で両親の通訳をしてきたのと同じように、あの白いクジラは人間とクジラの間をつなぐ「コーダ（通訳者）」として群れを導いてくれた。もし自衛隊の発砲でこのリーダー個体が死んでしまえば、【人間とクジラの盟約が途切れる可能性】がある。クジラへの発砲など絶対にありえない。
　これまで地震や火山について情報を提供してきた気象台の施設は老朽化が進んでいる。今回の件で注目が集まれば、追加予算もありえる。将来を考えればこそ、自分たちの功績にするべきではないのだろうか。`,
    categoryLabel: "特別配布カード（太刀魚）",
    accentHex: "#dc2626",
  },
  {
    id: "sp-card-13",
    cardCode: "SP-13",
    characterId: "pc-6",
    characterName: "初瀬（はつせ）",
    profession: "小笠原役場勤務（救護担当）",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "盟約断絶の危機",
    frontTitleHtml: "盟約断絶の危機",
    description: `　駿河湾の100頭以上の先頭にいる「白いクジラ」は、かつて幼いあなたが沖へ流されたときに命を救ってくれたあの白いクジラだ。
　あのクジラは非常に知能が発達し人間とコーダ（クリック音）で意思疎通が可能な、100頭に1頭いるかいないかのリーダー個体であり、人間とクジラの仲立ちとなって群れを導いてくれた。もし自衛隊の発砲でこのリーダー個体が死んでしまえば、【人間とクジラの盟約が途切れる可能性】がある。クジラへの発砲など絶対にありえない。
　仮に今からクジラにメッセージを送って逃がそうとしたとしても、攻撃があれば一定数のクジラへの被害は避けられないだろう。命の恩人だけではなく、他のクジラを含めて無傷で帰すには、攻撃命令の撤回が必要ではないだろうか。`,
    categoryLabel: "特別配布カード（初瀬）",
    accentHex: "#dc2626",
  },
  {
    id: "sp-card-14",
    cardCode: "SP-14",
    characterId: "pc-5",
    characterName: "浪寄（なみより）",
    profession: "海洋科学大学 小笠原研究所 准教授",
    revealDayLabel: "Day 7 配布",
    revealDayNumber: 7,
    title: "海野研究の危険性",
    frontTitleHtml: "<ruby>海野<rt>うみの</rt></ruby>研究の危険性",
    description: `　今回の作戦を通じて、恩師・<ruby>海野<rt>うみの</rt></ruby>教授のクジラ言語研究はついに完成を見た。しかし、この研究成果が世に公開されることは【クジラが高度な知的生物である】と証明することを意味し、それは捕鯨を推進する一派にとって非常に不都合なことになる。
　かつて海野教授がこの研究を諦め、あなたに『私の研究ではなく自分の研究分野でまず成功しなさい』と別の研究をするよう勧めた本当の理由が分かった――教授は、この研究がもたらす危険からあなたを守ろうとしたのだ。
　もし対策本部が世間の注目を集めれば、この研究の存在も暴かれてしまう。あなたは【自分がヒーローになることを望まない】。`,
    categoryLabel: "特別配布カード（浪寄）",
    accentHex: "#dc2626",
  },
];

/**
 * 長津（PC7）専用 フェーズ進行＆ミッション達成時アナウンスカード（証拠カード同サイズ・表裏仕様）
 */
export const NAGATSU_PHASE_CARDS: NagatsuPhaseCard[] = [
  {
    id: "ng-card-2",
    cardCode: "NG-02",
    dayNumber: 3,
    timingBadge: "Day 3 途中①",
    title: "目標捕捉と北上速度・位置予測の報告",
    frontTitleHtml: "目標捕捉と北上速度・<br>位置予測の報告",
    description: `「――洋上捜索ヘリより入電！ アクティブソナーにより鳥島沖の深海で巨大生物の現在位置を捕捉いたしました！ これまでの移動経路と時刻から算出すると、巨大生物は【時速約6km・日速約150km】のペースで北上を続けており、このまま進めば明日（Day 4）にはさらに北方の【明神礁（みょうじんしょう）周辺】へ到達する見込みです！」`,
    rubyHtml: `「――洋上捜索ヘリより<ruby>入電<rt>にゅうでん</rt></ruby>！ アクティブソナーにより<ruby>鳥島沖<rt>とりしまおき</rt></ruby>の深海で巨大生物の現在位置を捕捉いたしました！ これまでの移動経路と時刻から算出すると、巨大生物は【時速約6km・<ruby>日速<rt>にっそく</rt></ruby>約150km】のペースで北上を続けており、このまま進めば明日（Day 4）にはさらに北方の【<ruby>明神礁<rt>みょうじんしょう</rt></ruby>周辺】へ到達する見込みです！」`,
    accentHex: "#0284c7",
  },
  {
    id: "ng-card-3",
    cardCode: "NG-03",
    dayNumber: 3,
    timingBadge: "Day 3 途中①（写真）",
    title: "深海写真の受信と専門家2名への緊急諮問",
    frontTitleHtml: "深海写真の受信と<br>専門家2名への緊急諮問",
    description: `「――続けて洋上捜索ヘリより緊急入電！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大生物、そして20本以上の無数の触手群を確認！
① 浪寄准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。
② 貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則ではこの規模の目標に対処不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」`,
    rubyHtml: `「――続けて洋上捜索ヘリより<ruby>緊急<rt>きんきゅう</rt></ruby><ruby>入電<rt>にゅうでん</rt></ruby>！ 撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む<ruby>漆黒<rt>しっこく</rt></ruby>の巨大生物、そして20本以上の無数の<ruby>触手群<rt>しょくしゅぐん</rt></ruby>を確認！<br>① <ruby>浪寄<rt>なみより</rt></ruby>准教授、通常のダイオウイカ（10本）と明らかに異なる無数の触手と数百mの巨大生物について、生物学的な所見を提示してください。<br>② <ruby>貝浜<rt>かいはま</rt></ruby>リエゾン、海上保安庁法20条に基づく<ruby>警察<rt>けいさつ</rt></ruby><ruby>比例<rt>ひれい</rt></ruby>の<ruby>原則<rt>げんそく</rt></ruby>ではこの規模の目標に対処不可能です。法的に自衛隊の<ruby>防衛<rt>ぼうえい</rt></ruby><ruby>出動<rt>しゅつどう</rt></ruby>、あるいは<ruby>海上<rt>かいじょう</rt></ruby><ruby>警備<rt>けいび</rt></ruby><ruby>行動<rt>こうどう</rt></ruby>を要請すべきか、防衛省としての判断を求めます」`,
    accentHex: "#4338ca",
  },
  {
    id: "ng-card-4",
    cardCode: "NG-04",
    dayNumber: 3,
    timingBadge: "Day 3 達成時",
    title: "呼称（コードネーム）決定と指揮官最終決断の要請",
    frontTitleHtml: "呼称（コードネーム）決定と<br>指揮官最終決断の要請",
    description: `「――防衛省および内閣官房より至急諮問が入電！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、朝潮危機管理官、指揮官として自衛隊への防衛出動を要請するか、または海上警備行動を発令するか最終意思決定をお願いいたします！」`,
    rubyHtml: `「――防衛省および<ruby>内閣<rt>ないかく</rt></ruby><ruby>官房<rt>かんぼう</rt></ruby>より至急<ruby>諮問<rt>しもん</rt></ruby>が<ruby>入電<rt>にゅうでん</rt></ruby>！『今後の公式対処記録および部隊動員計画にあたり、この未確認巨大生物の公式呼称（コードネーム）を当合同対策本部で決定してほしい』とのことです。現在、上層部からは日本神話の古き<ruby>海神<rt>わたつみ</rt></ruby>に由来する【ワタツミ】、もしくは海洋古伝承の<ruby>異形神<rt>いぎょうしん</rt></ruby>に由来する【クスルフ】の2案が有力候補として提示されています（チーム独自の命名でも構いません）。呼称を決定のうえ、<ruby>朝潮<rt>あさしお</rt></ruby>危機管理官、指揮官として自衛隊への<ruby>防衛<rt>ぼうえい</rt></ruby><ruby>出動<rt>しゅつどう</rt></ruby>を要請するか、または<ruby>海上<rt>かいじょう</rt></ruby><ruby>警備<rt>けいび</rt></ruby><ruby>行動<rt>こうどう</rt></ruby>を発令するか最終意思決定をお願いいたします！」`,
    accentHex: "#1e40af",
  },
  {
    id: "ng-card-5",
    cardCode: "NG-05",
    dayNumber: 4,
    timingBadge: "Day 4 達成時",
    title: "防衛省「害獣駆除」方針による海上自衛隊動員通達",
    frontTitleHtml: "防衛省「害獣駆除」方針による<br>海上自衛隊動員通達",
    description: `「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊の動員を正式決定いたしました！ 八丈島〜御蔵島沖にて通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」`,
    rubyHtml: `「――防衛省より至急通達が<ruby>入電<rt>にゅうでん</rt></ruby>！ <ruby>内閣<rt>ないかく</rt></ruby><ruby>法制局<rt>ほうせいきょく</rt></ruby>の見解により武力侵略に対する『<ruby>防衛<rt>ぼうえい</rt></ruby><ruby>出動<rt>しゅつどう</rt></ruby>』は見送られましたが、国民への重大危機を<ruby>看過<rt>かんか</rt></ruby>できない防衛省は内閣の合意を取り付け、【<ruby>害獣<rt>がいじゅう</rt></ruby><ruby>駆除<rt>くじょ</rt></ruby>（<ruby>有害<rt>ゆうがい</rt></ruby><ruby>鳥獣<rt>ちょうじゅう</rt></ruby><ruby>等<rt>とう</rt></ruby><ruby>駆除<rt>くじょ</rt></ruby>・<ruby>災害<rt>さいがい</rt></ruby><ruby>派遣<rt>はけん</rt></ruby>）】という方針に基づき、海上自衛隊の動員を正式決定いたしました！ <ruby>八丈島<rt>はちじょうじま</rt></ruby>〜<ruby>御蔵島沖<rt>みくらじまおき</rt></ruby>にて通常兵器（最新鋭魚雷・<ruby>爆雷<rt>ばくらい</rt></ruby>）による一斉駆除作戦を<ruby>敢行<rt>かんこう</rt></ruby>します！」`,
    accentHex: "#b91c1c",
  },
  {
    id: "ng-card-6",
    cardCode: "NG-06",
    dayNumber: 5,
    timingBadge: "Day 5 開始時",
    title: "魚雷命中後のソナー観測報告と防衛省からの緊急照会",
    frontTitleHtml: "魚雷命中後のソナー観測報告と<br>防衛省からの緊急照会",
    description: `「――暗号ホットラインに着信！ 貝浜リエゾンへ、防衛省作戦本部より直通無線が接続されました！『魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。しかし、目標が発している特有の振動が起きておらず、それにあわせて火山性の周期的な微動が収まっていることを確認できている。アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する飽和攻撃で殲滅できると主張しているが、疑問が残る。浪寄准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ 魚雷投下以外の方法があるか検討してほしい』とのことです！」`,
    rubyHtml: `「――暗号ホットラインに着信！ <ruby>貝浜<rt>かいはま</rt></ruby>リエゾンへ、防衛省作戦本部より直通無線が接続されました！『魚雷群が命中したと思われるが、目標の活動が停止しているかどうかは不明だ。しかし、目標が発している特有の振動が起きておらず、それにあわせて<ruby>火山性<rt>かざんせい</rt></ruby>の周期的な<ruby>微動<rt>びどう</rt></ruby>が収まっていることを確認できている。アクティブソナーでの確認では、【ゆっくりと深海に沈みこみながら、元の大きさに戻っている傾向】が確認できる。上層部ではさらに魚雷を投下する<ruby>飽和<rt>ほうわ</rt></ruby><ruby>攻撃<rt>こうげき</rt></ruby>で<ruby>殲滅<rt>せんめつ</rt></ruby>できると主張しているが、疑問が残る。<ruby>浪寄<rt>なみより</rt></ruby>准教授の意見を確認しておいてくれ！ あいつらはどうして魚雷の命中後に復活してしまうのか？ 魚雷投下以外の方法があるか検討してほしい』とのことです！」`,
    accentHex: "#be123c",
  },
  {
    id: "ng-card-7",
    cardCode: "NG-07",
    dayNumber: 6,
    timingBadge: "Day 6 達成時",
    title: "深海SOFAR層での新言語祝詞・放流開始",
    frontTitleHtml: "深海SOFAR層での<br>新言語祝詞・放流開始",
    description: `「――海上自衛隊の潜水艦が水深1,000mの深海SOFAR層へ到達！ 水中スピーカー（水中音響送信機）より、人工音源（新言語祝詞）の大出力での放流を開始いたしました！ 音波はSOFAR層に乗って、太平洋全域へと急速に拡散しています！ あとは夜明けの決戦までに、マッコウクジラの大群が駿河湾へ集結してくれるのを祈りましょう！」`,
    rubyHtml: `「――海上自衛隊の潜水艦が水深1,000mの深海<ruby>SOFAR<rt>ソーファー</rt></ruby>層へ到達！ 水中スピーカー（水中音響送信機）より、人工音源（新言語<ruby>祝詞<rt>のりと</rt></ruby>）の大出力での放流を開始いたしました！ 音波は<ruby>SOFAR<rt>ソーファー</rt></ruby>層に乗って、太平洋全域へと急速に拡散しています！ あとは夜明けの決戦までに、マッコウクジラの大群が<ruby>駿河湾<rt>するがわん</rt></ruby>へ集結してくれるのを祈りましょう！」`,
    accentHex: "#0369a1",
  },
  {
    id: "ng-card-8-1",
    cardCode: "NG-08-1",
    dayNumber: 7,
    timingBadge: "Day 7 達成時①",
    title: "マッコウクジラ群の集結と深海での大捕食",
    frontTitleHtml: "マッコウクジラ群の集結と<br>深海での大捕食",
    description: `「長津です。水中聴音網（パッシブソナー網）および海自潜水艦の深海ソナー・光学探知から、一頭の白いクジラに続いて、クジラと思われる生物が100頭以上、駿河湾に集結しています。昨夜からの呼びかけに応えたものと考えられます。さらに太平洋全域から、後続の1,000頭近くが駿河湾への移動を示しています。
　先ほどから、クジラが深海へと潜水を開始。水深1,000m付近の巨大生物への複数回の接触が見られます。大量のクジラが一斉に巨大生物に喰らいついていると考えられます。
　深海ソナー探知の結果、巨大生物は大幅にその大きさが縮小しており、さきほどクジラとの区別がつかなくなりました。同時に、この巨大生物から発せられていた特有の振動も完全に停止しています」`,
    rubyHtml: `「<ruby>長津<rt>ながつ</rt></ruby>です。水中<ruby>聴音網<rt>ちょうおんもう</rt></ruby>（パッシブソナー網）および<ruby>海自<rt>かいじ</rt></ruby>潜水艦の深海ソナー・光学探知から、一頭の白いクジラに続いて、クジラと思われる生物が100頭以上、<ruby>駿河湾<rt>するがわん</rt></ruby>に集結しています。昨夜からの呼びかけに応えたものと考えられます。さらに太平洋全域から、後続の1,000頭近くが<ruby>駿河湾<rt>するがわん</rt></ruby>への移動を示しています。<br>　先ほどから、クジラが深海へと潜水を開始。水深1,000m付近の巨大生物への複数回の接触が見られます。大量のクジラが一斉に巨大生物に喰らいついていると考えられます。<br>　深海ソナー探知の結果、巨大生物は大幅にその大きさが縮小しており、さきほどクジラとの区別がつかなくなりました。同時に、この巨大生物から発せられていた特有の振動も完全に停止しています」`,
    accentHex: "#0f766e",
  },
  {
    id: "ng-card-8-2",
    cardCode: "NG-08-2",
    dayNumber: 7,
    timingBadge: "Day 7 達成時②",
    title: "富士山噴火危機の完全停止と全部隊攻撃中止",
    frontTitleHtml: "富士山噴火危機の完全停止と<br>全部隊攻撃中止",
    description: `「――気象庁火山監視課より緊急入電！ 富士山地下深部における火山性微動、急激に減衰しており、さきほど完全に停止が確認できました！
　防衛省・自衛艦隊司令部より全潜水艦へ通達入電、『目標の完全消滅を確認。魚雷発射管閉鎖、全部隊攻撃中止（スタンドダウン）』の命令がありました！
　このあと引き続き巨大生物が復活してこないか継続監視を行うようですが、現状クジラたちが、太古からの盟約に従って巨大生物を殲滅。富士山噴火を直前で停止できたと考えられます。
　皆さん、やりました。我々と、クジラの勝利です」`,
    rubyHtml: `「――気象庁火山監視課より<ruby>緊急<rt>きんきゅう</rt></ruby><ruby>入電<rt>にゅうでん</rt></ruby>！ 富士山地下深部における<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>、急激に減衰しており、さきほど完全に停止が確認できました！<br>　防衛省・<ruby>自衛<rt>じえい</rt></ruby><ruby>艦隊<rt>かんたい</rt></ruby><ruby>司令部<rt>しれいぶ</rt></ruby>より全潜水艦へ通達<ruby>入電<rt>にゅうでん</rt></ruby>、『目標の完全消滅を確認。<ruby>魚雷<rt>ぎょらい</rt></ruby><ruby>発射管<rt>はっしゃかん</rt></ruby><ruby>閉鎖<rt>へいさ</rt></ruby>、全部隊攻撃中止（スタンドダウン）』の命令がありました！<br>　このあと引き続き巨大生物が復活してこないか継続監視を行うようですが、現状クジラたちが、太古からの<ruby>盟約<rt>めいやく</rt></ruby>に従って巨大生物を<ruby>殲滅<rt>せんめつ</rt></ruby>。富士山噴火を直前で停止できたと考えられます。<br>　皆さん、やりました。我々と、クジラの勝利です」`,
    accentHex: "#0f766e",
  },
  {
    id: "ng-card-9",
    cardCode: "NG-09",
    dayNumber: 7,
    timingBadge: "Day 7 報道A",
    title: "テレビ臨時ニュース（A：自衛隊の作戦によって完全消滅）",
    frontTitleHtml: "テレビ臨時ニュース<br>（A：自衛隊の作戦で完全消滅）",
    description: `「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、一連の危機事態が完全に沈静化したと発表しました。政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が海底のマグマ網を刺激していた可能性が高いことが判明。これに対し、政府の『有害鳥獣駆除』方針に基づき緊急出動していた海上自衛隊が、今朝未明、駿河湾口沖合の深海においてこの巨大生物を捕捉。潜水艦部隊による特殊作戦を敢行し、この巨大生物を完全に消滅させたとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『自衛隊の果敢な決断と迅速な作戦行動が国土と国民の生命を守り抜いた』と声明を発表しています――」`,
    rubyHtml: `「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。<ruby>伊豆<rt>いず</rt></ruby><ruby>諸島<rt>しょとう</rt></ruby>から<ruby>駿河湾<rt>するがわん</rt></ruby>にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>について、<ruby>内閣<rt>ないかく</rt></ruby><ruby>官房<rt>かんぼう</rt></ruby><ruby>長官<rt>ちょうかん</rt></ruby>は先ほど、一連の危機事態が完全に沈静化したと発表しました。政府の発表によりますと、<ruby>西之島沖<rt>にしのしまおき</rt></ruby>から<ruby>駿河<rt>するが</rt></ruby>トラフにかけて北上していた『未確認の超巨大海洋生物』が海底のマグマ網を刺激していた可能性が高いことが判明。これに対し、政府の『<ruby>有害<rt>ゆうがい</rt></ruby><ruby>鳥獣<rt>ちょうじゅう</rt></ruby><ruby>駆除<rt>くじょ</rt></ruby>』方針に基づき緊急出動していた海上自衛隊が、今朝<ruby>未明<rt>みめい</rt></ruby>、<ruby>駿河湾口<rt>するがわんこう</rt></ruby>沖合の深海においてこの巨大生物を捕捉。<ruby>潜水艦<rt>せんすいかん</rt></ruby><ruby>部隊<rt>ぶたい</rt></ruby>による特殊作戦を<ruby>敢行<rt>かんこう</rt></ruby>し、この巨大生物を完全に消滅させたとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『自衛隊の果敢な決断と迅速な作戦行動が国土と国民の生命を守り抜いた』と声明を発表しています――」`,
    accentHex: "#334155",
  },
  {
    id: "ng-card-10",
    cardCode: "NG-10",
    dayNumber: 7,
    timingBadge: "Day 7 報道B",
    title: "テレビ臨時ニュース（B：合同対策本部の作戦が奏功・自衛隊が完全消滅を確認）",
    frontTitleHtml: "テレビ臨時ニュース<br>（B：合同対策本部の功績として公表）",
    description: `「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。伊豆諸島から駿河湾にかけての連続海底噴火と富士山の火山性微動について、内閣官房長官は先ほど、危機事態が完全に沈静化したと発表しました。西之島沖から駿河トラフへ北上していた『未確認の超巨大海洋生物』が海底マグマ網を刺激していたことが判明。政府は海上自衛隊を出動させていましたが、今朝未明、海上保安庁・気象庁・海洋科学大学などによる『合同対策本部』の特別チームが機転を効かせた独自の無力化作戦を敢行して見事に奏功。現場海域に展開していた海上自衛隊の潜水艦部隊により、巨大生物の完全消滅が確認され、実弾による武力攻撃は不要となったとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『一発の砲火も交えず、現場の機転と科学の力で日本を救った合同対策本部のメンバーは我が国の誇りでありヒーローである』と称える声明を発表しています――」`,
    rubyHtml: `「――政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。<ruby>伊豆<rt>いず</rt></ruby><ruby>諸島<rt>しょとう</rt></ruby>から<ruby>駿河湾<rt>するがわん</rt></ruby>にかけての連続海底噴火と富士山の<ruby>火山性<rt>かざんせい</rt></ruby><ruby>微動<rt>びどう</rt></ruby>について、<ruby>内閣<rt>ないかく</rt></ruby><ruby>官房<rt>かんぼう</rt></ruby><ruby>長官<rt>ちょうかん</rt></ruby>は先ほど、危機事態が完全に沈静化したと発表しました。<ruby>西之島沖<rt>にしのしまおき</rt></ruby>から<ruby>駿河<rt>するが</rt></ruby>トラフへ北上していた『未確認の超巨大海洋生物』が海底マグマ網を刺激していたことが判明。政府は海上自衛隊を出動させていましたが、今朝<ruby>未明<rt>みめい</rt></ruby>、海上保安庁・気象庁・海洋科学大学などによる『合同対策本部』の特別チームが機転を効かせた独自の無力化作戦を<ruby>敢行<rt>かんこう</rt></ruby>して見事に<ruby>奏功<rt>そうこう</rt></ruby>。現場海域に展開していた海上自衛隊の<ruby>潜水艦<rt>せんすいかん</rt></ruby><ruby>部隊<rt>ぶたい</rt></ruby>により、巨大生物の完全消滅が確認され、実弾による武力攻撃は不要となったとのことです。これを受け気象庁は富士山の噴火警戒レベルを【レベル1】へ引き下げ、総理大臣は『一発の<ruby>砲火<rt>ほうか</rt></ruby>も交えず、現場の機転と科学の力で日本を救った合同対策本部のメンバーは我が国の誇りでありヒーローである』と称える声明を発表しています――」`,
    accentHex: "#b45309",
  },
];

/**
 * プレイ人数（6名 / 7名）に応じたキャラクター一覧を取得
 */
export function getCharactersForPlayerCount(playerCount: number) {
  const pc1 = initialProject.characters.find((c) => c.id === "pc-1")!;
  const pc2 = initialProject.characters.find((c) => c.id === "pc-2")!;
  const pc3 = initialProject.characters.find((c) => c.id === "pc-3")!;
  const pc5 = initialProject.characters.find((c) => c.id === "pc-5")!;

  if (playerCount === 7) {
    // 7名モード：東京本部3名（PC1朝潮・PC2貝浜・PC7長津）＋ 小笠原現地4名（PC3・PC4・PC5・PC6）
    return [pc1, pc2, pc7Character, pc3, pc4For6Players, pc5, pc6Character];
  } else {
    // 6名モード（標準）：東京本部2名（PC1・PC2）＋ 小笠原現地4名（PC3・PC4・PC5・PC6）（長津はGM担当）
    return [pc1, pc2, pc3, pc4For6Players, pc5, pc6Character];
  }
}
