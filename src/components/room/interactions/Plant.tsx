"use client";

import { type ThreeElements, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Model, type ModelName } from "@/components/room/models/Model";
import { useSettings } from "@/components/room/scene/settings";
import { canInteract } from "./useToy";

type PlantProps = Omit<ThreeElements["group"], "name"> & {
  name: Extract<ModelName, "potted_plant_01" | "potted_plant_02" | "potted_plant_04">;
  height: number;
  /** Offsets the sway so neighbouring plants do not move in step. */
  phase?: number;
};

/** Sways gently on its own and rustles when the pointer brushes it. */
export function Plant({ name, height, phase = 0, ...props }: PlantProps) {
  const body = useRef<THREE.Group>(null);
  const energy = useRef(0);
  const { reducedMotion } = useSettings();

  const handlers = useMemo(() => {
    const rustle = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
      if (!canInteract()) return;
      event.stopPropagation();
      energy.current = 1;
    };
    return { onPointerOver: rustle, onClick: rustle };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!body.current || reducedMotion) return;
    const t = clock.elapsedTime + phase;
    energy.current = Math.max(0, energy.current - delta * 0.9);
    const shake = energy.current * energy.current;
    body.current.rotation.z = Math.sin(t * 0.7) * 0.012 + Math.sin(t * 13) * 0.045 * shake;
    body.current.rotation.x = Math.sin(t * 0.55 + 1.3) * 0.008 + Math.cos(t * 11) * 0.03 * shake;
  });

  return (
    <group {...props}>
      <group ref={body} {...handlers}>
        <Model name={name} height={height} />
      </group>
    </group>
  );
}
