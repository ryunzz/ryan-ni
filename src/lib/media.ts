/* Media lives on Cloudflare R2 (NEXT_PUBLIC_MEDIA_BASE, e.g. https://media.ryunzz.tech); locally /media -> content/media. */
const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "/media").replace(/\/$/, "");

export function mediaUrl(src?: string) {
  if (!src) return undefined;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `${BASE}/${src.split("/").map(encodeURIComponent).join("/")}`;
}
