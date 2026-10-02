/* Renders the 3D snacks off the main thread (OffscreenCanvas + WebGL) and sends back a bitmap. */
import { renderSnacks, softwareGL, type SnackColors } from "./snacks3d";

interface Job { w: number; h: number; ratio: number; colors: SnackColors }

self.onmessage = (e: MessageEvent<Job>) => {
  const { w, h, ratio, colors } = e.data;
  try {
    if (softwareGL()) return (self as unknown as Worker).postMessage({ software: true });
    const t0 = performance.now();
    const canvas = new OffscreenCanvas(Math.round(w * ratio), Math.round(h * ratio));
    const bmp = renderSnacks(canvas, w, h, ratio, colors) as ImageBitmap;
    (self as unknown as Worker).postMessage({ bmp, ms: performance.now() - t0 }, [bmp]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ error: String(err) });
  }
};
