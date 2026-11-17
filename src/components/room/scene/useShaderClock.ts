"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { frame } from "@/lib/frame";

/** Drives the uTime uniform of a shader material, plus uScale for point sprites and uDive for the monitor when present. */
export function useShaderClock(animate: boolean) {
  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock, size, viewport }) => {
    const uniforms = material.current?.uniforms;
    if (!uniforms) return;
    if (uniforms.uScale) uniforms.uScale.value = size.height * viewport.dpr;
    if (uniforms.uDive) uniforms.uDive.value = frame.dive;
    if (animate) uniforms.uTime.value = clock.elapsedTime;
  });

  return material;
}
