"use client";
import { useEffect, useRef } from "react";
import { useSession } from "@/store/session";
import { tc } from "@/lib/reel/util";
import { Panel } from "../Panel";
import { Picture } from "../Picture";
import { Transport } from "../Transport/Transport";
import { Timecode } from "../Timecode";
import s from "./ProgramMonitor.module.css";

/** the program monitor: picture at the playhead, mini scrub bar, transport row */
export function ProgramMonitor() {
  const name = useSession((st) => st.p.name);
  const dur = useSession((st) => st.p.duration);
  const mini = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLElement>(null);

  useEffect(
    () =>
      useSession.subscribe((st) => {
        if (mark.current) mark.current.style.left = `${(st.t / st.p.duration) * 100}%`;
      }),
    [],
  );

  const scrub = (e: React.PointerEvent) => {
    const r = mini.current!.getBoundingClientRect();
    const st = useSession.getState();
    st.seek(((e.clientX - r.left) / r.width) * st.p.duration);
  };

  return (
    <Panel title="Program" sub={name} area="mon" className={s.monitor}>
      <div className={s.screenwrap} data-monitor>
        <Picture />
      </div>
      <div
        ref={mini}
        className={s.minibar}
        aria-hidden="true"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e); }}
      >
        <i ref={mark} />
      </div>
      <div className={s.row}>
        <Timecode className={s.now} />
        <Transport />
        <span className={s.dur}>{tc(dur)}</span>
      </div>
    </Panel>
  );
}
