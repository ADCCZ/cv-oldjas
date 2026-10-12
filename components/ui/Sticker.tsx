type Props = {
  text: string;
  /** Resting rotation in degrees. */
  rotate?: number;
  className?: string;
};

/** Round "Bravo!" style sticker: handwritten text in a red outline, slightly tilted. */
export function Sticker({ text, rotate = -8, className = "" }: Props) {
  return (
    <span
      className={`pointer-events-none grid size-24 place-items-center rounded-full border-2 border-red-text bg-bg text-center font-hand text-2xl leading-none text-red-text md:size-28 md:text-3xl ${className}`}
      style={{ rotate: `${rotate}deg` }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
