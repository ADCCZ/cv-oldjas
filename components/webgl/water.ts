import {
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RGBAFormat,
  Scene,
  Vector2,
  WebGLRenderTarget,
  type Texture,
  type WebGLRenderer,
} from "three";
import { QUAD_VERTEX } from "./glsl";
import { passJob, precompile } from "./precompile";

/*
 * Height-field water (juncastudio.com): the surface height lives in a half-float texture (r = now,
 * g = one step ago) and follows the discrete wave equation
 *   h(t+1) = (2·h(t) − h(t−1) + c²·∇²h) · damping
 * with an isotropic 9-point Laplacian, so the rings stay round instead of turning into squares.
 * Drops are raised-cosine bumps where the cursor moves.
 */

/** Tuning from the juncastudio analysis (docs/REFERENCES.md). */
export const WATER = {
  resolution: 256,
  /** Steps per second – 2 per frame at 60 fps, the same speed at 120 Hz. */
  stepsPerSecond: 120,
  damping: 0.977,
  /** Wave speed² (cells per step) – below the stability limit of the scheme. */
  c2: 0.4,
  dropRadius: 0.032,
  dropStrength: 0.12,
};

const HEADER = /* glsl */ `
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D state;
uniform vec2 texel;
`;

const STEP = /* glsl */ `${HEADER}
uniform float damping;
uniform float c2;

float h(vec2 o) { return texture(state, vUv + o * texel).r; }

void main() {
  vec2 s = texture(state, vUv).rg;
  float edges = h(vec2(1.0, 0.0)) + h(vec2(-1.0, 0.0)) + h(vec2(0.0, 1.0)) + h(vec2(0.0, -1.0));
  float corners = h(vec2(1.0, 1.0)) + h(vec2(-1.0, 1.0)) + h(vec2(1.0, -1.0)) + h(vec2(-1.0, -1.0));
  float laplacian = (4.0 * edges + corners - 20.0 * s.r) / 6.0;
  float next = (2.0 * s.r - s.g + c2 * laplacian) * damping;
  outColor = vec4(next, s.r, 0.0, 1.0);
}`;

const DROP = /* glsl */ `${HEADER}
uniform vec2 center;
uniform float radius;
uniform float strength;
uniform float aspect;

void main() {
  vec4 s = texture(state, vUv);
  float d = length((vUv - center) * vec2(aspect, 1.0));
  if (d < radius) s.r += strength * 0.5 * (cos(3.14159265 * d / radius) + 1.0);
  outColor = s;
}`;

const CLEAR = /* glsl */ `${HEADER}
void main() { outColor = vec4(0.0); }`;

function target(width: number, height: number) {
  return new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
}

function pass(fragmentShader: string, uniforms: Record<string, { value: unknown }>) {
  return new RawShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: QUAD_VERTEX,
    fragmentShader,
    uniforms: { state: { value: null }, texel: { value: new Vector2() }, ...uniforms },
    depthTest: false,
    depthWrite: false,
  });
}

export class WaterSim {
  readonly texel = new Vector2();
  private read: WebGLRenderTarget;
  private write: WebGLRenderTarget;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: Mesh;
  private readonly drops: [number, number][] = [];
  private aspect = 1;
  private pending = 0;
  private readonly step = pass(STEP, { damping: { value: WATER.damping }, c2: { value: WATER.c2 } });
  private readonly drop = pass(DROP, {
    center: { value: new Vector2() },
    radius: { value: WATER.dropRadius },
    strength: { value: WATER.dropStrength },
    aspect: { value: 1 },
  });
  private readonly clearPass = pass(CLEAR, {});

  constructor(private readonly renderer: WebGLRenderer) {
    this.quad = new Mesh(new PlaneGeometry(2, 2), this.step);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.read = target(1, 1);
    this.write = target(1, 1);
  }

  /** Compiles every pass ahead of the first hover and runs each once. Returns a cancel function. */
  warmUp(): () => void {
    return precompile(this.renderer, [passJob([this.step, this.drop, this.clearPass])], () => {
      this.resize(1.6);
      this.addDrop(0.5, 0.5);
      this.update(1 / 60);
      this.clear();
    });
  }

  /** The surface – `.r` is the height. */
  get texture(): Texture {
    return this.read.texture;
  }

  /** Sizes the grid for a surface of the given aspect (square cells) and calms it. */
  resize(aspect: number) {
    const short = WATER.resolution;
    const [w, h] = aspect >= 1 ? [Math.round(short * aspect), short] : [short, Math.round(short / aspect)];
    this.aspect = aspect;
    if (this.read.width !== w || this.read.height !== h) {
      this.read.setSize(w, h);
      this.write.setSize(w, h);
    }
    this.texel.set(1 / w, 1 / h);
    this.clear();
  }

  /** Queues a drop at uv (x, y). */
  addDrop(x: number, y: number) {
    this.drops.push([x, y]);
  }

  /** Advances the surface by `dt` seconds (fixed steps, so the waves run at the same speed everywhere). */
  update(dt: number) {
    const autoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    for (const [x, y] of this.drops) {
      const u = this.drop.uniforms;
      (u.center!.value as Vector2).set(x, y);
      u.aspect!.value = this.aspect;
      this.run(this.drop);
    }
    this.drops.length = 0;
    this.pending = Math.min(this.pending + dt * WATER.stepsPerSecond, 4);
    while (this.pending >= 1) {
      this.run(this.step);
      this.pending -= 1;
    }
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = autoClear;
  }

  clear() {
    const autoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.run(this.clearPass);
    this.run(this.clearPass);
    this.drops.length = 0;
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = autoClear;
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
    this.step.dispose();
    this.drop.dispose();
    this.clearPass.dispose();
    this.quad.geometry.dispose();
  }

  private run(material: RawShaderMaterial) {
    material.uniforms.state!.value = this.read.texture;
    material.uniforms.texel!.value.copy(this.texel);
    this.quad.material = material;
    this.renderer.setRenderTarget(this.write);
    this.renderer.render(this.scene, this.camera);
    [this.read, this.write] = [this.write, this.read];
  }
}
