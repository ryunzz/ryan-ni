"use client";
/* Act one, the loading screen: the back row of a theater dollies into the screen while the first
 * project loads, then cuts to act two. Deterministic (GSAP timeline), never scroll-driven. */
import { useCallback, useEffect, useImperativeHandle, useRef, type ReactNode, type Ref } from "react";
import gsap from "gsap";
import { reel, useSession } from "@/store/session";
import { mediaUrl } from "@/lib/media";
import { drawScreenLoop } from "@/lib/reel/render";
import { RawImg } from "../RawImg";
import { TitleCard, titleStyles as ts } from "../TitleCard/TitleCard";
import { MOBILE_SHIFT, ROWS, Room, SeatRow, Snacks, rowBox } from "./Room";
import s from "./TheaterIntro.module.css";

export const SEEN_KEY = "reel-seen";

export interface TheaterHandle { replay(): void }

export function TheaterIntro({ ready, mobile, act2Ready, handle, children }: {
  /** resolves when the first project's poster + preview and the fonts are loaded */
  ready: Promise<unknown>;
  mobile: boolean;
  /** act two is mounted (its panels can be staggered in) */
  act2Ready: boolean;
  handle?: Ref<TheaterHandle>;
  children: ReactNode;
}) {
  const th = reel.about.theater;
  const photo = !!th.room;
  const el = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const credits = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const act2 = useRef<HTMLDivElement>(null);
  const loop = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ finish(): void; replay(): void } | null>(null);

  useImperativeHandle(handle, () => ({ replay: () => api.current?.replay() }), []);

  /* the screen's stand-in loop: graded footage, drawn only while act one is visible */
  const loopOn = useRef(false);
  const startLoop = useCallback(() => {
    const cv = loop.current;
    if (!cv || loopOn.current) return;
    loopOn.current = true;
    const ctx = cv.getContext("2d")!, t0 = performance.now();
    const frame = (now: number) => {
      if (!loopOn.current || !cv.isConnected) { loopOn.current = false; return; }
      drawScreenLoop(ctx, cv.width, cv.height, ((now - t0) / 1000) % 12);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!act2Ready) return;
    const root = el.current!, w = world.current!, sc = screen.current!, cr = credits.current!;
    const ed = act2.current!.firstElementChild as HTMLElement | null;
    const panels = act2.current!.querySelectorAll("[data-panel]");
    const rowEls = Array.from(rows.current!.children) as HTMLElement[];
    const beam = w.querySelector("[data-beam]");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = useSession.getState();

    /* the title types out, then the credit and the name appear; the dolly waits for it (hold) */
    const chars = Array.from(cr.querySelectorAll<HTMLElement>("[data-ch]"));
    const [role, name] = Array.from(cr.querySelectorAll<HTMLElement>("[data-credit]"));
    const typed = { n: 0 };
    const showChars = () => {
      const n = Math.floor(typed.n);
      chars.forEach((c, i) => {
        c.classList.toggle(ts.typed, i < n);
        c.classList.toggle(ts.caret, typing && i === n - 1);
        c.classList.toggle(ts.pre, typing && n === 0 && i === 0);
      });
    };
    let typing = true;
    /* act one runs ~3.3s from opening the page to the editor: type (~0.6s), credits, a short hold, then one
     * continuous move (dolly into the screen and the cut) over TRAVEL with a single ease, so it never stops and restarts */
    const TYPE_AT = 0.15, PER_CHAR = 0.045, typeEnd = TYPE_AT + chars.length * PER_CHAR;
    const TRAVEL = 2.25, SKIP = 0.42, GATE = 0.68;
    const tt = gsap.timeline({ paused: true })
      .call(() => { typing = true; typed.n = 0; showChars(); }, [], 0)
      .set([role, name], { opacity: 0, y: 6 }, 0)
      .to(typed, { n: chars.length, duration: chars.length * PER_CHAR, ease: "none", onUpdate: showChars }, TYPE_AT)
      .call(() => { typing = false; showChars(); }, [], typeEnd + 0.15)
      .to(role, { opacity: 0.82, y: 0, duration: 0.25, ease: "power2.out" }, typeEnd + 0.02)
      .to(name, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, typeEnd + 0.1);
    const hold = typeEnd + 0.3;

    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    const zoomVars = () => {
      const W = root.clientWidth, H = root.clientHeight, sw = sc.offsetWidth, sh = sc.offsetHeight;
      /* unplaced, left is 50% with translateX(-50%), so offsetLeft is the centre */
      const cx = th.screen ? sc.offsetLeft + sw / 2 : sc.offsetLeft, cy = sc.offsetTop + sh / 2;
      return { s: Math.max(W / sw, H / sh) * 1.04, ox: cx, oy: cy, dy: H / 2 - cy };
    };
    const build = () => {
      const z = zoomVars();
      tl.clear();
      gsap.set(w, { transformOrigin: `${z.ox}px ${z.oy}px`, scale: 1, x: 0, y: 0 });
      tl.to(hint.current, { autoAlpha: 0, duration: 0.08 }, 0)
        .to(skip.current, { autoAlpha: 0, duration: 0.05 }, 0.74)
        .to(w, { scale: z.s, y: z.dy, duration: 0.78, ease: "power2.in" }, 0);
      if (beam) tl.to(beam, { opacity: 0, duration: 0.3 }, 0);
      rowEls.forEach((r, i) => {
        const depth = (i + 1) / rowEls.length, at = 0.02 * (rowEls.length - i);
        tl.to(r, { yPercent: 260 + depth * 520, scale: 1 + depth * 1.6, duration: 0.5, ease: "power2.in" }, at)
          .to(r, { opacity: 0, duration: 0.18 }, 0.26 + at);
      });
      tl.to(cr, { opacity: 0, scale: 1.15, duration: 0.25 }, 0.42)
        .to(flash.current, { opacity: 1, duration: 0.1, ease: "power1.in" }, 0.7)
        .set(act2.current, { opacity: 1, pointerEvents: "auto" }, 0.8)
        .call(() => { if (act2.current) act2.current.inert = false; }, [], 0.8)
        .set(w, { autoAlpha: 0 }, 0.82)
        .to(flash.current, { opacity: 0, duration: 0.2, ease: "power1.out" }, 0.83);
      if (ed) tl.fromTo(ed, { scale: 1.06 }, { scale: 1, duration: 0.2, ease: "power3.out" }, 0.8);
      if (panels.length) tl.fromTo(panels, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.14, stagger: 0.03, ease: "power2.out" }, 0.83);
    };

    let tween: gsap.core.Tween | null = null, done = false;
    const ok = Promise.race([ready, new Promise((r) => setTimeout(r, 12000))]);
    const settle = () => {
      loopOn.current = false;
      ed?.focus({ preventScroll: true });
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode */ }
      document.documentElement.removeAttribute("data-seen");
    };
    const finish = () => {
      if (done) return;
      done = true;
      tween?.kill();
      tt.progress(1);
      if (reduce) {
        /* no dolly: cross-fade from theater to editor in 0.2s, no autoplay */
        tl.progress(1);
        gsap.fromTo(act2.current, { opacity: 0 }, { opacity: 1, pointerEvents: "auto", duration: 0.2 });
        if (act2.current) act2.current.inert = false;
        settle();
        return;
      }
      /* Skip intro: finish from wherever the move is */
      tween = gsap.to(tl, { progress: 1, duration: SKIP, ease: "power1.out", onComplete: () => { settle(); useSession.getState().setPlaying(true); } });
    };
    const run = () => {
      done = false;
      st.setPlaying(false);
      st.seek(0);
      tl.progress(0);
      startLoop();
      if (reduce) { tt.progress(1); void ok.then(finish, finish); return; }
      tt.restart();
      let ready = false;
      void ok.then(() => { ready = true; }, () => { ready = true; });
      const move = gsap.to(tl, {
        progress: 1,
        duration: TRAVEL,
        delay: hold,
        ease: "sine.inOut",
        /* only if the first project still isn't loaded: hold just before the cut, then carry on */
        onUpdate: () => {
          if (!ready && tl.progress() >= GATE && !move.paused()) {
            move.pause();
            void ok.then(() => move.resume(), () => move.resume());
          }
        },
        onComplete: () => {
          done = true;
          tt.progress(1);
          settle();
          useSession.getState().setPlaying(true);
        },
      });
      tween = move;
    };
    const replay = () => {
      tween?.kill();
      if (act2.current) act2.current.inert = true;
      useSession.getState().setPlaying(false);
      startLoop();
      tween = gsap.to(tl, { progress: 0, duration: reduce ? 0.2 : 0.8, ease: "power2.inOut", onComplete: run });
    };
    api.current = { finish, replay };

    /* act two stays laid out and painted behind the theater (transparent, inert), so revealing it is only a fade */
    gsap.set(act2.current, { opacity: 0, pointerEvents: "none" });
    act2.current!.inert = true;
    build();
    let seen = false;
    try { seen = !!sessionStorage.getItem(SEEN_KEY); } catch { /* ignore */ }
    if (seen) {
      tt.progress(1);
      tl.progress(1);
      done = true;
      settle();
      if (!reduce) st.setPlaying(true);
    } else run();

    let rt: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => { const p = tl.progress(); build(); tl.progress(p); }, 80);
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      clearTimeout(rt);
      tween?.kill();
      tt.kill();
      tl.kill();
      loopOn.current = false;
    };
  }, [act2Ready, ready, startLoop, th.screen]);

  return (
    <div ref={el} className={`${s.theater} ${mobile ? s.mobile : ""}`}>
      <div ref={world} className={s.world} data-theater>
        {photo ? <RawImg className={s.photo} src={mediaUrl(th.room!)} alt="" /> : <Room className={s.room} beamClass={s.beam} drawnClass={s.drawn} screen={screen} />}
        <div
          ref={screen}
          className={`${s.screen} ${th.screen ? s.placed : ""}`}
          style={th.screen ? { left: `${th.screen.left}%`, top: `${th.screen.top}%`, width: `${th.screen.width}%` } : undefined}
          aria-hidden="true"
        >
          {th.loop ? (
            /\.(mp4|webm|mov|m4v)$/i.test(th.loop)
              ? <video className={s.media} src={mediaUrl(th.loop)} autoPlay muted loop playsInline />
              : <RawImg className={s.media} src={mediaUrl(th.loop)} alt="" />
          ) : (
            <canvas ref={loop} className={s.media} width={956} height={400} />
          )}
          <TitleCard ref={credits} />
        </div>
      </div>
      <div ref={rows} className={s.rows} data-theater>
        {th.seats ? (
          <div className={`${s.row} ${s.seatphoto}`}><RawImg src={mediaUrl(th.seats)} alt="" /></div>
        ) : (
          ROWS.map((_, i) => {
            const shift = mobile ? MOBILE_SHIFT : 0, b = rowBox(i, shift);
            return (
              <div key={i} className={s.row} style={{ top: `${b.top * 100}%`, height: `${b.height * 100}%` }}>
                <SeatRow i={i} shift={shift} className={s.rowCanvas} drawnClass={s.drawn} />
              </div>
            );
          })
        )}
        {/* the frontmost layer: your popcorn and soda (it moves first and fastest in the dolly) */}
        <div className={s.snacks}><Snacks className={s.rowCanvas} /></div>
      </div>
      <div ref={hint} className={s.hint} data-theater><i /><span>Now showing</span></div>
      <button ref={skip} type="button" className={s.skip} data-theater onClick={() => api.current?.finish()}>Skip intro</button>
      <div ref={flash} className={s.flash} />
      <div ref={act2} className={s.act2}>{children}</div>
    </div>
  );
}
