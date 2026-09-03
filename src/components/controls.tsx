import type { ReactNode } from "react";

type ModeButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  accent: string;
};

export function ModeButton({
  active,
  onClick,
  icon,
  label,
  accent,
}: ModeButtonProps) {
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

type ToggleProps = {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  accent: string;
};

export function Toggle({ active, onClick, icon, label, accent }: ToggleProps) {
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

export function PanicButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
    >
      Panic
    </button>
  );
}
