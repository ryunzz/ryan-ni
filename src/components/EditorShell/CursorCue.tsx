"use client";
/* the "check out my projects" beat: a cursor whose position is a pure function of playhead time,
 * so it scrubs, pauses and hides with V3 like any layer */
import { useEffect, useRef } from "react";
import { activeClip, useSession } from "@/store/session";
import { clamp } from "@/lib/reel/util";
import { CursorGlyph } from "../Icon";
import { binStyles } from "../ProjectBin/ProjectBin";
import s from "./EditorShell.module.css";

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export function CursorCue({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const cur = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let lit: Element | null = null;
    let seen: Element | null = null;
    const upd = () => {
      const st = useSession.getState(), el = root.current, c = activeClip(st, "V3"), cu = cur.current;
      if (!el || !cu) return;
      const on = st.view === "player" && c?.cue === "cursor";
      if (!on) {
        cu.style.opacity = "0";
        if (lit) { lit.classList.remove(binStyles.cue); lit = null; }
        return;
      }
      const u = (st.t - c!.start) / (c!.end - c!.start), er = el.getBoundingClientRect();
      const mon = el.querySelector("[data-monitor]"), target = el.querySelector("[data-bin-project]");
      if (!mon || !target) return;
      if (u > 0.05 && seen !== target) { seen = target; target.scrollIntoView({ block: "nearest" }); }
      const a = mon.getBoundingClientRect(), b = target.getBoundingClientRect();
      const x0 = a.left + a.width * 0.55 - er.left, y0 = a.top + a.height * 0.62 - er.top, x1 = b.left + 46 - er.left, y1 = b.top + b.height / 2 - er.top;
      const m = ease(clamp((u - 0.12) / 0.4, 0, 1)), arc = Math.sin(m * Math.PI) * -40;
      cu.style.opacity = String(clamp(u / 0.06, 0, 1) * clamp((1 - u) / 0.06, 0, 1));
      cu.style.transform = `translate(${x0 + (x1 - x0) * m}px,${y0 + (y1 - y0) * m + arc}px)`;
      const hov = u > 0.5;
      if (hov && lit !== target) { lit?.classList.remove(binStyles.cue); target.classList.add(binStyles.cue); lit = target; }
      else if (!hov && lit) { lit.classList.remove(binStyles.cue); lit = null; }
      cu.classList.toggle(s.click, u > 0.62 && u < 0.72);
    };
    upd();
    return useSession.subscribe(upd);
  }, [root]);
  return (
    <div ref={cur} className={s.cursor} aria-hidden="true">
      <CursorGlyph />
      <i className={s.ripple} />
    </div>
  );
}
