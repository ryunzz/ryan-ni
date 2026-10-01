The program monitor: the selected project's picture at the playhead, with a mini scrub bar and the transport row.

**Provide:** a `Reel.Session` and a flex container.

- Video projects: swap the canvas stand-in for a `<video>` and set `video.currentTime = session.t` on every `time` event (only when paused or drifting more than one frame while playing).
- Image projects: stills as a carousel with position dots and a slow push-in.
- Text projects: the readme card (name, year, description).
- The current timecode is `playhead` on the left; total duration `ink-muted` on the right.
