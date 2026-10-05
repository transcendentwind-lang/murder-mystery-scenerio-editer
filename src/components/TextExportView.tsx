"use client";

import React, { useState, useRef } from "react";
import { MMProject } from "@/types/schema";
import { Copy, Check, Download, FileText, BookOpen, CheckCheck, RefreshCw } from "lucide-react";
import { copyToClipboard, downloadTextFile } from "@/utils/copyText";

interface TextExportViewProps {
  project: MMProject;
}

export const TextExportView: React.FC<TextExportViewProps> = ({ project }) => {
  const [exportMode, setExportMode] = useState<"synopsis" | "full">("synopsis");
  const [copied, setCopied] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 企画概要・プロット紹介テキストの生成
  const generateSynopsisText = () => {
    let text = `=================================================================\n`;
    text += `【シナリオ企画概要書】\n`;
    text += `タイトル: ${project.title}\n`;
    text += `サブタイトル: ${project.subtitle}\n`;
    text += `プレイ人数: ${project.playerCount}名（GM必須） ｜ 想定時間: 約${project.durationHours}時間\n`;
    text += `=================================================================\n\n`;

    text += `■ 1. 作品コンセプト・世界観\n`;
    text += `${project.concept}\n\n`;

    text += `■ 2. プレイヤー体験（Player Experience）\n`;
    text += `${project.targetExperience}\n\n`;

    text += `■ 3. プロット紹介（あらすじ・真相・解決法）\n`;
    text += `${project.plotSummary}\n\n`;

    text += `■ 4. コアギミック・独自性（生態系捕食 × クジラ言語パズル）\n`;
    text += `${project.gimmickOverview}\n\n`;

    text += `■ 5. 登場人物（海難救助対策チーム 6名）\n`;
    project.characters.forEach((c) => {
      text += `・${c.name} (${c.profession}) [${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}]\n`;
      text += `  概要: ${c.handout.publicProfile}\n`;
      text += `  初期所持品: ${c.initialItems.join("、")}\n`;
      text += `  固有能力: ${c.capabilities.map((cap) => `[Day ${cap.targetPhase}] ${cap.name}`).join("、")}\n\n`;
    });

    text += `■ 6. 7日間のインシデント進行フロー\n`;
    project.timeline.forEach((t) => {
      text += `・Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
      text += `  概要: ${t.incidentOverview}\n`;
    });
    text += `\n=================================================================\n`;

    return text;
  };

  // 完全版シナリオ台本テキストの生成
  const generateFullScriptText = () => {
    let md = `# ${project.title}\n## ${project.subtitle}\n\n`;
    md += `- 想定プレイ時間: ${project.durationHours}時間\n`;
    md += `- プレイヤー人数: ${project.playerCount}名（GM必須）\n\n`;

    md += `## 🌟 作品コンセプト ＆ プロット概要\n`;
    md += `### コンセプト\n${project.concept}\n\n`;
    md += `### プレイヤー体験\n${project.targetExperience}\n\n`;
    md += `### プロット紹介（真相・あらすじ）\n${project.plotSummary}\n\n`;
    md += `### コアギミック\n${project.gimmickOverview}\n\n`;

    md += `## 👥 登場人物一覧（6名）\n\n`;
    project.characters.forEach((c) => {
      md += `### ${c.name} (${c.profession})\n`;
      md += `**配置**: ${c.location === "headquarters" ? "東京司令部" : "小笠原現場"}\n\n`;
      md += `**【イントロダクション】**\n${c.introduction}\n\n`;
      md += `**【固有能力・できること】**\n`;
      c.capabilities.forEach((cap) => {
        md += `- Day ${cap.targetPhase}: **${cap.name}** - ${cap.description}\n`;
      });
      md += `\n**【ハンドアウト本文】**\n${c.handout.handoutBody}\n\n---\n\n`;
    });

    md += `## 📅 7日間タイムライン\n\n`;
    project.timeline.forEach((t) => {
      md += `### Day ${t.dayNumber}: ${t.situationTitle} (${t.locationName} / ${t.distanceKm}km)\n`;
      md += `- **発生事象**: ${t.incidentOverview}\n`;
      md += `- **東京司令部**: ${t.hqResponse}\n`;
      md += `- **現地救難隊**: ${t.fieldResponse}\n\n`;
    });

    md += `## 📋 証拠（エビデンス）マスター一覧\n\n`;
    project.evidences.forEach((e) => {
      const owner = project.characters.find((c) => c.id === e.ownerId);
      md += `### [Day ${e.foundPhase}] ${e.title} (${owner?.name || "全員"})\n`;
      md += `${e.description}\n\n`;
    });

    return md;
  };

  const displayText = exportMode === "synopsis" ? generateSynopsisText() : generateFullScriptText();

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
        : `${project.title}_完全台本.md`;
    downloadTextFile(filename, displayText);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部コントロールバー */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            シナリオテキスト出力 ＆ 企画書ビュー
          </h2>
          <p className="text-xs text-slate-400">
            タイトル、コンセプト、プレイヤー体験、プロット、ギミックをプレーンテキストとして出力・コピーできます
          </p>
        </div>

        {/* モード切り替え ＆ アクションボタン */}
        <div className="flex items-center gap-3">
          {/* 出力モード切り替え */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
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
          </div>

          {/* 全選択ボタン */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            title="下のテキストエリア全体を選択状態にします"
          >
            <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
            {selectedAll ? "全選択しました！" : "テキストを全選択"}
          </button>

          {/* クリップボードコピーボタン */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            {copied ? "コピー完了！" : "クリップボードにコピー"}
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
                : "セッション台本形式 (全HO・タイムライン・証拠・台詞)"}
            </strong>
          </span>
          <span className="text-[11px] text-slate-500">
            ※下のテキスト枠内を直接ドラッグして手動コピー（Ctrl+C / Cmd+C）も可能です
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
