# Content

- `about.json`: wordmark, title card, contact (email, blurb, links), theater screen rectangle.
- `projects/<NN-slug>/project.json`: one folder per project, sorted by folder name. `00-ryan-ni` (the reel) must stay first.
  Fields: `id, name, type (PROF | SW/AI | HW/EE), section (technical | personal, default technical), tagline?, awards, year?, role, kind (reel | video | images | text), duration, seed, description (**bold** allowed), links, experience?, tracks?`.
  Every award shows in gold.
  Omit `tracks` and they are generated (V3, V2, V1, A1, A2).

## Media: drag and drop

Put files in `content/media/<NN-slug>/` (same folder name as the project), then run `npm run dev` or `npm run index`.
The index rescans the folder and rewrites `content/media.manifest.json`. Commit the media and the manifest;
the deploy serves them at `/media`. Anything missing keeps its procedural stand-in.

A real `video.mp4` is the finished cut: the site draws no titles, grade or grain over it, and generates no title or voice clips.
In `00-ryan-ni/` it replaces the B-roll and photo tracks (the film burns them in); the Words track stays and still drives the cursor cue.
Pull its audio out as `score.m4a`. Non-16:9 video (e.g. vertical) is letterboxed.

| Drop this | It becomes |
|---|---|
| `video.mp4` | the project's V1 footage (the duration is read from the file) |
| `preview.mp4` | the 480p version used on phones and for hover prefetch |
| `poster.avif` / `.webp` / `.jpg` | the poster (first frame before the video loads) |
| `stills/*.avif` | an image project: one V1 still per file, carousel in the monitor |
| any file named like a clip label | that clip, e.g. `broll_campus.mp4`, `ucsd.jpg`, `score.m4a` in `00-ryan-ni/` |
| `00-ryan-ni/research.jpg`, `hackathon_01.jpg` ... `hackathon_10.jpg` | the research line's photo pile: research lands first, the ten hackathon photos start stacking when "(18x" appears |
| `00-ryan-ni/math.jpg`, `poker.jpg`, `camera.jpg` | the three photos on the math, poker and videos line |
| `theater/room.avif`, `theater/seats.webp`, `theater/loop.mp4` | act one photo mode; set `theater.screen` `{left, top, width}` (% of the photo) in `about.json` |

Encoding: H.264 MP4 1080p at ~5 Mbps, a 480p `preview.mp4`, stills as AVIF at 2400px long edge.
