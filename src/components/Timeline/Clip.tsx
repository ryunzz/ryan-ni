"use client";
import { memo } from "react";
import type { Clip as ClipT } from "@/lib/types";
import { amp, cx } from "@/lib/reel/util";
import s from "./Clip.module.css";

function waveD(seed: number) {
  let d = "";
  for (let i = 0; i < 120; i++) {
    const a = amp(seed, i * 0.5);
    d += `M${i} ${(10 - a * 10).toFixed(2)}v${(a * 20).toFixed(2)}h.6v-${(a * 20).toFixed(2)}z`;
  }
  return d;
}

/** a bar in its track type's color; dim at rest, full strength only while live (toggled by the timeline) */
export const Clip = memo(function Clip({ c, d, selected, onSelect, data }: {
  c: ClipT; d: number; selected?: boolean; onSelect?: () => void; data?: Record<string, string | number>;
}) {
  const attrs = Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [`data-${k}`, v]));
  return (
    <div
      className={cx(s.clip, s[c.type])}
      style={{ left: `${(c.start / d) * 100}%`, width: `${((c.end - c.start) / d) * 100}%` }}
      title={c.label}
      aria-selected={selected}
      onPointerDown={onSelect}
      {...attrs}
    >
      {c.type === "audio" && (
        <svg className={s.wave} viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
          <path d={waveD(c.seed ?? 1)} />
        </svg>
      )}
      <span>{c.label}</span>
    </div>
  );
});

export { s as clipStyles };
