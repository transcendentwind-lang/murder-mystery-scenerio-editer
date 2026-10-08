import React, { useState } from "react";
import { MMProject } from "@/types/schema";
import {
  createEmptyProject,
  saveProjectToStorage,
  deleteProjectFromStorage,
  exportProjectToJsonFile,
} from "@/utils/projectStorage";
import {
  FolderKanban,
  PlusCircle,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  Users,
  Clock,
  ShieldAlert,
  ArrowRight,
  X,
} from "lucide-react";

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: MMProject;
  projects: MMProject[];
  onSelectProject: (project: MMProject) => void;
  onProjectsChange: (projects: MMProject[]) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  projects,
  onSelectProject,
  onProjectsChange,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "new" | "import">("list");

  // 新規作成フォームの状態
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newPlayerCount, setNewPlayerCount] = useState<number>(5);
  const [newHasGm, setNewHasGm] = useState<boolean>(true);
  const [newConcept, setNewConcept] = useState("");
  const [newTargetExperience, setNewTargetExperience] = useState("");

  if (!isOpen) return null;

  // 新規プロジェクト作成の実行
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createEmptyProject({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || "新規シナリオ",
      playerCount: newPlayerCount,
      hasGm: newHasGm,
      concept: newConcept.trim() || "本作の世界観と舞台設定",
      targetExperience: newTargetExperience.trim() || "プレイヤーが味わう緊迫感と推理の醍醐味",
    });

    saveProjectToStorage(created);
    const updatedList = [created, ...projects.filter((p) => p.id !== created.id)];
    onProjectsChange(updatedList);
    onSelectProject(created);

    // リセット
    setNewTitle("");
    setNewSubtitle("");
    setNewConcept("");
    setNewTargetExperience("");
    onClose();
  };

  // プロジェクトの複製
  const handleDuplicate = (target: MMProject) => {
    const duplicated: MMProject = {
      ...target,
      id: `proj_${Date.now()}_copy`,
      title: `${target.title}（コピー）`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProjectToStorage(duplicated);
    const updatedList = [duplicated, ...projects];
    onProjectsChange(updatedList);
  };

  // プロジェクトの削除
  const handleDelete = (targetId: string, title: string) => {
    if (projects.length <= 1) {
      alert("最後の1つのプロジェクトは削除できません。");
      return;
    }
    const confirmed = window.confirm(`シナリオ「${title}」を削除してもよろしいですか？`);
    if (!confirmed) return;

    const remaining = deleteProjectFromStorage(targetId);
    onProjectsChange(remaining);
    if (currentProject.id === targetId && remaining.length > 0) {
      onSelectProject(remaining[0]);
    }
  };

  // JSONインポート
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text) as MMProject;
        if (!imported.title || !imported.characters) {
          alert("有効なシナリオデータ形式ではありません。");
          return;
        }
        imported.id = `proj_imported_${Date.now()}`;
        imported.updatedAt = new Date().toISOString();
        saveProjectToStorage(imported);
        const updatedList = [imported, ...projects];
        onProjectsChange(updatedList);
        onSelectProject(imported);
        onClose();
      } catch (err) {
        console.error(err);
        alert("JSONファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-[85vh] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                シナリオ・プロジェクト管理
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                複数のマダミスシナリオの立ち上げ、切り替え、バックアップを行えます
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
                  activeTab === "list"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                シナリオ一覧 ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
                  activeTab === "new"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                ＋ 新規立ち上げ
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          {/* TAB 1: シナリオ一覧 */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  制作中のプロジェクト一覧
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => exportProjectToJsonFile(currentProject)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700 hover:text-white transition"
                    title="現在開いているシナリオのデータをJSONファイルとしてダウンロード保存"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-400" />
                    現在のシナリオを書き出し
                  </button>
                  <label className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5 text-emerald-400" />
                    JSON読み込み
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => {
                  const isCurrent = p.id === currentProject.id;
                  const formattedDate = p.updatedAt
                    ? new Date(p.updatedAt).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "―";

                  return (
                    <div
                      key={p.id || p.title}
                      className={`group relative rounded-xl border p-4.5 transition flex flex-col justify-between ${
                        isCurrent
                          ? "border-indigo-500 bg-indigo-950/25 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/40"
                          : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-white truncate">
                                {p.title}
                              </h3>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                                  <CheckCircle2 className="h-3 w-3" /> 編集中
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {p.subtitle || "（サブタイトル未設定）"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 my-2.5 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                          {p.concept || "コンセプト未入力"}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono mt-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-emerald-400" />
                            {p.playerCount}人
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            約{p.durationHours}時間
                          </span>
                          <span>
                            {p.hasGm ? "GM要" : "GMレス可"}
                          </span>
                          <span className="text-slate-500 ml-auto">
                            更新: {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="このシナリオを複製"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => exportProjectToJsonFile(p)}
                            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="JSONエクスポート"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {projects.length > 1 && (
                            <button
                              onClick={() => handleDelete(p.id || "", p.title)}
                              className="p-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 transition"
                              title="シナリオを削除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {isCurrent ? (
                          <button
                            onClick={onClose}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                          >
                            このまま編集を続ける
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectProject(p);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
                          >
                            このシナリオを開く
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: 新規立ち上げフォーム */}
          {activeTab === "new" && (
            <div className="max-w-2xl mx-auto py-2">
              <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      新しいシナリオの制作スペースを立ち上げます
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                      人数に応じたキャラクター枠（内面ドラマ付き）、タイムライン枠、証拠マスター枠が自動でセットアップされます。
                      立ち上げ後、AIチャットで世界観やトリックのアイデアを壁打ちしながら肉付けしていけます。
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateNewProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    シナリオタイトル <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例: 白銀の閉鎖病棟、時計塔の三重奏、宵闇のコロシアム"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    サブタイトル・キャッチコピー
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="例: 吹雪に閉ざされた6人の医師たち / 誰も嘘を吐かない殺人事件"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      想定プレイ人数
                    </label>
                    <select
                      value={newPlayerCount}
                      onChange={(e) => setNewPlayerCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {[3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} 人用
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ゲームマスター (GM)
                    </label>
                    <select
                      value={newHasGm ? "yes" : "no"}
                      onChange={(e) => setNewHasGm(e.target.value === "yes")}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="yes">GM必須（案内人・密談管理あり）</option>
                      <option value="no">GMレス対応（プレイヤーのみで進行）</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    作品コンセプト・世界観（やりたいテーマ・舞台設定）
                  </label>
                  <textarea
                    rows={3}
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="例: クローズドサークル、近未来SF、ファンタジー王宮、デスゲームなど。思いついているキーワードやモチーフを自由に入力してください。"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    プレイヤーに味わわせたい体験
                  </label>
                  <textarea
                    rows={2}
                    value={newTargetExperience}
                    onChange={(e) => setNewTargetExperience(e.target.value)}
                    placeholder="例: 全員が秘密を抱えながら協力せざるを得ない葛藤、最後のどんでん返し、エモーショナルな別れ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-indigo-600/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    プロジェクトを作成して立ち上げる
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
