"use client";

import { Html } from "@react-three/drei";
import { type ThreeElements, type ThreeEvent, useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { type ReactNode, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSettings } from "@/components/room/scene/settings";
import { frame } from "@/lib/frame";
import { LINKS, type LinkId } from "@/lib/links";
import { useRoom } from "@/store/room";
import { canInteract, setCursor } from "./useToy";

type LinkObjectProps = Omit<ThreeElements["group"], "id"> & {
  id: LinkId;
  /** Invisible box that receives the pointer. Larger than the object so small things stay easy to hit. */
  hitSize: [number, number, number];
  hitPosition?: [number, number, number];
  labelPosition: [number, number, number];
  lift?: number;
  children: ReactNode;
};

export function LinkObject({ id, hitSize, hitPosition, labelPosition, lift = 0.03, children, ...props }: LinkObjectProps) {
  const active = useRoom((state) => state.activeLink === id);
  const leaving = useRoom((state) => state.phase === "leaving");
  const { reducedMotion, quality } = useSettings();
  const reach = quality.tier === "desktop" ? 1 : 1.35;
  const body = useRef<THREE.Group>(null);
  const amount = useRef(0);

  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    if (!body.current || amount.current === target) return;
    amount.current = reducedMotion ? target : THREE.MathUtils.damp(amount.current, target, 10, delta);
    if (Math.abs(amount.current - target) < 0.001) amount.current = target;
    body.current.position.y = amount.current * lift;
    body.current.scale.setScalar(1 + amount.current * 0.045);
  });

  const handlers = useMemo(
    () => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.pointerType !== "mouse" || !canInteract()) return;
        event.stopPropagation();
        useRoom.getState().setActiveLink(id);
        setCursor(true);
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.pointerType !== "mouse") return;
        const room = useRoom.getState();
        if (room.activeLink === id) room.setActiveLink(null);
        setCursor(false);
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        if (!canInteract()) return;
        event.stopPropagation();
        const room = useRoom.getState();
        // Touch has no hover: the first tap reveals the highlight and label, the second one follows the link.
        if (frame.lastPointer !== "mouse" && room.activeLink !== id) room.setActiveLink(id);
        else {
          setCursor(false);
          room.leave(id);
        }
      },
    }),
    [id],
  );

  return (
    <group {...props}>
      <group ref={body}>
        <Select enabled={active}>{children}</Select>
      </group>
      <mesh position={hitPosition} scale={reach} {...handlers}>
        <boxGeometry args={hitSize} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {active && !leaving && (
        <Html position={labelPosition} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="object-label">
            <b>{LINKS[id].label}</b>
            <span>{LINKS[id].href.replace(/\/$/, "")}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
