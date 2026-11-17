"use client";

import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SCREEN } from "@/components/room/scene/layout";
import { fillRect, portal, quadTransform, REVEAL } from "@/components/room/scene/portal";
import { useSettings } from "@/components/room/scene/settings";
import { frame } from "@/lib/frame";
import { LEAVE } from "@/lib/links";
import { scroll } from "@/lib/scroll";
import { useRoom } from "@/store/room";
import { buildPath, END_FOV, FOCUS, startFov } from "./path";

const INTRO_OFFSET = new THREE.Vector3(0.55, 0.3, 1.5);

const position = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const corner = new THREE.Vector3();
const quad: number[] = [];

/**
 * Lays the world layer over the monitor: the viewport-sized layer is mapped onto the patch of screen the viewport
 * will cover once the camera arrives, so at the end of the path the mapping is exactly the identity and nothing jumps.
 */
function placePortal(camera: THREE.Camera, width: number, height: number, reveal: number, arrived: boolean) {
  scroll.portal.set(reveal);
  const element = portal.element;
  if (!element || reveal <= 0) return;
  element.style.opacity = String(reveal);
  if (arrived) {
    element.style.transform = "none";
    return;
  }
  camera.updateMatrixWorld();
  const fill = fillRect(width / height);
  const corners = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ];
  corners.forEach(([sx, sy], index) => {
    corner.set(SCREEN.x + (sx * fill.width) / 2, SCREEN.y + (sy * fill.height) / 2, SCREEN.z).project(camera);
    quad[index * 2] = ((corner.x + 1) / 2) * width;
    quad[index * 2 + 1] = ((1 - corner.y) / 2) * height;
  });
  const transform = quadTransform(width, height, quad);
  if (transform) element.style.transform = transform;
}

export function CameraRig() {
  const size = useThree((state) => state.size);
  const aspect = size.width / size.height;
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

    const reveal = leavingTo ? 0 : THREE.MathUtils.smoothstep(u, REVEAL[0], REVEAL[1]);
    placePortal(camera, size.width, size.height, reveal, u > 0.9995);
  });

  return null;
}
