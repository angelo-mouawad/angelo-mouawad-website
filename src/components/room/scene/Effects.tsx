"use client";

import { Bloom, EffectComposer, N8AO, Noise, Outline, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import type { Quality } from "@/lib/device";

/** Takes the live quality step rather than the start preset, so effects can be given up while running. */
export function Effects({ quality }: { quality: Quality }) {
  return (
    <EffectComposer multisampling={quality.multisampling} autoClear={false}>
      {quality.ambientOcclusion ? <N8AO halfRes quality="medium" aoRadius={0.55} distanceFalloff={0.7} intensity={2.4} /> : <></>}
      {/* SMAA reads the untouched input, so it has to lead its pass or it would wipe out the effects before it. */}
      {quality.smaa ? <SMAA /> : <></>}
      <Outline blur edgeStrength={7} pulseSpeed={0} visibleEdgeColor={0x6fe3ff} hiddenEdgeColor={0x2f6f86} width={quality.outlineWidth} />
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.95} luminanceSmoothing={0.25} radius={0.72} />
      <Vignette offset={0.22} darkness={0.72} />
      <Noise opacity={0.045} blendFunction={BlendFunction.SOFT_LIGHT} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
