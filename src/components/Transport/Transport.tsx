"use client";
import { useSession } from "@/store/session";
import { Icon } from "../Icon";
import s from "./Transport.module.css";

/** go to start, back one frame, play/pause, forward one frame, go to end */
export function Transport() {
  const playing = useSession((st) => st.playing);
  const { seek, step, setPlaying, toggle } = useSession.getState();
  const dur = () => useSession.getState().p.duration;
  return (
    <div className={s.transport}>
      <button type="button" className={s.btn} aria-label="Go to start" onClick={() => seek(0)}><Icon name="start" /></button>
      <button type="button" className={s.btn} aria-label="Back one frame" onClick={() => { setPlaying(false); step(-1); }}><Icon name="stepb" /></button>
      <button type="button" className={`${s.btn} ${s.play}`} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} onClick={toggle}>
        <Icon name={playing ? "pause" : "play"} />
      </button>
      <button type="button" className={s.btn} aria-label="Forward one frame" onClick={() => { setPlaying(false); step(1); }}><Icon name="stepf" /></button>
      <button type="button" className={s.btn} aria-label="Go to end" onClick={() => seek(dur())}><Icon name="end" /></button>
    </div>
  );
}
