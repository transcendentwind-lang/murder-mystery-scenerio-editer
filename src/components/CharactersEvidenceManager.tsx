"use client";

import React, { useState } from "react";
import {
  Character,
  EvidenceItem,
  CharacterCapability,
  EvidenceVisibility,
  CrypticWord,
  CrypticGrammar,
} from "@/types/schema";
import {
  Users,
  FileText,
  Grid,
  Plus,
  Trash2,
  Lock,
  Share2,
  Globe,
  Radio,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Package,
  Volume2,
} from "lucide-react";
import { CrypticMatrix } from "@/components/CrypticMatrix";

interface CharactersEvidenceManagerProps {
  characters: Character[];
  evidences: EvidenceItem[];
  playerCount?: number;
  crypticWords?: CrypticWord[];
  crypticGrammar?: CrypticGrammar;
  onUpdateCharacters: (chars: Character[]) => void;
  onUpdateEvidences: (evs: EvidenceItem[]) => void;
  onUpdateWords?: (words: CrypticWord[]) => void;
  onUpdateGrammar?: (grammar: CrypticGrammar) => void;
  onTogglePlayerCount?: (count: number) => void;
}

export const CharactersEvidenceManager: React.FC<CharactersEvidenceManagerProps> = ({
  characters,
  evidences,
  playerCount = 6,
  crypticWords = [],
  crypticGrammar = {
    ruleDescription: "",
    correctSequence: [],
    combinedMessage: "",
    holderCharId: "",
  },
  onUpdateCharacters,
  onUpdateEvidences,
  onUpdateWords,
  onUpdateGrammar,
  onTogglePlayerCount,
}) => {
  const [subView, setSubView] = useState<"characters" | "evidences" | "matrix" | "audio_puzzle">("characters");
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "pc-1");
  const [evidenceFilterChar, setEvidenceFilterChar] = useState<string>("all");
  const [evidenceFilterDay, setEvidenceFilterDay] = useState<string>("all");

  // 選択中IDが存在しない（5名モードでPC6が消えた場合など）に対応
  const currentSelectedCharId = characters.some((c) => c.id === selectedCharId)
    ? selectedCharId
    : characters[0]?.id || "pc-1";

  const selectedChar =
    characters.find((c) => c.id === currentSelectedCharId) || characters[0];

  // キャラクター更新
  const handleUpdateChar = (field: keyof Character, value: any) => {
    const updated = characters.map((c) =>
      c.id === selectedCharId ? { ...c, [field]: value } : c
    );
    onUpdateCharacters(updated);
  };

  // 証拠更新
  const handleUpdateEvidence = (evId: string, field: keyof EvidenceItem, value: any) => {
    const updated = evidences.map((e) => (e.id === evId ? { ...e, [field]: value } : e));
    onUpdateEvidences(updated);
  };

  // 証拠追加
  const handleAddEvidence = () => {
    const newEv: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: "新規手がかり / 証拠",
      description: "証拠の詳細テキストや客観的事実を入力してください。",
      ownerId: selectedCharId,
      foundPhase: 1,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 1 開始時",
    };
    onUpdateEvidences([...evidences, newEv]);
  };

  // 証拠削除
  const handleDeleteEvidence = (evId: string) => {
    onUpdateEvidences(evidences.filter((e) => e.id !== evId));
  };

  const filteredEvidences = evidences.filter((e) => {
    const matchChar = evidenceFilterChar === "all" || e.ownerId === evidenceFilterChar;
    const matchDay = evidenceFilterDay === "all" || e.foundPhase === Number(evidenceFilterDay);
    return matchChar && matchDay;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* サブタブバー */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setSubView("characters")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                subView === "characters"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              キャラクター設定
            </button>
            <button
              onClick={() => setSubView("evidences")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                subView === "evidences"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              全証拠（エビデンス）マスター一覧 ({evidences.length})
            </button>
            <button
              onClick={() => setSubView("matrix")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                subView === "matrix"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              証拠配分マトリクス (PC × Day)
            </button>
            <button
              onClick={() => setSubView("audio_puzzle")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                subView === "audio_puzzle"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="クジラのクリック音・祝詞の舌クリック音の試聴と8語新言語合成シミュレータ"
            >
              <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
              音響・祝詞スタジオ（コーダ＆祝詞解析）
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onTogglePlayerCount && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                onClick={() => onTogglePlayerCount(6)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition ${
                  playerCount === 6
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="小笠原4名（PC3・PC4・PC5・PC6）＋東京2名（長津はGM担当）の標準構成"
              >
                6名モード（標準・長津GM）
              </button>
              <button
                onClick={() => onTogglePlayerCount(7)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition ${
                  playerCount === 7
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="東京3名（PC1・PC2・PC7長津）＋小笠原4名の7人プレイ構成"
              >
                7名モード（長津PC参加）
              </button>
            </div>
          )}
          <div className="text-xs text-slate-400">
            登録PC: <span className="font-bold text-indigo-400">{characters.length}名</span> ｜
            総証拠数: <span className="font-bold text-indigo-400">{evidences.length}件</span>
          </div>
        </div>
      </div>

      {/* ビュー1：キャラクター設定 ＆ できること */}
      {subView === "characters" && (
        <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
          {/* 左カラム：PC一覧リスト */}
          <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                海難救助対策チーム ({characters.length}名)
              </h3>
              <span className="rounded bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                {characters.length === 7 ? "7名編成（長津PC参加）" : "6名編成（標準・長津GM）"}
              </span>
            </div>
            <div className="space-y-2">
              {characters.map((char) => {
                const isSelected = char.id === currentSelectedCharId;
                const charEvCount = evidences.filter((e) => e.ownerId === char.id).length;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex w-full flex-col rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/30"
                        : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{char.name}</span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          char.location === "headquarters"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {char.location === "headquarters" ? "海上保安庁東京本部" : "小笠原現地"}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                      {char.profession}
                    </span>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                      <span>固有能力: {char.capabilities.length}個</span>
                      <span>所持証拠: {charEvCount}枚</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右カラム：選択PCの詳細・イントロ・できること */}
          <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedChar.name}</h3>
                <p className="text-xs text-slate-400">{selectedChar.profession}</p>
              </div>
              <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                配置: {selectedChar.location === "headquarters" ? "海上保安庁東京本部" : "小笠原現場"}
              </span>
            </div>

            <div className="space-y-5 text-sm">
              {/* イントロダクション（導入文） */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>イントロダクション（プレイヤーが最初に読む導入ストーリー）</span>
                  <span className="text-[10px] text-slate-500">1ヶ月前の流星雨や初動の背景</span>
                </label>
                <textarea
                  value={selectedChar.introduction}
                  onChange={(e) => handleUpdateChar("introduction", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* 初期所持品 */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Package className="h-3.5 w-3.5 text-indigo-400" />
                  初期所持品（通信端末・観測データ・遺品など）
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedChar.initialItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ビュー2：全証拠（エビデンス）マスター一覧 */}
      {subView === "evidences" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">絞り込み:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">所持者:</span>
                <select
                  value={evidenceFilterChar}
                  onChange={(e) => setEvidenceFilterChar(e.target.value)}
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">全員 ({evidences.length})</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">日付:</span>
                <select
                  value={evidenceFilterDay}
                  onChange={(e) => setEvidenceFilterDay(e.target.value)}
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">全日程 (Day 1〜7)</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={String(d)}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              {(evidenceFilterChar !== "all" || evidenceFilterDay !== "all") && (
                <button
                  onClick={() => {
                    setEvidenceFilterChar("all");
                    setEvidenceFilterDay("all");
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline ml-1"
                >
                  条件クリア ({filteredEvidences.length}件該当)
                </button>
              )}
            </div>

            <button
              onClick={handleAddEvidence}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow transition"
            >
              <Plus className="h-3.5 w-3.5" />
              新しい証拠カードを追加
            </button>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto pr-1">
            {filteredEvidences.map((ev) => {
              const owner = characters.find((c) => c.id === ev.ownerId);
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                        DAY {ev.foundPhase}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                          {ev.category}
                        </span>
                        <button
                          onClick={() => handleDeleteEvidence(ev.id)}
                          className="text-slate-600 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={ev.title}
                      onChange={(e) => handleUpdateEvidence(ev.id, "title", e.target.value)}
                      className="w-full font-bold text-xs text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none pb-1"
                    />

                    <textarea
                      value={ev.description}
                      onChange={(e) => handleUpdateEvidence(ev.id, "description", e.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs leading-relaxed text-slate-300 focus:border-indigo-500 focus:outline-none"
                    />
                    {ev.glossaryNote && (
                      <div className="mt-1.5 rounded border border-slate-800 bg-slate-950/80 px-2 py-1.5 text-[10.5px] leading-snug text-emerald-300/90 whitespace-pre-wrap">
                        {ev.glossaryNote}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t border-slate-800 pt-2 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>所持者:</span>
                      <select
                        value={ev.ownerId}
                        onChange={(e) => handleUpdateEvidence(ev.id, "ownerId", e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] text-indigo-300"
                      >
                        {characters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>公開区分:</span>
                      <select
                        value={ev.visibility}
                        onChange={(e) =>
                          handleUpdateEvidence(
                            ev.id,
                            "visibility",
                            e.target.value as EvidenceVisibility
                          )
                        }
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] text-slate-200"
                      >
                        <option value="private">個別秘匿 (本人のみ)</option>
                        <option value="shareable">譲渡・開示可能</option>
                        <option value="public">全体公開</option>
                      </select>
                    </div>

                    {ev.acquisitionCondition && (
                      <div className="text-[10px] text-amber-400/90 truncate">
                        条件: {ev.acquisitionCondition}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ビュー3：証拠配分マトリクス (PC × Day) */}
      {subView === "matrix" && (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">
              証拠・手がかり配布バランス (PC 1〜6 × Day 1〜7)
            </h3>
            <p className="text-xs text-slate-400">
              各キャラクターが何日目にいくつの証拠を手に入れるかを一覧化。特定の人物への偏りを防ぎます。
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-2.5 font-semibold text-slate-300">日程 (Day)</th>
                  {characters.map((c) => (
                    <th key={c.id} className="p-2.5 font-semibold text-slate-300">
                      {c.name.split(":")[0]} ({c.location === "headquarters" ? "東" : "現"})
                    </th>
                  ))}
                  <th className="p-2.5 font-semibold text-indigo-400">合計</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dayEvidences = evidences.filter((e) => e.foundPhase === day);
                  return (
                    <tr key={day} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-slate-300">Day {day}</td>
                      {characters.map((c) => {
                        const count = dayEvidences.filter((e) => e.ownerId === c.id).length;
                        return (
                          <td key={c.id} className="p-2.5">
                            {count > 0 ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/40 font-bold text-indigo-200">
                                {count}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2.5 font-mono font-bold text-indigo-400">
                        {dayEvidences.length} 枚
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ④ 音響・祝詞解析スタジオ */}
      {subView === "audio_puzzle" && (
        <div className="flex-1 overflow-hidden -mx-6 -mb-6">
          <CrypticMatrix
            words={crypticWords}
            grammar={crypticGrammar}
            characters={characters}
            onUpdateWords={onUpdateWords || (() => {})}
            onUpdateGrammar={onUpdateGrammar || (() => {})}
          />
        </div>
      )}
    </div>
  );
};
