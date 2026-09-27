const room = new THREE.Scene();
room.fog = new THREE.Fog(0x07090c, 7, 20);

const envTex = canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#0a0d12'; g.fillRect(0, 0, w, h);
  let gr = g.createLinearGradient(0, h * .62, 0, h);
  gr.addColorStop(0, 'rgba(255,160,90,0)'); gr.addColorStop(1, 'rgba(255,160,90,.55)');
  g.fillStyle = gr; g.fillRect(0, h * .62, w, h * .38);
  g.fillStyle = 'rgba(120,150,210,.5)'; g.fillRect(w * .12, h * .22, w * .14, h * .3);
  g.fillStyle = 'rgba(110,180,255,.35)'; g.fillRect(w * .55, h * .3, w * .08, h * .18);
  g.fillStyle = 'rgba(40,48,62,.5)'; g.fillRect(0, 0, w, h * .1);
});
envTex.mapping = THREE.EquirectangularReflectionMapping;
const pmrem = new THREE.PMREMGenerator(renderer);
room.environment = pmrem.fromEquirectangular(envTex).texture;

const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14),
  new THREE.MeshStandardMaterial({ map: floorTex, roughness: .62, metalness: .12,
    roughnessMap: roughTex, bumpMap: roughTex, bumpScale: .015 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = SHADOWS; room.add(floor);

box(4.38, 6.4, .2, M.wall, -4.81, 3.2, -3.05, room, false);
box(7.78, 6.4, .2, M.wall, 3.11, 3.2, -3.05, room, false);
box(1.84, 1.07, .2, M.wall, -1.7, .535, -3.05, room, false);
box(1.84, 3.57, .2, M.wall, -1.7, 4.615, -3.05, room, false);
box(.2, 6.4, 16, M.wall, -3.05, 3.2, 3, room, false);
box(.2, 6.4, 16, M.wall, 4.6, 3.2, 3, room, false);
box(14, .2, 16, M.wallD, 0, 3.3, 3, room, false);
box(14, .09, .04, M.wallD, 0, .045, -2.945, room, false);
box(.04, .09, 16, M.wallD, -2.945, .045, 3, room, false);
const rug = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48),
  new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
rug.rotation.x = -Math.PI / 2; rug.position.set(0, .006, -1.2);
rug.receiveShadow = SHADOWS; room.add(rug);

room.add(new THREE.AmbientLight(0x171c24, .5));
room.add(new THREE.HemisphereLight(0x222e44, 0x16100a, .32));

const winG = new THREE.Group(); winG.position.set(-1.7, 1.95, -2.94); room.add(winG);
const city = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8),
  new THREE.MeshBasicMaterial({ map: cityTex }));
city.position.z = -.52; winG.add(city);
[[0, .82, 1.7, .07], [0, -.82, 1.7, .07]].forEach(([x, y, w, h]) =>
  box(w, h, .3, M.wallD, x, y, -.14, winG, false));
[[-.82], [.82]].forEach(([x]) => box(.07, 1.72, .3, M.wallD, x, 0, -.14, winG, false));
box(1.84, .05, .14, new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: .8 }),
  0, -.85, .04, winG);
const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 1.6),
  new THREE.MeshPhysicalMaterial({ color: 0x36465e, roughness: .04, metalness: .85,
    transparent: true, opacity: .18, side: THREE.DoubleSide }));
winGlass.position.z = -.3; winG.add(winGlass);
box(1.66, .06, .05, M.dark, 0, .79, -.28, winG); box(1.66, .06, .05, M.dark, 0, -.79, -.28, winG);
box(.06, 1.64, .05, M.dark, -.8, 0, -.28, winG); box(.06, 1.64, .05, M.dark, .8, 0, -.28, winG);
box(.04, 1.58, .04, M.dark, 0, 0, -.28, winG); box(1.58, .04, .04, M.dark, 0, -.04, -.28, winG);
box(1.74, .1, .1, M.black, 0, .84, -.02, winG);
box(1.6, .07, .07, slatStackMat(), 0, .755, -.02, winG);
function slatStackMat(){ return new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: .75 }); }
const slatM = new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: .7, side: THREE.DoubleSide });
for (let i = 0; i < 9; i++) {
  const s = box(1.58, .005, .055, slatM, 0, .7 - i * .052, -.02, winG);
  s.rotation.x = .5;
}
[[-.7], [.7]].forEach(([x]) => cyl(.004, .004, 1.6, 6, M.dark, x, 0, .015, winG));

const sun = new THREE.SpotLight(0x8fa7d8, 1.2, 16, .85, .55, 1);
sun.position.set(-1.7, 2.5, -4.2); sun.target.position.set(.4, 0, 1.0);
room.add(sun.target); room.add(sun);
if (SHADOWS) {
  sun.castShadow = true;
  const SM = MOBILE ? 512 : 1024; sun.shadow.mapSize.set(SM, SM);
  sun.shadow.bias = -.0005; sun.shadow.camera.near = .5; sun.shadow.camera.far = 16;
}
const moonFill = new THREE.PointLight(0x6e87b8, .35, 5, 2);
moonFill.position.set(-1.7, 1.9, -2.4); room.add(moonFill);

function shaft(w, l, x, y, z, rx, ry, op) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l),
    new THREE.MeshBasicMaterial({ map: shaftTex, color: 0x9fb6e8, transparent: true,
      opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); room.add(m); return m;
}
shaft(1.6, 3.4, -1.2, 1.3, -1.6, -.62, 0, .06);
shaft(1.4, 3.2, -1.25, 1.25, -1.6, -.62, .35, .045);
const pool = glowPlane(2.6, 1.7, -.9, .015, -1.15, 0x7e96c8, .12, 0, -Math.PI / 2);

const tvG = new THREE.Group(); tvG.position.set(-2.96, 1.78, -1.05); tvG.rotation.y = Math.PI / 2; room.add(tvG);
box(1.78, 1.02, .05, M.black, 0, 0, 0, tvG);
box(1.73, .97, .012, new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: .15, metalness: .4 }),
  0, 0, .026, tvG);
const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.68, .92),
  new THREE.MeshBasicMaterial({ map: tvTex }));
tvScreen.position.z = .034; tvG.add(tvScreen);
const tvLed = new THREE.Mesh(new THREE.CircleGeometry(.005, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff }));
tvLed.position.set(0, -.485, .034); tvG.add(tvLed);
glowPlane(2.2, 1.5, -2.99, 1.78, -1.05, 0x3a6098, .12, Math.PI / 2);
const tvL = new THREE.PointLight(0x4a78c8, .4, 3.6, 2);
tvL.position.set(-2.5, 1.78, -1.05); room.add(tvL);

box(.42, .6, 1.9, M.shelf, -2.78, .3, -.95);
[[-1.45], [-.6]].forEach(([z]) => {
  box(.012, .5, .64, new THREE.MeshStandardMaterial({ color: 0x33261b, roughness: .72 }), -2.565, .3, z);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.014, 10, 8), M.alu);
  knob.position.set(-2.55, .3, z + .24); room.add(knob);
});
placeGLB('mini_fridge', { pos: [-2.76, .6, -1.52], height: .48, rotY: 0, envI: .8 });
placeGLB('classic_ps5', { pos: [-2.76, .6, -.98], height: .4, rotY: Math.PI / 2 + .15, envI: .8 });
const candleGlass = new THREE.Mesh(new THREE.CylinderGeometry(.034, .03, .085, 16, 1, true),
  new THREE.MeshPhysicalMaterial({ color: 0xc8b89a, roughness: .1, metalness: .1,
    transparent: true, opacity: .25, side: THREE.DoubleSide }));
candleGlass.position.set(-2.72, .645, -.42); room.add(candleGlass);
cyl(.024, .026, .05, 14, new THREE.MeshStandardMaterial({ color: 0xe8ddc8, roughness: .6 }),
  -2.72, .63, -.42);
const flame = new THREE.Mesh(new THREE.ConeGeometry(.007, .022, 8),
  new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
flame.position.set(-2.72, .668, -.42); room.add(flame);
glowPlane(.14, .14, -2.7, .675, -.42, WARM2, .7, Math.PI / 2);
const candleL = pLight(WARM, .15, 1.7, -2.68, .72, -.42);
box(.035, .075, .17, M.black, -2.73, .645, -.64);
const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(.15, .056),
  new THREE.MeshBasicMaterial({ map: clockTex }));
clockFace.position.set(-2.711, .645, -.64); clockFace.rotation.y = Math.PI / 2; room.add(clockFace);
placeGLB('plant', { pos: [-2.75, .615, -.14], height: .27, rotY: .6, sway: true });

const shelfG = new THREE.Group(); shelfG.position.set(-2.5, 0, .85); room.add(shelfG);
[[-.44, -.17], [.44, -.17], [-.44, .17], [.44, .17]]
  .forEach(([x, z]) => box(.045, 2.55, .045, M.black, x, 1.27, z, shelfG));
[.3, .85, 1.4, 1.95, 2.5].forEach(y => box(.98, .035, .4, M.shelf, 0, y, 0, shelfG));
const brace = box(.02, 1.1, .02, M.black, -.44, 1.65, 0, shelfG); brace.rotation.x = .3;
const brace2 = box(.02, 1.1, .02, M.black, .44, 1.65, 0, shelfG); brace2.rotation.x = -.3;
bookRow(shelfG, -.37, .32, 0, 8);
bookRow(shelfG, -.3, 1.42, 0, 6);
for (let i = 0; i < 4; i++)
  box(.3 - .02 * i, .038, .22, new THREE.MeshStandardMaterial({ color: bookPal[i], roughness: .85 }),
    .2, .89 + i * .042, 0, shelfG);
const trophy = new THREE.Mesh(new THREE.LatheGeometry(
  [[0,0],[.055,0],[.055,.014],[.018,.02],[.018,.075],[.05,.13],[.046,.155],[0,.165]]
    .map(p => new THREE.Vector2(p[0], p[1])), 18), M.gold);
trophy.position.set(.32, 1.44, .02); trophy.castShadow = SHADOWS; shelfG.add(trophy);
const camBody = box(.1, .065, .05, M.black, -.28, .905, .06, shelfG);
cyl(.024, .024, .035, 14, M.dark, -.28, .905, .1, shelfG).rotation.x = Math.PI / 2;
const globe = new THREE.Mesh(new THREE.SphereGeometry(.05, 18, 14),
  new THREE.MeshStandardMaterial({ color: 0x2a4a72, roughness: .4, metalness: .2 }));
globe.position.set(.07, 1.51, .04); shelfG.add(globe);
cyl(.022, .03, .025, 12, M.gold, .07, 1.43, .04, shelfG);
[[-.25, 1.97, 0x2c3a4d], [.05, 1.97, 0x4a4136]].forEach(([x, y, c]) => {
  box(.22, .14, .26, new THREE.MeshStandardMaterial({ color: c, roughness: .85 }), x, y + .07, 0, shelfG);
  box(.225, .015, .265, M.dark, x, y + .135, 0, shelfG);
});
const lampStem = cyl(.018, .03, .1, 12, M.black, -.26, .92, .06, shelfG);
const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(.034, .045, .055, 14, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xd8cdb8, roughness: .8, side: THREE.DoubleSide,
    emissive: 0xffb36b, emissiveIntensity: .55 }));
lampShade.position.set(-.26, 1.0, .06); shelfG.add(lampShade);
pLight(WARM, .35, 2.2, -2.76, 1.0, .9);
placeGLB('plant', { pos: [-2.7, 1.985, .55], height: .26, rotY: 2.0, sway: true });
placeGLB('plant', { pos: [-2.22, 2.52, .85], height: .34, rotY: 4.0, sway: true });
[.85, 1.4, 1.95].forEach(y => glowPlane(.9, .2, -2.27, y - .05, .85, WARM, .25, Math.PI / 2));
glowPlane(1.3, 2.5, -2.92, 1.3, .85, WARM, .15, Math.PI / 2);

box(3.0, .06, 1.15, M.wood, 0, .91, -2.3);
box(3.0, .015, .02, new THREE.MeshStandardMaterial({ color: 0x1f150d, roughness: .5 }),
  0, .932, -1.728);
[[-1.4, -2.78], [1.4, -2.78], [-1.4, -1.84], [1.4, -1.84]]
  .forEach(([x, z]) => {
    box(.06, .88, .06, M.dark, x, .44, z);
    box(.09, .015, .09, M.dark, x, .008, z);
  });

const monitor = new THREE.Group(); room.add(monitor);
const standBase = cyl(.16, .19, .018, 24, M.alu, 0, .949, -2.5, monitor);
const standArm = box(.05, .42, .04, M.alu, 0, 1.16, -2.55, monitor);
standArm.rotation.x = .1;
box(1.36, .8, .03, M.black, 0, 1.46, -2.525, monitor);
box(1.33, .77, .012, new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: .15, metalness: .4 }),
  0, 1.46, -2.505, monitor);
const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .74),
  new THREE.MeshBasicMaterial({ map: screenTex }));
screen.position.set(0, 1.46, -2.498); monitor.add(screen);
const pwrLed = new THREE.Mesh(new THREE.CircleGeometry(.004, 8),
  new THREE.MeshBasicMaterial({ color: 0x6fe3ff }));
pwrLed.position.set(.6, 1.08, -2.497); monitor.add(pwrLed);
const screenLight = new THREE.PointLight(0x6fb4ff, .6, 2.8, 2);
screenLight.position.set(0, 1.4, -2.05); room.add(screenLight);
glowPlane(2.4, 1.2, 0, 1.5, -2.93, 0x4a7ab8, .1);

[[-.92], [.92]].forEach(([x]) => {
  box(.11, .17, .12, M.fabric, x, 1.025, -2.42);
  cyl(.034, .034, .012, 16, M.black, x, 1.05, -2.36).rotation.x = Math.PI / 2;
  const dot = new THREE.Mesh(new THREE.CircleGeometry(.003, 8),
    new THREE.MeshBasicMaterial({ color: WARM2 }));
  dot.position.set(x + .03, .965, -2.358); room.add(dot);
});

placeGLB('desk_lamp', { pos: [-1.28, .943, -2.42], height: .46, rotY: .9, envI: .8 });
pLight(WARM, .5, 2.2, -1.05, 1.22, -2.3);

placeGLB('gaming_pc', { pos: [1.34, .943, -2.45], height: .58, rotY: 0, envI: .9 });
const rgbLight = new THREE.PointLight(0x35c4ff, .32, 1.3, 2);
rgbLight.position.set(1.56, 1.25, -2.38); room.add(rgbLight);

const kbG = new THREE.Group(); kbG.position.set(-.06, .954, -2.0); kbG.rotation.x = -.045; room.add(kbG);
box(.44, .022, .155, M.black, 0, 0, 0, kbG);
const keyGeo = new THREE.BoxGeometry(.024, .012, .024);
const keyMat = new THREE.MeshStandardMaterial({ color: 0x1c2026, roughness: .45 });
const keys = new THREE.InstancedMesh(keyGeo, keyMat, 56);
const dum = new THREE.Object3D(); let ki = 0;
for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) {
  dum.position.set(-.195 + c * .03, .014, -.057 + r * .029);
  dum.updateMatrix(); keys.setMatrixAt(ki++, dum.matrix);
}
keys.castShadow = SHADOWS; kbG.add(keys);
box(.14, .012, .024, keyMat, .0, .014, .059, kbG);
box(.024, .012, .024, keyMat, -.18, .014, .059, kbG);
box(.024, .012, .024, keyMat, .15, .014, .059, kbG);
box(.024, .013, .024, new THREE.MeshStandardMaterial({ color: 0xc86432, roughness: .5 }),
  -.195, .015, -.057, kbG);
placeGLB('gaming_mouse', { pos: [.42, .941, -2.0], height: .042, rotY: Math.PI - .15, envI: .9 });

const mugPts = [[0,0],[.038,0],[.042,.004],[.042,.1],[.046,.105],[.038,.105],[.036,.02],[0,.02]]
  .map(p => new THREE.Vector2(p[0], p[1]));
const mug = new THREE.Mesh(new THREE.LatheGeometry(mugPts, 22),
  new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: .35 }));
mug.position.set(.88, .941, -2.12); mug.castShadow = SHADOWS; room.add(mug);
const coffee = new THREE.Mesh(new THREE.CircleGeometry(.034, 18),
  new THREE.MeshStandardMaterial({ color: 0x2a1708, roughness: .25 }));
coffee.rotation.x = -Math.PI / 2; coffee.position.set(.88, 1.033, -2.12); room.add(coffee);
const handle = new THREE.Mesh(new THREE.TorusGeometry(.026, .007, 10, 20), mug.material);
handle.position.set(.928, .994, -2.12); room.add(handle);

placeGLB('plant', { pos: [-1.18, .943, -1.92], height: .36, rotY: 1.1, sway: true });

placeGLB('gaming_laptop', { pos: [-.6, .943, -1.84], height: .21, rotY: .5 + Math.PI, envI: .9 });

const chairG = placeGLB('gaming_chair', { pos: [-.46, 0, -.98], height: 1.46, rotY: .35 });

box(1.5, .03, .2, M.shelf, -.1, 2.06, -2.92);
box(1.15, .03, .2, M.shelf, .3, 2.44, -2.92);
[[-.78, 2.0], [.52, 2.0], [-.2, 2.38], [.78, 2.38]].forEach(([x, y]) =>
  box(.03, .06, .14, M.black, x, y, -2.92));
bookRow(room, -.7, 2.08, -2.92, 7);
bookRow(room, .08, 2.46, -2.92, 5);
box(.18, .03, .13, new THREE.MeshStandardMaterial({ color: bookPal[5], roughness: .85 }),
  -.26, 2.095, -2.92);
placeGLB('plant', { pos: [-.12, 2.475, -2.9], height: .25, rotY: 3.3, sway: true });
glowPlane(1.5, .3, -.1, 1.94, -2.95, WARM, .38);
glowPlane(1.15, .28, .3, 2.32, -2.95, WARM, .38);

box(.56, .74, .035, M.black, 2.62, 2.05, -3.0);
const poster = new THREE.Mesh(new THREE.PlaneGeometry(.5, .66),
  new THREE.MeshStandardMaterial({ map: posterTex, roughness: .9 }));
poster.position.set(2.62, 2.05, -2.978); room.add(poster);
[[3.12, 2.28, .28, .36], [3.08, 1.62, .22, .28]].forEach(([x, y, w, h]) => {
  box(w + .04, h + .04, .03, M.black, x, y, -3.0);
  const a = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: artSmTex, roughness: .9 }));
  a.position.set(x, y, -2.982); room.add(a);
});
box(.46, .36, .03, M.shelf, 2.35, 1.28, -3.0);
const cert = new THREE.Mesh(new THREE.PlaneGeometry(.4, .3),
  new THREE.MeshStandardMaterial({ map: certTex, roughness: .9 }));
cert.position.set(2.35, 1.28, -2.981); room.add(cert);
box(.16, .2, .035, M.dark, 1.92, 1.02, -3.0);
const medal = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .012, 18), M.gold);
medal.position.set(1.92, .99, -2.978); medal.rotation.x = Math.PI / 2; room.add(medal);
box(.014, .06, .012, new THREE.MeshStandardMaterial({ color: 0x8c2828, roughness: .8 }),
  1.92, 1.05, -2.979);
box(.07, .11, .02, new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: .7 }),
  3.7, 1.15, -3.0);

const noteCols = [0xf5e27a, 0x8fe3ff, 0xf5a07a];
[[-.95, 1.62], [-.78, 1.45], [-1.08, 1.4]].forEach(([x, y], i) => {
  const n = new THREE.Mesh(new THREE.PlaneGeometry(.1, .1),
    new THREE.MeshStandardMaterial({ color: noteCols[i], roughness: 1 }));
  n.position.set(x, y, -2.985); n.rotation.z = (Math.random() - .5) * .3; room.add(n);
});

const barMesh = new THREE.Mesh(new THREE.BoxGeometry(.045, 1.75, .045),
  new THREE.MeshBasicMaterial({ color: WARM2 }));
barMesh.position.set(3.5, .95, -2.55); room.add(barMesh);
cyl(.06, .08, .03, 14, M.black, 3.5, .06, -2.55);
glowPlane(.8, 2.2, 3.44, 1.0, -2.5, WARM, .3);
glowPlane(.8, 2.2, 3.42, 1.0, -2.48, WARM, .25, Math.PI / 2);
pLight(WARM, .85, 5.2, 3.32, 1.1, -2.3);

placeGLB('banana_plant', { pos: [3.05, 0, -2.2], height: 1.55, rotY: -.5, sway: true });
placeGLB('banana_plant', { pos: [-2.45, 0, -2.5], height: 1.25, rotY: 2.3, sway: true });

const bpG = placeGLB('cameraman_backpack', { pos: [2.35, 0, -2.76], height: .56, rotY: -.35, envI: .8 });
bpG.rotation.x = -.19;

const ball = placeGLB('football', { pos: [.95, .115, -.62], height: .22, centerPivot: true });

const led = glowPlane(3.6, .55, 0, .22, -2.96, WARM, .42);
glowPlane(2.8, .45, 4.55, .2, -1.4, WARM, .32, -Math.PI / 2);
glowPlane(2.0, .4, -2.94, .22, -2.2, WARM, .22, Math.PI / 2);
pLight(WARM, .55, 3.8, 0, .35, -2.5);
pLight(WARM, .38, 3.0, 2.3, .3, -2.5);
pLight(WARM, .42, 3.0, -2.4, .5, -.9);
pLight(WARM, .38, 3.4, 4.2, .35, -1.4);

placeGLB('ceiling_light', { pos: [.5, 3.19, -.9], height: .75, normMax: true, rotX: Math.PI, topAlign: true, envI: .5 });
const ceilL = new THREE.PointLight(0xfff0da, .62, 12, 2);
ceilL.position.set(.5, 2.8, -.9); room.add(ceilL);
glowPlane(2.0, 2.0, .5, 3.06, -.9, 0xfff0da, .3, 0, Math.PI / 2);
glowPlane(3.4, 3.4, .5, 3.12, -.9, 0xfff0da, .12, 0, Math.PI / 2);

const DUST_N = MOBILE ? 90 : 240;
const dustPos = new Float32Array(DUST_N * 3);
for (let i = 0; i < DUST_N; i++) {
  dustPos[i*3] = -2.8 + Math.random() * 6; dustPos[i*3+1] = Math.random() * 2.8;
  dustPos[i*3+2] = -2.9 + Math.random() * 6;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xcfe0f5, size: .011, transparent: true, opacity: .26,
  depthWrite: false, blending: THREE.AdditiveBlending }));
room.add(dust);

const camRail = new THREE.CatmullRomCurve3([
  new THREE.Vector3(1.85, 1.78, 2.8),
  new THREE.Vector3(1.5, 1.62, 1.5),
  new THREE.Vector3(.6, 1.55, -.3),
  new THREE.Vector3(.07, 1.53, -1.45),
  new THREE.Vector3(0, 1.46, -2.32),
]);
const tgtRail = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-.4, 1.15, -2.1),
  new THREE.Vector3(0, 1.25, -2.25),
  new THREE.Vector3(0, 1.44, -2.5),
  new THREE.Vector3(0, 1.46, -2.5),
  new THREE.Vector3(0, 1.46, -2.5),
]);
