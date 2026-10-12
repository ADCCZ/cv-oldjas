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
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Vector2,
  Vector4,
  type WebGLRenderer,
} from "three";
import { FINE_POINTER } from "@/lib/motion";
import { QUAD_VERTEX } from "./glsl";
import { precompile } from "./precompile";
import { rasterize } from "./rasterize";
import { addStage, layer, ORDER } from "./stage";
import { WaterSim } from "./water";

/*
 * Water ripples on the project covers (juncastudio.com): the cursor drops rings into a height
 * field and the cover is drawn through that surface – refracted, with RGB dispersion (red bends
 * more than blue), shading by the normal, a Blinn-Phong highlight from a light above the cursor
 * and caustics where wavefronts converge. Calm water is a single texture read.
 *
 * The cover itself stays DOM (link, "View project" cursor, parallax). When the pointer enters it,
 * the cover is rasterised from the DOM (rasterize.ts – or its screenshot, once there is one) and
 * WebGL draws it on top for as long as the water moves; once calm, the canvas lets the DOM show
 * again. Mouse only – touch screens get no ripples.
 */

const FRAGMENT = /* glsl */ `
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uWater;
uniform sampler2D uLayer;   // the cover image layer (oversized, moved by the parallax), page colours
uniform sampler2D uTags;    // the tags on the cover, in cover space
uniform vec2 uTexel;        // one water cell in uv
uniform vec4 uRect;         // cover, viewport CSS px
uniform vec4 uLayerRect;    // image layer, viewport CSS px
uniform vec2 uClip;         // visible column of the projects strip (left, right), CSS px
uniform vec2 uLight;        // cursor in cover uv
uniform float uAspect;

const float REFRACTION = 2.4;
const float DISPERSION = 0.6;
const float SHADING = 0.4;
const float SPECULAR = 0.25;
const float SHININESS = 80.0;
const float CAUSTICS = 1.4;

vec2 toPage(vec2 uv) {
  return uRect.xy + vec2(uv.x, 1.0 - uv.y) * uRect.zw;
}

// The cover as the page shows it: the parallax-shifted image layer, the tags on top.
// (textureLod: no mipmaps anyway, and no derivatives needed after the early return below.)
vec3 cover(vec2 uv) {
  vec2 l = (toPage(uv) - uLayerRect.xy) / uLayerRect.zw;
  vec3 c = textureLod(uLayer, vec2(l.x, 1.0 - l.y), 0.0).rgb;
  vec4 t = textureLod(uTags, uv, 0.0);
  return mix(c, t.rgb, t.a);
}

float height(vec2 uv) {
  return textureLod(uWater, uv, 0.0).r;
}

void main() {
  vec2 p = toPage(vUv);
  if (p.x < uClip.x || p.x > uClip.y) discard;

  float hL = height(vUv - vec2(uTexel.x, 0.0));
  float hR = height(vUv + vec2(uTexel.x, 0.0));
  float hB = height(vUv - vec2(0.0, uTexel.y));
  float hT = height(vUv + vec2(0.0, uTexel.y));
  vec2 slope = vec2(hR - hL, hT - hB);
  if (abs(slope.x) + abs(slope.y) < 1e-4) {
    outColor = vec4(cover(vUv), 1.0);
    return;
  }

  // Refraction, fading out over the last 8 % towards the edges (nothing to sample beyond them).
  float border = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  // (Clamped: a fresh drop is steep – unclamped, small text would shatter into colour noise.)
  vec2 offset = slope * REFRACTION * 0.12;
  offset *= min(1.0, 0.018 / max(length(offset), 1e-5)) * smoothstep(0.0, 0.08, border);
  vec3 color = vec3(
    cover(vUv - offset * (1.0 + DISPERSION * 0.5)).r,
    cover(vUv - offset).g,
    cover(vUv - offset * (1.0 - DISPERSION * 0.5)).b
  );

  vec3 n = normalize(vec3(-slope * 6.0, 1.0));
  color *= 1.0 + dot(n.xy, vec2(-0.6, 0.8)) * SHADING;

  vec3 l = normalize(vec3((uLight - vUv) * vec2(uAspect, 1.0), 0.35));
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  color += pow(max(dot(n, h), 0.0), SHININESS) * SPECULAR;

  // Caustics: where the surface curves inwards, the light under it gathers.
  float curvature = hL + hR + hB + hT - 4.0 * height(vUv);
  color += max(-curvature, 0.0) * CAUSTICS * 6.0;

  outColor = vec4(color, 1.0);
}`;

/** The water calms down this long after the last drop. */
const SETTLE = 2;
/** Spacing of drops along the cursor path (cover uv). */
const DROP_SPACING = 0.02;

type Textures = { layer: CanvasTexture; tags: CanvasTexture };

function canvasTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace; // page colours straight through, like the DOM
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

class RippleLayer {
  readonly mesh: Mesh<PlaneGeometry, RawShaderMaterial>;
  /** Tracked by the View – always the cover the water is on. */
  readonly track: { current: HTMLElement };
  private readonly sim: WaterSim;
  private readonly cache = new Map<HTMLElement, Textures>();
  private readonly clip: HTMLElement | null;
  private readonly cleanups: (() => void)[] = [];
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private active: HTMLElement | null = null;
  private hovered: HTMLElement | null = null;
  private pointer = { x: 0, y: 0, lastX: 0, lastY: 0, moved: false };
  private time = 0;
  private dt = 0;
  private calmAt = 0;

  constructor(
    private readonly renderer: WebGLRenderer,
    covers: HTMLElement[],
  ) {
    this.track = { current: covers[0]! };
    this.clip = covers[0]!.closest<HTMLElement>("[data-projects-clip]");
    this.sim = new WaterSim(renderer);
    this.mesh = new Mesh(
      new PlaneGeometry(2, 2),
      new RawShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: QUAD_VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uWater: { value: null },
          uLayer: { value: null },
          uTags: { value: null },
          uTexel: { value: new Vector2() },
          uRect: { value: new Vector4() },
          uLayerRect: { value: new Vector4() },
          uClip: { value: new Vector2(-1e5, 1e5) },
          uLight: { value: new Vector2(0.5, 0.5) },
          uAspect: { value: 1.6 },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.warmUp(covers);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.pointer.moved = true;
      this.hovered = (event.target as Element | null)?.closest?.<HTMLElement>("[data-cover]") ?? null;
    };
    // Covers are rasterised at their current size – a resize makes every cached texture stale.
    const onResize = () => this.dropCache();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    this.cleanups.push(
      () => window.removeEventListener("pointermove", onMove),
      () => window.removeEventListener("resize", onResize),
    );
  }

  /** Stage hook: a frame is needed while some cover's water moves and it is on screen. */
  prepare = (time: number): boolean => {
    this.dt = this.time ? Math.min(time - this.time, 0.1) : 0;
    this.time = time;

    // The pointer moved (or the strip scrolled it) onto another cover: the water moves there.
    if (this.hovered && this.hovered !== this.active && !layer.under) this.activate(this.hovered);
    if (this.active && this.hovered !== this.active && this.time > this.calmAt) this.deactivate();

    const rect = this.active?.getBoundingClientRect();
    const onScreen = !!rect && rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
    const draw = !!this.active && onScreen && !layer.under;
    this.mesh.visible = draw;
    return draw;
  };

  /** useFrame – drops along the cursor path, water steps, uniforms. */
  frame() {
    const cover = this.active;
    if (!cover || !this.mesh.visible) return;
    const r = cover.getBoundingClientRect();
    const toUv = (x: number, y: number) => [(x - r.left) / r.width, 1 - (y - r.top) / r.height] as const;

    if (this.pointer.moved && this.hovered === cover) {
      const [u0, v0] = toUv(this.pointer.lastX, this.pointer.lastY);
      const [u1, v1] = toUv(this.pointer.x, this.pointer.y);
      const steps = Math.min(4, Math.max(1, Math.ceil(Math.hypot(u1 - u0, v1 - v0) / DROP_SPACING)));
      for (let i = 1; i <= steps; i++) this.sim.addDrop(u0 + ((u1 - u0) * i) / steps, v0 + ((v1 - v0) * i) / steps);
      this.calmAt = this.time + SETTLE;
    }
    this.pointer.moved = false;
    this.pointer.lastX = this.pointer.x;
    this.pointer.lastY = this.pointer.y;
    this.sim.update(this.dt);

    const u = this.mesh.material.uniforms;
    const layerEl = cover.querySelector<HTMLElement>("[data-parallax]");
    const l = layerEl?.getBoundingClientRect() ?? r;
    const clip = this.clip?.getBoundingClientRect();
    u.uWater!.value = this.sim.texture;
    u.uTexel!.value.copy(this.sim.texel);
    u.uRect!.value.set(r.left, r.top, r.width, r.height);
    u.uLayerRect!.value.set(l.left, l.top, l.width, l.height);
    if (clip) u.uClip!.value.set(clip.left, clip.right);
    u.uLight!.value.set(...toUv(this.pointer.x, this.pointer.y));
    u.uAspect!.value = r.width / Math.max(1, r.height);
  }

  dispose() {
    this.cleanups.forEach((fn) => fn());
    this.dropCache();
    this.sim.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  /**
   * Gets everything ready before the first hover: shader programs compile in parallel, and the
   * covers are rasterised and uploaded one by one while the browser is idle.
   */
  private warmUp(covers: HTMLElement[]) {
    this.cleanups.push(this.sim.warmUp(), precompile(this.renderer, [{ object: this.mesh, camera: this.camera }]));
    const idle = (fn: () => void) =>
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 3000 }) : window.setTimeout(fn, 200);
    let disposed = false;
    const next = (i: number) => {
      const cover = covers[i];
      if (disposed || !cover) return;
      if (!this.cache.has(cover)) {
        const textures = this.rasterise(cover);
        if (textures) {
          this.cache.set(cover, textures);
          this.renderer.initTexture(textures.layer);
          this.renderer.initTexture(textures.tags);
        }
      }
      idle(() => next(i + 1));
    };
    idle(() => next(0));
    this.cleanups.push(() => (disposed = true));
  }

  private activate(cover: HTMLElement) {
    const textures = this.cache.get(cover) ?? this.rasterise(cover);
    if (!textures) return;
    this.cache.set(cover, textures);
    this.active = cover;
    this.track.current = cover;
    const r = cover.getBoundingClientRect();
    this.sim.resize(r.width / Math.max(1, r.height));
    this.pointer.lastX = this.pointer.x;
    this.pointer.lastY = this.pointer.y;
    this.calmAt = this.time + SETTLE;
    this.mesh.material.uniforms.uLayer!.value = textures.layer;
    this.mesh.material.uniforms.uTags!.value = textures.tags;
  }

  private deactivate() {
    this.active = null;
    this.mesh.visible = false;
    this.sim.clear();
  }

  /** The cover as the page shows it: its image layer (the frame's colour behind it) and its tags. */
  private rasterise(cover: HTMLElement): Textures | null {
    const frame = cover.querySelector<HTMLElement>("[data-cover-frame]");
    const layerEl = cover.querySelector<HTMLElement>("[data-parallax]");
    if (!frame || !layerEl) return null;
    const scale = Math.min(this.renderer.getPixelRatio(), 2);

    const l = layerEl.getBoundingClientRect();
    const layerCanvas = document.createElement("canvas");
    layerCanvas.width = Math.ceil(l.width * scale);
    layerCanvas.height = Math.ceil(l.height * scale);
    const lctx = layerCanvas.getContext("2d");
    if (!lctx) return null;
    lctx.fillStyle = getComputedStyle(frame).backgroundColor;
    lctx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
    rasterize(layerEl, l, lctx, { scale });

    const r = cover.getBoundingClientRect();
    const tagsCanvas = document.createElement("canvas");
    tagsCanvas.width = Math.ceil(r.width * scale);
    tagsCanvas.height = Math.ceil(r.height * scale);
    const tctx = tagsCanvas.getContext("2d");
    const tags = cover.querySelector<HTMLElement>("[data-cover-tags]");
    if (tctx && tags) rasterize(tags, r, tctx, { scale });

    return { layer: canvasTexture(layerCanvas), tags: canvasTexture(tagsCanvas) };
  }

  private dropCache() {
    this.cache.forEach(({ layer: l, tags }) => {
      l.dispose();
      tags.dispose();
    });
    this.cache.clear();
    if (this.active) this.deactivate();
  }
}

function RippleScene({ layerRef }: { layerRef: { current: RippleLayer | null } }) {
  useFrame(() => layerRef.current?.frame());
  const ripple = layerRef.current;
  return ripple ? <primitive object={ripple.mesh} /> : null;
}

/** Ripples on the project covers – a View that follows whichever cover the water is on. */
export function Ripples() {
  const gl = useThree((state) => state.gl);
  const [covers] = useState(() =>
    window.matchMedia(FINE_POINTER).matches ? Array.from(document.querySelectorAll<HTMLElement>("[data-cover]")) : [],
  );
  const layerRef = useRef<RippleLayer | null>(null);
  const [ripple, setRipple] = useState<RippleLayer | null>(null);

  useEffect(() => {
    if (!covers.length) return;
    const instance = new RippleLayer(gl, covers);
    layerRef.current = instance;
    setRipple(instance);
    const remove = addStage(instance.prepare, ORDER.ripples);
    return () => {
      remove();
      instance.dispose();
      layerRef.current = null;
    };
  }, [gl, covers]);

  const track = useMemo(() => ripple?.track, [ripple]);
  if (!ripple || !track) return null;
  return (
    <View track={track}>
      <RippleScene layerRef={layerRef} />
    </View>
  );
}
