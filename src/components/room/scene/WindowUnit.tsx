"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useToy } from "@/components/room/interactions/useToy";
import { invalidateShadows } from "@/lib/frame";
import { CityView } from "./CityView";
import { ROOM, WINDOW } from "./layout";
import { useSettings } from "./settings";

const SLAT_GAP = 0.048;
const TILT_CLOSED = 0.72;
const TILT_OPEN = 0.06;
const REVEAL = 0.24;

function Frame() {
  const { width, height } = WINDOW;
  const bar = 0.05;
  return (
    <group position-z={-0.12}>
      {[-1, 1].map((side) => (
        <mesh key={`h${side}`} position={[0, (side * (height - bar)) / 2, 0]} castShadow>
          <boxGeometry args={[width, bar, 0.06]} />
          <meshStandardMaterial color="#0d0f13" roughness={0.45} metalness={0.5} />
        </mesh>
      ))}
      {[-1, 0, 1].map((side) => (
        <mesh key={`v${side}`} position={[(side * (width - bar)) / 2, 0, 0]} castShadow>
          <boxGeometry args={[side === 0 ? 0.035 : bar, height, 0.06]} />
          <meshStandardMaterial color="#0d0f13" roughness={0.45} metalness={0.5} />
        </mesh>
      ))}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial color="#5a6f96" roughness={0.03} metalness={0.9} transparent opacity={0.14} envMapIntensity={1.4} />
      </mesh>
    </group>
  );
}

function Reveal() {
  const { width, height } = WINDOW;
  const sides: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2 + 0.01, -REVEAL / 2], size: [width + 0.04, 0.02, REVEAL] },
    { position: [0, -height / 2 - 0.01, -REVEAL / 2], size: [width + 0.04, 0.02, REVEAL] },
    { position: [-width / 2 - 0.01, 0, -REVEAL / 2], size: [0.02, height, REVEAL] },
    { position: [width / 2 + 0.01, 0, -REVEAL / 2], size: [0.02, height, REVEAL] },
  ];
  return (
    <>
      {sides.map(({ position, size }) => (
        <mesh key={position.join()} position={position} castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#2a2d35" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, -height / 2 - 0.015, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.12, 0.03, 0.14]} />
        <meshStandardMaterial color="#30333b" roughness={0.7} />
      </mesh>
    </>
  );
}

function Blinds() {
  const { width, height } = WINDOW;
  const slats = useRef<THREE.Group>(null);
  const tilt = useRef(TILT_CLOSED);
  const [open, bind] = useToy();
  const count = Math.floor((height - 0.08) / SLAT_GAP);

  useFrame((_, delta) => {
    const target = open ? TILT_OPEN : TILT_CLOSED;
    if (!slats.current || Math.abs(tilt.current - target) < 0.002) return;
    tilt.current = THREE.MathUtils.damp(tilt.current, target, 5, delta);
    for (const slat of slats.current.children) slat.rotation.x = tilt.current;
    invalidateShadows();
  });

  return (
    <group position-z={0.035}>
      <mesh position={[0, height / 2 - 0.025, 0]} castShadow>
        <boxGeometry args={[width - 0.02, 0.045, 0.05]} />
        <meshStandardMaterial color="#14161b" roughness={0.5} metalness={0.3} />
      </mesh>
      <group ref={slats}>
        {Array.from({ length: count }, (_, index) => (
          <mesh key={index} position={[0, height / 2 - 0.075 - index * SLAT_GAP, 0]} rotation-x={TILT_CLOSED} castShadow>
            <boxGeometry args={[width - 0.04, 0.003, 0.044]} />
            <meshStandardMaterial color="#2b2f38" roughness={0.6} metalness={0.2} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x * width, 0, 0.004]}>
          <cylinderGeometry args={[0.0025, 0.0025, height - 0.06, 6]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.6} />
        </mesh>
      ))}
      <mesh position-z={0.03} {...bind}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function WindowUnit() {
  const { reducedMotion } = useSettings();
  return (
    <group position={[WINDOW.x, WINDOW.y, ROOM.back]}>
      <Reveal />
      <Frame />
      <Blinds />
      <CityView position={[0.3, 0.5, -2.2]} size={[9, 6]} animate={!reducedMotion} />
    </group>
  );
}
