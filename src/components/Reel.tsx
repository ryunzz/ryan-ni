"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { reel, startClock } from "@/store/session";
import { startMixer } from "@/lib/reel/mixer";
import { mediaUrl } from "@/lib/media";
import { preloadPosters, preloadUrl } from "@/lib/reel/prefetch";
import { TheaterIntro, type TheaterHandle } from "./TheaterIntro/TheaterIntro";
import { EditorShell } from "./EditorShell/EditorShell";
import { MobileEditor } from "./MobileEditor/MobileEditor";
import { Toast } from "./Toast";

const MOBILE = "(max-width: 759px)";

/** act one (theater) over act two (EditorShell, or MobileEditor under 760px) */
export function Reel() {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const theater = useRef<TheaterHandle>(null);

  useEffect(() => {
    const mq = matchMedia(MOBILE);
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    startClock();
    startMixer();
    const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 300));
    idle(() => preloadPosters(reel.projects.slice(1)));
    return () => mq.removeEventListener("change", on);
  }, []);

  /* the loading screen waits only for the first project's poster + preview (or first footage) and the fonts */
  const ready = useMemo(() => {
    if (typeof window === "undefined") return Promise.resolve();
    const first = reel.projects[0];
    const v1 = first.tracks.find((t) => t.id === "V1")?.clips.find((c) => c.src);
    const isVid = (u?: string) => !!u && /\.(mp4|webm|mov|m4v)$/i.test(u);
    return Promise.all([
      document.fonts.ready,
      preloadUrl(mediaUrl(first.media.poster), "image"),
      preloadUrl(mediaUrl(first.media.preview ?? (isVid(v1?.src) ? v1?.src : undefined)), "video"),
    ]);
  }, []);

  return (
    <>
      <TheaterIntro ready={ready} mobile={!!mobile} act2Ready={mobile !== null} handle={theater}>
        {mobile === null ? null : mobile ? <MobileEditor /> : <EditorShell onEject={() => theater.current?.replay()} />}
      </TheaterIntro>
      <Toast />
    </>
  );
}
