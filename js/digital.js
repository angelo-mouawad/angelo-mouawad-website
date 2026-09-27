const digital = new THREE.Scene();
digital.fog = new THREE.FogExp2(0x05070d, .0135);
digital.add(new THREE.AmbientLight(0x4060a0, .6));
const digiKey = new THREE.PointLight(0x6fb4ff, 1.2, 80, 2); digital.add(digiKey);

const STAR_N = MOBILE ? 700 : 1700;
const starPos = new Float32Array(STAR_N * 3);
for (let i = 0; i < STAR_N; i++) {
  starPos[i*3] = (Math.random() - .5) * 90;
  starPos[i*3+1] = (Math.random() - .5) * 55;
  starPos[i*3+2] = 25 - Math.random() * 216;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
digital.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: 0x9fc4ef, size: .09, transparent: true, opacity: .75,
  depthWrite: false, blending: THREE.AdditiveBlending })));

const heroIco = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1),
  new THREE.MeshBasicMaterial({ color: 0x2c5e9e, wireframe: true, transparent: true, opacity: .3 }));
heroIco.position.set(0, 0, -14); digital.add(heroIco);

const tunnel = new THREE.Group(); digital.add(tunnel);
const RINGS = MOBILE ? 10 : 16;
const rings = [];
for (let r = 0; r < RINGS; r++) {
  const n = 90, pos = new Float32Array(n * 3), rad = 5.2 + Math.random() * 1.4;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    pos[i*3] = Math.cos(a) * rad; pos[i*3+1] = Math.sin(a) * rad; pos[i*3+2] = 0;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ring = new THREE.Points(g, new THREE.PointsMaterial({
    color: r % 3 ? 0x4da3ff : 0x6fe3ff, size: .07, transparent: true,
    opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring.position.z = -19 - r * (27 / RINGS); ring.rotation.z = Math.random() * 6;
  tunnel.add(ring); rings.push(ring);
}

function pod(x, z, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); digital.add(g);
  const glassM = new THREE.MeshPhongMaterial({ color: 0x9fc8ff, transparent: true,
    opacity: .08, side: THREE.DoubleSide, depthWrite: false, shininess: 90 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.5, 36, 1, true), glassM);
  g.add(tube);
  const ringM = new THREE.MeshBasicMaterial({ color: accent, transparent: true,
    opacity: .9, blending: THREE.AdditiveBlending });
  [[-1.25], [1.25]].forEach(([y]) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(1.0, .025, 10, 60), ringM);
    t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t);
  });
  const base = new THREE.Mesh(new THREE.TorusGeometry(1.18, .015, 8, 60),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: .4,
      blending: THREE.AdditiveBlending }));
  base.rotation.x = Math.PI / 2; base.position.y = -1.32; g.add(base);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.55, 0),
    new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: .85 }));
  g.add(core); g.userData.core = core;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: accent,
    transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
  sp.scale.set(5.2, 5.2, 1); g.add(sp);
  const pn = MOBILE ? 30 : 60, pp = new Float32Array(pn * 3);
  for (let i = 0; i < pn; i++) {
    const a = Math.random() * 6.28, rr = Math.random() * .85;
    pp[i*3] = Math.cos(a) * rr; pp[i*3+1] = (Math.random() - .5) * 2.2; pp[i*3+2] = Math.sin(a) * rr;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: accent, size: .035,
    transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })));
  return g;
}
const pods = [
  pod(-1.9, -43, 0x6fe3ff),
  pod(1.9, -58, 0x4da3ff),
  pod(-1.9, -74, 0x8fb8ff),
  pod(1.9, -90, 0x6fe3ff),
  pod(-1.9, -105.5, 0x4da3ff),
  pod(1.9, -121.2, 0x8fb8ff),
];

const net = new THREE.Group(); digital.add(net);
const NODES = MOBILE ? 36 : 64, nodePts = [];
const nodeGeoBall = new THREE.SphereGeometry(.07, 8, 8);
const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6fe3ff });
for (let i = 0; i < NODES; i++) {
  const v = new THREE.Vector3((Math.random()-.5)*22, (Math.random()-.5)*13, -123.7 - Math.random()*26);
  nodePts.push(v);
  const s = new THREE.Mesh(nodeGeoBall, nodeMat); s.position.copy(v); net.add(s);
}
const linkPos = [];
for (let i = 0; i < NODES; i++) for (let j = i + 1; j < NODES; j++) {
  if (nodePts[i].distanceTo(nodePts[j]) < 7.5 && Math.random() < .5)
    linkPos.push(nodePts[i].x, nodePts[i].y, nodePts[i].z, nodePts[j].x, nodePts[j].y, nodePts[j].z);
}
const linkGeo = new THREE.BufferGeometry();
linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPos), 3));
const linkMat = new THREE.LineBasicMaterial({ color: 0x4da3ff, transparent: true,
  opacity: .22, blending: THREE.AdditiveBlending });
net.add(new THREE.LineSegments(linkGeo, linkMat));

const finale = new THREE.Group(); finale.position.set(0, 0, -183.7); digital.add(finale);
finale.add(new THREE.Mesh(new THREE.IcosahedronGeometry(7, 2),
  new THREE.MeshBasicMaterial({ color: 0x3a6db0, wireframe: true, transparent: true, opacity: .5 })));
const finGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x5fa8ff,
  transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
finGlow.scale.set(30, 30, 1); finale.add(finGlow);

function digiZ(p) {
  const pd = THREE.MathUtils.clamp((p - T.flashMid) / (1 - T.flashMid), 0, 1);
  let z = 8 - pd * DIGI_DEPTH;
  if (p > T.end[0]) {
    const e = THREE.MathUtils.clamp((p - T.end[0]) / .0513, 0, 1);
    z = (8 - ((T.end[0] - T.flashMid)/(1 - T.flashMid)) * DIGI_DEPTH) + e * 9;
  }
  return z;
}
