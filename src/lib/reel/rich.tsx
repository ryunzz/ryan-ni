import { Fragment } from "react";

/** descriptions may use **bold** for the key facts */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}</>;
}
