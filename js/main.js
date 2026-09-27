gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

let targetP = 0, p = 0;
ScrollTrigger.create({
  trigger: '#scrollSpace', start: 'top top', end: 'bottom bottom',
  onUpdate: self => { targetP = self.progress; },
});
let mx = 0, my = 0, mouseSeen = false;
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  mouseSeen = true;
  mx = (e.clientX / innerWidth - .5) * 2;
  my = (e.clientY / innerHeight - .5) * 2;
}, { passive: true });

let resizeT = 0, lastW = canvas.clientWidth, lastH = canvas.clientHeight;
function applySize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w === lastW && h === lastH) return;
  lastW = w; lastH = h;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(applySize, MOBILE ? 180 : 0);
});
addEventListener('orientationchange', () => setTimeout(applySize, 260));
canvas.addEventListener('webglcontextlost', e => {
  e.preventDefault();
  if (!sessionStorage.getItem('amGlReload')) {
    sessionStorage.setItem('amGlReload', '1');
    location.reload();
  }
});
canvas.addEventListener('webglcontextrestored', () => sessionStorage.removeItem('amGlReload'));

const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
let lastT = performance.now(), heroOnState = false, lastCu = -1;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastT) / 1000, .05); lastT = now;
  const t = now / 1000;

  const k = REDUCED ? 1 : 1 - Math.exp(-dt * 5.2);
  p += (targetP - p) * k;

  els.bar.style.width = (p * 100).toFixed(2) + '%';
  els.cue.style.opacity = Math.max(0, 1 - p / .028);
  const sec = SECTS.find(s => p >= s[0] && p < s[1]) || SECTS[SECTS.length - 1];
  if (els.sIdx.textContent !== sec[2]) { els.sIdx.textContent = sec[2]; els.sName.textContent = sec[3]; }

  const f = Math.exp(-Math.pow((p - T.flashMid) / T.flashW, 2));
  els.flash.style.opacity = f.toFixed(3);

  const heroO = winOp(p, T.hero[0], T.hero[1], .0326);
  applySect(els.hero, heroO, 50);
  const heroOn = heroO > .25;
  if (heroOn !== heroOnState) { heroOnState = heroOn; els.hero.classList.toggle('on', heroOn); }
  applySect(els.dive, winOp(p, T.dive[0], T.dive[1], .0186), 20);
  ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].forEach(k => applySect(els[k], winOp(p, T[k][0], T[k][1], .0242)));
  applySect(els.social, winOp(p, T.social[0], T.social[1]));
  applySect(els.end, winOp(p, T.end[0], 1.05, .0373), 26);

  const inRoom = p < T.flashMid;

  if (inRoom) {

    const u = THREE.MathUtils.clamp(p / T.roomEnd, 0, 1);
    camRail.getPoint(u, V1); tgtRail.getPoint(u, V2);
    const para = (1 - u) * (REDUCED ? 0 : 1);
    camera.position.set(V1.x + mx * .14 * para, V1.y - my * .09 * para, V1.z);
    camera.lookAt(V2);
    camera.fov = 50 - u * 8; camera.updateProjectionMatrix();

    rgbLight.color.setHSL(.55 + Math.sin(t * .4) * .04, .9, .6);
    leaves.forEach((l, i) => { l.rotation.y = Math.sin(t * .7 + i * 1.7) * .035; l.rotation.z = Math.sin(t * .55 + i) * .012; });
    const bk = REDUCED ? 1 : 1 - Math.exp(-dt * 4);
    const bTx = mouseSeen ? mx * 2.6 : Math.sin(t * .26) * 1.5;
    const bTy = mouseSeen ? my * 1.4 : Math.sin(t * .19) * .45;
    ball.rotation.y += (bTx - ball.rotation.y) * bk;
    ball.rotation.x += (bTy - ball.rotation.x) * bk;
    const cu = THREE.MathUtils.smoothstep(u, .12, .78);
    chairG.rotation.y = .35 + cu * (Math.PI - .35);
    chairG.position.set(-.46 + cu * .3, 0, -.98 - cu * .44);
    if (Math.abs(cu - lastCu) > .001) { renderer.shadowMap.needsUpdate = true; lastCu = cu; }
    screenLight.intensity = .5 + Math.sin(t * 7.3) * .03 + Math.sin(t * 1.1) * .05;
    sun.intensity = 1.25 - u * .45;
    led.material.opacity = .55 + Math.sin(t * .9) * .05;
    candleL.intensity = .14 + Math.sin(t * 8.7) * .05 + Math.sin(t * 21) * .025;
    flame.scale.y = 1 + Math.sin(t * 11) * .25; flame.rotation.z = Math.sin(t * 7) * .12;
    pool.material.opacity = .11 + Math.sin(t * .5) * .02;
    tvL.intensity = .38 + Math.sin(t * 13.3) * .03 + Math.sin(t * 5.1) * .02;
    clockFace.material.opacity = .72 + (Math.sin(t * 2) > 0 ? .13 : 0);
    barMesh.material.color.setHSL(.085, .85, .7 + Math.sin(t * 1.3) * .03);

    const dp = dust.geometry.attributes.position.array;
    for (let i = 0; i < DUST_N; i++) {
      dp[i*3+1] += dt * .018; dp[i*3] += Math.sin(t * .3 + i) * dt * .01;
      if (dp[i*3+1] > 2.9) dp[i*3+1] = .05;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    renderer.render(room, camera);
  } else {

    const z = digiZ(p);
    camera.position.set(mx * .5 * (REDUCED ? 0 : 1), -my * .3 * (REDUCED ? 0 : 1), z);
    camera.lookAt(0, 0, z - 12);
    camera.fov = 55; camera.updateProjectionMatrix();
    digiKey.position.set(0, 3, z - 6);

    heroIco.rotation.y = t * .12; heroIco.rotation.x = t * .07;
    rings.forEach((r, i) => { r.rotation.z += dt * (.08 + (i % 3) * .05) * (i % 2 ? 1 : -1); });

    pods.forEach((g, i) => {
      g.userData.core.rotation.y = t * (.5 + i * .12);
      g.userData.core.rotation.x = t * .3;
      g.position.y = Math.sin(t * .9 + i * 2.1) * .14;
      g.rotation.y = t * .1 * (i % 2 ? -1 : 1);
    });

    linkMat.opacity = .16 + Math.sin(t * 1.6) * .08;
    net.rotation.z = Math.sin(t * .12) * .05;
    finale.rotation.y = t * .08;
    finGlow.material.opacity = .45 + Math.sin(t * .9) * .12;

    renderer.render(digital, camera);
  }
}

camRail.getPoint(0, V1); camera.position.copy(V1);
tgtRail.getPoint(0, V2); camera.lookAt(V2);
renderer.render(room, camera);
requestAnimationFrame(frame);
setTimeout(hideLoader, 25000);
if (glbAsked === 0) setTimeout(hideLoader, 900);
