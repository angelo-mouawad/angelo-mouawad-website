"use client";

import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Model } from "@/components/room/models/Model";
import { BlobShadow } from "@/components/room/scene/BlobShadow";
import { useSettings } from "@/components/room/scene/settings";
import { frame } from "@/lib/frame";

const RADIUS = 0.11;

/** Turns to follow a real mouse. Touch input never moves it. */
export function Football(props: ThreeElements["group"]) {
  const ball = useRef<THREE.Group>(null);
  const { reducedMotion } = useSettings();

  useFrame(({ clock }, delta) => {
    if (!ball.current) return;
    const t = clock.elapsedTime;
    const idle = reducedMotion ? 0 : 1;
    const targetY = frame.mouseSeen ? frame.pointerX * 2.6 : Math.sin(t * 0.26) * 1.5 * idle;
    const targetX = frame.mouseSeen ? frame.pointerY * 1.4 : Math.sin(t * 0.19) * 0.45 * idle;
    ball.current.rotation.y = THREE.MathUtils.damp(ball.current.rotation.y, targetY, 4, delta);
    ball.current.rotation.x = THREE.MathUtils.damp(ball.current.rotation.x, targetX, 4, delta);
  });

  return (
    <group {...props}>
      <BlobShadow size={0.42} opacity={0.55} />
      <group ref={ball} position-y={RADIUS}>
        <Model name="football" node="football_inflated" height={RADIUS * 2} anchor="center" />
      </group>
    </group>
  );
}
