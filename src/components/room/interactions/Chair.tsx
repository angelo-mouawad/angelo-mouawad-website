"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Model } from "@/components/room/models/Model";
import { BlobShadow } from "@/components/room/scene/BlobShadow";
import { frame, invalidateShadows } from "@/lib/frame";

// It turns from facing the room to facing the desk and slides a touch to the left, so the camera can settle in where its occupant would sit.
const START = { x: -0.3, z: -1.45, turn: 0.45 };
const END = { x: -0.46, z: -1.52, turn: Math.PI };

/** Swivels to face the desk as the camera pushes toward the monitor. */
export function Chair() {
  const chair = useRef<THREE.Group>(null);
  const last = useRef(-1);

  useFrame(() => {
    if (!chair.current) return;
    const k = THREE.MathUtils.smootherstep(frame.cameraProgress, 0.08, 0.62);
    if (Math.abs(k - last.current) < 0.0005) return;
    last.current = k;
    chair.current.position.set(THREE.MathUtils.lerp(START.x, END.x, k), 0, THREE.MathUtils.lerp(START.z, END.z, k));
    chair.current.rotation.y = THREE.MathUtils.lerp(START.turn, END.turn, k);
    invalidateShadows();
  });

  return (
    <group ref={chair} position={[START.x, 0, START.z]} rotation-y={START.turn}>
      <BlobShadow size={1.25} opacity={0.6} />
      {/* Modern Chair by Cre8t!ve V!be (CC BY 4.0). The file faces +x with its origin on the swivel, so it is turned to face +z like the old chair and spins on its own column. */}
      <Model name="modern_chair" height={1.3} anchor="origin" orient={[0, -Math.PI / 2, 0]} />
    </group>
  );
}
