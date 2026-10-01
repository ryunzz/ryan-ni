A clip on a track: a bar in its track type's color with the file name in `clip-label`, dim at rest and full strength only under the playhead.

**Provide:** `.rl-clip.<type>` with `type` one of `video`, `image`, `text`, `fx`, `audio`, positioned inside an `.rl-lane`; add `.live` while the playhead is inside it (the timeline does this).

- At rest: `clip-<type>-dim` with `clip-ink-dim`. Live: `clip-<type>` with `clip-ink`. Audio stays dim when live; only its waveform lights.
- Selected: `aria-selected="true"`. Hidden track: the lane gets `.off` and clips drop to 28% opacity.
- Never color a clip outside its type.
