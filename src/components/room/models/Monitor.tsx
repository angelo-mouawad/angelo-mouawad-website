"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { DESK, PALETTE, SCREEN } from "@/components/room/scene/layout";
import { canvasTexture } from "@/components/room/scene/textures";
import { useShaderClock } from "@/components/room/scene/useShaderClock";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Paints the empty backdrop of the world behind the glass: the same pale ground, glows and grid the dive opens onto. */
function drawOpening(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#f4f7fb";
  ctx.fillRect(0, 0, w, h);
  const glows: [number, number, number, string][] = [
    [w * 0.12, -h * 0.1, w * 0.6, "rgba(111,227,255,0.42)"],
    [w * 0.95, h * 0.08, w * 0.5, "rgba(143,184,255,0.4)"],
  ];
  for (const [x, y, radius, colour] of glows) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, colour);
    glow.addColorStop(1, "rgba(244,247,251,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.strokeStyle = "rgba(18,80,150,0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

// The backdrop behind the glass, with a faint scanline at rest. During the dive it settles into the world's own ground colour.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uDive;
  uniform sampler2D uMap;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;
    float t = uTime * 0.16;
    float glow = exp(-3.2 * length(p - 0.28 * vec2(sin(t), cos(t * 1.3))));
    vec3 color = pow(texture2D(uMap, vUv).rgb, vec3(1.0 / 2.2)) * 0.8;
    color += vec3(0.1, 0.3, 0.42) * glow * 0.1;
    color *= 1.0 - 0.35 * dot(p, p);
    color *= 0.975 + 0.025 * sin(vUv.y * 520.0);
    color *= 0.95 + 0.05 * sin(uTime * 0.7);
    // Brighter than the page colour on purpose: the room's tone mapping brings it back down to match.
    color = mix(color, vec3(0.957, 0.969, 0.984) * 2.6, smoothstep(0.0, 0.22, uDive));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Monitor({ animate }: { animate: boolean }) {
  const screen = useShaderClock(animate);
  const opening = useMemo(() => canvasTexture(1024, 576, drawOpening), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAspect: { value: SCREEN.width / SCREEN.height }, uDive: { value: 0 }, uMap: { value: opening } }), [opening]);

  const bodyZ = SCREEN.z - 0.02;

  return (
    <group>
      <RoundedBox args={[0.22, 0.012, 0.17]} radius={0.005} position={[SCREEN.x, DESK.top + 0.006, bodyZ - 0.06]} castShadow receiveShadow>
        <meshStandardMaterial color="#8a9098" roughness={0.3} metalness={0.9} />
      </RoundedBox>
      <mesh position={[SCREEN.x, DESK.top + 0.17, bodyZ - 0.075]} rotation-x={0.06} castShadow>
        <boxGeometry args={[0.05, 0.34, 0.022]} />
        <meshStandardMaterial color="#8a9098" roughness={0.3} metalness={0.9} />
      </mesh>
      <RoundedBox args={[SCREEN.width + 0.024, SCREEN.height + 0.024, 0.035]} radius={0.008} position={[SCREEN.x, SCREEN.y, bodyZ]} castShadow>
        <meshStandardMaterial color="#08090c" roughness={0.35} metalness={0.4} />
      </RoundedBox>
      <mesh position={[SCREEN.x, SCREEN.y, SCREEN.z]}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <shaderMaterial ref={screen} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[SCREEN.x + SCREEN.width / 2 - 0.03, SCREEN.y - SCREEN.height / 2 - 0.006, SCREEN.z + 0.001]}>
        <circleGeometry args={[0.0022, 10]} />
        <meshBasicMaterial color={PALETTE.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
}
