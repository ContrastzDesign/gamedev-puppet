// Sales-chart museum for the biggest-games Short (V1).
// Booths: museum chart wall (hook), 2002 game shop + CRT, 2007 living room + rhythm TV,
// 2011 midnight launch with shooter + fantasy screens + trophies.
// Generic plain-lettering signs only — no real logos / box art.
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

function addDrinkCan(parent, x, y, z, color = '#c45848') {
  cyl(parent, 0.045, 0.045, 0.14, color, x, y, z);
  cyl(parent, 0.04, 0.04, 0.02, '#d8d0c0', x, y + 0.07, z);
}

function addCrt(parent, tex, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.1, 0.95, 0.85, '#3a3a40', 0, 0, 0, 0, 0, 0, { round: 0.04 });
  box(g, 0.95, 0.72, 0.08, '#1a1a1e', 0, 0.05, 0.42);
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.66),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.set(0, 0.05, 0.48);
  scr.name = 'screenMesh';
  scr.userData.isSignOrScreen = true;
  g.add(scr);
  const glow = new THREE.PointLight('#b8d4e8', 0.7, 4, 2);
  glow.position.set(0, 0.1, 0.7);
  g.add(glow);
  parent.add(g);
  return g;
}

function addShelfGames(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 1.6, 0.08, 0.4, '#5a4030', 0, 0, 0);
  const cols = ['#4a8a98', '#c45848', '#6b8f6a', '#a87890', '#c4a35a', '#3a4858'];
  for (let i = 0; i < 6; i++) {
    box(g, 0.18, 0.28, 0.22, cols[i], -0.65 + i * 0.26, 0.18, 0, 0, 0.1, 0, { round: 0.02 });
  }
  parent.add(g);
  return g;
}

function addGuitarBox(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  box(g, 0.55, 0.22, 1.1, '#e8e0d0', 0, 0.12, 0, 0, 0.2, 0, { round: 0.03 });
  box(g, 0.5, 0.04, 1.0, '#c45848', 0, 0.24, 0, 0, 0.2, 0);
  const tag = makeSign('$99 BUNDLE', 0.7, 0.22, '#f0e6d0', '#2a2118', '#c45848');
  tag.position.set(0.15, 0.4, 0.35);
  tag.rotation.y = -0.3;
  g.add(tag);
  parent.add(g);
  return g;
}

function addCouch(parent, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, 2.4, 0.4, 0.95, '#5a5048', 0, 0.35, 0, 0, 0, 0, { round: 0.08 });
  box(g, 2.4, 0.55, 0.2, '#4a4038', 0, 0.85, -0.35, 0, 0, 0, { round: 0.05 });
  box(g, 0.25, 0.45, 0.9, '#4a4038', -1.05, 0.55, 0, 0, 0, 0, { round: 0.05 });
  box(g, 0.25, 0.45, 0.9, '#4a4038', 1.05, 0.55, 0, 0, 0, 0, { round: 0.05 });
  parent.add(g);
  return g;
}

function addTrophy(parent, x, y, z, color) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  cyl(g, 0.08, 0.12, 0.08, '#c4a35a', 0, 0.04, 0);
  cyl(g, 0.04, 0.05, 0.18, '#e0c070', 0, 0.16, 0);
  const cup = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(color, { metalness: 0.4, roughness: 0.35 }),
  );
  cup.position.set(0, 0.28, 0);
  cup.rotation.x = Math.PI;
  g.add(cup);
  parent.add(g);
  return g;
}

function addLamp(parent, x, y, z) {
  cyl(parent, 0.05, 0.08, 1.4, '#3a3a40', x, y + 0.7, z);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.35, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: '#f0dcb0', emissive: '#e8c878', emissiveIntensity: 0.9, side: THREE.DoubleSide,
    }),
  );
  shade.position.set(x, y + 1.5, z);
  parent.add(shade);
  const light = new THREE.PointLight('#ffd9a0', 1.2, 7, 2);
  light.position.set(x, y + 1.35, z);
  parent.add(light);
}

function buildHeroStation(g, b) {
  box(g, 2.6, 0.12, 0.95, '#5c4332', 0, 0.95, -0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.12, 0.95, 0.85, '#4a3628', -1.15, 0.47, -0.05);
  box(g, 0.12, 0.95, 0.85, '#4a3628', 1.15, 0.47, -0.05);

  if (b.theme === 'museum') {
    const scr = makeScreen(b.screen);
    scr.scale.set(1.35, 1.35, 1);
    scr.position.set(0, 1.95, -0.2);
    g.add(scr);
    // era section plaques (low — stay above caption band in world, but not center-screen)
    for (const [lab, ox, col] of [['2002', -0.75, '#4a8a98'], ['2007', 0, '#c45848'], ['2011', 0.75, '#6b8f6a']]) {
      const tag = makeSign(lab, 0.55, 0.28, '#1e2420', '#f0e6d0', col);
      tag.position.set(ox, 1.2, 0.35);
      g.add(tag);
    }
    box(g, 0.9, 0.08, 0.45, '#3a4850', -0.7, 1.05, 0.25, 0, 0, 0, { round: 0.02 });
    box(g, 0.9, 0.08, 0.45, '#4a3038', 0.7, 1.05, 0.25, 0, 0, 0, { round: 0.02 });
    neonStrip(g, 2.0, '#c4a35a', 0, 2.7, -0.3);
  } else if (b.theme === 'shop02') {
    addCrt(g, b.screen, 0.15, 1.55, -0.1);
    addShelfGames(g, -0.55, 1.05, 0.15);
    addShelfGames(g, 0.85, 1.05, 0.1);
    box(g, 0.35, 0.55, 0.25, '#2a3a48', -1.0, 1.3, 0.2);
    const tip = makeSign('OPEN WORLD', 0.95, 0.28, '#201018', '#f0d0e0', '#e8a0b0');
    tip.position.set(0.9, 2.15, 0.15);
    tip.rotation.y = -0.25;
    g.add(tip);
    neonStrip(g, 1.6, '#e8a0b0', 0, 2.55, -0.3);
  } else if (b.theme === 'living') {
    const tv = makeScreen(b.screen);
    tv.position.set(0, 1.85, -0.2);
    g.add(tv);
    addGuitarBox(g, 0.75, 1.0, 0.35);
    box(g, 0.9, 0.08, 0.55, '#3a342e', -0.55, 1.02, 0.25, 0, 0, 0, { round: 0.03 });
    addDrinkCan(g, -0.7, 1.12, 0.35, '#48a878');
    const tip = makeSign('RHYTHM BUNDLE', 1.1, 0.28, '#201018', '#f0d0d0', '#c45848');
    tip.position.set(-0.55, 1.35, 0.35);
    g.add(tip);
    neonStrip(g, 1.6, '#c45848', 0, 2.55, -0.3);
  } else if (b.theme === 'launch') {
    const scr = makeScreen(b.screen);
    scr.position.set(-0.55, 1.85, -0.15);
    g.add(scr);
    const scr2 = makeScreen(b.screen2);
    scr2.position.set(0.7, 1.85, -0.2);
    scr2.rotation.y = -0.2;
    g.add(scr2);
    addTrophy(g, -0.7, 1.05, 0.4, '#4a8a98');
    addTrophy(g, 0, 1.05, 0.45, '#c45848');
    addTrophy(g, 0.7, 1.05, 0.4, '#6b8f6a');
    const tip = makeSign('3 GENRES', 0.85, 0.24, '#102018', '#d8f0d0', '#c4a35a');
    tip.position.set(-1.05, 1.55, 0.35);
    tip.rotation.y = 0.35;
    g.add(tip);
    if (b.screen3) {
      const trophyScr = makeScreen(b.screen3);
      trophyScr.scale.setScalar(0.55);
      trophyScr.position.set(0, 2.55, -0.25);
      g.add(trophyScr);
    }
    neonStrip(g, 2.0, '#6b8f6a', 0, 2.9, -0.3);
  }

  const sign = makeSign(b.label);
  sign.position.set(0, b.theme === 'launch' ? 3.15 : 2.85, -0.35);
  g.add(sign);
  box(g, 0.1, 2.4, 1.2, '#6a5545', -1.4, 1.2, -0.15);
  box(g, 0.1, 2.4, 1.2, '#6a5545', 1.4, 1.2, -0.15);
  const monLight = new THREE.PointLight('#b8d4e8', 0.75, 5, 2);
  monLight.position.set(0, 1.85, 0.4);
  g.add(monLight);
  cyl(g, 0.12, 0.16, 0.2, '#6a4a38', 1.05, 1.1, 0.5);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat('#3d6b4f'));
  leaf.position.set(1.05, 1.4, 0.5);
  g.add(leaf);
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
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 20; col++) {
      box(root, 1.4, 0.5, 0.08, row % 2 ? '#6a6870' : '#5a5860',
        -13 + col * 1.4, 0.6 + row * 0.6, -7.78, 0, 0, 0, { noShadow: true });
    }
  }

  box(root, 32, 0.22, 22, '#3a3840', 0, 6.55, 0);
  for (let i = -4; i <= 4; i++) {
    box(root, 0.22, 0.32, 20, '#2a2830', i * 3.2, 6.3, 0);
  }
  for (let j = -2; j <= 2; j++) {
    box(root, 28, 0.18, 0.18, '#3a3840', 0, 6.28, j * 3.5);
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

  const booths = {
    museum: {
      x: 0.0, z: -5.2, label: 'SALES MUSEUM', screen: textures.chart,
      neon: '#c4a35a', theme: 'museum',
    },
    shop02: {
      x: -3.6, z: -5.2, label: '2002 SHOP', screen: textures.drive,
      neon: '#e8a0b0', theme: 'shop02',
    },
    living: {
      x: 0.0, z: -5.2, label: '2007 LIVING', screen: textures.rhythm,
      neon: '#c45848', theme: 'living',
    },
    launch: {
      x: 3.6, z: -5.2, label: '2011 LAUNCH', screen: textures.shooter,
      screen2: textures.fantasy, screen3: textures.trophies,
      neon: '#6b8f6a', theme: 'launch',
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
  // museum + living share x=0; toggle visibility by beat
  boothGroups.museum.visible = true;
  boothGroups.living.visible = false;

  for (const [label, x, col] of [
    ['2002', -3.6, '#e8a0b0'],
    ['2007', 0.0, '#c45848'],
    ['2011', 3.6, '#6b8f6a'],
  ]) {
    const card = makeSign(label, 2.0, 0.5, '#1e2420', '#f0e6d0', col);
    card.position.set(x, 4.55, -7.4);
    root.add(card);
  }

  // side desks / shelves
  addShelfGames(root, -12.0, 1.2, -5.0);
  addShelfGames(root, 12.0, 1.2, -5.0);
  box(root, 2.0, 0.1, 0.9, '#534032', -7.2, 0.92, -5.0, 0, 0, 0, { round: 0.03 });
  box(root, 2.0, 0.1, 0.9, '#534032', 7.2, 0.92, -5.0, 0, 0, 0, { round: 0.03 });
  addCrt(root, textures.chart, -7.2, 1.55, -5.1);
  addCrt(root, textures.trophies, 7.2, 1.55, -5.1);

  const posterXs = [-11.2, -6.4, -2.0, 2.4, 6.8, 11.5];
  posterXs.forEach((x, i) => {
    const p = makePosterArt(i, 0.85, 1.15);
    p.position.set(x, 3.15, -7.65);
    root.add(p);
  });

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

  addCouch(root, -10.5, 0, 2.5, 0.6);
  addGuitarBox(root, -8.2, 0, 2.2);
  addLamp(root, 12.5, 0, 5.8);
  addDrinkCan(root, -8.3, 0.55, 2.15, '#48a878');

  const title = makeSign('SALES CHART MUSEUM', 3.2, 0.55, '#1a1020', '#f0d0a0', '#c4a35a');
  title.position.set(0, 5.4, -7.55);
  root.add(title);
  neonStrip(root, 3.4, '#c4a35a', 0, 5.05, -7.5);

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
