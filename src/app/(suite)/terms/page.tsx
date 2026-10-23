import type { Metadata } from "next";
import s from "../suite.module.css";

export const metadata: Metadata = { title: "Terms of service", description: "Terms for the ryunzz.tech apps.", alternates: { canonical: "/terms" } };

const mail = "ryan.alexander.ni@gmail.com";

export default function Terms() {
  return (
    <>
      <h1>Terms of service</h1>
      <p className={s.date}>Last updated October 23, 2026</p>
      <p>The apps at ryunzz.tech (Optimal, Food and Meet) are free personal projects by Ryan Ni. By using them you agree to these terms.</p>
      <h2>Using the apps</h2>
      <p>You sign in with your Google account and can disconnect or delete your data at any time, as described in the <a href="/privacy">privacy policy</a>. Don&apos;t use the apps to access anyone else&apos;s data or to disrupt them. Optimal&apos;s plans are suggestions; nothing is added to your calendar unless you choose to copy a week into a separate &quot;Optimal&quot; calendar.</p>
      <h2>No warranty</h2>
      <p>The apps are provided as is, without warranties of any kind, and may be unavailable, change or shut down without notice. To the extent the law allows, their developer is not liable for any loss arising from their use.</p>
      <h2>Changes and contact</h2>
      <p>These terms may change; the date above shows when. Questions: <a href={`mailto:${mail}`}>{mail}</a>.</p>
    </>
  );
}
