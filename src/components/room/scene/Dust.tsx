"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useShaderClock } from "./useShaderClock";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime * 0.05;
    p.y = mod(p.y + t * (0.4 + aSeed * 0.6), 2.6) + 0.1;
    p.x += sin(uTime * 0.21 + aSeed * 40.0) * 0.08;
    p.z += cos(uTime * 0.17 + aSeed * 23.0) * 0.08;
    vAlpha = (0.25 + 0.75 * abs(sin(uTime * 0.5 + aSeed * 12.0))) * smoothstep(0.1, 0.5, p.y) * smoothstep(2.7, 2.2, p.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uScale * (0.002 + aSeed * 0.0035) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vec3(0.82, 0.88, 1.0), smoothstep(0.5, 0.05, d) * vAlpha * 0.38);
  }
`;

function scatter(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = -2.8 + Math.random() * 5.6;
    positions[i * 3 + 1] = Math.random() * 2.6;
    positions[i * 3 + 2] = -2.9 + Math.random() * 4.6;
    seeds[i] = Math.random();
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

/** Motes hanging in the moonlight between the window and the desk. */
export function Dust({ count, animate }: { count: number; animate: boolean }) {
  const material = useShaderClock(animate);
  const geometry = useMemo(() => scatter(count), [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 } }), []);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
