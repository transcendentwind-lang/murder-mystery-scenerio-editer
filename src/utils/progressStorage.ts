export const PROGRESS_STORAGE_PREFIX = "mm_workbench_progress_v1:";

type Entry = { value: unknown; initial: unknown; listeners: Set<() => void> };
const entries = new Map<string, Entry>();

export function progressKey(projectId: string | undefined, field: string) {
  return `${PROGRESS_STORAGE_PREFIX}${encodeURIComponent(projectId || "default")}:${field}`;
}

function entryFor<T>(key: string, initial: T): Entry {
  let entry = entries.get(key);
  if (!entry) {
    let value: unknown = initial;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) value = JSON.parse(raw);
    } catch { /* 保存できない環境でも画面内の状態は保持する。 */ }
    entry = { value, initial, listeners: new Set() };
    entries.set(key, entry);
  }
  return entry;
}

export function readProgress<T>(key: string, initial: T): T {
  return entryFor(key, initial).value as T;
}

export function subscribeProgress<T>(key: string, initial: T, listener: () => void) {
  const entry = entryFor(key, initial);
  entry.listeners.add(listener);
  return () => { entry.listeners.delete(listener); };
}

export function writeProgress<T>(key: string, value: T): boolean {
  const entry = entryFor(key, value);
  entry.value = value;
  let saved = false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    saved = true;
  } catch {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("progress-save-error"));
    }
  }
  entry.listeners.forEach((listener) => listener());
  return saved;
}

// 人数構成は設定として保持し、未表示の画面に保存された進行も初期化する。
export function resetProjectProgress(projectId: string | undefined): boolean {
  const prefix = progressKey(projectId, "");
  const isTarget = (key: string) => key.startsWith(prefix) && key !== progressKey(projectId, "playerCount");
  let saved = true;
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key && isTarget(key)) localStorage.removeItem(key);
  } catch {
    saved = false;
    window.dispatchEvent(new Event("progress-save-error"));
  }
  const changed = Array.from(entries).filter(([key]) => isTarget(key)).map(([, entry]) => entry);
  // 全値の更新後に通知し、共有する画面で新旧の進行が混在しないようにする。
  changed.forEach((entry) => { entry.value = entry.initial; });
  changed.forEach((entry) => entry.listeners.forEach((listener) => listener()));
  return saved;
}
