function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
const woodTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#2a1d13'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * h, alpha = .04 + Math.random() * .09;
    g.strokeStyle = Math.random() < .5 ? `rgba(105,72,44,${alpha})` : `rgba(8,5,3,${alpha})`;
    g.lineWidth = .5 + Math.random() * 2.4;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .02 + i) * 4 + (Math.random()-.5)*3);
    g.stroke();
  }
});
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;

const floorTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#161110'; g.fillRect(0, 0, w, h);
  for (let p = 0; p < 8; p++) {
    g.fillStyle = `rgba(${22+Math.random()*8|0},${17+Math.random()*6|0},${14+Math.random()*5|0},1)`;
    g.fillRect(0, p * 64, w, 62);
    for (let i = 0; i < 30; i++) {
      g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 1;
      const y = p*64 + Math.random()*62;
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (Math.random()-.5)*2); g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, p*64+62, w, 2);
  }
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(5, 5);

function drawScreen(g, w, h) {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#04060c'); bg.addColorStop(1, '#0a1322');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 110; i++) {
    g.fillStyle = `rgba(159,196,239,${.15 + Math.random() * .5})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
  }
  const cx = w / 2, cy = h / 2 + 40, R = 240;
  const halo = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
  halo.addColorStop(0, 'rgba(60,110,190,.28)'); halo.addColorStop(1, 'rgba(60,110,190,0)');
  g.fillStyle = halo; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,150,220,.45)'; g.lineWidth = 1.6;
  g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  [.3, .62, .88].forEach(k => {
    g.beginPath(); g.ellipse(cx, cy, R, R * k, 0, 0, 7); g.stroke();
    g.beginPath(); g.ellipse(cx, cy, R * k, R, 0, 0, 7); g.stroke();
  });
  g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.stroke();
  g.beginPath(); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
  g.textAlign = 'center';
  g.fillStyle = '#6fe3ff'; g.font = '500 21px "JetBrains Mono", monospace';
  g.fillText('// PORTFOLIO INITIALIZED', cx, cy - 150);
  g.fillStyle = '#e9eef4'; g.font = '900 96px "Archivo Black", sans-serif';
  g.shadowColor = 'rgba(80,140,255,.55)'; g.shadowBlur = 28;
  g.fillText('ANGELO MOUAWAD', cx, cy - 40);
  g.shadowBlur = 0;
  g.fillStyle = '#4da3ff'; g.font = '500 25px "JetBrains Mono", monospace';
  g.fillText('C O M P U T E R   S C I E N C E   S T U D E N T', cx, cy + 22);
  g.fillStyle = 'rgba(233,238,244,.5)'; g.font = '400 20px "JetBrains Mono", monospace';
  g.fillText('SCROLL TO ENTER \u25b8', cx, cy + 168);
}
const screenTex = canvasTex(1280, 760, drawScreen);
if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(() => {
    drawScreen(screenTex.image.getContext('2d'), 1280, 760);
    screenTex.needsUpdate = true;
  });

const glowTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(140,220,255,1)'); grd.addColorStop(.3, 'rgba(90,170,255,.45)');
  grd.addColorStop(1, 'rgba(40,90,200,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
})();

const shadowTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.85)'); grd.addColorStop(.55, 'rgba(0,0,0,.4)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
})();
const streakTex = canvasTex(256, 256, (g, w, h) => {
  const grd = g.createLinearGradient(0, h, w, 0);
  grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(.42, 'rgba(255,255,255,0)');
  grd.addColorStop(.5, 'rgba(220,235,255,.5)'); grd.addColorStop(.58, 'rgba(255,255,255,0)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
});
const meshTex = canvasTex(64, 64, (g, w, h) => {
  g.fillStyle = '#101216'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
  for (let i = 0; i <= w; i += 6) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke();
  }
});
meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(4, 4);

const cityTex = canvasTex(512, 512, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a1120'); sky.addColorStop(.62, '#1c2436'); sky.addColorStop(1, '#39415a');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.filter = 'blur(1px)';
  for (let i = 0; i < 46; i++) {
    g.fillStyle = `rgba(220,232,255,${.2 + Math.random() * .35})`;
    g.fillRect(Math.random() * w, Math.random() * h * .42, 1.6, 1.6);
  }
  g.filter = 'blur(5px)';
  let x = -10;
  while (x < w + 10) {
    const bw = 24 + Math.random() * 48, bh = 90 + Math.random() * 210, bx = x, by = h - bh;
    g.fillStyle = '#0b0e14'; g.fillRect(bx, by, bw, bh);
    for (let wy = by + 8; wy < h - 10; wy += 13)
      for (let wx = bx + 4; wx < bx + bw - 5; wx += 9)
        if (Math.random() < .17) {
          g.fillStyle = Math.random() < .65 ? 'rgba(255,212,150,.9)' : 'rgba(170,205,255,.85)';
          g.fillRect(wx, wy, 3.6, 4.8);
        }
    x += bw + 2 + Math.random() * 6;
  }
  g.filter = 'blur(9px)';
  for (let i = 0; i < 24; i++) {
    const warm = Math.random() < .6;
    g.fillStyle = warm ? 'rgba(255,205,140,.5)' : 'rgba(160,200,255,.45)';
    g.beginPath();
    g.arc(Math.random() * w, h * .45 + Math.random() * h * .5, 3 + Math.random() * 6, 0, 7);
    g.fill();
  }
  g.filter = 'none';
  g.fillStyle = 'rgba(255,190,120,.06)'; g.fillRect(0, h * .58, w, h * .42);
});

const chalkTex = canvasTex(460, 600, (g, w, h) => {
  g.fillStyle = '#17191b'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(235,235,228,${Math.random() * .035})`;
    g.beginPath(); g.arc(Math.random()*w, Math.random()*h, 18+Math.random()*46, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(238,238,232,.88)'; g.font = '400 24px monospace';
  const code = ['function solve(problem) {','  let coffee = new Coffee();','  while (notTired) {',
    '    code();','    coffee.drink();','  }','  if (success) {','    beAwesome();','  }','  return true;','}'];
  code.forEach((l, i) => g.fillText(l, 34, 68 + i * 44));
});

const posterTex = canvasTex(256, 340, (g, w, h) => {
  g.fillStyle = '#ece7dd'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#16181c'; g.textAlign = 'center'; g.font = '800 31px sans-serif';
  g.fillText('DISCIPLINE', w/2, 130); g.fillText('FOCUS', w/2, 174); g.fillText('CONSISTENCY', w/2, 218);
  g.fillRect(w/2 - 30, 244, 60, 3);
  g.fillStyle = 'rgba(22,24,28,.45)'; g.font = '400 11px monospace'; g.fillText('EVERY · SINGLE · DAY', w/2, 280);
});

const certTex = canvasTex(256, 192, (g, w, h) => {
  g.fillStyle = '#eae2d0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,100,60,.6)'; g.lineWidth = 3; g.strokeRect(10, 10, w-20, h-20);
  g.fillStyle = '#2a2620'; g.textAlign = 'center'; g.font = '700 21px serif';
  g.fillText('CERTIFICATE', w/2, 56);
  g.fillStyle = 'rgba(60,54,44,.55)';
  [86, 104, 122].forEach((y, i) => g.fillRect(w/2 - 70 + i*8, y, 140 - i*16, 5));
  g.fillStyle = '#c8a14e'; g.beginPath(); g.arc(w - 52, h - 46, 16, 0, 7); g.fill();
  g.fillStyle = 'rgba(140,40,40,.85)'; g.fillRect(w - 58, h - 38, 5, 22); g.fillRect(w - 51, h - 38, 5, 22);
});

const wallTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#2e3138'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},255,${Math.random()*.022})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
  }
});
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping; wallTex.repeat.set(3, 3);
const roughTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d'); g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const v = 150 + Math.random() * 105 | 0;
    g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random()*256, Math.random()*256, 2, 2);
  }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t;
})();
const rugTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#8f949c'; g.fillRect(0, 0, w, h);
  for (let r = 250; r > 8; r -= 7) {
    const v = 112 + Math.random() * 48 | 0;
    g.strokeStyle = `rgba(${v},${v},${v},.55)`;
    g.lineWidth = 4; g.beginPath(); g.arc(w/2, h/2, r, 0, 7); g.stroke();
  }
});
const shaftTex = (() => {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256;
  const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(cv);
})();
const clockTex = canvasTex(128, 48, (g, w, h) => {
  g.fillStyle = '#04070a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8fd0ff'; g.font = '700 30px monospace'; g.textAlign = 'center';
  g.fillText('12:05', w / 2, 34);
});
const artSmTex = canvasTex(128, 168, (g, w, h) => {
  g.fillStyle = '#11151c'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = `rgba(${90+i*30},${140+i*20},255,${.3+i*.12})`; g.lineWidth = 3;
    g.beginPath(); g.arc(w*.3+i*8, h*.6, 26+i*12, 2.6, 5.2); g.stroke();
  }
});

function drawTV(g, w, h) {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#04060c'); bg.addColorStop(1, '#0a1322');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(159,196,239,${.12 + Math.random() * .35})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  g.textAlign = 'left'; g.fillStyle = '#6fe3ff';
  g.font = '500 22px "JetBrains Mono", monospace';
  g.fillText('AM // GAME MODE', 60, 62);
  g.textAlign = 'right'; g.fillStyle = 'rgba(233,238,244,.75)';
  g.fillText('21:47', w - 60, 62);
  g.strokeStyle = 'rgba(111,227,255,.22)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(60, 84); g.lineTo(w - 60, 84); g.stroke();
  const names = ['RESTAURANT', 'FLOWENGINE', 'DRAGON', 'SAMAR', 'ECHOES', 'GAFFER'];
  for (let i = 0; i < names.length; i++) {
    const big = i === 0, tw = big ? 210 : 112, th = big ? 210 : 112;
    const x = 60 + (big ? 0 : 300 + (i - 1) * 123), y = big ? 150 : 199;
    const tg = g.createLinearGradient(x, y, x + tw, y + th);
    tg.addColorStop(0, '#101c30'); tg.addColorStop(1, '#070d18');
    g.fillStyle = tg; g.fillRect(x, y, tw, th);
    g.strokeStyle = big ? 'rgba(111,227,255,.85)' : 'rgba(111,227,255,.3)';
    g.lineWidth = big ? 2.5 : 1;
    if (big) { g.shadowColor = 'rgba(111,227,255,.6)'; g.shadowBlur = 18; }
    g.strokeRect(x, y, tw, th); g.shadowBlur = 0;
    const ccx = x + tw / 2, ccy = y + th * .44, r = big ? 56 : 26;
    g.strokeStyle = big ? 'rgba(111,227,255,.6)' : 'rgba(90,150,220,.4)';
    g.lineWidth = 1.4;
    g.beginPath(); g.arc(ccx, ccy, r, 0, 7); g.stroke();
    g.beginPath(); g.ellipse(ccx, ccy, r, r * .42, 0, 0, 7); g.stroke();
    g.beginPath(); g.ellipse(ccx, ccy, r * .42, r, 0, 0, 7); g.stroke();
    g.textAlign = 'center';
    g.fillStyle = big ? '#e9eef4' : 'rgba(233,238,244,.55)';
    g.font = (big ? '500 19px' : '500 13px') + ' "JetBrains Mono", monospace';
    g.fillText('PRJ_' + names[i], ccx, y + th - 18);
  }
  g.textAlign = 'left'; g.fillStyle = '#e9eef4';
  g.font = '800 34px "Archivo", sans-serif';
  g.fillText('CONTINUE PLAYING', 60, 432);
  g.fillStyle = '#4da3ff'; g.font = '500 19px "JetBrains Mono", monospace';
  g.fillText('> finger_dragon.exe  ·  12.4 HRS', 60, 468);
  g.fillStyle = 'rgba(233,238,244,.4)'; g.font = '400 17px "JetBrains Mono", monospace';
  g.fillText('\u2715 START      \u25a2 OPTIONS      \u25cb BACK', 60, 522);
}
const tvTex = canvasTex(1024, 576, drawTV);
if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(() => {
    drawTV(tvTex.image.getContext('2d'), 1024, 576);
    tvTex.needsUpdate = true;
  });
