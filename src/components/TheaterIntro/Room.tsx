/* the drawn theater: fallback until the photo layers (room, seats) are dropped in */
import { rng } from "@/lib/reel/util";

export function RoomSvg({ className }: { className?: string }) {
  const folds = Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 26} y={0} width={12} height={560} style={{ fill: "var(--velvet-deep)" }} />);
  const lights = Array.from({ length: 9 }, (_, k) => {
    const y = 600 + k * 45, dx = k * 16, r = 1.4 + k * 0.25;
    return [
      <circle key={`l${k}`} cx={150 - dx} cy={y} r={r} style={{ fill: "var(--aisle-light)" }} />,
      <circle key={`r${k}`} cx={850 + dx} cy={y} r={r} style={{ fill: "var(--aisle-light)" }} />,
    ];
  });
  return (
    <svg className={className} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="rlBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--screen)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--screen)", stopOpacity: 0.07 }} />
        </linearGradient>
      </defs>
      <polygon points="0,0 1000,0 780,110 220,110" fill="#0b0b0d" />
      <polygon points="0,0 220,110 220,560 0,1000" fill="#0c0a0b" />
      <polygon points="1000,0 780,110 780,560 1000,1000" fill="#0c0a0b" />
      <g data-beam><polygon points="470,0 530,0 780,140 220,140" fill="url(#rlBeam)" transform="translate(0,-10)" /></g>
      <g transform="translate(170,80) skewY(8)"><rect width="150" height="560" style={{ fill: "var(--velvet)" }} />{folds}</g>
      <g transform="translate(830,80) skewY(-8) scale(-1,1)"><rect width="150" height="560" style={{ fill: "var(--velvet)" }} />{folds}</g>
      <rect x="0" y="600" width="1000" height="400" fill="#09080a" />
      {lights}
    </svg>
  );
}

export function SeatRow({ n, seed, heads }: { n: number; seed: number; heads: number }) {
  const r = rng(seed), w = 1000 / n, out = [];
  for (let i = 0; i < n; i++) {
    const x = i * w + w * 0.06, sw = w * 0.88;
    out.push(<rect key={`s${i}`} x={x.toFixed(1)} y="30" width={sw.toFixed(1)} height="90" rx={(sw * 0.22).toFixed(1)} style={{ fill: "var(--seat)" }} />);
    out.push(<rect key={`e${i}`} x={(x + sw * 0.1).toFixed(1)} y="30" width={(sw * 0.8).toFixed(1)} height="3" rx="1.5" style={{ fill: "var(--seat-edge)" }} />);
    if (heads && r() < heads) {
      const hx = x + sw * (0.35 + r() * 0.3);
      out.push(<ellipse key={`h${i}`} cx={hx.toFixed(1)} cy={(22 - r() * 6).toFixed(1)} rx={(sw * 0.2).toFixed(1)} ry={(sw * 0.26).toFixed(1)} style={{ fill: "var(--seat)" }} />);
    }
  }
  return <svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">{out}</svg>;
}

/** [seats, top, height %, head probability], back row first */
export const ROWS: [number, number, number, number][] = [[20, 0.62, 5, 0.35], [16, 0.68, 7, 0.4], [13, 0.75, 9, 0.5], [10, 0.83, 12, 0.55], [8, 0.93, 16, 0]];
