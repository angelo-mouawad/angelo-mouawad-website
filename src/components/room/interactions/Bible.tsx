"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import { canvasTexture, usePbr } from "@/components/room/scene/textures";
import { LinkObject } from "./LinkObject";

const BOOK = { width: 0.165, height: 0.235, thickness: 0.042 };
const LEAN = -0.34;

function coverArt() {
  return canvasTexture(256, 364, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#d8b25a";
    ctx.fillStyle = "#d8b25a";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.fillRect(w / 2 - 7, 92, 14, 132);
    ctx.fillRect(w / 2 - 38, 128, 76, 14);
    ctx.font = "600 21px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("HOLY BIBLE", w / 2, 290);
  });
}

/** A leather Bible resting on a small wooden stand. Links to /bible. */
export function Bible(props: ThreeElements["group"]) {
  const leather = usePbr("brown_leather", 1, 1.4);
  const wood = usePbr("walnut_veneer", 0.5, 0.5);
  const art = useMemo(() => coverArt(), []);
  const { width, height, thickness } = BOOK;

  return (
    <group {...props}>
      <mesh position={[0, 0.006, 0.015]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.012, 0.13]} />
        <meshStandardMaterial {...wood} color="#8a6a50" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.118, -0.058]} rotation-x={LEAN} castShadow receiveShadow>
        <boxGeometry args={[0.19, 0.24, 0.01]} />
        <meshStandardMaterial {...wood} color="#8a6a50" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.022, 0.058]} castShadow>
        <boxGeometry args={[0.2, 0.022, 0.014]} />
        <meshStandardMaterial {...wood} color="#8a6a50" roughness={0.6} />
      </mesh>

      <LinkObject id="bible" hitSize={[0.26, 0.34, 0.2]} hitPosition={[0, 0.15, 0]} labelPosition={[0, 0.36, 0]} lift={0.022}>
        <group position={[0, 0.132, -0.022]} rotation-x={LEAN}>
          <RoundedBox args={[width, height, thickness]} radius={0.006} smoothness={3} castShadow>
            <meshStandardMaterial {...leather} color="#3a2318" roughness={0.75} />
          </RoundedBox>
          <mesh position={[0.006, 0, 0]}>
            <boxGeometry args={[width - 0.006, height - 0.012, thickness - 0.012]} />
            <meshStandardMaterial color="#d9c48a" roughness={0.45} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, thickness / 2 + 0.0006]}>
            <planeGeometry args={[width - 0.01, height - 0.01]} />
            <meshStandardMaterial map={art} transparent roughness={0.3} metalness={0.9} emissive="#6b4d14" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0.03, -height / 2 - 0.02, 0]}>
            <boxGeometry args={[0.008, 0.05, 0.001]} />
            <meshStandardMaterial color="#8c1f24" roughness={0.7} />
          </mesh>
        </group>
      </LinkObject>
    </group>
  );
}
