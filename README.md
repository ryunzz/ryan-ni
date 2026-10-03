# Reel

Ryan Ni's portfolio, presented as a film: act one is a theater loading screen that dollies into the screen; act two is a video editor where the project bin, program monitor and timeline are the portfolio.

- Design system and prototype (the spec): `design/reel/`
- Content: `content/` (see `content/README.md`; media is drag and drop)
- Deploy and media hosting: `DEPLOY.md`
- The previous site is kept in `legacy/`.

```sh
npm install
npm run dev        # rebuilds the content index first
npm run build
npm run lint && npm run typecheck
```
