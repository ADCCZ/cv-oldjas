/**
 * Red shade by position in a sequence: the first item is the darkest (--red-950),
 * the last one the brightest (--red-500). Used by project covers and the Journey folders.
 */
export function shadeFor(index: number, total: number): string {
  const mix = total > 1 ? Math.round((index / (total - 1)) * 100) : 0;
  return `color-mix(in oklab, var(--red-950), var(--red-500) ${mix}%)`;
}
