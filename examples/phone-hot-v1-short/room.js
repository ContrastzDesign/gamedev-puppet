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

/** Warm practicals + cable trays + heat glow so chip-world ceiling band never reads as a void. */
function addChipCeilingDress(parent, heat = true) {
  // lit ceiling plane — kills the dark void in the top ~15% of portrait frames
  box(parent, 7.8, 0.1, 6.6, '#4a5a50', 0, 4.05, 0, 0, 0, 0, {
    mat: { emissive: '#7a8a70', emissiveIntensity: 0.7 },
    noShadow: true,
  });
  // warm wash panels hanging into the top band (read as practical glow, not void)
  for (const z of [-2.0, -0.5, 1.0]) {
    box(parent, 7.0, 0.55, 0.08, '#f5e0b0', 0, 3.75, z, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.28, emissive: '#f5c878', emissiveIntensity: 0.85 },
      noShadow: true,
    });
  }
  // cable trays across the top band
  for (const z of [-2.4, -1.2, 0.0, 1.2]) {
    box(parent, 7.2, 0.1, 0.5, '#4a5560', 0, 3.82, z);
    for (let i = 0; i < 10; i++) {
      box(parent, 0.14, 0.08, 0.38, '#2a3038', -3.15 + i * 0.7, 3.72, z);
      // warm LED strips along trays
      box(parent, 0.55, 0.03, 0.06, '#f5e0b0', -3.0 + i * 0.7, 3.66, z + 0.15, 0, 0, 0, {
        mat: { emissive: '#f5c878', emissiveIntensity: 0.9 },
        noShadow: true,
      });
    }
  }
  // cross runners + hanging ducts
  for (const x of [-2.6, -0.9, 0.9, 2.6]) {
    box(parent, 0.14, 0.12, 5.8, '#5a6570', x, 3.88, -0.3);
    cyl(parent, 0.12, 0.12, 4.5, '#6a7078', x, 3.55, -0.2, 0, 0, Math.PI / 2);
  }
  // warm hanging practicals — dense enough to light the whole top band
  // keep the center clear above the SAFE MODE / THERMAL THROTTLING billboard
  for (let i = 0; i < 8; i++) {
    const x = -3.0 + i * 0.85;
    for (const z of [-2.0, -0.5, 1.0]) {
      if (Math.abs(x) < 1.25 && z > -1.2 && z < 0.2) continue;
      cyl(parent, 0.045, 0.045, 0.4, '#5a4030', x, 3.5, z);
      cyl(parent, 0.1, 0.12, 0.12, '#f5e0b0', x, 3.28, z, 0, 0, 0, {
        mat: { emissive: '#f5c878', emissiveIntensity: 1.0 },
        noShadow: true,
      });
    }
  }
  const warmA = new THREE.PointLight('#f5c878', 0.95, 12, 2);
  warmA.position.set(-1.2, 3.55, 0.4);
  parent.add(warmA);
  const warmB = new THREE.PointLight('#f0e0c0', 0.8, 11, 2);
  warmB.position.set(1.4, 3.5, -0.6);
  parent.add(warmB);
  const warmC = new THREE.PointLight('#ffe8c0', 0.55, 9, 2);
  warmC.position.set(0, 3.7, 1.2);
  parent.add(warmC);
  if (heat) {
    // soft heat-haze glow panels rising into the ceiling band
    for (const x of [-1.4, 0, 1.4]) {
      box(parent, 1.35, 0.7, 0.05, '#c45848', x, 3.6, -2.5, 0, 0, 0, {
        mat: { transparent: true, opacity: 0.4, emissive: '#e08040', emissiveIntensity: 0.85 },
        noShadow: true,
      });
    }
    // volumetric-looking haze slabs near the beams
    for (const z of [-1.0, 0.4]) {
      box(parent, 5.5, 0.35, 0.8, '#c47848', 0, 3.7, z, 0, 0, 0, {
        mat: { transparent: true, opacity: 0.18, emissive: '#e09050', emissiveIntensity: 0.55 },
        noShadow: true,
      });
    }
    const haze = new THREE.PointLight('#e08040', 0.85, 9, 2);
    haze.position.set(0, 3.4, -1.0);
    parent.add(haze);
  }
  // packed ceiling modules + glow tiles flush under the slab — fill the whole top band
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 13; i++) {
      const col = ['#3a4850', '#4a8a98', '#c45848', '#c4a35a', '#6b8f6a', '#a87890', '#ebe4dc'][(i + row) % 7];
      box(parent, 0.4, 0.2, 0.3, col,
        -3.5 + i * 0.55, 3.92, -2.4 + row * 1.05, 0, 0.04, 0, { round: 0.01 });
      if ((i + row) % 3 === 0) {
        box(parent, 0.28, 0.05, 0.22, '#f5e0b0',
          -3.5 + i * 0.55, 3.78, -2.4 + row * 1.05, 0, 0, 0, {
            mat: { emissive: '#f5c878', emissiveIntensity: 0.95 },
            noShadow: true,
          });
      }
    }
  }
  // light beams so they don't read as black bars
  for (const z of [-1.5, 0.2, 1.6]) {
    box(parent, 7.0, 0.14, 0.22, '#6a5848', 0, 3.88, z, 0, 0, 0, {
      mat: { emissive: '#8a7050', emissiveIntensity: 0.25 },
    });
  }
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
  for (let i = 0; i < 5; i++) {
    box(g, 1.15, 0.04, 0.3, '#6a9ab0', 0, 2.65 + i * 0.08, -2.55);
  }
  // wall vents + ducting
  for (const x of [-2.6, 2.6]) {
    box(g, 0.9, 0.55, 0.12, '#9aa8b0', x, 2.0, -3.08);
    for (let i = 0; i < 4; i++) box(g, 0.75, 0.04, 0.06, '#6a7a88', x, 1.85 + i * 0.1, -3.0);
  }
  box(g, 5.5, 0.18, 0.18, '#7a8890', 0, 3.55, -2.95);
  box(g, 0.18, 0.5, 0.18, '#7a8890', -2.4, 3.25, -2.95);
  box(g, 0.18, 0.5, 0.18, '#7a8890', 2.4, 3.25, -2.95);
  const ac = makeSign('COOL AIR', 1.0, 0.26, '#1a3040', '#8ab0c8', '#4a8a98');
  ac.position.set(0, 3.25, -2.7);
  g.add(ac);
  addPhoneProp(g, screens.slow, 0.95, 1.15, -0.15, 0.85, true);
  // lounge furniture cluster — kept inside portrait frustum (|x|≲2)
  box(g, 1.7, 0.42, 0.8, '#6a8f6a', -1.2, 0.35, 0.55, 0, 0, 0, { round: 0.05 });
  box(g, 0.65, 0.55, 0.6, '#5a7f5a', 1.25, 0.4, 0.4, 0, 0, 0, { round: 0.05 });
  box(g, 0.65, 0.55, 0.6, '#4a6f6a', 1.25, 0.4, 1.15, 0, 0.2, 0, { round: 0.05 });
  box(g, 1.0, 0.08, 0.65, '#8a6a40', 0.05, 0.42, 1.0);
  box(g, 0.08, 0.4, 0.08, '#6a5030', -0.35, 0.2, 0.8);
  box(g, 0.08, 0.4, 0.08, '#6a5030', 0.45, 0.2, 1.2);
  cyl(g, 0.07, 0.05, 0.18, '#ebe4dc', -0.15, 0.55, 0.95);
  cyl(g, 0.07, 0.05, 0.18, '#c45848', 0.3, 0.55, 1.05);
  // floor fans + pedestal fans (visible midground)
  for (const [x, z] of [[-1.55, 0.05], [1.55, 0.0], [-0.95, 1.55], [0.9, 1.6]]) {
    cyl(g, 0.16, 0.2, 0.06, '#4a5560', x, 0.05, z);
    cyl(g, 0.04, 0.04, 0.75, '#6a7a88', x, 0.45, z);
    cyl(g, 0.24, 0.24, 0.07, '#8aa0b0', x, 0.9, z, Math.PI / 2);
    box(g, 0.05, 0.3, 0.04, '#3a4850', x, 0.9, z + 0.05);
  }
  // storage crates / gadgets on floor near character path
  for (let i = 0; i < 5; i++) {
    box(g, 0.35, 0.28, 0.3, ['#8a6a40', '#4a8a98', '#c45848', '#6b8f6a', '#c4a35a'][i],
      -1.6 + i * 0.75, 0.16, 1.85, 0, 0.08, 0, { round: 0.02 });
  }
  // side console tables with remotes / books
  box(g, 0.7, 0.55, 0.4, '#5a4030', -1.7, 0.3, -1.5);
  box(g, 0.7, 0.55, 0.4, '#5a4030', 1.7, 0.3, -1.5);
  for (let i = 0; i < 3; i++) {
    box(g, 0.12, 0.22, 0.1, ['#4a8a98', '#c45848', '#c4a35a'][i], -1.9 + i * 0.2, 0.7, -1.45);
    box(g, 0.12, 0.22, 0.1, ['#6b8f6a', '#a87890', '#3a4858'][i], 1.5 + i * 0.2, 0.7, -1.45);
  }
  // standing AC / cooler boxes (kept inside frustum)
  box(g, 0.5, 1.15, 0.4, '#d0d8e0', -1.85, 0.6, -1.3, 0, 0, 0, { round: 0.03 });
  box(g, 0.35, 0.18, 0.08, '#4a8a98', -1.85, 0.95, -1.08);
  box(g, 0.5, 1.0, 0.4, '#c8d0d8', 1.85, 0.55, -1.3, 0, 0, 0, { round: 0.03 });
  // shelves + gadgets
  addShelf(g, -3.25, 0, 1.4);
  addWallShelf(g, -2.0, 2.55, -3.1, 1.6);
  addWallShelf(g, 2.0, 2.55, -3.1, 1.6);
  for (let i = 0; i < 6; i++) {
    box(g, 0.14, 0.22, 0.12, ['#4a8a98', '#c45848', '#6b8f6a', '#c4a35a'][i % 4],
      -2.5 + i * 0.28, 2.72, -3.0, 0, 0.1, 0, { round: 0.01 });
  }
  // cable clutter + wall clutter
  for (let i = 0; i < 8; i++) {
    cyl(g, 0.015, 0.015, 0.7 + (i % 3) * 0.15, '#2a3038',
      -1.8 + i * 0.45, 0.08, 0.3 + (i % 2) * 0.4, 0, 0, Math.PI / 2 + i * 0.1);
  }
  // side posters inset so they don't crop at portrait edges
  const p1 = makePosterArt(2, 0.55, 0.8);
  p1.position.set(-2.2, 2.15, -3.05);
  g.add(p1);
  const p2 = makePosterArt(3, 0.55, 0.8);
  p2.position.set(2.2, 2.15, -3.05);
  g.add(p2);
  addPlant(g, -3.0, 0, -2.0);
  addPlant(g, 3.0, 0, -2.0);
  addPlant(g, -2.5, 0, 2.0);
  addPlant(g, 2.5, 0, 2.0);
  addPlant(g, -1.2, 0, -2.4);
  addPlant(g, 1.2, 0, -2.4);
  cyl(g, 0.04, 0.04, 2.2, '#c4a35a', 2.2, 1.1, -1.2);
  cyl(g, 0.95, 0.05, 0.08, '#c45848', 2.2, 2.2, -1.2);
  // STILL HOT fully inside frame — centered under left shelf, clear of both edges
  const hot = makeSign('STILL HOT', 0.85, 0.24, '#3a2020', '#e08040', '#c45848');
  hot.position.set(-0.55, 2.3, -2.95);
  g.add(hot);
  // mid-wall clutter: vents + cables kept inside ±1.2
  box(g, 0.65, 0.4, 0.1, '#9aa8b0', -1.2, 1.8, -3.05);
  for (let i = 0; i < 3; i++) box(g, 0.5, 0.04, 0.05, '#6a7a88', -1.2, 1.65 + i * 0.1, -2.98);
  box(g, 0.65, 0.4, 0.1, '#9aa8b0', 1.2, 1.8, -3.05);
  for (let i = 0; i < 3; i++) box(g, 0.5, 0.04, 0.05, '#6a7a88', 1.2, 1.65 + i * 0.1, -2.98);
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.012, 0.012, 0.9, '#2a3038', -1.0 + i * 0.4, 1.2, -2.95, 0.4, 0, 0);
  }
  // rug + more plants in frustum
  addRug(g, 0, 0, 0.7, 2.6, 1.8);
  addPlant(g, -1.35, 0, -0.9);
  addPlant(g, 1.35, 0, -0.9);
  box(g, 0.7, 0.08, 0.7, '#8a6a40', -2.4, 0.45, -0.5);
  cyl(g, 0.08, 0.06, 0.2, '#ebe4dc', -2.4, 0.6, -0.5);
  box(g, 0.7, 0.08, 0.7, '#8a6a40', 2.4, 0.45, -0.5);
  addLamp(g, -3.0, 0, 0.3);
  addLamp(g, 3.0, 0, 0.8);
  addWallShelf(g, 0, 3.55, -3.1, 5.2);
  addCeilingBeam(g, 0, 3.95, -1, 7);
  addCeilingBeam(g, 0, 3.95, 0.8, 7);
  addUpperWallDressing(g, -3.1, -3.4, 3.4, 3.05);
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
  const fanSign = makeSign('ADD A FAN?', 1.05, 0.28, '#2a3228', '#e0c070', '#c4a35a');
  fanSign.position.set(-0.95, 2.5, -3.05);
  g.add(fanSign);
  const holes = makeSign('AIR HOLES', 1.0, 0.26, '#3a2020', '#f0e6d0', '#c45848');
  holes.position.set(0.95, 2.5, -3.05);
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
  // factory floor tiles + stripes
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 2; j++) {
      box(g, 0.95, 0.03, 0.95, (i + j) % 2 ? '#555860' : '#4a4e58', i * 1.0, 0.03, j * 1.0);
    }
  }
  box(g, 7.5, 0.05, 0.4, '#c4a35a', 0, 0.06, 0);
  box(g, 7.5, 0.05, 0.4, '#c4a35a', 0, 0.06, 1.5);
  // sealing press
  box(g, 1.6, 1.8, 1.0, '#4a5058', 0, 0.9, -1.8, 0, 0, 0, { round: 0.04 });
  box(g, 1.2, 0.3, 0.8, '#3a4048', 0, 1.8, -1.8);
  box(g, 0.9, 0.15, 0.6, '#c45848', 0, 1.4, -1.5, 0, 0, 0, {
    mat: { emissive: '#c45848', emissiveIntensity: 0.25 },
  });
  addPhoneProp(g, screens.circuit, 0, 1.15, -1.3, 1.0, true);
  const gasket = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.08, 12, 32),
    mat('#4a8a98', { metalness: 0.3, roughness: 0.4 }),
  );
  gasket.position.set(0, 1.2, -1.0);
  gasket.rotation.x = Math.PI / 2;
  g.add(gasket);
  const wp = makeSign('WATERPROOF', 1.25, 0.3, '#1a3040', '#8ab0c8', '#4a8a98');
  wp.position.set(0, 2.5, -3.0);
  g.add(wp);
  // work benches flanking press (inside portrait frustum)
  addDesk(g, -1.7, 0, -1.55, 1.5);
  addDesk(g, 1.7, 0, -1.55, 1.5);
  addMonitor(g, screens.blueprint, -1.7, 0.72, -1.6);
  addMonitor(g, screens.temp, 1.7, 0.72, -1.6, -0.1);
  // tool clutter on benches
  for (let i = 0; i < 4; i++) {
    box(g, 0.08, 0.28, 0.08, '#3a4048', -2.1 + i * 0.22, 0.9, -1.4);
    box(g, 0.08, 0.28, 0.08, '#c45848', 1.3 + i * 0.22, 0.9, -1.4);
  }
  // water-test tanks — midground, camera-visible
  for (const x of [-1.15, 1.15]) {
    box(g, 0.85, 0.65, 0.65, '#3a5058', x, 0.38, 1.35, 0, 0, 0, { round: 0.03 });
    box(g, 0.7, 0.42, 0.5, '#4a8a98', x, 0.52, 1.35, 0, 0, 0, {
      mat: { transparent: true, opacity: 0.55, emissive: '#4a8a98', emissiveIntensity: 0.2 },
    });
    box(g, 0.22, 0.35, 0.06, '#2a3038', x, 0.8, 1.35, 0, 0, 0, { round: 0.02 });
  }
  // parts bins stacked near tanks
  for (let i = 0; i < 8; i++) {
    box(g, 0.32, 0.26, 0.3, ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a', '#a87890', '#3a4858', '#8a6a40', '#ebe4dc'][i],
      -1.7 + (i % 4) * 0.38, 0.16 + Math.floor(i / 4) * 0.3, 1.85, 0, 0.05, 0, { round: 0.02 });
  }
  // pipe / hose runs on back wall
  for (let i = 0; i < 5; i++) {
    cyl(g, 0.05, 0.05, 1.4, '#6a7a88', -1.6 + i * 0.8, 3.1, -3.0, 0, 0, Math.PI / 2);
  }
  // instrument carts midground
  box(g, 0.7, 0.95, 0.5, '#5a6068', -1.9, 0.5, 0.2, 0, 0, 0, { round: 0.03 });
  box(g, 0.7, 0.95, 0.5, '#5a6068', 1.9, 0.5, 0.2, 0, 0, 0, { round: 0.03 });
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.06, 0.06, 0.08, i % 2 ? '#6b8f6a' : '#c45848', -1.9, 1.1 + i * 0.12, 0.4);
    cyl(g, 0.06, 0.06, 0.08, i % 2 ? '#4a8a98' : '#c4a35a', 1.9, 1.1 + i * 0.12, 0.4);
  }
  addPegboard(g, -2.2, 2.5, -3.1, 1.8, 1.2);
  addPegboard(g, 2.2, 2.5, -3.1, 1.8, 1.2);
  // conveyor of sealed phones
  for (let i = 0; i < 5; i++) {
    box(g, 0.35, 0.55, 0.08, '#2a3038', -2.5 + i * 0.7, 0.7, 0.85, 0, 0.1, 0, { round: 0.02 });
  }
  box(g, 4.0, 0.12, 0.6, '#3a3a40', -0.5, 0.4, 0.85);
  addShelf(g, -3.3, 0, -2.0);
  addShelf(g, 3.3, 0, -2.0);
  box(g, 0.9, 1.1, 0.55, '#5a6068', -2.8, 0.55, -0.5, 0, 0, 0, { round: 0.03 });
  box(g, 0.9, 1.1, 0.55, '#5a6068', 2.8, 0.55, -0.5, 0, 0, 0, { round: 0.03 });
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.07, 0.07, 0.22, '#c4a35a', -2.9 + (i % 2) * 0.2, 1.2 + Math.floor(i / 2) * 0.18, -0.35);
    cyl(g, 0.07, 0.07, 0.22, '#4a8a98', 2.7 + (i % 2) * 0.2, 1.2 + Math.floor(i / 2) * 0.18, -0.35);
  }
  for (const x of [-2.2, 2.2, -1.0, 1.0]) {
    cyl(g, 0.02, 0.18, 0.45, '#c47838', x, 0.25, 2.1);
  }
  const sealed = makeSign('SEALED SHUT', 0.9, 0.22, '#2a3228', '#f0e6d0', '#c4a35a');
  sealed.position.set(-1.05, 2.35, -2.95);
  g.add(sealed);
  // wall posters / gauges inside frustum
  for (let i = 0; i < 4; i++) {
    const poster = makePosterArt(i, 0.5, 0.7);
    poster.position.set(-1.6 + i * 1.05, 1.55, -3.08);
    g.add(poster);
  }
  // hanging tool rail + clamps across mid wall (below top crop)
  box(g, 3.2, 0.08, 0.08, '#3a4048', 0, 2.85, -3.0);
  for (let i = 0; i < 8; i++) {
    box(g, 0.06, 0.3, 0.06, ['#c45848', '#4a8a98', '#c4a35a', '#6b8f6a'][i % 4], -1.4 + i * 0.4, 2.65, -2.95);
  }
  box(g, 0.7, 0.7, 0.04, '#2a3038', 1.5, 3.15, -3.08);
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.06, 0.06, 0.02, i % 2 ? '#6b8f6a' : '#c45848',
      1.3 + (i % 2) * 0.35, 3.0 + Math.floor(i / 2) * 0.3, -3.04);
  }
  addChair(g, -2.2, 0, -0.7);
  addChair(g, 2.2, 0, -0.7);
  addLamp(g, -3.2, 0, 1.2);
  addLamp(g, 3.2, 0, 1.2);
  addPlant(g, -3.3, 0, 2.2);
  addPlant(g, 3.3, 0, 2.2);
  addWallShelf(g, 0, 3.55, -3.1, 5.5);
  addCeilingBeam(g, 0, 3.95, -1, 7.5);
  addCeilingBeam(g, 0, 3.95, 1, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 3.0);
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
  // ceiling slab + upper dress so crane / drop moves never show void
  box(g, 8, 0.15, 7, '#3a4a42', 0, 4.15, 0, 0, 0, 0, {
    mat: { emissive: '#4a5a48', emissiveIntensity: 0.45 },
  });
  addWallShelf(g, 0, 3.55, -3.1, 5.5);
  addUpperWallDressing(g, -3.1, -3.4, 3.4, 3.0);
  addStringLights(g, 3.45, -2.95, -3.0, 3.0, 12);
  for (let i = 0; i < 8; i++) {
    box(g, 0.35, 0.2, 0.25, '#2a5840', -2.8 + i * 0.8, 3.85, -2.85, 0, 0, 0, { round: 0.01 });
  }
  addCeilingBeam(g, 0, 3.95, -1, 7);
  addCeilingBeam(g, 0, 3.95, 1, 7);
  addChipCeilingDress(g, true);
  return g;
}

function buildRacetrack(screens) {
  const g = new THREE.Group();
  box(g, 8, 0.08, 7, '#0e1814', 0, 0, 0);
  box(g, 8, 4.2, 0.15, '#1a2820', 0, 2.1, -3.2);
  box(g, 0.15, 4.2, 7, '#1a2820', -4, 2.1, 0);
  box(g, 0.15, 4.2, 7, '#1a2820', 4, 2.1, 0);
  box(g, 8, 0.15, 7, '#3a4a42', 0, 4.15, 0, 0, 0, 0, {
    mat: { emissive: '#4a5a48', emissiveIntensity: 0.45 },
  });
  // PCB trace grid (circuit-trace roads under/around track)
  for (let i = -3; i <= 3; i++) {
    box(g, 0.14, 0.05, 6.5, '#2a5840', i * 1.05, 0.05, 0);
    box(g, 6.5, 0.05, 0.14, '#2a5840', 0, 0.05, i * 0.85);
  }
  // oval track — kept behind character (char z≈2.45); near rim stays < 2.1
  const track = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.32, 12, 48),
    mat('#2a5840'),
  );
  track.rotation.x = Math.PI / 2;
  track.position.set(0, 0.1, -0.35);
  track.receiveShadow = true;
  g.add(track);
  const lane = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.04, 8, 48),
    mat('#e0c070'),
  );
  lane.rotation.x = Math.PI / 2;
  lane.position.set(0, 0.15, -0.35);
  g.add(lane);
  // capacitor / chip towers — short in the center so SAFE MODE / THERMAL THROTTLING stay fully readable
  for (let i = 0; i < 24; i++) {
    const x = -2.4 + (i % 8) * 0.7;
    const z = -2.5 + Math.floor(i / 8) * 0.85;
    if (Math.abs(x) < 1.35 && z < -0.8) continue; // open aisle to the sign billboard
    let h = 0.55 + (i % 4) * 0.22;
    if (Math.abs(x) < 1.8) h = Math.min(h, 1.15); // never reach sign bottoms during orbit
    box(g, 0.45, h, 0.4, '#3a4850', x, h / 2, z, 0, 0, 0, { round: 0.02 });
    for (let p = 0; p < 3; p++) {
      cyl(g, 0.05, 0.05, 0.18 + (p % 2) * 0.1, '#c4a35a', x - 0.12 + p * 0.12, h + 0.12, z + 0.08);
    }
  }
  // mid towers flanking the track — outboard + short so orbit never covers the signs
  for (let i = 0; i < 10; i++) {
    const side = i < 5 ? -1 : 1;
    const idx = i % 5;
    const h = Math.min(0.95, 0.55 + idx * 0.15);
    box(g, 0.48, h, 0.42, '#455560', side * (1.95 + idx * 0.12), h / 2, -0.85 + idx * 0.28, 0, 0, 0, { round: 0.02 });
    cyl(g, 0.07, 0.07, 0.22, '#e0c070', side * (1.95 + idx * 0.12), h + 0.14, -0.85 + idx * 0.28);
  }
  // low chip blocks flanking (not in front of character torso)
  for (let i = 0; i < 4; i++) {
    box(g, 0.35, 0.22 + (i % 2) * 0.1, 0.28, '#3a4850', -2.0 + i * 0.35, 0.18, 1.5, 0, 0, 0, { round: 0.02 });
    box(g, 0.35, 0.22 + (i % 2) * 0.1, 0.28, '#3a4850', 0.95 + i * 0.35, 0.18, 1.5, 0, 0, 0, { round: 0.02 });
  }
  // grandstands closer in (portrait-visible)
  for (let side of [-1, 1]) {
    for (let row = 0; row < 5; row++) {
      box(g, 1.1, 0.18, 0.4, '#4a5860', side * 2.15, 0.25 + row * 0.28, -0.5 + row * 0.12, 0, 0, 0, { round: 0.01 });
      for (let s = 0; s < 3; s++) {
        box(g, 0.16, 0.2, 0.1, ['#c45848', '#4a8a98', '#c4a35a'][s],
          side * 2.15 - 0.3 + s * 0.28, 0.4 + row * 0.28, -0.4 + row * 0.12);
      }
    }
    cyl(g, 0.05, 0.05, 2.4, '#ebe4dc', side * 2.35, 1.3, 1.15);
    box(g, 0.5, 0.12, 0.22, '#f5e6c8', side * 2.35, 2.55, 1.15, 0, 0, 0, {
      mat: { emissive: '#f5e6c8', emissiveIntensity: 0.7 },
    });
  }
  // billboard towers / LED walls — kept off-center so portrait signs stay fully readable
  for (const x of [-2.15, 2.15]) {
    box(g, 0.75, 1.4, 0.12, '#2a3038', x, 2.0, -2.85);
    for (let r = 0; r < 5; r++) {
      box(g, 0.55, 0.12, 0.04, r % 2 ? '#c45848' : '#4a8a98', x, 1.5 + r * 0.22, -2.78, 0, 0, 0, {
        mat: { emissive: r % 2 ? '#c45848' : '#4a8a98', emissiveIntensity: 0.45 },
      });
    }
  }
  // SAFE MODE + THERMAL THROTTLING — above character head + tower tops for the whole camera move
  box(g, 0.12, 3.0, 0.12, '#3a4048', -0.95, 1.55, -1.55);
  box(g, 0.12, 3.0, 0.12, '#3a4048', 0.95, 1.55, -1.55);
  box(g, 2.1, 0.1, 0.12, '#3a4048', 0, 3.1, -1.55);
  box(g, 2.1, 0.08, 0.1, '#3a4048', 0, 2.45, -1.55);
  const safe = makeSign('SAFE MODE', 1.2, 0.36, '#c45848', '#f0e6d0', '#e0c070');
  safe.position.set(0, 2.7, -1.48);
  g.add(safe);
  const thr = makeSign('THERMAL THROTTLING', 1.4, 0.32, '#2a3228', '#e0c070', '#c4a35a');
  thr.position.set(0, 3.25, -1.48);
  g.add(thr);
  addTv(g, screens.racetrack, 0, 3.7, -3.0, 0.45);
  // wall signage + lights
  for (let i = 0; i < 6; i++) {
    box(g, 0.55, 0.22, 0.04, i % 2 ? '#c45848' : '#4a8a98', -2.8 + i * 1.1, 3.35, -3.08);
  }
  addWallShelf(g, 0, 3.65, -3.1, 5.8);
  for (let i = 0; i < 10; i++) {
    box(g, 0.3, 0.18, 0.22, '#3a4850', -3.4 + i * 0.75, 3.85, -2.9, 0, 0, 0, { round: 0.01 });
  }
  addStringLights(g, 3.5, -2.9, -3.2, 3.2, 14);
  addUpperWallDressing(g, -3.1, -3.4, 3.4, 3.05);
  addChipCeilingDress(g, true);
  // denser midground towers — low only, never into the sign band
  for (let i = 0; i < 12; i++) {
    const x = -2.2 + (i % 6) * 0.85;
    const z = 0.35 + Math.floor(i / 6) * 0.55;
    if (Math.abs(x) < 0.7) continue;
    const h = 0.35 + (i % 3) * 0.12;
    box(g, 0.38, h, 0.32, '#3a4850', x, h / 2, z, 0, 0, 0, { round: 0.02 });
  }
  // finish flags — behind character plane
  // Finish flags kept low/side so they never paint across the depth-test-off character billboard
  box(g, 0.08, 0.55, 0.08, '#ebe4dc', -1.7, 0.3, 0.2);
  box(g, 0.08, 0.55, 0.08, '#ebe4dc', 1.7, 0.3, 0.2);
  box(g, 1.1, 0.14, 0.05, '#2a3038', -1.7, 0.6, 0.2);
  box(g, 1.1, 0.14, 0.05, '#2a3038', 1.7, 0.6, 0.2);
  for (let i = 0; i < 4; i++) {
    box(g, 0.22, 0.12, 0.04, i % 2 ? '#f0e6d0' : '#1a1a1a', -2.1 + i * 0.25, 0.6, 0.22);
    box(g, 0.22, 0.12, 0.04, i % 2 ? '#1a1a1a' : '#f0e6d0', 1.3 + i * 0.25, 0.6, 0.22);
  }
  // side banners
  const banL = makeSign('LAP 1', 0.7, 0.22, '#1a3040', '#8ab0c8', '#4a8a98');
  banL.position.set(-2.4, 1.6, -1.8);
  g.add(banL);
  const banR = makeSign('SLOW', 0.7, 0.22, '#3a2020', '#e08040', '#c45848');
  banR.position.set(2.4, 1.6, -1.8);
  g.add(banR);
  const glow = new THREE.PointLight('#6b8f6a', 1.0, 11, 2);
  glow.position.set(0, 2.4, 0.2);
  g.add(glow);
  const rim = new THREE.PointLight('#e0c070', 0.55, 8, 2);
  rim.position.set(0, 2.0, 2.0);
  g.add(rim);
  addCeilingBeam(g, 0, 3.95, -1.2, 7);
  addCeilingBeam(g, 0, 3.95, 0.8, 7);
  return g;
}

function buildStudio(screens) {
  const g = boothShell('#5a5048', '#c0b0a0');
  // floor rug + cable trays
  addRug(g, 0, 0, 0.4, 3.4, 2.4);
  for (let i = 0; i < 6; i++) {
    box(g, 0.55, 0.04, 0.18, '#3a3a40', -2.5 + i * 0.9, 0.04, 1.6);
  }
  // main dual-monitor desk
  addDesk(g, 0, 0, -1.55, 2.5);
  addMonitor(g, screens.sliders, -0.55, 0.72, -1.6);
  addMonitor(g, screens.worse, 0.65, 0.72, -1.6, -0.15);
  addPhoneProp(g, screens.worse, 1.35, 1.1, -1.25, 0.85, true);
  addChair(g, 0.05, 0, -0.65);
  // side desks + chairs (inside portrait frustum)
  addDesk(g, -1.7, 0, -0.35, 1.35);
  addMonitor(g, screens.smooth, -1.7, 0.72, -0.4);
  addChair(g, -1.7, 0, 0.45);
  addDesk(g, 1.7, 0, -0.35, 1.35);
  addMonitor(g, screens.temp, 1.7, 0.72, -0.4);
  addChair(g, 1.7, 0, 0.45);
  // back-row desks under whiteboard
  addDesk(g, -1.55, 0, -2.35, 1.2);
  addMonitor(g, screens.blueprint, -1.55, 0.72, -2.4);
  addChair(g, -1.55, 0, -1.65);
  addDesk(g, 1.55, 0, -2.35, 1.2);
  addMonitor(g, screens.circuit, 1.55, 0.72, -2.4);
  addChair(g, 1.55, 0, -1.65);
  // server racks flanking whiteboard (inside ±2 frustum at back wall)
  for (const x of [-1.85, 1.85]) {
    box(g, 0.55, 1.9, 0.45, '#2a3038', x, 0.95, -2.7, 0, 0, 0, { round: 0.02 });
    for (let r = 0; r < 7; r++) {
      box(g, 0.42, 0.11, 0.07, r % 2 ? '#4a8a98' : '#c45848', x, 0.35 + r * 0.24, -2.45, 0, 0, 0, {
        mat: { emissive: r % 2 ? '#4a8a98' : '#c45848', emissiveIntensity: 0.35 },
      });
    }
  }
  // floor clutter flanking (not in character silhouette)
  for (let i = 0; i < 3; i++) {
    box(g, 0.32, 0.22 + (i % 2) * 0.08, 0.28, ['#8a6a40', '#4a6a78', '#c45848'][i],
      -1.7 + i * 0.35, 0.14, 1.45, 0, 0.1, 0, { round: 0.02 });
    box(g, 0.32, 0.22 + (i % 2) * 0.08, 0.28, ['#6b8f6a', '#5a4030', '#3a4858'][i],
      1.05 + i * 0.35, 0.14, 1.45, 0, -0.1, 0, { round: 0.02 });
  }
  addPlant(g, -1.25, 0, 0.85);
  addPlant(g, 1.25, 0, 0.85);
  // whiteboard
  box(g, 2.2, 1.3, 0.06, '#ebe4dc', 0, 2.35, -3.08);
  box(g, 2.25, 1.35, 0.04, '#5a4030', 0, 2.35, -3.1);
  for (let i = 0; i < 4; i++) {
    box(g, 0.35 + i * 0.1, 0.03, 0.02, '#3a4858', -0.7 + i * 0.4, 2.55 - i * 0.15, -3.04);
  }
  // sticky notes — kept inside ~±2 portrait band at the back wall
  const cols = ['#e0c070', '#c45848', '#6b8f6a', '#4a8a98', '#a87890', '#ebe4dc'];
  for (let i = 0; i < 24; i++) {
    box(g, 0.18, 0.18, 0.02, cols[i % cols.length],
      -1.7 + (i % 6) * 0.28, 1.55 + Math.floor(i / 6) * 0.26, -3.08);
  }
  const cut = makeSign('CUT GRAPHICS', 1.0, 0.24, '#3a2020', '#f0e6d0', '#c45848');
  cut.position.set(1.0, 3.2, -3.0);
  g.add(cut);
  const fps = makeSign('LOWER FPS', 0.95, 0.24, '#2a3228', '#e0c070', '#c4a35a');
  fps.position.set(-1.0, 3.2, -3.0);
  g.add(fps);
  addShelf(g, -3.3, 0, 0.6);
  addShelf(g, 3.3, 0, 0.6);
  addPlant(g, 3.2, 0, 1.9);
  addPlant(g, -3.2, 0, 1.9);
  addPlant(g, 1.8, 0, 1.8);
  addPlant(g, -1.8, 0, 1.8);
  addLamp(g, 3.0, 0, -1.4);
  addLamp(g, -3.0, 0, 1.1);
  addLamp(g, 0, 0, 1.9);
  // floor props: pizza, cans, bags, crates
  box(g, 0.5, 0.05, 0.5, '#ebe4dc', 1.0, 0.78, -1.35);
  cyl(g, 0.05, 0.05, 0.18, '#4a8a98', -1.0, 0.85, -1.3);
  cyl(g, 0.05, 0.05, 0.18, '#c45848', -0.85, 0.85, -1.4);
  box(g, 0.45, 0.35, 0.35, '#8a6a40', -1.5, 0.2, 1.5, 0, 0.2, 0, { round: 0.02 });
  box(g, 0.4, 0.3, 0.3, '#6a5848', 1.6, 0.18, 1.55, 0, -0.15, 0, { round: 0.02 });
  box(g, 0.55, 0.12, 0.4, '#3a4858', 0.2, 0.08, 1.7, 0, 0.3, 0, { round: 0.02 });
  // side wall posters
  const sp1 = makePosterArt(0, 0.65, 0.9);
  sp1.position.set(-3.85, 2.5, -0.5);
  sp1.rotation.y = Math.PI / 2;
  g.add(sp1);
  const sp2 = makePosterArt(1, 0.65, 0.9);
  sp2.position.set(3.85, 2.5, -0.5);
  sp2.rotation.y = -Math.PI / 2;
  g.add(sp2);
  addWallShelf(g, 0, 3.55, -3.1, 5.5);
  addCeilingBeam(g, 0, 3.95, -1.2, 7.5);
  addCeilingBeam(g, 0, 3.95, 0.6, 7.5);
  addUpperWallDressing(g, -3.1, -3.5, 3.5, 2.95);
  const fl = new THREE.PointLight('#f0e8d8', 0.85, 10, 2);
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
