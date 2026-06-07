"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const LINE = 2.5;
const W = 240;
const H = 180;

export type Point = { x: number; y: number };
export type Signature = {
  width: number;
  height: number;
  /** Stroke paths in CSS px, normalised to the cropped signature's origin. */
  strokes: Point[][];
};
export type SignatureHandle = {
  /** Cropped to the drawn ink (with its strokes); null if nothing drawn. */
  capture: () => Signature | null;
  clear: () => void;
};

/**
 * Gray signature tablet (Figma 51:419). Drawing is clipped to the pad's
 * rectangle; strokes are smoothed and recorded so the card can replay the
 * path. The broom button (Figma 51:507) fades in once something is drawn;
 * hovering it previews the wipe (enlarge + gray), and clicking fades it out.
 */
export const SignatureTablet = forwardRef<
  SignatureHandle,
  { open: boolean; onClear?: () => void }
>(function SignatureTablet({ open, onClear }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const outside = useRef(false);
  const last = useRef<Point | null>(null);
  const mid = useRef<Point | null>(null);
  const strokes = useRef<Point[][]>([]);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [fading, setFading] = useState(false);
  const [wipeHover, setWipeHover] = useState(false);

  const context = () => canvasRef.current?.getContext("2d") ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round((rect.width || W) * dpr);
    canvas.height = Math.round((rect.height || H) * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = LINE;
      ctx.strokeStyle = "#202020";
      ctx.fillStyle = "#202020";
    }
  }, []);

  const wipeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = context();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.current = [];
  };

  // Instant clear (used by the parent on "Sign again").
  const clear = () => {
    wipeCanvas();
    setHasDrawing(false);
  };

  // Button clear — fade the signature out first, then wipe.
  const fadeClear = () => {
    setFading(true);
    onClear?.();
    window.setTimeout(() => {
      wipeCanvas();
      setHasDrawing(false);
      setFading(false);
      setWipeHover(false);
    }, 320);
  };

  const capture = (): Signature | null => {
    const all = strokes.current.flat();
    if (all.length === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of all) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = LINE / 2 + 1;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
    const normalised = strokes.current.map((s) =>
      s.map((p) => ({ x: p.x - minX, y: p.y - minY })),
    );
    return { width: maxX - minX, height: maxY - minY, strokes: normalised };
  };

  useImperativeHandle(ref, () => ({ capture, clear }));

  const dot = (p: Point) => {
    const ctx = context();
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawing.current = true;
    outside.current = false;
    last.current = p;
    mid.current = p;
    strokes.current.push([p]);
    dot(p);
    setHasDrawing(true);
    try {
      canvasRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore — not all pointers can be captured */
    }
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // Only register ink within the pad's rectangle.
    const inside =
      p.x >= 0 && p.x <= rect.width && p.y >= 0 && p.y <= rect.height;
    if (!inside) {
      outside.current = true;
      return;
    }
    const ctx = context();
    if (!ctx) return;
    if (outside.current || !last.current || !mid.current) {
      // Re-entered the pad — start a fresh, disconnected stroke.
      outside.current = false;
      last.current = p;
      mid.current = p;
      strokes.current.push([p]);
      dot(p);
      return;
    }
    const newMid = {
      x: (last.current.x + p.x) / 2,
      y: (last.current.y + p.y) / 2,
    };
    ctx.beginPath();
    ctx.moveTo(mid.current.x, mid.current.y);
    ctx.quadraticCurveTo(last.current.x, last.current.y, newMid.x, newMid.y);
    ctx.stroke();
    last.current = p;
    mid.current = newMid;
    strokes.current[strokes.current.length - 1]?.push(p);
  };

  const onUp = () => {
    drawing.current = false;
    outside.current = false;
    last.current = null;
    mid.current = null;
  };

  return (
    <motion.div
      initial={false}
      animate={{
        height: open ? H : 0,
        marginTop: open ? 32 : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative w-[240px] max-w-full overflow-hidden rounded-[28px] bg-[#f0f0f0]"
      style={{ cursor: "url('/cursors/pen.svg') 2 18, crosshair" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute top-0 left-0 h-[180px] w-full"
        style={{
          touchAction: "none",
          transformOrigin: "center",
          transform: wipeHover ? "scale(1.05)" : "scale(1)",
          opacity: fading ? 0 : wipeHover ? 0.45 : 1,
          transition: "transform 0.2s ease, opacity 0.3s ease",
        }}
      />
      {hasDrawing ? (
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: fading ? 0 : 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={fadeClear}
          onPointerEnter={() => setWipeHover(true)}
          onPointerLeave={() => setWipeHover(false)}
          aria-label="Clear signature"
          className="absolute right-[14px] bottom-[14px] flex size-10 items-center justify-center rounded-full bg-black/[0.12] text-[#838383] transition-colors duration-150 hover:bg-black/20 [@media(hover:hover)]:hover:text-black"
          style={{ cursor: "pointer" }}
        >
          <svg
            viewBox="-1.652 -1.666 20 20"
            className="size-5"
            fill="currentColor"
            aria-hidden
          >
            <path d="M15.4921 4.02398L13.3757 7.82676L13.6671 7.98772C14.8687 8.6515 15.3042 10.1643 14.6372 11.3641C14.4708 11.6632 14.0937 11.7712 13.7942 11.6056L5.123 6.81014C4.82217 6.64377 4.71362 6.26472 4.88078 5.96433C5.54674 4.76763 7.05532 4.33524 8.25408 4.99746L8.57928 5.17711L10.7507 1.37084C11.4874 0.0794967 13.1293 -0.379342 14.432 0.339869C15.7453 1.06493 16.2209 2.71435 15.4921 4.02398Z" />
            <path d="M4.48443 8.35817C4.10963 8.66256 3.73023 8.86898 3.33856 8.99727C2.69389 9.20844 1.94173 9.23228 1.007 9.03389C0.439109 8.91336 -0.0769294 9.39655 0.00951667 9.97062C0.488115 13.1489 3.41051 15.6381 6.24108 16.4089C7.67795 16.8001 9.22059 16.7875 10.4984 16.0815C11.5981 15.4739 12.3883 14.4161 12.7525 12.9306L4.48443 8.35817Z" />
          </svg>
        </motion.button>
      ) : null}
    </motion.div>
  );
});
