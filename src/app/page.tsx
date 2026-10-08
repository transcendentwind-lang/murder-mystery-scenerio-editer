"use client";

import React, { useState, useEffect } from "react";
import { MMProject } from "@/types/schema";
import { initialProject } from "@/utils/initialProjectData";
import {
  getStoredProjects,
  saveProjectToStorage,
  getActiveProjectId,
  setActiveProjectId,
} from "@/utils/projectStorage";
import { TimelineBoard } from "@/components/TimelineBoard";
import { CharactersEvidenceManager } from "@/components/CharactersEvidenceManager";
import { HandoutEditor } from "@/components/HandoutEditor";
import { CrypticMatrix } from "@/components/CrypticMatrix";
import { GmDashboard } from "@/components/GmDashboard";
import { TextExportView } from "@/components/TextExportView";
import { AiChatPanel, ChatMessage, PersonaType } from "@/components/AiChatPanel";
import { SynopsisModal } from "@/components/SynopsisModal";
import { ProjectManagerModal } from "@/components/ProjectManagerModal";
import {
  Compass,
  Users,
  Radio,
  FileText,
  BookOpen,
  Grid,
  FolderKanban,
  ChevronDown,
} from "lucide-react";

type ActiveTab =
  | "timeline"
  | "characters_handouts"
  | "gm_dashboard"
  | "export_synopsis";

export default function WorkbenchPage() {
  const [projects, setProjects] = useState<MMProject[]>([initialProject]);
  const [project, setProject] = useState<MMProject>(initialProject);
  const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
  const [characterSubTab, setCharacterSubTab] = useState<"profiles" | "handouts">("profiles");
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState<boolean>(false);
  const [externalPrompt, setExternalPrompt] = useState<string>("");
  const [isSynopsisOpen, setIsSynopsisOpen] = useState<boolean>(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(false);

  // 初期ロード：ローカルストレージからプロジェクト一覧とアクティブプロジェクトを復元
  useEffect(() => {
    const stored = getStoredProjects();
    setProjects(stored);
    const activeId = getActiveProjectId();
    if (activeId) {
      const found = stored.find((p) => p.id === activeId);
      if (found) {
        setProject(found);
        return;
      }
    }
    if (stored.length > 0) {
      setProject(stored[0]);
    }
  }, []);

  // プロジェクト更新ヘルパー（state更新＋ストレージ自動保存）
  const handleUpdateProject = (updater: MMProject | ((prev: MMProject) => MMProject)) => {
    setProject((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveProjectToStorage(next);
      setProjects((currentList) =>
        currentList.map((p) => (p.id === next.id ? next : p))
      );
      return next;
    });
  };

  // プロジェクト切り替えハンドラー
  const handleSelectProject = (newProject: MMProject) => {
    setProject(newProject);
    if (newProject.id) {
      setActiveProjectId(newProject.id);
    }
    // 切り替え時にチャットに案内メッセージを追加
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        sender: "ai",
        persona: "drama_director",
        text: `シナリオ『${newProject.title}』へ切り替えました（${newProject.playerCount}人用）。\n\n登場人物、タイムライン、証拠の配置、ハンドアウトの壁打ちなど、いつでも対話しながら進めましょう！`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // AIチャット初期メッセージ
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      persona: "drama_director",
      text: "こんにちは！ マーダーミステリー共創ワークベンチ（MM-Workbench）へようこそ！\n\n『深海からの呼び声』の編集はもちろん、上部の「📁 シナリオ管理」から新しく別のシナリオを立ち上げて、登場人物やパズル、タイムラインをゼロから一緒に設計することも可能です。どの作業から進めましょうか？",
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
        replyText = `【論理チェッカー視点】\n「${text}」について論理的検証を行いました。\n・現在のシナリオ『${project.title}』(${project.playerCount}名)のタイムラインと情報開示順序を照合しています。\n・特定プレイヤー1名への多重ロック（動機・機会・手段）および反証可能性のバランスを検討できます。`;
      } else if (persona === "drama_director") {
        replyText = `【ドラマ演出視点】\n「${text}」についてドラマツルギーを検討しました！\n・各PCの「誇り・後ろめたさ・喪失体験」のスロットと連動させ、プレイヤーが自発的に葛藤を抱くハンドアウト展開を構築できます。\n・オープニングからクライマックスに至る緊張曲線の設計を進めましょう。`;
      } else {
        replyText = `【推敲アシスタント視点】\n「${text}」について文章表現を推敲しました。\n・世界観（${project.concept.slice(0, 30)}...）に即した臨場感ある語彙や、プレイヤーが没入しやすい描写を提案します。`;
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
          <button
            onClick={() => setIsProjectManagerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition"
            title="シナリオ・プロジェクト一覧を開く"
          >
            <FolderKanban className="h-4 w-4" />
          </button>
          <div>
            <button
              onClick={() => setIsProjectManagerOpen(true)}
              className="text-left group flex items-center gap-2"
              title="クリックしてシナリオを切り替え・新規作成"
            >
              <h1 className="text-sm font-bold tracking-wide text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                {project.title}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              </h1>
              <span className="text-xs font-normal text-slate-400">― {project.subtitle} ―</span>
            </button>
            <p className="text-[11px] text-indigo-400 font-mono">
              MM-Workbench : {project.playerCount}人用 マダミス・LARP制作
            </p>
          </div>
        </div>

        {/* グローバルナビゲーション（4大分類） ＆ アクション */}
        <div className="flex items-center gap-3">
          {/* シナリオ切り替え・新規作成ボタン */}
          <button
            onClick={() => setIsProjectManagerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/50 bg-indigo-600/20 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-600/30 hover:text-white transition shadow"
            title="別シナリオの新規立ち上げ・切り替え・保存管理"
          >
            <FolderKanban className="h-3.5 w-3.5 text-indigo-400" />
            シナリオ切替・新規作成
          </button>

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
              ① タイムライン ＆ 海図
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
            企画概要
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
                handleUpdateProject((prev) => ({ ...prev, timeline: newTimeline }))
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
                      handleUpdateProject((prev) => ({ ...prev, characters: newChars }))
                    }
                    onUpdateEvidences={(newEvs) =>
                      handleUpdateProject((prev) => ({ ...prev, evidences: newEvs }))
                    }
                  />
                ) : (
                  <HandoutEditor
                    characters={project.characters}
                    onUpdateCharacters={(newChars) =>
                      handleUpdateProject((prev) => ({ ...prev, characters: newChars }))
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

      {/* シナリオ管理・切り替え・新規作成モーダル */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        currentProject={project}
        projects={projects}
        onSelectProject={handleSelectProject}
        onProjectsChange={setProjects}
      />

      {/* 企画概要・プロット紹介モーダル */}
      <SynopsisModal
        project={project}
        isOpen={isSynopsisOpen}
        onClose={() => setIsSynopsisOpen(false)}
        onUpdateProject={handleUpdateProject}
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
                  handleUpdateProject((prev) => ({ ...prev, crypticWords: newWords }))
                }
                onUpdateGrammar={(newGrammar) =>
                  handleUpdateProject((prev) => ({ ...prev, crypticGrammar: newGrammar }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
