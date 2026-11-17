"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { enableShadows, fit, modelUrl } from "@/components/room/models/Model";
import { useSettings } from "@/components/room/scene/settings";

const TURN = Math.PI * 2;
const HANDS = ["hours", "minute", "second"] as const;

// Where each hand points in the source file, as a fraction of a full clockwise turn.
const MODELLED = { hours: 304.5 / 360, minute: 61 / 360, second: 170.2 / 360 };

/** Wall clock showing the visitor's local time. */
export function WallClock({ diameter = 0.34, ...props }: ThreeElements["group"] & { diameter?: number }) {
  const { scene } = useGLTF(modelUrl("wall_clock"));
  const { reducedMotion } = useSettings();

  const clock = useRef<THREE.Group>(null);

  const { object, placement } = useMemo(() => {
    const clone = scene.clone(true);
    enableShadows(clone, false);
    // Compression moves each part's own origin, so every hand turns on a pivot at the clock's centre instead.
    for (const key of HANDS) {
      const node = clone.getObjectByName(`wall_clock_${key}_hand`);
      if (!node) continue;
      const pivot = new THREE.Group();
      pivot.name = key;
      clone.add(pivot);
      pivot.add(node);
    }
    return { object: clone, placement: fit(clone, { longest: diameter, anchor: "back" }) };
  }, [scene, diameter]);

  useFrame(() => {
    const now = new Date();
    const seconds = now.getSeconds() + (reducedMotion ? 0 : now.getMilliseconds() / 1000);
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    const values = { hours: hours / 12, minute: minutes / 60, second: seconds / 60 };
    for (const key of HANDS) {
      const pivot = clock.current?.getObjectByName(key);
      if (pivot) pivot.rotation.z = -(values[key] - MODELLED[key]) * TURN;
    }
  });

  return (
    <group {...props}>
      <group ref={clock} scale={placement.scale} position={placement.position}>
        <primitive object={object} />
      </group>
    </group>
  );
}
