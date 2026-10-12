type Props = {
  text: string;
  className?: string;
};

/**
 * Seamless horizontal loop: two identical copies in one track that moves by exactly one copy.
 * Decorative – the accessible text lives in the parent (sr-only), so the copies are aria-hidden.
 */
export function Marquee({ text, className = "" }: Props) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center whitespace-nowrap">
            {text}
            <span className="mx-[0.25em] text-red-text">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
