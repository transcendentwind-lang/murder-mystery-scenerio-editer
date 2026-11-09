"use client";
import { useState } from 'react';
import { FileText, Users } from 'lucide-react';
import type { MMProject } from '@/types/schema';

export function ReadonlyProjectView({ project }: { project: MMProject }) {
  const [tab, setTab] = useState<'characters' | 'evidences'>('characters');
  const [selectedId, setSelectedId] = useState(project.characters[0]?.id);
  const character = project.characters.find((item) => item.id === selectedId) || project.characters[0];
  const block = (label: string, body?: string) => <section className="rounded-lg border border-slate-700 bg-slate-900 p-4"><h3 className="mb-2 font-bold text-indigo-200">{label}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{body || '未設定'}</p></section>;
  return <div className="h-full overflow-auto p-6 text-slate-100">
    <p className="mb-4 rounded border border-cyan-700 bg-cyan-950 p-3 text-sm">組み込み作品は閲覧専用です</p>
    <nav className="mb-4 flex w-fit flex-wrap gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1" aria-label="閲覧対象">
      <button
        type="button"
        aria-pressed={tab === 'characters'}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${tab === 'characters' ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        onClick={() => setTab('characters')}
      >
        <Users className="h-4 w-4" aria-hidden="true" /> 登場人物・HO
      </button>
      <button
        type="button"
        aria-pressed={tab === 'evidences'}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${tab === 'evidences' ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400/50' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        onClick={() => setTab('evidences')}
      >
        <FileText className="h-4 w-4" aria-hidden="true" /> 証拠一覧
      </button>
    </nav>
    {tab === 'characters' ? <><label>登場人物<select className="mb-4 ml-3 rounded bg-slate-800 p-2" value={character?.id || ''} onChange={(e) => setSelectedId(e.target.value)}>{project.characters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {character && <div className="grid gap-4 lg:grid-cols-2">{block('所属・肩書', character.profession)}{block('公開プロフィール', character.handout.publicProfile)}{block('誇り・信条', character.handout.internalDrama.pride)}{block('過去の喪失', character.handout.internalDrama.loss)}{block('人物概要', character.introduction)}{block('行動記録', character.handout.backgroundTimeline)}{block('HO本文', character.handout.handoutBody)}{block('GM用指示', character.handout.gmActionGuide)}</div>}</>
      : <div className="space-y-4">{project.evidences.map((item) => <article key={item.id} className="rounded-lg border border-slate-700 p-4"><h3 className="font-bold text-indigo-200">{item.title}</h3><p className="my-2 text-xs text-slate-400">フェーズ {item.foundPhase} · {project.characters.find((c) => c.id === item.ownerId)?.name || '全体'} · {item.visibility}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>{item.glossaryNote && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{item.glossaryNote}</p>}</article>)}</div>}
  </div>;
}
