"use client";

import { useProjectProgress } from "./useProjectProgress";
import { InvestigationSelections, reconcileInvestigations, toggleInvestigation } from "@/utils/investigationSelections";

export function useInvestigationSelections(projectId: string | undefined, initial: InvestigationSelections) {
  const [selections, setSelections] = useProjectProgress(projectId, "investigations", initial);
  const change = (day: number, group: "tokyo" | "field", value: string) => {
    const previous = selections[day];
    if (group === "tokyo" && previous.tokyo === value) return;
    const next = { ...selections, [day]: { ...previous,
      [group]: group === "field" ? toggleInvestigation(previous.field, value) : value,
    } };
    const reconciled = reconcileInvestigations(next, day);
    if (reconciled.clearedDays.length > 0 && !window.confirm(
      `この変更でDay ${reconciled.clearedDays.join("・")}の一部の調査が選べなくなります。翌日以降の無効な選択を解除して変更しますか？\nキャンセルすると、変更前の選択を保持します。`
    )) return;
    setSelections(reconciled.selections);
  };
  return { selections, change };
}
