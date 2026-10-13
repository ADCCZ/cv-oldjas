import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  type Camera,
  type Material,
  type Object3D,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";

/**
 * What to compile. `target`: the render target the objects will be drawn into – part of the program
 * key for three's own materials (tone mapping, output colour space), so it has to match.
 */
export type Job = { object: Object3D; camera: Camera; scene?: Scene; target?: WebGLRenderTarget };

const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

/**
 * A job compiling full-screen pass materials (simulation passes). `normals: false` for three's own
 * materials drawn on geometry without normals – the normal attribute is part of their program key.
 */
export function passJob(materials: Material[], { normals = true } = {}): Job {
  const scene = new Scene();
  const geometry = new PlaneGeometry(2, 2);
  if (!normals) geometry.deleteAttribute("normal");
  for (const material of materials) {
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
  }
  return { object: scene, camera };
}

type Program = { isReady?: () => boolean };

/**
 * Compiles shader programs before they are first needed, so no frame pays for it (a first hover
 * or the first scroll into About used to freeze the page for up to a second and a half on
 * integrated GPUs). Where the browser compiles in the background (KHR_parallel_shader_compile),
 * all programs are started at once and polled until ready; elsewhere they compile one per idle
 * moment. Unlike three's compileAsync, the polling stops when cancelled – it would otherwise keep
 * asking about programs that were disposed meanwhile. Returns a cancel function.
 */
export function precompile(renderer: WebGLRenderer, jobs: Job[], done?: () => void): () => void {
  const parallel = renderer.extensions.has("KHR_parallel_shader_compile");
  let cancelled = false;
  let idleHandle = 0;
  let timer = 0;
  const schedule = (fn: () => void) =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(fn, { timeout: 2000 })
      : window.setTimeout(fn, 50);

  const pending = new Set<Material>();
  const poll = () => {
    if (cancelled) return;
    for (const material of pending) {
      const program = (renderer.properties.get(material) as { currentProgram?: Program }).currentProgram;
      if (!program?.isReady || program.isReady()) pending.delete(material);
    }
    if (pending.size) timer = window.setTimeout(poll, 50);
    else done?.();
  };

  const next = (i: number) => {
    if (cancelled) return;
    const job = jobs[i];
    if (!job) {
      if (parallel) poll();
      else done?.();
      return;
    }
    const previous = renderer.getRenderTarget();
    if (job.target) renderer.setRenderTarget(job.target);
    const materials = renderer.compile(job.object, job.camera, job.scene);
    if (job.target) renderer.setRenderTarget(previous);
    materials.forEach((material) => pending.add(material));
    if (parallel) next(i + 1);
    else idleHandle = schedule(() => next(i + 1));
  };
  idleHandle = schedule(() => next(0));

  return () => {
    cancelled = true;
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
    window.clearTimeout(idleHandle);
    window.clearTimeout(timer);
  };
}
