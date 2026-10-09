"use client";

import React, { useState } from "react";
import { Character } from "@/types/schema";
import { Users, Sparkles, BookOpen, Heart, ShieldAlert, Award } from "lucide-react";

interface HandoutEditorProps {
  characters: Character[];
  playerCount?: number;
  onUpdateCharacters: (chars: Character[]) => void;
  onSendAiPrompt?: (prompt: string) => void;
}

export const HandoutEditor: React.FC<HandoutEditorProps> = ({
  characters,
  playerCount = 6,
  onUpdateCharacters,
  onSendAiPrompt,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "pc-1");

  // 選択中IDが存在しない（5名モードでPC6が消えた場合など）に対応
  const currentSelectedCharId = characters.some((c) => c.id === selectedCharId)
    ? selectedCharId
    : characters[0]?.id || "pc-1";

  const selectedChar =
    characters.find((c) => c.id === currentSelectedCharId) || characters[0];

  const handleUpdateHandout = (field: string, value: any) => {
    const updated = characters.map((c) => {
      if (c.id === selectedCharId) {
        if (field.startsWith("internalDrama.")) {
          const dramaKey = field.split(".")[1] as "pride" | "guilt" | "loss";
          return {
            ...c,
            handout: {
              ...c.handout,
              internalDrama: {
                ...c.handout.internalDrama,
                [dramaKey]: value,
              },
            },
          };
        }
        return {
          ...c,
          handout: {
            ...c.handout,
            [field]: value,
          },
        };
      }
      return c;
    });
    onUpdateCharacters(updated);
  };

  const handleAiRefine = (instruction: string) => {
    if (onSendAiPrompt) {
      onSendAiPrompt(
        `【${selectedChar.name}のハンドアウト推敲依頼】\n以下の指示に従って、このキャラクターのハンドアウト本文と心理描写を推敲・リライトしてください：\n「${instruction}」\n\n現在の本文:\n${selectedChar.handout.handoutBody}`
      );
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white">
            ハンドアウト（HO）共創エディタ
          </h2>
          <p className="text-xs text-slate-400">
            キャラクターの内面ドラマ（誇り・後ろめたさ・喪失体験）とセリフ調をAIと共に練り上げます。
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左カラム：PC選択 */}
        <div className="col-span-3 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-y-auto space-y-2">
          {characters.map((c) => {
            const isSelected = c.id === currentSelectedCharId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCharId(c.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500/40"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{c.name}</span>
                  {c.id === "pc-4" && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        characters.length === 5
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {characters.length === 5 ? "✨ 統合版" : "単独版"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 truncate">{c.profession}</div>
              </button>
            );
          })}
        </div>

        {/* 右カラム：HO編集 ＆ 内面ドラマスロット */}
        <div className="col-span-9 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto space-y-4 text-xs">
          {/* PC4統合版の案内バナー */}
          {selectedChar.id === "pc-4" && characters.length === 5 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-2.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-200">
                <span className="font-bold">5人プレイ統合版ハンドアウト:</span> 科学観測の使命感に加え、島の社家としての古文書・祝詞の伝承と内面ドラマ（誇り・後ろめたさ・喪失体験）が統合されています。
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-sm text-white">{selectedChar.name}</h3>
              <p className="text-slate-400 text-xs">{selectedChar.profession}</p>
            </div>
          </div>

          {/* 表向きのプロフィール ＆ 秘匿目標 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 mb-1 block">
                表向きのプロフィール（全体公開）
              </label>
              <textarea
                value={selectedChar.handout.publicProfile}
                onChange={(e) => handleUpdateHandout("publicProfile", e.target.value)}
                rows={2}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-amber-400 mb-1 block">
                秘匿目標・個別の勝利条件
              </label>
              <textarea
                value={selectedChar.handout.secretObjective}
                onChange={(e) => handleUpdateHandout("secretObjective", e.target.value)}
                rows={2}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 内面ドラマスロット（誇り・後ろめたさ・喪失体験） */}
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2.5">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              キャラクター内面ドラマスロット (共感と動機の源泉)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 mb-1">
                  <Award className="h-3 w-3" /> 誇り・矜持 (Pride)
                </label>
                <textarea
                  value={selectedChar.handout.internalDrama.pride}
                  onChange={(e) => handleUpdateHandout("internalDrama.pride", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-1">
                  <ShieldAlert className="h-3 w-3" /> 後ろめたさ (Guilt)
                </label>
                <textarea
                  value={selectedChar.handout.internalDrama.guilt}
                  onChange={(e) => handleUpdateHandout("internalDrama.guilt", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 mb-1">
                  <Heart className="h-3 w-3" /> 喪失・後悔 (Loss)
                </label>
                <textarea
                  value={selectedChar.handout.internalDrama.loss}
                  onChange={(e) => handleUpdateHandout("internalDrama.loss", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* HO本文テキスト */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-indigo-300 block">
                ハンドアウト本文 (プレイヤーが手元で読むシナリオ本文)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAiRefine("プロの物書きとして、もっと感情が揺さぶられる心理描写を加えて")}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  ✨ 心理描写を強化
                </button>
                <button
                  onClick={() => handleAiRefine("このキャラクターの職業にふさわしいリアルな専門用語と口調に調整して")}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  ✨ 口調・専門性を調整
                </button>
              </div>
            </div>
            <textarea
              value={selectedChar.handout.handoutBody}
              onChange={(e) => handleUpdateHandout("handoutBody", e.target.value)}
              rows={8}
              className="w-full flex-1 rounded border border-slate-800 bg-slate-950 p-3 leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
