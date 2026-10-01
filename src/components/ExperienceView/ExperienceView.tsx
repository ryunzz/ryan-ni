"use client";
import { useEffect, useRef, useState } from "react";
import type { Job } from "@/lib/types";
import { experience, reel, useSession } from "@/store/session";
import { cx, years } from "@/lib/reel/util";
import { Panel } from "../Panel";
import { Icon } from "../Icon";
import { AppRow, EmailButton, LinkChips, linkStyles } from "../Links";
import { clipStyles } from "../Timeline/Clip";
import { Ruler, timelineStyles as tl } from "../Timeline/Timeline";
import { TrackLabel } from "../Timeline/TrackHeader";
import s from "./ExperienceView.module.css";

type Hot = { i: number; k: number } | null;

/** detail card: company, role · dates · place, summary, one to three points (or programs) */
export function ExpCard({ x, i, interactive = true, hot, setHot }: { x: Job; i: number; interactive?: boolean; hot?: Hot; setHot?: (h: Hot) => void }) {
  const view = useSession((st) => st.view);
  const job = useSession((st) => st.job);
  const anchor = useSession((st) => st.anchor);
  const prog = useSession((st) => st.prog);
  const selected = interactive && view === "experience" && job === i && anchor !== "contact";
  const open = () => interactive && useSession.getState().setView("experience", i);
  return (
    <article
      className={cx(s.card, !interactive && s.static)}
      tabIndex={interactive ? 0 : undefined}
      aria-current={selected ? "true" : undefined}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
    >
      <h3>{x.label}</h3>
      <div className={s.meta}>{`${x.role}  ·  ${years(x)}${x.place ? `  ·  ${x.place}` : ""}`}</div>
      {x.summary && <p className={cx(interactive && !selected && s.muted)}>{x.summary}</p>}
      {x.bullets && x.bullets.length > 0 && <ul>{x.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
      {x.programs && (
        <ul className={s.progs}>
          {x.programs.map((pg, k) => (
            <li
              key={pg.name}
              tabIndex={0}
              className={cx(s.prog, hot?.i === i && hot.k === k && s.hot, interactive && view === "experience" && job === i && prog === k && s.pin)}
              onMouseEnter={() => setHot?.({ i, k })}
              onMouseLeave={() => setHot?.(null)}
              onFocus={() => setHot?.({ i, k })}
              onBlur={() => setHot?.(null)}
              onClick={(e) => {
                if (!interactive) return;
                e.stopPropagation();
                const st = useSession.getState();
                st.setProg(k);
                st.setView("experience", i);
              }}
            >
              <b>{`${pg.name} (${years(pg)})`}</b> <span>{pg.text}</span>
            </li>
          ))}
        </ul>
      )}
      {x.links && <LinkChips links={x.links} />}
    </article>
  );
}

/** CONTACT label, "Let's talk.", blurb, icon buttons (Email copies), and the address as a copyable link */
export function ContactBlock({ className }: { className?: string }) {
  const c = reel.about.contact;
  return (
    <section className={cx(s.contact, className)} id="contact" aria-label="Contact">
      <div className={s.cap}>Contact</div>
      <h3>Let&apos;s talk.</h3>
      <p>{c.blurb}</p>
      <AppRow links={[...c.links, { label: "Email", icon: "email" }]} big />
      <div className={s.cemail}><EmailButton className={cx(linkStyles.tlink, s.addr)} /></div>
    </section>
  );
}

/** the Experience view: a career sequence (one lane per job, years on the ruler) plus the detail list */
export function ExperienceView() {
  const view = useSession((st) => st.view);
  const job = useSession((st) => st.job);
  const prog = useSession((st) => st.prog);
  const anchor = useSession((st) => st.anchor);
  const nonce = useSession((st) => st.viewNonce);
  const list = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<Hot>(null);
  const [now] = useState(() => { const d = new Date(); return d.getFullYear() + d.getMonth() / 12; });
  const xs = experience();

  useEffect(() => {
    if (view !== "experience" || !list.current) return;
    const l = list.current;
    const cur = anchor === "contact" ? l.querySelector<HTMLElement>("#contact") : (l.children[job] as HTMLElement | undefined);
    if (!cur) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    l.scrollTo({ top: cur.offsetTop - l.offsetTop - 8, behavior: reduce ? "auto" : "smooth" });
  }, [view, job, anchor, nonce]);

  if (!xs.length) return null;
  const lo = Math.min(...xs.map((x) => x.from));
  const hi = Math.max(Math.floor(now), ...xs.map((x) => x.to)) + 1;
  const span = hi - lo;
  const pct = (v: number) => `${((v - lo) / span) * 100}%`;
  const width = (a: number, b: number) => `calc(${((b - a) / span) * 100}% - 2px)`;
  const back = () => { const st = useSession.getState(); st.setView("player"); st.setPlaying(true); };

  return (
    <Panel
      title="Experience"
      sub="career.seq"
      area="exp"
      className={s.exp}
      actions={<button type="button" className={s.back} onClick={back}><Icon name="back" /><span>Back to player</span></button>}
    >
      <div className={s.seq}>
        <div className={tl.left}>
          <div className={tl.corner}>years</div>
          {xs.map((x, i) => <TrackLabel key={x.file} id={`E${i + 1}`} name={x.label} height={x.programs ? 22 * x.programs.length + 8 : undefined} />)}
        </div>
        <div className={cx(tl.right, s.right)}>
          <Ruler span={span} every={1} step={0.25} label={(v) => String(lo + v)} />
          {xs.map((x, i) => {
            const sel = job === i && anchor !== "contact";
            if (x.programs)
              return (
                <div key={x.file} className={tl.lane} style={{ height: 22 * x.programs.length + 8 }}>
                  {x.programs.map((pg, k) => (
                    <div
                      key={pg.name}
                      className={cx(clipStyles.clip, clipStyles.video, s.pclip, sel && prog === k && clipStyles.live, hot?.i === i && hot.k === k && clipStyles.hot)}
                      style={{ left: pct(pg.from), width: width(pg.from, pg.to + 1), top: 4 + k * 22, bottom: "auto", height: 19 }}
                      title={`${pg.name} (${years(pg)})`}
                      onMouseEnter={() => setHot({ i, k })}
                      onMouseLeave={() => setHot(null)}
                      onClick={() => { const st = useSession.getState(); st.setProg(k); st.setView("experience", i); }}
                    >
                      <span>{pg.name}</span>
                    </div>
                  ))}
                </div>
              );
            return (
              <div key={x.file} className={tl.lane}>
                <div
                  className={cx(clipStyles.clip, clipStyles.video, sel && clipStyles.live)}
                  style={{ left: pct(x.from), width: width(x.from, x.to + 1) }}
                  aria-selected={sel}
                  title={`${x.role} (${years(x)})`}
                  onClick={() => useSession.getState().setView("experience", i)}
                >
                  <span>{x.role}</span>
                </div>
              </div>
            );
          })}
          <div className={cx(tl.playhead, s.now)} style={{ left: pct(now) }} />
        </div>
      </div>
      <div ref={list} className={s.list}>
        {xs.map((x, i) => <ExpCard key={x.file} x={x} i={i} hot={hot} setHot={setHot} />)}
        <ContactBlock />
      </div>
    </Panel>
  );
}
