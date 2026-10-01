"use client";
/* App icon links (info pane, contact section), link chips, text links and the email copy control. */
import type { MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import type { Link } from "@/lib/types";
import { reel } from "@/store/session";
import { cx } from "@/lib/reel/util";
import { Icon } from "./Icon";
import { copyText, toast } from "./Toast";
import s from "./Links.module.css";

const BRAND = { github: faGithub, linkedin: faLinkedin, x: faXTwitter, youtube: faYoutube } as const;
export const EMAIL = reel.about.contact.email;

const stop = (e: MouseEvent) => e.stopPropagation();

function copyEmail(e: MouseEvent<HTMLElement>) {
  e.stopPropagation();
  const el = e.currentTarget;
  void copyText(EMAIL).then(() => toast("Copied!", el));
}

/** every email control copies the address (never a mailto) */
export function EmailButton({ className, label, children }: { className?: string; label?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={copyEmail} aria-label={`Copy email address ${EMAIL}`} title={`Copy ${EMAIL}`}>
      {children ?? <span>{label ?? EMAIL}</span>}
    </button>
  );
}

function AppIcon({ l }: { l: Link }) {
  if (l.icon === "email")
    return (
      <EmailButton className={s.app}>
        <Icon name="mail" />
        <span className={s.lbl}>{l.label}</span>
      </EmailButton>
    );
  const brand = l.icon && l.icon in BRAND ? BRAND[l.icon as keyof typeof BRAND] : null;
  return (
    <a className={cx(s.app, brand && s.brand)} href={l.href} target="_blank" rel="noopener" aria-label={l.label} title={l.label} onClick={stop}>
      {brand ? <FontAwesomeIcon icon={brand} className={s.fa} /> : <Icon name={l.icon === "web" ? "globe" : "doc"} />}
      <span className={s.lbl}>{l.label}</span>
    </a>
  );
}

/** Resume button first, then app icons. `big` is the Contact section's 44px row. */
export function AppRow({ links, big, top }: { links: Link[]; big?: boolean; top?: boolean }) {
  return (
    <div className={cx(s.apps, big && s.big, top && s.top)}>
      {links.map((l) =>
        l.icon ? (
          <AppIcon key={l.label} l={l} />
        ) : (
          <a key={l.label} className={s.resume} href={l.href} target="_blank" rel="noopener" onClick={stop}>
            <Icon name="doc" />
            <span>{l.label}</span>
          </a>
        ),
      )}
    </div>
  );
}

export function LinkChips({ links }: { links: Link[] }) {
  if (!links.length) return null;
  return (
    <div className={s.links}>
      {links.map((l) => (
        <a key={l.label + l.href} className={s.link} href={l.href} target="_blank" rel="noopener" onClick={stop}>
          <span>{l.label}</span>
          <Icon name="link" />
        </a>
      ))}
    </div>
  );
}

export function TextLink({ l, className }: { l: Link; className?: string }) {
  return (
    <a className={cx(s.tlink, className)} href={l.href} target="_blank" rel="noopener">
      {l.label}
    </a>
  );
}

export { s as linkStyles };
