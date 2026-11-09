import { expect, test, Locator } from '@playwright/test';

async function expectUnclipped(element: Locator) {
  const dimensions = await element.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    const parent = node.parentElement!.getBoundingClientRect();
    return {
      horizontal: bounds.left >= parent.left - 1 && bounds.right <= parent.right + 1,
      vertical: bounds.top >= parent.top - 1 && bounds.bottom <= parent.bottom + 1,
      contentFits: node.scrollHeight <= node.clientHeight + 1,
    };
  });
  expect(dimensions).toEqual({ horizontal: true, vertical: true, contentFits: true });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
});

test('地図の表示切替が即座に反映され、拡大操作が重複しない', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: /^D3 / }).click();
  const preview = page.locator('[data-tactical-map]');
  await expectUnclipped(preview);
  await preview.getByRole('button', { name: /GM用マップ/ }).click();
  await page.getByRole('button', { name: '拡大', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '海図の拡大表示' });
  const map = dialog.locator('[data-tactical-map]');
  await expect(map).toHaveAttribute('data-mode', 'gm');
  await expect(dialog.getByRole('button', { name: /用マップ|拡大|大画面/ })).toHaveCount(0);
  for (const mode of ['player', 'gm', 'player'] as const) {
    await dialog.getByRole('button', { name: mode === 'player' ? 'プレイヤー表示' : 'GM真相表示（怪物の位置）', exact: true }).click();
    await expect(map).toHaveAttribute('data-mode', mode);
    // Verify the SVG itself changes, without switching tabs or reopening it.
    await expect(map.locator('svg').getByText(/【GM真相】/)).toHaveCount(mode === 'gm' ? 1 : 0);
    await expectUnclipped(map);
  }
  await page.screenshot({ path: testInfo.outputPath('expanded-map.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(preview).toHaveAttribute('data-mode', 'player');
});

test('通常の地図と写真が狭い画面でも枠内に収まる', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: /^D3 / }).click();
  for (const width of [1600, 1280, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    await expectUnclipped(page.locator('[data-tactical-map]'));
    for (const outcome of ['特定失敗時', '特定成功時']) {
      await page.getByRole('button', { name: new RegExp(outcome) }).click();
      const photo = page.locator('[data-investigation-photo]');
      await photo.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await expectUnclipped(photo);
      await expectUnclipped(photo.locator('img'));
      const fitsColumn = await photo.evaluate((node) => {
        const photoBounds = node.getBoundingClientRect();
        const column = node.closest('.col-span-8')!.getBoundingClientRect();
        const notes = node.nextElementSibling!.getBoundingClientRect();
        return photoBounds.right <= column.right && photoBounds.left >= column.left &&
          (notes.left >= photoBounds.right - 1 || notes.top >= photoBounds.bottom - 1);
      });
      expect(fitsColumn).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath(`photos-${width}.png`) });
  }
  await page.getByRole('button', { name: '③ GM進行', exact: true }).click();
  await page.getByRole('button', { name: 'Day 3', exact: true }).click();
  await expectUnclipped(page.locator('[data-tactical-map]'));
  const chart = page.locator('[data-chart-preview]');
  await expectUnclipped(chart.locator('svg'));
  await chart.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('gm-chart.png') });
  await page.getByRole('button', { name: '拡大', exact: true }).last().click();
  const dialog = page.getByRole('dialog', { name: '海図の拡大表示' });
  await expectUnclipped(dialog.locator('[data-tactical-map]'));
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
