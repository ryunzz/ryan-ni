"use client";
import { create } from "zustand";
import { Icon } from "./Icon";
import { cx } from "@/lib/reel/util";
import s from "./Toast.module.css";

interface ToastState { msg: string; x: number | null; y: number; on: boolean; n: number }
const useToast = create<ToastState>(() => ({ msg: "", x: null, y: 0, on: false, n: 0 }));
let timer: ReturnType<typeof setTimeout> | undefined;

/** small pill (ink on panel-000) above the control for 1.4s */
export function toast(msg: string, near?: Element | null) {
  const r = near?.getBoundingClientRect();
  useToast.setState((st) => ({ msg, x: r ? r.left + r.width / 2 : null, y: r ? r.top - 8 : 0, on: true, n: st.n + 1 }));
  clearTimeout(timer);
  timer = setTimeout(() => useToast.setState({ on: false }), 1400);
}

function legacyCopy(t: string) {
  const ta = document.createElement("textarea");
  ta.value = t;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch { /* ignore */ }
  ta.remove();
}
export async function copyText(t: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(t); return; } catch { /* fall through */ }
  }
  legacyCopy(t);
}

export function Toast() {
  const { msg, x, y, on, n } = useToast();
  return (
    <div
      key={n}
      className={cx(s.toast, x != null && s.above, on && s.on)}
      style={x != null ? { left: x, top: y } : { left: "50%" }}
      role="status"
      aria-live="polite"
    >
      {msg && <Icon name="check" className={s.ico} />}
      <span>{msg}</span>
    </div>
  );
}
