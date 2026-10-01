/* Reel line icons: 16 grid, 1.5 stroke, round caps (Reel.icons in the prototype). Transport glyphs are filled. */
import type { ReactNode } from "react";
import { cx } from "@/lib/reel/util";
import s from "./Icon.module.css";

const LINE: Record<string, ReactNode> = {
  folder: <path d="M1.5 4.5v8h13v-7H8L6.5 3.5h-5z" />,
  film: <><rect x="2" y="3" width="12" height="10" rx="1" /><path d="M5 3v10M11 3v10M2 6h3M2 10h3M11 6h3M11 10h3" /></>,
  image: <><rect x="2" y="3" width="12" height="10" rx="1" /><circle cx="6" cy="6.5" r="1.2" /><path d="M2.5 12l4-4 3 3 2-2 2.5 2.5" /></>,
  doc: <><path d="M4 1.5h5.5L12.5 4.5v10H4z" /><path d="M6 8h4.5M6 10.5h4.5" /></>,
  wave: <path d="M2 8h1M4.5 5v6M7 3v10M9.5 6v4M12 4.5v7M14 8h0" />,
  link: <path d="M6 3.5H3.5v9h9V10M9 2.5h4.5V7M13.5 2.5L7 9" />,
  eye: <><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" /><circle cx="8" cy="8" r="2" /></>,
  eyeoff: <path d="M2 2l12 12M6.4 4A6.7 6.7 0 0 1 8 3.5C12 3.5 14.5 8 14.5 8a11 11 0 0 1-1.9 2.4M10.2 11.9A5.4 5.4 0 0 1 8 12.5C4 12.5 1.5 8 1.5 8a11 11 0 0 1 2.4-2.9" />,
  spk: <><path d="M2 6v4h3l4 3V3L5 6z" /><path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" /></>,
  spkoff: <><path d="M2 6v4h3l4 3V3L5 6z" /><path d="M11 6l3.5 4M14.5 6L11 10" /></>,
  lock: <><rect x="3.5" y="7" width="9" height="6.5" rx="1" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></>,
  mail: <><rect x="1.5" y="3.5" width="13" height="9" rx="1" /><path d="M2 4l6 5 6-5" /></>,
  user: <><circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c.6-2.8 2.6-4.2 5-4.2s4.4 1.4 5 4.2" /></>,
  info: <><circle cx="8" cy="8" r="6.5" /><path d="M8 7.2v4M8 4.8v.1" /></>,
  hide: <path d="M4 6l4 4 4-4" />,
  show: <path d="M4 10l4-4 4 4" />,
  back: <path d="M10 3.5L5.5 8l4.5 4.5" />,
  check: <path d="M3 8.5l3 3 7-7" />,
  globe: <><circle cx="8" cy="8" r="6.5" /><path d="M1.5 8h13M8 1.5c2 2 2.8 4.2 2.8 6.5S10 12.5 8 14.5M8 1.5C6 3.5 5.2 5.7 5.2 8S6 12.5 8 14.5" /></>,
  award: <><circle cx="8" cy="6" r="4" /><path d="M5.6 9.2L4.5 14.5 8 12.8l3.5 1.7-1.1-5.3" /></>,
  eject: <path d="M3 9.5L8 3.5l5 6zM3 12.5h10" />,
};
const FILL: Record<string, ReactNode> = {
  play: <path d="M4.5 2.5v11l9-5.5z" />,
  pause: <><rect x="4" y="3" width="3" height="10" rx=".5" /><rect x="9" y="3" width="3" height="10" rx=".5" /></>,
  stepb: <path d="M11.5 3v10L5 8zM3.5 3h1.5v10H3.5z" />,
  stepf: <path d="M4.5 3v10L11 8zM11 3h1.5v10H11z" />,
  start: <path d="M3 3h1.5v10H3zM13 3v10L8.5 8zM8.5 3v10L4 8z" />,
  end: <path d="M11.5 3H13v10h-1.5zM3 3v10l4.5-5zM7.5 3v10L12 8z" />,
};

export type IconKey = keyof typeof LINE | keyof typeof FILL;

export function Icon({ name, className }: { name: IconKey; className?: string }) {
  const filled = name in FILL;
  return (
    <svg className={cx(s.ico, filled && s.fill, className)} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {filled ? FILL[name] : LINE[name]}
    </svg>
  );
}

/** the cursor-cue pointer (drawn, never a screen recording) */
export function CursorGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 2l15 11-6.5 1.2L16.5 21l-3 1.4-3.9-6.9L4 20z" fill="var(--ink)" stroke="var(--panel-000)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
