"use client";

import { RoundedBox, useFBO } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DESK, PALETTE, SCREEN } from "@/components/room/scene/layout";
import { fillRect } from "@/components/room/scene/portal";
import { useSettings } from "@/components/room/scene/settings";
import { useShaderClock } from "@/components/room/scene/useShaderClock";
import { DUST, dustGeometry, HERO_REST, HeroShape, SKY, spinHero, WORLD_CAMERA, worldTime } from "@/components/world/home/heroScene";
import { frame } from "@/lib/frame";
import { scroll } from "@/lib/scroll";

const TARGET_WIDTH = 1024;
const TARGET_HEIGHT = Math.round((TARGET_WIDTH * SCREEN.height) / SCREEN.width);
/** Past this camera progress the screen is big enough in view that its picture is redrawn every frame. */
const CLOSE_UP = 0.5;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The world's backdrop, drawn the way the page draws it: the pale ground, the three .world-glow gradients and
// the masked .world-grid, all in the pixel space of the viewport the screen will become. The world's 3D scene
// arrives through uScene. Everything here is in display (sRGB) values, like the page.
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uScene;
  uniform vec2 uLayer;
  uniform vec2 uSpan;
  varying vec2 vUv;

  float glow(vec2 px, vec2 centre, vec2 radii, float stop) {
    return clamp(1.0 - length((px - centre) / radii) / stop, 0.0, 1.0);
  }

  // Share of this pixel covered by a 1px grid line every 56px, so the grid fades to a tint instead of shimmering far away.
  float gridLine(float x, float footprint) {
    float d = abs(mod(x + 27.5, 56.0) - 28.0);
    float reach = 0.5 * footprint;
    return clamp(min(d + reach, 0.5) - max(d - reach, -0.5), 0.0, 1.0) / footprint;
  }

  vec3 toSrgb(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }

  void main() {
    vec2 layer = vec2((vUv.x - 0.5) * uSpan.x + 0.5, 0.5 - (vUv.y - 0.5) * uSpan.y);
    vec2 px = layer * uLayer;

    vec3 color = vec3(0.957, 0.969, 0.984);
    color = mix(color, vec3(0.882, 0.941, 0.984), 0.9 * glow(px, vec2(0.5, 1.1) * uLayer, vec2(736.0, 480.0), 0.6));
    color = mix(color, vec3(0.561, 0.722, 1.0), 0.3 * glow(px, vec2(0.95, 0.08) * uLayer, vec2(800.0, 576.0), 0.62));
    color = mix(color, vec3(0.435, 0.89, 1.0), 0.32 * glow(px, vec2(0.12, -0.1) * uLayer, vec2(960.0, 640.0), 0.6));

    vec2 footprint = max(fwidth(px), vec2(1.0));
    float gx = gridLine(px.x, footprint.x);
    float gy = gridLine(px.y, footprint.y);
    float lines = 1.0 - (1.0 - gx) * (1.0 - gy);
    float mask = clamp((0.85 - length((px - vec2(0.5, 0.3) * uLayer) / (vec2(0.8, 0.7) * uLayer))) / 0.55, 0.0, 1.0);
    color = mix(color, vec3(0.071, 0.314, 0.588), 0.07 * lines * mask);

    vec4 scene = texture2D(uScene, vUv);
    if (scene.a > 0.001) color = mix(color, toSrgb(scene.rgb / scene.a), clamp(scene.a, 0.0, 1.0));

    // A whisper of screen at rest: soft falloff to the bezel and a faint scanline.
    vec2 p = vUv - 0.5;
    color *= 1.0 - 0.18 * dot(p, p);
    color *= 0.985 + 0.015 * sin(vUv.y * 520.0 - uTime * 2.0);
    // Held a little under the page's brightness so the room's bloom leaves it alone.
    gl_FragColor = vec4(color * 0.8, 1.0);
  }
`;

/** The world's own scene, the same hero shape and motes the page draws past the monitor, as seen through the screen. */
function ScreenScene({ still }: { still: boolean }) {
  const hero = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);
  const motes = useMemo(() => dustGeometry(DUST.count), []);

  useFrame(() => {
    const t = worldTime(still);
    if (hero.current) spinHero(hero.current, rings.current, t);
    if (dust.current) dust.current.rotation.y = t * 0.01;
  });

  return (
    <>
      <group ref={hero} position={HERO_REST}>
        <HeroShape ringsRef={rings} />
      </group>
      <points ref={dust} geometry={motes}>
        <pointsMaterial color={SKY} size={DUST.size} sizeAttenuation transparent opacity={0.55} toneMapped={false} />
      </points>
    </>
  );
}

const clearColor = new THREE.Color();

export function Monitor({ animate }: { animate: boolean }) {
  const { quality } = useSettings();
  const screen = useShaderClock(animate);
  const size = useThree((state) => state.size);
  const target = useFBO(TARGET_WIDTH, TARGET_HEIGHT, { samples: quality.screenSamples, depthBuffer: true });
  const frames = useRef(0);
  const [scene] = useState(() => new THREE.Scene());
  const view = useRef<THREE.PerspectiveCamera>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScene: { value: target.texture }, uLayer: { value: new THREE.Vector2(1, 1) }, uSpan: { value: new THREE.Vector2(1, 1) } }),
    [target],
  );

  useFrame(({ gl }, delta) => {
    const camera = view.current;
    if (!camera) return;
    // The screen shows the part of the world the viewport will show once the camera fills it, plus the rim around it.
    const fill = fillRect(size.width / size.height);
    const live = screen.current?.uniforms;
    live?.uLayer.value.set(size.width, size.height);
    live?.uSpan.value.set(SCREEN.width / fill.width, SCREEN.height / fill.height);

    const halfFov = THREE.MathUtils.degToRad(WORLD_CAMERA.fov / 2);
    const fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfFov) * (SCREEN.height / fill.height)));
    if (Math.abs(camera.fov - fov) > 1e-4) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, animate ? frame.pointerX : 0, 3, delta);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, animate ? frame.pointerY : 0, 3, delta);
    camera.position.set(pointer.current.x * 0.5, -pointer.current.y * 0.3, WORLD_CAMERA.z);
    camera.lookAt(0, 0, 0);

    // Points are sized against the canvas height, so scale the motes to the target's share of the final viewport.
    const motes = scene.children.find((child): child is THREE.Points => (child as THREE.Points).isPoints);
    if (motes) (motes.material as THREE.PointsMaterial).size = (DUST.size * TARGET_HEIGHT * fill.height) / (SCREEN.height * gl.getPixelRatio() * size.height);

    // Once the camera has arrived the live world layer covers the whole viewport, so nobody sees this picture.
    if (frame.cameraProgress > 0.9995 && scroll.portal.get() >= 1) return;
    // From afar the screen is a small, slow picture; weaker devices redraw it every other frame.
    const due = frames.current++ % quality.screenEvery === 0;
    if (!due && frame.cameraProgress < CLOSE_UP) return;

    const previous = gl.getRenderTarget();
    const alpha = gl.getClearAlpha();
    gl.getClearColor(clearColor);
    gl.setRenderTarget(target);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(previous);
    gl.setClearColor(clearColor, alpha);
  });

  const bodyZ = SCREEN.z - 0.02;

  return (
    <group>
      {createPortal(
        <>
          <perspectiveCamera ref={view} fov={WORLD_CAMERA.fov} aspect={SCREEN.width / SCREEN.height} near={0.1} far={80} />
          <ScreenScene still={!animate} />
        </>,
        scene,
      )}
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
