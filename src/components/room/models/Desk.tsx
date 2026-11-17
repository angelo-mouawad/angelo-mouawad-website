"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { Lamp } from "@/components/room/interactions/Lamp";
import { Notebooks } from "@/components/room/interactions/Notebooks";
import { Plant } from "@/components/room/interactions/Plant";
import { DESK, PALETTE } from "@/components/room/scene/layout";
import { useSettings } from "@/components/room/scene/settings";
import { Steam } from "@/components/room/scene/Steam";
import { usePbr } from "@/components/room/scene/textures";
import { Keyboard } from "./Keyboard";
import { Model } from "./Model";
import { Monitor } from "./Monitor";
import { Pc } from "./Pc";

const TOP_THICKNESS = 0.04;
const METAL = { color: "#0e1014", roughness: 0.45, metalness: 0.7 };

function Legs() {
  const height = DESK.top - TOP_THICKNESS;
  const inset = DESK.width / 2 - 0.12;
  const reach = DESK.depth / 2 - 0.08;
  return (
    <>
      {[-inset, inset].map((x) => (
        <group key={x} position-x={x}>
          {[-reach, reach].map((z) => (
            <mesh key={z} position={[0, height / 2, z]} castShadow>
              <boxGeometry args={[0.045, height, 0.045]} />
              <meshStandardMaterial {...METAL} />
            </mesh>
          ))}
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.045, 0.04, DESK.depth - 0.1]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
          <mesh position={[0, height - 0.02, 0]}>
            <boxGeometry args={[0.045, 0.04, DESK.depth - 0.1]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, height - 0.12, -reach]}>
        <boxGeometry args={[inset * 2, 0.05, 0.02]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
    </>
  );
}

function Mug({ position }: { position: [number, number, number] }) {
  const profile = useMemo(
    () =>
      [
        [0, 0],
        [0.034, 0],
        [0.038, 0.004],
        [0.039, 0.092],
        [0.042, 0.096],
        [0.036, 0.096],
        [0.034, 0.016],
        [0, 0.016],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 28]} />
        <meshStandardMaterial color="#d9d3c7" roughness={0.3} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]} castShadow>
        <torusGeometry args={[0.024, 0.006, 10, 22]} />
        <meshStandardMaterial color="#d9d3c7" roughness={0.3} />
      </mesh>
      <mesh position-y={0.084} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.034, 24]} />
        <meshStandardMaterial color="#231206" roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Desk() {
  const { reducedMotion } = useSettings();
  const wood = usePbr("walnut_veneer", 2.4, 1);
  const top = DESK.top;

  return (
    <group position={[DESK.x, 0, DESK.z]}>
      <RoundedBox args={[DESK.width, TOP_THICKNESS, DESK.depth]} radius={0.008} smoothness={3} position-y={top - TOP_THICKNESS / 2} castShadow receiveShadow>
        <meshStandardMaterial {...wood} color="#a58468" roughness={0.6} envMapIntensity={0.7} />
      </RoundedBox>
      <Legs />

      {/* Warm strip under the back edge, washing the wall. */}
      <mesh position={[0, top - TOP_THICKNESS - 0.012, -DESK.depth / 2 + 0.03]}>
        <boxGeometry args={[DESK.width - 0.3, 0.008, 0.012]} />
        <meshBasicMaterial color={new THREE.Color(PALETTE.warm).multiplyScalar(2.2)} toneMapped={false} />
      </mesh>

      <group position-z={-DESK.z}>
        <Monitor animate={!reducedMotion} />
      </group>

      <RoundedBox args={[0.82, 0.004, 0.34]} radius={0.002} position={[0.06, top + 0.002, 0.2]} receiveShadow>
        <meshStandardMaterial color="#14161b" roughness={0.95} />
      </RoundedBox>
      <Keyboard position={[-0.07, top + 0.004, 0.2]} />
      {/* The file is in centimetres and includes a long cable, so it is scaled by hand rather than fitted. */}
      <Model name="gaming_mouse" anchor="origin" scale={0.0105} position={[0.31, top + 0.004, 0.21]} rotation-y={Math.PI + 0.12} />

      <Mug position={[0.47, top, -0.08]} />
      <Steam position={[0.47, top + 0.09, -0.08]} animate={!reducedMotion} />

      <Pc position={[-0.94, top, -0.14]} rotation-y={Math.PI / 2 + 0.2} />
      <Plant name="potted_plant_04" height={0.2} position={[-0.6, top, -0.28]} rotation-y={1.1} phase={2} />

      {/* Clamped to the right edge: the elbow hangs over open floor and the head reaches in over the desk. */}
      <Lamp position={[DESK.width / 2 - 0.02, top, -0.06]} rotation-y={Math.PI / 2 + 0.15} />
      <Notebooks position={[0.97, top, 0.2]} rotation-y={-0.25} />
    </group>
  );
}
