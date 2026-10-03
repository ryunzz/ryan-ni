import { reel } from "@/store/session";
import { EmailButton, TextLink } from "../Links";
import s from "./Footer.module.css";

/** the status-bar footer: email (copies), GitHub, LinkedIn, X, YouTube as plain text links, copyright right */
export function Footer() {
  const { links } = reel.about.contact;
  return (
    <footer className={s.footer} data-panel>
      <span className={s.fl}>
        <EmailButton className={s.mail} />
        {links.map((l) => <TextLink key={l.label} l={l} className={s.a} />)}
      </span>
      <span className={s.fr}>{`© ${new Date().getFullYear()} Ryan Ni`}</span>
    </footer>
  );
}
