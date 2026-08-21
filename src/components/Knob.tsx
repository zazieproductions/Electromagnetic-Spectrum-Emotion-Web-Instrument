import { useRef } from "react";

type Props = {
  label: string;
  value: number; // 0..1
  onChange: (v: number) => void;
  accent: string;
  format?: (v: number) => string;
};

// A draggable rotary knob (vertical drag to change), styled like lab hardware.
export default function Knob({ label, value, onChange, accent, format }: Props) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  const angle = -135 + value * 270;

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = startY.current - e.clientY;
    const next = Math.min(1, Math.max(0, startVal.current + dy / 180));
    onChange(next);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => onChange(0.5)}
        className="relative w-14 h-14 rounded-full cursor-ns-resize touch-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, #23203a, #0c0a16 70%)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), inset 0 2px 6px rgba(0,0,0,0.6), 0 0 18px -6px ${accent}`,
        }}
      >
        {/* tick ring */}
        <div className="absolute inset-0 rounded-full" />
        {/* indicator */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: 2,
            height: 20,
            marginLeft: -1,
            marginTop: -20,
            transform: `rotate(${angle}deg)`,
            background: accent,
            borderRadius: 2,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        <div
          className="absolute inset-[30%] rounded-full"
          style={{ background: "radial-gradient(circle at 40% 30%, #2c2846, #100d1e)" }}
        />
      </div>
      <div className="text-center leading-tight">
        <div
          className="font-mono text-[10px] tracking-[0.15em] uppercase"
          style={{ color: accent }}
        >
          {label}
        </div>
        <div className="font-mono text-[11px] text-white/50">
          {format ? format(value) : Math.round(value * 100)}
        </div>
      </div>
    </div>
  );
}
