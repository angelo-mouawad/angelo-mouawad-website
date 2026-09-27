const M = {
  wall:  new THREE.MeshStandardMaterial({ map: wallTex, color: 0xffffff, roughness: .95 }),
  wallD: new THREE.MeshStandardMaterial({ color: 0x222428, roughness: .97 }),
  dark:  new THREE.MeshStandardMaterial({ color: 0x101216, roughness: .5, metalness: .4 }),
  alu:   new THREE.MeshStandardMaterial({ color: 0x80888f, roughness: .28, metalness: .9 }),
  black: new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: .35, metalness: .3 }),
  wood:  new THREE.MeshStandardMaterial({ map: woodTex, roughness: .42, metalness: .05 }),
  shelf: new THREE.MeshStandardMaterial({ color: 0x3a2b1e, roughness: .68 }),
  fabric:new THREE.MeshStandardMaterial({ color: 0x0f1114, roughness: .95 }),
  page:  new THREE.MeshStandardMaterial({ color: 0xd9d2c2, roughness: .9 }),
  gold:  new THREE.MeshStandardMaterial({ color: 0xc8a14e, roughness: .22, metalness: .95 }),
};
const WARM = 0xffae5e, WARM2 = 0xffc890;
const bookPal = [0x4a6f9e, 0x6e4a3a, 0x49684c, 0xa08a5e, 0x3c4654, 0x7a5470];

function box(w, h, d, mat, x, y, z, parent = room, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = cast && SHADOWS; m.receiveShadow = SHADOWS;
  parent.add(m); return m;
}
function cyl(rt, rb, h, seg, mat, x, y, z, parent = room) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = SHADOWS; m.receiveShadow = SHADOWS;
  parent.add(m); return m;
}
function tube(pts, r, mat, parent = room) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, 24, r, 6, false), mat);
  m.castShadow = SHADOWS; parent.add(m); return m;
}
function glowPlane(w, h, x, y, z, color, op, ry = 0, rx = 0, parent = room) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: op,
      depthWrite: false, blending: THREE.AdditiveBlending }));
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parent.add(m); return m;
}
function pLight(color, i, d, x, y, z) {
  const l = new THREE.PointLight(color, i, d, 2); l.position.set(x, y, z); room.add(l); return l;
}
function bookRow(parent, x, y, z, n, s = .055) {
  for (let i = 0; i < n; i++) {
    const bh = .13 + Math.random() * .09, bw = .026 + Math.random() * .016;
    const lean = i === n - 1 ? .22 : (Math.random() - .5) * .07;
    const g = new THREE.Group(); g.position.set(x + i * s, y, z); g.rotation.z = lean; parent.add(g);
    box(bw, bh, .14, new THREE.MeshStandardMaterial({
      color: bookPal[(Math.random() * 6) | 0], roughness: .82 }), 0, bh / 2, 0, g);
    box(bw * .7, bh * .92, .132, M.page, 0, bh / 2, .006, g);
  }
}
const ivyMat = new THREE.MeshStandardMaterial({ color: 0x37633f, roughness: .8, side: THREE.DoubleSide });
const ivyMat2 = new THREE.MeshStandardMaterial({ color: 0x2c5234, roughness: .85, side: THREE.DoubleSide });
const potMat = new THREE.MeshStandardMaterial({ color: 0x8e887e, roughness: .85 });
function leafBlade(parent, x, y, z, len, yaw, tilt, mat) {
  const l = new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), mat);
  l.scale.set(.05, len, .016); l.position.set(x, y, z);
  l.rotation.set(tilt, yaw, 0); parent.add(l); return l;
}
function ivy(parent, x, y, z) {
  const pot = cyl(.05, .04, .085, 14, potMat, x, y + .045, z, parent);
  for (let i = 0; i < 10; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), Math.random() < .5 ? ivyMat : ivyMat2);
    l.scale.set(.022, .09 + Math.random() * .09, .01);
    l.position.set(x + (Math.random() - .5) * .18, y - .02 - Math.random() * .17, z + .1 + (Math.random() - .5) * .08);
    l.rotation.z = (Math.random() - .5) * .9; parent.add(l);
  }
}
