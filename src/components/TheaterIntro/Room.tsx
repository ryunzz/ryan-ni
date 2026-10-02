"use client";
/* The drawn theater: fallback until the photo layers (room, seats) are dropped in.
 * Painted on canvas (lib/reel/theater.ts); redrawn only when the size changes. */
import { useEffect, useRef, type RefObject } from "react";
import { drawBeam, drawRoom, drawRow, type Rect } from "@/lib/reel/theater";

/** [seat-top line, seat-back height, head probability] as fractions of the viewport height, back row first */
export const ROWS: [number, number, number][] = [
  [0.585, 0.03, 0.45],
  [0.622, 0.04, 0.45],
  [0.67, 0.054, 0.5],
  [0.735, 0.074, 0.4],
  [0.82, 0.1, 0.35],
  [0.93, 0.14, 0.15],
];
/** each row's box: room above the seat tops for heads, and down under the next row's seat tops */
export function rowBox(i: number, shift = 0) {
  const [top, unit] = ROWS[i], next = ROWS[i + 1];
  const y0 = top + shift - unit * 0.9, y1 = next ? next[0] + shift + next[1] * 0.35 : 1.08;
  return { top: y0, height: y1 - y0 };
}
/** on phones the screen sits higher, so the seating moves up to meet the stage */
export const MOBILE_SHIFT = -0.13;

/* extra resolution so the layers stay sharp while the dolly scales them up */
const ratio = (k: number) => Math.min(3, (window.devicePixelRatio || 1) * k);

function fit(cv: HTMLCanvasElement, k: number) {
  const r = ratio(k), w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.max(1, Math.round(w * r));
  cv.height = Math.max(1, Math.round(h * r));
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(r, 0, 0, r, 0, 0);
  return { ctx, w, h, r };
}

/** screen rectangle in the world's (untransformed) coordinates */
function screenRect(scr: HTMLElement): Rect {
  const w = scr.offsetWidth, h = scr.offsetHeight;
  const centred = getComputedStyle(scr).transform !== "none";
  return { x: centred ? scr.offsetLeft - w / 2 : scr.offsetLeft, y: scr.offsetTop, w, h };
}

export function Room({ className, beamClass, screen }: { className?: string; beamClass?: string; screen: RefObject<HTMLDivElement | null> }) {
  const room = useRef<HTMLCanvasElement>(null);
  const beam = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      if (!room.current || !beam.current || !screen.current) return;
      const scr = screenRect(screen.current);
      const a = fit(room.current, 1.25);
      drawRoom(a.ctx, a.w, a.h, scr);
      const b = fit(beam.current, 1);
      drawBeam(b.ctx, b.w, b.h, scr);
    };
    draw();
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(draw, 100); });
    ro.observe(room.current!);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [screen]);
  return (
    <>
      <canvas ref={room} className={className} aria-hidden="true" />
      <canvas ref={beam} className={beamClass} data-beam aria-hidden="true" />
    </>
  );
}

/** one row of seats; the nearest rows are slightly out of focus (we are looking at the screen) */
export function SeatRow({ i, shift = 0, className }: { i: number; shift?: number; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      const el = cv.current;
      if (!el) return;
      const { ctx, w, h, r } = fit(el, 1.5);
      const vh = window.innerHeight, [top, unit, heads] = ROWS[i], box = rowBox(i, shift);
      const depth = i / (ROWS.length - 1);
      /* the row spans 120% of the width (left: -10%), so the screen centre is at its middle */
      const spec = { depth, unit: unit * vh, top: (top + shift - box.top) * vh, cx: w / 2, heads, seed: 11 + i * 7, stagger: i % 2 === 1 };
      const blur = depth > 0.9 ? 1.6 : depth > 0.7 ? 0.6 : 0;
      if (!blur) return drawRow(ctx, w, h, spec);
      const off = document.createElement("canvas");
      off.width = el.width;
      off.height = el.height;
      const octx = off.getContext("2d")!;
      octx.setTransform(r, 0, 0, r, 0, 0);
      drawRow(octx, w, h, spec);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = `blur(${blur * r}px)`;
      ctx.drawImage(off, 0, 0);
      ctx.filter = "none";
    };
    draw();
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(draw, 100); });
    ro.observe(cv.current!);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [i, shift]);
  return <canvas ref={cv} className={className} aria-hidden="true" />;
}
