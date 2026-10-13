"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  ConeGeometry,
  Group,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera as CubeFaceCamera,
  PMREMGenerator,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { aboutState, bearing } from "@/lib/webgl";
import { passJob, precompile } from "./precompile";
import { addStage, layer, ORDER } from "./stage";

/*
 * 3D compass next to About (R3F): a turned case of black metal under a domed glass, a gold bezel,
 * a dial with N E S W and a red needle. The body turns with the scroll through About; the needle – like a real one – keeps its
 * own bearing and swings, with a damped overshoot, to point at the fact that is highlighted in the
 * list (AboutFacts). The whole instrument leans slightly towards the mouse.
 * Built from primitives in code: nothing to download, and the round case stays smooth at any size.
 */

const COLORS = {
  metal: "#121212",
  face: "#0b0b0b",
  gold: "#d4a63a",
  red: "#d2162a",
  steel: "#b9b2a6",
  muted: "#8c877e",
};

/** Base tilt: seen slightly from above, like a compass lying on a table in front of you. */
const TILT = -0.38;
/** Needle spring – stiffness and damping per second (a little overshoot, then it settles). */
const SPRING = { k: 55, c: 6.5 };

type Model = { root: Group; body: Group; needle: Group; dispose: () => void };

/** Radius of the dial – the canvas texture with the cardinal letters is mapped onto it. */
const DIAL_R = 0.87;

/** Points of an arc for a lathe profile. */
function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number): Vector2[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return new Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  });
}

/** The dial: matte black with N E S W, each letter standing on its own bearing. */
function dialTexture(): CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = COLORS.face;
  ctx.fillRect(0, 0, size, size);
  const unit = size / 2 / DIAL_R; // canvas px per model unit
  ctx.font = `800 ${Math.round(0.15 * unit)}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letters: [string, number, string][] = [
    ["N", 0, COLORS.gold],
    ["E", 90, COLORS.steel],
    ["S", 180, COLORS.steel],
    ["W", 270, COLORS.steel],
  ];
  for (const [letter, deg, color] of letters) {
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.fillText(letter, 0, -0.47 * unit);
    ctx.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function buildModel(): Model {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const geo = <T extends BufferGeometry>(g: T) => (geometries.push(g), g);
  const mat = <T extends Material>(m: T) => (materials.push(m), m);

  const metal = mat(new MeshStandardMaterial({ color: COLORS.metal, metalness: 0.88, roughness: 0.3 }));
  const gold = mat(new MeshStandardMaterial({ color: COLORS.gold, metalness: 1, roughness: 0.24 }));
  // The dial stays unlit: any light on it reads as grey, and the instrument is meant to be black.
  const dialMap = dialTexture();
  const face = mat(new MeshBasicMaterial({ map: dialMap }));
  const muted = mat(new MeshStandardMaterial({ color: COLORS.muted, metalness: 0.3, roughness: 0.5 }));
  // The needle keeps its facets – a diamond section with a sharp ridge, like a real one.
  const red = mat(new MeshStandardMaterial({ color: COLORS.red, metalness: 0.35, roughness: 0.3, flatShading: true }));
  const steel = mat(new MeshStandardMaterial({ color: COLORS.steel, metalness: 0.8, roughness: 0.35, flatShading: true }));
  // Glass: only its reflections are added on top – no grey veil over the black dial, no transmission
  // pass. Additive blending scales them by the opacity, so the light catches the dome without glare.
  const glass = mat(
    new MeshStandardMaterial({
      color: "#000000",
      metalness: 0,
      roughness: 0.2,
      opacity: 0.3,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );

  const root = new Group();
  const body = new Group();
  const needle = new Group();
  root.add(body, needle);

  // Case: turned like a real one – a flat back, a rounded side with a slight belly and a raised lip
  // that holds the glass. 128 segments, smooth shading: a round rim at any size.
  const profile = [
    new Vector2(0, -0.13),
    ...arc(0.92, -0.06, 0.07, -Math.PI / 2, 0, 6),
    new Vector2(1.0, 0.0),
    ...arc(0.93, 0.06, 0.06, 0, Math.PI / 2, 6),
    ...arc(0.93, 0.15, 0.025, -Math.PI / 2, Math.PI, 8).slice(1),
    new Vector2(0.9, 0.13),
  ];
  const caseGeo = geo(new LatheGeometry(profile, 128));
  caseGeo.rotateX(Math.PI / 2);
  body.add(new Mesh(caseGeo, metal));

  // A thin gold bezel, the dial, and a fine ring inside the ticks.
  const bezel = new Mesh(geo(new TorusGeometry(0.89, 0.03, 16, 128)), gold);
  bezel.position.z = 0.135;
  const dial = new Mesh(geo(new CircleGeometry(DIAL_R, 96)), face);
  dial.position.z = 0.132;
  const ring = new Mesh(geo(new TorusGeometry(0.62, 0.006, 6, 128)), muted);
  ring.position.z = 0.134;
  body.add(bezel, dial, ring);

  // 72 ticks every 5° – cardinal ones gold and long, every 15° a medium one.
  const box = geo(new BoxGeometry(1, 1, 1));
  const majorTicks = new InstancedMesh(box, gold, 4);
  const minorTicks = new InstancedMesh(box, muted, 68);
  const dummy = new Object3D();
  let major = 0;
  let minor = 0;
  for (let deg = 0; deg < 360; deg += 5) {
    const isMajor = deg % 90 === 0;
    const length = isMajor ? 0.16 : deg % 15 === 0 ? 0.1 : 0.05;
    const width = isMajor ? 0.035 : deg % 15 === 0 ? 0.018 : 0.01;
    const a = (deg * Math.PI) / 180;
    const r = 0.82 - length / 2;
    dummy.position.set(Math.sin(a) * r, Math.cos(a) * r, 0.14);
    dummy.rotation.set(0, 0, -a);
    dummy.scale.set(width, length, 0.012);
    dummy.updateMatrix();
    if (isMajor) majorTicks.setMatrixAt(major++, dummy.matrix);
    else minorTicks.setMatrixAt(minor++, dummy.matrix);
  }
  body.add(majorTicks, minorTicks);

  // A domed crystal resting on the lip, high enough to clear the needle and its cap.
  const glassR = 0.905;
  const dome = 0.09;
  const sphereR = (glassR * glassR + dome * dome) / (2 * dome);
  const glassGeo = geo(new SphereGeometry(sphereR, 128, 12, 0, Math.PI * 2, 0, Math.asin(glassR / sphereR)));
  glassGeo.rotateX(Math.PI / 2);
  glassGeo.translate(0, 0, 0.172 - (sphereR - dome));
  const crystal = new Mesh(glassGeo, glass);
  crystal.renderOrder = 1;
  body.add(crystal);

  // Needle: two four-sided blades (a ridge down the middle), red to the north, steel to the south,
  // on a domed gold pivot.
  const bladeGeo = geo(new ConeGeometry(0.085, 0.62, 4));
  bladeGeo.rotateY(Math.PI / 4);
  bladeGeo.translate(0, 0.31, 0);
  const northBlade = new Mesh(bladeGeo, red);
  const southBlade = new Mesh(bladeGeo, steel);
  southBlade.rotation.z = Math.PI;
  northBlade.scale.z = southBlade.scale.z = 0.45;
  const capGeo = geo(new SphereGeometry(0.075, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  capGeo.rotateX(Math.PI / 2);
  const cap = new Mesh(capGeo, gold);
  cap.scale.z = 0.6;
  cap.position.z = 0.035;
  needle.add(northBlade, southBlade, cap);
  needle.position.z = 0.175;

  root.rotation.x = TILT;
  return {
    root,
    body,
    needle,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      dialMap.dispose();
      majorTicks.dispose();
      minorTicks.dispose();
    },
  };
}

/**
 * Studio reflections for the metal, filtered on the GPU – no HDR file to download. PMREMGenerator
 * compiles its filter shaders synchronously on first use, and its GGX filter (256 samples that
 * Direct3D unrolls) blocks an integrated GPU for about a second. So the generator's materials are
 * compiled in the background first – into one of its own render targets, as it renders them – and
 * the room is filtered once they are ready. Reaches into three r186 internals; without them it
 * simply filters at once. Returns a cancel function.
 */
function studioEnvironment(gl: WebGLRenderer, done: (environment: Texture) => void): () => void {
  const pmrem = new PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const inner = pmrem as unknown as {
    _setSize?: (size: number) => void;
    _allocateTargets?: () => WebGLRenderTarget;
    _blurMaterial?: Material | null;
    _ggxMaterial?: Material | null;
  };
  let result: WebGLRenderTarget | null = null;
  let cancelled = false;
  const filter = () => {
    if (cancelled) return;
    result = pmrem.fromScene(room, 0.04);
    done(result.texture);
  };

  let cancelCompile = () => {};
  if (inner._setSize && inner._allocateTargets) {
    inner._setSize(256);
    const target = inner._allocateTargets();
    const passes = [inner._blurMaterial, inner._ggxMaterial].filter((material): material is Material => !!material);
    cancelCompile = precompile(
      gl,
      [
        { object: room, camera: new CubeFaceCamera(90, 1, 0.1, 100), target },
        { ...passJob(passes, { normals: false }), target },
      ],
      () => {
        target.dispose();
        filter();
      },
    );
  } else {
    filter();
  }

  return () => {
    cancelled = true;
    cancelCompile();
    result?.dispose();
    pmrem.dispose();
    room.dispose();
  };
}

/** Shortest signed difference between two angles (radians). */
function angleDelta(from: number, to: number): number {
  const d = (to - from) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
}

function CompassScene({ box }: { box: HTMLElement }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene); // the View's own scene
  const camera = useThree((state) => state.camera);
  const model = useMemo(() => buildModel(), []);
  const [motion] = useState(() => ({
    visible: false,
    drawn: false,
    needle: 0,
    spin: 0,
    primed: false,
    tiltX: TILT,
    tiltY: 0,
    pointer: { x: 0, y: 0 },
    time: 0,
    /** Environment filtered and PBR programs compiled – until then the SVG compass stays. */
    ready: false,
  }));

  useEffect(() => {
    // The PBR programs depend on the environment: compile them once it exists, while the page is
    // idle – not on the first scroll into About.
    let cancelCompile = () => {};
    const cancelEnvironment = studioEnvironment(gl, (environment) => {
      scene.environment = environment;
      scene.environmentIntensity = 0.55;
      cancelCompile = precompile(gl, [{ object: model.root, camera, scene }], () => (motion.ready = true));
    });

    const io = new IntersectionObserver(([entry]) => (motion.visible = !!entry?.isIntersecting));
    io.observe(box);
    const onMove = (event: PointerEvent) => {
      motion.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      motion.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const remove = addStage(() => {
      // Under the hero layer the compass would be hidden behind About's background anyway.
      const draw = motion.ready && motion.visible && !layer.under;
      model.root.visible = draw;
      return draw;
    }, ORDER.compass);

    return () => {
      cancelCompile();
      cancelEnvironment();
      remove();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.environment = null;
      model.dispose();
      delete document.documentElement.dataset.compassGl;
    };
  }, [gl, scene, camera, box, model, motion]);

  useFrame((_, delta) => {
    if (!model.root.visible) return;
    const dt = Math.min(delta, 1 / 20);
    motion.time += dt;

    // The body turns with the scroll through About.
    const section = box.closest("section")?.getBoundingClientRect();
    if (section) {
      const progress = Math.min(1, Math.max(0, (window.innerHeight - section.top) / (section.height + window.innerHeight)));
      model.body.rotation.z = -progress * Math.PI * 1.2;
    }

    // The needle swings to the highlighted fact (rotation.z is counter-clockwise, bearings clockwise).
    const icons = box.closest("aside")?.querySelectorAll("[data-fact-icon]");
    const icon = icons?.[aboutState.activeFact];
    const target = icon ? (-bearing(box, icon) * Math.PI) / 180 : 0;
    if (!motion.primed) {
      motion.needle = target;
      motion.primed = true;
    }
    motion.spin += (SPRING.k * angleDelta(motion.needle, target) - SPRING.c * motion.spin) * dt;
    motion.needle += motion.spin * dt;
    // A real needle never rests completely still.
    model.needle.rotation.z = motion.needle + Math.sin(motion.time * 1.9) * 0.012;

    // A slight lean towards the mouse.
    const follow = 1 - Math.exp(-dt * 4);
    motion.tiltX += (TILT + motion.pointer.y * 0.16 - motion.tiltX) * follow;
    motion.tiltY += (motion.pointer.x * 0.22 - motion.tiltY) * follow;
    model.root.rotation.set(motion.tiltX, motion.tiltY, 0);

    if (!motion.drawn) {
      motion.drawn = true;
      document.documentElement.dataset.compassGl = ""; // the flat SVG compass steps back
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.6]} fov={30} />
      <directionalLight position={[-2, 3, 4]} intensity={1.4} />
      <primitive object={model.root} />
    </>
  );
}

/** The 3D compass, drawn into a View that tracks the compass box in About. */
export function Compass() {
  const [box] = useState(() => document.querySelector<HTMLElement>("[data-compass]"));
  const track = useMemo(() => ({ current: box }), [box]);
  if (!box || !track.current) return null;
  return (
    <View track={track as { current: HTMLElement }}>
      <CompassScene box={box} />
    </View>
  );
}
