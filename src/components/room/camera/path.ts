import * as THREE from "three";
import { SCREEN } from "@/components/room/scene/layout";
import { FILL } from "@/components/room/scene/portal";
import type { LinkId } from "@/lib/links";

export const END_FOV = 40;

/** Wider lens on portrait screens so the desk still fits at the start. */
export function startFov(aspect: number) {
  return aspect < 1 ? 50 + (1 - aspect) * 42 : 50;
}

/** How far back the camera can sit while the screen still covers the whole viewport. */
function fillDistance(aspect: number) {
  const visible = Math.min(SCREEN.height, SCREEN.width / aspect);
  return (visible / (2 * Math.tan(THREE.MathUtils.degToRad(END_FOV) / 2))) * FILL;
}

export function buildPath(aspect: number) {
  const screen = new THREE.Vector3(SCREEN.x, SCREEN.y, SCREEN.z);
  const portrait = aspect < 1;
  const position = new THREE.CatmullRomCurve3([
    portrait ? new THREE.Vector3(1.2, 1.62, 2.3) : new THREE.Vector3(1.45, 1.56, 1.5),
    new THREE.Vector3(1.12, 1.48, 0.55),
    new THREE.Vector3(0.6, 1.38, -0.55),
    new THREE.Vector3(0.1, SCREEN.y + 0.09, -1.5),
    new THREE.Vector3(SCREEN.x, SCREEN.y, SCREEN.z + fillDistance(aspect)),
  ]);
  const target = new THREE.CatmullRomCurve3([
    portrait ? new THREE.Vector3(0.98, 1.02, -2.9) : new THREE.Vector3(-0.05, 1.02, -2.5),
    new THREE.Vector3(-0.1, 1.05, -2.5),
    new THREE.Vector3(0, SCREEN.y - 0.03, -2.6),
    screen.clone(),
    screen.clone(),
  ]);
  return { position, target };
}

/** Where the camera settles when a link object is clicked, just before the route changes. */
export const FOCUS: Record<LinkId, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  notes: { position: new THREE.Vector3(1.12, 1.14, -1.78), target: new THREE.Vector3(0.97, 0.8, -2.3) },
  bible: { position: new THREE.Vector3(0.68, 1.9, -2.16), target: new THREE.Vector3(0.58, 1.95, -2.88) },
  websites: { position: new THREE.Vector3(2.22, 1.56, -1.72), target: new THREE.Vector3(2.3, 1.56, -3) },
};
