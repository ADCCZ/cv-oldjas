import {
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RGBAFormat,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  type IUniform,
  type MagnificationTextureFilter,
  type Texture,
  type WebGLRenderer,
} from "three";
import { passJob, precompile } from "./precompile";

/*
 * Stable fluids (Jos Stam, 1999) on the GPU – the technique behind the noth.in hero reveal.
 * Each step: splat forces and dye where the pointer moved → make the velocity divergence-free
 * (divergence → 20 Jacobi iterations of the pressure Poisson equation → subtract the pressure
 * gradient) → carry velocity and dye along the velocity field (semi-Lagrangian advection).
 * Velocity is stored in texels per second of the simulation grid; dye is a single channel used as
 * a reveal mask. Every pass is one full-screen quad rendered into a half-float target.
 */

/**
 * Tuning – values from the noth.in analysis (docs/REFERENCES.md); dissipation is per 60 fps frame.
 * Only the splat radius differs: their 6e-5 gives a hairline here (their splat seems to be scaled
 * differently). The hero sets `radius` from its font size instead, so the stroke scales with the
 * letters; this is just the default.
 */
export const FLUID = {
  simResolution: 256,
  dyeResolution: 512,
  pressureIterations: 20,
  pressureDecay: 0.8,
  velocityDissipation: 0.962,
  dyeDissipation: 0.988,
  splatForce: 5900,
  splatRadius: 1e-3,
  /** Dye laid down per 16 px of pointer path. */
  dye: 1.1,
  curl: 0,
};

const VERTEX = /* glsl */ `
precision highp float;
in vec3 position;
uniform vec2 texel;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0);
  vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y);
  vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/* highp samplers: velocities reach hundreds of texels/s, lowp would clamp them on mobile GPUs. */
const HEADER = /* glsl */ `
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

/** Adds a gaussian blob of `value` around `point` (uv). x is scaled by the aspect, so it is round. */
const SPLAT = /* glsl */ `${HEADER}
uniform sampler2D target;
uniform float aspect;
uniform vec3 value;
uniform vec2 point;
uniform float radius;

void main() {
  vec2 p = vUv - point;
  p.x *= aspect;
  vec3 splat = exp(-dot(p, p) / radius) * value;
  outColor = vec4(texture(target, vUv).xyz + splat, 1.0);
}`;

/** Semi-Lagrangian advection: look back along the velocity and take what was there. */
const ADVECT = /* glsl */ `${HEADER}
uniform sampler2D velocity;
uniform sampler2D source;
uniform vec2 velocityTexel;
uniform float dt;
uniform float dissipation;

void main() {
  vec2 coord = vUv - dt * texture(velocity, vUv).xy * velocityTexel;
  outColor = dissipation * texture(source, coord);
}`;

/** Divergence with no-slip walls: velocity pointing out of the domain is mirrored. */
const DIVERGENCE = /* glsl */ `${HEADER}
uniform sampler2D velocity;

void main() {
  float L = texture(velocity, vL).x;
  float R = texture(velocity, vR).x;
  float T = texture(velocity, vT).y;
  float B = texture(velocity, vB).y;
  vec2 C = texture(velocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

/** Vorticity: the curl of the velocity field (optional, gives the swirls more bite). */
const CURL = /* glsl */ `${HEADER}
uniform sampler2D velocity;

void main() {
  float L = texture(velocity, vL).y;
  float R = texture(velocity, vR).y;
  float T = texture(velocity, vT).x;
  float B = texture(velocity, vB).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

/** Vorticity confinement: pushes along the curl gradient, so small eddies are not damped away. */
const VORTICITY = /* glsl */ `${HEADER}
uniform sampler2D velocity;
uniform sampler2D curl;
uniform float strength;
uniform float dt;

void main() {
  float L = texture(curl, vL).x;
  float R = texture(curl, vR).x;
  float T = texture(curl, vT).x;
  float B = texture(curl, vB).x;
  float C = texture(curl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= strength * C;
  force.y *= -1.0;
  vec2 v = texture(velocity, vUv).xy + force * dt;
  outColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`;

/** One Jacobi iteration of the pressure Poisson equation ∇²p = ∇·v. */
const PRESSURE = /* glsl */ `${HEADER}
uniform sampler2D pressure;
uniform sampler2D divergence;

void main() {
  float L = texture(pressure, vL).x;
  float R = texture(pressure, vR).x;
  float T = texture(pressure, vT).x;
  float B = texture(pressure, vB).x;
  float div = texture(divergence, vUv).x;
  outColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

/** v − ∇p: what is left is divergence-free – the fluid swirls instead of compressing. */
const GRADIENT = /* glsl */ `${HEADER}
uniform sampler2D pressure;
uniform sampler2D velocity;

void main() {
  float L = texture(pressure, vL).x;
  float R = texture(pressure, vR).x;
  float T = texture(pressure, vT).x;
  float B = texture(pressure, vB).x;
  vec2 v = texture(velocity, vUv).xy - vec2(R - L, T - B);
  outColor = vec4(v, 0.0, 1.0);
}`;

/** Multiplies a field – damps the previous pressure as the solver's starting guess, or clears it. */
const SCALE = /* glsl */ `${HEADER}
uniform sampler2D source;
uniform float factor;

void main() {
  outColor = factor * texture(source, vUv);
}`;

function target(width: number, height: number, filter: MagnificationTextureFilter): WebGLRenderTarget {
  return new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
}

/** Two targets that swap roles every pass: read the previous state, write the next one. */
class PingPong {
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;

  constructor(width: number, height: number, filter: MagnificationTextureFilter) {
    this.read = target(width, height, filter);
    this.write = target(width, height, filter);
  }

  swap() {
    [this.read, this.write] = [this.write, this.read];
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

/** Grid size for a domain: `base` cells on the short side, square cells. */
function gridSize(base: number, aspect: number): [number, number] {
  const long = Math.round(base * (aspect >= 1 ? aspect : 1 / aspect));
  return aspect >= 1 ? [long, base] : [base, long];
}

function pass(fragmentShader: string, uniforms: Record<string, IUniform>): RawShaderMaterial {
  return new RawShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: VERTEX,
    fragmentShader,
    uniforms: { texel: { value: new Vector2() }, ...uniforms },
    depthTest: false,
    depthWrite: false,
  });
}

type Splat = { x: number; y: number; dx: number; dy: number; dye: number };

export class FluidSim {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: Mesh;
  private readonly splats: Splat[] = [];
  private readonly splatValue = new Vector3();
  private readonly simTexel = new Vector2();
  /** One cell of the dye grid in uv. */
  readonly dyeTexel = new Vector2();

  private readonly passes = {
    splat: pass(SPLAT, {
      target: { value: null },
      aspect: { value: 1 },
      value: { value: new Vector3() },
      point: { value: new Vector2() },
      radius: { value: FLUID.splatRadius },
    }),
    advect: pass(ADVECT, {
      velocity: { value: null },
      source: { value: null },
      velocityTexel: { value: new Vector2() },
      dt: { value: 0 },
      dissipation: { value: 1 },
    }),
    divergence: pass(DIVERGENCE, { velocity: { value: null } }),
    curl: pass(CURL, { velocity: { value: null } }),
    vorticity: pass(VORTICITY, {
      velocity: { value: null },
      curl: { value: null },
      strength: { value: FLUID.curl },
      dt: { value: 0 },
    }),
    pressure: pass(PRESSURE, { pressure: { value: null }, divergence: { value: null } }),
    gradient: pass(GRADIENT, { pressure: { value: null }, velocity: { value: null } }),
    scale: pass(SCALE, { source: { value: null }, factor: { value: 1 } }),
  };

  /** Gaussian splat radius in (uv of the domain height)², see FLUID.splatRadius. */
  radius = FLUID.splatRadius;
  private aspect = 1;
  private autoClear = true;
  private velocity!: PingPong;
  private dyeField!: PingPong;
  private pressure!: PingPong;
  private divergence!: WebGLRenderTarget;
  private curl!: WebGLRenderTarget;

  constructor(renderer: WebGLRenderer, aspect: number) {
    this.renderer = renderer;
    this.quad = new Mesh(new PlaneGeometry(2, 2), this.passes.splat);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.allocate(aspect);
  }

  /** The dye field – `.r` is the reveal amount. */
  get dye(): Texture {
    return this.dyeField.read.texture;
  }

  get velocityTexture(): Texture {
    return this.velocity.read.texture;
  }

  /** (Re)allocates every field for a domain of the given aspect (the hero was resized). Clears the fluid. */
  allocate(aspect: number, resolution = FLUID.simResolution) {
    this.disposeTargets();
    this.aspect = aspect;
    const [sw, sh] = gridSize(resolution, aspect);
    const [dw, dh] = gridSize(Math.round((resolution * FLUID.dyeResolution) / FLUID.simResolution), aspect);
    this.simTexel.set(1 / sw, 1 / sh);
    this.dyeTexel.set(1 / dw, 1 / dh);
    this.velocity = new PingPong(sw, sh, LinearFilter);
    this.dyeField = new PingPong(dw, dh, LinearFilter);
    this.pressure = new PingPong(sw, sh, NearestFilter);
    this.divergence = target(sw, sh, NearestFilter);
    this.curl = target(sw, sh, NearestFilter);
    this.splats.length = 0;
    this.clear();
  }

  /**
   * Prepares every pass before the first stroke: the programs compile in the background
   * (precompile.ts), then each pass runs once into the real targets. Without this the first pointer
   * move over the hero froze the page for a moment on integrated GPUs. Returns a cancel function.
   */
  warmUp(done?: () => void): () => void {
    return precompile(this.renderer, [passJob(Object.values(this.passes))], () => {
      this.prime();
      done?.();
    });
  }

  /** One empty step through every pass – nothing is left to set up on the first real one. */
  private prime() {
    this.splat(0.5, 0.5, 0, 0, 0);
    this.step(1 / 60);
    this.clear();
  }

  /** Queues a splat at uv (x, y), pushing with (dx, dy) in uv per frame and adding `dye`. */
  splat(x: number, y: number, dx: number, dy: number, dye: number) {
    this.splats.push({ x, y, dx, dy, dye });
  }

  /** Advances the fluid by `dt` seconds. */
  step(dt: number) {
    const p = this.passes;
    this.begin();

    for (const s of this.splats) {
      this.drawSplat(this.velocity, this.simTexel, s, this.splatValue.set(s.dx * FLUID.splatForce, s.dy * FLUID.splatForce, 0));
      this.drawSplat(this.dyeField, this.dyeTexel, s, this.splatValue.set(s.dye, 0, 0));
    }
    this.splats.length = 0;

    if (FLUID.curl > 0) {
      p.curl.uniforms.velocity!.value = this.velocity.read.texture;
      this.run(p.curl, this.curl, this.simTexel);
      p.vorticity.uniforms.velocity!.value = this.velocity.read.texture;
      p.vorticity.uniforms.curl!.value = this.curl.texture;
      p.vorticity.uniforms.strength!.value = FLUID.curl;
      p.vorticity.uniforms.dt!.value = dt;
      this.run(p.vorticity, this.velocity.write, this.simTexel);
      this.velocity.swap();
    }

    p.divergence.uniforms.velocity!.value = this.velocity.read.texture;
    this.run(p.divergence, this.divergence, this.simTexel);

    // The previous pressure, damped, is a good first guess – fewer iterations for the same quality.
    this.scaleField(this.pressure, this.simTexel, FLUID.pressureDecay);
    p.pressure.uniforms.divergence!.value = this.divergence.texture;
    for (let i = 0; i < FLUID.pressureIterations; i++) {
      p.pressure.uniforms.pressure!.value = this.pressure.read.texture;
      this.run(p.pressure, this.pressure.write, this.simTexel);
      this.pressure.swap();
    }

    p.gradient.uniforms.pressure!.value = this.pressure.read.texture;
    p.gradient.uniforms.velocity!.value = this.velocity.read.texture;
    this.run(p.gradient, this.velocity.write, this.simTexel);
    this.velocity.swap();

    const frames = dt * 60;
    p.advect.uniforms.velocityTexel!.value.copy(this.simTexel);
    p.advect.uniforms.dt!.value = dt;
    p.advect.uniforms.velocity!.value = this.velocity.read.texture;
    p.advect.uniforms.source!.value = this.velocity.read.texture;
    p.advect.uniforms.dissipation!.value = Math.pow(FLUID.velocityDissipation, frames);
    this.run(p.advect, this.velocity.write, this.simTexel);
    this.velocity.swap();

    p.advect.uniforms.velocity!.value = this.velocity.read.texture;
    p.advect.uniforms.source!.value = this.dyeField.read.texture;
    p.advect.uniforms.dissipation!.value = Math.pow(FLUID.dyeDissipation, frames);
    this.run(p.advect, this.dyeField.write, this.dyeTexel);
    this.dyeField.swap();

    this.end();
  }

  /** Empties every field – the reveal disappears at once. */
  clear() {
    this.begin();
    this.scaleField(this.dyeField, this.dyeTexel, 0);
    this.scaleField(this.velocity, this.simTexel, 0);
    this.scaleField(this.pressure, this.simTexel, 0);
    this.end();
  }

  dispose() {
    this.disposeTargets();
    Object.values(this.passes).forEach((m) => m.dispose());
    this.quad.geometry.dispose();
  }

  /** Full-screen passes overwrite every texel – no clears needed in between. */
  private begin() {
    this.autoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
  }

  private end() {
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = this.autoClear;
  }

  private scaleField(field: PingPong, texel: Vector2, factor: number) {
    const u = this.passes.scale.uniforms;
    u.source!.value = field.read.texture;
    u.factor!.value = factor;
    this.run(this.passes.scale, field.write, texel);
    field.swap();
  }

  private drawSplat(field: PingPong, texel: Vector2, s: Splat, value: Vector3) {
    const u = this.passes.splat.uniforms;
    u.target!.value = field.read.texture;
    u.aspect!.value = this.aspect;
    u.point!.value.set(s.x, s.y);
    u.value!.value.copy(value);
    u.radius!.value = this.radius;
    this.run(this.passes.splat, field.write, texel);
    field.swap();
  }

  private run(material: RawShaderMaterial, output: WebGLRenderTarget, texel: Vector2) {
    material.uniforms.texel!.value.copy(texel);
    this.quad.material = material;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
  }

  private disposeTargets() {
    this.velocity?.dispose();
    this.dyeField?.dispose();
    this.pressure?.dispose();
    this.divergence?.dispose();
    this.curl?.dispose();
  }
}
