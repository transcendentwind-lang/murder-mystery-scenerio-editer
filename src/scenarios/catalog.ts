import type { MMProject } from '@/types/schema';

export const BUILTIN_SCENARIO_ID = 'project-deep-sea';
export function isBuiltinProject(project: Pick<MMProject, 'id'>) {
  return project.id === BUILTIN_SCENARIO_ID;
}
export function hasBuiltinScenarioFeatures(project: Pick<MMProject, 'id' | 'scenarioPackId'>) {
  return isBuiltinProject(project) || project.scenarioPackId === BUILTIN_SCENARIO_ID;
}
export function scenarioAssetUrl(relativePath: string) {
  const base = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1' ? '/murder-mystery-scenerio-editer' : '';
  return `${base}/scenarios/${BUILTIN_SCENARIO_ID}/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
}
