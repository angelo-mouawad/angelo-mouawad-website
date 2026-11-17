"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "@/components/room/scene/layout";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";

// A game case is 135 × 170 × 14 mm.
const CASE = { width: 0.135, depth: 0.17, thickness: 0.014 };

interface Game {
  title: string;
  colours: [string, string, string];
  turn: number;
  shift: [number, number];
}

// Made-up titles and abstract covers in the room's own colours, so nothing reads as a real product.
const GAMES: Game[] = [
  { title: "LAST LIGHT", colours: ["#1a1030", "#ff7a45", "#ffd08a"], turn: 0.06, shift: [0.002, 0.004] },
  { title: "ORBITAL", colours: ["#06121f", "#2f9bff", "#6fe3ff"], turn: -0.09, shift: [-0.004, -0.003] },
  { title: "SKYLINE", colours: ["#0c1424", "#8fb8ff", "#e1f0fb"], turn: 0.14, shift: [0.003, -0.006] },
  { title: "NEON DRIFT", colours: ["#0b0718", "#12b5e5", "#ff4fa3"], turn: -0.04, shift: [-0.002, 0.005] },
];

function drawCover(ctx: CanvasRenderingContext2D, w: number, h: number, game: Game) {
  const [ground, mid, light] = game.colours;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, ground);
  sky.addColorStop(0.65, mid);
  sky.addColorStop(1, light);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // A sun and a horizon of hills: simple shapes that hold up when small.
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.52, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.quadraticCurveTo(w * 0.3, h * 0.58, w * 0.55, h * 0.7);
  ctx.quadraticCurveTo(w * 0.8, h * 0.62, w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  // Header band, like a console case, without anyone's logo.
  ctx.fillStyle = "#1f6fd1";
  ctx.fillRect(0, 0, w, h * 0.09);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(w * 0.06, h * 0.03, w * 0.18, h * 0.03);
  ctx.font = `900 ${Math.round(w * 0.12)}px ${fontFamily("--font-sans")}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(game.title, w / 2, h * 0.22);
}

function drawSpine(ctx: CanvasRenderingContext2D, w: number, h: number, game: Game) {
  ctx.fillStyle = "#0d1016";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1f6fd1";
  ctx.fillRect(0, 0, w * 0.12, h);
  ctx.fillStyle = game.colours[1];
  ctx.fillRect(w * 0.9, 0, w * 0.1, h);
  ctx.font = `800 ${Math.round(h * 0.62)}px ${fontFamily("--font-sans")}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e9eff6";
  ctx.fillText(game.title, w * 0.17, h * 0.54);
}

function GameCase({ game, y }: { game: Game; y: number }) {
  const cover = useMemo(() => canvasTexture(270, 340, (ctx, w, h) => drawCover(ctx, w, h, game)), [game]);
  const spine = useMemo(() => canvasTexture(680, 56, (ctx, w, h) => drawSpine(ctx, w, h, game)), [game]);

  useEffect(() => {
    document.fonts.ready.then(() => {
      drawCover(cover.image.getContext("2d")!, cover.image.width, cover.image.height, game);
      drawSpine(spine.image.getContext("2d")!, spine.image.width, spine.image.height, game);
      cover.needsUpdate = true;
      spine.needsUpdate = true;
    });
  }, [cover, spine, game]);

  const plastic = { color: "#0d1016", roughness: 0.35, metalness: 0.1 };
  return (
    <mesh position={[game.shift[0], y + CASE.thickness / 2, game.shift[1]]} rotation-y={game.turn} castShadow receiveShadow>
      <boxGeometry args={[CASE.width, CASE.thickness, CASE.depth]} />
      {/* Box faces: +x (spine, toward the room), -x, top (cover), bottom, +z, -z. */}
      <meshStandardMaterial attach="material-0" map={spine} roughness={0.6} />
      <meshStandardMaterial attach="material-1" {...plastic} />
      <meshStandardMaterial attach="material-2" map={cover} roughness={0.7} envMapIntensity={0.4} />
      <meshStandardMaterial attach="material-3" {...plastic} />
      <meshStandardMaterial attach="material-4" {...plastic} />
      <meshStandardMaterial attach="material-5" {...plastic} />
    </mesh>
  );
}

/** A small, slightly untidy pile of games beside the console. Covers face up, spines face the room. */
export function GameStack(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      {GAMES.map((game, index) => (
        <GameCase key={game.title} game={game} y={index * (CASE.thickness + 0.0004)} />
      ))}
    </group>
  );
}

const ORB = { radius: 0.068, baseRadius: 0.05, baseHeight: 0.024 };

/** A frosted glass orb lamp on a walnut base: a soft, warm glow on the sideboard. */
export function OrbLamp(props: ThreeElements["group"]) {
  const glow = useMemo(() => new THREE.Color(PALETTE.warmSoft), []);
  return (
    <group {...props}>
      <mesh position-y={ORB.baseHeight / 2} castShadow receiveShadow>
        <cylinderGeometry args={[ORB.baseRadius, ORB.baseRadius * 1.08, ORB.baseHeight, 40]} />
        <meshStandardMaterial color="#4a2f1f" roughness={0.55} />
      </mesh>
      <mesh position-y={ORB.baseHeight + 0.001} receiveShadow>
        <cylinderGeometry args={[ORB.baseRadius * 0.62, ORB.baseRadius * 0.62, 0.002, 40]} />
        <meshStandardMaterial color="#c9a46a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Resting on its brass collar. */}
      <mesh position-y={ORB.baseHeight + 0.002 + ORB.radius}>
        <sphereGeometry args={[ORB.radius, 48, 32]} />
        <meshStandardMaterial color="#fff4e6" emissive={glow} emissiveIntensity={0.55} roughness={0.9} />
      </mesh>
      <pointLight position-y={ORB.baseHeight + ORB.radius} color={PALETTE.warmSoft} intensity={0.22} distance={1.1} decay={2} />
    </group>
  );
}
