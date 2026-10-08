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
  Compass,
  Radar,
  Scroll,
} from "lucide-react";
import { audioEngine } from "@/utils/audioSynth";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";

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
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

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

                  <div className="rounded border border-amber-900/60 bg-amber-950/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">【フェーズ2：状況提示 ＆ なぜ衛星が使えないか】</span>
                      {onNavigateToChart && (
                        <button
                          onClick={onNavigateToChart}
                          className="flex items-center gap-1 rounded bg-cyan-700/80 px-2 py-1 text-[11px] font-bold text-white hover:bg-cyan-600 transition shadow"
                        >
                          <Navigation className="h-3 w-3" />
                          海図画面を開く
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 mt-1 italic">
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
                    <span className="font-bold text-red-400">【NPC 船長（救助直後・錯乱）】:</span>
                    <p className="text-slate-400 mt-1">
                      「あ、あれはクジラなんかじゃない！海の下に……巨大な目玉と無数の触手があったんだ！計器を全部焼き切られただけじゃない、スクリューが何かに巻き付かれたのか、急にビクとも動かなくなっちまったんだ！……それに、あのダイバー連中も怪しい！潜水の手際はプロ並みに手慣れていたが、俺が案内したのは今回が初めてだ。1ヶ月ほど前からこの海域で継続的に潜りを繰り返していたらしい……！」
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
                          onClick={() => setIsChartModalOpen(true)}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く
                        </button>
                      </div>
                    </div>

                    {/* 海図プレビューカード */}
                    <div
                      onClick={() => setIsChartModalOpen(true)}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-64 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
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

                  {/* フェーズ3：アクティブ・ソノブイ3点投下作戦（GM正解メモ） */}
                  <div className="rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Radar className="h-4 w-4 text-cyan-400" />
                        【フェーズ3：アクティブソナー3点投下作戦（GM正解・判定メモ）】
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ヘリ搭載ソノブイ: 最大3機
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded bg-red-950/40 border border-red-900/60 p-2 text-red-200">
                        <strong className="text-red-300 block mb-0.5">💥 自動失敗トラップ（半径25km圏内）:</strong>
                        ・地点A（鳥島北東）: カルデラ直近の微細気泡でクラッター飽和！<br />
                        ・地点B（須美寿東）: 熱水噴出孔の水温躍層でNO RETURN！
                      </div>
                      <div className="rounded bg-emerald-950/40 border border-emerald-900/60 p-2 text-emerald-200">
                        <strong className="text-emerald-300 block mb-0.5">📡 有効測距地点（三辺測量正解）:</strong>
                        ・地点C（鳥島北西）: 反響距離 <strong>約32km</strong><br />
                        ・地点D（須美寿西）: 反響距離 <strong>約20km</strong><br />
                        ・地点E（青ヶ島南西）: 反響距離 <strong>約28km</strong>
                      </div>
                    </div>

                    <div className="rounded bg-slate-900 p-2.5 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <p>
                        🎯 <strong className="text-cyan-300">怪物の現在潜航位置</strong>：
                        須美寿島の西方約35km（31°22&apos;N, 139°42&apos;E）、水深約400m。
                      </p>
                      <p>
                        📋 <strong className="text-white">三辺測量成功時</strong>：
                        ヘリが直上へ急行し、「水深400mを北上する全長300〜400mの生体シグネチャー」の撮影レポートが開示される。
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
            {currentDay === 2 && (
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

                // Day 2の場合のアクション連動チェック
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
                }

                return (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-3 text-xs transition ${
                      currentDay === 2 && isActionSelected
                        ? "border-emerald-600/70 bg-emerald-950/25 shadow-sm"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {currentDay === 2 && linkedActionName && (
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
                            currentDay === 2 && isActionSelected
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
                    海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺 全域）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    JAPAN COAST GUARD - VOLCANIC ACTIVITY MONITORING REPORT (WGS84) | 観測記録海図
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/images/eruption_monitoring_chart.svg"
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
              <EruptionMonitoringChart className="w-full h-full max-h-[68vh] object-contain select-none" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
