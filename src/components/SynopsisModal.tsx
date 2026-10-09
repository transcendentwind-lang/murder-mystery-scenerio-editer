"use client";

import React, { useState } from "react";
import { MMProject } from "@/types/schema";
import { X, Copy, Check, Download, FileText, Sparkles, BookOpen, Layers, CheckCheck } from "lucide-react";
import { copyToClipboard, downloadTextFile } from "@/utils/copyText";
import { generateSynopsisPlainText } from "@/utils/scriptGenerator";

interface SynopsisModalProps {
  project: MMProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updater: (prev: MMProject) => MMProject) => void;
}

export const SynopsisModal: React.FC<SynopsisModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "raw" | "edit">("raw");

  if (!isOpen) return null;

  const handleCopy = async () => {
    const text = generateSynopsisPlainText(project);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = generateSynopsisPlainText(project);
    downloadTextFile(`${project.title}_企画概要・プロット紹介.txt`, text);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                シナリオ概要 ＆ プロット紹介
                <span className="text-xs font-normal text-slate-400">({project.title})</span>
              </h2>
              <p className="text-xs text-slate-400">
                作品タイトル、コンセプト、ターゲット体験、プロット、ギミックをテキスト出力します
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 mr-2">
              <button
                onClick={() => setActiveTab("raw")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === "raw"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📋 テキスト全文出力
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                  activeTab === "view"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                デザイン表示
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                  activeTab === "edit"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                編集
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "コピー完了！" : "テキストをコピー"}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              title="テキストファイル(.txt)として保存"
            >
              <Download className="h-3.5 w-3.5" />
              .txt 保存
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* モーダルコンテンツ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {activeTab === "raw" ? (
            /* プレーンテキスト全文表示モード */
            <div className="flex h-full flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-300">
                  企画概要・プロット紹介 プレーンテキスト出力
                </span>
                <span className="text-[11px] text-slate-500">
                  ※下のテキストエリア内を直接ドラッグして手動コピー（Cmd+C / Ctrl+C）も可能です
                </span>
              </div>
              <textarea
                value={generateSynopsisPlainText(project)}
                readOnly
                rows={20}
                className="w-full flex-1 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500 selection:bg-indigo-600 selection:text-white"
              />
            </div>
          ) : activeTab === "view" ? (
            /* 閲覧モード */

            <div className="space-y-6">
              {/* 基本情報バナー */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  SCENARIO TITLE & LOGLINE
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {project.title}
                  <span className="ml-2 text-sm font-normal text-slate-300">
                    ― {project.subtitle} ―
                  </span>
                </h3>
                <div className="mt-2 flex items-center gap-4 text-xs text-indigo-200">
                  <span>プレイ人数: <strong>{project.playerCount}名</strong> (GM必須)</span>
                  <span>想定時間: <strong>約{project.durationHours}時間</strong></span>
                  <span>ジャンル: 現代クトゥルフ × 災害対策本部 協力型LARP/マダミス</span>
                </div>
              </div>

              {/* 1. コンセプト */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  1. 作品コンセプト ＆ 世界観
                </h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.concept}
                </p>
              </div>

              {/* 2. ターゲット体験 */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" />
                  2. プレイヤー体験 (Player Experience)
                </h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.targetExperience}
                </p>
              </div>

              {/* 3. プロット紹介 */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  3. プロット紹介 (あらすじ・真相・解決法)
                </h4>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.plotSummary}
                </div>
              </div>

              {/* 4. コアギミック */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                  4. コアギミック ＆ 独自性 (生態系捕食 × クジラ言語パズル)
                </h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.gimmickOverview}
                </p>
              </div>
            </div>
          ) : (
            /* 編集モード */
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">メインタイトル</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">サブタイトル</label>
                <input
                  type="text"
                  value={project.subtitle}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-indigo-300 block mb-1">1. 作品コンセプト</label>
                <textarea
                  value={project.concept}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, concept: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-300 block mb-1">2. プレイヤー体験</label>
                <textarea
                  value={project.targetExperience}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, targetExperience: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-amber-300 block mb-1">3. プロット紹介 (あらすじ・真相)</label>
                <textarea
                  value={project.plotSummary}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, plotSummary: e.target.value }))
                  }
                  rows={8}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-rose-300 block mb-1">4. コアギミックの紹介</label>
                <textarea
                  value={project.gimmickOverview}
                  onChange={(e) =>
                    onUpdateProject((prev) => ({ ...prev, gimmickOverview: e.target.value }))
                  }
                  rows={4}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
