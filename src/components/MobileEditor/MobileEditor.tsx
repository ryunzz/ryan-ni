"use client";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Clip as ClipT } from "@/lib/types";
import { experience, me, reel, useSession } from "@/store/session";
import { drawFootage, drawStill, onImageLoad } from "@/lib/reel/render";
import { cx, short } from "@/lib/reel/util";
import { Icon, type IconKey } from "../Icon";
import { Picture } from "../Picture";
import { InfoPane } from "../InfoPane";
import { clipStyles } from "../Timeline/Clip";
import { ContactBlock, ExpCard } from "../ExperienceView/ExperienceView";
import { Sheet } from "./Sheet";
import { Gallery } from "./Gallery";
import shine from "../Shine.module.css";
import s from "./MobileEditor.module.css";

const PX = 44; /* px per second */
type SheetKind = "projects" | "experience" | "info" | "contact" | null;

function Thumb({ c }: { c: ClipT }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const draw = () => {
      const ctx = ref.current?.getContext("2d");
      if (!ctx) return;
      if (c.type === "video") drawFootage(ctx, 160, 90, c, 1);
      else drawStill(ctx, 160, 90, c, 0, -1, 0);
    };
    draw();
    return onImageLoad(draw);
  }, [c]);
  return <canvas ref={ref} width={160} height={90} className={s.thumb} aria-hidden="true" />;
}

/** act two on phones: preview, sideways-scrolling timeline under a fixed center playhead, tool bar and sheets */
export function MobileEditor({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const p = useSession((st) => st.p);
  const off = useSession((st) => st.off);
  const playing = useSession((st) => st.playing);
  const projects = useSession((st) => st.projects);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const sc = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLElement>(null);
  const sync = useRef({ syncing: false, scrubbing: false, timer: 0 as unknown as ReturnType<typeof setTimeout> });
  const tracks = useMemo(() => p.tracks.filter((t) => t.clips.length), [p]);

  /* playing scrolls the strip; live clips light */
  useEffect(() => {
    const clips = Array.from(strip.current!.querySelectorAll<HTMLElement>("[data-clip]")).map((el) => {
      const [ti, ci] = el.dataset.clip!.split(":").map(Number);
      return { el, tr: tracks[ti], c: tracks[ti].clips[ci] };
    });
    const pos = () => {
      const st = useSession.getState();
      if (st.p !== p) return;
      if (tcRef.current) tcRef.current.textContent = short(st.t);
      if (!sync.current.scrubbing && sc.current) {
        sync.current.syncing = true;
        sc.current.scrollLeft = st.t * PX;
        sync.current.syncing = false;
      }
      for (const q of clips) {
        const on = st.t >= q.c.start && st.t < q.c.end && !st.off[q.tr.id];
        q.el.classList.toggle(clipStyles.live, on);
        q.el.classList.toggle(s.on, on);
      }
    };
    pos();
    return useSession.subscribe(pos);
  }, [p, tracks]);

  const onScroll = () => {
    const el = sc.current!, st = useSession.getState(), sy = sync.current;
    if (sy.syncing || Math.abs(el.scrollLeft - st.t * PX) < 3) return;
    sy.scrubbing = true;
    if (st.playing) st.setPlaying(false);
    st.seek(el.scrollLeft / PX);
    clearTimeout(sy.timer);
    sy.timer = setTimeout(() => (sy.scrubbing = false), 120);
  };

  const close = useCallback(() => setSheet(null), []);
  const play = (id: string) => { setSheet(null); const st = useSession.getState(); st.load(id); st.setPlaying(true); };
  const groups = [
    ["Technical projects", projects.filter((q) => !q.experience && q.section !== "personal")],
    ["Personal projects", projects.filter((q) => !q.experience && q.section === "personal")],
  ] as const;

  const tools: [IconKey, string, SheetKind][] = [["folder", "Projects", "projects"], ["user", "Experience", "experience"], ["info", "Info", "info"], ["mail", "Contact", "contact"]];

  return (
    <div ref={ref} className={s.mobile} tabIndex={-1} aria-label="Portfolio editor">
      <header className={s.top} data-panel>
        <span className={s.wordmark}>{reel.about.wordmark}</span>
        <span className={s.proj}>{p.name}</span>
        <button type="button" className={s.cta} onClick={() => setSheet("contact")}>Contact</button>
      </header>
      <div className={s.view} data-panel>
        <Picture preview />
      </div>
      <div className={s.bar} data-panel>
        <span className={s.tc}><b ref={tcRef}>{short(0)}</b>{` / ${short(p.duration)}`}</span>
        <button type="button" className={s.play} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} onClick={() => useSession.getState().toggle()}>
          <Icon name={playing ? "pause" : "play"} />
        </button>
        <button type="button" className={s.full} aria-label="Info" onClick={() => setSheet("info")}><Icon name="info" /></button>
      </div>
      <div className={s.tl} data-panel>
        <div ref={sc} className={s.scroll} onScroll={onScroll} aria-label="Timeline: scroll to scrub" tabIndex={0}>
          <div ref={strip} className={s.strip} style={{ width: p.duration * PX }}>
            <div className={s.ruler} aria-hidden="true">
              {Array.from({ length: Math.floor(p.duration / 2) + 1 }, (_, i) => i * 2).map((k) => (
                <span key={k} style={{ left: k * PX }}>{k % 4 ? "·" : short(k)}</span>
              ))}
            </div>
            {tracks.map((tr, ti) => (
              <div key={tr.id} className={cx(s.lane, tr.id === "V1" ? s.main : s.sub, off[tr.id] && s.off)}>
                {tr.clips.map((c, ci) => (
                  <div key={ci} data-clip={`${ti}:${ci}`} className={cx(clipStyles.clip, clipStyles[c.type], s.clip)} style={{ left: c.start * PX, width: (c.end - c.start) * PX - 2 }}>
                    {tr.id === "V1" && c.type !== "text" && <Thumb c={c} />}
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={s.togs}>
          {tracks.map((tr) => (
            <button
              type="button"
              key={tr.id}
              className={cx(s.tog, tr.id === "V1" && s.main)}
              aria-pressed={!!off[tr.id]}
              aria-label={(tr.kind === "v" ? (off[tr.id] ? "Show " : "Hide ") : off[tr.id] ? "Unmute " : "Mute ") + tr.id}
              onClick={() => useSession.getState().toggleTrack(tr.id)}
            >
              <Icon name={tr.kind === "v" ? (off[tr.id] ? "eyeoff" : "eye") : off[tr.id] ? "spkoff" : "spk"} />
            </button>
          ))}
        </div>
        <div className={s.head} aria-hidden="true" />
      </div>
      <nav className={s.tools} aria-label="Tools" data-panel>
        {tools.map(([ic, label, k]) => (
          <button type="button" key={label} className={s.tool} onClick={() => setSheet(k)}>
            <Icon name={ic} /><span>{label}</span>
          </button>
        ))}
      </nav>
      {sheet === "contact" && (
        <Sheet label="Contact" onClose={close}>
          <ContactBlock className={s.sheetContact} />
        </Sheet>
      )}
      {sheet === "experience" && (
        <Sheet label="Experience" title="Experience" tall onClose={close}>
          <div className={s.cards}>
            {experience().map((x, i) => <ExpCard key={x.file} x={x} i={i} interactive={false} />)}
          </div>
          <ContactBlock className={s.sheetContact} />
        </Sheet>
      )}
      {sheet === "projects" && (
        <Sheet label="Projects" title="Projects" tall snap onClose={close}>
          {me() && (
            <button type="button" className={s.prow} aria-current={p === me() ? "true" : undefined} onClick={() => play(me()!.id)}>
              <Icon name="folder" /><span className={s.nm}>{me()!.name}</span><span className={s.intro}>Intro</span>
              <span className={s.y}>{me()!.type}</span>
            </button>
          )}
          {groups.map(([title, list]) => list.length > 0 && (
            <Fragment key={title}>
              <div className={s.sheethd}><span className={shine.silver}>{title}</span></div>
              <Gallery projects={list} onPlay={(q) => play(q.id)} />
            </Fragment>
          ))}
        </Sheet>
      )}
      {sheet === "info" && (
        <Sheet label="Info" onClose={close}>
          <InfoPane p={p} withFiles className={s.sheetInfo} />
        </Sheet>
      )}
    </div>
  );
}
