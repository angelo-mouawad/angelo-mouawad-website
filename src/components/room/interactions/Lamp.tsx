"use client";

import { Billboard, Html, useGLTF } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { enableShadows, modelUrl } from "@/components/room/models/Model";
import { PALETTE } from "@/components/room/scene/layout";
import { useSettings } from "@/components/room/scene/settings";
import { frame } from "@/lib/frame";
import { useRoom } from "@/store/room";
import { useToy } from "./useToy";

const LIGHT_POWER = 5.5;
const GLOW_POWER = 6;
const BULB = "bulb";
const HINT = new THREE.Color(PALETTE.warmSoft).multiplyScalar(1.6);

/**
 * Clamp lamp from Poly Haven. In the model the clamp sits at the origin, the elbow reaches
 * back along +Z and the head points along -Z. Click or tap to switch it on and off.
 */
export function Lamp(props: ThreeElements["group"]) {
  const { scene } = useGLTF(modelUrl("desk_lamp_arm_01"));
  const { quality, reducedMotion } = useSettings();
  const lampOn = useRoom((state) => state.lampOn);
  const toggleLamp = useRoom((state) => state.toggleLamp);
  const [hovered, bind] = useToy(toggleLamp);
  const light = useRef<THREE.SpotLight>(null);
  const body = useRef<THREE.Group>(null);
  const hint = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null);
  const level = useRef(1);

  const { object, bulb, target } = useMemo(() => {
    const clone = scene.clone(true);
    enableShadows(clone);
    const bulb = new THREE.Vector3(0, 0.7, -0.18);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (!material.name.endsWith("_light")) return;
      const glow = material.clone();
      glow.toneMapped = false;
      glow.emissiveIntensity = GLOW_POWER;
      mesh.material = glow;
      mesh.name = BULB;
      mesh.castShadow = false;
      new THREE.Box3().setFromObject(mesh).getCenter(bulb);
    });
    // Aim down and a little forward, the way the shade points.
    const target = new THREE.Object3D();
    target.position.set(bulb.x, bulb.y - 1, bulb.z - 0.3);
    return { object: clone, bulb, target };
  }, [scene]);

  useFrame(({ clock }, delta) => {
    // A soft pulse beside the shade marks the lamp as something you can press.
    if (hint.current) {
      const beat = reducedMotion ? 0.35 : (clock.elapsedTime * 0.55) % 1;
      hint.current.scale.setScalar(0.7 + beat * 0.9);
      hint.current.material.opacity = hovered ? 0 : (1 - beat) * 0.75;
    }

    const goal = lampOn ? 1 : 0;
    if (level.current === goal) return;
    level.current = THREE.MathUtils.damp(level.current, goal, 12, delta);
    if (Math.abs(level.current - goal) < 0.002) level.current = goal;
    if (light.current) light.current.intensity = level.current * LIGHT_POWER;
    const glass = body.current?.getObjectByName(BULB) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | undefined;
    if (glass) glass.material.emissiveIntensity = level.current * GLOW_POWER;
  });

  const showLabel = hovered && frame.lastPointer === "mouse";

  return (
    <group {...props}>
      <group ref={body} {...bind}>
        <Select enabled={hovered}>
          <primitive object={object} />
        </Select>
        {/* Generous hit area around the head, which is the natural thing to reach for. */}
        <mesh position={[bulb.x, bulb.y, bulb.z - 0.02]}>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <Billboard position={[bulb.x, bulb.y + 0.17, bulb.z - 0.04]}>
        <mesh ref={hint} renderOrder={5}>
          <ringGeometry args={[0.02, 0.026, 32]} />
          <meshBasicMaterial color={HINT} transparent opacity={0.6} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh renderOrder={5}>
          <circleGeometry args={[0.007, 16]} />
          <meshBasicMaterial color={HINT} transparent opacity={hovered ? 0 : 0.9} toneMapped={false} depthTest={false} depthWrite={false} />
        </mesh>
      </Billboard>

      {showLabel && (
        <Html position={[bulb.x, bulb.y + 0.3, bulb.z]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="object-label object-label-toy">
            <b>Lamp</b>
            <span>{lampOn ? "click to switch off" : "click to switch on"}</span>
          </div>
        </Html>
      )}

      <primitive object={target} />
      <spotLight
        ref={light}
        position={bulb}
        target={target}
        color={PALETTE.warm}
        intensity={LIGHT_POWER}
        angle={1.05}
        penumbra={0.85}
        distance={4}
        decay={1.6}
        castShadow={quality.lampShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-camera-near={0.08}
      />
    </group>
  );
}
