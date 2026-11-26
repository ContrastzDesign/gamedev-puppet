// Two-Minecrafts V1 story sets — densely dressed booths.
// Bedroom, merge bay, Java den, Bedrock workshop, parity yard,
// worlds/mods library, comment arena, game store.
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

function addCrt(parent, tex, x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  box(g, 0.95, 0.8, 0.7, '#3a3a42', 0, 0.4, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.78, 0.6, 0.08, '#1a1a1e', 0, 0.45, 0.36);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.52),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0.45, 0.41);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  scr.userData.signText = 'CRT';
  g.add(scr);
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.03, 0.03, 0.04, i === 0 ? '#6b8f6a' : '#c45848', -0.25 + i * 0.12, 0.08, 0.38);
  }
  parent.add(g);
  return g;
}

function addPhoneProp(parent, tex, x, y, z, scale = 1) {
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
  parent.add(g);
  return g;
}

function addConsole(parent, x, y, z, color = '#3a4858') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.55, 0.18, 0.4, color, 0, 0.1, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.35, 0.08, 0.02, '#1c1c20', 0, 0.14, 0.21);
  cyl(g, 0.03, 0.03, 0.04, '#6b8f6a', 0.18, 0.2, 0.05);
  parent.add(g);
  return g;
}

function addTablet(parent, tex, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.55, 0.4, 0.04, '#1c1c20', 0, 0, 0, 0, 0, 0, { round: 0.02 });
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.34),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0, 0.025);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  scr.userData.signText = 'TABLET';
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

function addRug(parent, x, y, z, w = 2.5, d = 1.8, c1 = '#8a5a48', c2 = '#c4a07a') {
  box(parent, w, 0.03, d, c1, x, y + 0.02, z, 0, 0, 0, { round: 0.02 });
  box(parent, w * 0.85, 0.02, d * 0.75, c2, x, y + 0.035, z);
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

function boothShell(floorCol = '#6a5848', wallCol = '#c8b8a0') {
  const g = new THREE.Group();
  box(g, 8, 0.08, 7, floorCol, 0, 0, 0);
  box(g, 8, 4.2, 0.15, wallCol, 0, 2.1, -3.2);
  box(g, 0.15, 4.2, 7, wallCol, -4, 2.1, 0);
  box(g, 0.15, 4.2, 7, wallCol, 4, 2.1, 0);
  box(g, 8, 0.15, 7, '#ebe4dc', 0, 4.15, 0);
  return g;
}

function addBleachers(parent, x, z, side = 1) {
  for (let row = 0; row < 4; row++) {
    box(parent, 1.4, 0.16, 0.45, '#6a5848', x, 0.2 + row * 0.32, z + row * 0.18 * side, 0, 0, 0, { round: 0.01 });
    for (let s = 0; s < 3; s++) {
      box(parent, 0.2, 0.22, 0.12, ['#c45848', '#4a8a98', '#c4a35a'][s],
        x - 0.4 + s * 0.4, 0.38 + row * 0.32, z + 0.1 + row * 0.18 * side);
    }
  }
}

function addBlockPile(parent, x, y, z, color, n = 6) {
  for (let i = 0; i < n; i++) {
    const sx = 0.28 + (i % 3) * 0.04;
    box(parent, sx, sx, sx, color,
      x + (i % 3) * 0.32 - 0.32, y + Math.floor(i / 3) * 0.32 + sx / 2, z + (i % 2) * 0.1,
      0, 0.1 * i, 0, { round: 0.01 });
  }
}

function addScaffold(parent, x, z, color = '#c4a35a') {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  for (const sx of [-0.55, 0.55]) {
    for (const sz of [-0.4, 0.4]) {
      box(g, 0.08, 2.4, 0.08, '#5a6068', sx, 1.2, sz);
    }
  }
  for (let level = 0; level < 3; level++) {
    box(g, 1.3, 0.06, 1.0, '#6a7078', 0, 0.7 + level * 0.7, 0);
    box(g, 0.5 + level * 0.15, 0.4, 0.5 + level * 0.1, color, 0, 0.95 + level * 0.7, 0, 0, 0, 0, { round: 0.02 });
  }
  parent.add(g);
  return g;
}

function addCraneArm(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.18, 2.2, 0.18, '#c4a35a', 0, 1.1, 0);
  box(g, 1.8, 0.12, 0.12, '#c4a35a', 0.7, 2.15, 0);
  cyl(g, 0.02, 0.02, 0.9, '#3a3a40', 1.4, 1.7, 0);
  box(g, 0.25, 0.25, 0.25, '#4a8a98', 1.4, 1.2, 0, 0, 0, 0, { round: 0.02 });
  parent.add(g);
  return g;
}

// ---- BOOTHS ----

function buildBedroom(screens) {
  const g = boothShell('#7a6a58', '#d4c4a8');
  // carpet + layered rugs
  addRug(g, 0, 0, 0.4, 3.4, 2.4, '#5a3a58', '#8a5a78');
  addRug(g, -1.2, 0, -1.2, 1.4, 1.0, '#3a4858', '#6a7a88');

  // bunk bed (left)
  box(g, 1.8, 0.12, 1.0, '#5a4030', -2.2, 0.45, -1.8);
  box(g, 1.8, 0.12, 1.0, '#5a4030', -2.2, 1.55, -1.8);
  box(g, 0.1, 1.7, 0.1, '#4a3020', -3.0, 0.9, -2.2);
  box(g, 0.1, 1.7, 0.1, '#4a3020', -1.4, 0.9, -2.2);
  box(g, 0.1, 1.7, 0.1, '#4a3020', -3.0, 0.9, -1.4);
  box(g, 0.1, 1.7, 0.1, '#4a3020', -1.4, 0.9, -1.4);
  box(g, 1.7, 0.2, 0.85, '#6a8f6a', -2.2, 0.6, -1.8, 0, 0, 0, { round: 0.04 });
  box(g, 1.7, 0.2, 0.85, '#4a6a78', -2.2, 1.7, -1.8, 0, 0, 0, { round: 0.04 });
  box(g, 0.4, 0.18, 0.35, '#ebe4dc', -2.7, 0.75, -1.6, 0, 0, 0, { round: 0.03 });
  box(g, 0.4, 0.18, 0.35, '#ebe4dc', -2.7, 1.85, -1.6, 0, 0, 0, { round: 0.03 });
  // ladder
  box(g, 0.08, 1.5, 0.08, '#4a3020', -1.35, 0.85, -1.3);
  box(g, 0.08, 1.5, 0.08, '#4a3020', -1.35, 0.85, -1.7);
  for (let i = 0; i < 4; i++) box(g, 0.08, 0.05, 0.4, '#4a3020', -1.35, 0.35 + i * 0.35, -1.5);

  // big TV — farm OK
  addTv(g, screens.farmOk, 0.3, 1.85, -3.05, 1.0);

  // desk with smaller console/phone — farm break
  addDesk(g, 2.0, 0, -1.4, 1.5);
  addChair(g, 2.0, 0, -0.55);
  addPhoneProp(g, screens.farmBreak, 2.35, 1.15, -1.25, 0.75);
  addConsole(g, 1.6, 0.72, -1.3, '#2a3038');
  // snacks / cans / controllers on desk
  box(g, 0.2, 0.28, 0.12, '#c45848', 1.4, 0.9, -1.2, 0, 0.2, 0, { round: 0.02 });
  cyl(g, 0.05, 0.05, 0.16, '#4a8a98', 2.55, 0.85, -1.15);
  cyl(g, 0.05, 0.05, 0.16, '#c4a35a', 2.7, 0.85, -1.25);
  box(g, 0.28, 0.06, 0.16, '#3a4858', 1.85, 0.78, -1.15, 0, 0.3, 0, { round: 0.02 });

  // LED strip glow along back wall
  for (let i = 0; i < 14; i++) {
    box(g, 0.18, 0.05, 0.05, i % 2 ? '#6b8f6a' : '#4a8a98', -3.2 + i * 0.48, 2.85, -3.08, 0, 0, 0, {
      mat: { emissive: i % 2 ? '#6b8f6a' : '#4a8a98', emissiveIntensity: 0.55 },
      noShadow: true,
    });
  }
  const ledGlow = new THREE.PointLight('#6b8f6a', 0.45, 6, 2);
  ledGlow.position.set(0, 2.7, -2.4);
  g.add(ledGlow);

  // posters
  for (let i = 0; i < 4; i++) {
    const p = makePosterArt(i, 0.55, 0.8);
    p.position.set(-2.4 + i * 0.7, 2.35, -3.08);
    if (i === 1 || i === 2) continue; // leave space for TV / signs
    g.add(p);
  }
  const pL = makePosterArt(0, 0.6, 0.85);
  pL.position.set(-1.9, 2.35, -3.08);
  g.add(pL);
  const pR = makePosterArt(2, 0.6, 0.85);
  pR.position.set(1.9, 2.35, -3.08);
  g.add(pR);

  // wall shelves with figures / books
  addWallShelf(g, -2.2, 3.35, -3.1, 2.2);
  addWallShelf(g, 2.2, 3.35, -3.1, 2.2);
  addShelf(g, -3.3, 0, 0.8);
  addShelf(g, 3.3, 0, 0.5);

  // beanbag / floor clutter
  box(g, 0.9, 0.45, 0.9, '#a87890', 1.4, 0.28, 1.2, 0, 0.4, 0, { round: 0.12 });
  box(g, 0.35, 0.25, 0.3, '#8a6a40', -1.4, 0.15, 1.5, 0, 0.2, 0, { round: 0.02 });
  box(g, 0.3, 0.2, 0.28, '#4a8a98', -1.0, 0.12, 1.6, 0, -0.1, 0, { round: 0.02 });
  for (let i = 0; i < 5; i++) {
    box(g, 0.22, 0.22, 0.22, ['#6b8f6a', '#c45848', '#c4a35a', '#4a8a98', '#a87890'][i],
      -0.6 + i * 0.35, 0.12, 1.9, 0, 0.15, 0, { round: 0.02 });
  }

  // snack shelf / nightstand
  box(g, 0.55, 0.7, 0.45, '#5a4030', 3.1, 0.35, -2.4);
  for (let i = 0; i < 3; i++) {
    box(g, 0.14, 0.2, 0.1, ['#c45848', '#4a8a98', '#c4a35a'][i], 2.95 + i * 0.12, 0.8, -2.35);
  }

  addLamp(g, -3.2, 0, -0.4);
  addLamp(g, 3.2, 0, 1.4);
  addPlant(g, -3.1, 0, 1.9);
  addPlant(g, 3.0, 0, 2.0);
  addCouch(g, 0.2, 0, 1.0);

  // signs — high, centered-ish, above caption band
  const javaOk = makeSign('JAVA OK', 1.05, 0.28, '#1a3028', '#8ad0a0', '#6b8f6a');
  javaOk.position.set(-1.15, 2.95, -3.05);
  g.add(javaOk);
  const bedQ = makeSign('BEDROCK?', 1.05, 0.28, '#3a2020', '#e0a070', '#c45848');
  bedQ.position.set(1.15, 2.95, -3.05);
  g.add(bedQ);

  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.6, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.05);
  const fl = new THREE.PointLight('#f0e4d0', 0.9, 10, 2);
  fl.position.set(0, 3.1, 0.3);
  g.add(fl);
  return g;
}

function buildMerge(screens) {
  const g = boothShell('#6a6058', '#c0b098');
  addRug(g, 0, 0, 0.5, 3.0, 2.0, '#5a5040', '#8a7a60');

  // twin giant block towers — teal vs amber
  for (let level = 0; level < 5; level++) {
    const s = 0.85 - level * 0.05;
    box(g, s, s, s, '#3a9a98', -1.2, 0.45 + level * 0.75, -1.0, 0, 0.05, 0, { round: 0.03 });
    box(g, s, s, s, '#d0a040', 1.2, 0.45 + level * 0.75, -1.0, 0, -0.05, 0, { round: 0.03 });
  }
  // glow accents on towers
  box(g, 0.9, 0.08, 0.9, '#4ab0a8', -1.2, 3.85, -1.0, 0, 0, 0, {
    mat: { emissive: '#4ab0a8', emissiveIntensity: 0.4 },
  });
  box(g, 0.9, 0.08, 0.9, '#e0b050', 1.2, 3.85, -1.0, 0, 0, 0, {
    mat: { emissive: '#e0b050', emissiveIntensity: 0.4 },
  });

  // glue bottle trying to join them
  cyl(g, 0.12, 0.15, 0.55, '#ebe4dc', 0, 1.6, -0.7);
  cyl(g, 0.05, 0.08, 0.2, '#c45848', 0, 2.0, -0.7);
  box(g, 0.35, 0.08, 0.08, '#c4a35a', 0, 1.55, -0.5, 0, 0, 0.3);
  // rope / cable between towers
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    cyl(g, 0.025, 0.025, 0.35, '#8a6a40',
      -0.9 + t * 1.8, 2.4 + Math.sin(t * Math.PI) * 0.25, -0.85,
      0, 0, Math.PI / 2 + (t - 0.5) * 0.3);
  }

  // referee whistle prop on pedestal
  box(g, 0.6, 0.5, 0.5, '#5a4030', 0, 0.28, 0.6, 0, 0, 0, { round: 0.03 });
  cyl(g, 0.08, 0.1, 0.2, '#c4a35a', 0, 0.65, 0.6);
  box(g, 0.06, 0.04, 0.12, '#2a3038', 0, 0.78, 0.68);
  cyl(g, 0.03, 0.03, 0.25, '#3a3a40', 0.12, 0.72, 0.6, 0, 0, Math.PI / 2);

  // MERGE? banners — centered high
  const merge1 = makeSign('MERGE?', 1.2, 0.32, '#2a3228', '#f0e6d0', '#c4a35a');
  merge1.position.set(0, 2.85, -3.05);
  g.add(merge1);
  const one = makeSign('INTO ONE?', 1.1, 0.28, '#1a3040', '#8ab0c8', '#4a8a98');
  one.position.set(0, 3.25, -3.05);
  g.add(one);

  // bleachers / crates left & right
  addBleachers(g, -2.6, 0.3, 1);
  addBleachers(g, 2.6, 0.3, 1);
  for (let i = 0; i < 6; i++) {
    box(g, 0.4, 0.35, 0.35, ['#8a6a40', '#6a5848', '#5a4030'][i % 3],
      -3.0 + (i % 3) * 0.45, 0.2 + Math.floor(i / 3) * 0.35, 1.7, 0, 0.1, 0, { round: 0.02 });
    box(g, 0.4, 0.35, 0.35, ['#8a6a40', '#6a5848', '#5a4030'][i % 3],
      2.1 + (i % 3) * 0.45, 0.2 + Math.floor(i / 3) * 0.35, 1.7, 0, -0.1, 0, { round: 0.02 });
  }

  // foam / block piles midground
  addBlockPile(g, -1.8, 0, 1.3, '#3a9a98', 6);
  addBlockPile(g, 1.8, 0, 1.3, '#d0a040', 6);

  // wall dressing
  addWallShelf(g, -2.0, 3.45, -3.1, 2.0);
  addWallShelf(g, 2.0, 3.45, -3.1, 2.0);
  const p1 = makePosterArt(1, 0.55, 0.75);
  p1.position.set(-2.3, 2.2, -3.08);
  g.add(p1);
  const p2 = makePosterArt(3, 0.55, 0.75);
  p2.position.set(2.3, 2.2, -3.08);
  g.add(p2);

  addShelf(g, -3.3, 0, -2.0);
  addShelf(g, 3.3, 0, -2.0);
  addLamp(g, -3.2, 0, 0.5);
  addLamp(g, 3.2, 0, 0.5);
  addPlant(g, -3.1, 0, 2.1);
  addPlant(g, 3.1, 0, 2.1);

  // unused screens on side monitors for density
  addDesk(g, -2.4, 0, -2.2, 1.2);
  addMonitor(g, screens.codeJava, -2.4, 0.72, -2.25);
  addDesk(g, 2.4, 0, -2.2, 1.2);
  addMonitor(g, screens.codeBedrock, 2.4, 0.72, -2.25);

  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.0);
  const fl = new THREE.PointLight('#f0e8d8', 0.95, 11, 2);
  fl.position.set(0, 3.2, 0.2);
  g.add(fl);
  const teal = new THREE.PointLight('#4ab0a8', 0.35, 5, 2);
  teal.position.set(-1.2, 2.5, -0.5);
  g.add(teal);
  const amber = new THREE.PointLight('#e0b050', 0.35, 5, 2);
  amber.position.set(1.2, 2.5, -0.5);
  g.add(amber);
  return g;
}

function buildJava(screens) {
  const g = boothShell('#5a4a40', '#b8a888');
  // warm wood plank floor
  for (let i = -3; i <= 3; i++) {
    box(g, 0.95, 0.05, 6.5, i % 2 ? '#5a4030' : '#6a5040', i, 0.04, 0);
  }
  addRug(g, 0, 0, 0.3, 2.6, 1.8, '#6a3a30', '#8a5a48');

  // main desk + CRT
  addDesk(g, 0, 0, -1.5, 2.2);
  addCrt(g, screens.codeJava, -0.3, 0.72, -1.55, 1.05);
  addChair(g, 0.1, 0, -0.55);

  // stacked manuals
  for (let i = 0; i < 6; i++) {
    box(g, 0.35, 0.06, 0.28, ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858'][i],
      0.85, 0.8 + i * 0.07, -1.4, 0, 0.05 * (i % 3), 0);
  }
  // coffee mugs
  cyl(g, 0.07, 0.06, 0.14, '#ebe4dc', -0.95, 0.85, -1.3);
  cyl(g, 0.07, 0.06, 0.14, '#8a4a48', 1.1, 0.85, -1.5);
  box(g, 0.04, 0.08, 0.02, '#ebe4dc', -0.85, 0.85, -1.3);

  // cable clutter
  for (let i = 0; i < 10; i++) {
    cyl(g, 0.012, 0.012, 0.6 + (i % 3) * 0.2, '#2a3038',
      -1.2 + i * 0.28, 0.06, -0.8 + (i % 2) * 0.4, 0, 0, Math.PI / 2 + i * 0.08);
  }

  // side bookcase denser
  addShelf(g, -3.25, 0, -1.5);
  addShelf(g, -3.25, 0, 0.5);
  addShelf(g, 3.25, 0, -1.5);
  // more books on wall shelves
  addWallShelf(g, -1.8, 3.35, -3.1, 2.4);
  addWallShelf(g, 1.8, 3.35, -3.1, 2.4);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8; i++) {
      box(g, 0.12, 0.28 + (i % 3) * 0.04, 0.18,
        ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858', '#8a6a40', '#5a7080'][i],
        -3.5 + 0.08, 0.5 + row * 0.55, -0.6 + i * 0.22, 0, 0, 0, { round: 0.01 });
    }
  }

  // second smaller monitor
  addDesk(g, 2.2, 0, -0.4, 1.2);
  addMonitor(g, screens.codeJava, 2.2, 0.72, -0.45);
  addChair(g, 2.2, 0, 0.4);

  // corkboard / sticky notes
  box(g, 1.6, 1.1, 0.05, '#c4a07a', 0, 2.35, -3.1);
  const notes = ['#e0c070', '#c45848', '#6b8f6a', '#4a8a98', '#a87890', '#ebe4dc'];
  for (let i = 0; i < 12; i++) {
    box(g, 0.2, 0.2, 0.02, notes[i % notes.length],
      -0.6 + (i % 4) * 0.4, 2.0 + Math.floor(i / 4) * 0.3, -3.05);
  }

  // lamp glow warm
  addLamp(g, -2.6, 0, -2.2);
  addLamp(g, 2.8, 0, -2.0);
  addLamp(g, -2.8, 0, 1.5);
  // desk lamp
  cyl(g, 0.04, 0.04, 0.4, '#3a3a40', 0.55, 1.0, -1.55);
  cyl(g, 0.12, 0.14, 0.1, '#f5e6c8', 0.55, 1.25, -1.4, 0.4, 0, 0, {
    mat: { emissive: '#f5e6c8', emissiveIntensity: 0.5 },
  });

  addPlant(g, -3.0, 0, 2.0);
  addPlant(g, 3.1, 0, 1.8);
  addPlant(g, 1.5, 0, 1.6);

  // floor crates of disks / tapes
  for (let i = 0; i < 5; i++) {
    box(g, 0.35, 0.2, 0.3, '#8a6a40', -1.6 + i * 0.4, 0.12, 1.5, 0, 0.1, 0, { round: 0.02 });
  }

  const javaSign = makeSign('JAVA', 1.15, 0.32, '#2a3228', '#e0c070', '#c4a35a');
  javaSign.position.set(-1.2, 2.55, -3.05);
  g.add(javaSign);
  const orig = makeSign('ORIGINAL CODE', 1.2, 0.28, '#1a2820', '#f0e6d0', '#6b8f6a');
  orig.position.set(1.15, 2.55, -3.05);
  g.add(orig);

  const poster = makePosterArt(0, 0.55, 0.8);
  poster.position.set(-2.4, 2.2, -3.08);
  g.add(poster);
  const poster2 = makePosterArt(1, 0.55, 0.8);
  poster2.position.set(2.4, 2.2, -3.08);
  g.add(poster2);

  addCeilingBeam(g, 0, 3.95, -1.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.6, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.95);
  const fl = new THREE.PointLight('#f0d8b0', 0.95, 10, 2);
  fl.position.set(0, 3.0, 0);
  g.add(fl);
  return g;
}

function buildBedrock(screens) {
  const g = boothShell('#6a7060', '#c8d0b8');
  // bright tile floor
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.04, 0.95, (i + j) % 2 === 0 ? '#b8c0a8' : '#a0a890', i, 0.04, j);
    }
  }
  // hi-vis floor stripes
  box(g, 7.5, 0.05, 0.25, '#c4a35a', 0, 0.06, 0.2);
  box(g, 7.5, 0.05, 0.25, '#c4a35a', 0, 0.06, 1.4);

  addRug(g, 0, 0, -0.3, 2.4, 1.6, '#4a6a50', '#6a8a68');

  // central workbench
  addDesk(g, 0, 0, -1.4, 2.4);
  addMonitor(g, screens.codeBedrock, 0, 0.72, -1.45);
  addChair(g, 0.15, 0, -0.5);

  // consoles, phones, tablets on charging docks
  addConsole(g, -0.9, 0.72, -1.25, '#3a4858');
  addConsole(g, 0.95, 0.72, -1.25, '#5a6870');
  addPhoneProp(g, screens.codeBedrock, -1.4, 1.2, -1.2, 0.65);
  addTablet(g, screens.codeBedrock, 1.4, 1.05, -1.2, -0.2);
  // charging docks
  for (const x of [-1.4, 1.4, -0.5, 0.5]) {
    box(g, 0.35, 0.08, 0.25, '#2a3038', x, 0.78, -1.55, 0, 0, 0, { round: 0.02 });
    box(g, 0.08, 0.04, 0.04, '#6b8f6a', x, 0.84, -1.42, 0, 0, 0, {
      mat: { emissive: '#6b8f6a', emissiveIntensity: 0.6 },
      noShadow: true,
    });
  }

  // side device racks
  for (const side of [-1, 1]) {
    box(g, 0.7, 1.6, 0.45, '#4a5058', side * 2.6, 0.85, -2.2, 0, 0, 0, { round: 0.03 });
    for (let r = 0; r < 5; r++) {
      box(g, 0.5, 0.12, 0.08, r % 2 ? '#c4a35a' : '#4a8a98', side * 2.6, 0.35 + r * 0.28, -1.95, 0, 0, 0, {
        mat: { emissive: r % 2 ? '#c4a35a' : '#4a8a98', emissiveIntensity: 0.3 },
      });
    }
  }

  // hi-vis accents — cones kept to the SIDES (never across the character lane)
  for (const x of [-2.4, -1.9, 1.9, 2.4]) {
    cyl(g, 0.02, 0.14, 0.4, '#c4a35a', x, 0.22, 1.2);
    box(g, 0.18, 0.04, 0.18, '#ebe4dc', x, 0.35, 1.2);
  }
  box(g, 0.8, 1.2, 0.15, '#c4a35a', -3.3, 0.7, 0.2);
  box(g, 0.7, 0.15, 0.5, '#c4a35a', 3.1, 1.4, -1.0, 0, 0, 0, { round: 0.04 }); // hard hat

  // more devices on side desks
  addDesk(g, -2.2, 0, 0.3, 1.3);
  addTablet(g, screens.farmOk, -2.2, 1.0, 0.35, 0.15);
  addPhoneProp(g, screens.farmBreak, -1.7, 1.15, 0.45, 0.55);
  addDesk(g, 2.2, 0, 0.3, 1.3);
  addConsole(g, 2.0, 0.72, 0.4, '#2a3840');
  addPhoneProp(g, screens.codeBedrock, 2.5, 1.15, 0.4, 0.55);

  addWallShelf(g, 0, 3.4, -3.1, 5.5);
  addShelf(g, -3.3, 0, 1.5);
  addShelf(g, 3.3, 0, 1.5);

  // posters
  const p1 = makePosterArt(2, 0.55, 0.75);
  p1.position.set(-2.2, 2.25, -3.08);
  g.add(p1);
  const p2 = makePosterArt(3, 0.55, 0.75);
  p2.position.set(2.2, 2.25, -3.08);
  g.add(p2);

  const bedSign = makeSign('BEDROCK', 1.15, 0.3, '#1a3040', '#a0d0e0', '#4a8a98');
  bedSign.position.set(-1.15, 2.55, -3.05);
  g.add(bedSign);
  const multi = makeSign('MULTI-DEVICE', 1.15, 0.28, '#2a3228', '#f0e6d0', '#c4a35a');
  multi.position.set(1.15, 2.55, -3.05);
  g.add(multi);

  addLamp(g, -3.1, 0, -0.8);
  addLamp(g, 3.1, 0, -0.8);
  addPlant(g, -3.0, 0, 2.1);
  addPlant(g, 3.0, 0, 2.1);

  // floor crates on the sides only — clear center lane for the character
  for (let i = 0; i < 3; i++) {
    box(g, 0.35, 0.28, 0.3, ['#8a6a40', '#4a8a98', '#c4a35a'][i],
      -2.4 + i * 0.4, 0.16, 1.7, 0, 0.08, 0, { round: 0.02 });
    box(g, 0.35, 0.28, 0.3, ['#6b8f6a', '#3a4858', '#c45848'][i],
      1.6 + i * 0.4, 0.16, 1.7, 0, -0.08, 0, { round: 0.02 });
  }

  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.0);
  const fl = new THREE.PointLight('#f0f4e8', 1.05, 11, 2);
  fl.position.set(0, 3.2, 0.2);
  g.add(fl);
  return g;
}

function buildYard(screens) {
  // outdoor-ish but walled — bright sky walls + cloud boxes
  const g = boothShell('#8a7a60', '#9ec8e0');
  // brighter ceiling as sky
  box(g, 8, 0.15, 7, '#b0d8f0', 0, 4.15, 0);
  // cloud boxes
  for (const [cx, cy, cz, sx] of [
    [-2.2, 3.5, -2.5, 1.4], [1.8, 3.6, -2.2, 1.6], [0, 3.7, -1.0, 1.2],
    [-1.5, 3.55, 1.5, 1.3], [2.0, 3.45, 1.2, 1.1],
  ]) {
    box(g, sx, 0.35, 0.5, '#f0f4f8', cx, cy, cz, 0, 0, 0, {
      mat: { emissive: '#f0f4f8', emissiveIntensity: 0.15 },
      round: 0.08,
    });
  }

  // dirt / gravel floor patches
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.04, 0.95, (i + j) % 2 ? '#8a7a58' : '#7a6a48', i, 0.04, j);
    }
  }

  // twin scaffolds building the SAME feature
  addScaffold(g, -1.4, -1.2, '#4a8a98');
  addScaffold(g, 1.4, -1.2, '#4a8a98');
  // matching block piles
  addBlockPile(g, -2.4, 0, 0.2, '#6b8f6a', 8);
  addBlockPile(g, 2.4, 0, 0.2, '#6b8f6a', 8);
  addBlockPile(g, -1.8, 0, 1.4, '#c4a35a', 5);
  addBlockPile(g, 1.8, 0, 1.4, '#c4a35a', 5);

  // crane-ish arms
  addCraneArm(g, -2.8, 0, -2.0, 0.4);
  addCraneArm(g, 2.8, 0, -2.0, -0.4);

  // blueprints on board
  box(g, 1.5, 1.1, 0.06, '#ebe4dc', 0, 2.1, -3.08);
  box(g, 1.55, 1.15, 0.04, '#5a4030', 0, 2.1, -3.1);
  for (let i = 0; i < 5; i++) {
    box(g, 0.9 - i * 0.1, 0.03, 0.02, '#4a8a98', 0, 2.4 - i * 0.15, -3.04);
  }

  // checklist screen on a board
  box(g, 1.1, 0.9, 0.1, '#3a4048', 0, 1.2, -2.6, 0, 0, 0, { round: 0.02 });
  const checklist = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.75),
    new THREE.MeshBasicMaterial({ map: screens.checklist }),
  );
  checklist.position.set(0, 1.2, -2.52);
  checklist.name = 'screenMesh';
  checklist.userData.isSignOrScreen = true;
  checklist.userData.signText = 'CHECKLIST';
  g.add(checklist);

  // MUST MATCH / PARITY — flanking so they stay clear of the character head
  const match = makeSign('MUST MATCH', 1.25, 0.3, '#2a3228', '#e0c070', '#c4a35a');
  match.position.set(-1.15, 2.55, -3.05);
  g.add(match);
  const parity = makeSign('PARITY', 1.05, 0.28, '#1a3040', '#8ab0c8', '#4a8a98');
  parity.position.set(1.2, 2.55, -3.05);
  g.add(parity);

  // tool crates / barrels
  for (let i = 0; i < 4; i++) {
    box(g, 0.45, 0.4, 0.4, '#8a6a40', -3.0 + i * 0.15, 0.22, 1.8 + i * 0.05, 0, 0.1, 0, { round: 0.02 });
    cyl(g, 0.2, 0.22, 0.5, '#c45848', 2.4 + (i % 2) * 0.5, 0.28, 1.6 + Math.floor(i / 2) * 0.5);
  }

  // caution cones mid floor
  for (const [x, z] of [[-0.6, 0.8], [0.6, 0.8], [-1.0, 1.6], [1.0, 1.6]]) {
    cyl(g, 0.02, 0.14, 0.45, '#c4a35a', x, 0.25, z);
  }

  // wall shelves with tools
  addWallShelf(g, -2.2, 3.45, -3.1, 2.0);
  addWallShelf(g, 2.2, 3.45, -3.1, 2.0);
  addPegTools(g, -2.5, 2.3, -3.08);
  addPegTools(g, 2.5, 2.3, -3.08);

  addLamp(g, -3.2, 0, 0.5);
  addLamp(g, 3.2, 0, 0.5);
  addPlant(g, -3.1, 0, 2.2);
  addPlant(g, 3.1, 0, 2.2);

  addCeilingBeam(g, 0, 3.95, -1.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.5, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.1);
  const sun = new THREE.PointLight('#fff4d8', 1.15, 12, 2);
  sun.position.set(0, 3.5, 0.5);
  g.add(sun);
  return g;
}

function addPegTools(parent, x, y, z) {
  box(parent, 1.4, 0.9, 0.05, '#8a6a48', x, y, z);
  const tools = ['#3a4048', '#c45848', '#4a8a98', '#c4a35a', '#6b8f6a'];
  for (let i = 0; i < 6; i++) {
    box(parent, 0.07, 0.3, 0.07, tools[i % tools.length], x - 0.5 + i * 0.2, y + 0.15, z + 0.06);
  }
}

function buildLibrary(screens) {
  const g = boothShell('#5a4838', '#c4b090');
  // marble-ish floor
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.04, 0.95, (i + j) % 2 ? '#d0c4a8' : '#c0b498', i, 0.04, j);
    }
  }
  addRug(g, 0, 0, 0.4, 2.8, 2.0, '#6a3a40', '#8a5a58');

  // tall shelves of world-save crystals (glowing translucent) — fill walls
  const crystalCols = ['#6bc4c8', '#a878d0', '#70c488', '#d0a060', '#7090d0', '#d07090'];
  for (const side of [-1, 1]) {
    for (let col = 0; col < 3; col++) {
      const bx = side * (2.4 + col * 0.55);
      box(g, 0.5, 3.6, 0.4, '#5a4030', bx, 1.85, -2.4);
      for (let row = 0; row < 7; row++) {
        box(g, 0.28, 0.32, 0.22, crystalCols[(row + col) % crystalCols.length],
          bx, 0.4 + row * 0.48, -2.2, 0, 0, 0, {
            mat: {
              transparent: true,
              opacity: 0.7,
              emissive: crystalCols[(row + col) % crystalCols.length],
              emissiveIntensity: 0.45,
            },
            round: 0.02,
          });
      }
    }
  }
  // back wall crystal / cartridge shelves
  for (let col = 0; col < 8; col++) {
    box(g, 0.55, 2.8, 0.35, '#5a4030', -2.6 + col * 0.75, 1.5, -2.95);
    for (let row = 0; row < 5; row++) {
      if (col === 3 || col === 4) continue; // leave center for monitor/lever
      const isCrystal = (col + row) % 2 === 0;
      if (isCrystal) {
        box(g, 0.3, 0.35, 0.2, crystalCols[(col + row) % crystalCols.length],
          -2.6 + col * 0.75, 0.45 + row * 0.5, -2.75, 0, 0, 0, {
            mat: {
              transparent: true, opacity: 0.65,
              emissive: crystalCols[(col + row) % crystalCols.length],
              emissiveIntensity: 0.4,
            },
            round: 0.02,
          });
      } else {
        // mod cartridges — colorful small boxes
        box(g, 0.22, 0.28, 0.12, ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a', '#a87890'][(col + row) % 5],
          -2.6 + col * 0.75, 0.45 + row * 0.5, -2.75, 0, 0.1, 0, { round: 0.015 });
      }
    }
  }

  // display cases center-front of shelves
  for (const x of [-1.5, 1.5]) {
    box(g, 0.9, 1.1, 0.6, '#3a4048', x, 0.6, -1.2, 0, 0, 0, { round: 0.03 });
    box(g, 0.75, 0.7, 0.08, '#8ab0c8', x, 0.7, -0.88, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.35, emissive: '#8ab0c8', emissiveIntensity: 0.2 },
    });
    box(g, 0.35, 0.35, 0.25, crystalCols[x < 0 ? 0 : 2], x, 0.55, -1.1, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.7, emissive: crystalCols[x < 0 ? 0 : 2], emissiveIntensity: 0.5 },
      round: 0.02,
    });
  }

  // monitor with worlds screen
  addDesk(g, 0, 0, -1.6, 1.4);
  addMonitor(g, screens.worlds, 0, 0.72, -1.65);

  // big merge lever prop
  box(g, 0.5, 0.35, 0.5, '#3a3a40', 0, 0.2, 0.5, 0, 0, 0, { round: 0.03 });
  cyl(g, 0.05, 0.05, 0.9, '#c45848', 0, 0.7, 0.5, 0.5, 0, 0);
  cyl(g, 0.1, 0.1, 0.12, '#ebe4dc', 0, 1.15, 0.35);

  // ladders against shelves
  for (const x of [-3.0, 3.0]) {
    box(g, 0.08, 3.2, 0.08, '#8a6a40', x, 1.6, -2.0);
    box(g, 0.08, 3.2, 0.08, '#8a6a40', x + 0.4, 1.6, -2.0);
    for (let r = 0; r < 8; r++) {
      box(g, 0.5, 0.05, 0.08, '#8a6a40', x + 0.2, 0.3 + r * 0.4, -2.0);
    }
  }

  // cartridge crates on floor
  for (let i = 0; i < 8; i++) {
    box(g, 0.25, 0.2, 0.15, ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a', '#a87890', '#3a4858', '#8a6a40', '#ebe4dc'][i],
      -1.6 + (i % 4) * 0.4, 0.12 + Math.floor(i / 4) * 0.22, 1.5, 0, 0.1, 0, { round: 0.015 });
  }

  const worlds = makeSign('WORLDS & MODS', 1.35, 0.3, '#2a2030', '#e0c8f0', '#a87890');
  worlds.position.set(-1.1, 2.6, -3.05);
  g.add(worlds);
  const keep = makeSign('KEEP SAFE', 1.05, 0.26, '#1a3028', '#f0e6d0', '#6b8f6a');
  keep.position.set(1.15, 2.6, -3.05);
  g.add(keep);

  addWallShelf(g, 0, 3.55, -3.1, 4.5);
  addLamp(g, -2.0, 0, 1.2);
  addLamp(g, 2.0, 0, 1.2);
  addPlant(g, -1.0, 0, 2.0);
  addPlant(g, 1.0, 0, 2.0);
  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.6, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.05);
  const fl = new THREE.PointLight('#f0e8d8', 0.9, 10, 2);
  fl.position.set(0, 3.1, 0.2);
  g.add(fl);
  const crystalGlow = new THREE.PointLight('#80c8d0', 0.4, 7, 2);
  crystalGlow.position.set(0, 2.5, -1.5);
  g.add(crystalGlow);
  return g;
}

function buildArena(screens) {
  const g = boothShell('#5a5550', '#b0a898');
  // stadium floor
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.04, 0.95, (i + j) % 2 ? '#6a6558' : '#5a5548', i, 0.04, j);
    }
  }
  // center debate podium/platform — no empty center
  box(g, 2.2, 0.35, 1.6, '#5a4030', 0, 0.2, 0.3, 0, 0, 0, { round: 0.04 });
  box(g, 1.6, 0.7, 0.35, '#4a3020', 0, 0.7, -0.3, 0, 0, 0, { round: 0.03 });
  box(g, 0.5, 0.08, 0.35, '#c4a35a', 0, 1.1, -0.15);
  // mic stand
  cyl(g, 0.03, 0.03, 0.7, '#3a3a40', 0, 1.15, 0.1);
  cyl(g, 0.06, 0.04, 0.1, '#2a2a30', 0, 1.55, 0.1, 0.4, 0, 0);

  // bleachers left/right
  addBleachers(g, -2.7, -0.5, 1);
  addBleachers(g, 2.7, -0.5, 1);
  addBleachers(g, -2.7, 1.0, 1);
  addBleachers(g, 2.7, 1.0, 1);

  // foam block piles
  addBlockPile(g, -1.5, 0.35, 0.8, '#c45848', 7);
  addBlockPile(g, 1.5, 0.35, 0.8, '#4a8a98', 7);
  addBlockPile(g, -0.8, 0.35, 1.6, '#c4a35a', 5);
  addBlockPile(g, 0.8, 0.35, 1.6, '#6b8f6a', 5);

  // banners on back wall
  box(g, 2.8, 0.7, 0.08, '#3a2020', -1.4, 2.5, -3.1);
  box(g, 2.8, 0.7, 0.08, '#1a3040', 1.4, 2.5, -3.1);
  const javaYell = makeSign('JAVA!', 1.1, 0.35, '#3a2020', '#f0e6d0', '#c45848');
  javaYell.position.set(-1.1, 2.55, -3.0);
  g.add(javaYell);
  const bedYell = makeSign('BEDROCK!', 1.15, 0.35, '#1a3040', '#f0e6d0', '#4a8a98');
  bedYell.position.set(1.1, 2.55, -3.0);
  g.add(bedYell);

  // speech-bubble style boards mid sides
  const bubL = makeSign('JAVA!', 0.85, 0.28, '#ebe4dc', '#3a2020', '#c45848');
  bubL.position.set(-1.5, 1.8, -2.4);
  g.add(bubL);
  const bubR = makeSign('BEDROCK!', 0.95, 0.28, '#ebe4dc', '#1a3040', '#4a8a98');
  bubR.position.set(1.5, 1.8, -2.4);
  g.add(bubR);

  // overhead banners / string lights
  box(g, 6, 0.4, 0.1, '#c45848', 0, 3.5, -2.0);
  box(g, 6, 0.4, 0.1, '#4a8a98', 0, 3.5, -0.5);
  addStringLights(g, 3.6, -1.2, -3.0, 3.0, 14);
  addStringLights(g, 3.6, 0.5, -3.0, 3.0, 14);

  // scoreboard-ish TV
  addTv(g, screens.codeTowers, 0, 3.2, -3.05, 0.55);

  // crowd foam flying props (static)
  for (let i = 0; i < 10; i++) {
    box(g, 0.2, 0.2, 0.2, ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a'][i % 4],
      -2 + (i % 5) * 1.0, 1.5 + (i % 3) * 0.4, 1.2 + (i % 2) * 0.5, 0.2, 0.3, 0.1, { round: 0.02 });
  }

  addWallShelf(g, 0, 3.7, -3.1, 5.5);
  addShelf(g, -3.3, 0, -2.0);
  addShelf(g, 3.3, 0, -2.0);
  addLamp(g, -3.1, 0, 1.5);
  addLamp(g, 3.1, 0, 1.5);
  addPlant(g, -3.0, 0, 2.2);
  addPlant(g, 3.0, 0, 2.2);

  const fight = makeSign('STILL FIGHTING', 1.35, 0.28, '#2a3228', '#f0e6d0', '#c4a35a');
  fight.position.set(0, 2.95, -3.05);
  g.add(fight);

  addCeilingBeam(g, 0, 3.95, -1.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.3, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.6, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.1);
  const fl = new THREE.PointLight('#f5f0e0', 1.1, 12, 2);
  fl.position.set(0, 3.3, 0.3);
  g.add(fl);
  const spot = new THREE.PointLight('#fff0d0', 0.5, 5, 2);
  spot.position.set(0, 2.5, 0.5);
  g.add(spot);
  return g;
}

function buildStore(screens) {
  const g = boothShell('#6a5a50', '#c8b8a8');
  // store tile floor
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.04, 0.95, (i + j) % 2 ? '#8a7a6a' : '#7a6a5a', i, 0.04, j);
    }
  }
  addRug(g, 0, 0, 0.5, 2.4, 1.8, '#4a3a50', '#6a5a70');

  // dense shelves of generic game boxes — left wall
  for (let col = 0; col < 4; col++) {
    box(g, 0.9, 3.2, 0.4, '#5a4030', -3.2, 1.65, -2.0 + col * 1.1);
    for (let row = 0; row < 6; row++) {
      for (let b = 0; b < 3; b++) {
        box(g, 0.2, 0.28, 0.08,
          ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858', '#8a6a40', '#5a7080'][(col + row + b) % 8],
          -3.2, 0.35 + row * 0.5, -2.2 + col * 1.1 + b * 0.22, 0, 0.05, 0, { round: 0.01 });
      }
    }
  }
  // dense shelves — right wall
  for (let col = 0; col < 4; col++) {
    box(g, 0.9, 3.2, 0.4, '#5a4030', 3.2, 1.65, -2.0 + col * 1.1);
    for (let row = 0; row < 6; row++) {
      for (let b = 0; b < 3; b++) {
        box(g, 0.2, 0.28, 0.08,
          ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a', '#3a4858', '#a87890', '#8a6a40', '#ebe4dc'][(col + row + b) % 8],
          3.2, 0.35 + row * 0.5, -2.2 + col * 1.1 + b * 0.22, 0, -0.05, 0, { round: 0.01 });
      }
    }
  }
  // back wall shelves flanking center
  for (const x of [-2.4, -1.5, 1.5, 2.4]) {
    box(g, 0.8, 2.6, 0.35, '#5a4030', x, 1.4, -2.95);
    for (let row = 0; row < 5; row++) {
      for (let b = 0; b < 3; b++) {
        box(g, 0.18, 0.26, 0.08,
          ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a', '#a87890'][(row + b) % 5],
          x - 0.25 + b * 0.25, 0.4 + row * 0.48, -2.75, 0, 0.08, 0, { round: 0.01 });
      }
    }
  }

  // central pedestal with boxArt as physical box prop
  box(g, 1.0, 0.7, 0.8, '#3a3a40', 0, 0.38, -0.8, 0, 0, 0, { round: 0.04 });
  box(g, 0.7, 0.9, 0.2, '#2a2a30', 0, 1.15, -0.8, 0, 0, 0, { round: 0.02 });
  const boxArt = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.8),
    new THREE.MeshBasicMaterial({ map: screens.boxArt }),
  );
  boxArt.position.set(0, 1.15, -0.68);
  boxArt.name = 'screenMesh';
  boxArt.userData.isSignOrScreen = true;
  boxArt.userData.signText = 'BOX ART';
  g.add(boxArt);
  // glow under pedestal
  box(g, 0.85, 0.05, 0.65, '#6b8f6a', 0, 0.75, -0.8, 0, 0, 0, {
    mat: { emissive: '#6b8f6a', emissiveIntensity: 0.4 },
  });

  // nearby display monitor — code towers (split glowing towers)
  box(g, 1.2, 0.9, 0.12, '#1c1c20', 0, 2.0, -3.05, 0, 0, 0, { round: 0.02 });
  const towers = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.75),
    new THREE.MeshBasicMaterial({ map: screens.codeTowers }),
  );
  towers.position.set(0, 2.0, -2.97);
  towers.name = 'screenMesh';
  towers.userData.isSignOrScreen = true;
  towers.userData.signText = 'CODE TOWERS';
  g.add(towers);
  const towerGlow = new THREE.PointLight('#a0c0e0', 0.5, 4, 2);
  towerGlow.position.set(0, 2.0, -2.4);
  g.add(towerGlow);

  // dump bins kept to the SIDES so they never hide the character
  for (let i = 0; i < 6; i++) {
    box(g, 0.25, 0.35, 0.1,
      ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a', '#a87890', '#3a4858'][i],
      -2.0 + (i % 3) * 0.32, 0.25 + Math.floor(i / 3) * 0.4, 1.55, 0, 0.15, 0, { round: 0.015 });
  }
  for (let i = 0; i < 6; i++) {
    box(g, 0.25, 0.35, 0.1,
      ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a', '#3a4858', '#a87890'][i],
      1.35 + (i % 3) * 0.32, 0.25 + Math.floor(i / 3) * 0.4, 1.55, 0, -0.1, 0, { round: 0.015 });
  }

  // checkout counter side
  box(g, 1.4, 0.9, 0.6, '#5a4030', -2.2, 0.45, 0.3, 0, 0, 0, { round: 0.03 });
  box(g, 0.4, 0.3, 0.35, '#2a3038', -2.0, 1.05, 0.3, 0, 0, 0, { round: 0.02 });
  box(g, 1.2, 0.08, 0.6, '#5a4030', 2.2, 0.72, 0.2);
  addMonitor(g, screens.boxArt, 2.2, 0.72, 0.15, -0.3);

  const oneBox = makeSign('ONE BOX / TWO CODES', 1.45, 0.3, '#2a3228', '#f0e6d0', '#c4a35a');
  oneBox.position.set(0, 2.65, -3.05);
  g.add(oneBox);
  const finale = makeSign('ONE GAME?', 1.05, 0.26, '#1a2820', '#e0c070', '#6b8f6a');
  finale.position.set(0, 3.0, -3.05);
  g.add(finale);

  addWallShelf(g, 0, 3.55, -3.1, 5.0);
  addLamp(g, -2.8, 0, 1.8);
  addLamp(g, 2.8, 0, 1.8);
  addPlant(g, -1.2, 0, 2.0);
  addPlant(g, 1.2, 0, 2.0);
  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.5, 7.5);
  addCeilingBeam(g, 0, 3.95, 1.8, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.0);
  const fl = new THREE.PointLight('#f0e8d8', 1.0, 11, 2);
  fl.position.set(0, 3.2, 0.2);
  g.add(fl);
  return g;
}

export function buildRoom(screens) {
  const root = new THREE.Group();
  const booths = {};
  const boothMeta = {};

  const specs = [
    { id: 'bedroom', build: () => buildBedroom(screens), x: 0, z: 0 },
    { id: 'merge', build: () => buildMerge(screens), x: 20, z: 0 },
    { id: 'java', build: () => buildJava(screens), x: 40, z: 0 },
    { id: 'bedrock', build: () => buildBedrock(screens), x: 60, z: 0 },
    { id: 'yard', build: () => buildYard(screens), x: 80, z: 0 },
    { id: 'library', build: () => buildLibrary(screens), x: 100, z: 0 },
    { id: 'arena', build: () => buildArena(screens), x: 120, z: 0 },
    { id: 'store', build: () => buildStore(screens), x: 140, z: 0 },
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
