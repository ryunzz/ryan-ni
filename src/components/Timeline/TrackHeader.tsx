"use client";
import { useState } from "react";
import type { Track } from "@/lib/types";
import { Icon } from "../Icon";
import s from "./TrackHeader.module.css";

/** id chip, name, visibility (or mute) toggle and lock */
export function TrackHeader({ tr, off, onToggle }: { tr: Track; off: boolean; onToggle: () => void }) {
  const [locked, setLocked] = useState(false);
  const isV = tr.kind === "v";
  return (
    <div className={s.th}>
      <span className={s.tid}>{tr.id}</span>
      <span className={s.tname}>{tr.name}</span>
      <button
        type="button"
        className={s.tog}
        aria-pressed={off}
        aria-label={(isV ? (off ? "Show " : "Hide ") : off ? "Unmute " : "Mute ") + tr.id}
        title={(isV ? (off ? "Show " : "Hide ") : off ? "Unmute " : "Mute ") + tr.id}
        onClick={onToggle}
      >
        <Icon name={isV ? (off ? "eyeoff" : "eye") : off ? "spkoff" : "spk"} />
      </button>
      <button type="button" className={s.tog} aria-pressed={locked} aria-label={`Lock ${tr.id}`} title={`Lock ${tr.id}`} onClick={() => setLocked(!locked)}>
        <Icon name="lock" />
      </button>
    </div>
  );
}

export function TrackLabel({ id, name, height }: { id: string; name: string; height?: number }) {
  return (
    <div className={s.th} style={height ? { height } : undefined}>
      <span className={s.tid}>{id}</span>
      <span className={s.tname}>{name}</span>
    </div>
  );
}
