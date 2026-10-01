The status-bar footer along the bottom of the editor: email first (in `link`), then GitHub, LinkedIn, X, YouTube, and a copyright on the right.

**Provide:** `{ email, socials: [{ label, href }], footnote }`; `mountEditor` passes its options through.

- Plain text links in mono, no icons. External links open in a new tab; the email copies to the clipboard (`Copied!`).
- `footer-h` tall, on `panel-000`, no border. Labels `ink-muted`, `link` on hover.
