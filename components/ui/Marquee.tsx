type Props = {
  text: string;
  className?: string;
};

/**
 * Seamless horizontal loop: two identical copies in one track that moves by exactly one copy.
 * A CSS animation is the no-JS fallback; HeroMotion takes over and ties speed and direction to
 * the scroll velocity. Decorative – the accessible name lives in the h1 (sr-only), so the
 * copies are aria-hidden. Clipped only horizontally, so letters can fly out of the line.
 * The copies are plain inline text (not flex) – once SplitText turns every letter into an
 * element, a flex container would swallow the spaces between the words.
 */
export function Marquee({ text, className = "" }: Props) {
  return (
    <div data-hero-name className={`overflow-x-clip ${className}`} aria-hidden="true">
      <div data-marquee-track className="marquee-track">
        {[0, 1].map((copy) => (
          <span key={copy} data-marquee-copy className="shrink-0 whitespace-nowrap">
            {text}
            <span className="mx-[0.25em] text-red-text">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
