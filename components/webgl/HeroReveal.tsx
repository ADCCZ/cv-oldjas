"use client";

import { View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  GLSL3,
  LinearFilter,
  Mesh,
  NoColorSpace,
  NormalBlending,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Vector2,
  Vector3,
  Vector4,
  type WebGLRenderer,
} from "three";
import { FINE_POINTER } from "@/lib/motion";
import { heroState } from "@/lib/webgl";
import { onThemeChange, token } from "./colors";
import { FLUID, FluidSim } from "./fluid";
import { NOISE, PALETTE, QUAD_VERTEX } from "./glsl";
import { rasterize, type Box } from "./rasterize";
import { precompile } from "./precompile";
import { addStage, layer, ORDER } from "./stage";

const QUAD_CAMERA = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

/*
 * Hero reveal (noth.in): the pointer stirs a fluid; where its dye is dense enough, a second layer
 * shows through – a red plane with the name in slowly flowing red-gold metal.
 *
 * Layering: while the reveal runs the canvas sits *under* the hero copy (stage.ts → layer), so the
 * tagline, buttons and status bar stay on top of the liquid. That is why WebGL also draws the
 * plain name outside the blob: the DOM marquee is hidden (html[data-hero-gl]) and the shader
 * samples a texture of the very same glyphs, positioned every frame from the DOM track that
 * HeroMotion keeps moving. The moment the letters start to scatter (or anything is unsure – a
 * resize, a lost texture) the DOM name takes over again, pixel for pixel in the same place.
 */

const FRAGMENT = /* glsl */ `
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uName;     // glyph coverage of one marquee copy: r = name, g = red dash
uniform sampler2D uDye;
uniform vec2 uDyeTexel;
uniform sampler2D uVelocity;
uniform vec4 uRect;          // hero section, viewport CSS px (left, top, width, height)
uniform vec4 uCopy[3];       // glyph box of the first copy of every visible row, viewport CSS px
uniform int uRows;
uniform vec3 uFg;
uniform vec3 uDash;
uniform vec3 uPlane;
uniform float uBase;         // 1 while WebGL draws the plain name instead of the DOM
uniform float uReveal;       // fades the revealed layer in and out
uniform float uEm;           // font size in px – scales the metal pattern with the type
uniform float uTime;

${PALETTE}
${NOISE}

// Glyph coverage at p (r = name, g = red dash). Every row repeats its copy seamlessly – so does
// the texture (fract); the rows never overlap. textureLod: the texture has no mipmaps, and reads
// without derivatives inside loops and branches keep the Direct3D shader compiler (Windows) from
// unrolling the shader into something that stalls integrated GPUs until the context is lost.
vec2 coverage(vec2 p) {
  vec2 c = vec2(0.0);
  for (int i = 0; i < 3; i++) {
    if (i >= uRows) break;
    vec2 n = (p - uCopy[i].xy) / uCopy[i].zw;
    if (n.y > 0.0 && n.y < 1.0) c += textureLod(uName, vec2(fract(n.x), 1.0 - n.y), 0.0).rg;
  }
  return c;
}

// Dark red shadows → gold → white-gold shine. No mid red: the letters must stand out from the plane.
vec3 metalRamp(float x) {
  vec3 c = mix(RED_950, RED_600, smoothstep(0.0, 0.3, x));
  c = mix(c, GOLD, smoothstep(0.3, 0.58, x));
  c = mix(c, GOLD_SOFT, smoothstep(0.58, 0.82, x));
  return mix(c, SHINE, smoothstep(0.82, 1.0, x));
}

float surface(vec2 q, float t) {
  vec2 warp = vec2(fbm(q * 0.8 + vec2(0.0, t * 0.05)), fbm(q * 0.8 + vec2(5.2, -t * 0.04)));
  return fbm(q * 1.0 + warp * 1.5 + t * 0.02);
}

// Liquid metal: a slowly warped height field reflects a fake studio environment – broad bright
// bands above the horizon, dark below – and one sharp highlight. The fluid drags the pattern along.
vec3 metal(vec2 q, vec2 flow, float t) {
  q -= flow * 0.0015;
  float e = 0.02;
  float h = surface(q, t);
  vec2 g = vec2(surface(q + vec2(e, 0.0), t) - h, surface(q + vec2(0.0, e), t) - h) / e;
  vec3 n = normalize(vec3(-g * 0.3, 1.0));
  float env = 0.5 + 0.5 * sin(4.8 * (n.y * 1.8 + n.x * 0.6) + h * 5.0 + t * 0.15);
  float spec = pow(max(dot(n, normalize(vec3(-0.35, 0.55, 1.0))), 0.0), 50.0);
  return metalRamp(pow(env, 1.9) * 0.9 + spec * 0.5);
}

float glyphAt(vec2 p) {
  vec2 c = coverage(p);
  return min(c.r + c.g, 1.0);
}

void main() {
  vec2 p = uRect.xy + vec2(vUv.x, 1.0 - vUv.y) * uRect.zw;

  vec2 cov = coverage(p);
  float glyph = min(cov.r + cov.g, 1.0);

  // noth.in mask: smoothstep(0.5, 0.51, dye * 3.9) – a sharp yet organic edge, antialiased.
  // A slightly blurred read rounds off the small wobbles of the contour.
  vec2 o = uDyeTexel * 1.5;
  float dye = texture(uDye, vUv).r * 2.0
    + texture(uDye, vUv + vec2(o.x, 0.0)).r + texture(uDye, vUv - vec2(o.x, 0.0)).r
    + texture(uDye, vUv + vec2(0.0, o.y)).r + texture(uDye, vUv - vec2(0.0, o.y)).r;
  float d = dye / 6.0 * 3.9;
  float w = max(fwidth(d), 0.01);
  float mask = smoothstep(0.5 - 0.5 * w, 0.5 + 0.5 * w, d) * uReveal;

  vec3 baseColor = cov.g > cov.r ? uDash : uFg;
  float baseAlpha = glyph * uBase;

  vec3 inner = uPlane;
  if (mask > 0.0 && glyph > 0.0) {
    vec2 flow = textureLod(uVelocity, vUv, 0.0).xy;
    vec3 m = metal(p / uEm, flow, uTime);
    // Bevel: light from the top left catches one side of every stroke, the other falls into shade.
    float b = 0.012 * uEm;
    float edge = glyphAt(p + vec2(b, b)) - glyphAt(p - vec2(b, b));
    m = mix(m, SHINE, max(-edge, 0.0) * 0.5);
    m = mix(m, RED_950, max(edge, 0.0) * 0.55);
    inner = mix(uPlane, m, glyph);
  }

  float alpha = baseAlpha * (1.0 - mask) + mask;
  vec3 premultiplied = baseColor * baseAlpha * (1.0 - mask) + inner * mask;
  outColor = alpha > 0.0 ? vec4(premultiplied / alpha, alpha) : vec4(0.0);
}`;

/** The fluid falls asleep this long after the last splat – its dye is gone by then. */
const SLEEP_AFTER = 4.5;
/** Width of the splat (gaussian sigma) relative to the font size – the stroke scales with the letters. */
const SPLAT_EM = 0.075;
/** Fade of the revealed layer when the letters start to scatter. */
const FADE = 0.35;
/** Scatter progress below which the letters still stand exactly where the texture has them. */
const AT_REST = 0.004;


class HeroRevealLayer {
  readonly mesh: Mesh<PlaneGeometry, RawShaderMaterial>;
  private readonly sim: FluidSim;
  /** First copy of every marquee row (rows hidden by CSS have an empty rect). */
  private readonly copies: HTMLElement[];
  private em = 300;
  private readonly fine = window.matchMedia(FINE_POINTER).matches;
  private readonly cleanups: (() => void)[] = [];
  private texture: CanvasTexture | null = null;
  /** Glyph box of the first copy relative to the copy's own rect (glyphs overflow the tight line box). */
  private glyph = { dy: 0, height: 1 };
  private rect = new DOMRect();
  private visible = false;
  private stale = true;
  private resizedAt = 0;
  private live = false;
  /** The composite and the fluid passes are compiled – drawing earlier would wait for them. */
  private compiled = false;
  private reveal = 0;
  private time = 0;
  private dt = 0;
  private awakeUntil = 0;
  private asleep = true;
  private pointer = { x: 0, y: 0, lastX: 0, lastY: 0, prevX: 0, prevY: 0, inside: false, fresh: false };

  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly hero: HTMLElement,
  ) {
    this.copies = Array.from(hero.querySelectorAll<HTMLElement>("[data-marquee-track] > [data-marquee-copy]:first-child"));
    this.rect = hero.getBoundingClientRect();
    this.sim = new FluidSim(renderer, this.rect.width / Math.max(1, this.rect.height));

    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: QUAD_VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uName: { value: null },
        uDye: { value: null },
        uDyeTexel: { value: new Vector2() },
        uVelocity: { value: null },
        uRect: { value: new Vector4() },
        uCopy: { value: [new Vector4(), new Vector4(), new Vector4()] },
        uRows: { value: 0 },
        uFg: { value: new Vector3() },
        uDash: { value: new Vector3() },
        uPlane: { value: new Vector3() },
        uBase: { value: 0 },
        uReveal: { value: 0 },
        uEm: { value: 300 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: NormalBlending,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.readColors();
    // Compile the composite and the fluid passes while the page is idle; the DOM name stays until
    // both are ready – a frame that used them earlier would wait for the compiler (half a second on
    // integrated GPUs).
    let pending = 2;
    const compiled = () => {
      if (--pending === 0) this.compiled = true;
    };
    this.cleanups.push(precompile(renderer, [{ object: this.mesh, camera: QUAD_CAMERA }], compiled), this.sim.warmUp(compiled));

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.pointer.fresh = true;
    };
    const onLeave = () => (this.pointer.inside = false);
    const onResize = () => {
      this.stale = true;
      this.resizedAt = performance.now();
    };
    const io = new IntersectionObserver(([entry]) => (this.visible = !!entry?.isIntersecting));
    io.observe(hero);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    this.cleanups.push(
      () => io.disconnect(),
      () => window.removeEventListener("pointermove", onMove),
      () => document.documentElement.removeEventListener("pointerleave", onLeave),
      () => window.removeEventListener("resize", onResize),
      onThemeChange(() => this.readColors()),
    );
  }

  /** Stage hook – decides who draws the name, the canvas layer and whether a frame is needed. */
  prepare = (time: number): boolean => {
    this.dt = this.time ? Math.min(time - this.time, 0.1) : 0;
    this.time = time;
    this.rect = this.hero.getBoundingClientRect();

    const atRest = heroState.ready && heroState.scatter < AT_REST;
    if (this.stale && atRest && this.visible && performance.now() - this.resizedAt > 250) this.rebuild();

    const live = this.compiled && this.visible && atRest && !this.stale && !!this.texture;
    if (live !== this.live) {
      this.live = live;
      // The DOM name hides in the same frame in which WebGL first draws it (and vice versa).
      if (live) document.documentElement.dataset.heroGl = "";
      else delete document.documentElement.dataset.heroGl;
    }
    this.reveal = Math.min(1, Math.max(0, this.reveal + ((live ? 1 : -1) * this.dt) / FADE));

    const drawing = this.visible && (live || this.reveal > 0);
    layer.under = drawing;
    if (drawing) this.hero.dataset.surface = "fluid";
    else if (this.hero.dataset.surface === "fluid") delete this.hero.dataset.surface;
    this.mesh.visible = drawing;
    return drawing;
  };

  /** useFrame – pointer input, one fluid step, uniforms. Runs only on frames the stage asked for. */
  frame() {
    if (!this.mesh.visible) return;
    const dt = this.dt;
    if (this.live) this.input();

    // Splat size in the simulation's units (uv of the hero height, squared), from the font size.
    const sigma = Math.max(SPLAT_EM * this.em, this.fine ? 24 : 34) / Math.max(1, this.rect.height);
    this.sim.radius = sigma * sigma;
    if (this.time < this.awakeUntil) {
      this.sim.step(Math.max(dt, 1 / 240));
      this.asleep = false;
    } else if (!this.asleep) {
      this.sim.clear();
      this.asleep = true;
    }

    const u = this.mesh.material.uniforms;
    u.uRect!.value.set(this.rect.left, this.rect.top, this.rect.width, this.rect.height);
    let rows = 0;
    for (const copy of this.copies) {
      const r = copy.getBoundingClientRect();
      if (r.height <= 0 || rows >= 3) continue;
      (u.uCopy!.value as Vector4[])[rows]!.set(r.left, r.top + this.glyph.dy, r.width, this.glyph.height);
      rows++;
    }
    u.uRows!.value = rows;
    u.uName!.value = this.texture;
    u.uDye!.value = this.sim.dye;
    u.uDyeTexel!.value.copy(this.sim.dyeTexel);
    u.uVelocity!.value = this.sim.velocityTexture;
    u.uBase!.value = this.live ? 1 : 0;
    u.uReveal!.value = this.reveal;
    u.uTime!.value = this.time;
  }

  dispose() {
    this.cleanups.forEach((fn) => fn());
    delete document.documentElement.dataset.heroGl;
    if (this.hero.dataset.surface === "fluid") delete this.hero.dataset.surface;
    layer.under = false;
    this.sim.dispose();
    this.texture?.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  /** Splats along the pointer path (mouse), or along a Lissajous curve on touch screens. */
  private input() {
    const p = this.pointer;
    const r = this.rect;
    let x = p.x;
    let y = p.y;
    if (this.fine) {
      if (!p.fresh) return;
      p.fresh = false;
    } else {
      // Touch screens: the blob wanders on its own, slowly, through the rows of the name.
      const t = this.time * 0.3;
      x = r.left + r.width * (0.5 + 0.38 * Math.sin(t + 0.3));
      y = r.top + r.height * (0.64 + 0.2 * Math.sin(t * 1.618));
    }
    const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (inside && p.inside) this.stroke(x, y);
    else {
      p.prevX = p.lastX = x;
      p.prevY = p.lastY = y;
    }
    p.inside = inside;
  }

  /**
   * Splats along a smooth curve through the pointer samples – a quadratic Bézier from the middle of
   * the previous segment to the middle of the new one, bending around the previous sample (how
   * drawing apps smooth a stroke). A polyline has a corner at every sample, and each corner flung
   * the dye sideways into a lump; along the curve the force follows its tangent instead.
   */
  private stroke(x: number, y: number) {
    const p = this.pointer;
    const ax = (p.prevX + p.lastX) / 2;
    const ay = (p.prevY + p.lastY) / 2;
    const bx = (p.lastX + x) / 2;
    const by = (p.lastY + y) / 2;
    const cx = p.lastX;
    const cy = p.lastY;
    p.prevX = p.lastX;
    p.prevY = p.lastY;
    p.lastX = x;
    p.lastY = y;
    const length = Math.hypot(cx - ax, cy - ay) + Math.hypot(bx - cx, by - cy);
    if (length < 0.5) return;

    const steps = Math.min(12, Math.ceil(length / 10));
    let qx = ax;
    let qy = ay;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const s = 1 - t;
      const nx = s * s * ax + 2 * s * t * cx + t * t * bx;
      const ny = s * s * ay + 2 * s * t * cy + t * t * by;
      this.splatAt(nx, ny, nx - qx, ny - qy);
      qx = nx;
      qy = ny;
    }
    this.awakeUntil = this.time + SLEEP_AFTER;
  }

  /** One splat at viewport point (x, y) moving by (dx, dy) px since the previous one. */
  private splatAt(x: number, y: number, dx: number, dy: number) {
    const r = this.rect;
    // Uv deltas → isotropic force on the square-celled grid (the hero is wider than tall, or not).
    const aspect = r.width / Math.max(1, r.height);
    const fx = (dx / r.width) * Math.min(1, aspect);
    const fy = -dy / r.height / Math.max(1, aspect);
    // The same amount of dye per px of path, however fast the pointer moves (a resting, jittering
    // pointer must not pile up a puddle).
    const dye = (FLUID.dye * Math.min(Math.hypot(dx, dy), 24)) / 16;
    this.sim.splat((x - r.left) / r.width, 1 - (y - r.top) / r.height, fx, fy, dye);
  }

  /** Rasterises the first marquee copy (glyph coverage only) – needs the letters at rest. */
  private rebuild() {
    const copy = this.copies[0];
    if (!copy) return;
    const copyRect = copy.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(copy);
    let top = Infinity;
    let bottom = -Infinity;
    for (const r of range.getClientRects()) {
      if (r.width && r.height) {
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
      }
    }
    range.detach();
    if (!Number.isFinite(top) || copyRect.width < 1) return;

    const pad = 2;
    const box: Box = { left: copyRect.left, top: top - pad, width: copyRect.width, height: bottom - top + pad * 2 };
    const max = this.renderer.capabilities.maxTextureSize;
    const scale = Math.min(this.renderer.getPixelRatio(), max / box.width, max / box.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(box.width * scale);
    canvas.height = Math.ceil(box.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    rasterize(copy, box, ctx, {
      scale,
      textOnly: true,
      textColor: (el) => (el.closest(".text-red-text") ? "#00ff00" : "#ff0000"),
    });

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = NoColorSpace;
    texture.premultiplyAlpha = true; // r and g are then plain coverage
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapS = RepeatWrapping;
    this.texture?.dispose();
    this.texture = texture;
    this.glyph = { dy: box.top - copyRect.top, height: box.height };
    this.em = parseFloat(getComputedStyle(copy).fontSize) || 300;
    this.mesh.material.uniforms.uEm!.value = this.em;

    this.sim.allocate(this.rect.width / Math.max(1, this.rect.height));
    this.awakeUntil = 0;
    this.stale = false;
  }

  private readColors() {
    const u = this.mesh.material.uniforms;
    token("--fg", u.uFg!.value);
    token("--red-text", u.uDash!.value);
    token("--red-500", u.uPlane!.value);
  }
}

function HeroLayer({ hero }: { hero: HTMLElement }) {
  const gl = useThree((state) => state.gl);
  const [reveal, setReveal] = useState<HeroRevealLayer | null>(null);
  const current = useRef<HeroRevealLayer | null>(null);

  useEffect(() => {
    const instance = new HeroRevealLayer(gl, hero);
    current.current = instance;
    setReveal(instance);
    const remove = addStage(instance.prepare, ORDER.hero);
    return () => {
      remove();
      instance.dispose();
      current.current = null;
    };
  }, [gl, hero]);

  useFrame(() => current.current?.frame());
  return reveal ? <primitive object={reveal.mesh} /> : null;
}

/** The hero reveal, drawn into a View that tracks the hero section. */
export function HeroReveal() {
  const [hero] = useState(() => document.getElementById("top"));
  const track = useMemo(() => ({ current: hero }), [hero]);
  if (!hero || !track.current || !hero.querySelector("[data-marquee-copy]")) return null;
  return (
    <View track={track as { current: HTMLElement }}>
      <HeroLayer hero={hero} />
    </View>
  );
}
