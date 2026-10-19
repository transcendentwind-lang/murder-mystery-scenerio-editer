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
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [showTimelineGuide, setShowTimelineGuide] = useState(false);

  // 深海アンビエント音のON/OFF
  const handleToggleAmbient = () => {
    const newState = audioEngine?.toggleAmbient();
    setIsAmbientOn(!!newState);
  };

  // 単語クリック音再生
  const handlePlayWord = (wordId: string) => {
    audioEngine?.playWordSound(wordId, 1.0);
  };

  // 正解の完成祝詞メッセージを一発試聴
  const handlePlayFullCorrectMessage = async () => {
    if (isPlayingFull || !grammar.correctSequence) return;
    setIsPlayingFull(true);
    await audioEngine?.playMessageSequence(grammar.correctSequence, 1.0);
    setIsPlayingFull(false);
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
      {/* 上部ヘッダー＆オーディオ操作バー */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold tracking-wide text-white">
              音響・祝詞解析スタジオ（舌クリック音祝詞 × 深海クジラ言語）
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            古代祝詞の「人間の舌によるクリック音」と深海クジラの「コーダクリック言語」を融合。かつての海中筒に代わり海自大出力ソナー網から放流する【新しい言語】を試聴・シミュレーションします。
          </p>
        </div>

        {/* コントロールボタン群 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 深海アンビエント音トグル */}
          <button
            onClick={handleToggleAmbient}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
              isAmbientOn
                ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
            }`}
            title="水深800〜1,000mの重苦しい水圧環境ノイズをON/OFFします"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${isAmbientOn ? "bg-cyan-400 animate-pulse" : "bg-slate-500"}`} />
            {isAmbientOn ? "深海環境音: 再生中" : "深海環境音: 停止中"}
          </button>

          {/* 正解の祝詞メッセージを一発試聴 */}
          <button
            onClick={handlePlayFullCorrectMessage}
            disabled={isPlayingFull}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow shadow-indigo-600/30"
            title="完成した8語新言語祝詞（人とクジラの約束…）を海自ソナー放流の順序で通し試聴します"
          >
            <Play className={`h-3.5 w-3.5 ${isPlayingFull ? "animate-spin" : ""}`} />
            {isPlayingFull ? "完成祝詞を放流中..." : "完成祝詞（8語）を通し試聴"}
          </button>

          {/* Day 1〜Day 6の連鎖ガイド表示トグル */}
          <button
            onClick={() => setShowTimelineGuide(!showTimelineGuide)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition border ${
              showTimelineGuide
                ? "bg-slate-800 border-slate-600 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            {showTimelineGuide ? "手がかり連鎖を閉じる" : "Day1〜Day6の手がかり連鎖ガイド"}
          </button>
        </div>
      </div>

      {/* Day 1〜Day 6の手がかり連鎖ガイド（折りたたみパネル） */}
      {showTimelineGuide && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              【Day 1 〜 Day 6：音響・祝詞・新言語の提示と手がかりの連鎖】
            </span>
            <span className="text-[11px] text-amber-400/80">
              ※4段階ロジック（祝詞儀礼 ➔ 海中筒の音響物理 ➔ 古代の捕食伝承 ➔ 朝倉ノートのクジラ言語）
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 text-[11px]">
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-amber-400 mb-1">Day 1: 発端の伏線</span>
              <p className="text-slate-300">船長証言『クジラじゃない。神社へお参りする』。怪異の存在と神社の信仰が提示される。</p>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-amber-400 mb-1">Day 2: 音響シグネチャー</span>
              <p className="text-slate-300">水深800mを北上する巨大影。海底付近で海底地震のような特殊振動を起こして噴火を刺激。</p>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-amber-400 mb-1">Day 3: 群体の同調の謎</span>
              <p className="text-slate-300">触手が融合した超巨大群体と判明。通常攻撃では再結合するため、音・振動での同調が問題に。</p>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-amber-400 mb-1">Day 4: 祝詞と海中筒</span>
              <p className="text-slate-300">小笠原神社の記録から『盟約の祝詞』と『竹の海中筒』を発見。しかし祝詞の文面は秘伝口伝。</p>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-amber-400 mb-1">Day 5: コーダ言語の解明</span>
              <p className="text-slate-300">朝倉ノートからクジラのクリック音列（コーダ）言語体系を発見。海中筒＝音響インピーダンス整合装置。</p>
            </div>
            <div className="rounded border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="block font-bold text-emerald-400 mb-1">Day 6: 舌クリック新言語</span>
              <p className="text-slate-300">祝詞の神髄＝舌クリック音！6人全員の知見で8語新言語祝詞を合成し、海自ソナー網へ装填。</p>
            </div>
          </div>
        </div>
      )}

      {/* メイングリッド */}
      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：語彙一覧と所持者マトリクス */}
        <div className="col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              【基本語彙（舌クリック音・コーダ音韻）とPC別手がかり一覧】
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono">
              登録語彙: {words.length}語
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1">
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                      title="この単語のクリック音を試聴"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{w.meaning}</span>
                        <span className="font-mono text-xs text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {w.symbol}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{w.soundPattern}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                      {assignedChar ? assignedChar.name.split("（")[0] : "未割当"}
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
                初瀬 / PC6（5名時は太刀魚）が所持
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
                <span>知見が結集した新言語構文（5名時は太刀魚が初瀬を統合）</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400 pl-4 list-disc">
                <li>初瀬 / PC6（救護・神職／5名時は太刀魚）: 祝詞巻物の点刻記号（「人間」「クジラ」「約束」）</li>
                <li>太刀魚 / PC4（観測）: 連動海底火山の熱水・地鳴り音響ログ（「海の下の火山」）</li>
                <li>貝浜 / PC2（音響）: 音響航法の方位コーダ（「北に向かう」などの東西南北）</li>
                <li>浪寄 / PC5（生物）: 朝倉教授ノートの探索・号令コーダ（「探せ」「集まれ」）</li>
                <li>坂凪 / PC3（船長）: 小笠原捕鯨唄の手拍子リズム（「巨大な餌」）</li>
                <li>朝潮 / PC1（司令）: 海上自衛隊大出力ソナー網の軍事アクセス承認と全回線統合</li>
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
                <div className="flex flex-wrap items-center gap-1.5">
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
                    title="リセット"
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
                  古文書の祝詞文法（約束 ➔ 火山を北へ探せ ➔ 巨大な餌に集まれ）の語順と一致しているか確認してください。
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
