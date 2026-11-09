export interface InvestigationChoice { tokyo: string; field: string[] }
export type InvestigationSelections = Record<number, InvestigationChoice>;

/** 変更した日より後にある、重複して実行できなくなった調査だけを解除する。 */
export function reconcileInvestigations(selections: InvestigationSelections, changedDay: number) {
  const result: InvestigationSelections = {};
  const usedTokyo = new Set<string>();
  const usedField = new Set<string>();
  const clearedDays: number[] = [];
  for (const day of Object.keys(selections).map(Number).sort((a, b) => a - b)) {
    const original = selections[day];
    const choice = day <= changedDay ? original : {
      tokyo: usedTokyo.has(original.tokyo) ? "" : original.tokyo,
      field: original.field.filter((id) => !usedField.has(id)),
    };
    if (choice.tokyo !== original.tokyo || choice.field.length !== original.field.length) clearedDays.push(day);
    result[day] = choice;
    if (choice.tokyo) usedTokyo.add(choice.tokyo);
    choice.field.forEach((id) => usedField.add(id));
  }
  return { selections: result, clearedDays };
}

export function toggleInvestigation(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids.slice(-1), id];
}
