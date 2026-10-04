"use client";

import React, { useState, useEffect, useRef } from "react";
import { audioEngine } from "@/utils/audioSynth";
import {
  Volume2,
  VolumeX,
  Play,
  Activity,
  Sliders,
  Layers,
  HelpCircle,
} from "lucide-react";

export const AudioSimulator: React.FC = () => {
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [activeWordPlaying, setActiveWordPlaying] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // アンビエントトグル
  const handleToggleAmbient = () => {
    if (!audioEngine) return;
    const nextState = audioEngine.toggleAmbient();
    setIsAmbientOn(nextState);
  };

  // 単語再生
  const handlePlayWord = async (wordId: string) => {
    if (!audioEngine) return;
    setActiveWordPlaying(wordId);
    await audioEngine.playWordSound(wordId, speedMultiplier);
    setActiveWordPlaying(null);
  };

  // 全文再生
  const handlePlayFullSequence = async () => {
    if (!audioEngine) return;
    setActiveWordPlaying("sequence");
    await audioEngine.playMessageSequence(
      ["word-enemy", "word-prey", "word-gather"],
      speedMultiplier
    );
    setActiveWordPlaying(null);
  };

  // Canvas波形描画ループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = audioEngine?.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
      }

      ctx.fillStyle = "rgb(2, 6, 23)"; // slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // グリッド線
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(30, 41, 59, 0.6)"; // slate-800
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // 波形ライン
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#818cf8"; // indigo-400
      ctx.shadowColor = "#6366f1";
      ctx.shadowBlur = 8;

      ctx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            深海音響シミュレータ ＆ スペクトログラム波形コンソール
          </h2>
          <p className="text-xs text-slate-400">
            深海環境音とマッコウクジラのクリック音（コーダ）をWeb Audio APIでリアルタイム合成・解析します。
          </p>
        </div>

        {/* アンビエント＆速度コントロール */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">再生速度:</span>
            <select
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="bg-transparent font-mono font-bold text-indigo-300 focus:outline-none"
            >
              <option value={0.5}>0.5x (分析スロー)</option>
              <option value={1.0}>1.0x (標準速度)</option>
              <option value={1.5}>1.5x (高速)</option>
            </select>
          </div>

          <button
            onClick={handleToggleAmbient}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isAmbientOn
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {isAmbientOn ? (
              <>
                <Volume2 className="h-4 w-4" /> 深海アンビエント [ON]
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" /> 深海アンビエント [OFF]
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：リアルタイム波形モニター (Canvas) */}
        <div className="col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              OSCILLOSCOPE WAVEFORM MONITOR (CH-1 / 140Hz LPF)
            </span>
            <span className="text-[11px] font-mono text-indigo-300">
              {activeWordPlaying ? `SIGNAL: ${activeWordPlaying.toUpperCase()}` : "STANDBY"}
            </span>
          </div>

          <div className="flex-1 rounded-lg border border-slate-800 overflow-hidden bg-slate-950 relative">
            <canvas ref={canvasRef} width={600} height={320} className="w-full h-full" />
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-600">
              TIME-DOMAIN REALTIME BUFFER: 256 SAMPLES
            </div>
          </div>
        </div>

        {/* 右側：単語クリック音テストパッド */}
        <div className="col-span-5 flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              【コーダクリック音・音韻テストパッド】
            </h3>

            <div className="space-y-2.5">
              {[
                { id: "word-self", name: "① 自分（我ら・同族）", desc: "均等3連打", symbol: "●●●" },
                { id: "word-gather", name: "② 集まれ（合流・急行）", desc: "加速する4連打", symbol: "●●●●↑" },
                { id: "word-alert", name: "③ 警戒（危険・注意）", desc: "低音単発長間隔", symbol: "━ ━" },
                { id: "word-enemy", name: "④ 敵（深海異形・触手）", desc: "不規則な乱れ打ち", symbol: "●━●●━" },
                { id: "word-prey", name: "⑤ 餌（極上の獲物・捕食）", desc: "高音超高速連打", symbol: "●●●●●●" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePlayWord(item.id)}
                  disabled={activeWordPlaying !== null}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                    activeWordPlaying === item.id
                      ? "border-indigo-500 bg-indigo-950/80 shadow-md ring-1 ring-indigo-500/50"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 bg-slate-900 px-2 py-0.5 rounded">
                      {item.symbol}
                    </span>
                    <Play className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* クライマックス放流テストボタン */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handlePlayFullSequence}
              disabled={activeWordPlaying !== null}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30"
            >
              <Volume2 className="h-4 w-4" />
              祝詞メッセージ一斉放流テスト（敵 ＋ 餌 ＋ 集まれ）
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              ※本番セッションのクライマックスでGMまたはPC2が再生するボタンです
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
