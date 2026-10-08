"use client";

import React, { useState, useEffect } from "react";
import { MMProject } from "@/types/schema";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Copy,
  Check,
  Radio,
  Clock,
  FileText,
  AlertTriangle,
  Navigation,
  Image as ImageIcon,
  Eye,
  X,
  Search,
  Building2,
  Anchor,
  HelpCircle,
  Flame,
  Maximize2,
  ExternalLink,
  Radar,
  Scroll,
  ShieldAlert,
  Scale,
  Users,
  EyeOff,
  Compass,
} from "lucide-react";
import { audioEngine } from "@/utils/audioSynth";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";
import { Day3TacticalMap } from "./Day3TacticalMap";
import { Day1NauticalMap } from "./Day1NauticalMap";

export interface Day2ActionOption {
  id: string;
  title: string;
  organization: string;
  evidenceId: string;
  badge: string;
  summary: string;
  detail: string;
  hasPhoto?: boolean;
}

export const TOKYO_ACTIONS: Day2ActionOption[] = [
  {
    id: "T-1",
    title: "T-1: 防衛省 水中聴音（ソナー）データの照会",
    organization: "防衛省 / 海上自衛隊",
    evidenceId: "ev-sonar-shadow",
    badge: "深海ソナー",
    summary: "水深800m以深を時速約6km（日速約150km / 3.3ノット）で北上する、全長数百メートルの巨大な深海シグネチャーを捕捉。",
    detail: "防衛省のパッシブソナー網が捕捉した記録。通常潜水艦の数倍に達する異様な超巨大生体ノイズが、伊豆・小笠原海溝沿いを一定ペースで北上中であることが判明する。",
  },
  {
    id: "T-2",
    title: "T-2: 西之島避難船舶の無線傍受ログ解析",
    organization: "海上保安庁 警備救難部",
    evidenceId: "ev-evacuation-radio-log",
    badge: "通信傍受",
    summary: "避難中の複数船舶より『噴火の数分前、船底を巨大な黒い影が通過し計器異常が発生。その直後に海底が大爆発した』との交信記録。",
    detail: "時系列解析の結果、海底火山の噴火が先ではなく、「海面下の巨大な影の通過が引き金となって海底火山が連動噴火した」という因果関係が強く示唆される。",
  },
  {
    id: "T-3",
    title: "T-3: 海保捜索機MA722 緊急航空偵察レポート（空撮写真）",
    organization: "海上保安庁 羽田航空基地",
    evidenceId: "ev-aerial-recon-report",
    badge: "航空写真",
    summary: "西之島の噴煙下、海底火山の熱水を避けるため一時的に水深10〜20mに急浮上した全長300〜400mの巨大な影と明瞭なケルビン波を撮影。",
    detail: "撮影から数分後、影は急速に水深800m以深へ潜航した。写真には海面下の巨大な影の輪郭と航跡波が鮮明に写し出されている。",
    hasPhoto: true,
  },
];

export const FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-1",
    title: "F-1: Day 1遭難船スクリュー付着物の生体組織鑑定",
    organization: "小笠原水産センター / 研究所",
    evidenceId: "ev-propeller-tissue",
    badge: "生体組織鑑定",
    summary: "巨大な吸盤と筋肉組織から、深海600m以深に生息する【ダイオウイカの触手】と特定！",
    detail: "Day 1で船を襲い、スクリューを停止させた生物の正体が判明。しかし、通常のダイオウイカ（全長十数m）と、目撃されている『数百メートルの影』との間で巨大なサイズ矛盾が生じる。",
  },
  {
    id: "F-2",
    title: "F-2: 避難漁船・ホエールウォッチング船長の目撃聴取",
    organization: "二見港 漁業協同組合",
    evidenceId: "ev-fisherman-guide-testimony",
    badge: "ベテラン目撃調書",
    summary: "『大きさはクジラよりも明らかに巨大だが、クジラ特有の潮吹き（ブロー）やスパイホップを一切しない。ぬめるように海面直下を這って北上していった』",
    detail: "海を知り尽くしたベテラン漁師と鯨ガイドが『あんなものはクジラではない』と証言。生物としての異様さが浮き彫りになる。",
  },
  {
    id: "F-3",
    title: "F-3: 緊急浮上ダイバーの救護聴取カルテ",
    organization: "小笠原村診療所 救護所",
    evidenceId: "ev-diver-trauma-record",
    badge: "潜水士カルテ",
    summary: "『海中でクジラではありえない異形を目撃。海底の底から奇妙な振動が響き恐怖で緊急浮上した直後に海底火山が噴火した』",
    detail: "減圧症寸前で救助された潜水士の恐怖の肉声。海底火山の噴火直前に何かが海底を刺激していた事実を現場ダイバーの視点から裏付ける。",
  },
  {
    id: "F-4",
    title: "F-4: 小笠原気象観測所の海底地震計・移動震源解析",
    organization: "気象庁 小笠原気象観測所",
    evidenceId: "ev-moving-epicenter",
    badge: "海底地震計解析",
    summary: "海底800mを時速約6kmで移動する局所的な震源が、西之島直下を通過した直後にマグマ溜まりが刺激されて噴火した波形を特定。",
    detail: "通常の火山性微動や群発地震とは全く異なり、巨大な質量が海底地殻を圧迫しながら一定速度で北上している物理的証拠。",
  },
];

export const DAY4_TOKYO_ACTIONS: Day2ActionOption[] = [
  {
    id: "T-4A",
    title: "T-4A: 隕石について調べる（東京持ち帰り隕石片の磁気・生体誘引パルス分析）",
    organization: "科学警察研究所 / 防衛装備庁 先端技術研究所",
    evidenceId: "ev-tokyo-meteorite-analysis",
    badge: "東京隕石片分析",
    summary: "『小笠原から東京へ持ち帰られた隕石片が未知の電磁パルスを継続放出。怪物はこれを追って北上している可能性が極めて高い！』",
    detail: "東京側プレイヤーが持ち帰った隕石片の精密分析。深海熱水鉱物と酷似した磁気共鳴波長を放ち続けており、深海を北上する巨大生物が『東京にあるこの隕石片の波長を追尾しているのではないか』という重要仮説を導き出す。",
  },
  {
    id: "T-4B",
    title: "T-4B: 八丈島の火山性微動について調べる（地震波形解析・富士山到達リスク）",
    organization: "気象庁 地震火山部 / 東京大学地震研究所",
    evidenceId: "ev-hachijo-tremor-analysis",
    badge: "八丈島微動解析",
    summary: "『八丈島で頻発する震度1〜2の群発微動はマグマ貫入によるもの。この北上速度（日速約150km）では数日後に【富士山直下】へ到達し破局的大噴火を招く！』",
    detail: "八丈島・青ヶ島の地震計データの深層解析。断層破壊ではなく深海を時速約6kmで進む熱源がマグマ溜まりを刺激している動かぬ証拠。このまま北上すれば伊豆諸島を通過して富士火山帯・富士山直下に直結し、壊滅的な破局噴火を誘発する絶対的危機を突き止める。",
  },
  {
    id: "T-4C",
    title: "T-4C: 八丈島の島民からの情報を調べる（島民目撃証言 ＆ 漁船魚探ソナー記録）",
    organization: "八丈島総合開発センター / 底土港漁協",
    evidenceId: "ev-hachijo-resident-and-sonar",
    badge: "八丈島民証言＆魚探",
    summary: "『南の海が白波立ち海鳴りが止まらない』という島民の生々しい証言と、近海一本釣り漁船の魚探が水深500mに捉えた全長数百mの巨大生体エコー記録！",
    detail: "八丈島民の避難証言と民間漁船の魚群探知機（アクティブソナー）記録。海底の異様な唸りや潮の引きに加え、海中を北上する巨大反射体の存在が民間漁船からも裏付けられ、怪物の脅威が八丈島目前まで迫っている事実を把握。",
  },
];

export const DAY4_FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-4A",
    title: "F-4A: 隕石について調べる（小笠原観測所 落下地質記録・熱水共鳴）",
    organization: "気象庁 小笠原気象観測所 地質研究室",
    evidenceId: "ev-ogasawara-meteorite-analysis",
    badge: "小笠原落下隕石分析",
    summary: "『1ヶ月前に落下した隕石は深海熱水プルームの鉱物と強く共鳴。東京へ持ち帰られた破片と同一の親天体由来であり、怪物の生息圏を刺激した元凶！』",
    detail: "小笠原に残る隕石サンプルの詳細スペクトル解析。海底火山の熱水噴出孔やマグマ活動と共鳴する特殊波長を放っており、怪物が海底火山を辿る動機が『隕石の磁気パルスへの誘引』である地質学的証拠。",
  },
  {
    id: "F-4B",
    title: "F-4B: 神社での調査（小笠原大神宮 宝物殿・古文書の深層調査）",
    organization: "小笠原大神宮 宝物殿",
    evidenceId: "ev-shrine-curse-stone",
    badge: "盟約祝詞の記録",
    summary: "『怪異を鎮める祝詞の存在が判明するも内容は不明。元神主は数年前に死去し、内容を知る子ども達は東京に出てしまっている！ 祝詞は船で海に出て、海中に筒を入れて読み上げる作法！』",
    detail: "宝物殿の古文書を発掘。太古に怪異を鎮めた『盟約の祝詞』が存在した事実が判明。しかし実際の祝詞の文面は秘伝のため記録になく、数年前に元神主が死去。その内容を知る子ども達は【東京に出てしまっている】ため、東京側との協力が不可欠となる。また、祝詞を唱える作法は『船で海へ漕ぎ出し、海中に長い筒を差し入れて読み上げる』という海中音波伝達の儀礼であることが判明する。",
  },
  {
    id: "F-4C",
    title: "F-4C: ダイバーについての調査（二見港貨物台帳・不審船輸送伝票追跡）",
    organization: "小笠原海運 二見港貨物取扱所",
    evidenceId: "ev-diver-shipping-waybill",
    badge: "不審ダイバー貨物伝票",
    summary: "『Day 1の大型冷凍ボックスの送り先は【静岡県・富士山麓の民間研究施設】宛て！ ダイバー達が持ち出した超重量コアが富士山麓へ運ばれていた！』",
    detail: "港の貨物台帳を執念で追跡。ダイバーたちが『採集標本』と偽って二見港から定期船で運び出した超重量ボックスは、富士山麓の特異研究施設へ極秘輸送されていた。怪物が富士山・駿河湾を目指す動機と直結する。",
  },
  {
    id: "F-4D",
    title: "F-4D: 撮影した画像の分析（Day 3洋上ソナー写真の深層デジタル画像解析）",
    organization: "小笠原海洋生物研究所 / 小笠原救難隊",
    evidenceId: "ev-photo-deep-analysis",
    badge: "写真画像深層解析",
    summary: "『Day 3で撮影した写真の深層解析。巨大物体は単一体ではなく、無数の深海生物が融合した【超巨大群体（コロニー）】であり、外部の音波・磁気に鋭敏に反応する器官を持つ！』",
    detail: "Day 3索敵作戦で得られた写真（または波形データ）を画像処理。巨大な影が無数の触手と群体生物によって構成されていること、そして音波や磁気パルスに強く反応する感覚器官群を備えている事実を科学的に突き止める。",
  },
];

interface GmDashboardProps {
  project: MMProject;
  onNavigateToChart?: () => void;
}

export const GmDashboard: React.FC<GmDashboardProps> = ({ project, onNavigateToChart }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Day 2 合議制アクションの選択状態（東京: 1枠, 現地: 2枠）
  const [selectedTokyoAction, setSelectedTokyoAction] = useState<string>("T-3");
  const [selectedFieldActions, setSelectedFieldActions] = useState<string[]>(["F-1", "F-3"]);

  // Day 4 合議制アクションの選択状態（東京: 1枠, 現地: 2枠）
  const [selectedDay4TokyoAction, setSelectedDay4TokyoAction] = useState<string>("T-4A");
  const [selectedDay4FieldActions, setSelectedDay4FieldActions] = useState<string[]>(["F-4A", "F-4B"]);
  // Day 3 司令官決定の反映（防衛出動要請あり vs なし）
  const [day3GmHqDecision, setDay3GmHqDecision] = useState<"defense_dispatch" | "no_dispatch">("defense_dispatch");

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartModalDay, setChartModalDay] = useState<3 | 4>(3);
  const [isTacticalModalOpen, setIsTacticalModalOpen] = useState(false);
  const [isDay1ModalOpen, setIsDay1ModalOpen] = useState(false);
  const [day1ViewMode, setDay1ViewMode] = useState<"investigation" | "tactical">("tactical");

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPhotoModalOpen(false);
        setIsChartModalOpen(false);
        setIsTacticalModalOpen(false);
        setIsDay1ModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleFieldAction = (id: string) => {
    setSelectedFieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          // すでに2つ選択されている場合は古い方を押し出す
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleDay4FieldAction = (id: string) => {
    setSelectedDay4FieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  // タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudioCue = (cue: string) => {
    if (cue === "coda-tape") {
      audioEngine?.playWordSound("word-gather", 1.0);
    } else if (cue === "climax-call") {
      audioEngine?.playMessageSequence(["word-enemy", "word-prey", "word-gather"], 1.0);
    }
  };

  const [copiedType, setCopiedType] = useState<"full" | "synopsis" | null>(null);

  // 企画概要・プロット紹介のMarkdown生成
  const generateSynopsisMarkdown = () => {
    let md = `# ${project.title}\n## ${project.subtitle}\n\n`;
    md += `- 想定プレイ時間: ${project.durationHours}時間\n`;
    md += `- プレイヤー人数: ${project.playerCount}名（GM必須）\n\n`;
    md += `## 🌟 1. 作品コンセプト・世界観\n${project.concept}\n\n`;
    md += `## 🎭 2. プレイヤー体験 (Player Experience)\n${project.targetExperience}\n\n`;
    md += `## 📜 3. プロット紹介 (あらすじ・真相・解決法)\n${project.plotSummary}\n\n`;
    md += `## 💡 4. コアギミック (生態系捕食 × クジラ言語パズル)\n${project.gimmickOverview}\n\n`;
    md += `## 👥 5. 登場人物（海難救助対策チーム 6名）\n`;
    project.characters.forEach((c) => {
      md += `- **${c.name}** (${c.profession}) [${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}]\n`;
      md += `  ${c.handout.publicProfile}\n`;
    });
    return md;
  };

  // 完全版シナリオ台本のMarkdown一括生成
  const generateFullMarkdown = () => {
    let md = `# ${project.title}\n## ${project.subtitle}\n\n`;
    md += `- 想定プレイ時間: ${project.durationHours}時間\n`;
    md += `- プレイヤー人数: ${project.playerCount}名（GM必須）\n\n`;

    md += `## 🌟 作品コンセプト ＆ プロット概要\n`;
    md += `### コンセプト\n${project.concept}\n\n`;
    md += `### プレイヤー体験\n${project.targetExperience}\n\n`;
    md += `### プロット紹介（真相・あらすじ）\n${project.plotSummary}\n\n`;
    md += `### コアギミック\n${project.gimmickOverview}\n\n`;

    md += `## 👥 登場人物一覧（6名）\n\n`;
    project.characters.forEach((c) => {
      md += `### ${c.name} (${c.profession})\n`;
      md += `**配置**: ${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}\n\n`;
      md += `**【イントロダクション】**\n${c.introduction}\n\n`;
      md += `**【固有能力・できること】**\n`;
      c.capabilities.forEach((cap) => {
        md += `- Day ${cap.targetPhase}: **${cap.name}** - ${cap.description}\n`;
      });
      md += `\n**【ハンドアウト本文】**\n${c.handout.handoutBody}\n\n---\n\n`;
    });

    md += `## 📅 7日間タイムライン\n\n`;
    project.timeline.forEach((t) => {
      md += `### Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
      md += `- **発生事象**: ${t.incidentOverview}\n`;
      md += `- **東京司令部**: ${t.hqResponse}\n`;
      md += `- **現地救難隊**: ${t.fieldResponse}\n\n`;
    });

    md += `## 📋 証拠（エビデンス）マスター一覧\n\n`;
    project.evidences.forEach((e) => {
      const owner = project.characters.find((c) => c.id === e.ownerId);
      md += `### [Day ${e.foundPhase}] ${e.title} (${owner?.name || "全員"})\n`;
      md += `${e.description}\n\n`;
    });

    return md;
  };

  const handleCopy = (type: "full" | "synopsis") => {
    const text = type === "full" ? generateFullMarkdown() : generateSynopsisMarkdown();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = (type: "full" | "synopsis") => {
    const text = type === "full" ? generateFullMarkdown() : generateSynopsisMarkdown();
    const filename =
      type === "full"
        ? `${project.title}_完全台本.md`
        : `${project.title}_企画概要・プロット紹介.txt`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTimelineStep = project.timeline.find((t) => t.dayNumber === currentDay);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部：GMステータスバー＆タイマー */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-sm text-white">GM 進行コンソール</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-base font-bold text-indigo-400 border border-slate-800">
            <Clock className="h-4 w-4 text-slate-400" />
            {formatTime(timerSeconds)}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="rounded bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 transition"
              title={isTimerRunning ? "一時停止" : "スタート"}
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="rounded border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
              title="リセット"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* テキストエクスポートボタン群 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => handleCopy("synopsis")}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-900 transition"
              title="企画書・プロット紹介をクリップボードにコピー"
            >
              {copiedType === "synopsis" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedType === "synopsis" ? "概要コピー完了！" : "企画・プロット概要をコピー"}
            </button>
            <button
              onClick={() => handleDownload("synopsis")}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="企画・プロット概要をテキストファイル(.txt)保存"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
            <button
              onClick={() => handleCopy("full")}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              title="全設定・HO・タイムライン・証拠を含む完全台本をコピー"
            >
              {copiedType === "full" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedType === "full" ? "完全台本コピー完了！" : "完全台本をコピー"}
            </button>
            <button
              onClick={() => handleDownload("full")}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="完全台本をMarkdownファイル(.md)保存"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* メインGM作業エリア */}
      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：Day切り替えと演出台詞スクリプト */}
        <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          {/* Dayタブ */}
          <div className="mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setCurrentDay(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  currentDay === d
                    ? "bg-indigo-600 text-white shadow"
                    : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-[11px] font-bold text-indigo-400 uppercase">
                DAY {currentDay} 状況概要
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {currentTimelineStep?.situationTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {currentTimelineStep?.incidentOverview}
              </p>
            </div>

            {/* GM演出用NPCセリフ・ナレーションスクリプト */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                GM 演出用ナレーション ＆ NPCセリフスクリプト
              </h4>

              {currentDay === 1 && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="rounded border border-indigo-900/60 bg-indigo-950/30 p-3">
                    <span className="font-bold text-indigo-300">【フェーズ1：緊急招集 ＆ 自己紹介】</span>
                    <p className="text-slate-300 mt-1 italic">
                      「小笠原南西沖にて民間チャーター船（総トン数約40t）が突如全電源喪失。AISも停波し、救難信号を発信した直後に通信途絶しました。これより東京司令部と小笠原現地の合同海難救助チームを開設します。まずは各員、氏名・所属・現場で担える役割について自己紹介を行ってください」
                    </p>
                  </div>

                  <div className="rounded border border-amber-900/60 bg-amber-950/20 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-amber-300">【フェーズ2：状況提示 ＆ なぜ衛星が使えないか】</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setDay1ViewMode("investigation");
                            setIsDay1ModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-cyan-700 hover:bg-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                        >
                          <EyeOff className="h-3 w-3" /> 白地図を開く
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDay1ViewMode("tactical");
                            setIsDay1ModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                        >
                          <Eye className="h-3 w-3" /> GM解析図を開く
                        </button>
                        {onNavigateToChart && (
                          <button
                            type="button"
                            onClick={onNavigateToChart}
                            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300 transition border border-slate-700"
                          >
                            <Navigation className="h-3 w-3" /> 専用海図画面
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 italic">
                      「救難信号発信から既に20分が経過。救難艇が現場海域へ到達するまでさらに40分――合計1時間、船は漂流し続けます。全体に【漂流海図】を開示します。どこへ救難艇を急行させるべきか、6名で協力して結論を出してください」
                    </p>
                    <div className="mt-2 rounded bg-slate-900/90 p-2 text-[11px] text-slate-300 border border-slate-800">
                      <span className="font-bold text-cyan-400">PC2からの開示情報（衛星不可の理由）:</span>
                      <p className="mt-0.5">
                        「気象衛星ひまわりは解像度不足で40tの小型船を捕捉不可。低軌道偵察衛星は軌道通過まで4時間＋現場の雨雲で光学視界ゼロ。全電源喪失でAISも途絶。衛星画像頼みの捜索は不可能です！現場の海流と風から計算するしかありません！」
                      </p>
                    </div>
                  </div>

                  <div className="rounded border border-emerald-900/60 bg-emerald-950/20 p-3">
                    <span className="font-bold text-emerald-300">【フェーズ3：漂流予測パズル（GM用正解メモ）】</span>
                    <div className="mt-1 space-y-1 text-[11px] text-slate-300">
                      <p>・<strong className="text-white">PC1 (風)</strong>: 南西の強風15m/s → 船は北東へ約1.5ノット押し流される</p>
                      <p>・<strong className="text-white">PC4 (海流)</strong>: 黒潮支流の表層流は真東へ2.0ノット</p>
                      <p>・<strong className="text-white">PC5 (潮目)</strong>: 冷水塊境界に乗っており東向き海流は減衰なし</p>
                      <p>・<strong className="text-white">PC6 (無線)</strong>: 船長の悲鳴『真横から波を受けている』＝風と海流双方の横波</p>
                      <p>・<strong className="text-white">PC3 (海難救助)</strong>: 東側や南東側には危険な暗礁群。風浪の三角波で座礁沈没する前に、北東×真東の合成ベクトルである【東北東の漂流予測海域】へ急行して救出！</p>
                    </div>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-slate-300">【フェーズ4：救助成功ナレーション】</span>
                    <p className="text-slate-400 mt-1 italic">
                      「救難艇が東北東の漂流予測海域へ全速力で到達。東側や南東側の暗礁群を北側にすり抜け、激しく漂流する遭難船を捕捉・接舷！荒波の中で間一髪、船長とダイバーたちの救出に成功しました！」
                    </p>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-amber-400">【NPC 船長（救助直後）】:</span>
                    <p className="text-slate-300 mt-1">
                      「あれはクジラなんかじゃないと思うねぇ。クジラなら潮吹きや潜水の際の尾が見えたりという行動があるもんだけど、そんな様子はなかった。船はスクリューが何かに巻き付かれたように故障して、計器類も壊れてしまったんだ。とにかく助かってよかった。ダイバーたちはこの1ヶ月前ぐらいから頻繁にだいぶを繰り返していて、だいぶ慣れた様子だった。あのあとすぐに帰ると言っていたよ。ちょっと神社にお参りしてくるようにするよ」
                    </p>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-blue-400">【NPC ダイバー（不気味な冷静さ・大型冷凍ボックスを抱えて）】:</span>
                    <p className="text-slate-400 mt-1">
                      「船長は大袈裟ですね。ただの大型クジラですよ。私たちはこの近辺での魚の生態調査をしており、珍しい魚を採集していただけです。漂流事故で大変でしたが、これで目的のものが無事に収集できましたので、これ以上皆様にご迷惑をおかけすることはありません。……この冷凍ボックス、本土行きの定期便に急ぎ乗せていただけますか？」
                    </p>
                  </div>
                </div>
              )}

              {currentDay === 2 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* フェーズ1：緊急通達＆チーム維持命令 */}
                  <div className="rounded-lg border border-red-900/60 bg-red-950/25 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-ping" />
                      <span className="font-bold text-red-300">
                        【フェーズ1：状況通達 ＆ 緊急チーム維持命令】
                      </span>
                    </div>
                    <div className="mt-2 rounded border border-red-900/40 bg-slate-950/80 p-2.5 text-[11px] text-red-200">
                      <p className="font-semibold text-white">
                        🚨 緊急速報：西之島周辺海底火山が突発的大規模噴火
                      </p>
                      <p className="mt-0.5 text-slate-300">
                        西之島周辺の海底火山が突発的に大噴火。噴煙高度は上空数千メートルに到達。周辺海域に航行警報および緊急退避命令が発令。
                      </p>
                    </div>
                    <p className="text-slate-300 mt-2.5 italic">
                      「東京司令部・小笠原救難隊の各員へ上層部より緊急通達。西之島沖での海底火山突発噴火に伴い、周辺船舶の避難誘導および火山活動の厳重監視を行う必要がある。よって上層部の決定に基づき、当合同海難対策チームは当面の間【即応体制を維持】せよ」
                    </p>
                    <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/30 rounded p-2 border border-amber-900/40">
                      💡 <strong>GMメモ</strong>: Day 1で招集された急造チームの解散が撤回され、このチームが当面維持される必然性を全員に提示します。
                    </div>
                  </div>

                  {/* フェーズ2：合議制アクションの提示 */}
                  <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-3.5">
                    <span className="font-bold text-indigo-300">
                      【フェーズ2：情報収集・合議制アクションの提示】
                    </span>
                    <p className="text-slate-300 mt-1 italic">
                      「西之島周辺海域から『海底の巨大な黒い影』『異常な地殻振動』の目撃情報が相次いで入っています。しかし混乱の極みにある現場では、すべての調査に手を回す余裕はありません。我々に許された調査枠は――【東京司令部で1枠】、【小笠原現地で2枠】のみです。各自の専門知識を持ち寄り、どのアクションを実行すべきか合議して決定してください」
                    </p>
                  </div>

                  {/* インタラクティブ操作：合議制アクション選択コンソール */}
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-cyan-400" />
                        <span className="font-bold text-white text-xs">
                          合議制アクション選択コンソール（GM操作盤）
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedFieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    {/* 東京司令部側（1択） */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-bold text-indigo-300 text-[11px]">
                          東京司令部アクション（全3枠中 1つ選択）
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {TOKYO_ACTIONS.map((action) => {
                          const isSelected = selectedTokyoAction === action.id;
                          return (
                            <button
                              key={action.id}
                              onClick={() => setSelectedTokyoAction(action.id)}
                              className={`flex items-start justify-between rounded-lg p-2.5 text-left transition border ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-950/60 shadow-sm"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                                      isSelected
                                        ? "border-indigo-400 bg-indigo-500 text-white"
                                        : "border-slate-600 bg-slate-800 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <span className="font-bold text-xs text-white">
                                    {action.title}
                                  </span>
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 font-mono">
                                    {action.badge}
                                  </span>
                                  {action.hasPhoto && (
                                    <span className="flex items-center gap-0.5 rounded bg-amber-900/60 border border-amber-700/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                                      <ImageIcon className="h-2.5 w-2.5" /> 写真有
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400 pl-5 leading-normal">
                                  {action.summary}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {action.organization}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 小笠原現地側（2択） */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Anchor className="h-3.5 w-3.5 text-teal-400" />
                        <span className="font-bold text-teal-300 text-[11px]">
                          小笠原現地アクション（全4枠中 2つ選択）
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {FIELD_ACTIONS.map((action) => {
                          const isSelected = selectedFieldActions.includes(action.id);
                          return (
                            <button
                              key={action.id}
                              onClick={() => handleToggleFieldAction(action.id)}
                              className={`flex items-start justify-between rounded-lg p-2.5 text-left transition border ${
                                isSelected
                                  ? "border-teal-500 bg-teal-950/60 shadow-sm"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${
                                      isSelected
                                        ? "border-teal-400 bg-teal-500 text-white"
                                        : "border-slate-600 bg-slate-800 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <span className="font-bold text-xs text-white">
                                    {action.title}
                                  </span>
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 font-mono">
                                    {action.badge}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400 pl-5 leading-normal">
                                  {action.summary}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {action.organization}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 選択されたアクションの調査結果 ＆ 開示内容 */}
                  <div className="space-y-3 rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      【開示された調査結果 ＆ 証拠レポート】
                    </span>

                    {/* 東京側結果 */}
                    {(() => {
                      const action = TOKYO_ACTIONS.find((a) => a.id === selectedTokyoAction);
                      if (!action) return null;
                      return (
                        <div className="rounded-lg border border-indigo-900/80 bg-slate-950 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-indigo-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                東京結果
                              </span>
                              <span className="font-bold text-white text-xs">{action.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              証拠ID: {action.evidenceId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {action.detail}
                          </p>

                          {/* T-3 空撮写真プレビュー */}
                          {action.hasPhoto && (
                            <div className="mt-3 rounded border border-slate-700 bg-slate-900 p-2.5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  海上保安庁 MA722撮影 広角空撮写真（熱水回避浮上時）
                                </span>
                                <button
                                  onClick={() => setIsPhotoModalOpen(true)}
                                  className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-500 transition"
                                >
                                  <Eye className="h-3 w-3" /> 拡大表示
                                </button>
                              </div>
                              <div
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="group relative cursor-pointer overflow-hidden rounded border border-slate-700 bg-black aspect-video max-h-48 flex items-center justify-center"
                              >
                                <img
                                  src="/images/aerial_recon_wide.jpg"
                                  alt="西之島北西海域 空撮写真"
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                                  <span className="text-[10px] text-slate-200">
                                    噴煙を背景に海面直下（水深10〜20m）に生じたケルビン波と巨大な影（数分後、深海800mへ急速潜航）
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 小笠原側結果 */}
                    {selectedFieldActions.map((fieldId) => {
                      const action = FIELD_ACTIONS.find((a) => a.id === fieldId);
                      if (!action) return null;
                      return (
                        <div
                          key={action.id}
                          className="rounded-lg border border-teal-900/80 bg-slate-950 p-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                現地結果
                              </span>
                              <span className="font-bold text-white text-xs">{action.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              証拠ID: {action.evidenceId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {action.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* フェーズ3：合議・因果関係の結論（GM用正解メモ） */}
                  <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3.5">
                    <span className="font-bold text-emerald-300 text-xs">
                      【フェーズ3：合議・因果関係の結論（GM用正解メモ）】
                    </span>
                    <div className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                      <p>
                        ・<strong className="text-white">① Day 1の元凶</strong>: スクリューの付着物から、遭難船を襲ったのは深海600m以深の「ダイオウイカ」と特定（F-1）。
                      </p>
                      <p>
                        ・<strong className="text-white">② 巨大なサイズ矛盾</strong>: しかし観測された影は「全長300〜400m（数百メートル）」（T-1 / T-3 / F-2）。通常のダイオウイカ（十数m）とは桁違いであり、単体生物では説明がつかない！
                      </p>
                      <p>
                        ・<strong className="text-white">③ 噴火の因果関係</strong>: 影の北上移動（時速約6km）が西之島直下を通過した直後に噴火が誘発された（T-2 / F-3 / F-4）。噴火のせいで怪異が現れたのではなく、怪異の通過が海底火山を刺激して噴火させている！
                      </p>
                    </div>

                    <div className="mt-2.5 rounded bg-red-950/50 p-2.5 border border-red-900/50 text-[11px] text-red-200">
                      ⚠️ <strong>GM演出上の最重要注意（ネタバレ防止）</strong>:
                      <p className="mt-0.5 text-slate-300">
                        このDay 2の段階では、<strong>「ダイオウイカの超群体である」という正体は絶対に明かさないでください</strong>。プレイヤーたちには「ダイオウイカの触手のはずなのに、なぜ数百mもの超巨大な影なのか？」「海底火山を噴火させながら北上しているものは一体何なのか？」という強烈なサイズ矛盾とサスペンスを抱かせ、議論を深めてもらいます。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 3 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* フェーズ1：鳥島沖海底大噴火 GMアナウンス */}
                  <div className="rounded-lg border border-amber-900/60 bg-amber-950/25 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span className="font-bold text-amber-300">
                        【フェーズ1：鳥島沖海底大噴火 ＆ 緊急洋上捜索命令】
                      </span>
                    </div>
                    <div className="mt-2 rounded border border-amber-900/40 bg-slate-950/80 p-2.5 text-[11px] text-amber-200">
                      <p className="font-semibold text-white">
                        🚨 緊急速報：鳥島沖海底カルデラが連動大爆発（Day 2未明）
                      </p>
                      <p className="mt-0.5 text-slate-300">
                        西之島から北へ約380km。時速約6km（日速約150km）のペースで北上する巨大物体が海底火山を次々と刺激して連動噴火を誘発していることが確定。
                      </p>
                    </div>
                    <p className="text-slate-300 mt-2.5 italic">
                      「小笠原基地より大型捜索ヘリを緊急発進。洋上に展開する巡視船PLH-31『あきつしま』での洋上給油を中継して現場海域へ投入する。任務目標：『海図上の怪物の潜航位置を推測し、ソノブイを投下して三辺測量で距離を割り出し、その姿を捉えよ！』」
                    </p>
                  </div>

                  {/* フェーズ2：西之島と鳥島沖 火山フロント全体像（監視状況図） */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【火山フロント全体像】海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺）
                          </span>
                          <span className="ml-2 text-[10px] text-slate-400 font-mono">
                            西之島(Day 1) ➔ 鳥島沖(Day 2) 北上軌跡
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/images/eruption_monitoring_chart.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition border border-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" /> 別タブで開く
                        </a>
                        <button
                          onClick={() => {
                            setChartModalDay(3);
                            setIsChartModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く
                        </button>
                      </div>
                    </div>

                    {/* 海図プレビューカード */}
                    <div
                      onClick={() => {
                        setChartModalDay(3);
                        setIsChartModalOpen(true);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-64 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart day={3} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-slate-200">
                          🔴 西之島 ➔ 鳥島沖 連動噴火軸 ｜ 北上速度: 時速約6km (日速約150km)
                        </span>
                        <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                          クリックで拡大
                        </span>
                      </div>
                    </div>

                    {/* GM用 火山フロント観測解説ノート */}
                    <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between font-semibold text-rose-300">
                        <span>【GM用 火山フロント観測解説ノート】</span>
                        <span className="font-mono text-cyan-400">タイムリミット: 残り4日（Day 7駿河湾到達）</span>
                      </div>
                      <p>
                        ・<strong>連動噴火のドミノ倒し</strong>：Day 1（西之島）➔ Day 2（鳥島沖海底カルデラ）。距離約380kmを24時間で正確に到達しており、深海800mを時速約6kmで北上する物体が、通過した先々のマグマ溜まりを刺激して噴火させている動かぬ証拠。
                      </p>
                      <p>
                        ・<strong>未噴火海域（北方）</strong>：須美寿島、青ヶ島、八丈島、三宅島、伊豆諸島、駿河湾・富士山直下は現時点で未噴火。このペースで直進すると4日後に本土直下へ到達。
                      </p>
                      <p>
                        ・<strong>熱水プルーム警戒域（音響障害）</strong>：鳥島北東カルデラおよび須美寿島東熱水噴出孔の周辺（半径25km圏内）は、気泡と熱水により激しい音響散乱（クラッター）が発生する危険海域。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2.5：【GM専用作戦海図 W-3100】洋上ソナー索敵 ＆ 巨大生物潜航マップ */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-cyan-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【GM専用 作戦海図 W-3100】全36セクター索敵盤 ＆ 巨大生物潜航マップ
                          </span>
                          <span className="ml-2 text-[10px] text-rose-300 font-mono">
                            GM真相表示: 深度400m潜航座標・三辺測量反響円
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTacticalModalOpen(true)}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く（GM全画面）
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl aspect-[16/10] max-h-96">
                      <Day3TacticalMap defaultMode="gm" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-300">
                      <span>
                        🚨 <strong>怪物の潜航現在位置</strong>: セクターB-3（水深400m） ｜ 北上速度: 時速約6km ｜ 1セクター: 約20km四方
                      </span>
                      <span className="text-cyan-400 font-mono">
                        給油拠点: 海図左下 PLH-31「あきつしま」(セクターF-1)
                      </span>
                    </div>
                  </div>

                  {/* フェーズ3：アクティブ・ソノブイ投下作戦（GM判定早見ガイド） */}
                  <div className="rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Radar className="h-4 w-4 text-cyan-400" />
                        【フェーズ3：アクティブソナー投下作戦（GM判定早見ガイド）】
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        1セクター ＝ 約20km四方
                      </span>
                    </div>

                    {/* ソナー判定早見グリッド */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded bg-rose-950/40 border border-rose-900/60 p-2.5 text-rose-200">
                        <strong className="text-rose-300 block mb-1">🎯 直上捕捉 ＆ 隣接反響判定:</strong>
                        ・<strong>セクター B-3（直上）に投下</strong>: <br />
                        　「同セクター直下に超巨大な反響音！目標を直上捕捉！」<br />
                        ・<strong>怪物の隣接セクター（B-2, B-4, A-3, C-3, 斜め）に投下</strong>: <br />
                        　「隣接セクター方向から強い反響音（約20km先）をキャッチ！」
                      </div>
                      <div className="rounded bg-amber-950/40 border border-amber-900/60 p-2.5 text-amber-200">
                        <strong className="text-amber-300 block mb-1">⚠️ 熱水クラッター影響 ＆ 限界判定:</strong>
                        ・<strong>熱水の直上（E-2 または E-5カルデラ）に投下</strong>: <br />
                        　「直下から吹き上がる気泡で音波が散乱！探知不能（NO RETURN）」<br />
                        ・<strong>熱水の隣接セクター（D-2, F-2, E-1, E-3等）に投下</strong>: <br />
                        　「<strong className="text-emerald-300">投下地点直下には怪物は不在！</strong>ただし隣接海域の熱水散乱ノイズが干渉し、周囲セクターは探知不能！」<br />
                        ・<strong>上記以外の離れたセクターに投下</strong>: <br />
                        　「直下に怪物は不在。周囲（約20km）にも反響なし（索敵限界外）」
                      </div>
                    </div>

                    <div className="rounded bg-slate-900 p-2.5 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <p>
                        🎯 <strong className="text-cyan-300">怪物の現在潜航位置</strong>：
                        セクターB-3（水深約400m）。
                      </p>
                      <p>
                        📋 <strong className="text-white">位置特定・浮上撮影成功時</strong>：
                        プレイヤーがB-3または隣接セクターにソノブイを展開して位置を絞り込んだ場合、潜航していた巨大生物が海面近く（水深10〜20m）へ浮上。急行した捜索ヘリが上空後方から目視確認し、海面下にうごめく巨大な触手と胴体を捉えた写真の撮影に成功します（特定失敗時は約20km彼方に波紋のみを確認）。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：PC6 個別ハンドアウト（神職の儀式）GMガイド */}
                  <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/30 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                      <Scroll className="h-4 w-4 text-indigo-400" />
                      【フェーズ4：PC6（神職）個別ハンドアウト GMガイド】
                    </div>
                    <blockquote className="border-l-2 border-indigo-500 pl-3 py-0.5 text-slate-300 text-[11px] italic">
                      「南の海にて火の山が連なりて火を吹き、海の中を巨大なる何ものかが北へと泳ぎ去るとき……島人は沖へ舟を漕ぎ出し、海に向かいて毎日、祝詞を唱えねばならぬ」
                    </blockquote>
                    <div className="rounded bg-indigo-950 border border-indigo-800 p-2 text-[10px] text-amber-200">
                      ⚠️ <strong>【重要制約】</strong>:
                      PC6に分かっていいのは<strong>「海に出て毎日祝詞を唱える特別な儀式が存在する」ということだけ</strong>です。祝詞の具体的な文言や方法はDay 6まで絶対に明かさないよう誘導してください。
                    </div>
                  </div>

                  {/* フェーズ5：写真鑑定相談・防衛判断 ＆ 合議制司令官最終意思決定（Day 3 クロージング） */}
                  <div className="rounded-lg border border-amber-800/70 bg-amber-950/25 p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-amber-400" />
                        <span className="font-bold text-amber-300 text-xs">
                          【フェーズ5：写真鑑定相談・防衛判断 ＆ 合議制司令官最終意思決定】（Day 3 クロージング）
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        Day 3 終盤合議
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-300 text-[11px]">
                      <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800 space-y-1">
                        <strong className="text-amber-400 block font-bold">
                          📢 GM進行ナレーション:
                        </strong>
                        <p className="italic">
                          「洋上ヘリが撮影した写真（海面下に潜む漆黒の巨大質量と20本以上の無数の触手群）が対策本部の大型スクリーンに映し出されます。現場の海上保安庁警備救難部は騒然となっています。『全長数百m、触手20本以上……海上保安庁の巡視船や警察比例の原則で対応できる規模を完全に超えている』。これを受け、海上保安庁警備救難部より合同対策本部へ緊急の諮問が下されます」
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* PC5への相談 */}
                        <div className="rounded border border-teal-900/80 bg-teal-950/30 p-2.5 space-y-1">
                          <span className="font-bold text-teal-300 text-xs flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> ① 海上保安庁 ➔ PC5（海洋生物学者）への相談:
                          </span>
                          <p className="italic text-slate-200">
                            「PC5准教授、この写真に写る物体の生物学的特徴をどう分析されますか？通常のダイオウイカ（10本）と明らかに異なる無数の触手、そして数百mの巨大質量。専門家としての所見を提示してください」
                          </p>
                          <div className="mt-1 text-[10px] text-teal-200/90 bg-teal-950/60 rounded p-1.5 border border-teal-800/60">
                            💡 <strong>GMメモ</strong>: PC5から「超群体（コロニー）仮説」「変異体仮説」「火山熱源誘引説」のいずれか（特に群体の疑い）を提示させます。
                          </div>
                        </div>

                        {/* PC2への要請 */}
                        <div className="rounded border border-indigo-900/80 bg-indigo-950/30 p-2.5 space-y-1">
                          <span className="font-bold text-indigo-300 text-xs flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> ② 海上保安庁 ➔ PC2（防衛庁リエゾン）への要請:
                          </span>
                          <p className="italic text-slate-200">
                            「PC2リエゾン、海上保安庁法20条に基づく警察比例の原則では、この規模の潜航目標に対する排除・対処は不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛庁としての判断を求めます」
                          </p>
                          <div className="mt-1 text-[10px] text-indigo-200/90 bg-indigo-950/60 rounded p-1.5 border border-indigo-800/60">
                            💡 <strong>GMメモ</strong>: PC2から「防衛出動即時迎撃」「海上警備行動先行」「慎重・隠蔽懸念」の防衛判断を提示させます。
                          </div>
                        </div>
                      </div>

                      {/* 合議制と司令官最終意思決定 */}
                      <div className="rounded bg-rose-950/30 border border-rose-900/50 p-2.5 space-y-1.5">
                        <span className="font-bold text-rose-300 text-xs">
                          ⚖️ 全員合議 ＆ 司令官（PC1）最終意思決定の進行ガイド:
                        </span>
                        <p>
                          ・<strong>合議制の回し方</strong>: 全員（PC1〜PC6）で写真の生物学的脅威と防衛出動の是非について5〜10分程度自由に意見を交わさせます（島民避難、火山の残り時間、兵器の有効性など）。
                        </p>
                        <p>
                          ・<strong>司令官（PC1）の決断</strong>: 議論が煮詰まったところで、GMから<strong>「各員の意見が出揃いました。対策本部司令官（PC1）、本部長としてこの事態にどう対処するか、最終意思決定を下してください」</strong>と促します。
                        </p>
                        <p className="text-amber-200">
                          ・<strong>Day 3 終了 ➔ Day 4 へのブリッジ</strong>: 司令官が方針（防衛出動正式要請、または海上警備行動発令）を決定した時点で<strong>「ここまでがDay 3に起こること」としてDay 3を完結</strong>させます。この決定がDay 4の「防衛出動の決定と隠蔽圧力・迎撃陣形の展開」へと直結します。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 4 && (
                <div className="space-y-3 text-xs leading-relaxed">
                  {/* フェーズ1：須美寿島〜青ヶ島沖海底噴火 ＆ 火山活動監視図 */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【Day 4 火山フロント最新状況】須美寿島〜青ヶ島沖海底噴火 ＆ 火山活動監視図
                          </span>
                          <span className="ml-2 text-[10px] text-rose-300 font-mono">
                            須美寿島〜青ヶ島沖 連動噴火 ＆ 八丈島・青ヶ島 微動観測
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/images/eruption_monitoring_chart_day4.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition border border-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" /> 別タブで開く
                        </a>
                        <button
                          onClick={() => {
                            setChartModalDay(4);
                            setIsChartModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く
                        </button>
                      </div>
                    </div>

                    {/* 海図プレビューカード */}
                    <div
                      onClick={() => {
                        setChartModalDay(4);
                        setIsChartModalOpen(true);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-60 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart day={4} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-slate-200">
                          🔴 Day 3 須美寿〜青ヶ島沖海底噴火 ｜ ⚡ 青ヶ島・八丈島 火山性軽度地震（震度1〜2）
                        </span>
                        <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                          クリックで拡大
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-rose-300">
                        <span>【GM用 Day 4 観測要綱 ＆ 推理検討の焦点】</span>
                        <span className="font-mono text-cyan-400">移動速度: 時速約6km（日速約150km）</span>
                      </div>
                      <p>
                        ・<strong>須美寿島〜青ヶ島沖の噴火</strong>：鳥島沖を通過した物体が北上を続け、須美寿島〜青ヶ島沖の海底カルデラで連動爆発が発生（Day 3海底噴火）。他の島名や地形と被らないよう海図西側に明瞭にプロット。
                      </p>
                      <p>
                        ・<strong>八丈島・青ヶ島の地震 ＆ 富士山到達危機</strong>：噴火に伴い、青ヶ島・八丈島で震度1〜2の火山性群発微動が連続観測。プレイヤー側が『このまま火山フロントが北上すれば、伊豆諸島を通過して【富士山直下】に到達し、破局的大噴火を引き起こす危険性』を指摘・警戒する重要な推理ポイントです。
                      </p>
                      <p>
                        ・<strong>持ち帰られた隕石片と生物の北上動機</strong>：東京側プレイヤーが持ち帰った『隕石のかけら』を生物が追って北上しているのではないかという仮説を検討するフェーズです。東京・小笠原の双方が『隕石について調べる』アクションを実行可能です。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2：Day 3の意思決定に基づく内閣・防衛省の反応分岐 */}
                  <div className="rounded-xl border border-amber-900/60 bg-slate-900 p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                        <Scale className="h-4 w-4 text-amber-400" />
                        【フェーズ2：Day 3意思決定に基づく政府・防衛省の反応分岐】
                      </div>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
                        <span className="text-slate-400">Day 3の決定:</span>
                        <button
                          type="button"
                          onClick={() => setDay3GmHqDecision("defense_dispatch")}
                          className={`px-2 py-0.5 rounded transition ${
                            day3GmHqDecision === "defense_dispatch"
                              ? "bg-rose-700 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          防衛出動要請あり
                        </button>
                        <button
                          type="button"
                          onClick={() => setDay3GmHqDecision("no_dispatch")}
                          className={`px-2 py-0.5 rounded transition ${
                            day3GmHqDecision === "no_dispatch"
                              ? "bg-indigo-700 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          要請なし
                        </button>
                      </div>
                    </div>

                    {day3GmHqDecision === "defense_dispatch" ? (
                      <div className="rounded-lg border border-rose-800/80 bg-rose-950/30 p-3 text-[11px] text-rose-200 space-y-2">
                        <div>
                          <strong className="text-rose-300 block font-bold text-xs flex items-center gap-1.5">
                            🏛️ 【内閣・官邸からの返答：自衛隊防衛出動は見送り（内閣不作為）】
                          </strong>
                          <p className="italic text-slate-200 mt-1 leading-relaxed">
                            「内閣総理大臣および官邸危機管理センターより通達。『鳥島〜青ヶ島沖の海底噴火と、海保の報告する未確認潜航物体との因果関係が科学的に立証されていない。自衛隊の防衛出動要件（武力攻撃事態等）には該当せず、現段階での自衛隊部隊出動は見送る。当面は海上保安庁が情報収集および警戒にあたれ』」
                          </p>
                        </div>
                        <div className="rounded border border-amber-800/60 bg-amber-950/30 p-2 text-amber-200">
                          <strong className="text-amber-300 block font-bold text-[11px] flex items-center gap-1">
                            🛡️ 防衛庁・防衛省リエゾン（PC2）からの緊急打診：『この生物はどこへ向かっている見立てなのか？』
                          </strong>
                          <p className="italic text-slate-200 mt-0.5 leading-relaxed">
                            「内閣は因果関係不明を理由に出動を保留したが、防衛庁としては深刻な脅威と捉えている。内閣を説得し再上申を通すには、より確固たる論拠が必要だ。【この生物は一体どこへ向かっている見立てなのか？】対策本部の進路予測・分析を至急提示してほしい」
                          </p>
                        </div>
                        <p className="text-slate-400">
                          💡 <strong>GM進行メモ</strong>: 司令官が必死に出動要請したにもかかわらず内閣は動かない一方、防衛庁から『どこへ向かっているのか』の意見聴取が行われます。対策本部（司令官・海洋生物学者・気象観測員ら）が提示する見立てや根拠（火山連動の北上軸・駿河湾や富士山直撃など）の論理性によって、<strong>防衛庁側が内閣を再説得できるかどうかの説得力・今後の部隊動員が大きく変わる</strong>ことをプレイヤーに示唆してください。
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/30 p-3 text-[11px] text-indigo-200 space-y-2">
                        <div>
                          <strong className="text-indigo-300 block font-bold text-xs flex items-center gap-1.5">
                            🛡️ 【防衛省・統合幕僚監部からの照会：生物の進路に関する緊急意見聴取】
                          </strong>
                          <p className="italic text-slate-200 mt-1 leading-relaxed">
                            「防衛省運用企画局および海上幕僚監部より合同対策本部へ緊急照会。『対策本部が防衛出動を要請しなかった判断は了解した。しかし、自衛隊としても伊豆諸島の連続噴火と潜航物体に重大な関心を持っている。【この生物は一体どこへ向かっている見立てなのか？】進路および最終到達予測地点に関する対策本部の推定意見を至急提出されたし』」
                          </p>
                        </div>
                        <p className="text-slate-400">
                          💡 <strong>GM進行メモ</strong>: 防衛出動を求めなかった場合も、防衛庁から生物の進路と目的についての意見を強く求められます。どのような進路予測を回答するかによって、今後の防衛庁の警戒レベルや協力関係、内閣への働きかけが変わることを示唆してください。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* フェーズ3：部隊再配置と八丈島・近海前線情報の緊急収集 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-teal-900/60 bg-teal-950/20 p-3 text-[11px] space-y-1">
                      <span className="font-bold text-teal-300 block text-xs flex items-center gap-1.5">
                        <Anchor className="h-3.5 w-3.5" /> ⚓ 小笠原現地組（PC3〜PC6）：父島本島へ帰還
                      </span>
                      <p className="text-slate-300">
                        洋上展開（巡視船あきつしま洋上補給・長距離ヘリ索敵）を完遂した現地部隊は、父島・二見港の本拠地へ無事帰還。島民避難の受け入れ体制を整えつつ、小笠原に残る謎の解明に着手。
                      </p>
                    </div>

                    <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-3 text-[11px] space-y-1">
                      <span className="font-bold text-indigo-300 block text-xs flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5" /> 📡 東京組（PC1, PC2）：八丈島前線情報の緊急収集
                      </span>
                      <p className="text-slate-300">
                        八丈島総合開発センターおよび近海漁協との通信ホットラインを確立。火山性微動に怯える島民の肉声や、八丈島沖で操業する漁船の魚探（アクティブソナー）が捉えた海中物体の最新情報の照会・分析に着手。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：Day 4 合議制アクション操作パネル */}
                  <div className="rounded-xl border border-indigo-900/60 bg-slate-900 p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-400" />
                        【フェーズ4：Day 4 合議制アクション（東京1枠 ＋ 現地2枠）】
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedDay4FieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    {/* 東京司令部アクション */}
                    <div>
                      <span className="font-bold text-indigo-300 text-[11px] block mb-1">
                        🏢 東京司令部アクション（3枠中1枠選択：隕石調査 ｜ 八丈島火山性微動 ｜ 八丈島島民・魚探情報）:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {DAY4_TOKYO_ACTIONS.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedDay4TokyoAction(a.id)}
                            className={`rounded-lg p-2 text-left border transition ${
                              selectedDay4TokyoAction === a.id
                                ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="font-bold text-white text-[11px]">{a.id} {a.badge}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 小笠原現地アクション */}
                    <div>
                      <span className="font-bold text-teal-300 text-[11px] block mb-1">
                        🏝️ 小笠原現地アクション（4枠中2枠選択：隕石調査 ｜ 神社調査 ｜ ダイバー追跡 ｜ 写真画像解析）:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {DAY4_FIELD_ACTIONS.map((a) => {
                          const isSelected = selectedDay4FieldActions.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => handleToggleDay4FieldAction(a.id)}
                              className={`rounded-lg p-2 text-left border transition ${
                                isSelected
                                  ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-teal-600 text-white" : "text-slate-500"}`}>
                                  {isSelected ? "選択中" : "未選択"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 5 && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-red-400">【自衛隊魚雷迎撃の瞬間】:</span>
                    <p className="text-slate-400 mt-1 italic">
                      「魚雷直撃。爆砕。しかし――吹き飛んだはずの黒い影が、まるで泥のように一瞬で再結合していく……！ダメージ、ゼロ。物体は時速6kmの速度を変えず、富士山直下へ向けて直進しています！」
                    </p>
                  </div>
                </div>
              )}

              {currentDay === 6 && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-indigo-400">【恩師のテープ再生合図】:</span>
                    <p className="text-slate-400 mt-1 italic">
                      「スピーカーから、ゴボゴボという深海の水音とともに、乾いたパルス音が鳴り始めます。このクリック音は雑音ではない……クジラの言葉そのものです」
                    </p>
                    <button
                      onClick={() => handlePlayAudioCue("coda-tape")}
                      className="mt-2 flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 transition"
                    >
                      <Volume2 className="h-3.5 w-3.5" /> テープ音声を再生
                    </button>
                  </div>
                </div>
              )}

              {currentDay === 7 && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-emerald-400">【クライマックス：大捕食のナレーション】:</span>
                    <p className="text-slate-400 mt-1 italic">
                      「全ソナー網から祝詞メッセージが放流されました。……沈黙ののち、太平洋全域から数千頭のマッコウクジラが駿河湾へ超集結してきます！海面を割ってクジラたちが怪異の触手を片っ端から噛み砕き、深海の闇へと貪り食っていく……作戦、成功です！」
                    </p>
                    <button
                      onClick={() => handlePlayAudioCue("climax-call")}
                      className="mt-2 flex items-center gap-1.5 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 transition"
                    >
                      <Volume2 className="h-3.5 w-3.5" /> 捕食号令メッセージを全海域放流
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：このフェーズで公開すべき証拠とプレイヤー管理 */}
        <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Day {currentDay} 配布・開示証拠チェック
            </h4>
            {(currentDay === 2 || currentDay === 4) && (
              <span className="text-[10px] text-indigo-400 font-semibold">
                合議選択連動中
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {project.evidences
              .filter((e) => e.foundPhase === currentDay)
              .map((ev) => {
                const owner = project.characters.find((c) => c.id === ev.ownerId);

                // Day 2 / Day 4 の場合のアクション連動チェック
                let isActionSelected = false;
                let linkedActionName = "";
                if (currentDay === 2) {
                  const tokyoMatch = TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedTokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedFieldActions.includes(fieldMatch.id);
                  }
                } else if (currentDay === 4) {
                  const tokyoMatch = DAY4_TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = DAY4_FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedDay4TokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedDay4FieldActions.includes(fieldMatch.id);
                  }
                }

                const isLinkedAndActive = (currentDay === 2 || currentDay === 4) && isActionSelected;

                return (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-3 text-xs transition ${
                      isLinkedAndActive
                        ? "border-emerald-600/70 bg-emerald-950/25 shadow-sm"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(currentDay === 2 || currentDay === 4) && linkedActionName && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              isActionSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {linkedActionName} {isActionSelected ? "開示中" : "未選択"}
                          </span>
                        )}
                        <span
                          className={`font-bold ${
                            isLinkedAndActive
                              ? "text-emerald-300"
                              : "text-indigo-300"
                          }`}
                        >
                          {ev.title}
                        </span>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 whitespace-nowrap">
                        {owner ? owner.name.split(":")[0] : "全体"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{ev.description}</p>
                    {ev.id === "ev-aerial-recon-report" && isActionSelected && (
                      <button
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-amber-200 transition"
                      >
                        <ImageIcon className="h-3 w-3" /> 空撮写真をモーダルで確認
                      </button>
                    )}
                  </div>
                );
              })}

            {project.evidences.filter((e) => e.foundPhase === currentDay).length === 0 && (
              <div className="rounded border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                このDayに新たに配る直接カードはありません
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 空撮写真拡大モーダル */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    海上保安庁 羽田航空基地 MA722撮影 緊急偵察写真
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    撮影日時: Day 2 08:42 | 撮影高度: 3,000ft | 撮影位置: 西之島北西約25海里
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src="/images/aerial_recon_wide.jpg"
                alt="西之島北西海域 空撮写真"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-amber-300">
                【画像解析所見（海上保安庁 警備救難部 航空分析班）】
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ・背景（写真上方）に西之島海底火山の噴煙が明瞭に確認できる。<br />
                ・中央部海面に、時速約6km（約3.3ノット）で北上する水面下物体が形成した明瞭なV字型の<strong>ケルビン波（航跡波）</strong>を観測。<br />
                ・ケルビン波が海面に現れていることから、撮影当時、対象は海底火山の高温熱水を回避するために一時的に<strong>水深10〜20mの海面直下スレスレまで急浮上</strong>していたと推定される。<br />
                ・水面下に透けて見える影の推定全長は<strong>300〜400メートル</strong>。<br />
                ・なお、撮影から数分後、影は急速に水深800m以深の深海へ潜航し、光学視界から消失した。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 火山活動監視状況図 大画面モーダル */}
      {isChartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsChartModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {chartModalDay === 4
                      ? "海上保安庁 火山活動監視状況図（Day 4：須美寿島〜青ヶ島沖海底噴火 ＆ 地震観測）"
                      : "海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺 全域）"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {chartModalDay === 4
                      ? "JAPAN COAST GUARD VOLCANIC MONITORING CHART (CHART NO. V-2024 / WGS84)"
                      : "JAPAN COAST GUARD - VOLCANIC ACTIVITY MONITORING REPORT (WGS84) | 観測記録海図"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={chartModalDay === 4 ? "/images/eruption_monitoring_chart_day4.svg" : "/images/eruption_monitoring_chart.svg"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="原寸ベクターSVGを別タブで表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#081325] flex items-center justify-center p-2 min-h-[420px]">
              <EruptionMonitoringChart day={chartModalDay} className="w-full h-full max-h-[68vh] object-contain select-none" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              {chartModalDay === 4 ? (
                <>
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span>【Day 4 観測要綱および噴火連動所見】</span>
                    <span className="font-mono text-cyan-400">連動速度: 時速約6km 北上</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ・<strong>須美寿島〜青ヶ島沖の噴火（Day 3海底噴火）</strong>：鳥島沖を通過した深海物体が北上を継続し、須美寿島〜青ヶ島沖の海底カルデラで第3の連動大爆発が発生。他島名と重ならない海図西側に明瞭に記録。<br />
                    ・<strong>青ヶ島・八丈島の火山性地震</strong>：海底噴火に伴い、両島にて有感を含む火山性群発微動（震度1〜2）が観測。島民に不穏な空気が広がる。<br />
                    ・<strong>小笠原救難隊</strong>：現地捜索組は母船とともに父島本島（二見港）へ無事帰還・集結。
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span>【噴火日程および連動性観測所見】</span>
                    <span className="font-mono text-cyan-400">移動速度: 時速約6km (日速約150km)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ・<strong>西之島（Day 1 噴火）</strong>：突発的大規模噴火発生。周辺船舶へ緊急退避命令。<br />
                    ・<strong>鳥島沖（Day 2 噴火）</strong>：鳥島海底カルデラが連動大爆発。噴煙高度数千メートル。<br />
                    ・<strong>北上ベクトル</strong>：西之島から鳥島までの距離は約380km。24時間で正確に到達しており、時速約6km（日速約150km）のペースで深海を北上する物体が、通過した先々の火山を順次爆発させている動かぬ証拠。<br />
                    ・<strong>未噴火警戒域</strong>：北方の青ヶ島、八丈島、三宅島、伊豆大島、富士山方面は現時点で未噴火（残り4日で富士山直下に到達）。
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day 3 作戦海図 W-3100 GM用大画面モーダル */}
      {isTacticalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsTacticalModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-950 border border-rose-700 text-rose-400">
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    【GM専用 大画面作戦海図 W-3100】全36セクター索敵盤 ＆ 巨大生物潜航マップ（真相）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:200,000 / WGS84 ｜ 深度400m潜航座標・三辺測量反響円表示
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/images/day3_sonar_tactical_chart.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="原寸ベクターSVGを別タブで表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsTacticalModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる (Escキーでも閉じられます)"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#07111e] flex items-center justify-center min-h-[460px]">
              <Day3TacticalMap defaultMode="gm" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between text-[11px] leading-relaxed">
                <div>
                  <span className="font-bold text-rose-300">【GM真相情報】</span>
                  怪物はセクターB-3（水深400m）。判定: B-3直上=直下捕捉 ｜ B-3隣接=約20km先反響 ｜ 熱水直上(E-2/カルデラ)=探知不能 ｜ 熱水隣接=直下不在確定＆周囲妨害
                </div>
                <div className="font-mono text-cyan-400">
                  1セクター: 約20km四方
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day 1 航海用海図 大画面モーダル（GM・白地図両対応） */}
      {isDay1ModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsDay1ModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    小笠原南西海域 航海用海図（CHART NO. W-2704）
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      {day1ViewMode === "investigation" ? "白地図（プレイヤー提示用）" : "対策本部解析図（GM用）"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:50,000 / 緯度1分 = 1海里 (NM) | 中心: 27°04.0&apos;N, 142°06.0&apos;E (SOS地点)
                  </p>
                </div>
              </div>

              {/* モード切り替えタブ ＆ アクション */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("investigation")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "investigation"
                        ? "bg-cyan-700 text-white shadow ring-1 ring-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <EyeOff className="h-3 w-3" /> 白地図（プレイヤー用）
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("tactical")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "tactical"
                        ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-3 w-3" /> GM解析図
                  </button>
                </div>

                <a
                  href={
                    day1ViewMode === "investigation"
                      ? "/images/day1_nautical_chart_white.svg"
                      : "/images/day1_nautical_chart_gm.svg"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="別タブで原寸SVGを表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>

                <button
                  type="button"
                  onClick={() => setIsDay1ModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部 */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] p-2 flex items-center justify-center min-h-[460px]">
              <div className="w-full h-full max-h-[72vh] flex items-center justify-center">
                <Day1NauticalMap
                  mode={day1ViewMode === "investigation" ? "player" : "gm"}
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300">
              {day1ViewMode === "investigation" ? (
                <div>
                  <strong className="text-cyan-300 block mb-1">
                    【プレイヤー提示用 白地図】漂流予測パズル作図要領:
                  </strong>
                  <p className="text-[11px] text-slate-300">
                    救難信号発信位置を中心に、北東に父島・南島、東側および南東側に危険な暗礁群が点在。各PCの専門知識（風・海流・潮目・船の姿勢）を合成して自力で作図計算させます（解答非表示）。
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                    <span>【対策本部解析図（GM用）】漂流予測の正解とベクトル合成:</span>
                    <span className="text-emerald-400 font-bold">⭐ 救助海域: 東北東へ約2.5海里</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    南西強風15m/sによる風圧流（北東へ約1.5kt）＋ 黒潮支流（真東へ2.0kt）＝【東北東へ約2.5kt】。東側・南東側の暗礁群を北側にすり抜け、発信から1時間後の遭難船を救助成功！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
