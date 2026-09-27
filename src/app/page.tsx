"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Users,
  Grid3X3,
  KeyRound,
  Send,
  BookOpen,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Character, PublicEvidence, InterpretationLink, LockCriterion, CandidateLockStatus } from "@/types/schema";

type PersonaType = "logic_checker" | "drama_director" | "script_editor";
type ActiveTab = "characters" | "matrix" | "locks";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  persona?: PersonaType;
  text: string;
  timestamp: string;
}

export default function WorkbenchPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("characters");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("drama_director");
  const [inputPrompt, setInputPrompt] = useState("");
  
  // チャットメッセージ
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      persona: "drama_director",
      text: "こんにちは。マーダーミステリー共創AIです。キャラクターの内面ドラマ（誇り・後ろめたさ・喪失体験）の付与や、公開証拠と専門知識の紐付け、犯人特定の多重ロック検証などをサポートします。どの部分から壁打ちを始めますか？",
      timestamp: "12:00",
    },
  ]);

  // 初期キャラクター（抽象的プレースホルダー）
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: "char-1",
      name: "容疑者A（専門職A）",
      roleType: "suspect",
      isCulpritCandidate: true,
      profession: "主任研究員",
      handout: {
        publicProfile: "事件関係組織の中核人物。冷静沈着で専門分野の権威。",
        secretObjective: "自身の過去の過失を隠蔽しつつ、真実を突き止める。",
        internalDrama: {
          pride: "自らの技術・研究成果に対する強い誇り",
          guilt: "過去の判断ミスが現在の事件の発端に関わっている恐れ",
          loss: "かつて失った大切な仲間・研究への執着",
        },
        backgroundTimeline: "事件当日の行動記録（タイムライン）...",
        handoutBody: "あなたの名前は〇〇。この研究所で最も長いキャリアを持つ……",
        gmActionGuide: "フェーズ移行時の裏アクション指示書",
      },
    },
    {
      id: "char-2",
      name: "容疑者B（専門職B）",
      roleType: "suspect",
      isCulpritCandidate: true,
      profession: "外部監査員",
      handout: {
        publicProfile: "外部から招かれた調査員。厳格で規則を重んじる。",
        secretObjective: "事件の背後にある組織的陰謀の証拠を確保する。",
        internalDrama: {
          pride: "法と正義を執行することへの自負",
          guilt: "保身のために過去の告発を見送った後ろめたさ",
          loss: "過去の事件で失われた家族の名誉",
        },
        backgroundTimeline: "事件当日の行動記録...",
        handoutBody: "あなたの名前は〇〇。数週間前にこの施設に着任した……",
        gmActionGuide: "",
      },
    },
  ]);

  const [selectedCharId, setSelectedCharId] = useState<string>("char-1");
  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const handleSendMessage = () => {
    if (!inputPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");

    // AIの模擬応答（API接続前のプレビュー）
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        persona: selectedPersona,
        text: `【${selectedPersona === "logic_checker" ? "論理チェッカー" : selectedPersona === "drama_director" ? "ドラマ演出" : "推敲担当"}視点】\nご提示いただいたアイデアについて検討しました。各プレイヤーの専門知識による解釈差分が自然に生まれ、動機と喪失体験のバランスが取れるよう、以下の視点から深掘りしてみましょう……`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputPrompt(promptText);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* トップヘッダー */}
      <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30">
            M
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide text-white">MM-Workbench</h1>
            <p className="text-xs text-slate-400">Murder Mystery Co-Creation Studio</p>
          </div>
        </div>

        {/* 右ペイン タブ切り替え */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab("characters")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "characters"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            キャラクター & HO
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "matrix"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            情報トランプ (証拠×知識)
          </button>
          <button
            onClick={() => setActiveTab("locks")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "locks"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            多重ロック検証
          </button>
        </div>

        {/* 状態ステータス */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Docker稼働中
          </span>
        </div>
      </header>

      {/* メインコンテンツ（2ペイン分割） */}
      <div className="flex flex-1 overflow-hidden">
        {/* ======================================================== */}
        {/* 左ペイン: AI Co-Writer（対話・壁打ち）                    */}
        {/* ======================================================== */}
        <section className="flex w-[480px] flex-col border-r border-slate-800 bg-slate-900/40">
          {/* ペルソナセレクタ */}
          <div className="border-b border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-indigo-400" />
                AIスタンス選択
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedPersona("drama_director")}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  selectedPersona === "drama_director"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-medium text-slate-200">ドラマ演出</div>
                <div className="text-[10px] text-slate-400">自負・後ろめたさ・喪失</div>
              </button>
              <button
                onClick={() => setSelectedPersona("logic_checker")}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  selectedPersona === "logic_checker"
                    ? "border-amber-500 bg-amber-500/10 text-amber-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-medium text-slate-200">論理チェック</div>
                <div className="text-[10px] text-slate-400">抜け穴・収束性検証</div>
              </button>
              <button
                onClick={() => setSelectedPersona("script_editor")}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  selectedPersona === "script_editor"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-medium text-slate-200">HO推敲</div>
                <div className="text-[10px] text-slate-400">口調・没入感整形</div>
              </button>
            </div>
          </div>

          {/* 会話タイムライン */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                  {m.sender === "ai" ? (
                    <>
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      <span>MM Co-Writer</span>
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 text-slate-400" />
                      <span>あなた</span>
                    </>
                  )}
                  <span>• {m.timestamp}</span>
                </div>
                <div
                  className={`rounded-xl px-4 py-3 text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800/80 text-slate-200 border border-slate-700/60 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* クイック壁打ちプロンプト */}
          <div className="border-t border-slate-800/60 bg-slate-900/30 p-2.5">
            <p className="text-[10px] font-medium text-slate-400 mb-1.5">💡 クイック壁打ちテンプレート:</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  handleQuickPrompt("このキャラクターに『自負（誇り）』と『過去の過失（後ろめたさ）』を自然に埋め込む動機案を3つ提案して")
                }
                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-700 hover:text-white"
              >
                誇りと過失の動機案
              </button>
              <button
                onClick={() =>
                  handleQuickPrompt("公開証拠に対して、このPCの専門知識だけが導き出せる『解釈の差分』の種を考えて")
                }
                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-700 hover:text-white"
              >
                専門知識による解釈差分
              </button>
              <button
                onClick={() =>
                  handleQuickPrompt("犯人特定のための二重ロック条件が、このPC以外に当てはまらないか反証をチェックして")
                }
                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-700 hover:text-white"
              >
                二重ロックの反証確認
              </button>
            </div>
          </div>

          {/* チャット入力バー */}
          <div className="border-t border-slate-800 p-3 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="プロットやキャラクター設定について壁打ちする... (Shift+Enterで改行)"
                className="flex-1 resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputPrompt.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 右ペイン: 設計キャンバス（タブ切り替え）                 */}
        {/* ======================================================== */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* タブ1: キャラクター & ハンドアウト */}
          {activeTab === "characters" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* キャラクター切り替えリスト */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-800">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition whitespace-nowrap ${
                      selectedChar.id === char.id
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        char.isCulpritCandidate ? "bg-amber-400" : "bg-blue-400"
                      }`}
                    />
                    <span>{char.name}</span>
                    <span className="text-[10px] text-slate-400">({char.profession})</span>
                  </button>
                ))}
                <button className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-800 px-3 py-2 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300">
                  <Plus className="h-3 w-3" />
                  キャラクター追加
                </button>
              </div>

              {/* 選択中キャラクターの内面ドラマ構造 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{selectedChar.name} の設計スロット</h2>
                    <p className="text-xs text-slate-400">表向きの立場と、内に秘めたドラマ・喪失の配分</p>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                    {selectedChar.profession}
                  </span>
                </div>

                {/* 3つの内面ドラマスロット */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
                    <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">
                      自負・誇り (Pride)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedChar.handout.internalDrama.pride}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
                      後ろめたさ・秘密 (Guilt)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedChar.handout.internalDrama.guilt}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
                    <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wide">
                      喪失体験・トラウマ (Loss)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedChar.handout.internalDrama.loss}
                    </p>
                  </div>
                </div>

                {/* ハンドアウト本文エディタ */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      ハンドアウト（HO）本文プレビュー・推敲
                    </label>
                    <span className="text-[11px] text-slate-400">AIチャットの提案をここに流し込み可能</span>
                  </div>
                  <textarea
                    value={selectedChar.handout.handoutBody}
                    onChange={(e) => {
                      const updated = [...characters];
                      const target = updated.find((c) => c.id === selectedChar.id);
                      if (target) {
                        target.handout.handoutBody = e.target.value;
                        setCharacters(updated);
                      }
                    }}
                    rows={8}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* タブ2: 情報トランプマトリクス */}
          {activeTab === "matrix" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div>
                <h2 className="text-base font-semibold text-white">情報トランプ（公開証拠 × 専門知識）マトリクス</h2>
                <p className="text-xs text-slate-400">
                  証拠自体は全員オープン。各PCの専門知識によって初めて解釈が導かれる構造を一覧化。
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">公開証拠 (客観的事実)</th>
                      <th className="px-4 py-3">解釈可能なPC</th>
                      <th className="px-4 py-3">専門知識・HO背景</th>
                      <th className="px-4 py-3">導出される新事実 (真相のピース)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        証拠A: 現場に残された特殊な残留物質
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-300 border border-indigo-500/20">
                          容疑者A（主任研究員）
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        特定の化学反応や試薬の劣化速度に関する専門知識
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">
                        「この反応は発生後3時間以内に冷却しないと消失する（犯行時刻の特定）」
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        証拠B: 暗号化された取引記録ログ
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-300 border border-indigo-500/20">
                          容疑者B（外部監査員）
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        業界特有の通関コードおよび迂回送金の識別パターン
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">
                        「送金元は特定地域を経由しており、犯行資金の流出経路が判明」
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* タブ3: 多重ロック検証 */}
          {activeTab === "locks" && (
            <div className="space-y-5 max-w-5xl mx-auto">
              <div>
                <h2 className="text-base font-semibold text-white">多重ロック整合性検証器</h2>
                <p className="text-xs text-slate-400">
                  すべての条件軸が揃った際、真犯人ただ1名に論理的に収束するかを判定します。
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">容疑者候補</th>
                      <th className="px-4 py-3 text-center">ロック1 (場所・アリバイ)</th>
                      <th className="px-4 py-3 text-center">ロック2 (動機・渡航歴)</th>
                      <th className="px-4 py-3 text-center">ロック3 (特殊ルール適合)</th>
                      <th className="px-4 py-3">反証理由 (ミスリードの構造)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="bg-emerald-500/5">
                      <td className="px-4 py-3 font-medium text-emerald-300">
                        容疑者A（真犯人）
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">合致 (〇)</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">合致 (〇)</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">合致 (〇)</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        全ての条件を満たす唯一の人物（反証不能）
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        容疑者B
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">合致 (〇)</td>
                      <td className="px-4 py-3 text-center text-rose-400 font-bold">矛盾 (×)</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">合致 (〇)</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        渡航歴と事件発端の時期に完全な不一致がある
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
