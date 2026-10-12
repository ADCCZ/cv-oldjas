"use client";

import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const subscribeNoop = () => () => {};

type Props = {
  toLight: string;
  toDark: string;
};

/** Icon geometry: dark theme shows the moon (offers light), light theme shows the sun. */
const MOON = { cx: 17, cy: 7, r: 8, rays: 0, spin: -45, scale: 0.6 };
const SUN = { cx: 30, cy: -6, r: 4.5, rays: 1, spin: 0, scale: 1 };

/**
 * Sun / moon toggle. The moon is the sun's disc with a second circle sliding in as a mask while
 * the rays turn and shrink away. GSAP morphs the SVG attributes: next-themes switches CSS
 * transitions off for the moment the theme changes (no flashing colours), which would also
 * freeze a CSS-transitioned icon. Only a click animates; the first render just sets the state.
 */
export function ThemeToggle({ toLight, toDark }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is unknown during SSR – render the dark state until hydrated.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const isDark = !mounted || resolvedTheme !== "light";
  const svgRef = useRef<SVGSVGElement>(null);
  const clicked = useRef(false);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const to = isDark ? MOON : SUN;
      const vars = { duration: clicked.current && !prefersReducedMotion() ? 0.7 : 0, ease: EASE.inOut, overwrite: true };
      gsap.to(svg.querySelector("[data-moon]"), { attr: { cx: to.cx, cy: to.cy }, ...vars });
      gsap.to(svg.querySelector("[data-disc]"), { attr: { r: to.r }, ...vars });
      gsap.to(svg.querySelector("[data-rays]"), { opacity: to.rays, rotation: to.spin, scale: to.scale, svgOrigin: "12 12", ...vars });
    },
    { dependencies: [isDark] },
  );

  return (
    <button
      type="button"
      onClick={() => {
        clicked.current = true;
        setTheme(isDark ? "light" : "dark");
      }}
      aria-label={isDark ? toLight : toDark}
      className="grid size-10 place-items-center border border-line-strong text-fg transition-colors duration-300 hover:border-fg"
    >
      {/* Attributes are the initial (moon) state; GSAP owns them afterwards. */}
      <svg ref={svgRef} viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true" focusable="false">
        <mask id="theme-toggle-moon">
          <rect width="24" height="24" fill="white" />
          <circle data-moon cx={MOON.cx} cy={MOON.cy} r="6" fill="black" />
        </mask>
        <circle data-disc cx="12" cy="12" r={MOON.r} fill="currentColor" mask="url(#theme-toggle-moon)" />
        <g data-rays stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
