"use client";

import React, { useState } from "react";
import { Character, EvidenceItem, CharacterCapability, EvidenceVisibility } from "@/types/schema";
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
} from "lucide-react";

interface CharactersEvidenceManagerProps {
  characters: Character[];
  evidences: EvidenceItem[];
  playerCount?: number;
  onUpdateCharacters: (chars: Character[]) => void;
  onUpdateEvidences: (evs: EvidenceItem[]) => void;
  onTogglePlayerCount?: (count: number) => void;
}

export const CharactersEvidenceManager: React.FC<CharactersEvidenceManagerProps> = ({
  characters,
  evidences,
  playerCount = 6,
  onUpdateCharacters,
  onUpdateEvidences,
  onTogglePlayerCount,
}) => {
  const [subView, setSubView] = useState<"characters" | "evidences" | "matrix">("characters");
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "pc-1");
  const [evidenceFilterChar, setEvidenceFilterChar] = useState<string>("all");
  const [newCapName, setNewCapName] = useState("");
  const [newCapDesc, setNewCapDesc] = useState("");
  const [newCapPhase, setNewCapPhase] = useState<number>(1);

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

  // 能力追加
  const handleAddCapability = () => {
    if (!newCapName.trim()) return;
    const newCap: CharacterCapability = {
      id: `cap-${Date.now()}`,
      name: newCapName.trim(),
      description: newCapDesc.trim(),
      targetPhase: newCapPhase,
    };
    const updated = characters.map((c) =>
      c.id === selectedCharId
        ? { ...c, capabilities: [...c.capabilities, newCap] }
        : c
    );
    onUpdateCharacters(updated);
    setNewCapName("");
    setNewCapDesc("");
  };

  // 能力削除
  const handleDeleteCapability = (capId: string) => {
    const updated = characters.map((c) =>
      c.id === selectedCharId
        ? { ...c, capabilities: c.capabilities.filter((cap) => cap.id !== capId) }
        : c
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

  const filteredEvidences =
    evidenceFilterChar === "all"
      ? evidences
      : evidences.filter((e) => e.ownerId === evidenceFilterChar);

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
              キャラクター設定 ＆ できること
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
                title="小笠原4名（PC3・PC4・PC5・PC6）＋東京2名の完全版構成（本編・推奨）"
              >
                6名モード（本編・推奨）
              </button>
              <button
                onClick={() => onTogglePlayerCount(5)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition ${
                  playerCount === 5
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="小笠原3名（PC3・PC4統合・PC5）＋東京2名の人数調整用構成"
              >
                5名モード（調整用）
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
                {characters.length === 6 ? "6名編成（本編・推奨）" : "5名編成（調整用）"}
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
                        {char.id === "pc-4" && (
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              characters.length === 6
                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {characters.length === 6 ? "本編：純粋観測員" : "調整：社家兼任"}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          char.location === "headquarters"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {char.location === "headquarters" ? "東京司令部" : "小笠原現地"}
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
            {/* PC4本編純粋版の案内バナー */}
            {selectedChar.id === "pc-4" && characters.length === 6 && (
              <div className="mb-4 rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200">
                      6人プレイ（本編・推奨）：純粋な海洋・気象観測員
                    </span>
                  </div>
                  {onTogglePlayerCount && (
                    <button
                      onClick={() => onTogglePlayerCount(5)}
                      className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                    >
                      人数調整用（5名モード・社家兼任）に切り替える
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300/80">
                  近代科学データ分析に特化した専門員です。小笠原現場ではPC3（船長・海の勘）、PC5（生物学者・生態系）、PC6（神職・救護）と4名それぞれの職能が分担され、最高のロールプレイ純度と群像劇体験が味わえます。
                </p>
              </div>
            )}

            {/* PC4統合版の案内バナー */}
            {selectedChar.id === "pc-4" && characters.length === 5 && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-200">
                      5人プレイ（人数調整用）：統合キャラクター（観測員 兼 神社社家）
                    </span>
                  </div>
                  {onTogglePlayerCount && (
                    <button
                      onClick={() => onTogglePlayerCount(6)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline"
                    >
                      6名プレイ（本編・推奨）に戻す
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-amber-300/80">
                  急な欠員時や5名で遊ぶ場合の調整モードです。PC4が近代科学観測官と島の大神宮社家を兼任し、土蔵の古文書・祝詞・無線ログをすべて所持することで、パズルや証拠の欠落なく遊べます。
                </p>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedChar.name}</h3>
                <p className="text-xs text-slate-400">{selectedChar.profession}</p>
              </div>
              <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                配置: {selectedChar.location === "headquarters" ? "東京本庁" : "小笠原現場"}
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
                  初期所持品（拾った小さな隕石・通信端末など）
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

              {/* できること（固有アクション・権限） */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    できること（固有能力・行使できる権限一覧）
                  </label>
                  <span className="text-[10px] text-slate-500">
                    計 {selectedChar.capabilities.length} 件
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedChar.capabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{cap.name}</span>
                          <span className="rounded bg-indigo-900/40 px-1.5 py-0.5 text-[10px] text-indigo-300">
                            Day {cap.targetPhase}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                          {cap.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCapability(cap.id)}
                        className="text-slate-600 hover:text-red-400 transition ml-2 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 新規能力追加フォーム */}
                <div className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-3">
                  <h4 className="mb-2 text-[11px] font-semibold text-slate-400">
                    ＋ 新しい能力・アクションを追加
                  </h4>
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="能力・アクション名 (例: 大出力ソナー網接続)"
                      value={newCapName}
                      onChange={(e) => setNewCapName(e.target.value)}
                      className="col-span-8 rounded border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                    <select
                      value={newCapPhase}
                      onChange={(e) => setNewCapPhase(Number(e.target.value))}
                      className="col-span-4 rounded border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          Day {d} 実行可能
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="アクションの内容、効果、何ができるかを記述..."
                      value={newCapDesc}
                      onChange={(e) => setNewCapDesc(e.target.value)}
                      rows={2}
                      className="col-span-12 rounded border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddCapability}
                    className="mt-2 flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    <Plus className="h-3 w-3" /> 能力を追加
                  </button>
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">絞り込み:</span>
              <select
                value={evidenceFilterChar}
                onChange={(e) => setEvidenceFilterChar(e.target.value)}
                className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">全員の証拠を表示 ({evidences.length})</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
    </div>
  );
};
