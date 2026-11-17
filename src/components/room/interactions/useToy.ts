"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { frame } from "@/lib/frame";
import { useRoom } from "@/store/room";

export const canInteract = () => useRoom.getState().phase === "ready" && frame.progress < 0.9;

export function setCursor(pointer: boolean) {
  document.body.style.cursor = pointer ? "pointer" : "";
}

/**
 * Hover state for the playful, non-navigating objects.
 * A mouse activates on hover. Touch has no hover, so a tap toggles instead.
 */
export function useToy(onTap?: () => void) {
  const [active, setActive] = useState(false);

  const bind = useMemo(
    () => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.pointerType !== "mouse" || !canInteract()) return;
        event.stopPropagation();
        setActive(true);
        setCursor(true);
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.pointerType !== "mouse") return;
        setActive(false);
        setCursor(false);
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        if (!canInteract()) return;
        event.stopPropagation();
        if (frame.lastPointer !== "mouse") setActive((value) => !value);
        onTap?.();
      },
    }),
    [onTap],
  );

  return [active, bind] as const;
}
