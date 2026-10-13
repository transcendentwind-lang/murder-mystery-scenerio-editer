"use client";

import React, { useState } from "react";
import { Character } from "@/types/schema";
import { Sparkles, Heart, Award, Printer, Layers, FileText, Plus, Trash2 } from "lucide-react";
import {
  printDocumentText,
  formatCharacterHandoutMarkdown,
  formatCharacterCardsMarkdown,
} from "@/utils/scriptGenerator";

interface HandoutEditorProps {
  characters: Character[];
  playerCount?: number;
  onUpdateCharacters: (chars: Character[]) => void;
  onSendAiPrompt?: (prompt: string) => void;
}

export const HandoutEditor: React.FC<HandoutEditorProps> = ({
  characters,
  onUpdateCharacters,
  onSendAiPrompt,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "pc-1");
  const [activeSubTab, setActiveSubTab] = useState<"handout_sheet" | "separate_cards">(
    "handout_sheet"
  );

  // 選択中IDが存在しない（5名モードでPC6が消えた場合など）に対応
  const currentSelectedCharId = characters.some((c) => c.id === selectedCharId)
    ? selectedCharId
    : characters[0]?.id || "pc-1";

  const selectedChar =
    characters.find((c) => c.id === currentSelectedCharId) || characters[0];

  const handleUpdateCharField = (updater: (c: Character) => Character) => {
    const updated = characters.map((c) => (c.id === selectedChar.id ? updater(c) : c));
    onUpdateCharacters(updated);
  };

  const handleUpdateHandout = (field: string, value: string) => {
    handleUpdateCharField((c) => {
      if (field.startsWith("internalDrama.")) {
        const dramaKey = field.split(".")[1] as "pride" | "loss";
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
    });
  };

  const handleAiRefine = (instruction: string) => {
    if (onSendAiPrompt) {
      onSendAiPrompt(
        `【${selectedChar.name}のハンドアウト推敲依頼】\n以下の指示に従って、このキャラクターの「あなたの記憶」と「自己紹介」を推敲・リライトしてください：\n「${instruction}」\n\n現在のあなたの記憶:\n${selectedChar.introduction}\n\n現在の自己紹介:\n${selectedChar.handout.handoutBody}`
      );
    }
  };

  const handlePrintSelectedChar = () => {
    if (!selectedChar) return;
    const md =
      `# 個人ハンドアウト：${selectedChar.name}\n\n` + formatCharacterHandoutMarkdown(selectedChar);
    printDocumentText(`${selectedChar.name}_個人ハンドアウト`, md);
  };

  const handlePrintAllChars = () => {
    let md = `# 個人ハンドアウト全集（${characters.length}名編成）\n\n`;
    characters.forEach((c) => {
      md += formatCharacterHandoutMarkdown(c);
    });
    printDocumentText(`個人ハンドアウト全集_${characters.length}名版`, md);
  };

  const handlePrintAllCards = () => {
    let md = `# 🃏 別配付カード全集：初期所持品・固有能力（${characters.length}名編成）\n\n`;
    characters.forEach((c) => {
      md += formatCharacterCardsMarkdown(c);
    });
    printDocumentText(`別配付カード全集_${characters.length}名版`, md);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white">
            ハンドアウト（HO）＆ 別配付カード エディタ
          </h2>
          <p className="text-xs text-slate-400">
            個人ハンドアウト本紙（6つの構成要素）と、別配付カード（初期所持品・固有能力）を分けて編集・印刷できます。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintSelectedChar}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            title="選択中のキャラクターの個人ハンドアウト（6項目）のみをシンプルなA4白背景で印刷"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            このPCのHO本紙を印刷
          </button>
          <button
            onClick={handlePrintAllChars}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
            title="全キャラクターの個人ハンドアウト本紙（6項目）を一括印刷"
          >
            <Printer className="h-3.5 w-3.5" />
            🖨️ 全員分のHO本紙を一括印刷
          </button>
          <button
            onClick={handlePrintAllCards}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
            title="初期所持品・携行アイテムおよび固有能力・専門スキルを別配付カードとして一括印刷"
          >
            <Layers className="h-3.5 w-3.5" />
            🃏 別配付カード（所持品・能力）を印刷
          </button>
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

        {/* 右カラム：個人ハンドアウト本紙（6項目） vs 別配付カード（所持品・能力） */}
        <div className="col-span-9 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto space-y-4 text-xs">
          {/* サブタブ切替：本紙（6項目） vs 別配付カード */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setActiveSubTab("handout_sheet")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  activeSubTab === "handout_sheet"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                📄 個人ハンドアウト本紙（6つの構成要素）
              </button>
              <button
                onClick={() => setActiveSubTab("separate_cards")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  activeSubTab === "separate_cards"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                🃏 別配付カード（初期所持品・固有能力）
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              配置：{selectedChar.location === "headquarters" ? "🏢 海上保安庁東京本部" : "⚓ 小笠原・現地救難隊"}
            </span>
          </div>

          {activeSubTab === "handout_sheet" ? (
            <div className="space-y-4">
              {/* 1. 役割 ＆ 2. 所属・肩書・職業 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">
                    ① 役割
                  </label>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) =>
                      handleUpdateCharField((c) => ({ ...c, name: e.target.value }))
                    }
                    className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">
                    ② 所属・肩書・職業
                  </label>
                  <textarea
                    rows={2}
                    value={selectedChar.profession}
                    onChange={(e) =>
                      handleUpdateCharField((c) => ({ ...c, profession: e.target.value }))
                    }
                    className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs leading-snug text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* 3. 全員に公開できるプロフィール */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">
                  ③ 全員に公開できるプロフィール
                </label>
                <textarea
                  value={selectedChar.handout.publicProfile}
                  onChange={(e) => handleUpdateHandout("publicProfile", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4. あなたの内面（公開されないもの）・行動指針 */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2.5">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  ④ あなたの内面（公開されないもの）・行動指針
                </h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 mb-1">
                      <Award className="h-3 w-3" /> 誇り・信条・行動指針
                    </label>
                    <textarea
                      value={selectedChar.handout.internalDrama.pride}
                      onChange={(e) => handleUpdateHandout("internalDrama.pride", e.target.value)}
                      rows={3}
                      className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 mb-1">
                      <Heart className="h-3 w-3" /> 過去の喪失・悔恨
                    </label>
                    <textarea
                      value={selectedChar.handout.internalDrama.loss}
                      onChange={(e) => handleUpdateHandout("internalDrama.loss", e.target.value)}
                      rows={3}
                      className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. あなたの記憶 */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">
                  ⑤ あなたの記憶（これまでの経緯・流星雨の目撃など）
                </label>
                <textarea
                  value={selectedChar.introduction}
                  onChange={(e) =>
                    handleUpdateCharField((c) => ({ ...c, introduction: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 6. 自己紹介 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-indigo-300 block">
                    ⑥ 自己紹介（導入時に共有する言葉・自身の立場）
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
                  rows={5}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-3 leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>
          ) : (
            /* 別配付カード（初期所持品・携行アイテム ＆ 固有能力・専門スキル）編集ビュー */
            <div className="space-y-5">
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3 text-slate-300">
                💡 以下の<strong>「初期所持品・携行アイテム」</strong>と<strong>「固有能力・専門スキル」</strong>は、個人ハンドアウト本紙には記載せず、<strong>別のカードとして各プレイヤーに配布</strong>します。
              </div>

              {/* 初期所持品カード */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">
                    🃏 初期所持品・携行アイテムカード（{(selectedChar.initialItems || []).length}枚）
                  </h4>
                  <button
                    onClick={() =>
                      handleUpdateCharField((c) => ({
                        ...c,
                        initialItems: [...(c.initialItems || []), "新規所持品アイテム"],
                      }))
                    }
                    className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500"
                  >
                    <Plus className="h-3 w-3" /> 所持品カード追加
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  {(selectedChar.initialItems || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2.5"
                    >
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        ITEM-{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const nextItems = [...(selectedChar.initialItems || [])];
                          nextItems[idx] = e.target.value;
                          handleUpdateCharField((c) => ({ ...c, initialItems: nextItems }));
                        }}
                        className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          handleUpdateCharField((c) => ({
                            ...c,
                            initialItems: (c.initialItems || []).filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-slate-500 hover:text-rose-400"
                        title="カードを削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 固有能力・専門スキルカード */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">
                    🃏 固有能力・専門スキルカード（{(selectedChar.capabilities || []).length}枚）
                  </h4>
                  <button
                    onClick={() =>
                      handleUpdateCharField((c) => ({
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
                    className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500"
                  >
                    <Plus className="h-3 w-3" /> スキルカード追加
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(selectedChar.capabilities || []).map((cap, idx) => (
                    <div
                      key={cap.id || idx}
                      className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-400">Day</span>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          value={cap.targetPhase}
                          onChange={(e) => {
                            const nextCaps = [...(selectedChar.capabilities || [])];
                            nextCaps[idx] = {
                              ...cap,
                              targetPhase: parseInt(e.target.value, 10) || 1,
                            };
                            handleUpdateCharField((c) => ({ ...c, capabilities: nextCaps }));
                          }}
                          className="w-12 rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-xs font-bold text-white"
                        />
                        <input
                          type="text"
                          value={cap.name}
                          onChange={(e) => {
                            const nextCaps = [...(selectedChar.capabilities || [])];
                            nextCaps[idx] = { ...cap, name: e.target.value };
                            handleUpdateCharField((c) => ({ ...c, capabilities: nextCaps }));
                          }}
                          className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            handleUpdateCharField((c) => ({
                              ...c,
                              capabilities: (c.capabilities || []).filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-slate-500 hover:text-rose-400"
                          title="スキルカードを削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={cap.description}
                        onChange={(e) => {
                          const nextCaps = [...(selectedChar.capabilities || [])];
                          nextCaps[idx] = { ...cap, description: e.target.value };
                          handleUpdateCharField((c) => ({ ...c, capabilities: nextCaps }));
                        }}
                        className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
