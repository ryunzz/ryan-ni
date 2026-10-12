import { Crawl, JobList } from "@/components/Crawl";
import { jobs, pageMeta } from "@/lib/content";

export const metadata = pageMeta("Experience", `Ryan Ni's experience: ${jobs.map((x) => `${x.role} at ${x.label}`).join(", ")}.`, "/experience");

export default function ExperiencePage() {
  return (
    <Crawl>
      <h1>Experience</h1>
      <JobList />
    </Crawl>
  );
}
