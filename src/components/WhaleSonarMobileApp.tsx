"use client";

import { scenarioAssetUrl } from "@/scenarios/catalog";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CrypticWord, CrypticGrammar } from "@/types/schema";
import { AcousticPulsePoint, buildAudioTimeline } from "@/utils/wordAudio";
export { getWordAcousticPulses } from "@/utils/wordAudio";
import { audioEngine } from "@/utils/audioSynth";
import { printWhaleSonarGuideA4 } from "@/utils/sonarGuide";
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
  ExternalLink,
  Eye,
  Waves,
  History,
  HelpCircle,
  Tag,
  Lock,
  ArrowLeft,
  Check,
  Activity,
  Printer,
} from "lucide-react";

export interface WhaleBehaviorRule {
  id: string;
  name: string;
  sequence: string[]; // wordIdの配列（厳密な順序）
  responseSoundType:
    | "yes_ack"
    | "greet_you_echo"
    | "greet_human_echo"
    | "none";
  behaviorTitle: string;
  behaviorText: string;
  directionBadge?: string;
  category: "movement" | "action" | "ritual" | "other";
}

// ==========================================
// 2語成語（全24パターン・順序厳守）のクジラ行動定義
// ==========================================
export const DEFAULT_BEHAVIOR_RULES: WhaleBehaviorRule[] = [
  {
    id: "rule-01-volcano-alert",
    name: "海の下の火山 ＋ 周囲を警戒せよ",
    sequence: ["word-subsea-volcano", "word-alert"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは海底火山を警戒し始めた",
    behaviorText: "クジラは海底火山を警戒し始めた",
    directionBadge: "🌋 海底火山を警戒",
    category: "action",
  },
  {
    id: "rule-02-enemy-alert",
    name: "敵がいる ＋ 周囲を警戒せよ",
    sequence: ["word-enemy", "word-alert"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは周囲の動く大きな生き物への警戒をし始めた",
    behaviorText: "クジラは周囲の動く大きな生き物への警戒をし始めた",
    directionBadge: "⚠️ 外敵への警戒開始",
    category: "action",
  },
  {
    id: "rule-03-enemy-flee",
    name: "敵がいる ＋ 逃げろ",
    sequence: ["word-enemy", "word-flee"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは周囲の動く大きな生き物から逃げ始めた",
    behaviorText: "クジラは周囲の動く大きな生き物から逃げ始めた",
    directionBadge: "💨 外敵から退避",
    category: "action",
  },
  {
    id: "rule-04-enemy-attack",
    name: "敵がいる ＋ 攻撃せよ",
    sequence: ["word-enemy", "word-attack"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは周囲の動く大きな生き物を攻撃し始めた",
    behaviorText: "クジラは周囲の動く大きな生き物を攻撃し始めた",
    directionBadge: "⚔️ 外敵を攻撃開始",
    category: "action",
  },
  {
    id: "rule-05-volcano-search",
    name: "海の下の火山 ＋ 探せ",
    sequence: ["word-subsea-volcano", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは海底火山を探し始めた",
    behaviorText: "クジラは海底火山を探し始めた",
    directionBadge: "🌋 海底火山を索敵",
    category: "action",
  },
  {
    id: "rule-06-volcano-flee",
    name: "海の下の火山 ＋ 逃げろ",
    sequence: ["word-subsea-volcano", "word-flee"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは海底火山から逃げ始めた",
    behaviorText: "クジラは海底火山から逃げ始めた",
    directionBadge: "💨 海底火山から退避",
    category: "action",
  },
  {
    id: "rule-07-normal-prey-gather",
    name: "普通の餌 ＋ 集まれ",
    sequence: ["word-normal-prey", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラはイカなどの餌に集まり始めた",
    behaviorText: "クジラはイカなどの餌に集まり始めた",
    directionBadge: "🦑 普通の餌に集合",
    category: "action",
  },
  {
    id: "rule-08-giant-prey-gather",
    name: "大きい・たくさんの餌 ＋ 集まれ",
    sequence: ["word-giant-prey", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラが大量の餌に集まり始めた",
    behaviorText: "クジラが大量の餌に集まり始めた",
    directionBadge: "🦑 大量の餌に集合",
    category: "action",
  },
  {
    id: "rule-09-whale-child-feed",
    name: "我ら・自分（クジラ） ＋ （子ども）餌をくれ",
    sequence: ["word-whale", "word-child-feed"],
    responseSoundType: "yes_ack",
    behaviorTitle: "親クジラが子クジラに母乳を与え始めた",
    behaviorText: "親クジラが子クジラに母乳を与え始めた",
    directionBadge: "🐋 子クジラへ授乳",
    category: "action",
  },
  {
    id: "rule-10-child-here-gather",
    name: "（子ども）自分の場所はここだ ＋ 集まれ",
    sequence: ["word-child-here", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "親クジラが子クジラを探し始め、側に寄り添った",
    behaviorText: "親クジラが子クジラを探し始め、側に寄り添った",
    directionBadge: "🐋 子クジラに寄り添う",
    category: "action",
  },
  {
    id: "rule-11-child-here-feed",
    name: "（子ども）自分の場所はここだ ＋ （子ども）餌をくれ",
    sequence: ["word-child-here", "word-child-feed"],
    responseSoundType: "yes_ack",
    behaviorTitle: "親クジラが子クジラを探し始め、母乳を与え始めた",
    behaviorText: "親クジラが子クジラを探し始め、母乳を与え始めた",
    directionBadge: "🐋 子クジラ発見・授乳",
    category: "action",
  },
  {
    id: "rule-12-calf-gather",
    name: "クジラの子ども ＋ 集まれ",
    sequence: ["word-calf", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "子クジラが集まり始めた",
    behaviorText: "子クジラが集まり始めた",
    directionBadge: "🐋 子クジラが集合",
    category: "action",
  },
  {
    id: "rule-13-calf-search",
    name: "クジラの子ども ＋ 探せ",
    sequence: ["word-calf", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラが子クジラを探し始めた",
    behaviorText: "クジラが子クジラを探し始めた",
    directionBadge: "🐋 子クジラを捜索",
    category: "action",
  },
  {
    id: "rule-14-greet-you",
    name: "挨拶／こんにちは ＋ あなたたち・あなた",
    sequence: ["word-greet", "word-you"],
    responseSoundType: "greet_you_echo",
    behaviorTitle: "同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた",
    behaviorText: "同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた",
    directionBadge: "📡 コーダ応答受信",
    category: "ritual",
  },
  {
    id: "rule-15-east-gather",
    name: "東 ＋ 集まれ",
    sequence: ["word-go-east", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して東に集まり始めた",
    behaviorText: "付近のクジラが発声地点に対して東に集まり始めた",
    directionBadge: "➡️ 東に集まり始めた",
    category: "movement",
  },
  {
    id: "rule-16-west-gather",
    name: "西 ＋ 集まれ",
    sequence: ["word-go-west", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して西に集まり始めた",
    behaviorText: "付近のクジラが発声地点に対して西に集まり始めた",
    directionBadge: "⬅️ 西に集まり始めた",
    category: "movement",
  },
  {
    id: "rule-18-north-gather",
    name: "北 ＋ 集まれ",
    sequence: ["word-go-north", "word-gather"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して北に集まり始めた",
    behaviorText: "付近のクジラが発声地点に対して北に集まり始めた",
    directionBadge: "⬆️ 北に集まり始めた",
    category: "movement",
  },
  {
    id: "rule-19-east-search",
    name: "東 ＋ 探せ",
    sequence: ["word-go-east", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して東を探し始めた",
    behaviorText: "付近のクジラが発声地点に対して東を探し始めた",
    directionBadge: "➡️ 東を探し始めた",
    category: "movement",
  },
  {
    id: "rule-20-west-search",
    name: "西 ＋ 探せ",
    sequence: ["word-go-west", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して西を探し始めた",
    behaviorText: "付近のクジラが発声地点に対して西を探し始めた",
    directionBadge: "⬅️ 西を探し始めた",
    category: "movement",
  },
  {
    id: "rule-22-north-search",
    name: "北 ＋ 探せ",
    sequence: ["word-go-north", "word-search"],
    responseSoundType: "yes_ack",
    behaviorTitle: "付近のクジラが発声地点に対して北を探し始めた",
    behaviorText: "付近のクジラが発声地点に対して北を探し始めた",
    directionBadge: "⬆️ 北を探し始めた",
    category: "movement",
  },
  {
    id: "rule-23-human-whale-promise",
    name: "人間とクジラ ＋ 約束",
    sequence: ["word-human-whale", "word-promise"],
    responseSoundType: "greet_human_echo",
    behaviorTitle: "ズジーズ・ズ/カッカッというコーダが返ってきた",
    behaviorText: "ズジーズ・ズ/カッカッというコーダが返ってきた",
    directionBadge: "📡 コーダ応答受信",
    category: "ritual",
  },
  {
    id: "rule-24-giant-prey-attack",
    name: "大きい・たくさんの餌 ＋ 攻撃せよ",
    sequence: ["word-giant-prey", "word-attack"],
    responseSoundType: "yes_ack",
    behaviorTitle: "クジラは巨大な獲物・たくさんの餌への一斉攻撃を開始した",
    behaviorText: "クジラは巨大な獲物・たくさんの餌への一斉攻撃を開始した",
    directionBadge: "⚔️ 巨大獲物へ攻撃開始",
    category: "action",
  },
];

// ==========================================
// 朝倉教授が最初に示した「最初から日本語が確定している2つの音」
// ==========================================
export const LOCKED_INITIAL_MEANINGS: Record<string, string> = {
  "word-subsea-volcano": "海の下の火山",
  "word-alert": "周囲を警戒せよ",
};

// プレイヤーが日本語対応画面で選択できる日本語の候補リスト（全24候補：「南」を含む）
export const JAPANESE_MEANING_CANDIDATES: {
  label: string;
  subHint: string;
  isLockedInitial?: boolean;
}[] = [
  { label: "集まれ", subHint: "仲間を集める号令" },
  {
    label: "周囲を警戒せよ",
    subHint: "朝倉教授の記録により最初から確定",
    isLockedInitial: true,
  },
  { label: "敵がいる", subHint: "外敵・危険生物の存在" },
  { label: "逃げろ", subHint: "退避・逃走の指示" },
  { label: "（子ども）餌をくれ", subHint: "子クジラからの授乳要求" },
  {
    label: "（子ども）自分の場所はここだ",
    subHint: "子クジラが自分の居場所を知らせる音",
  },
  {
    label: "（大人）自分の場所はここだ",
    subHint: "大人のクジラが自分の居場所を知らせる音",
  },
  { label: "人間", subHint: "人を表す概念" },
  { label: "我ら・自分（クジラ）", subHint: "クジラ自身・同胞を表す概念" },
  { label: "あなたたち・あなた", subHint: "呼びかけの対象" },
  { label: "約束", subHint: "交わされた盟約・契り" },
  { label: "東", subHint: "方角（東）" },
  { label: "西", subHint: "方角（西）" },
  { label: "南", subHint: "方角（南）" },
  { label: "北", subHint: "方角（北）" },
  { label: "挨拶／こんにちは", subHint: "出会ったときの挨拶" },
  {
    label: "海の下の火山",
    subHint: "朝倉教授の記録により最初から確定",
    isLockedInitial: true,
  },
  { label: "クジラの子ども", subHint: "子クジラを表す概念" },
  { label: "大きい・たくさんの餌", subHint: "大量の餌・巨大な獲物" },
  { label: "普通の餌", subHint: "通常のイカなどの餌" },
  { label: "攻撃せよ", subHint: "対象への攻撃指示" },
  { label: "探せ", subHint: "索敵・捜索の指示" },
  { label: "了解した", subHint: "単独1語で使われる肯定・了解の返答" },
  { label: "人間とクジラ", subHint: "人とクジラの双方を表す複合概念" },
];

// ==========================================
// 時間軸波形描画用の各クリック音パルス定義（全24語：横軸＝時間ms、縦軸＝周波数Hz・振幅）
// ==========================================
export interface TimelineWaveformSegment {
  wordId: string;
  buttonCode: string;
  assignedLabel: string;
  startOffsetMs: number;
  durationMs: number;
  pulses: AcousticPulsePoint[];
}

export interface RecordedWaveformTrace {
  title: string;
  wordIds: string[];
  totalDurationMs: number;
  segments: TimelineWaveformSegment[];
  recordedAt: string;
}

const STORAGE_KEY_PLAYER_LABELS = "mm_workbench_player_word_labels_v2";

interface AttemptLog {
  id: string;
  timestamp: string;
  sequenceIds: string[];
  matchedRuleId: string | null;
  matchedRuleIds?: string[];
  title: string;
  text: string;
  badge: string;
  status: "success" | "partial" | "fail";
}

interface WhaleSonarMobileAppProps {
  words: readonly Pick<CrypticWord, "id" | "symbol" | "meaning" | "soundPattern">[];
  grammar?: CrypticGrammar;
  standalone?: boolean;
}

export const WhaleSonarMobileApp: React.FC<WhaleSonarMobileAppProps> = ({
  words,
  standalone = false,
}) => {
  const rules = DEFAULT_BEHAVIOR_RULES;
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState<AttemptLog | null>(null);
  const [attemptLogs, setAttemptLogs] = useState<AttemptLog[]>([]);

  // ==========================================
  // プレイヤーによる「音への日本語あてはめ」状態管理
  // 初期状態では「海の下の火山（ゴゴゴゴ…）」と「周囲を警戒せよ（ドォン…ドォン…）」の2語のみ確定
  // ==========================================
  const [playerAssignedLabels, setPlayerAssignedLabels] = useState<
    Record<string, string>
  >({
    ...LOCKED_INITIAL_MEANINGS,
  });

  // 日本語対応画面（別画面）への遷移ステート
  // null のときはメインのクリック音ボタン画面、wordId が入っているときはその音の「日本語対応画面」を表示
  const [assigningTargetWordId, setAssigningTargetWordId] = useState<
    string | null
  >(null);

  // 狂気の深淵モード（画面全体の枠が赤くなり、日本語を全てあてはめた状態）
  const [isAbyssMode, setIsAbyssMode] = useState(false);
  // 3回のブラームホーンに合わせて画面を激しく揺らす演出ステート
  const [isAbyssShaking, setIsAbyssShaking] = useState(false);
  // 「1つ戻す」「クリア」ボタンを押した瞬間の発光ステート
  const [flashingActionBtn, setFlashingActionBtn] = useState<
    "backspace" | "clear" | null
  >(null);
  const flashTimerRef = useRef<number | null>(null);
  const iosHapticLabelRef = useRef<HTMLLabelElement | null>(null);
  const abyssShakeTimersRef = useRef<number[]>([]);

  // ==========================================
  // 時間変化で形が残る波形データ（最新再生された音のタイムライン記録）
  // ==========================================
  const [waveformTrace, setWaveformTrace] =
    useState<RecordedWaveformTrace | null>(null);
  const [playbackProgressMs, setPlaybackProgressMs] = useState<number | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const assignCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const playbackControllerRef = useRef<AbortController | null>(null);
  const playbackBusyRef = useRef(false);
  const waveformSequenceIndicesRef = useRef<number[]>([]);
  const mountedRef = useRef(true);
  const [playbackError, setPlaybackError] = useState("");
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      playbackControllerRef.current?.abort();
      if (progressTimerRef.current !== null) cancelAnimationFrame(progressTimerRef.current);
      if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
      abyssShakeTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // クリック音ボタンの表示順（確定済みの2語を「音#01: 海の下の火山」「音#02: 周囲を警戒せよ」の順で先頭に配置し、残りを番号順に配置）
  const safeWords = React.useMemo(
    () =>
      (Array.isArray(words) ? words : [])
        .filter((w) => w.id !== "word-go-south")
        .map((w) =>
          w.id === "word-human-whale"
            ? {
                ...w,
                soundPattern: "低音長打＋均等2連打（ド・ドーッカッカッ）",
              }
            : w
        ),
    [words]
  );
  const orderedWords = React.useMemo(() => {
    const lockedOrder = ["word-subsea-volcano", "word-alert"];
    const locked = lockedOrder
      .map((id) => safeWords.find((w) => w.id === id))
      .filter((w): w is CrypticWord => Boolean(w));
    const unlocked = safeWords.filter((w) => !LOCKED_INITIAL_MEANINGS[w.id]);
    return [...locked, ...unlocked];
  }, [safeWords]);

  // 各wordIdに対するボタン番号（例: "音 #01", "音 #02"...）と音響擬音ラベル（Hz表記を除去）を取得
  const getWordButtonMeta = useCallback(
    (wordId: string) => {
      const idx = orderedWords.findIndex((w) => w.id === wordId);
      const numStr = idx >= 0 ? String(idx + 1).padStart(2, "0") : "00";
      const wordObj = safeWords.find((w) => w.id === wordId);
      const rawOnomatopoeia =
        wordObj?.soundPattern.match(/（(.+?)）/)?.[1] ||
        wordObj?.soundPattern ||
        "クリック音";
      // 「ツ・ピィッ！ / 1,800Hz➔3,200Hz」などのヘルツ表示を除去して純粋な音表現のみにする
      const onomatopoeia = rawOnomatopoeia.split("/")[0].trim();
      const isLocked = Boolean(LOCKED_INITIAL_MEANINGS[wordId]);
      const assignedJapanese =
        LOCKED_INITIAL_MEANINGS[wordId] || playerAssignedLabels[wordId] || "";

      return {
        code: `音 #${numStr}`,
        onomatopoeia,
        symbol: wordObj?.symbol || "●●",
        isLocked,
        assignedJapanese,
        trueMeaning: wordObj ? wordObj.meaning : wordId,
      };
    },
    [orderedWords, safeWords, playerAssignedLabels]
  );

  // ローカルストレージからプレイヤーの日本語あてはめ状態を復元
  useEffect(() => {
    try {
      const savedLabels = localStorage.getItem(STORAGE_KEY_PLAYER_LABELS);
      if (savedLabels) {
        const parsedLabels = JSON.parse(savedLabels);
        if (parsedLabels && typeof parsedLabels === "object") {
          setPlayerAssignedLabels({
            ...parsedLabels,
            ...LOCKED_INITIAL_MEANINGS, // 確定2語は常に保証
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSavePlayerLabels = (nextLabels: Record<string, string>) => {
    const merged = {
      ...nextLabels,
      ...LOCKED_INITIAL_MEANINGS,
    };
    setPlayerAssignedLabels(merged);
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER_LABELS, JSON.stringify(merged));
    } catch {
      // ignore
    }
  };

  const handleResetPlayerLabelsToInitial = () => {
    const resetState = { ...LOCKED_INITIAL_MEANINGS };
    setPlayerAssignedLabels(resetState);
    setIsAbyssMode(false);
    setIsAbyssShaking(false);
    abyssShakeTimersRef.current.forEach((id) => window.clearTimeout(id));
    abyssShakeTimersRef.current = [];
    try {
      localStorage.setItem(
        STORAGE_KEY_PLAYER_LABELS,
        JSON.stringify(resetState)
      );
    } catch {
      // ignore
    }
  };

  const handleFillAllCorrectLabelsForPreview = () => {
    const allCorrect: Record<string, string> = {};
    safeWords.forEach((w) => {
      allCorrect[w.id] = w.meaning;
    });
    handleSavePlayerLabels(allCorrect);
  };

  // 「狂気の深淵を覗き込み、クジラの言語をより理解する」ボタンを押した時の処理
  const handleEnterAbyssMode = () => {
    setIsAbyssMode(true);
    handleFillAllCorrectLabelsForPreview();
    audioEngine?.playAbyssBraamTriple();

    // 1. iPhone（iOS 17.4+ Safari）向け：Taptic Engine 触覚振動を起動
    try {
      iosHapticLabelRef.current?.click();
    } catch {
      // ignore
    }

    // 2. Android等（Web Vibration API対応端末）向け：3回のブラームホーンに合わせて3回振動
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([1600, 600, 1600, 600, 1700]);
      }
    } catch {
      // ignore
    }

    // 3. 3回のブラームホーン（0秒、2.2秒、4.4秒）に完全同期して画面全体を3回激しく揺らす演出
    abyssShakeTimersRef.current.forEach((id) => window.clearTimeout(id));
    abyssShakeTimersRef.current = [];

    const schedule = [
      { delay: 0, shaking: true, haptic: false },
      { delay: 1650, shaking: false, haptic: false },
      { delay: 2200, shaking: true, haptic: true },
      { delay: 3850, shaking: false, haptic: false },
      { delay: 4400, shaking: true, haptic: true },
      { delay: 6150, shaking: false, haptic: false },
    ];

    schedule.forEach((step) => {
      const tId = window.setTimeout(() => {
        setIsAbyssShaking(step.shaking);
        if (step.haptic) {
          try {
            iosHapticLabelRef.current?.click();
          } catch {
            // ignore
          }
        }
      }, step.delay);
      abyssShakeTimersRef.current.push(tId);
    });
  };

  // ==========================================
  // 単語配列から「時間軸に沿って形が残る波形データ（RecordedWaveformTrace）」を生成
  // ==========================================
  const buildWaveformTrace = useCallback(
    (targetWordIds: string[], customTitle?: string): RecordedWaveformTrace => {
      const timeline = buildAudioTimeline(targetWordIds);
      const segments: TimelineWaveformSegment[] = timeline.segments.map((segment) => {
        const meta = getWordButtonMeta(segment.wordId);
        return { ...segment, buttonCode: meta.code, assignedLabel: meta.assignedJapanese || "未解明（？？？）" };
      });
      const totalDurationMs = timeline.totalDurationMs;
      return {
        title:
          customTitle ||
          (targetWordIds.length === 1
            ? `${getWordButtonMeta(targetWordIds[0]).code}『${
                getWordButtonMeta(targetWordIds[0]).onomatopoeia
              }』の音響波形`
            : `${targetWordIds.length}語連結パターンの音響波形`),
        wordIds: [...targetWordIds],
        totalDurationMs,
        segments,
        recordedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    },
    [getWordButtonMeta]
  );

  // ==========================================
  // Canvasへの「時間変化で形が残る波形」描画関数
  // 3語以下は1段表示、4語以上になるときは上下2段に分けて見やすく表示
  // ==========================================
  const drawPersistentWaveform = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      trace: RecordedWaveformTrace | null,
      currentPlayheadMs: number | null
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      // 背景塗りつぶし
      ctx.fillStyle = "rgb(2, 6, 23)";
      ctx.fillRect(0, 0, W, H);

      const isTwoRows = Boolean(trace && trace.segments.length >= 4);
      const rowCount = isTwoRows ? 2 : 1;
      const rowHeight = H / rowCount;
      const leftPad = 36;
      const usableW = W - 44;

      // 空の状態（まだ音を鳴らしていないとき）
      if (!trace || trace.segments.length === 0) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(14, 116, 144, 0.22)";
        ctx.beginPath();
        for (let x = 36; x < W; x += 45) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H - 18);
        }
        for (let y = 18; y < H - 18; y += 22) {
          ctx.moveTo(32, y);
          ctx.lineTo(W, y);
        }
        ctx.stroke();

        const centerY = Math.floor((H - 18) * 0.56);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(32, centerY);
        ctx.lineTo(W, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.font = "9px monospace";
        ctx.fillText("高音", 4, 24);
        ctx.fillText("中音", 4, centerY + 3);
        ctx.fillText("低音", 4, H - 24);

        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "音を鳴らすと、ここに時間変化の波形・リズムが記録されて残ります",
          W / 2 + 10,
          centerY + 4
        );
        ctx.textAlign = "start";
        return;
      }

      // 4語以上の場合は前半（上段）と後半（下段）に分割
      const splitIdx = isTwoRows
        ? Math.ceil(trace.segments.length / 2)
        : trace.segments.length;

      const rowsData = isTwoRows
        ? [
            {
              rowIndex: 0,
              segments: trace.segments.slice(0, splitIdx),
              startIndexOffset: 0,
            },
            {
              rowIndex: 1,
              segments: trace.segments.slice(splitIdx),
              startIndexOffset: splitIdx,
            },
          ]
        : [
            {
              rowIndex: 0,
              segments: trace.segments,
              startIndexOffset: 0,
            },
          ];

      rowsData.forEach((row) => {
        if (row.segments.length === 0) return;

        const rowTop = row.rowIndex * rowHeight;
        const rowBottom = rowTop + rowHeight;
        const plotTop = rowTop + 16;
        const plotBottom = rowBottom - 16;
        const centerY = Math.floor(plotTop + (plotBottom - plotTop) * 0.54);

        // 上段と下段の境界線（2段表示時）
        if (row.rowIndex === 1) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, rowTop);
          ctx.lineTo(W, rowTop);
          ctx.stroke();
        }

        // 各段のグリッド線
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(14, 116, 144, 0.2)";
        ctx.beginPath();
        for (let x = leftPad; x < W; x += 45) {
          ctx.moveTo(x, rowTop + 2);
          ctx.lineTo(x, rowBottom - 14);
        }
        const yStep = Math.max(16, Math.floor((plotBottom - plotTop) / 3));
        for (let y = plotTop; y <= plotBottom; y += yStep) {
          ctx.moveTo(32, y);
          ctx.lineTo(W, y);
        }
        ctx.stroke();

        // 中心ベースライン（振幅ゼロ線）
        ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(32, centerY);
        ctx.lineTo(W, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 左端の周波数・高さ目安ラベル
        ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
        ctx.font = "9px monospace";
        ctx.fillText("高音", 4, plotTop + 6);
        ctx.fillText("中音", 4, centerY + 3);
        ctx.fillText("低音", 4, plotBottom - 2);

        // この段の時間範囲（rowStartMs 〜 rowEndMs）を算出
        const firstSeg = row.segments[0];
        const lastSeg = row.segments[row.segments.length - 1];
        const rowStartMs = Math.max(0, firstSeg.startOffsetMs - 70);
        const rowEndMs = Math.max(
          rowStartMs + 800,
          lastSeg.startOffsetMs + lastSeg.durationMs + 110
        );
        const rowDurationMs = Math.max(1, rowEndMs - rowStartMs);

        const timeToX = (absMs: number) =>
          leftPad +
          Math.min(1, Math.max(0, (absMs - rowStartMs) / rowDurationMs)) *
            usableW;

        const freqToY = (freq: number) => {
          const norm = Math.min(
            1,
            Math.max(0, (freq - 1050) / (3700 - 1050))
          );
          return plotBottom - norm * (plotBottom - plotTop);
        };

        // 下部の時間目盛り描画
        ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
        ctx.font = "8.5px monospace";
        const stepMs =
          rowDurationMs <= 1200 ? 200 : rowDurationMs <= 2600 ? 400 : 800;
        const firstTick = Math.ceil(rowStartMs / stepMs) * stepMs;
        for (let t = firstTick; t <= rowEndMs; t += stepMs) {
          const tx = timeToX(t);
          ctx.fillText(`${(t / 1000).toFixed(1)}s`, tx - 8, rowBottom - 4);
        }

        // 各単語セグメントの区切り線と波形を描画
        row.segments.forEach((seg, localIdx) => {
          const globalIdx = row.startIndexOffset + localIdx;
          const segStartX = timeToX(seg.startOffsetMs);

          // 複数語のときは単語境界線と番号ラベルを表示
          if (trace.segments.length > 1) {
            if (localIdx > 0) {
              ctx.strokeStyle = "rgba(99, 102, 241, 0.45)";
              ctx.setLineDash([2, 3]);
              ctx.beginPath();
              ctx.moveTo(segStartX - 6, rowTop + 4);
              ctx.lineTo(segStartX - 6, rowBottom - 14);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            ctx.fillStyle = "rgba(165, 243, 252, 0.9)";
            ctx.font = "bold 9px sans-serif";
            ctx.fillText(
              `${globalIdx + 1}.${seg.buttonCode}`,
              segStartX + 2,
              rowTop + 11
            );
          }

          // 1. 音程（周波数）の推移を示す破線ライン
          if (seg.pulses.length > 1) {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            seg.pulses.forEach((p, pIdx) => {
              const absMs = seg.startOffsetMs + p.delayMs;
              const px = timeToX(absMs);
              const py = freqToY(p.freqHz);
              if (pIdx === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });
            ctx.stroke();
          }

          // 2. 各クリックパルスの時間減衰エンベロープ波形バーと音程ドットを描画
          seg.pulses.forEach((p) => {
            const absStartMs = seg.startOffsetMs + p.delayMs;
            const isReached =
              currentPlayheadMs === null || currentPlayheadMs >= absStartMs;

            const startX = timeToX(absStartMs);
            const endX = Math.max(
              startX + 6,
              timeToX(absStartMs + p.durationMs)
            );
            const pulseWidth = endX - startX;
            const pitchY = freqToY(p.freqHz);

            let mainColor = "#22d3ee";
            let glowColor = "rgba(34, 211, 238, 0.35)";
            if (p.freqHz <= 1400) {
              mainColor = "#f59e0b";
              glowColor = "rgba(245, 158, 11, 0.35)";
            } else if (p.freqHz <= 2000) {
              mainColor = "#34d399";
              glowColor = "rgba(52, 211, 153, 0.35)";
            }

            ctx.globalAlpha = isReached ? 1.0 : 0.25;

            const maxAmpPx = ((plotBottom - plotTop) * 0.42) * p.amplitude;
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.moveTo(startX, centerY - maxAmpPx);
            ctx.lineTo(endX, centerY);
            ctx.lineTo(startX, centerY + maxAmpPx);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            const barStep = 2.5;
            for (let bx = startX; bx <= endX; bx += barStep) {
              const progress = (bx - startX) / Math.max(1, pulseWidth);
              const decay = Math.exp(-progress * 3.2);
              const osc = Math.cos(progress * Math.PI * 5);
              const h = Math.max(2, maxAmpPx * decay * Math.abs(osc));
              ctx.moveTo(bx, centerY - h);
              ctx.lineTo(bx, centerY + h);
            }
            ctx.stroke();

            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.arc(startX + 1.5, pitchY, 3.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
          });
        });

        // 再生中の現在時刻プレイヘッド（該当する段のみに赤いスイープ線を表示）
        if (
          currentPlayheadMs !== null &&
          currentPlayheadMs >= rowStartMs &&
          currentPlayheadMs <= rowEndMs
        ) {
          const playheadX = timeToX(currentPlayheadMs);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(playheadX, rowTop + 2);
          ctx.lineTo(playheadX, rowBottom - 14);
          ctx.stroke();
        }
      });
    },
    []
  );

  // 波形Traceまたは再生位置が変わるたびにCanvasを更新（再生後も消えずに残る！）
  useEffect(() => {
    drawPersistentWaveform(canvasRef.current, waveformTrace, playbackProgressMs);
    drawPersistentWaveform(
      assignCanvasRef.current,
      waveformTrace,
      playbackProgressMs
    );
  }, [waveformTrace, playbackProgressMs, drawPersistentWaveform, assigningTargetWordId]);

  const playTrace = async (trace: RecordedWaveformTrace, sequenceIndices: number[] = []) => {
    if (!audioEngine) throw new Error("音声を利用できない");
    const controller = new AbortController();
    playbackControllerRef.current = controller;
    const playback = await audioEngine.startTimeline(trace, controller.signal);
    if (!mountedRef.current) { playback.cancel(); return false; }
    setWaveformTrace(trace);
    waveformSequenceIndicesRef.current = sequenceIndices;
    const drawPlayhead = () => {
      const elapsed = playback.elapsedMs();
      setPlaybackProgressMs(Math.min(elapsed, trace.totalDurationMs));
      const index = trace.segments.findIndex((segment) => elapsed >= segment.startOffsetMs && elapsed < segment.startOffsetMs + segment.durationMs);
      setActivePlayingIndex(index < 0 ? null : sequenceIndices[index] ?? null);
      setActiveWordId(index < 0 ? null : trace.segments[index].wordId);
      progressTimerRef.current = requestAnimationFrame(drawPlayhead);
    };
    drawPlayhead();
    await playback.finished;
    if (progressTimerRef.current !== null) cancelAnimationFrame(progressTimerRef.current);
    progressTimerRef.current = null;
    if (controller.signal.aborted || !mountedRef.current) return false;
    setActivePlayingIndex(null);
    setActiveWordId(null);
    setPlaybackProgressMs(null);
    return true;
  };

  // 同時再生を防ぎ、失敗時も操作可能な状態に戻す。
  const withPlayback = async (action: () => Promise<void>) => {
    if (playbackBusyRef.current) return;
    playbackBusyRef.current = true;
    setIsPlaying(true);
    setPlaybackError("");
    try { await action(); }
    catch (error) {
      if (mountedRef.current && !(error instanceof DOMException && error.name === "AbortError")) {
        setPlaybackError("音声を再生できなかった。もう一度再生を押して確認。");
      }
    } finally {
      playbackBusyRef.current = false;
      if (mountedRef.current) {
        setIsPlaying(false);
        setActivePlayingIndex(null);
        setActiveWordId(null);
      }
    }
  };

  const handleAddWordAndPlay = (wordId: string) => withPlayback(async () => {
    setSelectedSequence((previous) => previous.length < 8 ? [...previous, wordId] : previous);
    await playTrace(buildWaveformTrace([wordId]), selectedSequence.length < 8 ? [selectedSequence.length] : []);
  });

  const handlePreviewWordOnly = (e: React.MouseEvent, wordId: string, sequenceIndex?: number) => {
    e.stopPropagation();
    return withPlayback(async () => {
      await playTrace(buildWaveformTrace([wordId]), sequenceIndex === undefined ? [] : [sequenceIndex]);
    });
  };

  // 「日本語をあてはめる」別画面を開く（開いた時にその音の波形も表示）
  const handleOpenAssignScreen = (e: React.MouseEvent, wordId: string) => {
    e.stopPropagation();
    if (LOCKED_INITIAL_MEANINGS[wordId] || playbackBusyRef.current) return;
    const trace = buildWaveformTrace([wordId]);
    setWaveformTrace(trace);
    waveformSequenceIndicesRef.current = [];
    setPlaybackProgressMs(null);
    setAssigningTargetWordId(wordId);
  };

  // 別画面で日本語を選択してあてはめる
  const handleSelectJapaneseForWord = (wordId: string, japaneseLabel: string) => {
    if (LOCKED_INITIAL_MEANINGS[wordId]) return;
    const next = { ...playerAssignedLabels };
    if (!japaneseLabel) {
      delete next[wordId];
    } else {
      next[wordId] = japaneseLabel;
    }
    handleSavePlayerLabels(next);
    setAssigningTargetWordId(null); // メイン画面に戻る
  };

  const triggerButtonFlash = (type: "backspace" | "clear") => {
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    setFlashingActionBtn(type);
    flashTimerRef.current = window.setTimeout(() => {
      setFlashingActionBtn(null);
      flashTimerRef.current = null;
    }, 200);
  };

  // 1文字削除・全クリア
  const handleBackspace = () => {
    if (isPlaying) return;
    triggerButtonFlash("backspace");
    setSelectedSequence((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isPlaying) return;
    triggerButtonFlash("clear");
    setSelectedSequence([]);
    setCurrentOutcome(null);
  };

  // パターン判定ロジック（最大8語まで入力可能、先頭から2語ずつ区切って順番に判定）
  const evaluatePatternOutcome = (seq: string[]): AttemptLog => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 1. 単音「カッ（了解した）」のみ発信された場合
    if (seq.length === 1 && seq[0] === "word-ack") {
      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: null,
        matchedRuleIds: [],
        title: "クジラから『カッ（了解した）』というクリック音が返ってきた",
        text: "",
        badge: "🐋 応答確認",
        status: "success",
      };
    }

    // 2. 1語のみ（了解以外）発信された場合
    if (seq.length === 1) {
      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: null,
        matchedRuleIds: [],
        title: "クジラは反応していない（1語単独の発信）",
        text: "クジラは了解である「カッ」以外は、2語の組み合わせ（厳密な順序）で話すようだ。",
        badge: "💡 2語ごとの組み合わせが必要",
        status: "partial",
      };
    }

    // 3. 先頭から2語ずつペア（[0,1], [2,3], [4,5], [6,7]）にして順番に判定
    const matchedRules: WhaleBehaviorRule[] = [];
    let hasReversedPair = false;

    for (let i = 0; i + 1 < seq.length; i += 2) {
      const w1 = seq[i];
      const w2 = seq[i + 1];

      const exactPairMatch = rules.find(
        (r) => r.sequence.length === 2 && r.sequence[0] === w1 && r.sequence[1] === w2
      );
      if (exactPairMatch) {
        matchedRules.push(exactPairMatch);
      } else {
        const revMatch = rules.find(
          (r) => r.sequence.length === 2 && r.sequence[0] === w2 && r.sequence[1] === w1
        );
        if (revMatch) {
          hasReversedPair = true;
        }
      }
    }

    // 2語ごとに判定して成立しているものが1つ以上あれば、成立した順番に行動を表示
    if (matchedRules.length > 0) {
      const orderedTitle =
        matchedRules.length === 1
          ? matchedRules[0].behaviorTitle
          : matchedRules.map((r) => `・${r.behaviorTitle}`).join("\n");

      const badgeLabel =
        matchedRules.length === 1
          ? matchedRules[0].directionBadge || "🐋 クジラのアクション"
          : `🐋 クジラのアクション（${matchedRules.length}件成立）`;

      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: matchedRules[0].id,
        matchedRuleIds: matchedRules.map((r) => r.id),
        title: orderedTitle,
        text: "",
        badge: badgeLabel,
        status: "success",
      };
    }

    // 4. 成立したペアが0件で、逆順になっているペアが含まれる場合
    if (hasReversedPair) {
      return {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        sequenceIds: [...seq],
        matchedRuleId: null,
        matchedRuleIds: [],
        title: "クジラは反応していない（語順が逆のようだ）",
        text: "2語の順序が厳密に決まっているようだ。前後の順番を入れ替えて試してみよう。",
        badge: "🔄 語順不一致",
        status: "partial",
      };
    }

    // 5. その他の未定義パターン
    return {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      sequenceIds: [...seq],
      matchedRuleId: null,
      matchedRuleIds: [],
      title: "クリック音は海へ反響したが、クジラは反応していない",
      text: "この組み合わせでは2語成語が成立しなかったようだ。",
      badge: "❌ パターン不一致",
      status: "fail",
    };
  };

  // パターンを海中に放流（再生＆時間軸波形の記録＆2語ごとの判定＆行動表示）
  const handleTransmitSequence = (overrideSeq?: string[]) => withPlayback(async () => {
    const rawSeq = overrideSeq || selectedSequence;
    const targetSeq = rawSeq.slice(0, 8);
    if (targetSeq.length === 0) return;

    if (overrideSeq) {
      setSelectedSequence(targetSeq);
    }

    setCurrentOutcome(null);

    if (!await playTrace(buildWaveformTrace(targetSeq), targetSeq.map((_, index) => index))) return;

    // 2語ごとの判定
    const outcome = evaluatePatternOutcome(targetSeq);
    const matchedList = (outcome.matchedRuleIds || [])
      .map((id) => rules.find((r) => r.id === id))
      .filter((r): r is WhaleBehaviorRule => Boolean(r));

    // 少し余韻を置いてから結果表示＆正解ファンファーレ（⑤太古の深海共鳴ファンファーレ）を再生
    await new Promise((r) => setTimeout(r, 300));

    if (!mountedRef.current) return;
    setCurrentOutcome(outcome);
    setAttemptLogs((prev) => [outcome, ...prev]);

    if (matchedList.length > 0) {
      await audioEngine?.playSuccessFanfare();
      for (const mRule of matchedList) {
        if (!mountedRef.current) return;
        if (mRule.responseSoundType === "greet_you_echo") {
          await new Promise((r) => setTimeout(r, 200));
          await audioEngine?.playWordSound("word-greet", 1.0);
          await new Promise((r) => setTimeout(r, 240));
          await audioEngine?.playWordSound("word-you", 1.0);
        } else if (mRule.responseSoundType === "greet_human_echo") {
          await new Promise((r) => setTimeout(r, 200));
          await audioEngine?.playWordSound("word-greet", 1.0);
          await new Promise((r) => setTimeout(r, 240));
          await audioEngine?.playWordSound("word-human", 1.0);
        }
      }
    } else if (targetSeq.length === 1 && targetSeq[0] === "word-ack") {
      await audioEngine?.playWordSound("word-ack", 1.0);
    }

  });

  // 保存した波形も同じ予定表・時計で再生する。
  const handleReplayLastWaveform = () => withPlayback(async () => {
    if (waveformTrace && waveformTrace.wordIds.length > 0) {
      const sequenceIndices = waveformSequenceIndicesRef.current.map((index, segmentIndex) =>
        selectedSequence[index] === waveformTrace.wordIds[segmentIndex] ? index : -1
      );
      await playTrace(waveformTrace, sequenceIndices);
    }
  });

  // 解明済み（あてはめ済み）の語数カウント
  const assignedCount = orderedWords.filter((w) =>
    Boolean(LOCKED_INITIAL_MEANINGS[w.id] || playerAssignedLabels[w.id])
  ).length;

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        standalone ? "min-h-screen w-full" : "h-full w-full overflow-hidden"
      }`}
    >
      {playbackError && <div role="alert" className="bg-red-950 p-3 text-sm text-red-100">{playbackError}</div>}
      {/* ワークベンチ内表示時のみ：上部ヘッダーバー */}
      {!standalone && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-6 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                プレイヤー操作用「クジラクリック音解読・行動観測」モバイルWebアプリ
                <span className="rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                  /sonar
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                再生した音の波形が時間軸で画面に残り、各クリック音ボタンに「日本語の意味」を別画面からあてはめて解読を進められます。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* プレイヤー提示用シート（A4・表裏2ページ）印刷／PDF保存ボタン */}
            <button
              type="button"
              onClick={() => printWhaleSonarGuideA4("both")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
              title="『マッコウクジラ音響言語解析システム』のプレイヤー提示用シート（表面1ページ＋裏面1ページ＝計2ページ）を印刷・PDF保存します"
            >
              <Printer className="h-3.5 w-3.5" />
              プレイヤー提示用シート（A4・表裏2ページ）を印刷 / PDF保存
            </button>

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

      {/* メインコンテンツ：📱 プレイヤー用モバイルアプリ画面 */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 md:p-6">
          {/* 深淵モード発動時の3連シェイク＆赤色脈動アニメーション定義 ＋ iOS Safari 触覚振動トリガー */}
          <style>{`
            @keyframes abyss-quake {
              0%   { transform: translate(0, 0) rotate(0deg); }
              10%  { transform: translate(-8px, -5px) rotate(-1.2deg); }
              20%  { transform: translate(8px, 4px) rotate(1.2deg); }
              30%  { transform: translate(-9px, 5px) rotate(-1.0deg); }
              40%  { transform: translate(7px, -6px) rotate(1.1deg); }
              50%  { transform: translate(-7px, 4px) rotate(-1.2deg); }
              60%  { transform: translate(8px, 3px) rotate(1.0deg); }
              70%  { transform: translate(-6px, -4px) rotate(-0.8deg); }
              80%  { transform: translate(6px, 4px) rotate(0.8deg); }
              90%  { transform: translate(-4px, -2px) rotate(-0.5deg); }
              100% { transform: translate(0, 0) rotate(0deg); }
            }
            .abyss-quake-active {
              animation: abyss-quake 0.22s infinite ease-in-out;
              box-shadow: 0 0 80px rgba(239, 68, 68, 0.95), inset 0 0 35px rgba(220, 38, 38, 0.55) !important;
            }
          `}</style>
          <label
            ref={iosHapticLabelRef}
            aria-hidden="true"
            className="sr-only pointer-events-none opacity-0 fixed -top-10 -left-10"
          >
            <input
              type="checkbox"
              {...({ switch: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </label>

          <div className="mx-auto flex max-w-6xl flex-col lg:flex-row items-start justify-center gap-6">
            {/* 左（メイン）：スマホ実機サイズの音響解読＆行動観測アプリ */}
            <div
              className={`w-full max-w-md mx-auto rounded-[28px] bg-slate-950 overflow-hidden flex flex-col transition-all duration-500 ${
                isAbyssMode
                  ? "border-4 border-red-600 ring-4 ring-red-500/40 shadow-[0_0_50px_rgba(220,38,38,0.65)]"
                  : "border-2 border-cyan-500/30 shadow-2xl shadow-cyan-950/50"
              } ${isAbyssShaking ? "abyss-quake-active" : ""}`}
            >
              {/* スマホアプリ上部ステータス＆ヘッダー */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between transition-colors duration-500 ${
                  isAbyssMode
                    ? "bg-gradient-to-r from-red-950 via-rose-950/80 to-red-950 border-red-500/50"
                    : "bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-cyan-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isAbyssMode ? "bg-red-500" : "bg-cyan-400"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isAbyssMode ? "bg-red-500" : "bg-cyan-400"
                      }`}
                    />
                  </span>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                      <Waves
                        className={`h-3.5 w-3.5 ${
                          isAbyssMode ? "text-red-400" : "text-cyan-400"
                        }`}
                      />
                      クジラ音響解読・発信端末
                    </div>
                    <div
                      className={`text-[10px] font-mono ${
                        isAbyssMode ? "text-red-300" : "text-cyan-400/80"
                      }`}
                    >
                      解読状況: {assignedCount} / {orderedWords.length} 語あてはめ済
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* 深海アンビエント音 */}
                  <button
                    onClick={() => {
                      const next = audioEngine?.toggleAmbient();
                      setIsAmbientOn(!!next);
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold border transition ${
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
                    深海音
                  </button>
                </div>
              </div>

              {/* ==========================================
                 画面分岐：
                 A. 「日本語をあてはめる」別画面（assigningTargetWordId が選択されている時）
                 B. メインのクリック音ボタン＆波形＆行動観測画面
                 ========================================== */}
              {assigningTargetWordId ? (
                /* ------------------------------------------
                   【別画面】クリック音に日本語をあてはめる選択画面
                   ------------------------------------------ */
                (() => {
                  const targetMeta = getWordButtonMeta(assigningTargetWordId);
                  return (
                    <div className="p-4 bg-slate-950 flex-1 flex flex-col space-y-4">
                      {/* 戻るナビゲーション */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <button
                          onClick={() => setAssigningTargetWordId(null)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
                          クリック音一覧に戻る
                        </button>
                        <span className="text-[11px] font-bold text-amber-300">
                          日本語対応画面
                        </span>
                      </div>

                      {/* 対象のクリック音情報 ＆ その場での再生・波形確認 */}
                      <div className="rounded-xl border border-cyan-500/40 bg-slate-900/90 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-cyan-950 border border-cyan-600/60 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                                {targetMeta.code}
                              </span>
                              <span className="text-sm font-extrabold text-amber-300">
                                『{targetMeta.onomatopoeia}』
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-300">
                              現在のあてはめ：
                              {targetMeta.assignedJapanese ? (
                                <span className="ml-1 font-bold text-emerald-300">
                                  【{targetMeta.assignedJapanese}】
                                </span>
                              ) : (
                                <span className="ml-1 text-slate-500">
                                  未解明（？？？）
                                </span>
                              )}
                            </p>
                          </div>

                          <button
                            onClick={(e) =>
                              handlePreviewWordOnly(e, assigningTargetWordId)
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
                          >
                            <Volume2 className="h-4 w-4" />
                            音を聴く
                          </button>
                        </div>

                        {/* 別画面内でも残っている時間変化波形を確認可能 */}
                        <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                          <canvas
                            ref={assignCanvasRef}
                            width={380}
                            height={96}
                            className="w-full h-24"
                          />
                        </div>
                      </div>

                      {/* 日本語候補リスト */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-amber-400" />
                            このクリック音にあてはめる日本語を選択してください
                          </h3>
                          {targetMeta.assignedJapanese && (
                            <button
                              onClick={() =>
                                handleSelectJapaneseForWord(
                                  assigningTargetWordId,
                                  ""
                                )
                              }
                              className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                            >
                              未解明（？？？）に戻す
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-0.5">
                          {JAPANESE_MEANING_CANDIDATES.map((cand) => {
                            const isSelectedHere =
                              targetMeta.assignedJapanese === cand.label;

                            // 他のボタンにすでにあてはめられているかチェック
                            const assignedOtherWordId = Object.keys(
                              playerAssignedLabels
                            ).find(
                              (wId) =>
                                wId !== assigningTargetWordId &&
                                playerAssignedLabels[wId] === cand.label
                            );
                            const otherMeta = assignedOtherWordId
                              ? getWordButtonMeta(assignedOtherWordId)
                              : null;

                            return (
                              <button
                                key={cand.label}
                                disabled={cand.isLockedInitial}
                                onClick={() =>
                                  handleSelectJapaneseForWord(
                                    assigningTargetWordId,
                                    cand.label
                                  )
                                }
                                className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between ${
                                  cand.isLockedInitial
                                    ? "border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed"
                                    : isSelectedHere
                                    ? "border-emerald-400 bg-emerald-950/70 text-white ring-1 ring-emerald-400"
                                    : "border-slate-800 bg-slate-900 hover:border-amber-400/60 hover:bg-slate-800/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-extrabold text-white">
                                    {cand.label}
                                  </span>
                                  {cand.isLockedInitial ? (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-amber-300">
                                      <Lock className="h-2.5 w-2.5" />
                                      確定済
                                    </span>
                                  ) : isSelectedHere ? (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                                      <Check className="h-2.5 w-2.5" />
                                      選択中
                                    </span>
                                  ) : otherMeta ? (
                                    <span className="rounded bg-indigo-950 border border-indigo-700/60 px-1.5 py-0.5 text-[9px] text-indigo-300">
                                      {otherMeta.code}で使用中
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-1 text-[10px] text-slate-400 leading-tight">
                                  {cand.subHint}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* ------------------------------------------
                   【メイン画面】波形モニター・クジラ行動表示・クリック音パッド
                   ------------------------------------------ */
                <>
                  {/* ① 時間変化で形が残る波形モニター ＆ クジラ行動テキスト表示スクリーン */}
                  <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 space-y-3">
                    {/* 時間軸波形レコーダー枠 */}
                    <div className="rounded-xl border border-cyan-500/30 bg-slate-950 overflow-hidden">
                      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-900/80">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
                          <Activity className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            {waveformTrace
                              ? waveformTrace.title
                              : "時間変化・音響波形ログ（再生後も形が残ります）"}
                          </span>
                        </div>
                        {waveformTrace && (
                          <button
                            onClick={handleReplayLastWaveform}
                            disabled={isPlaying}
                            className="flex items-center gap-1 rounded bg-cyan-950 border border-cyan-600/50 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-800 disabled:opacity-40 transition"
                            title="今画面に残っている波形の音をもう一度再生します"
                          >
                            <Play className="h-2.5 w-2.5" />
                            もう一度再生
                          </button>
                        )}
                      </div>

                      <canvas
                        ref={canvasRef}
                        data-playback-ms={playbackProgressMs ?? ""}
                        data-duration-ms={waveformTrace?.totalDurationMs ?? 0}
                        width={400}
                        height={
                          waveformTrace && waveformTrace.segments.length >= 4
                            ? 216
                            : 112
                        }
                        className={`w-full block transition-all duration-200 ${
                          waveformTrace && waveformTrace.segments.length >= 4
                            ? "h-52"
                            : "h-28"
                        }`}
                      />
                    </div>

                    {/* ★クジラの行動が文字で表示されるメインモニター枠★ */}
                    <div
                      className={`min-h-[104px] rounded-xl border p-3 transition-all duration-300 flex flex-col justify-center ${
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
                        <div className="text-center space-y-1 py-2">
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

                          <div
                            className={`text-sm font-extrabold tracking-wide leading-snug whitespace-pre-line ${
                              currentOutcome.status === "success"
                                ? "text-emerald-200"
                                : currentOutcome.status === "partial"
                                ? "text-amber-200"
                                : "text-rose-200"
                            }`}
                          >
                            {currentOutcome.title}
                          </div>

                          {currentOutcome.text && (
                            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                              {currentOutcome.text}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-1 py-1.5">
                          <div className="text-xs font-bold text-slate-400">
                            【クジラの行動観測モニター】
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            クリック音ボタンを組み合わせて「海中にクリック音を流す」を押すと、
                            <br />
                            ここにクジラの行動が文字で表示されます。
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
                          {selectedSequence.length} / 8語（2語ごと判定）
                        </span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleBackspace}
                          disabled={
                            (selectedSequence.length === 0 &&
                              flashingActionBtn !== "backspace") ||
                            isPlaying
                          }
                          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${
                            flashingActionBtn === "backspace"
                              ? "border-cyan-200 bg-cyan-400 text-slate-950 font-extrabold ring-2 ring-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors duration-150 disabled:opacity-40"
                          }`}
                        >
                          <Delete className="h-3 w-3" />
                          1つ戻す
                        </button>
                        <button
                          onClick={handleClear}
                          disabled={
                            (selectedSequence.length === 0 &&
                              flashingActionBtn !== "clear") ||
                            isPlaying
                          }
                          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${
                            flashingActionBtn === "clear"
                              ? "border-amber-200 bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.9)]"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors duration-150 disabled:opacity-40"
                          }`}
                        >
                          <RotateCcw className="h-3 w-3" />
                          クリア
                        </button>
                      </div>
                    </div>

                    {/* 選択された音のスロット表示（あてはめた日本語があればそれを表示） */}
                    <div className="min-h-[46px] rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex flex-wrap items-center gap-1.5">
                      {selectedSequence.length === 0 ? (
                        <span className="text-xs text-slate-500 px-1">
                          下のクリック音ボタンをタップしてパターンを作ってください
                        </span>
                      ) : (
                        selectedSequence.map((wId, index) => {
                          const meta = getWordButtonMeta(wId);
                          const isCurrentStep = activePlayingIndex === index;
                          return (
                            <React.Fragment key={`${wId}-${index}`}>
                              <button
                                onClick={(e) => handlePreviewWordOnly(e, wId, index)}
                                className={`rounded-lg px-2 py-1 text-xs font-bold transition flex items-center gap-1 ${
                                  isCurrentStep
                                    ? "bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 scale-105 shadow-lg"
                                    : "bg-indigo-950/90 border border-indigo-500/50 text-indigo-100 hover:bg-indigo-900"
                                }`}
                                title="タップしてこの音と波形を確認"
                              >
                                <span className="text-[10px] font-mono text-cyan-300">
                                  {index + 1}.
                                </span>
                                <span>
                                  {meta.assignedJapanese
                                    ? `${meta.assignedJapanese}`
                                    : `${meta.code}（${meta.onomatopoeia}）`}
                                </span>
                              </button>
                              {index < selectedSequence.length - 1 && (
                                <span
                                  className={`text-xs font-bold ${
                                    index % 2 === 1
                                      ? "text-cyan-400 px-1"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {index % 2 === 1 ? "｜" : "＋"}
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
                        ? "クリック音を海中に放流中..."
                        : "海中にクリック音を流す（発信）"}
                    </button>
                  </div>

                  {/* ③ クリック音ボタン一覧（日本語あてはめボタン付き） */}
                  <div className="p-3.5 space-y-2.5 bg-slate-950">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">
                        クリック音ボタン（タップで音を鳴らして追加）
                      </span>
                      <span className="text-[10px] text-amber-300">
                        「日本語をあてはめる」で意味を記録できます。
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {orderedWords.map((w) => {
                        const isActive = activeWordId === w.id;
                        const meta = getWordButtonMeta(w.id);

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
                            className={`group relative rounded-xl border p-2.5 text-left transition cursor-pointer select-none flex flex-col justify-between ${
                              isActive
                                ? "border-cyan-400 bg-cyan-950/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400"
                                : meta.isLocked
                                ? "border-amber-500/40 bg-slate-900/95 hover:border-amber-400"
                                : meta.assignedJapanese
                                ? "border-emerald-500/40 bg-slate-900/95 hover:border-emerald-400"
                                : "border-slate-800 bg-slate-900/90 hover:border-cyan-500/50 hover:bg-slate-900"
                            }`}
                          >
                            {/* 上段：音響番号 ＋ 試聴アイコン */}
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="rounded bg-slate-950 border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                                  {meta.code}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handlePreviewWordOnly(e, w.id)
                                  }
                                  className="rounded-lg bg-slate-800/90 px-1.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-600 hover:text-white transition flex items-center gap-1"
                                  title="パターンに追加せず、クリック音と波形だけを確認します"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  試聴
                                </button>
                              </div>

                              {/* 中段：クリック音の響き */}
                              <div className="mt-1.5 text-xs font-extrabold text-amber-200">
                                『{meta.onomatopoeia}』
                              </div>

                              {/* あてはめられた日本語の表示エリア */}
                              <div className="mt-1">
                                {meta.isLocked ? (
                                  <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-extrabold text-amber-200">
                                    <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                                    {meta.assignedJapanese}
                                  </div>
                                ) : meta.assignedJapanese ? (
                                  <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-extrabold text-emerald-200">
                                    <Tag className="h-3 w-3 text-emerald-400 shrink-0" />
                                    {meta.assignedJapanese}
                                  </div>
                                ) : (
                                  <div className="text-[11px] font-bold text-slate-500">
                                    【未解明：？？？】
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 下段：「日本語をあてはめる」別画面遷移ボタン（確定2語は確定済表示） */}
                            <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                              {meta.isLocked ? (
                                <div className="text-[10px] font-semibold text-amber-400/90 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  朝倉教授記録により確定
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleOpenAssignScreen(e, w.id)
                                  }
                                  className={`w-full rounded-lg py-1 px-2 text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                                    meta.assignedJapanese
                                      ? "bg-slate-800 text-emerald-300 hover:bg-slate-700 border border-emerald-500/30"
                                      : "bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600 hover:text-white border border-indigo-500/40"
                                  }`}
                                >
                                  <Tag className="h-3 w-3" />
                                  {meta.assignedJapanese
                                    ? "日本語を変更する"
                                    : "日本語をあてはめる"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* アプリ画面の一番下：狂気の深淵ボタン */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleEnterAbyssMode}
                        className={`w-full rounded-xl border px-3 py-3 text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                          isAbyssMode
                            ? "border-red-500 bg-gradient-to-r from-red-950 via-red-900/90 to-red-950 text-red-100 shadow-lg shadow-red-950/90 ring-1 ring-red-400/60"
                            : "border-red-900/60 bg-slate-950/90 text-red-400/90 hover:border-red-500 hover:bg-red-950/60 hover:text-red-200 shadow-inner"
                        }`}
                      >
                        <Eye className="h-4 w-4 shrink-0 text-red-400" />
                        <span>狂気の深淵を覗き込み、クジラの言語をより理解する</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 右側パネル（作者・テスト用）：プレイヤー専用画面（standalone）では非表示 */}
            {!standalone && (
              <div className="w-full lg:w-96 space-y-4">
                {/* スマホ読み取り用QRコード（プレイヤー提示用） */}
                <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-white">
                        『マッコウクジラ音響言語解析システム』QR
                      </h3>
                    </div>
                    <span className="rounded bg-cyan-950 border border-cyan-700/60 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      PW: whale-study
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-3">
                    <img
                      src={scenarioAssetUrl("releases/images/sonar_qr.png")}
                      alt="マッコウクジラ音響言語解析システム QRコード"
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-2">
                    <div>
                      スマートフォンのカメラでQRコードを読み取り、アクセスパスワード <strong className="font-mono text-cyan-300">whale-study</strong> を入力するとプレイヤー画面が開きます。
                    </div>
                    <button
                      type="button"
                      onClick={() => printWhaleSonarGuideA4("both")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
                    >
                      <Printer className="h-4 w-4 shrink-0" />
                      <span>プレイヤー提示用シート（A4・表裏2ページ）を印刷 / PDF保存</span>
                    </button>
                  </div>
                </div>

                {/* 日本語あてはめ管理（初期リセット／答え合わせプレビュー） */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white">
                        日本語あてはめ状態の管理（作者・テスト用）
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-300">
                      {assignedCount}/{orderedWords.length}語
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    初期状態では朝倉教授が示した<strong>『ゴゴゴゴ…＝海の下の火山』『ドォン…ドォン…＝周囲を警戒せよ』の2語のみ確定</strong>しており、残りの22語はプレイヤーが実験しながら別画面で日本語をあてはめます。
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleResetPlayerLabelsToInitial}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-[11px] font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      初期状態（2語のみ確定）に戻す
                    </button>
                    <button
                      onClick={handleFillAllCorrectLabelsForPreview}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-[11px] font-bold text-emerald-200 hover:bg-emerald-900/50 transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      正解の日本語をすべてあてはめる
                    </button>
                  </div>
                </div>

                {/* ワンタップで試せる代表パターン（2語成語） */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white">
                      ワンタップ動作テスト（代表的な2語成語パターン）
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    下のボタンを押すと、2語成語のクリック音パターンが再生されて時間変化の波形が画面に残り、クジラのアクションが文字で表示されます。
                  </p>

                  <div className="space-y-2">
                    {[
                      {
                        label: "①「海の下の火山」＋「周囲を警戒せよ」",
                        sub: "ゴゴゴゴ… ＋ ドォン…ドォン… ➔『クジラは海底火山を警戒し始めた』",
                        seq: ["word-subsea-volcano", "word-alert"],
                        color:
                          "border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200",
                      },
                      {
                        label: "②「大きい・たくさんの餌」＋「集まれ」",
                        sub: "チチチチチチッ！ ＋ カ・カ・カカッ！ ➔『クジラが大量の餌に集まり始めた』",
                        seq: ["word-giant-prey", "word-gather"],
                        color:
                          "border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-200",
                      },
                      {
                        label: "③「北」＋「集まれ」",
                        sub: "ピ・ピピッ ＋ カ・カ・カカッ！ ➔『付近のクジラが発声地点に対して北に集まり始めた』",
                        seq: ["word-go-north", "word-gather"],
                        color:
                          "border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200",
                      },
                      {
                        label: "④「挨拶／こんにちは」＋「あなたたち・あなた」",
                        sub: "ズジーズ・ズ ＋ ドド・ツツツ ➔『同じコーダ（ズジーズ・ズ/ドド・ツツツ）が帰ってきた』",
                        seq: ["word-greet", "word-you"],
                        color:
                          "border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200",
                      },
                      {
                        label: "⑤「人間とクジラ」＋「約束」",
                        sub: "ド・ドーッカッカッ ＋ チ・トン・チ ➔『ズジーズ・ズ/カッカッというコーダが返ってきた』",
                        seq: ["word-human-whale", "word-promise"],
                        color:
                          "border-pink-500/40 bg-pink-950/30 hover:bg-pink-900/50 text-pink-200",
                      },
                      {
                        label:
                          "⑥【4語連続】「北＋集まれ」｜「大きい・たくさんの餌＋攻撃せよ」",
                        sub: "2語ごとに順番に判定 ➔ 2つのクジラの行動が順番に表示されるテスト",
                        seq: [
                          "word-go-north",
                          "word-gather",
                          "word-giant-prey",
                          "word-attack",
                        ],
                        color:
                          "border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200",
                      },
                    ].map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAssigningTargetWordId(null);
                          handleTransmitSequence(preset.seq);
                        }}
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
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`font-bold text-[11px] whitespace-pre-line ${
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
                              const meta = getWordButtonMeta(id);
                              return (
                                <span
                                  key={`${log.id}-${idx}`}
                                  className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300"
                                >
                                  {meta.assignedJapanese
                                    ? `${meta.code}:${meta.assignedJapanese}`
                                    : `${meta.code}(${meta.onomatopoeia})`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};
