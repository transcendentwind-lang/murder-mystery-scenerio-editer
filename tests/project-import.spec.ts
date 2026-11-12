import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createEmptyProject } from "../src/utils/projectStorage";

const storageKey = "mm_workbench_projects_v1";
const valid = createEmptyProject({ title: "保存済みの検証作品" });
const invalid = {
  id: "invalid-project",
  title: "形式に問題がある検証作品",
  characters: [],
  timeline: [{ locationName: { invalid: true } }],
};

function jsonFile(project: object) {
  return {
    name: "scenario.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(project)),
  };
}

test("形式に問題があるJSONは保存せず、正常なJSONは再読み込み後も開ける", async ({ page }) => {
  await page.route("**/local-projects.json", (route) => route.fulfill({ json: [] }));
  await Promise.all([page.waitForResponse("**/local-projects.json"), page.goto("/")]);
  const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);

  const input = page.locator('input[type="file"]');
  const [message] = await Promise.all([
    page.waitForEvent("dialog").then(async (alert) => {
      await alert.accept();
      return alert.message();
    }),
    input.setInputFiles(jsonFile(invalid)),
  ]);
  expect(message).toContain("形式に問題がある");
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);

  await input.setInputFiles(jsonFile(valid));
  await expect(page.getByRole("heading", { name: valid.title, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "このシナリオで作業開始" })).toBeVisible();
  await expect(page.getByRole("heading", { name: valid.title, exact: true }).first()).toBeVisible();
});

test("保存済みの不正データがあっても起動でき、別作品の編集後も原本を書き出せる", async ({ page }) => {
  await page.route("**/local-projects.json", (route) => route.fulfill({ json: [] }));
  await page.addInitScript(({ key, valid, invalid }) => {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify([invalid, valid]));
    localStorage.setItem("mm_workbench_active_project_id_v1", invalid.id);
  }, { key: storageKey, valid, invalid });

  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: "保存済みシナリオが1件" })).toBeVisible();
  await page.getByRole("heading", { name: valid.title, exact: true }).locator("xpath=ancestor::div[contains(@class, 'group relative rounded-xl')]")
    .getByRole("button", { name: "このシナリオを開く" }).click();
  await page.locator('input[value^="第1フェーズ"]').first().fill("編集したフェーズ");

  await page.reload();
  await expect(page.locator('input[value="編集したフェーズ"]')).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "開けないシナリオの元データを書き出す" }).click();
  expect(JSON.parse(await readFile(await (await download).path(), "utf8"))).toEqual([invalid]);
  expect(errors).toEqual([]);
});
