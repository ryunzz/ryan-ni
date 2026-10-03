"use client";
import { useEffect, useRef } from "react";
import { useSession } from "@/store/session";
import { short, tc } from "@/lib/reel/util";

/** live playhead timecode, updated without re-rendering React on every frame */
export function Timecode({ className, format = "full" }: { className?: string; format?: "full" | "short" }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const f = format === "short" ? short : tc;
    const upd = () => {
      const txt = f(useSession.getState().t);
      if (ref.current && ref.current.textContent !== txt) ref.current.textContent = txt;
    };
    upd();
    return useSession.subscribe(upd);
  }, [format]);
  return <span ref={ref} className={className} />;
}
