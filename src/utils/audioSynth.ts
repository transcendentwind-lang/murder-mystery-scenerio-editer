/**
 * MM-Workbench - 海中音響シミュレータ (Web Audio API)
 * 深海の重低音アンビエントと、マッコウクジラ特有のクリック音（コーダ）をプログラミング合成
 */

class UnderwaterAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private analyser: AnalyserNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  /**
   * 深海アンビエント（くぐもった水圧の重低音ノイズ）の開始/停止
   */
  public toggleAmbient(enable?: boolean): boolean {
    this.initContext();
    if (!this.ctx || !this.analyser) return false;

    const targetState = enable !== undefined ? enable : !this.isAmbientPlaying;

    if (targetState && !this.isAmbientPlaying) {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // ピンクノイズ生成
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // 深海のような極端なローパスフィルター (120Hz)
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(140, this.ctx.currentTime);
      lowpass.Q.setValueAtTime(3, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      whiteNoise.connect(lowpass);
      lowpass.connect(this.ambientGain);
      this.ambientGain.connect(this.analyser);

      whiteNoise.start();
      this.isAmbientPlaying = true;
      return true;
    } else if (!targetState && this.isAmbientPlaying) {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      this.isAmbientPlaying = false;
      return false;
    }
    return this.isAmbientPlaying;
  }

  /**
   * 単一のクリック音（コーダパルス）を発振
   */
  public playSingleClick(frequency = 2800, duration = 0.015, volume = 0.8) {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    // 急速なピッチダウンで「カチッ」としたアタック感を演出
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + duration);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency * 0.8, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /**
   * パターンに基づいた連続クリック音の再生
   * @param pattern 各クリックの間隔ミリ秒の配列 (例: [0, 150, 300])
   * @param speedMultiplier 速度倍率 (1.0 = 標準, 0.5 = スロー)
   */
  public playClickPattern(pattern: number[], freq = 2600, speedMultiplier = 1.0): Promise<void> {
    return new Promise((resolve) => {
      pattern.forEach((delayMs, index) => {
        setTimeout(() => {
          this.playSingleClick(freq, 0.018, 0.85);
          if (index === pattern.length - 1) {
            setTimeout(resolve, 300 / speedMultiplier);
          }
        }, delayMs / speedMultiplier);
      });
    });
  }

  /**
   * 音程（周波数）が変化するメロディック・クリック音パターンの再生
   * @param notes 各クリックの遅延ミリ秒と周波数、持続時間、音量の配列
   */
  public playMelodicPattern(
    notes: { delayMs: number; freq: number; duration?: number; volume?: number }[],
    speedMultiplier = 1.0
  ): Promise<void> {
    return new Promise((resolve) => {
      notes.forEach((note, index) => {
        setTimeout(() => {
          this.playSingleClick(note.freq, note.duration || 0.018, note.volume || 0.85);
          if (index === notes.length - 1) {
            setTimeout(resolve, 350 / speedMultiplier);
          }
        }, note.delayMs / speedMultiplier);
      });
    });
  }

  /**
   * シナリオ中の単語パターンを再生（全24語対応）
   */
  public async playWordSound(wordId: string, speedMultiplier = 1.0): Promise<void> {
    switch (wordId) {
      case "word-gather": // 01. カ・カ・カカッ！（集まれ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2800, duration: 0.018, volume: 0.85 },
            { delayMs: 260, freq: 2850, duration: 0.018, volume: 0.88 },
            { delayMs: 440, freq: 2920, duration: 0.015, volume: 0.92 },
            { delayMs: 530, freq: 3050, duration: 0.016, volume: 0.98 },
          ],
          speedMultiplier
        );
        break;
      case "word-alert": // 02. ドォン…ドォン…（周囲を警戒せよ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1300, duration: 0.038, volume: 0.95 },
            { delayMs: 520, freq: 1200, duration: 0.042, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-enemy": // 03. タタ・タズズズ（敵がいる）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2600, duration: 0.016, volume: 0.88 },
            { delayMs: 90, freq: 2600, duration: 0.016, volume: 0.88 },
            { delayMs: 260, freq: 2550, duration: 0.016, volume: 0.9 },
            { delayMs: 360, freq: 1550, duration: 0.028, volume: 0.92 },
            { delayMs: 460, freq: 1450, duration: 0.028, volume: 0.92 },
            { delayMs: 560, freq: 1350, duration: 0.032, volume: 0.95 },
          ],
          speedMultiplier
        );
        break;
      case "word-flee": // 04. タタ・タト・トン（逃げろ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2700, duration: 0.015, volume: 0.88 },
            { delayMs: 90, freq: 2700, duration: 0.015, volume: 0.88 },
            { delayMs: 250, freq: 2650, duration: 0.015, volume: 0.88 },
            { delayMs: 340, freq: 2050, duration: 0.02, volume: 0.9 },
            { delayMs: 510, freq: 1700, duration: 0.028, volume: 0.95 },
          ],
          speedMultiplier
        );
        break;
      case "word-child-feed": // 05. チューン（（子ども）餌をくれ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 3450, duration: 0.028, volume: 0.9 },
            { delayMs: 140, freq: 2950, duration: 0.032, volume: 0.88 },
            { delayMs: 280, freq: 2450, duration: 0.038, volume: 0.85 },
          ],
          speedMultiplier
        );
        break;
      case "word-child-here": // 06. ロポ・ポポポ（（子ども）自分の場所はここだ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2550, duration: 0.018, volume: 0.85 },
            { delayMs: 110, freq: 2800, duration: 0.016, volume: 0.88 },
            { delayMs: 290, freq: 2800, duration: 0.016, volume: 0.88 },
            { delayMs: 400, freq: 2800, duration: 0.016, volume: 0.9 },
            { delayMs: 510, freq: 2850, duration: 0.018, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-adult-here": // 07. ゴポ・ポポポ（（大人）自分の場所はここだ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1400, duration: 0.028, volume: 0.9 },
            { delayMs: 120, freq: 1850, duration: 0.02, volume: 0.88 },
            { delayMs: 300, freq: 1850, duration: 0.02, volume: 0.88 },
            { delayMs: 420, freq: 1850, duration: 0.02, volume: 0.9 },
            { delayMs: 540, freq: 1900, duration: 0.022, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-human": // 08. カッカッ（人間）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2350, duration: 0.016, volume: 0.88 },
            { delayMs: 190, freq: 2350, duration: 0.016, volume: 0.9 },
          ],
          speedMultiplier
        );
        break;
      case "word-whale": // 09. ド・ドーン（我ら・自分（クジラ））
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1650, duration: 0.025, volume: 0.85 },
            { delayMs: 380, freq: 1350, duration: 0.042, volume: 0.95 },
          ],
          speedMultiplier
        );
        break;
      case "word-you": // 10. ドド・ツツツ（あなたたち・あなた）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1550, duration: 0.024, volume: 0.88 },
            { delayMs: 110, freq: 1550, duration: 0.024, volume: 0.88 },
            { delayMs: 290, freq: 3050, duration: 0.015, volume: 0.9 },
            { delayMs: 390, freq: 3050, duration: 0.015, volume: 0.9 },
            { delayMs: 490, freq: 3100, duration: 0.015, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-promise": // 11. チ・トン・チ（約束）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2950, duration: 0.016, volume: 0.85 },
            { delayMs: 190, freq: 1750, duration: 0.024, volume: 0.9 },
            { delayMs: 380, freq: 2950, duration: 0.016, volume: 0.85 },
          ],
          speedMultiplier
        );
        break;
      case "word-go-east": // 12. ツ・ピィッ！（東）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1800, duration: 0.02, volume: 0.82 },
            { delayMs: 240, freq: 3250, duration: 0.015, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-go-west": // 13. ピ・ポポン（西）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 3200, duration: 0.015, volume: 0.88 },
            { delayMs: 200, freq: 2250, duration: 0.018, volume: 0.85 },
            { delayMs: 330, freq: 1550, duration: 0.025, volume: 0.9 },
          ],
          speedMultiplier
        );
        break;
      case "word-go-south": // 14. ポ・ポポン（南）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2100, duration: 0.018, volume: 0.82 },
            { delayMs: 220, freq: 1750, duration: 0.02, volume: 0.86 },
            { delayMs: 360, freq: 1450, duration: 0.026, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-go-north": // 15. ピ・ピピッ（北）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2400, duration: 0.016, volume: 0.82 },
            { delayMs: 180, freq: 2850, duration: 0.015, volume: 0.88 },
            { delayMs: 290, freq: 3300, duration: 0.015, volume: 0.94 },
          ],
          speedMultiplier
        );
        break;
      case "word-greet": // 16. ズジーズ・ズ（挨拶／こんにちは）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1700, duration: 0.026, volume: 0.88 },
            { delayMs: 120, freq: 2150, duration: 0.032, volume: 0.92 },
            { delayMs: 280, freq: 1750, duration: 0.024, volume: 0.88 },
            { delayMs: 450, freq: 1650, duration: 0.028, volume: 0.9 },
          ],
          speedMultiplier
        );
        break;
      case "word-subsea-volcano": // 17. ゴゴゴゴ…（海の下の火山）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1250, duration: 0.032, volume: 0.9 },
            { delayMs: 180, freq: 1200, duration: 0.032, volume: 0.9 },
            { delayMs: 360, freq: 1180, duration: 0.035, volume: 0.92 },
            { delayMs: 540, freq: 1150, duration: 0.038, volume: 0.95 },
          ],
          speedMultiplier
        );
        break;
      case "word-calf": // 18. ト・トーン（クジラの子ども）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 2450, duration: 0.018, volume: 0.85 },
            { delayMs: 320, freq: 2150, duration: 0.034, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      case "word-giant-prey": // 19. チチチチチチッ！（大きい・たくさんの餌）
        await this.playClickPattern([0, 60, 120, 180, 240, 300, 360], 3550, speedMultiplier);
        break;
      case "word-normal-prey": // 20. チチチ・チ（普通の餌）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 90, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 180, freq: 3300, duration: 0.015, volume: 0.85 },
            { delayMs: 360, freq: 3350, duration: 0.016, volume: 0.9 },
          ],
          speedMultiplier
        );
        break;
      case "word-attack": // 21. ババババババッ！（攻撃せよ）
        await this.playMelodicPattern(
          [0, 65, 130, 195, 260, 325].map((d, i) => ({
            delayMs: d,
            freq: 1950 + (i % 2) * 200,
            duration: 0.022,
            volume: 0.95,
          })),
          speedMultiplier
        );
        break;
      case "word-search": // 22. タン・タン・タン（探せ）
        await this.playClickPattern([0, 250, 500], 2400, speedMultiplier);
        break;
      case "word-ack": // 23. カッ（了解した）
      case "word-yes":
        await this.playSingleClick(2950, 0.018, 0.95);
        await new Promise((r) => setTimeout(r, 260 / speedMultiplier));
        break;
      case "word-human-whale": // 24. ド・ドーン・カッカッ（人間とクジラ）
        await this.playMelodicPattern(
          [
            { delayMs: 0, freq: 1650, duration: 0.025, volume: 0.88 },
            { delayMs: 260, freq: 1350, duration: 0.038, volume: 0.94 },
            { delayMs: 560, freq: 2350, duration: 0.016, volume: 0.88 },
            { delayMs: 720, freq: 2350, duration: 0.016, volume: 0.92 },
          ],
          speedMultiplier
        );
        break;
      default:
        await this.playClickPattern([0, 200, 400], 2400, speedMultiplier);
    }
  }

  /**
   * 正しいメッセージ文（祝詞：敵＋餌＋集まれ）を連結再生
   */
  public async playMessageSequence(wordIds: string[], speedMultiplier = 1.0): Promise<void> {
    for (const wId of wordIds) {
      await this.playWordSound(wId, speedMultiplier);
      await new Promise((r) => setTimeout(r, 400 / speedMultiplier));
    }
  }

  /**
   * 人間の舌クリック音（吸着破裂音・舌打ち音）を発振
   * 上顎・歯茎に舌を弾いたときの鋭いインパルス音
   */
  public playTongueClickSound(pitch = 2400) {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.025);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(pitch * 0.9, this.ctx.currentTime);
    filter.Q.setValueAtTime(5.0, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * 海中筒（通海竹筒）を通した音響シミュレーション
   * 竹筒の共鳴（約450Hz）と海中透過パルス音
   */
  public async playSeaTubeAcousticDemo(): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(this.analyser);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.85);

    await this.playClickPattern([0, 180, 360], 2200, 1.0);
  }

  /**
   * 元神主の子ども【吉備津】の口伝クリック音サンプル
   * 「（カッ・カッ）（ド・ドーン）（チ・トン・チ）（タン・タン・タン）（チチチチチチッ！）（カ・カ・カカッ！）」
   * （人・勇魚・契り、探せ、大獲物ぞ、集ひ来）
   * 音響・祝詞解析スタジオの単語定義（word-human, word-whale, word-promise, word-search, word-giant-prey, word-gather）と完全に同一の音響を連続再生
   */
  public async playKibitsuOralClickDemo(): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // 拍1: （カッ・カッ）「ひ・と」【解析スタジオ: 人間（word-human）】
    await this.playWordSound("word-human", 1.0);
    await sleep(400);

    // 拍2: （ド・ドーン）「い・さ」【解析スタジオ: クジラ（word-whale）】
    await this.playWordSound("word-whale", 1.0);
    await sleep(450);

    // 拍3: （チ・トン・チ）「ち・ぎ・り」【解析スタジオ: 約束（word-promise）】
    await this.playWordSound("word-promise", 1.0);
    await sleep(450);

    // 拍4: （タン・タン・タン）「さ・が・せ」【解析スタジオ: 探せ（word-search）】
    await this.playWordSound("word-search", 1.0);
    await sleep(400);

    // 拍5: （チチチチチチッ！）「お・ほ・え・も・の・ぞ！」【解析スタジオ: 巨大な餌（word-giant-prey）】
    await this.playWordSound("word-giant-prey", 1.0);
    await sleep(450);

    // 拍6: （カ・カ・カカッ！）「つ・ど・ひ・こ！」【解析スタジオ: 集まれ（word-gather）】
    await this.playWordSound("word-gather", 1.0);
  }

  /**
   * 空間定位・深海音響特性付きの単一クリック音（エコー・ローパス・パン・距離感）
   */
  public playSpatialClick(
    frequency = 2800,
    duration = 0.015,
    volume = 0.8,
    pan = 0,
    lowpassCutoff = 4500,
    delaySec = 0
  ) {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const now = this.ctx.currentTime + delaySec;
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + duration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(lowpassCutoff, now);
    filter.Q.setValueAtTime(2.0, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    let outputNode: AudioNode = gain;
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      gain.connect(panner);
      outputNode = panner;
    }

    osc.connect(filter);
    filter.connect(gain);
    outputNode.connect(this.analyser);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /**
   * 空間定位付きのクリックパターンの再生
   */
  public async playSpatialClickPattern(
    pattern: number[],
    freq = 2600,
    volume = 0.8,
    pan = 0,
    lowpass = 4500,
    speedMultiplier = 1.0
  ): Promise<void> {
    return new Promise((resolve) => {
      pattern.forEach((delayMs, index) => {
        setTimeout(() => {
          this.playSpatialClick(freq, 0.018, volume, pan, lowpass);
          if (index === pattern.length - 1) {
            setTimeout(resolve, 300 / speedMultiplier);
          }
        }, delayMs / speedMultiplier);
      });
    });
  }

  /**
   * 海上自衛隊大出力ソナー網による新言語放流 ＆ 太平洋クジラ群呼応エコー
   */
  public async playSonarBroadcastAndWhaleResponse(): Promise<void> {
    await this.playWhaleMessageRelayChorus();
  }

  /**
   * 【至高の海中音響演出】クジラたちのメッセージリレー（歌のバトン）
   * 1頭目が了解を返し、自ら同じ歌を歌いながら北上。
   * その歌に応えて遠くのクジラが了解を返し、さらに遠くへリレーしていく。
   */
  public async playWhaleMessageRelayChorus(
    onStatusChange?: (statusText: string, stageIndex: number) => void
  ): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    const fullMessageWords = [
      "word-human",
      "word-whale",
      "word-promise",
      "word-subsea-volcano",
      "word-go-north",
      "word-search",
      "word-giant-prey",
      "word-gather",
    ];

    // --- ステージ1: 海自大出力ソナー網からのパルス放流 ---
    onStatusChange?.("📡 海自大出力ソナー網より『8語の新言語メッセージ』を放流中……", 1);

    // ソナーPing音 (1.8kHz チャープ)
    const pingOsc = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    pingOsc.type = "sine";
    pingOsc.frequency.setValueAtTime(1800, this.ctx.currentTime);
    pingGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
    pingGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);
    pingOsc.connect(pingGain);
    pingGain.connect(this.analyser);
    pingOsc.start();
    pingOsc.stop(this.ctx.currentTime + 0.95);

    await new Promise((r) => setTimeout(r, 900));

    // ソナー網からの合成メッセージ放流
    for (const wId of fullMessageWords) {
      await this.playWordSound(wId, 1.25);
      await new Promise((r) => setTimeout(r, 260));
    }

    onStatusChange?.("🌊 パルスが深海音響層（SOFAR）へ浸透……深海からの応答を待機中", 2);
    await new Promise((r) => setTimeout(r, 1200));

    // --- ステージ2: 至近（0〜10km）の第1クジラが「了解（YES）」を返信！ ---
    onStatusChange?.("🐋 至近海域の第1クジラが【了解】（YESコーダ）を返信！", 3);
    // 明瞭な高音2連打（2900Hz / 近距離 / パン -0.15）
    await this.playSpatialClickPattern([0, 150], 2900, 0.9, -0.15, 6000, 1.0);
    await new Promise((r) => setTimeout(r, 900));

    // --- ステージ3: 第1クジラが自ら同じ歌を歌いながら移動開始！ ---
    onStatusChange?.("🎶 第1クジラがメッセージを自ら歌い始め、北へ遊泳開始！", 4);

    // 第1クジラの歌をバックグラウンドで開始しつつ、途中で第2クジラがリレーする重なり合いを構築
    const singFirstWhale = async () => {
      for (const wId of fullMessageWords) {
        // クジラ自身の生物的な力強いクリック
        await this.playWordSound(wId, 0.95);
        await new Promise((r) => setTimeout(r, 380));
      }
    };

    // 第1クジラが前半（人間・クジラ・約束・海底火山）を歌う
    singFirstWhale();

    // 歌が中盤（約2.5秒後）に達したところで、中距離のクジラが呼応！
    await new Promise((r) => setTimeout(r, 2400));

    // --- ステージ4: 中距離（約30〜50km・鳥島〜須美寿沖）の第2クジラが了解 ＆ リレー開始！ ---
    onStatusChange?.("📡 沖合数十kmの第2クジラが【了解】を返答し、歌をリレー継承！", 5);
    // 中距離了解音（少し高域が減衰、パン +0.45、音量0.6）
    await this.playSpatialClickPattern([0, 160], 2700, 0.6, 0.45, 3200, 1.05);
    await new Promise((r) => setTimeout(r, 600));

    // 第2クジラがリレーして歌い始める（遠くで響く歌）
    const singSecondWhale = async () => {
      for (const wId of fullMessageWords.slice(3)) {
        // 海底火山から先を歌う
        await this.playWordSound(wId, 1.1);
        await new Promise((r) => setTimeout(r, 320));
      }
    };
    singSecondWhale();

    await new Promise((r) => setTimeout(r, 1800));

    // --- ステージ5: 太平洋全域（数百km）から無数の了解と合唱がこだまする！ ---
    onStatusChange?.("🌐 太平洋全域へリレーが到達！ 無数の了解と歌が海中に響き渡る！", 6);

    // 遠距離の複数の了解コーダ（左右から時間差でこだまする）
    this.playSpatialClickPattern([0, 170], 2500, 0.4, -0.6, 2200, 1.1);
    await new Promise((r) => setTimeout(r, 350));
    this.playSpatialClickPattern([0, 160], 2600, 0.35, 0.7, 2000, 1.15);
    await new Promise((r) => setTimeout(r, 450));
    this.playSpatialClickPattern([0, 150], 2800, 0.25, -0.3, 1800, 1.2);
    await new Promise((r) => setTimeout(r, 300));
    this.playSpatialClickPattern([0, 140], 2900, 0.3, 0.2, 1900, 1.25);

    // 遠洋での捕食・集まれコーダの群声エコー
    await new Promise((r) => setTimeout(r, 600));
    await this.playSpatialClickPattern([0, 60, 120, 180, 240, 300], 3200, 0.3, 0.5, 2400, 1.2);
    await new Promise((r) => setTimeout(r, 300));
    await this.playSpatialClickPattern([0, 180, 320, 420], 2400, 0.35, -0.5, 2200, 1.1);

    onStatusChange?.("✅ メッセージリレー完了：太平洋マッコウクジラ群が歌いながら駿河湾へ集結中！", 7);
  }
}

export const audioEngine = typeof window !== "undefined" ? new UnderwaterAudioEngine() : null;

