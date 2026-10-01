import type { Ref } from "react";
import { reel } from "@/store/session";
import s from "./TitleCard.module.css";

/** the credit block on the lit screen: the title types out, then WRITTEN AND DIRECTED BY and the name appear.
 * Every character is laid out from the start (hidden until typed), so typing never shifts layout. */
export function TitleCard({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const { title, credit, director } = reel.about.titleCard;
  return (
    <div ref={ref} className={s.credits}>
      <h1 className={s.t} aria-label={title}>
        {[...title].map((ch, i) => (
          <span key={i} className={s.ch} data-ch aria-hidden="true">{ch}</span>
        ))}
      </h1>
      <div className={s.r} data-credit>{credit}</div>
      <div className={s.n} data-credit>{director}</div>
    </div>
  );
}

export { s as titleStyles };
