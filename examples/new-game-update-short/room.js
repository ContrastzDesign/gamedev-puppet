// Disc-update story sets for the new-game-update Short (V1).
// Booths: gamer bedroom (TV download), disc-press factory, game studio,
// certification office, bedroom coaster gag. Generic plain-lettering signs only.
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
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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

function addConsole(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.55, 0.12, 0.4, '#3a3a40', 0, 0.06, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.5, 0.04, 0.35, '#2a2a30', 0, 0.13, 0);
  cyl(g, 0.03, 0.03, 0.02, '#6b8f6a', -0.15, 0.15, 0.12);
  cyl(g, 0.03, 0.03, 0.02, '#c45848', -0.05, 0.15, 0.12);
  parent.add(g);
  return g;
}

function addBed(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 2.2, 0.35, 1.4, '#5a4030', 0, 0.25, 0, 0, 0, 0, { round: 0.05 });
  box(g, 2.15, 0.2, 1.35, '#6a8fbf', 0, 0.48, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.7, 0.25, 1.2, '#ebe4dc', -0.7, 0.65, 0, 0, 0, 0, { round: 0.05 });
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

function addConveyor(parent, x, y, z, len = 4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, len, 0.15, 0.7, '#3a3a40', 0, 0.55, 0);
  box(g, len, 0.08, 0.75, '#2a2a30', 0, 0.65, 0);
  // rollers
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.06, 0.06, 0.72, '#5a5a60', -len / 2 + 0.3 + i * (len / 8), 0.58, 0, Math.PI / 2, 0, 0);
  }
  // disc spindles on belt
  for (let i = 0; i < 5; i++) {
    cyl(g, 0.12, 0.12, 0.25, '#4a8a98', -len / 2 + 0.6 + i * 0.7, 0.85, 0);
    cyl(g, 0.04, 0.04, 0.28, '#c4a35a', -len / 2 + 0.6 + i * 0.7, 0.86, 0);
  }
  // legs
  box(g, 0.08, 0.55, 0.08, '#2a2a30', -len / 2 + 0.2, 0.28, -0.3);
  box(g, 0.08, 0.55, 0.08, '#2a2a30', len / 2 - 0.2, 0.28, -0.3);
  box(g, 0.08, 0.55, 0.08, '#2a2a30', -len / 2 + 0.2, 0.28, 0.3);
  box(g, 0.08, 0.55, 0.08, '#2a2a30', len / 2 - 0.2, 0.28, 0.3);
  parent.add(g);
  return g;
}

function addCrate(parent, x, y, z, label = 'SHIP') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.7, 0.55, 0.55, '#8a6a40', 0, 0.28, 0, 0, 0, 0, { round: 0.02 });
  const tag = makeSign(label, 0.5, 0.2, '#ebe4dc', '#2a2118', '#c45848');
  tag.position.set(0, 0.35, 0.28);
  g.add(tag);
  parent.add(g);
  return g;
}

function addCalendar(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.7, 0.9, 0.04, '#f4f0ea', 0, 0, 0);
  box(g, 0.7, 0.18, 0.05, '#c45848', 0, 0.36, 0.01);
  // crossed weeks
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = box(g, 0.12, 0.12, 0.02, row < 2 ? '#c45848' : '#6b8f6a', -0.22 + col * 0.15, 0.1 - row * 0.18, 0.02);
      if (row < 2) {
        // X mark via thin boxes
        box(g, 0.1, 0.02, 0.01, '#2a2118', -0.22 + col * 0.15, 0.1 - row * 0.18, 0.035, 0, 0, 0.7);
      }
    }
  }
  parent.add(g);
  return g;
}

function addPressMachine(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.2, 1.6, 0.9, '#4a5058', 0, 0.8, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.9, 0.4, 0.7, '#3a4048', 0, 1.5, 0);
  cyl(g, 0.25, 0.25, 0.15, '#c4a35a', 0, 1.1, 0.4);
  cyl(g, 0.08, 0.08, 0.5, '#2a3038', 0, 1.2, 0.4);
  const light = new THREE.PointLight('#c4a35a', 0.4, 3, 2);
  light.position.set(0, 1.4, 0.6);
  g.add(light);
  parent.add(g);
  return g;
}

function roomShell(parent, w, d, wallColor, floorColor) {
  box(parent, w, 0.08, d, floorColor, 0, 0, 0);
  box(parent, w, 3.2, 0.12, wallColor, 0, 1.6, -d / 2);
  box(parent, 0.12, 3.2, d, wallColor, -w / 2, 1.6, 0);
  box(parent, 0.12, 3.2, d, wallColor, w / 2, 1.6, 0);
  // ceiling strip
  box(parent, w, 0.08, d, '#d8d0c8', 0, 3.2, 0, 0, 0, 0, { noShadow: true });
}

function buildBedroom(screens, mode = 'download') {
  const g = new THREE.Group();
  g.name = mode === 'coaster' ? 'coaster' : 'bedroom';
  roomShell(g, 7, 6, '#5a6a78', '#3a3028');
  // rug
  box(g, 3.2, 0.04, 2.4, '#6a4050', 0.2, 0.04, 0.6, 0, 0, 0, { round: 0.05 });
  addBed(g, -2.0, 0, -1.5);
  addDesk(g, 1.4, 0, -1.8, 1.8);
  addShelf(g, -2.4, 0, 1.5);
  addLamp(g, 2.4, 0, -1.5);
  addPlant(g, 2.5, 0, 1.8);
  addConsole(g, 0.6, 0.72, -1.9);
  // TV on wall — download or title depending
  const tvTex = mode === 'coaster' ? screens.title : screens.download;
  addTv(g, tvTex, 0.3, 1.85, -2.85, 1.05);
  // posters high on wall (above caption band)
  const p1 = makePosterArt(1);
  p1.position.set(-2.2, 2.3, -2.9);
  g.add(p1);
  const p2 = makePosterArt(2);
  p2.position.set(2.2, 2.3, -2.9);
  g.add(p2);
  const sign = makeSign(mode === 'coaster' ? 'COASTER MODE' : 'GAMER DEN', 1.8, 0.4, '#2a3848', '#f0e6d0', '#4a8a98');
  sign.position.set(0.3, 2.75, -2.88);
  g.add(sign);
  // snack table / coaster setup
  box(g, 0.7, 0.55, 0.7, '#5a4030', 1.5, 0.28, 1.0, 0, 0, 0, { round: 0.04 });
  if (mode === 'coaster') {
    // oversized disc coaster + soda can on side table (readable gag)
    cyl(g, 0.22, 0.22, 0.03, '#4a8a98', 1.5, 0.58, 1.0);
    cyl(g, 0.18, 0.18, 0.02, '#6aa8b8', 1.5, 0.6, 1.0);
    cyl(g, 0.05, 0.05, 0.02, '#c4a35a', 1.5, 0.61, 1.0);
    cyl(g, 0.07, 0.08, 0.22, '#c45848', 1.5, 0.73, 1.0);
    cyl(g, 0.06, 0.06, 0.03, '#d46858', 1.5, 0.85, 1.0);
  } else {
    // sealed game cases on table
    box(g, 0.18, 0.28, 0.04, '#3a4858', 1.35, 0.7, 1.0, 0, 0.2, 0, { round: 0.01 });
    box(g, 0.18, 0.28, 0.04, '#4a5868', 1.55, 0.7, 1.05, 0, -0.15, 0, { round: 0.01 });
  }
  // beanbag
  box(g, 0.9, 0.45, 0.9, '#c45848', -1.2, 0.25, 1.2, 0, 0.3, 0, { round: 0.2 });
  // string lights
  for (let i = 0; i < 8; i++) {
    const lx = -2.5 + i * 0.7;
    cyl(g, 0.03, 0.03, 0.06, '#e0c070', lx, 2.9, -2.7, 0, 0, 0, { mat: { emissive: '#e0c070', emissiveIntensity: 1.2 } });
  }
  return g;
}

function buildFactory(screens) {
  const g = new THREE.Group();
  g.name = 'factory';
  roomShell(g, 9, 7, '#5a5a60', '#3a3a40');
  // industrial floor stripes
  for (let i = 0; i < 5; i++) {
    box(g, 0.25, 0.02, 5, '#c4a35a', -3 + i * 1.5, 0.05, 0);
  }
  addConveyor(g, 0, 0, -1.0, 5.5);
  addPressMachine(g, -2.2, 0, -1.0);
  addCrate(g, 2.2, 0, 0.8, 'SHIP');
  addCrate(g, 3.0, 0, 0.5, 'DISC');
  addCrate(g, 2.5, 0, 1.5, 'PACK');
  addCrate(g, -3.2, 0, 1.2, 'RAW');
  // stacked spindles visible behind character aisle
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      cyl(g, 0.15, 0.15, 0.35, '#4a8a98', -3.4 + i * 0.4, 0.2 + j * 0.35, 1.6);
    }
  }
  addCalendar(g, 2.6, 2.0, -3.3);
  addMonitor(g, screens.factory, 2.8, 0.9, -2.4, -0.35);
  // spare disc tower mid-right
  for (let j = 0; j < 5; j++) {
    cyl(g, 0.18, 0.18, 0.08, '#6aa8b8', 1.6, 0.1 + j * 0.09, 1.3);
  }
  const sign = makeSign('DISC PRESS', 2.2, 0.5, '#2a3038', '#e0c070', '#c4a35a');
  sign.position.set(0, 2.8, -3.35);
  g.add(sign);
  // warning cones
  for (const cx of [-1.5, 1.5]) {
    cyl(g, 0.01, 0.18, 0.45, '#c4a35a', cx, 0.22, 1.5);
  }
  // overhead lamps
  for (const lx of [-2, 0, 2]) {
    box(g, 0.8, 0.08, 0.3, '#2a2a30', lx, 3.0, 0);
    const pl = new THREE.PointLight('#f0e8d0', 0.5, 6, 2);
    pl.position.set(lx, 2.7, 0);
    g.add(pl);
  }
  // wall pipes
  cyl(g, 0.08, 0.08, 4, '#6a6a70', -4.3, 2.2, 0, 0, 0, Math.PI / 2);
  cyl(g, 0.08, 0.08, 3, '#6a6a70', 4.3, 1.8, -1, 0, 0, Math.PI / 2);
  return g;
}

function buildStudio(screens) {
  const g = new THREE.Group();
  g.name = 'studio';
  roomShell(g, 8, 6.5, '#4a5560', '#3a342c');
  // desks row
  addDesk(g, -2.0, 0, -1.8, 1.5);
  addDesk(g, 0.3, 0, -1.8, 1.5);
  addDesk(g, 2.4, 0, -1.8, 1.5);
  addMonitor(g, screens.bugs, -2.0, 0.72, -1.9);
  addMonitor(g, screens.gold, 0.3, 0.72, -1.9);
  addMonitor(g, screens.bugs, 2.4, 0.72, -1.9);
  // chairs
  for (const cx of [-2.0, 0.3, 2.4]) {
    box(g, 0.5, 0.1, 0.5, '#2a3038', cx, 0.45, -0.7, 0, 0, 0, { round: 0.05 });
    box(g, 0.5, 0.55, 0.08, '#2a3038', cx, 0.75, -0.9, 0, 0, 0, { round: 0.03 });
  }
  // launch countdown board (high)
  const board = makeSign('LAUNCH IN 4 DAYS', 2.4, 0.55, '#1a2228', '#e8d080', '#c45848');
  board.position.set(0, 2.7, -3.1);
  g.add(board);
  const goldSign = makeSign('GOLD MASTER', 1.6, 0.4, '#2a2418', '#e0c070', '#c4a35a');
  goldSign.position.set(-2.2, 2.7, -3.1);
  g.add(goldSign);
  // sticky-note wall
  const colors = ['#e8d080', '#c45848', '#6b8f6a', '#4a8a98', '#a87890'];
  for (let i = 0; i < 12; i++) {
    box(g, 0.22, 0.22, 0.02, colors[i % colors.length], 2.5 + (i % 3) * 0.28, 1.6 + Math.floor(i / 3) * 0.3, -3.1);
  }
  addPlant(g, -3.2, 0, 2.0);
  addLamp(g, 3.2, 0, 1.8);
  // coffee cups
  cyl(g, 0.05, 0.06, 0.12, '#ebe4dc', -1.5, 0.82, -1.6);
  cyl(g, 0.05, 0.06, 0.12, '#ebe4dc', 0.8, 0.82, -1.6);
  // server rack
  box(g, 0.7, 1.8, 0.5, '#2a3038', -3.3, 0.9, -1.5);
  for (let i = 0; i < 6; i++) {
    box(g, 0.6, 0.12, 0.4, '#1a2028', -3.3, 0.3 + i * 0.28, -1.45);
    cyl(g, 0.02, 0.02, 0.02, i % 2 ? '#6b8f6a' : '#c45848', -3.05, 0.3 + i * 0.28, -1.25);
  }
  return g;
}

function buildCert(screens) {
  const g = new THREE.Group();
  g.name = 'cert';
  roomShell(g, 7, 6, '#5a5850', '#4a443c');
  addDesk(g, 0, 0, -1.5, 2.2);
  addMonitor(g, screens.cert, 0, 0.72, -1.6);
  // checklist wall board (high)
  const check = makeSign('RULE CHECK', 1.8, 0.45, '#1a2228', '#f0e6d0', '#c45848');
  check.position.set(0, 2.75, -2.85);
  g.add(check);
  const rej = makeSign('REJECTED', 1.4, 0.4, '#3a1818', '#c45848', '#e0c070');
  rej.position.set(2.0, 2.3, -2.85);
  g.add(rej);
  // stamp desk props
  box(g, 0.25, 0.15, 0.25, '#c45848', 0.7, 0.85, -1.4);
  box(g, 0.35, 0.05, 0.45, '#d8c8a0', -0.7, 0.78, -1.35);
  // filing cabinets
  for (const fx of [-2.5, 2.5]) {
    box(g, 0.8, 1.4, 0.55, '#6a6a70', fx, 0.7, 1.5, 0, 0, 0, { round: 0.03 });
    for (let i = 0; i < 3; i++) {
      box(g, 0.7, 0.08, 0.02, '#4a4a50', fx, 0.35 + i * 0.4, 1.78);
    }
  }
  // waiting chairs pushed to sides so aisle stays clear for the character
  box(g, 0.7, 0.4, 0.6, '#5a4030', -2.4, 0.3, 2.2, 0, 0.2, 0, { round: 0.05 });
  box(g, 0.7, 0.4, 0.6, '#5a4030', 2.4, 0.3, 2.2, 0, -0.2, 0, { round: 0.05 });
  addPlant(g, -2.8, 0, -2.0);
  addLamp(g, 2.8, 0, -1.8);
  // fluorescent
  box(g, 2.5, 0.06, 0.25, '#ebe4dc', 0, 3.05, 0, 0, 0, 0, { mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 } });
  const fl = new THREE.PointLight('#f5f0e0', 0.7, 8, 2);
  fl.position.set(0, 2.8, 0);
  g.add(fl);
  return g;
}

export function buildRoom(screens) {
  const root = new THREE.Group();
  const booths = {};
  const boothMeta = {};

  // Place booths far apart so cameras don't see neighbours
  const specs = [
    { id: 'bedroom', build: () => buildBedroom(screens, 'download'), x: 0, z: 0 },
    { id: 'factory', build: () => buildFactory(screens), x: 20, z: 0 },
    { id: 'studio', build: () => buildStudio(screens), x: 40, z: 0 },
    { id: 'cert', build: () => buildCert(screens), x: 60, z: 0 },
    { id: 'coaster', build: () => buildBedroom(screens, 'coaster'), x: 80, z: 0 },
  ];

  for (const s of specs) {
    const b = s.build();
    b.position.set(s.x, 0, s.z);
    root.add(b);
    booths[s.id] = b;
    boothMeta[s.id] = { x: s.x, z: s.z, id: s.id };
  }

  // Soft contact shadow catcher (ellipse under character)
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
