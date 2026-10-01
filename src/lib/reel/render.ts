/* Monitor rendering, ported from design/reel/components/bundle.js (renderFrame and friends).
 * Procedural footage is the stand-in until real media is dropped in; real stills and photos draw
 * from their files, and real V1 video plays in a <video> under this canvas (videoLayer). */
import type { Clip, Project, TrackId } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { activeClip, type SessionState } from "@/store/session";
import { clamp, plain, rng } from "./util";

/* graded footage palettes (sky, ground, light); pigments of the stand-in footage, not UI colors */
const SCENES = [
  ["#0d2b33", "#123f3a", "#e8834a"], ["#1b1426", "#2c1f3a", "#f2b35c"], ["#0f1c2e", "#1d3b52", "#f06a3b"],
  ["#231a12", "#3a2a1a", "#f4d7a1"], ["#10231c", "#1f4a3a", "#e9e0c8"], ["#2a1416", "#43201f", "#f3a26a"],
];

/* ---------- tokens, read once from CSS ---------- */
let tok: Record<string, string> | null = null;
export function tokens() {
  if (tok) return tok;
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  tok = {
    display: v("--font-display", "serif"),
    ui: v("--font-ui", "sans-serif"),
    mono: v("--font-mono", "monospace"),
    screen: v("--screen", "#f3ede1"),
    ink: v("--ink", "#ecebe8"),
    inkMuted: v("--ink-muted", "#a3a19c"),
    panel200: v("--panel-200", "#1f1f23"),
    black: v("--theater-black", "#070708"),
  };
  return tok;
}
export function resetTokens() {
  tok = null;
}

/* ---------- image cache ---------- */
const imgs = new Map<string, HTMLImageElement | "error">();
const waiters = new Set<() => void>();
export function onImageLoad(fn: () => void) {
  waiters.add(fn);
  return () => void waiters.delete(fn);
}
export function image(src?: string): HTMLImageElement | null {
  const url = mediaUrl(src);
  if (!url) return null;
  const hit = imgs.get(url);
  if (hit === "error") return null;
  if (hit) return hit.complete && hit.naturalWidth ? hit : null;
  const im = new Image();
  im.decoding = "async";
  im.onload = () => waiters.forEach((f) => f());
  im.onerror = () => imgs.set(url, "error");
  im.src = url;
  imgs.set(url, im);
  return null;
}
function cover(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const r = Math.max(w / im.naturalWidth, h / im.naturalHeight);
  const sw = w / r, sh = h / r;
  ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

/* ---------- grain ---------- */
let grain: HTMLCanvasElement | null = null;
function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  if (!grain) {
    grain = document.createElement("canvas");
    grain.width = grain.height = 128;
    const gx = grain.getContext("2d")!, d = gx.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    gx.putImageData(d, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = "overlay";
  ctx.translate(Math.random() * -128, Math.random() * -128);
  ctx.fillStyle = ctx.createPattern(grain, "repeat")!;
  ctx.fillRect(0, 0, W + 128, H + 128);
  ctx.restore();
}

/* ---------- procedural layers ---------- */
export function drawFootage(ctx: CanvasRenderingContext2D, W: number, H: number, c: Pick<Clip, "scene" | "seed">, lt: number) {
  const s = SCENES[(c.scene ?? 0) % SCENES.length], r = rng(c.seed || 3);
  ctx.fillStyle = s[0];
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = s[2];
  ctx.beginPath();
  ctx.arc(W * (0.3 + r() * 0.3) + lt * W * 0.012, H * (0.44 - lt * 0.004), H * (0.1 + r() * 0.06), 0, 7);
  ctx.fill();
  ctx.globalAlpha = 1;
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + k * 0.015})`;
    ctx.fillRect(0, H * (0.12 + k * 0.1) + Math.sin(lt * 0.4 + k) * 4, W, 1 + k);
  }
  ctx.fillStyle = s[1];
  ctx.beginPath();
  ctx.moveTo(0, H);
  const drift = lt * W * 0.02;
  for (let x = -1; x <= 13; x++) ctx.lineTo((x * W) / 12 - (drift % (W / 12)), H * (0.6 + r() * 0.08));
  ctx.lineTo(W, H);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = -1; x <= 7; x++) ctx.lineTo((x * W) / 6 - ((drift * 2.2) % (W / 6)), H * (0.78 + r() * 0.07));
  ctx.lineTo(W, H);
  ctx.fill();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

export function drawStill(ctx: CanvasRenderingContext2D, W: number, H: number, c: Clip, lt: number, idx: number, count: number) {
  const z = 1 + lt * 0.012;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);
  const im = image(c.src);
  if (im) cover(ctx, im, 0, 0, W, H);
  else {
    const s = SCENES[(c.scene ?? 0) % SCENES.length], r = rng(c.seed || 5);
    ctx.fillStyle = s[1];
    ctx.fillRect(0, 0, W, H);
    const n = 4 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const bw = W / n;
      ctx.fillStyle = i % 2 ? s[0] : "rgba(0,0,0,.18)";
      ctx.fillRect(i * bw + bw * 0.15, H * (0.2 + r() * 0.35), bw * 0.7, H);
    }
    ctx.fillStyle = s[2];
    ctx.globalAlpha = 0.85;
    ctx.fillRect(W * (0.1 + r() * 0.6), H * (0.15 + r() * 0.2), W * 0.18, W * 0.18);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  /* position dots */
  if (count > 1) {
    const dw = 8, gap = 8, tot = count * dw + (count - 1) * gap, x0 = W / 2 - tot / 2;
    for (let k = 0; k < count; k++) {
      ctx.fillStyle = k === idx ? tokens().screen : "rgba(243,237,225,.35)";
      ctx.fillRect(x0 + k * (dw + gap), H - 26, dw, 3);
    }
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

function drawCard(ctx: CanvasRenderingContext2D, W: number, H: number, p: Project) {
  const T = tokens();
  ctx.fillStyle = T.panel200;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = T.inkMuted;
  ctx.font = `500 ${H * 0.03}px ${T.mono}`;
  ctx.textAlign = "left";
  ctx.fillText("README.MD" + (p.year ? "  ·  " + p.year : ""), W * 0.1, H * 0.26);
  ctx.fillStyle = T.ink;
  ctx.font = `400 ${H * 0.13}px ${T.display}`;
  ctx.fillText(p.name, W * 0.1, H * 0.42);
  ctx.font = `400 ${H * 0.042}px ${T.ui}`;
  wrap(ctx, plain(p.description), W * 0.1, H * 0.55, W * 0.7, H * 0.065);
}

function drawTitle(ctx: CanvasRenderingContext2D, W: number, H: number, c: Clip, t: number) {
  const T = tokens();
  const a = clamp(Math.min(t - c.start, c.end - t) / 0.5, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = T.screen;
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,.5)";
  ctx.shadowBlur = 24;
  ctx.font = `400 ${H * 0.11}px ${T.display}`;
  ctx.fillText(c.label, W / 2, H * 0.78);
  ctx.restore();
}

function polaroid(ctx: CanvasRenderingContext2D, H: number, w: number, hh: number, scene: number, label: string, src: string | undefined, fs: number) {
  const T = tokens();
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = T.screen;
  ctx.fillRect(-8, -8, w + 16, hh + 34);
  ctx.shadowColor = "transparent";
  const im = image(src);
  if (im) cover(ctx, im, 0, 0, w, hh);
  else {
    const s2 = SCENES[scene % SCENES.length];
    ctx.fillStyle = s2[1];
    ctx.fillRect(0, 0, w, hh);
    ctx.fillStyle = s2[2];
    ctx.beginPath();
    ctx.arc(w * 0.35, hh * 0.4, hh * 0.18, 0, 7);
    ctx.fill();
    ctx.fillStyle = s2[0];
    ctx.fillRect(0, hh * 0.68, w, hh * 0.32);
  }
  ctx.fillStyle = "#4a463f";
  ctx.font = `500 ${H * fs}px ${T.mono}`;
  ctx.fillText(label, 2, hh + 18);
}

function drawPhoto(ctx: CanvasRenderingContext2D, W: number, H: number, c: Clip, t: number) {
  ctx.textAlign = "left";
  if (c.stack) {
    const lt0 = t - c.start, fade = clamp((c.end - t) / 0.3, 0, 1), many = c.stack.length > 3;
    c.stack.forEach((ph, k) => {
      const lk = lt0 - (ph.at ?? k * 0.9);
      if (lk < 0) return;
      const a = clamp(lk / 0.25, 0, 1) * fade;
      let w: number, x: number, y: number, rot: number, z = 1;
      if (many) {
        /* a pile: each photo drops onto a seeded spot on the right, clear of the lyric */
        const r = rng(k * 7919 + 11);
        w = W * 0.2;
        x = W * (0.6 + r() * 0.17) + (1 - a) * 18;
        y = H * (0.08 + r() * 0.5);
        rot = (r() - 0.5) * 0.26;
        z = 1 + (1 - a) * 0.08;
      } else {
        w = W * 0.27;
        x = W * 0.6 + k * W * 0.045 + (1 - a) * 24;
        y = H * 0.12 + k * H * 0.07;
        rot = [-0.07, 0.04, -0.02][k % 3];
      }
      const hh = w * 0.75;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(x + w / 2, y + hh / 2);
      ctx.rotate(rot);
      ctx.scale(z, z);
      ctx.translate(-w / 2, -hh / 2);
      polaroid(ctx, H, w, hh, ph.scene, ph.label, ph.src, many ? 0.018 : 0.022);
      ctx.restore();
    });
    return;
  }
  const lt = t - c.start, a = clamp(Math.min(lt, c.end - t) / 0.3, 0, 1);
  const w = W * 0.3, hh = w * 0.75, x = W * 0.64 + (1 - a) * 30, y = H * 0.14, rot = (((c.seed ?? 0) % 7) - 3) * 0.012;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x + w / 2, y + hh / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -hh / 2);
  polaroid(ctx, H, w, hh, c.scene ?? 0, c.label, c.src, 0.024);
  ctx.restore();
}

function drawLyric(ctx: CanvasRenderingContext2D, W: number, H: number, c: Clip, t: number) {
  const T = tokens();
  /* "\n" in a lyric forces a line break; words still reveal in order, 0.08s apart */
  const paras = c.label.split("\n").map((l) => l.split(" ").filter(Boolean));
  const words = paras.flat(), lt = t - c.start, n = Math.min(words.length, Math.floor(lt / 0.08) + 1);
  const out = clamp((c.end - t) / 0.2, 0, 1), size = H * 0.085, maxW = W * 0.56;
  ctx.save();
  ctx.font = `400 ${size}px ${T.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const lines: string[][] = [];
  for (const para of paras) {
    let line: string[] = [];
    para.forEach((w) => {
      const test = line.concat(w).join(" ");
      if (ctx.measureText(test).width > maxW && line.length) {
        lines.push(line);
        line = [w];
      } else line.push(w);
    });
    lines.push(line);
  }
  const x0 = W * 0.07, y0 = H * 0.5 - (lines.length - 1) * size * 0.55;
  let k = 0;
  lines.forEach((ln, li) => {
    let x = x0;
    ln.forEach((w) => {
      const on = k < n, age = clamp((lt - k * 0.08) / 0.15, 0, 1);
      ctx.globalAlpha = (on ? age : 0) * out;
      ctx.fillStyle = T.screen;
      ctx.shadowColor = "rgba(0,0,0,.6)";
      ctx.shadowBlur = 20;
      ctx.fillText(w, x, y0 + li * size * 1.1 + (1 - age) * 10);
      x += ctx.measureText(w + " ").width;
      k++;
    });
  });
  ctx.restore();
}

type FrameState = Pick<SessionState, "p" | "t" | "off">;

/** true when V1's active clip is real footage that plays in the <video> under the canvas */
export function videoLayerClip(s: FrameState): Clip | null {
  const v1 = activeClip(s, "V1");
  return v1 && v1.type === "video" && v1.src ? v1 : null;
}

/**
 * Draws one frame. With `videoReady`, V1 footage is the <video> element beneath, so the canvas
 * clears to transparent and draws only the layers above it.
 */
export function renderFrame(ctx: CanvasRenderingContext2D, W: number, H: number, s: FrameState, videoReady = false) {
  const p = s.p, t = s.t;
  const v1 = activeClip(s, "V1");
  const useVideo = videoReady && !!v1 && v1.type === "video" && !!v1.src;
  if (useVideo) ctx.clearRect(0, 0, W, H);
  else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
  }
  if (v1 && !useVideo) {
    const lt = t - v1.start;
    if (v1.type === "video") drawFootage(ctx, W, H, v1, lt);
    else if (v1.type === "image") {
      const tr = p.tracks.find((x) => x.id === ("V1" as TrackId))!;
      drawStill(ctx, W, H, v1, lt, tr.clips.indexOf(v1), tr.clips.length);
    } else drawCard(ctx, W, H, p);
  }
  if (p.kind === "reel") {
    if (v1) {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(0, 0, W, H);
      drawGrain(ctx, W, H, 0.14);
    }
    const ph = activeClip(s, "V2");
    if (ph) drawPhoto(ctx, W, H, ph, t);
    const ly = activeClip(s, "V3");
    if (ly) drawLyric(ctx, W, H, ly, t);
    return;
  }
  const v2 = activeClip(s, "V2");
  if (v2 && v1) {
    if (v2.fx === "grade") {
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "rgba(224,122,58,.55)";
      ctx.fillRect(0, 0, W, H * 0.5);
      ctx.fillStyle = "rgba(30,110,120,.55)";
      ctx.fillRect(0, H * 0.5, W, H * 0.5);
      ctx.restore();
    }
    drawGrain(ctx, W, H, v2.fx === "grain" ? 0.22 : 0.1);
  }
  const v3 = activeClip(s, "V3");
  if (v3 && p.kind !== "text") drawTitle(ctx, W, H, v3, t);
}

/** the theater screen's stand-in loop: graded footage */
export function drawScreenLoop(ctx: CanvasRenderingContext2D, W: number, H: number, lt: number) {
  drawFootage(ctx, W, H, { scene: 0, seed: 91 }, lt);
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(224,122,58,.5)";
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = "rgba(30,110,120,.5)";
  ctx.fillRect(0, H / 2, W, H / 2);
  ctx.restore();
  drawGrain(ctx, W, H, 0.2);
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(0, 0, W, H);
}

/** a still for gallery cards: the first V1 clip (still, stand-in footage or readme card) with the project's grade */
export function drawPoster(ctx: CanvasRenderingContext2D, W: number, H: number, p: Project) {
  const v1 = p.tracks.find((x) => x.id === "V1")?.clips[0];
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  if (!v1 || v1.type === "text") return drawCard(ctx, W, H, p);
  if (v1.type === "image") drawStill(ctx, W, H, v1, 0, -1, 0);
  else drawFootage(ctx, W, H, v1, 1.5);
  if (p.kind === "video") {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "rgba(224,122,58,.45)";
    ctx.fillRect(0, 0, W, H / 2);
    ctx.fillStyle = "rgba(30,110,120,.45)";
    ctx.fillRect(0, H / 2, W, H / 2);
    ctx.restore();
  }
}
