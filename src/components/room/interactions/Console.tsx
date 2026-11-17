"use client";

import { Billboard, Html } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Model } from "@/components/room/models/Model";
import { PALETTE } from "@/components/room/scene/layout";
import { useSettings } from "@/components/room/scene/settings";
import { canvasTexture } from "@/components/room/scene/textures";
import { frame } from "@/lib/frame";
import { drawConsoleScreen, SCREEN_PX } from "./consoleScreen";
import { useToy } from "./useToy";

const TV = { width: 1.2, height: 0.675 };
const HINT = new THREE.Color(PALETTE.cyan).multiplyScalar(1.5);
// The DualSense file stands upright with its buttons on -z. Tipped back by a quarter turn it lies face up, and the
// extra 0.17 rad is where it settles: resting on both grip tips and the trigger edge at once.
const FACE_UP: [number, number, number] = [Math.PI / 2 + 0.17, 0, 0];
// Along the sideboard beside the console. Local -x runs along the top, away from the console.
const CONTROLLERS: { position: [number, number, number]; turn: number }[] = [
  { position: [-0.27, 0, 0.03], turn: 0.18 },
  { position: [-0.49, 0, -0.02], turn: Math.PI - 0.32 },
];

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

  const dashboard = useMemo(() => canvasTexture(SCREEN_PX.width, SCREEN_PX.height, drawConsoleScreen), []);
  useEffect(() => {
    const redraw = () => {
      drawConsoleScreen(dashboard.image.getContext("2d")!, SCREEN_PX.width, SCREEN_PX.height);
      dashboard.needsUpdate = true;
    };
    document.fonts.ready.then(redraw);
    // Keeps the clock in the corner current.
    const timer = window.setInterval(redraw, 30_000);
    return () => window.clearInterval(timer);
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
        {/* Playstation 5 Dualsense by AHarmlessPotato (CC BY 4.0). Outside the console's hover group, so only the console toggles. */}
        {CONTROLLERS.map(({ position, turn }) => (
          <Model key={position[0]} name="dualsense" longest={0.16} orient={FACE_UP} position={position} rotation-y={turn} />
        ))}

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
        <pointLight ref={glow} position={[0, 0, 0.5]} color="#e0906a" intensity={0} distance={3.5} decay={2} />
      </group>
    </>
  );
}
