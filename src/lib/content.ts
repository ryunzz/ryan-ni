/* Server-safe view of the generated index, for page metadata and the crawlable text behind the Reel. */
import index from "@/generated/index.json";
import type { Metadata } from "next";
import type { Project, ReelIndex } from "@/lib/types";
import { plain } from "@/lib/reel/util";

export const SITE = "https://ryunzz.tech";
export const content = index as unknown as ReelIndex;
export const me = content.projects.find((p) => p.experience);
export const work = content.projects.filter((p) => !p.experience);
export const jobs = me?.experience ?? [];

/** a project's description, or a fallback while it still holds placeholder copy */
export function blurb(p: Project) {
  if (!/^placeholder/i.test(p.description)) return plain(p.description);
  return [`${p.name}, a project by Ryan Ni.`, ...p.awards].join(" ");
}

/** title, description, canonical URL and link preview for one route (a page's openGraph replaces the root's,
 * so the preview image from app/opengraph-image.jpg is named again here) */
export function pageMeta(title: string | undefined, description: string, path: string): Metadata {
  const t = title ? `${title} · Ryan Ni` : "Ryan Ni";
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { title: t, description, url: `${SITE}${path}`, siteName: "Ryan Ni", type: "website", images: "/opengraph-image.jpg" },
    twitter: { card: "summary_large_image", title: t, description, images: "/twitter-image.jpg" },
  };
}
