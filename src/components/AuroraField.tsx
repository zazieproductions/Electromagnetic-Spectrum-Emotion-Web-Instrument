import { useEffect, useRef } from "react";
import { synth } from "../lib/synth";

type Props = {
  accent: string; // current accent color hex
};

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
};

// Full-screen audio-reactive aurora behind the instrument: a warm accent
// wash that swells with spectral energy, and drifting motes that brighten,
// accelerate and bloom as the low end fills. Reads the same AnalyserNode as
// the visualiser, tinted by the active band's colour.
export default function AuroraField({ accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRef = useRef(accent);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const freqData = new Uint8Array(1024);
    const motes: Mote[] = [];
    const COUNT = 120;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "");
      const n = parseInt(
        h.length === 3
          ? h
              .split("")
              .map((c) => c + c)
              .join("")
          : h,
        16
      );
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };

    const seed = () => {
      motes.length = 0;
      for (let i = 0; i < COUNT; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.08 + Math.random() * 0.25),
          size: 0.6 + Math.random() * 2.2,
          seed: Math.random() * Math.PI * 2,
        });
      }
    };
    seed();

    let phase = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      phase += 0.012;

      ctx.clearRect(0, 0, w, h);

      const analyser = synth.analyser;
      let bass = 0;
      let mid = 0;
      if (analyser) {
        analyser.getByteFrequencyData(freqData);
        for (let i = 1; i < 8; i++) bass = Math.max(bass, freqData[i] / 255);
        for (let i = 8; i < 96; i++) mid = Math.max(mid, freqData[i] / 255);
      }
      const energy = Math.max(bass, mid * 0.8);

      const { r, g, b } = hexToRgb(accentRef.current || "#8a7bff");

      // Accent wash anchored low in the frame, swelling with energy.
      const wash = ctx.createRadialGradient(
        w / 2,
        h * 0.9,
        0,
        w / 2,
        h * 0.9,
        Math.max(w, h) * (0.45 + energy * 0.25)
      );
      wash.addColorStop(0, `rgba(${r},${g},${b},${0.05 + energy * 0.1})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      // Drifting motes, sped and bloomed by the energy envelope.
      ctx.shadowBlur = 8 + energy * 14;
      ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
      for (const mote of motes) {
        mote.x += mote.vx + Math.sin(phase + mote.seed) * 0.05;
        mote.y += mote.vy * (1 + energy * 2.2);
        if (mote.y < -10) {
          mote.y = h + 10;
          mote.x = Math.random() * w;
        }
        if (mote.x < -10) mote.x = w + 10;
        if (mote.x > w + 10) mote.x = -10;

        const twinkle = Math.sin(phase * 2 + mote.seed) * 0.5 + 0.5;
        const alpha = (0.05 + twinkle * 0.12) * (0.6 + energy * 1.8);
        const size = mote.size * (1 + energy * 1.5);
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.5, alpha)})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ display: "block" }}
    />
  );
}