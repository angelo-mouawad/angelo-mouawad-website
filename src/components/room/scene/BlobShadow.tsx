"use client";

import { softDotTexture } from "./textures";

/** Cheap fake contact shadow: a soft dark disc just above the floor. */
export function BlobShadow({ size, opacity = 0.5, y = 0.004 }: { size: number; opacity?: number; y?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} renderOrder={1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color="#000000" alphaMap={softDotTexture()} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}
