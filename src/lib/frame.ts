// Values that change every frame live here instead of in React state.
export const frame = {
  /** Raw scroll progress, 0 to 1. */
  progress: 0,
  /** Smoothed progress the camera is actually at. */
  cameraProgress: 0,
  /** 0 to 1 while the monitor's screen opens into the world beyond it. */
  dive: 0,
  pointerX: 0,
  pointerY: 0,
  mouseSeen: false,
  lastPointer: "mouse",
};

let shadowFrames = 0;

export function invalidateShadows(frames = 1) {
  shadowFrames = Math.max(shadowFrames, frames);
}

export function consumeShadowFrame() {
  if (shadowFrames <= 0) return false;
  shadowFrames -= 1;
  return true;
}

/** Tracks the pointer. Only a real mouse feeds the parallax and the football. */
export function trackPointer() {
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    frame.mouseSeen = true;
    frame.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    frame.pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  const onDown = (event: PointerEvent) => {
    frame.lastPointer = event.pointerType;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown, { capture: true });
  };
}
