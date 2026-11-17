"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Selection } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CameraRig } from "@/components/room/camera/CameraRig";
import { detectQuality, prefersReducedMotion } from "@/lib/device";
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
  const [dpr, setDpr] = useState(settings.quality.dpr);
  const inWorld = useRoom((state) => state.inWorld);

  useEffect(() => trackPointer(), []);

  return (
    <div className="room-canvas" aria-hidden="true" style={{ visibility: inWorld ? "hidden" : "visible" }}>
      <Canvas
        shadows
        frameloop={inWorld ? "never" : "always"}
        dpr={[1, dpr]}
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
        <PerformanceMonitor onDecline={() => setDpr((value) => Math.max(1, value - 0.25))} />
        <SettingsProvider value={settings}>
          <Suspense fallback={null}>
            <Selection>
              <Room />
              <Effects />
            </Selection>
            <SceneReady />
          </Suspense>
          <CameraRig />
        </SettingsProvider>
      </Canvas>
    </div>
  );
}
