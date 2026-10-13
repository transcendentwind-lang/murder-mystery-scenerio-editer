"use client";

import React, { useState, useRef } from "react";
import { MMProject } from "@/types/schema";
import {
  Copy,
  Check,
  Download,
  FileText,
  BookOpen,
  CheckCheck,
  Users,
  Printer,
  Palette,
  Sparkles,
  Layers,
  Edit3,
  Eye,
} from "lucide-react";
import { copyToClipboard, downloadTextFile } from "@/utils/copyText";
import {
  generateSynopsisPlainText,
  generateSynopsisMarkdown,
  generateFullScriptMarkdown,
  generateHandoutsOnlyMarkdown,
  printDocumentText,
} from "@/utils/scriptGenerator";

interface TextExportViewProps {
  project: MMProject;
  onNavigateToDesignStudio?: () => void;
  onUpdateProject?: (updater: (prev: MMProject) => MMProject) => void;
}

export const TextExportView: React.FC<TextExportViewProps> = ({
  project,
  onNavigateToDesignStudio,
  onUpdateProject,
}) => {
  const [exportMode, setExportMode] = useState<
    "synopsis_overview" | "synopsis" | "handouts" | "full"
  >("synopsis_overview");
  const [ isEditingSynopsis, setIsEditingSynopsis ] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isSynopsisMode =
    exportMode === "synopsis_overview" || exportMode === "synopsis";

  const displayText = isSynopsisMode
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
    const filename = isSynopsisMode
      ? `${project.title}_企画概要・プロット紹介.txt`
      : exportMode === "handouts"
      ? `${project.title}_キャラクターハンドアウト全集.md`
      : `${project.title}_完全台本.md`;
    downloadTextFile(filename, displayText);
  };

  // 印刷処理（A4白背景）
  const handlePrint = () => {
    const docTitle = isSynopsisMode
      ? `${project.title} - 企画概要・プロット紹介`
      : exportMode === "handouts"
      ? `${project.title} - キャラクターハンドアウト全集`
      : `${project.title} - 完全シナリオ台本`;
    const printBody =
      exportMode === "synopsis_overview"
        ? generateSynopsisMarkdown(project)
        : displayText;
    printDocumentText(docTitle, printBody);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部コントロールバー */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            企画概要・プロット紹介 ＆ シナリオ一括台本
          </h2>
          <p className="text-xs text-slate-400">
            企画概要（コンセプト・体験・プロット・ギミック）の閲覧・編集と、完全台本・ハンドアウト全集のA4白背景印刷・保存を行えます
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
          {/* 出力・表示モード切り替え */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setExportMode("synopsis_overview")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
                exportMode === "synopsis_overview"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              企画概要（閲覧・編集）
            </button>
            <button
              onClick={() => setExportMode("synopsis")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                exportMode === "synopsis"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              企画概要テキスト
            </button>
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

          {/* テキストモード時のみ全選択ボタンを表示 */}
          {exportMode !== "synopsis_overview" && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              title="下のテキストエリア全体を選択状態にします"
            >
              <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
              {selectedAll ? "全選択しました！" : "全選択"}
            </button>
          )}

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
            {isSynopsisMode ? ".txt 保存" : ".md 保存"}
          </button>
        </div>
      </div>

      {/* メインコンテンツ領域 */}
      {exportMode === "synopsis_overview" ? (
        <div className="flex flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-6 overflow-y-auto">
          {/* 企画概要サブヘッダー（閲覧 / 編集 切り替え） */}
          <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">
                企画概要・プロット紹介（タイトル／コンセプト／プレイヤー体験／プロット／コアギミック）
              </span>
            </div>
            {onUpdateProject && (
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <button
                  onClick={() => setIsEditingSynopsis(false)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition ${
                    !isEditingSynopsis
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  企画書デザイン表示
                </button>
                <button
                  onClick={() => setIsEditingSynopsis(true)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition ${
                    isEditingSynopsis
                      ? "bg-amber-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  企画概要を直接編集
                </button>
              </div>
            )}
          </div>

          {!isEditingSynopsis ? (
            /* 企画概要 デザインカード閲覧モード */
            <div className="space-y-5 max-w-5xl mx-auto w-full text-xs">
              {/* 基本情報バナー */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  SCENARIO TITLE & LOGLINE
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {project.title}
                  <span className="ml-3 text-sm font-normal text-slate-300">
                    ― {project.subtitle} ―
                  </span>
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-6 text-xs text-indigo-200">
                  <span>
                    プレイ人数: <strong>{project.playerCount}名</strong> (GM必須)
                  </span>
                  <span>
                    想定時間: <strong>約{project.durationHours}時間</strong>
                  </span>
                  <span>
                    ジャンル: 現代クトゥルフ × 災害対策本部 協力型LARP/マダミス
                  </span>
                </div>
              </div>

              {/* 1. コンセプト */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  1. 作品コンセプト ＆ 世界観
                </h4>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-xs">
                  {project.concept}
                </p>
              </div>

              {/* 2. ターゲット体験 */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  2. プレイヤー体験 (Player Experience)
                </h4>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-xs">
                  {project.targetExperience}
                </p>
              </div>

              {/* 3. プロット紹介 */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-400" />
                  3. プロット紹介 (あらすじ・真相・解決法)
                </h4>
                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-xs">
                  {project.plotSummary}
                </div>
              </div>

              {/* 4. コアギミック */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  4. コアギミック ＆ 独自性
                </h4>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-xs">
                  {project.gimmickOverview}
                </p>
              </div>
            </div>
          ) : (
            /* 企画概要 直接編集モード */
            <div className="space-y-4 max-w-5xl mx-auto w-full text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    メインタイトル
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) =>
                      onUpdateProject?.((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    サブタイトル
                  </label>
                  <input
                    type="text"
                    value={project.subtitle}
                    onChange={(e) =>
                      onUpdateProject?.((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-indigo-300 block mb-1">
                  1. 作品コンセプト ＆ 世界観
                </label>
                <textarea
                  value={project.concept}
                  onChange={(e) =>
                    onUpdateProject?.((prev) => ({
                      ...prev,
                      concept: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-300 block mb-1">
                  2. プレイヤー体験 (Player Experience)
                </label>
                <textarea
                  value={project.targetExperience}
                  onChange={(e) =>
                    onUpdateProject?.((prev) => ({
                      ...prev,
                      targetExperience: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-amber-300 block mb-1">
                  3. プロット紹介 (あらすじ・真相・解決法)
                </label>
                <textarea
                  value={project.plotSummary}
                  onChange={(e) =>
                    onUpdateProject?.((prev) => ({
                      ...prev,
                      plotSummary: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-rose-300 block mb-1">
                  4. コアギミック ＆ 独自性
                </label>
                <textarea
                  value={project.gimmickOverview}
                  onChange={(e) =>
                    onUpdateProject?.((prev) => ({
                      ...prev,
                      gimmickOverview: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* メインテキストエリア（画面上に全文がリアルタイム表示） */
        <div className="flex flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 overflow-hidden">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>
              出力フォーマット:{" "}
              <strong className="text-indigo-300">
                {exportMode === "synopsis"
                  ? "企画書テキスト形式 (タイトル・コンセプト・プロット・ギミック・登場人物)"
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
      )}
    </div>
  );
};


