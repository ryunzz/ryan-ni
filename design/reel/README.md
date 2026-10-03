Reel is Ryan Ni's portfolio told as a film in two acts. **Act one is the loading screen**: the back row of a movie theater, the screen playing a color-graded loop under "Hello, World!" / "Written and Directed by" / "Ryan Ni". It holds, dollies in over the seats and into the screen while the first project loads, then cuts. **Act two** is behind the scenes: a Premiere-style editor (CapCut-style on phones) where the project bin, the program monitor and the timeline are the portfolio itself. The first project is always **Ryan Ni**, a lyric-video introduction.

## Content fundamentals

- **Speak in credits and file names.** Project titles in Title Case (`Orca`, `COSINT`); media in lowercase snake case with an extension (`orca_demo_v3.mov`, `still_02.jpg`); roles as credits (`Founder, CEO`, `Directed by`).
- **Credit roles are uppercase mono** (`credit-label`), names under them are italic serif (`credit-name`). Never the other way round.
- **Descriptions are one or two plain sentences** in `body`, max 60ch. No hype words, no emoji.
- **Numbers are timecode.** Durations and positions are `HH:MM:SS:FF` at 24fps in `timecode`; ruler labels drop to `MM:SS` in `tick`.
- **Nav is workspaces.** The menubar tabs are `Projects`, `Experience`, `Contact`; the right side is the email `rani@ucsd.edu` (mailto). Projects plays the Ryan Ni video; Experience opens the Experience view; Contact opens the same view scrolled to its Contact section (blurb, then icon buttons for Email, GitHub, LinkedIn, X, YouTube, and the address as text).
- **Email is never a mailto.** Every email control (menubar, footer, Contact section) copies `rani@ucsd.edu` to the clipboard and shows a small `Copied!` pill (ink on panel-000) above the button for 1.4s.
- **The footer is the contact strip**: email, GitHub, LinkedIn, X, YouTube as plain text links (no link to the site itself), no icons.
- **Programs light up together**: a role with sub-programs (UCSD: TRELS Candidate, XR Lab, LIL Lab) gets one thin sub-clip per program in the career sequence and one row per program in its card; hovering either lights both, clicking pins it.
- **Experience copy is brief**: one short summary line and one to three short points per role, never a resume dump.
- **Dates are years only**, never months, anywhere (bin, cards, career sequence), so durations are not exact.
- **Icon links**: the Ryan Ni info pane (under the name) and the Contact section use app icons instead of words: GitHub, LinkedIn, X, YouTube from Font Awesome Free brands (the page loads `fontawesome.min.js` and `brands.min.js` from cdnjs; without it the word shows instead), and the Reel line icon for email. `Resume` is a button (outlined in `link`, doc icon plus the word, fills on hover), first in the row. Icons are `link` colored; every one has an aria-label and tooltip.
- Descriptions may use `**bold**` for the key facts (degrees, titles).
- **The title card** reads exactly: "Hello, World!", then `WRITTEN AND DIRECTED BY`, then "Ryan Ni".
- **The intro script** is one lyric clip per line on V3, revealed word by word: "Hey, I'm Ryan Ni!" / "I study Computer Science and Film at UCSD." / "Currently, I do AI research and build things." / "I also enjoy math, playing poker, and making videos." / "Feel free to check out my other projects here!" Keep every line short enough to fit one clip (about 10 words). The line about what you enjoy stacks 3 photos on V2 (one clip with `stack`), each landing about 0.9s after the last, and the line holds about 1.8s after the third photo lands (about 3.75s total).
- **The bin:** an `ABOUT` section header, then the `Ryan Ni` folder (plays the intro), always open, with the experience files inside named `Company - Role` (`Orca - VC Backed Founder`, `Apple - SWE Intern`, `UCSD - Research`, `a16z SR - SWE Intern`) and dated by year only (`2024 - 2025`); then a `PROJECTS` header and one folder per project, each always showing its pedigree (hackathon placements written `#1 @ UIUC (Advanced Track)`, `Top 5 Finalist @ OpenAI Hackathon`, never `#1, UIUC`; award icon) instead of media files; ITEMS counts the awards. The bin's last column is `TYPE`, not year: `PROF` (professional, the Ryan Ni folder), `SW/AI` (software), `HW/EE` (hardware). Clicking a company file opens the Experience view on that job.

## Visual foundations

### Color
- The editor is neutral dark: `panel-000` ground and gutters, `panel-100` panel bodies, `panel-200` headers, ruler and track headers, `panel-300` hover and selection. Separate things with `line` hairlines, not shadows.
- Text: `ink` for primary (selected row, titles, descriptions), `ink-muted` for unselected bin rows, counts and durations, `ink-faint` for meta lines, tick labels and column headers on `panel-000` to `panel-200`. `link` only on links.
- **Attention order: the monitor first, links second, everything else recedes.** The monitor is the only bright, saturated area. In the left column only links use color (`link`). Clips rest in their `-dim` fills; only the clip under the playhead turns full strength (`.live`), so the timeline shows where you are, not everything at once. Audio stays dim even when live; only its waveform lights.
- **`playhead` is the only signal color.** It marks the playhead, the current timecode, the pressed play button, the selected folder icon and the act-one hint dot. One use per region; never a background for large areas. Text on it is `on-playhead`.
- **Track colors say what a clip is**, never decoration: `clip-video` (footage, b-roll), `clip-image` (stills, photos), `clip-text` (titles, lyrics, readme), `clip-fx` (adjustments), `clip-audio` (voice, music). At rest each uses its `-dim` token with `clip-ink-dim` labels; live, the full token with `clip-ink`.
- Act one owns `theater-black`, `screen`, `velvet`, `velvet-deep`, `seat`, `seat-edge`, `aisle-light`. None of them appear in the editor except `theater-black` behind the monitor picture.
- Focus ring: 2px solid `ink`, 1px offset, on every interactive element.

### Type
- Three families, loaded from Google Fonts: `display` (Instrument Serif), `ui` (Geist), `mono` (Geist Mono).
- `film-title` once per page, on the screen. `project-title` in the info pane. Everything in the editor chrome is `ui-text`, `ui-strong`, `panel-title` or `clip-label`; every number is `timecode` or `tick`.

### Space, size, radius
- 4px grid: `space-1` gutters between panels, `space-2` row and clip insets, `space-3` panel padding, `space-4` info pane.
- The timeline is exactly header + ruler + five `track-h` (32px) lanes (`timeline-h` 216px): no empty lane below the last track.
- Fixed editor geometry: `menubar-h`, `panel-header-h`, `ruler-h`, `track-h`, `track-header-w`, `bin-w`, `timeline-h`. The editor fills the viewport; only the bin list and the timeline scroll.
- `radius-0` for anything that is a picture (screen, monitor). `radius-sm` for clips and meters, `radius-md` for panels and buttons.
- Shadows: only `screen-glow` in act one and `panel-pop` for menus and the editor landing.

### Layout
- Desktop: menubar across the top, bin top-left (`bin-w`), program monitor top-right, timeline full-width below (`timeline-h`), footer status bar at the bottom (`footer-h`).
- **Hide sequence**: the timeline header has a `Hide sequence` button, filled in `playhead` with `on-playhead` text like the pause button so it reads as a control, that collapses it to its header bar (`panel-header-h`) so the monitor and bin take the space; `Show sequence` restores it.
- **Experience view**: the Experience tab or a company file swaps the monitor and timeline for one Experience panel (career sequence on top, detail cards below); the bin and footer stay.
- Under 760px the site mounts **MobileEditor** instead (CapCut layout): top bar with the wordmark, project name and a `Contact` pill; the preview; a time and play row; a sideways-scrolling timeline under a fixed white center playhead (scrolling scrubs, layer toggles pinned left); a bottom tool bar `Projects`, `Experience`, `Info`, `Contact`. Projects and Info open bottom sheets.

### Media rules (what a project needs)
- **Track layout is fixed per project** so spacing never jumps between projects: V3, V2, V1, A1, A2. An unused track (the Ryan Ni voice track A1) stays as an empty lane.
- **Has a video:** it goes on V1 as `video` clips; the monitor plays a real `<video>` whose `currentTime` follows the playhead. Titles on V3, grade/grain on V2, audio on A1/A2.
- **No video, has images:** each image is a `image` clip on V1 (default 4s) and the monitor becomes a carousel with position dots; scrubbing moves between stills with a slow push-in.
- **No media:** V1 holds one `readme.md` clip and the monitor shows the readme card (name, year, description). Links do the work in the info pane.
- Hiding a video track (eye) removes its layer from the monitor live; muting an audio track (speaker) drops its level from the meters and the audio.

### Motion (GSAP)
- Act one is a **loading screen, not scroll-driven**: deterministic, the same every visit. Hold 1.4s on the screen, dolly in over 2.6s (`power2.inOut`), then wait on the screen loop until the first project's poster, preview and the fonts are ready (`ready` promise), then the cut (0.55s). A `Skip intro` button jumps to the cut; a second visit in the same tab skips act one (`skipIfSeen`).
- The theater is a **layered photo**: a real empty-theater photo (`room`), the front seat rows cut out as a transparent image (`seats`) that moves faster than the room during the dolly, and the screen rectangle placed over the photo's screen (`screen: {left, top, width}` in %). The drawn SVG theater is only the fallback.
- The dolly: seat rows move down and scale up, nearest row first (0.02 stagger, `power2.in`), fading out by 45%; the world scales about the screen centre until the screen covers the viewport (`power2.in`, 78% of the timeline). Credits fade and grow 15% at 42%.
- The cut: at 70% fade to `theater-black` (full opacity), then act two appears behind the black and the black fades out over 0.2 of the timeline, the editor settles from 1.06 to 1 (`power3.out`) and panels stagger in 14px up, 0.03 apart.
- In the editor, motion is the playhead: no easing on time, no decorative transitions. Panel content swaps instantly on project change.
- **Cursor cue**: on the last intro line a cursor glides from the monitor to the next project folder, outlines it in `playhead` and clicks. Its position is a function of playhead time, so it scrubs, pauses and hides with V3 like any layer. Never a screen recording.
- `prefers-reduced-motion`: skip the dolly, cross-fade from theater to editor in 0.2s, do not autoplay.

### Interaction
- Click a folder: load that project, seek to 0, play. Drag anywhere on the ruler or lanes to scrub (pauses). Click a clip to select it.
- Keys in the editor: Space or K play/pause, Left/Right one frame, Shift+Left/Right one second, Home/End.

## Iconography

- 16px line icons on a 16 grid, 1.5px stroke, round caps and joins, drawn inline as SVG in `currentColor` (`Reel.icons`: folder, film, image, doc, wave, link, eye, eye-off, speaker, speaker-off, lock, eject). Transport glyphs (play, pause, step, go to start/end) are filled.
- No emoji, no icon fonts. There is no logo: the wordmark is "Ryan Ni" set in italic `display` at 20px.

## Project data folder

Each project is a folder; a build step reads them all and writes one small `index.json`. Drop a folder in, rebuild, it appears in the bin.

```
projects/
  00-ryan-ni/  project.json  broll/*.mp4  photos/*.avif  score.m4a
  01-orca/     project.json  video.mp4  poster.avif  preview.mp4
  02-photos/   project.json  stills/*.avif
```

- `project.json`: `{ id, name, awards: ["#1, UIUC"], type: "PROF" | "SW/AI" | "HW/EE", year?, role, kind: "reel" | "video" | "images" | "text", description, links, experience?, tracks }`. A track is `{ id, name, kind: "v" | "a", clips }`; a clip is `{ start, end, label, type, src?, in? }` in seconds. This is the same file the separate in-browser editor exports; the portfolio only reads it.
- **Per project, one real video** (V1). Text, lyrics, photos and adjustments are drawn live from the json, and each audio track is its own file mixed in the browser, so hide and mute work without baking layers.
- **Loading:** first paint fetches `index.json`, each project's poster and nothing else. A project's full video loads when it is opened (hovering its folder starts fetching it). The loading screen only waits for the first project.
- **Hosting:** media lives on Cloudflare R2 behind a custom domain, not in git. Encode H.264 MP4 1080p at about 5 Mbps plus a 480p `preview.mp4`; stills as AVIF (WebP fallback), 2400px long edge.

## Placeholders to replace

- The theater is drawn until the photo layers exist: pass `mountTheater(el, { room, seats, screen, gif })`. The screen shows a graded stand-in loop until the GIF (better: a short muted MP4) is uploaded.
- Experience is real (from the resume); LIL Lab and Dream Voyage have no bullets yet. The photos and b-roll in the Ryan Ni project are placeholders.
- Projects are the six selected hackathon projects; Fire Orca, Cortex, Iris / LinguaLens and PowerTag descriptions are placeholders.
- `Reel.sampleProjects` is sample data (Ryan Ni plus four projects covering video, images and text-only; the real site has about 15). Replace names, descriptions, links and media with real ones.
