document.querySelectorAll('#heroName .word').forEach(w => {
  [...w.dataset.w].forEach((ch, i) => {
    const s = document.createElement('span'); s.className = 'ltr';
    s.textContent = ch; s.style.transitionDelay = (i * 45) + 'ms';
    w.appendChild(s);
  });
});

const $ = id => document.getElementById(id);
const els = {
  hero: $('heroSec'), dive: $('diveSec'),
  p1: $('pOne'), p2: $('pTwo'), p3: $('pThree'), p4: $('pFour'), p5: $('pFive'), p6: $('pSix'),
  social: $('socialSec'), end: $('endSec'),
  flash: $('flash'), bar: $('bar'), cue: $('scrollCue'),
  sIdx: $('sectIdx'), sName: $('sectName'),
};
const SECTS = [
  [0, .2796, '01', 'THE ROOM'], [.2796, .3989, '02', 'HELLO'],
  [.3989, .4567, '··', 'DIVE'], [.4567, .8649, '03', 'PROJECTS'],
  [.8649, .8928, '··', 'NETWORK'], [.8928, .9487, '04', 'CONNECT'], [.9487, 1.01, '05', 'END'],
];
function winOp(p, a, b, f = .028) {
  return THREE.MathUtils.clamp((p - a) / f, 0, 1) * THREE.MathUtils.clamp((b - p) / f, 0, 1);
}
function applySect(el, o, lift = 36) {
  el.style.opacity = o;
  el.style.transform = `translateY(${(1 - o) * lift}px)`;
  el.style.pointerEvents = o > .55 ? 'auto' : 'none';
}

let actx = null, audioOn = false, agains = null;
$('audioBtn').addEventListener('click', () => {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const len = actx.sampleRate * 2, buf = actx.createBuffer(1, len, actx.sampleRate);
    const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random()*2-1; last = (last + .02*w)/1.02; d[i] = last*3.5; }
    const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
    agains = actx.createGain(); agains.gain.value = 0;
    src.connect(lp).connect(agains).connect(actx.destination); src.start();
  }
  audioOn = !audioOn;
  if (actx.state === 'suspended') actx.resume();
  agains.gain.linearRampToValueAtTime(audioOn ? .05 : 0, actx.currentTime + .8);
  $('audioBtn').textContent = `SOUND · ${audioOn ? 'ON' : 'OFF'}`;
  $('audioBtn').classList.toggle('on', audioOn);
});
