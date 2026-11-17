"use client";

import { Bloom, EffectComposer, N8AO, Noise, Outline, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useSettings } from "./settings";

export function Effects() {
  const { quality } = useSettings();
  return (
    <EffectComposer multisampling={quality.multisampling} autoClear={false}>
      {quality.ambientOcclusion ? <N8AO halfRes quality="medium" aoRadius={0.55} distanceFalloff={0.7} intensity={2.4} /> : <></>}
      <Outline blur edgeStrength={7} pulseSpeed={0} visibleEdgeColor={0x6fe3ff} hiddenEdgeColor={0x2f6f86} width={quality.tier === "desktop" ? 1100 : 700} />
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.95} luminanceSmoothing={0.25} radius={0.72} />
      <Vignette offset={0.22} darkness={0.72} />
      <Noise opacity={0.045} blendFunction={BlendFunction.SOFT_LIGHT} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
