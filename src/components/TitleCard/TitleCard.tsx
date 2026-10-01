import type { Ref } from "react";
import { reel } from "@/store/session";
import s from "./TitleCard.module.css";

/** the credit block on the lit screen: title, WRITTEN AND DIRECTED BY, name */
export function TitleCard({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const { title, credit, director } = reel.about.titleCard;
  return (
    <div ref={ref} className={s.credits}>
      <h1 className={s.t}>{title}</h1>
      <div className={s.r}>{credit}</div>
      <div className={s.n}>{director}</div>
    </div>
  );
}
