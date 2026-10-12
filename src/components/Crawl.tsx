/* Plain text of each route for search engines and screen readers; the Reel is the visual version. */
import Link from "next/link";
import type { Job, Project } from "@/lib/types";
import { blurb, content, jobs, work } from "@/lib/content";
import { years } from "@/lib/reel/util";

function JobItem({ x }: { x: Job }) {
  return (
    <li>
      <h3>{`${x.label}, ${x.role}`}</h3>
      <p>{`${years(x)}${x.place ? `, ${x.place}` : ""}`}</p>
      {x.summary && <p>{x.summary}</p>}
      {x.bullets && <ul>{x.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
      {x.programs && <ul>{x.programs.map((pg) => <li key={pg.name}>{`${pg.name} (${years(pg)}): ${pg.text}`}</li>)}</ul>}
    </li>
  );
}

export function ProjectList() {
  return (
    <ul>
      {work.map((q) => (
        <li key={q.id}><Link href={`/projects/${q.id}`}>{q.name}</Link>{`: ${blurb(q)}`}</li>
      ))}
    </ul>
  );
}

export function JobList() {
  return <ul>{jobs.map((x) => <JobItem key={x.file} x={x} />)}</ul>;
}

export function ContactText() {
  const c = content.about.contact;
  return (
    <>
      <p>{c.blurb}</p>
      <ul>
        {c.booking && <li><a href={c.booking.href}>{c.booking.label}</a></li>}
        <li><a href={`mailto:${c.email}`}>{c.email}</a></li>
        {c.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}
        <li><a href="/resume">Resume</a></li>
      </ul>
    </>
  );
}

export function ProjectText({ p }: { p: Project }) {
  return (
    <>
      <h1>{p.name}</h1>
      {p.awards.length > 0 && <ul>{p.awards.map((w) => <li key={w}>{w}</li>)}</ul>}
      <p>{blurb(p)}</p>
      {p.links.length > 0 && <ul>{p.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>}
    </>
  );
}

export function Crawl({ children }: { children: React.ReactNode }) {
  return (
    <article className="crawl">
      {children}
      <nav aria-label="Pages">
        <Link href="/">Ryan Ni</Link> <Link href="/experience">Experience</Link> <Link href="/contact">Contact</Link> <a href="/resume">Resume</a>
      </nav>
    </article>
  );
}
