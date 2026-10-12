/**
 * Monogram placeholder (OJŠ) until the final SVG logo lands in public/logo.svg
 * (O/Š + compass motif, single colour via currentColor).
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block text-2xl leading-none font-black tracking-[-0.06em] ${className}`} aria-hidden="true">
      OJŠ
    </span>
  );
}
