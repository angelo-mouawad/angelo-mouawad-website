"use client";

import type { ThreeElements } from "@react-three/fiber";
import { Model } from "@/components/room/models/Model";
import { LinkObject } from "./LinkObject";

/** A loose pile of notebooks and pads. Links to /notes. */
export function Notebooks(props: Omit<ThreeElements["group"], "id">) {
  return (
    <LinkObject id="notes" hitSize={[0.36, 0.15, 0.4]} hitPosition={[0, 0.065, 0]} labelPosition={[0, 0.3, 0]} lift={0.025} {...props}>
      <Model name="office_notepads" node="office_notepads_a4_stack" position={[0, 0, 0]} rotation-y={0.12} />
      <Model name="office_notepads" node="office_notepads_yellow_pad" position={[0.012, 0.0102, 0.006]} rotation-y={-0.2} />
      <Model name="binder_notebook" node="binder_notebook_closed" position={[-0.01, 0.0205, 0.012]} rotation-y={1.75} />
      <Model name="binder_notebook" node="binder_notebook_closed" position={[0.018, 0.0455, -0.004]} rotation-y={1.32} />
      <Model name="office_notepads" node="office_notepads_note_stack" position={[0.01, 0.0705, 0.02]} rotation-y={0.5} />
      <mesh position={[0.02, 0.0865, 0.02]} rotation={[Math.PI / 2, 0, 1.1]} castShadow>
        <cylinderGeometry args={[0.0042, 0.0042, 0.14, 10]} />
        <meshStandardMaterial color="#12151b" roughness={0.3} metalness={0.6} />
      </mesh>
    </LinkObject>
  );
}
