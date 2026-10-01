import dynamicIconImports from "lucide-react/dynamicIconImports";
import { z } from "zod";

const iconLink = z.object({
  name: z.string(),
  href: z.string().url(),
  icon: z.custom<keyof typeof dynamicIconImports>(),
});

//exporting a icon w a link obj
export type IconLink = z.infer<typeof iconLink>;

const project = z.object({
  type: z.string().optional(),
  name: z.string(),
  devpost: z.string().url().optional(),
  awarded: z.string().optional(),
  description: z.string(),
  href: z.string().url().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()),
  links: z.array(iconLink),
});
//exporting 1 project
export type Project = z.infer<typeof project>;

//exporting the schema for projects (array of projects)
export const projectSchema = z.object({ projects: z.array(project) });

const experience = z.object({
  name: z.string(),
  href: z.string(),
  title: z.string(),
  logo: z.string(),
  start: z.string().optional(),
  end: z.string().optional(),
  description: z.array(z.string()).optional(),
  links: z.array(iconLink).optional(),
});

//exporting a experience obj, 2 types of experience, career || education
export type Experience = z.infer<typeof experience>;

//exporting the schema for career (array of career experience)
export const careerSchema = z.object({ career: z.array(experience) });

//exporting the schema for career (array of education experience)
export const educationSchema = z.object({ education: z.array(experience) });

//exporting the schema for socials (array of icons w links)
export const socialSchema = z.object({ socials: z.array(iconLink) });