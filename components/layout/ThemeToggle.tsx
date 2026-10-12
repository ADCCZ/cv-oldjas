"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

type Props = {
  toLight: string;
  toDark: string;
};

/**
 * Sun / moon toggle. The icon morphs with CSS: the moon is the sun's disc with a second
 * circle sliding in as a mask, and the rays shrink away.
 */
export function ThemeToggle({ toLight, toDark }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is unknown during SSR – render the dark state until hydrated.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? toLight : toDark}
      className="grid size-10 place-items-center border border-line-strong text-fg transition-colors duration-500 hover:border-fg"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true" focusable="false">
        <mask id="theme-toggle-moon">
          <rect width="24" height="24" fill="white" />
          <circle
            cx={isDark ? 17 : 30}
            cy={isDark ? 7 : -6}
            r="6"
            fill="black"
            className="transition-all duration-700 ease-brand"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={isDark ? 8 : 4.5}
          fill="currentColor"
          mask="url(#theme-toggle-moon)"
          className="transition-all duration-700 ease-brand"
        />
        <g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="origin-center transition-all duration-700 ease-brand"
          style={{ opacity: isDark ? 0 : 1, transform: isDark ? "rotate(-45deg) scale(0.6)" : "none" }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
