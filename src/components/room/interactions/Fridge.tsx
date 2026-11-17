"use client";

import { RoundedBox } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { invalidateShadows } from "@/lib/frame";
import { useToy } from "./useToy";

const SIZE = { width: 0.48, height: 0.7, depth: 0.47, door: 0.055, wall: 0.03, feet: 0.035 };
const DOOR_OPEN = 1.85;
const CHROME = { color: "#c9ccd1", roughness: 0.18, metalness: 1 };

function Enamel() {
  return <meshPhysicalMaterial color="#d9d3c4" roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.2} envMapIntensity={0.9} />;
}

function Can({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position-y={0.058}>
        <cylinderGeometry args={[0.031, 0.031, 0.116, 20]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position-y={0.118}>
        <cylinderGeometry args={[0.026, 0.031, 0.006, 20]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
    </group>
  );
}

function Bottle({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position-y={0.075}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position-y={0.185}>
        <cylinderGeometry args={[0.012, 0.028, 0.07, 18]} />
        <meshPhysicalMaterial color={color} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position-y={0.226}>
        <cylinderGeometry args={[0.014, 0.014, 0.014, 14]} />
        <meshStandardMaterial color="#e8e2d2" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Retro mini fridge built in code. The door swings open on hover, or on tap for touch. */
export function Fridge(props: ThreeElements["group"]) {
  const { width: w, height: h, depth: d, door: doorDepth, wall, feet } = SIZE;
  const [open, bind] = useToy();
  const door = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  const amount = useRef(0);

  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    if (amount.current === target || !door.current) return;
    amount.current = THREE.MathUtils.damp(amount.current, target, 5, delta);
    if (Math.abs(amount.current - target) < 0.002) amount.current = target;
    door.current.rotation.y = amount.current * DOOR_OPEN;
    const glow = THREE.MathUtils.smoothstep(amount.current, 0.03, 0.4);
    if (light.current) light.current.intensity = glow * 0.9;
    if (strip.current) strip.current.color.setScalar(glow * 2.5);
    invalidateShadows();
  });

  const bodyDepth = d - doorDepth;
  const bodyZ = -doorDepth / 2;
  const front = d / 2 - doorDepth;
  const inner = w - wall * 2;
  const shelfDepth = bodyDepth - wall - 0.06;
  const shelfZ = bodyZ + wall / 2 - 0.02;
  const shelves = [feet + h * 0.36, feet + h * 0.66];

  return (
    <group {...props} {...bind}>
      {[
        [-w / 2 + 0.05, -d / 2 + 0.06],
        [w / 2 - 0.05, -d / 2 + 0.06],
        [-w / 2 + 0.05, front - 0.05],
        [w / 2 - 0.05, front - 0.05],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, feet / 2, z]} castShadow>
          <cylinderGeometry args={[0.016, 0.012, feet, 12]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}

      {/* Cabinet: five slabs around an open front. */}
      <RoundedBox args={[w, h, wall]} radius={0.01} position={[0, feet + h / 2, -d / 2 + wall / 2]} castShadow receiveShadow>
        <Enamel />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[wall, h, bodyDepth]} radius={0.01} position={[(side * (w - wall)) / 2, feet + h / 2, bodyZ]} castShadow receiveShadow>
          <Enamel />
        </RoundedBox>
      ))}
      <RoundedBox args={[w, wall, bodyDepth]} radius={0.01} position={[0, feet + h - wall / 2, bodyZ]} castShadow receiveShadow>
        <Enamel />
      </RoundedBox>
      <RoundedBox args={[w, wall, bodyDepth]} radius={0.01} position={[0, feet + wall / 2, bodyZ]} castShadow receiveShadow>
        <Enamel />
      </RoundedBox>

      {/* Inside: light strip, glass shelves and drinks. */}
      <mesh position={[0, feet + h - wall - 0.004, bodyZ + 0.04]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[inner * 0.6, 0.03]} />
        <meshBasicMaterial ref={strip} color="#000000" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, feet + h * 0.72, bodyZ + 0.06]} color="#eef4ff" intensity={0} distance={1.4} decay={2} />
      {shelves.map((y) => (
        <mesh key={y} position={[0, y, shelfZ]}>
          <boxGeometry args={[inner, 0.006, shelfDepth]} />
          <meshPhysicalMaterial color="#cfe3ee" transparent opacity={0.35} roughness={0.05} />
        </mesh>
      ))}
      <Can position={[-0.13, feet + wall, shelfZ - 0.04]} color="#c8102e" />
      <Can position={[-0.055, feet + wall, shelfZ + 0.03]} color="#c8102e" />
      <Can position={[0.03, feet + wall, shelfZ - 0.05]} color="#d7dbe0" />
      <Bottle position={[0.13, feet + wall, shelfZ - 0.01]} color="#3f7a4a" />
      <Can position={[-0.12, shelves[0] + 0.003, shelfZ]} color="#1f6fd1" />
      <Can position={[-0.04, shelves[0] + 0.003, shelfZ - 0.05]} color="#1f6fd1" />
      <Bottle position={[0.1, shelves[0] + 0.003, shelfZ - 0.02]} color="#8a5a2b" />
      <Can position={[0.02, shelves[1] + 0.003, shelfZ - 0.02]} color="#f2a41c" />
      <Can position={[0.11, shelves[1] + 0.003, shelfZ + 0.02]} color="#d7dbe0" />

      {/* Door, hinged on the right edge. */}
      <group ref={door} position={[w / 2, 0, front]}>
        <RoundedBox args={[w, h, doorDepth]} radius={0.024} smoothness={5} position={[-w / 2, feet + h / 2, doorDepth / 2]} castShadow receiveShadow>
          <Enamel />
        </RoundedBox>
        <mesh position={[-w / 2, feet + h / 2, -0.004]}>
          <boxGeometry args={[w - 0.05, h - 0.05, 0.01]} />
          <meshStandardMaterial color="#eeeae0" roughness={0.6} />
        </mesh>
        <mesh position={[-w / 2, feet + h * 0.2, -0.04]}>
          <boxGeometry args={[w - 0.1, 0.05, 0.06]} />
          <meshPhysicalMaterial color="#dfeaf0" transparent opacity={0.45} roughness={0.1} />
        </mesh>
        <Can position={[-w / 2 - 0.07, feet + h * 0.17, -0.04]} color="#f2a41c" />
        <Can position={[-w / 2 + 0.05, feet + h * 0.17, -0.04]} color="#c8102e" />

        <mesh position={[-w + 0.055, feet + h * 0.6, doorDepth + 0.026]} castShadow>
          <capsuleGeometry args={[0.009, 0.2, 6, 12]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        {[-0.085, 0.085].map((offset) => (
          <mesh key={offset} position={[-w + 0.055, feet + h * 0.6 + offset, doorDepth + 0.012]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.006, 0.006, 0.026, 10]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
        ))}
        <mesh position={[-w / 2, feet + h - 0.075, doorDepth + 0.002]}>
          <boxGeometry args={[0.085, 0.016, 0.004]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>

        {/* A sticky note and two magnets. */}
        <mesh position={[-w / 2 + 0.07, feet + h * 0.52, doorDepth + 0.0012]} rotation-z={-0.08}>
          <planeGeometry args={[0.075, 0.075]} />
          <meshStandardMaterial color="#f3dc6b" roughness={0.9} />
        </mesh>
        <mesh position={[-w / 2 + 0.07, feet + h * 0.52 + 0.03, doorDepth + 0.004]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.009, 0.009, 0.006, 14]} />
          <meshStandardMaterial color="#c8102e" roughness={0.35} />
        </mesh>
        <mesh position={[-w / 2 - 0.02, feet + h * 0.36, doorDepth + 0.004]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, 0.006, 14]} />
          <meshStandardMaterial color="#1f6fd1" roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}
