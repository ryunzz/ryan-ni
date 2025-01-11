import data from "@/data/projects.json";
import { projectSchema } from "@/lib/schemas";
import { ProjectCard } from "./ProjectCard";

interface Props {
  limit?: number;
  type?: string;
}

export default function Projects({ limit, type }: Props) {
  let projects = projectSchema.parse(data).projects;
  
  if (type) {
    projects = projects.filter((project) => project.tags.includes(type));
  }
  
  if (limit) {
    projects = projects.slice(0, limit);
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((project, id) => (
        <ProjectCard key={id} project={project} />
      ))}
    </section>
  );
}
