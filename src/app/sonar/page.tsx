"use client";

import React, { useState, useEffect } from "react";
import { initialProject } from "@/utils/initialProjectData";
import { WhaleSonarMobileApp } from "@/components/WhaleSonarMobileApp";
import { Lock, Waves, KeyRound, AlertCircle, LogOut } from "lucide-react";

const ACCESS_PASSWORD = "whale-study";
const STORAGE_AUTH_KEY = "mm_sonar_player_auth_v1";

export default function SonarStandalonePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved === ACCESS_PASSWORD) {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = passwordInput.trim();
    if (cleaned === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg("");
      try {
        localStorage.setItem(STORAGE_AUTH_KEY, ACCESS_PASSWORD);
      } catch {
        // ignore
      }
    } else {
      setErrorMsg("パスワードが正しくありません。");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    try {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {
      // ignore
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center text-cyan-400 text-xs font-mono">
        読み込み中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-full max-w-sm rounded-3xl border-2 border-cyan-500/30 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/60 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Waves className="h-6 w-6" />
            </div>
            <h1 className="text-base font-extrabold tracking-wider text-white">
              クジラ音響解読・発信端末
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              端末にアクセスするにはパスワードを入力してください。
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                アクセスパスワード
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="パスワードを入力..."
                autoFocus
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-indigo-600 py-3 px-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              ロックを解除して端末を開く
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950">
      <WhaleSonarMobileApp
        words={initialProject.crypticWords}
        grammar={initialProject.crypticGrammar}
        standalone={true}
      />
      <div className="pb-6 flex justify-center bg-slate-950">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400 hover:border-slate-700 hover:text-slate-200 transition"
        >
          <LogOut className="h-3 w-3" />
          パスワード画面に戻す（ロック）
        </button>
      </div>
    </div>
  );
}
