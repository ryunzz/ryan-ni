"use client";
/* The one source of truth, replacing the prototype's Session class. */
import { create } from "zustand";
import index from "@/generated/index.json";
import type { Clip, Job, Project, ReelIndex, TrackId } from "@/lib/types";
import { FPS, amp, clamp } from "@/lib/reel/util";

export const reel = index as unknown as ReelIndex;

export type View = "player" | "experience";

export interface SessionState {
  projects: Project[];
  p: Project;
  t: number;
  playing: boolean;
  off: Partial<Record<TrackId, boolean>>;
  sel: Clip | null;
  view: View;
  job: number;
  prog: number | null;
  anchor: "contact" | null;
  /** bumps on every setView so the experience list re-scrolls even if nothing else changed */
  viewNonce: number;
  seqHidden: boolean;

  seek(t: number): void;
  step(frames: number): void;
  setPlaying(v: boolean): void;
  toggle(): void;
  load(id: string): void;
  setView(v: View, job?: number | null, anchor?: "contact" | null): void;
  setProg(k: number | null): void;
  toggleTrack(id: TrackId): void;
  select(c: Clip | null): void;
  setSeqHidden(v: boolean): void;
}

export const useSession = create<SessionState>()((set, get) => ({
  projects: reel.projects,
  p: reel.projects[0],
  t: 0,
  playing: false,
  off: {},
  sel: null,
  view: "player",
  job: 0,
  prog: null,
  anchor: null,
  viewNonce: 0,
  seqHidden: false,

  seek: (t) => set({ t: clamp(t, 0, get().p.duration - 1 / FPS) }),
  step: (n) => get().seek(Math.round(get().t * FPS + n) / FPS),
  setPlaying: (v) => {
    lastFrame = 0;
    set({ playing: v });
  },
  toggle: () => get().setPlaying(!get().playing),
  load: (id) => {
    const p = get().projects.find((x) => x.id === id) ?? get().p;
    set({ p, t: 0, sel: null, off: {} });
  },
  setView: (v, job, anchor) => {
    const patch: Partial<SessionState> = { view: v, anchor: anchor ?? null, viewNonce: get().viewNonce + 1 };
    if (job != null) patch.job = job;
    if (v === "experience") patch.playing = false;
    set(patch);
  },
  setProg: (k) => set({ prog: k }),
  toggleTrack: (id) => set({ off: { ...get().off, [id]: !get().off[id] } }),
  select: (c) => set({ sel: c }),
  setSeqHidden: (v) => set({ seqHidden: v }),
}));

/* ---------- derived ---------- */
export function activeClip(s: Pick<SessionState, "p" | "t" | "off">, id: TrackId): Clip | null {
  if (s.off[id]) return null;
  const tr = s.p.tracks.find((x) => x.id === id);
  if (!tr) return null;
  for (const c of tr.clips) if (s.t >= c.start && s.t < c.end) return c;
  return null;
}

/** stereo meter level, from the deterministic envelope (real audio adds its analyser level in the mixer) */
export function level(s: Pick<SessionState, "p" | "t" | "off">) {
  let L = 0;
  (["A1", "A2"] as const).forEach((id, k) => {
    const c = activeClip(s, id);
    if (c) L += amp(c.seed ?? 1, (s.t - c.start) * 6) * (k ? 0.55 : 0.6);
  });
  return clamp(L, 0, 1);
}

export const me = (): Project | undefined => reel.projects.find((p) => p.experience);
export const experience = (): Job[] => me()?.experience ?? [];

/* ---------- the clock: one rAF for the whole app ---------- */
let lastFrame = 0;
let running = false;
export function startClock() {
  if (running || typeof window === "undefined") return;
  running = true;
  const tick = (now: number) => {
    const s = useSession.getState();
    if (s.playing) {
      const dt = lastFrame ? (now - lastFrame) / 1000 : 0;
      let t = s.t + Math.min(dt, 0.1);
      if (t >= s.p.duration) t = 0;
      useSession.setState({ t });
    }
    lastFrame = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
