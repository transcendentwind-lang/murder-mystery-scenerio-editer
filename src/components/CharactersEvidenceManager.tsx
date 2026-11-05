"use client";

import React, { useState } from "react";
import {
  Character,
  EvidenceItem,
  EvidenceVisibility,
  InterpretationLink,
  LockCriterion,
  CandidateLockStatus,
  RoleType,
} from "@/types/schema";
import {
  Users,
  FileText,
  Grid,
  Plus,
  Trash2,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Heart,
  ShieldAlert,
  Layers,
} from "lucide-react";

interface CharactersEvidenceManagerProps {
  projectId?: string;
  characters: Character[];
  evidences: EvidenceItem[];
  matrixLinks?: InterpretationLink[];
  lockCriteria?: LockCriterion[];
  candidateStatuses?: CandidateLockStatus[];
  phaseCount?: number;
  playerCount?: number;
  onUpdateCharacters: (chars: Character[]) => void;
  onUpdateEvidences: (evs: EvidenceItem[]) => void;
  onUpdateMatrixLinks?: (links: InterpretationLink[]) => void;
  onUpdateLockCriteria?: (criteria: LockCriterion[]) => void;
  onUpdateCandidateStatuses?: (statuses: CandidateLockStatus[]) => void;
  onTogglePlayerCount?: (count: number) => void;
}

export const CharactersEvidenceManager: React.FC<CharactersEvidenceManagerProps> = ({
  projectId,
  characters: rawCharacters,
  evidences: rawEvidences,
  matrixLinks: rawMatrixLinks = [],
  lockCriteria: rawLockCriteria = [],
  candidateStatuses: rawCandidateStatuses = [],
  phaseCount = 4,
  playerCount = 6,
  onUpdateCharacters,
  onUpdateEvidences,
  onUpdateMatrixLinks,
  onUpdateLockCriteria,
  onUpdateCandidateStatuses,
  onTogglePlayerCount,
}) => {
  const characters = Array.isArray(rawCharacters) ? rawCharacters : [];
  const evidences = Array.isArray(rawEvidences) ? rawEvidences : [];
  const matrixLinks = Array.isArray(rawMatrixLinks) ? rawMatrixLinks : [];
  const lockCriteria = Array.isArray(rawLockCriteria) ? rawLockCriteria : [];
  const candidateStatuses = Array.isArray(rawCandidateStatuses) ? rawCandidateStatuses : [];

  const isDeepSeaProject = !projectId || projectId === "project-deep-sea";
  const phaseLabelPrefix = isDeepSeaProject ? "Day" : "Phase";
  const totalPhases = Math.max(
    phaseCount,
    ...evidences.map((e) => e?.foundPhase || 1),
    isDeepSeaProject ? 7 : 4
  );
  const phaseNumbers = Array.from({ length: totalPhases }, (_, i) => i + 1);

  const [subView, setSubView] = useState<
    "characters" | "evidences" | "info_trump" | "multi_lock" | "matrix"
  >("characters");
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "pc-1");
  const [evidenceFilterChar, setEvidenceFilterChar] = useState<string>("all");
  const [evidenceFilterDay, setEvidenceFilterDay] = useState<string>("all");

  const currentSelectedCharId = characters.some((c) => c.id === selectedCharId)
    ? selectedCharId
    : characters[0]?.id || "pc-1";

  const selectedChar =
    characters.find((c) => c.id === currentSelectedCharId) || characters[0];

  // キャラクター基本フィールド更新
  const handleUpdateChar = (field: keyof Character, value: any) => {
    const updated = characters.map((c) =>
      c.id === currentSelectedCharId ? { ...c, [field]: value } : c
    );
    onUpdateCharacters(updated);
  };

  // ハンドアウト・内面ドラマ更新
  const handleUpdateHandoutField = (
    field: "publicProfile" | "backgroundTimeline" | "handoutBody" | "gmActionGuide",
    value: string
  ) => {
    const updated = characters.map((c) =>
      c.id === currentSelectedCharId
        ? {
            ...c,
            handout: {
              ...(c.handout || {
                publicProfile: "",
                internalDrama: { pride: "", loss: "" },
                backgroundTimeline: "",
                handoutBody: "",
              }),
              [field]: value,
            },
          }
        : c
    );
    onUpdateCharacters(updated);
  };

  const handleUpdateDramaField = (
    dramaKey: "pride" | "guilt" | "loss",
    value: string
  ) => {
    const updated = characters.map((c) =>
      c.id === currentSelectedCharId
        ? {
            ...c,
            handout: {
              ...(c.handout || {
                publicProfile: "",
                internalDrama: { pride: "", loss: "" },
                backgroundTimeline: "",
                handoutBody: "",
              }),
              internalDrama: {
                ...(c.handout?.internalDrama || { pride: "", loss: "" }),
                [dramaKey]: value,
              },
            },
          }
        : c
    );
    onUpdateCharacters(updated);
  };

  // 新規キャラクター枠の追加
  const handleAddCharacter = () => {
    const nextNum = characters.length + 1;
    const newChar: Character = {
      id: `pc-${Date.now()}`,
      name: `新規キャラクター ${nextNum}`,
      roleType: "suspect",
      isCulpritCandidate: true,
      profession: "肩書・専門分野",
      location: "headquarters",
      introduction: "プレイヤーが最初に読む導入ストーリー・事件との関わりを記述します。",
      capabilities: [],
      initialItems: [],
      handout: {
        publicProfile: "全員に公開される表向きの経歴・立ち位置。",
        internalDrama: {
          pride: "専門職としての誇り・譲れない自負。",
          guilt: "過去の過失・隠している後ろめたさ・保身。",
          loss: "過去の喪失体験・トラウマ・後悔。",
        },
        backgroundTimeline: "事件発生前〜当日にかけての行動・渡航記録。",
        handoutBody: "【あなたの立場と専門知識】\n公開証拠を解読するための固有知識や行動指針を記述します。",
        gmActionGuide: "【GM裏アクション・進行指示】\nフェーズ移行時の個別提出や引き継ぎに関する指示。",
      },
    };
    onUpdateCharacters([...characters, newChar]);
    setSelectedCharId(newChar.id);
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
      title: "新規手がかり / 公開証拠",
      description: "証拠の詳細テキストや客観的事実を入力してください。",
      ownerId: isDeepSeaProject ? currentSelectedCharId : "all",
      foundPhase: 1,
      visibility: isDeepSeaProject ? "shareable" : "public",
      category: "document",
      acquisitionCondition: `${phaseLabelPrefix} 1 公開`,
    };
    onUpdateEvidences([...evidences, newEv]);
  };

  // 証拠削除
  const handleDeleteEvidence = (evId: string) => {
    onUpdateEvidences(evidences.filter((e) => e.id !== evId));
  };

  // 情報トランプ（InterpretationLink）追加・更新・削除
  const handleAddMatrixLink = () => {
    if (!onUpdateMatrixLinks) return;
    const newLink: InterpretationLink = {
      id: `link-${Date.now()}`,
      evidenceId: evidences[0]?.id || "",
      characterId: characters[0]?.id || "",
      specializedKnowledge: "該当PCがHOに保持している専門知識・前提情報",
      derivedConclusion: "公開証拠と専門知識が組み合わさることで導き出される真の意味・新事実",
      isCrucialForSolution: true,
    };
    onUpdateMatrixLinks([...matrixLinks, newLink]);
  };

  const handleUpdateMatrixLink = (
    linkId: string,
    field: keyof InterpretationLink,
    value: any
  ) => {
    if (!onUpdateMatrixLinks) return;
    onUpdateMatrixLinks(
      matrixLinks.map((l) => (l.id === linkId ? { ...l, [field]: value } : l))
    );
  };

  const handleDeleteMatrixLink = (linkId: string) => {
    if (!onUpdateMatrixLinks) return;
    onUpdateMatrixLinks(matrixLinks.filter((l) => l.id !== linkId));
  };

  // 多重ロック検証の更新
  const handleToggleLock = (charId: string, critId: string) => {
    if (!onUpdateCandidateStatuses) return;
    const exists = candidateStatuses.some((s) => s.characterId === charId);
    let updated: CandidateLockStatus[];
    if (exists) {
      updated = candidateStatuses.map((s) =>
        s.characterId === charId
          ? {
              ...s,
              locks: {
                ...(s.locks || {}),
                [critId]: !s.locks?.[critId],
              },
            }
          : s
      );
    } else {
      updated = [
        ...candidateStatuses,
        {
          characterId: charId,
          locks: { [critId]: true },
          rebuttalNote: "",
        },
      ];
    }
    onUpdateCandidateStatuses(updated);
  };

  const handleUpdateRebuttalNote = (charId: string, note: string) => {
    if (!onUpdateCandidateStatuses) return;
    const exists = candidateStatuses.some((s) => s.characterId === charId);
    if (exists) {
      onUpdateCandidateStatuses(
        candidateStatuses.map((s) =>
          s.characterId === charId ? { ...s, rebuttalNote: note } : s
        )
      );
    } else {
      onUpdateCandidateStatuses([
        ...candidateStatuses,
        { characterId: charId, locks: {}, rebuttalNote: note },
      ]);
    }
  };

  const handleAddCriterion = () => {
    if (!onUpdateLockCriteria) return;
    const nextIdx = lockCriteria.length + 1;
    const newCrit: LockCriterion = {
      id: `crit-${Date.now()}`,
      name: `ロック条件 ${nextIdx}`,
      description: "犯人を特定するための論理的な絞り込み条件を記述します。",
    };
    onUpdateLockCriteria([...lockCriteria, newCrit]);
  };

  const handleUpdateCriterion = (
    critId: string,
    field: keyof LockCriterion,
    value: string
  ) => {
    if (!onUpdateLockCriteria) return;
    onUpdateLockCriteria(
      lockCriteria.map((c) => (c.id === critId ? { ...c, [field]: value } : c))
    );
  };

  const handleDeleteCriterion = (critId: string) => {
    if (!onUpdateLockCriteria) return;
    onUpdateLockCriteria(lockCriteria.filter((c) => c.id !== critId));
  };

  const filteredEvidences = evidences.filter((e) => {
    const matchChar = evidenceFilterChar === "all" || e.ownerId === evidenceFilterChar;
    const matchDay = evidenceFilterDay === "all" || e.foundPhase === Number(evidenceFilterDay);
    return matchChar && matchDay;
  });

  // 役割バッジ表示ヘルパー
  const getRoleBadge = (char: Character) => {
    if (char.roleType === "special") {
      return {
        label: "途中交代・合流枠",
        cls: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      };
    }
    if (char.roleType === "suspect" || char.isCulpritCandidate) {
      return {
        label: "容疑者候補",
        cls: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
      };
    }
    if (char.roleType === "investigator") {
      return {
        label: "調査・解明陣営",
        cls: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
      };
    }
    return {
      label: "中立・その他",
      cls: "bg-slate-700 text-slate-300",
    };
  };

  // 全ロック条件を満たすキャラクターの計算
  const fullyLockedCharacters = characters.filter((char) => {
    if (lockCriteria.length === 0) return false;
    const status = candidateStatuses.find((s) => s.characterId === char.id);
    if (!status || !status.locks) return false;
    return lockCriteria.every((crit) => !!status.locks?.[crit.id]);
  });

  if (isDeepSeaProject) {
    const deepSeaSubView =
      subView === "evidences" || subView === "matrix" ? subView : "characters";

    return (
      <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
        {/* サブタブバー */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                onClick={() => setSubView("characters")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                  deepSeaSubView === "characters"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                キャラクター設定
              </button>
              <button
                onClick={() => setSubView("evidences")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                  deepSeaSubView === "evidences"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                全証拠（エビデンス）マスター一覧 ({evidences.length})
              </button>
              <button
                onClick={() => setSubView("matrix")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                  deepSeaSubView === "matrix"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                証拠配分マトリクス (PC × Day)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onTogglePlayerCount && (
              <div className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-950/40 p-1">
                <button
                  onClick={() => onTogglePlayerCount(6)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                    playerCount !== 7
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  6名モード（標準・長津GM）
                </button>
                <button
                  onClick={() => onTogglePlayerCount(7)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                    playerCount === 7
                      ? "bg-amber-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  7名モード（長津PC参加）
                </button>
              </div>
            )}
            <div className="text-xs text-slate-400">
              登録PC: <span className="font-bold text-indigo-400">{characters.length}名</span> ｜
              総証拠数: <span className="font-bold text-emerald-400">{evidences.length}件</span>
            </div>
          </div>
        </div>

        {/* 1. キャラクター＆ハンドアウト設定 */}
        {deepSeaSubView === "characters" && selectedChar && (
          <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
            {/* 左：PC一覧 */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 lg:col-span-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  海難救助対策チーム ({characters.length}名)
                </span>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {playerCount === 7 ? "7名編成（長津PC参加）" : "6名編成（標準・長津GM）"}
                </span>
              </div>
              {characters.map((char, idx) => {
                const isSelected = char.id === currentSelectedCharId;
                const charEvCount = evidences.filter((e) => e.ownerId === char.id).length;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/30 shadow-md"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">PC{idx + 1}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          char.location === "headquarters"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-teal-500/20 text-teal-300"
                        }`}
                      >
                        {char.location === "headquarters" ? "海上保安庁東京本部" : "小笠原現地"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">{char.name}</div>
                    <div className="text-xs text-slate-400">{char.profession}</div>
                    <div className="mt-2 flex w-full items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                      <span>所持証拠: {charEvCount}枚</span>
                      <span>能力: {(char.capabilities || []).length}種</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 右：選択中PCの詳細エディタ */}
            <div className="flex flex-col gap-5 overflow-y-auto pr-2 lg:col-span-8">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Character & Handout Editor
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedChar.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      配置:{" "}
                      {selectedChar.location === "headquarters"
                        ? "海上保安庁東京本部"
                        : "小笠原現場"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-400">
                      キャラクター名
                    </label>
                    <input
                      type="text"
                      value={selectedChar.name}
                      onChange={(e) => handleUpdateChar("name", e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-400">
                      職業・肩書
                    </label>
                    <input
                      type="text"
                      value={selectedChar.profession}
                      onChange={(e) => handleUpdateChar("profession", e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 全員に公開される表向きのプロフィール */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-bold text-cyan-400">
                    全員に公開される表向きのプロフィール
                  </label>
                  <textarea
                    rows={2}
                    value={selectedChar.handout?.publicProfile || ""}
                    onChange={(e) => handleUpdateHandoutField("publicProfile", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* 内面の誇り・喪失（2カラム・後ろめたさ無し） */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-amber-400">
                      誇り・信条・行動指針
                    </label>
                    <textarea
                      rows={3}
                      value={selectedChar.handout?.internalDrama?.pride || ""}
                      onChange={(e) => handleUpdateDramaField("pride", e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs leading-relaxed text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-rose-400">
                      過去の喪失・悔恨
                    </label>
                    <textarea
                      rows={3}
                      value={selectedChar.handout?.internalDrama?.loss || ""}
                      onChange={(e) => handleUpdateDramaField("loss", e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs leading-relaxed text-slate-200 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* あなたの記憶（導入ストーリー） */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-bold text-emerald-400">
                    あなたの記憶（プレイヤーが最初に読む導入ストーリー）
                  </label>
                  <textarea
                    rows={10}
                    value={selectedChar.introduction || ""}
                    onChange={(e) => handleUpdateChar("introduction", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* 自己紹介（ハンドアウト本文） */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-bold text-indigo-400">
                    自己紹介（ハンドアウト本文）
                  </label>
                  <textarea
                    rows={8}
                    value={selectedChar.handout?.handoutBody || ""}
                    onChange={(e) => handleUpdateHandoutField("handoutBody", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 全証拠（エビデンス）マスター一覧 */}
        {deepSeaSubView === "evidences" && (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            {/* フィルター＆追加バー */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">所持者:</span>
                  <select
                    value={evidenceFilterChar}
                    onChange={(e) => setEvidenceFilterChar(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="all">全員 ({evidences.length}件)</option>
                    {characters.map((c, idx) => (
                      <option key={c.id} value={c.id}>
                        PC{idx + 1}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">日付:</span>
                  <select
                    value={evidenceFilterDay}
                    onChange={(e) => setEvidenceFilterDay(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="all">全日程 (Day 1〜7)</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <option key={d} value={String(d)}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddEvidence}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
              >
                <Plus className="h-3.5 w-3.5" />
                新しい証拠カードを追加
              </button>
            </div>

            {/* 証拠リスト */}
            <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvidences.map((ev) => {
                return (
                  <div
                    key={ev.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                            DAY {ev.foundPhase}
                          </span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {ev.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteEvidence(ev.id)}
                          className="text-slate-500 transition hover:text-rose-400"
                          title="この証拠を削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => handleUpdateEvidence(ev.id, "title", e.target.value)}
                        className="mb-2 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-bold text-white hover:border-slate-700 focus:border-indigo-500 focus:bg-slate-950 focus:outline-none"
                      />

                      <textarea
                        rows={4}
                        value={ev.description}
                        onChange={(e) => handleUpdateEvidence(ev.id, "description", e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/90 p-2.5 text-xs leading-relaxed text-slate-300 focus:border-indigo-500 focus:outline-none"
                      />

                      {ev.glossaryNote && (
                        <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2 text-[11px] leading-relaxed text-amber-200/90">
                          {ev.glossaryNote}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">所持:</span>
                        <select
                          value={ev.ownerId}
                          onChange={(e) => handleUpdateEvidence(ev.id, "ownerId", e.target.value)}
                          className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[11px] text-indigo-300"
                        >
                          {characters.map((c, idx) => (
                            <option key={c.id} value={c.id}>
                              PC{idx + 1}: {c.name.split("（")[0]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">公開区分:</span>
                        <select
                          value={ev.visibility}
                          onChange={(e) =>
                            handleUpdateEvidence(
                              ev.id,
                              "visibility",
                              e.target.value as EvidenceVisibility
                            )
                          }
                          className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[11px] text-emerald-300"
                        >
                          <option value="shareable">共有可能</option>
                          <option value="private">個人秘匿</option>
                          <option value="public">全体公開</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>条件: {ev.acquisitionCondition}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. 証拠配分マトリクス (PC × Day) */}
        {deepSeaSubView === "matrix" && (
          <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="mb-2 text-sm font-bold text-white">
              日程別 × キャラクター別 証拠配分バランス表
            </h3>
            <p className="mb-4 text-xs text-slate-400">
              特定のプレイヤーや特定の日程に証拠が偏っていないかを俯瞰チェックできます。
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-300">
                    <th className="p-3 font-bold">日程 (Day)</th>
                    {characters.map((c, i) => (
                      <th key={c.id} className="p-3 font-bold">
                        <div className="text-indigo-400">PC{i + 1}</div>
                        <div>{c.name.split("（")[0]}</div>
                      </th>
                    ))}
                    <th className="p-3 font-bold text-emerald-400">合計</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const dayTotal = evidences.filter((e) => e.foundPhase === day).length;
                    return (
                      <tr key={day} className="border-b border-slate-800/70 hover:bg-slate-900/80">
                        <td className="p-3 font-bold text-white">Day {day}</td>
                        {characters.map((c) => {
                          const cellEvs = evidences.filter(
                            (e) => e.foundPhase === day && e.ownerId === c.id
                          );
                          return (
                            <td key={c.id} className="p-3 align-top">
                              {cellEvs.length === 0 ? (
                                <span className="text-slate-600">-</span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {cellEvs.map((ev) => (
                                    <span
                                      key={ev.id}
                                      className="rounded border border-indigo-500/30 bg-indigo-950/40 px-2 py-1 text-[11px] text-indigo-200"
                                    >
                                      {ev.title}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 font-bold text-emerald-400">{dayTotal}件</td>
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
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* サブタブバー */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setSubView("characters")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                subView === "characters"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              キャラクター ＆ 内面ドラマ ({characters.length})
            </button>
            <button
              onClick={() => setSubView("evidences")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                subView === "evidences"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              全証拠マスター ({evidences.length})
            </button>
            <button
              onClick={() => setSubView("info_trump")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                subView === "info_trump"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-emerald-300 hover:text-white"
              }`}
              title="全体公開される証拠に対し、どのPCの専門知識（HO）が組み合わさることで真の意味が解読できるかを設計します"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              🃏 情報トランプ（公開証拠 × 解釈差分）({matrixLinks.length})
            </button>
            <button
              onClick={() => setSubView("multi_lock")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                subView === "multi_lock"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-amber-300 hover:text-white"
              }`}
              title="複数の推理軸（動機・物理機会・特殊ルール等）の交点で犯人ただ1人に収束するかを検証します"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              🔐 多重ロック検証ボード ({lockCriteria.length}軸)
            </button>
            <button
              onClick={() => setSubView("matrix")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                subView === "matrix"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              配分バランス表
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isDeepSeaProject && onTogglePlayerCount && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                onClick={() => onTogglePlayerCount(6)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold transition ${
                  playerCount === 6
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
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
              >
                7名モード（長津PC参加）
              </button>
            </div>
          )}
          <div className="text-xs text-slate-400">
            登録キャラ: <span className="font-bold text-indigo-400">{characters.length}枠</span> ｜
            証拠数: <span className="font-bold text-indigo-400">{evidences.length}件</span> ｜
            解釈リンク: <span className="font-bold text-emerald-400">{matrixLinks.length}件</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ビュー1：キャラクター設定 ＆ 内面ドラマ（誇り・後ろめたさ・喪失） */}
      {/* ========================================================= */}
      {subView === "characters" && selectedChar && (
        <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
          {/* 左カラム：PC一覧リスト */}
          <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                登場人物・途中交代枠一覧 ({characters.length}枠)
              </h3>
              <button
                onClick={handleAddCharacter}
                className="flex items-center gap-1 rounded bg-indigo-600/30 border border-indigo-500/40 px-2 py-1 text-[11px] font-bold text-indigo-200 hover:bg-indigo-600 hover:text-white transition"
              >
                <Plus className="h-3 w-3" />
                枠追加
              </button>
            </div>
            <div className="space-y-2">
              {characters.map((char) => {
                const isSelected = char.id === currentSelectedCharId;
                const charEvCount = evidences.filter((e) => e.ownerId === char.id).length;
                const charLinkCount = matrixLinks.filter((l) => l.characterId === char.id).length;
                const badge = getRoleBadge(char);

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
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white truncate">{char.name}</span>
                      <span
                        className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          isDeepSeaProject
                            ? char.location === "headquarters"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-emerald-500/20 text-emerald-300"
                            : badge.cls
                        }`}
                      >
                        {isDeepSeaProject
                          ? char.location === "headquarters"
                            ? "海上保安庁東京本部"
                            : "小笠原現地"
                          : badge.label}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                      {char.profession}
                    </span>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                      <span>個別証拠: {charEvCount}枚</span>
                      <span>専門解釈リンク: {charLinkCount}件</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右カラム：選択PCの詳細・内面ドラマ3スロット・HO構成 */}
          <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto space-y-5">
            {/* 基本属性ヘッダー */}
            <div className="grid grid-cols-12 gap-3 border-b border-slate-800 pb-4">
              <div className="col-span-5">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  キャラクター名 / 枠名
                </label>
                <input
                  type="text"
                  value={selectedChar.name}
                  onChange={(e) => handleUpdateChar("name", e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  職業・肩書・サプライチェーン上の役割
                </label>
                <input
                  type="text"
                  value={selectedChar.profession}
                  onChange={(e) => handleUpdateChar("profession", e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  役割グループ区分
                </label>
                <select
                  value={selectedChar.roleType}
                  onChange={(e) => {
                    const newRole = e.target.value as RoleType;
                    const updated = characters.map((c) =>
                      c.id === currentSelectedCharId
                        ? {
                            ...c,
                            roleType: newRole,
                            isCulpritCandidate: newRole === "suspect",
                          }
                        : c
                    );
                    onUpdateCharacters(updated);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="suspect">容疑者候補 (サプライチェーン等)</option>
                  <option value="investigator">調査・解明陣営 (客観証拠)</option>
                  <option value="special">途中交代・再合流キャラクター</option>
                  <option value="neutral">中立・その他</option>
                </select>
              </div>
            </div>

            {/* 🌟 内面ドラマ 3スロット（誇り・後ろめたさ・喪失体験） */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  キャラクター内面ドラマ 3スロット（誇り × 後ろめたさ × 喪失体験）
                </span>
                <span className="text-[11px] text-slate-400">
                  ※犯人特定のミスリード調整とロールプレイの深みを生み出す核
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ① 誇り・自負 */}
                <div className="rounded-lg border border-amber-500/30 bg-slate-950/90 p-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    ① プロとしての誇り・自負
                  </label>
                  <textarea
                    value={selectedChar.handout?.internalDrama?.pride || ""}
                    onChange={(e) => handleUpdateDramaField("pride", e.target.value)}
                    rows={4}
                    placeholder="専門職として成し遂げた仕事への誇りや信念"
                    className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs leading-relaxed text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* ② 後ろめたさ・過失 */}
                <div className="rounded-lg border border-rose-500/30 bg-slate-950/90 p-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    ② 後ろめたさ（過失・隠蔽・保身）
                  </label>
                  <textarea
                    value={selectedChar.handout?.internalDrama?.guilt || ""}
                    onChange={(e) => handleUpdateDramaField("guilt", e.target.value)}
                    rows={4}
                    placeholder="「自分があの時ああしていなければ…」という過失や秘密"
                    className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs leading-relaxed text-slate-200 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {/* ③ 喪失体験・トラウマ */}
                <div className="rounded-lg border border-cyan-500/30 bg-slate-950/90 p-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Heart className="h-3.5 w-3.5 text-cyan-400" />
                    ③ 過去の喪失体験・心の隙間
                  </label>
                  <textarea
                    value={selectedChar.handout?.internalDrama?.loss || ""}
                    onChange={(e) => handleUpdateDramaField("loss", e.target.value)}
                    rows={4}
                    placeholder="失った最愛の相手、癒えない孤独や後悔"
                    className="w-full rounded border border-slate-800 bg-slate-900 p-2 text-xs leading-relaxed text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 公開プロフィール ＆ 導入ストーリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <span>全員に公開される表向きのプロフィール</span>
                </label>
                <textarea
                  value={selectedChar.handout?.publicProfile || ""}
                  onChange={(e) => handleUpdateHandoutField("publicProfile", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>あなたの記憶・導入文（プレイヤーが最初に読む導入）</span>
                </label>
                <textarea
                  value={selectedChar.introduction}
                  onChange={(e) => handleUpdateChar("introduction", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ハンドアウト本文（専門知識・行動指針） */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>ハンドアウト本文（専門知識による解読指針・ロールプレイ目標）</span>
                <span className="text-[10px] text-slate-400">
                  ※公開証拠をどう読み解くか、何を達成すべきかを記述
                </span>
              </label>
              <textarea
                value={selectedChar.handout?.handoutBody || ""}
                onChange={(e) => handleUpdateHandoutField("handoutBody", e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* タイムライン・渡航歴 ＆ GM裏アクションガイド */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  個人の行動記録・渡航歴・アリバイタイムライン
                </label>
                <textarea
                  value={selectedChar.handout?.backgroundTimeline || ""}
                  onChange={(e) => handleUpdateHandoutField("backgroundTimeline", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-pink-300">
                  GM裏アクション・途中交代時の引き継ぎガイド
                </label>
                <textarea
                  value={selectedChar.handout?.gmActionGuide || ""}
                  onChange={(e) => handleUpdateHandoutField("gmActionGuide", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ビュー2：全証拠（エビデンス）マスター一覧 */}
      {/* ========================================================= */}
      {subView === "evidences" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">絞り込み:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">公開先/所持者:</span>
                <select
                  value={evidenceFilterChar}
                  onChange={(e) => setEvidenceFilterChar(e.target.value)}
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">すべて表示 ({evidences.length})</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">フェーズ:</span>
                <select
                  value={evidenceFilterDay}
                  onChange={(e) => setEvidenceFilterDay(e.target.value)}
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">
                    全フェーズ ({phaseLabelPrefix} 1〜{totalPhases})
                  </option>
                  {phaseNumbers.map((d) => (
                    <option key={d} value={String(d)}>
                      {phaseLabelPrefix} {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddEvidence}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow transition"
            >
              <Plus className="h-3.5 w-3.5" />
              新しい証拠を追加
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
            {filteredEvidences.map((ev) => {
              const linkedInterpretations = matrixLinks.filter((l) => l.evidenceId === ev.id);
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                          {phaseLabelPrefix.toUpperCase()} {ev.foundPhase}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            ev.visibility === "public"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {ev.visibility === "public" ? "🌐 全体公開" : "個別/譲渡"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteEvidence(ev.id)}
                        className="text-slate-600 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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

                    {ev.glossaryNote !== undefined && (
                      <input
                        type="text"
                        value={ev.glossaryNote || ""}
                        onChange={(e) => handleUpdateEvidence(ev.id, "glossaryNote", e.target.value)}
                        placeholder="解読の焦点・補足メモ"
                        className="mt-1.5 w-full rounded border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10.5px] text-emerald-300/90 focus:border-emerald-500 focus:outline-none"
                      />
                    )}

                    {linkedInterpretations.length > 0 && (
                      <div className="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-2 space-y-1">
                        <div className="text-[10px] font-bold text-indigo-300">
                          🃏 紐づく専門知識（情報トランプ）: {linkedInterpretations.length}件
                        </div>
                        {linkedInterpretations.map((link) => {
                          const c = characters.find((ch) => ch.id === link.characterId);
                          return (
                            <div key={link.id} className="text-[10px] text-slate-300 leading-snug">
                              ・<strong className="text-white">{c?.name || link.characterId}</strong>:{" "}
                              {(link.derivedConclusion || "").slice(0, 55)}...
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t border-slate-800 pt-2 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>公開フェーズ:</span>
                      <select
                        value={ev.foundPhase}
                        onChange={(e) =>
                          handleUpdateEvidence(ev.id, "foundPhase", Number(e.target.value))
                        }
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] text-indigo-300"
                      >
                        {phaseNumbers.map((p) => (
                          <option key={p} value={p}>
                            {phaseLabelPrefix} {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>所持/公開先:</span>
                      <select
                        value={ev.ownerId}
                        onChange={(e) => handleUpdateEvidence(ev.id, "ownerId", e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] text-indigo-300"
                      >
                        <option value="all">🌐 全体公開（全員共有）</option>
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
                        <option value="public">全体公開（オープン）</option>
                        <option value="shareable">譲渡・開示可能</option>
                        <option value="private">個別秘匿 (本人のみ)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ビュー3：🃏 情報トランプ（公開証拠 × 専門知識の解釈差分） */}
      {/* ========================================================= */}
      {subView === "info_trump" && (
        <div className="flex flex-1 flex-col overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                情報トランプ設計ボード（全体公開証拠 × 各PCの専門知識による解釈差分）
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                「証拠そのものは全員にオープンだが、その真の意味（裏の事実・逆転策のピース）は特定の専門知識を持つPCのHOと照合して初めて解読できる」構造を管理します。
              </p>
            </div>
            <button
              onClick={handleAddMatrixLink}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow transition"
            >
              <Plus className="h-4 w-4" />
              ＋ 解釈差分リンクを追加
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {matrixLinks.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-xs text-slate-400">
                まだ解釈差分リンクが登録されていません。右上の「＋ 解釈差分リンクを追加」から追加してください。
              </div>
            ) : (
              matrixLinks.map((link, idx) => {
                return (
                  <div
                    key={link.id}
                    className={`rounded-xl border p-4 transition ${
                      link.isCrucialForSolution
                        ? "border-indigo-500/40 bg-slate-900/90"
                        : "border-slate-800 bg-slate-900/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-400">公開証拠:</span>
                        <select
                          value={link.evidenceId}
                          onChange={(e) =>
                            handleUpdateMatrixLink(link.id, "evidenceId", e.target.value)
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-bold text-indigo-300 focus:border-indigo-500 focus:outline-none"
                        >
                          {evidences.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              [{phaseLabelPrefix} {ev.foundPhase}] {ev.title}
                            </option>
                          ))}
                        </select>

                        <span className="text-xs font-bold text-slate-400 ml-2">× 解読担当PC:</span>
                        <select
                          value={link.characterId}
                          onChange={(e) =>
                            handleUpdateMatrixLink(link.id, "characterId", e.target.value)
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                        >
                          {characters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}（{(c.profession || "").slice(0, 18)}）
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.isCrucialForSolution}
                            onChange={(e) =>
                              handleUpdateMatrixLink(
                                link.id,
                                "isCrucialForSolution",
                                e.target.checked
                              )
                            }
                            className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                          />
                          <span
                            className={
                              link.isCrucialForSolution
                                ? "font-bold text-amber-300"
                                : "text-slate-400"
                            }
                          >
                            ★ 真相・逆転解決の必須ピース
                          </span>
                        </label>
                        <button
                          onClick={() => handleDeleteMatrixLink(link.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="この解釈リンクを削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                          ① 当該PCのハンドアウト（HO）に記載しておく専門知識・遺品情報
                        </label>
                        <textarea
                          value={link.specializedKnowledge}
                          onChange={(e) =>
                            handleUpdateMatrixLink(
                              link.id,
                              "specializedKnowledge",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs leading-relaxed text-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">
                          ② 証拠と専門知識が合わさって全体に導き出される「真の意味・新事実」
                        </label>
                        <textarea
                          value={link.derivedConclusion}
                          onChange={(e) =>
                            handleUpdateMatrixLink(link.id, "derivedConclusion", e.target.value)
                          }
                          rows={2}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs leading-relaxed text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ビュー4：🔐 多重ロック検証ボード（犯人1名への収束チェック） */}
      {/* ========================================================= */}
      {subView === "multi_lock" && (
        <div className="flex flex-1 flex-col overflow-hidden space-y-4">
          {/* 収束ステータスバナー */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
              fullyLockedCharacters.length === 1
                ? "border-emerald-500/40 bg-emerald-950/20"
                : "border-amber-500/40 bg-amber-950/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {fullyLockedCharacters.length === 1 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-sm font-bold text-white">
                  {fullyLockedCharacters.length === 1
                    ? `✅ 多重ロック検証クリア：全条件（${lockCriteria.length}軸）を満たす人物が「${fullyLockedCharacters[0].name}」ただ1名に論理収束しています！`
                    : fullyLockedCharacters.length === 0
                    ? "⚠️ 現在、全ロック条件を同時に満たす人物が 0名 です（下の表の○/×をクリックして調整してください）"
                    : `⚠️ 現在、全ロック条件を満たす人物が ${fullyLockedCharacters.length}名 存在します（1名に絞られるよう反証条件を調整してください）`}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  各条件セルをクリックすると「○（条件合致）」と「×（反証・シロ成立）」を切り替えられます。真犯人を変更したい場合も、ここの○×を入れ替えるだけで誰にどの反証が必要かを即座に設計できます。
                </p>
              </div>
            </div>

            <button
              onClick={handleAddCriterion}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow transition"
            >
              <Plus className="h-4 w-4" />
              ＋ ロック条件軸を追加
            </button>
          </div>

          {/* ロック条件の定義カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {lockCriteria.map((crit) => (
              <div
                key={crit.id}
                className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => handleUpdateCriterion(crit.id, "name", e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-amber-300 focus:outline-none border-b border-transparent focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleDeleteCriterion(crit.id)}
                      className="text-slate-600 hover:text-rose-400"
                      title="このロック条件を削除"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <textarea
                    value={crit.description}
                    onChange={(e) =>
                      handleUpdateCriterion(crit.id, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full bg-slate-950/70 rounded border border-slate-800 p-1.5 text-[11px] text-slate-300 leading-snug focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* キャラクター × ロック条件マトリクス表 */}
          <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/90">
                  <th className="p-3 font-bold text-slate-200 w-52">登場人物 / 区分</th>
                  {lockCriteria.map((crit) => (
                    <th key={crit.id} className="p-3 font-bold text-amber-300 text-center w-28">
                      {crit.name}
                    </th>
                  ))}
                  <th className="p-3 font-bold text-indigo-300">
                    反証ロジック・シロ証明メモ / 真犯人収束メモ
                  </th>
                </tr>
              </thead>
              <tbody>
                {characters
                  .filter((c) => c.roleType !== "special")
                  .map((char) => {
                    const status = candidateStatuses.find((s) => s.characterId === char.id);
                    const isAllMatched =
                      lockCriteria.length > 0 &&
                      lockCriteria.every((crit) => !!status?.locks?.[crit.id]);
                    const badge = getRoleBadge(char);

                    return (
                      <tr
                        key={char.id}
                        className={`border-b border-slate-800/70 transition ${
                          isAllMatched
                            ? "bg-rose-950/30 hover:bg-rose-950/40"
                            : "hover:bg-slate-900/60"
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {char.name}
                            {isAllMatched && (
                              <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                全条件合致
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                        </td>

                        {lockCriteria.map((crit) => {
                          const matched = !!status?.locks?.[crit.id];
                          return (
                            <td key={crit.id} className="p-2 text-center">
                              <button
                                onClick={() => handleToggleLock(char.id, crit.id)}
                                className={`inline-flex h-8 w-16 items-center justify-center rounded-lg font-bold text-xs transition ${
                                  matched
                                    ? "bg-rose-600/30 border border-rose-500 text-rose-200 shadow-sm"
                                    : "bg-slate-950 border border-slate-800 text-emerald-400 hover:border-slate-700"
                                }`}
                              >
                                {matched ? "○ 該当" : "× シロ"}
                              </button>
                            </td>
                          );
                        })}

                        <td className="p-2.5">
                          <input
                            type="text"
                            value={status?.rebuttalNote || ""}
                            onChange={(e) =>
                              handleUpdateRebuttalNote(char.id, e.target.value)
                            }
                            placeholder="どの証拠によってシロが証明されるか（または真犯人としての決め手）を記述"
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ビュー5：証拠・専門知識配分バランス表 (PC × Phase) */}
      {/* ========================================================= */}
      {subView === "matrix" && (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">
              証拠 ＆ 情報トランプ（専門知識解読）配分バランス ({phaseLabelPrefix} 1〜{totalPhases})
            </h3>
            <p className="text-xs text-slate-400">
              各フェーズで公開される証拠数と、各キャラクターが活躍する専門解読リンクの件数を一覧化し、見せ場の偏りを防ぎます。
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-2.5 font-semibold text-slate-300">
                    進行 ({phaseLabelPrefix})
                  </th>
                  <th className="p-2.5 font-semibold text-emerald-400">
                    🌐 全体公開証拠
                  </th>
                  {characters.map((c) => (
                    <th key={c.id} className="p-2.5 font-semibold text-slate-300">
                      {(c.name || "").split("：")[0].split(":")[0]}
                    </th>
                  ))}
                  <th className="p-2.5 font-semibold text-indigo-400">フェーズ合計</th>
                </tr>
              </thead>
              <tbody>
                {phaseNumbers.map((day) => {
                  const dayEvidences = evidences.filter((e) => e.foundPhase === day);
                  const publicCount = dayEvidences.filter((e) => e.ownerId === "all").length;
                  return (
                    <tr key={day} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-slate-300">
                        {phaseLabelPrefix} {day}
                      </td>
                      <td className="p-2.5">
                        {publicCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-0.5 font-bold text-emerald-200">
                            {publicCount} 件
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      {characters.map((c) => {
                        const directCount = dayEvidences.filter((e) => e.ownerId === c.id).length;
                        const linkCount = matrixLinks.filter((l) => {
                          const ev = evidences.find((e) => e.id === l.evidenceId);
                          return l.characterId === c.id && ev?.foundPhase === day;
                        }).length;
                        const totalForChar = directCount + linkCount;

                        return (
                          <td key={c.id} className="p-2.5">
                            {totalForChar > 0 ? (
                              <span
                                className="inline-flex items-center justify-center rounded-full bg-indigo-600/40 px-2 py-0.5 font-bold text-indigo-200"
                                title={`個別証拠: ${directCount}件 / 専門解読: ${linkCount}件`}
                              >
                                {totalForChar}
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
