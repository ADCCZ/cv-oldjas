"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import {
  BoxGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PMREMGenerator,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { aboutState, bearing } from "@/lib/webgl";
import { precompile } from "./precompile";
import { addStage, layer, ORDER } from "./stage";

/*
 * 3D compass next to About (R3F): a low-poly drum of black metal with gold details and a red
 * needle. The body turns with the scroll through About; the needle – like a real one – keeps its
 * own bearing and swings, with a damped overshoot, to point at the fact that is highlighted in the
 * list (AboutFacts). The whole instrument leans slightly towards the mouse.
 * Built from primitives in code: nothing to download, and the facets stay crisp at any size.
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

function buildModel(): Model {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const geo = <T extends BufferGeometry>(g: T) => (geometries.push(g), g);
  const mat = <T extends Material>(m: T) => (materials.push(m), m);

  const metal = mat(new MeshStandardMaterial({ color: COLORS.metal, metalness: 0.85, roughness: 0.32, flatShading: true }));
  const gold = mat(new MeshStandardMaterial({ color: COLORS.gold, metalness: 1, roughness: 0.26, flatShading: true }));
  // The dial stays unlit: any light on it reads as grey, and the instrument is meant to be black.
  const face = mat(new MeshBasicMaterial({ color: COLORS.face }));
  const muted = mat(new MeshStandardMaterial({ color: COLORS.muted, metalness: 0.3, roughness: 0.5 }));
  const red = mat(new MeshStandardMaterial({ color: COLORS.red, metalness: 0.35, roughness: 0.3, flatShading: true }));
  const steel = mat(new MeshStandardMaterial({ color: COLORS.steel, metalness: 0.8, roughness: 0.35, flatShading: true }));

  const root = new Group();
  const body = new Group();
  const needle = new Group();
  root.add(body, needle);

  // Case: a 20-sided drum (the facets catch the light), axis towards the camera.
  const caseGeo = geo(new CylinderGeometry(1, 1.04, 0.26, 20, 1));
  caseGeo.rotateX(Math.PI / 2);
  body.add(new Mesh(caseGeo, metal));

  // A wide rim of black metal, a thin gold bezel inside it, a matte black dial.
  const bezel = new Mesh(geo(new TorusGeometry(0.89, 0.032, 4, 40)), gold);
  bezel.position.z = 0.135;
  const dial = new Mesh(geo(new CircleGeometry(0.87, 48)), face);
  dial.position.z = 0.132;
  const ring = new Mesh(geo(new TorusGeometry(0.62, 0.006, 3, 64)), muted);
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

  // North: a small gold triangle inside the ring.
  const north = new Mesh(geo(new ConeGeometry(0.075, 0.15, 3)), gold);
  north.position.set(0, 0.5, 0.15);
  north.scale.z = 0.3;
  body.add(north);

  // Needle: two four-sided blades (a ridge down the middle), red to the north, steel to the south.
  const bladeGeo = geo(new ConeGeometry(0.085, 0.62, 4));
  bladeGeo.rotateY(Math.PI / 4);
  bladeGeo.translate(0, 0.31, 0);
  const northBlade = new Mesh(bladeGeo, red);
  const southBlade = new Mesh(bladeGeo, steel);
  southBlade.rotation.z = Math.PI;
  northBlade.scale.z = southBlade.scale.z = 0.45;
  const cap = new Mesh(geo(new CylinderGeometry(0.07, 0.085, 0.08, 10)), gold);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.04;
  needle.add(northBlade, southBlade, cap);
  needle.position.z = 0.2;

  root.rotation.x = TILT;
  return {
    root,
    body,
    needle,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      majorTicks.dispose();
      minorTicks.dispose();
    },
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
  }));

  useEffect(() => {
    // Studio reflections for the metal, generated on the GPU – no HDR file to download.
    const pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.55;
    // Compile the PBR programs while the page is idle, not on the first scroll into About.
    const cancelCompile = precompile(gl, [{ object: model.root, camera, scene }]);

    const io = new IntersectionObserver(([entry]) => (motion.visible = !!entry?.isIntersecting));
    io.observe(box);
    const onMove = (event: PointerEvent) => {
      motion.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      motion.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const remove = addStage(() => {
      // Under the hero layer the compass would be hidden behind About's background anyway.
      const draw = motion.visible && !layer.under;
      model.root.visible = draw;
      return draw;
    }, ORDER.compass);

    return () => {
      cancelCompile();
      remove();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
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
