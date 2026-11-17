"use client";

import * as THREE from "three";
import { Console } from "@/components/room/interactions/Console";
import { Fridge } from "@/components/room/interactions/Fridge";
import { Plant } from "@/components/room/interactions/Plant";
import { PALETTE, ROOM } from "@/components/room/scene/layout";
import { usePbr } from "@/components/room/scene/textures";
import { Model } from "./Model";

function FloatingShelf({ position, width }: { position: [number, number, number]; width: number }) {
  const wood = usePbr("walnut_veneer", width * 1.2, 0.3);
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.032, 0.22]} />
        <meshStandardMaterial {...wood} color="#8f7058" roughness={0.6} />
      </mesh>
      {[-0.32, 0.32].map((side) => (
        <mesh key={side} position={[side * width, -0.05, -0.04]}>
          <boxGeometry args={[0.02, 0.07, 0.12]} />
          <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Hidden LED strip under a shelf: a bright sliver for the bloom plus a soft light on the wall. */
function ShelfGlow({ position, width }: { position: [number, number, number]; width: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[width, 0.006, 0.01]} />
        <meshBasicMaterial color={new THREE.Color(PALETTE.warm).multiplyScalar(2)} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.1, 0]} color={PALETTE.warm} intensity={0.35} distance={1.6} decay={2} />
    </group>
  );
}

/** Two shelves over the desk on the back wall. */
export function WallShelves() {
  const z = ROOM.back + 0.11;
  return (
    <group>
      <FloatingShelf position={[0.05, 1.8, z]} width={1.6} />
      <FloatingShelf position={[0.72, 2.2, z]} width={1.2} />
      <ShelfGlow position={[0.05, 1.78, z]} width={1.4} />
      <ShelfGlow position={[0.72, 2.18, z]} width={1.0} />

      <Model name="book_encyclopedia_set_01" position={[-0.42, 1.816, z]} />
      <Plant name="potted_plant_02" height={0.3} position={[0.26, 1.816, z]} rotation-y={0.8} phase={1} />

      <Model name="camera_01" longest={0.16} position={[0.34, 2.216, z + 0.01]} rotation-y={0.5} />
      <Model name="book_encyclopedia_set_01" position={[0.86, 2.216, z]} scale={0.86} />
    </group>
  );
}

/** Low cabinet along the left wall with the console, the TV above it and the fridge in the corner. */
export function Sideboard() {
  const x = ROOM.left + 0.24;
  const top = 0.53;
  return (
    <group>
      <Model name="modern_wooden_cabinet" longest={1.9} position={[x, 0, -1.6]} rotation-y={Math.PI / 2} />
      <Console position={[x, top, -1.75]} rotation-y={Math.PI / 2 + 0.2} tvPosition={[ROOM.left + 0.03, 1.48, -1.6]} />
      <Plant name="potted_plant_01" height={0.52} position={[x, top, -0.95]} rotation-y={2} phase={3} />
      <Model name="gaming_laptop" longest={0.34} position={[x + 0.02, top, -2.25]} rotation-y={-Math.PI / 2 - 0.3} />
      <Fridge position={[1.84, 0, ROOM.back + 0.28]} />
    </group>
  );
}

/** Vertical light bar in the right corner. */
export function CornerLight() {
  return (
    <group position={[3.0, 0, ROOM.back + 0.22]}>
      <mesh position-y={0.02}>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 20]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position-y={0.95}>
        <cylinderGeometry args={[0.018, 0.018, 1.8, 12]} />
        <meshBasicMaterial color={new THREE.Color(PALETTE.warmSoft).multiplyScalar(2.6)} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.25, 1, 0.25]} color={PALETTE.warm} intensity={2.4} distance={6} decay={2} />
    </group>
  );
}

export function Decor() {
  return (
    <group>
      <Plant name="potted_plant_01" height={0.98} position={[2.62, 0, -2.6]} rotation-y={-0.5} phase={5} />
      <Model name="cameraman_backpack" height={0.5} position={[-1.48, 0, -2.72]} rotation={[-0.16, 0.3, 0]} />
    </group>
  );
}
