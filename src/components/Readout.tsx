import type { Cell } from "../lib/spectrum";
import Visualizer from "./Visualizer";

type ReadoutProps = {
  currentCell: Cell | null;
  accent: string;
  intensity: number;
};

// The visualizer and its live telemetry overlay: current spectral band,
// emotion, wavelength, and measured frequency.
export default function Readout({ currentCell, accent, intensity }: ReadoutProps) {
  return (
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
            <div className="font-mono text-2xl md:text-3xl" style={{ color: accent }}>
              {currentCell ? currentCell.freq.toFixed(1) : "0.0"}
              <span className="text-sm text-white/40"> Hz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
