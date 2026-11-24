// room.js: the workshop desk room around the diorama.
//   buildRoom(scene, { screenTexture }) -> { bulbMat, screenCenter, monitorGroup, room }
//
// Units: the coffee-mug character is 1.0 tall. Desk top surface y = 0 (x -7..7, z -4.6..4.1),
// floor y = -7.5, wall plane z = -4.6. Cutting mat 8.0 x 6.9 centred (0, 0.45), top y = 0.02.
// Everything is built from primitives plus canvas textures, in core.js's toon + ink look.
// Build-time randomness comes only from mulberry32(SEED).
//
// Z-fighting discipline:
//  - props stand a little proud of what they rest on (LIFT on the desk, ON_MAT on the mat, GAP off
//    the floor/wall) so their base ink line shows and no two faces touch;
//  - parts of one prop sink >= 0.005 into each other;
//  - textures live on the solids' own faces (boxUV) instead of stacked decals, so nothing out-offsets
//    the hatched shadow catchers. The monitor screen is the only decal().
// Shadow catchers: desk top y 0.024, floor y -7.496, wall z -4.596, pegboard front z -4.455,
// baseboard front, shelf top. The mat, wall and floor never cast.
import { THREE, RoundedBoxGeometry, COL, toon, mesh, decal, catcher, mulberry32, canvasTex, hex, hash1 } from './core.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const SEED = 0x7ab1e5;
const FLOOR_Y = -7.5, WALL_Z = -4.6;
const MAT = { x: 0, z: 0.45, w: 8.0, d: 6.9, top: 0.02 };
const LIFT = 0.01;           // desk props: base this far above the desk top (also clears the mat's underside)
const ON_MAT = MAT.top + 0.005; // props standing on the mat
const GAP = 0.006;           // floor- and wall-mounted parts: this far off the floor / wall
const TAU = Math.PI * 2;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V3(0, 1, 0);

export const ROOM = { floorY: FLOOR_Y, wallZ: WALL_Z, desk: { x0: -7, x1: 7, z0: -4.6, z1: 4.1, top: 0 }, mat: MAT };

// ---------- geometry helpers ----------
const rb = (w, h, d, r = 0.03, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, r);
const cyl = (rt, rbt, h, n = 24, open = false) => new THREE.CylinderGeometry(rt, rbt, h, n, 1, open);
const lathe = (pts, n = 32) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);
function extrude(shape, depth, bevel = 0.01, curveSegments = 12) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}
// Planar UVs per box face, so a canvas maps 1:1 onto each face of a (rounded) box.
// Groups 0..5 = +x, -x, +y, -y, +z, -z. Canvas top = +y on the sides, = -z (far edge) on top.
function boxUV(geo) {
  geo.computeBoundingBox();
  const mn = geo.boundingBox.min, sz = geo.boundingBox.getSize(new THREE.Vector3());
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (const g of geo.groups) {
    for (let k = g.start; k < g.start + g.count; k++) {
      const i = geo.index ? geo.index.getX(k) : k;
      const x = (pos.getX(i) - mn.x) / sz.x, y = (pos.getY(i) - mn.y) / sz.y, z = (pos.getZ(i) - mn.z) / sz.z;
      const m = g.materialIndex;
      if (m < 2) uv.setXY(i, m === 0 ? 1 - z : z, y);
      else if (m < 4) uv.setXY(i, x, m === 2 ? 1 - z : z);
      else uv.setXY(i, m === 4 ? x : 1 - x, y);
    }
  }
  uv.needsUpdate = true;
  return geo;
}
// a round rod from a to b
function rod(a, b, r, mat, seg = 12) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = mesh(cyl(r, r, L, seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  return m;
}
const named = (o, name) => ((o.name = name), o);
const at = (o, v) => (o.position.copy(v), o);

// ---------- materials ----------
const matCache = new Map();
function tm(c) {
  if (!matCache.has(c)) matCache.set(c, toon(c));
  return matCache.get(c);
}
const texMat = (tex) => toon(0xffffff, { map: tex });
const LEAF = 0x5d9f47, SOIL = 0x5b4332;   // local tones (not signals)

// ---------- canvas helpers ----------
// loose ink grain: long, gently wavy strokes along the canvas x axis
function grain(x, w, h, rng, n, o = {}) {
  const { lw = 2, alpha = 0.22, wob = 8, minLen = 0.2, maxLen = 0.6, ink = '78,50,28', y0 = 0, y1 = h, wrap = false } = o;
  x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const len = w * (minLen + rng() * (maxLen - minLen));
    const sx = wrap ? rng() * w : rng() * (w + len * 0.6) - len * 0.3;
    const sy = y0 + rng() * (y1 - y0);
    const a0 = (rng() - 0.5) * 2 * wob, a1 = (rng() - 0.5) * 2 * wob, a2 = (rng() - 0.5) * 2 * wob;
    x.strokeStyle = `rgba(${ink},${(alpha * (0.6 + rng() * 0.7)).toFixed(3)})`;
    x.lineWidth = lw * (0.7 + rng() * 0.6);
    for (const off of wrap ? [0, -w] : [0]) {
      x.beginPath();
      x.moveTo(sx + off, sy);
      x.bezierCurveTo(sx + off + len / 3, sy + a0, sx + off + (2 * len) / 3, sy + a1, sx + off + len, sy + a2);
      x.stroke();
    }
  }
}
function knots(x, w, h, rng, n, { s = 1, ink = '78,50,28', alpha = 0.32, y0 = 0, y1 = h } = {}) {
  for (let i = 0; i < n; i++) {
    const cx = rng() * w, cy = y0 + rng() * (y1 - y0), rx = (7 + rng() * 7) * s, ry = rx * (0.32 + rng() * 0.18);
    x.strokeStyle = `rgba(${ink},${alpha})`;
    x.lineWidth = 1.8 * s;
    x.beginPath();
    x.ellipse(cx, cy, rx, ry, (rng() - 0.5) * 0.3, 0, TAU);
    x.stroke();
  }
}
// wood with grain along canvas x (vertical = true: along canvas y)
function woodTex(rng, w, h, base, n, o = {}, vertical = false) {
  return canvasTex(w, h, (x) => {
    x.fillStyle = hex(base);
    x.fillRect(0, 0, w, h);
    if (vertical) { x.translate(w, 0); x.rotate(Math.PI / 2); grain(x, h, w, rng, n, o); }
    else grain(x, w, h, rng, n, o);
  });
}

// =====================================================================================
export function buildRoom(scene, { screenTexture } = {}) {
  const rng = mulberry32(SEED);
  const room = named(new THREE.Group(), 'room');
  scene.add(room);

  buildDesk(room, rng);
  buildFloorAndWall(room, rng);
  buildMat(room);
  buildPegboard(room, rng);
  const bulbMat = buildLamp(room);
  const monitorGroup = buildMonitor(room, screenTexture);
  buildKeyboard(room);
  buildPencilCup(room, rng);
  buildPlant(room, rng);
  buildBooks(room, rng);
  buildShelf(room, rng);
  buildPoster(room);
  buildBin(room);

  room.updateMatrixWorld(true);
  const screenCenter = monitorGroup.localToWorld(V3(0, 2.05, 0.076));
  return { bulbMat, screenCenter, monitorGroup, room };
}

// ---------- desk ----------
function buildDesk(room, rng) {
  const g = named(new THREE.Group(), 'desk');
  room.add(g);
  // top slab: x -7..7, z -4.66..4.1 (the back 6 cm tucks behind the wall plane), y -0.4..0
  const topTex = canvasTex(2048, 1286, (x, w, h) => {
    x.fillStyle = hex(COL.desk); x.fillRect(0, 0, w, h);
    grain(x, w, h, rng, 64, { lw: 2.2, alpha: 0.2, wob: 9, minLen: 0.15, maxLen: 0.5 });
    knots(x, w, h, rng, 5, { s: 1.2, alpha: 0.26 });
  });
  const edgeTex = woodTex(rng, 2048, 64, COL.desk, 5, { lw: 2.2, alpha: 0.3, wob: 4, minLen: 0.35, maxLen: 0.8 });
  const plain = tm(COL.desk), edge = texMat(edgeTex);
  g.add(named(mesh(boxUV(rb(14, 0.4, 8.76, 0.05)), [edge, edge, texMat(topTex), plain, edge, edge], { p: [0, -0.2, -0.28] }), 'desk-top'));

  // legs (floor to slab), with vertical grain
  const legMat = texMat(woodTex(rng, 64, 1024, COL.desk, 4, { lw: 2, alpha: 0.26, wob: 3, minLen: 0.3, maxLen: 0.7 }, true));
  const legY0 = FLOOR_Y + GAP, legY1 = -0.35, legH = legY1 - legY0;
  for (const [x, z] of [[-6.4, 3.5], [6.4, 3.5], [-6.4, -4.0], [6.4, -4.0]]) {
    g.add(named(mesh(boxUV(rb(0.55, legH, 0.55, 0.04)), legMat, { p: [x, legY0 + legH / 2, z] }), 'desk-leg'));
  }
  // aprons: front, back, sides (tops sink 0.02 into the slab, ends sink into the legs)
  const apMat = texMat(woodTex(rng, 1024, 64, COL.desk, 4, { lw: 2, alpha: 0.26, wob: 3, minLen: 0.3, maxLen: 0.8 }));
  g.add(named(mesh(boxUV(rb(12.3, 0.8, 0.14, 0.03)), apMat, { p: [0, -0.78, 3.645] }), 'desk-apron-front'));
  g.add(named(mesh(boxUV(rb(12.3, 0.8, 0.14, 0.03)), apMat, { p: [0, -0.78, -4.0] }), 'desk-apron-back'));
  for (const x of [-6.4, 6.4]) g.add(named(mesh(boxUV(rb(0.14, 0.8, 7.0, 0.03)), apMat, { p: [x, -0.78, -0.25] }), 'desk-apron-side'));

  // the desk top's shadow catcher: covers the whole desk
  room.add(named(catcher(14, 8.7, { p: [0, 0.024, -0.25] }), 'catcher-desk'));
}

// ---------- floor, wall, baseboard ----------
function buildFloorAndWall(room, rng) {
  // floor: 8x8-unit tiling canvas: 5 planks per tile (seams along x), butt joints, loose grain, knots
  const floorTex = canvasTex(1024, 1024, (x, w, h) => {
    x.fillStyle = hex(COL.floor); x.fillRect(0, 0, w, h);
    const ph = h / 5;
    x.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const y0 = k * ph;
      grain(x, w, h, rng, 3, { lw: 2.2, alpha: 0.3, wob: ph * 0.12, minLen: 0.3, maxLen: 0.7, y0: y0 + ph * 0.18, y1: y0 + ph * 0.82, wrap: true, ink: '96,72,46' });
      if (rng() < 0.6) knots(x, w, h, rng, 1, { s: 1.1, alpha: 0.3, ink: '96,72,46', y0: y0 + ph * 0.3, y1: y0 + ph * 0.7 });
      x.strokeStyle = 'rgba(96,72,46,0.5)'; x.lineWidth = 2.6;
      x.beginPath(); x.moveTo(0, y0 + 1); x.lineTo(w, y0 + 1); x.stroke();
      const bx = 40 + rng() * (w - 80);
      x.beginPath(); x.moveTo(bx, y0 + 1); x.lineTo(bx, y0 + ph); x.stroke();
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(5, 4);
  room.add(named(mesh(new THREE.PlaneGeometry(40, 32), texMat(floorTex), { p: [0, FLOOR_Y, 11.4], r: [-Math.PI / 2, 0, 0], shadow: false, line: false }), 'floor'));
  room.add(named(catcher(40, 32, { p: [0, FLOOR_Y + 0.004, 11.4] }), 'catcher-floor'));

  // wall: mint, with a faint speckle so the big flat area isn't dead
  const wallTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = hex(COL.wall); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      x.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(60,95,72,0.06)';
      x.fillRect(rng() * w, rng() * h, 2, 2);
    }
  });
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
  wallTex.repeat.set(10, 19.5 / 4);
  room.add(named(mesh(new THREE.PlaneGeometry(40, 19.5), texMat(wallTex), { p: [0, 2.25, WALL_Z], shadow: false, line: false }), 'wall'));
  room.add(named(catcher(40, 19.5, { p: [0, 2.25, WALL_Z + 0.004], r: [0, 0, 0] }), 'catcher-wall'));

  // baseboard: off the floor and wall by GAP, with its own catcher on the front face
  const bbH = 0.7, bbD = 0.15;
  room.add(named(mesh(rb(40, bbH, bbD, 0.03), tm(COL.milk), { p: [0, FLOOR_Y + GAP + bbH / 2, WALL_Z + GAP + bbD / 2], shadow: false }), 'baseboard'));
  room.add(named(catcher(40, bbH - 0.04, { p: [0, FLOOR_Y + GAP + bbH / 2, WALL_Z + GAP + bbD + 0.005], r: [0, 0, 0] }), 'catcher-baseboard'));
  room.add(named(catcher(40, bbD - 0.04, { p: [0, FLOOR_Y + GAP + bbH + 0.005, WALL_Z + GAP + bbD / 2] }), 'catcher-baseboard-top'));
}

// ---------- cutting mat ----------
function buildMat(room) {
  const ppu = 256, W = Math.round(MAT.w * ppu), H = Math.round(MAT.d * ppu);
  const tex = canvasTex(W, H, (x, w, h) => {
    x.fillStyle = hex(COL.mat); x.fillRect(0, 0, w, h);
    const u = (v) => v * ppu;
    const m = 0.2;                                   // border inset
    // grid: 0.5-unit cells from the inset border
    x.strokeStyle = 'rgba(196,222,238,0.55)'; x.lineWidth = 3;
    for (let gx = m; gx <= MAT.w - m + 1e-6; gx += 0.5) { x.beginPath(); x.moveTo(u(gx), u(m)); x.lineTo(u(gx), h - u(m)); x.stroke(); }
    for (let gz = m; gz <= MAT.d - m + 1e-6; gz += 0.5) { x.beginPath(); x.moveTo(u(m), u(gz)); x.lineTo(w - u(m), u(gz)); x.stroke(); }
    // bolder every 2 units
    x.strokeStyle = 'rgba(210,232,244,0.7)'; x.lineWidth = 5;
    for (let gx = m; gx <= MAT.w - m + 1e-6; gx += 2) { x.beginPath(); x.moveTo(u(gx), u(m)); x.lineTo(u(gx), h - u(m)); x.stroke(); }
    for (let gz = m; gz <= MAT.d - m + 1e-6; gz += 2) { x.beginPath(); x.moveTo(u(m), u(gz)); x.lineTo(w - u(m), u(gz)); x.stroke(); }
    // ruler ticks just outside the grid on the near and left edges
    x.strokeStyle = 'rgba(210,232,244,0.75)'; x.lineWidth = 2.5;
    for (let t = 0; t <= (MAT.w - 2 * m) * 10 + 1e-6; t++) {
      const px = u(m + t * 0.1), L = t % 5 === 0 ? 28 : 14;
      x.beginPath(); x.moveTo(px, h - u(m)); x.lineTo(px, h - u(m) + L); x.stroke();
    }
    for (let t = 0; t <= (MAT.d - 2 * m) * 10 + 1e-6; t++) {
      const py = u(m + t * 0.1), L = t % 5 === 0 ? 28 : 14;
      x.beginPath(); x.moveTo(u(m), py); x.lineTo(u(m) - L, py); x.stroke();
    }
    // a 45-degree guide in the far-right corner
    x.strokeStyle = 'rgba(210,232,244,0.5)'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(w - u(m + 2.5), u(m)); x.lineTo(w - u(m), u(m + 2.5)); x.stroke();
  });
  const side = tm(COL.mat);
  const t = MAT.top - 0.005;                         // 0.015 thick, floats 0.005 over the desk top
  room.add(named(mesh(boxUV(rb(MAT.w, t, MAT.d, 0.006, 1)), [side, side, texMat(tex), side, side, side],
    { p: [MAT.x, MAT.top - t / 2, MAT.z], shadow: false }), 'mat'));
}

// ---------- pegboard + tools ----------
function buildPegboard(room, rng) {
  const g = named(new THREE.Group(), 'pegboard');
  room.add(g);
  const X = 1.2, Y = 3.2, BW = 6.0, BH = 3.2, BT = 0.08, ZF = -4.46;
  const NX = 24, NY = 12, SP = 0.25;
  const hx = (i) => X - ((NX - 1) * SP) / 2 + i * SP;   // -1.675 + 0.25 i
  const hy = (j) => Y - ((NY - 1) * SP) / 2 + j * SP;   //  1.825 + 0.25 j

  const tex = canvasTex(1536, 819, (x, w, h) => {
    x.fillStyle = hex(COL.peg); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = rng() < 0.5 ? 'rgba(255,250,236,0.12)' : 'rgba(120,96,64,0.07)'; x.fillRect(rng() * w, rng() * h, 2, 2); }
    const sx = w / BW, sy = h / BH, r = 0.034 * sx;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const cx = (hx(i) - (X - BW / 2)) * sx, cy = (Y + BH / 2 - hy(j)) * sy;
      x.fillStyle = 'rgba(255,250,236,0.5)'; x.beginPath(); x.arc(cx + 1.2, cy + 1.8, r, 0, TAU); x.fill();
      x.fillStyle = 'rgba(92,74,54,0.95)'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    }
  });
  const plain = tm(COL.peg);
  g.add(named(mesh(boxUV(rb(BW, BH, BT, 0.025)), [plain, plain, plain, plain, texMat(tex), plain], { p: [X, Y, ZF - BT / 2] }), 'pegboard-board'));
  // stand-offs to the wall (sink 0.01 behind the wall plane and 0.008 into the board)
  for (const [dx, dy] of [[-2.7, -1.35], [2.7, -1.35], [-2.7, 1.35], [2.7, 1.35]]) {
    g.add(mesh(rb(0.16, 0.16, 0.078, 0.02), plain, { p: [X + dx, Y + dy, (WALL_Z - 0.01 + ZF - BT + 0.008) / 2], shadow: false }));
  }
  room.add(named(catcher(BW - 0.04, BH - 0.04, { p: [X, Y, ZF + 0.005], r: [0, 0, 0] }), 'catcher-pegboard'));

  const steel = tm(COL.steel), dark = tm(COL.dark);
  const knob = new THREE.SphereGeometry(0.026, 12, 8);
  // a peg in hole (i, j): straight out of the board, optional up-turned hook at the end
  function peg(i, j, { len = 0.27, hook = true } = {}) {
    const x = hx(i), y = hy(j), z1 = ZF + len;
    g.add(named(rod(V3(x, y, ZF - 0.012), V3(x, y, z1), 0.026, steel, 10), 'peg'));
    if (hook) {
      g.add(mesh(knob, steel, { p: [x, y, z1] }));
      g.add(rod(V3(x, y, z1), V3(x, y + 0.085, z1), 0.026, steel, 10));
    }
    return y + 0.026;   // top of the peg
  }

  // --- hammer: head resting on two pegs, handle hanging between them
  {
    const top = peg(0, 9); peg(2, 9);
    const h = named(new THREE.Group(), 'hammer');
    h.position.set(hx(1), top - 0.004 + 0.095, -4.33);
    g.add(h);
    h.add(mesh(rb(0.5, 0.19, 0.19, 0.04), steel, { p: [-0.05, 0, 0] }));                         // body x -0.3..0.2
    h.add(mesh(cyl(0.11, 0.1, 0.16, 20), steel, { p: [-0.36, 0, 0], r: [0, 0, Math.PI / 2] }));   // striking face
    const claw = new THREE.Shape();
    claw.moveTo(0.16, 0.085); claw.quadraticCurveTo(0.46, 0.085, 0.58, -0.15);
    claw.lineTo(0.52, -0.17); claw.quadraticCurveTo(0.42, -0.04, 0.16, -0.07); claw.closePath();
    h.add(mesh(extrude(claw, 0.13, 0.015), steel));
    h.add(mesh(cyl(0.062, 0.072, 1.88, 16), tm(COL.base), { p: [0, -0.99, 0] }));                // handle y -0.05..-1.93
    h.add(mesh(cyl(0.084, 0.084, 0.62, 16), tm(COL.slate), { p: [0, -1.64, 0] }));               // grip
  }

  // --- combination wrench: box end hung on a peg through its ring
  {
    const top = peg(5, 10);
    const s = new THREE.Shape();
    const w = 0.065, R = 0.17, c1 = 0.62, c2 = -0.6, ws = 0.06;
    const a1 = Math.asin(w / R), a2 = Math.asin(ws / R);
    s.moveTo(w, c2 + R * Math.cos(a1));
    s.lineTo(w, c1 - R * Math.cos(a1));
    s.absarc(0, c1, R, -Math.PI / 2 + a1, 1.5 * Math.PI - a1, false);
    s.lineTo(-w, c2 + R * Math.cos(a1));
    s.absarc(0, c2, R, Math.PI / 2 + a1, 1.5 * Math.PI - a2, false);
    s.lineTo(-ws, c2);
    s.absarc(0, c2, ws, Math.PI, 0, true);
    s.lineTo(ws, c2 - R * Math.cos(a2));
    s.absarc(0, c2, R, 1.5 * Math.PI + a2, 2.5 * Math.PI - a1, false);
    s.closePath();
    const hole = new THREE.Path(); hole.absarc(0, c1, 0.09, 0, TAU, true); s.holes.push(hole);
    g.add(named(mesh(extrude(s, 0.04, 0.012, 16), steel, { p: [hx(5), top - 0.09 - c1, -4.37] }), 'wrench'));
  }

  // --- screwdriver: handle resting on two close pegs, shaft hanging between them
  {
    const top = peg(8, 7, { hook: false }); peg(9, 7, { hook: false });
    const sd = named(new THREE.Group(), 'screwdriver');
    sd.position.set((hx(8) + hx(9)) / 2, top - 0.004, -4.31);
    g.add(sd);
    sd.add(mesh(lathe([[0.001, 0], [0.11, 0], [0.125, 0.025], [0.125, 0.12], [0.13, 0.55], [0.115, 0.72], [0.075, 0.785], [0.001, 0.795]], 20), tm(COL.saffron)));
    sd.add(mesh(cyl(0.05, 0.06, 0.1, 16), steel, { p: [0, -0.04, 0] }));       // ferrule
    sd.add(mesh(cyl(0.028, 0.028, 0.86, 12), steel, { p: [0, -0.5, 0] }));     // shaft
    sd.add(mesh(cyl(0.028, 0.01, 0.09, 4), steel, { p: [0, -0.97, 0], s: [1.6, 1, 0.6] }));  // flat tip
  }

  // --- scissors: hung by one loop, so they tilt until the weight is under the peg
  {
    const top = peg(12, 10);
    const hang = named(new THREE.Group(), 'scissors');
    hang.position.set(hx(12), top, -4.37);
    hang.rotation.z = -0.17;
    g.add(hang);
    const sc = new THREE.Group();
    sc.position.set(0.13, -0.45, 0);          // left loop's inner top sits on the peg
    hang.add(sc);
    const blade = (m) => {
      const b = new THREE.Shape();
      b.moveTo(-0.055 * m, 0.07); b.lineTo(0.03 * m, 0.07);
      b.bezierCurveTo(0.065 * m, -0.25, 0.045 * m, -0.65, 0.006 * m, -0.95);
      b.lineTo(-0.012 * m, -0.93);
      b.bezierCurveTo(-0.035 * m, -0.6, -0.06 * m, -0.25, -0.055 * m, 0.07);
      return extrude(b, 0.02, 0.004, 10);
    };
    sc.add(mesh(blade(1), steel, { p: [0, 0, -0.017], r: [0, 0, 0.035] }));
    sc.add(mesh(blade(-1), steel, { p: [0, 0, 0.017], r: [0, 0, -0.035] }));
    sc.add(mesh(cyl(0.032, 0.032, 0.09, 14), dark, { r: [Math.PI / 2, 0, 0] }));  // pivot screw
    const loop = new THREE.Shape(); loop.absellipse(0, 0, 0.12, 0.155, 0, TAU, false);
    const lh = new THREE.Path(); lh.absellipse(0, 0, 0.075, 0.105, 0, TAU, true); loop.holes.push(lh);
    const loopGeo = extrude(loop, 0.05, 0.012, 20), plum = tm(COL.plum);
    sc.add(mesh(loopGeo, plum, { p: [-0.13, 0.34, -0.02] }));
    sc.add(mesh(loopGeo, plum, { p: [0.13, 0.32, 0.02] }));
    sc.add(mesh(rb(0.075, 0.2, 0.05, 0.02), plum, { p: [-0.095, 0.125, -0.012], r: [0, 0, 0.367] }));
    sc.add(mesh(rb(0.075, 0.2, 0.05, 0.02), plum, { p: [0.095, 0.115, 0.012], r: [0, 0, -0.367] }));
  }

  // --- masking tape roll on a long peg
  {
    const top = peg(17, 9, { len: 0.36 });
    const ring = (ro, ri) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, TAU, false); const p = new THREE.Path(); p.absarc(0, 0, ri, 0, TAU, true); s.holes.push(p); return s; };
    const roll = named(new THREE.Group(), 'tape');
    roll.position.set(hx(17), top - 0.2, -4.32);
    g.add(roll);
    roll.add(mesh(extrude(ring(0.228, 0.2), 0.24, 0, 36), tm(COL.earth)));       // cardboard core
    roll.add(mesh(extrude(ring(0.352, 0.222), 0.21, 0.008, 36), tm(COL.butter))); // tape
  }

  // --- ruler resting on two pegs
  {
    const top = peg(15, 1); peg(21, 1);
    const L = 2.0, RH = 0.3;
    const tex = canvasTex(1024, 154, (x, w, h) => {
      x.fillStyle = hex(COL.butter); x.fillRect(0, 0, w, h);
      x.strokeStyle = hex(COL.ink); x.fillStyle = hex(COL.ink); x.lineWidth = 3;
      const s = w / L;
      for (let t = 1; t < 40; t++) {
        const px = t * 0.05 * s, len = t % 10 === 0 ? 62 : t % 2 === 0 ? 40 : 22;
        x.beginPath(); x.moveTo(px, 0); x.lineTo(px, len); x.stroke();
      }
      x.font = 'bold 30px sans-serif'; x.textAlign = 'center';
      for (let n = 1; n < 20; n += 1) if (n % 2 === 0) x.fillText(String(n), n * 0.1 * s, 104);
    });
    const plainR = tm(COL.butter);
    g.add(named(mesh(boxUV(rb(L, RH, 0.03, 0.012, 1)), [plainR, plainR, plainR, plainR, texMat(tex), plainR],
      { p: [(hx(15) + hx(21)) / 2, top - 0.004 + RH / 2, -4.4] }), 'ruler'));
  }
}

// ---------- desk lamp ----------
function buildLamp(room) {
  const g = named(new THREE.Group(), 'lamp');
  room.add(g);
  const body = tm(COL.sky), joint = tm(COL.steel);
  const B = V3(4.6, LIFT, -3.3);
  g.add(at(mesh(lathe([[0.001, 0], [0.46, 0], [0.48, 0.025], [0.46, 0.09], [0.39, 0.15], [0.24, 0.18], [0.001, 0.19]], 40), body), B));
  const P0 = V3(4.6, 0.36, -3.3), P1 = V3(4.75, 2.75, -3.95), P2 = V3(3.95, 3.3, -2.55), T = V3(3.6, 0, -1.6);
  g.add(rod(V3(B.x, B.y + 0.15, B.z), P0, 0.055, body, 16));                // post
  g.add(rod(P0, P1, 0.045, body, 12));                                       // lower arm
  g.add(rod(P1, P2, 0.045, body, 12));                                       // upper arm
  // hinge discs, their axis across the arm plane
  const n = new THREE.Vector3().subVectors(P1, P0).cross(new THREE.Vector3().subVectors(P2, P1)).normalize();
  const hinge = cyl(0.095, 0.095, 0.15, 20);   // thicker than the post/arms so they end inside it
  for (const p of [P0, P1, P2]) {
    const k = at(mesh(hinge, joint), p);
    k.quaternion.setFromUnitVectors(UP, n);
    g.add(k);
  }
  // cord from the base back to the wall
  const cord = new THREE.CatmullRomCurve3([V3(4.62, LIFT + 0.03, -3.72), V3(4.72, LIFT + 0.03, -4.12), V3(5.05, LIFT + 0.03, -4.38), V3(5.6, LIFT + 0.03, -4.55)]);
  g.add(named(mesh(new THREE.TubeGeometry(cord, 24, 0.03, 8), tm(COL.dark)), 'lamp-cord'));

  // head: shade (closed lathe shell, opening along -y), bulb poking out below the rim
  const dir = new THREE.Vector3().subVectors(T, P2).normalize();
  const head = named(new THREE.Group(), 'lamp-head');
  head.position.copy(P2).addScaledVector(dir, 0.14);
  head.quaternion.setFromUnitVectors(V3(0, -1, 0), dir);
  g.add(head);
  head.add(mesh(lathe([[0.001, 0], [0.13, 0], [0.15, -0.03], [0.42, -0.52], [0.44, -0.55], [0.465, -0.545], [0.47, -0.52], [0.18, 0], [0.16, 0.1], [0.13, 0.13], [0.001, 0.13]], 40), body));
  head.add(mesh(cyl(0.07, 0.09, 0.12, 16), joint, { p: [0, 0.17, 0] }));
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xf4eedf });
  head.add(named(mesh(new THREE.SphereGeometry(0.17, 24, 16), bulbMat, { p: [0, -0.5, 0], shadow: false }), 'lamp-bulb'));
  return bulbMat;
}

// ---------- monitor ----------
function buildMonitor(room, screenTexture) {
  const g = named(new THREE.Group(), 'monitor');
  g.position.set(-3.4, 0, -2.6);
  g.rotation.y = 0.5;
  room.add(g);
  const stand = tm(COL.dark), bez = tm(COL.bezel);
  // round foot, fully on the mat (mat corner is x -4.0, z -3.0; the foot spans x >= -3.73, z >= -2.91)
  g.add(named(mesh(lathe([[0.001, 0], [0.34, 0], [0.36, 0.015], [0.355, 0.04], [0.3, 0.07], [0.001, 0.08]], 40), stand, { p: [0, ON_MAT, 0.06] }), 'monitor-foot'));
  g.add(named(mesh(rb(0.26, 2.12, 0.1, 0.04), stand, { p: [0, ON_MAT + 0.06 + 1.06, -0.14] }), 'monitor-neck'));
  g.add(mesh(rb(2.0, 1.15, 0.16, 0.06), stand, { p: [0, 2.05, -0.135] }));    // back housing
  g.add(named(mesh(rb(3.3, 2.0, 0.14, 0.05), bez, { p: [0, 2.05, 0] }), 'monitor-bezel'));   // bottom edge y 1.05

  const tex = screenTexture || canvasTex(256, 148, (x, w, h) => { x.fillStyle = '#7c838c'; x.fillRect(0, 0, w, h); });
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  g.add(named(decal(new THREE.PlaneGeometry(3.08, 1.78), screenMat, { p: [0, 2.05, 0.076] }), 'monitor-screen'));

  // two sticky notes on the top-right corner, mostly on the bezel and hanging off it
  const noteTex = (bg, seed) => canvasTex(128, 128, (x, w, h) => {
    const r = mulberry32(seed);
    x.fillStyle = hex(bg); x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(0,0,0,0.05)'; x.fillRect(0, 0, w, 20);
    x.strokeStyle = 'rgba(28,28,32,0.85)'; x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round';
    for (let k = 0; k < 3; k++) {
      const y = 46 + k * 26, x1 = 70 + r() * 36;
      x.beginPath(); x.moveTo(18, y);
      for (let px = 18; px < x1; px += 12) x.lineTo(px + 6, y + (r() - 0.5) * 10);
      x.stroke();
    }
  });
  const note = (bg, seed, p, rz) => {
    const paper = tm(bg);
    return mesh(boxUV(rb(0.4, 0.4, 0.012, 0.005, 1)), [paper, paper, paper, paper, texMat(noteTex(bg, seed)), paper], { p, r: [0, 0, rz] });
  };
  g.add(named(note(COL.butter, 11, [1.66, 2.72, 0.088], -0.1), 'sticky-note'));
  g.add(named(note(COL.peach, 23, [1.42, 3.02, 0.107], 0.16), 'sticky-note'));
  return g;
}

// ---------- keyboard ----------
// Off the mat, left of it: at rotation 0.4 a keyboard can't sit fully on the mat and still clear the diorama.
function buildKeyboard(room) {
  const g = named(new THREE.Group(), 'keyboard');
  g.position.set(-5.25, 0, -0.7);   // brief: (-3.7, -0.7); moved so it sits fully off the mat (right edge x -4.07)
  g.rotation.y = 0.4;
  room.add(g);
  const W = 2.2, D = 0.86, T = 0.13;
  g.add(mesh(rb(W, T, D, 0.05), tm(COL.steel), { p: [0, LIFT + T / 2, 0] }));
  const rows = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
    [1.5, 1.5, 7, 1.5, 1.5],
  ];
  const pitch = (W - 0.11) / 13, rowPitch = (D - 0.08) / rows.length, ky = LIFT + T - 0.012 + 0.03;
  const keys = [], accents = [];   // accents stand 0.006 taller (no shared top plane)
  rows.forEach((row, r) => {
    let x = -W / 2 + 0.055;
    const z = -D / 2 + 0.04 + rowPitch * (r + 0.5);
    row.forEach((u, k) => {
      const geo = rb(u * pitch - 0.028, 0.06, rowPitch - 0.028, 0.02, 1);
      const acc = (r === 0 && k === 0) || (r === 2 && k === row.length - 1);
      geo.translate(x + (u * pitch) / 2, ky + (acc ? 0.006 : 0), z);
      (acc ? accents : keys).push(geo);
      x += u * pitch;
    });
  });
  g.add(named(mesh(mergeGeometries(keys), tm(COL.milk)), 'keys'));
  g.add(named(mesh(mergeGeometries(accents), tm(COL.saffron)), 'keys-accent'));
}

// ---------- pencil cup ----------
function buildPencilCup(room, rng) {
  const g = named(new THREE.Group(), 'pencil-cup');
  g.position.set(4.7, LIFT, 1.5);
  room.add(g);
  g.add(mesh(lathe([[0.001, 0], [0.31, 0], [0.34, 0.025], [0.35, 0.9], [0.345, 0.93], [0.325, 0.93], [0.315, 0.9], [0.3, 0.09], [0.001, 0.09]], 32), tm(COL.slate)));
  g.add(mesh(cyl(0.357, 0.354, 0.12, 32, true), tm(COL.cream), { p: [0, 0.72, 0], line: false, shadow: false }));  // painted band
  const cols = [COL.saffron, COL.sky, COL.plum, COL.saffron, COL.milk];
  for (let i = 0; i < 5; i++) {
    const a = (i * TAU) / 5 + rng() * 0.5, tilt = 0.13 + rng() * 0.1, L = 1.4 + rng() * 0.35;
    const p = named(new THREE.Group(), 'pencil');
    p.position.set(-Math.cos(a) * 0.13, 0.1, -Math.sin(a) * 0.13);
    p.quaternion.setFromUnitVectors(UP, V3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)));
    p.rotateY(rng() * 1.0);
    p.add(mesh(cyl(0.042, 0.042, L, 6), tm(cols[i]), { p: [0, L / 2, 0] }));
    p.add(mesh(cyl(0.013, 0.042, 0.15, 6), tm(COL.peach), { p: [0, L + 0.07, 0] }));
    p.add(mesh(new THREE.ConeGeometry(0.013, 0.045, 6), tm(COL.dark), { p: [0, L + 0.14 + 0.0225, 0] }));
    g.add(p);
  }
}

// ---------- potted snake plant ----------
function buildPlant(room, rng) {
  const g = named(new THREE.Group(), 'plant');
  g.position.set(5.5, LIFT, -2.6);
  room.add(g);
  g.add(mesh(lathe([[0.001, 0], [0.27, 0], [0.3, 0.025], [0.35, 0.56], [0.4, 0.57], [0.415, 0.59], [0.415, 0.74], [0.4, 0.76], [0.37, 0.76], [0.36, 0.74], [0.355, 0.66], [0.001, 0.66]], 36), tm(COL.cream)));
  g.add(mesh(cyl(0.355, 0.33, 0.1, 36, true), tm(COL.sky), { p: [0, 0.3, 0], line: false, shadow: false }));  // painted band
  g.add(mesh(cyl(0.345, 0.345, 0.05, 32), tm(SOIL), { p: [0, 0.67, 0] }));
  const leaf = new THREE.Shape();
  leaf.moveTo(-0.075, 0); leaf.bezierCurveTo(-0.14, 0.35, -0.1, 0.75, 0, 1);
  leaf.bezierCurveTo(0.1, 0.75, 0.14, 0.35, 0.075, 0); leaf.closePath();
  const leafGeo = extrude(leaf, 0.03, 0.008, 10);
  for (let i = 0; i < 7; i++) {
    const a = (i * TAU) / 7 + rng() * 0.5, r = 0.05 + rng() * 0.12, h = 1.0 + rng() * 0.65;
    const l = named(mesh(leafGeo, tm(i % 2 ? COL.palm : LEAF), { s: [1, h, 1] }), 'leaf');
    l.position.set(Math.sin(a) * r, 0.6, Math.cos(a) * r);
    l.rotation.order = 'YXZ';
    l.rotation.set(0.08 + rng() * 0.22, a + (rng() - 0.5) * 0.6, (rng() - 0.5) * 0.12);
    g.add(l);
  }
}

// ---------- book stack ----------
function buildBooks(room, rng) {
  const g = named(new THREE.Group(), 'books');
  g.position.set(-5.6, 0, -3.2);
  room.add(g);
  const pageTex = canvasTex(256, 64, (x, w, h) => {
    x.fillStyle = hex(COL.page); x.fillRect(0, 0, w, h);
    for (let y = 6; y < h - 3; y += 5 + rng() * 3) { x.fillStyle = 'rgba(150,130,100,0.35)'; x.fillRect(0, y, w, 1.5); }
  });
  const pages = texMat(pageTex);
  function book(w, h, d, color) {
    const b = new THREE.Group(), c = tm(color);
    b.add(mesh(rb(w, 0.035, d, 0.012), c, { p: [0, h / 2 - 0.0175, 0] }));
    b.add(mesh(rb(w, 0.035, d, 0.012), c, { p: [0, -h / 2 + 0.0175, 0] }));
    b.add(mesh(rb(0.05, h, d, 0.018), c, { p: [-w / 2 + 0.02, 0, 0] }));
    b.add(mesh(boxUV(rb(w - 0.06, h - 0.06, d - 0.06, 0.008)), pages, { p: [0, 0, 0] }));
    return b;
  }
  let y = LIFT;
  for (const [w, h, d, color, ry, dx, dz] of [
    [1.75, 0.3, 1.25, COL.slate, 0.06, 0, 0],
    [1.6, 0.24, 1.12, COL.plum, -0.12, 0.04, 0.03],
    [1.45, 0.32, 1.02, COL.saffron, 0.17, -0.05, 0.0],
  ]) {
    const b = named(book(w, h, d, color), 'book');
    b.position.set(dx, y + h / 2, dz);
    b.rotation.y = ry;
    g.add(b);
    y += h - 0.008;   // the next book sinks 0.008 into this one
  }
}

// ---------- wall shelf with jars ----------
function buildShelf(room, rng) {
  const g = named(new THREE.Group(), 'shelf');
  room.add(g);
  const SX = 5.6, SY = 4.6, D = 0.7, SW = 2.4, T = 0.1, zc = WALL_Z + GAP + D / 2;
  g.add(named(mesh(boxUV(rb(SW, T, D, 0.025)), texMat(woodTex(rng, 512, 64, COL.base, 3, { lw: 2, alpha: 0.28, wob: 3, minLen: 0.4, maxLen: 0.9 })), { p: [SX, SY, zc] }), 'shelf-board'));
  const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(0.46, 0); tri.lineTo(0, -0.46); tri.closePath();
  for (const bx of [SX - 0.8, SX + 0.8]) {
    g.add(mesh(extrude(tri, 0.05, 0.008), tm(COL.dark), { p: [bx, SY - T / 2 + 0.006, WALL_Z + GAP + 0.008], r: [0, -Math.PI / 2, 0] }));
  }
  room.add(named(catcher(SW - 0.05, D - 0.05, { p: [SX, SY + T / 2 + 0.004, zc] }), 'catcher-shelf'));
  for (const [x, h, lid] of [[SX - 0.68, 0.55, COL.saffron], [SX + 0.02, 0.78, COL.plum], [SX + 0.7, 0.48, COL.sky]]) {
    const j = named(new THREE.Group(), 'jar');
    j.position.set(x, SY + T / 2 + GAP, zc + 0.02);
    g.add(j);
    j.add(mesh(lathe([[0.001, 0], [0.19, 0], [0.21, 0.02], [0.215, h - 0.08], [0.18, h - 0.02], [0.16, h], [0.001, h]], 28), tm(COL.glass)));
    j.add(mesh(cyl(0.175, 0.175, 0.09, 24), tm(lid), { p: [0, h + 0.03, 0] }));
    j.add(mesh(cyl(0.224, 0.224, 0.05, 28, true), tm(COL.white), { p: [0, h * 0.55, 0], line: false, shadow: false }));
  }
}

// ---------- framed poster ----------
function buildPoster(room) {
  const W = 1.9, H = 2.5, D = 0.05;
  const g = named(new THREE.Group(), 'poster');
  g.position.set(-4.95, 4.3, WALL_Z + GAP + D / 2);   // brief: about (-5.6, 4.0); moved so the wide shot frames a third of it instead of a dark sliver
  room.add(g);
  g.add(mesh(rb(W, H, D, 0.02), tm(COL.dark)));
  const art = canvasTex(512, 690, (x, w, h) => {
    x.fillStyle = hex(COL.cream); x.fillRect(0, 0, w, h);
    x.fillStyle = hex(COL.sky); x.fillRect(34, 34, w - 68, 480);
    x.fillStyle = hex(COL.saffron); x.beginPath(); x.arc(w / 2, 250, 150, 0, TAU); x.fill();
    const inv = ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'];
    const c = 26, ox = w / 2 - (11 * c) / 2, oy = 250 - (8 * c) / 2;
    x.fillStyle = hex(COL.plum);
    inv.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '#') x.fillRect(ox + k * c, oy + r * c, c + 0.5, c + 0.5); }));
    x.fillStyle = hex(COL.plum); x.fillRect(34, 548, w - 68, 26);
    x.fillStyle = hex(COL.saffron); for (let k = 0; k < 5; k++) x.fillRect(34 + k * 92, 600, 60, 40);
  });
  g.add(mesh(new THREE.PlaneGeometry(W - 0.16, H - 0.16), texMat(art), { p: [0, 0, D / 2 + 0.006], line: false, shadow: false }));
}

// ---------- bin under the desk ----------
function crumple(r, seed) {
  const geo = new THREE.IcosahedronGeometry(r, 1), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = hash1(Math.round(v.x * 997) * 3 + Math.round(v.y * 991) * 7 + Math.round(v.z * 983) * 13 + seed);
    v.multiplyScalar(0.8 + 0.35 * k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
function buildBin(room) {
  const g = named(new THREE.Group(), 'bin');
  g.position.set(-3.2, FLOOR_Y + GAP, -1.3);
  room.add(g);
  g.add(mesh(lathe([[0.001, 0], [0.76, 0], [0.79, 0.03], [0.98, 2.55], [0.98, 2.62], [0.95, 2.64], [0.93, 2.6], [0.75, 0.1], [0.001, 0.1]], 40), tm(COL.lav)));
  const paper = tm(COL.page);
  for (const [x, y, z, r, s] of [[-0.25, 2.5, 0.1, 0.34, 1], [0.3, 2.45, -0.15, 0.3, 2], [0.05, 2.62, 0.35, 0.27, 3]]) g.add(named(mesh(crumple(r, s), paper, { p: [x, y, z] }), 'paper-ball'));
  g.add(named(mesh(crumple(0.28, 4), paper, { p: [1.35, 0.25, 0.9] }), 'paper-ball'));
}
