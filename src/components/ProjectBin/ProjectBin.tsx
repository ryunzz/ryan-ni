"use client";
import { Fragment, useEffect, useRef } from "react";
import { me as getMe, useSession } from "@/store/session";
import { prefetchProject } from "@/lib/reel/prefetch";
import { cx, years } from "@/lib/reel/util";
import { Panel } from "../Panel";
import { Icon } from "../Icon";
import { InfoPane } from "../InfoPane";
import { Award } from "../Award";
import s from "./ProjectBin.module.css";

/** ABOUT: the Ryan Ni folder (always open) with experience files; PROJECTS: one folder per project with its awards */
export function ProjectBin() {
  const projects = useSession((st) => st.projects);
  const p = useSession((st) => st.p);
  const view = useSession((st) => st.view);
  const job = useSession((st) => st.job);
  const anchor = useSession((st) => st.anchor);
  const list = useRef<HTMLDivElement>(null);
  const me = getMe();
  const sections: [string, typeof projects][] = [
    ["Technical projects", projects.filter((x) => !x.experience && x.section !== "personal")],
    ["Personal projects", projects.filter((x) => !x.experience && x.section === "personal")],
  ];

  const play = (id: string) => {
    const st = useSession.getState();
    st.setView("player");
    st.load(id);
    st.setPlaying(true);
  };

  /* keep the selected row in view */
  useEffect(() => {
    const l = list.current, sel = l?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!l || !sel) return;
    const top = sel.offsetTop - l.offsetTop, bot = top + sel.offsetHeight;
    if (top < l.scrollTop) l.scrollTop = top - 30;
    else if (bot > l.scrollTop + l.clientHeight) l.scrollTop = bot - l.clientHeight + 8;
  }, [p, view, job]);

  const info = view === "experience" ? me ?? p : p;

  return (
    <Panel title="Project" sub="portfolio.prproj" area="bin" className={s.bin}>
      <div className={cx(s.row, s.cols)} aria-hidden="true">
        <span /><span>Name</span><span>Items</span><span>Type</span>
      </div>
      <div ref={list} className={s.list} role="listbox" aria-label="Projects">
        {me && (
          <>
            <div className={s.sect}><span>About</span><span className={s.y} /></div>
            <button
              type="button"
              role="option"
              className={s.row}
              aria-selected={view === "player" && p === me}
              onClick={() => play(me.id)}
            >
              <Icon name="folder" />
              <span className={s.nm}>{me.name}</span>
              <span className={s.n}>{me.experience!.length}</span>
              <span className={s.y}>{me.type}</span>
            </button>
            {me.experience!.map((x, i) => (
              <button
                type="button"
                role="option"
                key={x.file}
                className={cx(s.child, s.job)}
                title={`${x.label}, ${x.role}`}
                aria-selected={view === "experience" && job === i && anchor !== "contact"}
                onClick={() => {
                  const st = useSession.getState();
                  st.setProg(null);
                  st.setView("experience", i);
                }}
              >
                <Icon name="doc" />
                <span>{x.file}</span>
                <span>{years(x)}</span>
              </button>
            ))}
          </>
        )}
        {sections.map(([title, work]) => (
          <Fragment key={title}>
            <div className={s.sect}><span>{title}</span><span className={s.y}>{work.length}</span></div>
            {work.map((q) => {
              const sel = view === "player" && q === p;
              return (
                <div key={q.id} className={s.group}>
                  <button
                    type="button"
                    role="option"
                    className={s.row}
                    data-bin-project={q.id}
                    aria-selected={sel}
                    onClick={() => play(q.id)}
                    onPointerEnter={() => prefetchProject(q)}
                    onFocus={() => prefetchProject(q)}
                  >
                    <Icon name="folder" />
                    <span className={s.nm}>{q.name}</span>
                    <span className={s.n}>{q.awards.length}</span>
                    <span className={s.y}>{q.type}</span>
                  </button>
                  {q.awards.map((w) => (
                    <button type="button" key={w} tabIndex={-1} className={cx(s.child, s.award)} title={`${q.name}: ${w}`} onClick={() => play(q.id)}>
                      <Award w={w} lit={sel} />
                    </button>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <InfoPane p={info} className={s.info} />
    </Panel>
  );
}

export { s as binStyles };
