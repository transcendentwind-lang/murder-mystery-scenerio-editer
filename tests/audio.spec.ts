import { test, expect } from "@playwright/test";
import { buildAudioTimeline, getWordAudioPattern } from "../src/utils/wordAudio";
import { initialProject } from "../src/utils/initialProjectData";

// 現行語彙を参照し、作品本文をテストへ複製しない。
const wordIds = initialProject.crypticWords.map((word) => word.id);

test("単音の試聴ではクリックした位置だけ、連続再生では再生順にボタンが光る", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mm_sonar_player_auth_v1", "whale-study"));
  await page.goto("/sonar");
  const slots = page.getByTitle("タップしてこの音と波形を確認", { exact: true });
  const replay = page.getByRole("button", { name: "もう一度再生", exact: true });
  const sound = page.getByRole("button").filter({ has: page.getByRole("button", { name: "試聴", exact: true }) }).first();
  // 同じ音を繰り返し追加し、語IDでは位置を区別できない場合も確認する。
  for (let index = 0; index < 3; index++) {
    await sound.click();
    await expect(slots).toHaveCount(index + 1);
    await expect(slots.nth(index)).toHaveClass(/bg-cyan-400/);
    if (index > 0) await expect(slots.first()).not.toHaveClass(/bg-cyan-400/);
    await expect(replay).toBeEnabled();
  }
  for (const index of [1, 2]) {
    await slots.nth(index).click();
    await expect(slots.nth(index)).toHaveClass(/bg-cyan-400/);
    await expect(slots.first()).not.toHaveClass(/bg-cyan-400/);
    await expect(slots.nth(3 - index)).not.toHaveClass(/bg-cyan-400/);
    await expect(replay).toBeEnabled();
    await expect(slots.nth(index)).not.toHaveClass(/bg-cyan-400/);
  }
  await replay.click();
  await expect(slots.nth(2)).toHaveClass(/bg-cyan-400/);
  await expect(slots.first()).not.toHaveClass(/bg-cyan-400/);
  await expect(replay).toBeEnabled();
  await page.getByRole("button", { name: "試聴", exact: true }).first().click();
  await expect(replay).toBeDisabled();
  for (let index = 0; index < 3; index++) await expect(slots.nth(index)).not.toHaveClass(/bg-cyan-400/);
  await expect(replay).toBeEnabled();
  await page.getByRole("button", { name: /海中にクリック音を流す/ }).click();
  for (let index = 0; index < 3; index++) {
    await expect(slots.nth(index)).toHaveClass(/bg-cyan-400/);
  }
  await expect(slots.nth(2)).not.toHaveClass(/bg-cyan-400/);
});

test("全語彙・1〜8語・再生速度ごとに全発音が波形の時間内へ収まる", () => {
  for (const wordId of wordIds) {
    for (const count of [1, 2, 4, 8]) {
      for (const speed of [0.5, 1, 1.5]) {
        const timeline = buildAudioTimeline(Array(count).fill(wordId), speed);
        const source = getWordAudioPattern(wordId);
        for (const segment of timeline.segments) {
          expect(segment.pulses).toHaveLength(source.pulses.length);
          segment.pulses.forEach((pulse, index) => {
            expect(pulse.delayMs).toBeCloseTo(source.pulses[index].delayMs / speed);
            expect(segment.startOffsetMs + pulse.delayMs + pulse.durationMs).toBeLessThanOrEqual(timeline.totalDurationMs);
          });
        }
        expect(timeline.segments.at(-1)!.startOffsetMs + timeline.segments.at(-1)!.durationMs).toBeCloseTo(timeline.totalDurationMs);
      }
    }
  }
});

test("実ブラウザーで発音予定時刻と波形再生位置を同じ音声時計へ同期する", async ({ page }) => {
  await page.route("**/local-projects.json", (route) => route.fulfill({ json: [] }));
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    (window as any).audioStarts = [];
    (window as any).audioCancelled = 0;
    AudioContext.prototype.createOscillator = function () {
      (window as any).testAudioContext = this;
      const oscillator = original.call(this);
      const start = oscillator.start.bind(oscillator);
      const stop = oscillator.stop.bind(oscillator);
      oscillator.stop = (when?: number) => {
        if (when === undefined) (window as any).audioCancelled++;
        stop(when);
      };
      oscillator.start = (when = 0) => {
        (window as any).audioStarts.push({ when, currentTime: this.currentTime });
        start(when);
      };
      return oscillator;
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "このシナリオで作業開始" }).click();
  await page.getByRole("button", { name: /クジラ音響アプリ/ }).click();
  const preview = page.getByRole("button", { name: "試聴", exact: true }).first();
  const canvas = page.locator("canvas[data-playback-ms]");
  await preview.click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-playback-ms"))).toBeGreaterThan(150);
  const sample = await page.evaluate(() => {
    const starts = (window as any).audioStarts;
    const ctx = (window as any).testAudioContext as AudioContext;
    const progress = Number(document.querySelector("canvas[data-playback-ms]")!.getAttribute("data-playback-ms"));
    return { starts, progress, actualMs: ((ctx.getOutputTimestamp().contextTime || ctx.currentTime) - (starts[0].when - 0.08)) * 1000 };
  });
  expect(sample.starts.length).toBeGreaterThan(0);
  expect(sample.starts.every((start: { when: number; currentTime: number }) => start.when >= start.currentTime)).toBe(true);
  expect(Math.abs(sample.progress - sample.actualMs)).toBeLessThan(100);
  const replay = page.getByRole("button", { name: "もう一度再生", exact: true });
  await expect(replay).toBeEnabled();
  const firstTraceEnd = Number(await canvas.getAttribute("data-duration-ms"));
  await replay.click();
  await expect(replay).toBeDisabled();
  await expect(replay).toBeEnabled();
  expect(Number(await canvas.getAttribute("data-duration-ms"))).toBe(firstTraceEnd);
  await replay.click();
  await page.getByRole("button", { name: "③ GM進行", exact: true }).click();
  await expect(page.locator("canvas[data-playback-ms]")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).audioCancelled)).toBeGreaterThan(0);
});
