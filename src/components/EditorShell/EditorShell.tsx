"use client";
import { useRef } from "react";
import { me, reel, useSession } from "@/store/session";
import { FPS, cx } from "@/lib/reel/util";
import { EmailButton } from "../Links";
import { Icon } from "../Icon";
import { ProjectBin } from "../ProjectBin/ProjectBin";
import { ProgramMonitor } from "../ProgramMonitor/ProgramMonitor";
import { Timeline } from "../Timeline/Timeline";
import { ExperienceView } from "../ExperienceView/ExperienceView";
import { Footer } from "../Footer/Footer";
import { CursorCue } from "./CursorCue";
import s from "./EditorShell.module.css";

/** act two on desktop: menubar, bin, program monitor and timeline wired to one session */
export function EditorShell({ onEject, ref }: { onEject?: () => void; ref?: React.Ref<HTMLDivElement> }) {
  const view = useSession((st) => st.view);
  const anchor = useSession((st) => st.anchor);
  const seqHidden = useSession((st) => st.seqHidden);
  const root = useRef<HTMLDivElement | null>(null);
  const tab = view === "experience" ? (anchor === "contact" ? 2 : 1) : 0;

  const tabs: [string, () => void][] = [
    ["Projects", () => { const st = useSession.getState(), m = me(); st.setView("player"); if (m) st.load(m.id); st.setPlaying(true); }],
    ["Experience", () => useSession.getState().setView("experience")],
    ["Contact", () => useSession.getState().setView("experience", null, "contact")],
  ];

  const onKey = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    const st = useSession.getState();
    if (e.code === "Space" || e.key === "k" || e.key === "K") { e.preventDefault(); st.toggle(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); st.setPlaying(false); st.step(e.shiftKey ? -FPS : -1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); st.setPlaying(false); st.step(e.shiftKey ? FPS : 1); }
    else if (e.key === "Home") { e.preventDefault(); st.seek(0); }
    else if (e.key === "End") { e.preventDefault(); st.seek(st.p.duration); }
  };

  return (
    <div
      ref={(el) => { root.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
      className={cx(s.editor, seqHidden && s.seqHidden, view === "experience" && s.viewExp)}
      tabIndex={0}
      aria-label="Portfolio editor. Space plays, arrows step frames."
      onKeyDown={onKey}
    >
      <header className={s.menubar} data-panel>
        <span className={s.wordmark}>{reel.about.wordmark}</span>
        <nav className={s.tabs} aria-label="Sections">
          {tabs.map(([label, go], i) => (
            <button type="button" key={label} className={s.tab} aria-current={tab === i ? "page" : undefined} onClick={go}>{label}</button>
          ))}
        </nav>
        <div className={s.right}>
          <EmailButton className={s.file} />
          {onEject && (
            <button type="button" className={s.eject} onClick={onEject} aria-label="Replay the theater intro">
              <Icon name="eject" /><span>Theater</span>
            </button>
          )}
        </div>
      </header>
      <ProjectBin />
      <ProgramMonitor />
      <Timeline />
      <ExperienceView />
      <Footer />
      <CursorCue root={root} />
    </div>
  );
}
