import { Power } from "lucide-react";

type StartOverlayProps = {
  onStart: () => Promise<void>;
};

// Browser autoplay policy requires a user gesture before an AudioContext can
// produce sound. This overlay is that gesture.
export default function StartOverlay({ onStart }: StartOverlayProps) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm">
      <button
        onClick={onStart}
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
          <div className="font-display font-extrabold text-2xl">Power On</div>
          <div className="font-mono text-[11px] text-white/50 mt-2 max-w-xs">
            Tap to wake the audio engine, then play the spectrum with your mouse,
            touch, or the A–L / Q–P keys.
          </div>
        </div>
      </button>
    </div>
  );
}
