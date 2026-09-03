import type React from "react";
import { BANDS, CELLS, type Cell } from "../lib/spectrum";
import type { Mode } from "../hooks/useInstrumentController";

type RibbonProps = {
  mode: Mode;
  drone: boolean;
  latched: Set<string>;
  activeKeys: Set<string>;
  keyForCell: (globalIndex: number) => string | null;
  ribbonRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerEnd: () => void;
};

export default function Ribbon({
  mode,
  drone,
  latched,
  activeKeys,
  keyForCell,
  ribbonRef,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
}: RibbonProps) {
  return (
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerLeave={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="spectrum-scroll relative flex gap-[3px] overflow-x-auto pb-3 rounded-xl touch-none select-none"
        style={{ minHeight: 220 }}
      >
        {BANDS.map((band) => (
          <div key={band.id} className="flex flex-col shrink-0">
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
                const cell = cellForEmotion(band.id, emotion.name);
                const active = activeKeys.has(cell.key);
                const isLatched = latched.has(cell.key);
                const keyboard = keyForCell(cell.index);
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
                        active || isLatched
                          ? band.color
                          : "rgba(255,255,255,0.07)"
                      }`,
                      boxShadow: active
                        ? `0 0 26px -2px ${band.glow}, inset 0 0 20px -8px #fff`
                        : isLatched
                        ? `0 0 16px -6px ${band.glow}`
                        : "none",
                      transform: active
                        ? "translateY(-4px) scale(1.02)"
                        : "none",
                    }}
                  >
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
                    {keyboard && (
                      <span
                        className="mt-2 font-mono text-[9px] uppercase rounded px-1 py-0.5"
                        style={{
                          background: active
                            ? "rgba(0,0,0,0.35)"
                            : "rgba(255,255,255,0.06)",
                          color: active ? "#0b0a12" : band.color,
                        }}
                      >
                        {keyboard}
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
  );
}

function cellForEmotion(bandId: string, emotionName: string): Cell {
  return CELLS.find(
    (cell) => cell.band.id === bandId && cell.emotion.name === emotionName
  )!;
}
