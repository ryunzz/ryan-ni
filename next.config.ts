import type { NextConfig } from "next";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  agentRules: false,
  async redirects() {
    return [
      { source: "/projects", destination: "/", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
    ];
  },
  /* /resume serves the PDF inline; /resume.pdf still works for old links */
  async rewrites() {
    return [{ source: "/resume", destination: "/resume.pdf" }];
  },
  images: mediaBase ? { remotePatterns: [new URL(`${mediaBase.replace(/\/$/, "")}/**`)] } : undefined,
};

export default nextConfig;
