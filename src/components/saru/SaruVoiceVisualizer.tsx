"use client";

import { useEffect, useRef } from "react";

/**
 * Circular sound-wave visualizer. Draws live levels from an AnalyserNode
 * (microphone while listening, Saru's audio while speaking) and a gentle
 * idle/thinking animation otherwise.
 */
export default function SaruVoiceVisualizer({
  analyser,
  mode,
  size = 220,
}: {
  analyser: AnalyserNode | null;
  mode: "idle" | "listening" | "thinking" | "speaking";
  size?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.scale(dpr, dpr);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bins = 64;
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
    const levels = new Float32Array(bins);
    let raf = 0;
    const colors =
      mode === "speaking" ? ["#22d3ee", "#3b82f6"] : mode === "listening" ? ["#a78bfa", "#22d3ee"] : ["#8b5cf6", "#3b82f6"];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.27;
      if (analyser && (mode === "listening" || mode === "speaking")) {
        analyser.getByteFrequencyData(data);
        for (let i = 0; i < bins; i++) {
          const v = data[Math.floor((i / bins) * data.length * 0.6)] / 255;
          levels[i] += (v - levels[i]) * 0.35;
        }
      } else {
        for (let i = 0; i < bins; i++) {
          const target = reduce ? 0.08 : mode === "thinking" ? 0.18 + 0.15 * Math.sin(t / 220 + i * 0.5) : 0.06 + 0.04 * Math.sin(t / 700 + i * 0.4);
          levels[i] += (Math.max(0, target) - levels[i]) * 0.1;
        }
      }
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, colors[0]);
      g.addColorStop(1, colors[1]);
      ctx.strokeStyle = g;
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(2, size / 90);
      for (let i = 0; i < bins; i++) {
        const a = (i / bins) * Math.PI * 2 + (mode === "thinking" && !reduce ? t / 1600 : 0);
        const len = 4 + levels[i] * size * 0.2;
        ctx.globalAlpha = 0.35 + levels[i] * 0.65;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.lineTo(cx + Math.cos(a) * (r + len), cy + Math.sin(a) * (r + len));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, mode, size]);

  return <canvas ref={canvas} style={{ width: size, height: size }} aria-hidden />;
}
