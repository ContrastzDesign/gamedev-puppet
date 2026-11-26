// Phone-hot story sets — densely dressed V1 booths.
// Living room, patio/AC, workshop, seal bay, phone interior, racetrack, studio, cabin.
// Signs stay fully inside frame; generic plain lettering only. No V2 look.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05, ...opts });
}

function box(parent, w, h, d, color, x, y, z, rx = 0, ry = 0, rz = 0, opts = {}) {
  const g = opts.round ? new RoundedBoxGeometry(w, h, d, 2, opts.round) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat(color, opts.mat));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  if (opts.noShadow) { m.castShadow = false; m.receiveShadow = false; }
  parent.add(m);
  return m;
}

function cyl(parent, rTop, rBot, h, color, x, y, z, rx = 0, ry = 0, rz = 0, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 16), mat(color, opts.mat));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function makeSign(text, w = 1.6, h = 0.45, bg = '#2a3228', fg = '#f0e6d0', border = '#c4a35a') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = border;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let px = 48;
  ctx.font = `bold ${px}px sans-serif`;
  while (px > 28 && ctx.measureText(text).width > 460) {
    px -= 2;
    ctx.font = `bold ${px}px sans-serif`;
  }
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  mesh.name = 'signMesh';
  mesh.userData.signText = text;
  mesh.userData.isSignOrScreen = true;
  return mesh;
}

function addUpperWallDressing(parent, zWall, x0, x1, y0 = 3.15) {
  const span = x1 - x0;
  box(parent, span, 0.07, 0.3, '#5a4030', (x0 + x1) / 2, y0, zWall + 0.02);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858', '#8a6a40', '#6a7a98'];
  const n = Math.max(6, Math.floor(span / 0.28));
  for (let i = 0; i < n; i++) {
    const x = x0 + 0.2 + (i / Math.max(1, n - 1)) * (span - 0.4);
    box(parent, 0.2, 0.28 + (i % 3) * 0.06, 0.2, cols[i % cols.length], x, y0 + 0.2, zWall + 0.08, 0, 0.05, 0, { round: 0.01 });
  }
  box(parent, span * 0.95, 0.22, 0.35, '#6a6a70', (x0 + x1) / 2, y0 + 0.55, zWall + 0.05);
  for (let i = 0; i < 5; i++) {
    const x = x0 + 0.3 + i * (span - 0.6) / 4;
    box(parent, 0.35, 0.05, 0.35, '#4a4a50', x, y0 + 0.4, zWall + 0.05);
  }
  addStringLights(parent, y0 + 0.35, zWall + 0.2, x0 + 0.15, x1 - 0.15, 12);
}

function addStringLights(parent, y, z, x0, x1, n = 10) {
  for (let i = 0; i < n; i++) {
    const x = x0 + (i / Math.max(1, n - 1)) * (x1 - x0);
    const bulb = cyl(parent, 0.04, 0.04, 0.08, '#f5e6c8', x, y, z, 0, 0, 0, {
      mat: { emissive: '#f5e6c8', emissiveIntensity: 0.6 },
      noShadow: true,
    });
    bulb.castShadow = false;
  }
}

function makePosterArt(seed, w = 0.7, h = 1.0) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  const pals = [
    ['#2c3a4a', '#6a8fbf', '#c4a35a'],
    ['#3a2e3a', '#a87890', '#7a9a78'],
    ['#2a3a32', '#5a9a88', '#d0b878'],
    ['#3a3028', '#c4785a', '#8a9ab8'],
  ];
  const pal = pals[seed % pals.length];
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, 256, 384);
  ctx.fillStyle = pal[1];
  if (seed % 2 === 0) {
    ctx.beginPath(); ctx.arc(128, 140, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal[2];
    ctx.fillRect(40, 240, 176, 28);
  } else {
    ctx.fillRect(30, 40, 196, 120);
    ctx.fillStyle = pal[2];
    for (let i = 0; i < 5; i++) ctx.fillRect(40 + i * 36, 190, 24, 120);
  }
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 368);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
}

function addPhoneProp(parent, tex, x, y, z, scale = 1, hot = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  box(g, 0.42, 0.78, 0.06, '#1c1c20', 0, 0, 0, 0, 0, 0, { round: 0.04 });
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.68),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0, 0.035);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  scr.userData.signText = 'PHONE';
  g.add(scr);
  if (hot) {
    const glow = new THREE.PointLight('#e08040', 0.9, 2.5, 2);
    glow.position.set(0, 0, 0.4);
    g.add(glow);
    box(g, 0.5, 0.9, 0.02, '#c45848', 0, 0, -0.04, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.25, emissive: '#c45848', emissiveIntensity: 0.5 },
      noShadow: true,
    });
  }
  parent.add(g);
  return g;
}

function addTv(parent, tex, x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  box(g, 1.7, 1.05, 0.12, '#1c1c20', 0, 0, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.15, 0.55, 0.12, '#2a2a2e', 0, -0.7, 0);
  box(g, 0.7, 0.08, 0.35, '#2a2a2e', 0, -1.0, 0.05);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 0.9),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0, 0.07);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  scr.userData.signText = 'TV';
  g.add(scr);
  const glow = new THREE.PointLight('#b8d4e8', 0.55, 5, 2);
  glow.position.set(0, 0.1, 0.5);
  g.add(glow);
  parent.add(g);
  return g;
}

function addMonitor(parent, tex, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.85, 0.55, 0.08, '#1c1c20', 0, 0.35, 0, 0, 0, 0, { round: 0.02 });
  box(g, 0.08, 0.25, 0.08, '#2a2a2e', 0, 0.05, 0);
  box(g, 0.35, 0.04, 0.22, '#2a2a2e', 0, -0.05, 0.05);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.48),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0.35, 0.05);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  scr.userData.signText = 'MONITOR';
  g.add(scr);
  parent.add(g);
  return g;
}

function addDesk(parent, x, y, z, w = 1.6) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, w, 0.08, 0.7, '#5a4030', 0, 0.72, 0);
  box(g, 0.08, 0.72, 0.08, '#4a3020', -w / 2 + 0.08, 0.36, -0.28);
  box(g, 0.08, 0.72, 0.08, '#4a3020', w / 2 - 0.08, 0.36, -0.28);
  box(g, 0.08, 0.72, 0.08, '#4a3020', -w / 2 + 0.08, 0.36, 0.28);
  box(g, 0.08, 0.72, 0.08, '#4a3020', w / 2 - 0.08, 0.36, 0.28);
  parent.add(g);
  return g;
}

function addChair(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.5, 0.08, 0.5, '#3a4858', 0, 0.45, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.5, 0.55, 0.08, '#3a4858', 0, 0.75, -0.22, 0, 0, 0, { round: 0.02 });
  cyl(g, 0.04, 0.04, 0.45, '#2a3038', 0, 0.22, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    cyl(g, 0.03, 0.03, 0.08, '#2a3038', Math.cos(a) * 0.22, 0.04, Math.sin(a) * 0.22, 0, 0, Math.PI / 2);
  }
  parent.add(g);
  return g;
}

function addCouch(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 2.4, 0.45, 1.0, '#6a5848', 0, 0.35, 0, 0, 0, 0, { round: 0.06 });
  box(g, 2.4, 0.55, 0.25, '#5a4838', 0, 0.75, -0.4, 0, 0, 0, { round: 0.05 });
  box(g, 0.25, 0.4, 0.9, '#5a4838', -1.1, 0.65, 0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.25, 0.4, 0.9, '#5a4838', 1.1, 0.65, 0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.7, 0.18, 0.4, '#8a4a48', -0.5, 0.6, 0.15, 0, 0, 0, { round: 0.04 });
  box(g, 0.7, 0.18, 0.4, '#4a6a78', 0.5, 0.6, 0.15, 0, 0, 0, { round: 0.04 });
  parent.add(g);
  return g;
}

function addRug(parent, x, y, z, w = 2.5, d = 1.8) {
  box(parent, w, 0.03, d, '#8a5a48', x, y + 0.02, z, 0, 0, 0, { round: 0.02 });
  box(parent, w * 0.85, 0.02, d * 0.75, '#c4a07a', x, y + 0.035, z);
}

function addLamp(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  cyl(g, 0.12, 0.15, 0.05, '#3a3a40', 0, 0.03, 0);
  cyl(g, 0.03, 0.03, 0.7, '#c4a35a', 0, 0.4, 0);
  cyl(g, 0.18, 0.22, 0.2, '#ebe4dc', 0, 0.85, 0, 0, 0, 0, { mat: { emissive: '#f5e6c8', emissiveIntensity: 0.35 } });
  const light = new THREE.PointLight('#f5e6c8', 0.6, 4, 2);
  light.position.set(0, 0.9, 0);
  g.add(light);
  parent.add(g);
  return g;
}

function addPlant(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  cyl(g, 0.12, 0.1, 0.25, '#c45848', 0, 0.12, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(g, 0.08, 0.45, 0.02, '#6b8f6a', Math.cos(a) * 0.08, 0.45, Math.sin(a) * 0.08, 0.3, a, 0);
  }
  parent.add(g);
  return g;
}

function addShelf(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.2, 1.8, 0.35, '#5a4030', 0, 0.9, 0);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858'];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 4; i++) {
      box(g, 0.18, 0.28, 0.2, cols[(row + i) % cols.length], -0.4 + i * 0.26, 0.4 + row * 0.5, 0.08, 0, 0.1, 0, { round: 0.02 });
    }
  }
  parent.add(g);
  return g;
}

function addWallShelf(parent, x, y, z, w = 1.6) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, w, 0.06, 0.28, '#5a4030', 0, 0, 0);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858', '#8a6a40'];
  const n = Math.floor(w / 0.22);
  for (let i = 0; i < n; i++) {
    box(g, 0.16, 0.26, 0.18, cols[i % cols.length], -w / 2 + 0.2 + i * 0.22, 0.16, 0.02, 0, 0.08, 0, { round: 0.015 });
  }
  parent.add(g);
  return g;
}

function addCeilingBeam(parent, x, y, z, w = 6) {
  box(parent, w, 0.18, 0.25, '#4a3020', x, y, z);
}

function addPegboard(parent, x, y, z, w = 2.2, h = 1.4) {
  box(parent, w, h, 0.05, '#8a6a48', x, y, z);
  const tools = ['#3a4048', '#c45848', '#4a8a98', '#c4a35a', '#6b8f6a'];
  for (let i = 0; i < 10; i++) {
    const tx = x - w / 2 + 0.25 + (i % 5) * 0.4;
    const ty = y + h / 2 - 0.25 - Math.floor(i / 5) * 0.55;
    box(parent, 0.08, 0.35, 0.08, tools[i % tools.length], tx, ty, z + 0.08);
    cyl(parent, 0.03, 0.03, 0.25, '#2a3038', tx + 0.15, ty - 0.05, z + 0.08, Math.PI / 2);
  }
}

function boothShell(floorCol = '#6a5848', wallCol = '#c8b8a0') {
  const g = new THREE.Group();
  box(g, 8, 0.08, 7, floorCol, 0, 0, 0);
  box(g, 8, 4.2, 0.15, wallCol, 0, 2.1, -3.2);
  box(g, 0.15, 4.2, 7, wallCol, -4, 2.1, 0);
  box(g, 0.15, 4.2, 7, wallCol, 4, 2.1, 0);
  box(g, 8, 0.15, 7, '#ebe4dc', 0, 4.15, 0);
  return g;
}

// ---- BOOTHS ----

function buildLiving(screens) {
  const g = boothShell('#7a6a58', '#d8c8b0');
  addRug(g, 0, 0, 0.6, 3.2, 2.2);
  addCouch(g, 0, 0, -1.4);
  addTv(g, screens.smooth, 0, 1.9, -3.05, 1.05);
  // phones on coffee table / side — keep clear of character torso
  addPhoneProp(g, screens.smooth, 1.35, 0.85, 0.55, 0.85, false);
  addPhoneProp(g, screens.slow, -1.35, 0.85, 0.55, 0.85, true);
  addLamp(g, -2.6, 0, -1.5);
  addLamp(g, 2.6, 0, -1.5);
  addShelf(g, -3.2, 0, -2.0);
  addShelf(g, 3.2, 0, -2.0);
  addPlant(g, -3.0, 0, 1.8);
  addPlant(g, 3.0, 0, 1.8);
  const p1 = makePosterArt(0, 0.75, 1.05);
  p1.position.set(-2.2, 2.4, -3.1);
  g.add(p1);
  const p2 = makePosterArt(1, 0.75, 1.05);
  p2.position.set(2.2, 2.4, -3.1);
  g.add(p2);
  // coffee table
  box(g, 1.2, 0.08, 0.7, '#5a4030', 0, 0.4, 0.5);
  box(g, 0.08, 0.4, 0.08, '#4a3020', -0.5, 0.2, 0.25);
  box(g, 0.08, 0.4, 0.08, '#4a3020', 0.5, 0.2, 0.25);
  box(g, 0.08, 0.4, 0.08, '#4a3020', -0.5, 0.2, 0.75);
  box(g, 0.08, 0.4, 0.08, '#4a3020', 0.5, 0.2, 0.75);
  cyl(g, 0.06, 0.05, 0.1, '#ebe4dc', -0.3, 0.5, 0.5);
  // game controllers
  box(g, 0.28, 0.06, 0.16, '#2a3038', 0.25, 0.46, 0.55, 0, 0.2, 0, { round: 0.02 });
  const hot = makeSign('TOO HOT', 1.0, 0.26, '#3a2020', '#e08040', '#c45848');
  hot.position.set(1.15, 2.5, -3.05);
  g.add(hot);
  const title = makeSign('PHONE GAME', 1.15, 0.28, '#2a3228', '#f0e6d0', '#c4a35a');
  title.position.set(-1.15, 2.5, -3.05);
  g.add(title);
  addWallShelf(g, 0, 3.3, -3.1, 5.5);
  addCeilingBeam(g, 0, 3.9, -1.5, 7.5);
  addCeilingBeam(g, 0, 3.9, 0.5, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.95);
  // thermometer prop for finale
  cyl(g, 0.06, 0.06, 0.55, '#ebe4dc', 1.4, 1.0, 1.0);
  cyl(g, 0.1, 0.1, 0.12, '#c45848', 1.4, 0.7, 1.0);
  const fl = new THREE.PointLight('#f5f0e0', 0.75, 9, 2);
  fl.position.set(0, 3.0, 0.5);
  g.add(fl);
  return g;
}

function buildPatio(screens) {
  const g = boothShell('#8a7a60', '#c8d8e0');
  // sunny floor tiles
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.9, 0.04, 0.9, (i + j) % 2 === 0 ? '#c4b090' : '#b0a080', i, 0.04, j);
    }
  }
  // big window / AC unit on back wall
  box(g, 3.5, 2.2, 0.1, '#8ab0c8', 0, 2.2, -3.1, 0, 0, 0, {
    mat: { transparent: true, opacity: 0.45, emissive: '#8ab0c8', emissiveIntensity: 0.3 },
  });
  box(g, 1.4, 0.7, 0.5, '#ebe4dc', 0, 2.8, -2.85, 0, 0, 0, { round: 0.04 });
  box(g, 1.2, 0.15, 0.35, '#4a8a98', 0, 2.8, -2.6);
  // louvers
  for (let i = 0; i < 5; i++) {
    box(g, 1.15, 0.04, 0.3, '#6a9ab0', 0, 2.65 + i * 0.08, -2.55);
  }
  const ac = makeSign('COOL AIR', 1.0, 0.26, '#1a3040', '#8ab0c8', '#4a8a98');
  ac.position.set(0, 3.25, -2.7);
  g.add(ac);
  addPhoneProp(g, screens.slow, 1.1, 1.0, 0.4, 0.95, true);
  // outdoor furniture
  box(g, 1.6, 0.4, 0.7, '#6a8f6a', -1.5, 0.35, 0.8, 0, 0, 0, { round: 0.05 });
  box(g, 0.6, 0.55, 0.6, '#5a7f5a', 1.5, 0.4, 0.5, 0, 0, 0, { round: 0.05 });
  addPlant(g, -3.0, 0, -2.0);
  addPlant(g, 3.0, 0, -2.0);
  addPlant(g, -2.5, 0, 2.0);
  addPlant(g, 2.5, 0, 2.0);
  // sun umbrella
  cyl(g, 0.04, 0.04, 2.2, '#c4a35a', 2.0, 1.1, -1.0);
  cyl(g, 0.9, 0.05, 0.08, '#c45848', 2.0, 2.2, -1.0);
  const hot = makeSign('STILL HOT', 1.05, 0.28, '#3a2020', '#e08040', '#c45848');
  hot.position.set(-1.2, 2.55, -3.05);
  g.add(hot);
  // side planters + drink table so edges aren't bare
  box(g, 0.7, 0.08, 0.7, '#8a6a40', -2.4, 0.45, -0.5);
  cyl(g, 0.08, 0.06, 0.2, '#ebe4dc', -2.4, 0.6, -0.5);
  box(g, 0.7, 0.08, 0.7, '#8a6a40', 2.4, 0.45, -0.5);
  addWallShelf(g, 0, 3.5, -3.1, 4);
  addCeilingBeam(g, 0, 3.95, -1, 7);
  // sky light feel
  const sun = new THREE.PointLight('#fff0d0', 1.1, 12, 2);
  sun.position.set(0, 3.5, 1);
  g.add(sun);
  return g;
}

function buildWorkshop(screens) {
  const g = boothShell('#6a6050', '#b8a888');
  addPegboard(g, 0, 2.4, -3.1, 3.5, 1.6);
  addDesk(g, 0, 0, -1.5, 2.2);
  addMonitor(g, screens.blueprint, -0.6, 0.72, -1.55);
  addPhoneProp(g, screens.smooth, 0.7, 1.15, -1.35, 0.9, false);
  // tiny fan bolted to phone
  cyl(g, 0.12, 0.12, 0.06, '#6a7a88', 0.95, 1.35, -1.2);
  cyl(g, 0.02, 0.02, 0.15, '#4a5a68', 0.95, 1.25, -1.2);
  box(g, 0.2, 0.04, 0.12, '#3a4a58', 0.95, 1.15, -1.2);
  addChair(g, 0.2, 0, -0.6);
  // spare parts crates
  for (let i = 0; i < 4; i++) {
    box(g, 0.45, 0.35, 0.4, '#8a6a40', -3.0 + i * 0.15, 0.2 + (i % 2) * 0.35, 1.5 + i * 0.05, 0, 0.1, 0, { round: 0.02 });
  }
  // fans on shelf
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.2, 0.2, 0.08, '#6a7a88', 2.5, 1.2 + i * 0.5, -2.5);
    box(g, 0.08, 0.3, 0.08, '#4a5a68', 2.5, 1.0 + i * 0.5, -2.5);
  }
  // water puddle + dust cloud props (side)
  box(g, 1.2, 0.02, 0.9, '#4a8a98', -2.0, 0.05, 1.2, 0, 0, 0, {
    mat: { transparent: true, opacity: 0.55 },
  });
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.08, 0.12, 0.15, '#c4b090', 2.0 + (i % 3) * 0.2, 0.2 + Math.floor(i / 3) * 0.15, 1.0 + (i % 2) * 0.25, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.45 },
      noShadow: true,
    });
  }
  const fanSign = makeSign('ADD A FAN?', 1.2, 0.3, '#2a3228', '#e0c070', '#c4a35a');
  fanSign.position.set(-1.15, 2.55, -3.05);
  g.add(fanSign);
  const holes = makeSign('AIR HOLES', 1.1, 0.28, '#3a2020', '#f0e6d0', '#c45848');
  holes.position.set(1.15, 2.55, -3.05);
  g.add(holes);
  addLamp(g, -3.0, 0, -1.0);
  addLamp(g, 3.0, 0, 0.5);
  addPlant(g, -3.2, 0, 2.2);
  addWallShelf(g, 0, 3.4, -3.1, 5);
  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.9);
  const fl = new THREE.PointLight('#f0e8d0', 0.8, 10, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildSeal(screens) {
  const g = boothShell('#5a5a60', '#8a9098');
  // factory floor stripes
  box(g, 7.5, 0.05, 0.4, '#c4a35a', 0, 0.05, 0);
  box(g, 7.5, 0.05, 0.4, '#c4a35a', 0, 0.05, 1.5);
  // sealing press
  box(g, 1.6, 1.8, 1.0, '#4a5058', 0, 0.9, -1.8, 0, 0, 0, { round: 0.04 });
  box(g, 1.2, 0.3, 0.8, '#3a4048', 0, 1.8, -1.8);
  box(g, 0.9, 0.15, 0.6, '#c45848', 0, 1.4, -1.5, 0, 0, 0, {
    mat: { emissive: '#c45848', emissiveIntensity: 0.25 },
  });
  addPhoneProp(g, screens.circuit, 0, 1.15, -1.3, 1.0, true);
  // big WATERPROOF gasket ring
  const gasket = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.08, 12, 32),
    mat('#4a8a98', { metalness: 0.3, roughness: 0.4 }),
  );
  gasket.position.set(0, 1.2, -1.0);
  gasket.rotation.x = Math.PI / 2;
  g.add(gasket);
  const wp = makeSign('WATERPROOF', 1.35, 0.32, '#1a3040', '#8ab0c8', '#4a8a98');
  wp.position.set(0, 2.55, -3.05);
  g.add(wp);
  // conveyor of sealed phones
  for (let i = 0; i < 5; i++) {
    box(g, 0.35, 0.55, 0.08, '#2a3038', -2.5 + i * 0.7, 0.7, 0.8, 0, 0.1, 0, { round: 0.02 });
  }
  box(g, 4.0, 0.12, 0.6, '#3a3a40', -0.5, 0.4, 0.8);
  addShelf(g, -3.3, 0, -2.0);
  addShelf(g, 3.3, 0, -2.0);
  // side tooling carts so midground isn't empty grey
  box(g, 0.9, 1.1, 0.55, '#5a6068', -2.8, 0.55, -0.6, 0, 0, 0, { round: 0.03 });
  box(g, 0.9, 1.1, 0.55, '#5a6068', 2.8, 0.55, -0.6, 0, 0, 0, { round: 0.03 });
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.08, 0.08, 0.25, '#c4a35a', -2.8, 1.2 + i * 0.15, -0.4);
    cyl(g, 0.08, 0.08, 0.25, '#4a8a98', 2.8, 1.2 + i * 0.15, -0.4);
  }
  // caution cones
  for (const x of [-2.2, 2.2]) {
    cyl(g, 0.02, 0.18, 0.45, '#c47838', x, 0.25, 1.6);
  }
  const sealed = makeSign('SEALED SHUT', 1.15, 0.28, '#2a3228', '#f0e6d0', '#c4a35a');
  sealed.position.set(-1.2, 2.95, -3.05);
  g.add(sealed);
  // wall posters / gauges
  box(g, 0.7, 0.7, 0.04, '#2a3038', 1.4, 2.3, -3.1);
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.06, 0.06, 0.02, i % 2 ? '#6b8f6a' : '#c45848', 1.2 + (i % 2) * 0.35, 2.15 + Math.floor(i / 2) * 0.3, -3.05);
  }
  addCeilingBeam(g, 0, 3.95, -1, 7.5);
  addCeilingBeam(g, 0, 3.95, 1, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.95);
  const fl = new THREE.PointLight('#e8e8f0', 0.85, 10, 2);
  fl.position.set(0, 3.2, 0);
  g.add(fl);
  return g;
}

function buildInterior(screens) {
  const g = new THREE.Group();
  // circuit board city floor
  box(g, 8, 0.08, 7, '#0e1814', 0, 0, 0);
  box(g, 8, 4.2, 0.15, '#1a2820', 0, 2.1, -3.2);
  box(g, 0.15, 4.2, 7, '#1a2820', -4, 2.1, 0);
  box(g, 0.15, 4.2, 7, '#1a2820', 4, 2.1, 0);
  // PCB traces as raised strips
  for (let i = -3; i <= 3; i++) {
    box(g, 0.12, 0.04, 6, '#2a5840', i * 1.1, 0.06, 0);
    box(g, 6, 0.04, 0.12, '#2a5840', 0, 0.06, i * 0.9);
  }
  // chip towers / capacitors
  for (let i = 0; i < 12; i++) {
    const x = -3 + (i % 4) * 1.8;
    const z = -2.2 + Math.floor(i / 4) * 1.5;
    box(g, 0.7, 0.35 + (i % 3) * 0.2, 0.5, '#3a4850', x, 0.3, z, 0, 0, 0, { round: 0.02 });
    for (let p = 0; p < 4; p++) {
      box(g, 0.06, 0.12, 0.04, '#c4a35a', x - 0.25 + p * 0.16, 0.06, z + 0.28);
    }
  }
  // central glowing battery / heat core
  box(g, 1.4, 0.9, 0.5, '#2a3038', 0, 0.5, -0.5, 0, 0, 0, { round: 0.04 });
  box(g, 1.2, 0.7, 0.35, '#c45848', 0, 0.5, -0.35, 0, 0, 0, {
    mat: { emissive: '#c45848', emissiveIntensity: 0.6 },
  });
  const heat = new THREE.PointLight('#e08040', 1.4, 8, 2);
  heat.position.set(0, 1.2, 0);
  g.add(heat);
  addTv(g, screens.circuit, 0, 2.2, -3.05, 0.9);
  const nowhere = makeSign('NOWHERE TO GO', 1.35, 0.3, '#3a2020', '#e08040', '#c45848');
  nowhere.position.set(0, 2.9, -3.05);
  g.add(nowhere);
  // more chip towers near camera so floor isn't empty
  for (let i = 0; i < 6; i++) {
    box(g, 0.45, 0.25, 0.35, '#3a4850', -2.5 + i * 0.9, 0.2, 1.8, 0, 0, 0, { round: 0.02 });
  }
  // sealed outer shell walls hint
  box(g, 7.5, 0.3, 0.2, '#4a8a98', 0, 3.7, -3.0);
  box(g, 0.2, 0.3, 6, '#4a8a98', -3.7, 3.7, 0);
  box(g, 0.2, 0.3, 6, '#4a8a98', 3.7, 3.7, 0);
  addCeilingBeam(g, 0, 3.95, -1, 7);
  addCeilingBeam(g, 0, 3.95, 1, 7);
  return g;
}

function buildRacetrack(screens) {
  const g = new THREE.Group();
  box(g, 8, 0.08, 7, '#0e1814', 0, 0, 0);
  box(g, 8, 4.2, 0.15, '#1a2820', 0, 2.1, -3.2);
  box(g, 0.15, 4.2, 7, '#1a2820', -4, 2.1, 0);
  box(g, 0.15, 4.2, 7, '#1a2820', 4, 2.1, 0);
  // oval track
  const track = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.35, 12, 48),
    mat('#2a5840'),
  );
  track.rotation.x = Math.PI / 2;
  track.position.set(0, 0.08, -0.3);
  track.receiveShadow = true;
  g.add(track);
  // lane lines
  const lane = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.04, 8, 48),
    mat('#e0c070'),
  );
  lane.rotation.x = Math.PI / 2;
  lane.position.set(0, 0.12, -0.3);
  g.add(lane);
  // SAFE MODE billboard — fully in frame
  const safe = makeSign('SAFE MODE', 1.25, 0.36, '#c45848', '#f0e6d0', '#e0c070');
  safe.position.set(0, 1.75, -2.8);
  g.add(safe);
  const thr = makeSign('THERMAL THROTTLING', 1.45, 0.3, '#2a3228', '#e0c070', '#c4a35a');
  thr.position.set(0, 2.3, -2.8);
  g.add(thr);
  addTv(g, screens.racetrack, 0, 2.95, -3.05, 0.65);
  // fill upper band with PCB shelves
  addWallShelf(g, 0, 3.55, -3.1, 5.5);
  for (let i = 0; i < 8; i++) {
    box(g, 0.35, 0.2, 0.25, '#3a4850', -3.2 + i * 0.9, 3.75, -2.9, 0, 0, 0, { round: 0.01 });
  }
  // bleachers / chip stands
  for (let i = 0; i < 6; i++) {
    box(g, 0.5, 0.3 + i * 0.08, 0.4, '#3a4850', -3.2, 0.2 + i * 0.05, -1.5 + i * 0.4, 0, 0, 0, { round: 0.02 });
    box(g, 0.5, 0.3 + i * 0.08, 0.4, '#3a4850', 3.2, 0.2 + i * 0.05, -1.5 + i * 0.4, 0, 0, 0, { round: 0.02 });
  }
  // finish flags
  box(g, 0.08, 1.2, 0.08, '#ebe4dc', -1.5, 0.7, 1.5);
  box(g, 0.08, 1.2, 0.08, '#ebe4dc', 1.5, 0.7, 1.5);
  box(g, 3.2, 0.25, 0.05, '#2a3038', 0, 1.3, 1.5);
  for (let i = 0; i < 8; i++) {
    box(g, 0.35, 0.22, 0.04, i % 2 ? '#f0e6d0' : '#1a1a1a', -1.3 + i * 0.38, 1.3, 1.52);
  }
  const glow = new THREE.PointLight('#6b8f6a', 0.9, 10, 2);
  glow.position.set(0, 2.5, 0);
  g.add(glow);
  addCeilingBeam(g, 0, 3.95, -1, 7);
  return g;
}

function buildStudio(screens) {
  const g = boothShell('#5a5048', '#c0b0a0');
  addDesk(g, 0, 0, -1.6, 2.4);
  addMonitor(g, screens.sliders, -0.55, 0.72, -1.65);
  addMonitor(g, screens.worse, 0.65, 0.72, -1.65, -0.15);
  addPhoneProp(g, screens.worse, 1.3, 1.1, -1.3, 0.85, true);
  addChair(g, 0, 0, -0.7);
  // second desk
  addDesk(g, -2.5, 0, -0.5, 1.4);
  addMonitor(g, screens.smooth, -2.5, 0.72, -0.55);
  addChair(g, -2.5, 0, 0.3);
  addDesk(g, 2.5, 0, -0.5, 1.4);
  addMonitor(g, screens.temp, 2.5, 0.72, -0.55);
  addChair(g, 2.5, 0, 0.3);
  // sticky notes wall
  const cols = ['#e0c070', '#c45848', '#6b8f6a', '#4a8a98', '#a87890'];
  for (let i = 0; i < 15; i++) {
    box(g, 0.22, 0.22, 0.02, cols[i % cols.length], -2.5 + (i % 5) * 0.35, 2.2 + Math.floor(i / 5) * 0.3, -3.1);
  }
  const cut = makeSign('CUT GRAPHICS', 1.2, 0.28, '#3a2020', '#f0e6d0', '#c45848');
  cut.position.set(1.15, 2.55, -3.05);
  g.add(cut);
  const fps = makeSign('LOWER FPS', 1.1, 0.28, '#2a3228', '#e0c070', '#c4a35a');
  fps.position.set(-1.15, 2.55, -3.05);
  g.add(fps);
  addShelf(g, -3.3, 0, -2.2);
  addPlant(g, 3.2, 0, 1.8);
  addPlant(g, -3.2, 0, 1.8);
  addLamp(g, 3.0, 0, -1.5);
  addLamp(g, -3.0, 0, 1.0);
  // pizza / energy drinks
  box(g, 0.5, 0.05, 0.5, '#ebe4dc', 1.0, 0.78, -1.4);
  cyl(g, 0.05, 0.05, 0.18, '#4a8a98', -1.0, 0.85, -1.35);
  addWallShelf(g, 0, 3.35, -3.1, 5.5);
  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.6, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.9);
  const fl = new THREE.PointLight('#f0e8d8', 0.8, 10, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildCabin(screens) {
  const g = boothShell('#6a5040', '#8a6a50');
  // wood plank floor
  for (let i = -3; i <= 3; i++) {
    box(g, 0.95, 0.06, 6.5, i % 2 ? '#5a4030' : '#6a5040', i, 0.04, 0);
  }
  // fireplace
  box(g, 1.6, 1.8, 0.6, '#4a3a30', 0, 0.9, -2.9, 0, 0, 0, { round: 0.04 });
  box(g, 1.0, 0.9, 0.4, '#1a1210', 0, 0.55, -2.7);
  box(g, 0.7, 0.5, 0.2, '#c45848', 0, 0.4, -2.55, 0, 0, 0, {
    mat: { emissive: '#c45848', emissiveIntensity: 0.7 },
  });
  const fire = new THREE.PointLight('#e08040', 1.2, 7, 2);
  fire.position.set(0, 0.8, -2.2);
  g.add(fire);
  // mantel phone as hand warmer
  addPhoneProp(g, screens.appstore, 0, 1.85, -2.55, 1.0, true);
  // cozy chairs
  box(g, 0.9, 0.5, 0.9, '#8a4a48', -1.8, 0.4, 0.2, 0, 0.3, 0, { round: 0.06 });
  box(g, 0.9, 0.5, 0.9, '#4a6a78', 1.8, 0.4, 0.2, 0, -0.3, 0, { round: 0.06 });
  addRug(g, 0, 0, 0.5, 2.8, 2.0);
  // snow window
  box(g, 1.8, 1.4, 0.08, '#d0e0e8', -2.5, 2.3, -3.1, 0, 0, 0, {
    mat: { emissive: '#d0e0e8', emissiveIntensity: 0.25 },
  });
  box(g, 1.8, 1.4, 0.08, '#d0e0e8', 2.5, 2.3, -3.1, 0, 0, 0, {
    mat: { emissive: '#d0e0e8', emissiveIntensity: 0.25 },
  });
  // snow drifts on sill
  box(g, 1.9, 0.12, 0.25, '#f0f4f8', -2.5, 1.55, -3.0);
  box(g, 1.9, 0.12, 0.25, '#f0f4f8', 2.5, 1.55, -3.0);
  const warm = makeSign('HAND WARMER', 1.25, 0.3, '#3a2020', '#e08040', '#c45848');
  warm.position.set(0, 2.7, -3.05);
  g.add(warm);
  const apps = makeSign('APP STORE', 1.1, 0.26, '#2a3228', '#f0e6d0', '#c4a35a');
  apps.position.set(1.15, 2.35, -3.05);
  g.add(apps);
  // side wood stacks + kettle so cabin reads cosy
  box(g, 0.6, 0.5, 0.4, '#5a4030', -2.6, 0.3, 1.2);
  box(g, 0.5, 0.35, 0.35, '#6a5040', -2.5, 0.7, 1.2);
  cyl(g, 0.12, 0.1, 0.25, '#3a3a40', 2.4, 0.9, -1.8);
  cyl(g, 0.04, 0.04, 0.2, '#2a2a30', 2.4, 1.1, -1.8);
  addShelf(g, -3.3, 0, -1.5);
  addLamp(g, 3.0, 0, -1.0);
  addPlant(g, 3.2, 0, 1.8);
  // hanging socks / mittens
  box(g, 0.2, 0.35, 0.08, '#c45848', -1.0, 2.0, -2.85);
  box(g, 0.2, 0.35, 0.08, '#4a6a78', 1.0, 2.0, -2.85);
  addWallShelf(g, 0, 3.55, -3.1, 3.5);
  addCeilingBeam(g, 0, 3.95, -1.2, 7);
  addCeilingBeam(g, 0, 3.95, 0.8, 7);
  addUpperWallDressing(g, -3.1, -3.2, 3.2, 3.0);
  return g;
}

export function buildRoom(screens) {
  const root = new THREE.Group();
  const booths = {};
  const boothMeta = {};

  const specs = [
    { id: 'living', build: () => buildLiving(screens), x: 0, z: 0 },
    { id: 'patio', build: () => buildPatio(screens), x: 20, z: 0 },
    { id: 'workshop', build: () => buildWorkshop(screens), x: 40, z: 0 },
    { id: 'seal', build: () => buildSeal(screens), x: 60, z: 0 },
    { id: 'interior', build: () => buildInterior(screens), x: 80, z: 0 },
    { id: 'racetrack', build: () => buildRacetrack(screens), x: 100, z: 0 },
    { id: 'studio', build: () => buildStudio(screens), x: 120, z: 0 },
    { id: 'cabin', build: () => buildCabin(screens), x: 140, z: 0 },
  ];

  for (const s of specs) {
    const b = s.build();
    b.position.set(s.x, 0, s.z);
    root.add(b);
    booths[s.id] = b;
    boothMeta[s.id] = { x: s.x, z: s.z, id: s.id };
  }

  const shadowCatch = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }),
  );
  shadowCatch.rotation.x = -Math.PI / 2;
  shadowCatch.position.y = 0.04;
  shadowCatch.name = 'shadowCatch';
  root.add(shadowCatch);

  return { root, booths, boothMeta, shadowCatch };
}
