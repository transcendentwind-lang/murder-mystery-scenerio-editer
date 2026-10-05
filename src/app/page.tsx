"use client";

import React, { useState } from "react";
import { MMProject } from "@/types/schema";
import { initialProject } from "@/utils/initialProjectData";
import { TimelineBoard } from "@/components/TimelineBoard";
import { CharactersEvidenceManager } from "@/components/CharactersEvidenceManager";
import { HandoutEditor } from "@/components/HandoutEditor";
import { CrypticMatrix } from "@/components/CrypticMatrix";
import { AudioSimulator } from "@/components/AudioSimulator";
import { GmDashboard } from "@/components/GmDashboard";
import { TextExportView } from "@/components/TextExportView";
import { AiChatPanel, ChatMessage, PersonaType } from "@/components/AiChatPanel";
import { SynopsisModal } from "@/components/SynopsisModal";
import {
  Compass,
  Users,
  BookOpen,
  Grid,
  Activity,
  Radio,
  FileText,
} from "lucide-react";

type ActiveTab =
  | "timeline"
  | "characters_evidence"
  | "handouts"
  | "puzzle_matrix"
  | "audio_simulator"
  | "gm_dashboard"
  | "export";

export default function WorkbenchPage() {
  const [project, setProject] = useState<MMProject>(initialProject);
  const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
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

    // AIからの応答生成（各ペルソナに応じた的確なアドバイス）
    setTimeout(() => {
      let replyText = "";
      if (persona === "logic_checker") {
        replyText = `【論理チェッカー視点】\n「${text}」について論理的検証を行いました。\n・物体の移動速度（日速約150km / 時速6km）と小笠原〜駿河湾（約950km）のタイムリミットに矛盾はありません。\n・6名全員が情報を持ち寄らないとクジラ言語の文法（敵＋餌＋集まれ）が完成しない二重ロックも堅牢に機能しています。`;
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
      {/* トップヘッダー */}
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

        {/* 右側アクション＆タブ */}
        <div className="flex items-center gap-3">
          {/* タブナビゲーション (6大画面) */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              ① 7日間タイムライン
            </button>

            <button
              onClick={() => setActiveTab("characters_evidence")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "characters_evidence"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              ② キャラ設定 ＆ 証拠管理
            </button>

            <button
              onClick={() => setActiveTab("handouts")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "handouts"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              ③ ハンドアウト共創
            </button>

            <button
              onClick={() => setActiveTab("puzzle_matrix")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "puzzle_matrix"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              ④ クジラ言語パズル
            </button>

            <button
              onClick={() => setActiveTab("audio_simulator")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "audio_simulator"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              ⑤ 深海音響シミュレータ
            </button>

            <button
              onClick={() => setActiveTab("gm_dashboard")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "gm_dashboard"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              ⑥ GMダッシュボード
            </button>

            <button
              onClick={() => setActiveTab("export")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "export"
                  ? "bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50"
                  : "text-indigo-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              ⑦ テキスト出力 ＆ 企画書
            </button>
          </div>


          {/* 企画概要・プロット紹介モーダルボタン */}
          <button
            onClick={() => setIsSynopsisOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/80 hover:text-white transition shadow"
            title="タイトル、コンセプト、プロット紹介をテキスト出力・編集"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            企画・プロット紹介
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
          {activeTab === "timeline" && (
            <TimelineBoard
              timeline={project.timeline}
              evidences={project.evidences}
              onUpdateTimeline={(newTimeline) =>
                setProject((prev) => ({ ...prev, timeline: newTimeline }))
              }
            />
          )}

          {activeTab === "characters_evidence" && (
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
          )}

          {activeTab === "handouts" && (
            <HandoutEditor
              characters={project.characters}
              onUpdateCharacters={(newChars) =>
                setProject((prev) => ({ ...prev, characters: newChars }))
              }
              onSendAiPrompt={(prompt) => setExternalPrompt(prompt)}
            />
          )}

          {activeTab === "puzzle_matrix" && (
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
          )}

          {activeTab === "audio_simulator" && <AudioSimulator />}

          {activeTab === "gm_dashboard" && <GmDashboard project={project} />}

          {activeTab === "export" && <TextExportView project={project} />}
        </main>
      </div>


      {/* 企画概要・プロット紹介モーダル */}
      <SynopsisModal
        project={project}
        isOpen={isSynopsisOpen}
        onClose={() => setIsSynopsisOpen(false)}
        onUpdateProject={setProject}
      />
    </div>
  );
}

