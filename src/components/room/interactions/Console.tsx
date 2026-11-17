"use client";

import { Billboard, Html } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Model } from "@/components/room/models/Model";
import { PALETTE } from "@/components/room/scene/layout";
import { useSettings } from "@/components/room/scene/settings";
import { canvasTexture, fontFamily } from "@/components/room/scene/textures";
import { frame } from "@/lib/frame";
import { useToy } from "./useToy";

const TV = { width: 1.2, height: 0.675 };
const HINT = new THREE.Color(PALETTE.cyan).multiplyScalar(1.5);

function drawDashboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sans = fontFamily("--font-sans");
  const mono = fontFamily("--font-mono");
  const background = ctx.createLinearGradient(0, 0, w, h);
  background.addColorStop(0, "#071226");
  background.addColorStop(1, "#0e2a4a");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#6fe3ff";
  ctx.font = `500 22px ${mono}`;
  ctx.fillText("GAME MODE", 60, 64);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(233,238,244,0.75)";
  ctx.fillText(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), w - 60, 64);
  ctx.textAlign = "left";

  for (let i = 0; i < 6; i++) {
    const big = i === 0;
    const size = big ? 210 : 112;
    const x = 60 + (big ? 0 : 300 + (i - 1) * 124);
    const y = big ? 140 : 190;
    const tile = ctx.createLinearGradient(x, y, x + size, y + size);
    tile.addColorStop(0, `hsl(${200 + i * 22} 60% 32%)`);
    tile.addColorStop(1, `hsl(${220 + i * 22} 70% 14%)`);
    ctx.fillStyle = tile;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 14);
    ctx.fill();
    if (big) {
      ctx.strokeStyle = "rgba(111,227,255,0.9)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#e9eef4";
  ctx.font = `800 36px ${sans}`;
  ctx.fillText("Continue playing", 60, 430);
  ctx.fillStyle = "rgba(233,238,244,0.5)";
  ctx.font = `400 18px ${mono}`;
  ctx.fillText("Press any button", 60, 468);
}

/** PS5 on the sideboard with the TV above it. Click or tap the console to switch both on and off. */
export function Console({ tvPosition, ...props }: ThreeElements["group"] & { tvPosition: [number, number, number] }) {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn((value) => !value), []);
  const [hovered, bind] = useToy(toggle);
  const { reducedMotion } = useSettings();
  const hint = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null);
  const level = useRef(0);
  const bar = useRef<THREE.MeshBasicMaterial>(null);
  const picture = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);

  const dashboard = useMemo(() => canvasTexture(1024, 576, drawDashboard), []);
  useEffect(() => {
    document.fonts.ready.then(() => {
      drawDashboard(dashboard.image.getContext("2d")!, 1024, 576);
      dashboard.needsUpdate = true;
    });
  }, [dashboard]);

  useFrame(({ clock }, delta) => {
    if (hint.current) {
      const beat = reducedMotion ? 0.35 : (clock.elapsedTime * 0.55 + 0.4) % 1;
      hint.current.scale.setScalar(0.7 + beat * 0.9);
      hint.current.material.opacity = hovered ? 0 : (1 - beat) * 0.75;
    }
    const target = on ? 1 : 0;
    if (level.current !== target) {
      level.current = THREE.MathUtils.damp(level.current, target, 6, delta);
      if (Math.abs(level.current - target) < 0.002) level.current = target;
    }
    const k = level.current;
    if (bar.current) bar.current.color.set(PALETTE.cyan).multiplyScalar(0.25 + k * 3.2);
    if (picture.current) picture.current.opacity = k;
    if (glow.current) glow.current.intensity = k * (1.1 + Math.sin(clock.elapsedTime * 9) * 0.04);
  });

  return (
    <>
      <group {...props}>
        <group {...bind}>
          <Model name="classic_ps5" height={0.39} />
        </group>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.012, 0.3, 0.006]} />
          <meshBasicMaterial ref={bar} color={PALETTE.cyan} toneMapped={false} />
        </mesh>
        <Model name="gamepad" longest={0.16} position={[0.02, 0, 0.26]} rotation-y={0.5} />

        <Billboard position={[0, 0.5, 0]}>
          <mesh ref={hint} renderOrder={5}>
            <ringGeometry args={[0.024, 0.031, 32]} />
            <meshBasicMaterial color={HINT} transparent opacity={0.6} toneMapped={false} depthTest={false} depthWrite={false} />
          </mesh>
          <mesh renderOrder={5}>
            <circleGeometry args={[0.0085, 16]} />
            <meshBasicMaterial color={HINT} transparent opacity={hovered ? 0 : 0.9} toneMapped={false} depthTest={false} depthWrite={false} />
          </mesh>
        </Billboard>
        {hovered && frame.lastPointer === "mouse" && (
          <Html position={[0, 0.64, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
            <div className="object-label object-label-toy">
              <b>PlayStation</b>
              <span>{on ? "click to switch off" : "click to switch on"}</span>
            </div>
          </Html>
        )}
      </group>

      <group position={tvPosition} rotation-y={Math.PI / 2}>
        <mesh castShadow>
          <boxGeometry args={[TV.width + 0.03, TV.height + 0.03, 0.03]} />
          <meshStandardMaterial color="#060709" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position-z={0.0155}>
          <planeGeometry args={[TV.width, TV.height]} />
          <meshStandardMaterial color="#020305" roughness={0.12} metalness={0.6} envMapIntensity={1.2} />
        </mesh>
        <mesh position-z={0.0165}>
          <planeGeometry args={[TV.width, TV.height]} />
          <meshBasicMaterial ref={picture} map={dashboard} transparent opacity={0} toneMapped={false} />
        </mesh>
        <pointLight ref={glow} position={[0, 0, 0.5]} color="#5d93e8" intensity={0} distance={3.5} decay={2} />
      </group>
    </>
  );
}
