"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSettings } from "@/components/room/scene/settings";
import { frame } from "@/lib/frame";
import { LEAVE } from "@/lib/links";
import { useRoom } from "@/store/room";
import { buildPath, END_FOV, FOCUS, startFov } from "./path";

const INTRO_OFFSET = new THREE.Vector3(0.55, 0.3, 1.5);

const position = new THREE.Vector3();
const lookAt = new THREE.Vector3();

export function CameraRig() {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const { reducedMotion } = useSettings();
  const phase = useRoom((state) => state.phase);
  const leavingTo = useRoom((state) => state.leavingTo);

  const path = useMemo(() => buildPath(aspect), [aspect]);
  const blend = useRef({ intro: 0, focus: 0 });
  const parallax = useRef({ x: 0, y: 0 });
  const introTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => () => void introTween.current?.kill(), []);

  useEffect(() => {
    const state = blend.current;
    if (phase === "intro") {
      const done = () => useRoom.getState().setPhase("ready");
      if (reducedMotion) {
        state.intro = 1;
        done();
        return;
      }
      // Control is handed back a little before the move fully settles so scrolling never feels blocked.
      introTween.current = gsap.to(state, { intro: 1, duration: 2.8, ease: "power3.out" });
      const ready = gsap.delayedCall(1.9, done);
      return () => {
        ready.kill();
      };
    }
    if (phase === "leaving" && !reducedMotion) {
      const tween = gsap.to(state, { focus: 1, duration: LEAVE.fly, ease: "power2.inOut" });
      return () => {
        tween.kill();
      };
    }
  }, [phase, reducedMotion]);

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const { intro, focus } = blend.current;
    frame.cameraProgress = reducedMotion ? frame.progress : THREE.MathUtils.damp(frame.cameraProgress, frame.progress, 5, delta);
    const u = THREE.MathUtils.clamp(frame.cameraProgress, 0, 1);

    path.position.getPoint(u, position);
    path.target.getPoint(u, lookAt);
    let fov = THREE.MathUtils.lerp(startFov(aspect), END_FOV, THREE.MathUtils.smoothstep(u, 0, 0.9));

    position.addScaledVector(INTRO_OFFSET, 1 - intro);
    fov += (1 - intro) * 7;

    if (!reducedMotion) {
      const reach = (1 - u) * (1 - focus);
      parallax.current.x = THREE.MathUtils.damp(parallax.current.x, frame.pointerX, 3, delta);
      parallax.current.y = THREE.MathUtils.damp(parallax.current.y, frame.pointerY, 3, delta);
      position.x += parallax.current.x * 0.13 * reach;
      position.y -= parallax.current.y * 0.07 * reach;
    }

    if (leavingTo && focus > 0) {
      position.lerp(FOCUS[leavingTo].position, focus);
      lookAt.lerp(FOCUS[leavingTo].target, focus);
      fov = THREE.MathUtils.lerp(fov, 42, focus);
    }

    camera.position.copy(position);
    camera.lookAt(lookAt);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
