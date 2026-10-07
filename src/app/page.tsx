"use client";

import React, { useState } from "react";
import { MMProject } from "@/types/schema";
import { initialProject } from "@/utils/initialProjectData";
import { TimelineBoard } from "@/components/TimelineBoard";
import { CharactersEvidenceManager } from "@/components/CharactersEvidenceManager";
import { HandoutEditor } from "@/components/HandoutEditor";
import { CrypticMatrix } from "@/components/CrypticMatrix";
import { GmDashboard } from "@/components/GmDashboard";
import { TextExportView } from "@/components/TextExportView";
import { AiChatPanel, ChatMessage, PersonaType } from "@/components/AiChatPanel";
import { SynopsisModal } from "@/components/SynopsisModal";
import {
  Compass,
  Users,
  Radio,
  FileText,
  BookOpen,
  Grid,
} from "lucide-react";

type ActiveTab =
  | "timeline"
  | "characters_handouts"
  | "gm_dashboard"
  | "export_synopsis";

export default function WorkbenchPage() {
  const [project, setProject] = useState<MMProject>(initialProject);
  const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
  const [characterSubTab, setCharacterSubTab] = useState<"profiles" | "handouts">("profiles");
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState<boolean>(false);
  const [externalPrompt, setExternalPrompt] = useState<string>("");
  const [isSynopsisOpen, setIsSynopsisOpen] = useState<boolean>(false);

  // AIチャット初期メッセージ
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      persona: "drama_director",
      text: "こんにちは。『深海からの呼び声 ―合同海難対策本部、7日間の記録―』の制作スタジオへようこそ！\n\n小笠原〜富士山直下の7日間インシデント進行、6名の海難救助隊のイントロと固有能力、全証拠カードの管理、そしてマッコウクジラの言語パズルまで、すべて連携して作業できます。どの部分から編集・推敲を進めますか？",
      timestamp: "12:00",
    },
  ]);

  const handleSendMessage = (text: string, persona: PersonaType) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // AIからの応答生成
    setTimeout(() => {
      let replyText = "";
      if (persona === "logic_checker") {
        replyText = `【論理チェッカー視点】\n「${text}」について論理的検証を行いました。\n・物体の移動速度（日速約150km / 時速6km）と小笠原〜駿河湾（約1,000km）のタイムリミットに矛盾はありません。\n・6名全員が情報を持ち寄らないとクジラ言語の文法（敵＋獲物＋集まれ）が完成しない二重ロックも堅牢に機能しています。`;
      } else if (persona === "drama_director") {
        replyText = `【ドラマ演出視点】\n「${text}」についてドラマツルギーを検討しました！\n・Day 1の救難時の緊迫感から、Day 5の自衛隊魚雷迎撃の完全無効化による絶望、そしてDay 7の数千頭のマッコウクジラ集結という感情曲線が極めて美しく機能しています。\n・PC1の隠蔽苦悩とPC3の現場の怒りの対立をより鮮明にすると、さらに通信劇が白熱します。`;
      } else {
        replyText = `【推敲アシスタント視点】\n「${text}」について文章表現を推敲しました。\n・公的機関の報告書としてのリアリティと、深海のコズミックホラーとしての不気味さの対比を意識した語彙に調整可能です。`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        persona,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* グローバル・トップヘッダー */}
      <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30">
            D
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              {project.title}
              <span className="text-xs font-normal text-slate-400">― {project.subtitle} ―</span>
            </h1>
            <p className="text-[11px] text-indigo-400 font-mono">
              MM-Workbench : 現代クトゥルフ × 海難対策本部 LARP/マダミス
            </p>
          </div>
        </div>

        {/* グローバルナビゲーション（4大分類） */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
            {/* ① 7日間タイムライン（プレイヤー提供情報・作戦海図を完全内包） */}
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              ① 7日間タイムライン ＆ 作戦海図
            </button>

            {/* ② キャラクター ＆ ハンドアウト */}
            <button
              onClick={() => setActiveTab("characters_handouts")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "characters_handouts"
                  ? "bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="h-4 w-4 text-emerald-400" />
              ② キャラクター ＆ ハンドアウト
            </button>

            {/* ③ GM進行ダッシュボード */}
            <button
              onClick={() => setActiveTab("gm_dashboard")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "gm_dashboard"
                  ? "bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Radio className="h-4 w-4 text-amber-400" />
              ③ GM進行ダッシュボード
            </button>

            {/* ④ 企画書・プロット紹介 ＆ テキスト出力 */}
            <button
              onClick={() => setActiveTab("export_synopsis")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "export_synopsis"
                  ? "bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileText className="h-4 w-4 text-indigo-400" />
              ④ 企画書・プロット ＆ 台本出力
            </button>
          </div>

          {/* 企画概要モーダルクイックボタン */}
          <button
            onClick={() => setIsSynopsisOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/80 hover:text-white transition shadow"
            title="タイトル、コンセプト、プロット紹介をクイック確認"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            企画概要ポップアップ
          </button>
        </div>
      </header>

      {/* メインレイアウト：左ペイン（AI Chat）＋ 右ペイン（作業画面） */}
      <div className="flex flex-1 overflow-hidden">
        <AiChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          externalPrompt={externalPrompt}
          onClearExternalPrompt={() => setExternalPrompt("")}
        />

        <main className="flex-1 overflow-hidden bg-slate-950">
          {/* ① 7日間タイムライン（各Dayに海図・空撮・アクション・証拠を完全配置） */}
          {activeTab === "timeline" && (
            <TimelineBoard
              timeline={project.timeline}
              evidences={project.evidences}
              project={project}
              onUpdateTimeline={(newTimeline) =>
                setProject((prev) => ({ ...prev, timeline: newTimeline }))
              }
              onNavigateToPuzzle={() => setIsPuzzleModalOpen(true)}
            />
          )}

          {/* ② キャラクター ＆ ハンドアウト管理 */}
          {activeTab === "characters_handouts" && (
            <div className="flex h-full flex-col overflow-hidden">
              {/* サブタブ切替バー */}
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-6 py-2.5 backdrop-blur">
                <button
                  onClick={() => setCharacterSubTab("profiles")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    characterSubTab === "profiles"
                      ? "bg-indigo-600 text-white shadow"
                      : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  登場人物プロフィール ＆ 証拠マスター一覧
                </button>
                <button
                  onClick={() => setCharacterSubTab("handouts")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    characterSubTab === "handouts"
                      ? "bg-indigo-600 text-white shadow"
                      : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  AI共創型ハンドアウト（HO）エディタ
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {characterSubTab === "profiles" ? (
                  <CharactersEvidenceManager
                    characters={project.characters}
                    evidences={project.evidences}
                    onUpdateCharacters={(newChars) =>
                      setProject((prev) => ({ ...prev, characters: newChars }))
                    }
                    onUpdateEvidences={(newEvs) =>
                      setProject((prev) => ({ ...prev, evidences: newEvs }))
                    }
                  />
                ) : (
                  <HandoutEditor
                    characters={project.characters}
                    onUpdateCharacters={(newChars) =>
                      setProject((prev) => ({ ...prev, characters: newChars }))
                    }
                    onSendAiPrompt={(prompt) => setExternalPrompt(prompt)}
                  />
                )}
              </div>
            </div>
          )}

          {/* ③ GM進行ダッシュボード */}
          {activeTab === "gm_dashboard" && (
            <GmDashboard
              project={project}
              onNavigateToChart={() => setActiveTab("timeline")}
            />
          )}

          {/* ④ 企画書・プロット紹介 ＆ 台本出力 */}
          {activeTab === "export_synopsis" && (
            <TextExportView project={project} />
          )}
        </main>
      </div>

      {/* 企画概要・プロット紹介モーダル */}
      <SynopsisModal
        project={project}
        isOpen={isSynopsisOpen}
        onClose={() => setIsSynopsisOpen(false)}
        onUpdateProject={setProject}
      />

      {/* クジラ言語パズルモーダル（Day 6から直接呼び出し可能） */}
      {isPuzzleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsPuzzleModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full h-[85vh] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  【Day 6 パズル】マッコウクジラ言語マトリクス ＆ 祝詞文法解析
                </h3>
              </div>
              <button
                onClick={() => setIsPuzzleModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <CrypticMatrix
                words={project.crypticWords}
                grammar={project.crypticGrammar}
                characters={project.characters}
                onUpdateWords={(newWords) =>
                  setProject((prev) => ({ ...prev, crypticWords: newWords }))
                }
                onUpdateGrammar={(newGrammar) =>
                  setProject((prev) => ({ ...prev, crypticGrammar: newGrammar }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
