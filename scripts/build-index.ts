/*
 * Reads content/projects/<slug>/project.json + content/about.json, wires media dropped into
 * content/media/<slug>/ by file name, and writes src/generated/index.json (+ type.css from tokens.json).
 *
 * content/media is gitignored (media lives on R2). Whenever it exists locally we rescan it and
 * write content/media.manifest.json, which IS committed, so a build without the media folder
 * (Vercel) still knows which files exist on R2.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Clip, Project, Track } from "../src/lib/types";

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const MEDIA = path.join(CONTENT, "media");
const MANIFEST = path.join(CONTENT, "media.manifest.json");
const OUT = path.join(ROOT, "src", "generated");

const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v"];
const IMAGE_EXT = [".avif", ".webp", ".jpg", ".jpeg", ".png", ".gif"];
const AUDIO_EXT = [".m4a", ".mp3", ".aac", ".ogg", ".wav", ".flac"];
const EXT_RANK = [...VIDEO_EXT, ...IMAGE_EXT, ...AUDIO_EXT];

/* ---------- schema ---------- */
const link = z.object({
  label: z.string(),
  href: z.string().optional(),
  icon: z.enum(["github", "linkedin", "x", "youtube", "email", "resume", "web"]).optional(),
  word: z.boolean().optional(),
});
const clip = z.object({
  start: z.number(),
  end: z.number(),
  label: z.string(),
  type: z.enum(["video", "image", "text", "fx", "audio"]),
  scene: z.number().optional(),
  seed: z.number().optional(),
  fx: z.enum(["grade", "grain"]).optional(),
  src: z.string().optional(),
  in: z.number().optional(),
  style: z.literal("lyric").optional(),
  cue: z.literal("cursor").optional(),
  photo: z.boolean().optional(),
  stack: z.array(z.object({ label: z.string(), scene: z.number(), at: z.number().optional(), src: z.string().optional() })).optional(),
});
const track = z.object({
  id: z.enum(["V3", "V2", "V1", "A1", "A2"]),
  name: z.string(),
  kind: z.enum(["v", "a"]),
  clips: z.array(clip),
});
const yearsRange = { from: z.number().int(), to: z.number().int() };
const project = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  type: z.enum(["PROF", "SW/AI", "HW/EE"]),
  section: z.enum(["technical", "personal"]).default("technical"),
  tagline: z.string().optional(),
  awards: z.array(z.string()).default([]),
  year: z.number().int().optional(),
  role: z.string(),
  kind: z.enum(["reel", "video", "images", "text"]),
  duration: z.number().positive(),
  seed: z.number().default(1),
  description: z.string(),
  links: z.array(link).default([]),
  media: z.object({ poster: z.string(), preview: z.string(), video: z.string() }).partial().default({}),
  experience: z
    .array(
      z.object({
        label: z.string(),
        file: z.string(),
        role: z.string(),
        ...yearsRange,
        place: z.string().optional(),
        summary: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        programs: z.array(z.object({ name: z.string(), ...yearsRange, text: z.string() })).optional(),
        links: z.array(link).optional(),
      }),
    )
    .optional(),
  caption: z.string().optional(),
  music: z.string().optional(),
  tracks: z.array(track).length(5).optional(),
});
const about = z.object({
  wordmark: z.string(),
  titleCard: z.object({ title: z.string(), credit: z.string(), director: z.string() }),
  theater: z
    .object({
      room: z.string().nullish(),
      seats: z.string().nullish(),
      loop: z.string().nullish(),
      screen: z.object({ left: z.number(), top: z.number(), width: z.number() }).nullish(),
    })
    .default({}),
  contact: z.object({ email: z.string().email(), blurb: z.string(), links: z.array(link) }),
});

/* ---------- media manifest ---------- */
type Manifest = Record<string, { files: string[]; durations: Record<string, number> }>;

function walk(dir: string, base = ""): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".")) return [];
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel];
  });
}

/** duration from the mp4 'mvhd' atom; no ffprobe needed */
function mp4Duration(file: string): number | undefined {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const read = (pos: number, len: number) => {
      const b = Buffer.alloc(len);
      fs.readSync(fd, b, 0, len, pos);
      return b;
    };
    const scan = (start: number, end: number): number | undefined => {
      let pos = start;
      while (pos + 8 <= end) {
        const h = read(pos, 16);
        let len = h.readUInt32BE(0);
        const type = h.toString("latin1", 4, 8);
        let hdr = 8;
        if (len === 1) {
          len = Number(h.readBigUInt64BE(8));
          hdr = 16;
        } else if (len === 0) len = end - pos;
        if (len < 8) return undefined;
        if (type === "moov") return scan(pos + hdr, pos + len);
        if (type === "mvhd") {
          const b = read(pos + hdr, 32);
          return b[0] === 1
            ? Number(b.readBigUInt64BE(24)) / b.readUInt32BE(20)
            : b.readUInt32BE(16) / b.readUInt32BE(12);
        }
        pos += len;
      }
      return undefined;
    };
    return scan(0, size);
  } catch {
    return undefined;
  } finally {
    fs.closeSync(fd);
  }
}

function loadManifest(): Manifest {
  if (!fs.existsSync(MEDIA)) {
    return fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  }
  const m: Manifest = {};
  for (const d of fs.readdirSync(MEDIA, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const files = walk(path.join(MEDIA, d.name)).filter((f) => EXT_RANK.includes(path.extname(f).toLowerCase())).sort();
    const durations: Record<string, number> = {};
    for (const f of files) {
      if ([".mp4", ".m4v", ".mov"].includes(path.extname(f).toLowerCase())) {
        const s = mp4Duration(path.join(MEDIA, d.name, f));
        if (s) durations[f] = Math.round(s * 1000) / 1000;
      }
    }
    m[d.name] = { files, durations };
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
  return m;
}

/* ---------- tracks (port of buildTracks in design/reel/components/bundle.js) ---------- */
const SCENES = 6;
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pad = (n: number) => (n < 10 ? "0" : "") + n;

function buildTracks(p: z.infer<typeof project>, stills: string[], video?: string): Track[] {
  const d = p.duration;
  const r = rng(p.seed);
  const v1: Clip[] = [], v2: Clip[] = [], v3: Clip[] = [], a1: Clip[] = [], a2: Clip[] = [];
  if (p.kind === "text") {
    v1.push({ start: 0, end: d, label: "readme.md", type: "text", scene: 0 });
  } else if (video) {
    v1.push({ start: 0, end: d, label: path.basename(video), type: "video", src: video, in: 0, scene: 0, seed: p.seed });
  } else if (p.kind === "images" && stills.length) {
    const each = stills.length === 1 ? d : d / stills.length;
    stills.forEach((s, i) =>
      v1.push({ start: i * each, end: (i + 1) * each, label: path.basename(s), type: "image", src: s, scene: i % SCENES, seed: p.seed + i * 97 }),
    );
  } else {
    let t = 0;
    let i = 1;
    const shot = p.kind === "images" ? 4 : 0;
    while (t < d - 0.5) {
      const len = shot || 3.5 + r() * 5;
      const e = Math.min(d, t + len);
      const img = p.kind === "images";
      v1.push({ start: t, end: e, label: (img ? "still_" : "shot_") + pad(i) + (img ? ".jpg" : ".mov"), type: img ? "image" : "video", scene: Math.floor(r() * SCENES), seed: Math.floor(r() * 1e6) });
      t = e;
      i++;
    }
  }
  v3.push({ start: 0.4, end: 4.2, label: p.name, type: "text" });
  if (p.kind !== "text") v3.push({ start: d - 5, end: d - 0.4, label: p.caption || "Directed by Ryan Ni", type: "text" });
  if (p.kind === "video") {
    v2.push({ start: 0, end: d * 0.55, label: "Grade", type: "fx", fx: "grade" });
    v2.push({ start: d * 0.55, end: d, label: "Grain", type: "fx", fx: "grain" });
  }
  if (p.kind === "images") v2.push({ start: 0, end: d, label: "Grain", type: "fx", fx: "grain" });
  if (p.kind === "video") {
    let t = 2;
    while (t < d - 4) {
      const l = 3 + r() * 6;
      a1.push({ start: t, end: Math.min(d - 1, t + l), label: "vo_take" + pad(a1.length + 1) + ".wav", type: "audio", seed: Math.floor(r() * 999) });
      t += l + 1.5 + r() * 3;
    }
  }
  a2.push({ start: 0, end: d, label: p.music || "score.wav", type: "audio", seed: p.seed % 97 });
  return [
    { id: "V3", name: "Titles", kind: "v", clips: v3 },
    { id: "V2", name: "Adjust", kind: "v", clips: v2 },
    { id: "V1", name: p.kind === "images" ? "Stills" : p.kind === "text" ? "Readme" : "Footage", kind: "v", clips: v1 },
    { id: "A1", name: "Voice", kind: "a", clips: a1 },
    { id: "A2", name: "Music", kind: "a", clips: a2 },
  ];
}

/* ---------- wiring ---------- */
const stem = (f: string) => path.basename(f, path.extname(f)).toLowerCase();
const rank = (f: string) => EXT_RANK.indexOf(path.extname(f).toLowerCase());
const isVideo = (f: string) => VIDEO_EXT.includes(path.extname(f).toLowerCase());
const isImage = (f: string) => IMAGE_EXT.includes(path.extname(f).toLowerCase());
const isAudio = (f: string) => AUDIO_EXT.includes(path.extname(f).toLowerCase());

function finder(slug: string, files: string[]) {
  const by = new Map<string, string>();
  for (const f of [...files].sort((a, b) => rank(a) - rank(b))) if (!by.has(stem(f))) by.set(stem(f), f);
  return (name: string, ok: (f: string) => boolean) => {
    const f = by.get(stem(name));
    return f && ok(f) ? `${slug}/${f}` : undefined;
  };
}

function okFor(type: Clip["type"]) {
  return type === "video" ? isVideo : type === "image" ? isImage : type === "audio" ? isAudio : () => false;
}

/* ---------- em dash guard ---------- */
function noEmDash(v: unknown, where: string) {
  if (typeof v === "string" && v.includes("—")) throw new Error(`Em dash in ${where}: "${v}"`);
  if (Array.isArray(v)) v.forEach((x, i) => noEmDash(x, `${where}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) noEmDash(x, `${where}.${k}`);
}

/* ---------- type styles from tokens.json ---------- */
function typeCss() {
  const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "design/reel/tokens.json"), "utf8"));
  const upper = new Set(["credit-label", "panel-title"]);
  const lines: string[] = [];
  for (const g of tokens.type.groups) {
    for (const s of g.styles) {
      const fam = `var(--font-${s.family || g.family})`;
      const style = s.fontStyle === "italic" ? "italic " : "";
      lines.push(`  --type-${s.name}: ${style}${s.fontWeight} ${s.fontSize}/${s.lineHeight} ${fam};`);
      lines.push(`  --tracking-${s.name}: ${s.letterSpacing === "0" ? "0" : s.letterSpacing};`);
      if (upper.has(s.name)) lines.push(`  --case-${s.name}: uppercase;`);
    }
  }
  return `/* generated by scripts/build-index.ts from design/reel/tokens.json; do not edit */\n:root {\n${lines.join("\n")}\n}\n`;
}

/* ---------- main ---------- */
function main() {
  const listed = loadManifest();
  /* media only resolves when there is somewhere to serve it from: the local folder (/media) or R2.
   * Otherwise wire nothing, so the stand-ins draw without requesting files that do not exist. */
  const servable = fs.existsSync(MEDIA) || !!process.env.NEXT_PUBLIC_MEDIA_BASE;
  if (!servable && Object.values(listed).some((m) => m.files.length))
    console.log("reel index: no content/media and no NEXT_PUBLIC_MEDIA_BASE; using stand-ins for all media");
  const manifest: Manifest = servable ? listed : {};
  const aboutRaw = JSON.parse(fs.readFileSync(path.join(CONTENT, "about.json"), "utf8"));
  noEmDash(aboutRaw, "about.json");
  const ab = about.parse(aboutRaw);

  const th = manifest.theater?.files ?? [];
  const findTh = finder("theater", th);
  const theater = {
    room: ab.theater.room ?? findTh("room", isImage),
    seats: ab.theater.seats ?? findTh("seats", isImage),
    loop: ab.theater.loop ?? findTh("loop", (f) => isVideo(f) || isImage(f)),
    screen: ab.theater.screen ?? undefined,
  };

  const dirs = fs.readdirSync(path.join(CONTENT, "projects"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const projects: Project[] = [];
  for (const slug of dirs) {
    const file = path.join(CONTENT, "projects", slug, "project.json");
    if (!fs.existsSync(file)) continue;
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    noEmDash(raw, `${slug}/project.json`);
    const res = project.safeParse(raw);
    if (!res.success) throw new Error(`${slug}/project.json: ${res.error.message}`);
    const p = res.data;
    const m = manifest[slug] ?? { files: [], durations: {} };
    const find = finder(slug, m.files);
    const stills = m.files.filter((f) => f.startsWith("stills/") && isImage(f)).map((f) => `${slug}/${f}`);
    const video = p.media.video ?? find("video", isVideo);
    const media = {
      video,
      preview: p.media.preview ?? find("preview", isVideo),
      poster: p.media.poster ?? find("poster", isImage) ?? stills[0],
    };
    const local = video?.startsWith(`${slug}/`) ? video.slice(slug.length + 1) : undefined;
    const probed = local ? m.durations[local] : undefined;
    if (!p.tracks && probed) p.duration = Math.round(probed * 24) / 24;
    let kind = p.kind;
    if (kind !== "reel" && kind !== "text") kind = video ? "video" : stills.length ? "images" : kind;
    const tracks = (p.tracks as Track[] | undefined) ?? buildTracks({ ...p, kind }, stills, video);
    /* any clip (or stacked photo) whose file name matches a dropped file uses it */
    for (const t of tracks)
      for (const c of t.clips) {
        if (!c.src) {
          const s = find(c.label, okFor(c.type));
          if (s) {
            c.src = s;
            c.in ??= 0;
          }
        }
        if (c.stack) for (const ph of c.stack) ph.src ??= find(ph.label, isImage);
      }
    const { caption: _c, music: _m, tracks: _t, ...rest } = p;
    void _c; void _m; void _t;
    projects.push({ ...rest, kind, slug, media, tracks } as Project);
  }
  if (!projects.length || projects[0].kind !== "reel") throw new Error("The first project must be the Ryan Ni reel (00-ryan-ni).");

  fs.mkdirSync(OUT, { recursive: true });
  /* optional 3D popcorn model (see Room.tsx); only requested when the file exists */
  const popcornModel = fs.existsSync(path.join(ROOT, "public", "models", "popcorn.glb")) ? "/models/popcorn.glb" : undefined;
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ about: { ...ab, theater: { ...theater, popcornModel } }, projects }));
  fs.writeFileSync(path.join(OUT, "type.css"), typeCss());
  const wired = projects.map((p) => `${p.slug}${p.media.video ? " [video]" : ""}${p.media.poster ? " [poster]" : ""}`).join(", ");
  console.log(`reel index: ${projects.length} projects (${wired})`);
}

main();
