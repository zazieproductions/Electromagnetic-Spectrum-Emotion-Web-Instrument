import { useEffect, useRef } from "react";
import { synth } from "../lib/synth";

type Props = {
  accent: string; // current accent color hex
  intensity: number; // 0..1 how "energetic" the active band is
};

// Layered analyser visualization: a glowing frequency-bar aurora behind a
// bright oscilloscope waveform, tinted by the active emotion's color.
export default function Visualizer({ accent, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRef = useRef(accent);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const freqData = new Uint8Array(1024);
    const timeData = new Uint8Array(2048);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
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

    let phase = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      phase += 0.01;

      ctx.clearRect(0, 0, w, h);

      const { r, g, b } = hexToRgb(accentRef.current || "#8a7bff");

      const analyser = synth.analyser;
      let hasAudio = false;
      if (analyser) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
        hasAudio = true;
      }

      // --- Frequency aurora (mirrored bars from center) ---
      const bars = 96;
      const cx = w / 2;
      const maxBarH = h * 0.42;
      for (let i = 0; i < bars; i++) {
        const fi = Math.floor((i / bars) * 220);
        const v = hasAudio ? freqData[fi] / 255 : 0;
        const idle = (Math.sin(phase * 2 + i * 0.25) * 0.5 + 0.5) * 0.06;
        const amp = Math.max(idle, v) * (0.5 + intensityRef.current * 0.9);
        const barH = amp * maxBarH;
        const bw = w / (bars * 2);
        const alpha = 0.08 + amp * 0.5;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        // right side
        ctx.fillRect(cx + i * bw, h / 2 - barH, bw * 0.7, barH * 2);
        // left mirror
        ctx.fillRect(cx - (i + 1) * bw, h / 2 - barH, bw * 0.7, barH * 2);
      }

      // --- Oscilloscope waveform ---
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.95)`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.beginPath();
      const slice = w / timeData.length;
      for (let i = 0; i < timeData.length; i++) {
        const v = hasAudio ? timeData[i] / 128 - 1 : Math.sin(i * 0.02 + phase) * 0.02;
        const y = h / 2 + v * h * 0.34;
        const x = i * slice;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // subtle secondary echo line
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,0.12)`;
      ctx.beginPath();
      for (let i = 0; i < timeData.length; i += 2) {
        const v = hasAudio ? timeData[i] / 128 - 1 : 0;
        const y = h / 2 + v * h * 0.2 + 3;
        const x = i * slice;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
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
      className="w-full h-full block"
      style={{ display: "block" }}
    />
  );
}
