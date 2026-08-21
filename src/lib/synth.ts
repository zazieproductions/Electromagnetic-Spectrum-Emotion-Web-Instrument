import type { Cell } from "./spectrum";

// A single sounding voice built from stacked detuned oscillators through
// its own filter + ADSR gain, with parallel sends to delay and reverb buses.
type Voice = {
  oscs: OscillatorNode[];
  gain: GainNode;
  filter: BiquadFilterNode;
  cell: Cell;
  stopped: boolean;
  release: number;
};

export type SynthSettings = {
  master: number; // 0..1
  reverb: number; // 0..1 wet send
  delay: number; // 0..1 wet send
  drive: number; // 0..1 waveshaper drive
  glide: number; // seconds portamento for theremin mode
  drone: boolean; // sustain notes until explicitly released
};

export class EmotionSynth {
  ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private compressor!: DynamicsCompressorNode;
  private shaper!: WaveShaperNode;
  private dryGain!: GainNode;

  private reverbConv!: ConvolverNode;
  private reverbSend!: GainNode;

  private delayNode!: DelayNode;
  private delayFb!: GainNode;
  private delaySend!: GainNode;
  private delayFilter!: BiquadFilterNode;

  analyser!: AnalyserNode;

  private voices = new Map<string, Voice>();
  // Continuous theremin voice (single, retuned as you slide).
  private theremin: Voice | null = null;

  settings: SynthSettings = {
    master: 0.5,
    reverb: 0.55,
    delay: 0.3,
    drive: 0.18,
    glide: 0.06,
    drone: false,
  };

  private started = false;

  async ensureStarted() {
    if (this.started && this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    // --- master chain ---
    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = this.makeDriveCurve(this.settings.drive) as Float32Array<ArrayBuffer>;
    this.shaper.oversample = "4x";

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 24;
    this.compressor.ratio.value = 3.5;
    this.compressor.attack.value = 0.006;
    this.compressor.release.value = 0.25;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.settings.master;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.shaper.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // Dry bus feeds the shaper.
    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 1;
    this.dryGain.connect(this.shaper);

    // --- reverb bus ---
    this.reverbConv = ctx.createConvolver();
    this.reverbConv.buffer = this.makeImpulse(3.2, 2.4);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = this.settings.reverb;
    this.reverbSend.connect(this.reverbConv);
    this.reverbConv.connect(this.shaper);

    // --- ping-pong-ish delay bus ---
    this.delayNode = ctx.createDelay(1.5);
    this.delayNode.delayTime.value = 0.38;
    this.delayFb = ctx.createGain();
    this.delayFb.gain.value = 0.42;
    this.delayFilter = ctx.createBiquadFilter();
    this.delayFilter.type = "lowpass";
    this.delayFilter.frequency.value = 2400;
    this.delaySend = ctx.createGain();
    this.delaySend.gain.value = this.settings.delay;

    this.delaySend.connect(this.delayNode);
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFb);
    this.delayFb.connect(this.delayNode);
    this.delayFilter.connect(this.shaper);

    this.started = true;
    if (ctx.state === "suspended") await ctx.resume();
  }

  private makeDriveCurve(amount: number): Float32Array {
    const k = amount * 100;
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    return curve;
  }

  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // Slightly colored noise tail.
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buf;
  }

  updateSettings(patch: Partial<SynthSettings>) {
    this.settings = { ...this.settings, ...patch };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (patch.master !== undefined)
      this.masterGain.gain.setTargetAtTime(patch.master, now, 0.02);
    if (patch.reverb !== undefined)
      this.reverbSend.gain.setTargetAtTime(patch.reverb, now, 0.02);
    if (patch.delay !== undefined)
      this.delaySend.gain.setTargetAtTime(patch.delay, now, 0.02);
    if (patch.drive !== undefined)
      this.shaper.curve = this.makeDriveCurve(patch.drive) as Float32Array<ArrayBuffer>;
  }

  private buildVoice(cell: Cell, freq: number): Voice {
    const ctx = this.ctx!;
    const t = cell.band.timbre;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = t.cutoff;
    filter.Q.value = t.q;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    const oscs: OscillatorNode[] = [];
    const layers = t.waves.length;
    t.waves.forEach((w, i) => {
      const osc = ctx.createOscillator();
      osc.type = w;
      osc.frequency.value = freq;
      // Symmetric detune spread across layers.
      const spread = layers > 1 ? (i / (layers - 1) - 0.5) * 2 : 0;
      osc.detune.value = spread * t.detune;
      const layerGain = ctx.createGain();
      layerGain.gain.value = 1 / layers;
      osc.connect(layerGain);
      layerGain.connect(filter);
      oscs.push(osc);
    });

    filter.connect(gain);
    gain.connect(this.dryGain);
    // Effect sends, scaled by the band's "space" character.
    const rSend = ctx.createGain();
    rSend.gain.value = t.space;
    gain.connect(rSend);
    rSend.connect(this.reverbSend);
    const dSend = ctx.createGain();
    dSend.gain.value = t.space * 0.7;
    gain.connect(dSend);
    dSend.connect(this.delaySend);

    return { oscs, gain, filter, cell, stopped: false, release: t.release };
  }

  noteOn(cell: Cell, velocity = 0.9) {
    if (!this.ctx) return;
    if (this.voices.has(cell.key)) return; // already sounding
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const t = cell.band.timbre;
    const voice = this.buildVoice(cell, cell.freq);
    voice.oscs.forEach((o) => o.start(now));

    const peak = 0.32 * velocity;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(0.0001, now);
    voice.gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peak),
      now + t.attack
    );
    if (!this.settings.drone) {
      // Sustain slightly then let noteOff handle release; keep a soft plateau.
      voice.gain.gain.setTargetAtTime(peak * 0.75, now + t.attack, 0.4);
    }
    // Gentle filter bloom.
    voice.filter.frequency.cancelScheduledValues(now);
    voice.filter.frequency.setValueAtTime(t.cutoff * 0.6, now);
    voice.filter.frequency.linearRampToValueAtTime(
      t.cutoff,
      now + t.attack + 0.15
    );

    this.voices.set(cell.key, voice);
  }

  noteOff(cell: Cell) {
    const voice = this.voices.get(cell.key);
    if (!voice || !this.ctx) return;
    this.releaseVoice(voice);
    this.voices.delete(cell.key);
  }

  private releaseVoice(voice: Voice) {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const rel = voice.release;
    voice.gain.gain.cancelScheduledValues(now);
    const cur = Math.max(0.0002, voice.gain.gain.value);
    voice.gain.gain.setValueAtTime(cur, now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + rel);
    voice.oscs.forEach((o) => o.stop(now + rel + 0.05));
  }

  // Trigger a note and auto-release (used for keyboard taps / arpeggiator).
  pluck(cell: Cell, holdMs = 260, velocity = 0.9) {
    this.noteOn(cell, velocity);
    if (this.settings.drone) return;
    window.setTimeout(() => this.noteOff(cell), holdMs);
  }

  // --- Theremin (continuous) mode ---
  thereminOn(cell: Cell, freq: number) {
    if (!this.ctx) return;
    if (this.theremin) {
      this.thereminGlide(freq, cell);
      return;
    }
    const voice = this.buildVoice(cell, freq);
    const now = this.ctx.currentTime;
    voice.oscs.forEach((o) => o.start(now));
    voice.gain.gain.setValueAtTime(0.0001, now);
    voice.gain.gain.exponentialRampToValueAtTime(0.26, now + 0.08);
    this.theremin = voice;
  }

  thereminGlide(freq: number, cell?: Cell) {
    if (!this.theremin || !this.ctx) return;
    const now = this.ctx.currentTime;
    const g = this.settings.glide;
    this.theremin.oscs.forEach((o) => {
      o.frequency.setTargetAtTime(freq, now, Math.max(0.005, g));
    });
    if (cell) {
      const t = cell.band.timbre;
      this.theremin.filter.frequency.setTargetAtTime(t.cutoff, now, 0.08);
    }
  }

  thereminOff() {
    if (!this.theremin || !this.ctx) return;
    this.releaseVoice(this.theremin);
    this.theremin = null;
  }

  allOff() {
    this.voices.forEach((v) => this.releaseVoice(v));
    this.voices.clear();
    this.thereminOff();
  }

  activeKeys(): string[] {
    return Array.from(this.voices.keys());
  }
}

export const synth = new EmotionSynth();
