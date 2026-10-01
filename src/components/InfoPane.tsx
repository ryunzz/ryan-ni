"use client";
import type { Project } from "@/lib/types";
import { Rich } from "@/lib/reel/rich";
import { short, years } from "@/lib/reel/util";
import { AppRow, LinkChips } from "./Links";
import { Icon } from "./Icon";
import { Award } from "./Award";
import s from "./InfoPane.module.css";

/** project-title, role and year (Ryan Ni skips it), description, then app icons (Ryan Ni) or link chips */
export function InfoPane({ p, className, withFiles }: { p: Project; className?: string; withFiles?: boolean }) {
  const apps = p.links.some((l) => l.icon);
  return (
    <div className={`${s.info} ${className ?? ""}`}>
      <h3 className={s.title}>
        {p.name}
        {p.tagline && <><span className={s.bar} aria-hidden="true">|</span><span className={s.tag}>{p.tagline}</span></>}
      </h3>
      {!p.experience && p.awards.length > 0 && <div className={s.awards}>{p.awards.map((w) => <Award key={w} w={w} />)}</div>}
      {!p.experience && <div className={s.meta}>{`${p.awards.length ? "" : `${p.role}  ·  `}${p.year ? `${p.year}  ·  ` : ""}${short(p.duration)}`}</div>}
      {apps && <AppRow links={p.links} top />}
      <p className={s.desc}><Rich text={p.description} /></p>
      {withFiles && p.experience?.map((x) => (
        <div key={x.file} className={s.file}><Icon name="doc" /><span>{x.file}</span><span>{years(x)}</span></div>
      ))}
      {!apps && <LinkChips links={p.links} />}
    </div>
  );
}
