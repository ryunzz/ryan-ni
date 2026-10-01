"use client";
/* The picture at the playhead. V1 footage is a real <video> whose currentTime follows the playhead
 * (seek when paused, resync if drift > 1 frame while playing); everything else (titles, lyrics,
 * photos, grade, grain, or the procedural stand-in) is drawn live on a canvas above it, so hiding a
 * track is instant. */
import { useEffect, useRef } from "react";
import { useSession } from "@/store/session";
import { mediaUrl } from "@/lib/media";
import { FPS, cx } from "@/lib/reel/util";
import { onImageLoad, renderFrame, videoLayerClip } from "@/lib/reel/render";
import s from "./Picture.module.css";

const W = 1280, H = 720;

export function Picture({ className, preview }: { className?: string; preview?: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const pid = useSession((st) => st.p.id);
  const p = useSession((st) => st.p);
  const v1Off = useSession((st) => !!st.off.V1);
  /* only the selected project's video loads (preview.mp4 on phones when present) */
  const hasVideo = p.tracks.some((t) => t.id === "V1" && t.clips.some((c) => c.type === "video" && c.src));
  const poster = mediaUrl(p.media.poster);

  useEffect(() => {
    const ctx = cv.current!.getContext("2d")!;
    const v = vid.current;
    let src = "";
    const draw = () => {
      const st = useSession.getState();
      const c = videoLayerClip(st);
      if (v && c?.src) {
        const url = mediaUrl(preview && st.p.media.preview && c.src === st.p.media.video ? st.p.media.preview : c.src)!;
        if (src !== url) {
          src = url;
          v.src = url;
        }
        const want = (c.in ?? 0) + (st.t - c.start);
        if (!st.playing) {
          if (!v.paused) v.pause();
          if (Math.abs(v.currentTime - want) > 1e-3 && !v.seeking) v.currentTime = want;
        } else {
          if (v.paused) void v.play().catch(() => {});
          if (Math.abs(v.currentTime - want) > 1 / FPS && !v.seeking) v.currentTime = want;
        }
      } else if (v && !v.paused) v.pause();
      renderFrame(ctx, W, H, st, !!(v && c && v.readyState >= 2));
    };
    draw();
    const unsub = useSession.subscribe(draw);
    const unimg = onImageLoad(draw);
    v?.addEventListener("loadeddata", draw);
    v?.addEventListener("seeked", draw);
    document.fonts?.ready.then(draw);
    return () => {
      unsub();
      unimg();
      v?.removeEventListener("loadeddata", draw);
      v?.removeEventListener("seeked", draw);
    };
  }, [pid, hasVideo, preview]);

  return (
    <div className={cx(s.pic, className)}>
      {hasVideo && (
        <video
          key={pid}
          ref={vid}
          className={s.video}
          style={{ visibility: v1Off ? "hidden" : "visible" }}
          muted
          playsInline
          preload="auto"
          poster={poster}
          crossOrigin="anonymous"
          aria-hidden="true"
        />
      )}
      <canvas ref={cv} width={W} height={H} className={s.canvas} role="img" aria-label={`Program monitor: ${p.name}`} />
    </div>
  );
}
