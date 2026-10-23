import Link from "next/link";
import s from "./suite.module.css";

export default function SuiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <nav className={s.nav}>
          <Link href="/apps">ryunzz.tech apps</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        {children}
      </main>
    </div>
  );
}
