"use client";

import { useEffect, useState } from "react";
import manifest from "../../assets/scenarios/project-deep-sea/manifest.json";
import { scenarioAssetUrl } from "@/scenarios/catalog";

import { downloadTextFile } from "@/utils/copyText";

const kinds: Record<string, string> = { release: "現行資料", source: "編集原本・手順", reference: "比較用保管資料", guide: "資料案内" };
export function ScenarioMaterialLibrary() {
  const [recovery, setRecovery] = useState<string | null>(null);
  useEffect(() => { try { setRecovery(localStorage.getItem("mm_workbench_builtin_recovery_v1")); } catch { /* 参照不能 */ } }, []);
  const [downloadError, setDownloadError] = useState('');
  const download = async (file: (typeof manifest.files)[number]) => {
    try {
      setDownloadError('');
      const response = await fetch(scenarioAssetUrl(file.path));
      if (!response.ok) throw new Error(String(response.status));
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.path.split('/').at(-1) || file.id;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch { setDownloadError('ダウンロードできませんでした。別画面で参照するか、再度ダウンロードしてください。'); }
  };
  const [previewText, setPreviewText] = useState('');
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const files = manifest.files.filter((file) => (filter === "all" || file.kind === filter) && `${file.title} ${file.path}`.toLowerCase().includes(query.toLowerCase()));
  const selected = manifest.files.find((file) => file.path === selectedPath);
  useEffect(() => {
    if (!selected || !['md', 'json'].includes(selected.format)) return;
    const controller = new AbortController();
    setPreviewText('読み込み中…');
    fetch(scenarioAssetUrl(selected.path), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.text(); })
      .then(setPreviewText)
      .catch((error) => { if (error.name !== 'AbortError') setPreviewText('プレビューを取得できませんでした。別画面で参照するか、ダウンロードして確認してください。'); });
    return () => controller.abort();
  }, [selected]);
  return <section className="flex h-full flex-col overflow-hidden bg-slate-950 p-5 text-slate-100" aria-label="作品資料ファイル一覧">
    <h2 className="text-lg font-bold">作品資料ファイル一覧</h2>
    <p className="my-2 text-sm text-slate-300">現行の配布物・編集原本・比較用保管資料をすべて確認できます。比較用資料は現行版とは限りません。</p>
    {recovery && <button className="mb-3 w-fit rounded border border-slate-500 p-2 text-sm" onClick={() => downloadTextFile('previous-builtin-data.json', recovery)}>旧ブラウザー保存データを書き出す</button>}
    {downloadError && <p role="alert" className="mb-2 text-red-300">{downloadError}</p>}
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <label className="text-sm">区分<select aria-label="資料の区分" className="ml-2 rounded bg-slate-800 p-2" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">すべて（{manifest.files.length}件）</option>{Object.entries(kinds).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="text-sm">検索<input className="ml-2 rounded bg-slate-800 p-2" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <span role="status" className="text-sm">{files.length}件</span>
    </div>
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <ul className="space-y-2 overflow-auto" aria-label="資料一覧">
        {files.map((file) => <li key={file.id} data-material-path={file.path} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
          <div className="text-xs text-cyan-300">{kinds[file.kind]} · {file.format.toUpperCase()}</div>
          <h3 className="my-1 font-semibold">{file.title}</h3>
          <p className="break-all text-xs text-slate-400">{file.path.split('/').at(-1)}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <button className="text-cyan-300 underline" onClick={() => setSelectedPath(file.path)}>プレビュー</button>
            <a href={scenarioAssetUrl(file.path)} target="_blank" rel="noreferrer" className="text-cyan-300 underline">別画面で参照</a>
            <a href={scenarioAssetUrl(file.path)} download={file.path.split('/').at(-1)} onClick={(event) => { event.preventDefault(); void download(file); }} className="text-emerald-300 underline">ダウンロード</a>
          </div>
        </li>)}
      </ul>
      <div className="min-h-64 overflow-auto rounded-lg border border-slate-700 bg-white p-3 text-slate-950">
        {selected ? <><h3 className="mb-3 font-bold">{selected.title}</h3>{['svg', 'jpg', 'png'].includes(selected.format)
          ? <img src={scenarioAssetUrl(selected.path)} alt={selected.title} className="h-auto w-full" />
          : ['md', 'json'].includes(selected.format) ? <pre data-material-text className="whitespace-pre-wrap break-words text-sm leading-relaxed">{previewText}</pre> : <iframe title={`資料プレビュー：${selected.title}`} src={scenarioAssetUrl(selected.path)} className="h-[65vh] w-full" />}</>
          : <p>資料の「プレビュー」を押すと内容を表示します。</p>}
      </div>
    </div>
  </section>;
}
