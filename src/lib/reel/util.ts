export const FPS = 24;

function pad(n: number) {
  return (n < 10 ? "0" : "") + n;
}

/** HH:MM:SS:FF at 24fps */
export function tc(t: number) {
  const f = Math.max(0, Math.floor(t * FPS + 1e-6));
  return `${pad(Math.floor(f / FPS / 3600))}:${pad(Math.floor(f / FPS / 60) % 60)}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
}

/** MM:SS, for ruler ticks and short durations */
export const short = (t: number) => tc(t).slice(3, 8);

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** deterministic audio envelope for waveforms and meters (stand-in until real audio is analysed) */
export function amp(seed: number, x: number) {
  return clamp(
    0.18 + 0.5 * Math.abs(Math.sin(x * 0.9 + seed) * Math.sin(x * 0.13 + seed * 1.7)) + 0.25 * Math.abs(Math.sin(x * 2.3 + seed * 3.1)),
    0,
    1,
  );
}

export const years = (x: { from: number; to: number }) => `${x.from} - ${x.to}`;

export const plain = (t: string) => t.replace(/\*\*/g, "");

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
