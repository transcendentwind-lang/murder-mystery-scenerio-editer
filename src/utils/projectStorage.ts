import { MMProject, Character, IncidentStep, EvidenceItem, LockCriterion, CandidateLockStatus } from "@/types/schema";
import { initialProject } from "./initialProjectData";

const STORAGE_KEY_PROJECTS = "mm_workbench_projects_v1";
const STORAGE_KEY_ACTIVE_ID = "mm_workbench_active_project_id_v1";

/**
 * 新規シナリオプロジェクト用の汎用スターターテンプレート作成
 * （特定のモチーフやシナリオ設定を含まない、抽象化されたゲームデザイン骨格）
 */
export function createEmptyProject(params?: {
  title?: string;
  subtitle?: string;
  playerCount?: number;
  concept?: string;
  targetExperience?: string;
  hasGm?: boolean;
}): MMProject {
  const count = params?.playerCount ?? 4;
  const now = new Date().toISOString();
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 人数に応じた汎用キャラクター初期スロット
  const characters: Character[] = Array.from({ length: count }, (_, idx) => {
    const pcNum = idx + 1;
    return {
      id: `pc-${pcNum}`,
      name: `PC${pcNum}`,
      profession: `PC${pcNum} 肩書・職業`,
      roleType: pcNum === 1 ? "suspect" : "investigator",
      isCulpritCandidate: pcNum <= 3, // 上位候補
      location: "headquarters",
      introduction: `PC${pcNum}の人物概要。当事者としての動機や、事件に関わる立場を記述します。`,
      capabilities: [
        {
          id: `cap-pc${pcNum}-1`,
          name: `固有調査権限・スキル`,
          description: `フェーズ中に発動可能な固有の調査アクションや権限。`,
          targetPhase: 1,
          unlockedEvidenceIds: [`ev-${pcNum}-1`],
        },
      ],
      initialItems: [`PC${pcNum}の所持品・私物`],
      handout: {
        publicProfile: `全員に公開されるPC${pcNum}の表向きの経歴・立ち位置。`,
        secretObjective: `PC${pcNum}の個別勝利条件（秘密の目的・隠匿事項）。`,
        internalDrama: {
          pride: `専門職・人間としての誇り・譲れない信条。`,
          guilt: `後ろめたさ・過去の過失・他者に隠している過ち。`,
          loss: `過去の喪失体験・トラウマ・後悔。`,
        },
        backgroundTimeline: `事件発生前〜当日にかけての個人の行動記録。`,
        handoutBody: `【背景と動機】\nここにPC${pcNum}の詳細なハンドアウト本文を執筆します。\n\n【あなたの知っている情報】\n事件に関する個人的な目撃や専門的見解。\n\n【勝利条件】\n1. 事件の真相を解明する（または隠蔽する）\n2. 秘密の目的を達成する`,
        gmActionGuide: `フェーズ進行時の個別密談・特殊アクションに関する指示書。`,
      },
    };
  });

  // 初期タイムライン（フェーズ1〜4）
  const timeline: IncidentStep[] = [
    {
      dayNumber: 1,
      locationName: "第1フェーズ：発端",
      distanceKm: 0,
      situationTitle: "事件・インシデントの発生",
      incidentOverview: "事件の発覚。最初の異変または被害が確認され、関係者が招集される。",
      hqResponse: "対策本部・全体議論の立ち上げと初期状況の把握。",
      fieldResponse: "第1次現場検証・初期手掛かりの収集。",
      revealedEvidenceIds: ["ev-common-1"],
    },
    {
      dayNumber: 2,
      locationName: "第2フェーズ：捜査進展",
      distanceKm: 25,
      situationTitle: "新たな手がかりと証言の食い違い",
      incidentOverview: "各人の証言や持ち寄った証拠から、矛盾点や第二の異変が浮上する。",
      hqResponse: "個別尋問・情報の突き合わせ。",
      fieldResponse: "重要物品やログの解析。",
      revealedEvidenceIds: ["ev-common-2"],
    },
    {
      dayNumber: 3,
      locationName: "第3フェーズ：急展開",
      distanceKm: 50,
      situationTitle: "タイムリミットまたは真の危機の発覚",
      incidentOverview: "状況が悪化し、犯行の全体像または破局を阻止するための期限が迫る。",
      hqResponse: "緊急方針の決定・重要証拠の開示。",
      fieldResponse: "最終手掛かりの確保。",
      revealedEvidenceIds: ["ev-common-3"],
    },
    {
      dayNumber: 4,
      locationName: "第4フェーズ：クライマックス",
      distanceKm: 100,
      situationTitle: "真相解明と最終投票・意思決定",
      incidentOverview: "全員の情報を統合し、多重ロックを解き明かして真実を告発・決断する。",
      hqResponse: "最終協議・投票フェーズ。",
      fieldResponse: "事態の収束・エンディングへの分岐。",
      revealedEvidenceIds: [],
    },
  ];

  // 初期証拠アイテム
  const evidences: EvidenceItem[] = [
    {
      id: "ev-common-1",
      title: "現場状況報告書",
      description: "第1フェーズで全体に公開される、事件現場の基礎的な見分記録。",
      ownerId: "all",
      foundPhase: 1,
      visibility: "public",
      category: "document",
    },
    {
      id: "ev-common-2",
      title: "通信ログ・行動記録",
      description: "関係者のアリバイや通話時刻が記録された公式データ。",
      ownerId: "all",
      foundPhase: 2,
      visibility: "public",
      category: "data",
    },
    {
      id: "ev-common-3",
      title: "現場に残された決定的遺留品",
      description: "特定の人物の専門知識や動機と結びつく重要な物的証拠。",
      ownerId: "all",
      foundPhase: 3,
      visibility: "public",
      category: "sample",
    },
    ...characters.map((c, i) => ({
      id: `ev-${i + 1}-1`,
      title: `${c.name}の個別手掛かり`,
      description: `${c.name}の専門知識や固有アクションによってのみ判明する独自情報。`,
      ownerId: c.id,
      foundPhase: 1,
      visibility: "private" as const,
      category: "document" as const,
    })),
  ];

  // 多重ロック検証条件
  const lockCriteria: LockCriterion[] = [
    {
      id: "crit-1",
      name: "動機の成立",
      description: "犯行に及ぶだけの強い個人的・職務的動機が存在するか。",
    },
    {
      id: "crit-2",
      name: "実行機会・アリバイ不成立",
      description: "犯行推定時刻に現場へ到達可能であったか。",
    },
    {
      id: "crit-3",
      name: "犯行手段・技術の保持",
      description: "トリックや手口を実行できる知識・装備を所持していたか。",
    },
  ];

  const candidateStatuses: CandidateLockStatus[] = characters.map((c, i) => ({
    characterId: c.id,
    locks: {
      "crit-1": i === 0, // PC1のみ全ロック成立（初期設定サンプル）
      "crit-2": i === 0,
      "crit-3": i <= 1,
    },
    rebuttalNote: i === 0 ? "反証材料が残されていない（真犯人候補）" : "明確なアリバイまたは手段欠如による反証成立",
  }));

  return {
    id: projectId,
    createdAt: now,
    updatedAt: now,
    title: params?.title || "新規マーダーミステリー（仮）",
    subtitle: params?.subtitle || "サブタイトル・概要",
    concept:
      params?.concept ||
      "作品の世界観、舞台背景、物語のテーマをここに記述します。",
    targetExperience:
      params?.targetExperience ||
      "プレイヤーに味わわせたい感情（緊迫感、疑心暗鬼、カタルシス、切なさ等）を記述します。",
    plotSummary:
      "【発端】事件の始まり\n\n【展開】捜査の進展と浮上する疑惑\n\n【真相】事件の背後にある真実とトリック\n\n【解決】プレイヤーがたどり着くべき解決方法",
    gimmickOverview:
      "① 本作独自のコアギミック（情報交差、特殊アクション、心理誘導など）\n② 二重ロック論理構造\n③ クライマックスの分岐や演出",
    playerCount: count,
    durationHours: 2.5,
    hasGm: params?.hasGm ?? true,
    characters,
    evidences,
    timeline,
    crypticWords: [],
    crypticGrammar: {
      ruleDescription: "本作独自の暗号・パズル文法規則",
      correctSequence: [],
      combinedMessage: "",
      holderCharId: characters[0].id,
    },
    matrixLinks: [
      {
        id: "link-1",
        evidenceId: "ev-common-3",
        characterId: characters[0].id,
        specializedKnowledge: `${characters[0].name}の専門知識による鑑定`,
        derivedConclusion: "遺留品の性質から、犯行時刻の偽装が暴かれる。",
        isCrucialForSolution: true,
      },
    ],
    lockCriteria,
    candidateStatuses,
  };
}

/**
 * ローカルストレージから保存済みプロジェクト一覧を取得
 */
export function getStoredProjects(): MMProject[] {
  if (typeof window === "undefined") {
    return [initialProject];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      // 初期状態：初回起動時はプリセットの初期プロジェクトを登録
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify([initialProject]));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, initialProject.id || "project-deep-sea");
      return [initialProject];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [initialProject];
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
    return [initialProject];
  }
}

/**
 * プロジェクトを保存
 */
export function saveProjectToStorage(project: MMProject): void {
  if (typeof window === "undefined") return;

  try {
    const projects = getStoredProjects();
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save project:", err);
  }
}

/**
 * プロジェクトを削除
 */
export function deleteProjectFromStorage(projectId: string): MMProject[] {
  if (typeof window === "undefined") return [];

  try {
    let projects = getStoredProjects();
    if (projects.length <= 1) {
      // 最後の1つの場合は消さずにそのまま
      return projects;
    }
    projects = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    return projects;
  } catch (err) {
    console.error("Failed to delete project:", err);
    return getStoredProjects();
  }
}

/**
 * 現在アクティブなプロジェクトIDを取得
 */
export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
}

/**
 * アクティブプロジェクトIDを更新
 */
export function setActiveProjectId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

/**
 * プロジェクトをJSONファイルとしてダウンロード保存
 */
export function exportProjectToJsonFile(project: MMProject): void {
  const fileName = `${project.title.replace(/[\\/:*?"<>|]/g, "_")}_data.json`;
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
