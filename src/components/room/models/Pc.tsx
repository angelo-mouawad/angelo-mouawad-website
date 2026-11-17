"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "@/components/room/scene/layout";
import { enableShadows, fit, modelUrl } from "./Model";

const HEIGHT = 0.48;
const GLASS = "mat24";
const GLOW = ["mat8", "mat13"];

/**
 * Gaming PC by Alex Safayan (CC BY 3.0). The file is mirrored so its glass side faces the desk,
 * and its red parts are lit to keep the room's red accent.
 */
export function Pc(props: ThreeElements["group"]) {
  const { scene } = useGLTF(modelUrl("gaming_pc"));

  const { object, placement } = useMemo(() => {
    const clone = scene.clone(true);
    enableShadows(clone);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material as THREE.MeshStandardMaterial;
      if (source.name === GLASS) {
        const glass = source.clone();
        glass.color.set("#9fb4c4");
        glass.transparent = true;
        glass.opacity = 0.16;
        glass.roughness = 0.08;
        glass.metalness = 0.4;
        glass.depthWrite = false;
        mesh.material = glass;
        mesh.castShadow = false;
      } else if (GLOW.includes(source.name)) {
        const glow = source.clone();
        glow.color.set(PALETTE.red);
        glow.emissive.set(PALETTE.red);
        glow.emissiveIntensity = 2.4;
        glow.toneMapped = false;
        mesh.material = glow;
      } else {
        const body = source.clone();
        body.roughness = Math.max(body.roughness, 0.55);
        body.metalness = Math.min(body.metalness, 0.35);
        body.envMapIntensity = 0.4;
        mesh.material = body;
      }
    });
    return { object: clone, placement: fit(clone, { height: HEIGHT }) };
  }, [scene]);

  return (
    <group {...props}>
      <group scale={[placement.scale, placement.scale, -placement.scale]} position={[placement.position[0], placement.position[1], -placement.position[2]]}>
        <primitive object={object} />
      </group>
      <pointLight position={[0, HEIGHT * 0.55, 0]} color={PALETTE.red} intensity={0.35} distance={1.1} decay={2} />
    </group>
  );
}
