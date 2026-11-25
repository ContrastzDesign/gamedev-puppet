// Detailed cyber-cafe / web-street set for the gamer-sites Short (V1).
// Warm wood + brick + soft lamps. Generic plain-lettering signs only — no real logos.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const rnd = (a, b) => a + Math.random() * (b - a);

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
  parent.add(m);
  return m;
}

function cyl(parent, rTop, rBot, h, color, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 16), mat(color));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function makeSign(text, w = 1.6, h = 0.45) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a3228';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#c4a35a';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = '#f0e6d0';
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  return mesh;
}

function makeScreen(tex) {
  const geo = new THREE.PlaneGeometry(1.35, 0.85);
  const matB = new THREE.MeshBasicMaterial({ map: tex });
  const screen = new THREE.Mesh(geo, matB);
  const bezel = box(new THREE.Group(), 1.5, 1.0, 0.08, '#1c1c20', 0, 0, -0.05);
  const g = new THREE.Group();
  g.add(bezel);
  screen.position.z = 0.01;
  g.add(screen);
  return g;
}

export function buildRoom(textures) {
  const root = new THREE.Group();

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 18),
    mat('#6b5340', { roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  // floorboards
  for (let i = -14; i < 14; i++) {
    box(root, 0.04, 0.02, 18, '#5a4535', i * 0.95, 0.01, 0);
  }

  // Back + side walls
  box(root, 28, 6.5, 0.35, '#8a6f5a', 0, 3.25, -7.2); // back brick tone
  box(root, 0.35, 6.5, 18, '#7d6552', -13.5, 3.25, 0);
  box(root, 0.35, 6.5, 18, '#7d6552', 13.5, 3.25, 0);
  // brick rows
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 22; col++) {
      const ox = (row % 2) * 0.3;
      box(root, 1.1, 0.38, 0.12, row % 2 ? '#9a7a62' : '#8a6a52',
        -12 + col * 1.15 + ox, 0.6 + row * 0.55, -7.0);
    }
  }

  // Ceiling beams + warm lamps
  box(root, 28, 0.25, 18, '#4a3a2e', 0, 6.4, 0);
  for (let i = -3; i <= 3; i++) {
    box(root, 0.25, 0.35, 16, '#3a2e24', i * 3.5, 6.15, 0);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#f0d8a0', emissive: '#e8c878', emissiveIntensity: 1.2, roughness: 0.4 }),
    );
    lamp.position.set(i * 3.5, 5.6, -2);
    root.add(lamp);
    const light = new THREE.PointLight('#ffd9a0', 1.6, 14, 2);
    light.position.copy(lamp.position);
    light.castShadow = false;
    root.add(light);
  }

  // Booth positions along the back wall
  const booths = {
    map:     { x: -8.5, z: -5.2, label: 'WEB MAP',       screen: textures.map },
    library: { x: -4.2, z: -5.2, label: 'PC LIBRARY',    screen: textures.library },
    arcade:  { x: 0.2,  z: -5.2, label: 'BROWSER PLAY',  screen: textures.arcade },
    blocks:  { x: 4.6,  z: -5.2, label: 'BLOCK WORLD',   screen: textures.blocks },
    live:    { x: 9.0,  z: -5.2, label: 'LIVE WATCH',    screen: textures.live },
  };

  const boothGroups = {};
  for (const [id, b] of Object.entries(booths)) {
    const g = new THREE.Group();
    g.position.set(b.x, 0, b.z);
    // desk
    box(g, 2.6, 0.12, 1.2, '#5c4332', 0, 0.95, 0.2, 0, 0, 0, { round: 0.04 });
    box(g, 0.12, 0.95, 1.1, '#4a3628', -1.15, 0.47, 0.2);
    box(g, 0.12, 0.95, 1.1, '#4a3628', 1.15, 0.47, 0.2);
    // monitor stand + screen
    box(g, 0.25, 0.08, 0.35, '#2a2a2e', 0, 1.02, -0.15);
    cyl(g, 0.05, 0.05, 0.35, '#2a2a2e', 0, 1.22, -0.15);
    const scr = makeScreen(b.screen);
    scr.position.set(0, 1.85, -0.2);
    g.add(scr);
    // keyboard + mouse
    box(g, 0.7, 0.04, 0.28, '#2e3440', -0.25, 1.03, 0.35, 0, 0, 0, { round: 0.02 });
    box(g, 0.14, 0.05, 0.2, '#3a4050', 0.45, 1.04, 0.4, 0, 0.2, 0, { round: 0.02 });
    // chair
    box(g, 0.7, 0.08, 0.7, '#3d4654', 0, 0.55, 1.15, 0, 0, 0, { round: 0.05 });
    cyl(g, 0.08, 0.1, 0.55, '#2a3038', 0, 0.27, 1.15);
    box(g, 0.65, 0.7, 0.08, '#3d4654', 0, 1.0, 1.45, 0, 0, 0, { round: 0.04 });
    // sign
    const sign = makeSign(b.label);
    sign.position.set(0, 2.55, -0.35);
    g.add(sign);
    // side panels / booth frame
    box(g, 0.1, 2.4, 1.6, '#6a5545', -1.4, 1.2, 0.1);
    box(g, 0.1, 2.4, 1.6, '#6a5545', 1.4, 1.2, 0.1);
    // plant
    cyl(g, 0.12, 0.16, 0.2, '#6a4a38', 1.05, 1.1, 0.55);
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      mat('#3d6b4f'),
    );
    leaf.position.set(1.05, 1.4, 0.55);
    g.add(leaf);
    // mug / soda
    cyl(g, 0.07, 0.06, 0.16, '#c4785a', -0.9, 1.1, 0.45);

    root.add(g);
    boothGroups[id] = g;
  }

  // Center rug
  box(root, 6, 0.02, 4, '#8a5a4a', 0, 0.02, 1.5);

  // Lounge sofa + coffee table (foreground depth)
  box(root, 3.2, 0.45, 1.1, '#6a5548', -1.5, 0.35, 4.8, 0, 0.15, 0, { round: 0.08 });
  box(root, 3.2, 0.55, 0.2, '#5a4538', -1.5, 0.85, 5.25, 0, 0.15, 0, { round: 0.05 });
  box(root, 1.4, 0.08, 0.8, '#4a3628', 1.8, 0.45, 4.5, 0, -0.2, 0, { round: 0.04 });
  cyl(root, 0.06, 0.06, 0.4, '#3a2e24', 1.4, 0.2, 4.3);
  cyl(root, 0.06, 0.06, 0.4, '#3a2e24', 2.2, 0.2, 4.7);

  // Standing lamp
  cyl(root, 0.05, 0.08, 2.2, '#3a3a40', 11.2, 1.1, 5.2);
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.4, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: '#e8d2a8', emissive: '#d4b878', emissiveIntensity: 0.6, side: THREE.DoubleSide }),
  );
  lampShade.position.set(11.2, 2.35, 5.2);
  root.add(lampShade);

  // Shelves with game-case-like boxes (generic colours, no logos)
  for (let i = 0; i < 12; i++) {
    const x = -11.5;
    const y = 1.2 + (i % 4) * 0.55;
    const z = -4 + Math.floor(i / 4) * 1.2;
    box(root, 0.35, 0.5, 0.08, ['#6a8fbf', '#c4a35a', '#7a6a84', '#6b7c5c'][i % 4], x, y, z);
  }
  // Cable tray / power strip under desks
  for (const x of [-8.5, -4.2, 0.2, 4.6, 9.0]) {
    box(root, 1.8, 0.06, 0.12, '#2a2a2e', x, 0.55, -4.6);
  }

  // Soft ambient props: trash can, cables (as thin boxes), poster boards
  cyl(root, 0.28, 0.32, 0.7, '#3a3a40', 11.5, 0.35, 3);
  const poster = makeSign('TODAY\'S PICKS', 1.2, 1.6);
  poster.position.set(-12.9, 2.8, 2);
  poster.rotation.y = Math.PI / 2;
  root.add(poster);
  const poster2 = makeSign('QUEUE HERE', 1.2, 0.9);
  poster2.position.set(12.9, 2.5, -1);
  poster2.rotation.y = -Math.PI / 2;
  root.add(poster2);

  // Window glow on side
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 2.2),
    new THREE.MeshBasicMaterial({ color: '#cfe4d8' }),
  );
  win.position.set(-13.3, 3.2, 4);
  win.rotation.y = Math.PI / 2;
  root.add(win);

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
