import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import manifest from '../assets/scenarios/project-deep-sea/manifest.json';
import { createEmptyProject } from '../src/utils/projectStorage';
import { initialProject } from '../src/utils/initialProjectData';
import { generateFullScriptMarkdown, generateSynopsisMarkdown } from '../src/utils/scriptGenerator';
import { scenarioAssetUrl } from '../src/scenarios/catalog';

const root = path.resolve('assets/scenarios', manifest.scenarioId);
async function walk(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) files.push(...(entry.isDirectory() ? await walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return files;
}

test('資料目録は正本の全ファイルを網羅する', async () => {
  expect((await walk(root)).map((file) => path.relative(root, file)).sort()).toEqual(manifest.files.map((file) => file.path).sort());
  for (const file of manifest.files) {
    const bytes = await readFile(path.join(root, file.path));
    if ('sha256' in file) expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
  }
});

test('全35資料を画面から参照・ダウンロードでき、正本と同一内容になる', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
  await page.getByRole('button', { name: '⑦ 資料ファイル一覧' }).click();
  await expect(page.locator('[data-material-path]')).toHaveCount(manifest.files.length);
  await page.screenshot({ path: testInfo.outputPath('material-library.png'), fullPage: true });
  for (const file of manifest.files) {
    const row = page.locator('[data-material-path]').filter({ has: page.getByRole('link', { name: 'ダウンロード', exact: true }) }).locator(`xpath=self::*[@data-material-path=${JSON.stringify(file.path)}]`);
    const response = await page.request.get(scenarioAssetUrl(file.path));
    expect(response.status(), file.path).toBe(200);
    expect(Buffer.compare(await response.body(), await readFile(path.join(root, file.path))), file.path).toBe(0);
    await expect(row.getByRole('link', { name: '別画面で参照' })).toHaveAttribute('href', scenarioAssetUrl(file.path));
    const nextDownload = page.waitForEvent('download', { timeout: 15_000 });
    await row.getByRole('link', { name: 'ダウンロード', exact: true }).click();
    const downloaded = await nextDownload;
    expect(await downloaded.failure(), file.path).toBeNull();
    const downloadedPath = await downloaded.path();
    expect(Buffer.compare(await readFile(downloadedPath!), await readFile(path.join(root, file.path))), file.path).toBe(0);
    await row.getByRole('button', { name: 'プレビュー', exact: true }).click();
    if (['svg', 'jpg', 'png'].includes(file.format)) {
      const image = page.getByRole('img', { name: file.title, exact: true });
      await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    } else if (['md', 'json'].includes(file.format)) {
      await expect(page.locator('[data-material-text]')).toHaveText(await readFile(path.join(root, file.path), 'utf8'));
    } else await expect(page.locator('iframe[title^="資料プレビュー"]')).toHaveAttribute('src', scenarioAssetUrl(file.path));
  }
});

test('組み込み作品は原稿編集不可、人数変更は原稿を書き換えない', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
  const before = await page.evaluate(() => localStorage.getItem('mm_workbench_projects_v1'));
  await page.getByRole('button', { name: /② 登場人物/ }).click();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: '7人プレイ（長津PC参加）' }).click();
  expect(await page.evaluate(() => localStorage.getItem('mm_workbench_projects_v1'))).toBe(before);
  await page.getByRole('button', { name: '④ 配布資料・印刷', exact: true }).click();
  await expect(page.getByRole('button', { name: /^(新規証拠追加|地図・写真追加|保存)$/, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /⑤ 企画書/ }).click();
  await expect(page.getByRole('button', { name: '企画概要を直接編集' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('新規作品の資料画面に組み込み内容が混ざらず、独自資料が保存される', async ({ page }) => {
  const project = { ...createEmptyProject({ title: '独立した検証作品', hasGm: false }), id: 'test-isolated-materials' };
  project.visualBoards = [{ id: 'test-visual', title: '独自の図版', subtitle: '', dayNumber: 1, boardType: 'custom_image' }];
  project.gmNotes = { 1: { dayNumber: 1, targetMinutes: 10, readAloudScript: '独自の読み上げ文', gmCheckpoints: ['独自の確認事項'], bgmCue: '' } };
  await page.addInitScript((project) => {
    localStorage.setItem('mm_workbench_projects_v1', JSON.stringify([project]));
    localStorage.setItem('mm_workbench_active_project_id_v1', project.id);
  }, project);
  await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
  await page.getByRole('button', { name: '④ デザイン資料作成・編集', exact: true }).click();
  await page.getByRole('button', { name: '画像資料', exact: true }).click();
  await expect(page.getByRole('button', { name: '独自の図版', exact: true })).toBeVisible();
  await expect(page.locator('img[src*="/scenarios/"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '⑦ 資料ファイル一覧' })).toHaveCount(0);
  await page.getByRole('button', { name: 'GM進行資料', exact: true }).click();
  await expect(page.getByLabel('読み上げ文', { exact: true })).toHaveValue('独自の読み上げ文');
  await page.getByLabel('読み上げ文', { exact: true }).fill('変更した読み上げ文');
  await page.getByRole('button', { name: 'プレビューに切替' }).click();
  await expect(page.getByText(/変更した読み上げ文/, { exact: false }).last()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mm_workbench_projects_v1')!)[0].gmNotes['1'].readAloudScript)).toBe('変更した読み上げ文');
  expect(generateSynopsisMarkdown(project)).toContain('GM: なし');
  expect(generateFullScriptMarkdown(project)).toContain('独自の読み上げ文');
  expect(generateFullScriptMarkdown(project)).not.toContain(initialProject.timeline[0].locationName);
});
