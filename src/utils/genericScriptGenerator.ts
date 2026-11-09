import type { MMProject } from '@/types/schema';

export function genericSynopsis(project: MMProject) {
  return `# ${project.title}\n\n- プレイヤー人数: ${project.playerCount}名\n- GM: ${project.hasGm ? 'あり' : 'なし'}\n- 想定時間: ${project.durationHours}時間\n\n## コンセプト\n${project.concept}\n\n## 目指す体験\n${project.targetExperience}\n\n## あらすじ・真相\n${project.plotSummary || ''}\n\n## ギミック\n${project.gimmickOverview || ''}\n\n## 登場人物\n${project.characters.map((character) => `### ${character.name}\n${character.profession}\n\n${character.handout.publicProfile}`).join('\n\n')}\n\n## 進行概要\n${project.timeline.map((step) => `### フェーズ ${step.dayNumber}: ${step.situationTitle}\n${step.locationName}\n\n${step.incidentOverview}\n\n${step.hqResponse}\n\n${step.fieldResponse}`).join('\n\n')}`;
}
export function genericHandouts(project: MMProject) {
  return `# ${project.title} — 個人HO\n\n` + project.characters.map((character) => `## ${character.name}\n${character.profession}\n\n### 公開プロフィール\n${character.handout.publicProfile}\n\n### 誇り・信条\n${character.handout.internalDrama.pride}\n\n### 後ろめたさ\n${character.handout.internalDrama.guilt || ''}\n\n### 過去の喪失\n${character.handout.internalDrama.loss}\n\n### 人物概要\n${character.introduction}\n\n### 行動記録\n${character.handout.backgroundTimeline}\n\n### HO本文\n${character.handout.handoutBody}\n\n### GM用指示\n${character.handout.gmActionGuide || ''}`).join('\n\n---\n\n');
}
export function genericFullScript(project: MMProject) {
  let text = `${genericSynopsis(project)}\n\n${genericHandouts(project)}\n\n# 証拠一覧\n\n`;
  text += project.evidences.map((evidence) => `## ${evidence.title}\nフェーズ ${evidence.foundPhase} / ${project.characters.find((character) => character.id === evidence.ownerId)?.name || '全体'}\n\n${evidence.description}\n\n${evidence.acquisitionCondition || ''}\n\n${evidence.glossaryNote || ''}`).join('\n\n');
  text += '\n\n# GM進行メモ\n\n' + project.timeline.map((step) => { const note = project.gmNotes?.[step.dayNumber]; return `## フェーズ ${step.dayNumber}\n${note?.readAloudScript || ''}\n\n${note?.gmCheckpoints?.join('\n') || ''}\n\n${note?.bgmCue || ''}`; }).join('\n\n');
  if (project.crypticWords.length) text += '\n\n# 語彙と組み合わせ\n\n' + project.crypticWords.map((word) => `${word.symbol}: ${word.meaning}`).join('\n') + `\n\n${project.crypticGrammar.ruleDescription}\n${project.crypticGrammar.combinedMessage}`;
  if (project.matrixLinks?.length) text += '\n\n# 情報の対応\n\n' + project.matrixLinks.map((link) => `${link.evidenceId} / ${link.characterId}\n${link.specializedKnowledge}\n${link.derivedConclusion}`).join('\n\n');
  if (project.lockCriteria?.length) text += '\n\n# 検証条件\n\n' + project.lockCriteria.map((criterion) => `${criterion.name}: ${criterion.description}`).join('\n');
  return text;
}
