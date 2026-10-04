"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, ShieldAlert, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export type PersonaType = "logic_checker" | "drama_director" | "script_editor";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  persona?: PersonaType;
  text: string;
  timestamp: string;
}

interface AiChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, persona: PersonaType) => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  messages,
  onSendMessage,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("drama_director");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  React.useEffect(() => {
    if (externalPrompt) {
      setInputPrompt(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, onClearExternalPrompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;
    onSendMessage(inputPrompt, selectedPersona);
    setInputPrompt("");
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center justify-between border-r border-slate-800 bg-slate-900/90 py-4 text-slate-400">
        <button
          onClick={() => setIsCollapsed(false)}
          className="rounded p-2 text-indigo-400 hover:bg-slate-800 hover:text-white transition"
          title="AIチャットを展開"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="rotate-90 text-[10px] font-bold tracking-widest uppercase text-slate-500 whitespace-nowrap">
          AI Co-Writer
        </span>
        <Bot className="h-5 w-5 text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-800 bg-slate-900/90 text-slate-100">
      {/* チャットヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-800 p-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-xs text-white">AI Co-Writer（共創パートナー）</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white transition p-1"
          title="折りたたむ"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* ペルソナ選択タブ */}
      <div className="grid grid-cols-3 gap-1 border-b border-slate-800 bg-slate-950 p-1.5 text-[10px]">
        <button
          onClick={() => setSelectedPersona("drama_director")}
          className={`flex items-center justify-center gap-1 rounded py-1 font-semibold transition ${
            selectedPersona === "drama_director"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          ドラマ演出
        </button>
        <button
          onClick={() => setSelectedPersona("logic_checker")}
          className={`flex items-center justify-center gap-1 rounded py-1 font-semibold transition ${
            selectedPersona === "logic_checker"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldAlert className="h-3 w-3" />
          論理検証
        </button>
        <button
          onClick={() => setSelectedPersona("script_editor")}
          className={`flex items-center justify-center gap-1 rounded py-1 font-semibold transition ${
            selectedPersona === "script_editor"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="h-3 w-3" />
          推敲担当
        </button>
      </div>

      {/* メッセージ履歴エリア */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs leading-relaxed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 shadow-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-950 text-slate-200"
              }`}
            >
              {msg.persona && msg.sender === "ai" && (
                <div className="mb-1 text-[10px] font-bold text-indigo-400">
                  {msg.persona === "drama_director"
                    ? "【ドラマ演出】"
                    : msg.persona === "logic_checker"
                    ? "【論理チェッカー】"
                    : "【推敲アシスタント】"}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
            <span className="mt-1 text-[9px] text-slate-500">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* クイックプロンプト */}
      <div className="border-t border-slate-800 bg-slate-950 p-2 space-y-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          クイック相談:
        </span>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setInputPrompt("クジラ言語パズルの6人の情報分散に抜け漏れがないか確認して")}
            className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-700"
          >
            パズル検証
          </button>
          <button
            onClick={() => setInputPrompt("Day 5の自衛隊魚雷迎撃失敗の描写をもっと緊迫感ある文章にして")}
            className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-700"
          >
            Day 5演出強化
          </button>
        </div>
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-2.5 bg-slate-900">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="AIに相談・壁打ち..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
