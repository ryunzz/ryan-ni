"use client";
/* A bottom sheet you can drag by its top: pull down to put it away, release to snap back.
 * Opens tall (most of the screen) so there is no dead space above it. */
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import shine from "../Shine.module.css";
import s from "./Sheet.module.css";

/** `tall` sheets (long lists) open to most of the screen; short ones fit their content */
export function Sheet({ label, title, tall, snap, onClose, children }: { label: string; title?: string; tall?: boolean; snap?: boolean; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y0: number; t0: number; dy: number; lastY: number; lastT: number } | null>(null);
  const closing = useRef(false);
  const reduce = useRef(false);

  const set = (dy: number, animate: boolean) => {
    const el = panel.current, bg = back.current;
    if (!el || !bg) return;
    el.style.transition = bg.style.transition = animate && !reduce.current ? "" : "none";
    el.style.transform = `translate3d(0, ${dy}px, 0)`;
    bg.style.opacity = String(Math.max(0, 1 - dy / Math.max(1, el.offsetHeight)));
  };

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = panel.current;
    set(el ? el.offsetHeight : 600, true);
    setTimeout(onClose, reduce.current ? 0 : 240);
  }, [onClose]);

  useEffect(() => {
    reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* slide in from below */
    set(panel.current?.offsetHeight ?? 600, false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => set(0, true)));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    panel.current?.focus({ preventScroll: true });
    return () => { cancelAnimationFrame(id); window.removeEventListener("keydown", esc); };
  }, [close]);

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, t0: e.timeStamp, dy: 0, lastY: e.clientY, lastT: e.timeStamp };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const raw = e.clientY - d.y0;
    /* down follows the finger; up resists (rubber band) */
    d.dy = raw > 0 ? raw : raw * 0.25;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    set(d.dy, false);
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const h = panel.current?.offsetHeight ?? 600;
    const v = (e.clientY - d.y0) / Math.max(1, e.timeStamp - d.t0); /* px per ms */
    if (d.dy > h * 0.25 || (d.dy > 24 && v > 0.5)) close();
    else set(0, true);
  };

  return (
    <div className={s.sheet} role="presentation">
      <div ref={back} className={s.back} onClick={close} />
      <div ref={panel} className={`${s.panel} ${tall ? s.tall : ""}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <div className={s.grab} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <span className={s.handle} />
          {title && <div className={s.title}><span className={shine.silver}>{title}</span></div>}
          <button type="button" className={s.close} onClick={close} onPointerDown={(e) => e.stopPropagation()} aria-label={`Close ${label}`}>
            Done
          </button>
        </div>
        <div className={`${s.body} ${snap ? s.snap : ""}`}>{children}</div>
      </div>
    </div>
  );
}
