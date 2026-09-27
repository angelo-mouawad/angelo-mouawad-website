const leaves = [];
const MODEL_FILES = {
  ceiling_light: 'ceiling_light_round.glb',
  gaming_mouse: 'gaming_mouse.glb',
  cameraman_backpack: 'cameraman_backpack.glb',
  football: 'low_poly_cartoon_football_ball_free.glb',
  mini_fridge: 'mini_fridge.glb',
  classic_ps5: 'classic_ps5.glb',
  desk_lamp: 'desk_lamp.glb',
  gaming_laptop: 'gaming_laptop.glb',
  plant: 'plant.glb',
  banana_plant: 'banana_plant.glb',
  gaming_pc: 'gaming_pc.glb',
  gaming_chair: 'gaming_chair.glb',
};
const MODEL_PATH = 'objects/';
const gltfLoader = new THREE.GLTFLoader();
const glbCache = {};
let glbAsked = 0, glbDone = 0, loaderHidden = false;
const loaderEl = document.getElementById('loader');
const loaderFill = loaderEl.querySelector('.lfill');
const loaderSub = loaderEl.querySelector('.lsub');
function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  loaderEl.classList.add('done');
  setTimeout(() => { loaderEl.style.display = 'none'; }, 1000);
}
function glbProgress() {
  glbDone++;
  const pct = glbAsked ? Math.round(glbDone / glbAsked * 100) : 100;
  loaderEl.classList.add('det');
  loaderFill.style.width = pct + '%';
  loaderSub.textContent = 'BUILDING ENVIRONMENT  ' + pct + '%';
  if (glbDone >= glbAsked) setTimeout(hideLoader, 260);
}
function withGLB(key, cb) {
  if (glbCache[key]) return cb(glbCache[key]);
  (glbCache[key + '_q'] = glbCache[key + '_q'] || []).push(cb);
  if (glbCache[key + '_l']) return;
  glbCache[key + '_l'] = true;
  glbAsked++;
  gltfLoader.load(MODEL_PATH + MODEL_FILES[key], g => {
    glbCache[key] = g.scene;
    glbCache[key + '_q'].forEach(f => f(g.scene));
    glbProgress();
  }, undefined, e => { console.error('GLB load failed:', key, e); glbProgress(); });
}
function placeGLB(key, { pos, height, rotY = 0, rotX = 0, parent = room, sway = false, envI = .7, centerPivot = false, topAlign = false, normMax = false }) {
  const holder = new THREE.Group(); holder.position.set(...pos); holder.rotation.y = rotY;
  parent.add(holder);
  const swayG = new THREE.Group(); holder.add(swayG);
  withGLB(key, base => {
    const obj = base.clone(true);
    obj.rotation.x = rotX;
    const bb = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); bb.getSize(size);
    obj.scale.setScalar(height / (normMax ? Math.max(size.x, size.y, size.z) : size.y));
    bb.setFromObject(obj);
    const c = new THREE.Vector3(); bb.getCenter(c);
    obj.position.x -= c.x; obj.position.z -= c.z;
    obj.position.y -= topAlign ? bb.max.y : (centerPivot ? c.y : bb.min.y);
    obj.traverse(o => {
      if (o.isMesh) {
        o.castShadow = SHADOWS; o.receiveShadow = SHADOWS;
        if (o.material) o.material.envMapIntensity = envI;
      }
    });
    swayG.add(obj);
    renderer.shadowMap.needsUpdate = true;
    if (sway) leaves.push(swayG);
  });
  return holder;
}
