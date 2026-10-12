/** Shared GLSL snippets (sRGB palette and noise) for the custom shaders. */

/** Vertex shader for screen-filling quads: the plane (−1…1) covers the View's viewport. */
export const QUAD_VERTEX = /* glsl */ `
precision highp float;
in vec3 position;
out vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/** Gradient noise (Inigo Quilez) and fractal sum – cheap, smooth, no textures needed. */
export const NOISE = /* glsl */ `
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += amp * noise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return sum;
}`;

/** The site palette in sRGB (globals.css) – the shaders mix in sRGB like the page does. */
export const PALETTE = /* glsl */ `
const vec3 RED_950 = vec3(0.165, 0.012, 0.024);
const vec3 RED_800 = vec3(0.361, 0.039, 0.063);
const vec3 RED_600 = vec3(0.620, 0.059, 0.110);
const vec3 RED_500 = vec3(0.824, 0.086, 0.165);
const vec3 GOLD = vec3(0.831, 0.651, 0.227);
const vec3 GOLD_SOFT = vec3(0.910, 0.780, 0.439);
const vec3 SHINE = vec3(0.973, 0.925, 0.776);`;
