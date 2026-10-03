Act two on desktop: menubar, project bin, program monitor and timeline wired to one session, opening on the Ryan Ni intro.

**Provide:** a container sized to the viewport, and optionally `{ projects, autoplay, onEject, email, session }`.

```js
const { session } = Reel.mountEditor(el, { projects, autoplay: true });
session.load('orca');
```

- A project is `{ id, name, year, role, kind: 'reel' | 'video' | 'images' | 'text', duration, description, links, experience?, tracks? }`. The first project should be the `reel` (Ryan Ni).
- Menubar: wordmark, tabs `Projects` / `Experience` / `Contact`, and the email on the right. Footer: contact strip (see Footer). `view: 'experience'` opens on the Experience view.
- Bin: `Ryan Ni` section header with flat company files, then the `Projects` section of folders. `onEject` adds a "Theater" button that replays the loading screen.
- The cursor cue runs on any V3 clip with `cue: 'cursor'`: it points at the second folder in the bin (the first real project).
