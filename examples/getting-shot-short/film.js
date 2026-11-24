// film.js: "Why does getting shot in a game doesn't kill you" at 24 fps.
// Gaming-desk cast (mug / gamepad / soda), toon shooter arena on the monitor + full-scene cuts,
// x-ray hitbox, damage feedback, sound-FX desk, respawn kicker. Deterministic seek-by-replay.
import {
  THREE, RoundedBoxGeometry, W, H, COL, clamp, lerp, easeInOut, easeOut, easeIn, lin, sstep, V3, mulberry32,
  flashK, popScale, popOut, popInOut, toon, outlineU, outlineMat, hullGeometry, addOutline, mesh, decal,
  hatchU, catcher, GAME, inGame, canvasTex, hex,
} from './core.js';
import { FPS, FRAMES, FREEZE } from './beats.js';

const ROOM = await import('./room.js').catch((e) => { console.warn('room.js not loaded: ' + e.message); return null; });
const OVL = await import('./overlays.js').catch((e) => { console.warn('overlays.js not loaded: ' + e.message); return null; });
await document.fonts.load('800 80px Caption');
await document.fonts.load('bold 90px Menlo');

// ---------- constants ----------
const Y0 = 0.02;                 // cutting-mat top
const CH_Y = Y0 - 0.008;
const LIFT = 0.005;
const DT = 1 / 96, SUB = 4, GRAV = 22, PRE = 48;
const LIME = new THREE.Color(COL.lime), RED = new THREE.Color(COL.red);
const DATA_C = new THREE.Color(COL.data);
const [FZ0, FZ1] = FREEZE;
const sOf = (f) => (f <= FZ0 ? f : f < FZ1 ? FZ0 : f - (FZ1 - FZ0 - 1));
const _p = new THREE.Vector3(), _v = new THREE.Vector3(), _camT = new THREE.Vector3();
let simT = 0;

// ---------- renderer, camera, lights ----------
const glCanvas = document.getElementById('gl'), film = document.getElementById('film');
const fctx = film.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const ROOM_CLEAR = COL.wall, GAME_CLEAR = 0x8eb8d8, XRAY_CLEAR = 0xb8d4e8;
renderer.setClearColor(ROOM_CLEAR);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, W / H, 0.3, 200);

const amb = new THREE.AmbientLight(0xffffff, 0.45 * Math.PI);
const sun = new THREE.DirectionalLight(0xfff6ea, 0.55 * Math.PI);
const SUN_POS = new THREE.Vector3(-6, 11, 7);
sun.position.copy(SUN_POS);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 45 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
amb.layers.enable(GAME); sun.layers.enable(GAME);
scene.add(amb, sun, sun.target);

// gameplay render target for the in-scene monitor
const RT_W = 616, RT_H = 356;
const rt = new THREE.WebGLRenderTarget(RT_W, RT_H, { samples: 4, type: THREE.HalfFloatType });
const gameCam = new THREE.PerspectiveCamera(40, RT_W / RT_H, 0.3, 60);
gameCam.layers.set(GAME);

// ---------- room ----------
function fallbackRoom() {
  scene.add(mesh(new THREE.BoxGeometry(14, 0.4, 8.7), toon(COL.desk), { p: [0, -0.2, -0.25], line: false }));
  scene.add(mesh(new THREE.BoxGeometry(8, 0.02, 6.9), toon(COL.mat), { p: [0, 0.01, 0.45], line: false, shadow: false }));
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), toon(COL.wall)); wall.position.set(0, 2.5, -4.6); scene.add(wall);
  scene.add(catcher(14, 8.7, { p: [0, 0.024, -0.25] }));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(3.08, 1.78), new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false }));
  scr.position.set(-3.4, 2.0, -2.6); scr.rotation.y = 0.5; scene.add(scr);
  return { bulbMat: null, screenCenter: scr.position.clone(), monitorGroup: null, room: null };
}
const roomH = ROOM ? ROOM.buildRoom(scene, { screenTexture: rt.texture }) : fallbackRoom();
const screenCenter = roomH.screenCenter || V3(-3.4, 2.0, -2.6);
const monitorGroup = roomH.monitorGroup || null;
const roomRoot = roomH.room || null;

// red tint overlay on the monitor glass (PROBLEM beat)
const glassTint = new THREE.Mesh(
  new THREE.PlaneGeometry(3.08, 1.78),
  new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
);
glassTint.name = 'monitor-glass-tint';
glassTint.position.set(0, 2.05, 0.076 + LIFT * 2);
glassTint.renderOrder = 5;
if (monitorGroup) monitorGroup.add(glassTint);
else { glassTint.position.set(-3.4, 2.0, -2.55); scene.add(glassTint); }

// ---------- particles: dust ----------
const puffGeo = new THREE.IcosahedronGeometry(1, 2);
const puffMats = [toon(0xf4f5f0), toon(0xd8ddd5)];
const parts = [];
let prng = mulberry32(1), spawnN = 0;
function spawn(kind, pos, vel, size, life) {
  let p = parts.find((q) => !q.alive && q.kind === kind);
  if (!p) {
    const m = new THREE.Mesh(puffGeo, puffMats[0]);
    m.name = kind === 'dust' ? 'dust-puff' : `${kind}-puff`;
    m.userData.particle = true;
    addOutline(m);
    p = { kind, mesh: m, vel: new THREE.Vector3() };
    scene.add(m); parts.push(p);
  }
  p.mesh.material = puffMats[spawnN++ % 2];
  p.alive = true; p.t = 0; p.life = life; p.size = size; p.seed = prng() * 6; p.y0 = pos.y;
  p.mesh.position.copy(pos); p.vel.copy(vel); p.mesh.visible = true; p.mesh.scale.setScalar(0.001);
}
function updateParticles(dt) {
  for (const p of parts) {
    if (!p.alive) continue;
    p.t += dt;
    const k = p.t / p.life, m = p.mesh;
    if (k >= 1) { p.alive = false; m.visible = false; continue; }
    p.vel.multiplyScalar(Math.exp(-5 * dt));
    m.position.addScaledVector(p.vel, dt);
    m.scale.setScalar(Math.max(0.001, p.size * (k < 0.25 ? easeOut(k / 0.25) : 1 - easeIn((k - 0.25) / 0.75))));
  }
}
function dustRing(c, n, rx, rz, speed, size) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + prng() * 0.4;
    _p.set(c.x + Math.cos(a) * rx, c.y + 0.04, c.z + Math.sin(a) * rz);
    spawn('dust', _p, _v.set(Math.cos(a), 0.35, Math.sin(a)).multiplyScalar(speed), size * (0.75 + prng() * 0.5), 0.5);
  }
}

// ---------- googly eyes ----------
const eyeTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#c9d1cd'; x.beginPath(); x.arc(64, 64, 64, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#e6e8df'; x.beginPath(); x.arc(64, 55, 59, 0, Math.PI * 2); x.fill();
});
const EYE = {
  puckGeo: new THREE.CylinderGeometry(1, 1, 1, 40).rotateX(Math.PI / 2).rotateZ(Math.PI / 2),
  discGeo: new THREE.CircleGeometry(1, 40),
  domeGeo: new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2),
  sideMat: new THREE.MeshBasicMaterial({ color: 0xd5d9d0 }),
  faceMat: new THREE.MeshBasicMaterial({ map: eyeTex }),
  pupilMat: new THREE.MeshBasicMaterial({ color: COL.pupil, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
  domeMat: new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      varying vec3 vN; varying vec3 vV;
      void main() { float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(1.0, 1.0, 1.0, 0.6 * f * f); }`,
  }),
};
const buildRng = mulberry32(90210);
function makeEye(R) {
  const g = new THREE.Group();
  const depth = R * 0.3;
  const puck = new THREE.Mesh(EYE.puckGeo, [EYE.sideMat, EYE.faceMat, EYE.sideMat]);
  puck.scale.set(R, R, depth); puck.position.z = LIFT + depth / 2; puck.castShadow = true;
  addOutline(puck); g.add(puck);
  const pupil = new THREE.Mesh(EYE.discGeo, EYE.pupilMat);
  pupil.scale.setScalar(R * 0.5); pupil.position.z = LIFT + depth + LIFT; g.add(pupil);
  const dome = new THREE.Mesh(EYE.domeGeo, EYE.domeMat);
  dome.scale.set(R, R, R * 0.42); dome.position.z = LIFT + depth; g.add(dome);
  g.userData = { pupil, travel: R * 0.46, u: new THREE.Vector2(0, -0.3), v: new THREE.Vector2(), prev: new THREE.Vector3(), prevVel: new THREE.Vector3(), init: false, phase: buildRng() * 6.28 };
  return g;
}
const _wp = new THREE.Vector3(), _vel = new THREE.Vector3(), _acc = new THREE.Vector3(), _qq = new THREE.Quaternion(), _d = new THREE.Vector3(), _g = new THREE.Vector3();
const PUPIL = { k: 350, damp: 13, bounce: 0.5, inertia: 0.35, gravity: 50, drift: 0.07 };
function updateEye(eye, target, dt, t) {
  const e = eye.userData;
  eye.getWorldPosition(_wp);
  if (!e.init) { e.prev.copy(_wp); e.prevVel.set(0, 0, 0); e.init = true; }
  _vel.subVectors(_wp, e.prev).divideScalar(dt);
  _acc.subVectors(_vel, e.prevVel).divideScalar(dt);
  e.prev.copy(_wp); e.prevVel.copy(_vel);
  if (_acc.lengthSq() > 62500) _acc.setLength(250);
  eye.getWorldQuaternion(_qq).invert();
  _acc.applyQuaternion(_qq);
  _d.subVectors(target, _wp).applyQuaternion(_qq).normalize();
  _g.set(0, -1, 0).applyQuaternion(_qq);
  let tx = _d.x * 1.25 + PUPIL.drift * Math.sin(t * 0.9 + e.phase);
  let ty = _d.y * 1.25 + PUPIL.drift * Math.sin(t * 1.3 + e.phase * 1.7);
  const tl = Math.hypot(tx, ty);
  if (tl > 0.92) { tx *= 0.92 / tl; ty *= 0.92 / tl; }
  const inv = PUPIL.inertia / e.travel;
  e.v.x += (PUPIL.k * (tx - e.u.x) - PUPIL.damp * e.v.x - _acc.x * inv + _g.x * PUPIL.gravity) * dt;
  e.v.y += (PUPIL.k * (ty - e.u.y) - PUPIL.damp * e.v.y - _acc.y * inv + _g.y * PUPIL.gravity) * dt;
  e.u.x += e.v.x * dt; e.u.y += e.v.y * dt;
  const r = Math.hypot(e.u.x, e.u.y);
  if (r > 1) {
    const nx = e.u.x / r, ny = e.u.y / r;
    e.u.set(nx, ny);
    const vr = e.v.x * nx + e.v.y * ny;
    if (vr > 0) { e.v.x -= (1 + PUPIL.bounce) * vr * nx; e.v.y -= (1 + PUPIL.bounce) * vr * ny; }
  }
  e.pupil.position.x = e.u.x * e.travel;
  e.pupil.position.y = e.u.y * e.travel;
}

// ---------- characters ----------
const cast = [];
const add = (ch, m) => { ch.body.add(m); return m; };
function character(def) {
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const ch = Object.assign({ root, body, eyes: [], sigMats: [], lookW: new THREE.Vector3(), phase: buildRng() * 6.28 }, def);
  def.build(ch);
  root.position.set(def.x, CH_Y + def.dy, def.z);
  root.rotation.y = def.ry;
  root.name = def.key;
  scene.add(root);
  root.traverse((o) => {
    if (o.isMesh && !o.userData.outline) {
      o.userData.ch = ch;
      o.receiveShadow = false;
    }
  });
  cast.push(ch);
  return ch;
}
function resetChar(ch) {
  ch.rng = mulberry32(ch.seed);
  ch.st = { y: 0, vy: 0, air: false, sq: 1, vsq: 0, tilt: 0, vtilt: 0, lean: 0, vlean: 0, yaw: 0, vyaw: 0, shake: 0 };
  ch.body.position.set(0, 0, 0); ch.body.rotation.set(0, 0, 0); ch.body.scale.set(1, 1, 1);
  for (const e of ch.eyes) {
    const u = e.userData;
    u.u.set(0, -0.3); u.v.set(0, 0); u.init = false;
    u.pupil.position.x = 0; u.pupil.position.y = -0.3 * u.travel;
  }
}
function sigMat(ch, color) { const m = toon(color); m.userData.base = m.color.clone(); ch.sigMats.push(m); return m; }
function addEyes(ch, list) {
  for (const [R, x, y, z, ry, rx] of list) {
    const e = makeEye(R);
    e.position.set(x, y, z); e.rotation.set(rx || 0, ry || 0, 0, 'YXZ');
    ch.body.add(e); ch.eyes.push(e);
  }
}
const flatEyes = (ch, R, y, z, gap) => addEyes(ch, [[R, -gap / 2, y, z], [R, gap / 2, y, z]]);
function roundEyes(ch, R, radius, y, gap) {
  const a = Math.asin(gap / 2 / radius);
  addEyes(ch, [[R, -Math.sin(a) * radius, y, Math.cos(a) * radius, -a], [R, Math.sin(a) * radius, y, Math.cos(a) * radius, a]]);
}
function headPos(ch, out) { out.set(0, ch.h * 0.72, 0); return ch.body.localToWorld(out); }
function spring(x, v, target, k, c, dt) { v += (k * (target - x) - c * v) * dt; return [x + v * dt, v]; }
function landFx(ch, impact) {
  const s = ch.st;
  s.vsq -= Math.min(6, impact * 0.85);
  s.vtilt += (ch.rng() - 0.5) * impact * 0.3;
  const n = Math.min(8, 4 + Math.round(impact * 0.6)), size = 0.55 * clamp(0.05 + impact * 0.013, 0.06, 0.16);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + ch.rng() * 0.4;
    _p.set(Math.cos(a) * ch.w * 0.5, 0.04, Math.sin(a) * ch.d * 0.5).add(ch.root.position);
    spawn('dust', _p, _v.set(Math.cos(a), 0.35, Math.sin(a)).multiplyScalar(0.8 + impact * 0.12), size * (0.75 + ch.rng() * 0.5), 0.5);
  }
}
function land(ch) { const s = ch.st, impact = -s.vy; s.y = 0; s.vy = 0; s.air = false; landFx(ch, impact); }
const _local = new THREE.Vector3();
function updateChar(ch, dt) {
  const s = ch.st;
  if (s.air) { s.vy -= GRAV * dt; s.y += s.vy * dt; if (s.y <= 0 && s.vy < 0) land(ch); }
  _local.copy(ch.lookW); ch.root.worldToLocal(_local);
  const yawT = clamp(Math.atan2(_local.x, Math.max(0.4, _local.z)) * 0.4, -0.45, 0.45);
  const leanT = clamp(-_local.x * 0.025, -0.06, 0.06);
  [s.yaw, s.vyaw] = spring(s.yaw, s.vyaw, yawT, 40, 9, dt);
  [s.lean, s.vlean] = spring(s.lean, s.vlean, leanT, 60, 8, dt);
  [s.tilt, s.vtilt] = spring(s.tilt, s.vtilt, 0, 90, 7, dt);
  [s.sq, s.vsq] = spring(s.sq, s.vsq, 1 + 0.012 * Math.sin(simT * 2.1 + ch.phase), 260, 9, dt);
  let shakeZ = 0;
  if (s.shake > 0) { s.shake -= dt; shakeZ = Math.sin(simT * 46 + ch.phase) * 0.07 * Math.min(1, s.shake / 0.25); }
  ch.body.position.y = s.y;
  ch.body.rotation.set(s.tilt, s.yaw, s.lean + shakeZ, 'YXZ');
  const sq = clamp(s.sq, 0.55, 1.5), sx = 1 / Math.sqrt(sq);
  ch.body.scale.set(sx, sq, sx);
  if (ch.update) ch.update(dt);
}
function hop(ch, v) { const s = ch.st; if (!s.air) { s.vy = v; s.air = true; } }

// 1. Mug (plum — keep cast off signal red) — front left
const mug = character({
  key: 'mug', x: -1.35, z: 2.7, ry: 0.28, dy: 0, w: 1.25, d: 0.84, h: 1.0, hopV: 3.6, seed: 101,
  build(ch) {
    const r = 0.42, Hm = 1.0, V2 = (x, y) => new THREE.Vector2(x, y);
    const mugCol = COL.plum;
    // open bottom (no buried disc) so the mat can't fight a coplanar underside
    const prof = [V2(r - 0.05, 0), V2(r, 0.05), V2(r, Hm - 0.012), V2(r - 0.014, Hm), V2(r - 0.05, Hm), V2(r - 0.064, Hm - 0.016), V2(r - 0.064, 0.1), V2(0, 0.1)];
    const body = mesh(new THREE.LatheGeometry(prof, 48), toon(mugCol, { side: THREE.DoubleSide }), { });
    body.name = 'mug-body'; add(ch, body);
    const coffee = mesh(new THREE.CircleGeometry(r - 0.064, 40), toon(0x5b3a29), { p: [0, Hm * 0.8, 0], r: [-Math.PI / 2, 0, 0], line: false, shadow: false });
    coffee.name = 'mug-coffee'; add(ch, coffee);
    const handle = mesh(new THREE.TorusGeometry(0.25, 0.066, 12, 28, Math.PI), toon(mugCol), { p: [r - 0.03, Hm * 0.5, 0], r: [0, 0, -Math.PI / 2] });
    handle.name = 'mug-handle'; add(ch, handle);
    roundEyes(ch, 0.12, r, 0.7, 0.35);
    ch.update = (dt) => {
      if (ch.steamT <= 0) return;
      ch.steamT -= dt; ch.steamAcc = (ch.steamAcc || 0) + dt;
      if (ch.steamAcc > 0.15) {
        ch.steamAcc = 0;
        _p.set((ch.rng() - 0.5) * 0.16, Hm * 0.8 + 0.04, (ch.rng() - 0.5) * 0.16);
        ch.body.localToWorld(_p);
        spawn('dust', _p, _v.set((ch.rng() - 0.5) * 0.1, 0.55 + ch.rng() * 0.25, 0), 0.07 + ch.rng() * 0.04, 1.0);
      }
    };
    ch.gag = () => { ch.steamT = 1.0; };
  },
});

// 2. Gamepad / controller (cream body, dark face) — front right
const pad = character({
  key: 'pad', x: 1.35, z: 2.65, ry: -0.32, dy: 0.0005, w: 1.4, d: 0.95, h: 0.55, hopV: 3.8, seed: 202,
  build(ch) {
    const bodyM = toon(COL.cream), faceM = toon(COL.dark), btnM = toon(COL.sky), stickM = toon(COL.steel);
    add(ch, mesh(new RoundedBoxGeometry(1.35, 0.32, 0.82, 4, 0.08), bodyM, { p: [0, 0.18, 0] })).name = 'pad-body';
    // grips
    for (const sx of [-1, 1]) {
      add(ch, mesh(new RoundedBoxGeometry(0.38, 0.28, 0.42, 3, 0.06), bodyM, {
        p: [sx * 0.58, 0.12, -0.28], r: [0.35, 0, sx * -0.15],
      })).name = 'pad-grip';
    }
    // dark face plate (small bevel so the top stays a flat sink target)
    add(ch, mesh(new RoundedBoxGeometry(1.05, 0.06, 0.55, 2, 0.01), faceM, { p: [0, 0.34 - 0.012, 0.06] })).name = 'pad-face';
    // sticks — clear of dpad in xz; bases sink into face by >= LIFT
    for (const [sx, sz] of [[-0.22, -0.06], [0.30, -0.14]]) {
      add(ch, mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 16), stickM, { p: [sx, 0.380, sz] })).name = 'pad-stick-base';
      add(ch, mesh(new THREE.SphereGeometry(0.09, 16, 12), stickM, { p: [sx, 0.440, sz] })).name = 'pad-stick';
    }
    // d-pad — short enough to sink into the face without reaching the body top (0.34)
    const dpad = new THREE.Group(); dpad.position.set(-0.42, 0.366, 0.14); dpad.name = 'pad-dpad';
    dpad.add(mesh(new THREE.BoxGeometry(0.22, 0.036, 0.08), toon(COL.dark), { p: [0, 0, 0] }));
    dpad.add(mesh(new THREE.BoxGeometry(0.08, 0.036, 0.22), toon(COL.dark), { p: [0, LIFT, 0] }));
    ch.body.add(dpad);
    const cols = [COL.sky, COL.saffron, COL.aqua, COL.peach];
    [[0.42, 0.22], [0.52, 0.12], [0.32, 0.12], [0.42, 0.02]].forEach(([x, z], i) => {
      add(ch, mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16), toon(cols[i]), { p: [x, 0.368, z] })).name = 'pad-btn';
    });
    // shoulder bumps — further back/up so they don't share a plane with face buttons
    for (const sx of [-1, 1]) {
      add(ch, mesh(new RoundedBoxGeometry(0.28, 0.08, 0.14, 2, 0.03), bodyM, { p: [sx * 0.42, 0.36, 0.44] })).name = 'pad-shoulder';
    }
    flatEyes(ch, 0.11, 0.28, 0.41, 0.34);
  },
});

// 3. Soda can (saffron + steel top) — back centre (clear of arena apron)
const can = character({
  key: 'can', x: 0.05, z: 2.35, ry: 0.05, dy: 0, w: 0.7, d: 0.7, h: 1.15, hopV: 3.5, seed: 303,
  build(ch) {
    const R = 0.32, Hh = 1.05;
    add(ch, mesh(new THREE.CylinderGeometry(R, R, Hh, 40), toon(COL.saffron), { p: [0, Hh / 2, 0] })).name = 'can-body';
    // steel top rim + sunk lid
    add(ch, mesh(new THREE.CylinderGeometry(R + 0.01, R + 0.01, 0.04, 40), toon(COL.steel), { p: [0, Hh - 0.01, 0] })).name = 'can-rim';
    add(ch, mesh(new THREE.CylinderGeometry(R - 0.04, R - 0.04, 0.03, 32), toon(COL.steel), { p: [0, Hh - 0.035, 0] })).name = 'can-lid';
    // tab
    add(ch, mesh(new RoundedBoxGeometry(0.1, 0.02, 0.16, 1, 0.01), toon(COL.steel), { p: [0, Hh + 0.005, 0.04] })).name = 'can-tab';
    // stripe band — proud of body by > LIFT so it clears eps
    add(ch, mesh(new THREE.CylinderGeometry(R + 0.008, R + 0.008, 0.18, 40, 1, true), toon(COL.cream), {
      p: [0, 0.55, 0], line: false, shadow: false,
    })).name = 'can-stripe';
    roundEyes(ch, 0.105, R, 0.72, 0.30);
  },
});
const castBy = { mug, pad, can };

// drop-in entrance offsets (staggered)
const DROP = { mug: 3.6, pad: 4.15, can: 4.7 };

// ---------- arena diorama (GAME layer + full-scene cuts); sits on the mat like gta6's bridge ----------
// Sink whole arena into the mat by LIFT so plinth/apron bottoms aren't coplanar with the mat top.
const arena = new THREE.Group(); arena.name = 'arena'; arena.position.set(0, Y0 - LIFT, -0.2); scene.add(arena);
const arenaMats = [];
function amat(c, o) { const m = toon(c, o); m.userData.base = m.color.clone(); arenaMats.push(m); return m; }
const aadd = (m) => { arena.add(m); return m; };

// base plinth + patterned floor
aadd(mesh(new RoundedBoxGeometry(4.6, 0.28, 3.4, 3, 0.05), amat(COL.base), { p: [0, 0.14, 0] })).name = 'arena-plinth';
// grass-green checker (NOT mint — mint is reserved for the solved tick)
const floorTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#9ccd67'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#80a857';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) x.fillRect(i * 32, j * 32, 32, 32);
  x.strokeStyle = 'rgba(40,50,35,0.28)'; x.lineWidth = 2;
  for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32); x.stroke(); }
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 2.2);
const floorM = amat(0xffffff, { map: floorTex });
const FLOOR_Y = 0.28;
{
  // inset from walls + sunk into plinth so side/bottom faces don't fight
  const fl = mesh(new THREE.BoxGeometry(3.95, 0.08, 2.85), floorM, { p: [0, FLOOR_Y + 0.04 - LIFT, 0] });
  fl.name = 'arena-floor'; aadd(fl);
  const ac = catcher(3.85, 2.75, { p: [0, FLOOR_Y + 0.084 - LIFT, 0] });
  ac.name = 'arena-catcher'; aadd(ac);
}

// warehouse walls with windows (open front for camera)
const wallM = amat(0xc8b89a), trimM = amat(0x8a7a62), winM = amat(COL.window);
{
  // walls sink 2×LIFT so bottoms aren't coplanar with the sunk floor slab
  const wb = mesh(new THREE.BoxGeometry(4.3, 2.2, 0.14), wallM, { p: [0, FLOOR_Y + 1.1 - LIFT * 2, -1.45] }); wb.name = 'arena-wall-back'; aadd(wb);
  const wl = mesh(new THREE.BoxGeometry(0.14, 2.2, 3.0), wallM, { p: [-2.1, FLOOR_Y + 1.1 - LIFT * 2, 0] }); wl.name = 'arena-wall-L'; aadd(wl);
  const wr = mesh(new THREE.BoxGeometry(0.14, 2.2, 3.0), wallM, { p: [2.1, FLOOR_Y + 1.1 - LIFT * 2, 0] }); wr.name = 'arena-wall-R'; aadd(wr);
  // ceiling slab so full-scene cuts never show a void
  // ceiling sunk into wall tops (walls already lowered by 2×LIFT)
  const ceil = mesh(new THREE.BoxGeometry(4.4, 0.12, 3.2), amat(0xd8cfc0), { p: [0, FLOOR_Y + 2.25 - LIFT * 2, 0], shadow: false });
  ceil.name = 'arena-ceiling'; aadd(ceil);
  // apron sunk deeper than plinth so their bottom faces aren't coplanar
  const apron = mesh(new THREE.BoxGeometry(5.2, 0.06, 3.6), amat(0xb09878), { p: [0, 0.03 - LIFT, 0.05], line: false });
  apron.name = 'arena-apron'; aadd(apron);
}
for (const x of [-1.1, 0, 1.1]) {
  const win = decal(new THREE.PlaneGeometry(0.7, 0.55), winM, { p: [x, FLOOR_Y + 1.35 - LIFT * 2, -1.45 + LIFT] });
  win.name = 'arena-window'; aadd(win);
  const frm = mesh(new THREE.BoxGeometry(0.78, 0.62, 0.05), trimM, { p: [x, FLOOR_Y + 1.35 - LIFT * 2, -1.42] });
  frm.name = 'arena-window-frame'; aadd(frm);
}
// sky / haze beyond the open front
{
  const sky = mesh(new THREE.SphereGeometry(9, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x76a2db, side: THREE.BackSide }),
    { p: [0, FLOOR_Y - 0.2, 0], line: false, shadow: false });
  sky.name = 'arena-sky'; aadd(sky);
  // distant toon mountains
  for (const [x, s] of [[-3.5, 1.4], [-1.2, 1.8], [1.5, 1.5], [3.8, 1.6]]) {
    const mtn = mesh(new THREE.ConeGeometry(s * 0.9, s * 1.3, 5, 1, true), amat(0x7a8fa8), {
      p: [x, FLOOR_Y + s * 0.55, -4.2], line: false, shadow: false,
    });
    mtn.name = 'arena-mountain'; aadd(mtn);
  }
}

// crates + cover + barrels + lamp poles (detail the set)
// Crates sink LIFT into floor; barriers sink 2×LIFT so bottoms aren't coplanar with crates.
const crateCols = [0xb8895a, 0x9a7350, 0xc49a6c];
[[-1.4, 0.28, -0.55, 0.55], [1.5, 0.22, -0.3, 0.45], [-1.1, 0.32, 0.85, 0.55],
  [1.15, 0.25, 0.55, 0.48], [0.1, 0.2, -1.0, 0.4], [-1.7, 0.3, 0.15, 0.55],
  [1.85, 0.18, 1.2, 0.4], [-0.55, 0.22, -1.15, 0.38]].forEach(([x, h, z, s], i) => {
  const c = mesh(new RoundedBoxGeometry(s, h * 2, s * 0.9, 2, 0.04), amat(crateCols[i % 3]), {
    p: [x, FLOOR_Y + 0.08 + h - LIFT * 2, z],
  });
  c.name = 'arena-crate'; aadd(c);
});
for (const [x, z, w] of [[-0.35, 0.4, 0.9], [0.9, -0.55, 0.8], [-1.65, -1.05, 0.65]]) {
  const b = mesh(new RoundedBoxGeometry(w, 0.38, 0.2, 2, 0.03), amat(COL.slate), {
    p: [x, FLOOR_Y + 0.08 + 0.19 - LIFT * 3, z],
  });
  b.name = 'arena-barrier'; aadd(b);
}
// barrels
for (const [x, z] of [[-1.85, 1.05], [1.75, -0.95]]) {
  const bar = mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.42, 16), amat(COL.steel), {
    p: [x, FLOOR_Y + 0.29 - LIFT * 2, z],
  });
  bar.name = 'arena-barrel'; aadd(bar);
}
// hanging lamp
{
  const pole = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), amat(COL.dark), { p: [0, FLOOR_Y + 1.9, 0.2], shadow: false });
  pole.name = 'arena-lamp-pole'; aadd(pole);
  const shade = mesh(new THREE.ConeGeometry(0.28, 0.22, 16, 1, true), amat(COL.saffron), { p: [0, FLOOR_Y + 1.55, 0.2], r: [Math.PI, 0, 0] });
  shade.name = 'arena-lamp-shade'; aadd(shade);
}

// player mannequin (prop — no googly eyes) — feet sunk into floor
const player = new THREE.Group(); player.name = 'player-mannequin'; player.position.set(0.25, FLOOR_Y + 0.08 - LIFT, 0.15);
arena.add(player);
const manM = amat(COL.cream), suitM = amat(COL.slate), bootM = amat(COL.dark);
player.add(mesh(new THREE.CapsuleGeometry(0.16, 0.42, 6, 14), suitM, { p: [0, 0.55, 0] })).name = 'man-torso';
player.add(mesh(new THREE.SphereGeometry(0.14, 18, 12), manM, { p: [0, 0.95, 0] })).name = 'man-head';
for (const sx of [-1, 1]) {
  player.add(mesh(new THREE.CapsuleGeometry(0.055, 0.28, 4, 10), suitM, { p: [sx * 0.22, 0.58, 0], r: [0, 0, sx * 0.15] })).name = 'man-arm';
  player.add(mesh(new THREE.CapsuleGeometry(0.06, 0.26, 4, 10), bootM, { p: [sx * 0.08, 0.2, 0] })).name = 'man-leg';
}

// gun prop — clear of crates so the grip doesn't sit coplanar on a crate top
const gunG = new THREE.Group(); gunG.name = 'gun'; gunG.position.set(-0.35, FLOOR_Y + 0.7, 1.1); gunG.rotation.y = 0.35;
arena.add(gunG);
gunG.add(mesh(new RoundedBoxGeometry(0.12, 0.14, 0.36, 2, 0.025), amat(COL.dark), { p: [0, 0, 0] })).name = 'gun-body';
gunG.add(mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.32, 12).rotateX(Math.PI / 2), amat(COL.steel), { p: [0, 0.03, -0.3] })).name = 'gun-barrel';
gunG.add(mesh(new RoundedBoxGeometry(0.07, 0.18, 0.1, 1, 0.015), amat(COL.dark), { p: [0, -0.12, 0.06] })).name = 'gun-grip';

// toy bullets (NAIVE beat)
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.045, 10, 8);
const bulletM = toon(COL.saffron);
for (let i = 0; i < 6; i++) {
  const b = mesh(bulletGeo, bulletM, { shadow: false });
  b.name = 'toy-bullet'; b.visible = false; arena.add(b); bullets.push(b);
}

// blood splat props (non-gory) — FIX2
const bloodG = new THREE.Group(); bloodG.name = 'blood-marks'; bloodG.visible = false; bloodG.position.copy(player.position); arena.add(bloodG);
const bloodM = toon(COL.red);
[[0.06, 0.75, 0.2], [-0.1, 0.6, 0.18], [0.14, 0.5, 0.16], [0.0, 0.88, 0.12]].forEach(([x, y, z], i) => {
  const s = mesh(new THREE.SphereGeometry(0.05 + i * 0.012, 10, 8), bloodM, {
    p: [x, y, z], s: [1.4, 0.35, 1.1], line: false, shadow: false,
  });
  s.name = 'blood-splat'; bloodG.add(s);
});

// chunky red 3D arrow — FIX2
const arrowG = new THREE.Group(); arrowG.name = 'shot-arrow'; arrowG.visible = false; arena.add(arrowG);
{
  const s = new THREE.Shape();
  s.moveTo(-0.08, 0.45); s.lineTo(0.08, 0.45); s.lineTo(0.08, 0.18); s.lineTo(0.2, 0.18);
  s.lineTo(0, 0); s.lineTo(-0.2, 0.18); s.lineTo(-0.08, 0.18); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  g.translate(0, 0, -0.04);
  const am = toon(COL.red); am.userData.base = am.color.clone();
  arrowG.add(mesh(g, am));
  arrowG.position.set(0.55, FLOOR_Y + 1.25, 1.15);
  arrowG.rotation.set(-1.1, 0.3, 0.4);
  arrowG.scale.setScalar(1.6);
  arrowG.userData.mat = am;
}

// x-ray translucent walls — FIX1 (inset inside arena walls by > LIFT; sunk into floor)
const xrayG = new THREE.Group(); xrayG.name = 'xray'; xrayG.visible = false; arena.add(xrayG);
const xrayWallM = new THREE.MeshBasicMaterial({ color: 0xa8d4f0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
for (const [x, z, w, d] of [[0, -1.34, 3.9, 0.06], [-1.98, 0, 0.06, 2.7], [1.98, 0, 0.06, 2.7]]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.0, d), xrayWallM);
  m.position.set(x, FLOOR_Y + 1.0 - LIFT * 2, z); m.name = 'xray-wall'; m.castShadow = false; xrayG.add(m);
}

// lime raycast line (rod + ball ends) from gun to player
const rayG = new THREE.Group(); rayG.name = 'raycast-line'; rayG.visible = false; arena.add(rayG);
const rayMat = toon(COL.lime); rayMat.userData.base = rayMat.color.clone();
const rayRod = mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 10), rayMat, { shadow: false });
rayRod.name = 'ray-rod'; rayG.add(rayRod);
const rayBallGeo = new THREE.SphereGeometry(0.055, 14, 10);
const rayBallA = mesh(rayBallGeo, rayMat, { shadow: false }); rayBallA.name = 'ray-ball-a'; rayG.add(rayBallA);
const rayBallB = mesh(rayBallGeo, rayMat, { shadow: false }); rayBallB.name = 'ray-ball-b'; rayG.add(rayBallB);
function poseRay(from, to) {
  const mid = _p.copy(from).add(to).multiplyScalar(0.5);
  const len = from.distanceTo(to);
  rayRod.position.copy(mid);
  rayRod.scale.set(1, Math.max(0.01, len), 1);
  rayRod.quaternion.setFromUnitVectors(V3(0, 1, 0), _v.subVectors(to, from).normalize());
  rayBallA.position.copy(from); rayBallB.position.copy(to);
}

// hit box around player body
const hitBoxG = new THREE.Group(); hitBoxG.name = 'hitbox'; hitBoxG.visible = false; hitBoxG.position.copy(player.position);
arena.add(hitBoxG);
const hitBoxGeo = new THREE.BoxGeometry(0.5, 1.1, 0.35).translate(0, 0.55 + LIFT, 0);
const hitFillM = new THREE.MeshBasicMaterial({ color: 0xa8e0f8, transparent: true, opacity: 0.18, depthWrite: false });
const hitFill = new THREE.Mesh(hitBoxGeo, hitFillM); hitFill.name = 'hitbox-fill'; hitFill.castShadow = false; hitBoxG.add(hitFill);
const hitHull = new THREE.Mesh(hullGeometry(hitBoxGeo), new THREE.MeshBasicMaterial({ color: COL.lime, side: THREE.BackSide }));
hitHull.name = 'hitbox-outline'; hitHull.userData.outline = true; hitHull.scale.setScalar(1.03); hitBoxG.add(hitHull);
const hitWire = new THREE.LineSegments(
  new THREE.EdgesGeometry(hitBoxGeo),
  new THREE.LineBasicMaterial({ color: COL.lime, transparent: true, opacity: 0.85 }),
);
hitWire.name = 'hitbox-wire'; hitBoxG.add(hitWire);
hitBoxG.userData = { fill: hitFillM, hull: hitHull.material, wire: hitWire.material };

inGame(arena);

// ---------- sound set (FIX3) — left of desk, clear of arena apron ----------
// clear of arena apron/plinth in xz so bottoms can sit ON_MAT without fighting them
const soundSet = new THREE.Group(); soundSet.name = 'sound-set'; soundSet.position.set(-3.8, Y0, 2.5); scene.add(soundSet);
function pmat(c, o) { const m = toon(c, o); m.userData.base = m.color.clone(); return m; }
const labelMat = (tex) => {
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
  m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4; return m;
};

// ON_MAT: sink LIFT into mat top (bottom at Y0-LIFT ≈ 0.015, clear of mat underside at 0.005)
{
  const plat = mesh(new RoundedBoxGeometry(2.0, 0.12, 1.4, 2, 0.04), pmat(COL.desk), { p: [0, 0.06 - LIFT, 0] });
  plat.name = 'sound-platform'; soundSet.add(plat);
  const sc = catcher(1.85, 1.25, { p: [0, 0.125 - LIFT, 0] });
  sc.name = 'sound-catcher'; soundSet.add(sc);
}
const PLAT_TOP = 0.12 - LIFT;

// speaker / amp — cab sunk into platform by >= LIFT
const speaker = new THREE.Group(); speaker.name = 'speaker'; speaker.position.set(-0.7, PLAT_TOP, 0.1); soundSet.add(speaker);
{
  const cab = mesh(new RoundedBoxGeometry(0.7, 0.95, 0.55, 2, 0.05), pmat(COL.dark), { p: [0, 0.475 - LIFT, 0] });
  cab.name = 'speaker-cab'; speaker.add(cab);
  const cone = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24).rotateX(Math.PI / 2), pmat(COL.steel), { p: [0, 0.55, 0.28] });
  cone.name = 'speaker-cone'; speaker.add(cone);
  const cap = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16).rotateX(Math.PI / 2), pmat(COL.cream), { p: [0, 0.55, 0.32 + LIFT] });
  cap.name = 'speaker-dustcap'; speaker.add(cap);
}

// waveform bars (data blue)
const waveG = new THREE.Group(); waveG.name = 'waveform'; waveG.position.set(0.55, PLAT_TOP, -0.25); soundSet.add(waveG);
{
  const panel = mesh(new RoundedBoxGeometry(1.1, 0.5, 0.12, 2, 0.03), pmat(COL.white), { p: [0, 0.25 - LIFT, 0] });
  panel.name = 'wave-panel'; waveG.add(panel);
}
const waveBars = [];
const waveMat = pmat(COL.data);
for (let i = 0; i < 8; i++) {
  const b = mesh(new RoundedBoxGeometry(0.08, 0.35, 0.06, 1, 0.015), waveMat, {
    p: [-0.38 + i * 0.11, 0.28, 0.07],
  });
  b.name = 'wave-bar'; waveG.add(b); waveBars.push(b);
}

// health bar
const healthG = new THREE.Group(); healthG.name = 'health-bar'; healthG.position.set(0.55, PLAT_TOP, 0.5); soundSet.add(healthG);
{
  const hf = mesh(new RoundedBoxGeometry(1.15, 0.28, 0.1, 2, 0.03), pmat(COL.dark), { p: [0, 0.14 - LIFT, 0] });
  hf.name = 'health-frame'; healthG.add(hf);
}
const healthFillM = pmat(COL.sky); healthFillM.userData.base = healthFillM.color.clone();
const healthFill = mesh(new RoundedBoxGeometry(1.02, 0.16, 0.06, 1, 0.02), healthFillM, { p: [0, 0.14, 0.04] });
healthFill.name = 'health-fill'; healthG.add(healthFill);
const hpTex = canvasTex(256, 64, (x, w, h) => {
  x.fillStyle = hex(COL.ink); x.font = '800 36px Caption'; x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillText('HP', 12, h / 2 + 2);
});
healthG.add(decal(new THREE.PlaneGeometry(0.28, 0.14), labelMat(hpTex), { p: [-0.55, 0.36, 0.06] }));

// heartbeat circle
const heartG = new THREE.Group(); heartG.name = 'heartbeat'; heartG.position.set(-0.55, 0.7, -0.35); soundSet.add(heartG);
const heartRingM = pmat(COL.peach); heartRingM.userData.base = heartRingM.color.clone();
const heartRing = mesh(new THREE.TorusGeometry(0.28, 0.055, 10, 28), heartRingM, { p: [0, 0, 0] });
heartRing.name = 'heart-ring'; heartG.add(heartRing);
const heartCore = mesh(new THREE.SphereGeometry(0.12, 16, 12), pmat(COL.peach), { p: [0, 0, 0] });
heartCore.name = 'heart-core'; heartG.add(heartCore);

// thud impact plate — clear of waveform/health in z; plate sunk into base; base sunk extra vs health
const thudG = new THREE.Group(); thudG.name = 'thud'; thudG.position.set(-0.05, PLAT_TOP, 0.15); soundSet.add(thudG);
{
  const base = mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.12, 28), pmat(COL.slate), { p: [0, 0.06 - LIFT * 2, 0] });
  base.name = 'thud-base'; thudG.add(base);
}
const thudPlateM = pmat(COL.cream); thudPlateM.userData.base = thudPlateM.color.clone();
const thudPlate = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 28), thudPlateM, { p: [0, 0.14 - LIFT * 3, 0] });
thudPlate.name = 'thud-plate'; thudG.add(thudPlate);

soundSet.visible = false;

// ---------- respawn button (KICKER) ----------
const BTN = V3(0.1, Y0, 3.5);
const btnG = new THREE.Group(); btnG.name = 'respawn-btn'; btnG.position.copy(BTN); scene.add(btnG);
const plungerM = pmat(COL.sky); plungerM.userData.base = plungerM.color.clone();
const plunger = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 40), plungerM, { p: [0, 0.3, 0] });
plunger.name = 'respawn-plunger';
{
  btnG.add(mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.22, 40), pmat(COL.dark), { p: [0, 0.1, 0] })).name = 'respawn-base';
  btnG.add(plunger);
  const sign = mesh(new RoundedBoxGeometry(1.35, 0.42, 0.06, 2, 0.03), pmat(COL.white), { p: [0, 0.16, 0.72], r: [-0.55, 0, 0] });
  sign.name = 'respawn-sign';
  btnG.add(sign);
  const tex = canvasTex(640, 200, (x, w, h) => {
    x.fillStyle = hex(COL.ink); x.font = '800 92px Caption'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('RESPAWN', w / 2, h / 2 + 4);
  });
  sign.add(decal(new THREE.PlaneGeometry(1.22, 0.36), labelMat(tex), { p: [0, 0, 0.03 + LIFT] }));
}
// red X cross-out for "no respawn"
const crossG = new THREE.Group(); crossG.name = 'respawn-cross'; crossG.visible = false; btnG.add(crossG);
{
  const xm = pmat(COL.red);
  crossG.add(mesh(new RoundedBoxGeometry(1.8, 0.14, 0.14, 1, 0.04), xm, { p: [0, 0.5, 0.95], r: [0.15, 0, 0.55] }));
  crossG.add(mesh(new RoundedBoxGeometry(1.8, 0.14, 0.14, 1, 0.04), xm, { p: [0, 0.5, 0.95], r: [0.15, 0, -0.55] }));
}
btnG.visible = false;

// fog for muffled beat
scene.fog = null;
const fogCol = new THREE.Color(0xb0b8c0);
const XRAY_DIM = new THREE.Color(0xb0c8d8);

// ---------- look / act tables ----------
const LOOKS = [
  [-1e9, 90, 'all', 'cam'],
  [90, 160, 'all', 'monitor'],
  [160, 225, 'all', 'monitor'],
  [225, 310, 'all', 'monitor'], [240, 310, 'mug', 'pad'], [240, 310, 'can', 'mug'],
  [310, 575, 'all', 'player'],
  [385, 450, 'all', 'ray'],
  [449, 575, 'all', 'hitbox'],
  [575, 860, 'all', 'player'],
  [802, 860, 'all', 'arrow'],
  [860, 1110, 'all', 'sound'],
  [913, 970, 'all', 'thud'],
  [1022, 1055, 'all', 'health'],
  [1054, 1090, 'all', 'heart'],
  [1110, 1195, 'all', 'monitor'],
  [1195, 1e9, 'all', 'button'],
];
function targetPos(name, ch, st, out) {
  switch (name) {
    case 'cam': return out.copy(camera.position);
    case 'monitor': return out.copy(screenCenter);
    case 'mug': case 'pad': case 'can': return headPos(castBy[name], out);
    case 'player': return player.getWorldPosition(out).add(_v.set(0, 1.2, 0));
    case 'ray': return rayBallB.getWorldPosition(out);
    case 'hitbox': return hitBoxG.getWorldPosition(out).add(_v.set(0, 1.0, 0));
    case 'arrow': return arrowG.getWorldPosition(out);
    case 'sound': return soundSet.localToWorld(out.set(0, 0.6, 0));
    case 'thud': return thudG.getWorldPosition(out).add(_v.set(0, 0.3, 0));
    case 'health': return healthG.getWorldPosition(out).add(_v.set(0, 0.3, 0));
    case 'heart': return heartG.getWorldPosition(out);
    case 'button': return out.set(BTN.x, Y0 + 0.45, BTN.z);
    case 'gun': return gunG.getWorldPosition(out);
  }
  return out.copy(camera.position);
}
function lookTarget(ch, fr, st, out) {
  let name = 'cam';
  for (const [a, b, who, tgt] of LOOKS) if (fr >= a && fr < b && (who === 'all' || who === ch.key)) name = tgt;
  return targetPos(name, ch, st, out);
}
const ACTS = [
  [18, 'mug', 'land'], [22, 'pad', 'land'], [26, 'can', 'land'],
  [95, 'all', 'surprise'], [100, 'mug', 'hop'],
  [165, 'all', 'tilt'], [170, 'pad', 'shake'],
  [235, 'all', 'surprise'], [250, 'mug', 'hop'], [260, 'can', 'tilt'], [270, 'pad', 'lean'],
  [320, 'all', 'surprise'], [390, 'mug', 'tilt'], [455, 'all', 'surprise'], [555, 'all', 'hop'],
  [590, 'all', 'surprise'], [650, 'pad', 'shake'], [685, 'all', 'tilt'], [725, 'mug', 'surprise'],
  [810, 'all', 'surprise'],
  [875, 'all', 'hop'], [920, 'pad', 'shake'], [980, 'mug', 'gag'], [1030, 'all', 'tilt'],
  [1060, 'can', 'shake'], [1120, 'all', 'surprise'], [1205, 'all', 'hop'],
];
function act(ch, a) {
  const s = ch.st;
  if (a === 'surprise') { hop(ch, ch.hopV * 0.75); s.vtilt -= 2.4; }
  else if (a === 'hop') hop(ch, ch.hopV);
  else if (a === 'tilt') s.vtilt -= 2.4;
  else if (a === 'lean') s.vlean += 0.8;
  else if (a === 'squash') s.vsq -= 3.2;
  else if (a === 'shake') s.shake = 0.9;
  else if (a === 'land') landFx(ch, 2.4);
  else if (a === 'gag' && ch.gag) ch.gag();
}
const EVENTS = new Map();
const on = (f, fn) => { const k = Math.round(f); if (!EVENTS.has(k)) EVENTS.set(k, []); EVENTS.get(k).push(fn); };
for (const [f, who, a] of ACTS) on(f, () => { for (const ch of cast) if (who === 'all' || who === ch.key) act(ch, a); });
on(18, () => dustRing(V3(-1.35, Y0, 2.7), 8, 0.4, 0.3, 0.9, 0.07));
on(22, () => dustRing(V3(1.35, Y0, 2.65), 8, 0.45, 0.3, 0.9, 0.07));
on(26, () => dustRing(V3(0.05, Y0, 2.35), 7, 0.3, 0.25, 0.8, 0.06));
on(875, () => dustRing(soundSet.position, 10, 0.6, 0.5, 1.0, 0.08));
on(1200, () => dustRing(BTN, 10, 0.5, 0.5, 1.1, 0.09));

// ---------- camera rail (scene-time keys) ----------
// Arena sits on the desk at (0, Y0, -0.2). Full-scene arena cuts hide the room and frame the diorama.
// Target y ≈ FLOOR_Y+0.9 ≈ 1.2 in arena-local ≈ 1.22 world.
const AY = Y0 + FLOOR_Y + 0.85; // ~1.15
const CAM = [
  // HOOK f1-75: desk wide → medium (cast + monitor)
  [0, [0.4, 5.8, 10.5], [0, 1.2, 0.4]],
  [40, [-0.2, 4.2, 8.6], [-0.6, 1.6, -0.4]],
  [75, [-1.2, 3.6, 7.4], [-2.4, 1.9, -1.8]],
  // NAIVE f92: HARD CUT into the toon arena (full frame)
  [92, [2.2, AY + 1.4, 3.6], [0.2, AY, 0.1]],
  [120, [1.6, AY + 1.1, 3.0], [0.2, AY + 0.05, 0.15]],
  [147, [0.9, AY + 0.9, 2.6], [0.25, AY, 0.15]],
  // PROBLEM f162: closer on player + screen-surface red (overlay + glass)
  [162, [0.4, AY + 0.75, 2.2], [0.25, AY + 0.05, 0.15]],
  [190, [0.6, AY + 0.85, 2.4], [0.25, AY, 0.2]],
  [211, [1.2, AY + 1.1, 2.8], [0.2, AY, 0.1]],
  // TURN f228: pull back to desk; cast lean
  [228, [0.5, 5.0, 9.2], [0, 1.1, 1.0]],
  [260, [0.9, 3.8, 8.0], [0.3, 0.9, 2.0]],
  [298, [0.4, 3.5, 7.6], [0, 0.8, 2.1]],
  // FIX1 f313: x-ray arena
  [313, [2.0, AY + 1.3, 3.5], [0.15, AY, 0.0]],
  [360, [1.5, AY + 1.0, 2.9], [0.1, AY + 0.05, 0.05]],
  [385, [0.3, AY + 0.6, 2.5], [-0.3, AY - 0.05, 0.45]],
  [430, [0.6, AY + 0.65, 2.2], [0.05, AY - 0.05, 0.25]],
  [449, [1.2, AY + 0.8, 2.4], [0.25, AY - 0.05, 0.15]],
  [500, [1.6, AY + 1.1, 2.9], [0.25, AY, 0.05]],
  [553, [1.0, AY + 0.75, 2.3], [0.25, AY - 0.05, 0.1]],
  [565, [1.2, AY + 0.9, 2.5], [0.25, AY, 0.08]],
  // FIX2 f577: feedback — closer arena POV
  [577, [0.2, AY + 0.45, 1.95], [0.25, AY + 0.05, 0.15]],
  [645, [0.25, AY + 0.4, 1.85], [0.25, AY + 0.1, 0.15]],
  [678, [0.1, AY + 0.35, 1.8], [0.25, AY + 0.05, 0.18]],
  [721, [0.3, AY + 0.45, 1.95], [0.2, AY, 0.2]],
  [802, [1.4, AY + 0.85, 2.4], [0.7, AY + 0.25, 0.55]],
  [857, [0.9, AY + 0.65, 2.2], [0.5, AY + 0.15, 0.4]],
  // FIX3 f867: sound set at (-3.8, Y0, 2.5) — medium → close on devices
  [867, [-3.2, 2.8, 5.8], [-3.8, 0.65, 2.5]],
  [913, [-3.0, 1.9, 4.6], [-3.8, 0.45, 2.5]],
  [972, [-2.8, 2.0, 4.4], [-3.5, 0.55, 2.4]],
  [1022, [-2.6, 1.7, 4.1], [-3.3, 0.4, 2.85]],
  [1054, [-4.2, 2.0, 4.3], [-4.3, 0.85, 2.2]],
  [1089, [-3.4, 2.4, 5.1], [-3.8, 0.65, 2.5]],
  [1101, [-3.2, 2.7, 5.6], [-3.8, 0.7, 2.5]],
  // RECAP f1113: desk + arena combo
  [1113, [0.5, 5.4, 9.8], [0, 1.2, 0.4]],
  [1150, [-0.6, 4.0, 8.2], [-1.6, 1.6, -1.0]],
  [1186, [0.2, 4.6, 9.0], [0, 1.0, 0.8]],
  // KICKER f1197: respawn button
  [1197, [1.5, 2.6, 6.4], [0.15, 0.55, 3.45]],
  [1237, [1.0, 2.1, 5.5], [0.1, 0.5, 3.5]],
  [1260, [0.5, 5.8, 10.5], [0, 1.2, 0.4]],
].map(([f, p, t]) => ({ s: sOf(f), p: V3(...p), t: V3(...t) }));

const _m0 = new THREE.Vector3(), _m1 = new THREE.Vector3();
function tangent(keys, i, prop, out) {
  if (i === 0 || i === keys.length - 1) return out.set(0, 0, 0);
  return out.subVectors(keys[i + 1][prop], keys[i - 1][prop]).divideScalar(keys[i + 1].s - keys[i - 1].s);
}
function splineAt(keys, s, prop, out) {
  const n = keys.length;
  if (s <= keys[0].s) return out.copy(keys[0][prop]);
  if (s >= keys[n - 1].s) return out.copy(keys[n - 1][prop]);
  let i = 0; while (s > keys[i + 1].s) i++;
  const a = keys[i], b = keys[i + 1], h = b.s - a.s, u = (s - a.s) / h, u2 = u * u, u3 = u2 * u;
  tangent(keys, i, prop, _m0); tangent(keys, i + 1, prop, _m1);
  return out.copy(a[prop]).multiplyScalar(2 * u3 - 3 * u2 + 1)
    .addScaledVector(_m0, h * (u3 - 2 * u2 + u))
    .addScaledVector(b[prop], -2 * u3 + 3 * u2)
    .addScaledVector(_m1, h * (u3 - u2));
}

// hard-cut beat starts: jump rail segment without blending across the cut
const HARD_CUTS = new Set([92, 162, 228, 313, 577, 867, 1113, 1197]);
// full-frame arena: hide workshop room so the diorama fills the shot
const arenaCut = (f) => (f >= 92 && f < 228) || (f >= 313 && f < 867);

// gameplay camera orbit around arena diorama
const GR = 3.4, GH = 2.0;
const gameAngle = (s) => 0.55 + s * 0.007 + 0.22 * Math.sin(s * 0.03);

// gun / player world anchors for ray
const _gunTip = new THREE.Vector3(), _hitCtr = new THREE.Vector3();

// ---------- overlay state driven from pose ----------
let ovlDamage = 0, ovlBlood = 0, ovlShake = [0, 0];

// ---------- pose: pure function of (frame, scene time) ----------
function poseWorld(f, s) {
  // camera
  splineAt(CAM, s, 'p', camera.position);
  splineAt(CAM, s, 't', _camT);
  // hard cuts: snap to the key at the cut frame
  for (const cut of HARD_CUTS) {
    if (f >= cut && f < cut + 2) {
      const k = CAM.find((c) => Math.abs(c.s - sOf(cut)) < 0.5);
      if (k) { camera.position.copy(k.p); _camT.copy(k.t); }
    }
  }
  camera.lookAt(_camT);

  // set visibility by beat: hide desk room/cast during full-frame arena cuts;
  // during the sound beat, park the cast so the toy devices read as the hero
  const inArenaCut = arenaCut(f);
  const inSound = f >= 867 && f < 1113;
  if (roomRoot) roomRoot.visible = !inArenaCut;
  for (const ch of cast) ch.root.visible = !inArenaCut && !inSound;

  soundSet.visible = (f >= 860 && f < 1115);
  if (soundSet.visible) {
    let sc = 0;
    if (f >= 860 && f < 867) sc = popScale(f - 860);
    else if (f >= 867 && f < 1100) sc = 1;
    else if (f >= 1100) sc = popOut(f - 1100);
    soundSet.scale.setScalar(Math.max(sc, 1e-3));
  }

  btnG.visible = f >= 1190;
  const bs = f < 1197 ? popScale(f - 1190) : popInOut(f, 1197, 1260);
  if (btnG.visible) btnG.scale.setScalar(Math.max(bs, 1e-3));

  // cast drop-in (HOOK)
  for (const ch of cast) {
    const dropH = DROP[ch.key] || 3.6;
    const stagger = { mug: 0, pad: 4, can: 8 }[ch.key] || 0;
    if (f < 8 + stagger) {
      ch.root.position.y = CH_Y + ch.dy + dropH;
    } else if (f < 28 + stagger) {
      const kk = clamp((f - 8 - stagger) / 16, 0, 1);
      ch.root.position.y = CH_Y + ch.dy + dropH * (1 - easeIn(kk));
    } else {
      ch.root.position.y = CH_Y + ch.dy;
    }
  }

  // monitor glass tint (PROBLEM) — only when the desk room is visible
  const tintA = (!inArenaCut ? lin(162, 175, f) * (1 - lin(220, 235, f)) * 0.55 : 0);
  // during full-frame PROBLEM (arena cut), drive the same red via overlays damage
  glassTint.material.opacity = tintA;
  glassTint.visible = tintA > 0.01;
  if (f >= 162 && f < 220 && inArenaCut) {
    ovlDamage = Math.max(ovlDamage, sstep(162, 175, f) * (1 - lin(200, 220, f)) * 0.7);
  }

  // x-ray mode
  const xrayOn = f >= 313 && f < 577;
  xrayG.visible = xrayOn;
  // dim ordinary arena walls slightly in x-ray
  for (const m of arenaMats) {
    m.color.copy(m.userData.base);
    if (xrayOn) m.color.lerp(XRAY_DIM, 0.35);
  }

  // raycast line (~f385) — poses in arena-local space
  const rayVis = popInOut(f, 385, 565);
  rayG.visible = rayVis > 1e-3;
  if (rayG.visible) {
    rayG.scale.setScalar(Math.max(rayVis, 1e-3));
    gunG.localToWorld(_gunTip.set(0, 0.04, -0.55));
    arena.worldToLocal(_gunTip);
    _hitCtr.set(player.position.x, player.position.y + 0.55, player.position.z);
    poseRay(_gunTip, _hitCtr);
    rayMat.color.copy(rayMat.userData.base).lerp(LIME, 0.3 + 0.7 * flashK(f, 385, 20));
  }

  // hit box (~f449); lime flash at f553 "hit box"
  const hbVis = popInOut(f, 449, 570);
  hitBoxG.visible = hbVis > 1e-3;
  if (hitBoxG.visible) {
    hitBoxG.scale.setScalar(Math.max(hbVis, 1e-3));
    const flash = flashK(f, 553, 16);
    hitFillM.opacity = 0.15 + 0.45 * flash;
    hitFillM.color.set(flash > 0.2 ? COL.lime : 0xa8e0f8);
    hitHull.material.color.copy(LIME);
    hitWire.material.opacity = 0.5 + 0.5 * flash;
    hitWire.material.color.copy(LIME);
    // pulse scale on flash
    if (flash > 0) hitBoxG.scale.multiplyScalar(1 + 0.08 * flash);
  }

  // FIX2 feedback
  const shakeAmt = f >= 645 && f < 860 ? (0.04 + 0.06 * lin(645, 670, f)) * (1 - lin(840, 860, f)) : 0;
  if (shakeAmt > 0) {
    const sx = Math.sin(f * 1.7) * shakeAmt * 18;
    const sy = Math.cos(f * 2.1) * shakeAmt * 14;
    ovlShake = [sx, sy];
    camera.position.x += Math.sin(f * 1.7) * shakeAmt;
    camera.position.y += Math.cos(f * 2.1) * shakeAmt * 0.7;
  } else ovlShake = [0, 0];

  ovlDamage = f >= 678 && f < 860 ? sstep(678, 700, f) * (1 - lin(840, 860, f)) : 0;
  ovlBlood = f >= 721 && f < 860 ? sstep(721, 745, f) * (1 - lin(840, 860, f)) : 0;
  bloodG.visible = ovlBlood > 0.05;
  if (bloodG.visible) bloodG.scale.setScalar(0.5 + 0.5 * ovlBlood);

  // red arrow pops f802
  const ar = popInOut(f, 802, 855);
  arrowG.visible = ar > 1e-3;
  if (arrowG.visible) {
    arrowG.scale.setScalar(Math.max(ar, 1e-3) * 1.6);
    arrowG.position.x = 0.55 + 0.03 * Math.sin(f * 0.4);
    if (arrowG.userData.mat) arrowG.userData.mat.color.copy(RED).lerp(LIME, flashK(f, 805, 12) * 0.15);
  }

  // toy bullets during NAIVE (monitor gameplay)
  const shoot = f >= 100 && f < 210;
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    if (!shoot) { b.visible = false; continue; }
    const t0 = 105 + i * 14;
    const u = (f - t0) / 18;
    if (u < 0 || u > 1) { b.visible = false; continue; }
    b.visible = true;
    // from gun toward player
    b.position.set(
      lerp(-1.0, 0.2, u) + (i % 2) * 0.05,
      lerp(FLOOR_Y + 0.75, FLOOR_Y + 0.7, u) + Math.sin(u * Math.PI) * 0.1,
      lerp(0.9, 0.2, u),
    );
    b.scale.setScalar(1 - 0.3 * u);
  }

  // muzzle flash on gun during shots
  gunG.scale.setScalar(1 + (shoot && ((f % 14) < 3) ? 0.08 : 0));

  // sound set anims
  if (soundSet.visible && soundSet.scale.x > 0.2) {
    // waveform
    for (let i = 0; i < waveBars.length; i++) {
      const h = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(s * 0.35 + i * 0.9 + (f >= 913 ? f * 0.15 : 0)));
      waveBars[i].scale.y = h;
      waveBars[i].position.y = 0.14 + h * 0.175;
    }
    waveMat.color.copy(DATA_C).lerp(LIME, flashK(f, 913, 14));

    // thud
    const thudK = flashK(f, 913, 10) + flashK(f, 940, 8) + flashK(f, 968, 8);
    thudPlate.scale.setScalar(1 + 0.25 * thudK);
    thudPlateM.color.copy(thudPlateM.userData.base).lerp(LIME, thudK);

    // health drop f1022
    const hp = f < 1022 ? 1 : clamp(1 - lin(1022, 1050, f) * 0.85, 0.12, 1);
    healthFill.scale.x = Math.max(hp, 0.08);
    healthFill.position.x = -0.51 * (1 - hp);
    healthFillM.color.copy(healthFillM.userData.base).lerp(RED, hp < 0.4 ? 1 : 0);

    // heartbeat f1054
    const hb = f >= 1054 && f < 1110;
    const pulse = hb ? 1 + 0.35 * Math.abs(Math.sin((f - 1054) * 0.45)) : 1;
    heartG.scale.setScalar(pulse * (hb ? popInOut(f, 1054, 1105) : 0.001));
    heartG.visible = hb;
    if (hb) heartRingM.color.copy(heartRingM.userData.base).lerp(LIME, flashK(f, 1054, 16));

    // muffled: desat + fog f1089
    if (f >= 1089 && f < 1113) {
      const mk = lin(1089, 1105, f);
      scene.fog = new THREE.Fog(fogCol, lerp(18, 6, mk), lerp(40, 14, mk));
      amb.intensity = Math.PI * lerp(0.45, 0.28, mk);
    } else {
      scene.fog = null;
      amb.intensity = Math.PI * 0.45;
    }
  } else {
    scene.fog = null;
    amb.intensity = Math.PI * 0.45;
    heartG.visible = false;
  }

  // RECAP: signal parts flash lime briefly
  if (f >= 1113 && f < 1186) {
    const fk = Math.max(flashK(f, 1124, 14), flashK(f, 1145, 12));
    rayMat.color.copy(rayMat.userData.base).lerp(LIME, fk);
    if (fk > 0.1) {
      rayG.visible = true; rayG.scale.setScalar(0.7 + 0.3 * fk);
      gunG.localToWorld(_gunTip.set(0, 0.04, -0.55));
      arena.worldToLocal(_gunTip);
      _hitCtr.set(player.position.x, player.position.y + 0.55, player.position.z);
      poseRay(_gunTip, _hitCtr);
      hitBoxG.visible = true; hitBoxG.scale.setScalar(0.7 + 0.3 * fk);
      arrowG.visible = true; arrowG.scale.setScalar(0.6 + 0.4 * fk);
    }
  }

  // KICKER: cross-out during FREEZE "no respawn"
  const crossOn = f >= FZ0 && f < 1260;
  crossG.visible = crossOn;
  if (crossOn) {
    const ck = f < FZ1 ? popScale(f - FZ0) : popOut(f - 1255);
    crossG.scale.setScalar(Math.max(ck, 1e-3));
  }
  plungerM.color.copy(plungerM.userData.base).lerp(RED, f >= FZ0 ? 0.55 : flashK(f, 1205, 12) * 0.3);
  plunger.position.y = 0.3 - 0.06 * (f >= FZ0 ? 1 : 0);

  // cast lean-in during TURN
  if (f >= 240 && f < 300) {
    const lean = 0.08 * easeInOut(lin(240, 270, f));
    mug.root.rotation.z = lean;
    pad.root.rotation.z = -lean;
    can.root.rotation.z = lean * 0.5;
  } else {
    mug.root.rotation.z = 0; pad.root.rotation.z = 0; can.root.rotation.z = 0;
  }
}

// ---------- simulation (replay-to-seek) ----------
let simFrame = null;
function resetSim() {
  prng = mulberry32(31337); spawnN = 0;
  for (const p of parts) { p.alive = false; p.mesh.visible = false; }
  for (const ch of cast) resetChar(ch);
  ovlDamage = 0; ovlBlood = 0; ovlShake = [0, 0];
  simFrame = -PRE;
  poseWorld(-PRE, -PRE);
  scene.updateMatrixWorld();
}
function stepFrame(f) {
  if (f > FZ0 && f < FZ1) return;
  const s = sOf(f), off = f - s;
  for (const ev of EVENTS.get(f) || []) ev();
  for (let i = 1; i <= SUB; i++) {
    const st = s - 1 + i / SUB, fr = st + off;
    simT = st / FPS;
    poseWorld(fr, st);
    scene.updateMatrixWorld();
    for (const ch of cast) { lookTarget(ch, fr, st, ch.lookW); updateChar(ch, DT); }
    scene.updateMatrixWorld();
    for (const ch of cast) for (const e of ch.eyes) updateEye(e, ch.lookW, DT, simT);
    updateParticles(DT);
  }
}
function seek(n) {
  if (simFrame === null || n < simFrame) resetSim();
  while (simFrame < n) stepFrame(++simFrame);
}

// ---------- render ----------
function renderGame(s, f) {
  const a = gameAngle(s);
  // during FIX cuts the gameCam can sit closer; otherwise orbit
  // gameCam is in world space; arena sits at (0, Y0, -0.2)
  const ax = arena.position.x, ay = arena.position.y + FLOOR_Y + 0.7, az = arena.position.z;
  const rad = (f >= 313 && f < 867) ? 2.4 : GR;
  const elev = (f >= 313 && f < 867) ? 1.55 : GH;
  gameCam.position.set(ax + Math.sin(a) * rad, elev, az + Math.cos(a) * rad);
  gameCam.lookAt(ax + 0.15, ay, az + 0.1);
  outlineU.uRes.value.set(RT_W, RT_H); outlineU.uWidth.value = 1.6; hatchU.uPeriod.value = 7;
  const clear = (f >= 313 && f < 577) ? XRAY_CLEAR : GAME_CLEAR;
  renderer.setClearColor(clear);
  renderer.setRenderTarget(rt);
  renderer.clear();
  renderer.render(scene, gameCam);
  renderer.setRenderTarget(null);
  outlineU.uRes.value.set(W, H); outlineU.uWidth.value = 2.6; hatchU.uPeriod.value = 11;
  renderer.setClearColor(ROOM_CLEAR);
}

const f0Canvas = document.createElement('canvas'); f0Canvas.width = W; f0Canvas.height = H;
let f0Ready = false;
function renderFrame(n) {
  seek(n);
  const s = sOf(n);
  poseWorld(n, s);
  scene.updateMatrixWorld();
  renderGame(s, n);
  // during arena / sound cuts the main camera already points at those sets
  renderer.render(scene, camera);
  fctx.globalAlpha = 1; fctx.globalCompositeOperation = 'source-over'; fctx.filter = 'none';
  fctx.drawImage(glCanvas, 0, 0, W, H);
  if (OVL) {
    OVL.drawOverlays(fctx, n, {
      f0Canvas: f0Ready ? f0Canvas : null,
      damage: ovlDamage,
      blood: ovlBlood,
      shake: ovlShake,
    });
  }
}

if (OVL) await OVL.initOverlays();
renderFrame(0);
f0Canvas.getContext('2d').drawImage(film, 0, 0);
f0Ready = true;
window.renderFrame = renderFrame;
window.__film = { scene, camera, poseWorld, sOf, seek, cast, arena, soundSet, btnG, renderer, FRAMES };
{
  const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
  window.glInfo = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
}
window.filmReady = true;
