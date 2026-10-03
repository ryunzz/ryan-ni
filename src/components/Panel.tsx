import type { ReactNode } from "react";
import { cx } from "@/lib/reel/util";
import s from "./Panel.module.css";

/** a panel with its header bar: "<b>Title:</b> sub" then actions on the right */
export function Panel({ title, sub, actions, className, children, area, label }: {
  title: string; sub?: ReactNode; actions?: ReactNode; className?: string; children: ReactNode; area: string; label?: string;
}) {
  return (
    <section className={cx(s.panel, className)} style={{ gridArea: area }} data-area={area} data-panel aria-label={label ?? title}>
      <div className={s.head}>
        <span className={s.cap}><b>{title}:</b><span>{sub}</span></span>
        <span className={s.spacer} />
        {actions}
      </div>
      {children}
    </section>
  );
}

export { s as panelStyles };
