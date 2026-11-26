// GTA VI bug story sets for the gta6-bug-v1 Short (V1 drawn animals).
// Booths: gamer bedroom, game studio, harbour, QA lab, cert office, year-10 studio.
// Generic plain-lettering signs only — no Rockstar/Sony logos.
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

function buildBedroom(screens) {
  const g = new THREE.Group();
  g.name = 'bedroom';
  roomShell(g, 7, 6, '#5a6a78', '#3a3028');
  box(g, 3.2, 0.04, 2.4, '#6a4050', 0.2, 0.04, 0.6, 0, 0, 0, { round: 0.05 });
  addBed(g, -2.0, 0, -1.5);
  addDesk(g, 1.4, 0, -1.8, 1.8);
  addShelf(g, -2.4, 0, 1.5);
  addLamp(g, 2.4, 0, -1.5);
  addPlant(g, 2.5, 0, 1.8);
  addConsole(g, 0.6, 0.72, -1.9);
  addTv(g, screens.city, 0.3, 1.85, -2.85, 1.05);
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
  addWallShelf(g, -1.5, 2.85, -2.88, 2.2);
  addWallShelf(g, 1.6, 2.85, -2.88, 2.2);
  addWallShelf(g, 0.1, 3.08, -2.88, 3.2);
  const sign = makeSign('GAMER DEN', 1.7, 0.36, '#2a3848', '#f0e6d0', '#4a8a98');
  sign.position.set(0.3, 2.35, -2.88);
  g.add(sign);
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
  for (const lx of [-2.0, -0.6, 0.8, 2.0]) {
    cyl(g, 0.08, 0.1, 0.16, '#e0c070', lx, 3.25, -1.2, 0, 0, 0, {
      mat: { emissive: '#e0c070', emissiveIntensity: 0.9 },
    });
  }
  box(g, 0.7, 0.55, 0.7, '#5a4030', 1.5, 0.28, 1.0, 0, 0, 0, { round: 0.04 });
  box(g, 0.18, 0.28, 0.04, '#3a4858', 1.35, 0.7, 1.0, 0, 0.2, 0, { round: 0.01 });
  box(g, 0.9, 0.45, 0.9, '#c45848', -1.2, 0.25, 1.2, 0, 0.3, 0, { round: 0.2 });
  addStringLights(g, 2.95, -2.72, -3.1, 3.1, 12);
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

function buildStudio(screens) {
  const g = new THREE.Group();
  g.name = 'studio';
  roomShell(g, 8, 6.5, '#5a6058', '#3a3830');
  // desks
  addDesk(g, -1.6, 0, -1.9, 1.8);
  addDesk(g, 1.5, 0, -1.9, 1.8);
  addMonitor(g, screens.code, -1.6, 0.72, -1.9);
  addMonitor(g, screens.upload, 1.5, 0.72, -1.9);
  addCalendar(g, -0.1, 2.0, -3.05);
  // giant UPLOAD button prop (right side, clear of character aisle)
  box(g, 1.1, 0.55, 0.25, '#6b8f6a', 2.2, 1.1, -0.2, 0, -0.2, 0, { round: 0.06 });
  const up = makeSign('UPLOAD', 1.0, 0.35, '#6b8f6a', '#f0e6d0', '#c4a35a');
  up.position.set(2.2, 1.1, -0.05);
  up.rotation.y = -0.2;
  g.add(up);
  // bug ticket boards
  addFilingCabinet(g, -2.8, 0, -1.5, 1.5);
  addDevKitShelf(g, 2.8, 0, -2.0);
  addPlant(g, -2.8, 0, 1.5);
  addLamp(g, 2.6, 0, 1.2);
  // coffee cups + sticky notes
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -1.2 + i * 0.25, 0.82, -1.7);
  }
  box(g, 0.2, 0.02, 0.2, '#c4a35a', -0.8, 0.78, -1.6);
  box(g, 0.2, 0.02, 0.2, '#6b8f6a', 0.9, 0.78, -1.6);
  // wall signs high (above caption/character)
  const s1 = makeSign('BUG-4412', 1.4, 0.32, '#3a1818', '#c45848', '#e0c070');
  s1.position.set(-1.5, 2.55, -3.1);
  g.add(s1);
  const s2 = makeSign('ONE LINE', 1.3, 0.32, '#1a3020', '#6b8f6a', '#c4a35a');
  s2.position.set(1.4, 2.55, -3.1);
  g.add(s2);
  addWallShelf(g, 0, 3.0, -3.1, 5.5);
  addCeilingBeam(g, 0, 3.8, -1.5, 7);
  addCeilingBeam(g, 0, 3.8, 0.2, 7);
  for (const lx of [-1.5, 0, 1.5]) {
    box(g, 1.6, 0.1, 0.35, '#ebe4dc', lx, 3.7, -0.5, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.1, -3.2, 3.2, 2.9);
  const fl = new THREE.PointLight('#f5f0e0', 0.7, 8, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildHarbour(screens) {
  const g = new THREE.Group();
  g.name = 'harbour';
  // open outdoor-ish shell with water floor
  roomShell(g, 9, 8, '#6a8aa0', '#3a6a78');
  // pier / dock platforms
  box(g, 8, 0.15, 2.5, '#5a4030', 0, 0.08, 1.2);
  box(g, 8, 0.15, 1.5, '#4a3020', 0, 0.08, -0.8);
  // suspension bridge (back)
  box(g, 7, 0.2, 1.2, '#5a5a60', 0, 2.2, -3.2);
  box(g, 0.35, 2.4, 0.35, '#4a4a50', -3.0, 1.2, -3.2);
  box(g, 0.35, 2.4, 0.35, '#4a4a50', 3.0, 1.2, -3.2);
  // cables
  for (let i = 0; i < 6; i++) {
    const x = -2.5 + i * 1.0;
    box(g, 0.04, 1.2, 0.04, '#c8c8c8', x, 2.8, -3.2, 0.3, 0, 0, { noShadow: true });
  }
  // patch plate on bridge
  box(g, 1.2, 0.08, 1.0, '#c4a35a', 0, 2.35, -3.1);
  // invisible wall shimmer (vertical translucent boxes under bridge)
  for (let i = 0; i < 10; i++) {
    box(g, 0.06, 1.6, 0.06, '#c8e8f0', -0.5 + i * 0.1, 1.0, -2.6, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.45, emissive: '#a0d0e0', emissiveIntensity: 0.6 },
      noShadow: true,
    });
  }
  // boats
  box(g, 1.2, 0.35, 0.5, '#c45848', -1.8, 0.35, -1.5, 0, 0.3, 0, { round: 0.05 });
  box(g, 0.3, 0.4, 0.08, '#ebe4dc', -1.5, 0.65, -1.5);
  box(g, 1.0, 0.3, 0.45, '#4a8a98', 1.6, 0.3, -1.8, 0, -0.4, 0, { round: 0.05 });
  // buoys
  for (const [x, z] of [[-3.2, 0.5], [3.2, 0.2], [-2.5, -2.0], [2.8, -1.2]]) {
    cyl(g, 0.12, 0.12, 0.35, '#c45848', x, 0.25, z);
    cyl(g, 0.08, 0.08, 0.1, '#ebe4dc', x, 0.45, z);
  }
  // harbour monitor
  addMonitor(g, screens.harbour, 2.4, 0.1, 1.0, -0.4);
  const sign = makeSign('HARBOUR', 1.6, 0.36, '#2a3848', '#f0e6d0', '#4a8a98');
  sign.position.set(0, 3.2, -3.5);
  g.add(sign);
  const wallSign = makeSign('WALL?', 1.0, 0.3, '#3a1818', '#c8e8f0', '#c45848');
  wallSign.position.set(0, 1.8, -2.4);
  g.add(wallSign);
  // crates on dock (sides, not blocking character)
  addCrate(g, -2.8, 0.15, 1.5, 'DOCK');
  addCrate(g, 2.8, 0.15, 1.4, 'BUOY');
  addPlant(g, -3.2, 0.15, 2.0);
  // sky dressing
  for (const lx of [-2, 0, 2]) {
    box(g, 1.8, 0.1, 0.3, '#ebe4dc', lx, 3.7, -1.0, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.4 },
    });
  }
  addCeilingBeam(g, 0, 3.85, -2.0, 8);
  addCeilingBeam(g, 0, 3.85, 0.5, 8);
  addUpperWallDressing(g, -3.85, -3.5, 3.5, 3.0);
  const waterLight = new THREE.PointLight('#8ab0c0', 0.6, 10, 2);
  waterLight.position.set(0, 2.5, 0);
  g.add(waterLight);
  return g;
}

function buildQa(screens) {
  const g = new THREE.Group();
  g.name = 'qa';
  roomShell(g, 8, 6.5, '#4a5a58', '#3a3a40');
  // test stations
  for (let i = 0; i < 3; i++) {
    addDesk(g, -2.2 + i * 2.2, 0, -2.0, 1.5);
    addMonitor(g, screens.qa, -2.2 + i * 2.2, 0.72, -2.0);
    // controllers
    box(g, 0.28, 0.08, 0.18, '#2a2a30', -2.0 + i * 2.2, 0.8, -1.7, 0, 0, 0, { round: 0.03 });
  }
  // giant city map with pins on back wall
  box(g, 3.5, 2.2, 0.08, '#2a3840', 0, 2.0, -3.1);
  box(g, 3.3, 2.0, 0.02, '#4a6a70', 0, 2.0, -3.05);
  const pinCols = ['#c45848', '#c4a35a', '#6b8f6a', '#4a8a98', '#a87890'];
  for (let i = 0; i < 18; i++) {
    const px = -1.3 + (i % 6) * 0.5;
    const py = 1.3 + Math.floor(i / 6) * 0.55;
    cyl(g, 0.05, 0.02, 0.08, pinCols[i % pinCols.length], px, py, -3.0);
  }
  const mapSign = makeSign('CITY MAP', 1.5, 0.32, '#2a3848', '#f0e6d0', '#6b8f6a');
  mapSign.position.set(0, 3.25, -3.05);
  g.add(mapSign);
  addFilingCabinet(g, -3.2, 0, 0.5, 1.6);
  addFilingCabinet(g, 3.2, 0, 0.5, 1.6);
  addClipboard(g, 1.5, 0.85, -1.6);
  addPlant(g, -3.0, 0, 1.8);
  addLamp(g, 3.0, 0, 1.5);
  addWallShelf(g, -1.5, 3.0, -3.1, 2.0);
  addWallShelf(g, 1.5, 3.0, -3.1, 2.0);
  addCeilingBeam(g, 0, 3.8, -1.5, 7);
  addCeilingBeam(g, 0, 3.8, 0.3, 7);
  for (const lx of [-1.5, 0, 1.5]) {
    box(g, 1.6, 0.1, 0.3, '#ebe4dc', lx, 3.7, -0.4, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.1, -3.2, 3.2, 2.85);
  const fl = new THREE.PointLight('#f5f0e0', 0.75, 8, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildCert(screens) {
  const g = new THREE.Group();
  g.name = 'cert';
  roomShell(g, 7.5, 6, '#5a5550', '#3a3835');
  addStampDesk(g, 0.3, 0, -1.8);
  addMonitor(g, screens.cert, -1.5, 0.72, -2.0, 0.2);
  // towering rulebook shelves
  for (let col = 0; col < 4; col++) {
    box(g, 0.55, 2.4, 0.4, '#5a4030', -2.6 + col * 0.65, 1.2, -2.8);
    for (let row = 0; row < 6; row++) {
      const cols = ['#c45848', '#4a8a98', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858'];
      box(g, 0.45, 0.12, 0.3, cols[(col + row) % cols.length],
        -2.6 + col * 0.65, 0.35 + row * 0.35, -2.65, 0, 0.05, 0, { round: 0.01 });
    }
  }
  addPassFailBins(g, 2.0, 0, -1.5);
  addFilingCabinet(g, 2.8, 0, 0.5, 1.8);
  addClipboard(g, -0.3, 0.85, -1.5);
  // big FAILED stamp prop (high enough not to collide with captions)
  box(g, 0.7, 0.15, 0.7, '#c45848', 1.5, 1.4, -0.5, 0, 0.3, 0, { round: 0.04 });
  cyl(g, 0.12, 0.15, 0.35, '#8a3030', 1.5, 1.7, -0.5);
  const fail = makeSign('FAILED', 1.2, 0.32, '#3a1818', '#c45848', '#e0c070');
  fail.position.set(0, 2.6, -2.85);
  g.add(fail);
  const books = makeSign('RULEBOOKS', 1.5, 0.3, '#2a3228', '#f0e6d0', '#c4a35a');
  books.position.set(-1.5, 2.7, -2.85);
  g.add(books);
  addPlant(g, -3.0, 0, 1.5);
  addLamp(g, 2.8, 0, 1.5);
  addWallShelf(g, 0.5, 3.05, -2.85, 3.5);
  addCeilingBeam(g, 0, 3.8, -1.5, 6.5);
  addCeilingBeam(g, 0, 3.8, 0.2, 6.5);
  for (const lx of [-1.4, 0, 1.4]) {
    box(g, 1.5, 0.1, 0.3, '#ebe4dc', lx, 3.7, -0.3, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -2.85, -3.0, 3.0, 2.9);
  const fl = new THREE.PointLight('#f5f0e0', 0.8, 8, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildYears(screens) {
  const g = new THREE.Group();
  g.name = 'years';
  roomShell(g, 8, 6.5, '#5a5048', '#3a3028');
  addDesk(g, 0, 0, -2.0, 2.2);
  addMonitor(g, screens.years, 0, 0.72, -2.0);
  // YEAR 10 calendar (large, high on wall)
  box(g, 1.4, 1.6, 0.06, '#f4f0ea', -2.0, 2.2, -3.05);
  box(g, 1.4, 0.3, 0.07, '#c45848', -2.0, 2.85, -3.03);
  const y10 = makeSign('YEAR 10', 1.2, 0.4, '#c45848', '#f0e6d0', '#e0c070');
  y10.position.set(-2.0, 2.3, -3.0);
  g.add(y10);
  // mountain of test reports (camera-right, readable pile)
  for (let layer = 0; layer < 10; layer++) {
    for (let i = 0; i < 4; i++) {
      box(g, 0.5 - layer * 0.02, 0.07, 0.38,
        ['#ebe4dc', '#d8c8a0', '#c8d4c0', '#f0e6d0'][i % 4],
        1.55 + (i - 1.5) * 0.12, 0.18 + layer * 0.09, 0.85 + i * 0.04, 0, 0.04 * i, 0, { round: 0.01 });
    }
  }
  const reports = makeSign('TEST REPORTS', 1.2, 0.28, '#2a3228', '#f0e6d0', '#c4a35a');
  reports.position.set(1.55, 1.25, 1.05);
  g.add(reports);
  // tiny egg timer (desk, camera-left of monitor)
  cyl(g, 0.1, 0.14, 0.06, '#c4a35a', -1.35, 0.78, -1.65);
  cyl(g, 0.025, 0.025, 0.28, '#8a6a40', -1.35, 0.96, -1.65);
  cyl(g, 0.12, 0.1, 0.14, '#ebe4dc', -1.35, 1.14, -1.65, 0, 0, 0, {
    mat: { transparent: true, opacity: 0.75 },
  });
  const timer = makeSign('10 MIN', 0.7, 0.22, '#3a3028', '#e0c070', '#c4a35a');
  timer.position.set(-1.35, 1.4, -1.5);
  g.add(timer);
  // coffee cups everywhere
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -2.5 + i * 0.35, 0.12, 1.2);
  }
  addShelf(g, 2.8, 0, -1.5);
  addPlant(g, -3.0, 0, 1.5);
  addLamp(g, 2.8, 0, 1.5);
  addFilingCabinet(g, -3.0, 0, -1.0, 1.5);
  const prove = makeSign('PROVE IT', 1.3, 0.32, '#1a3020', '#6b8f6a', '#c4a35a');
  prove.position.set(1.1, 2.65, -3.05);
  g.add(prove);
  addWallShelf(g, 0.5, 3.1, -3.05, 4.0);
  addCeilingBeam(g, 0, 3.8, -1.5, 7);
  addCeilingBeam(g, 0, 3.8, 0.3, 7);
  for (const lx of [-1.5, 0, 1.5]) {
    box(g, 1.6, 0.1, 0.3, '#ebe4dc', lx, 3.7, -0.4, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.05, -3.2, 3.2, 2.9);
  const fl = new THREE.PointLight('#f5f0e0', 0.75, 8, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

export function buildRoom(screens) {
  const root = new THREE.Group();
  const booths = {};
  const boothMeta = {};

  const specs = [
    { id: 'bedroom', build: () => buildBedroom(screens), x: 0, z: 0 },
    { id: 'studio', build: () => buildStudio(screens), x: 20, z: 0 },
    { id: 'harbour', build: () => buildHarbour(screens), x: 40, z: 0 },
    { id: 'qa', build: () => buildQa(screens), x: 60, z: 0 },
    { id: 'cert', build: () => buildCert(screens), x: 80, z: 0 },
    { id: 'years', build: () => buildYears(screens), x: 100, z: 0 },
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
