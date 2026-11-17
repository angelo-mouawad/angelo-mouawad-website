"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ROOM, WINDOW } from "./layout";
import { canvasTexture, usePbr } from "./textures";

const WALL_TILE = 2.4;
const FLOOR_TILE = 1.5;
const WALL_COLOR = "#77746f";

interface PanelProps {
  /** Bounds along the wall (u) and up (v), in metres. */
  u: [number, number];
  v: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}

function WallPanel({ u, v, position, rotation }: PanelProps) {
  const width = u[1] - u[0];
  const height = v[1] - v[0];
  const maps = usePbr("painted_plaster_wall", width / WALL_TILE, height / WALL_TILE, u[0] / WALL_TILE, v[0] / WALL_TILE);
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial {...maps} color={WALL_COLOR} roughness={0.95} normalScale={new THREE.Vector2(0.45, 0.45)} />
    </mesh>
  );
}

function BackWall() {
  const w = { x0: WINDOW.x - WINDOW.width / 2, x1: WINDOW.x + WINDOW.width / 2, y0: WINDOW.y - WINDOW.height / 2, y1: WINDOW.y + WINDOW.height / 2 };
  const panels: [number, number, number, number][] = [
    [ROOM.left, w.x0, 0, ROOM.height],
    [w.x1, ROOM.right, 0, ROOM.height],
    [w.x0, w.x1, 0, w.y0],
    [w.x0, w.x1, w.y1, ROOM.height],
  ];
  return (
    <>
      {panels.map(([x0, x1, y0, y1]) => (
        <WallPanel key={`${x0}-${y0}`} u={[x0, x1]} v={[y0, y1]} position={[(x0 + x1) / 2, (y0 + y1) / 2, ROOM.back]} />
      ))}
    </>
  );
}

function Floor() {
  const width = ROOM.right - ROOM.left;
  const depth = ROOM.front - ROOM.back;
  const maps = usePbr("herringbone_parquet", width / FLOOR_TILE, depth / FLOOR_TILE);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[(ROOM.left + ROOM.right) / 2, 0, (ROOM.front + ROOM.back) / 2]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={maps.map} normalMap={maps.normalMap} color="#a48b74" roughness={0.78} normalScale={new THREE.Vector2(0.35, 0.35)} envMapIntensity={0.3} />
    </mesh>
  );
}

function drawRug(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#5d6470";
  ctx.fillRect(0, 0, w, h);
  for (let r = 250; r > 6; r -= 6) {
    const tone = 70 + Math.random() * 46;
    ctx.strokeStyle = `rgba(${tone},${tone + 6},${tone + 16},0.55)`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(226,214,190,0.5)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 232, 0, Math.PI * 2);
  ctx.stroke();
}

function Rug() {
  const fabric = usePbr("cotton_jersey", 10, 10);
  const pattern = useMemo(() => canvasTexture(512, 512, drawRug), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0.15, 0.006, -0.95]} receiveShadow>
      <circleGeometry args={[1.3, 64]} />
      <meshStandardMaterial map={pattern} normalMap={fabric.normalMap} normalScale={new THREE.Vector2(1.6, 1.6)} roughness={1} />
    </mesh>
  );
}

export function Shell() {
  const depth = ROOM.front - ROOM.back;
  const midZ = (ROOM.front + ROOM.back) / 2;
  const width = ROOM.right - ROOM.left;
  const midX = (ROOM.left + ROOM.right) / 2;

  return (
    <group>
      <Floor />
      <Rug />
      <BackWall />
      <WallPanel u={[ROOM.back, ROOM.front]} v={[0, ROOM.height]} position={[ROOM.left, ROOM.height / 2, midZ]} rotation={[0, Math.PI / 2, 0]} />
      <WallPanel u={[ROOM.back, ROOM.front]} v={[0, ROOM.height]} position={[ROOM.right, ROOM.height / 2, midZ]} rotation={[0, -Math.PI / 2, 0]} />

      <mesh rotation-x={Math.PI / 2} position={[midX, ROOM.height, midZ]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#4f4d4a" roughness={1} />
      </mesh>

      <mesh position={[midX, 0.045, ROOM.back + 0.012]} receiveShadow>
        <boxGeometry args={[width, 0.09, 0.024]} />
        <meshStandardMaterial color="#16181d" roughness={0.6} />
      </mesh>
      {[ROOM.left + 0.012, ROOM.right - 0.012].map((x) => (
        <mesh key={x} position={[x, 0.045, midZ]} receiveShadow>
          <boxGeometry args={[0.024, 0.09, depth]} />
          <meshStandardMaterial color="#16181d" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
