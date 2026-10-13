/**
 * Red shade by position in a sequence: the first item is the darkest (--red-950),
 * the last one `brightest` (--red-500 by default). Used by project covers and the Journey folders.
 */
export function shadeFor(index: number, total: number, brightest = "var(--red-500)"): string {
  const mix = total > 1 ? Math.round((index / (total - 1)) * 100) : 0;
  return `color-mix(in oklab, var(--red-950), ${brightest} ${mix}%)`;
}
