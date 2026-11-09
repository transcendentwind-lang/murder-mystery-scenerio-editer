export const PROGRESS_STORAGE_PREFIX = "mm_workbench_progress_v1:";

type Entry = { value: unknown; listeners: Set<() => void> };
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
    entry = { value, listeners: new Set() };
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
