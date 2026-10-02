/* Your popcorn and soda as real 3D objects (three.js), lit the way a theater lights them: the screen
 * ahead is the key light, so tops and far edges catch it and the sides facing you sit in shadow.
 * Rendered once per size (in a worker when OffscreenCanvas allows, so it never blocks the intro),
 * then the WebGL context is released: nothing renders per frame while the dolly moves the layer.
 * Never imported statically, so three.js stays out of the main bundle. No DOM access in here. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "./util";

/** token colors, read on the main thread and passed in */
export interface SnackColors { red: string; white: string; popcorn: string; screen: string; velvet: string; aisle: string }

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
const makeCanvas = (w: number, h: number): AnyCanvas =>
  typeof document === "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });

/* ---------- textures drawn on canvas ---------- */
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
function canvasTexture(w: number, h: number, paint: (ctx: Ctx2D) => void) {
  const c = makeCanvas(w, h);
  paint(c.getContext("2d") as Ctx2D);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function paperGrain(ctx: Ctx2D, w: number, h: number, a: number) {
  const r = rng(3);
  for (let i = 0; i < w * h * 0.02; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${a * r()})`;
    ctx.fillRect(r() * w, r() * h, 1, 1 + r() * 2);
  }
}

/* ---------- popcorn: each popped kernel is a cluster of lumpy lobes, some with a brown hull ---------- */
function lumpy(g: THREE.BufferGeometry, r: () => number, amount: number) {
  const pos = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  const f = [1 + r() * 3, 1 + r() * 3, 1 + r() * 3], ph = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * f[0] * 3 + ph[0]) * Math.sin(v.y * f[1] * 3 + ph[1]) * Math.sin(v.z * f[2] * 3 + ph[2]);
    v.multiplyScalar(1 + n * amount);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
function paintVertices(g: THREE.BufferGeometry, c: THREE.Color) {
  const n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
function kernelGeometry(seed: number, popcorn: string) {
  const r = rng(seed), parts: THREE.BufferGeometry[] = [];
  const cream = new THREE.Color("#fff1d2"), butter = new THREE.Color(popcorn), hull = new THREE.Color("#6e4120");
  const lobes = 3 + Math.floor(r() * 4);
  for (let i = 0; i < lobes; i++) {
    const g = lumpy(new THREE.IcosahedronGeometry(0.42 + r() * 0.34, 2), r, 0.1);
    const dir = new THREE.Vector3(r() * 2 - 1, (r() * 2 - 1) * 0.7, r() * 2 - 1).normalize().multiplyScalar(0.32 + r() * 0.3);
    g.scale(1, 0.85 + r() * 0.25, 1);
    g.translate(dir.x, dir.y, dir.z);
    parts.push(paintVertices(g, cream.clone().lerp(butter, 0.15 + r() * 0.6)));
  }
  if (r() < 0.55) {
    /* the hull: a small dark flake tucked between the lobes */
    const h = new THREE.IcosahedronGeometry(0.22, 1);
    h.scale(1, 0.35, 0.8);
    h.rotateZ(r() * 3);
    const d = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(0.45);
    h.translate(d.x, d.y, d.z);
    h.computeVertexNormals();
    parts.push(paintVertices(h, hull.clone().lerp(butter, r() * 0.3)));
  }
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("kernel merge failed");
  return merged;
}

/** flared paper tub in "rim diameter = 1" units: rim at y = 0, body running down out of frame.
 * 16 red stripes stand proud of the white board; a printed label faces you. */
function popcornBucket(red: string, white: string, popcorn: string) {
  const root = new THREE.Group();
  const STRIPES = 32, SEGS = STRIPES * 6, H = 1.7;
  /* board print: stripes aligned with the raised geometry, plus a label on the front */
  const print = canvasTexture(2048, 1024, (ctx) => {
    for (let k = 0; k < STRIPES; k++) {
      ctx.fillStyle = k % 2 ? red : white;
      ctx.fillRect((k / STRIPES) * 2048, 0, 2048 / STRIPES + 1, 1024);
    }
    /* label: a white roundel near the top of the front (u = 0.5) */
    const cx = 1024, cy = 175, rw = 190, rh = 95;
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = red;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw - 18, rh - 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = red;
    ctx.font = "italic 700 70px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Popcorn", cx, cy + 4);
    paperGrain(ctx, 2048, 1024, 0.06);
  });
  /* raised stripes: red bands sit a little proud of the white board */
  const geo = new THREE.CylinderGeometry(0.5, 0.33, H, SEGS, 8, true, Math.PI, Math.PI * 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const u = (((Math.atan2(x, z) - Math.PI) / (Math.PI * 2)) % 1 + 1) % 1;
    const k = Math.floor(u * STRIPES + 1e-6) % STRIPES;
    const y = pos.getY(i), labelled = Math.abs(u - 0.5) < 0.1 && y > H / 2 - 0.42;
    if (k % 2 && !labelled) pos.setXYZ(i, x * 1.018, y, z * 1.018);
  }
  geo.computeVertexNormals();
  const board = new THREE.MeshStandardMaterial({ map: print, roughness: 0.62, metalness: 0 });
  const outer = new THREE.Mesh(geo, board);
  outer.position.y = -H / 2;
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.49, 0.32, H, 96, 1, true),
    new THREE.MeshStandardMaterial({ color: "#efe6d6", roughness: 0.85, side: THREE.BackSide }),
  );
  inner.position.y = -H / 2;
  /* rolled rim */
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.022, 16, 160), new THREE.MeshStandardMaterial({ color: white, roughness: 0.55 }));
  rim.rotation.x = Math.PI / 2;
  for (const m of [outer, inner, rim]) { m.castShadow = true; m.receiveShadow = true; }
  root.add(outer, inner, rim);

  /* the heap: kernels piled high over the rim, a few spilling over the front edge */
  const r = rng(41), N = 300, variants = 6;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.58, metalness: 0 });
  const meshes = Array.from({ length: variants }, (_, k) => {
    const m = new THREE.InstancedMesh(kernelGeometry(200 + k * 31, popcorn), mat, Math.ceil(N / variants) + 4);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  });
  const counts = new Array(variants).fill(0);
  const o = new THREE.Object3D(), tint = new THREE.Color();
  const put = (x: number, y: number, z: number, s: number) => {
    o.position.set(x, y, z);
    o.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3);
    o.scale.setScalar(s);
    o.updateMatrix();
    const k = Math.floor(r() * variants), m = meshes[k];
    if (counts[k] >= m.instanceMatrix.count) return;
    m.setMatrixAt(counts[k], o.matrix);
    m.setColorAt(counts[k], tint.setScalar(0.85 + r() * 0.15));
    counts[k]++;
  };
  for (let i = 0; i < N; i++) {
    const rad = 0.52 * Math.sqrt(r()), ang = r() * Math.PI * 2;
    const surface = 0.36 * (1 - Math.pow(rad / 0.56, 2));
    put(Math.cos(ang) * rad, Math.max(-0.01, surface - Math.pow(r(), 2) * 0.16), Math.sin(ang) * rad, 0.075 + r() * 0.035);
  }
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 2 + (r() - 0.5) * 1.6;
    put(Math.cos(ang) * (0.5 + r() * 0.05), -0.02 - r() * 0.05, Math.sin(ang) * (0.5 + r() * 0.05), 0.08 + r() * 0.02);
  }
  meshes.forEach((m, k) => { m.count = counts[k]; root.add(m); });
  return root;
}

/** cup in "lid diameter = 1" units: lid at y = 0, body running down out of frame */
function sodaCup(red: string, white: string) {
  const root = new THREE.Group();
  const wrap = canvasTexture(1024, 512, (ctx) => {
    ctx.fillStyle = red;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.moveTo(0, 170);
    for (let x = 0; x <= 1024; x += 16) ctx.lineTo(x, 170 + Math.sin((x / 1024) * Math.PI * 4) * 28);
    for (let x = 1024; x >= 0; x -= 16) ctx.lineTo(x, 230 + Math.sin((x / 1024) * Math.PI * 4 + 0.6) * 28);
    ctx.closePath();
    ctx.fill();
    paperGrain(ctx, 1024, 512, 0.05);
  });
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.47, 0.34, 2.6, 96, 1, true),
    new THREE.MeshPhysicalMaterial({ map: wrap, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
  );
  cup.position.y = -1.3;
  cup.rotation.y = -0.4;
  const plastic = new THREE.MeshPhysicalMaterial({ color: "#e9e5dd", roughness: 0.28, clearcoat: 0.6, transparent: true, opacity: 0.94 });
  const lidRim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.49, 0.06, 96), plastic);
  lidRim.position.y = 0.01;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic);
  dome.scale.y = 0.22;
  dome.position.y = 0.04;
  /* striped straw, tilted back toward the screen */
  const strawTex = canvasTexture(64, 512, (ctx) => {
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, 64, 512);
    ctx.strokeStyle = red;
    ctx.lineWidth = 22;
    for (let y = -64; y < 600; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(64, y + 40); ctx.stroke(); }
  });
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 24), new THREE.MeshStandardMaterial({ map: strawTex, roughness: 0.45 }));
  straw.position.set(0.12, 0.62, -0.08);
  straw.rotation.set(-0.22, 0, -0.2);
  for (const m of [cup, lidRim, dome, straw]) { m.castShadow = true; m.receiveShadow = true; }
  root.add(cup, lidRim, dome, straw);
  return root;
}

/** true when WebGL is a CPU rasterizer (SwiftShader, llvmpipe): too slow for this, so use the 2D drawing */
export function softwareGL() {
  try {
    const c = makeCanvas(1, 1), gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch {
    return true;
  }
}

/**
 * A drop-in popcorn model (public/models/popcorn.glb), normalised to the procedural bucket's frame:
 * centred, 1 unit wide, with the top of the heap at y = 0.22 and the bucket running down out of frame.
 * Resolves null when the file is missing or fails to load (the procedural bucket is used).
 */
async function loadPopcorn(url?: string): Promise<THREE.Object3D | null> {
  if (!url) return null;
  try {
    const gltf = await new GLTFLoader().loadAsync(url);
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
    const s = 1 / Math.max(size.x, size.z, 1e-6);
    model.position.set(-centre.x * s, (0.22 - box.max.y * s), -centre.z * s);
    model.scale.setScalar(s);
    const root = new THREE.Group();
    root.add(model);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    });
    return root;
  } catch {
    return null;
  }
}

/**
 * Renders the snacks for a w x h (CSS px) layer at `ratio` device pixels into `canvas` and returns it.
 * Throws if WebGL is unavailable.
 */
export async function renderSnacks(canvas: AnyCanvas, w: number, h: number, ratio: number, col: SnackColors, popcornUrl?: string) {
  const model = await loadPopcorn(popcornUrl);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(ratio);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const fov = 50, d = 0.7, aspect = w / h;
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.05, 20);
  const hh = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * d, hw = hh * aspect;
  /* same footprint as the 2D layout: sizes follow the shorter side, positions follow the corners */
  const unit = Math.min(h * 0.26, w * 0.3) / h;
  const place = (obj: THREE.Object3D, ndcX: number, topPx: number, widthFrac: number, tilt: number) => {
    obj.scale.setScalar(widthFrac * 2 * hh);
    obj.position.set(ndcX * hw, (1 - 2 * (topPx / h)) * hh, -d);
    obj.rotation.x = tilt;
    scene.add(obj);
  };
  place(model ?? popcornBucket(col.red, col.white, col.popcorn), 2 * 0.16 - 1, h - unit * h * 0.95, unit, 0.32);
  place(sodaCup(col.red, col.white), 2 * 0.84 - 1, h - unit * h * 1.0, unit * 0.5, 0.28);

  /* the screen ahead is the key light; everything else is near-dark */
  const key = new THREE.DirectionalLight(col.screen, 3.6);
  key.position.set(0, 1.4, -4);
  key.target.position.set(0, -0.2, -d);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 1.2, bottom: -1.2, near: 0.5, far: 8 });
  key.shadow.bias = -0.0006;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(col.screen, col.velvet, 0.35));
  scene.add(new THREE.AmbientLight("#2a1c20", 0.6));
  /* faint side rims, as if from the neighbouring aisle lights */
  for (const sx of [-1, 1]) {
    const rimL = new THREE.DirectionalLight(col.aisle, 0.35);
    rimL.position.set(sx * 3, 0.6, -1.5);
    scene.add(rimL);
  }

  /* a soft studio environment for believable sheen on the paper, kernels and plastic, kept dim */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.07;

  renderer.render(scene, camera);
  env.dispose();
  pmrem.dispose();
  /* in a worker, copy the frame into a 2D canvas first: a WebGL OffscreenCanvas can hand back an empty bitmap */
  let out: HTMLCanvasElement | ImageBitmap = canvas as HTMLCanvasElement;
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    const copy = new OffscreenCanvas(canvas.width, canvas.height);
    copy.getContext("2d")!.drawImage(canvas, 0, 0);
    out = copy.transferToImageBitmap();
  }

  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      (mat as THREE.MeshStandardMaterial).map?.dispose();
      mat.dispose();
    }
  });
  renderer.dispose();
  renderer.forceContextLoss();
  return out;
}
