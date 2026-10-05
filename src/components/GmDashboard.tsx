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
} from "lucide-react";
import { audioEngine } from "@/utils/audioSynth";

interface GmDashboardProps {
  project: MMProject;
}

export const GmDashboard: React.FC<GmDashboardProps> = ({ project }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);

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
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-slate-300">【GMナレーション（導入）】:</span>
                    <p className="text-slate-400 mt-1 italic">
                      「小笠原南西沖にて民間船が全電源喪失。荒れ狂う海の中、あなたたち6名の合同救難オペレーションが開通します……」
                    </p>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-red-400">【NPC 船長（救助直後・錯乱）】:</span>
                    <p className="text-slate-400 mt-1">
                      「あ、あれはクジラなんかじゃない！海の下に……巨大な目玉と無数の触手があったんだ！船の計器を全部焼き切られちまった！」
                    </p>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-blue-400">【NPC ダイバー（不気味な冷静さ）】:</span>
                    <p className="text-slate-400 mt-1">
                      「船長は大袈裟ですね。ただの大型クジラですよ。……それより、この金属箱を本土行きの定期便に乗せていただけますか？」
                    </p>
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
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
            Day {currentDay} 配布・開示証拠チェック
          </h4>

          <div className="space-y-2.5">
            {project.evidences
              .filter((e) => e.foundPhase === currentDay)
              .map((ev) => {
                const owner = project.characters.find((c) => c.id === ev.ownerId);
                return (
                  <div
                    key={ev.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-300">{ev.title}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {owner ? owner.name.split(":")[0] : "全体"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{ev.description}</p>
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
    </div>
  );
};
