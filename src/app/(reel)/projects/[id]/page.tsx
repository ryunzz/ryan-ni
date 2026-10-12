import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crawl, ProjectText } from "@/components/Crawl";
import { blurb, pageMeta, work } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = work.find((q) => q.id === id);
  return p ? pageMeta(p.name, blurb(p), `/projects/${p.id}`) : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = work.find((q) => q.id === id);
  if (!p) notFound();
  return <Crawl><ProjectText p={p} /></Crawl>;
}
