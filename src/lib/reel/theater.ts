/* The drawn theater (act one fallback until the photo layers exist), painted on canvas so it can be
 * lit like a real room: the screen is the only strong light, so curtain folds, seat tops and hair
 * catch it, and everything else falls off into the dark. Drawn once per size, never per frame. */
import { clamp, rng } from "./util";

export interface Rect { x: number; y: number; w: number; h: number }
type RGB = [number, number, number];

/* ---------- palette from tokens ---------- */
function hex(h: string): RGB {
  const m = h.trim().replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, fb: string) => hex(cs.getPropertyValue(n).trim() || fb);
  return {
    black: v("--theater-black", "#070708"),
    screen: v("--screen", "#f3ede1"),
    velvet: v("--velvet", "#5b1a20"),
    velvetDeep: v("--velvet-deep", "#340e13"),
    velvetHi: v("--velvet-hi", "#9a3540"),
    seat: v("--seat", "#1b1216"),
    seatEdge: v("--seat-edge", "#3b252b"),
    aisle: v("--aisle-light", "#e0b451"),
    snackRed: v("--snack-red", "#b0252c"),
    popcorn: v("--popcorn", "#e8c27a"),
  };
}

/* ---------- fabric grain ---------- */
let grainTile: HTMLCanvasElement | null = null;
function grain(ctx: CanvasRenderingContext2D) {
  if (!grainTile) {
    grainTile = document.createElement("canvas");
    grainTile.width = grainTile.height = 96;
    const g = grainTile.getContext("2d")!, d = g.createImageData(96, 96), r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
  }
  return ctx.createPattern(grainTile, "repeat")!;
}
function texture(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = grain(ctx);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* ---------- the room ---------- */
export function drawRoom(ctx: CanvasRenderingContext2D, W: number, H: number, scr: Rect) {
  const P = palette(), r = rng(31);
  const cx = scr.x + scr.w / 2, cy = scr.y + scr.h / 2;
  const curtainW = scr.w * 0.17;
  const wallL = scr.x - curtainW - scr.w * 0.03, wallR = scr.x + scr.w + curtainW + scr.w * 0.03;
  const ceilY = Math.max(0, scr.y - scr.h * 0.42);
  const stageY = scr.y + scr.h + scr.h * 0.1, floorY = stageY + scr.h * 0.06;

  ctx.fillStyle = rgba(P.black);
  ctx.fillRect(0, 0, W, H);

  /* ceiling and side walls in perspective, falling off into the dark toward the viewer */
  const wall = (pts: [number, number][], fade: [number, number, number, number]) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const g = ctx.createLinearGradient(fade[0], fade[1], fade[2], fade[3]);
    g.addColorStop(0, rgba(mix(P.black, P.velvetDeep, 0.35)));
    g.addColorStop(1, rgba(P.black));
    ctx.fillStyle = g;
    ctx.fill();
  };
  wall([[0, 0], [W, 0], [wallR, ceilY], [wallL, ceilY]], [cx, ceilY, cx, 0]);
  wall([[0, 0], [wallL, ceilY], [wallL, floorY], [0, H]], [wallL, cy, 0, cy]);
  wall([[W, 0], [wallR, ceilY], [wallR, floorY], [W, H]], [wallR, cy, W, cy]);
  /* acoustic panel seams on the side walls, converging on the screen */
  ctx.strokeStyle = rgba(P.black, 0.55);
  ctx.lineWidth = 1;
  for (let k = 1; k < 7; k++) {
    const t = k / 7, e = t * t;
    for (const [wx, ox] of [[wallL, 0], [wallR, W]] as const) {
      const x = wx + (ox - wx) * e;
      ctx.beginPath();
      ctx.moveTo(x, ceilY + (0 - ceilY) * e);
      ctx.lineTo(x, floorY + (H - floorY) * e);
      ctx.stroke();
    }
  }
  /* front wall around the screen */
  ctx.fillStyle = rgba(mix(P.black, P.velvetDeep, 0.25));
  ctx.fillRect(wallL, ceilY, wallR - wallL, floorY - ceilY);

  /* light spilling from the screen onto everything near it */
  const spill = (alpha: number) => {
    const g = ctx.createRadialGradient(cx, cy, scr.w * 0.2, cx, cy, Math.max(W, H) * 0.75);
    g.addColorStop(0, rgba(P.screen, alpha));
    g.addColorStop(1, rgba(P.screen, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  spill(0.07);

  /* wall sconces: dim warm lights */
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const t = 0.22 + k * 0.26, wx = side < 0 ? wallL : wallR, ox = side < 0 ? 0 : W;
      const x = wx + (ox - wx) * t, y = ceilY + (floorY - ceilY) * 0.42 + (H * 0.42 - (ceilY + (floorY - ceilY) * 0.42)) * t * 0.5;
      const rr = scr.h * (0.12 + t * 0.18);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, rgba(P.aisle, 0.32));
      g.addColorStop(0.25, rgba(P.aisle, 0.1));
      g.addColorStop(1, rgba(P.aisle, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      ctx.fillStyle = rgba(mix(P.aisle, P.screen, 0.5), 0.85);
      ctx.beginPath();
      ctx.ellipse(x, y, rr * 0.06, rr * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* stage lip under the screen */
  const sg = ctx.createLinearGradient(0, stageY, 0, floorY);
  sg.addColorStop(0, rgba(mix(P.black, P.screen, 0.07)));
  sg.addColorStop(0.08, rgba(mix(P.black, P.velvetDeep, 0.3)));
  sg.addColorStop(1, rgba(P.black));
  ctx.fillStyle = sg;
  ctx.fillRect(wallL, stageY, wallR - wallL, floorY - stageY);
  ctx.fillStyle = rgba(P.black);
  ctx.fillRect(0, floorY, W, H - floorY);

  /* black masking frame around the screen */
  const m = scr.h * 0.035;
  ctx.fillStyle = rgba(mix(P.black, P.black, 0));
  ctx.fillRect(scr.x - m, scr.y - m, scr.w + m * 2, scr.h + m * 2);

  /* curtains, then the valance over them */
  curtain(ctx, P, wallL, scr.x - m * 0.4, ceilY, stageY + scr.h * 0.03, "left", r);
  curtain(ctx, P, scr.x + scr.w + m * 0.4, wallR, ceilY, stageY + scr.h * 0.03, "right", r);
  valance(ctx, P, wallL, wallR, ceilY, scr.y - m * 1.2, cx, r);
}

/** one side curtain: pleats shaded as soft cylinders, brighter toward the screen */
function curtain(ctx: CanvasRenderingContext2D, P: ReturnType<typeof palette>, x0: number, x1: number, y0: number, y1: number, side: "left" | "right", r: () => number) {
  const w = x1 - x0, h = y1 - y0;
  const n = Math.max(7, Math.round(w / Math.max(10, h * 0.045)));
  /* pleat edges with irregular widths */
  const edges = [0];
  for (let i = 1; i < n; i++) edges.push(i / n + (r() - 0.5) * (0.5 / n));
  edges.push(1);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = x0 + edges[i] * w, b = x0 + edges[i + 1] * w, pw = b - a;
    /* distance from the screen edge: 0 next to the screen, 1 at the wall */
    const d = side === "left" ? 1 - (edges[i] + edges[i + 1]) / 2 : (edges[i] + edges[i + 1]) / 2;
    const light = 0.25 + 0.75 * Math.pow(1 - d, 1.6);
    const crest = mix(mix(P.velvet, P.velvetHi, light), P.screen, light * 0.12);
    const trough = mix(P.velvetDeep, P.black, 0.55);
    const g = ctx.createLinearGradient(a, 0, b, 0);
    /* the crest sits toward the lit (screen) side of each fold */
    const peak = side === "left" ? 0.62 : 0.38;
    g.addColorStop(0, rgba(trough));
    g.addColorStop(Math.max(0.05, peak - 0.32), rgba(mix(trough, P.velvet, 0.7)));
    g.addColorStop(peak, rgba(crest));
    g.addColorStop(Math.min(0.95, peak + 0.22), rgba(mix(P.velvet, trough, 0.35)));
    g.addColorStop(1, rgba(trough));
    ctx.fillStyle = g;
    /* each fold ends in a rounded hem at a slightly different length */
    const hem = y1 - h * (0.004 + r() * 0.012);
    ctx.beginPath();
    ctx.moveTo(a, y0);
    ctx.lineTo(b, y0);
    ctx.lineTo(b, hem - pw * 0.25);
    ctx.quadraticCurveTo((a + b) / 2, hem + pw * 0.35, a, hem - pw * 0.25);
    ctx.closePath();
    ctx.fill();
    /* velvet sheen: a thin soft highlight along the crest */
    const hx = a + pw * peak;
    const sh = ctx.createLinearGradient(hx - pw * 0.08, 0, hx + pw * 0.08, 0);
    sh.addColorStop(0, rgba(P.screen, 0));
    sh.addColorStop(0.5, rgba(P.screen, 0.05 + light * 0.1));
    sh.addColorStop(1, rgba(P.screen, 0));
    ctx.fillStyle = sh;
    ctx.fillRect(hx - pw * 0.08, y0, pw * 0.16, hem - y0 - pw * 0.2);
  }
  /* vertical light: shadowed under the valance, lit in the middle, dark at the floor */
  const vg = ctx.createLinearGradient(0, y0, 0, y1);
  vg.addColorStop(0, rgba(P.black, 0.75));
  vg.addColorStop(0.18, rgba(P.black, 0.15));
  vg.addColorStop(0.55, rgba(P.black, 0.05));
  vg.addColorStop(1, rgba(P.black, 0.55));
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = vg;
  ctx.fillRect(x0, y0, w, h + h * 0.05);
  ctx.globalCompositeOperation = "source-over";
  /* pile: fine vertical streaks */
  for (let k = 0; k < w * 0.6; k++) {
    const x = x0 + r() * w;
    ctx.fillStyle = rgba(r() > 0.5 ? P.screen : P.black, 0.012 + r() * 0.025);
    ctx.fillRect(x, y0, 1, h * (0.6 + r() * 0.4));
  }
  texture(ctx, x0, y0, w, h, 0.07);
  /* the curtain's shadow pooling on the stage */
  const fg = ctx.createRadialGradient((x0 + x1) / 2, y1, 0, (x0 + x1) / 2, y1, w * 0.7);
  fg.addColorStop(0, rgba(P.black, 0.6));
  fg.addColorStop(1, rgba(P.black, 0));
  ctx.fillStyle = fg;
  ctx.fillRect(x0 - w * 0.2, y1 - h * 0.02, w * 1.4, h * 0.06);
  ctx.restore();
}

/** the valance across the top: short pleats with draped swags */
function valance(ctx: CanvasRenderingContext2D, P: ReturnType<typeof palette>, x0: number, x1: number, y0: number, y1: number, cx: number, r: () => number) {
  const w = x1 - x0, h = Math.max(8, y1 - y0);
  ctx.save();
  /* short pleats behind the swags */
  const n = Math.round(w / Math.max(8, h * 0.35));
  for (let i = 0; i < n; i++) {
    const a = x0 + (i / n) * w, b = x0 + ((i + 1) / n) * w;
    const light = 0.35 + 0.65 * (1 - Math.abs((a + b) / 2 - cx) / (w / 2));
    const g = ctx.createLinearGradient(a, 0, b, 0);
    g.addColorStop(0, rgba(mix(P.velvetDeep, P.black, 0.5)));
    g.addColorStop(0.5, rgba(mix(P.velvet, P.velvetHi, light * 0.6)));
    g.addColorStop(1, rgba(mix(P.velvetDeep, P.black, 0.5)));
    ctx.fillStyle = g;
    ctx.fillRect(a, y0, b - a + 0.5, h);
  }
  /* swags: crescents of gathered cloth, lit on their lower curve by the screen */
  const k = Math.max(3, Math.round(w / (h * 3.2)));
  for (let i = 0; i < k; i++) {
    const a = x0 + (i / k) * w - w * 0.01, b = x0 + ((i + 1) / k) * w + w * 0.01, m = (a + b) / 2;
    const top = y0 + h * 0.12, dip = y0 + h * (1.05 + r() * 0.08), inner = y0 + h * 0.55;
    const light = 0.4 + 0.6 * (1 - Math.abs(m - cx) / (w / 2));
    ctx.beginPath();
    ctx.moveTo(a, top);
    ctx.quadraticCurveTo(m, dip + h * 0.25, b, top);
    ctx.quadraticCurveTo(m, inner, a, top);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, dip);
    g.addColorStop(0, rgba(mix(P.velvetDeep, P.black, 0.4)));
    g.addColorStop(0.65, rgba(mix(P.velvet, P.velvetHi, light * 0.8)));
    g.addColorStop(1, rgba(mix(mix(P.velvetHi, P.screen, 0.12 * light), P.velvet, 0.2)));
    ctx.fillStyle = g;
    ctx.fill();
    /* fold lines inside the swag */
    ctx.strokeStyle = rgba(P.black, 0.35);
    ctx.lineWidth = Math.max(1, h * 0.02);
    for (let f = 1; f <= 3; f++) {
      const t = f / 4;
      ctx.beginPath();
      ctx.moveTo(a + (b - a) * 0.06 * f, top + h * 0.03 * f);
      ctx.quadraticCurveTo(m, inner + (dip + h * 0.25 - inner) * t, b - (b - a) * 0.06 * f, top + h * 0.03 * f);
      ctx.stroke();
    }
  }
  texture(ctx, x0, y0, w, h * 1.3, 0.06);
  ctx.restore();
}

/* ---------- a row of seats (seen from behind) ---------- */
export interface RowSpec {
  /** row index from the back of the room (far) to the front (near the viewer) */
  depth: number;
  /** seat-back visible height in px */
  unit: number;
  /** where the seat tops sit inside the canvas, px from the top */
  top: number;
  /** screen centre x inside the row canvas, px */
  cx: number;
  heads: number;
  seed: number;
  /** alternate rows sit half a seat over, like a real auditorium */
  stagger: boolean;
}

export function drawRow(ctx: CanvasRenderingContext2D, W: number, H: number, o: RowSpec) {
  const P = palette(), r = rng(o.seed);
  const seatW = o.unit * 0.82, gap = seatW * 0.12, pitch = seatW + gap;
  const light = 1 - o.depth * 0.55;
  /* seats fill a block centred on the screen, with aisles at its ends (which converge with distance) */
  const half = W * (0.3 + o.depth * 0.36);
  const count = Math.floor(half / pitch);
  const seats: number[] = [];
  for (let j = -count; j <= count; j++) seats.push(o.cx + (j + (o.stagger ? 0.5 : 0)) * pitch);
  /* rows curve around the screen: seats toward the sides sit a little higher and smaller */
  const bend = (sx: number) => {
    const n = clamp((sx - o.cx) / (W / 2), -1.2, 1.2);
    return { lift: o.unit * 0.42 * n * n * (1 - o.depth * 0.4), s: 1 - 0.07 * n * n };
  };

  /* heads first: the seat backs cover their lower half */
  for (const sx of seats) {
    if (r() > o.heads || Math.abs(sx - o.cx) < pitch * 0.6) { r(); r(); continue; }
    const bd = bend(sx);
    const hw = seatW * bd.s * (0.5 + r() * 0.12), hh = hw * (1.18 + r() * 0.16);
    const hx = sx + (r() - 0.5) * seatW * 0.22, hy = o.top - bd.lift - hh * 0.4;
    const g = ctx.createLinearGradient(0, hy - hh / 2, 0, hy + hh / 2);
    g.addColorStop(0, rgba(mix(P.black, P.seat, 0.6)));
    g.addColorStop(1, rgba(P.black));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hw / 2, hh / 2, (r() - 0.5) * 0.15, 0, Math.PI * 2);
    ctx.fill();
    /* soft light on the crown of the head from the screen, fading down the sides */
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(hx, hy, hw / 2, hh / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    const rim = ctx.createRadialGradient(hx, hy - hh * 0.62, hw * 0.05, hx, hy - hh * 0.62, hw * 0.75);
    rim.addColorStop(0, rgba(P.screen, 0.1 + light * 0.12));
    rim.addColorStop(1, rgba(P.screen, 0));
    ctx.fillStyle = rim;
    ctx.fillRect(hx - hw, hy - hh, hw * 2, hh * 2);
    ctx.restore();
  }

  for (const sx of seats) {
    const bd = bend(sx), sw = seatW * bd.s, y0 = o.top - bd.lift;
    const x = sx - sw / 2, sh = sw * 0.24, bulge = sw * 0.035;
    const fromCentre = clamp(Math.abs(sx - o.cx) / (W * 0.6), 0, 1);
    const lit = light * (1 - fromCentre * 0.5);
    const path = new Path2D();
    path.moveTo(x, H + 2);
    path.lineTo(x, y0 + sh);
    path.quadraticCurveTo(x, y0, x + sh, y0 - bulge * 0.2);
    path.quadraticCurveTo(sx, y0 - bulge, x + sw - sh, y0 - bulge * 0.2);
    path.quadraticCurveTo(x + sw, y0, x + sw, y0 + sh);
    path.lineTo(x + sw, H + 2);
    path.closePath();

    /* upholstery: lit along the top, falling into shadow */
    const vg = ctx.createLinearGradient(0, y0 - bulge, 0, y0 + o.unit);
    vg.addColorStop(0, rgba(mix(P.seatEdge, P.screen, 0.14 * lit)));
    vg.addColorStop(0.05, rgba(mix(P.seat, P.seatEdge, 0.55 * lit)));
    vg.addColorStop(0.3, rgba(mix(P.seat, P.black, 0.25)));
    vg.addColorStop(1, rgba(mix(P.seat, P.black, 0.8)));
    ctx.fillStyle = vg;
    ctx.fill(path);

    ctx.save();
    ctx.clip(path);
    /* padded back: rounded edges darker than the middle */
    const hg = ctx.createLinearGradient(x, 0, x + sw, 0);
    hg.addColorStop(0, rgba(P.black, 0.55));
    hg.addColorStop(0.18, rgba(P.black, 0.08));
    hg.addColorStop(0.5, rgba(P.black, 0));
    hg.addColorStop(0.82, rgba(P.black, 0.08));
    hg.addColorStop(1, rgba(P.black, 0.55));
    ctx.fillStyle = hg;
    ctx.fillRect(x, y0 - bulge, sw, H);
    /* headrest seam with a soft pillow below it */
    const seam = y0 + o.unit * 0.3;
    ctx.fillStyle = rgba(P.black, 0.55);
    ctx.fillRect(x + sw * 0.08, seam, sw * 0.84, Math.max(1, o.unit * 0.025));
    const pg = ctx.createLinearGradient(0, seam, 0, seam + o.unit * 0.12);
    pg.addColorStop(0, rgba(P.screen, 0.025 + 0.04 * lit));
    pg.addColorStop(1, rgba(P.screen, 0));
    ctx.fillStyle = pg;
    ctx.fillRect(x, seam + 1, sw, o.unit * 0.12);
    texture(ctx, x, y0 - bulge, sw, H - y0 + bulge, 0.1);
    ctx.restore();

    /* rim light where the screen catches the top of the seat */
    ctx.save();
    ctx.strokeStyle = rgba(P.screen, 0.1 + 0.32 * lit);
    ctx.lineWidth = Math.max(0.8, sw * 0.025);
    ctx.shadowColor = rgba(P.screen, 0.35 * lit);
    ctx.shadowBlur = sw * 0.08;
    ctx.beginPath();
    ctx.moveTo(x + sh * 0.3, y0 + sh * 0.3);
    ctx.quadraticCurveTo(x + sh * 0.2, y0 - bulge * 0.1, x + sh, y0 - bulge * 0.2);
    ctx.quadraticCurveTo(sx, y0 - bulge, x + sw - sh, y0 - bulge * 0.2);
    ctx.quadraticCurveTo(x + sw - sh * 0.2, y0 - bulge * 0.1, x + sw - sh * 0.3, y0 + sh * 0.3);
    ctx.stroke();
    ctx.restore();
  }

  /* armrests in the gaps, lower than the backs */
  for (let j = 0; j < seats.length - 1; j++) {
    const ax = (seats[j] + seats[j + 1]) / 2, aw = gap * 1.7, ay = o.top - bend(ax).lift + o.unit * 0.55;
    ctx.fillStyle = rgba(mix(P.seat, P.black, 0.35));
    ctx.beginPath();
    ctx.roundRect(ax - aw / 2, ay, aw, H - ay + 2, aw * 0.35);
    ctx.fill();
    ctx.fillStyle = rgba(P.screen, 0.05 + 0.12 * light);
    ctx.fillRect(ax - aw * 0.35, ay + 0.5, aw * 0.7, Math.max(1, o.unit * 0.02));
  }

  /* aisle step lights at the ends of the block */
  for (const ex of [seats[0] - pitch * 0.9, seats[seats.length - 1] + pitch * 0.9]) {
    if (ex < -10 || ex > W + 10) continue;
    const ly = H - Math.max(3, o.unit * 0.12), rr = o.unit * 0.45;
    const g = ctx.createRadialGradient(ex, ly, 0, ex, ly, rr);
    g.addColorStop(0, rgba(P.aisle, 0.55));
    g.addColorStop(0.2, rgba(P.aisle, 0.15));
    g.addColorStop(1, rgba(P.aisle, 0));
    ctx.fillStyle = g;
    ctx.fillRect(ex - rr, ly - rr, rr * 2, rr * 2);
    ctx.fillStyle = rgba(mix(P.aisle, P.screen, 0.4));
    ctx.fillRect(ex - o.unit * 0.05, ly - 1, o.unit * 0.1, Math.max(1.5, o.unit * 0.025));
  }

  /* atmosphere: far rows sit in projector haze, the nearest row is in deep shadow */
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = rgba(P.screen, 0.06 * (1 - o.depth));
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = rgba(P.black, 0.3 * o.depth);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** the projector beam overhead, with dust caught in it */
export function drawBeam(ctx: CanvasRenderingContext2D, W: number, H: number, scr: Rect) {
  const P = palette(), r = rng(5);
  const src = { x: W / 2, y: -H * 0.08 };
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(src.x - W * 0.02, src.y);
  ctx.lineTo(src.x + W * 0.02, src.y);
  ctx.lineTo(scr.x + scr.w, scr.y);
  ctx.lineTo(scr.x, scr.y);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, src.y, 0, scr.y);
  g.addColorStop(0, rgba(P.screen, 0.07));
  g.addColorStop(1, rgba(P.screen, 0.015));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  for (let k = 0; k < 140; k++) {
    const t = r(), x = src.x + (scr.x + r() * scr.w - src.x) * t, y = src.y + (scr.y - src.y) * t;
    ctx.fillStyle = rgba(P.screen, 0.08 + r() * 0.18);
    ctx.beginPath();
    ctx.arc(x, y, 0.4 + r() * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- your snacks: the foreground of the POV ---------- */

/** a cup or bucket body: a trapezoid wider at the top, running off the bottom of the frame */
function tub(cx: number, top: number, wTop: number, wBot: number, bottom: number) {
  const p = new Path2D();
  p.moveTo(cx - wTop / 2, top);
  p.lineTo(cx + wTop / 2, top);
  p.lineTo(cx + wBot / 2, bottom);
  p.lineTo(cx - wBot / 2, bottom);
  p.closePath();
  return p;
}

/** in near darkness, lit only from ahead (the screen): fronts in shadow, tops and edges catch light */
function shadeBody(ctx: CanvasRenderingContext2D, P: ReturnType<typeof palette>, cx: number, top: number, w: number, bottom: number) {
  const hg = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  hg.addColorStop(0, rgba(P.black, 0.88));
  hg.addColorStop(0.3, rgba(P.black, 0.62));
  hg.addColorStop(0.55, rgba(P.black, 0.56));
  hg.addColorStop(1, rgba(P.black, 0.9));
  ctx.fillStyle = hg;
  ctx.fillRect(cx - w, top, w * 2, bottom - top);
  const vg = ctx.createLinearGradient(0, top, 0, bottom);
  vg.addColorStop(0, rgba(P.black, 0));
  vg.addColorStop(1, rgba(P.black, 0.7));
  ctx.fillStyle = vg;
  ctx.fillRect(cx - w, top, w * 2, bottom - top);
  texture(ctx, cx - w, top, w * 2, bottom - top, 0.08);
}

export function drawSnacks(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const P = palette(), r = rng(99);
  const unit = Math.min(H * 0.26, W * 0.3);

  /* popcorn bucket in your lap, bottom left */
  {
    const cx = W * 0.15, top = H - unit * 0.78, wTop = unit, wBot = unit * 0.8, bottom = H + unit * 0.4;
    const body = tub(cx, top, wTop, wBot, bottom);
    ctx.save();
    ctx.clip(body);
    ctx.fillStyle = rgba(P.screen);
    ctx.fillRect(cx - wTop, top, wTop * 2, bottom - top);
    /* red and white stripes following the taper */
    const n = 7;
    for (let k = 0; k < n; k += 2) {
      const a = k / n, b = (k + 1) / n;
      ctx.beginPath();
      ctx.moveTo(cx - wTop / 2 + wTop * a, top);
      ctx.lineTo(cx - wTop / 2 + wTop * b, top);
      ctx.lineTo(cx - wBot / 2 + wBot * b, bottom);
      ctx.lineTo(cx - wBot / 2 + wBot * a, bottom);
      ctx.closePath();
      ctx.fillStyle = rgba(P.snackRed);
      ctx.fill();
    }
    shadeBody(ctx, P, cx, top, wTop, bottom);
    ctx.restore();
    /* rolled paper rim */
    ctx.fillStyle = rgba(mix(P.screen, P.black, 0.55));
    ctx.beginPath();
    ctx.ellipse(cx, top, wTop / 2, unit * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    /* popcorn heaped above the rim: kernels lit on top by the screen */
    const kernels: [number, number, number][] = [];
    for (let i = 0; i < 260; i++) {
      const u = r() * 2 - 1, mound = Math.sqrt(Math.max(0, 1 - u * u));
      const kx = cx + u * wTop * 0.5;
      /* fill the whole dome, not just its outline */
      const ky = top + unit * 0.02 - mound * unit * 0.26 * Math.sqrt(r());
      kernels.push([kx, ky, unit * (0.035 + r() * 0.025)]);
    }
    kernels.sort((a, b) => a[1] - b[1]);
    for (const [kx, ky, kr] of kernels) {
      const lit = clamp(1 - (ky - (top - unit * 0.32)) / (unit * 0.4), 0, 1);
      for (let p = 0; p < 3; p++) {
        const ox = (r() - 0.5) * kr * 1.1, oy = (r() - 0.5) * kr * 0.9, pr = kr * (0.6 + r() * 0.45);
        const g = ctx.createRadialGradient(kx + ox, ky + oy - pr * 0.5, pr * 0.1, kx + ox, ky + oy, pr);
        g.addColorStop(0, rgba(mix(mix(P.popcorn, P.screen, 0.2), P.black, 0.25 - lit * 0.2)));
        g.addColorStop(0.6, rgba(mix(P.popcorn, P.black, 0.6 - lit * 0.25)));
        g.addColorStop(1, rgba(mix(P.popcorn, P.black, 0.88)));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(kx + ox, ky + oy, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    /* shadow where the heap meets the rim */
    const sg = ctx.createLinearGradient(0, top - unit * 0.04, 0, top + unit * 0.05);
    sg.addColorStop(0, rgba(P.black, 0));
    sg.addColorStop(1, rgba(P.black, 0.5));
    ctx.fillStyle = sg;
    ctx.fillRect(cx - wTop / 2, top - unit * 0.04, wTop, unit * 0.09);
  }

  /* soda in the armrest cupholder, bottom right */
  {
    const cx = W * 0.84, wTop = unit * 0.5, wBot = unit * 0.4, top = H - unit * 0.95, bottom = H + unit * 0.2;
    /* armrest under the cup */
    const ay = H - unit * 0.2;
    const ag = ctx.createLinearGradient(0, ay, 0, H);
    ag.addColorStop(0, rgba(mix(P.seat, P.screen, 0.06)));
    ag.addColorStop(0.1, rgba(P.seat));
    ag.addColorStop(1, rgba(P.black));
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.roundRect(cx - unit * 0.42, ay, unit * 0.84, unit * 0.5, unit * 0.08);
    ctx.fill();
    ctx.fillStyle = rgba(P.black, 0.9);
    ctx.beginPath();
    ctx.ellipse(cx, ay + unit * 0.06, wBot * 0.62, unit * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    /* the cup */
    const body = tub(cx, top, wTop, wBot, bottom);
    ctx.save();
    ctx.clip(body);
    ctx.fillStyle = rgba(P.snackRed);
    ctx.fillRect(cx - wTop, top, wTop * 2, bottom - top);
    /* a white wave band across the cup */
    ctx.fillStyle = rgba(P.screen, 0.9);
    ctx.beginPath();
    ctx.moveTo(cx - wTop, top + unit * 0.3);
    ctx.bezierCurveTo(cx - wTop * 0.2, top + unit * 0.18, cx + wTop * 0.2, top + unit * 0.42, cx + wTop, top + unit * 0.26);
    ctx.lineTo(cx + wTop, top + unit * 0.36);
    ctx.bezierCurveTo(cx + wTop * 0.2, top + unit * 0.52, cx - wTop * 0.2, top + unit * 0.28, cx - wTop, top + unit * 0.4);
    ctx.closePath();
    ctx.fill();
    shadeBody(ctx, P, cx, top, wTop, bottom);
    /* condensation glints */
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = rgba(P.screen, 0.12 + r() * 0.2);
      ctx.beginPath();
      ctx.arc(cx + (r() - 0.5) * wTop * 0.8, top + unit * (0.1 + r() * 0.5), unit * (0.004 + r() * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    /* lid, domed, with its rim catching the screen */
    const lidY = top, lw = wTop * 1.04;
    ctx.fillStyle = rgba(mix(P.screen, P.black, 0.5));
    ctx.beginPath();
    ctx.ellipse(cx, lidY, lw / 2, unit * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(mix(P.screen, P.black, 0.62));
    ctx.beginPath();
    ctx.ellipse(cx, lidY - unit * 0.025, lw * 0.42, unit * 0.04, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(P.screen, 0.45);
    ctx.lineWidth = Math.max(1, unit * 0.008);
    ctx.beginPath();
    ctx.ellipse(cx, lidY, lw / 2, unit * 0.045, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    /* straw, angled back toward the screen */
    const sx0 = cx + wTop * 0.08, sy0 = lidY - unit * 0.04, sx1 = cx + wTop * 0.28, sy1 = lidY - unit * 0.5, sw = unit * 0.045;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(mix(P.screen, P.black, 0.35));
    ctx.lineWidth = sw;
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();
    /* red stripe spiralling up the straw */
    ctx.strokeStyle = rgba(mix(P.snackRed, P.black, 0.3));
    ctx.lineWidth = sw * 0.35;
    ctx.setLineDash([sw * 0.6, sw * 0.9]);
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = rgba(P.screen, 0.35);
    ctx.lineWidth = Math.max(1, sw * 0.18);
    ctx.beginPath();
    ctx.moveTo(sx0 - sw * 0.3, sy0);
    ctx.lineTo(sx1 - sw * 0.3, sy1);
    ctx.stroke();
    ctx.restore();
  }
}
