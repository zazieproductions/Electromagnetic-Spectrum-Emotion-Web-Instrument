import { Infinity as InfinityIcon, Repeat } from "lucide-react";
import type { Mode } from "../hooks/useInstrumentController";
import type { SynthSettings } from "../lib/synth";
import Knob from "./Knob";
import { PanicButton, Toggle } from "./controls";

type ControlDeckProps = {
  settings: SynthSettings;
  updateSetting: (patch: Partial<SynthSettings>) => void;
  mode: Mode;
  drone: boolean;
  toggleDrone: () => void;
  arp: boolean;
  toggleArp: () => void;
  arpRate: number;
  setArpRate: (value: number) => void;
  accent: string;
  panic: () => void;
};

export default function ControlDeck({
  settings,
  updateSetting,
  mode,
  drone,
  toggleDrone,
  arp,
  toggleArp,
  arpRate,
  setArpRate,
  accent,
  panic,
}: ControlDeckProps) {
  return (
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
            onChange={(value) => updateSetting({ master: value })}
          />
          <Knob
            label="Reverb"
            value={settings.reverb}
            accent={accent}
            onChange={(value) => updateSetting({ reverb: value })}
          />
          <Knob
            label="Delay"
            value={settings.delay}
            accent={accent}
            onChange={(value) => updateSetting({ delay: value })}
          />
          <Knob
            label="Drive"
            value={settings.drive}
            accent={accent}
            onChange={(value) => updateSetting({ drive: value })}
          />
          {mode === "theremin" ? (
            <Knob
              label="Glide"
              value={settings.glide / 0.4}
              accent={accent}
              format={(value) => `${Math.round(value * 400)}ms`}
              onChange={(value) => updateSetting({ glide: value * 0.4 })}
            />
          ) : (
            <Knob
              label="Arp Rate"
              value={arpRate}
              accent={accent}
              format={(value) => `${Math.round(90 + (1 - value) * 360)}ms`}
              onChange={setArpRate}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {mode === "ribbon" && (
            <>
              <Toggle
                active={drone}
                onClick={toggleDrone}
                icon={<InfinityIcon size={15} />}
                label="Drone"
                accent={accent}
              />
              <Toggle
                active={arp}
                onClick={toggleArp}
                icon={<Repeat size={15} />}
                label="Arp"
                accent={accent}
              />
            </>
          )}
          <PanicButton onClick={panic} />
        </div>
      </div>
    </section>
  );
}
