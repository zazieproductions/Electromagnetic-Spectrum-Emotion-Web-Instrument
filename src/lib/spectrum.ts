// The Electromagnetic Spectrum of Emotions.
// Each EM band (from long-wavelength Radio up to short-wavelength Gamma)
// carries a family of emotions. Playing left→right ascends the spectrum:
// lower / warmer / grounding emotions give way to higher / sharper / transcendent ones.

export type Timbre = {
  // Oscillator layers stacked per voice.
  waves: OscillatorType[];
  // Detune spread (cents) applied symmetrically across the layers.
  detune: number;
  // Base lowpass cutoff in Hz for this band's character.
  cutoff: number;
  // Filter resonance.
  q: number;
  // Effect character 0..1 (drives reverb/delay send balance in the engine).
  space: number;
  // Attack / release feel in seconds.
  attack: number;
  release: number;
};

export type Emotion = {
  name: string;
  // Semitone offset from the band's base note, used to build the pitch.
  semitone: number;
};

export type Band = {
  id: string;
  region: string; // EM region name
  wavelength: string; // human label
  freqLabel: string; // EM frequency label
  blurb: string;
  color: string; // primary accent
  glow: string; // rgba glow
  // Base MIDI note the band centers around (ascends across the spectrum).
  baseMidi: number;
  timbre: Timbre;
  emotions: Emotion[];
};

// A gentle major-pentatonic-ish set of semitone offsets so any combination
// of notes across the ribbon stays consonant.
const PENTA = [0, 2, 4, 7, 9, 12];

export const BANDS: Band[] = [
  {
    id: "radio",
    region: "Radio",
    wavelength: "1 km – 1 m",
    freqLabel: "3 Hz – 300 MHz",
    blurb: "The longest, slowest waves — deep grounding stillness.",
    color: "#6d5bd6",
    glow: "rgba(109,91,214,0.55)",
    baseMidi: 36,
    timbre: {
      waves: ["sine", "triangle"],
      detune: 6,
      cutoff: 520,
      q: 0.7,
      space: 0.85,
      attack: 0.5,
      release: 2.6,
    },
    emotions: [
      { name: "Stillness", semitone: PENTA[0] },
      { name: "Serenity", semitone: PENTA[1] },
      { name: "Longing", semitone: PENTA[2] },
      { name: "Solitude", semitone: PENTA[3] },
      { name: "Reverence", semitone: PENTA[4] },
    ],
  },
  {
    id: "micro",
    region: "Microwave",
    wavelength: "1 m – 1 mm",
    freqLabel: "300 MHz – 300 GHz",
    blurb: "Low resonant warmth — the hum of comfort.",
    color: "#5b7fd6",
    glow: "rgba(91,127,214,0.55)",
    baseMidi: 43,
    timbre: {
      waves: ["triangle", "sine"],
      detune: 8,
      cutoff: 760,
      q: 0.8,
      space: 0.7,
      attack: 0.35,
      release: 2.0,
    },
    emotions: [
      { name: "Comfort", semitone: PENTA[0] },
      { name: "Nostalgia", semitone: PENTA[1] },
      { name: "Contentment", semitone: PENTA[2] },
      { name: "Belonging", semitone: PENTA[3] },
      { name: "Warmth", semitone: PENTA[4] },
    ],
  },
  {
    id: "infrared",
    region: "Infrared",
    wavelength: "1 mm – 700 nm",
    freqLabel: "300 GHz – 430 THz",
    blurb: "Radiant heat you feel before you see — tenderness and passion.",
    color: "#e05b5b",
    glow: "rgba(224,91,91,0.55)",
    baseMidi: 50,
    timbre: {
      waves: ["triangle", "sawtooth"],
      detune: 10,
      cutoff: 1100,
      q: 1.0,
      space: 0.55,
      attack: 0.18,
      release: 1.6,
    },
    emotions: [
      { name: "Tenderness", semitone: PENTA[0] },
      { name: "Love", semitone: PENTA[1] },
      { name: "Passion", semitone: PENTA[2] },
      { name: "Yearning", semitone: PENTA[3] },
      { name: "Devotion", semitone: PENTA[4] },
    ],
  },
  {
    id: "red",
    region: "Visible · Red",
    wavelength: "700 – 620 nm",
    freqLabel: "430 – 480 THz",
    blurb: "The first light — vital, urgent, alive.",
    color: "#ff4d4d",
    glow: "rgba(255,77,77,0.6)",
    baseMidi: 55,
    timbre: {
      waves: ["sawtooth", "square"],
      detune: 12,
      cutoff: 1500,
      q: 1.3,
      space: 0.4,
      attack: 0.05,
      release: 1.1,
    },
    emotions: [
      { name: "Desire", semitone: PENTA[0] },
      { name: "Courage", semitone: PENTA[1] },
      { name: "Anger", semitone: PENTA[2] },
      { name: "Drive", semitone: PENTA[3] },
      { name: "Hunger", semitone: PENTA[4] },
    ],
  },
  {
    id: "orange",
    region: "Visible · Orange",
    wavelength: "620 – 590 nm",
    freqLabel: "480 – 510 THz",
    blurb: "Glowing energy — sociable and bright.",
    color: "#ff9d3d",
    glow: "rgba(255,157,61,0.6)",
    baseMidi: 57,
    timbre: {
      waves: ["sawtooth", "triangle"],
      detune: 9,
      cutoff: 1900,
      q: 1.1,
      space: 0.42,
      attack: 0.04,
      release: 1.0,
    },
    emotions: [
      { name: "Excitement", semitone: PENTA[0] },
      { name: "Playfulness", semitone: PENTA[1] },
      { name: "Confidence", semitone: PENTA[2] },
      { name: "Enthusiasm", semitone: PENTA[3] },
      { name: "Delight", semitone: PENTA[4] },
    ],
  },
  {
    id: "yellow",
    region: "Visible · Yellow",
    wavelength: "590 – 570 nm",
    freqLabel: "510 – 530 THz",
    blurb: "The brightest daylight — pure optimism.",
    color: "#ffd93d",
    glow: "rgba(255,217,61,0.6)",
    baseMidi: 60,
    timbre: {
      waves: ["square", "triangle"],
      detune: 7,
      cutoff: 2400,
      q: 1.0,
      space: 0.4,
      attack: 0.03,
      release: 0.9,
    },
    emotions: [
      { name: "Joy", semitone: PENTA[0] },
      { name: "Optimism", semitone: PENTA[1] },
      { name: "Hope", semitone: PENTA[2] },
      { name: "Gratitude", semitone: PENTA[3] },
      { name: "Radiance", semitone: PENTA[4] },
    ],
  },
  {
    id: "green",
    region: "Visible · Green",
    wavelength: "570 – 495 nm",
    freqLabel: "530 – 600 THz",
    blurb: "The center of sight — balance and growth.",
    color: "#4dd97a",
    glow: "rgba(77,217,122,0.6)",
    baseMidi: 62,
    timbre: {
      waves: ["triangle", "sine"],
      detune: 6,
      cutoff: 2600,
      q: 0.9,
      space: 0.5,
      attack: 0.06,
      release: 1.1,
    },
    emotions: [
      { name: "Balance", semitone: PENTA[0] },
      { name: "Renewal", semitone: PENTA[1] },
      { name: "Envy", semitone: PENTA[2] },
      { name: "Calm", semitone: PENTA[3] },
      { name: "Harmony", semitone: PENTA[4] },
    ],
  },
  {
    id: "blue",
    region: "Visible · Blue",
    wavelength: "495 – 450 nm",
    freqLabel: "600 – 670 THz",
    blurb: "Cool distance — depth, trust and quiet sorrow.",
    color: "#4d9dff",
    glow: "rgba(77,157,255,0.6)",
    baseMidi: 64,
    timbre: {
      waves: ["sine", "triangle"],
      detune: 8,
      cutoff: 2200,
      q: 1.1,
      space: 0.62,
      attack: 0.12,
      release: 1.6,
    },
    emotions: [
      { name: "Melancholy", semitone: PENTA[0] },
      { name: "Trust", semitone: PENTA[1] },
      { name: "Sorrow", semitone: PENTA[2] },
      { name: "Peace", semitone: PENTA[3] },
      { name: "Depth", semitone: PENTA[4] },
    ],
  },
  {
    id: "violet",
    region: "Visible · Violet",
    wavelength: "450 – 380 nm",
    freqLabel: "670 – 790 THz",
    blurb: "The edge of sight — awe and mystery.",
    color: "#9d5bff",
    glow: "rgba(157,91,255,0.6)",
    baseMidi: 67,
    timbre: {
      waves: ["sawtooth", "sine"],
      detune: 11,
      cutoff: 2800,
      q: 1.4,
      space: 0.66,
      attack: 0.1,
      release: 1.5,
    },
    emotions: [
      { name: "Awe", semitone: PENTA[0] },
      { name: "Wonder", semitone: PENTA[1] },
      { name: "Mystery", semitone: PENTA[2] },
      { name: "Inspiration", semitone: PENTA[3] },
      { name: "Dream", semitone: PENTA[4] },
    ],
  },
  {
    id: "uv",
    region: "Ultraviolet",
    wavelength: "380 – 10 nm",
    freqLabel: "790 THz – 30 PHz",
    blurb: "Beyond the visible — invisible intensity.",
    color: "#c46bff",
    glow: "rgba(196,107,255,0.6)",
    baseMidi: 72,
    timbre: {
      waves: ["sawtooth", "square"],
      detune: 14,
      cutoff: 3400,
      q: 1.8,
      space: 0.5,
      attack: 0.02,
      release: 0.8,
    },
    emotions: [
      { name: "Anxiety", semitone: PENTA[0] },
      { name: "Anticipation", semitone: PENTA[1] },
      { name: "Vigilance", semitone: PENTA[2] },
      { name: "Tension", semitone: PENTA[3] },
      { name: "Alertness", semitone: PENTA[4] },
    ],
  },
  {
    id: "xray",
    region: "X-ray",
    wavelength: "10 nm – 10 pm",
    freqLabel: "30 PHz – 30 EHz",
    blurb: "Piercing through the surface — fear and revelation.",
    color: "#5be0e0",
    glow: "rgba(91,224,224,0.6)",
    baseMidi: 76,
    timbre: {
      waves: ["square", "sawtooth"],
      detune: 16,
      cutoff: 4200,
      q: 2.2,
      space: 0.58,
      attack: 0.015,
      release: 0.7,
    },
    emotions: [
      { name: "Fear", semitone: PENTA[0] },
      { name: "Shock", semitone: PENTA[1] },
      { name: "Revelation", semitone: PENTA[2] },
      { name: "Clarity", semitone: PENTA[3] },
      { name: "Exposure", semitone: PENTA[4] },
    ],
  },
  {
    id: "gamma",
    region: "Gamma",
    wavelength: "< 10 pm",
    freqLabel: "> 30 EHz",
    blurb: "The highest energy in the universe — transcendence.",
    color: "#ffffff",
    glow: "rgba(255,255,255,0.7)",
    baseMidi: 81,
    timbre: {
      waves: ["sawtooth", "square", "triangle"],
      detune: 18,
      cutoff: 6000,
      q: 2.6,
      space: 0.72,
      attack: 0.01,
      release: 0.9,
    },
    emotions: [
      { name: "Ecstasy", semitone: PENTA[0] },
      { name: "Euphoria", semitone: PENTA[1] },
      { name: "Transcendence", semitone: PENTA[2] },
      { name: "Bliss", semitone: PENTA[3] },
      { name: "Rapture", semitone: PENTA[4] },
    ],
  },
];

export type Cell = {
  key: string; // unique id band:index
  band: Band;
  emotion: Emotion;
  midi: number;
  freq: number;
  // global index across the whole ribbon
  index: number;
};

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Flatten every band's emotions into a single ordered ribbon of playable cells.
export const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  let index = 0;
  for (const band of BANDS) {
    band.emotions.forEach((emotion) => {
      const midi = band.baseMidi + emotion.semitone;
      out.push({
        key: `${band.id}:${emotion.name}`,
        band,
        emotion,
        midi,
        freq: midiToFreq(midi),
        index: index++,
      });
    });
  }
  return out;
})();

// Home-row-ish keyboard mapping for the first N cells within the active window.
export const KEY_ROW = [
  "a", "s", "d", "f", "g", "h", "j", "k", "l", ";",
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
];
