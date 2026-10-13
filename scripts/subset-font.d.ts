/** Types for subset-font (the package ships none) – only what scripts/fonts.ts uses. */
declare module "subset-font" {
  type AxisValue = number | { min: number; max: number; default?: number };
  type Options = {
    targetFormat?: "sfnt" | "woff" | "woff2" | "truetype";
    variationAxes?: Record<string, AxisValue>;
  };
  export default function subsetFont(font: Uint8Array, text: string, options?: Options): Promise<Uint8Array>;
}
