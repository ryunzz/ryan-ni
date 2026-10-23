import type { Metadata } from "next";
import s from "../suite.module.css";

export const metadata: Metadata = { title: "Privacy policy", description: "What the ryunzz.tech apps read from Google, what they keep, and how to remove it.", alternates: { canonical: "/privacy" } };

const mail = "ryan.alexander.ni@gmail.com";

export default function Privacy() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className={s.date}>Last updated October 23, 2026</p>
      <p>This policy covers the apps at ryunzz.tech (Optimal, Food and Meet; see <a href="/apps">the app list</a>), run by Ryan Ni. They share one sign-in.</p>

      <h2>Signing in with Google</h2>
      <p>When you sign in, the apps receive your Google account&apos;s name, email address and profile picture, and use them only to identify your account. Your session is a cookie on ryunzz.tech, so one sign-in works across the apps.</p>

      <h2>Google Calendar (Optimal)</h2>
      <p>If you connect your calendar in Optimal, it asks for read-only access (<code>calendar.readonly</code>) and reads the titles, times and locations of events on the calendars you have turned on, for the week you are viewing. It uses them only to show you your own plan for the week. Events are not stored after your plan is built.</p>
      <p>Optimal writes to Google Calendar only if you click <strong>Add to Google Calendar</strong>. It then asks for permission to create and manage calendars it creates (<code>calendar.app.created</code>), makes one separate calendar named &quot;Optimal&quot;, and copies that week&apos;s planned blocks into it as free time, replacing its own earlier copy of the same week. It cannot see, change or delete events in your other calendars, and you can hide or delete the Optimal calendar at any time.</p>
      <p>Optimal stores an encrypted refresh token so it can read your calendar without asking you to sign in every time, your planner settings, and, for event titles it can&apos;t place on its own, the lowercased title and the category it was sorted into.</p>

      <h2>Food and Meet</h2>
      <p>Food stores the events you save, a private link for your calendar feed, any mailing lists you subscribe to, and bug reports you send. Meet doesn&apos;t ask guests to sign in: it stores the name, email and note you enter when you book, and adds the meeting to Ryan&apos;s own calendar with an invitation to you.</p>

      <h2>AI processing</h2>
      <p>Plain-English settings changes in Optimal, and event titles it can&apos;t categorize, are processed by a language model running on hardware operated by Ryan Ni. They are not sent to third-party AI providers or used to train models.</p>

      <h2>Sharing</h2>
      <p>Your data is not sold, rented, shared or used for advertising. It is processed only by the services that run the apps: Vercel (hosting), Supabase (database and sign-in) and Google (sign-in and calendar access).</p>

      <h2>Google API Services User Data Policy</h2>
      <p>The ryunzz.tech apps&apos; use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements. Google user data is used only to provide the features you see, is not transferred to others except as needed for those features, for security or to comply with the law, and is not read by people unless you ask for help with your account.</p>

      <h2>Removing your data</h2>
      <ul>
        <li>In Optimal, <strong>Disconnect Google Calendar</strong> deletes the stored token and revokes access.</li>
        <li>You can revoke access any time at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.</li>
        <li>To delete your account and all data from every app, email <a href={`mailto:${mail}`}>{mail}</a> from the address you signed in with. It is deleted within 30 days.</li>
      </ul>

      <h2>Security</h2>
      <p>All traffic uses HTTPS, database access is limited to your own rows, and tokens are encrypted at rest.</p>

      <h2>Changes and contact</h2>
      <p>If this policy changes, the date above changes with it. Questions: <a href={`mailto:${mail}`}>{mail}</a>.</p>
    </>
  );
}
