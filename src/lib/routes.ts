/* URL <-> session state: /, /projects/<id>, /experience, /contact. The Reel stays mounted;
 * in-app moves push the matching URL, and a deep link or back/forward applies it. */
import { me, useSession, type SessionState } from "@/store/session";

export function pathFor(s: Pick<SessionState, "p" | "view" | "anchor">) {
  if (s.view === "experience") return s.anchor === "contact" ? "/contact" : "/experience";
  return s.p === me() ? "/" : `/projects/${s.p.id}`;
}

export function applyPath(path: string) {
  const st = useSession.getState();
  const proj = path.match(/^\/projects\/([^/]+)\/?$/);
  if (path === "/experience") st.setView("experience");
  else if (path === "/contact") st.setView("experience", null, "contact");
  else {
    st.setView("player");
    const id = proj && st.projects.some((q) => q.id === proj[1]) ? proj[1] : me()?.id;
    if (id && id !== st.p.id) st.load(id);
  }
}

/** call once on mount: applies the current URL, then keeps URL and session in step */
export function syncRoutes() {
  applyPath(location.pathname);
  const onPop = () => applyPath(location.pathname);
  addEventListener("popstate", onPop);
  const off = useSession.subscribe((s) => {
    const path = pathFor(s);
    if (path !== location.pathname) history.pushState(null, "", path);
  });
  return () => { off(); removeEventListener("popstate", onPop); };
}
