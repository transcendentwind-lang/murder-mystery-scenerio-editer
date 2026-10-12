"use client";

import React, { useState, useRef } from "react";
import { MMProject } from "@/types/schema";
import { Copy, Check, Download, FileText, BookOpen, CheckCheck, Users, Printer, Palette } from "lucide-react";
import { copyToClipboard, downloadTextFile } from "@/utils/copyText";
import {
  generateSynopsisPlainText,
  generateFullScriptMarkdown,
  generateHandoutsOnlyMarkdown,
  printDocumentText,
} from "@/utils/scriptGenerator";

interface TextExportViewProps {
  project: MMProject;
  onNavigateToDesignStudio?: () => void;
}

export const TextExportView: React.FC<TextExportViewProps> = ({
  project,
  onNavigateToDesignStudio,
}) => {
  const [exportMode, setExportMode] = useState<"synopsis" | "handouts" | "full">("full");
  const [copied, setCopied] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const displayText =
    exportMode === "synopsis"
      ? generateSynopsisPlainText(project)
      : exportMode === "handouts"
      ? generateHandoutsOnlyMarkdown(project)
      : generateFullScriptMarkdown(project);

  // コピー処理
  const handleCopy = async () => {
    const success = await copyToClipboard(displayText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 全選択処理
  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setSelectedAll(true);
      setTimeout(() => setSelectedAll(false), 2000);
    }
  };

  // ダウンロード処理
  const handleDownload = () => {
    const filename =
      exportMode === "synopsis"
        ? `${project.title}_企画概要・プロット紹介.txt`
        : exportMode === "handouts"
        ? `${project.title}_キャラクターハンドアウト全集.md`
        : `${project.title}_完全台本.md`;
    downloadTextFile(filename, displayText);
  };

  // 印刷処理（A4白背景）
  const handlePrint = () => {
    const docTitle =
      exportMode === "synopsis"
        ? `${project.title} - 企画概要・プロット紹介`
        : exportMode === "handouts"
        ? `${project.title} - キャラクターハンドアウト全集`
        : `${project.title} - 完全シナリオ台本`;
    printDocumentText(docTitle, displayText);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部コントロールバー */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            シナリオ台本出力 ＆ 印刷・保存ビュー
          </h2>
          <p className="text-xs text-slate-400">
            完全台本・キャラクターハンドアウト・企画概要をワンクリックでA4白背景印刷、コピー、ファイル保存できます
          </p>
        </div>

        {/* モード切り替え ＆ アクションボタン */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToDesignStudio && (
            <button
              onClick={onNavigateToDesignStudio}
              className="flex items-center gap-1.5 rounded-lg border border-pink-500/50 bg-pink-950/50 px-3 py-1.5 text-xs font-bold text-pink-200 hover:bg-pink-900/70 hover:text-white transition shadow"
            >
              <Palette className="h-3.5 w-3.5 text-pink-400" />
              🎨 デザイン資料作成・編集画面へ
            </button>
          )}
          {/* 出力モード切り替え */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setExportMode("full")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                exportMode === "full"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              完全台本（全HO・証拠）
            </button>
            <button
              onClick={() => setExportMode("handouts")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                exportMode === "handouts"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              ハンドアウト全集のみ
            </button>
            <button
              onClick={() => setExportMode("synopsis")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                exportMode === "synopsis"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              企画概要・プロット紹介
            </button>
          </div>

          {/* 印刷ボタン（A4白背景） */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30"
            title="A4白背景で見やすく整形してプリンター印刷・PDF保存します"
          >
            <Printer className="h-4 w-4" />
            🖨️ この内容を印刷する
          </button>

          {/* 全選択ボタン */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            title="下のテキストエリア全体を選択状態にします"
          >
            <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
            {selectedAll ? "全選択しました！" : "全選択"}
          </button>

          {/* クリップボードコピーボタン */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            {copied ? "コピー完了！" : "コピー"}
          </button>

          {/* ファイルダウンロードボタン */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            title="テキストファイルとしてパソコンに保存"
          >
            <Download className="h-3.5 w-3.5" />
            {exportMode === "synopsis" ? ".txt 保存" : ".md 保存"}
          </button>
        </div>
      </div>

      {/* メインテキストエリア（画面上に全文がリアルタイム表示） */}
      <div className="flex flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-hidden">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>
            出力フォーマット:{" "}
            <strong className="text-indigo-300">
              {exportMode === "synopsis"
                ? "企画書形式 (タイトル・コンセプト・プロット・ギミック・登場人物)"
                : exportMode === "handouts"
                ? `キャラクターハンドアウト全集 (${project.playerCount}名編成)`
                : "完全シナリオ台本形式 (全HO・7日間タイムライン・全アクション詳細・全証拠・暗号パズル)"}
            </strong>
          </span>
          <span className="text-[11px] text-slate-500">
            ※「🖨️ この内容を印刷する」を押すと、白背景の読みやすいA4レイアウトで印刷・PDF保存できます
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={displayText}
          readOnly
          className="flex-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-indigo-500 selection:bg-indigo-600 selection:text-white resize-none"
        />
      </div>
    </div>
  );
};

