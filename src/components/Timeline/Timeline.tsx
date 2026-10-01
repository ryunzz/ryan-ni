"use client";
import { useEffect, useRef } from "react";
import { useSession } from "@/store/session";
import { meterLevel } from "@/lib/reel/mixer";
import { FPS, cx, short } from "@/lib/reel/util";
import { Panel } from "../Panel";
import { Icon } from "../Icon";
import { Timecode } from "../Timecode";
import { Clip, clipStyles } from "./Clip";
import { TrackHeader } from "./TrackHeader";
import s from "./Timeline.module.css";

/** ruler ticks: a major tick + MM:SS label every `every`, minor ticks between */
export function Ruler({ span, every, label, step = 1 }: { span: number; every: number; label: (v: number) => string; step?: number }) {
  const ticks = [];
  for (let k = 0; k * step <= span + 1e-9; k++) {
    const v = k * step, x = `${(v / span) * 100}%`, major = Math.abs(v / every - Math.round(v / every)) < 1e-9;
    ticks.push(<div key={`t${k}`} className={major ? s.tickM : s.tickm} style={{ left: x }} />);
    if (major && v < span) ticks.push(<div key={`l${k}`} className={s.tickl} style={{ left: x }}>{label(v)}</div>);
  }
  return <div className={s.ruler}>{ticks}</div>;
}

/** the sequence: ruler, five tracks (V3, V2, V1, A1, A2), playhead and stereo meters */
export function Timeline() {
  const p = useSession((st) => st.p);
  const off = useSession((st) => st.off);
  const sel = useSession((st) => st.sel);
  const hidden = useSession((st) => st.seqHidden);
  const right = useRef<HTMLDivElement>(null);
  const ph = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const d = p.duration;

  /* playhead, meters and live clips follow time imperatively (no React render per frame) */
  useEffect(() => {
    const clips = Array.from(right.current!.querySelectorAll<HTMLElement>("[data-clip]"));
    const meta = clips.map((el) => {
      const [ti, ci] = el.dataset.clip!.split(":").map(Number);
      return { el, tr: p.tracks[ti], c: p.tracks[ti].clips[ci], on: false };
    });
    const pos = () => {
      const st = useSession.getState();
      if (st.p !== p) return;
      ph.current!.style.left = `${(st.t / d) * 100}%`;
      const L = meterLevel(st), j = st.playing ? 0.9 + Math.random() * 0.1 : 1;
      const [b0, b1] = bars.current;
      if (b0 && b1) {
        b0.style.height = `${L * 100 * j}%`;
        b1.style.height = `${(L * 96) / j}%`;
        b0.classList.toggle(s.hot, L > 0.88);
        b1.classList.toggle(s.hot, L > 0.88);
      }
      for (const m of meta) {
        const on = st.t >= m.c.start && st.t < m.c.end && !st.off[m.tr.id];
        if (m.on !== on) { m.on = on; m.el.classList.toggle(clipStyles.live, on); }
      }
    };
    pos();
    return useSession.subscribe(pos);
  }, [p, d, off]);

  const down = useRef(false);
  const scrub = (e: React.PointerEvent) => {
    const r = right.current!.getBoundingClientRect();
    useSession.getState().seek(((e.clientX - r.left) / r.width) * d);
  };

  return (
    <Panel
      title="Sequence"
      sub={p.name}
      area="tl"
      className={s.timeline}
      actions={
        <>
          <Timecode className={s.tc} />
          <button type="button" className={s.seqbtn} aria-expanded={!hidden} onClick={() => useSession.getState().setSeqHidden(!hidden)}>
            <Icon name={hidden ? "show" : "hide"} />
            <span>{hidden ? "Show sequence" : "Hide sequence"}</span>
          </button>
        </>
      }
    >
      {!hidden && (
        <div className={s.body}>
          <div className={s.left}>
            <div className={s.corner}>{FPS} fps</div>
            {p.tracks.map((tr) => (
              <TrackHeader key={tr.id} tr={tr} off={!!off[tr.id]} onToggle={() => useSession.getState().toggleTrack(tr.id)} />
            ))}
          </div>
          <div
            ref={right}
            className={s.right}
            onPointerDown={(e) => {
              down.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              useSession.getState().setPlaying(false);
              scrub(e);
            }}
            onPointerMove={(e) => down.current && scrub(e)}
            onPointerUp={() => (down.current = false)}
            onPointerCancel={() => (down.current = false)}
          >
            <Ruler span={d} every={5} label={short} />
            {p.tracks.map((tr, ti) => (
              <div key={tr.id} className={cx(s.lane, off[tr.id] && s.off)}>
                {tr.clips.map((c, ci) => (
                  <Clip key={ci} c={c} d={d} selected={sel === c} onSelect={() => useSession.getState().select(c)} data={{ clip: `${ti}:${ci}` }} />
                ))}
              </div>
            ))}
            <div ref={ph} className={s.playhead} />
          </div>
          <div className={s.meters} aria-hidden="true">
            <div className={s.meter}><i ref={(el) => { bars.current[0] = el; }} /></div>
            <div className={s.meter}><i ref={(el) => { bars.current[1] = el; }} /></div>
          </div>
        </div>
      )}
    </Panel>
  );
}

export { s as timelineStyles };
