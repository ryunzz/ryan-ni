import { cx } from "@/lib/reel/util";
import { Icon } from "./Icon";
import s from "./Award.module.css";

/** first place is gold; other placements and finalists are silver */
export const awardTier = (w: string) => (/^#1\b/.test(w.trim()) ? "gold" : "silver");
export const awardClass = (w: string) => (awardTier(w) === "gold" ? s.gold : s.silver);

/** award icon + shining label; `chip` is the pill used in the mobile gallery */
export function Award({ w, chip, lit }: { w: string; chip?: boolean; lit?: boolean }) {
  return (
    <span className={cx(s.award, awardClass(w), chip && s.chip, lit && s.on)}>
      <Icon name="award" className={s.icon} />
      <span className={s.shine}>{w}</span>
    </span>
  );
}

export { s as awardStyles };
