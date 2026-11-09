import { test, expect } from '@playwright/test';
import { initialProject } from '../src/utils/initialProjectData';

// サーバーは設定でUTC。ブラウザーだけを変えて、日付が前後する時刻も照合する。
const expectedDate = new Date(initialProject.updatedAt!).toLocaleDateString('ja-JP', {
  timeZone: 'Asia/Tokyo', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});
for (const timezoneId of ['Asia/Tokyo', 'UTC', 'America/Los_Angeles']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId });
    test('更新日時がサーバーHTMLと一致し、再読み込みでも初期描画エラーが出ない', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' && /hydration|server-rendered|did not match/i.test(message.text())) errors.push(message.text());
      });
      await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
      const response = await page.goto('/');
      const serverDate = (await response!.text()).match(/更新:\s*(?:<!--[^>]*-->)*([^<]+)/)?.[1];
      expect(serverDate).toBe(expectedDate);
      await expect(page.getByText(`更新: ${expectedDate}`, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
      await page.reload();
      await expect(page.getByText(`更新: ${expectedDate}`, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
      expect(errors).toEqual([]);
    });
  });
}
