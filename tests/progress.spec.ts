import { MMProject } from "../src/types/schema";
import { test, expect, Page } from "@playwright/test";
import { createEmptyProject } from "../src/utils/projectStorage";
import { initialProject } from "../src/utils/initialProjectData";
import { DAY3_TOKYO_ACTIONS, DAY4_TOKYO_ACTIONS } from "../src/components/GmDashboard";
import { progressKey } from "../src/utils/progressStorage";
import { reconcileInvestigations } from "../src/utils/investigationSelections";

const first = { ...createEmptyProject({ title: "検証用作品A" }), id: "test-project-a" };
const second = { ...createEmptyProject({ title: "検証用作品B" }), id: "test-project-b" };

async function openProject(page: Page, projects: MMProject[] = [first, second]) {
  await page.route("**/local-projects.json", (route) => route.fulfill({ json: [] }));
  await page.addInitScript(({ projects }) => {
    if (!localStorage.getItem("review-test-seeded")) {
      localStorage.setItem("mm_workbench_projects_v1", JSON.stringify(projects));
      localStorage.setItem("mm_workbench_active_project_id_v1", projects[0].id!);
      localStorage.setItem("review-test-seeded", "1");
    }
  }, { projects });
  await page.goto("/");
  await page.getByRole("button", { name: "このシナリオで作業開始" }).click();
}

async function switchProject(page: Page, title: string) {
  await page.getByRole("button", { name: "シナリオ・プロジェクト一覧を開く", exact: true }).click();
  const heading = page.getByRole("heading", { name: title, exact: true });
  await heading.locator("xpath=ancestor::div[contains(@class, 'group relative rounded-xl')]").getByRole("button", { name: "このシナリオを開く", exact: true }).click();
}

test("GM進行はタブ移動・作品切替・再読込後も作品ごとに復元する", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openProject(page);
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await page.getByRole("button", { name: "Phase 3", exact: true }).click();
  await page.getByTitle("スタート", { exact: true }).click();
  await page.getByRole("button", { name: /① フェーズ進行/ }).click();
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await expect(page.getByRole("button", { name: "Phase 3", exact: true })).toHaveClass(/bg-indigo-600/);
  await expect(page.getByTitle("一時停止", { exact: true })).toBeVisible();
  await expect(page.getByText(/00:00:0[1-9]/)).toBeVisible();
  await switchProject(page, second.title);
  await expect(page.getByRole("button", { name: "Phase 1", exact: true })).toHaveClass(/bg-indigo-600/);
  await expect(page.getByTitle("スタート", { exact: true })).toBeVisible();
  await switchProject(page, first.title);
  await expect(page.getByTitle("一時停止", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "このシナリオで作業開始" }).click();
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await expect(page.getByRole("button", { name: "Phase 3", exact: true })).toHaveClass(/bg-indigo-600/);
  await page.getByTitle("一時停止", { exact: true }).click();
  await expect(page.getByTitle("スタート", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("保存失敗を表示し、再保存成功後に失敗表示を解除する", async ({ page }) => {
  await openProject(page);
  await page.getByRole("button", { name: /④ デザイン資料作成/ }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as any).restoreStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (key, value) {
      if (key === "mm_workbench_projects_v1") throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByText("保存に失敗しました。変更は未保存です。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "再保存", exact: true })).toBeVisible();
  await switchProject(page, second.title);
  await expect(page.getByRole("button", { name: "再保存", exact: true })).toHaveCount(0);
  await switchProject(page, first.title);
  await expect(page.getByText("保存に失敗しました。変更は未保存です。", { exact: true })).toBeVisible();
  await page.evaluate(() => (window as any).restoreStorage());
  await page.getByRole("button", { name: "再保存", exact: true }).click();
  await expect(page.getByText("保存に失敗しました。変更は未保存です。", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "再保存", exact: true })).toHaveCount(0);
});

test("後日の無効な調査を解除する前に確認し、キャンセルなら全選択を保持する", async ({ page }) => {
  const project = initialProject;
  const earlier = DAY3_TOKYO_ACTIONS[0];
  const later = DAY3_TOKYO_ACTIONS[1];
  const independent = DAY4_TOKYO_ACTIONS[0];
  const key = progressKey(project.id, "investigations");
  const selections = {
    3: { tokyo: earlier.id, field: [] },
    4: { tokyo: later.id, field: [] },
    5: { tokyo: independent.id, field: [] },
  };
  await page.addInitScript(({ key, selections }) => localStorage.setItem(key, JSON.stringify(selections)), { key, selections });
  await openProject(page, [project]);
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await page.getByRole("button", { name: "Day 3", exact: true }).click();
  const choice = page.getByRole("button").filter({ hasText: later.id }).first();
  page.once("dialog", (dialog) => dialog.dismiss());
  await choice.click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)).toEqual(selections);
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("無効な選択を解除");
    await dialog.accept();
  });
  await choice.click();
  const expected = { ...selections, 3: { tokyo: later.id, field: [] }, 4: { tokyo: "", field: [] } };
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)).toEqual(expected);
  await page.getByRole("button", { name: /① タイムライン/ }).click();
  await page.getByRole("button", { name: /^D3/ }).first().click();
  await expect(page.getByRole("button").filter({ hasText: later.id }).first()).toHaveClass(/border-indigo-400|border-indigo-500|bg-indigo/);
});

test("複数日の無効な選択だけ解除し、有効な選択を残す", () => {
  const result = reconcileInvestigations({
    3: { tokyo: "action-a", field: ["clue-a", "clue-b"] },
    4: { tokyo: "action-a", field: ["clue-a", "clue-c"] },
    5: { tokyo: "action-b", field: ["clue-b", "clue-d"] },
  }, 3);
  expect(result.clearedDays).toEqual([4, 5]);
  expect(result.selections[4]).toEqual({ tokyo: "", field: ["clue-c"] });
  expect(result.selections[5]).toEqual({ tokyo: "action-b", field: ["clue-d"] });
});

for (const builtin of [false, true]) {
  test(`${builtin ? "組み込み" : "編集用"}作品の進行リセットは取消・再読込・作品切替でも整合する`, async ({ page }) => {
    const target = builtin ? initialProject : first;
    const key = (field: string) => progressKey(target.id, field);
    const otherKey = progressKey(second.id, "gm.currentDay");
    await page.addInitScript(({ keys, otherKey }) => {
      if (localStorage.getItem("reset-test-seeded")) return;
      const values = [3, { elapsedMs: 123000, startedAt: Date.now() }, 3, "custom", 7];
      keys.forEach((key, index) => localStorage.setItem(key, JSON.stringify(values[index])));
      localStorage.setItem(otherKey, "2");
      localStorage.setItem("reset-test-seeded", "1");
    }, { keys: [key("gm.currentDay"), key("timer"), key("timeline.selectedDay"), key("shared.operationName"), key("playerCount")], otherKey });
    await openProject(page, [target, second]);
    const projectBefore = await page.evaluate(() => localStorage.getItem("mm_workbench_projects_v1"));
    await page.getByRole("button", { name: /③ GM進行/ }).click();
    const phase = (day: number) => page.getByRole("button", { name: builtin ? `Day ${day}` : `Phase ${day}`, exact: true });
    await expect(phase(3)).toHaveClass(/bg-indigo-600/);
    await expect(page.getByTitle("一時停止", { exact: true })).toBeVisible();
    const reset = page.getByRole("button", { name: "進行をリセット", exact: true });
    await reset.click();
    const dialog = page.getByRole("dialog", { name: "進行をリセットしますか？" });
    await expect(dialog.getByRole("button", { name: "キャンセル", exact: true })).toBeFocused();
    await dialog.getByRole("button", { name: "キャンセル", exact: true }).click();
    await expect(phase(3)).toHaveClass(/bg-indigo-600/);
    await expect(page.getByTitle("一時停止", { exact: true })).toBeVisible();
    await reset.click();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(reset).toBeFocused();
    await reset.click();
    await dialog.getByRole("button", { name: "リセットする", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(phase(1)).toHaveClass(/bg-indigo-600/);
    await expect(page.getByTitle("スタート", { exact: true })).toBeVisible();
    await expect(page.getByText("00:00:00", { exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "進行をリセットしました。" })).toBeVisible();
    const remaining = await page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)), progressKey(target.id, ""));
    expect(remaining).toEqual([key("playerCount")]);
    expect(await page.evaluate(() => localStorage.getItem("mm_workbench_projects_v1"))).toBe(projectBefore);
    await switchProject(page, second.title);
    await expect(page.getByRole("button", { name: "Phase 2", exact: true })).toHaveClass(/bg-indigo-600/);
    await switchProject(page, target.title);
    await expect(phase(1)).toHaveClass(/bg-indigo-600/);
    await page.reload();
    await page.getByRole("button", { name: "このシナリオで作業開始" }).click();
    await page.getByRole("button", { name: /③ GM進行/ }).click();
    await expect(phase(1)).toHaveClass(/bg-indigo-600/);
    await expect(page.getByText("00:00:00", { exact: true })).toBeVisible();
  });
}

test("進行リセットの保存失敗を通知し、画面内のタイマーは停止する", async ({ page }) => {
  await openProject(page);
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await page.getByRole("button", { name: "Phase 3", exact: true }).click();
  await page.getByTitle("スタート", { exact: true }).click();
  await page.evaluate(() => {
    Storage.prototype.removeItem = function () { throw new DOMException("Denied", "SecurityError"); };
  });
  await page.getByRole("button", { name: "進行をリセット", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "リセットする", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "保存に失敗しました" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Phase 1", exact: true })).toHaveClass(/bg-indigo-600/);
  await expect(page.getByTitle("スタート", { exact: true })).toBeVisible();
  await page.waitForTimeout(1100);
  await expect(page.getByText("00:00:00", { exact: true })).toBeVisible();
});
