"use client";

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { consumeShadowFrame } from "@/lib/frame";
import { PALETTE, ROOM, SCREEN } from "./layout";
import { useSettings } from "./settings";

/** Shadow maps only re-render on frames where something that casts a shadow has moved. */
function ShadowUpdater() {
  useFrame(({ gl }) => {
    if (consumeShadowFrame()) gl.shadowMap.needsUpdate = true;
  });
  return null;
}

export function Lighting() {
  const { quality } = useSettings();
  const moonTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(-0.7, 0, -0.5);
    return target;
  }, []);

  return (
    <>
      <ShadowUpdater />
      <Environment files="/hdri/shanghai_bund_1k.hdr" environmentIntensity={0.4} />
      <hemisphereLight args={["#46578a", "#2b2530", 0.55]} />

      {/* Moonlight through the blinds. The only light that throws the long striped shadows. */}
      <primitive object={moonTarget} />
      <spotLight
        position={[-3.2, 3.3, -5.5]}
        target={moonTarget}
        color={PALETTE.moon}
        intensity={75}
        angle={0.4}
        penumbra={0.45}
        distance={14}
        decay={2}
        castShadow
        shadow-mapSize={[quality.moonShadow, quality.moonShadow]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={12}
      />

      <pointLight position={[SCREEN.x, SCREEN.y, SCREEN.z + 0.45]} color="#6fb4ff" intensity={0.55} distance={3} decay={2} />
      <pointLight position={[0, 0.5, ROOM.back + 0.14]} color={PALETTE.warm} intensity={0.45} distance={2.4} decay={2} />
      {/* Bias light behind the monitor. */}
      <pointLight position={[SCREEN.x, SCREEN.y, ROOM.back + 0.1]} color="#5b8fe0" intensity={0.5} distance={2.2} decay={2} />
    </>
  );
}
