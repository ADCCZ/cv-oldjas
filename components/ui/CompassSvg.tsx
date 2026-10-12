/**
 * Flat SVG compass – shown next to About until the 3D compass (WebGL phase) replaces it,
 * and kept as its fallback for reduced motion / no WebGL.
 */
const C = 100;

/** Point on a circle; 0° = north, clockwise. Rounded so server and client render identical markup. */
function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: +(C + r * Math.sin(a)).toFixed(2), y: +(C - r * Math.cos(a)).toFixed(2) };
}

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const CARDINALS = ["N", "E", "S", "W"] as const;

export function CompassSvg({ className = "", needleRotation = 0 }: { className?: string; needleRotation?: number }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={C} cy={C} r={97} fill="none" stroke="var(--line-strong)" strokeWidth={1} />
      <circle cx={C} cy={C} r={78} fill="none" stroke="var(--line)" strokeWidth={1} />

      {TICKS.map((deg) => {
        const major = deg % 90 === 0;
        const medium = deg % 15 === 0;
        const from = polar(deg, 97);
        const to = polar(deg, major ? 84 : medium ? 89 : 93);
        return (
          <line
            key={deg}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={major ? "var(--gold)" : "var(--fg-muted)"}
            strokeWidth={major ? 2 : 1}
          />
        );
      })}

      {CARDINALS.map((label, i) => {
        const p = polar(i * 90, 66);
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-archivo), sans-serif"
            fontWeight={600}
            fontSize={11}
            fill={label === "N" ? "var(--gold)" : "var(--fg-muted)"}
          >
            {label}
          </text>
        );
      })}

      <g transform={`rotate(${needleRotation} ${C} ${C})`}>
        <path d={`M${C} 34 L${C + 7} ${C} L${C - 7} ${C} Z`} fill="var(--red-500)" />
        <path d={`M${C} 166 L${C + 7} ${C} L${C - 7} ${C} Z`} fill="var(--fg-muted)" opacity={0.55} />
        <circle cx={C} cy={C} r={5} fill="var(--gold)" />
      </g>
    </svg>
  );
}
