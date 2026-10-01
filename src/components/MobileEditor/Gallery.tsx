"use client";
/* Projects on phones: a vertical gallery of cards (picture, awards, short description, links). */
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/types";
import { useSession } from "@/store/session";
import { mediaUrl } from "@/lib/media";
import { drawPoster, onImageLoad } from "@/lib/reel/render";
import { Rich } from "@/lib/reel/rich";
import { short } from "@/lib/reel/util";
import { Award } from "../Award";
import { Icon } from "../Icon";
import { LinkChips } from "../Links";
import { RawImg } from "../RawImg";
import s from "./Gallery.module.css";

function Poster({ p }: { p: Project }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const src = mediaUrl(p.media.poster);
  useEffect(() => {
    if (src) return;
    const draw = () => { const ctx = ref.current?.getContext("2d"); if (ctx) drawPoster(ctx, 640, 360, p); };
    draw();
    return onImageLoad(draw);
  }, [p, src]);
  return src ? <RawImg className={s.img} src={src} loading="lazy" /> : <canvas ref={ref} className={s.img} width={640} height={360} aria-hidden="true" />;
}

export function Gallery({ projects, onPlay }: { projects: Project[]; onPlay: (p: Project) => void }) {
  const current = useSession((st) => st.p);
  return (
    <div className={s.gallery}>
      {projects.map((p) => (
        <article key={p.id} className={s.card} aria-current={p === current ? "true" : undefined}>
          <button type="button" className={s.pic} onClick={() => onPlay(p)} aria-label={`Play ${p.name}`}>
            <Poster p={p} />
            <span className={s.play}><Icon name="play" /></span>
            <span className={s.dur}>{short(p.duration)}</span>
          </button>
          <div className={s.head}>
            <h3>{p.name}</h3>
            <span className={s.type}>{p.type}</span>
          </div>
          {p.awards.length > 0 && <div className={s.awards}>{p.awards.map((w) => <Award key={w} w={w} chip />)}</div>}
          <p className={s.desc}><Rich text={p.description} /></p>
          <LinkChips links={p.links} />
        </article>
      ))}
    </div>
  );
}
