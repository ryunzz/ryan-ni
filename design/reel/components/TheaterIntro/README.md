Act one, the loading screen: the back row of a theater dollies into the screen while the first project loads, then cuts to the editor (or MobileEditor under 760px).

**Provide:** a full-viewport container, `window.gsap` loaded first, and `{ room, seats, screen, gif, title, credit, director, ready, hold, skipIfSeen, mobile, projects }`.

```js
const th = Reel.mountTheater(el, {
  room: '/theater/room.avif', seats: '/theater/seats.webp', screen: { left: 24, top: 15, width: 52 },
  gif: '/theater/screen.gif',
  title: 'Hello, World!', credit: 'Written and Directed by', director: 'Ryan Ni',
  ready: Promise.all([document.fonts.ready, preload(firstProject)]),
  skipIfSeen: true
});
th.replay(); // play it again (the editor's Theater button does this)
```

- Deterministic: hold `hold` seconds (1.4), dolly 2.6s, wait for `ready`, cut. It never scrubs with scroll.
- `room` without `seats` still works; with neither, the drawn theater is the fallback.
- The screen is not a button. The only control is `Skip intro`.
