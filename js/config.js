const MOBILE = Math.min(innerWidth, innerHeight) < 760 || (navigator.maxTouchPoints > 1 && innerWidth < 1024);
const TOUCH = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const SHADOWS = true;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const T = {
  roomEnd: .2749,
  flashMid: .2815, flashW: .0186,
  hero:   [.3029, .4026],
  dive:   [.3989, .4585],
  p1:     [.4567, .5247],
  p2:     [.5247, .5927],
  p3:     [.5927, .6608],
  p4:     [.6608, .7288],
  p5:     [.7288, .7968],
  p6:     [.7968, .8649],
  social: [.8928, .9487],
  end:    [.9487, 1.01],
};
const DIGI_DEPTH = 165.7;

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.25 : TOUCH ? 1.5 : 1.75));
renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = SHADOWS;
renderer.shadowMap.type = MOBILE || TOUCH ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = !TOUCH;
renderer.shadowMap.needsUpdate = true;

const camera = new THREE.PerspectiveCamera(50, (canvas.clientWidth || innerWidth) / (canvas.clientHeight || innerHeight), .05, 400);
