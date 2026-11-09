"use client";

import { useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { resetProjectProgress } from "@/utils/progressStorage";

export function ResetProgressButton({ projectId, projectTitle }: { projectId?: string; projectTitle: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => { setMessage(""); dialogRef.current?.showModal(); }}
        className="flex items-center gap-1.5 rounded border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-900/60">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        進行をリセット
      </button>
      <span role="status" className="text-xs text-slate-300">{message}</span>
      <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId}
        className="max-w-lg rounded-xl border border-slate-600 bg-slate-900 p-6 text-slate-100 shadow-xl overscroll-contain backdrop:bg-black/70 backdrop:overflow-hidden backdrop:overscroll-contain">
        <h2 id={titleId} className="mb-3 text-lg font-bold">進行をリセットしますか？</h2>
        <p id={descriptionId} className="text-sm leading-relaxed">
          「{projectTitle}」の進行を最初の状態に戻します。GM進行・フェーズ画面の調査選択や分岐、入力した作戦名などを初期化し、タイマーを停止して0に戻します。作品本文・資料・人数設定と、ほかの作品の進行は保持します。この操作は取り消せません。
        </p>
        <form method="dialog" className="mt-5 flex justify-end gap-3">
          <button autoFocus className="rounded border border-slate-500 px-4 py-2">キャンセル</button>
          <button type="button" className="rounded bg-red-700 px-4 py-2 font-bold hover:bg-red-600" onClick={() => {
            dialogRef.current?.close();
            const saved = resetProjectProgress(projectId);
            setMessage(saved ? "進行をリセットしました。" : "画面内の進行をリセットしましたが、保存に失敗しました。再読み込みすると以前の進行が復元される場合があります。");
          }}>リセットする</button>
        </form>
      </dialog>
    </div>
  );
}
