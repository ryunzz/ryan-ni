# Reel: handoff to Claude Code + deploy to ryunzz.tech

## 1. Put the design system in your repo

Unzip `reel-handoff.zip` into the root of your portfolio repo so you have:

```
your-repo/
  design/reel/          <- rename reel-design-system/ to this
    README.md           brand book: rules, colors, type, motion, layout, data format
    tokens.json         all tokens (source of truth)
    tokens.css          same tokens as CSS variables
    reference-demo.html open in a browser: the whole working prototype
    components/
      bundle.js         working vanilla JS prototype (theater, editor, timeline, experience, mobile)
      bundle.css        its styles
      index.d.ts        the data shapes and function signatures
      <Component>/README.md + preview.html   per-component rules and live demos
```

Also copy your NEW resume into the repo as `public/resume.pdf` (the zip includes the v3 you shared with me as `resume.pdf`; swap in a newer one if you have it) (the one in the repo now is outdated). The Resume button links to it.

Commit both. Claude Code reads them from there.

## 2. Open Claude Code in the repo and paste this prompt

Start in plan mode (shift+tab twice) so it shows you a plan before writing code.

```
Rebuild my portfolio site as "Reel": a portfolio presented as a film. Act one is a theater loading screen that dollies into the movie screen; act two is a Premiere-style video editor where the project bin, program monitor and timeline ARE the portfolio. Deploy target is Vercel on ryunzz.tech.

SOURCES OF TRUTH (in this order)
1. design/reel/: the design rules (README.md, components/*/README.md), tokens (tokens.json / tokens.css) and the working prototype (components/bundle.js + bundle.css, reference-demo.html). Follow the rules exactly; use the tokens, never hard-coded values; treat the prototype as the behavioral spec, not code to ship.
2. The COPY inside the prototype is final and wins over everything else: the Ryan Ni blurb, intro script lines, experience entries (file names, roles, years, summaries, bullets, UCSD programs), project names, awards ("#1 @ Event" format), TYPE values, contact blurb and links. Port it into content/ verbatim.
3. public/resume.pdf: my current resume. Use it only to fill gaps the prototype does not cover (e.g. project descriptions that are still placeholders).
4. Existing data in this repo is OUTDATED (old resume, old copy). Reuse its media files and links where they still apply; never let its text override (2) or (3). Do not delete it; move it to legacy/ if it is in the way.
The prototype's placeholder-only items (procedural footage, sample photos/b-roll, '#' links) get replaced with real assets when I provide them; until then keep the placeholders working.

First, read all of design/reel, open reference-demo.html, read public/resume.pdf and inventory my repo. Then give me a plan listing: the pages and components you will build, what real media you found, what is still missing (videos, photos, links), and anything in the repo that conflicts with the prototype copy (prototype wins).

STACK
- Next.js (App Router) + TypeScript, deployed on Vercel.
- Port the prototype to React components that mirror the design-system components: TheaterIntro, TitleCard, EditorShell, ProjectBin, ProgramMonitor, Timeline, TrackHeader, Clip, Transport, ExperienceView, Footer, MobileEditor. One Session store (React context or zustand) replaces the prototype's Session class.
- GSAP from npm for the theater timeline (deterministic loading screen, NOT scroll-driven).
- Fonts with next/font/google: Instrument Serif (display), Geist (ui), Geist Mono (mono).
- Brand icons (GitHub, LinkedIn, X, YouTube) from Font Awesome Free brands via @fortawesome/react-fontawesome + @fortawesome/free-brands-svg-icons. Email/resume icons are the prototype's own line icons.
- tokens.css imported globally; component styles as CSS modules using the variables.

DATA
- content/projects/<slug>/project.json per project, plus content/about.json for the Ryan Ni reel, experience and contact. Shapes are in design/reel/components/index.d.ts and README "Project data folder" (fields: id, name, type PROF|SW/AI|HW/EE, awards, kind reel|video|images|text, duration, description with **bold**, links, tracks; experience entries with years only, file name "Company - Role", optional programs).
- A build step (scripts/build-index.ts, run in prebuild) reads all folders and writes one small index.
- Media lives on Cloudflare R2, never in git. Read the base URL from NEXT_PUBLIC_MEDIA_BASE (e.g. https://media.ryunzz.tech). Locally, fall back to /public/media.

BEHAVIOR (match the prototype)
- Loading screen: hold 1.4s, dolly 2.6s, wait until the first project's poster + preview and the fonts are loaded, then cut. "Skip intro" button. Skip act one on repeat visits in the same tab (sessionStorage). prefers-reduced-motion: 0.2s cross-fade.
- Theater: support the layered photo mode (room photo + foreground seats cut-out + screen rectangle); keep the drawn version as fallback until I add photos.
- Program monitor: V1 is a real <video> whose currentTime follows the playhead (seek when paused, resync if drift > 1 frame while playing). Text, lyrics, photos and adjustments are drawn live from JSON on a canvas/DOM layer over it so hiding a track is instant. Each audio track is its own file mixed with Web Audio so mute works.
- Only the selected project's full video loads; hover on a folder prefetches; first paint loads only the index and posters.
- Timeline: drag to scrub, eye/speaker toggles, clips dim at rest and full color only under the playhead, blue "Hide sequence" button, exactly 5 tracks (V3, V2, V1, A1, A2), empty tracks stay as empty lanes.
- Bin: ABOUT header, Ryan Ni folder always open with experience files ("Company - Role", years), PROJECTS header, folders listing their awards, TYPE column.
- Nav: Projects plays the Ryan Ni reel, Experience opens the Experience view, Contact opens it scrolled to the Contact section. Every email control copies the address and shows "Copied!".
- Mobile (< 760px): MobileEditor (CapCut layout) after the loading screen.
- Accessibility: keyboard (Space/K play, arrows step frames), focus rings per README, aria labels on icon buttons.

QUALITY BAR
- Lighthouse performance >= 90 on the editor route on desktop; no layout shift on load.
- Run the dev server and check every view in a browser (desktop 1440x900 and mobile 390x844) before saying you are done; screenshot each.
- Never use em dashes in UI copy.

DEPLOY
- Set up the Vercel project, env vars (NEXT_PUBLIC_MEDIA_BASE), and walk me through adding ryunzz.tech. Do not change DNS yourself; tell me exactly which records to set.
- Write scripts/upload-media.sh that uploads content/media/** to the R2 bucket with wrangler.

Work in small commits on a new branch "reel". Ask me before deleting any existing page or data.
```

## 2b. Let it run until it's live: /goal

After you approve the plan, set a goal so Claude Code keeps working across turns until it's actually done:

```
/goal The Reel site is fully built per design/reel (every component, view and behavior in the prototype, desktop and mobile), `npm run build` passes with no type or lint errors, every view was checked in a browser with screenshots, and it is deployed to production on Vercel and loads at https://ryunzz.tech.
```

Things that still need you, so it will pause and ask:
- **Vercel login / project link** the first time (`vercel login`), or importing the repo at vercel.com/new.
- **DNS**: adding ryunzz.tech in Vercel and setting the records at your registrar. It cannot do this for you.
- **R2 / Cloudflare login** for media uploads.
- **Production deploy approval** if your permission mode asks before running `vercel --prod`.

To cut down on permission prompts during the long build, switch to auto mode (shift+tab cycles modes) if your setup has it, or pre-allow routine commands (npm, git, vercel) in `.claude/settings.json`. Keep deploys and DNS as things you approve. `/goal clear` stops it early.

## 3. Deploy to Vercel on ryunzz.tech

1. Push the `reel` branch to GitHub, open a PR, merge when you're happy with the preview.
2. vercel.com/new: import the repo (framework auto-detects Next.js). Every PR gets a preview URL.
3. Project > Settings > Environment Variables: `NEXT_PUBLIC_MEDIA_BASE = https://media.ryunzz.tech` (or your R2 public URL).
4. Project > Settings > Domains: add `ryunzz.tech` and `www.ryunzz.tech`. Vercel shows the exact DNS records to set (usually an A record for the apex and a CNAME for www). Set them at your domain registrar. If ryunzz.tech currently points at another host, those records replace the old ones; the old site stops serving once DNS updates.
5. HTTPS is issued automatically once DNS resolves.

## 4. Media on Cloudflare R2

1. Cloudflare dashboard > R2 > create bucket `reel-media`.
2. Public access: either enable the `r2.dev` URL, or connect a custom domain `media.ryunzz.tech` (custom domains need the domain's DNS on Cloudflare; if ryunzz.tech DNS is elsewhere, use the r2.dev URL).
3. Add a CORS rule allowing GET and HEAD from `https://ryunzz.tech` and `https://*.vercel.app` (needed for video range requests and canvas use).
4. Encode before uploading: H.264 MP4 1080p ~5 Mbps + a 480p `preview.mp4` + a `poster.avif` per project; photos as AVIF, 2400px long edge.
5. Upload: `npx wrangler r2 object put reel-media/<slug>/video.mp4 --file ./content/media/<slug>/video.mp4` (the script from the prompt does this in bulk).

## 5. Still missing (bring these to Claude Code)

- X and YouTube URLs.
- Real videos/photos per project, the Ryan Ni b-roll, 3 "enjoy" photos (math, poker, film), and music.
- Theater photo layers: an empty theater photo + the front seats cut out as a transparent PNG/WebP, plus the color-graded GIF/MP4 for the screen.
- One-line descriptions for Fire Orca, Cortex, Iris / LinguaLens, PowerTag (your repo/new resume may already have these).
