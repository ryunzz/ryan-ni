/* Data shapes, ported from design/reel/components/index.d.ts and the README "Project data folder". */

export type ClipType = "video" | "image" | "text" | "fx" | "audio";
export type TrackId = "V3" | "V2" | "V1" | "A1" | "A2";
export type ProjectType = "PROF" | "SW/AI" | "HW/EE";
export type ProjectKind = "reel" | "video" | "images" | "text";
export type IconName = "github" | "linkedin" | "x" | "youtube" | "email" | "resume" | "web";

export interface StackPhoto {
  label: string;
  scene: number;
  /** seconds after the clip starts that this photo lands (default k * 0.9) */
  at?: number;
  src?: string;
}

export interface Clip {
  start: number;
  end: number;
  label: string;
  type: ClipType;
  scene?: number;
  seed?: number;
  fx?: "grade" | "grain";
  /** media URL (resolved at build time from content/media) */
  src?: string;
  /** seconds into the source file at clip start */
  in?: number;
  style?: "lyric";
  cue?: "cursor";
  photo?: boolean;
  stack?: StackPhoto[];
}

export interface Track {
  id: TrackId;
  name: string;
  kind: "v" | "a";
  clips: Clip[];
}

export interface Link {
  label: string;
  href?: string;
  icon?: IconName;
  word?: boolean;
}

export interface Program {
  name: string;
  from: number;
  to: number;
  text: string;
}

export interface Job {
  label: string;
  file: string;
  role: string;
  from: number;
  to: number;
  place?: string;
  summary?: string;
  bullets?: string[];
  programs?: Program[];
  links?: Link[];
}

export interface ProjectMedia {
  poster?: string;
  preview?: string;
  video?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  type: ProjectType;
  /** bin section: TECHNICAL PROJECTS or PERSONAL PROJECTS */
  section: "technical" | "personal";
  /** shown after the name in the info pane, e.g. "18x Hackathon Winner" */
  tagline?: string;
  awards: string[];
  year?: number;
  role: string;
  kind: ProjectKind;
  duration: number;
  seed: number;
  description: string;
  links: Link[];
  media: ProjectMedia;
  experience?: Job[];
  tracks: Track[];
}

export interface Contact {
  email: string;
  blurb: string;
  links: Link[];
}

export interface TheaterPhoto {
  room?: string;
  seats?: string;
  screen?: { left: number; top: number; width: number };
  loop?: string;
}

export interface About {
  wordmark: string;
  titleCard: { title: string; credit: string; director: string };
  theater: TheaterPhoto;
  contact: Contact;
}

export interface ReelIndex {
  about: About;
  projects: Project[];
}
