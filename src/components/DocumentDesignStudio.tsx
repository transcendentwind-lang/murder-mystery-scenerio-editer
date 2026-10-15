"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MMProject,
  Character,
  EvidenceItem,
  IncidentStep,
  DocumentThemeId,
  DocumentAccentColor,
  DocumentPaperStyle,
  DocumentBorderStyle,
  DocumentDesignOverride,
  VisualBoardItem,
  GmProgressionNote,
  EvidenceVisibility,
} from "@/types/schema";
import { initialVisualBoards } from "@/utils/initialProjectData";
import {
  Sparkles,
  Printer,
  Save,
  Check,
  Users,
  FileText,
  Map,
  Radio,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Palette,
  Stamp,
  Building2,
  Anchor,
  Hash,
  Type,
  Layers,
  ShieldAlert,
  Lock,
  Unlock,
  Upload,
  Compass,
  Crosshair,
  Activity,
  Grid,
  Clock,
  CheckSquare,
  Volume2,
  BookOpen,
  RotateCcw,
  RotateCw,
  ExternalLink,
  Maximize2,
} from "lucide-react";

interface DocumentDesignStudioProps {
  project: MMProject;
  onUpdateProject: (updater: MMProject | ((prev: MMProject) => MMProject)) => void;
  onSendAiPrompt?: (prompt: string) => void;
}

type StudioCategory = "handouts" | "evidences" | "visuals" | "gm_guides";

// テーマ定義マスター
const THEME_PRESETS: Record<
  DocumentThemeId,
  {
    name: string;
    badge: string;
    description: string;
    defaultAccent: DocumentAccentColor;
    defaultPaper: DocumentPaperStyle;
    defaultBorder: DocumentBorderStyle;
    defaultFont: "serif" | "sans" | "mono";
    defaultStamp: string;
    defaultHeader: string;
  }
> = {
  classified_dossier: {
    name: "極秘人物ファイル・指令書",
    badge: "個人HO推奨",
    description: "濃紺ヘッダー帯・IDバッジを備えた個人配布用ブリーフィングシート",
    defaultAccent: "indigo",
    defaultPaper: "dossier_cream",
    defaultBorder: "double_official",
    defaultFont: "sans",
    defaultStamp: "極秘指令 / EYES ONLY",
    defaultHeader: "総合危機管理対策本部・人事記録局",
  },
  official_report: {
    name: "公文書・機密調査報告書",
    badge: "公的証拠推奨",
    description: "官公庁・調査機関の公式報告書スタイル。3連承認印枠・文書番号・斜め赤スタンプ付き",
    defaultAccent: "crimson",
    defaultPaper: "clean_white",
    defaultBorder: "double_official",
    defaultFont: "serif",
    defaultStamp: "取扱注意 / CONFIDENTIAL",
    defaultHeader: "特命調査委員会・公式記録文書",
  },
  ancient_scroll: {
    name: "古文書・伝承記録・手記",
    badge: "伝承・日誌推奨",
    description: "和紙・羊皮紙調の温かみある背景と古典飾り枠、朱印風落款を備えた歴史資料・手記スタイル",
    defaultAccent: "amber",
    defaultPaper: "warm_parchment",
    defaultBorder: "classic_ornament",
    defaultFont: "serif",
    defaultStamp: "門外不出・古記録",
    defaultHeader: "伝承文献編纂室・史料保管庫",
  },
  digital_telemetry: {
    name: "通信傍受ログ・科学観測データ",
    badge: "通信・解析推奨",
    description: "計測方眼グリッド・テクニカルコーナー枠・波形インジケーターを備えた科学・通信レポート",
    defaultAccent: "cyan",
    defaultPaper: "blueprint_grid",
    defaultBorder: "tech_corner",
    defaultFont: "mono",
    defaultStamp: "TELEMETRY VERIFIED",
    defaultHeader: "広域観測ネットワーク・信号解析班",
  },
  medical_forensic: {
    name: "鑑識・生体分析・救護カルテ",
    badge: "鑑定・医療推奨",
    description: "検体識別バー・クロスヘア標識・分析所見ボックスを備えた科学鑑定・医療記録シート",
    defaultAccent: "emerald",
    defaultPaper: "clean_white",
    defaultBorder: "minimal_line",
    defaultFont: "sans",
    defaultStamp: "検体分析済 / BIO-LAB",
    defaultHeader: "先端生体科学研究所・救護医療班",
  },
  field_expedition: {
    name: "現地調査隊・緊急フィールドノート",
    badge: "現場記録推奨",
    description: "ハザードストライプ帯と現場メモ枠を備えた、緊迫感ある現地調査・目撃記録スタイル",
    defaultAccent: "amber",
    defaultPaper: "dossier_cream",
    defaultBorder: "hazard_stripe",
    defaultFont: "sans",
    defaultStamp: "現場緊急報告 / FIELD LOG",
    defaultHeader: "現地前線指揮所・緊急救難隊",
  },
  modern_sleek: {
    name: "モダン・ミステリーシート",
    badge: "汎用・高視認性",
    description: "余白とタイポグラフィを活かした、どんな世界観でも読みやすい洗練された配布シート",
    defaultAccent: "slate",
    defaultPaper: "clean_white",
    defaultBorder: "minimal_line",
    defaultFont: "sans",
    defaultStamp: "INVESTIGATION FILE",
    defaultHeader: "SCENARIO ARCHIVE SYSTEM",
  },
  gm_tactical_binder: {
    name: "GM進行マスターバインダー",
    badge: "GM進行推奨",
    description: "時間配分・読み上げト書きボックス・2拠点対比・開示チェックリストを整理したGM専用進行表",
    defaultAccent: "indigo",
    defaultPaper: "clean_white",
    defaultBorder: "tech_corner",
    defaultFont: "sans",
    defaultStamp: "GM MASTER ONLY",
    defaultHeader: "GM用進行シート",
  },
  gm_script_book: {
    name: "GM朗読・演出台本スタイル",
    badge: "GM演出推奨",
    description: "情景描写の読み上げとBGM/演出キュー、PC個別誘導を見やすく配置した舞台台本風シート",
    defaultAccent: "crimson",
    defaultPaper: "dossier_cream",
    defaultBorder: "double_official",
    defaultFont: "serif",
    defaultStamp: "DIRECTOR SCRIPT",
    defaultHeader: "NARRATIVE DIRECTION & CUE SHEET",
  },
};

// アクセントカラー別のスタイルパレット（画面表示用・印刷両対応）
const ACCENT_STYLES: Record<
  DocumentAccentColor,
  {
    headerBg: string;
    headerText: string;
    borderMain: string;
    borderSub: string;
    badgeBg: string;
    badgeText: string;
    stampBorder: string;
    stampText: string;
    sectionTitleText: string;
    sectionTitleBg: string;
    highlightBoxBg: string;
    highlightBoxBorder: string;
    hexPrimary: string;
    hexLight: string;
  }
> = {
  indigo: {
    headerBg: "bg-indigo-950",
    headerText: "text-indigo-50",
    borderMain: "border-indigo-900",
    borderSub: "border-indigo-300",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-900",
    stampBorder: "border-red-700/80",
    stampText: "text-red-700/85",
    sectionTitleText: "text-indigo-950",
    sectionTitleBg: "bg-indigo-100/80",
    highlightBoxBg: "bg-indigo-50/70",
    highlightBoxBorder: "border-indigo-300",
    hexPrimary: "#1e1b4b",
    hexLight: "#eef2ff",
  },
  crimson: {
    headerBg: "bg-rose-950",
    headerText: "text-rose-50",
    borderMain: "border-rose-900",
    borderSub: "border-rose-300",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-900",
    stampBorder: "border-red-700",
    stampText: "text-red-700",
    sectionTitleText: "text-rose-950",
    sectionTitleBg: "bg-rose-100/80",
    highlightBoxBg: "bg-rose-50/70",
    highlightBoxBorder: "border-rose-300",
    hexPrimary: "#4c0519",
    hexLight: "#fff1f2",
  },
  emerald: {
    headerBg: "bg-emerald-950",
    headerText: "text-emerald-50",
    borderMain: "border-emerald-900",
    borderSub: "border-emerald-300",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
    stampBorder: "border-emerald-800",
    stampText: "text-emerald-800",
    sectionTitleText: "text-emerald-950",
    sectionTitleBg: "bg-emerald-100/80",
    highlightBoxBg: "bg-emerald-50/70",
    highlightBoxBorder: "border-emerald-300",
    hexPrimary: "#022c22",
    hexLight: "#ecfdf5",
  },
  amber: {
    headerBg: "bg-amber-950",
    headerText: "text-amber-50",
    borderMain: "border-amber-900",
    borderSub: "border-amber-400/80",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-950",
    stampBorder: "border-red-800/85",
    stampText: "text-red-800/85",
    sectionTitleText: "text-amber-950",
    sectionTitleBg: "bg-amber-200/60",
    highlightBoxBg: "bg-amber-100/40",
    highlightBoxBorder: "border-amber-400/80",
    hexPrimary: "#451a03",
    hexLight: "#fffbeb",
  },
  cyan: {
    headerBg: "bg-cyan-950",
    headerText: "text-cyan-50",
    borderMain: "border-cyan-900",
    borderSub: "border-cyan-300",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-950",
    stampBorder: "border-cyan-800",
    stampText: "text-cyan-800",
    sectionTitleText: "text-cyan-950",
    sectionTitleBg: "bg-cyan-100/80",
    highlightBoxBg: "bg-cyan-50/70",
    highlightBoxBorder: "border-cyan-300",
    hexPrimary: "#083344",
    hexLight: "#ecfeff",
  },
  slate: {
    headerBg: "bg-slate-900",
    headerText: "text-slate-50",
    borderMain: "border-slate-800",
    borderSub: "border-slate-300",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-900",
    stampBorder: "border-red-700/80",
    stampText: "text-red-700/80",
    sectionTitleText: "text-slate-900",
    sectionTitleBg: "bg-slate-200/80",
    highlightBoxBg: "bg-slate-100/80",
    highlightBoxBorder: "border-slate-300",
    hexPrimary: "#0f172a",
    hexLight: "#f8fafc",
  },
};

// 用紙背景スタイル
const PAPER_STYLES: Record<DocumentPaperStyle, { name: string; className: string; bgCss: string }> = {
  clean_white: {
    name: "クリアホワイト（標準A4紙）",
    className: "bg-white text-slate-900",
    bgCss: "#ffffff",
  },
  dossier_cream: {
    name: "機密ファイル・クリーム紙",
    className: "bg-[#faf8f2] text-slate-900",
    bgCss: "#faf8f2",
  },
  warm_parchment: {
    name: "古文書・和紙羊皮紙トーン",
    className: "bg-[#f5eedc] text-stone-900",
    bgCss: "#f5eedc",
  },
  blueprint_grid: {
    name: "科学解析・方眼レポート紙",
    className:
      "bg-[#f4f9fc] text-slate-900 bg-[linear-gradient(to_right,#e2eef5_1px,transparent_1px),linear-gradient(to_bottom,#e2eef5_1px,transparent_1px)] bg-[size:20px_20px]",
    bgCss: "#f4f9fc",
  },
};

// GM演出用ナレーション ＆ NPCセリフ台本（各Day初期値：合同対策本部 首席オペレーター 長津視点）
const DEFAULT_GM_NARRATIONS: Record<number, string> = {
  1: `【フェーズ1：緊急回線接続 ＆ 各員自己紹介】
（🎙️ 首席オペレーター 長津）:
「――東京本部および小笠原現地チームへ緊急入信。当回線は海上保安庁・関係機関合同の緊急対策回線です。小笠原南西沖にて民間チャーター船（総トン数約40t）が突如全電源を喪失、AISも停波し、救難信号を発信した直後に通信が途絶いたしました。これより合同海難救助チームを開設します。朝潮危機管理官をはじめ各員、氏名・所属・現場で担える専門役割の点呼および自己紹介をお願いいたします」

【フェーズ2：遭難海図展開 ＆ 漂流捜索方針の決定】
（🎙️ 首席オペレーター 長津）:
「――救難信号の発信から既に20分が経過しております。救難艇が現場海域へ到達するまでさらに40分――合計1時間、遭難船は漂流し続けます。大型スクリーンに【漂流海図】を展開いたしました。朝潮危機管理官（PC1）、坂凪救難担当官（PC3）、太刀魚観測員（PC4）をはじめ各員、暗礁群の配置と海流を考慮し、救難艇を急行させるべき捜索海域の決定をお願いいたします」

【フェーズ4：救助成功アナウンス】
（🎙️ 首席オペレーター 長津）:
「――坂凪救難担当官率いる現場救難艇より入電！東北東の漂流予測海域へ全速到達、暗礁群をすり抜け激しく漂流する遭難船を捕捉・接舷！初瀬救護担当（PC6）も収容準備願います。荒波の中で間一髪、船長とダイバーたちの救出に成功いたしました！」

【NPC 船長（救助直後）】:
民間チャーター船「パパズドルフィン」の船長は、荒波で不安定な足場でもしっかりとした足取りで巡視船へと乗り込んできた。
「お世話をかけますが、船は二見港まで曳航いただけますか。お客さんが怪我なくてよかった。船はスクリューが何かに巻き付かれたように故障して、計器類も電源が使えなくてお手上げになっちゃった。全電源喪失なんて初めてで焦りましたよ。今日乗せたダイバーたちはこの1ヶ月前ぐらいから頻繁にダイビングを繰り返していて、手慣れた様子だった。船の下に何かいるような感じだったけど、クジラとは思えなかったね。クジラなら潮吹きのブローや潜水の際の尾が見えたりという行動があるもんだけど、そんな様子はなかったんでね。海は怖いねぇ、あとで神社にお参りしてくるようにするよ」

【NPC ダイバー2名（救助直後）】:
ダイバー達はほっとした顔を浮かべながら、酸素ボンベを含むダイビング装備は船に乗せたままと船長に断りを入れ、大型のクーラーボックスを抱えて巡視船に乗り込んできた。
「助かりました。まさか漂流するとは思ってなくて。船の下に何かいたみたいですね、漂流が始まってから潜ってはいないので、はっきりとは言えないですけど、ただの大型クジラですよ。私たちですか、この近辺での魚の生態調査をしてまして、珍しい魚を標本採集していたんです。帰れるのか心配でしたが、これで目的のものが無事に収集できましたので、これ以上皆様にご迷惑をおかけすることはありません。この便を逃すとしばらく戻れないですからね、もう帰れないかと思って冷や汗をかいていました」`,

  2: `【フェーズ1：突発海底噴火アラート ＆ 即応体制維持通達】
（🎙️ 首席オペレーター 長津）:
「――気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です」

【フェーズ2：情報収集・合議制アクションの提示】
（🎙️ 首席オペレーター 長津）:
「――西之島周辺海域から『海底の巨大な黒い影』『異常な地殻振動』の目撃情報が相次いで寄せられています。しかし混乱する現場において、すべての調査に手を回す余裕はありません。許された調査枠は――【海上保安庁東京本部（朝潮・貝浜）で1枠】、【小笠原現地（坂凪・太刀魚・浪寄・初瀬）で2枠】のみです。各自の専門知識を持ち寄り、どのアクションを実行すべきか合議をお願いいたします」

【GM演出上の最重要注意（ネタバレ防止メモ）】
※このDay 2の段階では、「ダイオウイカの超群体である」という正体は絶対に明かさないでください。プレイヤーたちには「ダイオウイカの触手のはずなのに、なぜ数百mもの超巨大な影なのか？」「海底火山を噴火させながら北上しているものは一体何なのか？」という強烈なサイズ矛盾とサスペンスを抱かせ、議論を深めてもらいます。`,

  3: `【フェーズ1：鳥島沖海底大噴火 ＆ 緊急洋上捜索命令】
（🎙️ 首席オペレーター 長津）:
「――小笠原航空基地より大型捜索ヘリが緊急発進いたしました。洋上に展開する巡視船PLH-31『あきつしま』での洋上給油を中継し、鳥島沖の噴火海域へ投入されます。各員への任務目標：『海図上の怪物の潜航位置を推測し、ソノブイを投下して三辺測量で距離を割り出し、その姿を捉えよ！』」

【フェーズ5：写真データ受信 ＆ 合同対策本部への諮問】
（🎙️ 首席オペレーター 長津）:
「――洋上捜索ヘリより至急電！撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大質量、そして20本以上の無数の触手群を確認！ 現場の海上保安庁警備救難部より、当合同対策チームへ緊急の諮問が下されております」

① 海上保安庁 ➔ 浪寄准教授（PC5: 海洋生物学者）への相談:
「浪寄准教授、この写真に写る物体の生物学的特徴をどう分析されますか？通常のダイオウイカ（10本）と明らかに異なる無数の触手、そして数百mの巨大質量。専門家としての所見を提示してください」

② 海上保安庁 ➔ 貝浜リエゾン（PC2: 防衛省リエゾン）への要請:
「貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則では、この規模の潜航目標に対する排除・対処は不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」

【朝潮危機管理官（PC1）の決断とDay 4へのブリッジ】
（🎙️ 首席オペレーター 長津）:
「各員の意見が出揃いました。朝潮危機管理官（PC1）、指揮官としてこの事態にどう対処するか、最終意思決定をお願いいたします」`,

  4: `【フェーズ1：火山フロント北上 ＆ 富士山連動リスク報告】
（🎙️ 首席オペレーター 長津）:
「――気象庁地震火山部より最新の観測データが入電いたしました。太刀魚観測員（PC4）の速報通り、鳥島沖を通過した物体が北上を続け、須美寿島〜青ヶ島沖の海底カルデラで連動爆発が発生。さらに八丈島・青ヶ島では火山性軽度地震（震度1〜2）が観測されています。巨大生物が海底付近で起こす『海底地震のような特別な振動』が海底火山のマグマ溜まりを刺激している証拠です。このまま北上すれば数日後に【富士山直下】へ到達し、破局的大噴火を招く危機が迫っております」

【フェーズ2：政府・防衛省の反応通達】
（🎙️ 首席オペレーター 長津）:
「――官邸危機管理センターおよび内閣総理大臣より通達が入電しました。読み上げます。『鳥島〜青ヶ島沖の海底噴火と、海保の報告する未確認潜航物体との因果関係が科学的に立証されていない。自衛隊の防衛出動要件（武力攻撃事態等）には該当せず、現段階での自衛隊部隊出動は見送る。当面は海上保安庁が情報収集および警戒にあたれ』」
「内閣は因果関係不明を理由に出動を保留いたしましたが、防衛省としては深刻な脅威と捉えております。貝浜リエゾン（PC2）、朝潮危機管理官（PC1）、【この生物は一体どこへ向かっている見立てなのか？】対策本部の進路予測・分析を至急提示してほしいとの要請です」

【フェーズ5：防衛省・統合幕僚監部通達（害獣駆除方針決定）】
（🎙️ 首席オペレーター 長津）:
「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊全部隊の動員を正式決定いたしました！ 八丈島〜御蔵島沖にて通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」`,

  5: `【フェーズ1：メディアの富士山連動大噴火報道】
（🎙️ 首席オペレーター 長津）:
「――各局ニュース速報が入電。メディア各社が一斉に伊豆諸島の連続海底噴火と群発地震を報じ始めました。気象庁は富士山地下深部において火山性微動を公式確認。『伊豆・小笠原火山弧の連動刺激により、富士山破局的大噴火の危険性が極めて高い』と速報が連呼され、列島中がパニックに包まれております」

【フェーズ2：防衛省通達（軍事機密指定による情報遮断）】
（🎙️ 首席オペレーター 長津）:
「――防衛省より緊急回線で入電。『これより自衛隊が実施する実弾迎撃作戦は【最高軍事機密】に移行する。交戦状況に関する情報提供はここを以て遮断する。対策本部は作戦干渉を解かれ、独自の調査任務に戻られたし』との通達です」

【フェーズ3：防衛省より貝浜（PC2）への緊急ホットライン】
（🎙️ 首席オペレーター 長津）:
「――暗号ホットラインに着信！ 貝浜リエゾン（PC2）へ、防衛省作戦本部より直通無線が接続されました！」
【防衛省作戦本部】:
「――貝浜、防衛省作戦本部だ！ 魚雷群は全弾直撃・命中した！ しかし……爆砕された影は泥のように瞬時に再結合した。上層部は『命中している以上、さらに大量の魚雷を集中投入・飽和攻撃すれば殲滅できる』と主張している。だが、力押しだけで本当に通用するのか？！ 貝浜、直ちにあの生物の写真解析を行った浪寄准教授（PC5）の意見を確認してくれ！ あいつらは一体どうやって一つの個体として統率されているのか？ なぜ富士山を目指すのか？！」`,

  6: `【状況推移演出：一時的沈静化から終盤の再浮上・微動継続へ】
（🎙️ 首席オペレーター 長津）:
「（昼）――各員へ報告。海上自衛隊の迎撃行動により、巨大生物は活動を停止しました。御蔵島沖噴火は小康状態となり、富士山地下の微動も一時的に沈静化しています。富士山の噴火についてもまだ予断を許さないものの、この巨大生物と噴火が関係あるとする意見が多く、撃退したことにより事態が沈静化するだろうという意見が多く見られます。直接の因果関係が認められないことからメディアには引き続き巨大生物の情報は出せません。これでこの一連の作戦は完了となる見込みです」

「（夕〜夜）――警報！海上自衛隊の深海ソナーが駿河トラフ境界へ向けて高速で再浮上する巨大影を探知！ 同時に富士山地下の火山性微動は継続！巨大生物はまだ生存している可能性が高く、同時に火山活動に直接影響を及ぼしていると考えられます」

【フェーズ1：祝詞の「舌クリック音」判明 ＆ 日本語自体は無意味】
（🎙️ 首席オペレーター 長津）:
「古文書の神代文字の注釈にあった『吸音・弾舌』という奇妙な記号。坂凪（PC3）と浪寄（PC5）が照合した瞬間、戦慄が走ります。古代の祝詞は人間の喉の歌声ではなかった……舌を上顎・歯茎に強く打ち鳴らす鋭い『舌クリック音（吸着破裂音）』だったのだ！」
「太古、海より触手うごめく巨大な烏賊の如き魔物の塊り現れしとき、島人は海中筒より鯨の神音を響かせ、鯨の群れを召喚せり。鯨どもはその巨大なるイカの塊りを片っ端から貪り喰らい尽くし、海は平穏を取り戻せり……！」

【フェーズ4：合成新言語祝詞の完成 ＆ 翌朝（Day 7）決戦への装填スタンバイ】
（🎙️ 首席オペレーター 長津）:
「朝潮危機管理官をはじめ、プレイヤー全員の知見が結集し、『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』という8語の合成新言語祝詞が完成！ 貝浜リエゾン（PC2）が海自全潜水艦・護衛艦・固定音響ソナー網（SOSUS）へ信号パケットを装填し、発信系統の同期テストを完了しました。実際の海中への放流は明日・Day 7の駿河湾最終決戦にて実行されます！」`,

  7: `【フェーズ1：深海境界域での最終突入】
（🎙️ 首席オペレーター 長津）:
「――怪異は海面へ浮上せず、通常兵器の魚雷が水圧で圧壊する限界スレスレ――水深600mから1,000mの超深海を維持したまま、駿河トラフ境界へ突入いたしました！ 富士山直下のマグマ網まであとわずか、もはや一刻の猶予もありません！」

【フェーズ2：海自潜水艦部隊 重魚雷一斉飽和攻撃（群体粉砕アシスト）】
（🎙️ 首席オペレーター 長津）:
「貝浜リエゾン（PC2）の座標指示に基づき、海自潜水艦部隊が限界深度へ向け最新鋭重魚雷の一斉飽和攻撃を敢行！ 大出力ソナーのPing音が深海を貫き、直後――深海の闇の中で巨大な爆炎が連鎖！ 魚雷の爆風により、巨大群体は一時的にバラバラに粉砕・分断されました！」

【フェーズ3：海自大出力ソナー網放流 ＆ クジラたちのメッセージリレー（歌のバトン）】
（🎙️ 首席オペレーター 長津）:
「――全ソナー発信系統を同期！海自全潜水艦・護衛艦・固定音響ソナー網（SOSUS）より『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』という8語の新言語祝詞が太平洋全域へメガワット級大出力で放流されました！ 至近海域の1頭のマッコウクジラが【了解】を返し、自ら同じ歌を歌いながら北へ遊泳を開始。その歌を聞いた沖合の別のクジラが歌い継ぎ、海の中はクジラの歌の輪唱に包まれます！」

【フェーズ4：マッコウクジラ深海大捕食（完全消滅 ＆ 微動停止）】
（🎙️ 首席オペレーター 長津）:
「リレーされた歌に導かれ、水深1,000m以深の漆黒の闇から、数百頭のマッコウクジラ群が一斉に突入！ 筋肉に酸素を蓄えた深海の王たちが、魚雷で一口サイズに粉砕された怪異を片っ端から噛み砕き、貪り喰らい尽くしていく！ 怪異はクジラたちの胃袋へと完全に消滅し、富士山地下のマグマ微動が急速に減衰して完全な静寂を取り戻しました！」

【フェーズ5：エピローグ演出・語られざる英雄たち（Unsung Heroes）】
（🎙️ 首席オペレーター 長津）:
「『俺たちの手柄は歴史のどこにも載らないな』『ええ。ですが、駿河湾の底でクジラたちと交わしたあの約束だけは本物でした』――真実を胸に秘めた6人（朝潮・貝浜・坂凪・太刀魚・浪寄・初瀬）は、静かに日常へと帰っていく」`,
};

// デフォルトの全体提示ビジュアル資料一覧を取得するヘルパー（各Day図・写真網羅、古い海図は除外）
function getDefaultVisualBoards(project: MMProject): VisualBoardItem[] {
  const base =
    project.visualBoards &&
    project.visualBoards.length > 0 &&
    project.visualBoards.some((v) => v.id === "vis-day7-eruption")
      ? project.visualBoards
      : initialVisualBoards;
  return base.filter((v) => v.id !== "vis-route-map");
}

// デフォルトのGM進行ノートを取得するヘルパー
function getGmNoteForDay(project: MMProject, dayNumber: number): GmProgressionNote {
  const defaultNarration =
    DEFAULT_GM_NARRATIONS[dayNumber] ||
    `【Day ${dayNumber} 導入読み上げ】\n状況をプレイヤー全員に提示し、各班のアクション選択および情報共有を開始してください。`;

  const timeline = project.timeline || [];
  const step = timeline.find((t) => t.dayNumber === dayNumber) || timeline[0];

  const defaultCheckpoints = [
    `Day ${dayNumber} 開始時に全体状況をアナウンスし、制限時間（目安 ${
      dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25
    }分）をタイマーセットする`,
    `このフェーズで開示可能な証拠（${(step?.revealedEvidenceIds || []).length}件）の取得条件を確認する`,
    `議論が停滞している場合は、各PCの「固有能力」や「専門知識」の活用を促す`,
  ];

  const defaultBgm =
    dayNumber <= 2
      ? "静かな緊迫感・環境音（深海・無線ノイズ）"
      : dayNumber <= 5
      ? "捜査・解析フェーズBGM（中テンポ・サスペンス）"
      : "クライマックス・決断BGM（高揚感のあるオーケストラ）";

  if (project.gmNotes && project.gmNotes[dayNumber]) {
    const existing = project.gmNotes[dayNumber];
    const isOldDefaultScript =
      !existing.readAloudScript ||
      existing.readAloudScript === step?.incidentOverview ||
      !existing.readAloudScript.includes("長津") ||
      (dayNumber === 1 && !existing.readAloudScript.includes("パパズドルフィン"));

    const script = isOldDefaultScript ? defaultNarration : existing.readAloudScript;

    const checkpoints =
      Array.isArray(existing.gmCheckpoints) && existing.gmCheckpoints.length > 0
        ? existing.gmCheckpoints
        : defaultCheckpoints;

    return {
      ...existing,
      dayNumber,
      readAloudScript: script,
      gmCheckpoints: checkpoints,
      bgmCue: existing.bgmCue || defaultBgm,
      targetMinutes:
        existing.targetMinutes ||
        (dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25),
    };
  }

  return {
    dayNumber,
    targetMinutes: dayNumber === 1 || dayNumber === 6 || dayNumber === 7 ? 30 : 25,
    readAloudScript: defaultNarration,
    gmCheckpoints: defaultCheckpoints,
    bgmCue: defaultBgm,
  };
}

// ドキュメント固有のデザイン設定を取得するヘルパー
function getDesignForKey(
  project: MMProject,
  docKey: string,
  category: StudioCategory,
  evidenceCategory?: EvidenceItem["category"]
): DocumentDesignOverride {
  if (project.documentDesigns && project.documentDesigns[docKey]) {
    const existing = project.documentDesigns[docKey];
    if (category === "gm_guides" && existing.organizationHeader === "GAME MASTER TACTICAL CONTROL") {
      return {
        ...existing,
        organizationHeader: "GM用進行シート",
      };
    }
    return existing;
  }

  let defaultTheme: DocumentThemeId = "official_report";
  if (category === "handouts") {
    defaultTheme = "modern_sleek";
  } else if (category === "evidences") {
    if (evidenceCategory === "data" || evidenceCategory === "audio") {
      defaultTheme = "digital_telemetry";
    } else if (evidenceCategory === "sample") {
      defaultTheme = "medical_forensic";
    } else if (evidenceCategory === "testimony") {
      defaultTheme = "field_expedition";
    } else {
      defaultTheme = "official_report";
    }
  } else if (category === "visuals") {
    defaultTheme = "digital_telemetry";
  } else if (category === "gm_guides") {
    defaultTheme = "gm_tactical_binder";
  }

  const preset = THEME_PRESETS[defaultTheme];
  return {
    themeId: defaultTheme,
    accentColor: preset.defaultAccent,
    paperStyle: preset.defaultPaper,
    borderStyle: preset.defaultBorder,
    fontFamily: preset.defaultFont,
    stampText: preset.defaultStamp,
    organizationHeader: preset.defaultHeader,
    documentCode: `REF-${docKey.toUpperCase().slice(0, 10)}`,
    footerNote: `${project.title} ― 公式配布・進行資料`,
  };
}

// Gemini AI プロンプトからデザイン枠設定を生成するインテリジェント関数
function generateDesignFromAiPrompt(
  prompt: string,
  currentDesign: DocumentDesignOverride,
  projectTitle: string
): { nextDesign: DocumentDesignOverride; explanation: string } {
  const p = prompt.toLowerCase();
  let themeId: DocumentThemeId = currentDesign.themeId;
  let accentColor: DocumentAccentColor = currentDesign.accentColor;
  let paperStyle: DocumentPaperStyle = currentDesign.paperStyle;
  let borderStyle: DocumentBorderStyle = currentDesign.borderStyle;
  let fontFamily: "serif" | "sans" | "mono" = currentDesign.fontFamily;
  let stampText = currentDesign.stampText;
  let organizationHeader = currentDesign.organizationHeader;

  if (
    p.includes("古文書") ||
    p.includes("神社") ||
    p.includes("伝承") ||
    p.includes("和紙") ||
    p.includes("歴史") ||
    p.includes("日誌") ||
    p.includes("手記") ||
    p.includes("羊皮紙")
  ) {
    themeId = "ancient_scroll";
    accentColor = "amber";
    paperStyle = "warm_parchment";
    borderStyle = "classic_ornament";
    fontFamily = "serif";
    stampText = p.includes("神社") ? "社務秘蔵・禁帯出" : "古記録・伝承史料";
    organizationHeader = p.includes("神社")
      ? "古社社務所・伝承古記録保管庫"
      : "歴史文献・航海手記アーカイブ";
  } else if (
    p.includes("通信") ||
    p.includes("ソナー") ||
    p.includes("デジタル") ||
    p.includes("波形") ||
    p.includes("衛星") ||
    p.includes("観測") ||
    p.includes("サイバー") ||
    p.includes("電文")
  ) {
    themeId = "digital_telemetry";
    accentColor = "cyan";
    paperStyle = "blueprint_grid";
    borderStyle = "tech_corner";
    fontFamily = "mono";
    stampText = p.includes("緊急") ? "緊急傍受電文 / URGENT" : "TELEMETRY LOG / 解析済";
    organizationHeader = "広域通信傍受・海洋音響解析ネットワーク";
  } else if (
    p.includes("医療") ||
    p.includes("カルテ") ||
    p.includes("鑑定") ||
    p.includes("生体") ||
    p.includes("解剖") ||
    p.includes("科学") ||
    p.includes("分析") ||
    p.includes("研究所")
  ) {
    themeId = "medical_forensic";
    accentColor = "emerald";
    paperStyle = "clean_white";
    borderStyle = "minimal_line";
    fontFamily = "sans";
    stampText = "検体分析・医療機密 / BIO-LAB";
    organizationHeader = "先端生体科学鑑定室・緊急医療救護班";
  } else if (
    p.includes("極秘") ||
    p.includes("防衛") ||
    p.includes("公文書") ||
    p.includes("政府") ||
    p.includes("警察") ||
    p.includes("海保") ||
    p.includes("指令") ||
    p.includes("赤")
  ) {
    themeId = "official_report";
    accentColor = "crimson";
    paperStyle = "clean_white";
    borderStyle = "double_official";
    fontFamily = "serif";
    stampText = "極秘・取扱注意 / TOP SECRET";
    organizationHeader = "政府総合危機管理対策本部・特命調査室";
  } else if (
    p.includes("現場") ||
    p.includes("緊急") ||
    p.includes("警報") ||
    p.includes("フィールド") ||
    p.includes("救難")
  ) {
    themeId = "field_expedition";
    accentColor = "amber";
    paperStyle = "dossier_cream";
    borderStyle = "hazard_stripe";
    fontFamily = "sans";
    stampText = "現場至急報 / FIELD ALERT";
    organizationHeader = "現地前線対策本部・緊急捜索救難隊";
  } else if (
    p.includes("gm") ||
    p.includes("進行") ||
    p.includes("台本") ||
    p.includes("朗読")
  ) {
    themeId = p.includes("台本") || p.includes("朗読") ? "gm_script_book" : "gm_tactical_binder";
    accentColor = p.includes("台本") ? "crimson" : "indigo";
    paperStyle = "clean_white";
    borderStyle = "tech_corner";
    fontFamily = p.includes("台本") ? "serif" : "sans";
    stampText = "GM進行マスター専用";
    organizationHeader = `${projectTitle} ― GM進行・演出管理シート`;
  } else if (
    p.includes("モダン") ||
    p.includes("シンプル") ||
    p.includes("スッキリ") ||
    p.includes("現代")
  ) {
    themeId = "modern_sleek";
    accentColor = "slate";
    paperStyle = "clean_white";
    borderStyle = "minimal_line";
    fontFamily = "sans";
    stampText = "INVESTIGATION RECORD";
    organizationHeader = `${projectTitle} ― 調査資料アーカイブ`;
  } else {
    themeId = "classified_dossier";
    accentColor = "indigo";
    paperStyle = "dossier_cream";
    borderStyle = "double_official";
    fontFamily = "sans";
    stampText = "CONFIDENTIAL / 特命配布資料";
    organizationHeader = `${projectTitle} ― 特命対策チーム記録`;
  }

  return {
    nextDesign: {
      ...currentDesign,
      themeId,
      accentColor,
      paperStyle,
      borderStyle,
      fontFamily,
      stampText,
      organizationHeader,
      customPromptUsed: prompt,
    },
    explanation: `Geminiデザインエンジンにより「${THEME_PRESETS[themeId].name}」をベースに、用紙質感（${PAPER_STYLES[paperStyle].name}）・スタンプ（${stampText}）・発令ヘッダーを自動構成しました。`,
  };
}

export const DocumentDesignStudio: React.FC<DocumentDesignStudioProps> = ({
  project,
  onUpdateProject,
  onSendAiPrompt,
}) => {
  const [category, setCategory] = useState<StudioCategory>("handouts");
  const [handoutViewMode, setHandoutViewMode] = useState<"sheet" | "cards">("sheet");
  const [selectedCharId, setSelectedCharId] = useState<string>((project.characters || [])[0]?.id || "pc-1");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    (project.evidences || [])[0]?.id || ""
  );
  const [evidenceDayFilter, setEvidenceDayFilter] = useState<number | "all">("all");
  const [selectedVisualId, setSelectedVisualId] = useState<string>("vis-day1-white");
  const [visualOrientation, setVisualOrientation] = useState<"portrait" | "landscape_rotated">("landscape_rotated");
  const [selectedGmDay, setSelectedGmDay] = useState<number>(1);

  // 画面内テキスト直接編集モード vs 純粋プレビューモード
  const [isDirectEditMode, setIsDirectEditMode] = useState<boolean>(true);

  // Gemini デザイン生成プロンプト入力
  const [aiDesignPrompt, setAiDesignPrompt] = useState<string>("");
  const [aiDesignFeedback, setAiDesignFeedback] = useState<string>("");
  const [isDesignCustomizerOpen, setIsDesignCustomizerOpen] = useState<boolean>(false);

  // 保存フィードバック表示
  const [saveStatus, setSaveStatus] = useState<"saved" | "dirty" | "just_saved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("自動同期中");

  // 印刷対象領域のRef
  const printableSheetRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 視覚ボード一覧（プロジェクトに未保存の場合は初期ボードを使用）
  const visualBoards = getDefaultVisualBoards(project);

  // 現在選択されているアイテムの特定
  const charactersList = project.characters || [];
  const activeChar =
    charactersList.find((c) => c.id === selectedCharId) || charactersList[0];

  const allEvidences = project.evidences || [];
  const filteredEvidences =
    evidenceDayFilter === "all"
      ? allEvidences
      : allEvidences.filter((e) => e.foundPhase === evidenceDayFilter);

  const activeEvidence =
    allEvidences.find((e) => e.id === selectedEvidenceId) ||
    filteredEvidences[0] ||
    allEvidences[0];

  const activeVisual =
    visualBoards.find((v) => v.id === selectedVisualId) || visualBoards[0];

  const timelineList = project.timeline || [];
  const activeTimelineStep =
    timelineList.find((t) => t.dayNumber === selectedGmDay) || timelineList[0];

  const activeGmNote = getGmNoteForDay(project, selectedGmDay);

  // 現在のドキュメントキーとデザイン設定
  const currentDocKey =
    category === "handouts"
      ? `ho-${activeChar?.id || "pc-1"}`
      : category === "evidences"
      ? `ev-${activeEvidence?.id || "default"}`
      : category === "visuals"
      ? `vis-${activeVisual?.id || "default"}`
      : `gm-day-${selectedGmDay}`;

  const currentDesign = getDesignForKey(
    project,
    currentDocKey,
    category,
    activeEvidence?.category
  );

  const accent = ACCENT_STYLES[currentDesign.accentColor] || ACCENT_STYLES.indigo;
  const paper = PAPER_STYLES[currentDesign.paperStyle] || PAPER_STYLES.clean_white;
  const fontClass =
    currentDesign.fontFamily === "serif"
      ? "font-serif"
      : currentDesign.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // 変更通知＆保存ヘルパー
  const triggerSaveFeedback = () => {
    setSaveStatus("just_saved");
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    setTimeout(() => {
      setSaveStatus("saved");
    }, 2500);
  };

  // 明示的な「保存」ボタン押下処理（キーボードショートカット Cmd/Ctrl+S 対応）
  const handleManualSave = () => {
    onUpdateProject((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
    triggerSaveFeedback();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // デザイン設定の更新
  const handleUpdateDesign = (partial: Partial<DocumentDesignOverride>) => {
    const nextDesign: DocumentDesignOverride = {
      ...currentDesign,
      ...partial,
    };
    onUpdateProject((prev) => ({
      ...prev,
      documentDesigns: {
        ...(prev.documentDesigns || {}),
        [currentDocKey]: nextDesign,
      },
    }));
    triggerSaveFeedback();
  };

  // テーマプリセットの一括適用
  const handleSelectThemePreset = (themeId: DocumentThemeId) => {
    const preset = THEME_PRESETS[themeId];
    handleUpdateDesign({
      themeId,
      accentColor: preset.defaultAccent,
      paperStyle: preset.defaultPaper,
      borderStyle: preset.defaultBorder,
      fontFamily: preset.defaultFont,
      stampText: preset.defaultStamp,
      organizationHeader: preset.defaultHeader,
    });
  };

  // Gemini AI によるデザイン枠生成・適用
  const handleApplyAiDesign = (customPrompt?: string) => {
    const targetPrompt = (customPrompt ?? aiDesignPrompt).trim();
    if (!targetPrompt) return;

    const { nextDesign, explanation } = generateDesignFromAiPrompt(
      targetPrompt,
      currentDesign,
      project.title
    );
    handleUpdateDesign(nextDesign);
    setAiDesignFeedback(explanation);
    if (!customPrompt) {
      setAiDesignPrompt("");
    }
  };

  // ① キャラクター＆ハンドアウトの直接更新ヘルパー
  const handleUpdateActiveChar = (updater: (c: Character) => Character) => {
    if (!activeChar) return;
    onUpdateProject((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => (c.id === activeChar.id ? updater(c) : c)),
    }));
    triggerSaveFeedback();
  };

  // ② 証拠資料の直接更新ヘルパー
  const handleUpdateActiveEvidence = (updater: (ev: EvidenceItem) => EvidenceItem) => {
    if (!activeEvidence) return;
    onUpdateProject((prev) => ({
      ...prev,
      evidences: prev.evidences.map((e) => (e.id === activeEvidence.id ? updater(e) : e)),
    }));
    triggerSaveFeedback();
  };

  const handleAddNewEvidence = () => {
    const newId = `ev-${Date.now()}`;
    const newEv: EvidenceItem = {
      id: newId,
      title: "新規調査記録・証拠資料",
      description:
        "ここに証拠の詳細テキストを入力してください。デザイン画面内で直接クリックして文章を編集・保存できます。",
      ownerId: "all",
      foundPhase: typeof evidenceDayFilter === "number" ? evidenceDayFilter : 1,
      visibility: "public",
      category: "document",
      acquisitionCondition: "調査アクションまたはフェーズ進行により開示",
    };
    onUpdateProject((prev) => ({
      ...prev,
      evidences: [...prev.evidences, newEv],
    }));
    setSelectedEvidenceId(newId);
    triggerSaveFeedback();
  };

  // ③ 全体提示ビジュアルボードの更新ヘルパー
  const handleUpdateActiveVisual = (updater: (v: VisualBoardItem) => VisualBoardItem) => {
    if (!activeVisual) return;
    const currentBoards = getDefaultVisualBoards(project);
    const updatedBoards = currentBoards.map((b) =>
      b.id === activeVisual.id ? updater(b) : b
    );
    onUpdateProject((prev) => ({
      ...prev,
      visualBoards: updatedBoards,
    }));
    triggerSaveFeedback();
  };

  const handleAddCustomVisualBoard = () => {
    const newId = `vis-custom-${Date.now()}`;
    const newBoard: VisualBoardItem = {
      id: newId,
      title: "新規 全体提示マップ・現場写真資料",
      subtitle: "プレイヤー全員に公開・提示する視覚資料シート",
      boardType: "custom_image",
      dayNumber: 1,
      captionTitle: "【視覚資料・現場解説】",
      captionBody:
        "ここに地図や写真に関する解説テキストを入力してください。上の「画像をアップロード」ボタンから手持ちの画像・図面を配置することも可能です。",
      annotations: [
        "注目ポイント①：クリックして注釈テキストを直接編集できます",
        "注目ポイント②：現場の位置関係や目撃情報をここに記載します",
      ],
      showGmSecrets: false,
    };
    const currentBoards = getDefaultVisualBoards(project);
    onUpdateProject((prev) => ({
      ...prev,
      visualBoards: [...currentBoards, newBoard],
    }));
    setSelectedVisualId(newId);
    triggerSaveFeedback();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleUpdateActiveVisual((v) => ({
          ...v,
          imageUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ④ GM進行資料（タイムライン＆GMノート）の更新ヘルパー
  const handleUpdateActiveTimelineStep = (updater: (step: IncidentStep) => IncidentStep) => {
    if (!activeTimelineStep) return;
    onUpdateProject((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) =>
        t.dayNumber === activeTimelineStep.dayNumber ? updater(t) : t
      ),
    }));
    triggerSaveFeedback();
  };

  const handleUpdateActiveGmNote = (updater: (note: GmProgressionNote) => GmProgressionNote) => {
    const currentNote = getGmNoteForDay(project, selectedGmDay);
    const updatedNote = updater(currentNote);
    onUpdateProject((prev) => ({
      ...prev,
      gmNotes: {
        ...(prev.gmNotes || {}),
        [selectedGmDay]: updatedNote,
      },
    }));
    triggerSaveFeedback();
  };

  // デザインされたシートをそのままA4/PDF印刷する関数
  const handlePrintDesignedSheet = () => {
    // 全体提示の地図・写真カテゴリの場合は、A4用紙（余白0mm・画像のみ最大化・90度回転配置）で印刷
    if (category === "visuals" && activeVisual?.imageUrl) {
      const imgUrl = activeVisual.imageUrl;
      const isRotated = visualOrientation === "landscape_rotated";
      const isWithMargin = activeVisual.hasWhiteMargin ?? (activeVisual.id === "vis-day2-aerial");

      const printWin = document.createElement("iframe");
      printWin.style.position = "fixed";
      printWin.style.right = "0";
      printWin.style.bottom = "0";
      printWin.style.width = "0";
      printWin.style.height = "0";
      printWin.style.border = "0";
      document.body.appendChild(printWin);

      const doc = printWin.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${activeVisual.title}</title>
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
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #ffffff;
    }
    .print-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    ${
      isRotated
        ? isWithMargin
          ? `
    /* 横長画像を90度回転＋適度な白い余白（88%縮小でA4用紙に美しいマージンを形成） */
    .print-img {
      position: absolute;
      width: 88vh;
      height: 88vw;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    `
          : `
    /* 横長画像を90度回転させてA4縦用紙（210mm × 297mm）めいっぱいに最大化 */
    .print-img {
      position: absolute;
      width: 100vh;
      height: 100vw;
      max-width: none;
      max-height: none;
      object-fit: contain;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    `
        : isWithMargin
        ? `
    .print-img {
      width: 88vw;
      height: 88vh;
      object-fit: contain;
    }
    `
        : `
    .print-img {
      width: 100vw;
      height: 100vh;
      object-fit: contain;
    }
    `
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    <img src="${imgUrl}" class="print-img" alt="${activeVisual.title}" />
  </div>
</body>
</html>`);
        doc.close();
        setTimeout(() => {
          printWin.contentWindow?.focus();
          printWin.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(printWin)) {
              document.body.removeChild(printWin);
            }
          }, 3000);
        }, 800);
      }
      return;
    }

    if (!printableSheetRef.current) return;

    // 一時的に直接編集モードの補助ボタン等を非表示にしたHTMLを取得するため、クローンを作成してinput/textareaをテキスト化
    const clone = printableSheetRef.current.cloneNode(true) as HTMLElement;

    // クローン内のtextareaとinputの現在値をプレーンテキスト要素に置換（印刷時にスクロールバー等で切れないようにする）
    const origTextareas = printableSheetRef.current.querySelectorAll("textarea");
    const cloneTextareas = clone.querySelectorAll("textarea");
    origTextareas.forEach((orig, idx) => {
      const target = cloneTextareas[idx];
      if (target) {
        const div = document.createElement("div");
        div.className = target.className;
        div.style.whiteSpace = "pre-wrap";
        div.style.wordBreak = "break-word";
        div.style.border = "none";
        div.style.background = "transparent";
        div.style.padding = "0";
        div.textContent = orig.value;
        target.parentNode?.replaceChild(div, target);
      }
    });

    const origInputs = printableSheetRef.current.querySelectorAll("input[type='text'], input[type='number']");
    const cloneInputs = clone.querySelectorAll("input[type='text'], input[type='number']");
    origInputs.forEach((orig, idx) => {
      const target = cloneInputs[idx];
      if (target) {
        const span = document.createElement("span");
        span.className = target.className;
        span.style.border = "none";
        span.style.background = "transparent";
        span.textContent = (orig as HTMLInputElement).value;
        target.parentNode?.replaceChild(span, target);
      }
    });

    // 印刷不要な操作ボタン（.no-print）を除去
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());

    const htmlContent = clone.outerHTML;
    const printWin = document.createElement("iframe");
    printWin.style.position = "fixed";
    printWin.style.right = "0";
    printWin.style.bottom = "0";
    printWin.style.width = "0";
    printWin.style.height = "0";
    printWin.style.border = "0";
    document.body.appendChild(printWin);

    const doc = printWin.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${project.title} - デザイン配布資料印刷</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
      doc.close();
      setTimeout(() => {
        printWin.contentWindow?.focus();
        printWin.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printWin)) {
            document.body.removeChild(printWin);
          }
        }, 3000);
      }, 600);
    }
  };

  // 枠線スタイルのクラス計算
  const getBorderFrameClasses = () => {
    switch (currentDesign.borderStyle) {
      case "double_official":
        return `border-4 double ${accent.borderMain} shadow-xl`;
      case "classic_ornament":
        return `border-2 ${accent.borderMain} ring-4 ring-inset ${accent.borderSub} shadow-xl`;
      case "tech_corner":
        return `border-2 ${accent.borderMain} shadow-xl`;
      case "hazard_stripe":
        return `border-t-8 border-b-8 border-l-2 border-r-2 ${accent.borderMain} shadow-xl`;
      case "minimal_line":
      default:
        return `border ${accent.borderSub} shadow-lg`;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* 1. 最上部ヘッダー：4大資料カテゴリー切替 ＆ 保存・印刷コントロール */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-6 py-3">
        {/* 4大資料カテゴリータブ */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setCategory("handouts")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "handouts"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4 text-emerald-400" />
            ① 個人向けハンドアウト
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {(project.characters || []).length}名
            </span>
          </button>

          <button
            onClick={() => setCategory("evidences")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "evidences"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            ② 証拠資料（文書・カード）
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {(project.evidences || []).length}件
            </span>
          </button>

          <button
            onClick={() => setCategory("visuals")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "visuals"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Map className="h-4 w-4 text-cyan-400" />
            ③ 全体提示の地図・写真
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              {visualBoards.length}枚
            </span>
          </button>

          <button
            onClick={() => setCategory("gm_guides")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              category === "gm_guides"
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Radio className="h-4 w-4 text-rose-400" />
            ④ GM用の進行資料
            <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300">
              全{project.timeline.length}フェーズ
            </span>
          </button>
        </div>

        {/* 右側：直接編集トグル・保存ボタン・デザイン印刷ボタン */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 編集モード切替 */}
          <button
            onClick={() => setIsDirectEditMode(!isDirectEditMode)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              isDirectEditMode
                ? "border-indigo-500/60 bg-indigo-950/70 text-indigo-200"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
            title="デザインされた画面の中でそのまま文字を書き換えるモードと、印刷前の純粋な完成プレビューを切り替えます"
          >
            {isDirectEditMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                画面内テキスト直接編集：ON
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                完成プレビュー表示中（クリックで編集へ）
              </>
            )}
          </button>

          {/* 明示的保存ボタン + 保存ステータス */}
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow ${
              saveStatus === "just_saved"
                ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
            title="編集したテキストとデザイン枠の設定をシナリオデータへ保存します（Cmd/Ctrl+S）"
          >
            {saveStatus === "just_saved" ? (
              <>
                <Check className="h-4 w-4" />
                保存しました！（{lastSavedTime}）
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                💾 修正内容を保存
              </>
            )}
          </button>

          {/* デザインされたまま印刷 / PDF保存 */}
          <button
            onClick={handlePrintDesignedSheet}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/25"
            title="現在のデザイン枠・スタンプ・配色のままA4印刷またはPDF保存します"
          >
            <Printer className="h-4 w-4" />
            🖨️ このデザインで印刷 / PDF保存
          </button>
        </div>
      </div>

      {/* 2. サブバー：個人ハンドアウト時は「本紙 vs 別配付カード切替」、それ以外は「Gemini AI デザイン着せ替えバー」 */}
      {category === "handouts" ? (
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">表示・印刷対象：</span>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setHandoutViewMode("sheet")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  handoutViewMode === "sheet"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📄 個人ハンドアウト本紙（6つの構成要素）
              </button>
              <button
                onClick={() => setHandoutViewMode("cards")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  handoutViewMode === "cards"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🃏 別配付カード（初期所持品・携行アイテム ／ 固有能力・専門スキル）
              </button>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            ※個人ハンドアウトは特別なテーマ装飾を省き、読みやすい標準構成にまとめています
          </span>
        </div>
      ) : (
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 min-w-[320px]">
              <div className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-2.5 py-1 text-xs font-bold text-indigo-300 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Gemini デザイン枠生成
              </div>
              <input
                type="text"
                value={aiDesignPrompt}
                onChange={(e) => setAiDesignPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyAiDesign();
                }}
                placeholder="どんな雰囲気の資料にしたいですか？（例：『防衛省の極秘調査報告書風』『神社の古い和紙の伝承記録風』『緊急の通信傍受ログ風』）"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => handleApplyAiDesign()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shrink-0 shadow"
              >
                ✨ デザイン枠を適用
              </button>
            </div>

            {/* ワンクリック・デザイン着せ替えチップ */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">枠テーマ切替:</span>
              {(
                [
                  ["classified_dossier", "📁 極秘指令書"],
                  ["official_report", "🏛️ 公文書・報告書"],
                  ["ancient_scroll", "📜 古文書・手記"],
                  ["digital_telemetry", "📡 通信・観測データ"],
                  ["medical_forensic", "🔬 鑑定・カルテ"],
                  ["gm_tactical_binder", "📋 GM進行表"],
                ] as [DocumentThemeId, string][]
              ).map(([tId, label]) => (
                <button
                  key={tId}
                  onClick={() => handleSelectThemePreset(tId)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                    currentDesign.themeId === tId
                      ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                      : "border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => setIsDesignCustomizerOpen(!isDesignCustomizerOpen)}
                className={`ml-1 flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold transition ${
                  isDesignCustomizerOpen
                    ? "border-amber-500/60 bg-amber-950/60 text-amber-200"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Palette className="h-3 w-3 text-amber-400" />
                細かい枠・色・スタンプ調整
              </button>
            </div>
          </div>

          {/* AIデザイン適用フィードバック */}
          {aiDesignFeedback && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3 py-1.5 text-xs text-indigo-200">
              <span>✨ {aiDesignFeedback}</span>
              <button
                onClick={() => setAiDesignFeedback("")}
                className="text-slate-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* 詳細デザイン枠カスタマイザー（開閉式） */}
          {isDesignCustomizerOpen && (
            <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3 md:grid-cols-5">
              {/* 色調 */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  🎨 アクセント色調
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["indigo", "濃紺", "bg-indigo-700"],
                      ["crimson", "機密赤", "bg-rose-700"],
                      ["amber", "古文書琥珀", "bg-amber-700"],
                      ["cyan", "通信シアン", "bg-cyan-700"],
                      ["emerald", "鑑定緑", "bg-emerald-700"],
                      ["slate", "モノトーン", "bg-slate-700"],
                    ] as [DocumentAccentColor, string, string][]
                  ).map(([colorKey, label, dotClass]) => (
                    <button
                      key={colorKey}
                      onClick={() => handleUpdateDesign({ accentColor: colorKey })}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold border transition ${
                        currentDesign.accentColor === colorKey
                          ? "border-white bg-slate-800 text-white"
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 用紙の質感 */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  📄 用紙・背景テクスチャ
                </label>
                <select
                  value={currentDesign.paperStyle}
                  onChange={(e) =>
                    handleUpdateDesign({ paperStyle: e.target.value as DocumentPaperStyle })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="clean_white">クリアホワイト（標準A4紙）</option>
                  <option value="dossier_cream">機密ファイル・クリーム紙</option>
                  <option value="warm_parchment">古文書・和紙羊皮紙トーン</option>
                  <option value="blueprint_grid">科学解析・方眼レポート紙</option>
                </select>
              </div>

              {/* 飾り枠・ボーダー */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  🖼️ 外枠（フレーム）装飾
                </label>
                <select
                  value={currentDesign.borderStyle}
                  onChange={(e) =>
                    handleUpdateDesign({ borderStyle: e.target.value as DocumentBorderStyle })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="double_official">公文書二重枠（公式・重厚）</option>
                  <option value="classic_ornament">古典飾り罫（伝承・手記）</option>
                  <option value="tech_corner">テクニカル枠（通信・科学）</option>
                  <option value="hazard_stripe">緊急ハザード帯（現場報告）</option>
                  <option value="minimal_line">ミニマル細線（モダン）</option>
                </select>
              </div>

              {/* 書体（フォント） */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  🔤 本文・見出し書体
                </label>
                <div className="flex gap-1.5">
                  {(
                    [
                      ["sans", "ゴシック体"],
                      ["serif", "明朝体"],
                      ["mono", "等幅通信体"],
                    ] as ["sans" | "serif" | "mono", string][]
                  ).map(([fKey, fLabel]) => (
                    <button
                      key={fKey}
                      onClick={() => handleUpdateDesign({ fontFamily: fKey })}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                        currentDesign.fontFamily === fKey
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {fLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* スタンプ印字 */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-400">
                  💮 スタンプ印字文言
                </label>
                <input
                  type="text"
                  value={currentDesign.stampText}
                  onChange={(e) => handleUpdateDesign({ stampText: e.target.value })}
                  placeholder="例: 極秘 / TOP SECRET"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. メイン作業エリア：左サイドバー（資料リスト選択）＋ 右メインキャンバス（デザイン内直接編集シート） */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* 左サイドバー：カテゴリー内の資料一覧 */}
        <div className="col-span-3 flex flex-col border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          {/* ① 個人ハンドアウト ＆ 別配付カード選択リスト */}
          {category === "handouts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  プレイヤー別ハンドアウト ({project.characters.length}名)
                </h3>
              </div>

              {/* 本紙（6項目） vs 別配付カード（所持品・能力）切替 */}
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setHandoutViewMode("sheet")}
                  className={`rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                    handoutViewMode === "sheet"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 ハンドアウト本紙
                </button>
                <button
                  onClick={() => setHandoutViewMode("cards")}
                  className={`rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                    handoutViewMode === "cards"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🃏 所持品・能力カード
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {handoutViewMode === "sheet"
                  ? "自分自身のキャラクターについて書かれたシンプルな6項目シートです。"
                  : "ハンドアウト本紙とは別に各プレイヤーへ配る「初期所持品」「固有能力」のカードシートです。"}
              </p>

              <div className="space-y-2">
                {project.characters.map((c, idx) => {
                  const isSelected = c.id === activeChar?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCharId(c.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          PC-{idx + 1} /{" "}
                          {c.location === "headquarters" ? "海上保安庁東京本部" : "小笠原・現地救難隊"}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          所持品{(c.initialItems || []).length}・能力{(c.capabilities || []).length}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-sm text-white">{c.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.profession}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ② 証拠資料選択リスト */}
          {category === "evidences" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  証拠・調査記録 ({filteredEvidences.length}件)
                </h3>
                <button
                  onClick={handleAddNewEvidence}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  新規証拠追加
                </button>
              </div>

              {/* フェーズ絞り込み */}
              <div className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                <button
                  onClick={() => setEvidenceDayFilter("all")}
                  className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                    evidenceDayFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  全て({(project.evidences || []).length})
                </button>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setEvidenceDayFilter(d)}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                      evidenceDayFilter === d
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredEvidences.map((ev) => {
                  const isSelected = ev.id === activeEvidence?.id;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                          Day {ev.foundPhase}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ev.category === "document"
                            ? "📄 文書記録"
                            : ev.category === "data"
                            ? "📊 観測データ"
                            : ev.category === "sample"
                            ? "🔬 検体・物証"
                            : ev.category === "testimony"
                            ? "🗣️ 証言調書"
                            : "📻 音声・通信"}
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white line-clamp-2">
                        {ev.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ③ 全体提示される地図や写真リスト */}
          {category === "visuals" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  全体提示マップ・写真 ({visualBoards.length}枚)
                </h3>
                <button
                  onClick={handleAddCustomVisualBoard}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  地図・写真追加
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                プレイヤー全員に提示・配布する地図・現場写真・解読ワークシートを選択し、注釈や解説文を直接編集できます。
              </p>

              <div className="space-y-2">
                {visualBoards.map((vb) => {
                  const isSelected = vb.id === activeVisual?.id;
                  return (
                    <button
                      key={vb.id}
                      onClick={() => setSelectedVisualId(vb.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                          {vb.dayNumber === 0 ? "全域" : `Day ${vb.dayNumber}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {vb.boardType === "nautical_chart_white"
                            ? "🧭 白海図（PL用）"
                            : vb.boardType === "nautical_chart_gm"
                            ? "🎯 GM解析海図"
                            : vb.boardType === "aerial_photo"
                            ? "📷 航空偵察写真"
                            : vb.boardType === "tactical_chart" || vb.boardType === "sector_grid"
                            ? "🎯 索敵作戦図"
                            : vb.boardType === "sonar_photo"
                            ? "📷 索敵撮影写真"
                            : vb.boardType.includes("eruption") || vb.boardType === "seismic_chart"
                            ? "🌋 噴火観測図"
                            : vb.boardType === "theater_map" || vb.boardType === "route_map"
                            ? "🗺️ 広域作戦海図"
                            : "🖼️ 図版・写真"}
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white">{vb.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                        {vb.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ④ GM進行資料選択リスト */}
          {category === "gm_guides" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GM進行シート（全{project.timeline.length}フェーズ）
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                フェーズ別の読み上げスクリプト、時間配分、各班への誘導、開示証拠リストをデザインされた進行表の上で直接修正・保存できます。
              </p>

              <div className="space-y-2">
                {project.timeline.map((step) => {
                  const isSelected = step.dayNumber === selectedGmDay;
                  return (
                    <button
                      key={step.dayNumber}
                      onClick={() => setSelectedGmDay(step.dayNumber)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-950/70 shadow-md ring-1 ring-indigo-500/40"
                          : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          Day {step.dayNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {step.locationName}
                        </span>
                      </div>
                      <div className="mt-1.5 font-bold text-xs text-white">
                        {step.situationTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右メインキャンバス：A4デザイン資料プレビュー ＆ 画面内直接テキスト編集 */}
        <div className="col-span-9 flex-1 overflow-y-auto bg-slate-900/90 p-6 md:p-10">
          {/* キャンバス上部ガイドバー */}
          <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {isDirectEditMode ? (
                <span>
                  💡 <strong>画面内直接編集モード</strong>：下のデザインされた用紙内の見出しや文章を<strong>直接クリックして書き換え</strong>できます（変更はリアルタイムで保存され、右上の「💾 修正内容を保存」でも確定できます）
                </span>
              ) : (
                <span>
                  👁️ <strong>完成プレビューモード</strong>：実際の配布・印刷時と同じ見た目を表示しています
                </span>
              )}
            </div>
          </div>

          {/* ====================================================================
              デザイン済みドキュメント用紙本体（A4相当・印刷ターゲット）
             ==================================================================== */}
          <div
            ref={printableSheetRef}
            className={`mx-auto max-w-4xl transition-all relative ${
              category === "visuals"
                ? "bg-transparent p-0 border-0 shadow-none"
                : category === "handouts"
                ? "bg-white text-slate-900 border border-slate-300 shadow-lg font-sans rounded-sm p-8 md:p-12"
                : `${paper.className} ${fontClass} ${getBorderFrameClasses()} rounded-sm p-8 md:p-12`
            }`}
          >
            {/* ----------------------------------------------------------------
                共通ドキュメントヘッダー（証拠資料・GM資料のみ表示。個人ハンドアウトおよび全体提示の地図・写真は枠不要のため非表示）
               ---------------------------------------------------------------- */}
            {category !== "handouts" && category !== "visuals" && (
              <div className={`mb-6 border-b-2 pb-4 ${accent.borderMain} relative`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* 発令機関ヘッダー（直接編集可能） */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={currentDesign.organizationHeader}
                          onChange={(e) =>
                            handleUpdateDesign({ organizationHeader: e.target.value })
                          }
                          className="w-full max-w-md border-b border-dashed border-slate-400/60 bg-transparent px-1 py-0.5 text-xs font-bold tracking-widest focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                          title="クリックして発令機関・ヘッダー名を直接編集"
                        />
                      ) : (
                        <span>{currentDesign.organizationHeader}</span>
                      )}
                    </div>

                    {/* 文書コード・シナリオ名 */}
                    <div className="mt-1 flex items-center gap-3 text-[11px] font-mono opacity-70">
                      <span>FILE:</span>
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={currentDesign.documentCode}
                          onChange={(e) => handleUpdateDesign({ documentCode: e.target.value })}
                          className="w-40 border-b border-dashed border-slate-400/60 bg-transparent px-1 py-0.5 font-mono text-[11px] focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                          title="文書管理番号を直接編集"
                        />
                      ) : (
                        <span>{currentDesign.documentCode}</span>
                      )}
                      <span>｜</span>
                      <span>PROJECT: {project.title}</span>
                    </div>
                  </div>

                  {/* 斜めスタンプ枠（直接編集可能） */}
                  <div
                    className={`rotate-[-4deg] border-2 px-3 py-1 text-center font-extrabold tracking-widest uppercase shadow-sm ${accent.stampBorder} ${accent.stampText}`}
                  >
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={currentDesign.stampText}
                        onChange={(e) => handleUpdateDesign({ stampText: e.target.value })}
                        className="w-44 bg-transparent text-center text-xs font-extrabold uppercase tracking-widest focus:bg-white/50 focus:outline-none"
                        title="スタンプの文言を直接編集"
                      />
                    ) : (
                      <span className="text-xs">{currentDesign.stampText}</span>
                    )}
                  </div>
                </div>

                {/* 公文書テーマの場合の3連承認印欄 */}
                {currentDesign.themeId === "official_report" && (
                  <div className="mt-3 flex justify-end">
                    <div className="grid grid-cols-3 border border-slate-400 text-center text-[10px]">
                      <div className="border-r border-slate-400 px-3 py-1">
                        <div className="border-b border-slate-300 pb-0.5 font-bold">最高責任者</div>
                        <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                          承認済
                        </div>
                      </div>
                      <div className="border-r border-slate-400 px-3 py-1">
                        <div className="border-b border-slate-300 pb-0.5 font-bold">情報分析官</div>
                        <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                          検印
                        </div>
                      </div>
                      <div className="px-3 py-1">
                        <div className="border-b border-slate-300 pb-0.5 font-bold">記録担当</div>
                        <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-600/80 text-[9px] font-bold text-red-600/80">
                          登録
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                ① 個人向けハンドアウト（6項目シンプル本紙 ＆ 別配付カード）
               ================================================================ */}
            {category === "handouts" && activeChar && (
              <div className="space-y-6">
                {handoutViewMode === "sheet" ? (
                  /* ------------------------------------------------------------
                     📄 個人ハンドアウト本紙（特別なテーマ装飾なし・6つの構成要素のみ）
                     ------------------------------------------------------------ */
                  <div className="space-y-5">
                    {/* シンプルなシート見出し */}
                    <div className="border-b-2 border-slate-800 pb-3 flex items-baseline justify-between">
                      <span className="text-xs font-bold tracking-widest text-slate-500">
                        {project.title} ― 個人ハンドアウト
                      </span>
                      <span className="text-xs text-slate-500">
                        配置拠点：
                        {activeChar.location === "headquarters"
                          ? "海上保安庁東京本部"
                          : "小笠原・現地救難隊"}
                      </span>
                    </div>

                    {/* 1. 役割 ＆ 2. 所属・肩書・職業 */}
                    <div className="grid grid-cols-1 gap-4 rounded-md border border-slate-300 bg-slate-50/70 p-4 md:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-600">
                          ■ 役割
                        </div>
                        {isDirectEditMode ? (
                          <input
                            type="text"
                            value={activeChar.name}
                            onChange={(e) =>
                              handleUpdateActiveChar((c) => ({ ...c, name: e.target.value }))
                            }
                            className="w-full rounded border border-dashed border-slate-400 bg-white px-2.5 py-1.5 text-lg font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                          />
                        ) : (
                          <div className="text-lg font-bold text-slate-900">{activeChar.name}</div>
                        )}
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-600">
                          ■ 所属・肩書・職業
                        </div>
                        {isDirectEditMode ? (
                          <textarea
                            rows={2}
                            value={activeChar.profession}
                            onChange={(e) =>
                              handleUpdateActiveChar((c) => ({
                                ...c,
                                profession: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-dashed border-slate-400 bg-white px-2.5 py-1.5 text-xs font-semibold leading-snug text-slate-900 focus:border-slate-800 focus:outline-none resize-none"
                          />
                        ) : (
                          <div className="whitespace-pre-wrap break-words text-xs font-semibold leading-snug text-slate-900 mt-1">
                            {activeChar.profession}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. 全員に公開できるプロフィール */}
                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <h3 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-800">
                        ■ 全員に公開できるプロフィール
                      </h3>
                      {isDirectEditMode ? (
                        <textarea
                          rows={2}
                          value={activeChar.handout.publicProfile}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              handout: { ...c.handout, publicProfile: e.target.value },
                            }))
                          }
                          className="w-full rounded border border-dashed border-slate-400 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                          {activeChar.handout.publicProfile}
                        </p>
                      )}
                    </div>

                    {/* 4. あなたの内面（公開されないもの）・行動指針 */}
                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <h3 className="mb-3 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-800">
                        ■ あなたの内面（公開されないもの）・行動指針
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded border border-slate-200 bg-slate-50/70 p-3">
                          <div className="mb-1 text-[11px] font-bold text-slate-700">
                            ・誇り・信条・行動指針
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout.internalDrama.pride}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: {
                                    ...c.handout,
                                    internalDrama: {
                                      ...c.handout.internalDrama,
                                      pride: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full rounded border border-dashed border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                              {activeChar.handout.internalDrama.pride}
                            </p>
                          )}
                        </div>

                        <div className="rounded border border-slate-200 bg-slate-50/70 p-3">
                          <div className="mb-1 text-[11px] font-bold text-slate-700">
                            ・過去の喪失・悔恨
                          </div>
                          {isDirectEditMode ? (
                            <textarea
                              rows={3}
                              value={activeChar.handout.internalDrama.loss}
                              onChange={(e) =>
                                handleUpdateActiveChar((c) => ({
                                  ...c,
                                  handout: {
                                    ...c.handout,
                                    internalDrama: {
                                      ...c.handout.internalDrama,
                                      loss: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full rounded border border-dashed border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                              {activeChar.handout.internalDrama.loss}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 5. あなたの記憶 */}
                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <h3 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-800">
                        ■ あなたの記憶
                      </h3>
                      {isDirectEditMode ? (
                        <textarea
                          rows={5}
                          value={activeChar.introduction}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({ ...c, introduction: e.target.value }))
                          }
                          className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                          {activeChar.introduction}
                        </div>
                      )}
                    </div>

                    {/* 6. 自己紹介 */}
                    <div className="rounded-md border border-slate-300 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <h3 className="text-xs font-bold text-slate-800">
                          ■ 自己紹介
                        </h3>
                        {onSendAiPrompt && (
                          <button
                            onClick={() =>
                              onSendAiPrompt(
                                `【${activeChar.name}の自己紹介・記憶の推敲依頼】\n以下の「あなたの記憶」と「自己紹介」をより自然で臨場感ある文章にブラッシュアップしてください：\n\n【あなたの記憶】\n${activeChar.introduction}\n\n【自己紹介】\n${activeChar.handout.handoutBody}`
                              )
                            }
                            className="no-print flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                          >
                            <Sparkles className="h-3 w-3" />
                            AIチャットで推敲する
                          </button>
                        )}
                      </div>
                      {isDirectEditMode ? (
                        <textarea
                          rows={6}
                          value={activeChar.handout.handoutBody}
                          onChange={(e) =>
                            handleUpdateActiveChar((c) => ({
                              ...c,
                              handout: { ...c.handout, handoutBody: e.target.value },
                            }))
                          }
                          className="w-full rounded border border-dashed border-slate-400 bg-white p-2.5 text-xs leading-relaxed text-slate-900 focus:border-slate-800 focus:outline-none"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                          {activeChar.handout.handoutBody}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ------------------------------------------------------------
                     🃏 別配付カードシート（初期所持品・携行アイテム ＆ 固有能力・専門スキル）
                     ------------------------------------------------------------ */
                  <div className="space-y-6">
                    <div className="border-b-2 border-slate-800 pb-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs font-bold tracking-widest text-slate-500 block">
                          {project.title} ― 個人別配付カードシート（切り取り配布用）
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                          {activeChar.name}（{activeChar.profession}）配布カード一覧
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500">
                        ※点線に沿って切り取り、ハンドアウト本紙とは別に配布してください
                      </span>
                    </div>

                    {/* 初期所持品・携行アイテムカード一覧 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800">
                          ■ 初期所持品・携行アイテムカード（{(activeChar.initialItems || []).length}枚）
                        </h3>
                        {isDirectEditMode && (
                          <button
                            onClick={() =>
                              handleUpdateActiveChar((c) => ({
                                ...c,
                                initialItems: [...(c.initialItems || []), "新規所持品アイテム"],
                              }))
                            }
                            className="no-print rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                          >
                            ＋ 所持品カードを追加
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {(activeChar.initialItems || []).map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="rounded-md border-2 border-dashed border-slate-400 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-bold text-slate-500">
                              <span>【初期所持品・携行アイテム】 {activeChar.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">ITEM-{iIdx + 1}</span>
                                {isDirectEditMode && (
                                  <button
                                    onClick={() =>
                                      handleUpdateActiveChar((c) => ({
                                        ...c,
                                        initialItems: c.initialItems.filter(
                                          (_, idx) => idx !== iIdx
                                        ),
                                      }))
                                    }
                                    className="no-print text-slate-400 hover:text-red-600"
                                    title="この所持品カードを削除"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {isDirectEditMode ? (
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const nextItems = [...activeChar.initialItems];
                                  nextItems[iIdx] = e.target.value;
                                  handleUpdateActiveChar((c) => ({
                                    ...c,
                                    initialItems: nextItems,
                                  }));
                                }}
                                className="w-full rounded border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                              />
                            ) : (
                              <div className="text-sm font-bold text-slate-900 py-1">{item}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 固有能力・専門スキルカード一覧 */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800">
                          ■ 固有能力・専門スキルカード（{(activeChar.capabilities || []).length}枚）
                        </h3>
                        {isDirectEditMode && (
                          <button
                            onClick={() =>
                              handleUpdateActiveChar((c) => ({
                                ...c,
                                capabilities: [
                                  ...(c.capabilities || []),
                                  {
                                    id: `cap-${Date.now()}`,
                                    name: "新規専門スキル",
                                    description: "スキルの効果・調査内容を記載",
                                    targetPhase: 1,
                                  },
                                ],
                              }))
                            }
                            className="no-print rounded bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                          >
                            ＋ スキルカードを追加
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {(activeChar.capabilities || []).map((cap, cIdx) => (
                          <div
                            key={cap.id || cIdx}
                            className="rounded-md border-2 border-dashed border-slate-400 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-bold text-slate-500">
                              <span>【固有能力・専門スキル】 {activeChar.name}</span>
                              <span className="font-mono">SKILL-{cIdx + 1}</span>
                            </div>

                            {isDirectEditMode ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    使用可能: Day
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={7}
                                    value={cap.targetPhase}
                                    onChange={(e) => {
                                      const nextCaps = [...activeChar.capabilities];
                                      nextCaps[cIdx] = {
                                        ...cap,
                                        targetPhase: parseInt(e.target.value, 10) || 1,
                                      };
                                      handleUpdateActiveChar((c) => ({
                                        ...c,
                                        capabilities: nextCaps,
                                      }));
                                    }}
                                    className="w-14 rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-900"
                                  />
                                  <input
                                    type="text"
                                    value={cap.name}
                                    onChange={(e) => {
                                      const nextCaps = [...activeChar.capabilities];
                                      nextCaps[cIdx] = { ...cap, name: e.target.value };
                                      handleUpdateActiveChar((c) => ({
                                        ...c,
                                        capabilities: nextCaps,
                                      }));
                                    }}
                                    className="flex-1 rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900"
                                  />
                                  <button
                                    onClick={() =>
                                      handleUpdateActiveChar((c) => ({
                                        ...c,
                                        capabilities: c.capabilities.filter(
                                          (_, idx) => idx !== cIdx
                                        ),
                                      }))
                                    }
                                    className="no-print text-slate-400 hover:text-red-600"
                                    title="このスキルカードを削除"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  rows={3}
                                  value={cap.description}
                                  onChange={(e) => {
                                    const nextCaps = [...activeChar.capabilities];
                                    nextCaps[cIdx] = { ...cap, description: e.target.value };
                                    handleUpdateActiveChar((c) => ({
                                      ...c,
                                      capabilities: nextCaps,
                                    }));
                                  }}
                                  className="w-full rounded border border-dashed border-slate-300 bg-slate-50 p-2 text-xs leading-relaxed text-slate-800"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-sm text-slate-900">
                                  <span className="mr-1.5 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                                    Day {cap.targetPhase}
                                  </span>
                                  {cap.name}
                                </div>
                                <div className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                                  {cap.description}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================================================================
                ② 証拠資料（テキスト中心の調査記録・文書）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "evidences" && activeEvidence && (
              <div className="space-y-6">
                {/* 証拠タイトル＆メタ情報ボックス */}
                <div className={`rounded-md p-5 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/20 px-2.5 py-0.5 font-mono font-bold">
                        EVIDENCE DOCUMENT / 証拠資料レコード
                      </span>
                      {isDirectEditMode ? (
                        <select
                          value={activeEvidence.foundPhase}
                          onChange={(e) =>
                            handleUpdateActiveEvidence((ev) => ({
                              ...ev,
                              foundPhase: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                          className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs font-bold text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>
                              開示フェーズ: Day {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded bg-amber-500/30 px-2 py-0.5 font-bold">
                          開示: Day {activeEvidence.foundPhase}
                        </span>
                      )}
                    </div>

                    {/* 公開区分・種別 */}
                    <div className="flex items-center gap-2">
                      {isDirectEditMode ? (
                        <>
                          <select
                            value={activeEvidence.category}
                            onChange={(e) =>
                              handleUpdateActiveEvidence((ev) => ({
                                ...ev,
                                category: e.target.value as EvidenceItem["category"],
                              }))
                            }
                            className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs text-white"
                          >
                            <option value="document">📄 文書・記録</option>
                            <option value="data">📊 観測・解析データ</option>
                            <option value="sample">🔬 検体・物証鑑定</option>
                            <option value="testimony">🗣️ 証言・聴取調書</option>
                            <option value="audio">📻 音声・通信ログ</option>
                          </select>
                          <select
                            value={activeEvidence.visibility}
                            onChange={(e) =>
                              handleUpdateActiveEvidence((ev) => ({
                                ...ev,
                                visibility: e.target.value as EvidenceVisibility,
                              }))
                            }
                            className="rounded border border-white/30 bg-slate-900 px-2 py-0.5 text-xs text-white"
                          >
                            <option value="public">🌐 全体公開情報</option>
                            <option value="shareable">🤝 共有可能情報</option>
                            <option value="private">🔒 個別秘匿情報</option>
                          </select>
                        </>
                      ) : (
                        <span className="text-xs opacity-90">
                          区分:{" "}
                          {activeEvidence.visibility === "public"
                            ? "全体公開証拠"
                            : activeEvidence.visibility === "shareable"
                            ? "譲渡・共有可能証拠"
                            : "個別秘匿証拠"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 証拠タイトル（直接編集可能） */}
                  <div className="mt-3">
                    <span className="block text-[10px] uppercase tracking-wider opacity-75">
                      資料件名 / EVIDENCE TITLE
                    </span>
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={activeEvidence.title}
                        onChange={(e) =>
                          handleUpdateActiveEvidence((ev) => ({
                            ...ev,
                            title: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-white/30 bg-white/10 px-3 py-1.5 text-xl font-bold text-white focus:border-white focus:bg-white/20 focus:outline-none"
                      />
                    ) : (
                      <h1 className="mt-1 text-xl font-bold">{activeEvidence.title}</h1>
                    )}
                  </div>
                </div>

                {/* 入手条件・関連アクション枠 */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3 ${accent.highlightBoxBorder} ${accent.highlightBoxBg}`}
                >
                  <div className="flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      ■ 入手経路・開示トリガー条件（ACQUISITION CONDITION）
                    </span>
                    {isDirectEditMode ? (
                      <input
                        type="text"
                        value={activeEvidence.acquisitionCondition || ""}
                        onChange={(e) =>
                          handleUpdateActiveEvidence((ev) => ({
                            ...ev,
                            acquisitionCondition: e.target.value,
                          }))
                        }
                        placeholder="例：Day 2 アクション調査 T-1 の実行により開示"
                        className="mt-0.5 w-full rounded border border-dashed border-slate-400 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900"
                      />
                    ) : (
                      <div className="mt-0.5 text-xs font-semibold">
                        {activeEvidence.acquisitionCondition || "フェーズ進行に伴い開示"}
                      </div>
                    )}
                  </div>
                </div>

                {/* テーマ別の装飾インジケーター（通信データや鑑定カルテの場合） */}
                {currentDesign.themeId === "digital_telemetry" && (
                  <div className="rounded border border-cyan-500/50 bg-cyan-950/90 p-3 font-mono text-[11px] text-cyan-200">
                    <div className="flex items-center justify-between border-b border-cyan-800 pb-1">
                      <span>SIGNAL TELEMETRY STREAM // VERIFIED</span>
                      <span>FREQ: 15-40Hz // DEPTH: 800m</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-cyan-400">
                      <span>▂▃▅▇█▇▅▃▂▁▂▄▆█▆▄▂▁▂▃▅▇█▇▅▃▂</span>
                      <span className="ml-2 text-[10px] text-cyan-300">
                        [ACOUSTIC / SEISMIC WAVEFORM RECORDED]
                      </span>
                    </div>
                  </div>
                )}

                {/* 証拠本文（メインテキスト・直接編集可能） */}
                <div className={`rounded-md border-2 p-6 ${accent.borderMain} bg-white/90 shadow-inner`}>
                  <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2">
                    <span className={`text-sm font-extrabold ${accent.sectionTitleText}`}>
                      ■ 調査報告・記録本文（RECORD BODY）
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ※枠内をクリックして直接テキストを修正・追記できます
                    </span>
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={14}
                      value={activeEvidence.description}
                      onChange={(e) =>
                        handleUpdateActiveEvidence((ev) => ({
                          ...ev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-dashed border-slate-400 bg-white p-3.5 text-sm leading-relaxed text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {activeEvidence.description}
                    </div>
                  )}
                </div>

                {/* プレイヤー記入用メモ欄（配布資料としての実用枠） */}
                <div className="rounded-md border border-dashed border-slate-400 bg-white/50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    ✏️ 調査班・プレイヤー考察メモ欄（ANALYSIS & NOTES）
                  </div>
                  <div className="mt-2 h-16 border-b border-dotted border-slate-300" />
                </div>
              </div>
            )}

            {/* ================================================================
                ③ 全体提示される地図や写真（ビジュアル提示ボード）のA4印刷最大化ビュー
               ================================================================ */}
            {category === "visuals" && activeVisual && (() => {
              const isWithMargin = activeVisual.hasWhiteMargin ?? (activeVisual.id === "vis-day2-aerial");
              return (
                <div className="space-y-4">
                  {/* 画面専用操作バー（印刷時は除外: no-print） */}
                  <div className="no-print rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-xs font-bold text-cyan-300">
                            {activeVisual.dayNumber === 0 ? "全域" : `Day ${activeVisual.dayNumber}`}
                          </span>
                          <h2 className="text-base font-bold text-white">{activeVisual.title}</h2>
                        </div>
                        <p className="text-xs text-slate-400">{activeVisual.subtitle}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 印刷向き切り替え（A4縦最大化 vs 通常向き） */}
                        <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setVisualOrientation("landscape_rotated")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition ${
                              visualOrientation === "landscape_rotated"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                            title="横長画像を90度回転し、A4縦用紙の長辺・短辺めいっぱいに配置します"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            A4縦最大化（90°回転）
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisualOrientation("portrait")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition ${
                              visualOrientation === "portrait"
                                ? "bg-indigo-600 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                            title="画像を回転させず、そのままA4用紙の中央に配置して印刷します"
                          >
                            <Compass className="h-3.5 w-3.5" />
                            通常向き（回転なし）
                          </button>
                        </div>

                        {/* 白い余白切り替えトグル（写真資料の縮小・余白設定） */}
                        <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateActiveVisual((v) => ({ ...v, hasWhiteMargin: true }))}
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-bold transition ${
                              isWithMargin
                                ? "bg-amber-600 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                            title="用紙の周囲に白い余白を作り、写真を少し縮小して中央に配置します"
                          >
                            🖼️ 白い余白あり
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateActiveVisual((v) => ({ ...v, hasWhiteMargin: false }))}
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-bold transition ${
                              !isWithMargin
                                ? "bg-amber-600 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                            title="用紙の端めいっぱいに画像を配置します"
                          >
                            全面最大（余白なし）
                          </button>
                        </div>

                        {/* A4印刷ボタン */}
                        <button
                          type="button"
                          onClick={handlePrintDesignedSheet}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow transition hover:shadow-emerald-500/25"
                        >
                          <Printer className="h-4 w-4" />
                          この図・写真をA4印刷
                        </button>

                        {/* 原寸表示 / 新規タブで開く */}
                        {activeVisual.imageUrl && (
                          <a
                            href={activeVisual.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            title="新しいタブで画像原寸ファイルを開きます"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                            原寸表示
                          </a>
                        )}

                        {/* 画像差し替えボタン（手持ち画像用） */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="手持ちの画像を読み込んで差し替えます"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          差し替え
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* A4プレビューキャンバス（デザイン枠や余計な文字を完全排除し、画像のみをA4比率で最大表示） */}
                  <div className="flex justify-center py-2">
                    <div className="relative w-full max-w-[700px] aspect-[210/297] bg-white shadow-2xl rounded-sm overflow-hidden flex items-center justify-center border border-slate-300">
                      {activeVisual.imageUrl ? (
                        visualOrientation === "landscape_rotated" ? (
                          /* 横長画像を90度回転させてA4縦（210mm × 297mm）にプレビュー（余白あり時は88%に縮小） */
                          <div
                            className="absolute flex items-center justify-center overflow-hidden"
                            style={{
                              width: isWithMargin ? "calc(88% * 297 / 210)" : "calc(100% * 297 / 210)",
                              height: isWithMargin ? "88%" : "100%",
                              transform: "rotate(90deg)",
                              transformOrigin: "center center",
                            }}
                          >
                            <img
                              src={activeVisual.imageUrl}
                              alt={activeVisual.title}
                              className={`max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none ${
                                isWithMargin ? "shadow-md" : ""
                              }`}
                            />
                          </div>
                        ) : (
                          /* 通常向き（回転なし）プレビュー（余白あり時は88%に縮小） */
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isWithMargin ? "p-8" : "p-2"
                            }`}
                          >
                            <img
                              src={activeVisual.imageUrl}
                              alt={activeVisual.title}
                              className={`${
                                isWithMargin
                                  ? "max-w-[88%] max-h-[88%] shadow-md"
                                  : "max-w-full max-h-full"
                              } w-auto h-auto object-contain select-none pointer-events-none`}
                            />
                          </div>
                        )
                      ) : (
                        <div className="text-center p-8 text-slate-400 text-sm">
                          画像が設定されていません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* ================================================================
                ④ GM用の進行資料（フェーズ別進行表・読み上げ・誘導）のデザイン＆直接編集ビュー
               ================================================================ */}
            {category === "gm_guides" && activeTimelineStep && (
              <div className="space-y-6">
                {/* ============================================================
                    【1ページ目】：GM演出・読み上げ台本シート
                   ============================================================ */}
                <div className="space-y-5">
                  {/* 🎙️ GM立ち位置・役柄ガイダンスバナー */}
                  <div className="rounded-md border border-cyan-400/80 bg-white/95 p-3 text-xs text-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2 border-l-4 border-l-cyan-600">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-900 flex items-center gap-1.5 text-xs">
                        <Radio className="h-4 w-4 text-cyan-700 shrink-0" />
                        🎙️ GM役柄・立ち位置：【合同対策本部 首席オペレーター 長津（ながつ）】
                      </span>
                      <span className="text-[11px] text-slate-600">
                        ｜ プレイヤー（危機管理官・防衛省・現地・学者等）の判断を尊重し、状況アナウンス・回線接続・時間管理を行う司令室のサポート役
                      </span>
                    </div>
                    <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-900 shrink-0">
                      SUPPORT ROLE
                    </span>
                  </div>

                  {/* GM進行ヘッダー帯（タイトル・観測地点・目標時間を横並び1列に統合） */}
                  <div className={`rounded-md p-4 ${accent.headerBg} ${accent.headerText} shadow`}>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    {/* Day X 状況タイトル */}
                    <div className="flex-1 min-w-[260px]">
                      <span className="block text-[10px] uppercase tracking-wider opacity-75">
                        Day {activeTimelineStep.dayNumber} 状況タイトル
                      </span>
                      {isDirectEditMode ? (
                        <input
                          type="text"
                          value={activeTimelineStep.situationTitle}
                          onChange={(e) =>
                            handleUpdateActiveTimelineStep((s) => ({
                              ...s,
                              situationTitle: e.target.value,
                            }))
                          }
                          className="mt-0.5 w-full rounded border border-white/30 bg-white/10 px-2.5 py-1 text-lg font-bold text-white focus:bg-white/20 focus:outline-none"
                        />
                      ) : (
                        <h1 className="mt-0.5 text-lg font-bold leading-tight">{activeTimelineStep.situationTitle}</h1>
                      )}
                    </div>

                    {/* 観測地点 ＆ 目標進行時間（同じ列に横並び・累積距離枠は削除） */}
                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider opacity-75">
                          観測地点
                        </span>
                        {isDirectEditMode ? (
                          <input
                            type="text"
                            value={activeTimelineStep.locationName}
                            onChange={(e) =>
                              handleUpdateActiveTimelineStep((s) => ({
                                ...s,
                                locationName: e.target.value,
                              }))
                            }
                            className="mt-0.5 w-36 rounded border border-white/30 bg-white/10 px-2 py-1 text-sm font-semibold text-white focus:bg-white/20 focus:outline-none"
                          />
                        ) : (
                          <div className="mt-1 text-sm font-semibold">
                            {activeTimelineStep.locationName}
                          </div>
                        )}
                      </div>

                      <div className="border-l border-white/25 pl-4">
                        <span className="block text-[10px] uppercase tracking-wider opacity-75">
                          目標進行時間
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                          <Clock className="h-3.5 w-3.5 text-amber-300" />
                          {isDirectEditMode ? (
                            <input
                              type="number"
                              value={activeGmNote.targetMinutes}
                              onChange={(e) =>
                                handleUpdateActiveGmNote((n) => ({
                                  ...n,
                                  targetMinutes: parseInt(e.target.value, 10) || 20,
                                }))
                              }
                              className="w-14 rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-center font-mono text-xs font-bold text-white focus:bg-white/20 focus:outline-none"
                            />
                          ) : (
                            <strong>{activeGmNote.targetMinutes}</strong>
                          )}
                          <span>分</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BGM・音響演出キュー枠 */}
                <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs text-slate-800">
                  <Volume2 className="h-4 w-4 text-indigo-700 shrink-0" />
                  <span className="font-bold shrink-0">演出・BGMキュー:</span>
                  {isDirectEditMode ? (
                    <input
                      type="text"
                      value={activeGmNote.bgmCue}
                      onChange={(e) =>
                        handleUpdateActiveGmNote((n) => ({ ...n, bgmCue: e.target.value }))
                      }
                      className="flex-1 rounded border border-dashed border-slate-400 bg-white px-2 py-0.5 text-xs text-slate-900"
                    />
                  ) : (
                    <span>{activeGmNote.bgmCue}</span>
                  )}
                </div>

                {/* 📢 GM演出用ナレーション ＆ NPCセリフ台本（スクロールなしで全行展開・印刷完全対応） */}
                <div
                  className={`rounded-md border-2 p-5 ${accent.highlightBoxBorder} ${accent.highlightBoxBg}`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded bg-indigo-900 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      📢 【GM演出用ナレーション ＆ NPCセリフ台本】
                    </span>
                    <span className="text-[11px] text-slate-600">
                      ※GM進行コンソールの演出用台本と連動（全行表示・直接編集・印刷対応）
                    </span>
                  </div>
                  {isDirectEditMode ? (
                    <textarea
                      rows={Math.max(14, (activeGmNote.readAloudScript || "").split("\n").length + 2)}
                      value={activeGmNote.readAloudScript}
                      onChange={(e) =>
                        handleUpdateActiveGmNote((n) => ({
                          ...n,
                          readAloudScript: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-dashed border-indigo-400 bg-white p-3.5 text-xs font-semibold leading-relaxed text-slate-900 font-mono shadow-inner focus:outline-none focus:border-indigo-600"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-xs font-semibold leading-relaxed font-mono text-slate-900 select-text">
                      {activeGmNote.readAloudScript}
                    </div>
                  )}
                </div>

                  {/* 1ページ目の末尾フッター（画面プレビュー・印刷用） */}
                  <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-[10px] text-slate-500 font-mono">
                    <span>Day {activeTimelineStep.dayNumber} GM進行台本 [Page 1/2]</span>
                    <span>次ページ ➔ 司令部・現地対応 ＆ 進行管理</span>
                  </div>
                </div>

                {/* ============================================================
                    【改ページ区切り（画面プレビュー境界 ＆ A4印刷自動改ページ）】
                   ============================================================ */}
                <div className="page-break-before my-8 border-t-2 border-dashed border-indigo-400 pt-5 relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-indigo-300 bg-indigo-50 px-3.5 py-0.5 text-[11px] font-bold text-indigo-900 shadow-sm flex items-center gap-1.5 no-print">
                    <span>📄 【2ページ目】 司令部・現地対応 ＆ 進行管理シート</span>
                  </div>
                </div>

                {/* ============================================================
                    【2ページ目】：司令部・現地対応 ＆ 進行管理シート
                   ============================================================ */}
                <div className="space-y-5">
                  {/* 2ページ目ヘッダー帯 */}
                  <div className={`rounded-md px-4 py-2.5 ${accent.headerBg} ${accent.headerText} flex items-center justify-between text-xs shadow-sm`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Day {activeTimelineStep.dayNumber} {activeTimelineStep.situationTitle}</span>
                      <span className="opacity-75">｜ 司令部・現地対応方針 ＆ 進行管理</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">[Page 2/2]</span>
                  </div>

                  {/* 🏢 司令部対応（上段・全幅2段配置・スクロールなし全文表示） */}
                  <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/90 shadow-sm`}>
                    <div className="mb-2 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-indigo-700" />
                        🏢 司令部・後方拠点の動きと誘導ポイント
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">※全幅表示</span>
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={Math.max(5, (activeTimelineStep.hqResponse || "").split("\n").length + 2)}
                        value={activeTimelineStep.hqResponse}
                        onChange={(e) =>
                          handleUpdateActiveTimelineStep((s) => ({
                            ...s,
                            hqResponse: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:outline-none focus:border-indigo-600 font-sans"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                        {activeTimelineStep.hqResponse}
                      </p>
                    )}
                  </div>

                  {/* ⚓ 現地救難隊対応（下段・全幅2段配置・スクロールなし全文表示） */}
                  <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/90 shadow-sm`}>
                    <div className="mb-2 flex items-center justify-between border-b border-emerald-100 pb-1.5">
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Anchor className="h-4 w-4 text-emerald-700" />
                        ⚓ 現地・フィールド班の動きと誘導ポイント
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">※全幅表示</span>
                    </div>
                    {isDirectEditMode ? (
                      <textarea
                        rows={Math.max(5, (activeTimelineStep.fieldResponse || "").split("\n").length + 2)}
                        value={activeTimelineStep.fieldResponse}
                        onChange={(e) =>
                          handleUpdateActiveTimelineStep((s) => ({
                            ...s,
                            fieldResponse: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-dashed border-slate-400 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:outline-none focus:border-emerald-600 font-sans"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800">
                        {activeTimelineStep.fieldResponse}
                      </p>
                    )}
                  </div>

                {/* ✅ GM進行チェックポイント（直接追加・編集可能） */}
                <div className={`rounded-md border p-4 ${accent.borderSub} bg-white/85`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <CheckSquare className="h-4 w-4 text-emerald-700" />
                      Day {activeTimelineStep.dayNumber} GM進行チェックリスト
                    </span>
                    {isDirectEditMode && (
                      <button
                        onClick={() =>
                          handleUpdateActiveGmNote((n) => ({
                            ...n,
                            gmCheckpoints: [
                              ...(n.gmCheckpoints || []),
                              "新規進行チェック項目を入力してください",
                            ],
                          }))
                        }
                        className="no-print rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-slate-700"
                      >
                        ＋ チェック項目追加
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {(activeGmNote.gmCheckpoints || []).map((chk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="inline-block h-3.5 w-3.5 rounded border border-slate-500 bg-white shrink-0" />
                        {isDirectEditMode ? (
                          <>
                            <input
                              type="text"
                              value={chk}
                              onChange={(e) => {
                                const next = [...(activeGmNote.gmCheckpoints || [])];
                                next[idx] = e.target.value;
                                handleUpdateActiveGmNote((n) => ({
                                  ...n,
                                  gmCheckpoints: next,
                                }));
                              }}
                              className="flex-1 rounded border border-dashed border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-900"
                            />
                            <button
                              onClick={() =>
                                handleUpdateActiveGmNote((n) => ({
                                  ...n,
                                  gmCheckpoints: (n.gmCheckpoints || []).filter((_, i) => i !== idx),
                                }))
                              }
                              className="no-print text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span>{chk}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 📂 このフェーズで開示される証拠資料（タイトルのみコンパクト圧縮表示） */}
                <div className={`rounded-md border p-3.5 ${accent.borderSub} bg-white/85 shadow-sm`}>
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>
                      📂 Day {activeTimelineStep.dayNumber} 開示証拠資料（
                      {
                        (project.evidences || []).filter(
                          (e) => e.foundPhase === activeTimelineStep.dayNumber
                        ).length
                      }
                      件）
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ※タイトルのみ一覧
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(project.evidences || [])
                      .filter((e) => e.foundPhase === activeTimelineStep.dayNumber)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm hover:border-slate-400"
                        >
                          <span className="text-indigo-600 font-mono text-xs">📄</span>
                          <span>{ev.title}</span>
                        </div>
                      ))}
                    {(project.evidences || []).filter((e) => e.foundPhase === activeTimelineStep.dayNumber).length === 0 && (
                      <span className="text-xs text-slate-500 italic">このフェーズで開示される証拠はありません</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* ----------------------------------------------------------------
                共通ドキュメントフッター（管理署名・ページ表記。全体提示の地図・写真は枠不要のため非表示）
               ---------------------------------------------------------------- */}
            {category !== "visuals" && (
              <div
                className={`mt-8 flex flex-wrap items-center justify-between border-t pt-3 text-[11px] opacity-75 ${accent.borderSub}`}
              >
                <div className="flex-1">
                  {isDirectEditMode ? (
                    <input
                      type="text"
                      value={currentDesign.footerNote}
                      onChange={(e) => handleUpdateDesign({ footerNote: e.target.value })}
                      className="w-full max-w-md border-b border-dashed border-slate-400 bg-transparent px-1 py-0.5 text-[11px] focus:border-indigo-600 focus:bg-white/60 focus:outline-none"
                      title="フッターのクレジット・管理注記を直接編集"
                    />
                  ) : (
                    <span>{currentDesign.footerNote}</span>
                  )}
                </div>
                <div className="font-mono">
                  {currentDesign.documentCode} // UNAUTHORIZED REPRODUCTION PROHIBITED
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
