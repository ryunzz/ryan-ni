"use client";
/* First paint loads the index and posters only. A project's full video loads when it is opened;
 * hovering its folder starts fetching it. */
import type { Project } from "@/lib/types";
import { mediaUrl } from "@/lib/media";
import { image } from "./render";

const warm = new Map<string, HTMLVideoElement>();

export function prefetchProject(p: Project, mobile = false) {
  if (p.media.poster) image(p.media.poster);
  const src = mediaUrl(mobile ? p.media.preview ?? p.media.video : p.media.video);
  if (!src || warm.has(src)) return;
  const v = document.createElement("video");
  v.muted = true;
  v.preload = "auto";
  v.crossOrigin = "anonymous";
  v.src = src;
  warm.set(src, v);
  if (warm.size > 3) {
    const [k, old] = warm.entries().next().value!;
    old.removeAttribute("src");
    old.load();
    warm.delete(k);
  }
}

export function preloadPosters(projects: Project[]) {
  for (const p of projects) if (p.media.poster) image(p.media.poster);
}

/** resolves when a URL has loaded (or failed), so the theater can wait on the first project */
export function preloadUrl(url: string | undefined, as: "image" | "video"): Promise<void> {
  if (!url) return Promise.resolve();
  return new Promise((res) => {
    if (as === "image") {
      const im = new Image();
      im.onload = im.onerror = () => res();
      im.src = url;
    } else {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      v.oncanplay = v.onerror = () => res();
      v.src = url;
    }
  });
}
