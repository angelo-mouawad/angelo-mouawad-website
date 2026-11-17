"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useShaderClock } from "./useShaderClock";

const COUNT = 14;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    float life = fract(uTime * (0.1 + aSeed * 0.05) + aSeed);
    vec3 p = position;
    p.x += sin(life * 5.0 + aSeed * 20.0) * 0.016 * life;
    p.z += cos(life * 4.0 + aSeed * 31.0) * 0.016 * life;
    p.y += life * 0.2;
    vAlpha = sin(life * 3.14159) * (1.0 - life) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uScale * (0.02 + life * 0.05) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vec3(0.9, 0.92, 1.0), smoothstep(0.5, 0.0, d) * vAlpha);
  }
`;

function puffs() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.03;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    seeds[i] = Math.random();
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

export function Steam({ position, animate }: { position: [number, number, number]; animate: boolean }) {
  const material = useShaderClock(animate);
  const geometry = useMemo(() => puffs(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 3 }, uScale: { value: 1 } }), []);

  return (
    <points position={position} geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}
