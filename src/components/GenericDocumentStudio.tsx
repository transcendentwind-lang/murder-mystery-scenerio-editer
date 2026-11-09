"use client";

import { useEffect, useId, useState } from 'react';
import type { Character, EvidenceItem, GmProgressionNote, VisualBoardItem } from '@/types/schema';
import type { DocumentStudioProps } from './DocumentDesignStudio';
import { printDocumentText } from '@/utils/scriptGenerator';

function TextField({ label, value, change, short = false }: { label: string; value?: string; change: (value: string) => void; short?: boolean }) {
  const id = useId();
  const style = 'mt-1 w-full rounded border border-slate-600 bg-slate-900 p-3 text-base text-slate-100';
  return <div className="text-sm text-slate-300"><label htmlFor={id}>{label}</label>{short
    ? <input id={id} className={style} value={value || ''} onChange={(event) => change(event.target.value)} />
    : <textarea id={id} className={style} rows={5} value={value || ''} onChange={(event) => change(event.target.value)} />}</div>;
}

export function GenericDocumentStudio({ project, onUpdateProject, saveError = false }: DocumentStudioProps) {
  const [category, setCategory] = useState<'handouts' | 'evidences' | 'visuals' | 'gm'>('handouts');
  const [selectedId, setSelectedId] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(true);
  const character = project.characters.find((item) => item.id === selectedId) || project.characters[0];
  const evidence = project.evidences.find((item) => item.id === selectedId) || project.evidences[0];
  const visuals = project.visualBoards || [];
  const visual = visuals.find((item) => item.id === selectedId) || visuals[0];
  const step = project.timeline.find((item) => String(item.dayNumber) === selectedId) || project.timeline[0];
  const note: GmProgressionNote | undefined = step ? project.gmNotes?.[step.dayNumber] : undefined;
  const update: typeof onUpdateProject = (updater) => {
    const success = onUpdateProject(updater);
    setSaved(success);
    return success;
  };
  useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        update((previous) => ({ ...previous, updatedAt: new Date().toISOString() }));
      }
    };
    window.addEventListener('keydown', save);
    return () => window.removeEventListener('keydown', save);
  });
  const updateCharacter = (change: (previous: Character) => Character) => character && update((previous) => ({ ...previous, characters: previous.characters.map((item) => item.id === character.id ? change(item) : item) }));
  const updateEvidence = (change: Partial<EvidenceItem>) => evidence && update((previous) => ({ ...previous, evidences: previous.evidences.map((item) => item.id === evidence.id ? { ...item, ...change } : item) }));
  const updateVisual = (change: Partial<VisualBoardItem>) => visual && update((previous) => ({ ...previous, visualBoards: (previous.visualBoards || []).map((item) => item.id === visual.id ? { ...item, ...change } : item) }));
  const updateNote = (change: Partial<GmProgressionNote>) => step && update((previous) => ({ ...previous, gmNotes: { ...previous.gmNotes, [step.dayNumber]: { dayNumber: step.dayNumber, targetMinutes: 0, readAloudScript: '', gmCheckpoints: [], bgmCue: '', ...previous.gmNotes?.[step.dayNumber], ...change } } }));
  const handoutText = character ? `# ${character.name}\n\n${character.profession}\n\n## 公開プロフィール\n${character.handout.publicProfile}\n\n## 誇り・信条\n${character.handout.internalDrama.pride}\n\n## 後ろめたさ\n${character.handout.internalDrama.guilt || ''}\n\n## 過去の喪失\n${character.handout.internalDrama.loss}\n\n## 人物概要\n${character.introduction}\n\n## 行動記録\n${character.handout.backgroundTimeline}\n\n## HO本文\n${character.handout.handoutBody}` : '';
  const text = category === 'handouts' ? handoutText : category === 'evidences' && evidence ? `# ${evidence.title}\n\n${evidence.description}\n\n${evidence.glossaryNote || ''}`
    : category === 'visuals' && visual ? `# ${visual.title}\n\n${visual.subtitle}\n\n${visual.captionBody || ''}` : step ? `# フェーズ ${step.dayNumber}：${step.situationTitle}\n\n${step.incidentOverview}\n\n## 進行\n${step.hqResponse}\n\n${step.fieldResponse}\n\n## 読み上げ文\n${note?.readAloudScript || ''}\n\n## 確認事項\n${(note?.gmCheckpoints || []).join('\n')}\n\n${note?.bgmCue || ''}` : '';
  const items = category === 'handouts' ? project.characters.map((item) => ({ id: item.id, title: item.name }))
    : category === 'evidences' ? project.evidences.map((item) => ({ id: item.id, title: item.title }))
    : category === 'visuals' ? visuals.map((item) => ({ id: item.id, title: item.title }))
    : project.timeline.map((item) => ({ id: String(item.dayNumber), title: `フェーズ ${item.dayNumber}：${item.situationTitle}` }));
  const activeId = category === 'handouts' ? character?.id : category === 'evidences' ? evidence?.id : category === 'visuals' ? visual?.id : step && String(step.dayNumber);
  const add = () => {
    const id = `${category}-${Date.now()}`;
    if (category === 'evidences') update((previous) => ({ ...previous, evidences: [...previous.evidences, { id, title: '新規証拠', description: '', ownerId: 'all', foundPhase: 1, visibility: 'public', category: 'document' }] }));
    else if (category === 'visuals') update((previous) => ({ ...previous, visualBoards: [...(previous.visualBoards || []), { id, title: '新規画像資料', subtitle: '', boardType: 'custom_image', dayNumber: 1 }] }));
    setSelectedId(id);
  };
  const upload = (file?: File) => {
    if (!file || !visual) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('画像はPNG・JPEG・WebPを選択。'); return; }
    const reader = new FileReader();
    reader.onload = () => { updateVisual({ imageUrl: String(reader.result) }); setError(''); };
    reader.onerror = () => setError('画像を読み込めなかった。');
    reader.readAsDataURL(file);
  };
  return <div className="flex h-full flex-col overflow-hidden text-slate-100">
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-700 bg-slate-900 p-4">
      {([['handouts', '個人HO'], ['evidences', '証拠資料'], ['visuals', '画像資料'], ['gm', 'GM進行資料']] as const).map(([id, title]) => <button key={id} aria-pressed={category === id} className={`rounded px-4 py-2 ${category === id ? 'bg-indigo-600' : 'bg-slate-800'}`} onClick={() => { setCategory(id); setSelectedId(''); }}>{title}</button>)}
      <button className="rounded border border-slate-500 px-4 py-2" onClick={() => setEditing(!editing)}>{editing ? 'プレビューに切替' : '編集に切替'}</button>
      <button disabled={!text} className="rounded bg-emerald-700 px-4 py-2 disabled:opacity-50" onClick={() => printDocumentText(project.title, text, category === 'visuals' ? visual?.imageUrl : undefined)}>表示資料を印刷・PDF保存</button>
      <button className="rounded bg-indigo-700 px-4 py-2" onClick={() => update((previous) => previous)}>保存</button>
      <span role={saveError || error ? 'alert' : 'status'} className="text-sm">{error || (saveError ? '保存失敗：変更は未保存' : saved ? '保存完了' : '変更は自動保存')}</span>
    </div>
    <div className="grid min-h-0 flex-1 grid-cols-4 gap-4 p-4">
      <aside className="overflow-auto space-y-2">
        {(category === 'evidences' || category === 'visuals') && <button className="w-full rounded bg-indigo-700 p-3" onClick={add}>資料を追加</button>}
        {items.map((item) => <button key={item.id} aria-pressed={activeId === item.id} className={`w-full rounded border p-3 text-left text-sm ${activeId === item.id ? 'border-indigo-400 bg-indigo-950' : 'border-slate-700'}`} onClick={() => setSelectedId(item.id)}>{item.title}</button>)}
        {items.length === 0 && <p className="p-3 text-sm text-slate-400">資料は未作成。追加して作成。</p>}
      </aside>
      <div className="col-span-3 overflow-auto rounded border border-slate-700 p-5 space-y-5">
        {editing ? <>
          {category === 'handouts' && character && <>
            <TextField label="氏名" short value={character.name} change={(name) => updateCharacter((item) => ({ ...item, name }))} />
            <TextField label="肩書・職業" short value={character.profession} change={(profession) => updateCharacter((item) => ({ ...item, profession }))} />
            <TextField label="公開プロフィール" value={character.handout.publicProfile} change={(publicProfile) => updateCharacter((item) => ({ ...item, handout: { ...item.handout, publicProfile } }))} />
            {(['pride', 'guilt', 'loss'] as const).map((key) => <TextField key={key} label={{ pride: '誇り・信条', guilt: '後ろめたさ', loss: '過去の喪失' }[key]} value={character.handout.internalDrama[key]} change={(value) => updateCharacter((item) => ({ ...item, handout: { ...item.handout, internalDrama: { ...item.handout.internalDrama, [key]: value } } }))} />)}
            <TextField label="人物概要" value={character.introduction} change={(introduction) => updateCharacter((item) => ({ ...item, introduction }))} />
            {(['backgroundTimeline', 'handoutBody', 'gmActionGuide'] as const).map((key) => <TextField key={key} label={{ backgroundTimeline: '行動記録', handoutBody: 'HO本文', gmActionGuide: 'GM用指示' }[key]} value={character.handout[key]} change={(value) => updateCharacter((item) => ({ ...item, handout: { ...item.handout, [key]: value } }))} />)}
          </>}
          {category === 'evidences' && evidence && <><TextField short label="証拠の題名" value={evidence.title} change={(title) => updateEvidence({ title })} /><TextField label="証拠本文" value={evidence.description} change={(description) => updateEvidence({ description })} /><TextField label="用語解説" value={evidence.glossaryNote} change={(glossaryNote) => updateEvidence({ glossaryNote })} /></>}
          {category === 'visuals' && visual && <><TextField short label="画像資料の題名" value={visual.title} change={(title) => updateVisual({ title })} /><TextField label="説明" value={visual.captionBody} change={(captionBody) => updateVisual({ captionBody })} /><label className="block">画像を選択<input className="mt-2 block" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => upload(event.target.files?.[0])} /></label>{visual.imageUrl && <><img className="max-w-full bg-white" src={visual.imageUrl} alt={visual.title} /><a className="text-cyan-300 underline" href={visual.imageUrl} download={`${visual.title}.png`}>画像をダウンロード</a></>}</>}
          {category === 'gm' && step && <><h2 className="font-bold">{step.situationTitle}</h2><TextField label="読み上げ文" value={note?.readAloudScript} change={(readAloudScript) => updateNote({ readAloudScript })} /><TextField label="確認事項（1行に1項目）" value={note?.gmCheckpoints.join('\n')} change={(value) => updateNote({ gmCheckpoints: value.split('\n') })} /><TextField short label="音楽・演出メモ" value={note?.bgmCue} change={(bgmCue) => updateNote({ bgmCue })} /></>}
        </> : <article className="bg-white p-6 text-slate-950"><pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{text || '資料は未作成'}</pre>{category === 'visuals' && visual?.imageUrl && <img src={visual.imageUrl} alt={visual.title} className="max-w-full" />}</article>}
      </div>
    </div>
  </div>;
}
