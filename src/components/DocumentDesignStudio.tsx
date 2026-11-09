"use client";
import type { MMProject } from '@/types/schema';
import { isBuiltinProject } from '@/scenarios/catalog';
import { BuiltinDistributionStudio } from '@/scenarios/project-deep-sea/DistributionStudio';
import { GenericDocumentStudio } from './GenericDocumentStudio';

export interface DocumentStudioProps {
  project: MMProject;
  onUpdateProject: (update: MMProject | ((previous: MMProject) => MMProject)) => boolean;
  saveError?: boolean;
  onSendAiPrompt?: (prompt: string) => void;
}
export function DocumentDesignStudio(props: DocumentStudioProps) {
  return isBuiltinProject(props.project) ? <BuiltinDistributionStudio {...props} onUpdateProject={() => false} /> : <GenericDocumentStudio {...props} />;
}
