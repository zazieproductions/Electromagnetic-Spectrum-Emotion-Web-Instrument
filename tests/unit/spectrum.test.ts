import { describe, expect, it } from "vitest";
import {
  BANDS,
  CELLS,
  KEY_ROW,
  midiToFreq,
} from "../../src/lib/spectrum";

describe("spectrum data model", () => {
  it("contains twelve electromagnetic bands, each with five emotions", () => {
    expect(BANDS).toHaveLength(12);
    BANDS.forEach((band) => {
      expect(band.emotions).toHaveLength(5);
      expect(band.region).toMatch(/\S/);
      expect(band.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("flattens every band into a single continuous ribbon of unique cells", () => {
    expect(CELLS).toHaveLength(BANDS.length * 5);
    const keys = new Set(CELLS.map((cell) => cell.key));
    expect(keys.size).toBe(CELLS.length);
    CELLS.forEach((cell, index) => {
      expect(cell.index).toBe(index);
    });
  });

  it("maps MIDI notes to frequencies with the standard 440 Hz reference", () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(60)).toBeCloseTo(261.6256, 2);
  });

  it("keeps every cell's audible frequency consistent with its MIDI note", () => {
    CELLS.forEach((cell) => {
      expect(cell.freq).toBeCloseTo(midiToFreq(cell.midi), 6);
    });
  });

  it("ascends from the lowest grounding band to the highest gamma band", () => {
    const first = CELLS[0];
    const last = CELLS[CELLS.length - 1];
    expect(first.band.id).toBe("radio");
    expect(first.emotion.name).toBe("Stillness");
    expect(last.band.id).toBe("gamma");
    expect(last.emotion.name).toBe("Rapture");
    expect(last.freq).toBeGreaterThan(first.freq);
  });

  it("provides a keyboard row with unique home-row keys", () => {
    expect(KEY_ROW).toHaveLength(20);
    expect(new Set(KEY_ROW).size).toBe(KEY_ROW.length);
  });
});
