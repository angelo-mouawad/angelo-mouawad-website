"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export const MODELS = [
  "binder_notebook",
  "book_encyclopedia_set_01",
  "camera_01",
  "cameraman_backpack",
  "classic_ps5",
  "desk_lamp_arm_01",
  "football",
  "gamepad",
  "gaming_chair",
  "gaming_laptop",
  "gaming_mouse",
  "gaming_pc",
  "modern_wooden_cabinet",
  "office_notepads",
  "potted_plant_01",
  "potted_plant_02",
  "potted_plant_04",
  "wall_clock",
] as const;

export type ModelName = (typeof MODELS)[number];

export const modelUrl = (name: ModelName) => `/models/${name}.glb`;

type Anchor = "bottom" | "center" | "top" | "back" | "origin";

export interface FitOptions {
  /** Scale so the model is this tall. */
  height?: number;
  /** Or scale so its longest edge is this long. */
  longest?: number;
  /** Which point of the model lands on the group's position. "origin" keeps the file's own origin. */
  anchor?: Anchor;
}

const box = new THREE.Box3();
const size = new THREE.Vector3();
const center = new THREE.Vector3();

/** Scale and offset that seat an object on the origin according to its anchor. */
export function fit(object: THREE.Object3D, { height, longest, anchor = "bottom" }: FitOptions) {
  box.setFromObject(object);
  box.getSize(size);
  box.getCenter(center);
  const scale = height ? height / size.y : longest ? longest / Math.max(size.x, size.y, size.z) : 1;
  if (anchor === "origin") return { scale, position: [0, 0, 0] as [number, number, number] };
  const y = anchor === "bottom" ? box.min.y : anchor === "top" ? box.max.y : center.y;
  const z = anchor === "back" ? box.min.z : center.z;
  return {
    scale,
    position: [-center.x * scale, -y * scale, -z * scale] as [number, number, number],
  };
}

export function enableShadows(object: THREE.Object3D, cast = true) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = cast;
      child.receiveShadow = true;
    }
  });
}

type ModelProps = Omit<ThreeElements["group"], "name"> &
  FitOptions & {
    name: ModelName;
    /** Use one named node of the file instead of the whole scene. */
    node?: string;
    /** Hide meshes whose material name contains this text. */
    hide?: string;
    shadows?: boolean;
  };

export function Model({ name, node, hide, height, longest, anchor, shadows = true, children, ...props }: ModelProps) {
  const { scene } = useGLTF(modelUrl(name));

  const { object, placement } = useMemo(() => {
    const source = (node && scene.getObjectByName(node)) || scene;
    const clone = source.clone(true);
    enableShadows(clone, shadows);
    if (hide) {
      clone.traverse((child) => {
        const material = (child as THREE.Mesh).material as THREE.Material | undefined;
        if (material?.name.includes(hide)) child.visible = false;
      });
    }
    return { object: clone, placement: fit(clone, { height, longest, anchor }) };
  }, [scene, node, hide, height, longest, anchor, shadows]);

  return (
    <group {...props}>
      <group scale={placement.scale} position={placement.position}>
        <primitive object={object} />
      </group>
      {children}
    </group>
  );
}

MODELS.forEach((name) => useGLTF.preload(modelUrl(name)));
