The Experience view: replaces the monitor and timeline with a career sequence (one lane per job, years on the ruler, bars snapped to whole years, a `playhead` line at today) and a list of detail cards.

**Provide:** nothing extra; `mountEditor` mounts it. It reads `experience` from the Ryan Ni project: `{ label, file, role, from: year, to: year, place?, summary?, bullets?, links? }` (`file` is the bin name, `Company - Role`).

- Opened by the `Experience` tab or by clicking a company file in the bin (`session.setView('experience', index)`); `Back to player` returns.
- The selected job's clip is live (full color) and its card gets `panel-200`; other cards mute their summary to `ink-muted`.
- Card: company in `project-title`, `role · dates · place` in mono `ink-faint`, summary in `body`, bullets in `ink-muted`. Keep it brief: one summary line and one to three short points.

- The list ends with the Contact section: `CONTACT` label, "Let's talk." in italic display, a one-line blurb in `ink-muted`, then 44px icon buttons in the same order as the info pane (GitHub, LinkedIn, X, YouTube, Email; Email copies) and the address as a copyable text link. The Contact tab opens the view scrolled here (`session.setView('experience', null, 'contact')`).
- XR Lab and LIL Lab are one entry, `UCSD - Research` (2024 - 2025).
- A role can carry `programs: [{ name, from, to, text }]` instead of bullets (UCSD). Each program is a sub-clip in that role's lane and a row in its card; hover lights both (`.hot`), click pins it (`session.prog`).
