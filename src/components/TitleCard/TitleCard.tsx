import { Fragment, type Ref } from "react";
import { reel } from "@/store/session";
import s from "./TitleCard.module.css";

/** the credit block on the lit screen: the title types out, then WRITTEN AND DIRECTED BY, the name and the tagline appear.
 * Every character is laid out from the start (hidden until typed), so typing never shifts layout. */
export function TitleCard({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const { title, credit, director, tagline } = reel.about.titleCard;
  return (
    <div ref={ref} className={s.credits}>
      <h1 className={s.t} aria-label={title}>
        {[...title].map((ch, i) => (
          <span key={i} className={s.ch} data-ch aria-hidden="true">{ch}</span>
        ))}
      </h1>
      <div className={s.r} data-credit>{credit}</div>
      <div className={s.n} data-credit>{director}</div>
      {/* each " · " part stays whole and keeps its dot, so a narrow screen wraps between parts, never inside one */}
      {tagline && (
        <div className={s.g} data-credit>
          {tagline.split(" · ").map((part, i, all) => (
            <Fragment key={i}><span>{part}{i < all.length - 1 && "\u00a0·"}</span>{i < all.length - 1 && " "}</Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export { s as titleStyles };
