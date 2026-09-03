import { Piano, Waves, Zap } from "lucide-react";
import type { Mode } from "../hooks/useInstrumentController";
import { ModeButton } from "./controls";

type HeaderProps = {
  accent: string;
  mode: Mode;
  selectMode: (next: Mode) => void;
};

export default function Header({ accent, mode, selectMode }: HeaderProps) {
  return (
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
          grounding radio waves to transcendent gamma. Play the light. Hear the
          feeling.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ModeButton
          active={mode === "ribbon"}
          onClick={() => selectMode("ribbon")}
          icon={<Piano size={15} />}
          label="Ribbon"
          accent={accent}
        />
        <ModeButton
          active={mode === "theremin"}
          onClick={() => selectMode("theremin")}
          icon={<Waves size={15} />}
          label="Theremin"
          accent={accent}
        />
      </div>
    </header>
  );
}
