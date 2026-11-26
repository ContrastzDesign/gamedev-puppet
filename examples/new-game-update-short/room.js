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

/** Pack the upper wall band so the top of the 9:16 frame never reads as empty grey. */
function addUpperWallDressing(parent, zWall, x0, x1, y0 = 3.15) {
  const span = x1 - x0;
  // continuous shelf of boxes
  box(parent, span, 0.07, 0.3, '#5a4030', (x0 + x1) / 2, y0, zWall + 0.02);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858', '#8a6a40', '#6a7a98'];
  const n = Math.max(6, Math.floor(span / 0.28));
  for (let i = 0; i < n; i++) {
    const x = x0 + 0.2 + (i / Math.max(1, n - 1)) * (span - 0.4);
    box(parent, 0.2, 0.28 + (i % 3) * 0.06, 0.2, cols[i % cols.length], x, y0 + 0.2, zWall + 0.08, 0, 0.05, 0, { round: 0.01 });
  }
  // duct / pipe rail just above
  box(parent, span * 0.95, 0.22, 0.35, '#6a6a70', (x0 + x1) / 2, y0 + 0.55, zWall + 0.05);
  for (let i = 0; i < 5; i++) {
    const x = x0 + 0.3 + i * (span - 0.6) / 4;
    box(parent, 0.35, 0.05, 0.35, '#4a4a50', x, y0 + 0.4, zWall + 0.05);
  }
  // fairy lights under the duct
  addStringLights(parent, y0 + 0.35, zWall + 0.2, x0 + 0.15, x1 - 0.15, 12);
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

function addPressMachine(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 1.2, 1.6, 0.9, '#4a5058', 0, 0.8, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.9, 0.4, 0.7, '#3a4048', 0, 1.5, 0);
  box(g, 0.55, 0.35, 0.55, '#2a3038', 0, 1.85, 0, 0, 0, 0, { round: 0.02 });
  cyl(g, 0.25, 0.25, 0.15, '#c4a35a', 0, 1.1, 0.4);
  cyl(g, 0.08, 0.08, 0.5, '#2a3038', 0, 1.2, 0.4);
  // control panel strip
  box(g, 0.5, 0.25, 0.04, '#1a2028', 0.35, 1.2, 0.46);
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.03, 0.03, 0.02, i === 0 ? '#6b8f6a' : '#c45848', 0.2 + i * 0.12, 1.22, 0.49);
  }
  const light = new THREE.PointLight('#c4a35a', 0.4, 3, 2);
  light.position.set(0, 1.4, 0.6);
  g.add(light);
  parent.add(g);
  return g;
}

function addShrinkWrap(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.1, 1.4, 0.8, '#4a5560', 0, 0.7, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.9, 0.08, 0.65, '#2a3038', 0, 1.35, 0);
  // heat tunnel arch
  box(g, 0.08, 0.7, 0.65, '#3a4048', -0.45, 1.0, 0);
  box(g, 0.08, 0.7, 0.65, '#3a4048', 0.45, 1.0, 0);
  box(g, 1.0, 0.08, 0.65, '#c45848', 0, 1.4, 0, 0, 0, 0, {
    mat: { emissive: '#c45848', emissiveIntensity: 0.35 },
  });
  // wrapped case on exit
  box(g, 0.22, 0.32, 0.06, '#3a4858', 0.55, 0.85, 0.2, 0, 0.2, 0, { round: 0.01 });
  box(g, 0.24, 0.34, 0.02, '#c8d8e0', 0.55, 0.85, 0.24, 0, 0.2, 0, {
    mat: { transparent: true, opacity: 0.35, roughness: 0.2 },
  });
  parent.add(g);
  return g;
}

function addPalletStack(parent, x, y, z, cols = 2, rows = 2, layers = 3) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.9, 0.08, 0.7, '#8a6a40', 0, 0.04, 0);
  box(g, 0.08, 0.08, 0.7, '#6a5030', -0.35, 0.04, 0);
  box(g, 0.08, 0.08, 0.7, '#6a5030', 0.35, 0.04, 0);
  const caseCols = ['#3a4858', '#4a5868', '#2a3848', '#5a4030'];
  for (let layer = 0; layer < layers; layer++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        box(g, 0.35, 0.22, 0.28, caseCols[(layer + c + r) % caseCols.length],
          -0.22 + c * 0.44, 0.2 + layer * 0.24, -0.15 + r * 0.32, 0, 0, 0, { round: 0.015 });
      }
    }
  }
  parent.add(g);
  return g;
}

function addForklift(parent, x, y, z, ry = 0.4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.9, 0.45, 0.55, '#c4a35a', 0, 0.4, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.45, 0.55, 0.5, '#3a4048', -0.15, 0.85, 0, 0, 0, 0, { round: 0.03 });
  // mast + forks (point away from aisle)
  box(g, 0.08, 1.2, 0.12, '#2a3038', 0.5, 0.7, 0);
  box(g, 0.55, 0.05, 0.08, '#6a6a70', 0.75, 0.25, -0.12);
  box(g, 0.55, 0.05, 0.08, '#6a6a70', 0.75, 0.25, 0.12);
  cyl(g, 0.14, 0.14, 0.1, '#2a2a30', -0.25, 0.14, 0.28, 0, 0, Math.PI / 2);
  cyl(g, 0.14, 0.14, 0.1, '#2a2a30', -0.25, 0.14, -0.28, 0, 0, Math.PI / 2);
  cyl(g, 0.1, 0.1, 0.08, '#2a2a30', 0.35, 0.1, 0.22, 0, 0, Math.PI / 2);
  cyl(g, 0.1, 0.1, 0.08, '#2a2a30', 0.35, 0.1, -0.22, 0, 0, Math.PI / 2);
  parent.add(g);
  return g;
}

function addPalletJack(parent, x, y, z, ry = -0.3) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.7, 0.06, 0.35, '#c45848', 0.1, 0.08, 0);
  box(g, 0.08, 0.55, 0.08, '#3a3a40', -0.3, 0.35, 0);
  box(g, 0.35, 0.06, 0.08, '#3a3a40', -0.4, 0.6, 0);
  cyl(g, 0.06, 0.06, 0.05, '#2a2a30', 0.3, 0.06, 0.12, 0, 0, Math.PI / 2);
  cyl(g, 0.06, 0.06, 0.05, '#2a2a30', 0.3, 0.06, -0.12, 0, 0, Math.PI / 2);
  parent.add(g);
  return g;
}

function addWallShelf(parent, x, y, z, w = 1.6) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, w, 0.06, 0.28, '#5a4030', 0, 0, 0);
  box(g, 0.05, 0.35, 0.28, '#4a3020', -w / 2 + 0.04, -0.12, 0);
  box(g, 0.05, 0.35, 0.28, '#4a3020', w / 2 - 0.04, -0.12, 0);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858', '#8a6a40'];
  const n = Math.floor(w / 0.22);
  for (let i = 0; i < n; i++) {
    box(g, 0.16, 0.26, 0.18, cols[i % cols.length], -w / 2 + 0.2 + i * 0.22, 0.16, 0.02, 0, 0.08, 0, { round: 0.015 });
  }
  parent.add(g);
  return g;
}

function addFilingCabinet(parent, x, y, z, h = 1.4) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.8, h, 0.55, '#6a6a70', 0, h / 2, 0, 0, 0, 0, { round: 0.03 });
  const drawers = Math.max(2, Math.floor(h / 0.4));
  for (let i = 0; i < drawers; i++) {
    box(g, 0.7, 0.08, 0.02, '#4a4a50', 0, 0.25 + i * (h / drawers), 0.28);
    box(g, 0.12, 0.03, 0.04, '#c4a35a', 0, 0.25 + i * (h / drawers), 0.3);
  }
  parent.add(g);
  return g;
}

function addDevKitShelf(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.3, 1.9, 0.4, '#5a5048', 0, 0.95, 0);
  const kitCols = ['#2a3038', '#3a4858', '#1a2028', '#4a4038'];
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 3; i++) {
      box(g, 0.28, 0.18, 0.22, kitCols[(row + i) % kitCols.length],
        -0.4 + i * 0.4, 0.35 + row * 0.42, 0.12, 0, 0, 0, { round: 0.02 });
      cyl(g, 0.015, 0.015, 0.02, row % 2 ? '#6b8f6a' : '#c4a35a', -0.32 + i * 0.4, 0.4 + row * 0.42, 0.24);
    }
  }
  parent.add(g);
  return g;
}

function addClipboard(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.22, 0.02, 0.3, '#5a4030', 0, 0, 0);
  box(g, 0.18, 0.01, 0.26, '#ebe4dc', 0, 0.015, 0);
  box(g, 0.08, 0.03, 0.04, '#3a3a40', 0, 0.02, -0.12);
  parent.add(g);
  return g;
}

function addStampDesk(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.1, 0.08, 0.65, '#5a4030', 0, 0.72, 0);
  box(g, 0.07, 0.72, 0.07, '#4a3020', -0.45, 0.36, -0.25);
  box(g, 0.07, 0.72, 0.07, '#4a3020', 0.45, 0.36, -0.25);
  box(g, 0.07, 0.72, 0.07, '#4a3020', -0.45, 0.36, 0.25);
  box(g, 0.07, 0.72, 0.07, '#4a3020', 0.45, 0.36, 0.25);
  // big red stamp + ink pad
  box(g, 0.28, 0.18, 0.28, '#c45848', 0.25, 0.88, 0.05, 0, 0, 0, { round: 0.02 });
  cyl(g, 0.06, 0.08, 0.12, '#8a3030', 0.25, 1.05, 0.05);
  box(g, 0.22, 0.04, 0.22, '#2a1818', -0.25, 0.78, 0.1);
  box(g, 0.35, 0.02, 0.45, '#d8c8a0', -0.15, 0.77, -0.1);
  parent.add(g);
  return g;
}

function addPassFailBins(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.55, 0.45, 0.45, '#3a1818', -0.4, 0.25, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.55, 0.45, 0.45, '#1a3020', 0.4, 0.25, 0, 0, 0, 0, { round: 0.03 });
  const fail = makeSign('FAIL', 0.45, 0.18, '#3a1818', '#c45848', '#e0c070');
  fail.position.set(-0.4, 0.55, 0.24);
  g.add(fail);
  const pass = makeSign('PASS', 0.45, 0.18, '#1a3020', '#6b8f6a', '#c4a35a');
  pass.position.set(0.4, 0.55, 0.24);
  g.add(pass);
  parent.add(g);
  return g;
}

function addCeilingBeam(parent, x, y, z, len = 6) {
  box(parent, len, 0.12, 0.18, '#4a4038', x, y, z, 0, 0, 0, { noShadow: true });
}

function addStringLights(parent, y, z, x0, x1, n = 10) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const lx = x0 + (x1 - x0) * t;
    const ly = y - Math.sin(t * Math.PI) * 0.12;
    cyl(parent, 0.03, 0.03, 0.06, '#e0c070', lx, ly, z, 0, 0, 0, {
      mat: { emissive: '#e0c070', emissiveIntensity: 1.2 },
    });
  }
}

function roomShell(parent, w, d, wallColor, floorColor) {
  const wallH = 4.0;
  box(parent, w, 0.08, d, floorColor, 0, 0, 0);
  box(parent, w, wallH, 0.12, wallColor, 0, wallH / 2, -d / 2);
  box(parent, 0.12, wallH, d, wallColor, -w / 2, wallH / 2, 0);
  box(parent, 0.12, wallH, d, wallColor, w / 2, wallH / 2, 0);
  // ceiling extends toward camera so the top of the 9:16 frame stays dressed
  box(parent, w, 0.1, d + 2.5, '#c8c0b8', 0, wallH, 1.0, 0, 0, 0, { noShadow: true });
  // cornice / crown molding along back wall
  box(parent, w - 0.2, 0.14, 0.18, '#a89888', 0, wallH - 0.12, -d / 2 + 0.12, 0, 0, 0, { noShadow: true });
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
  // posters mid + high so the upper frame is never bare wall
  const p1 = makePosterArt(1, 0.65, 0.9);
  p1.position.set(-1.7, 1.95, -2.9);
  g.add(p1);
  const p2 = makePosterArt(2, 0.65, 0.9);
  p2.position.set(1.9, 1.95, -2.9);
  g.add(p2);
  for (let i = 0; i < 4; i++) {
    const p = makePosterArt(i, 0.45, 0.6);
    p.position.set(-1.5 + i * 0.95, 2.55, -2.9);
    g.add(p);
  }
  // continuous high shelves fill top ~10% band
  addWallShelf(g, -1.5, 2.85, -2.88, 2.2);
  addWallShelf(g, 1.6, 2.85, -2.88, 2.2);
  addWallShelf(g, 0.1, 3.08, -2.88, 3.2);
  const sign = makeSign(mode === 'coaster' ? 'COASTER MODE' : 'GAMER DEN', 1.7, 0.36, '#2a3848', '#f0e6d0', '#4a8a98');
  sign.position.set(0.3, 2.35, -2.88);
  g.add(sign);
  // ceiling beams + cove strip so the top of frame reads as a room
  addCeilingBeam(g, 0, 3.75, -1.8, 6.5);
  addCeilingBeam(g, 0, 3.75, -0.3, 6.5);
  addCeilingBeam(g, 0, 3.75, 1.2, 6.5);
  box(g, 6.5, 0.08, 0.1, '#e0c070', 0, 3.85, -2.7, 0, 0, 0, {
    mat: { emissive: '#e0c070', emissiveIntensity: 0.7 }, noShadow: true,
  });
  for (const lx of [-1.8, 0, 1.8]) {
    box(g, 1.4, 0.1, 0.35, '#ebe4dc', lx, 3.7, -0.4, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  // mid hanging lanterns fill former empty band
  for (const lx of [-2.0, -0.6, 0.8, 2.0]) {
    cyl(g, 0.08, 0.1, 0.16, '#e0c070', lx, 3.25, -1.2, 0, 0, 0, {
      mat: { emissive: '#e0c070', emissiveIntensity: 0.9 },
    });
  }
  // snack table / coaster setup — keep clear of character aisle (z≈2.15, x≈0)
  box(g, 0.7, 0.55, 0.7, '#5a4030', 1.5, 0.28, 1.0, 0, 0, 0, { round: 0.04 });
  if (mode === 'coaster') {
    cyl(g, 0.22, 0.22, 0.03, '#4a8a98', 1.5, 0.58, 1.0);
    cyl(g, 0.18, 0.18, 0.02, '#6aa8b8', 1.5, 0.6, 1.0);
    cyl(g, 0.05, 0.05, 0.02, '#c4a35a', 1.5, 0.61, 1.0);
    cyl(g, 0.07, 0.08, 0.22, '#c45848', 1.5, 0.73, 1.0);
    cyl(g, 0.06, 0.06, 0.03, '#d46858', 1.5, 0.85, 1.0);
  } else {
    box(g, 0.18, 0.28, 0.04, '#3a4858', 1.35, 0.7, 1.0, 0, 0.2, 0, { round: 0.01 });
    box(g, 0.18, 0.28, 0.04, '#4a5868', 1.55, 0.7, 1.05, 0, -0.15, 0, { round: 0.01 });
  }
  // beanbag (side, not in front of character)
  box(g, 0.9, 0.45, 0.9, '#c45848', -1.2, 0.25, 1.2, 0, 0.3, 0, { round: 0.2 });
  // fairy-light swoop across the back wall + side wall cascade
  addStringLights(g, 2.95, -2.72, -3.1, 3.1, 12);
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.03, 0.03, 0.06, '#e0c070', -3.35, 2.4 + i * 0.12, -2.2 + i * 0.55, 0, 0, 0, {
      mat: { emissive: '#e0c070', emissiveIntensity: 1.1 },
    });
  }
  // side-wall posters fill lateral upper frame
  const sp1 = makePosterArt(4, 0.6, 0.85);
  sp1.position.set(-3.4, 2.4, -0.5);
  sp1.rotation.y = Math.PI / 2;
  g.add(sp1);
  const sp2 = makePosterArt(5, 0.6, 0.85);
  sp2.position.set(3.4, 2.4, -0.8);
  sp2.rotation.y = -Math.PI / 2;
  g.add(sp2);
  addUpperWallDressing(g, -2.88, -3.0, 3.0, 2.95);
  return g;
}

function buildFactory(screens) {
  const g = new THREE.Group();
  g.name = 'factory';
  // Wider/deeper shell so dressing fills the tall 9:16 frustum
  roomShell(g, 9, 7, '#5a5a60', '#3a3a40');
  // dense hazard floor (visible band roughly |x|<2.5)
  for (let i = 0; i < 12; i++) {
    box(g, 0.18, 0.02, 6.2, i % 2 ? '#c4a35a' : '#2a2a30', -2.4 + i * 0.42, 0.05, -0.2);
  }
  for (let i = 0; i < 10; i++) {
    box(g, 4.8, 0.015, 0.12, i % 2 ? '#c4a35a' : '#2a2a30', 0.1, 0.06, -2.8 + i * 0.45, 0, 0, 0, { noShadow: true });
  }
  box(g, 1.2, 0.015, 2.8, '#c45848', 0.15, 0.04, 0.6, 0, 0, 0, { noShadow: true });

  // presses + belts packed into camera frustum (|x|≲2.2, z≲1.5 behind char)
  addPressMachine(g, -1.85, 0, -1.5);
  addPressMachine(g, 0.15, 0, -2.35);
  addPressMachine(g, 1.9, 0, -1.55, -0.1);
  addConveyor(g, 0.1, 0, -0.85, 5.2);
  addConveyor(g, 0.1, 0, -2.05, 4.2);
  addShrinkWrap(g, 1.15, 0, -0.95);

  // discs + cases dense on both belts
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.13, 0.13, 0.2, '#4a8a98', -2.0 + i * 0.55, 0.88, -0.85);
    box(g, 0.15, 0.22, 0.04, '#3a4858', -1.85 + i * 0.55, 0.92, -0.55, 0, 0.12, 0, { round: 0.01 });
    cyl(g, 0.12, 0.12, 0.18, '#6aa8b8', -1.7 + i * 0.5, 0.88, -2.05);
  }
  // spindle / case towers flanking character (z≈1.1–1.6, |x|≥1.1 — clear of body)
  for (let j = 0; j < 5; j++) {
    for (let k = 0; k < 3; k++) {
      cyl(g, 0.13, 0.13, 0.28, '#4a8a98', -1.7 - k * 0.3, 0.16 + j * 0.28, 1.15 + k * 0.15);
      cyl(g, 0.13, 0.13, 0.28, '#6aa8b8', 1.75 + k * 0.3, 0.16 + j * 0.28, 1.1 + k * 0.12);
    }
  }
  for (let j = 0; j < 5; j++) {
    box(g, 0.2, 0.14, 0.28, '#3a4858', -1.35, 0.12 + j * 0.15, 0.55, 0, 0, 0, { round: 0.01 });
    box(g, 0.2, 0.14, 0.28, '#4a5868', 1.45, 0.12 + j * 0.15, 0.5, 0, 0, 0, { round: 0.01 });
  }

  // pallets + crates IN FRAME (sides of aisle, behind char)
  addPalletStack(g, -1.9, 0, 0.15, 2, 2, 3);
  addPalletStack(g, 1.95, 0, 0.05, 2, 2, 4);
  addPalletStack(g, -1.6, 0, -2.6, 2, 2, 2);
  addCrate(g, -2.1, 0, 0.85, 'SHIP');
  addCrate(g, 2.05, 0, 0.9, 'DISC');
  addCrate(g, 1.55, 0, 1.35, 'PACK');
  addCrate(g, -1.5, 0, 1.4, 'RAW');
  addCrate(g, 2.15, 0, -2.5, 'BOX');

  // forklift / jack — pulled into frustum beside the aisle
  addForklift(g, 1.55, 0, 1.25, -1.25);
  addPalletJack(g, -1.55, 0, 1.3, 0.55);
  // shrink-wrap exit cases piled mid-right
  for (let j = 0; j < 4; j++) {
    box(g, 0.2, 0.28, 0.05, '#3a4858', 0.85, 0.75 + j * 0.08, -0.35, 0, 0.2, 0, { round: 0.01 });
  }

  addCalendar(g, 1.85, 1.85, -3.35);
  addMonitor(g, screens.factory, 1.7, 0.95, -2.55, -0.35);
  addMonitor(g, screens.factory, -1.7, 1.05, -2.55, 0.35);

  // wall hazard kickboard + dense signage across visible wall
  for (let i = 0; i < 10; i++) {
    box(g, 0.48, 0.2, 0.02, i % 2 ? '#c4a35a' : '#2a2a30', -2.3 + i * 0.5, 0.4, -3.42);
  }
  const warn = makeSign('CAUTION', 1.05, 0.32, '#2a2a18', '#e0c070', '#c4a35a');
  warn.position.set(-1.7, 2.55, -3.4);
  g.add(warn);
  const hardhat = makeSign('HARD HAT', 1.0, 0.3, '#3a1818', '#f0e6d0', '#c45848');
  hardhat.position.set(1.7, 2.55, -3.4);
  g.add(hardhat);
  const sign = makeSign('DISC PRESS', 2.0, 0.42, '#2a3038', '#e0c070', '#c4a35a');
  sign.position.set(0, 2.55, -3.4);
  g.add(sign);

  // cover bare wall: posters grid + high shelves spanning visible width
  for (let i = 0; i < 4; i++) {
    const p = makePosterArt(i, 0.55, 0.78);
    p.position.set(-1.7 + i * 1.1, 1.55, -3.4);
    g.add(p);
  }
  addWallShelf(g, -1.5, 2.95, -3.38, 2.2);
  addWallShelf(g, 1.5, 2.95, -3.38, 2.2);
  // mid wall pipe runs + valves (fill grey)
  for (const [px, py] of [[-2.1, 2.1], [-0.7, 2.3], [0.7, 2.15], [2.1, 2.25]]) {
    cyl(g, 0.07, 0.07, 1.4, '#7a7a80', px, py, -3.35, 0, 0, Math.PI / 2);
    cyl(g, 0.1, 0.1, 0.12, '#c45848', px, py, -3.28);
  }
  // vertical pipe clusters on wall
  for (const px of [-2.2, -0.3, 1.1, 2.2]) {
    cyl(g, 0.06, 0.06, 2.6, '#6a6a70', px, 1.5, -3.3);
  }

  for (const cx of [-1.55, 1.6]) {
    cyl(g, 0.01, 0.16, 0.4, '#c4a35a', cx, 0.2, 1.65);
  }

  // overhead lamps + ducts packing the tall ceiling
  for (const lx of [-1.8, -0.5, 0.8, 1.9]) {
    box(g, 0.9, 0.12, 0.45, '#2a2a30', lx, 3.75, -0.6);
    const pl = new THREE.PointLight('#f0e8d0', 0.6, 6, 2);
    pl.position.set(lx, 3.35, -0.2);
    g.add(pl);
  }
  addCeilingBeam(g, 0, 3.85, -2.2, 7);
  addCeilingBeam(g, 0, 3.85, -0.4, 7);
  addCeilingBeam(g, 0, 3.85, 1.2, 7);
  box(g, 5.2, 0.45, 0.65, '#6a6a70', 0.1, 3.55, -2.7);
  for (const vx of [-1.6, 0, 1.6]) {
    box(g, 0.55, 0.08, 0.55, '#4a4a50', vx, 3.28, -2.7);
  }
  // hanging cable trays + mid lamps
  box(g, 4.5, 0.06, 0.2, '#3a3a40', 0.1, 3.2, -1.5);
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.015, 0.015, 0.45, '#2a2a30', -1.6 + i * 0.45, 2.9, -1.5);
  }
  for (const lx of [-1.5, 0, 1.5]) {
    box(g, 0.7, 0.08, 0.3, '#c4a35a', lx, 3.15, -0.2, 0, 0, 0, {
      mat: { emissive: '#c4a35a', emissiveIntensity: 0.45 },
    });
  }
  addUpperWallDressing(g, -3.4, -2.4, 2.4, 2.95);
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
  // second monitors / dual-screen chaos
  addMonitor(g, screens.bugs, -1.4, 0.72, -2.05, 0.35);
  addMonitor(g, screens.gold, 2.9, 0.72, -2.0, -0.3);
  // chairs tucked under desks (behind character at z≈2.15)
  for (const cx of [-2.0, 0.3, 2.4]) {
    box(g, 0.5, 0.1, 0.5, '#2a3038', cx, 0.45, -0.7, 0, 0, 0, { round: 0.05 });
    box(g, 0.5, 0.55, 0.08, '#2a3038', cx, 0.75, -0.9, 0, 0, 0, { round: 0.03 });
  }
  // launch countdown — slightly lower so shelves/lights pack the top band
  const board = makeSign('LAUNCH IN 4 DAYS', 2.2, 0.48, '#1a2228', '#e8d080', '#c45848');
  board.position.set(0, 2.25, -3.1);
  g.add(board);
  const goldSign = makeSign('GOLD MASTER', 1.45, 0.36, '#2a2418', '#e0c070', '#c4a35a');
  goldSign.position.set(-1.85, 2.25, -3.1);
  g.add(goldSign);
  const bugSign = makeSign('BUG TRIAGE', 1.25, 0.32, '#1a2228', '#f0e6d0', '#6b8f6a');
  bugSign.position.set(1.9, 2.25, -3.1);
  g.add(bugSign);
  // shelves hug the launch board so no empty grey band remains above it
  addWallShelf(g, -1.6, 2.62, -3.08, 2.4);
  addWallShelf(g, 1.6, 2.62, -3.08, 2.4);
  addWallShelf(g, 0, 2.95, -3.08, 3.8);
  addWallShelf(g, 0, 3.25, -3.08, 3.8);
  for (let i = 0; i < 5; i++) {
    const sp = makePosterArt(i, 0.48, 0.65);
    sp.position.set(-1.8 + i * 0.9, 1.75, -3.1);
    g.add(sp);
  }
  // sticky-note wall (dense, in-frame right)
  const colors = ['#e8d080', '#c45848', '#6b8f6a', '#4a8a98', '#a87890'];
  for (let i = 0; i < 24; i++) {
    box(g, 0.18, 0.18, 0.02, colors[i % colors.length],
      1.5 + (i % 4) * 0.24, 1.2 + Math.floor(i / 4) * 0.24, -3.1);
  }
  addPlant(g, -3.2, 0, 2.0);
  addLamp(g, 3.2, 0, 1.8);
  cyl(g, 0.05, 0.06, 0.12, '#ebe4dc', -1.5, 0.82, -1.6);
  cyl(g, 0.05, 0.06, 0.12, '#ebe4dc', 0.8, 0.82, -1.6);
  // server rack — pull into frustum
  box(g, 0.65, 1.7, 0.45, '#2a3038', -2.5, 0.85, -1.3);
  for (let i = 0; i < 6; i++) {
    box(g, 0.55, 0.12, 0.35, '#1a2028', -2.5, 0.28 + i * 0.26, -1.25);
    cyl(g, 0.02, 0.02, 0.02, i % 2 ? '#6b8f6a' : '#c45848', -2.28, 0.28 + i * 0.26, -1.08);
  }
  // ceiling beams + fluorescents + cable lights packing the top
  addCeilingBeam(g, 0, 3.85, -2.2, 7.5);
  addCeilingBeam(g, 0, 3.85, -0.6, 7.5);
  addCeilingBeam(g, 0, 3.85, 1.0, 7.5);
  for (const lx of [-2.2, -0.7, 0.8, 2.2]) {
    box(g, 1.4, 0.08, 0.28, '#ebe4dc', lx, 3.7, -0.5, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.55 },
    });
  }
  addStringLights(g, 3.15, -2.95, -3.2, 3.2, 14);
  addStringLights(g, 3.45, -2.4, -3.0, 3.0, 10);
  // hanging cable / badge clutter under beams
  for (let i = 0; i < 9; i++) {
    cyl(g, 0.015, 0.015, 0.45, '#3a3a40', -2.0 + i * 0.5, 3.15, -2.4);
  }
  addUpperWallDressing(g, -3.08, -2.8, 2.8, 2.88);
  return g;
}

function buildCert(screens) {
  const g = new THREE.Group();
  g.name = 'cert';
  roomShell(g, 7, 6, '#5a5850', '#4a443c');

  // long inspector bench spanning visible width (char at x≈-0.12, z≈2.55)
  addDesk(g, -0.8, 0, -1.45, 1.8);
  addDesk(g, 1.0, 0, -1.5, 1.6);
  addStampDesk(g, 0.35, 0, -0.55);
  addMonitor(g, screens.cert, -1.1, 0.72, -1.55);
  addMonitor(g, screens.cert, -0.2, 0.72, -1.6, -0.15);
  addMonitor(g, screens.cert, 1.15, 0.72, -1.6, 0.2);
  addConsole(g, -1.4, 0.72, -1.35);
  addConsole(g, -0.5, 0.72, -1.35);
  addConsole(g, 0.9, 0.72, -1.4);

  // wall signage — keep high enough for caption clearance
  const check = makeSign('RULE CHECK', 1.7, 0.4, '#1a2228', '#f0e6d0', '#c45848');
  check.position.set(0, 2.5, -2.85);
  g.add(check);
  const rej = makeSign('REJECTED', 1.15, 0.34, '#3a1818', '#c45848', '#e0c070');
  rej.position.set(1.55, 2.55, -2.85);
  g.add(rej);
  const rules = makeSign('TRC LIST', 1.1, 0.32, '#1a2228', '#d8e8f0', '#4a8a98');
  rules.position.set(-1.55, 2.55, -2.85);
  g.add(rules);

  // dense checklist wall covering grey
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      box(g, 0.26, 0.34, 0.02, (i + row) % 2 ? '#ebe4dc' : '#d8c8a0',
        -1.9 + i * 0.55, 1.15 + row * 0.42, -2.85);
      box(g, 0.2, 0.015, 0.01, row === 2 ? '#6b8f6a' : '#c45848',
        -1.9 + i * 0.55, 1.22 + row * 0.42, -2.83);
    }
  }
  const cp1 = makePosterArt(0, 0.5, 0.7);
  cp1.position.set(-1.15, 1.85, -2.84);
  g.add(cp1);
  const cp2 = makePosterArt(2, 0.5, 0.7);
  cp2.position.set(1.15, 1.85, -2.84);
  g.add(cp2);

  // shelves + kits IN FRAME
  addWallShelf(g, -1.3, 2.9, -2.82, 2.0);
  addWallShelf(g, 1.3, 2.9, -2.82, 2.0);
  addDevKitShelf(g, -1.85, 0, -0.15);
  addDevKitShelf(g, 1.9, 0, -0.25);

  // filing cabinets flanking midground
  addFilingCabinet(g, -1.85, 0, 1.05, 1.45);
  addFilingCabinet(g, 1.9, 0, 1.05, 1.45);
  addFilingCabinet(g, -1.85, 0, 0.25, 1.05);
  addFilingCabinet(g, 1.9, 0, 0.3, 1.05);

  // PASS/FAIL bins on the sides / back — keep out of the lower caption band during landings
  addPassFailBins(g, -2.05, 0, -0.55);
  addPassFailBins(g, 2.1, 0, -0.5);

  addClipboard(g, -1.2, 0.78, -1.2, 0.2);
  addClipboard(g, 0.7, 0.78, -1.25, -0.15);
  addClipboard(g, 1.3, 0.78, -1.2, 0.1);
  // wall clipboard rack
  for (let i = 0; i < 5; i++) {
    addClipboard(g, -2.0 + i * 0.9, 2.55, -2.7, 0);
  }

  // chairs / plant / lamps at edges of frustum
  box(g, 0.65, 0.38, 0.55, '#5a4030', -1.7, 0.28, 1.85, 0, 0.25, 0, { round: 0.05 });
  box(g, 0.65, 0.38, 0.55, '#5a4030', 1.75, 0.28, 1.85, 0, -0.25, 0, { round: 0.05 });
  addPlant(g, -2.0, 0, -2.0);
  addLamp(g, 2.0, 0, -1.7);
  addLamp(g, -2.0, 0, 1.5);

  cyl(g, 0.03, 0.03, 0.45, '#c4a35a', -0.5, 1.15, -1.2, 0.55, 0, 0);
  cyl(g, 0.1, 0.12, 0.08, '#ebe4dc', -0.3, 1.35, -1.05, 0, 0, 0, {
    mat: { emissive: '#f5e6c8', emissiveIntensity: 0.4 },
  });
  cyl(g, 0.03, 0.03, 0.4, '#c4a35a', 1.0, 1.1, -1.25, 0.5, 0, 0);
  cyl(g, 0.09, 0.11, 0.07, '#ebe4dc', 1.15, 1.28, -1.1, 0, 0, 0, {
    mat: { emissive: '#f5e6c8', emissiveIntensity: 0.35 },
  });

  // ceiling grid fills upper band
  for (const lx of [-1.4, 0, 1.4]) {
    box(g, 1.9, 0.08, 0.3, '#ebe4dc', lx, 3.7, -0.3, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.55 },
    });
  }
  addCeilingBeam(g, 0, 3.85, -1.8, 6.2);
  addCeilingBeam(g, 0, 3.85, -0.3, 6.2);
  addCeilingBeam(g, 0, 3.85, 1.1, 6.2);
  // hanging badge reels / cable
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.02, 0.02, 0.55, '#3a3a40', -1.5 + i * 0.55, 3.2, -2.5);
    box(g, 0.12, 0.08, 0.02, '#c4a35a', -1.5 + i * 0.55, 2.88, -2.48);
  }
  const fl = new THREE.PointLight('#f5f0e0', 0.85, 8, 2);
  fl.position.set(0, 3.2, 0);
  g.add(fl);
  addUpperWallDressing(g, -2.82, -2.4, 2.4, 2.9);
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
