// GTA VI bug story sets — densely dressed V1 booths.
// Bedroom, studio, harbour (water/boats/wall), QA lab, cert, year-10.
// Signs stay fully inside frame; generic plain lettering only.
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
  // Prefer a clean two-line layout when a space is present and the line is long.
  const parts = text.includes(' ') && text.length > 10 ? text.split(/\s+/) : [text];
  let px = parts.length > 1 ? 42 : 48;
  ctx.font = `bold ${px}px sans-serif`;
  const maxW = 460;
  const widest = () => Math.max(...parts.map((p) => ctx.measureText(p).width));
  while (px > 26 && widest() > maxW) {
    px -= 2;
    ctx.font = `bold ${px}px sans-serif`;
  }
  if (parts.length === 1) {
    ctx.fillText(parts[0], 256, 68);
  } else {
    const gap = px * 1.05;
    const y0 = 68 - (parts.length - 1) * gap * 0.5;
    parts.forEach((p, i) => ctx.fillText(p, 256, y0 + i * gap));
  }
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
  // midground clutter
  box(g, 0.55, 0.45, 0.55, '#5a4030', 2.0, 0.25, 0.8, 0, 0, 0, { round: 0.04 });
  box(g, 0.2, 0.28, 0.05, '#3a4858', 1.9, 0.6, 0.85, 0, 0.2, 0, { round: 0.01 });
  box(g, 0.2, 0.28, 0.05, '#4a5868', 2.1, 0.6, 0.9, 0, -0.1, 0, { round: 0.01 });
  addShelf(g, 2.5, 0, 0.2);
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


function addChair(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.45, 0.08, 0.45, '#3a3a40', 0, 0.42, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.45, 0.55, 0.08, '#4a4a50', 0, 0.72, -0.18, 0, 0, 0, { round: 0.02 });
  box(g, 0.06, 0.42, 0.06, '#2a2a30', -0.16, 0.21, -0.16);
  box(g, 0.06, 0.42, 0.06, '#2a2a30', 0.16, 0.21, -0.16);
  box(g, 0.06, 0.42, 0.06, '#2a2a30', -0.16, 0.21, 0.16);
  box(g, 0.06, 0.42, 0.06, '#2a2a30', 0.16, 0.21, 0.16);
  parent.add(g);
  return g;
}

function addWhiteboard(parent, x, y, z, w = 1.8, h = 1.1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, w, h, 0.05, '#ebe4dc', 0, 0, 0);
  box(g, w + 0.08, h + 0.08, 0.03, '#5a4030', 0, 0, -0.02);
  // sticky notes
  const cols = ['#c4a35a', '#6b8f6a', '#a87890', '#4a8a98', '#c45848'];
  for (let i = 0; i < 8; i++) {
    box(g, 0.18, 0.18, 0.02, cols[i % cols.length], -w / 2 + 0.25 + (i % 4) * 0.4, h / 2 - 0.25 - Math.floor(i / 4) * 0.35, 0.04);
  }
  parent.add(g);
  return g;
}

function addServerRack(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.7, 2.2, 0.6, '#2a2a30', 0, 1.1, 0, 0, 0, 0, { round: 0.03 });
  for (let i = 0; i < 8; i++) {
    box(g, 0.6, 0.12, 0.5, i % 2 ? '#3a3a40' : '#1a1a20', 0, 0.3 + i * 0.24, 0.05);
    cyl(g, 0.02, 0.02, 0.02, i % 3 === 0 ? '#6b8f6a' : '#c45848', 0.2, 0.3 + i * 0.24, 0.32);
  }
  parent.add(g);
  return g;
}

function addPizzaBox(parent, x, y, z) {
  box(parent, 0.45, 0.06, 0.45, '#ebe4dc', x, y, z, 0, 0.2, 0, { round: 0.01 });
  box(parent, 0.35, 0.02, 0.35, '#c45848', x, y + 0.04, z, 0, 0.2, 0);
}

function addCable(parent, x0, y0, z0, x1, y1, z1) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 0.1, mz = (z0 + z1) / 2;
  box(parent, 0.04, 0.04, Math.hypot(x1 - x0, z1 - z0) || 0.3, '#2a2a30', mx, my, mz, 0.2, Math.atan2(x1 - x0, z1 - z0), 0, { noShadow: true });
}

function addBoat(parent, x, y, z, color, ry = 0, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  g.scale.setScalar(scale);
  // pointed bow (wedge) + hull + cabin + mast — readable side silhouette
  box(g, 1.5, 0.4, 0.65, color, 0.1, 0.28, 0, 0, 0, 0, { round: 0.08 });
  box(g, 0.55, 0.35, 0.55, color, -0.75, 0.28, 0, 0, 0.7, 0, { round: 0.02 }); // bow taper
  box(g, 0.85, 0.5, 0.5, '#f0e6d0', 0.25, 0.7, 0, 0, 0, 0, { round: 0.05 });
  box(g, 0.08, 0.9, 0.08, '#5a4030', -0.2, 0.85, 0);
  box(g, 0.6, 0.4, 0.04, '#ebe4dc', -0.2, 1.2, 0);
  box(g, 0.35, 0.2, 0.04, '#4a8a98', 0.3, 0.75, 0.27);
  cyl(g, 0.08, 0.08, 0.12, '#c45848', 0.5, 0.95, 0);
  parent.add(g);
  return g;
}

function buildStudio(screens) {
  const g = new THREE.Group();
  g.name = 'studio';
  roomShell(g, 8, 6.5, '#5a6058', '#3a3830');
  // floor cable mats / rugs so floor isn't bare
  box(g, 2.2, 0.03, 1.4, '#4a4038', -1.4, 0.03, 0.4, 0, 0, 0, { round: 0.05 });
  box(g, 2.0, 0.03, 1.3, '#3a4840', 1.5, 0.03, 0.5, 0, 0.1, 0, { round: 0.05 });
  // row of desks with dual monitors
  addDesk(g, -2.0, 0, -2.0, 1.6);
  addDesk(g, 0.0, 0, -2.0, 1.6);
  addDesk(g, 2.0, 0, -2.0, 1.6);
  addMonitor(g, screens.code, -2.15, 0.72, -2.0, 0.15);
  addMonitor(g, screens.upload, -1.7, 0.72, -2.05, -0.2);
  addMonitor(g, screens.code, -0.2, 0.72, -2.0, 0.1);
  addMonitor(g, screens.years, 0.25, 0.72, -2.05, -0.15);
  addMonitor(g, screens.upload, 1.85, 0.72, -2.0, 0.1);
  addMonitor(g, screens.code, 2.25, 0.72, -2.05, -0.2);
  addChair(g, -2.0, 0, -1.2, 0.1);
  addChair(g, 0.0, 0, -1.15, -0.05);
  addChair(g, 2.0, 0, -1.2, 0.08);
  // midground side desk
  addDesk(g, -2.6, 0, 0.3, 1.2);
  addMonitor(g, screens.code, -2.6, 0.72, 0.3, 0.6);
  addChair(g, -2.0, 0, 0.5, 1.2);
  addDesk(g, 2.6, 0, 0.4, 1.2);
  addMonitor(g, screens.upload, 2.6, 0.72, 0.4, -0.5);
  addCalendar(g, 0.0, 2.15, -3.05);
  // UPLOAD button — keep clear of character aisle (z~2.3)
  box(g, 1.0, 0.5, 0.22, '#6b8f6a', 2.4, 1.15, -0.4, 0, -0.25, 0, { round: 0.06 });
  const up = makeSign('UPLOAD', 0.9, 0.32, '#6b8f6a', '#f0e6d0', '#c4a35a');
  up.position.set(2.4, 1.15, -0.25);
  up.rotation.y = -0.25;
  g.add(up);
  addFilingCabinet(g, -3.2, 0, -1.6, 1.5);
  addFilingCabinet(g, -3.2, 0, 1.2, 1.3);
  addDevKitShelf(g, 3.1, 0, -2.0);
  addServerRack(g, 3.1, 0, 0.8);
  addWhiteboard(g, -0.2, 2.2, -3.1, 2.2, 1.0);
  // signs fully inside frame — mid wall, well below top crop
  const s1 = makeSign('BUG-4412', 1.1, 0.28, '#3a1818', '#c45848', '#e0c070');
  s1.position.set(-0.65, 2.45, -3.02);
  g.add(s1);
  const s2 = makeSign('ONE LINE', 1.0, 0.28, '#1a3020', '#6b8f6a', '#c4a35a');
  s2.position.set(0.8, 2.45, -3.02);
  g.add(s2);
  // coffee, sticky notes, pizza, cables
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -2.2 + i * 0.7, 0.82, -1.75);
  }
  for (let i = 0; i < 5; i++) {
    box(g, 0.16, 0.02, 0.16, ['#c4a35a', '#6b8f6a', '#a87890', '#4a8a98', '#c45848'][i],
      -1.5 + i * 0.55, 0.78, -1.55);
  }
  addPizzaBox(g, -1.0, 0.1, 1.0);
  addPizzaBox(g, 1.2, 0.1, 1.15);
  addPizzaBox(g, 0.2, 0.1, 1.35);
  addPlant(g, -1.8, 0, 1.5);
  addPlant(g, 1.8, 0, 1.55);
  // hanging sticky strips mid wall (fills empty band)
  for (let i = 0; i < 8; i++) {
    box(g, 0.18, 0.22, 0.02, ['#c4a35a', '#6b8f6a', '#a87890', '#4a8a98'][i % 4],
      -1.6 + i * 0.45, 1.55, -3.05);
  }
  // side mid shelves of boxes
  for (let i = 0; i < 4; i++) {
    box(g, 0.35, 0.25, 0.3, ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a'][i],
      -3.3, 0.9 + i * 0.35, 0.2, 0, 0.1, 0, { round: 0.02 });
    box(g, 0.35, 0.25, 0.3, ['#c4a35a', '#3a4858', '#a87890', '#4a8a98'][i],
      3.3, 0.9 + i * 0.35, 0.3, 0, -0.1, 0, { round: 0.02 });
  }
  addCable(g, -2.0, 0.05, -1.5, -1.5, 0.05, -0.5);
  addCable(g, 0.2, 0.05, -1.5, 0.8, 0.05, 0.2);
  addCable(g, 2.0, 0.05, -1.5, 2.5, 0.05, -0.3);
  addPlant(g, -3.0, 0, 1.8);
  addPlant(g, 3.0, 0, 1.6);
  addLamp(g, 2.8, 0, 1.3);
  addLamp(g, -2.8, 0, -0.5);
  // posters mid wall
  for (let i = 0; i < 3; i++) {
    const p = makePosterArt(i + 2, 0.5, 0.7);
    p.position.set(-2.4 + i * 2.2, 1.6, -3.1);
    g.add(p);
  }
  addWallShelf(g, 0, 3.15, -3.1, 5.8);
  addCeilingBeam(g, 0, 3.8, -1.5, 7);
  addCeilingBeam(g, 0, 3.8, 0.2, 7);
  addCeilingBeam(g, 0, 3.8, 1.4, 7);
  for (const lx of [-1.8, -0.6, 0.6, 1.8]) {
    box(g, 1.2, 0.1, 0.3, '#ebe4dc', lx, 3.7, -0.4, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.1, -3.2, 3.2, 2.95);
  const fl = new THREE.PointLight('#f5f0e0', 0.75, 9, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildHarbour(screens) {
  const g = new THREE.Group();
  g.name = 'harbour';
  // OUTDOOR harbour — no indoor ceiling/shelves (those made it read as a room)
  const wallH = 5.5;
  box(g, 12, 0.08, 11, '#1a7090', 0, 0, -0.5); // water floor
  // sky backdrop (no book shelves)
  box(g, 12, wallH, 0.2, '#7ab0c8', 0, wallH / 2, -5.0, 0, 0, 0, { noShadow: true });
  box(g, 0.2, wallH, 11, '#6aa0b8', -6, wallH / 2, -0.5, 0, 0, 0, { noShadow: true });
  box(g, 0.2, wallH, 11, '#6aa0b8', 6, wallH / 2, -0.5, 0, 0, 0, { noShadow: true });
  // open sky “ceiling” light wash (not a room lid)
  box(g, 12, 0.05, 11, '#a8c8d8', 0, wallH, -0.5, 0, 0, 0, {
    mat: { emissive: '#c8e0f0', emissiveIntensity: 0.45 }, noShadow: true,
  });
  // water ripples
  for (let i = 0; i < 16; i++) {
    box(g, 11, 0.02, 0.14, i % 2 ? '#4ab0c8' : '#0a5070', 0, 0.05, -4.2 + i * 0.5, 0, 0, 0, { noShadow: true });
  }
  // wooden pier — side docks + short front planks (center aisle clear for character)
  box(g, 3.4, 0.22, 2.6, '#6a4a30', -3.4, 0.14, 2.0);
  box(g, 3.4, 0.22, 2.6, '#6a4a30', 3.4, 0.14, 2.0);
  box(g, 2.8, 0.22, 1.8, '#5a3a20', -3.2, 0.14, 0.3);
  box(g, 2.8, 0.22, 1.8, '#5a3a20', 3.2, 0.14, 0.3);
  // pier plank lines
  for (let i = 0; i < 6; i++) {
    box(g, 3.2, 0.02, 0.08, '#4a3020', -3.4, 0.26, 1.0 + i * 0.35, 0, 0, 0, { noShadow: true });
    box(g, 3.2, 0.02, 0.08, '#4a3020', 3.4, 0.26, 1.0 + i * 0.35, 0, 0, 0, { noShadow: true });
  }
  for (const [x, z] of [[-4.5, 2.8], [-4.5, 1.2], [4.5, 2.8], [4.5, 1.2], [-4.5, -0.2], [4.5, -0.2]]) {
    cyl(g, 0.12, 0.14, 0.85, '#3a2818', x, 0.25, z);
  }
  // suspension bridge OVERHEAD — closer so it fills the top of frame
  box(g, 9, 0.3, 1.6, '#5a5a60', 0, 2.35, -1.6);
  box(g, 0.45, 2.6, 0.45, '#4a4a50', -3.8, 1.3, -1.6);
  box(g, 0.45, 2.6, 0.45, '#4a4a50', 3.8, 1.3, -1.6);
  box(g, 0.3, 0.9, 0.3, '#3a3a40', -3.8, 2.85, -1.6);
  box(g, 0.3, 0.9, 0.3, '#3a3a40', 3.8, 2.85, -1.6);
  for (let i = 0; i < 9; i++) {
    const x = -3.5 + i * 0.85;
    box(g, 0.06, 1.4, 0.06, '#d0d0d0', x, 2.95, -1.6, 0.3, 0, 0, { noShadow: true });
  }
  box(g, 1.6, 0.12, 1.2, '#c4a35a', 0, 2.52, -1.5); // patch plate
  box(g, 0.5, 0.22, 0.28, '#c45848', -1.6, 2.65, -1.45, 0, 0.1, 0, { round: 0.03 });
  box(g, 0.5, 0.22, 0.28, '#4a8a98', 1.3, 2.65, -1.5, 0, -0.1, 0, { round: 0.03 });
  // INVISIBLE WALL shimmer behind captain boat
  for (let i = 0; i < 20; i++) {
    box(g, 0.12, 2.0, 0.12, '#c8e8f0', -0.6 + i * 0.14, 1.1, 0.35, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.65, emissive: '#a8e0f0', emissiveIntensity: 1.0 },
      noShadow: true,
    });
  }
  for (let i = 0; i < 7; i++) {
    box(g, 2.9, 0.06, 0.06, '#e0f4f8', 0.6, 0.35 + i * 0.28, 0.4, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.6, emissive: '#c0e8f0', emissiveIntensity: 0.85 },
      noShadow: true,
    });
  }
  // BOATS — large, flanking character + captain boat into wall
  // foam around boats
  for (const [fx, fz] of [[0.85, 1.05], [-1.85, 1.7], [1.95, 1.65]]) {
    cyl(g, 0.55, 0.55, 0.04, '#d8eef4', fx, 0.08, fz, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.55, emissive: '#e8f6fa', emissiveIntensity: 0.4 }, noShadow: true,
    });
  }
  addBoat(g, 0.85, 0.28, 1.05, '#c45848', 0.55, 1.65); // captain hitting wall (offset so visible)
  addBoat(g, -1.85, 0.28, 1.7, '#4a8a98', -0.55, 1.45);
  addBoat(g, 1.95, 0.28, 1.65, '#e0c070', 0.5, 1.4);
  cyl(g, 0.14, 0.14, 0.14, '#e0c070', 0.7, 0.85, -0.25, 0, 0, 0, {
    mat: { emissive: '#e0c070', emissiveIntensity: 1.5 },
  });
  // buoys
  for (const [x, z] of [[-1.2, 1.6], [1.3, 1.55], [-2.6, 0.2], [2.7, 0.15], [-3.5, 1.8], [3.5, 1.7]]) {
    cyl(g, 0.18, 0.18, 0.5, '#c45848', x, 0.35, z);
    cyl(g, 0.14, 0.14, 0.16, '#ebe4dc', x, 0.62, z);
  }
  addCrate(g, -3.5, 0.25, 2.2, 'DOCK');
  addCrate(g, 3.5, 0.25, 2.1, 'GEAR');
  cyl(g, 0.28, 0.3, 0.5, '#8a6a40', -2.7, 0.45, 2.5);
  cyl(g, 0.28, 0.3, 0.5, '#8a6a40', 2.7, 0.45, 2.4);
  // skyline under bridge
  for (let i = 0; i < 8; i++) {
    box(g, 0.7, 1.0 + (i % 3) * 0.5, 0.55, i % 2 ? '#3a4858' : '#2a3848',
      -3.5 + i * 1.0, 0.7 + (i % 3) * 0.25, -3.6);
  }
  const wallSign = makeSign('INVISIBLE WALL', 1.25, 0.55, '#1a3038', '#c8e8f0', '#4a8a98');
  // Centered above the shimmer so 9:16 pulls/cranes keep the whole two-line sign inside frame.
  wallSign.position.set(0.0, 2.65, 0.95);
  g.add(wallSign);
  // Extra harbour dressing so crane/orbit/pull angles never read as empty water.
  for (const [x, z] of [[-2.2, -0.8], [2.3, -0.9], [-1.0, -2.2], [1.1, -2.3], [-3.2, -1.5], [3.2, -1.4]]) {
    cyl(g, 0.16, 0.16, 0.45, '#c45848', x, 0.35, z);
    cyl(g, 0.12, 0.12, 0.14, '#ebe4dc', x, 0.6, z);
  }
  for (let i = 0; i < 5; i++) {
    box(g, 0.55, 0.8 + (i % 3) * 0.35, 0.45, i % 2 ? '#2a3848' : '#3a4858',
      -2.5 + i * 1.2, 0.55 + (i % 3) * 0.15, -4.2);
  }
  addBoat(g, -3.2, 0.28, -0.6, '#6b8f6a', -0.4, 1.15);
  addBoat(g, 3.3, 0.28, -0.5, '#a87890', 0.45, 1.1);
  box(g, 2.4, 0.18, 1.2, '#5a3a20', 0, 0.12, 2.6); // front pier plank for feet contact read
  // soft sky discs (not hanging fixtures)
  for (const lx of [-2.5, 2.5]) {
    cyl(g, 0.9, 0.9, 0.15, '#d8e8f0', lx, 4.2, -3.2, 0, 0, 0, {
      mat: { emissive: '#e8f4f8', emissiveIntensity: 0.35 }, noShadow: true,
    });
  }
  const waterLight = new THREE.PointLight('#8ab0c0', 0.85, 14, 2);
  waterLight.position.set(0, 3.0, 1);
  g.add(waterLight);
  const sunH = new THREE.PointLight('#f5e6c8', 0.7, 16, 2);
  sunH.position.set(2, 4.0, 3);
  g.add(sunH);
  return g;
}

function buildQa(screens) {
  const g = new THREE.Group();
  g.name = 'qa';
  roomShell(g, 9, 7, '#4a5a58', '#3a3a40');
  // floor stripe mats
  for (let i = 0; i < 6; i++) {
    box(g, 1.2, 0.02, 5.5, i % 2 ? '#4a5058' : '#2a3038', -3 + i * 1.2, 0.03, 0);
  }
  // TWO rows of test stations
  for (let row = 0; row < 2; row++) {
    const z = -2.2 + row * 1.5;
    for (let i = 0; i < 4; i++) {
      const x = -2.7 + i * 1.8;
      addDesk(g, x, 0, z, 1.4);
      addMonitor(g, screens.qa, x - 0.15, 0.72, z, 0.05);
      addMonitor(g, screens.city, x + 0.35, 0.72, z + 0.05, -0.15);
      box(g, 0.28, 0.08, 0.18, '#2a2a30', x + 0.2, 0.8, z + 0.25, 0, 0, 0, { round: 0.03 });
      addChair(g, x, 0, z + 0.75, 0.05 * (i % 2 ? 1 : -1));
      // headset on desk
      cyl(g, 0.08, 0.08, 0.04, '#3a3a40', x - 0.4, 0.8, z + 0.15);
    }
  }
  // giant city map board with water/land patches + pins
  box(g, 5.6, 2.7, 0.1, '#2a3840', 0, 2.15, -3.3);
  box(g, 5.3, 2.5, 0.04, '#3a6a78', 0, 2.15, -3.24); // water base
  // land blocks
  for (let i = 0; i < 10; i++) {
    box(g, 0.7 + (i % 3) * 0.2, 0.55 + (i % 2) * 0.25, 0.03,
      i % 2 ? '#6b8f6a' : '#8a9a60',
      -2.1 + (i % 5) * 1.05, 1.35 + Math.floor(i / 5) * 1.1, -3.21, 0, 0, 0, { noShadow: true });
  }
  // streets
  for (let i = 0; i < 5; i++) {
    box(g, 4.9, 0.04, 0.02, '#d8c8a0', 0, 1.3 + i * 0.4, -3.2, 0, 0, 0, { noShadow: true });
    box(g, 0.04, 2.2, 0.02, '#d8c8a0', -1.8 + i * 0.9, 2.15, -3.2, 0, 0, 0, { noShadow: true });
  }
  // bridge mark on map
  box(g, 1.8, 0.08, 0.03, '#5a5a60', 0.2, 2.0, -3.19);
  const pinCols = ['#c45848', '#c4a35a', '#6b8f6a', '#4a8a98', '#a87890', '#e0c070'];
  for (let i = 0; i < 40; i++) {
    const px = -2.3 + (i % 10) * 0.5;
    const py = 1.15 + Math.floor(i / 10) * 0.5;
    cyl(g, 0.07, 0.02, 0.12, pinCols[i % pinCols.length], px, py, -3.17);
  }
  const mapSign = makeSign('CITY MAP — FULL REPLAY', 2.4, 0.32, '#2a3848', '#f0e6d0', '#6b8f6a');
  mapSign.position.set(0, 3.4, -3.2);
  g.add(mapSign);
  // side shelves / cabinets
  addFilingCabinet(g, -3.8, 0, 0.2, 1.8);
  addFilingCabinet(g, 3.8, 0, 0.2, 1.8);
  addDevKitShelf(g, -3.8, 0, -2.0);
  addServerRack(g, 3.8, 0, -2.0);
  addWhiteboard(g, 1.6, 2.35, -3.22, 1.3, 0.85);
  // midground prop tables with controllers / clipboards
  box(g, 1.2, 0.55, 0.6, '#5a4030', -2.5, 0.28, 1.6, 0, 0, 0, { round: 0.04 });
  box(g, 1.2, 0.55, 0.6, '#5a4030', 2.5, 0.28, 1.6, 0, 0, 0, { round: 0.04 });
  for (let i = 0; i < 3; i++) {
    box(g, 0.28, 0.08, 0.18, '#2a2a30', -2.8 + i * 0.3, 0.6, 1.6, 0, 0, 0, { round: 0.03 });
    box(g, 0.28, 0.08, 0.18, '#3a3a40', 2.2 + i * 0.3, 0.6, 1.6, 0, 0, 0, { round: 0.03 });
  }
  addClipboard(g, -2.3, 0.65, 1.5);
  addClipboard(g, 2.7, 0.65, 1.5);
  addPlant(g, -3.5, 0, 2.2);
  addPlant(g, 3.5, 0, 2.2);
  addLamp(g, -3.5, 0, 1.0);
  addLamp(g, 3.5, 0, 1.0);
  // coffee cups
  for (let i = 0; i < 5; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -1.5 + i * 0.7, 0.12, 2.0);
  }
  addWallShelf(g, -1.8, 3.15, -3.25, 2.4);
  addWallShelf(g, 1.8, 3.15, -3.25, 2.4);
  addCeilingBeam(g, 0, 3.85, -1.8, 8);
  addCeilingBeam(g, 0, 3.85, 0, 8);
  addCeilingBeam(g, 0, 3.85, 1.5, 8);
  for (const lx of [-2, -0.7, 0.7, 2]) {
    box(g, 1.3, 0.1, 0.3, '#ebe4dc', lx, 3.75, -0.3, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.3, -3.8, 3.8, 2.95);
  const fl = new THREE.PointLight('#f5f0e0', 0.85, 10, 2);
  fl.position.set(0, 3.2, 0);
  g.add(fl);
  return g;
}

function buildCert(screens) {
  const g = new THREE.Group();
  g.name = 'cert';
  roomShell(g, 8, 6.5, '#5a5550', '#3a3835');
  box(g, 3.0, 0.03, 2.0, '#4a4038', 0.2, 0.03, 0.5, 0, 0, 0, { round: 0.05 });
  addStampDesk(g, 0.2, 0, -1.9);
  addDesk(g, -2.0, 0, -1.9, 1.4);
  addDesk(g, 2.0, 0, -1.9, 1.4);
  addMonitor(g, screens.cert, -2.0, 0.72, -1.9, 0.1);
  addMonitor(g, screens.cert, 0.0, 0.85, -1.85, 0);
  addMonitor(g, screens.qa, 2.0, 0.72, -1.9, -0.1);
  addChair(g, -2.0, 0, -1.1);
  addChair(g, 0.3, 0, -1.15);
  addChair(g, 2.0, 0, -1.1);
  // towering rulebook shelves — both walls, dense
  for (let col = 0; col < 6; col++) {
    box(g, 0.55, 2.5, 0.4, '#5a4030', -3.0 + col * 0.6, 1.25, -3.0);
    for (let row = 0; row < 7; row++) {
      const cols = ['#c45848', '#4a8a98', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858', '#8a6a40'];
      box(g, 0.45, 0.12, 0.3, cols[(col + row) % cols.length],
        -3.0 + col * 0.6, 0.3 + row * 0.32, -2.85, 0, 0.04, 0, { round: 0.01 });
    }
  }
  // more shelves on right
  for (let col = 0; col < 3; col++) {
    box(g, 0.55, 2.2, 0.4, '#5a4030', 2.2 + col * 0.55, 1.1, -3.0);
    for (let row = 0; row < 6; row++) {
      box(g, 0.45, 0.12, 0.3, ['#4a8a98', '#c45848', '#c4a35a'][row % 3],
        2.2 + col * 0.55, 0.3 + row * 0.32, -2.85, 0, 0, 0, { round: 0.01 });
    }
  }
  addPassFailBins(g, 2.4, 0, -0.8);
  addFilingCabinet(g, -3.3, 0, 0.3, 1.8);
  addFilingCabinet(g, 3.3, 0, 0.5, 1.6);
  addClipboard(g, -0.4, 0.85, -1.55);
  addWhiteboard(g, 0.5, 2.35, -3.05, 1.6, 0.9);
  // big FAILED stamp — mid-right, not blocking character
  box(g, 0.7, 0.15, 0.7, '#c45848', 1.8, 1.35, 0.2, 0, 0.25, 0, { round: 0.04 });
  cyl(g, 0.12, 0.15, 0.35, '#8a3030', 1.8, 1.65, 0.2);
  // signs fully in frame
  const fail = makeSign('FAILED', 1.1, 0.3, '#3a1818', '#c45848', '#e0c070');
  fail.position.set(1.2, 2.85, -3.0);
  g.add(fail);
  const books = makeSign('RULEBOOKS', 1.3, 0.3, '#2a3228', '#f0e6d0', '#c4a35a');
  books.position.set(-1.4, 2.85, -3.0);
  g.add(books);
  // stacks of paper midground
  for (let layer = 0; layer < 5; layer++) {
    box(g, 0.4, 0.06, 0.3, '#ebe4dc', -2.2, 0.15 + layer * 0.07, 1.2, 0, 0.05, 0, { round: 0.01 });
    box(g, 0.4, 0.06, 0.3, '#d8c8a0', 2.2, 0.15 + layer * 0.07, 1.3, 0, -0.05, 0, { round: 0.01 });
  }
  addPlant(g, -3.2, 0, 1.8);
  addPlant(g, 3.2, 0, 1.8);
  addLamp(g, -3.0, 0, -0.5);
  addLamp(g, 3.0, 0, -0.5);
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -1.0 + i * 0.5, 0.82, -1.6);
  }
  addWallShelf(g, 0, 3.2, -3.05, 5.5);
  addCeilingBeam(g, 0, 3.85, -1.5, 7);
  addCeilingBeam(g, 0, 3.85, 0.2, 7);
  addCeilingBeam(g, 0, 3.85, 1.4, 7);
  for (const lx of [-1.6, 0, 1.6]) {
    box(g, 1.5, 0.1, 0.3, '#ebe4dc', lx, 3.75, -0.3, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.05, -3.4, 3.4, 2.95);
  const fl = new THREE.PointLight('#f5f0e0', 0.85, 9, 2);
  fl.position.set(0, 3.1, 0);
  g.add(fl);
  return g;
}

function buildYears(screens) {
  const g = new THREE.Group();
  g.name = 'years';
  roomShell(g, 8.5, 6.5, '#5a5048', '#3a3028');
  box(g, 3.2, 0.03, 2.2, '#4a4038', 0, 0.03, 0.6, 0, 0, 0, { round: 0.05 });
  // multiple desks
  addDesk(g, -1.8, 0, -2.0, 1.6);
  addDesk(g, 0.3, 0, -2.0, 1.8);
  addDesk(g, 2.2, 0, -2.0, 1.4);
  addMonitor(g, screens.years, -1.8, 0.72, -2.0);
  addMonitor(g, screens.code, 0.1, 0.72, -2.0);
  addMonitor(g, screens.upload, 0.55, 0.72, -2.05, -0.2);
  addMonitor(g, screens.years, 2.2, 0.72, -2.0);
  addChair(g, -1.8, 0, -1.2);
  addChair(g, 0.3, 0, -1.15);
  addChair(g, 2.2, 0, -1.2);
  // YEAR 10 calendar — fully in frame
  box(g, 1.3, 1.5, 0.06, '#f4f0ea', -1.8, 2.25, -3.05);
  box(g, 1.3, 0.28, 0.07, '#c45848', -1.8, 2.85, -3.03);
  const y10 = makeSign('YEAR 10', 1.1, 0.36, '#c45848', '#f0e6d0', '#e0c070');
  y10.position.set(-1.8, 2.3, -3.0);
  g.add(y10);
  // mountain of test reports — camera right midground
  for (let layer = 0; layer < 12; layer++) {
    for (let i = 0; i < 4; i++) {
      box(g, 0.5 - layer * 0.015, 0.07, 0.38,
        ['#ebe4dc', '#d8c8a0', '#c8d4c0', '#f0e6d0'][i % 4],
        1.7 + (i - 1.5) * 0.12, 0.18 + layer * 0.09, 0.9 + i * 0.04, 0, 0.04 * i, 0, { round: 0.01 });
    }
  }
  const reports = makeSign('TEST REPORTS', 1.15, 0.26, '#2a3228', '#f0e6d0', '#c4a35a');
  reports.position.set(1.7, 1.4, 1.1);
  g.add(reports);
  // egg timer
  cyl(g, 0.1, 0.14, 0.06, '#c4a35a', -1.0, 0.78, -1.65);
  cyl(g, 0.025, 0.025, 0.28, '#8a6a40', -1.0, 0.96, -1.65);
  cyl(g, 0.12, 0.1, 0.14, '#ebe4dc', -1.0, 1.14, -1.65, 0, 0, 0, {
    mat: { transparent: true, opacity: 0.75 },
  });
  const timer = makeSign('10 MIN', 0.65, 0.2, '#3a3028', '#e0c070', '#c4a35a');
  timer.position.set(-1.0, 1.4, -1.5);
  g.add(timer);
  addServerRack(g, -3.4, 0, -1.5);
  addFilingCabinet(g, -3.4, 0, 0.8, 1.5);
  addShelf(g, 3.2, 0, -1.5);
  addDevKitShelf(g, 3.2, 0, 0.5);
  addWhiteboard(g, 1.0, 2.3, -3.05, 1.8, 1.0);
  const prove = makeSign('PROVE IT', 1.2, 0.3, '#1a3020', '#6b8f6a', '#c4a35a');
  prove.position.set(1.2, 2.9, -3.0);
  g.add(prove);
  // coffee cups everywhere
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -2.6 + i * 0.55, 0.12, 1.4);
  }
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.05, 0.06, 0.1, '#ebe4dc', -1.5 + i * 0.4, 0.82, -1.7);
  }
  addPizzaBox(g, -2.2, 0.1, 1.0);
  addPizzaBox(g, 0.5, 0.1, 1.3);
  addCable(g, -1.5, 0.05, -1.5, -0.5, 0.05, 0.5);
  addCable(g, 1.0, 0.05, -1.5, 1.8, 0.05, 0.8);
  addPlant(g, -3.2, 0, 2.0);
  addPlant(g, 3.2, 0, 2.0);
  addLamp(g, 2.8, 0, 1.5);
  addLamp(g, -2.8, 0, 1.5);
  addWallShelf(g, 0, 3.2, -3.05, 5.5);
  addCeilingBeam(g, 0, 3.85, -1.5, 7.5);
  addCeilingBeam(g, 0, 3.85, 0.2, 7.5);
  addCeilingBeam(g, 0, 3.85, 1.5, 7.5);
  for (const lx of [-1.8, -0.6, 0.6, 1.8]) {
    box(g, 1.2, 0.1, 0.3, '#ebe4dc', lx, 3.75, -0.3, 0, 0, 0, {
      mat: { emissive: '#f5f0e0', emissiveIntensity: 0.5 },
    });
  }
  addUpperWallDressing(g, -3.05, -3.5, 3.5, 2.95);
  const fl = new THREE.PointLight('#f5f0e0', 0.8, 9, 2);
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
