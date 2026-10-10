import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ryunzz.tech", changeFrequency: "monthly", priority: 1 },
    { url: "https://ryunzz.tech/resume", changeFrequency: "monthly", priority: 0.8 },
  ];
}
