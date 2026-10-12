/**
 * Small monochrome line icons (24 × 24, stroke = currentColor) for the facts in About
 * and the badges in Beyond code. Drawn by hand to match the thin-line look of the site.
 */
const PATHS: Record<string, React.ReactNode> = {
  degree: (
    <>
      <path d="M2 9.5 12 4.5l10 5-10 5-10-5Z" />
      <path d="M6 11.5v4.5c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5" />
      <path d="M22 9.5v5.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2.5Z" />
      <path d="M4 19.5A2 2 0 0 0 6 21h14v-4" />
      <path d="M9 7.5h7M9 11h5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  speech: (
    <>
      <path d="M4 4.5h16v11H10l-6 4.5v-15.5Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  guitar: (
    <>
      <path d="m13.5 10.5 7-7M18 2l4 4" />
      <path d="M11.2 8.8c-1.6-1.3-4-1.2-5.4.4-.7.8-.8 1.8-1.9 2.4C2.3 12.4 1.6 14.8 3.4 17l3.6 3.6c2.2 1.8 4.6 1.1 5.4-.5.6-1.1 1.6-1.2 2.4-1.9 1.6-1.4 1.7-3.8.4-5.4" />
      <circle cx="9.5" cy="14.5" r="1.5" />
    </>
  ),
  tent: (
    <>
      <path d="M2.5 20 12 4l9.5 16h-19Z" />
      <path d="m9 20 3-5.5 3 5.5" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7 7.5h10a5 5 0 0 1 4.9 6l-.3 1.5a3 3 0 0 1-5.2 1.3L14.5 14h-5l-1.9 2.3a3 3 0 0 1-5.2-1.3l-.3-1.5A5 5 0 0 1 7 7.5Z" />
      <path d="M8 9.5v3M6.5 11h3" />
      <circle cx="15.5" cy="10" r=".6" fill="currentColor" />
      <circle cx="17.5" cy="12" r=".6" fill="currentColor" />
    </>
  ),
  mountain: (
    <>
      <path d="m2 20 7-12 4 6.5 2.5-3.5L22 20H2Z" />
      <path d="m7.3 11 1.7 1.5 1.7-1.5" />
    </>
  ),
};

export function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}
