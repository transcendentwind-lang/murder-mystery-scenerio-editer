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
   * シナリオ中の単語パターンを再生
   */
  public async playWordSound(wordId: string, speedMultiplier = 1.0): Promise<void> {
    switch (wordId) {
      case "word-self": // 自分（我ら）：均等3連打
        await this.playClickPattern([0, 220, 440], 2400, speedMultiplier);
        break;
      case "word-gather": // 集まれ：加速する4連打
        await this.playClickPattern([0, 280, 460, 560], 2800, speedMultiplier);
        break;
      case "word-alert": // 警戒：低音の単発長間隔
      case "word-danger": // 危機（外敵・危険）：低音長間隔コーダ
        await this.playClickPattern([0, 600], 1600, speedMultiplier);
        break;
      case "word-location": // 位置指示（深度・方位）：長短交差コーダ
        await this.playClickPattern([0, 180, 420, 560], 2500, speedMultiplier);
        break;
      case "word-enemy": // 敵（触手・異形）：不規則な乱れ打ち
        await this.playClickPattern([0, 100, 320, 410, 650], 3100, speedMultiplier);
        break;
      case "word-prey": // 餌（極上の獲物・捕食）：高音の高速バースト
        await this.playClickPattern([0, 80, 160, 240, 320, 400], 3600, speedMultiplier);
        break;
      case "word-yes": // YES（肯定・了解・呼応）：明瞭な高音2連打
        await this.playClickPattern([0, 160], 2900, speedMultiplier);
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
   * 海上自衛隊大出力ソナー網による新言語放流 ＆ 太平洋クジラ群呼応エコー
   */
  public async playSonarBroadcastAndWhaleResponse(): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    // 1. 海自大出力アクティブソナーのPing音 (1.8kHz チャープ)
    const pingOsc = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    pingOsc.type = "sine";
    pingOsc.frequency.setValueAtTime(1800, this.ctx.currentTime);
    pingGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    pingGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);
    pingOsc.connect(pingGain);
    pingGain.connect(this.analyser);
    pingOsc.start();
    pingOsc.stop(this.ctx.currentTime + 0.95);

    await new Promise((r) => setTimeout(r, 900));

    // 2. 合成新言語メッセージ（敵・獲物・集まれ）の大出力パルス放流
    await this.playMessageSequence(["word-enemy", "word-prey", "word-gather"], 1.1);

    await new Promise((r) => setTimeout(r, 500));

    // 3. 深海・太平洋全域からのクジラ群応答コーダ（遠方エコー）
    await this.playClickPattern([0, 120, 240, 360, 480], 1900, 0.9);
    await new Promise((r) => setTimeout(r, 200));
    await this.playClickPattern([0, 90, 180, 270], 2300, 1.2);
  }
}

export const audioEngine = typeof window !== "undefined" ? new UnderwaterAudioEngine() : null;

