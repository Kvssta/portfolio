"use client";

import { useEffect, useRef } from "react";
import type { Point } from "./signature-tablet";

const LINE = 2.5;
const DURATION = 1100; // ms to redraw the whole signature

/**
 * Replays a captured signature, drawing it stroke-by-stroke along the exact
 * path it was written (Figma feedback). White ink, then it settles — no wiggle.
 */
export function SignatureReplay({
  width,
  height,
  strokes,
}: {
  width: number;
  height: number;
  strokes: Point[][];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = LINE;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";

    const total = strokes.reduce((sum, s) => sum + s.length, 0);
    if (total === 0) return;

    let startTs: number | null = null;
    let raf = 0;
    const render = (ts: number) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / DURATION);
      const target = Math.max(1, Math.round(progress * total));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let count = 0;
      for (const stroke of strokes) {
        if (count >= target) break;
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, LINE / 2, 0, Math.PI * 2);
          ctx.fill();
          count++;
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        count++;
        let prev = stroke[0];
        for (let i = 1; i < stroke.length && count < target; i++) {
          const p = stroke[i];
          ctx.quadraticCurveTo(
            prev.x,
            prev.y,
            (prev.x + p.x) / 2,
            (prev.y + p.y) / 2,
          );
          prev = p;
          count++;
        }
        ctx.stroke();
      }
      if (progress < 1) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [width, height, strokes]);

  return (
    <canvas ref={canvasRef} aria-hidden className="block" style={{ width, height }} />
  );
}
