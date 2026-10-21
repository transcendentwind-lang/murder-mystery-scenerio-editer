"use client";

import React, { useState, useEffect, useRef } from "react";
import { CrypticWord, CrypticGrammar } from "@/types/schema";
import { audioEngine } from "@/utils/audioSynth";
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Delete,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Compass,
  Waves,
  History,
  HelpCircle,
} from "lucide-react";

export interface WhaleBehaviorRule {
  id: string;
  name: string;
  sequence: string[]; // wordIdの配列
  responseSoundType: "yes_ack" | "alert_boom" | "feeding_burst" | "full_relay" | "none";
  behaviorTitle: string;
  behaviorText: string;
  directionBadge?: string;
  category: "movement" | "action" | "ritual" | "other";
}

export const DEFAULT_BEHAVIOR_RULES: WhaleBehaviorRule[] = [
  {
    id: "rule-west-gather",
    name: "西に集まれ（人工音誘導テスト再現）",
    sequence: ["word-go-west", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが西に移動した",
    behaviorText:
      "海中から短く澄んだクリック音『カッ！（了解）』が返ってきた。\n直後、近くにいたクジラの群れが一斉に進路を変え、西の海域へと整然と移動を開始した！",
    directionBadge: "⬅️ 西（WEST）へ移動",
    category: "movement",
  },
  {
    id: "rule-north-gather",
    name: "北に集まれ",
    sequence: ["word-go-north", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが北に移動した",
    behaviorText:
      "海中から『カッ！（了解）』と応答が返り、クジラの群れが一斉に向きを変えて北の海域へと移動を開始した！",
    directionBadge: "⬆️ 北（NORTH）へ移動",
    category: "movement",
  },
  {
    id: "rule-east-gather",
    name: "東に集まれ",
    sequence: ["word-go-east", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが東に移動した",
    behaviorText:
      "海中から『カッ！（了解）』と応答が返り、クジラの群れが一斉に向きを変えて東の海域へと移動を開始した！",
    directionBadge: "➡️ 東（EAST）へ移動",
    category: "movement",
  },
  {
    id: "rule-south-gather",
    name: "南に集まれ",
    sequence: ["word-go-south", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが南に移動した",
    behaviorText:
      "海中から『カッ！（了解）』と応答が返り、クジラの群れが一斉に向きを変えて南の海域へと移動を開始した！",
    directionBadge: "⬇️ 南（SOUTH）へ移動",
    category: "movement",
  },
  {
    id: "rule-west-search",
    name: "西に向かって探せ",
    sequence: ["word-go-west", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが西の海域を索敵し始めた",
    behaviorText:
      "『カッ！（了解）』の応答とともに、クジラたちは西の海域へ展開し、盛んにソナーパルスを放ちながら何かを探し始めた。",
    directionBadge: "⬅️ 西（WEST）を索敵",
    category: "movement",
  },
  {
    id: "rule-north-search",
    name: "北に向かって探せ",
    sequence: ["word-go-north", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが北の海域を索敵し始めた",
    behaviorText:
      "『カッ！（了解）』の応答とともに、クジラたちは北の海域へ進路を取り、深海へソナーパルスを放ちながら索敵を開始した。",
    directionBadge: "⬆️ 北（NORTH）を索敵",
    category: "movement",
  },
  {
    id: "rule-east-search",
    name: "東に向かって探せ",
    sequence: ["word-go-east", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが東の海域を索敵し始めた",
    behaviorText:
      "『カッ！（了解）』の応答とともに、クジラたちは東の海域へ進路を取り、ソナーパルスを放ちながら索敵を開始した。",
    directionBadge: "➡️ 東（EAST）を索敵",
    category: "movement",
  },
  {
    id: "rule-south-search",
    name: "南に向かって探せ",
    sequence: ["word-go-south", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが南の海域を索敵し始めた",
    behaviorText:
      "『カッ！（了解）』の応答とともに、クジラたちは南の海域へ進路を取り、ソナーパルスを放ちながら索敵を開始した。",
    directionBadge: "⬇️ 南（SOUTH）を索敵",
    category: "movement",
  },
  {
    id: "rule-volcano-alert",
    name: "海の下の火山 ＋ 警戒せよ（テープNo.14再現）",
    sequence: ["word-subsea-volcano", "word-alert"],
    responseSoundType: "alert_boom",
    behaviorTitle: "⚠️ クジラの群れが海底火山から一斉退避した",
    behaviorText:
      "重苦しい警戒パルスが伝播すると、周辺海域にいたクジラの群れが一斉に進路を変え、海底火山の危険海域から急速に遠ざかる退避行動を開始した！",
    directionBadge: "🚨 危険海域から急速退避",
    category: "action",
  },
  {
    id: "rule-feeding-call",
    name: "探せ ＋ 巨大な餌 ＋ 集まれ（テープNo.35再現）",
    sequence: ["word-search", "word-giant-prey", "word-gather"],
    responseSoundType: "feeding_burst",
    behaviorTitle: "🦑 クジラが集まり、餌のイカを食べ始めた",
    behaviorText:
      "3語のクリック音が響いた直後、深海から複数のマッコウクジラが次々と姿を現し、海中のイカを探知して猛烈な勢いで捕食し始めた！",
    directionBadge: "🎯 獲物を探知・捕食開始",
    category: "action",
  },
  {
    id: "rule-lost-calf-short",
    name: "クジラ ＋ 探せ（テープNo.41再現・2語）",
    sequence: ["word-whale", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 仲間たちが呼応し、迷子の仔クジラを捜索し始めた",
    behaviorText:
      "周囲数キロに散らばる仲間のクジラたちから次々に『カッ！（了解）』のクリック音が返され、一斉に迷子のクジラを探し出して群れへと合流させた！",
    directionBadge: "🤝 仲間を捜索・合流",
    category: "action",
  },
  {
    id: "rule-lost-calf-promise",
    name: "人間 ＋ クジラ ＋ 約束 ＋ クジラ ＋ 探せ（テープNo.41再現・5語）",
    sequence: ["word-human", "word-whale", "word-promise", "word-whale", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 盟約に従い、クジラたちが総出で仲間を捜索・保護した",
    behaviorText:
      "『人とクジラの約束』のクリック音に深く共鳴し、周囲の海域から次々に『カッ！（了解）』がこだました。クジラたちは即座に仲間を見つけ出し、安全に保護した！",
    directionBadge: "✨ 盟約による捜索・合流",
    category: "ritual",
  },
  {
    id: "rule-promise-only",
    name: "人間 ＋ クジラ ＋ 約束（盟約の前置のみ）",
    sequence: ["word-human", "word-whale", "word-promise"],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラが浮上し、人間の次の言葉を待っている",
    behaviorText:
      "深海から重厚な了解クリック『カッ！』が返ってきた。クジラたちは太古の『人とクジラの約束』を認識し、耳を澄ませて続く指示（どこへ向かい、何を探し、どうするか）を待っている……！",
    directionBadge: "📡 盟約成立・指示待機中",
    category: "ritual",
  },
  {
    id: "rule-oral-6words",
    name: "古伝承の6語祝詞（場所・方角なし）",
    sequence: [
      "word-human",
      "word-whale",
      "word-promise",
      "word-search",
      "word-giant-prey",
      "word-gather",
    ],
    responseSoundType: "yes_ack",
    behaviorTitle: "🐋 クジラは巨大な餌を探しているが、向かう場所が分からず旋回している",
    behaviorText:
      "クジラたちは盟約に応じて『巨大な餌』に集まろうとソナーを放っているが、【どの場所（海の下の火山）】を【どの方角（北）】へ向かって探せばよいか分からず、周辺の海を困惑して旋回している……！",
    directionBadge: "❓ 目標地点・方角が未指定",
    category: "ritual",
  },
  {
    id: "rule-final-8words",
    name: "【完全版8語祝詞】人とクジラの約束・海底火山を北へ探せ・巨大な餌に集まれ",
    sequence: [
      "word-human",
      "word-whale",
      "word-promise",
      "word-subsea-volcano",
      "word-go-north",
      "word-search",
      "word-giant-prey",
      "word-gather",
    ],
    responseSoundType: "full_relay",
    behaviorTitle: "🌊 太平洋のクジラ群が歌をリレーし、北の海底火山（駿河湾）へ一斉進撃を開始した！！",
    behaviorText:
      "至近のクジラが『カッ！（了解）』を返信！ 直後、そのクジラ自身が同じ8語のクリック音を力強く歌いながら、海底火山列に沿って北へと猛進を開始した！\nさらに数十キロ、数百キロ沖合のクジラたちが次々と『了解』を返してその歌をリレー継承し、太平洋全域のマッコウクジラ群が駿河湾の『巨大な餌（超群体）』を喰らうため一斉に集結していく！！",
    directionBadge: "🌟 完全共鳴：太平洋全域リレー発動",
    category: "ritual",
  },
];

const STORAGE_KEY_RULES = "mm_workbench_whale_behavior_rules_v1";

interface AttemptLog {
  id: string;
  timestamp: string;
  sequenceIds: string[];
  matchedRuleId: string | null;
  title: string;
  text: string;
  badge: string;
  status: "success" | "partial" | "fail";
}

interface WhaleSonarMobileAppProps {
  words: CrypticWord[];
  grammar?: CrypticGrammar;
  standalone?: boolean; // /sonar ページ等で単体フル画面表示する場合 true
}

export const WhaleSonarMobileApp: React.FC<WhaleSonarMobileAppProps> = ({
  words,
  standalone = false,
}) => {
  const [rules, setRules] = useState<WhaleBehaviorRule[]>(DEFAULT_BEHAVIOR_RULES);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [showMeaningHint, setShowMeaningHint] = useState(true);
  const [currentOutcome, setCurrentOutcome] = useState<AttemptLog | null>(null);
  const [attemptLogs, setAttemptLogs] = useState<AttemptLog[]>([]);
  const [viewMode, setViewMode] = useState<"mobile_player" | "rule_editor">(
    "mobile_player"
  );
  const [relayStageText, setRelayStageText] = useState<string | null>(null);

  // 新規ルール追加用ステート
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleSeq, setNewRuleSeq] = useState<string[]>([]);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleText, setNewRuleText] = useState("");
  const [newRuleBadge, setNewRuleBadge] = useState("🐋 クジラ行動反応");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // ルールのローカルストレージ読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRules(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveRules = (nextRules: WhaleBehaviorRule[]) => {
    setRules(nextRules);
    try {
      localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(nextRules));
    } catch {
      // ignore
    }
  };

  // オシロスコープ波形描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const analyser = audioEngine?.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
      } else {
        dataArray.fill(128);
      }

      ctx.fillStyle = "rgb(2, 6, 23)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ソナーグリッド
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(14, 116, 144, 0.2)";
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 36) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 24) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // 波形ライン
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isPlaying ? "#22d3ee" : "#38bdf8";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = isPlaying ? 10 : 4;

      ctx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  // 単語ボタンを押した時（クリック音を鳴らしてパターン末尾に追加）
  const handleAddWordAndPlay = async (wordId: string) => {
    if (isPlaying) return;
    setSelectedSequence((prev) => [...prev, wordId]);
    setActiveWordId(wordId);
    await audioEngine?.playWordSound(wordId, 1.0);
    setActiveWordId(null);
  };

  // 試聴のみ（パターンには追加しない）
  const handlePreviewWordOnly = async (
    e: React.MouseEvent,
    wordId: string
  ) => {
    e.stopPropagation();
    if (isPlaying) return;
    setActiveWordId(wordId);
    await audioEngine?.playWordSound(wordId, 1.0);
    setActiveWordId(null);
  };

  // 1文字削除・全クリア
  const handleBackspace = () => {
    if (isPlaying) return;
    setSelectedSequence((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isPlaying) return;
    setSelectedSequence([]);
    setCurrentOutcome(null);
    setRelayStageText(null);
  };

  // パターン判定ロジック（完全一致 ＋ 試行錯誤への状況別ヒント応答）
  const evaluatePatternOutcome = (seq: string[]): AttemptLog => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 1. 登録ルールとの完全一致検索
    const exactMatch = rules.find(
      (r) =>
        r.sequence.length === seq.length &&
        r.sequence.every((id, idx) => id === seq[idx])
    );

    if (exactMatch) {
      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: exactMatch.id,
        title: exactMatch.behaviorTitle,
        text: exactMatch.behaviorText,
        badge: exactMatch.directionBadge || "🐋 行動観測",
        status:
          exactMatch.id === "rule-oral-6words" ||
          exactMatch.id === "rule-promise-only"
            ? "partial"
            : "success",
      };
    }

    // 2. 1語のみ発信された場合（構文規則のフィードバック）
    if (seq.length === 1) {
      const singleWord = words.find((w) => w.id === seq[0]);
      const wordLabel = singleWord
        ? singleWord.meaning.split("（")[0]
        : "単一パルス";
      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: null,
        title: "🌊 クジラは静観している（1語単独の発信）",
        text: `『${wordLabel}』のクリック音が海中に響いたが、クジラたちは動く気配を見せない。\n（※クジラの言語は「了解」を除き、2つ以上のクリック音を組み合わせた連鎖になって初めて行動を起こすようだ）`,
        badge: "💡 2語以上の組み合わせが必要",
        status: "partial",
      };
    }

    // 3. 方角が入っているが「集まれ」「探せ」等の動詞が後ろにない場合、または語順が逆の場合
    const directions = [
      { id: "word-go-west", dirName: "西" },
      { id: "word-go-north", dirName: "北" },
      { id: "word-go-east", dirName: "東" },
      { id: "word-go-south", dirName: "南" },
    ];
    const matchedDir = directions.find((d) => seq.includes(d.id));

    if (matchedDir && seq.length === 2) {
      // 逆順（例：集まれ ＋ 西に向かう）チェック
      if (seq[0] === "word-gather" && seq[1] === matchedDir.id) {
        return {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          sequenceIds: [...seq],
          matchedRuleId: null,
          title: `🐋 クジラたちは戸惑い、${matchedDir.dirName}の方角を気にしている`,
          text: `『集まれ』の後に『${matchedDir.dirName}に向かう』が鳴らされたため、語順が逆でクジラたちが混乱しているようだ。\n先に【方角】を鳴らし、その後に【集まれ（または探せ）】を鳴らしてみよう！`,
          badge: "🔄 語順が逆の可能性",
          status: "partial",
        };
      }
    }

    // 4. その他の未定義パターン
    return {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      sequenceIds: [...seq],
      matchedRuleId: null,
      title: "🌊 クリック音は暗い海へ反響したが、クジラは動かない",
      text: "発信したクリック音の並びでは意味（文法）が成立しなかったようだ。クジラたちは警戒して距離を保ちながら、正しいリズムの呼びかけを待っている……。",
      badge: "❌ パターン不一致",
      status: "fail",
    };
  };

  // パターンを海中に放流（再生＆判定＆行動表示）
  const handleTransmitSequence = async (overrideSeq?: string[]) => {
    const targetSeq = overrideSeq || selectedSequence;
    if (targetSeq.length === 0 || isPlaying) return;

    if (overrideSeq) {
      setSelectedSequence(overrideSeq);
    }

    setIsPlaying(true);
    setCurrentOutcome(null);
    setRelayStageText(null);

    // 1語ずつハイライトしながらクリック音を順番に再生
    for (let i = 0; i < targetSeq.length; i++) {
      setActivePlayingIndex(i);
      setActiveWordId(targetSeq[i]);
      await audioEngine?.playWordSound(targetSeq[i], 1.0);
      await new Promise((r) => setTimeout(r, 280));
    }
    setActivePlayingIndex(null);
    setActiveWordId(null);

    // 判定
    const outcome = evaluatePatternOutcome(targetSeq);
    const matchedRule = rules.find((r) => r.id === outcome.matchedRuleId);

    // 少しの間（海中伝播の演出 450ms）を置いてクジラの応答音を再生
    await new Promise((r) => setTimeout(r, 450));

    if (matchedRule?.responseSoundType === "yes_ack") {
      // クジラからの「了解（カッ！）」クリック応答
      await audioEngine?.playWordSound("word-yes", 1.0);
    } else if (matchedRule?.responseSoundType === "alert_boom") {
      await audioEngine?.playWordSound("word-alert", 1.0);
    } else if (matchedRule?.responseSoundType === "feeding_burst") {
      await audioEngine?.playWordSound("word-yes", 1.0);
      await new Promise((r) => setTimeout(r, 250));
      await audioEngine?.playWordSound("word-prey", 1.1);
    } else if (matchedRule?.responseSoundType === "full_relay") {
      // 8語完全祝詞のときは圧巻のリレー音響も発動
      audioEngine?.playWhaleMessageRelayChorus((statusText) => {
        setRelayStageText(statusText);
      });
    }

    setCurrentOutcome(outcome);
    setAttemptLogs((prev) => [outcome, ...prev]);
    setIsPlaying(false);
  };

  // 新規ルールの追加保存
  const handleAddCustomRule = () => {
    if (!newRuleName.trim() || newRuleSeq.length === 0 || !newRuleTitle.trim()) {
      return;
    }
    const created: WhaleBehaviorRule = {
      id: `custom-${Date.now()}`,
      name: newRuleName.trim(),
      sequence: [...newRuleSeq],
      responseSoundType: "yes_ack",
      behaviorTitle: newRuleTitle.trim(),
      behaviorText:
        newRuleText.trim() ||
        "クジラたちがクリック音に反応し、行動を開始した！",
      directionBadge: newRuleBadge.trim() || "🐋 行動観測",
      category: "other",
    };
    handleSaveRules([created, ...rules]);
    setNewRuleName("");
    setNewRuleSeq([]);
    setNewRuleTitle("");
    setNewRuleText("");
  };

  const handleDeleteRule = (id: string) => {
    handleSaveRules(rules.filter((r) => r.id !== id));
  };

  const handleResetDefaultRules = () => {
    handleSaveRules(DEFAULT_BEHAVIOR_RULES);
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        standalone ? "min-h-screen w-full" : "h-full w-full overflow-hidden"
      }`}
    >
      {/* ワークベンチ内表示時のみ：上部モード切替バー（スマホ画面 ⇔ パターン設定管理 ⇔ 別タブで開く） */}
      {!standalone && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-6 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                プレイヤー操作用「クジラクリック音発信 ＆ 行動観測」モバイルWebアプリ
                <span className="rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                  /sonar
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                ボタンを押してクリック音のパターンを鳴らすと、パターンに応じて「クジラが西に移動した」等の行動が文字で表示されます。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 表示モード切替 */}
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              <button
                onClick={() => setViewMode("mobile_player")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition ${
                  viewMode === "mobile_player"
                    ? "bg-cyan-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                📱 アプリ画面で試す
              </button>
              <button
                onClick={() => setViewMode("rule_editor")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition ${
                  viewMode === "rule_editor"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                ⚙️ パターン＆表示文字の編集 ({rules.length}件)
              </button>
            </div>

            {/* プレイヤー専用URL（/sonar）を別ウィンドウで開く */}
            <a
              href="/sonar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-900/60 transition"
              title="スマホや別タブでプレイヤー専用の全画面Webアプリを開きます"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              プレイヤー専用画面（/sonar）を開く
            </a>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      {viewMode === "rule_editor" && !standalone ? (
        /* ==========================================
           ⚙️ 作者・GM用：パターン＆クジラ行動テキスト編集画面
           ========================================== */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-400" />
                  クリック音パターンと「表示されるクジラの行動文字」の設定一覧
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  プレイヤーがどのクリック音の組み合わせを鳴らした時に、どんな行動テキストを表示するかを自由に追加・編集できます。
                </p>
              </div>
              <button
                onClick={handleResetDefaultRules}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                初期設定に戻す
              </button>
            </div>

            {/* 新しいパターン反応を追加するフォーム */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                新しい「クリック音パターン ➔ クジラの行動テキスト」を追加
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ① パターン名（管理用メモ）
                  </label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="例：東へ退避せよ"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ② ステータスバッジ表示
                  </label>
                  <input
                    type="text"
                    value={newRuleBadge}
                    onChange={(e) => setNewRuleBadge(e.target.value)}
                    placeholder="例：➡️ 東へ移動"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  ③ 正解となるクリック音の並び順（タップして順番に追加）
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {words.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setNewRuleSeq((prev) => [...prev, w.id])}
                      className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-500 hover:text-cyan-300 transition"
                    >
                      ＋ {w.meaning.split("（")[0]} ({w.symbol})
                    </button>
                  ))}
                </div>
                <div className="min-h-10 rounded-lg border border-slate-800 bg-slate-950 p-2.5 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {newRuleSeq.length === 0 ? (
                      <span className="text-xs text-slate-500">
                        上のボタンをクリックして音の順番を並べてください
                      </span>
                    ) : (
                      newRuleSeq.map((wId, idx) => {
                        const w = words.find((item) => item.id === wId);
                        return (
                          <React.Fragment key={`${wId}-${idx}`}>
                            <span className="rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-xs font-bold text-cyan-200">
                              {idx + 1}. {w?.meaning.split("（")[0]}
                            </span>
                            {idx < newRuleSeq.length - 1 && (
                              <span className="text-slate-500 text-xs">➔</span>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                  {newRuleSeq.length > 0 && (
                    <button
                      onClick={() => setNewRuleSeq([])}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      クリア
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ④ 画面に大きく表示する行動見出し（文字）
                  </label>
                  <input
                    type="text"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder="例：🐋 クジラが東の海域へと移動した"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    ⑤ 詳細な行動描写テキスト
                  </label>
                  <input
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    placeholder="例：了解のクリック音が返り、群れが一斉に東へと泳ぎ出した。"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCustomRule}
                disabled={
                  !newRuleName.trim() ||
                  newRuleSeq.length === 0 ||
                  !newRuleTitle.trim()
                }
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-40 transition"
              >
                <Plus className="h-4 w-4" />
                このパターン反応を追加保存する
              </button>
            </div>

            {/* 登録済みルール一覧 */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-cyan-950 border border-cyan-700/50 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                        {rule.directionBadge || "🐋 行動"}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {rule.name}
                      </span>
                    </div>

                    {/* パターン並び順 */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {rule.sequence.map((wId, idx) => {
                        const w = words.find((item) => item.id === wId);
                        return (
                          <React.Fragment key={`${rule.id}-${wId}-${idx}`}>
                            <span className="rounded bg-slate-950 border border-slate-700 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                              {w ? `${w.meaning.split("（")[0]} (${w.symbol})` : wId}
                            </span>
                            {idx < rule.sequence.length - 1 && (
                              <span className="text-slate-500 text-xs">＋</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* 表示される文字 */}
                    <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                      <div className="text-xs font-bold text-emerald-300">
                        表示見出し：『{rule.behaviorTitle}』
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-300 whitespace-pre-line">
                        {rule.behaviorText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => {
                        setViewMode("mobile_player");
                        handleTransmitSequence(rule.sequence);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-cyan-600/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-600 hover:text-white transition"
                    >
                      <Play className="h-3.5 w-3.5" />
                      アプリで再生テスト
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-500 hover:border-red-500/50 hover:text-red-400 transition"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ==========================================
           📱 プレイヤー用モバイルアプリ画面（スマホUI + PC時は右側にクイック試聴＆ガイド）
           ========================================== */
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 md:p-6">
          <div className="mx-auto flex max-w-6xl flex-col lg:flex-row items-start justify-center gap-6">
            {/* 左（メイン）：スマホ実機サイズの音響トランスミッター＆行動観測アプリ */}
            <div className="w-full max-w-md mx-auto rounded-[28px] border-2 border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col">
              {/* スマホアプリ上部ステータス＆ヘッダー */}
              <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 px-4 py-3 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                  </span>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                      <Waves className="h-3.5 w-3.5 text-cyan-400" />
                      深海クジラ音響発信・観測機
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400/80">
                      SOFAR CODA TRANSCEIVER v2.4
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* 意味ラベルのON/OFF切り替え（プレイヤー推理モード切替） */}
                  <button
                    onClick={() => setShowMeaningHint(!showMeaningHint)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                      showMeaningHint
                        ? "border-amber-500/40 bg-amber-950/40 text-amber-300"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                    title="ボタンに「西に向かう」などの意味を表示するか、音の特徴だけを表示するかを切り替えます"
                  >
                    {showMeaningHint ? (
                      <>
                        <Eye className="h-3 w-3" />
                        意味表示: ON
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        音のみ表示
                      </>
                    )}
                  </button>

                  {/* 深海アンビエント音 */}
                  <button
                    onClick={() => {
                      const next = audioEngine?.toggleAmbient();
                      setIsAmbientOn(!!next);
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                      isAmbientOn
                        ? "border-cyan-400 bg-cyan-900/60 text-cyan-200"
                        : "border-slate-700 bg-slate-900 text-slate-400"
                    }`}
                    title="深海の環境音（水圧ノイズ）を流します"
                  >
                    {isAmbientOn ? (
                      <Volume2 className="h-3 w-3 text-cyan-300" />
                    ) : (
                      <VolumeX className="h-3 w-3" />
                    )}
                    海音
                  </button>
                </div>
              </div>

              {/* ① リアルタイム波形モニター ＆ クジラ行動テキスト表示スクリーン */}
              <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 space-y-3">
                {/* 波形Canvas */}
                <div className="relative h-20 w-full rounded-xl border border-cyan-500/30 bg-slate-950 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={90}
                    className="w-full h-full"
                  />
                  <div className="absolute top-1.5 left-2.5 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/90">
                    <Radio className="h-3 w-3 animate-pulse" />
                    {isPlaying
                      ? "TRANSMITTING CLICK CODA..."
                      : activeWordId
                      ? `PULSE: ${activeWordId.toUpperCase()}`
                      : "HYDROPHONE READY (水深800m監視中)"}
                  </div>
                </div>

                {/* ★超重要：クジラの行動が文字で表示されるメインモニター枠★ */}
                <div
                  className={`min-h-[116px] rounded-xl border p-3.5 transition-all duration-300 flex flex-col justify-center ${
                    isPlaying
                      ? "border-cyan-500/60 bg-cyan-950/30 animate-pulse"
                      : currentOutcome?.status === "success"
                      ? "border-emerald-400 bg-gradient-to-br from-emerald-950/70 via-cyan-950/50 to-slate-950 shadow-lg shadow-emerald-950/50"
                      : currentOutcome?.status === "partial"
                      ? "border-amber-400/70 bg-amber-950/30"
                      : currentOutcome?.status === "fail"
                      ? "border-rose-500/50 bg-rose-950/25"
                      : "border-slate-800 bg-slate-950/90"
                  }`}
                >
                  {isPlaying ? (
                    <div className="text-center space-y-1.5 py-2">
                      <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-2">
                        <Waves className="h-4 w-4 animate-bounce" />
                        海中にクリック音パターンを放流しています……
                      </div>
                      <p className="text-[11px] text-cyan-400/80">
                        クジラたちの反応をソナーで観測中……
                      </p>
                    </div>
                  ) : currentOutcome ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            currentOutcome.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                              : currentOutcome.status === "partial"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                          }`}
                        >
                          {currentOutcome.status === "success" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {currentOutcome.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {currentOutcome.timestamp}
                        </span>
                      </div>

                      {/* クジラの行動（大きな文字表示） */}
                      <div
                        className={`text-sm font-extrabold tracking-wide leading-snug ${
                          currentOutcome.status === "success"
                            ? "text-emerald-200"
                            : currentOutcome.status === "partial"
                            ? "text-amber-200"
                            : "text-rose-200"
                        }`}
                      >
                        {currentOutcome.title}
                      </div>

                      {/* 詳細な描写テキスト */}
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                        {currentOutcome.text}
                      </p>

                      {relayStageText && (
                        <div className="mt-2 rounded-lg border border-cyan-400/50 bg-cyan-950/60 px-2.5 py-1.5 text-[11px] font-bold text-cyan-200">
                          {relayStageText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-1 py-2">
                      <div className="text-xs font-bold text-slate-400">
                        【クジラの行動観測モニター】
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        下のボタンを押してクリック音のパターンを組み立て、
                        <br />
                        「海中に鳴らす（発信）」を押すと、ここにクジラの行動が文字で表示されます。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ② 組み立て中のクリック音パターン（シーケンスバー） ＆ 発信ボタン */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>発信するクリック音パターン</span>
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {selectedSequence.length}語
                    </span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleBackspace}
                      disabled={selectedSequence.length === 0 || isPlaying}
                      className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-40 transition"
                    >
                      <Delete className="h-3 w-3" />
                      1つ戻す
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={selectedSequence.length === 0 || isPlaying}
                      className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-40 transition"
                    >
                      <RotateCcw className="h-3 w-3" />
                      クリア
                    </button>
                  </div>
                </div>

                {/* 選択された音のスロット表示 */}
                <div className="min-h-[48px] rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex flex-wrap items-center gap-1.5">
                  {selectedSequence.length === 0 ? (
                    <span className="text-xs text-slate-500 px-1">
                      下のクリック音ボタンをタップしてパターンを作ってください
                    </span>
                  ) : (
                    selectedSequence.map((wId, index) => {
                      const word = words.find((w) => w.id === wId);
                      const isCurrentStep = activePlayingIndex === index;
                      const shortMeaning = word
                        ? word.meaning.split("（")[0]
                        : wId;
                      const shortSound =
                        word?.soundPattern.match(/（(.+?)）/)?.[1] ||
                        word?.symbol ||
                        "";
                      return (
                        <React.Fragment key={`${wId}-${index}`}>
                          <button
                            onClick={() => audioEngine?.playWordSound(wId, 1.0)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                              isCurrentStep
                                ? "bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 scale-105 shadow-lg"
                                : "bg-indigo-950/90 border border-indigo-500/50 text-indigo-100 hover:bg-indigo-900"
                            }`}
                            title="タップしてこの音を確認"
                          >
                            <span className="text-[10px] font-mono text-cyan-300">
                              {index + 1}.
                            </span>
                            <span>
                              {showMeaningHint
                                ? shortMeaning
                                : shortSound || word?.symbol}
                            </span>
                          </button>
                          {index < selectedSequence.length - 1 && (
                            <span className="text-slate-500 text-xs font-bold">
                              ＋
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* 発信（再生＆判定）メインボタン */}
                <button
                  onClick={() => handleTransmitSequence()}
                  disabled={selectedSequence.length === 0 || isPlaying}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 py-3 px-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <Volume2
                    className={`h-5 w-5 ${isPlaying ? "animate-ping" : ""}`}
                  />
                  {isPlaying
                    ? "クリック音パターンを放流中..."
                    : "🔊 このパターンを海中に鳴らす（発信）"}
                </button>
              </div>

              {/* ③ クリック音ボタン一覧（プレイヤーがタップして音を鳴らす＆組み立てるパッド） */}
              <div className="p-3.5 space-y-2.5 bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    クリック音ボタン（タップで音が鳴り、パターンに追加）
                  </span>
                  <span className="text-[10px] text-slate-500">
                    🔊アイコンは試聴のみ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {words.map((w) => {
                    const isActive = activeWordId === w.id;
                    const shortMeaning = w.meaning.split("（")[0];
                    const onomatopoeia =
                      w.soundPattern.match(/（(.+?)）/)?.[1] || w.soundPattern;
                    const rhythmDesc = w.soundPattern.replace(/（.+?）/, "");

                    return (
                      <div
                        key={w.id}
                        onClick={() => handleAddWordAndPlay(w.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleAddWordAndPlay(w.id);
                          }
                        }}
                        className={`group relative rounded-xl border p-2.5 text-left transition cursor-pointer select-none active:scale-[0.97] ${
                          isActive
                            ? "border-cyan-400 bg-cyan-950/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400"
                            : "border-slate-800 bg-slate-900/90 hover:border-cyan-500/50 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-slate-950 border border-slate-700 px-1.5 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                              {w.symbol}
                            </span>
                            {showMeaningHint && (
                              <span className="text-xs font-extrabold text-white">
                                {shortMeaning}
                              </span>
                            )}
                          </div>

                          {/* 試聴のみボタン */}
                          <button
                            type="button"
                            onClick={(e) => handlePreviewWordOnly(e, w.id)}
                            className="rounded-lg bg-slate-800/90 p-1.5 text-cyan-300 hover:bg-cyan-600 hover:text-white transition"
                            title="パターンに追加せず、クリック音だけを試聴します"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-1.5">
                          <div className="text-xs font-bold text-amber-300/95">
                            『{onomatopoeia}』
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {rhythmDesc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右側パネル：ワンタップ実験プリセット ＆ 試行錯誤ログ ＆ 使い方ガイド */}
            <div className="w-full lg:w-96 space-y-4">
              {/* ワンタップで試せる代表パターン（ユーザーの「西に集まれ」など） */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white">
                    ワンタップ動作テスト（代表的な正解パターン）
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  下のボタンを押すと、自動的にそのクリック音パターンが鳴り響き、スマホ画面上にクジラの行動が文字で表示されます。
                </p>

                <div className="space-y-2">
                  {[
                    {
                      label: "①「西に向かう」＋「集まれ」を鳴らす",
                      sub: "ピ・ポ・ポン ＋ カ・カ・カカッ！ ➔『クジラが西に移動した』",
                      seq: ["word-go-west", "word-gather"],
                      color:
                        "border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200",
                    },
                    {
                      label: "②「北に向かう」＋「集まれ」を鳴らす",
                      sub: "ピ・ピピッ ＋ カ・カ・カカッ！ ➔『クジラが北に移動した』",
                      seq: ["word-go-north", "word-gather"],
                      color:
                        "border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200",
                    },
                    {
                      label: "③「海の下の火山」＋「警戒せよ」を鳴らす",
                      sub: "ゴゴゴゴ… ＋ ドォン… ➔『海底火山から一斉退避した』",
                      seq: ["word-subsea-volcano", "word-alert"],
                      color:
                        "border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200",
                    },
                    {
                      label: "④「探せ」＋「巨大な餌」＋「集まれ」を鳴らす",
                      sub: "タン・タン・タン ＋ チチチ… ＋ カ・カ・カカッ！ ➔『イカを捕食』",
                      seq: ["word-search", "word-giant-prey", "word-gather"],
                      color:
                        "border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-200",
                    },
                    {
                      label: "⑤ クライマックス「完全版8語祝詞」を鳴らす",
                      sub: "人とクジラの約束・海底火山を北へ探せ・巨大な餌に集まれ",
                      seq: [
                        "word-human",
                        "word-whale",
                        "word-promise",
                        "word-subsea-volcano",
                        "word-go-north",
                        "word-search",
                        "word-giant-prey",
                        "word-gather",
                      ],
                      color:
                        "border-pink-500/40 bg-pink-950/30 hover:bg-pink-900/50 text-pink-200",
                    },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handleTransmitSequence(preset.seq)}
                      disabled={isPlaying}
                      className={`w-full rounded-xl border p-2.5 text-left transition disabled:opacity-40 ${preset.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{preset.label}</span>
                        <Play className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <div className="mt-0.5 text-[10px] opacity-80">
                        {preset.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* プレイヤーの試行錯誤履歴ログ */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <History className="h-4 w-4 text-cyan-400" />
                    発信・観測ログ履歴（試行錯誤の記録）
                  </span>
                  {attemptLogs.length > 0 && (
                    <button
                      onClick={() => setAttemptLogs([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      履歴クリア
                    </button>
                  )}
                </div>

                {attemptLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    まだクリック音を発信していません。
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {attemptLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-[11px] ${
                              log.status === "success"
                                ? "text-emerald-400"
                                : log.status === "partial"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {log.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {log.timestamp}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {log.sequenceIds.map((id, idx) => {
                            const w = words.find((item) => item.id === id);
                            return (
                              <span
                                key={`${log.id}-${idx}`}
                                className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300"
                              >
                                {w ? w.meaning.split("（")[0] : id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* プレイヤー共有・ヒント案内 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  プレイヤーへの見せ方の切り替えポイント
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  スマホ画面右上の<strong>「意味表示: ON / 音のみ表示」</strong>を切り替えると、ボタンの「西に向かう」「集まれ」といった日本語を隠し、<strong>『ピ・ポ・ポン』『カ・カ・カカッ！』という音の特徴だけを表示するモード</strong>にできます。ハンドアウトの手がかりと照らし合わせて推理させる際に最適です！
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
