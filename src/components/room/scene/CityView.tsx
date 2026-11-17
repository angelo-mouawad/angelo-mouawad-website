"use client";

import { useMemo } from "react";
import { useShaderClock } from "./useShaderClock";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Three layers of procedural towers. Each lit window has its own slow flicker and a few switch on and off.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash1(float n) { return fract(sin(n * 91.345) * 47453.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec4 towers(vec2 uv, float seed, float columns, float baseHeight, float extraHeight, float floors) {
    float x = uv.x * columns + seed * 17.0;
    float id = floor(x);
    float fx = fract(x);
    float width = 0.62 + 0.36 * hash1(id + seed);
    float height = baseHeight + extraHeight * hash1(id * 1.7 + seed * 3.1);
    float body = step(fx, width) * step(uv.y, height);

    vec2 grid = vec2(fx / width * floor(4.0 + 5.0 * hash1(id + 9.0)), uv.y * floors);
    vec2 cell = floor(grid);
    vec2 f = fract(grid);
    float r = hash2(cell + id * 13.0 + seed);
    float lit = step(0.7, r);
    float flicker = 0.8 + 0.2 * sin(uTime * (0.5 + r * 2.5) + r * 40.0);
    float toggled = step(0.93, hash2(cell + id + floor(uTime * 0.12 + r * 10.0)));
    float pane = smoothstep(0.14, 0.26, f.x) * smoothstep(0.86, 0.74, f.x) * smoothstep(0.2, 0.32, f.y) * smoothstep(0.8, 0.68, f.y);
    pane *= step(uv.y, height - 0.012);
    vec3 tint = mix(vec3(1.0, 0.74, 0.42), vec3(0.55, 0.78, 1.0), step(0.72, hash2(cell * 1.3 + id)));
    return vec4(tint * pane * lit * flicker * (1.0 - toggled), body);
  }

  void main() {
    vec2 uv = vUv;
    vec3 color = mix(vec3(0.085, 0.1, 0.19), vec3(0.012, 0.018, 0.045), smoothstep(0.15, 0.95, uv.y));
    color += vec3(0.5, 0.3, 0.16) * 0.1 * smoothstep(0.55, 0.1, uv.y);

    float star = step(0.9975, hash2(floor(uv * vec2(260.0, 170.0))));
    color += star * (0.35 + 0.3 * sin(uTime * 1.3 + uv.x * 90.0)) * smoothstep(0.5, 0.8, uv.y);

    vec2 moon = uv - vec2(0.7, 0.83);
    moon.x *= 1.5;
    color += vec3(0.75, 0.82, 1.0) * (smoothstep(0.034, 0.03, length(moon)) * 1.6 + 0.05 / (length(moon) * 9.0 + 0.3));

    vec4 far = towers(uv, 3.0, 30.0, 0.26, 0.2, 70.0);
    color = mix(color, vec3(0.045, 0.055, 0.1) + far.rgb * 0.55, far.a);
    vec4 mid = towers(uv + vec2(0.013, 0.0), 2.0, 17.0, 0.2, 0.3, 48.0);
    color = mix(color, vec3(0.025, 0.03, 0.058) + mid.rgb * 1.2, mid.a);
    vec4 near = towers(uv, 1.0, 9.0, 0.08, 0.3, 30.0);
    color = mix(color, vec3(0.012, 0.014, 0.026) + near.rgb * 2.2, near.a);

    color += vec3(1.0, 0.62, 0.32) * 0.05 * smoothstep(0.3, 0.0, uv.y);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function CityView(props: { position: [number, number, number]; size: [number, number]; animate: boolean }) {
  const material = useShaderClock(props.animate);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  return (
    <mesh position={props.position}>
      <planeGeometry args={props.size} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} toneMapped={false} fog={false} />
    </mesh>
  );
}
