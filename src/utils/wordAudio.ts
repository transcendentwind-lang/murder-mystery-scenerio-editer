export interface AcousticPulsePoint {
  delayMs: number;
  freqHz: number;
  durationMs: number;
  amplitude: number;
}
export interface WordAudioPattern { pulses: AcousticPulsePoint[]; durationMs: number }

function melodic(notes: { delayMs: number; freq: number; duration?: number; volume?: number }[]): WordAudioPattern {
  return {
    pulses: notes.map((note) => ({ delayMs: note.delayMs, freqHz: note.freq,
      durationMs: (note.duration ?? 0.018) * 1000, amplitude: note.volume ?? 0.85 })),
    durationMs: Math.max(0, ...notes.map((note) => note.delayMs)) + 350,
  };
}
function clicks(delays: number[], frequency: number): WordAudioPattern {
  return { pulses: delays.map((delayMs) => ({ delayMs, freqHz: frequency, durationMs: 18, amplitude: 0.85 })),
    durationMs: Math.max(0, ...delays) + 300 };
}

export function getWordAudioPattern(wordId: string): WordAudioPattern {
    switch (wordId) {
      case "word-gather": // 01. カ・カ・カカッ！（集まれ）
        return melodic(
          [
            { delayMs: 0, freq: 2800, duration: 0.018, volume: 0.85 },
            { delayMs: 260, freq: 2850, duration: 0.018, volume: 0.88 },
            { delayMs: 440, freq: 2920, duration: 0.015, volume: 0.92 },
            { delayMs: 530, freq: 3050, duration: 0.016, volume: 0.98 },
          ]);
      case "word-alert": // 02. ドォン…ドォン…（周囲を警戒せよ）
        return melodic(
          [
            { delayMs: 0, freq: 1300, duration: 0.038, volume: 0.95 },
            { delayMs: 520, freq: 1200, duration: 0.042, volume: 0.92 },
          ]);
      case "word-enemy": // 03. タタ・タズズズ（敵がいる）
        return melodic(
          [
            { delayMs: 0, freq: 2600, duration: 0.016, volume: 0.88 },
            { delayMs: 90, freq: 2600, duration: 0.016, volume: 0.88 },
            { delayMs: 260, freq: 2550, duration: 0.016, volume: 0.9 },
            { delayMs: 360, freq: 1550, duration: 0.028, volume: 0.92 },
            { delayMs: 460, freq: 1450, duration: 0.028, volume: 0.92 },
            { delayMs: 560, freq: 1350, duration: 0.032, volume: 0.95 },
          ]);
      case "word-flee": // 04. タタ・タト・トン（逃げろ）
        return melodic(
          [
            { delayMs: 0, freq: 2700, duration: 0.015, volume: 0.88 },
            { delayMs: 90, freq: 2700, duration: 0.015, volume: 0.88 },
            { delayMs: 250, freq: 2650, duration: 0.015, volume: 0.88 },
            { delayMs: 340, freq: 2050, duration: 0.02, volume: 0.9 },
            { delayMs: 510, freq: 1700, duration: 0.028, volume: 0.95 },
          ]);
      case "word-child-feed": // 05. チューン（（子ども）餌をくれ）
        return melodic(
          [
            { delayMs: 0, freq: 3450, duration: 0.028, volume: 0.9 },
            { delayMs: 140, freq: 2950, duration: 0.032, volume: 0.88 },
            { delayMs: 280, freq: 2450, duration: 0.038, volume: 0.85 },
          ]);
      case "word-child-here": // 06. ロポ・ポポポ（（子ども）自分の場所はここだ）
        return melodic(
          [
            { delayMs: 0, freq: 2550, duration: 0.018, volume: 0.85 },
            { delayMs: 110, freq: 2800, duration: 0.016, volume: 0.88 },
            { delayMs: 290, freq: 2800, duration: 0.016, volume: 0.88 },
            { delayMs: 400, freq: 2800, duration: 0.016, volume: 0.9 },
            { delayMs: 510, freq: 2850, duration: 0.018, volume: 0.92 },
          ]);
      case "word-adult-here": // 07. ゴポ・ポポポ（（大人）自分の場所はここだ）
        return melodic(
          [
            { delayMs: 0, freq: 1400, duration: 0.028, volume: 0.9 },
            { delayMs: 120, freq: 1850, duration: 0.02, volume: 0.88 },
            { delayMs: 300, freq: 1850, duration: 0.02, volume: 0.88 },
            { delayMs: 420, freq: 1850, duration: 0.02, volume: 0.9 },
            { delayMs: 540, freq: 1900, duration: 0.022, volume: 0.92 },
          ]);
      case "word-human": // 08. カッカッ（人間）
        return melodic(
          [
            { delayMs: 0, freq: 2350, duration: 0.016, volume: 0.88 },
            { delayMs: 190, freq: 2350, duration: 0.016, volume: 0.9 },
          ]);
      case "word-whale": // 09. ド・ドーン（我ら・自分（クジラ））
        return melodic(
          [
            { delayMs: 0, freq: 1650, duration: 0.025, volume: 0.85 },
            { delayMs: 380, freq: 1350, duration: 0.042, volume: 0.95 },
          ]);
      case "word-you": // 10. ドド・ツツツ（あなたたち・あなた）
        return melodic(
          [
            { delayMs: 0, freq: 1550, duration: 0.024, volume: 0.88 },
            { delayMs: 110, freq: 1550, duration: 0.024, volume: 0.88 },
            { delayMs: 290, freq: 3050, duration: 0.015, volume: 0.9 },
            { delayMs: 390, freq: 3050, duration: 0.015, volume: 0.9 },
            { delayMs: 490, freq: 3100, duration: 0.015, volume: 0.92 },
          ]);
      case "word-promise": // 11. チ・トン・チ（約束）
        return melodic(
          [
            { delayMs: 0, freq: 2950, duration: 0.016, volume: 0.85 },
            { delayMs: 190, freq: 1750, duration: 0.024, volume: 0.9 },
            { delayMs: 380, freq: 2950, duration: 0.016, volume: 0.85 },
          ]);
      case "word-go-east": // 12. ツ・ピィッ！（東）
        return melodic(
          [
            { delayMs: 0, freq: 1800, duration: 0.02, volume: 0.82 },
            { delayMs: 240, freq: 3250, duration: 0.015, volume: 0.92 },
          ]);
      case "word-go-west": // 13. ピ・ポ・ポン（西）
        return melodic(
          [
            { delayMs: 0, freq: 3200, duration: 0.015, volume: 0.88 },
            { delayMs: 200, freq: 2250, duration: 0.018, volume: 0.85 },
            { delayMs: 330, freq: 1550, duration: 0.025, volume: 0.9 },
          ]);
      case "word-go-north": // 14. ピ・ピピッ（北）
        return melodic(
          [
            { delayMs: 0, freq: 2400, duration: 0.016, volume: 0.82 },
            { delayMs: 180, freq: 2850, duration: 0.015, volume: 0.88 },
            { delayMs: 290, freq: 3300, duration: 0.015, volume: 0.94 },
          ]);
      case "word-greet": // 16. ズジーズ・ズ（挨拶／こんにちは）
        return melodic(
          [
            { delayMs: 0, freq: 1700, duration: 0.026, volume: 0.88 },
            { delayMs: 120, freq: 2150, duration: 0.032, volume: 0.92 },
            { delayMs: 280, freq: 1750, duration: 0.024, volume: 0.88 },
            { delayMs: 450, freq: 1650, duration: 0.028, volume: 0.9 },
          ]);
      case "word-subsea-volcano": // 17. ゴゴゴゴ…（海の下の火山）
        return melodic(
          [
            { delayMs: 0, freq: 1250, duration: 0.032, volume: 0.9 },
            { delayMs: 180, freq: 1200, duration: 0.032, volume: 0.9 },
            { delayMs: 360, freq: 1180, duration: 0.035, volume: 0.92 },
            { delayMs: 540, freq: 1150, duration: 0.038, volume: 0.95 },
          ]);
      case "word-calf": // 18. ト・トーン（クジラの子ども）
        return melodic(
          [
            { delayMs: 0, freq: 2450, duration: 0.018, volume: 0.85 },
            { delayMs: 320, freq: 2150, duration: 0.034, volume: 0.92 },
          ]);
      case "word-giant-prey": // 19. チチチチチチッ！（大きい・たくさんの餌）
        return clicks([0, 60, 120, 180, 240, 300, 360], 3550);
      case "word-normal-prey": // 20. チチチ・チ（普通の餌）
        return melodic(
          [
            { delayMs: 0, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 90, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 180, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 360, freq: 3350, duration: 0.016, volume: 0.9 },
          ]);
      case "word-attack": // 21. ババババババッ！（攻撃せよ）
        return melodic(
          [0, 65, 130, 195, 260, 325].map((d, i) => ({
            delayMs: d,
            freq: 1950 + (i % 2) * 200,
            duration: 0.022,
            volume: 0.95,
          })));
      case "word-search": // 22. タン・タン・タン（探せ）
        return clicks([0, 250, 500], 2400);
      case "word-ack": // 23. カッ（了解した）
      case "word-yes":
        return { pulses: [{ delayMs: 0, freqHz: 2950, durationMs: 18, amplitude: 0.95 }], durationMs: 260 };
      case "word-human-whale": // 23. ド・ドーッカッカッ（人間とクジラ）
        return melodic(
          [
            { delayMs: 0, freq: 1650, duration: 0.024, volume: 0.88 },
            { delayMs: 170, freq: 1350, duration: 0.045, volume: 0.95 },
            { delayMs: 250, freq: 2350, duration: 0.016, volume: 0.9 },
            { delayMs: 330, freq: 2350, duration: 0.016, volume: 0.94 },
          ]);
      default:
        return clicks([0, 200, 400], 2400);}
}

export function getWordAcousticPulses(wordId: string): AcousticPulsePoint[] {
  return getWordAudioPattern(wordId).pulses;
}

export interface AudioTimelineSegment {
  wordId: string;
  startOffsetMs: number;
  durationMs: number;
  pulses: AcousticPulsePoint[];
}
export interface AudioTimeline { segments: AudioTimelineSegment[]; totalDurationMs: number }

/** 音声の予約時刻・波形の位置・再生終了を同一の予定表から決める。 */
export function buildAudioTimeline(wordIds: string[], speedMultiplier = 1): AudioTimeline {
  let cursorMs = 80;
  const segments = wordIds.map((wordId) => {
    const pattern = getWordAudioPattern(wordId);
    const segment = { wordId, startOffsetMs: cursorMs, durationMs: pattern.durationMs / speedMultiplier,
      pulses: pattern.pulses.map((pulse) => ({ ...pulse, delayMs: pulse.delayMs / speedMultiplier, durationMs: pulse.durationMs / speedMultiplier })) };
    cursorMs += segment.durationMs + 280 / speedMultiplier;
    return segment;
  });
  return { segments, totalDurationMs: segments.length ? cursorMs - 280 / speedMultiplier : 0 };
}
