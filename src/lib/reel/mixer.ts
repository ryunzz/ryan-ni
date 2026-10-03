"use client";
/* Each audio track is its own file, mixed in the browser with Web Audio so mute works.
 * One <audio> per clip with a src, routed through a GainNode per track (A1, A2) into an analyser. */
import { activeClip, level, useSession, type SessionState } from "@/store/session";
import type { Clip, TrackId } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { FPS, clamp } from "./util";

const TRACKS: TrackId[] = ["A1", "A2"];
let ac: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
const gains = new Map<TrackId, GainNode>();
const els = new Map<Clip, HTMLAudioElement>();
let buf: Uint8Array<ArrayBuffer> | null = null;

function ensureContext() {
  if (ac || typeof window === "undefined" || !window.AudioContext) return;
  ac = new AudioContext();
  analyser = ac.createAnalyser();
  analyser.fftSize = 512;
  buf = new Uint8Array(analyser.fftSize);
  analyser.connect(ac.destination);
  for (const id of TRACKS) {
    const g = ac.createGain();
    g.connect(analyser);
    gains.set(id, g);
  }
  for (const [c, el] of els) connect(c, el);
}

function trackOf(s: SessionState, c: Clip): TrackId | undefined {
  return s.p.tracks.find((t) => t.clips.includes(c))?.id;
}

function connect(c: Clip, el: HTMLAudioElement) {
  const st = useSession.getState();
  const id = trackOf(st, c);
  if (!ac || !id || (el as unknown as { _wired?: boolean })._wired) return;
  ac.createMediaElementSource(el).connect(gains.get(id)!);
  (el as unknown as { _wired?: boolean })._wired = true;
}

function load(s: SessionState) {
  for (const [, el] of els) { el.pause(); el.removeAttribute("src"); el.load(); }
  els.clear();
  for (const t of s.p.tracks) {
    if (t.kind !== "a") continue;
    for (const c of t.clips) {
      if (!c.src) continue;
      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.preload = "auto";
      el.src = mediaUrl(c.src)!;
      els.set(c, el);
      connect(c, el);
    }
  }
}

function sync(s: SessionState) {
  for (const id of TRACKS) {
    const g = gains.get(id);
    if (g) g.gain.value = s.off[id] ? 0 : 1;
  }
  for (const [c, el] of els) {
    const id = trackOf(s, c)!;
    const live = s.t >= c.start && s.t < c.end;
    el.muted = !ac && !!s.off[id];
    if (!live || !s.playing) {
      if (!el.paused) el.pause();
      continue;
    }
    const want = (c.in ?? 0) + (s.t - c.start);
    if (Math.abs(el.currentTime - want) > 1 / FPS * 2) el.currentTime = want;
    if (el.paused) void el.play().catch(() => {});
  }
}

/** meter level: the analyser when real audio is playing, else the deterministic envelope */
export function meterLevel(s: Pick<SessionState, "p" | "t" | "off">) {
  const real = TRACKS.some((id) => activeClip(s, id)?.src);
  if (real && analyser && buf) {
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    return clamp(Math.sqrt(sum / buf.length) * 3, 0, 1);
  }
  return level(s);
}

let started = false;
export function startMixer() {
  if (started || typeof window === "undefined") return;
  started = true;
  let pid = "";
  const on = (s: SessionState) => {
    if (s.p.id !== pid) { pid = s.p.id; load(s); }
    if (els.size) sync(s);
  };
  on(useSession.getState());
  useSession.subscribe(on);
  /* browsers only start audio after a gesture */
  const unlock = () => {
    ensureContext();
    void ac?.resume();
    if (ac) { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); }
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}
