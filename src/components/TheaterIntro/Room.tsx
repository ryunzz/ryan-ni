"use client";
/* The drawn theater: fallback until the photo layers (room, seats) are dropped in.
 * Painted on canvas (lib/reel/theater.ts); redrawn only when the size changes. */
import { useEffect, useRef, useState, type RefObject } from "react";
import { drawBeam, drawRoom, drawRow, drawSnacks, type Rect } from "@/lib/reel/theater";

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

function snackColors() {
  const cs = getComputedStyle(document.documentElement), v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return {
    red: v("--snack-red", "#b0252c"), white: v("--screen", "#f3ede1"), popcorn: v("--popcorn", "#e8c27a"),
    screen: v("--screen", "#f3ede1"), velvet: v("--velvet-deep", "#340e13"), aisle: v("--aisle-light", "#e0b451"),
  };
}

/** paint a rendered frame onto the layer with a little depth-of-field blur */
function paint(el: HTMLCanvasElement, src: CanvasImageSource, r: number) {
  const ctx = el.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, el.width, el.height);
  ctx.filter = `blur(${1.6 * r}px)`;
  ctx.drawImage(src, 0, 0, el.width, el.height);
  ctx.filter = "none";
}

/** render in a worker (never blocks the intro); resolves null if the browser can't */
function renderInWorker(w: number, h: number, ratio: number): Promise<ImageBitmap | "software" | null> {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("../../lib/reel/snacks.worker.ts", import.meta.url), { type: "module" });
    } catch {
      return resolve(null);
    }
    const done = (v: ImageBitmap | "software" | null) => { worker.terminate(); resolve(v); };
    worker.onmessage = (e: MessageEvent<{ bmp?: ImageBitmap; ms?: number; software?: boolean; error?: string }>) => {
      if (process.env.NODE_ENV !== "production" && e.data.ms) console.debug(`[reel] snacks rendered in a worker in ${Math.round(e.data.ms)}ms`);
      done(e.data.software ? "software" : e.data.bmp ?? null);
    };
    worker.onerror = () => done(null);
    worker.postMessage({ w, h, ratio, colors: snackColors() });
  });
}

/** your popcorn and soda in the foreground: real 3D (three.js, loaded lazily), slightly out of focus.
 * Rendered in a worker when possible, else on the main thread, else drawn flat in 2D. */
export function Snacks({ className }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);
  useEffect(() => {
    let alive = true;
    const flat = () => {
      const el = cv.current;
      if (!el) return;
      const { ctx, w, h, r } = fit(el, 1.5);
      const off = document.createElement("canvas");
      off.width = el.width;
      off.height = el.height;
      const octx = off.getContext("2d")!;
      octx.setTransform(r, 0, 0, r, 0, 0);
      drawSnacks(octx, w, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = `blur(${2 * r}px)`;
      ctx.drawImage(off, 0, 0);
      ctx.filter = "none";
    };
    const draw = async () => {
      const el = cv.current;
      if (!el) return;
      const w = el.clientWidth, h = el.clientHeight, r = ratio(1.5);
      const bmp = await renderInWorker(w, h, r);
      if (!alive || !cv.current) return;
      el.width = Math.round(w * r);
      el.height = Math.round(h * r);
      if (bmp === "software") flat();
      else if (bmp) {
        paint(el, bmp, r);
        bmp.close();
      } else {
        try {
          const { renderSnacks, softwareGL } = await import("@/lib/reel/snacks3d");
          if (!alive) return;
          if (softwareGL()) throw new Error("software WebGL");
          paint(el, renderSnacks(document.createElement("canvas"), w, h, r, snackColors()) as HTMLCanvasElement, r);
        } catch {
          flat();
        }
      }
      if (alive) { shownRef.current = true; setShown(true); }
    };
    /* start after hydration settles; the worker keeps the heavy part off the main thread */
    const start = setTimeout(() => void draw(), 300);
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      if (!shownRef.current) return;
      clearTimeout(t);
      t = setTimeout(() => void draw(), 150);
    });
    ro.observe(cv.current!);
    return () => { alive = false; ro.disconnect(); clearTimeout(t); clearTimeout(start); };
  }, []);
  return <canvas ref={cv} className={className} style={{ opacity: shown ? 1 : 0, transition: "opacity .4s" }} aria-hidden="true" />;
}
