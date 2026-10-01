/** Reel runtime: window.Reel. Vanilla JS, no framework. GSAP (window.gsap) is required only by mountTheater. */
export interface ReelLink { label: string; href: string; }
export interface ReelClip { start: number; end: number; label: string; type: 'video' | 'image' | 'text' | 'fx' | 'audio'; scene?: number; seed?: number; fx?: 'grade' | 'grain'; src?: string; style?: 'lyric'; cue?: 'cursor'; photo?: boolean; }
export interface ReelTrack { id: 'V1' | 'V2' | 'V3' | 'A1' | 'A2' | string; name: string; kind: 'v' | 'a'; clips: ReelClip[]; }
export interface ReelProject { id: string; name: string; year: number; role: string; kind: 'reel' | 'video' | 'images' | 'text'; duration: number; description: string; links?: ReelLink[]; experience?: { label: string; role: string; from: string; to: string; place?: string; summary?: string; bullets?: string[] }[]; tracks?: ReelTrack[]; seed?: number; }
export declare class Session {
  constructor(projects?: ReelProject[]);
  projects: ReelProject[]; p: ReelProject; t: number; playing: boolean; off: Record<string, boolean>;
  on(fn: (kind: 'time' | 'play' | 'project' | 'tracks' | 'select', s: Session) => void): void;
  seek(t: number): void; step(frames: number): void; setPlaying(v: boolean): void; toggle(): void;
  load(id: string): void; view: 'player' | 'experience'; job: number; setView(v: 'player' | 'experience', job?: number): void; experience(): { label: string; role: string; from: string; to: string; place?: string; summary?: string; bullets?: string[] }[]; toggleTrack(id: string): void; active(trackId: string): ReelClip | null; level(): number;
}
export declare function mountEditor(root: HTMLElement, opts?: { projects?: ReelProject[]; session?: Session; autoplay?: boolean; onEject?: () => void; email?: string; view?: 'player' | 'experience'; socials?: { label: string; href: string }[]; footnote?: string }): { el: HTMLElement; session: Session };
export declare function mountBin(root: HTMLElement, s: Session): HTMLElement;
export declare function mountMonitor(root: HTMLElement, s: Session): HTMLElement;
export declare function mountTimeline(root: HTMLElement, s: Session): HTMLElement;
export declare function mountTransport(root: HTMLElement, s: Session): HTMLElement;
export declare function mountTheater(root: HTMLElement, opts?: { room?: string; seats?: string; screen?: { left: number; top: number; width: number }; gif?: string; title?: string; credit?: string; director?: string; ready?: Promise<unknown>; hold?: number; skipIfSeen?: boolean; mobile?: boolean; projects?: ReelProject[] }): { el: HTMLElement; session: Session; timeline: unknown; enter(): void; replay(): void };
export declare function mountMobile(root: HTMLElement, opts?: { projects?: ReelProject[]; session?: Session; autoplay?: boolean }): { el: HTMLElement; session: Session };
export declare function mountExperience(root: HTMLElement, s: Session): HTMLElement;
export declare function mountFooter(root: HTMLElement, opts: { email?: string; socials?: { label: string; href: string }[]; footnote?: string }): HTMLElement;
export declare const sampleProjects: ReelProject[];
export declare function tc(seconds: number): string;
