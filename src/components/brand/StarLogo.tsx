function starPoints(cx: number, cy: number, R: number, r: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const BIG = starPoints(50, 54, 47, 19);
const SMALL = starPoints(30, 54, 9, 3.6);

/** Logo vectorial: estrella con la bandera cubana perfilada en dorado. Colores desde la marca. */
export function StarLogo({ className = "h-12 w-12", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} ${animated ? "animate-star" : ""}`} aria-hidden="true">
      <defs>
        <clipPath id="star-clip"><polygon points={BIG} /></clipPath>
        <linearGradient id="star-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--brand-gold) 60%, white)" />
          <stop offset="0.5" stopColor="var(--brand-gold)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--brand-gold) 65%, black)" />
        </linearGradient>
      </defs>
      <g clipPath="url(#star-clip)">
        {[0, 1, 2, 3, 4].map((k) => (
          <rect key={k} x="0" y={7 + k * 19} width="100" height="19" fill={k % 2 === 0 ? "var(--brand-blue)" : "var(--brand-cream)"} />
        ))}
        <polygon points="0,4 62,54 0,104" fill="var(--brand-red)" />
        <polygon points={SMALL} fill="var(--brand-cream)" />
      </g>
      <polygon points={BIG} fill="none" stroke="url(#star-gold)" strokeWidth="4.5" strokeLinejoin="round" />
    </svg>
  );
}
