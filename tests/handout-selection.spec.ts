import { expect, test, Locator } from '@playwright/test';
import { DAILY_COMMANDER_BRIEFINGS, NAGATSU_PHASE_CARDS } from '../src/utils/initialProjectData';

async function expectScrolledIntoCanvas(item: Locator) {
  const position = await item.evaluate((element) => {
    const canvas = element.closest('[data-handout-canvas]')!;
    return {
      offset: element.getBoundingClientRect().top - canvas.getBoundingClientRect().top,
      height: canvas.clientHeight,
      atEnd: canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 1,
    };
  });
  expect(position.offset).toBeGreaterThanOrEqual(0);
  expect(position.offset).toBeLessThan(position.height - 60);
  // The final sheet can hit the scroll limit before its heading reaches the top.
  expect(position.offset <= 17 || position.atEnd).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/local-projects.json', (route) => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('button', { name: 'このシナリオで作業開始' }).click();
  await page.getByRole('button', { name: '④ 配布資料・印刷', exact: true }).click();
});

test('指令書の一覧・絞り込み・選択先が右の紙面と一致する', async ({ page }, testInfo) => {
  await page.locator('[data-handout-mode="daily_briefings"]').click();
  const list = page.locator('[data-handout-list-id]');
  const canvas = page.locator('[data-handout-canvas]');
  for (const filter of ['all', 'midday', 'start'] as const) {
    await page.getByRole('button', { name: filter === 'all' ? /^全て\(/ : filter === 'midday' ? /^途中追加\(/ : /^各Day開始時\(/ }).click();
    const briefings = DAILY_COMMANDER_BRIEFINGS.filter((briefing) => filter === 'all' || Boolean(briefing.isMidDayAddition) === (filter === 'midday'));
    expect(await list.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-list-id')))).toEqual(briefings.map((briefing) => briefing.id));
    expect(await canvas.locator('[data-handout-id]').evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-id')))).toEqual(briefings.map((briefing) => briefing.id));
    for (const briefing of [briefings.at(-1)!, briefings[0]]) {
      await page.locator(`[data-handout-list-id="${briefing.id}"]`).click();
      const paper = canvas.locator(`[data-handout-id="${briefing.id}"]`);
      await expect(paper).toHaveAttribute('data-selected', 'true');
      await expect(paper.getByRole('heading', { name: briefing.title, exact: true })).toBeVisible();
      await expect(page.locator('[data-handout-list-id][aria-pressed="true"]')).toHaveCount(1);
      await expectScrolledIntoCanvas(paper);
    }
  }
  await page.screenshot({ path: testInfo.outputPath('briefing-selection.png') });
  await page.locator('[data-handout-mode="sheet"]').click();
  await expect(list).toHaveCount(0);
  await page.locator('[data-handout-mode="daily_briefings"]').click();
  await expect(canvas.locator('[data-handout-id][data-selected="true"]')).toHaveCount(1);
  await expectScrolledIntoCanvas(canvas.locator('[data-handout-id][data-selected="true"]'));
});

test('アナウンスカードを選ぶと本文へ移動し、両面印刷の全カードと順序を保持する', async ({ page }, testInfo) => {
  await page.locator('[data-handout-mode="nagatsu_cards"]').click();
  const list = page.locator('[data-handout-list-id]');
  const canvas = page.locator('[data-handout-canvas]');
  expect(await list.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-list-id')))).toEqual(NAGATSU_PHASE_CARDS.map((card) => card.id));
  const fronts = canvas.locator('[data-handout-face="front"]');
  const backs = canvas.locator('[data-handout-face="back"]');
  const frontOrder = await fronts.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-id')));
  const backOrder = await backs.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-id')));
  expect(frontOrder).toEqual(NAGATSU_PHASE_CARDS.map((card) => card.id));
  await expect(backs).toHaveCount(NAGATSU_PHASE_CARDS.length);
  for (const card of [NAGATSU_PHASE_CARDS.at(-1)!, NAGATSU_PHASE_CARDS[1]]) {
    await page.locator(`[data-handout-list-id="${card.id}"]`).click();
    await expect(canvas.locator('[data-handout-id][data-selected="true"]')).toHaveCount(2);
    const body = backs.locator(`xpath=self::*[@data-handout-id="${card.id}"]`);
    await expect(body.getByRole('heading', { name: card.title, exact: true })).toBeVisible();
    await expectScrolledIntoCanvas(body);
  }
  expect(await fronts.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-id')))).toEqual(frontOrder);
  expect(await backs.evaluateAll((items) => items.map((item) => item.getAttribute('data-handout-id')))).toEqual(backOrder);
  for (let index = 0; index < NAGATSU_PHASE_CARDS.length; index += 4) {
    const quad = NAGATSU_PHASE_CARDS.slice(index, index + 4);
    expect(backOrder.slice(index, index + 4)).toEqual([quad[1], quad[0], quad[3], quad[2]].filter(Boolean).map((card) => card.id));
  }
  await page.screenshot({ path: testInfo.outputPath('card-selection.png') });
  await page.locator('[data-handout-mode="daily_briefings"]').click();
  await page.locator('[data-handout-mode="nagatsu_cards"]').click();
  await expectScrolledIntoCanvas(canvas.locator('[data-handout-face="back"][data-selected="true"]'));
});
