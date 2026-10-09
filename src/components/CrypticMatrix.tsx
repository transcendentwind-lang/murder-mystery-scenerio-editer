"use client";

import React, { useState } from "react";
import { CrypticWord, CrypticGrammar, Character } from "@/types/schema";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Volume2,
  Users,
} from "lucide-react";
import { audioEngine } from "@/utils/audioSynth";

interface CrypticMatrixProps {
  words: CrypticWord[];
  grammar: CrypticGrammar;
  characters: Character[];
  onUpdateWords: (newWords: CrypticWord[]) => void;
  onUpdateGrammar: (newGrammar: CrypticGrammar) => void;
}

export const CrypticMatrix: React.FC<CrypticMatrixProps> = ({
  words,
  grammar,
  characters,
  onUpdateWords,
  onUpdateGrammar,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<"none" | "success" | "fail">("none");
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);

  // 単語クリック音再生
  const handlePlayWord = (wordId: string) => {
    audioEngine?.playWordSound(wordId, 1.0);
  };

  // 単語追加テスト
  const handleToggleWordInSequence = (wordId: string) => {
    if (selectedSequence.includes(wordId)) {
      setSelectedSequence(selectedSequence.filter((id) => id !== wordId));
    } else {
      setSelectedSequence([...selectedSequence, wordId]);
    }
    setTestResult("none");
  };

  // メッセージ判定テスト
  const handleValidateSequence = async () => {
    const isCorrect =
      selectedSequence.length === grammar.correctSequence.length &&
      selectedSequence.every((val, index) => val === grammar.correctSequence[index]);

    if (isCorrect) {
      setTestResult("success");
      setIsPlayingSeq(true);
      await audioEngine?.playMessageSequence(selectedSequence, 1.0);
      setIsPlayingSeq(false);
    } else {
      setTestResult("fail");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white">
            舌クリック音祝詞 × 深海クジラ言語パズル（新言語合成マトリクス）
          </h2>
          <p className="text-xs text-slate-400">
            古代祝詞の「人間の舌によるクリック音」と深海クジラの「コーダクリック言語」を融合。かつての海中筒に代わり海自大出力ソナー網から放流する【新しい言語】を編み出します。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            登録語彙: {words.length}語 ｜ 正解文法: 3部構成（約束 ＋ 火山北上探査 ＋ 捕食号令）
          </span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：語彙一覧と所持者マトリクス */}
        <div className="col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
            【基本語彙（舌クリック音・コーダ音韻）とPC別手がかり一覧】
          </h3>

          <div className="space-y-3 overflow-y-auto pr-1">
            {words.map((w) => {
              const assignedChar = characters.find((c) => c.id === w.assignedCharId);
              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayWord(w.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                      title="この単語のクリック音を試聴"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{w.meaning}</span>
                        <span className="font-mono text-xs text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {w.symbol}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{w.soundPattern}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                      {assignedChar ? assignedChar.name.split(":")[0] : "未割当"}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-500">{w.clueSource}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 古代文法（語順） */}
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <BookOpen className="h-3.5 w-3.5" />
                古代神社の盟約祝詞（海中筒の作法 ＆ 語順文法）
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-amber-300">
                PC6（神職）が所持
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {grammar.ruleDescription}
            </p>
            <div className="rounded bg-slate-900 border border-slate-800 p-2 text-[11px] text-slate-300 space-y-1">
              <p>
                📜 <strong>太古の前例</strong>: 古文書には『海より現れし巨大な烏賊（イカ）の如き触手の塊りを、鯨を呼び寄せて喰らわせた』とあり、怪異の正体（巨大なイカの群体）と捕食解決の決定打が記されています。
              </p>
              <p className="text-amber-300/90 pt-0.5 border-t border-slate-800">
                ⚠️ <strong>祝詞の真実</strong>: 祝詞の日本語（文言）自体に力があるのではなく、祝詞を唱える口と舌の動きによって『舌クリック音』を発生させることが本体です。普通に読んだだけでは海面で反射するため、音響パルスとしてソナー網から放流する必要があります。
              </p>
            </div>
          </div>
        </div>

        {/* 右側：二重ロック自動検証 ＆ メッセージ結合シミュレータ */}
        <div className="col-span-5 flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
              【二重ロック ＆ 新言語合成シミュレータ】
            </h3>

            {/* 6人全員の依存関係チェック */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>6名全員の知見が結集した新言語構文</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400 pl-4 list-disc">
                <li>PC6（神職）: 祝詞巻物の点刻記号（「人間」「クジラ」「約束」）</li>
                <li>PC4（観測）: 連動海底火山の熱水・地鳴り音響ログ（「海の下の火山」）</li>
                <li>PC2（音響）: 音響航法の方位コーダ（「北に向かう」などの東西南北）</li>
                <li>PC5（生物）: 朝倉教授ノートの探索・号令コーダ（「探せ」「集まれ」）</li>
                <li>PC3（船長）: 小笠原捕鯨唄の手拍子リズム（「巨大な餌」）</li>
                <li>PC1（司令）: 海上自衛隊大出力ソナー網の軍事アクセス承認と全回線統合</li>
              </ul>
            </div>

            {/* メッセージ結合テスト */}
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold text-slate-300">
                メッセージ連結テスト（単語をクリックして祝詞文を合成）:
              </h4>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {words.map((w) => {
                  const isSelected = selectedSequence.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleToggleWordInSequence(w.id)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow"
                          : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {w.meaning.split("（")[0]}
                    </button>
                  );
                })}
              </div>

              {/* 組み立て中の文 */}
              <div className="min-h-12 rounded-lg border border-slate-800 bg-slate-950 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {selectedSequence.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">単語が選択されていません</span>
                  ) : (
                    selectedSequence.map((wId, i) => {
                      const word = words.find((w) => w.id === wId);
                      return (
                        <React.Fragment key={wId}>
                          <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-xs font-bold text-indigo-200">
                            {word?.meaning.split("（")[0]}
                          </span>
                          {i < selectedSequence.length - 1 && (
                            <span className="text-slate-600 text-xs">＋</span>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
                {selectedSequence.length > 0 && (
                  <button
                    onClick={() => setSelectedSequence([])}
                    className="text-slate-500 hover:text-slate-300 text-xs p-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 判定結果 */}
            {testResult === "success" && (
              <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  文法成立！捕食命令が正しくクジラたちへ伝達されました！
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  『{grammar.combinedMessage}』
                </p>
              </div>
            )}

            {testResult === "fail" && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  文法不一致: クジラたちは警戒して散開してしまいました。
                </div>
                <p className="mt-1 text-[11px] text-red-400/90">
                  古文書の祝詞記号（敵 ➔ 餌 ➔ 集まれ）の語順と一致しているか確認してください。
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleValidateSequence}
            disabled={selectedSequence.length === 0 || isPlayingSeq}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/30"
          >
            <Play className="h-4 w-4" />
            メッセージをソナー放流して検証
          </button>
        </div>
      </div>
    </div>
  );
};
