"use client";

import React, { useState } from "react";
import { IncidentStep, EvidenceItem } from "@/types/schema";
import { Compass, MapPin, Radio, Shield, AlertTriangle, FileText, ChevronRight } from "lucide-react";

interface TimelineBoardProps {
  timeline: IncidentStep[];
  evidences: EvidenceItem[];
  onUpdateTimeline: (newTimeline: IncidentStep[]) => void;
}

export const TimelineBoard: React.FC<TimelineBoardProps> = ({
  timeline,
  evidences,
  onUpdateTimeline,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const currentStep = timeline.find((t) => t.dayNumber === selectedDay) || timeline[0];

  const handleUpdateCurrentStep = (field: keyof IncidentStep, value: any) => {
    const updated = timeline.map((step) =>
      step.dayNumber === selectedDay ? { ...step, [field]: value } : step
    );
    onUpdateTimeline(updated);
  };

  const getRevealedEvidences = (evidenceIds: string[]) => {
    return evidences.filter((e) => evidenceIds.includes(e.id));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部：北上進捗マップバー (約950km) */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              北上インシデント進捗ライン (小笠原 ➔ 富士山 直下：約950km)
            </h2>
          </div>
          <span className="text-xs font-mono text-indigo-300">
            巡航速度: 約6 km/h (約3.3ノット) ｜ 日速約140〜150 km
          </span>
        </div>

        {/* タイムラインステップバー */}
        <div className="relative flex items-center justify-between pt-4 pb-2">
          <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-800" />
          <div
            className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-indigo-600 transition-all duration-300"
            style={{ width: `${((selectedDay - 1) / (timeline.length - 1)) * 95}%` }}
          />

          {timeline.map((step) => {
            const isSelected = step.dayNumber === selectedDay;
            const isPast = step.dayNumber <= selectedDay;
            return (
              <button
                key={step.dayNumber}
                onClick={() => setSelectedDay(step.dayNumber)}
                className="relative z-10 flex flex-col items-center group transition"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                    isSelected
                      ? "bg-indigo-500 text-white ring-4 ring-indigo-500/30 scale-110"
                      : isPast
                      ? "bg-slate-700 text-slate-200 group-hover:bg-slate-600"
                      : "bg-slate-900 text-slate-500 border border-slate-700"
                  }`}
                >
                  D{step.dayNumber}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium transition ${
                    isSelected ? "text-indigo-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  {step.locationName.split(" ")[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {step.distanceKm} km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* メイン詳細グリッド */}
      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：日別インシデント詳細エディタ */}
        <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-400">
                DAY {currentStep.dayNumber}
              </span>
              <h3 className="text-base font-bold text-white">
                {currentStep.situationTitle}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              <span>{currentStep.locationName}</span>
              <span className="font-mono text-slate-500">({currentStep.distanceKm} km地点)</span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* 発生事象 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                発生事象・地質異変 (インシデント概要)
              </label>
              <textarea
                value={currentStep.incidentOverview}
                onChange={(e) => handleUpdateCurrentStep("incidentOverview", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* 二元対策状況 (東京 vs 現地) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                  <Shield className="h-3.5 w-3.5" />
                  東京司令部・公的機関の動き (PC1, PC2)
                </label>
                <textarea
                  value={currentStep.hqResponse}
                  onChange={(e) => handleUpdateCurrentStep("hqResponse", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Radio className="h-3.5 w-3.5" />
                  現地救難隊・観測所の動き (PC3〜PC6)
                </label>
                <textarea
                  value={currentStep.fieldResponse}
                  onChange={(e) => handleUpdateCurrentStep("fieldResponse", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右側：このDayに解禁される証拠カード */}
        <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                DAY {currentStep.dayNumber} 解禁エビデンス ({currentStep.revealedEvidenceIds.length}件)
              </h4>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {getRevealedEvidences(currentStep.revealedEvidenceIds).length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                このDayに新たに解禁される直接証拠はありません（会議・意思決定フェーズ）
              </div>
            ) : (
              getRevealedEvidences(currentStep.revealedEvidenceIds).map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-xs text-indigo-300">{ev.title}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      {ev.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>
                  {ev.acquisitionCondition && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400/90">
                      <ChevronRight className="h-3 w-3" />
                      <span>{ev.acquisitionCondition}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
