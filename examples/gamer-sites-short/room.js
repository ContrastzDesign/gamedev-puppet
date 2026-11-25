// Detailed cyber-cafe / web-street set for the gamer-sites Short (V1).
// Warm wood + brick + neon + practical lamps. Generic plain-lettering signs only — no real logos.
// Intentionally dense set dressing so every shot reads as a full room (depth, neighbours, props).
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
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
}

/** Generic original poster art (shapes only — not real game covers). */
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
    ctx.fillRect(70, 280, 116, 18);
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

function makeScreenTex(seed) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const ctx = c.getContext('2d');
  const hues = ['#1a3a4a', '#2a1a3a', '#1a2a28', '#3a2a1a', '#1a2a3a'];
  ctx.fillStyle = hues[seed % hues.length];
  ctx.fillRect(0, 0, 256, 160);
  // faux UI chrome
  ctx.fillStyle = '#0e1418';
  ctx.fillRect(0, 0, 256, 22);
  ctx.fillStyle = ['#6a8fbf', '#a87890', '#5a9a88', '#c4785a', '#7a6a94'][seed % 5];
  ctx.fillRect(8, 6, 40, 10);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = `rgba(240,230,200,${0.15 + (i + seed) % 3 * 0.12})`;
    ctx.fillRect(12, 36 + i * 36, 140 + ((seed + i) % 3) * 20, 26);
  }
  ctx.fillStyle = '#c4e8a0';
  ctx.fillRect(200, 40, 40, 40);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeScreen(tex) {
  const geo = new THREE.PlaneGeometry(1.35, 0.85);
  const screen = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }));
  const bezel = box(new THREE.Group(), 1.5, 1.0, 0.08, '#1c1c20', 0, 0, -0.05);
  const g = new THREE.Group();
  g.add(bezel);
  screen.position.z = 0.02; // sit clearly in front of bezel — no z-fight
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

function addHeadset(parent, x, y, z) {
  const g = new THREE.Group();
  // headband
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.018, 8, 16, Math.PI),
    mat('#2a3038'),
  );
  band.rotation.z = Math.PI / 2;
  band.position.set(0, 0.08, 0);
  g.add(band);
  box(g, 0.06, 0.08, 0.05, '#3a4050', -0.12, 0, 0, 0, 0, 0, { round: 0.015 });
  box(g, 0.06, 0.08, 0.05, '#3a4050', 0.12, 0, 0, 0, 0, 0, { round: 0.015 });
  // mic boom
  box(g, 0.14, 0.012, 0.012, '#4a5060', 0.16, -0.04, 0.04, 0, 0, 0.4);
  g.position.set(x, y, z);
  g.rotation.y = -0.4;
  parent.add(g);
  return g;
}

function addRgbKeyboard(parent, x, y, z) {
  const kb = box(parent, 0.78, 0.04, 0.28, '#1e2228', x, y, z, 0, 0, 0, { round: 0.02 });
  // RGB key row strips (slightly above keyboard — offset to avoid z-fight)
  const cols = ['#e06070', '#e0a050', '#60c080', '#5090e0', '#a060d0'];
  for (let i = 0; i < 5; i++) {
    box(parent, 0.12, 0.015, 0.18, cols[i], x - 0.28 + i * 0.14, y + 0.028, z, 0, 0, 0, {
      mat: { emissive: cols[i], emissiveIntensity: 0.7, roughness: 0.4 },
      noShadow: true,
    });
  }
  return kb;
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

function addSnackBag(parent, x, y, z, color = '#d4a060') {
  box(parent, 0.1, 0.14, 0.04, color, x, y, z, 0, 0.3, 0.1, { round: 0.01 });
}

function addCable(parent, x0, y0, z0, x1, y1, z1, color = '#2a2a2e') {
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
  const len = Math.hypot(dx, dy, dz);
  const mid = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const m = box(parent, 0.018, 0.018, len, color, mid[0], mid[1], mid[2]);
  m.lookAt(x1, y1, z1);
  return m;
}

function addShelfUnit(parent, x, z, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  // frame
  box(g, 1.4, 0.08, 0.45, '#4a3628', 0, 0.9, 0);
  box(g, 1.4, 0.08, 0.45, '#4a3628', 0, 1.55, 0);
  box(g, 1.4, 0.08, 0.45, '#4a3628', 0, 2.2, 0);
  box(g, 0.08, 2.2, 0.45, '#3a2e24', -0.66, 1.1, 0);
  box(g, 0.08, 2.2, 0.45, '#3a2e24', 0.66, 1.1, 0);
  const caseColors = ['#6a8fbf', '#c4a35a', '#7a6a84', '#6b7c5c', '#c4785a', '#5a7a9a', '#a87860', '#8a6a9a'];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const col = caseColors[(row * 7 + i) % caseColors.length];
      box(g, 0.14, 0.42, 0.06, col, -0.5 + i * 0.16, 1.12 + row * 0.65, 0.12);
    }
  }
  // snack row on top shelf edge
  for (let i = 0; i < 4; i++) addSnackBag(g, -0.4 + i * 0.25, 2.35, 0.1, caseColors[i + 2]);
  parent.add(g);
  return g;
}

function addBgBooth(parent, x, z, seed, label) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  // desk (slightly different height offset from hero booths to avoid coplanar floors)
  box(g, 2.2, 0.1, 1.0, '#534032', 0, 0.92, 0.15, 0, 0, 0, { round: 0.03 });
  box(g, 0.1, 0.9, 0.9, '#433028', -0.95, 0.45, 0.15);
  box(g, 0.1, 0.9, 0.9, '#433028', 0.95, 0.45, 0.15);
  // glowing PC tower
  box(g, 0.28, 0.7, 0.45, '#1a1e24', -0.7, 1.3, -0.15);
  box(g, 0.02, 0.5, 0.02, ['#e06070', '#60c080', '#5090e0'][seed % 3], -0.55, 1.3, -0.15, 0, 0, 0, {
    mat: { emissive: ['#e06070', '#60c080', '#5090e0'][seed % 3], emissiveIntensity: 1.4 },
    noShadow: true,
  });
  // monitor with original UI
  const scr = makeScreen(makeScreenTex(seed + 3));
  scr.scale.setScalar(0.85);
  scr.position.set(0.15, 1.7, -0.15);
  g.add(scr);
  addRgbKeyboard(g, 0.1, 1.0, 0.35);
  addRgbMouse(g, 0.55, 1.01, 0.4);
  // chair tucked under desk (never in the aisle / camera sightline)
  box(g, 0.5, 0.07, 0.5, '#3a4450', 0.55, 0.5, 0.35, 0, 0.4, 0, { round: 0.04 });
  cyl(g, 0.06, 0.08, 0.48, '#2a3038', 0.55, 0.24, 0.35);
  box(g, 0.45, 0.5, 0.07, '#3a4450', 0.55, 0.85, 0.55, 0, 0.4, 0, { round: 0.03 });
  // soft monitor glow
  const glow = new THREE.PointLight(['#6a8fbf', '#a87890', '#5a9a88', '#c4785a', '#7a6a94'][seed % 5], 0.7, 4, 2);
  glow.position.set(0.15, 1.7, 0.3);
  g.add(glow);
  if (label) {
    const s = makeSign(label, 1.3, 0.35, '#1e2824', '#d8e8d0', '#6a9a78');
    s.position.set(0, 2.35, -0.3);
    g.add(s);
  }
  // side panel
  box(g, 0.08, 2.1, 1.3, '#5a483c', -1.15, 1.05, 0.05);
  box(g, 0.08, 2.1, 1.3, '#5a483c', 1.15, 1.05, 0.05);
  parent.add(g);
  return g;
}

function buildHeroBooth(g, b, textures) {
  // desk — shallower + pulled back so the top edge stays behind the aisle character
  box(g, 2.6, 0.12, 0.95, '#5c4332', 0, 0.95, -0.05, 0, 0, 0, { round: 0.04 });
  box(g, 0.12, 0.95, 0.85, '#4a3628', -1.15, 0.47, -0.05);
  box(g, 0.12, 0.95, 0.85, '#4a3628', 1.15, 0.47, -0.05);
  // PC tower with RGB strip
  box(g, 0.32, 0.85, 0.5, '#1a1e24', -1.0, 1.4, -0.25);
  box(g, 0.02, 0.6, 0.02, '#60a0e0', -0.83, 1.4, -0.25, 0, 0, 0, {
    mat: { emissive: '#60a0e0', emissiveIntensity: 1.5 },
    noShadow: true,
  });
  // monitor stand + screen
  box(g, 0.25, 0.08, 0.35, '#2a2a2e', 0, 1.02, -0.15);
  cyl(g, 0.05, 0.05, 0.35, '#2a2a2e', 0, 1.22, -0.15);
  const scr = makeScreen(b.screen);
  scr.position.set(0, 1.85, -0.2);
  g.add(scr);
  // RGB keyboard + mouse on desk (behind the aisle character)
  addRgbKeyboard(g, -0.75, 1.035, 0.2);
  addRgbKeyboard(g, 0.5, 1.035, 0.2);
  addRgbMouse(g, -0.2, 1.045, 0.3);
  addRgbMouse(g, 1.0, 1.045, 0.28);
  // headset hanging on side panel (always readable)
  addHeadset(g, -1.25, 1.55, 0.35);
  addHeadset(g, 1.25, 1.55, 0.35);
  // drinks / snacks on desk corners
  addDrinkCan(g, -1.05, 1.1, 0.25, '#c45848');
  addDrinkCan(g, -0.9, 1.1, 0.35, '#4878a8');
  addDrinkCan(g, 1.0, 1.1, 0.22, '#48a878');
  addSnackBag(g, -1.1, 1.1, 0.05, '#d4a060');
  addSnackBag(g, 1.05, 1.1, 0.35, '#6a8fbf');
  // cables under desk only (kept clear of floor/desk faces — no z-fight)
  addCable(g, -0.15, 0.78, -0.1, -0.85, 0.62, -0.35, '#3a3a40');
  addCable(g, 0.25, 0.8, -0.05, 0.9, 0.58, -0.3, '#2a3a2e');
  // coiled cable pile under desk (not in aisle)
  cyl(g, 0.12, 0.12, 0.05, '#2e2e32', 0.9, 0.04, 0.2);
  cyl(g, 0.09, 0.09, 0.04, '#3a4038', -0.9, 0.04, 0.15);
  // power strip (offset from cable tray)
  box(g, 0.7, 0.04, 0.1, '#1e1e22', 0.15, 0.58, -0.25);
  // chair fully under the desk (negative-z), rotated — never between camera and character
  box(g, 0.6, 0.08, 0.6, '#3d4654', 0.85, 0.55, -0.15, 0, 0.9, 0, { round: 0.05 });
  cyl(g, 0.07, 0.09, 0.55, '#2a3038', 0.85, 0.27, -0.15);
  box(g, 0.55, 0.55, 0.07, '#3d4654', 0.85, 0.9, 0.1, 0, 0.9, 0, { round: 0.04 });
  box(g, 0.07, 0.07, 0.35, '#2a3038', 0.62, 0.7, -0.1, 0, 0.9, 0);
  box(g, 0.07, 0.07, 0.35, '#2a3038', 1.08, 0.7, -0.2, 0, 0.9, 0);
  // booth sign
  const sign = makeSign(b.label);
  sign.position.set(0, 2.55, -0.35);
  g.add(sign);
  // neon under sign
  neonStrip(g, 1.5, b.neon || '#c4a35a', 0, 2.35, -0.32);
  // side panels / booth frame — shorter toward aisle so they don't slab the foreground
  box(g, 0.1, 2.4, 1.2, '#6a5545', -1.4, 1.2, -0.15);
  box(g, 0.1, 2.4, 1.2, '#6a5545', 1.4, 1.2, -0.15);
  // LED edge on panels (back half only)
  box(g, 0.03, 2.2, 0.03, b.neon || '#c4a35a', -1.34, 1.2, 0.35, 0, 0, 0, {
    mat: { emissive: b.neon || '#c4a35a', emissiveIntensity: 1.2 },
    noShadow: true,
  });
  box(g, 0.03, 2.2, 0.03, b.neon || '#c4a35a', 1.34, 1.2, 0.35, 0, 0, 0, {
    mat: { emissive: b.neon || '#c4a35a', emissiveIntensity: 1.2 },
    noShadow: true,
  });
  // plant
  cyl(g, 0.12, 0.16, 0.2, '#6a4a38', 1.05, 1.1, 0.55);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat('#3d6b4f'));
  leaf.position.set(1.05, 1.4, 0.55);
  g.add(leaf);
  // monitor practical light
  const monLight = new THREE.PointLight('#b8d4e8', 0.85, 5, 2);
  monLight.position.set(0, 1.85, 0.4);
  g.add(monLight);
}

export function buildRoom(textures) {
  const root = new THREE.Group();

  // Floor — lifted warm tone, boards slightly above plane to avoid z-fight
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

  // Back + side walls — lighter so room isn't murky
  box(root, 32, 6.8, 0.35, '#a88870', 0, 3.4, -8.0);
  box(root, 0.35, 6.8, 22, '#9a7864', -15.5, 3.4, 0);
  box(root, 0.35, 6.8, 22, '#9a7864', 15.5, 3.4, 0);
  // brick rows (pushed slightly in front of back wall)
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 26; col++) {
      const ox = (row % 2) * 0.3;
      box(root, 1.1, 0.38, 0.1, row % 2 ? '#b09078' : '#a08068',
        -14 + col * 1.15 + ox, 0.55 + row * 0.55, -7.78, 0, 0, 0, { noShadow: true });
    }
  }

  // Ceiling with recessed panels + beams + warm lamps
  box(root, 32, 0.22, 22, '#5a4a3e', 0, 6.55, 0);
  for (let i = -4; i <= 4; i++) {
    box(root, 0.22, 0.32, 20, '#3a2e24', i * 3.2, 6.3, 0);
  }
  // cross beams
  for (let j = -2; j <= 2; j++) {
    box(root, 28, 0.18, 0.18, '#4a3a2e', 0, 6.28, j * 3.5);
  }
  // pendant / sphere lamps denser
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
      // ceiling can fixture
      cyl(root, 0.08, 0.12, 0.15, '#3a3028', lx, 6.15, lz);
    }
  }
  // warm cove LED along ceiling edge
  neonStrip(root, 28, '#e8c878', 0, 6.15, -7.6);
  neonStrip(root, 20, '#78a8c8', -15.1, 5.2, 0, Math.PI / 2);
  neonStrip(root, 20, '#c878a0', 15.1, 5.2, 0, Math.PI / 2);

  // Hero booths along the back wall
  const booths = {
    map:     { x: -8.5, z: -5.2, label: 'WEB MAP',       screen: textures.map,     neon: '#6a8fbf' },
    library: { x: -4.2, z: -5.2, label: 'PC LIBRARY',    screen: textures.library, neon: '#c4a35a' },
    arcade:  { x: 0.2,  z: -5.2, label: 'BROWSER PLAY',  screen: textures.arcade,  neon: '#5a9a88' },
    blocks:  { x: 4.6,  z: -5.2, label: 'BLOCK WORLD',   screen: textures.blocks,  neon: '#c4785a' },
    live:    { x: 9.0,  z: -5.2, label: 'LIVE WATCH',    screen: textures.live,    neon: '#a87890' },
  };

  const boothGroups = {};
  for (const [id, b] of Object.entries(booths)) {
    const g = new THREE.Group();
    g.position.set(b.x, 0, b.z);
    buildHeroBooth(g, b, textures);
    root.add(g);
    boothGroups[id] = g;
  }

  // Neighbouring booths — back wall + far sides only (nothing in the camera→character aisle)
  addBgBooth(root, -12.4, -5.0, 0, 'OPEN SEAT');
  addBgBooth(root, -12.6, -2.8, 1, null);
  addBgBooth(root, 12.0, -5.0, 2, 'DUO BAY');
  addBgBooth(root, 12.4, -2.8, 3, null);
  // Compact glowing stations in the gaps BETWEEN hero booths (same back wall)
  addBgBooth(root, -6.35, -5.35, 6, null);
  addBgBooth(root, -1.95, -5.35, 0, null);
  addBgBooth(root, 2.45, -5.35, 1, null);
  addBgBooth(root, 6.85, -5.35, 2, null);

  // Posters with generic original art — mid height so mid shots catch them
  const posterXs = [-11.2, -6.4, -2.0, 2.4, 6.8, 11.5];
  posterXs.forEach((x, i) => {
    const p = makePosterArt(i, 0.85, 1.15);
    p.position.set(x, 3.15, -7.65);
    root.add(p);
  });
  // Extra smaller posters lower between booths
  [-9.6, -5.2, -0.8, 3.6, 8.0].forEach((x, i) => {
    const p = makePosterArt(i + 3, 0.55, 0.75);
    p.position.set(x, 4.35, -7.65);
    root.add(p);
  });
  // Side wall posters
  for (let i = 0; i < 4; i++) {
    const p = makePosterArt(i + 7, 0.75, 1.05);
    p.position.set(-15.25, 2.8 + (i % 2) * 0.2, -4 + i * 2.2);
    p.rotation.y = Math.PI / 2;
    root.add(p);
  }

  // Shelves with game boxes + snacks
  addShelfUnit(root, -14.2, 2.5, Math.PI / 2);
  addShelfUnit(root, -14.2, -1.5, Math.PI / 2);
  addShelfUnit(root, 14.2, 1.0, -Math.PI / 2);

  // Center rug
  box(root, 6, 0.018, 4, '#8a5a4a', 0, 0.022, 2.2);

  // Lounge sofa + coffee table (foreground depth)
  box(root, 3.2, 0.45, 1.1, '#6a5548', -1.5, 0.35, 5.5, 0, 0.15, 0, { round: 0.08 });
  box(root, 3.2, 0.55, 0.2, '#5a4538', -1.5, 0.85, 5.95, 0, 0.15, 0, { round: 0.05 });
  box(root, 1.4, 0.08, 0.8, '#4a3628', 1.8, 0.45, 5.2, 0, -0.2, 0, { round: 0.04 });
  cyl(root, 0.06, 0.06, 0.4, '#3a2e24', 1.4, 0.2, 5.0);
  cyl(root, 0.06, 0.06, 0.4, '#3a2e24', 2.2, 0.2, 5.4);
  addDrinkCan(root, 1.7, 0.55, 5.15, '#48a878');
  addSnackBag(root, 2.0, 0.55, 5.25, '#c4785a');

  // Standing lamp (brighter)
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

  // Cable trays under hero desks
  for (const x of [-8.5, -4.2, 0.2, 4.6, 9.0]) {
    box(root, 1.8, 0.06, 0.12, '#2a2a2e', x, 0.55, -4.55);
  }

  // Trash can + water cooler
  cyl(root, 0.28, 0.32, 0.7, '#3a3a40', 13.2, 0.35, 3.5);
  cyl(root, 0.22, 0.25, 1.1, '#8aa0b0', -13.0, 0.55, 5.0);
  cyl(root, 0.28, 0.28, 0.35, '#c8dce8', -13.0, 1.3, 5.0, 0, 0, 0, {
    mat: { transparent: true, opacity: 0.55, roughness: 0.2 },
  });

  // Signage
  const poster = makeSign("TODAY'S PICKS", 1.2, 1.6, '#243028', '#e8f0d8', '#c4a35a');
  poster.position.set(-15.2, 2.8, 2.5);
  poster.rotation.y = Math.PI / 2;
  root.add(poster);
  const poster2 = makeSign('QUEUE HERE', 1.2, 0.9, '#302820', '#f0e0c8', '#c4785a');
  poster2.position.set(15.2, 2.5, -0.5);
  poster2.rotation.y = -Math.PI / 2;
  root.add(poster2);
  const neonSign = makeSign('PIXEL CAFE', 2.4, 0.55, '#1a1020', '#f0a0c8', '#e06090');
  neonSign.position.set(0, 5.4, -7.55);
  root.add(neonSign);
  neonStrip(root, 2.6, '#e06090', 0, 5.05, -7.5);

  // Windows with warm exterior glow (both sides)
  for (const [wx, wz] of [[-15.25, 5.5], [-15.25, 7.5], [15.25, 4.5], [15.25, 6.8]]) {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.0),
      new THREE.MeshBasicMaterial({ color: '#d8ecf0' }),
    );
    win.position.set(wx, 3.4, wz);
    win.rotation.y = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
    root.add(win);
    // frame
    box(root, 0.08, 2.15, 2.55, '#3a2e24', wx + (wx < 0 ? 0.08 : -0.08), 3.4, wz);
    const winLight = new THREE.PointLight('#e8f4f8', 1.1, 7, 2);
    winLight.position.set(wx + (wx < 0 ? 0.8 : -0.8), 3.2, wz);
    root.add(winLight);
  }

  // Contact-shadow catcher (soft dark plane — warm grey, NOT solid blue)
  const shadowCatch = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: '#2a2118', transparent: true, opacity: 0.35, depthWrite: false }),
  );
  shadowCatch.rotation.x = -Math.PI / 2;
  shadowCatch.position.set(0, 0.03, 0.9);
  root.add(shadowCatch);

  return { root, booths: boothGroups, boothMeta: booths, shadowCatch };
}
