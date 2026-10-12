import type { MetadataRoute } from "next";
import { work } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ryunzz.tech", changeFrequency: "monthly", priority: 1 },
    { url: "https://ryunzz.tech/resume", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ryunzz.tech/experience", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://ryunzz.tech/contact", changeFrequency: "yearly", priority: 0.5 },
    ...work.map((p) => ({ url: `https://ryunzz.tech/projects/${p.id}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
