The sequence: a ruler, five tracks (V3 titles, V2 adjust, V1 media, A1 voice, A2 music), the playhead and stereo meters.

**Provide:** a `Reel.Session` and a flex container.

- Drag anywhere on the ruler or lanes to scrub; scrubbing pauses playback. Click a clip to select it (2px `ink` outline).
- The eye on a video track hides that layer in the monitor and hatches the lane; the speaker on an audio track mutes it and drops it from the meters.
- `Hide sequence` (filled `playhead`, like the pause button) in the header collapses the panel to its header (adds `.seq-hidden` to the editor).
- Clip positions are percentages of the project duration, so the sequence always fits the panel width.
