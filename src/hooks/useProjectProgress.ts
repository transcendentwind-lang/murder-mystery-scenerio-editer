"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { progressKey, readProgress, subscribeProgress, writeProgress } from "@/utils/progressStorage";

// サーバー・初回描画では初期値を使い、保存値はReactの外部ストアとして復元する。
export function useProjectProgress<T>(projectId: string | undefined, field: string, initial: T) {
  const initialRef = useRef(initial);
  const key = progressKey(projectId, field);
  const subscribe = useCallback((listener: () => void) => subscribeProgress(key, initialRef.current, listener), [key]);
  const snapshot = useCallback(() => readProgress(key, initialRef.current), [key]);
  const serverSnapshot = useCallback(() => initialRef.current, []);
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const setValue = useCallback((update: T | ((previous: T) => T)) => {
    const previous = readProgress(key, initialRef.current);
    const next = typeof update === "function" ? (update as (previous: T) => T)(previous) : update;
    writeProgress(key, next);
  }, [key]);
  return [value, setValue] as const;
}

export interface ProgressTimer { elapsedMs: number; startedAt: number | null }
export function elapsedTimerMs(timer: ProgressTimer, now: number) {
  return timer.elapsedMs + (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt));
}

export function useProjectTimer(projectId: string | undefined) {
  const [timer, setTimer] = useProjectProgress<ProgressTimer>(projectId, "timer", { elapsedMs: 0, startedAt: null });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (timer.startedAt === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timer.startedAt]);
  const toggleTimer = () => {
    const at = Date.now();
    setNow(at);
    setTimer((previous) => previous.startedAt === null
      ? { ...previous, startedAt: at }
      : { elapsedMs: elapsedTimerMs(previous, at), startedAt: null });
  };
  const resetTimer = () => setTimer({ elapsedMs: 0, startedAt: null });
  return { timerSeconds: Math.floor(elapsedTimerMs(timer, now) / 1000), isTimerRunning: timer.startedAt !== null, toggleTimer, resetTimer };
}
