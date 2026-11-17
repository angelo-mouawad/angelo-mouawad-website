"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { enableShadows, fit, modelUrl } from "./Model";

// A full-size board is about 44 cm wide. The mouse comes with it at the same scale.
const KEYBOARD_WIDTH = 0.44;
// In the file the mouse sits well to the right of the board (+x); anything past this belongs to it.
const MOUSE_FROM_X = 7;

const box = new THREE.Box3();
const center = new THREE.Vector3();

/** Copies the meshes of one part into a group of its own, keeping their place in the file. */
function part(scene: THREE.Object3D, keep: (mesh: THREE.Mesh) => boolean) {
  const group = new THREE.Group();
  scene.updateMatrixWorld(true);
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !keep(mesh)) return;
    const copy = mesh.clone();
    copy.matrixAutoUpdate = false;
    copy.matrix.copy(mesh.matrixWorld);
    // The indicator cover uses transmission, which would cost the room a whole extra render pass.
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    if (material.transmission) {
      const plain = material.clone();
      plain.transmission = 0;
      copy.material = plain;
    }
    group.add(copy);
  });
  enableShadows(group);
  return group;
}

const isMouse = (mesh: THREE.Mesh) => {
  box.setFromObject(mesh).getCenter(center);
  return center.x > MOUSE_FROM_X;
};

/**
 * Mouse and Keyboard by gorzi (CC BY 4.0). The file holds both, and the mouse's base sits a few millimetres above the
 * board's, so they are split and each one is seated on the mat by its own lowest point.
 */
export function Peripherals({ mouse, ...props }: ThreeElements["group"] & { mouse: { position: [number, number, number]; rotation?: number } }) {
  const { scene } = useGLTF(modelUrl("mouse_and_keyboard"));

  const parts = useMemo(() => {
    const board = part(scene, (mesh) => !isMouse(mesh));
    const rodent = part(scene, isMouse);
    const scale = KEYBOARD_WIDTH / box.setFromObject(board).getSize(new THREE.Vector3()).x;
    return {
      board: { object: board, placement: fit(board, {}), scale },
      mouse: { object: rodent, placement: fit(rodent, {}), scale },
    };
  }, [scene]);

  const seat = ({ placement, scale }: { placement: ReturnType<typeof fit>; scale: number }) =>
    placement.position.map((value) => value * scale) as [number, number, number];

  return (
    <group {...props}>
      <group scale={parts.board.scale} position={seat(parts.board)}>
        <primitive object={parts.board.object} />
      </group>
      <group position={mouse.position} rotation-y={mouse.rotation ?? 0}>
        <group scale={parts.mouse.scale} position={seat(parts.mouse)}>
          <primitive object={parts.mouse.object} />
        </group>
      </group>
    </group>
  );
}
