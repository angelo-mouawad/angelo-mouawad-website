"use client";

import type { Ref } from "react";
import * as THREE from "three";

// Pieces of the world scene shared with the monitor in the room, which draws the same scene so the dive has no seam.

export const SKY = "#2f9bff";
export const CYAN = "#12b5e5";
export const DEEP = "#0b6bdc";
export const SOFT = "#8fb8ff";

export const WORLD_CAMERA = { fov: 50, z: 10 };
/** Where the hero shape rests before the dive pulls it forward. */
export const HERO_REST = new THREE.Vector3(0, 0.2, -14);
export const DUST = { count: 260, size: 0.045 };

/** One clock for both canvases, so the monitor and the world beyond it are always at the same moment. */
export function worldTime(still: boolean) {
  return still ? 0 : performance.now() / 1000;
}

export function Wire({ radius, detail, color, opacity }: { radius: number; detail: number; color: string; opacity: number }) {
  return (
    <mesh>
      <icosahedronGeometry args={[radius, detail]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

/** The big wireframe and its rings. Spin it with spinHero. */
export function HeroShape({ ringsRef }: { ringsRef: Ref<THREE.Group> }) {
  return (
    <>
      <Wire radius={2.6} detail={1} color={SKY} opacity={0.55} />
      <Wire radius={1.5} detail={0} color={DEEP} opacity={0.35} />
      <group ref={ringsRef}>
        {[3.4, 3.9, 4.6].map((radius, index) => (
          <mesh key={radius} rotation-x={index * 0.5}>
            <torusGeometry args={[radius, 0.008, 6, 120]} />
            <meshBasicMaterial color={index === 1 ? CYAN : SOFT} transparent opacity={0.55} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** The resting spin. The world adds its scroll-driven turns on top through the extra arguments. */
export function spinHero(hero: THREE.Object3D, rings: THREE.Object3D | null, t: number, turnX = 0, turnY = 0, turnRings = 0) {
  hero.rotation.set(t * 0.07 + turnX, t * 0.11 + turnY, 0);
  if (rings) {
    rings.rotation.z = t * 0.05 + turnRings;
    rings.rotation.x = 1.1 + Math.sin(t * 0.2) * 0.08;
  }
}

/** Seeded so the motes on the monitor sit exactly where the world's own motes do. */
export function dustGeometry(count: number) {
  let seed = 0x9e3779b9;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * 30;
    positions[i * 3 + 1] = (random() - 0.5) * 18;
    positions[i * 3 + 2] = -8 + random() * 12;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}
