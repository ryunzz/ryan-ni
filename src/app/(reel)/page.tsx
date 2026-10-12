import { Crawl, ContactText, JobList, ProjectList } from "@/components/Crawl";
import { me } from "@/lib/content";
import { plain } from "@/lib/reel/util";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <Crawl>
      <h1>Ryan Ni</h1>
      {me && <p>{plain(me.description)}</p>}
      <h2>Projects</h2>
      <ProjectList />
      <h2>Experience</h2>
      <JobList />
      <h2>Contact</h2>
      <ContactText />
    </Crawl>
  );
}
