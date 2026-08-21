import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Power, Waves, Piano, Zap, Repeat, Infinity as InfinityIcon } from "lucide-react";
import { BANDS, CELLS, KEY_ROW, midiToFreq, type Cell } from "./lib/spectrum";
import { synth, type SynthSettings } from "./lib/synth";
import Visualizer from "./components/Visualizer";
import Knob from "./components/Knob";

type Mode = "ribbon" | "theremin";

export default function App() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("ribbon");
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
    const m = new Map<string, Cell>();
    CELLS.forEach((c) => m.set(c.key, c));
    return m;
  }, []);

  const accent = currentCell?.band.color ?? "#8a7bff";
  const intensity = currentCell ? currentCell.index / (CELLS.length - 1) : 0.2;

  // ---- settings sync ----
  useEffect(() => {
    synth.updateSettings({ ...settings, drone });
  }, [settings, drone]);

  // ---- highlight helper ----
  const refreshActive = useCallback(() => {
    setActiveKeys(new Set(soundingRef.current));
  }, []);

  const start = useCallback(async () => {
    await synth.ensureStarted();
    synth.updateSettings({ ...settings, drone });
    setStarted(true);
  }, [settings, drone]);

  // ---- core note helpers ----
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

  // ---- drone latch reconciliation ----
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
      // sustain everything latched
      latched.forEach((k) => {
        const c = cellByKey.get(k);
        if (c) soundOn(c);
      });
      // stop anything sounding no longer latched
      Array.from(soundingRef.current).forEach((k) => {
        if (!latched.has(k)) {
          const c = cellByKey.get(k);
          if (c) soundOff(c);
        }
      });
    }
  }, [latched, drone, arp, mode, started, cellByKey, soundOn, soundOff]);

  // When arp turns on, silence sustained voices (they'll be sequenced instead).
  useEffect(() => {
    if (arp) {
      Array.from(soundingRef.current).forEach((k) => {
        const c = cellByKey.get(k);
        if (c) soundOff(c);
      });
    } else if (drone && mode === "ribbon") {
      latchedRef.current.forEach((k) => {
        const c = cellByKey.get(k);
        if (c) soundOn(c);
      });
    }
  }, [arp, drone, mode, cellByKey, soundOn, soundOff]);

  // Arpeggiator loop over latched cells.
  useEffect(() => {
    if (!arp || !started) return;
    const ms = 90 + (1 - arpRate) * 360;
    const id = window.setInterval(() => {
      const keys = Array.from(latchedRef.current);
      if (keys.length === 0) return;
      const k = keys[arpIndex.current % keys.length];
      arpIndex.current++;
      const c = cellByKey.get(k);
      if (c) {
        synth.pluck(c, ms * 0.9, 0.9);
        setCurrentCell(c);
        setActiveKeys(new Set([k]));
        window.setTimeout(() => setActiveKeys(new Set()), ms * 0.7);
      }
    }, ms);
    return () => window.clearInterval(id);
  }, [arp, arpRate, started, cellByKey]);

  // ---- ribbon pointer interaction ----
  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y);
    const holder = el?.closest("[data-cellkey]") as HTMLElement | null;
    if (!holder) return null;
    return cellByKey.get(holder.dataset.cellkey!) ?? null;
  };

  const thereminFromPoint = (clientX: number): { cell: Cell; freq: number } | null => {
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (!rect) return null;
    let f = (clientX - rect.left) / rect.width;
    f = Math.min(1, Math.max(0, f));
    const first = CELLS[0].midi;
    const last = CELLS[CELLS.length - 1].midi;
    const midi = first + f * (last - first);
    const freq = midiToFreq(midi);
    const idx = Math.round(f * (CELLS.length - 1));
    return { cell: CELLS[idx], freq };
  };

  const onRibbonPointerDown = async (e: React.PointerEvent) => {
    if (!started) {
      await start();
    }
    pointerDown.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    if (mode === "theremin") {
      const t = thereminFromPoint(e.clientX);
      if (t) {
        synth.thereminOn(t.cell, t.freq);
        setCurrentCell(t.cell);
        setActiveKeys(new Set([t.cell.key]));
      }
      return;
    }

    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    if (drone) {
      toggleLatch(cell);
    } else {
      pointerCellKey.current = cell.key;
      soundOn(cell);
    }
  };

  const onRibbonPointerMove = (e: React.PointerEvent) => {
    if (!pointerDown.current) return;

    if (mode === "theremin") {
      const t = thereminFromPoint(e.clientX);
      if (t) {
        synth.thereminGlide(t.freq, t.cell);
        setCurrentCell(t.cell);
        setActiveKeys(new Set([t.cell.key]));
      }
      return;
    }

    if (drone) return; // latch handled on down only
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    if (cell.key !== pointerCellKey.current) {
      const prev = pointerCellKey.current
        ? cellByKey.get(pointerCellKey.current)
        : null;
      if (prev) soundOff(prev);
      pointerCellKey.current = cell.key;
      soundOn(cell);
    }
  };

  const endPointer = () => {
    pointerDown.current = false;
    if (mode === "theremin") {
      synth.thereminOff();
      setActiveKeys(new Set());
      return;
    }
    if (!drone && pointerCellKey.current) {
      const prev = cellByKey.get(pointerCellKey.current);
      if (prev) soundOff(prev);
      pointerCellKey.current = null;
    }
  };

  // ---- keyboard mapping ----
  useEffect(() => {
    const windowCells = CELLS.slice(keyStart, keyStart + KEY_ROW.length);
    const keyMap = new Map<string, Cell>();
    KEY_ROW.forEach((k, i) => {
      if (windowCells[i]) keyMap.set(k, windowCells[i]);
    });
    const held = new Set<string>();

    const onDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft") {
        setKeyStart((s) => Math.max(0, s - 5));
        return;
      }
      if (k === "arrowright") {
        setKeyStart((s) => Math.min(CELLS.length - KEY_ROW.length, s + 5));
        return;
      }
      const cell = keyMap.get(k);
      if (!cell) return;
      e.preventDefault();
      if (!started) await start();
      if (held.has(k)) return;
      held.add(k);
      if (mode === "theremin") {
        synth.pluck(cell, 320, 0.9);
        setCurrentCell(cell);
        setActiveKeys((p) => new Set(p).add(cell.key));
        return;
      }
      if (drone) {
        toggleLatch(cell);
      } else {
        soundOn(cell);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const cell = keyMap.get(k);
      held.delete(k);
      if (!cell) return;
      if (mode === "theremin") {
        setActiveKeys((p) => {
          const n = new Set(p);
          n.delete(cell.key);
          return n;
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

  // clear everything when switching modes
  useEffect(() => {
    synth.allOff();
    soundingRef.current.clear();
    setActiveKeys(new Set());
    setLatched(new Set());
    latchedRef.current = new Set();
  }, [mode]);

  const keyForCell = (globalIndex: number): string | null => {
    const rel = globalIndex - keyStart;
    if (rel >= 0 && rel < KEY_ROW.length) return KEY_ROW[rel];
    return null;
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      {/* atmospheric background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% -10%, rgba(120,90,255,0.16), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(255,90,140,0.1), transparent 55%), radial-gradient(700px 500px at 5% 90%, rgba(80,200,255,0.08), transparent 55%), #05040a",
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "40px 40px",
          animation: "floatGrain 12s linear infinite alternate",
        }}
      />

      {/* header */}
      <header className="px-6 md:px-10 pt-7 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-lg grid place-items-center"
              style={{
                background: `linear-gradient(135deg, ${accent}, #05040a)`,
                boxShadow: `0 0 22px -4px ${accent}`,
              }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <h1
              className="font-display font-extrabold tracking-tight text-xl md:text-2xl"
              style={{ textShadow: `0 0 30px ${accent}55` }}
            >
              THE EMOTION SPECTRUM
            </h1>
          </div>
          <p className="font-mono text-[11px] md:text-xs text-white/45 mt-2 max-w-xl tracking-wide">
            An instrument tuned to the electromagnetic spectrum — from long
            grounding radio waves to transcendent gamma. Play the light. Hear
            the feeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ModeButton
            active={mode === "ribbon"}
            onClick={() => setMode("ribbon")}
            icon={<Piano size={15} />}
            label="Ribbon"
            accent={accent}
          />
          <ModeButton
            active={mode === "theremin"}
            onClick={() => setMode("theremin")}
            icon={<Waves size={15} />}
            label="Theremin"
            accent={accent}
          />
        </div>
      </header>

      {/* visualizer + readout */}
      <section className="px-6 md:px-10">
        <div
          className="relative rounded-2xl overflow-hidden border border-white/10"
          style={{
            height: 210,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.35))",
            boxShadow: `inset 0 0 60px -20px ${accent}, 0 20px 60px -40px ${accent}`,
          }}
        >
          <Visualizer accent={accent} intensity={intensity} />
          {/* readout overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-6 md:px-8 pointer-events-none">
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                {currentCell ? currentCell.band.region : "Awaiting input"}
              </div>
              <div
                className="font-serif text-3xl md:text-5xl leading-none mt-1"
                style={{ color: accent, textShadow: `0 0 40px ${accent}` }}
              >
                {currentCell ? currentCell.emotion.name : "—"}
              </div>
              {currentCell && (
                <div className="font-mono text-[10px] text-white/40 mt-2">
                  λ {currentCell.band.wavelength} · {currentCell.band.freqLabel}
                </div>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                Frequency
              </div>
              <div
                className="font-mono text-2xl md:text-3xl"
                style={{ color: accent }}
              >
                {currentCell ? currentCell.freq.toFixed(1) : "0.0"}
                <span className="text-sm text-white/40"> Hz</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ribbon */}
      <section className="px-6 md:px-10 mt-5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
            {mode === "ribbon"
              ? drone
                ? "Ribbon · Drone latch — click emotions to hold"
                : "Ribbon · press & drag across the spectrum"
              : "Theremin · glide left→right to sweep the spectrum"}
          </div>
          <div className="font-mono text-[10px] text-white/30">
            ◄ ► shifts keyboard row
          </div>
        </div>

        <div
          ref={ribbonRef}
          onPointerDown={onRibbonPointerDown}
          onPointerMove={onRibbonPointerMove}
          onPointerUp={endPointer}
          onPointerLeave={endPointer}
          onPointerCancel={endPointer}
          className="spectrum-scroll relative flex gap-[3px] overflow-x-auto pb-3 rounded-xl touch-none select-none"
          style={{ minHeight: 220 }}
        >
          {BANDS.map((band) => (
            <div key={band.id} className="flex flex-col shrink-0">
              {/* band header */}
              <div
                className="px-2 py-1.5 rounded-t-md mb-[3px]"
                style={{
                  background: `linear-gradient(180deg, ${band.color}22, transparent)`,
                  borderBottom: `1px solid ${band.color}44`,
                }}
              >
                <div
                  className="font-display text-[10px] font-semibold tracking-wide whitespace-nowrap"
                  style={{ color: band.color }}
                >
                  {band.region}
                </div>
                <div className="font-mono text-[8px] text-white/35 whitespace-nowrap">
                  {band.wavelength}
                </div>
              </div>

              <div className="flex gap-[3px] h-full">
                {band.emotions.map((emotion) => {
                  const cell = CELLS.find(
                    (c) => c.band.id === band.id && c.emotion.name === emotion.name
                  )!;
                  const active = activeKeys.has(cell.key);
                  const isLatched = latched.has(cell.key);
                  const kb = keyForCell(cell.index);
                  return (
                    <button
                      key={cell.key}
                      data-cellkey={cell.key}
                      className="relative w-11 md:w-[52px] rounded-md flex flex-col justify-end items-center pb-2 pt-3 transition-transform duration-75"
                      style={{
                        height: 172,
                        background: active
                          ? `linear-gradient(180deg, ${band.color}, ${band.color}66)`
                          : isLatched
                          ? `linear-gradient(180deg, ${band.color}88, ${band.color}22)`
                          : `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))`,
                        border: `1px solid ${
                          active || isLatched ? band.color : "rgba(255,255,255,0.07)"
                        }`,
                        boxShadow: active
                          ? `0 0 26px -2px ${band.glow}, inset 0 0 20px -8px #fff`
                          : isLatched
                          ? `0 0 16px -6px ${band.glow}`
                          : "none",
                        transform: active ? "translateY(-4px) scale(1.02)" : "none",
                      }}
                    >
                      {/* vertical emotion label */}
                      <span
                        className="font-display text-[10px] md:text-[11px] font-semibold tracking-tight"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          color: active ? "#0b0a12" : "#ffffff",
                          opacity: active ? 1 : 0.82,
                          textShadow: active ? "none" : `0 0 8px ${band.color}55`,
                        }}
                      >
                        {emotion.name}
                      </span>
                      {kb && (
                        <span
                          className="mt-2 font-mono text-[9px] uppercase rounded px-1 py-0.5"
                          style={{
                            background: active
                              ? "rgba(0,0,0,0.35)"
                              : "rgba(255,255,255,0.06)",
                            color: active ? "#0b0a12" : band.color,
                          }}
                        >
                          {kb}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* control deck */}
      <section className="px-6 md:px-10 py-5 mt-2">
        <div
          className="rounded-2xl border border-white/10 px-5 md:px-8 py-5 flex flex-wrap items-center gap-x-8 gap-y-5 justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))",
          }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            <Knob
              label="Master"
              value={settings.master}
              accent={accent}
              onChange={(v) => setSettings((s) => ({ ...s, master: v }))}
            />
            <Knob
              label="Reverb"
              value={settings.reverb}
              accent={accent}
              onChange={(v) => setSettings((s) => ({ ...s, reverb: v }))}
            />
            <Knob
              label="Delay"
              value={settings.delay}
              accent={accent}
              onChange={(v) => setSettings((s) => ({ ...s, delay: v }))}
            />
            <Knob
              label="Drive"
              value={settings.drive}
              accent={accent}
              onChange={(v) => setSettings((s) => ({ ...s, drive: v }))}
            />
            {mode === "theremin" ? (
              <Knob
                label="Glide"
                value={settings.glide / 0.4}
                accent={accent}
                format={(v) => `${Math.round(v * 400)}ms`}
                onChange={(v) => setSettings((s) => ({ ...s, glide: v * 0.4 }))}
              />
            ) : (
              <Knob
                label="Arp Rate"
                value={arpRate}
                accent={accent}
                format={(v) => `${Math.round(90 + (1 - v) * 360)}ms`}
                onChange={setArpRate}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {mode === "ribbon" && (
              <>
                <Toggle
                  active={drone}
                  onClick={() => setDrone((d) => !d)}
                  icon={<InfinityIcon size={15} />}
                  label="Drone"
                  accent={accent}
                />
                <Toggle
                  active={arp}
                  onClick={() => setArp((a) => !a)}
                  icon={<Repeat size={15} />}
                  label="Arp"
                  accent={accent}
                />
              </>
            )}
            <button
              onClick={() => {
                synth.allOff();
                soundingRef.current.clear();
                setActiveKeys(new Set());
                setLatched(new Set());
                latchedRef.current = new Set();
              }}
              className="font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
            >
              Panic
            </button>
          </div>
        </div>
      </section>

      {/* start overlay */}
      {!started && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
          <button
            onClick={start}
            className="group flex flex-col items-center gap-5 px-10 py-9 rounded-3xl border border-white/15"
            style={{
              background:
                "radial-gradient(400px 200px at 50% 0%, rgba(140,110,255,0.25), transparent), rgba(10,8,20,0.85)",
            }}
          >
            <div
              className="h-20 w-20 rounded-full grid place-items-center transition-transform group-hover:scale-110"
              style={{
                background:
                  "conic-gradient(from 0deg, #6d5bd6, #e05b5b, #ffd93d, #4dd97a, #4d9dff, #9d5bff, #6d5bd6)",
                boxShadow: "0 0 60px -8px rgba(150,120,255,0.8)",
              }}
            >
              <Power size={30} className="text-white" />
            </div>
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl">
                Power On
              </div>
              <div className="font-mono text-[11px] text-white/50 mt-2 max-w-xs">
                Tap to wake the audio engine, then play the spectrum with your
                mouse, touch, or the A–L / Q–P keys.
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider transition"
      style={{
        background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? accent : "rgba(255,255,255,0.08)"}`,
        color: active ? accent : "rgba(255,255,255,0.55)",
        boxShadow: active ? `0 0 20px -6px ${accent}` : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition"
      style={{
        background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? accent : "rgba(255,255,255,0.08)"}`,
        color: active ? accent : "rgba(255,255,255,0.5)",
        boxShadow: active ? `0 0 18px -6px ${accent}` : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
