/* Your popcorn and soda as real 3D objects (three.js), lit the way a theater lights them: the screen
 * ahead is the key light, so tops and far edges catch it and the sides facing you sit in shadow.
 * Rendered once per size (in a worker when OffscreenCanvas allows, so it never blocks the intro),
 * then the WebGL context is released: nothing renders per frame while the dolly moves the layer.
 * Never imported statically, so three.js stays out of the main bundle. No DOM access in here. */
import * as THREE from "three";
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

/* ---------- popcorn: lumpy, irregular kernels ---------- */
function kernelGeometry(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const r = rng(seed), pos = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  const bumps = Array.from({ length: 6 }, () => ({
    dir: new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(),
    amp: 0.25 + r() * 0.45,
    sharp: 3 + r() * 5,
  }));
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let k = 0.62;
    for (const b of bumps) k += b.amp * Math.exp(-(1 - v.dot(b.dir)) * b.sharp);
    k += (r() - 0.5) * 0.04;
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y * 0.85, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** bucket in "rim diameter = 1" units: rim at y = 0, body running down */
function popcornBucket(red: string, white: string, popcorn: string) {
  const root = new THREE.Group();
  const stripes = canvasTexture(1024, 32, (ctx) => {
    const n = 14;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? red : white;
      ctx.fillRect((i / n) * 1024, 0, 1024 / n + 1, 32);
    }
    paperGrain(ctx, 1024, 32, 0.08);
  });
  const paper = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.82, metalness: 0 });
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 1.3, 96, 1, true), paper);
  outer.position.y = -0.65;
  outer.rotation.y = 0.12;
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.49, 0.39, 1.28, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: "#3a2c24", roughness: 0.9, side: THREE.BackSide }),
  );
  inner.position.y = -0.65;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.018, 12, 96), new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 }));
  rim.rotation.x = Math.PI / 2;
  for (const m of [outer, inner, rim]) { m.castShadow = true; m.receiveShadow = true; }
  root.add(outer, inner, rim);

  /* the heap: a few hundred kernels filling a dome above the rim, a few spilling over the edge */
  const r = rng(41), N = 360, variants = 4;
  const corn = new THREE.Color(popcorn), hull = new THREE.Color("#8a5a2b"), cream = new THREE.Color("#fff3d6");
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0 });
  const meshes = Array.from({ length: variants }, (_, k) => {
    const m = new THREE.InstancedMesh(kernelGeometry(100 + k * 17), mat, Math.ceil(N / variants));
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  });
  const counts = new Array(variants).fill(0);
  const o = new THREE.Object3D(), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const rad = 0.53 * Math.sqrt(r()), ang = r() * Math.PI * 2;
    const surface = 0.22 * (1 - Math.pow(rad / 0.55, 2));
    const y = Math.max(-0.02, surface - Math.pow(r(), 2.2) * 0.14);
    o.position.set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
    o.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3);
    o.scale.setScalar(0.05 + r() * 0.03);
    o.updateMatrix();
    const k = i % variants, m = meshes[k];
    m.setMatrixAt(counts[k], o.matrix);
    c.copy(corn).lerp(cream, r() * 0.45);
    if (r() < 0.12) c.lerp(hull, 0.5 + r() * 0.3);
    m.setColorAt(counts[k], c);
    counts[k]++;
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
 * Renders the snacks for a w x h (CSS px) layer at `ratio` device pixels into `canvas` and returns it.
 * Throws if WebGL is unavailable.
 */
export function renderSnacks(canvas: AnyCanvas, w: number, h: number, ratio: number, col: SnackColors) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(ratio);
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
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
  place(popcornBucket(col.red, col.white, col.popcorn), 2 * 0.16 - 1, h - unit * h * 0.95, unit, 0.32);
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

  renderer.render(scene, camera);
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
