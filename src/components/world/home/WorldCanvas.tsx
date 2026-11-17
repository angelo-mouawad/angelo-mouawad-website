"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PROJECTS } from "@/data/projects";
import { detectQuality } from "@/lib/device";
import { frame } from "@/lib/frame";
import { scroll } from "@/lib/scroll";
import { CYAN, DEEP, DUST, dustGeometry, HERO_REST, HeroShape, SKY, SOFT, spinHero, Wire, WORLD_CAMERA, worldTime } from "./heroScene";


const lerp = THREE.MathUtils.lerp;
const smooth = THREE.MathUtils.smoothstep;

function networkGeometry(count: number, reach: number) {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) nodes.push(new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 11, (Math.random() - 0.5) * 6));
  const links: number[] = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (nodes[i].distanceTo(nodes[j]) < reach && Math.random() < 0.6) links.push(...nodes[i].toArray(), ...nodes[j].toArray());
    }
  }
  const points = new THREE.BufferGeometry().setFromPoints(nodes);
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(links, 3));
  return { points, lines };
}

/** One project capsule: a wire core between two rings, the old pods redrawn in line. */
function Pod({ color }: { color: string }) {
  return (
    <group>
      <Wire radius={0.5} detail={0} color={color} opacity={0.9} />
      {[-0.95, 0.95].map((y) => (
        <mesh key={y} position-y={y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.8, 0.012, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 1.9, 32, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const hero = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const network = useRef<THREE.Group>(null);
  const pods = useRef<THREE.Group>(null);
  const finale = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const net = useMemo(() => networkGeometry(54, 4.2), []);
  const motes = useMemo(() => dustGeometry(DUST.count), []);
  const podColors = [SKY, CYAN, SOFT];
  const podGap = 4.6;

  useFrame(({ camera }, delta) => {
    const t = worldTime(reducedMotion);
    const dive = scroll.dive.get();
    const h = scroll.hero.get();
    const a = scroll.about.get();
    const p = scroll.projects.get();
    const c = scroll.contact.get();

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, frame.pointerX, 3, delta);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, frame.pointerY, 3, delta);
    camera.position.x = pointer.current.x * 0.5;
    camera.position.y = -pointer.current.y * 0.3;
    camera.lookAt(0, 0, 0);

    // The big wireframe arrives with the dive, slides aside for the name, shrinks into the top corner
    // so the about text stays clear, then leaves as the projects begin.
    if (hero.current) {
      const park = smooth(h, 0.7, 1);
      const leave = smooth(p, 0, 0.1);
      hero.current.position.set(
        lerp(lerp(HERO_REST.x, 4.6, smooth(h, 0.15, 0.7)), 9.4, park) + leave * 8,
        lerp(HERO_REST.y, 4.3, park) + leave * 3,
        lerp(lerp(HERO_REST.z, -1, smooth(dive, 0.2, 1)), -4, park),
      );
      spinHero(hero.current, rings.current, t, h * 1.4, (h + a) * 2.2, h * 1.2);
      hero.current.scale.setScalar(lerp(1, 0.42, park));
      hero.current.visible = leave < 0.999 || c > 0;
    }

    // The node field rises through the about section and sinks away as the projects take over.
    if (network.current) {
      const inAbout = smooth(a, 0, 0.35) * (1 - smooth(p, 0.05, 0.4));
      network.current.position.set(lerp(6, -1, a) - p * 8, lerp(-9, 0.5, smooth(a, 0, 0.6)) + p * 5, -3);
      network.current.rotation.z = Math.sin(t * 0.12) * 0.05 + a * 0.35;
      network.current.scale.setScalar(0.6 + inAbout * 0.4);
      network.current.visible = inAbout > 0.01;
    }

    // Capsules travel right to left, one per project, in step with the card track.
    if (pods.current) {
      const span = (PROJECTS.length - 1) * podGap;
      pods.current.position.x = lerp(9, -span - 7, p);
      pods.current.position.y = lerp(-6, 0, smooth(p, 0, 0.12)) + lerp(0, 7, smooth(p, 0.9, 1));
      pods.current.visible = p > 0.001 && p < 0.999;
      pods.current.children.forEach((pod, index) => {
        pod.rotation.y = t * (0.35 + (index % 3) * 0.1) + p * 6;
        pod.position.y = Math.sin(t * 0.8 + index * 2.1) * 0.22 + (index % 2 ? -2.3 : 2.3);
      });
    }

    if (finale.current) {
      finale.current.position.y = lerp(-13, -2.5, smooth(c, 0, 0.8));
      finale.current.rotation.y = t * 0.06 + c * 1.2;
      finale.current.rotation.x = 0.3 + c * 0.4;
      finale.current.visible = c > 0.001;
    }

    if (dust.current) {
      dust.current.rotation.y = t * 0.01;
      dust.current.position.y = (h + a + p + c) * 1.6;
    }
  });

  return (
    <>
      <group ref={hero} position={HERO_REST}>
        <HeroShape ringsRef={rings} />
      </group>

      <group ref={network} visible={false}>
        <points geometry={net.points}>
          <pointsMaterial color={DEEP} size={0.09} sizeAttenuation transparent opacity={0.55} toneMapped={false} />
        </points>
        <lineSegments geometry={net.lines}>
          <lineBasicMaterial color={SKY} transparent opacity={0.16} toneMapped={false} />
        </lineSegments>
      </group>

      <group ref={pods} position-z={-4} visible={false}>
        {PROJECTS.map((project, index) => (
          <group key={project.id} position-x={index * podGap} scale={project.status === "soon" ? 0.7 : 1}>
            <Pod color={podColors[index % podColors.length]} />
          </group>
        ))}
      </group>

      <group ref={finale} position={[0, -13, -6]} visible={false}>
        <Wire radius={7} detail={2} color={SKY} opacity={0.2} />
        <Wire radius={4.2} detail={1} color={CYAN} opacity={0.16} />
      </group>

      <points ref={dust} geometry={motes}>
        <pointsMaterial color={SKY} size={DUST.size} sizeAttenuation transparent opacity={0.55} toneMapped={false} />
      </points>
    </>
  );
}

/** The 3D layer behind the monitor scene. Transparent, so the page's own glow and grid show through. */
export default function WorldCanvas({ active, reducedMotion, dpr }: { active: boolean; reducedMotion: boolean; dpr: number }) {
  // Weaker GPUs draw this layer at a lower pixel ratio; it often runs alongside the room during the dive.
  const maxDpr = useMemo(() => Math.min(dpr, detectQuality().worldDpr), [dpr]);
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
      // The layer is drawn in perspective on the monitor for a while; size the canvas by its layout box, not its transformed bounds.
      resize={{ offsetSize: true }}
      dpr={[1, maxDpr]}
      camera={{ fov: WORLD_CAMERA.fov, near: 0.1, far: 80, position: [0, 0, WORLD_CAMERA.z] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Scene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
