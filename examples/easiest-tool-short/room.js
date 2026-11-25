// First-game maker's library/workshop set for the easiest-tool Short (V1).
// Three stations: story-branch (Twine), 2D logic (GDevelop), 3D-world (Nilo).
// Warm wood + shelves + lamps. Generic plain-lettering signs only — no real logos.
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

function addBook(parent, x, y, z, color, h = 0.28, yaw = 0) {
  box(parent, 0.12, h, 0.18, color, x, y, z, 0, yaw, 0, { noShadow: true });
}

function addShelfUnit(parent, x, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  box(g, 1.5, 0.08, 0.5, '#4a3628', 0, 0.9, 0);
  box(g, 1.5, 0.08, 0.5, '#4a3628', 0, 1.55, 0);
  box(g, 1.5, 0.08, 0.5, '#4a3628', 0, 2.2, 0);
  box(g, 0.08, 2.2, 0.5, '#3a2e24', -0.7, 1.1, 0);
  box(g, 0.08, 2.2, 0.5, '#3a2e24', 0.7, 1.1, 0);
  const cols = ['#6a8fbf', '#c4a35a', '#7a6a84', '#6b7c5c', '#c4785a', '#5a7a9a', '#a87860'];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8; i++) {
      const yaw = ((row * 8 + i) % 5) * 0.04 - 0.08;
      addBook(g, -0.55 + i * 0.14, 1.05 + row * 0.65, 0.1, cols[(row + i) % cols.length], 0.35 + (i % 3) * 0.04, yaw);
    }
  }
  parent.add(g);
  return g;
}

function addPassageCards(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const labels = ['Start', 'Forest', 'Cave', 'Choice'];
  labels.forEach((lab, i) => {
    const card = makeSign(lab, 0.45, 0.28, '#2a2238', '#f0e6d0', '#c4a35a');
    card.position.set((i % 2) * 0.55 - 0.2, Math.floor(i / 2) * 0.4, 0.05);
    g.add(card);
  });
  // string links (thin cylinders)
  for (let i = 0; i < 3; i++) {
    box(g, 0.35, 0.012, 0.012, '#e8d080', 0.05 + i * 0.08, 0.15 + i * 0.1, 0.08, 0, 0, 0.4 + i * 0.2, {
      mat: { emissive: '#e8d080', emissiveIntensity: 0.4 },
      noShadow: true,
    });
  }
  parent.add(g);
  return g;
}

function addKeyAndDoor(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  // key
  cyl(g, 0.06, 0.06, 0.04, '#e0c070', -0.25, 0.08, 0.1, Math.PI / 2, 0, 0, {
    mat: { emissive: '#e0c070', emissiveIntensity: 0.5 },
  });
  box(g, 0.22, 0.04, 0.04, '#e0c070', -0.08, 0.08, 0.1, 0, 0, 0, {
    mat: { emissive: '#e0c070', emissiveIntensity: 0.5 },
  });
  // door frame (slightly open)
  box(g, 0.45, 0.7, 0.06, '#8a6040', 0.35, 0.35, 0, 0, -0.35, 0, { round: 0.02 });
  box(g, 0.5, 0.75, 0.05, '#5a4030', 0.45, 0.35, -0.08);
  const open = makeSign('OPEN', 0.4, 0.2, '#1e2824', '#d8f0d0', '#6b8f6a');
  open.position.set(0.35, 0.85, 0.1);
  g.add(open);
  parent.add(g);
  return g;
}

function addMiniWorld(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  // meadow base
  box(g, 0.7, 0.06, 0.5, '#4a8a58', 0, 0.03, 0, 0, 0, 0, { round: 0.02 });
  // cabin
  box(g, 0.22, 0.2, 0.2, '#8a6040', 0.1, 0.16, 0);
  box(g, 0.26, 0.1, 0.24, '#c45848', 0.1, 0.3, 0);
  // portal ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.02, 8, 20),
    new THREE.MeshStandardMaterial({
      color: '#5ec8c0', emissive: '#5ec8c0', emissiveIntensity: 2.0, roughness: 0.3,
    }),
  );
  ring.position.set(-0.2, 0.2, 0.05);
  g.add(ring);
  const pl = new THREE.PointLight('#7ec8c0', 0.8, 2.5, 2);
  pl.position.set(-0.2, 0.25, 0.2);
  g.add(pl);
  parent.add(g);
  return g;
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
  // desk
  box(g, 2.6, 0.12, 0.95, '#5c4332', 0, 0.95, -0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.12, 0.95, 0.85, '#4a3628', -1.15, 0.47, -0.05);
  box(g, 0.12, 0.95, 0.85, '#4a3628', 1.15, 0.47, -0.05);
  // PC tower
  box(g, 0.32, 0.85, 0.5, '#1a1e24', -1.0, 1.4, -0.25);
  box(g, 0.02, 0.6, 0.02, b.neon || '#60a0e0', -0.83, 1.4, -0.25, 0, 0, 0, {
    mat: { emissive: b.neon || '#60a0e0', emissiveIntensity: 1.5 },
    noShadow: true,
  });
  // monitor
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
  // chair under desk
  box(g, 0.55, 0.08, 0.55, '#3d4654', 0.85, 0.55, -0.15, 0, 0.9, 0, { round: 0.05 });
  cyl(g, 0.07, 0.09, 0.55, '#2a3038', 0.85, 0.27, -0.15);
  box(g, 0.5, 0.5, 0.07, '#3d4654', 0.85, 0.9, 0.1, 0, 0.9, 0, { round: 0.04 });
  const sign = makeSign(b.label);
  sign.position.set(0, 2.55, -0.35);
  g.add(sign);
  neonStrip(g, 1.5, b.neon || '#c4a35a', 0, 2.35, -0.32);
  box(g, 0.1, 2.4, 1.2, '#6a5545', -1.4, 1.2, -0.15);
  box(g, 0.1, 2.4, 1.2, '#6a5545', 1.4, 1.2, -0.15);
  const monLight = new THREE.PointLight('#b8d4e8', 0.85, 5, 2);
  monLight.position.set(0, 1.85, 0.4);
  g.add(monLight);
  // plant
  cyl(g, 0.12, 0.16, 0.2, '#6a4a38', 1.05, 1.1, 0.5);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat('#3d6b4f'));
  leaf.position.set(1.05, 1.4, 0.5);
  g.add(leaf);

  if (b.theme === 'workshop') {
    // Three mini station markers on the desk
    for (const [lab, ox, col] of [['Story', -0.55, '#8a6a9a'], ['Logic', 0.05, '#4a8a98'], ['3D', 0.55, '#5a9a98']]) {
      const tag = makeSign(lab, 0.4, 0.22, '#1e2420', '#f0e6d0', col);
      tag.position.set(ox, 1.35, 0.35);
      g.add(tag);
    }
    box(g, 0.35, 0.08, 0.25, '#6a4868', -0.55, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
    box(g, 0.35, 0.08, 0.25, '#3a5a68', 0.05, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
    box(g, 0.35, 0.08, 0.25, '#2a6a68', 0.55, 1.1, 0.35, 0, 0, 0, { round: 0.02 });
  } else if (b.theme === 'story') {
    addPassageCards(g, -0.55, 1.15, 0.35);
    // quill jar
    cyl(g, 0.05, 0.06, 0.12, '#c4a35a', 0.55, 1.1, 0.35);
    box(g, 0.02, 0.35, 0.02, '#ead8c0', 0.55, 1.35, 0.35, 0, 0, 0.2);
  } else if (b.theme === 'logic') {
    addKeyAndDoor(g, 0.35, 1.05, 0.4);
    // toolbox
    box(g, 0.4, 0.22, 0.25, '#c4785a', -0.85, 1.15, 0.3, 0, 0.2, 0, { round: 0.03 });
  } else if (b.theme === 'world3d') {
    addMiniWorld(g, 0.45, 1.05, 0.35);
    const tip = makeSign('TYPE → BUILD', 0.95, 0.28, '#102028', '#a0f0e8', '#5ec8c0');
    tip.position.set(-0.7, 1.4, 0.2);
    g.add(tip);
  }
}

export function buildRoom(textures) {
  const root = new THREE.Group();

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 22),
    mat('#9a7e68', { roughness: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  for (let i = -16; i < 16; i++) {
    box(root, 0.04, 0.015, 22, '#8a6e58', i * 0.95, 0.012, 0, 0, 0, 0, { noShadow: true });
  }

  // Walls
  box(root, 32, 6.8, 0.35, '#a88870', 0, 3.4, -8.0);
  box(root, 0.35, 6.8, 22, '#9a7864', -15.5, 3.4, 0);
  box(root, 0.35, 6.8, 22, '#9a7864', 15.5, 3.4, 0);
  // bookcase-like brick rows
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 26; col++) {
      const ox = (row % 2) * 0.3;
      box(root, 1.1, 0.38, 0.1, row % 2 ? '#b09078' : '#a08068',
        -14 + col * 1.15 + ox, 0.55 + row * 0.55, -7.78, 0, 0, 0, { noShadow: true });
    }
  }

  // Ceiling
  box(root, 32, 0.22, 22, '#5a4a3e', 0, 6.55, 0);
  for (let i = -4; i <= 4; i++) {
    box(root, 0.22, 0.32, 20, '#3a2e24', i * 3.2, 6.3, 0);
  }
  for (let j = -2; j <= 2; j++) {
    box(root, 28, 0.18, 0.18, '#4a3a2e', 0, 6.28, j * 3.5);
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
  neonStrip(root, 28, '#e8c878', 0, 6.15, -7.6);

  const booths = {
    workshop: {
      x: 0.0, z: -5.2, label: 'FIRST GAME LAB', screen: textures.workshop, screen2: textures.story,
      neon: '#c4a35a', theme: 'workshop',
    },
    story: {
      x: -3.6, z: -5.2, label: 'TWINE', screen: textures.story, screen2: textures.passages,
      neon: '#8a6a9a', theme: 'story',
    },
    logic: {
      x: 0.0, z: -5.2, label: 'GDEVELOP', screen: textures.logic, screen2: textures.workshop,
      neon: '#4a8a98', theme: 'logic',
    },
    world3d: {
      x: 3.6, z: -5.2, label: 'NILO', screen: textures.world3d, screen2: textures.logic,
      neon: '#5a9a98', theme: 'world3d',
    },
  };

  // Center desk is shared: workshop (hook/question) and logic (GDevelop) occupy the same pad;
  // film.js toggles which center group is visible per shot.
  const boothGroups = {};
  for (const [id, b] of Object.entries(booths)) {
    const g = new THREE.Group();
    g.position.set(b.x, 0, b.z);
    g.name = `booth_${id}`;
    buildHeroStation(g, b);
    root.add(g);
    boothGroups[id] = g;
  }
  boothGroups.workshop.visible = true;
  boothGroups.logic.visible = false;

  // Tall banners for workshop overview
  for (const [label, x, col] of [
    ['TWINE', -3.6, '#8a6a9a'],
    ['GDEVELOP', 0.0, '#4a8a98'],
    ['NILO', 3.6, '#5a9a98'],
  ]) {
    const card = makeSign(label, 2.0, 0.5, '#1e2420', '#f0e6d0', col);
    card.position.set(x, 4.55, -7.4);
    root.add(card);
  }

  addBgDesk(root, -12.0, -5.0, 0, 'SKETCH');
  addBgDesk(root, 12.0, -5.0, 1, 'PLAYTEST');
  addBgDesk(root, -7.2, -5.35, 2, null);
  addBgDesk(root, 7.2, -5.35, 3, null);

  const posterXs = [-11.2, -6.4, -2.0, 2.4, 6.8, 11.5];
  posterXs.forEach((x, i) => {
    const p = makePosterArt(i, 0.85, 1.15);
    p.position.set(x, 3.15, -7.65);
    root.add(p);
  });

  addShelfUnit(root, -14.2, 2.5, Math.PI / 2);
  addShelfUnit(root, -14.2, -1.5, Math.PI / 2);
  addShelfUnit(root, 14.2, 1.0, -Math.PI / 2);
  addShelfUnit(root, 14.2, -2.5, -Math.PI / 2);

  // Reading nook (side — not in aisle)
  box(root, 3.0, 0.45, 1.1, '#6a5548', -10.5, 0.35, 2.5, 0, 0.6, 0, { round: 0.08 });
  box(root, 3.0, 0.55, 0.2, '#5a4538', -10.5, 0.85, 2.95, 0, 0.6, 0, { round: 0.05 });
  box(root, 1.2, 0.08, 0.7, '#4a3628', -8.2, 0.45, 2.2, 0, 0.4, 0, { round: 0.04 });
  addDrinkCan(root, -8.3, 0.55, 2.15, '#48a878');

  // Floor lamp
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

  const title = makeSign('FIRST GAME LAB', 2.8, 0.55, '#1a1020', '#f0d0a0', '#c4a35a');
  title.position.set(0, 5.4, -7.55);
  root.add(title);
  neonStrip(root, 3.0, '#c4a35a', 0, 5.05, -7.5);

  // Windows
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
