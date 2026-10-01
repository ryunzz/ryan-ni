import { cx } from "@/lib/reel/util";
import { Icon } from "./Icon";
import s from "./Award.module.css";

/** award icon + shining gold label (every win is gold); `chip` is the pill used in the mobile gallery */
export function Award({ w, chip, lit }: { w: string; chip?: boolean; lit?: boolean }) {
  return (
    <span className={cx(s.award, chip && s.chip, lit && s.on)}>
      <Icon name="award" className={s.icon} />
      <span className={s.shine}>{w}</span>
    </span>
  );
}

export { s as awardStyles };
