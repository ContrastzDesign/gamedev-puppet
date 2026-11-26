// Realism-test screening lab for the engine-real Short (V1).
// Stations: compare wall (hook), night city street (UE5), portrait studio (Unity),
// frame-budget timer (16.7 ms). Generic plain-lettering signs only — no real logos.
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

function makePosterArt(seed, w = 0.85, h = 1.2) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  const pals = [
    ['#2c3a4a', '#6a8fbf', '#c4a35a'],
    ['#3a2e3a', '#a87890', '#7a9a78'],
    ['#2a3a32', '#5a9a88', '#d0b878'],
    ['#3a3028', '#c4785a', '#8a9ab8'],
    ['#2a2e3a', '#7a6a94', '#e0c890'],
  ];
  const pal = pals[seed % pals.length];
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, 256, 384);
  ctx.fillStyle = pal[1];
  if (seed % 3 === 0) {
    ctx.beginPath(); ctx.arc(128, 140, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal[2];
    ctx.fillRect(40, 240, 176, 28);
  } else if (seed % 3 === 1) {
    ctx.fillRect(30, 40, 196, 120);
    ctx.fillStyle = pal[2];
    for (let i = 0; i < 5; i++) ctx.fillRect(40 + i * 36, 190, 24, 120);
  } else {
    ctx.beginPath();
    ctx.moveTo(128, 50); ctx.lineTo(210, 200); ctx.lineTo(46, 200); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pal[2];
    ctx.fillRect(50, 230, 156, 90);
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

function makeScreen(tex) {
  const geo = new THREE.PlaneGeometry(1.35, 0.85);
  const screen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }));
  screen.name = 'screenMesh';
  screen.userData.isSignOrScreen = true;
  const bezel = box(new THREE.Group(), 1.5, 1.0, 0.08, '#1c1c20', 0, 0, -0.05);
  const g = new THREE.Group();
  g.add(bezel);
  screen.position.z = 0.02;
  g.add(screen);
  return g;
}

function neonStrip(parent, len, color, x, y, z, ry = 0) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.055, 0.055),
    new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 2.4, roughness: 0.3, metalness: 0.15,
    }),
  );
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  parent.add(mesh);
  const light = new THREE.PointLight(color, 0.85, 6, 2);
  light.position.set(x, y - 0.15, z + 0.25);
  parent.add(light);
  return mesh;
}

function addRgbKeyboard(parent, x, y, z) {
  box(parent, 0.78, 0.04, 0.28, '#1e2228', x, y, z, 0, 0, 0, { round: 0.02 });
  const cols = ['#e06070', '#e0a050', '#60c080', '#5090e0', '#a060d0'];
  for (let i = 0; i < 5; i++) {
    box(parent, 0.12, 0.015, 0.18, cols[i], x - 0.28 + i * 0.14, y + 0.028, z, 0, 0, 0, {
      mat: { emissive: cols[i], emissiveIntensity: 0.7, roughness: 0.4 },
      noShadow: true,
    });
  }
}

function addRgbMouse(parent, x, y, z) {
  return box(parent, 0.12, 0.045, 0.18, '#2a3038', x, y, z, 0, 0.25, 0, {
    round: 0.03,
    mat: { emissive: '#4060a0', emissiveIntensity: 0.35 },
  });
}

function addDrinkCan(parent, x, y, z, color = '#c45848') {
  cyl(parent, 0.045, 0.045, 0.14, color, x, y, z);
  cyl(parent, 0.04, 0.04, 0.02, '#d8d0c0', x, y + 0.07, z);
}

function addMiniCity(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.8, 0.04, 0.5, '#1a2430', 0, 0.02, 0);
  const heights = [0.35, 0.5, 0.28, 0.42, 0.55, 0.3];
  heights.forEach((h, i) => {
    const bx = -0.3 + (i % 3) * 0.25;
    const bz = -0.1 + Math.floor(i / 3) * 0.22;
    box(g, 0.14, h, 0.14, i % 2 ? '#2a3a48' : '#3a4a58', bx, 0.04 + h / 2, bz, 0, 0, 0, {
      mat: { emissive: '#e0a050', emissiveIntensity: 0.15 },
    });
  });
  // street light
  cyl(g, 0.015, 0.02, 0.35, '#3a3a40', 0.32, 0.2, 0.15);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({ color: '#f0d080', emissive: '#f0d080', emissiveIntensity: 1.5 }),
  );
  bulb.position.set(0.32, 0.4, 0.15);
  g.add(bulb);
  parent.add(g);
  return g;
}

function addSoftbox(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 0.55, 0.7, 0.08, '#e8e0d0', 0, 0, 0, 0, 0, 0, {
    mat: { emissive: '#f0e8d8', emissiveIntensity: 0.8, roughness: 0.4 },
  });
  box(g, 0.6, 0.75, 0.04, '#2a2a2e', 0, 0, -0.05);
  cyl(g, 0.03, 0.05, 1.2, '#3a3a40', 0, -0.9, 0);
  const pl = new THREE.PointLight('#fff5e8', 1.2, 4, 2);
  pl.position.set(0, 0, 0.3);
  g.add(pl);
  parent.add(g);
  return g;
}

function addTimerBar(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.4, 0.18, 0.12, '#1a2420', 0, 0, 0, 0, 0, 0, { round: 0.03 });
  box(g, 0.65, 0.12, 0.08, '#4a8a98', -0.32, 0, 0.03, 0, 0, 0, {
    mat: { emissive: '#4a8a98', emissiveIntensity: 0.6 },
    round: 0.02,
  });
  box(g, 0.55, 0.12, 0.08, '#a87890', 0.35, 0, 0.03, 0, 0, 0, {
    mat: { emissive: '#a87890', emissiveIntensity: 0.6 },
    round: 0.02,
  });
  const tag = makeSign('16.7 ms', 0.7, 0.22, '#102018', '#d8f0d0', '#6b8f6a');
  tag.position.set(0, 0.25, 0.08);
  g.add(tag);
  parent.add(g);
  return g;
}

function addBgDesk(parent, x, z, seed, label) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  box(g, 2.0, 0.1, 0.9, '#534032', 0, 0.92, 0.1, 0, 0, 0, { round: 0.03 });
  box(g, 0.1, 0.9, 0.8, '#433028', -0.9, 0.45, 0.1);
  box(g, 0.1, 0.9, 0.8, '#433028', 0.9, 0.45, 0.1);
  box(g, 0.28, 0.65, 0.4, '#1a1e24', -0.65, 1.28, -0.1);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const ctx = c.getContext('2d');
  ctx.fillStyle = ['#1a3a4a', '#2a1a3a', '#1a2a28'][seed % 3];
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#0e1418';
  ctx.fillRect(0, 0, 256, 22);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = `rgba(240,230,200,${0.15 + i * 0.1})`;
    ctx.fillRect(12, 40 + i * 32, 160, 22);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const scr = makeScreen(tex);
  scr.scale.setScalar(0.8);
  scr.position.set(0.1, 1.65, -0.1);
  g.add(scr);
  addRgbKeyboard(g, 0.05, 1.0, 0.3);
  if (label) {
    const s = makeSign(label, 1.2, 0.32, '#1e2824', '#d8e8d0', '#6a9a78');
    s.position.set(0, 2.25, -0.25);
    g.add(s);
  }
  parent.add(g);
  return g;
}

function buildHeroStation(g, b) {
  box(g, 2.6, 0.12, 0.95, '#5c4332', 0, 0.95, -0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.12, 0.95, 0.85, '#4a3628', -1.15, 0.47, -0.05);
  box(g, 0.12, 0.95, 0.85, '#4a3628', 1.15, 0.47, -0.05);
  box(g, 0.32, 0.85, 0.5, '#1a1e24', -1.0, 1.4, -0.25);
  box(g, 0.02, 0.6, 0.02, b.neon || '#60a0e0', -0.83, 1.4, -0.25, 0, 0, 0, {
    mat: { emissive: b.neon || '#60a0e0', emissiveIntensity: 1.5 },
    noShadow: true,
  });
  box(g, 0.25, 0.08, 0.35, '#2a2a2e', 0, 1.02, -0.15);
  cyl(g, 0.05, 0.05, 0.35, '#2a2a2e', 0, 1.22, -0.15);
  const scr = makeScreen(b.screen);
  scr.position.set(0, 1.85, -0.2);
  g.add(scr);
  if (b.screen2) {
    const scr2 = makeScreen(b.screen2);
    scr2.scale.setScalar(0.75);
    scr2.position.set(0.95, 1.7, -0.25);
    scr2.rotation.y = -0.35;
    g.add(scr2);
  }
  addRgbKeyboard(g, -0.55, 1.035, 0.2);
  addRgbKeyboard(g, 0.55, 1.035, 0.2);
  addRgbMouse(g, 0.05, 1.045, 0.32);
  addDrinkCan(g, -1.05, 1.1, 0.25, '#c45848');
  addDrinkCan(g, 1.05, 1.1, 0.22, '#48a878');
  box(g, 0.55, 0.08, 0.55, '#3d4654', 0.85, 0.55, -0.15, 0, 0.9, 0, { round: 0.05 });
  cyl(g, 0.07, 0.09, 0.55, '#2a3038', 0.85, 0.27, -0.15);
  box(g, 0.5, 0.5, 0.07, '#3d4654', 0.85, 0.9, 0.1, 0, 0.9, 0, { round: 0.04 });
  // Station sign high and clear of desk props / towers so camera moves never bury it
  const sign = makeSign(b.label, 1.7, 0.48);
  sign.position.set(0, 2.85, -0.38);
  g.add(sign);
  neonStrip(g, 1.6, b.neon || '#c4a35a', 0, 2.55, -0.34);
  // Side towers kept below the sign band
  box(g, 0.1, 2.1, 1.2, '#6a5545', -1.4, 1.05, -0.15);
  box(g, 0.1, 2.1, 1.2, '#6a5545', 1.4, 1.05, -0.15);
  // Floor crates / cable spools under the desk (dress the pad)
  box(g, 0.45, 0.35, 0.4, '#5a4a38', -0.9, 0.2, 0.55, 0, 0.3, 0, { round: 0.04 });
  box(g, 0.35, 0.28, 0.35, '#3a4a58', 0.85, 0.16, 0.6, 0, -0.2, 0, { round: 0.03 });
  cyl(g, 0.18, 0.18, 0.22, '#6a5a48', 0.1, 0.14, 0.7, Math.PI / 2, 0, 0);
  // Cable runs + floor sticky pads in the aisle (fills top-down / low-hero frames)
  for (let i = 0; i < 5; i++) {
    box(g, 0.08, 0.03, 0.55, '#2a3038', -0.7 + i * 0.35, 0.02, 1.1 + (i % 2) * 0.25, 0, 0.4, 0, { noShadow: true });
  }
  box(g, 1.8, 0.02, 1.1, '#4a4038', 0, 0.015, 1.35, 0, 0, 0, { noShadow: true });
  box(g, 0.5, 0.22, 0.4, '#6a5545', -1.15, 0.14, 1.5, 0, 0.5, 0, { round: 0.04 });
  box(g, 0.4, 0.18, 0.35, '#3d4654', 1.1, 0.12, 1.45, 0, -0.3, 0, { round: 0.03 });
  // Pegboard / gear on side towers so orbits don't show bare panels
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      box(g, 0.06, 0.18, 0.18, ['#4a8a98', '#a87890', '#c4a35a'][row],
        -1.32, 0.7 + row * 0.55, -0.35 + col * 0.35, 0, 0, 0, { noShadow: true });
      box(g, 0.06, 0.18, 0.18, ['#6b8f6a', '#7a6a94', '#c45848'][row],
        1.32, 0.7 + row * 0.55, -0.35 + col * 0.35, 0, 0, 0, { noShadow: true });
    }
  }
  const monLight = new THREE.PointLight('#b8d4e8', 0.85, 5, 2);
  monLight.position.set(0, 1.85, 0.4);
  g.add(monLight);
  cyl(g, 0.12, 0.16, 0.2, '#6a4a38', 1.05, 1.1, 0.5);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat('#3d6b4f'));
  leaf.position.set(1.05, 1.4, 0.5);
  g.add(leaf);

  if (b.theme === 'lab') {
    // Tags sit on the monitor bezel, well above the caption band
    for (const [lab, ox, col] of [['REF', -0.55, '#c4a35a'], ['RENDER', 0.05, '#6b8f6a'], ['SCORE', 0.55, '#4a8a98']]) {
      const tag = makeSign(lab, 0.4, 0.22, '#1e2420', '#f0e6d0', col);
      tag.position.set(ox, 2.35, -0.05);
      g.add(tag);
    }
    box(g, 0.35, 0.08, 0.25, '#6a5a38', -0.55, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
    box(g, 0.35, 0.08, 0.25, '#3a5a48', 0.05, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
    box(g, 0.35, 0.08, 0.25, '#2a4a58', 0.55, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
  } else if (b.theme === 'city') {
    addMiniCity(g, 0.35, 1.05, 0.35);
    const tip = makeSign('STREET LEVEL', 0.95, 0.28, '#102028', '#a0d0e8', '#4a8a98');
    tip.position.set(-0.65, 2.4, -0.05);
    g.add(tip);
  } else if (b.theme === 'face') {
    addSoftbox(g, -0.9, 1.7, 0.45, 0.5);
    addSoftbox(g, 0.55, 1.7, 0.5, -0.4);
    const tip = makeSign('CLOSE-UP', 0.7, 0.26, '#201018', '#f0d0e0', '#a87890');
    tip.position.set(0.1, 2.4, -0.05);
    g.add(tip);
  } else if (b.theme === 'budget') {
    addTimerBar(g, 0.1, 1.45, 0.35);
    const tip = makeSign('CITY | FACE', 0.95, 0.28, '#102018', '#d8f0d0', '#6b8f6a');
    tip.position.set(-0.7, 2.4, -0.05);
    g.add(tip);
  }
}

export function buildRoom(textures) {
  const root = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 22),
    mat('#7a6e68', { roughness: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  for (let i = -16; i < 16; i++) {
    box(root, 0.04, 0.015, 22, '#6a5e58', i * 0.95, 0.012, 0, 0, 0, 0, { noShadow: true });
  }

  box(root, 32, 6.8, 0.35, '#5a5860', 0, 3.4, -8.0);
  box(root, 0.35, 6.8, 22, '#4a4850', -15.5, 3.4, 0);
  box(root, 0.35, 6.8, 22, '#4a4850', 15.5, 3.4, 0);
  // panel rows on back wall
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 20; col++) {
      box(root, 1.4, 0.5, 0.08, row % 2 ? '#6a6870' : '#5a5860',
        -13 + col * 1.4, 0.6 + row * 0.6, -7.78, 0, 0, 0, { noShadow: true });
    }
  }

  // Ceiling slab + beams + hanging cable trays (no empty top band)
  box(root, 32, 0.22, 22, '#3a3840', 0, 6.55, 0);
  for (let i = -4; i <= 4; i++) {
    box(root, 0.22, 0.32, 20, '#2a2830', i * 3.2, 6.3, 0);
  }
  for (let j = -2; j <= 2; j++) {
    box(root, 28, 0.18, 0.18, '#3a3840', 0, 6.28, j * 3.5);
  }
  // Cable trays / duct runs under the slab
  for (let i = -3; i <= 3; i++) {
    box(root, 0.55, 0.12, 18, '#4a4850', i * 4.0, 6.05, 0.5, 0, 0, 0, { noShadow: true });
    box(root, 0.08, 0.25, 0.08, '#2a2830', i * 4.0, 6.2, -2.5, 0, 0, 0, { noShadow: true });
    box(root, 0.08, 0.25, 0.08, '#2a2830', i * 4.0, 6.2, 2.5, 0, 0, 0, { noShadow: true });
  }
  // Ceiling acoustic tiles grid (fills dark voids when camera cranes up)
  for (let ix = -6; ix <= 6; ix++) {
    for (let iz = -3; iz <= 3; iz++) {
      box(root, 1.8, 0.04, 1.8, (ix + iz) % 2 ? '#45434a' : '#3e3c44',
        ix * 2.1, 6.42, iz * 2.4, 0, 0, 0, { noShadow: true });
    }
  }
  for (let i = -4; i <= 4; i++) {
    for (let j = 0; j < 2; j++) {
      const lx = i * 3.2 + (j ? 1.4 : 0);
      const lz = -3.5 + j * 4.5;
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshStandardMaterial({
          color: '#f5e0b0', emissive: '#f0d080', emissiveIntensity: 1.6, roughness: 0.35,
        }),
      );
      lamp.position.set(lx, 5.75, lz);
      root.add(lamp);
      const light = new THREE.PointLight('#ffe2b0', 2.4, 14, 2);
      light.position.copy(lamp.position);
      root.add(light);
      cyl(root, 0.08, 0.12, 0.15, '#3a3028', lx, 6.15, lz);
    }
  }
  neonStrip(root, 28, '#c4a35a', 0, 6.15, -7.6);

  // Four booths across the back: city | lab(center shared with face toggle) | budget
  // Layout: city @ -3.6, lab @ 0, face @ 0 (toggle), budget @ 3.6
  const booths = {
    lab: {
      x: 0.0, z: -5.2, label: 'REALISM LAB', screen: textures.lab, screen2: textures.city,
      neon: '#c4a35a', theme: 'lab',
    },
    city: {
      x: -3.6, z: -5.2, label: 'CITY', screen: textures.city, screen2: textures.wire,
      neon: '#4a8a98', theme: 'city',
    },
    face: {
      x: 0.0, z: -5.2, label: 'FACE', screen: textures.face, screen2: textures.skin,
      neon: '#a87890', theme: 'face',
    },
    budget: {
      x: 3.6, z: -5.2, label: 'BUDGET', screen: textures.budget, screen2: textures.lab,
      neon: '#6b8f6a', theme: 'budget',
    },
  };

  const boothGroups = {};
  for (const [id, b] of Object.entries(booths)) {
    const g = new THREE.Group();
    g.position.set(b.x, 0, b.z);
    g.name = `booth_${id}`;
    buildHeroStation(g, b);
    root.add(g);
    boothGroups[id] = g;
  }
  boothGroups.lab.visible = true;
  boothGroups.face.visible = false;

  for (const [label, x, col] of [
    ['CITY', -3.6, '#4a8a98'],
    ['FACE', 0.0, '#a87890'],
    ['BUDGET', 3.6, '#6b8f6a'],
  ]) {
    const card = makeSign(label, 2.0, 0.5, '#1e2420', '#f0e6d0', col);
    card.position.set(x, 4.55, -7.4);
    root.add(card);
  }

  addBgDesk(root, -12.0, -5.0, 0, 'PLATE');
  addBgDesk(root, 12.0, -5.0, 1, 'GRADE');
  addBgDesk(root, -7.2, -5.35, 2, null);
  addBgDesk(root, 7.2, -5.35, 3, null);

  const posterXs = [-11.2, -6.4, -2.0, 2.4, 6.8, 11.5];
  posterXs.forEach((x, i) => {
    const p = makePosterArt(i, 0.85, 1.15);
    p.position.set(x, 3.15, -7.65);
    root.add(p);
  });

  // Equipment racks
  for (const [sx, sz, ry] of [[-14.2, 2.0, Math.PI / 2], [-14.2, -2.0, Math.PI / 2], [14.2, 1.5, -Math.PI / 2], [14.2, -2.2, -Math.PI / 2]]) {
    const rack = new THREE.Group();
    rack.position.set(sx, 0, sz);
    rack.rotation.y = ry;
    box(rack, 1.4, 0.08, 0.45, '#3a3a40', 0, 0.9, 0);
    box(rack, 1.4, 0.08, 0.45, '#3a3a40', 0, 1.5, 0);
    box(rack, 1.4, 0.08, 0.45, '#3a3a40', 0, 2.1, 0);
    box(rack, 0.08, 2.1, 0.45, '#2a2a30', -0.65, 1.05, 0);
    box(rack, 0.08, 2.1, 0.45, '#2a2a30', 0.65, 1.05, 0);
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 4; i++) {
        box(rack, 0.25, 0.2, 0.3, ['#4a8a98', '#a87890', '#6b8f6a', '#c4a35a'][i],
          -0.45 + i * 0.3, 1.05 + r * 0.6, 0.05, 0, 0, 0, { noShadow: true });
      }
    }
    root.add(rack);
  }

  // Lounge couch
  box(root, 3.0, 0.45, 1.1, '#5a5048', -10.5, 0.35, 2.5, 0, 0.6, 0, { round: 0.08 });
  box(root, 3.0, 0.55, 0.2, '#4a4038', -10.5, 0.85, 2.95, 0, 0.6, 0, { round: 0.05 });
  box(root, 1.2, 0.08, 0.7, '#3a342e', -8.2, 0.45, 2.2, 0, 0.4, 0, { round: 0.04 });
  addDrinkCan(root, -8.3, 0.55, 2.15, '#48a878');

  // Aisle rugs + rolling carts so the floor never reads as a bare slab
  for (const [rx, rz, rw, rd] of [
    [0, -1.2, 4.5, 1.6], [-3.6, -1.0, 2.8, 1.4], [3.6, -1.0, 2.8, 1.4],
    [-8, 1.5, 3.2, 2.0], [8, 1.2, 3.0, 1.8],
  ]) {
    box(root, rw, 0.03, rd, '#5a4a42', rx, 0.02, rz, 0, 0, 0, { noShadow: true });
  }
  for (const [cx, cz] of [[-5.5, -2.2], [5.5, -2.4], [-1.8, 1.8], [2.2, 2.0], [-9.5, -3.2], [9.8, -3.0]]) {
    const cart = new THREE.Group();
    cart.position.set(cx, 0, cz);
    box(cart, 0.9, 0.06, 0.55, '#3a3e44', 0, 0.55, 0);
    box(cart, 0.06, 0.55, 0.06, '#2a2e34', -0.38, 0.27, -0.2);
    box(cart, 0.06, 0.55, 0.06, '#2a2e34', 0.38, 0.27, -0.2);
    box(cart, 0.06, 0.55, 0.06, '#2a2e34', -0.38, 0.27, 0.2);
    box(cart, 0.06, 0.55, 0.06, '#2a2e34', 0.38, 0.27, 0.2);
    box(cart, 0.35, 0.25, 0.25, '#4a8a98', -0.15, 0.7, 0, 0, 0, 0, { noShadow: true });
    box(cart, 0.28, 0.2, 0.22, '#a87890', 0.2, 0.68, 0.05, 0, 0, 0, { noShadow: true });
    root.add(cart);
  }
  // Side benches + plants along the wings (fills side voids during orbits)
  for (const [px, pz] of [[-13.5, 0.5], [-13.5, 3.5], [13.5, 0.8], [13.5, 3.2], [-6.5, 4.5], [6.5, 4.8]]) {
    box(root, 1.6, 0.45, 0.55, '#4a4038', px, 0.35, pz, 0, 0, 0, { round: 0.05 });
    cyl(root, 0.1, 0.14, 0.18, '#6a4a38', px + 0.45, 0.7, pz);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), mat('#3d6b4f'));
    bush.position.set(px + 0.45, 1.05, pz);
    root.add(bush);
  }
  // Wall-mounted shelves of drive bays / binders (no bare wall slabs)
  for (const [sx, sz, ry] of [[-15.2, -5.5, Math.PI / 2], [15.2, -5.5, -Math.PI / 2]]) {
    for (let row = 0; row < 4; row++) {
      box(root, 0.08, 0.08, 3.5, '#3a3028', sx, 1.2 + row * 0.85, sz);
      for (let i = 0; i < 8; i++) {
        box(root, 0.22, 0.55, 0.35,
          ['#4a8a98', '#a87890', '#6b8f6a', '#c4a35a', '#7a6a94'][i % 5],
          sx + (sx < 0 ? 0.2 : -0.2), 1.45 + row * 0.85, sz - 1.4 + i * 0.4,
          0, ry, 0, { noShadow: true });
      }
    }
  }

  cyl(root, 0.05, 0.08, 2.2, '#3a3a40', 12.5, 1.1, 5.8);
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.4, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: '#f0dcb0', emissive: '#e8c878', emissiveIntensity: 0.9, side: THREE.DoubleSide,
    }),
  );
  lampShade.position.set(12.5, 2.35, 5.8);
  root.add(lampShade);
  const floorLamp = new THREE.PointLight('#ffd9a0', 1.4, 8, 2);
  floorLamp.position.set(12.5, 2.2, 5.8);
  root.add(floorLamp);

  const title = makeSign('REALISM LAB', 2.8, 0.55, '#1a1020', '#f0d0a0', '#c4a35a');
  title.position.set(0, 5.4, -7.55);
  root.add(title);
  neonStrip(root, 3.0, '#c4a35a', 0, 5.05, -7.5);

  for (const [wx, wz] of [[-15.25, 5.5], [-15.25, 7.5], [15.25, 4.5], [15.25, 6.8]]) {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.0),
      new THREE.MeshBasicMaterial({ color: '#d8ecf0' }),
    );
    win.position.set(wx, 3.4, wz);
    win.rotation.y = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
    root.add(win);
    box(root, 0.08, 2.15, 2.55, '#3a2e24', wx + (wx < 0 ? 0.08 : -0.08), 3.4, wz);
    const winLight = new THREE.PointLight('#e8f4f8', 1.1, 7, 2);
    winLight.position.set(wx + (wx < 0 ? 0.8 : -0.8), 3.2, wz);
    root.add(winLight);
  }

  const shadowCatch = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: '#2a2118', transparent: true, opacity: 0.35, depthWrite: false }),
  );
  shadowCatch.rotation.x = -Math.PI / 2;
  shadowCatch.position.set(0, 0.03, 0.9);
  root.add(shadowCatch);

  return { root, booths: boothGroups, boothMeta: booths, shadowCatch };
}
