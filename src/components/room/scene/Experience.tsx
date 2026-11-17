"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Selection } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CameraRig } from "@/components/room/camera/CameraRig";
import { detectQuality, effectFloor, prefersReducedMotion, qualitySteps } from "@/lib/device";
import { invalidateShadows, trackPointer } from "@/lib/frame";
import { useRoom } from "@/store/room";
import { Effects } from "./Effects";
import { PALETTE } from "./layout";
import { Room } from "./Room";
import { type Settings, SettingsProvider } from "./settings";

/** Mounts once every suspended asset has resolved, warms up the shaders and tells the loader. */
function SceneReady() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera).then(() => {
      if (cancelled) return;
      invalidateShadows(4);
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && useRoom.getState().setSceneReady()));
    });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

export default function Experience() {
  const settings = useMemo<Settings>(() => ({ quality: detectQuality(), reducedMotion: prefersReducedMotion() }), []);
  // The start preset plus cheaper versions of it, given up one at a time while the frame rate stays low.
  const steps = useMemo(() => qualitySteps(settings.quality), [settings]);
  const floor = useMemo(() => effectFloor(steps), [steps]);
  const [level, setLevel] = useState(0);
  const live = steps[level];
  const inWorld = useRoom((state) => state.inWorld);
  const sceneReady = useRoom((state) => state.sceneReady);

  useEffect(() => trackPointer(), []);

  return (
    <div className="room-canvas" aria-hidden="true" style={{ visibility: inWorld ? "hidden" : "visible" }}>
      <Canvas
        shadows
        frameloop={inWorld ? "never" : "always"}
        dpr={[1, live.dpr]}
        camera={{ fov: 57, near: 0.05, far: 60, position: [2.25, 1.92, 3.8] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.shadowMap.autoUpdate = false;
          gl.shadowMap.needsUpdate = true;
        }}
        onPointerMissed={() => useRoom.getState().setActiveLink(null)}
      >
        <color attach="background" args={[PALETTE.background]} />
        <fog attach="fog" args={[PALETTE.background, 9, 24]} />
        {/* Measured only once the scene is up, so loading and shader warm-up do not count against the device. */}
        {sceneReady && (
          <PerformanceMonitor
            flipflops={6}
            onDecline={() => setLevel((value) => Math.min(steps.length - 1, value + 1))}
            onIncline={() => setLevel((value) => (value > floor ? value - 1 : value))}
          />
        )}
        <SettingsProvider value={settings}>
          <Suspense fallback={null}>
            <Selection>
              <Room />
              <Effects quality={live} />
            </Selection>
            <SceneReady />
          </Suspense>
          <CameraRig />
        </SettingsProvider>
      </Canvas>
    </div>
  );
}
