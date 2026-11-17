"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeElements, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { enableShadows, fit, modelUrl } from "./Model";

const HEIGHT = 0.48;
const MAPS = ["map", "normalMap", "emissiveMap", "roughnessMap", "metalnessMap", "aoMap"] as const;
// The tempered glass side panel's material in the file.
const GLASS = "material";

/**
 * Lian Li dual-chamber case by TCF (CC BY-NC 4.0). The file stands square on its feet with its front on +x and its
 * glass on +z. It is turned so the front faces the room, then mirrored so the glass lands on the right, facing the
 * desk; the mirror also flips the lettering on the parts behind the glass.
 */
export function Pc(props: ThreeElements["group"]) {
  const { scene } = useGLTF(modelUrl("lian_li_case"));
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());

  const { object, placement } = useMemo(() => {
    const clone = scene.clone(true);
    // Front from +x to +z (toward the room); the glass goes to -x until the mirror below.
    clone.rotation.y = -Math.PI / 2;
    enableShadows(clone);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      // Seen mostly at an angle, so the textures need full anisotropic filtering to stay sharp.
      for (const slot of MAPS) {
        const texture = material[slot];
        if (texture) texture.anisotropy = anisotropy;
      }
      if (material.transparent) {
        // The glass panels: let the parts behind show without the panels hiding each other.
        material.depthWrite = false;
        mesh.castShadow = false;
        if (material.name === GLASS) {
          // The file makes the side glass a mirror-smooth metal, which turns the monitor's glow into a blinding spot.
          // Plain glass is not metallic: it keeps a faint sheen and the parts behind stay readable.
          material.metalness = 0;
          material.metalnessMap = null;
          material.roughness = 0.15;
          material.roughnessMap = null;
          material.envMapIntensity = 0.3;
        }
      } else {
        material.envMapIntensity = 0.5;
      }
      mesh.material = material;
    });
    // Fitted after turning, so the feet are the lowest point and land exactly on the desk.
    return { object: clone, placement: fit(clone, { height: HEIGHT }) };
  }, [scene, anisotropy]);

  const [x, y, z] = placement.position;

  return (
    <group {...props}>
      {/* Mirrored across x: the glass moves from the left side to the right. */}
      <group scale={[-placement.scale, placement.scale, placement.scale]} position={[-x, y, z]}>
        <primitive object={object} />
      </group>
    </group>
  );
}
