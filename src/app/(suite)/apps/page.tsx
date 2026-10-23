import type { Metadata } from "next";
import Link from "next/link";
import s from "../suite.module.css";

export const metadata: Metadata = { title: "ryunzz.tech apps", description: "Small tools by Ryan Ni that share one Google sign-in across ryunzz.tech.", alternates: { canonical: "/apps" } };

export default function Apps() {
  return (
    <>
      <h1>ryunzz.tech apps</h1>
      <p className={s.date}>Small tools by Ryan Ni. One Google sign-in works across all of them.</p>
      <ul className={s.apps}>
        <li><strong><a href="https://optimal.ryunzz.tech">Optimal</a></strong>A weekly planner that reads your Google Calendar (read-only) and plans the open time around your events. It never changes your calendar.</li>
        <li><strong><a href="https://food.ryunzz.tech">Food</a></strong>Upcoming UCSD events with free food, with calendar links, a subscribable feed, and events you can save.</li>
        <li><strong><a href="https://meet.ryunzz.tech">Meet</a></strong>A booking page for scheduling a meeting with Ryan. Guests don&apos;t sign in.</li>
      </ul>
      <p>Signing in uses your Google account&apos;s name, email address and profile picture. See the <Link href="/privacy">privacy policy</Link> for exactly what each app reads and keeps, and the <Link href="/terms">terms of service</Link>.</p>
    </>
  );
}
