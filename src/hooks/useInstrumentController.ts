import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CELLS, KEY_ROW, midiToFreq, type Cell } from "../lib/spectrum";
import { synth, type SynthSettings } from "../lib/synth";

export type Mode = "ribbon" | "theremin";

export type InstrumentController = {
  started: boolean;
  start: () => Promise<void>;
  mode: Mode;
  selectMode: (next: Mode) => void;
  drone: boolean;
  toggleDrone: () => void;
  arp: boolean;
  toggleArp: () => void;
  arpRate: number;
  setArpRate: (value: number) => void;
  settings: SynthSettings;
  updateSetting: (patch: Partial<SynthSettings>) => void;
  latched: Set<string>;
  activeKeys: Set<string>;
  currentCell: Cell | null;
  accent: string;
  intensity: number;
  keyStart: number;
  keyForCell: (globalIndex: number) => string | null;
  ribbonRef: React.RefObject<HTMLDivElement | null>;
  onRibbonPointerDown: (event: React.PointerEvent) => void;
  onRibbonPointerMove: (event: React.PointerEvent) => void;
  endPointer: () => void;
  panic: () => void;
};

/**
 * Owns the instrument's state machine and reconciles it with the Web Audio
 * singleton in `lib/synth.ts`.
 *
 * The React state here is the interface's declarative mirror: what is latched,
 * what is physically held by the pointer, and which emotion is currently being
 * read out. The synth owns the actual running AudioContext voices.
 */
export function useInstrumentController(): InstrumentController {
  const [started, setStarted] = useState(false);
  const [mode, setModeState] = useState<Mode>("ribbon");
  const [drone, setDrone] = useState(false);
  const [arp, setArp] = useState(false);
  const [arpRate, setArpRate] = useState(0.5); // 0..1 -> ms

  const [settings, setSettings] = useState<SynthSettings>({
    master: 0.55,
    reverb: 0.55,
    delay: 0.3,
    drive: 0.18,
    glide: 0.06,
    drone: false,
  });

  const [latched, setLatched] = useState<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currentCell, setCurrentCell] = useState<Cell | null>(null);
  const [keyStart, setKeyStart] = useState(0); // keyboard window offset into CELLS

  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const pointerDown = useRef(false);
  const pointerCellKey = useRef<string | null>(null);
  const soundingRef = useRef<Set<string>>(new Set());
  const latchedRef = useRef<Set<string>>(new Set());
  const arpIndex = useRef(0);

  const cellByKey = useMemo(() => {
    const map = new Map<string, Cell>();
    CELLS.forEach((cell) => map.set(cell.key, cell));
    return map;
  }, []);

  const accent = currentCell?.band.color ?? "#8a7bff";
  const intensity = currentCell ? currentCell.index / (CELLS.length - 1) : 0.2;

  // ---- settings sync -----------------------------------------------------
  // Push React-side control values into the live synth whenever they change.
  useEffect(() => {
    synth.updateSettings({ ...settings, drone });
  }, [settings, drone]);

  // ---- highlight helper --------------------------------------------------
  const refreshActive = useCallback(() => {
    setActiveKeys(new Set(soundingRef.current));
  }, []);

  const start = useCallback(async () => {
    await synth.ensureStarted();
    synth.updateSettings({ ...settings, drone });
    setStarted(true);
  }, [settings, drone]);

  // ---- core note helpers -------------------------------------------------
  const soundOn = useCallback(
    (cell: Cell) => {
      if (soundingRef.current.has(cell.key)) return;
      synth.noteOn(cell, 0.95);
      soundingRef.current.add(cell.key);
      setCurrentCell(cell);
      refreshActive();
    },
    [refreshActive]
  );

  const soundOff = useCallback(
    (cell: Cell) => {
      if (!soundingRef.current.has(cell.key)) return;
      synth.noteOff(cell);
      soundingRef.current.delete(cell.key);
      refreshActive();
    },
    [refreshActive]
  );

  const clearAllUnsafe = useCallback(() => {
    synth.allOff();
    soundingRef.current.clear();
    setActiveKeys(new Set());
    setLatched(new Set());
    latchedRef.current = new Set();
  }, []);

  // Mode is the one state transition that must also stop every running voice.
  const selectMode = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      clearAllUnsafe();
      setModeState(next);
    },
    [mode, clearAllUnsafe]
  );

  const toggleLatch = useCallback((cell: Cell) => {
    setLatched((prev) => {
      const next = new Set(prev);
      if (next.has(cell.key)) next.delete(cell.key);
      else next.add(cell.key);
      latchedRef.current = next;
      return next;
    });
    setCurrentCell(cell);
  }, []);

  // Reconcile sustained voices with latched set when in drone (non-arp) mode.
  useEffect(() => {
    latchedRef.current = latched;
    if (!started) return;
    if (mode === "theremin") return;
    if (drone && !arp) {
      // Sustain everything latched.
      latched.forEach((key) => {
        const cell = cellByKey.get(key);
        if (cell) soundOn(cell);
      });
      // Stop anything sounding that is no longer latched.
      Array.from(soundingRef.current).forEach((key) => {
        if (!latched.has(key)) {
          const cell = cellByKey.get(key);
          if (cell) soundOff(cell);
        }
      });
    }
  }, [latched, drone, arp, mode, started, cellByKey, soundOn, soundOff]);

  // When arp turns on, silence sustained voices (they'll be sequenced instead).
  useEffect(() => {
    if (arp) {
      Array.from(soundingRef.current).forEach((key) => {
        const cell = cellByKey.get(key);
        if (cell) soundOff(cell);
      });
    } else if (drone && mode === "ribbon") {
      latchedRef.current.forEach((key) => {
        const cell = cellByKey.get(key);
        if (cell) soundOn(cell);
      });
    }
  }, [arp, drone, mode, cellByKey, soundOn, soundOff]);

  // Arpeggiator loop over latched cells.
  useEffect(() => {
    if (!arp || !started) return;
    const ms = 90 + (1 - arpRate) * 360;
    const timeouts: number[] = [];

    const id = window.setInterval(() => {
      const keys = Array.from(latchedRef.current);
      if (keys.length === 0) return;
      const key = keys[arpIndex.current % keys.length];
      arpIndex.current++;
      const cell = cellByKey.get(key);
      if (cell) {
        synth.pluck(cell, ms * 0.9, 0.9);
        setCurrentCell(cell);
        setActiveKeys(new Set([key]));
        timeouts.push(
          window.setTimeout(() => setActiveKeys(new Set()), ms * 0.7)
        );
      }
    }, ms);

    return () => {
      window.clearInterval(id);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [arp, arpRate, started, cellByKey]);

  // ---- ribbon pointer interaction ---------------------------------------
  const cellFromPoint = useCallback(
    (x: number, y: number): Cell | null => {
      const element = document.elementFromPoint(x, y);
      const holder = element?.closest(
        "[data-cellkey]"
      ) as HTMLElement | null;
      if (!holder) return null;
      return cellByKey.get(holder.dataset.cellkey!) ?? null;
    },
    [cellByKey]
  );

  const thereminFromPoint = useCallback(
    (clientX: number): { cell: Cell; freq: number } | null => {
      const rect = ribbonRef.current?.getBoundingClientRect();
      if (!rect) return null;
      let fraction = (clientX - rect.left) / rect.width;
      fraction = Math.min(1, Math.max(0, fraction));
      const first = CELLS[0].midi;
      const last = CELLS[CELLS.length - 1].midi;
      const midi = first + fraction * (last - first);
      const freq = midiToFreq(midi);
      const index = Math.round(fraction * (CELLS.length - 1));
      return { cell: CELLS[index], freq };
    },
    []
  );

  const onRibbonPointerDown = useCallback(
    async (event: React.PointerEvent) => {
      if (!started) {
        await start();
      }
      pointerDown.current = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);

      if (mode === "theremin") {
        const next = thereminFromPoint(event.clientX);
        if (next) {
          synth.thereminOn(next.cell, next.freq);
          setCurrentCell(next.cell);
          setActiveKeys(new Set([next.cell.key]));
        }
        return;
      }

      const cell = cellFromPoint(event.clientX, event.clientY);
      if (!cell) return;
      if (drone) {
        toggleLatch(cell);
      } else {
        pointerCellKey.current = cell.key;
        soundOn(cell);
      }
    },
    [started, start, mode, drone, thereminFromPoint, cellFromPoint, toggleLatch, soundOn]
  );

  const onRibbonPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!pointerDown.current) return;

      if (mode === "theremin") {
        const next = thereminFromPoint(event.clientX);
        if (next) {
          synth.thereminGlide(next.freq, next.cell);
          setCurrentCell(next.cell);
          setActiveKeys(new Set([next.cell.key]));
        }
        return;
      }

      if (drone) return; // latch handled on down only
      const cell = cellFromPoint(event.clientX, event.clientY);
      if (!cell) return;
      if (cell.key !== pointerCellKey.current) {
        const previous = pointerCellKey.current
          ? cellByKey.get(pointerCellKey.current)
          : null;
        if (previous) soundOff(previous);
        pointerCellKey.current = cell.key;
        soundOn(cell);
      }
    },
    [mode, drone, thereminFromPoint, cellFromPoint, cellByKey, soundOn, soundOff]
  );

  const endPointer = useCallback(() => {
    pointerDown.current = false;
    if (mode === "theremin") {
      synth.thereminOff();
      setActiveKeys(new Set());
      return;
    }
    if (!drone && pointerCellKey.current) {
      const previous = cellByKey.get(pointerCellKey.current);
      if (previous) soundOff(previous);
      pointerCellKey.current = null;
    }
  }, [mode, drone, cellByKey, soundOff]);

  // ---- keyboard mapping --------------------------------------------------
  useEffect(() => {
    const windowCells = CELLS.slice(keyStart, keyStart + KEY_ROW.length);
    const keyMap = new Map<string, Cell>();
    KEY_ROW.forEach((key, index) => {
      if (windowCells[index]) keyMap.set(key, windowCells[index]);
    });
    const held = new Set<string>();

    const onDown = async (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "arrowleft") {
        setKeyStart((value) => Math.max(0, value - 5));
        return;
      }
      if (key === "arrowright") {
        setKeyStart((value) =>
          Math.min(CELLS.length - KEY_ROW.length, value + 5)
        );
        return;
      }
      const cell = keyMap.get(key);
      if (!cell) return;
      event.preventDefault();
      if (!started) await start();
      if (held.has(key)) return;
      held.add(key);
      if (mode === "theremin") {
        synth.pluck(cell, 320, 0.9);
        setCurrentCell(cell);
        setActiveKeys((previous) => new Set(previous).add(cell.key));
        return;
      }
      if (drone) {
        toggleLatch(cell);
      } else {
        soundOn(cell);
      }
    };

    const onUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const cell = keyMap.get(key);
      held.delete(key);
      if (!cell) return;
      if (mode === "theremin") {
        setActiveKeys((previous) => {
          const next = new Set(previous);
          next.delete(cell.key);
          return next;
        });
        return;
      }
      if (!drone) soundOff(cell);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [keyStart, mode, drone, started, start, soundOn, soundOff, toggleLatch]);

  const keyForCell = useCallback(
    (globalIndex: number): string | null => {
      const relative = globalIndex - keyStart;
      if (relative >= 0 && relative < KEY_ROW.length) return KEY_ROW[relative];
      return null;
    },
    [keyStart]
  );

  return {
    started,
    start,
    mode,
    selectMode,
    drone,
    toggleDrone: () => setDrone((value) => !value),
    arp,
    toggleArp: () => setArp((value) => !value),
    arpRate,
    setArpRate,
    settings,
    updateSetting: (patch) => setSettings((previous) => ({ ...previous, ...patch })),
    latched,
    activeKeys,
    currentCell,
    accent,
    intensity,
    keyStart,
    keyForCell,
    ribbonRef,
    onRibbonPointerDown,
    onRibbonPointerMove,
    endPointer,
    panic: clearAllUnsafe,
  };
}
