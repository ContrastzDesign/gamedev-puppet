// film.js: "Why Can't GTA VI Just Fix a Bug Overnight?" at 24 fps.
// The toy river-and-bridge diorama (the game), the googly-eye cast, every prop and signal on the
// beat map, the deterministic simulation (springs, pupils, particles), the camera rail, the
// in-scene monitor's gameplay pass, and the 2D composite. Everything is a function of the integer
// frame: pure poses for props/camera/signals, a seeded replay for springs, pupils and particles.
import {
  THREE, RoundedBoxGeometry, W, H, COL, clamp, lerp, easeInOut, easeOut, easeIn, lin, sstep, V3, mulberry32,
  flashK, popScale, popOut, popInOut, toon, outlineU, outlineMat, hullGeometry, addOutline, mesh, decal,
  hatchU, catcher, GAME, inGame, canvasTex,
} from './core.js';
import { FPS, FRAMES, FREEZE } from './beats.js';

const ROOM = await import('./room.js').catch((e) => { console.warn('room.js not loaded: ' + e.message); return null; });
const OVL = await import('./overlays.js').catch((e) => { console.warn('overlays.js not loaded: ' + e.message); return null; });
await document.fonts.load('800 80px Caption');
await document.fonts.load('bold 90px Menlo');

// ---------- constants ----------
const Y0 = 0.02;                 // cutting-mat top: everything on the desk stands here
const CH_Y = Y0 - 0.008;         // characters sink into the mat; each def.dy tunes its own bottom to sit 0.007-0.008 deep (z-audit)
const LIFT = 0.005;
const WATER_TOP = 0.46, GRASS_TOP = 0.80, ROAD_TOP = 0.88;
const DT = 1 / 96, SUB = 4, GRAV = 22, PRE = 48;
const LIME = new THREE.Color(COL.lime), RED = new THREE.Color(COL.red);
const [FZ0, FZ1] = FREEZE;
// scene time: frames FZ0+1..FZ1-1 hold the FZ0 pose; after the freeze the motion continues seamlessly
const sOf = (f) => (f <= FZ0 ? f : f < FZ1 ? FZ0 : f - (FZ1 - FZ0 - 1));
// traffic/boat time: runs backwards during the rewind (s 678..712), then forwards again
const Tof = (s) => (s < 678 ? s : s < 712 ? 678 - 1.6 * (s - 678) : 678 - 54.4 + (s - 712));
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
const ROOM_CLEAR = COL.wall, GAME_CLEAR = 0x9fd0ee;
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
const AMB_DAY = new THREE.Color(0xffffff), AMB_NIGHT = new THREE.Color(0x8394e6);
const SUN_DAY = new THREE.Color(0xfff6ea), SUN_NIGHT = new THREE.Color(0x9fb3ff);

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
  return { bulbMat: null, screenCenter: scr.position.clone() };
}
const roomH = ROOM ? ROOM.buildRoom(scene, { screenTexture: rt.texture }) : fallbackRoom();
const screenCenter = roomH.screenCenter || V3(-3.4, 2.0, -2.6);
const bulbBase = roomH.bulbMat ? roomH.bulbMat.color.clone() : null;
const BULB_ON = new THREE.Color(0xfff1b8);

// ---------- text canvases ----------
const INK = '#1c1c20', DATA = '#2f6eb1', SIGRED = '#e84a2f';
function rrect(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
const capFont = (px) => `800 ${px}px Caption`;

// ---------- particles: dust, steam, splash drops and rings ----------
const puffGeo = new THREE.IcosahedronGeometry(1, 2);
const puffMats = [toon(0xf4f5f0), toon(0xd8ddd5)];
const dropMat = toon(0xdff1fb), ringMat = toon(0xeef8ff);
const ringGeo = new THREE.TorusGeometry(1, 0.07, 6, 36).rotateX(Math.PI / 2);
const parts = [];
let prng = mulberry32(1), spawnN = 0;
function spawn(kind, pos, vel, size, life) {
  let p = parts.find((q) => !q.alive && q.kind === kind);
  if (!p) {
    const m = new THREE.Mesh(kind === 'ring' ? ringGeo : puffGeo, puffMats[0]);
    addOutline(m);
    if (kind === 'drop' || kind === 'ring') m.traverse((o) => o.layers.enable(GAME));
    p = { kind, mesh: m, vel: new THREE.Vector3() };
    scene.add(m); parts.push(p);
  }
  p.mesh.material = kind === 'drop' ? dropMat : kind === 'ring' ? ringMat : puffMats[spawnN++ % 2];
  p.alive = true; p.t = 0; p.life = life; p.size = size; p.seed = prng() * 6; p.y0 = pos.y;
  p.mesh.position.copy(pos); p.vel.copy(vel); p.mesh.visible = true; p.mesh.scale.setScalar(0.001);
}
function updateParticles(dt) {
  for (const p of parts) {
    if (!p.alive) continue;
    p.t += dt;
    const k = p.t / p.life, m = p.mesh;
    if (k >= 1) { p.alive = false; m.visible = false; continue; }
    if (p.kind === 'dust') {
      p.vel.multiplyScalar(Math.exp(-5 * dt));
      m.position.addScaledVector(p.vel, dt);
      m.scale.setScalar(Math.max(0.001, p.size * (k < 0.25 ? easeOut(k / 0.25) : 1 - easeIn((k - 0.25) / 0.75))));
    } else if (p.kind === 'steam') {
      p.vel.x += Math.sin(p.t * 5 + p.seed) * 0.5 * dt;
      m.position.addScaledVector(p.vel, dt);
      m.scale.setScalar(Math.max(0.001, p.size * (1 + k) * (k < 0.3 ? easeOut(k / 0.3) : 1 - easeIn((k - 0.3) / 0.7))));
    } else if (p.kind === 'drop') {
      p.vel.y -= 9 * dt;
      m.position.addScaledVector(p.vel, dt);
      if (m.position.y < WATER_TOP && p.vel.y < 0) { p.alive = false; m.visible = false; continue; }
      m.scale.setScalar(p.size * (k < 0.15 ? easeOut(k / 0.15) : 1));
    } else if (p.kind === 'ring') {
      const r = p.size * (0.35 + 1.65 * easeOut(k));
      m.scale.set(r, r, r);
      m.position.y = p.y0 - 0.035 * easeIn(k);
    }
  }
}
function dustRing(c, n, rx, rz, speed, size) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + prng() * 0.4;
    _p.set(c.x + Math.cos(a) * rx, c.y + 0.04, c.z + Math.sin(a) * rz);
    spawn('dust', _p, _v.set(Math.cos(a), 0.35, Math.sin(a)).multiplyScalar(speed), size * (0.75 + prng() * 0.5), 0.5);
  }
}
function splash(c, big = 1) {
  _p.set(c.x, WATER_TOP + 0.006, c.z);
  spawn('ring', _p, _v.set(0, 0, 0), 0.17 * big, 0.55);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + prng() * 0.5;
    _p.set(c.x + Math.cos(a) * 0.06, WATER_TOP + 0.03, c.z + Math.sin(a) * 0.06);
    spawn('drop', _p, _v.set(Math.cos(a) * (0.35 + prng() * 0.4), 1.4 + prng() * 1.0, Math.sin(a) * (0.35 + prng() * 0.4)).multiplyScalar(big), 0.026 + prng() * 0.016, 0.7);
  }
}

// ---------- googly eyes (characters.md build) ----------
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
  root.traverse((o) => { if (o.isMesh && !o.userData.outline) o.userData.ch = ch; });
  cast.push(ch);
  return ch;
}
function resetChar(ch) {
  ch.rng = mulberry32(ch.seed);
  ch.st = { y: 0, vy: 0, air: false, sq: 1, vsq: 0, tilt: 0, vtilt: 0, lean: 0, vlean: 0, yaw: 0, vyaw: 0, shake: 0 };
  ch.steamT = 0; ch.steamAcc = 0;
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

// 1. Mug: the developer (coral), front left
const mug = character({
  key: 'mug', x: -1.2, z: 2.75, ry: 0.3, dy: 0.0005, w: 1.25, d: 0.84, h: 1.0, hopV: 3.6, seed: 101,
  build(ch) {
    const r = 0.42, Hm = 1.0, V2 = (x, y) => new THREE.Vector2(x, y);
    const prof = [V2(0, 0), V2(r - 0.05, 0), V2(r, 0.05), V2(r, Hm - 0.012), V2(r - 0.014, Hm), V2(r - 0.05, Hm), V2(r - 0.064, Hm - 0.016), V2(r - 0.064, 0.1), V2(0, 0.1)];
    add(ch, mesh(new THREE.LatheGeometry(prof, 48), toon(COL.coral, { side: THREE.DoubleSide })));
    add(ch, mesh(new THREE.CircleGeometry(r - 0.064, 40), toon(0x5b3a29), { p: [0, Hm * 0.8, 0], r: [-Math.PI / 2, 0, 0], line: false, shadow: false }));
    add(ch, mesh(new THREE.TorusGeometry(0.25, 0.066, 12, 28, Math.PI), sigMat(ch, COL.coral), { p: [r - 0.03, Hm * 0.5, 0], r: [0, 0, -Math.PI / 2] }));
    roundEyes(ch, 0.12, r, 0.7, 0.35);
    ch.update = (dt) => {
      if (ch.steamT <= 0) return;
      ch.steamT -= dt; ch.steamAcc += dt;
      if (ch.steamAcc > 0.15) {
        ch.steamAcc = 0;
        _p.set((ch.rng() - 0.5) * 0.16, Hm * 0.8 + 0.04, (ch.rng() - 0.5) * 0.16);
        ch.body.localToWorld(_p);
        spawn('steam', _p, _v.set((ch.rng() - 0.5) * 0.1, 0.55 + ch.rng() * 0.25, 0), 0.07 + ch.rng() * 0.04, 1.4);
      }
    };
    ch.gag = () => { ch.steamT = 1.0; };
  },
});

// 2. Rubber duck (saffron): eager, hits upload
const duck = character({
  key: 'duck', x: 1.25, z: 2.7, ry: -0.3, dy: 0.006, w: 1.0, d: 1.24, h: 1.15, hopV: 4.0, seed: 202,
  build(ch) {
    const sph = new THREE.SphereGeometry(1, 36, 24), yel = toon(COL.saffron);
    add(ch, mesh(sph, yel, { p: [0, 0.355, 0], s: [0.5, 0.36, 0.62] }));
    add(ch, mesh(sph, yel, { p: [0, 0.86, 0.16], s: [0.29, 0.29, 0.29] }));
    add(ch, mesh(sph, toon(COL.beak), { p: [0, 0.8, 0.43], s: [0.17, 0.06, 0.16] }));
    add(ch, mesh(new THREE.ConeGeometry(0.12, 0.25, 18), yel, { p: [0, 0.52, -0.5], r: [-0.75, 0, 0] }));
    for (const sg of [-1, 1]) add(ch, mesh(sph, yel, { p: [sg * 0.47, 0.4, -0.05], s: [0.08, 0.16, 0.3], r: [0, 0, sg * 0.2] }));
    // eyes on the head sphere: azimuth a, elevation e
    const hc = V3(0, 0.86, 0.16), hr = 0.29, a = 0.44, e = 0.25;
    const list = [-1, 1].map((sg) => [0.095, hc.x + sg * hr * Math.sin(a) * Math.cos(e), hc.y + hr * Math.sin(e), hc.z + hr * Math.cos(a) * Math.cos(e), sg * a, -e]);
    addEyes(ch, list);
  },
});

// 3. Sticky-note pad (lavender): the tester, back left by the monitor
const pad = character({
  key: 'pad', x: 0.05, z: 2.15, ry: 0.0, dy: 0.0015, w: 0.86, d: 0.86, h: 0.65, hopV: 3.6, seed: 303,
  build(ch) {
    add(ch, mesh(new RoundedBoxGeometry(0.86, 0.6, 0.86, 3, 0.03), toon(COL.lav), { p: [0, 0.3, 0] }));
    add(ch, mesh(new RoundedBoxGeometry(0.84, 0.03, 0.84, 2, 0.01), toon(0xc6aee3), { p: [0, 0.605, 0] }));
    const lineM = new THREE.MeshBasicMaterial({ color: 0x7a5aa3 }), lg = new THREE.PlaneGeometry(0.8, 0.008);
    for (const y of [0.09, 0.17, 0.55]) {
      add(ch, decal(lg, lineM, { p: [0, y, 0.43 + LIFT] }));
      add(ch, decal(lg, lineM, { p: [0.43 + LIFT, y, 0], r: [0, Math.PI / 2, 0] }));
      add(ch, decal(lg, lineM, { p: [-0.43 - LIFT, y, 0], r: [0, -Math.PI / 2, 0] }));
    }
    // lifted corner flap on the top sheet (front right)
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute([0.25, 0.624, 0.415, 0.415, 0.624, 0.25, 0.34, 0.69, 0.34], 3));
    fg.computeVertexNormals();
    add(ch, mesh(fg, toon(0xd6c3ec, { side: THREE.DoubleSide }), { line: false }));
    flatEyes(ch, 0.12, 0.38, 0.43, 0.32);
  },
});
const castBy = { mug, duck, pad };

// ---------- the diorama: the game world (layer GAME too) ----------
const dio = new THREE.Group(); dio.name = 'diorama'; scene.add(dio);
const dioMats = [];
function dmat(c, o) { const m = toon(c, o); m.userData.base = m.color.clone(); dioMats.push(m); return m; }
const dadd = (m) => { dio.add(m); return m; };

dadd(mesh(new RoundedBoxGeometry(4.5, 0.305, 3.1, 3, 0.05), dmat(COL.base), { p: [0, 0.1675, 0] }));
const earthM = dmat(COL.earth), grassM = dmat(COL.grass), strataM = dmat(0x93704f);
for (const sg of [-1, 1]) {
  dadd(mesh(new THREE.BoxGeometry(1.53, 0.45, 3.02), earthM, { p: [sg * 1.445, 0.525, 0] }));
  dadd(mesh(new RoundedBoxGeometry(1.57, 0.07, 3.06, 2, 0.02), grassM, { p: [sg * 1.445, 0.765, 0] }));
  for (const y of [0.45, 0.6]) dadd(decal(new THREE.PlaneGeometry(1.45, 0.018), strataM, { p: [sg * 1.445, y, 1.51 + LIFT] }));
}
// water: flowing stripes on the top face
const waterTex = canvasTex(256, 512, (x, w, h) => {
  x.fillStyle = '#8cc8ea'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#c6e5f6'; x.lineWidth = 7; x.lineCap = 'round';
  const r = mulberry32(55);
  for (let row = 0; row < 9; row++) for (let i = 0; i < 2; i++) {
    const cx = (i * 128 + (row % 2) * 64 + r() * 30) % w, cy = row * (h / 9) + 20;
    x.beginPath(); x.moveTo(cx - 24, cy); x.quadraticCurveTo(cx, cy - 10, cx + 24, cy); x.stroke();
  }
});
waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; waterTex.repeat.set(1, 1.1);
const waterTopM = dmat(0xffffff, { map: waterTex }), waterSideM = dmat(COL.water);
waterTopM.userData.noFlash = waterSideM.userData.noFlash = true; // water stays blue when "the game" goes lime
dadd(mesh(new THREE.BoxGeometry(1.4, 0.17, 3.0), [waterSideM, waterSideM, waterTopM, waterSideM, waterSideM, waterSideM], { p: [0, 0.375, 0] }));
// roads, bridge deck, girder, tied arches
const roadM = dmat(COL.road), dashM = dmat(0xf2efe2), deckMat = dmat(COL.road), girderM = dmat(COL.cream), archM = dmat(COL.white);
const dashGeo = new THREE.PlaneGeometry(0.12, 0.026);
for (const sg of [-1, 1]) {
  dadd(mesh(new THREE.BoxGeometry(1.308, 0.09, 0.6), roadM, { p: [sg * 1.556, 0.835, 0] }));
  for (let x = 1.02; x < 1.72; x += 0.24) dadd(decal(dashGeo, dashM, { p: [sg * x, ROAD_TOP + LIFT, 0], r: [-Math.PI / 2, 0, 0] }));
}
const deck = dadd(mesh(new THREE.BoxGeometry(1.816, 0.102, 0.72), deckMat, { p: [0, 0.835, 0] }));
for (let x = -0.72; x < 0.8; x += 0.24) dadd(decal(dashGeo, dashM, { p: [x, ROAD_TOP + 0.006 + LIFT, 0], r: [-Math.PI / 2, 0, 0] }));
dadd(mesh(new THREE.BoxGeometry(1.44, 0.095, 0.6), girderM, { p: [0, 0.7475, 0] }));
const archY = (x) => ROAD_TOP - 0.02 + 0.5 * (1 - (x / 0.8) ** 2);
class ArchCurve extends THREE.Curve {
  constructor(z) { super(); this.z = z; }
  getPoint(t, o = new THREE.Vector3()) { const x = -0.8 + 1.6 * t; return o.set(x, archY(x), this.z); }
}
const boltGeo = new THREE.SphereGeometry(0.045, 12, 8);
for (const z of [-0.33, 0.33]) {
  dadd(mesh(new THREE.TubeGeometry(new ArchCurve(z), 48, 0.035, 8, false), archM));
  for (const x of [-0.8, 0.8]) dadd(mesh(boltGeo, archM, { p: [x, ROAD_TOP - 0.02, z] }));
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.2, y0 = ROAD_TOP - 0.01, y1 = archY(x);
    dadd(mesh(new THREE.CylinderGeometry(0.012, 0.012, y1 - y0, 6), archM, { p: [x, (y0 + y1) / 2, z] }));
  }
}
for (const x of [-0.3, 0.3]) dadd(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.66, 8).rotateX(Math.PI / 2), archM, { p: [x, archY(x), 0] }));
// tunnel mounds with portals
const moundM = dmat(COL.mound), stoneM = dmat(0xd8cdb8);
const portalM = new THREE.MeshBasicMaterial({ color: 0x23272e });
for (const sg of [-1, 1]) {
  dadd(mesh(new RoundedBoxGeometry(0.44, 0.82, 1.2, 3, 0.1), moundM, { p: [sg * 1.97, 1.01, 0] }));
  const ry = sg > 0 ? -Math.PI / 2 : Math.PI / 2;
  dadd(decal(new THREE.CircleGeometry(0.25, 24, 0, Math.PI), portalM, { p: [sg * (1.75 - LIFT), ROAD_TOP, 0], r: [0, ry, 0] }));
  dadd(mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 24, Math.PI), stoneM, { p: [sg * 1.75, ROAD_TOP, 0], r: [0, ry, 0] }));
}
// pastel buildings on the right bank
const roofM = dmat(0x5f7183), winM = dmat(COL.window), doorM = dmat(0x6b4f3a);
const winGeo = new THREE.PlaneGeometry(0.085, 0.105), doorGeo = new THREE.PlaneGeometry(0.11, 0.17);
function building(x, z, w, d, h, col, sideX) {
  const g = new THREE.Group(); g.position.set(x, GRASS_TOP - 0.01, z); dio.add(g);
  g.add(mesh(new RoundedBoxGeometry(w, h, d, 2, 0.025), dmat(col), { p: [0, h / 2, 0] }));
  g.add(mesh(new RoundedBoxGeometry(w + 0.06, 0.06, d + 0.06, 2, 0.02), roofM, { p: [0, h + 0.015, 0] }));
  const cols = Math.max(1, Math.floor((w - 0.1) / 0.16)), rows = Math.max(1, Math.floor((h - 0.3) / 0.19));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = (c - (cols - 1) / 2) * 0.16, cy = 0.34 + r * 0.19;
    g.add(decal(winGeo, winM, { p: [cx, cy, d / 2 + LIFT] }));
  }
  g.add(decal(doorGeo, doorM, { p: [0, 0.1, d / 2 + LIFT] }));
  if (sideX) {
    const sc = Math.max(1, Math.floor((d - 0.1) / 0.16));
    for (let r = 0; r < rows; r++) for (let c = 0; c < sc; c++) {
      g.add(decal(winGeo, winM, { p: [sideX * (w / 2 + LIFT), 0.34 + r * 0.19, (c - (sc - 1) / 2) * 0.16], r: [0, sideX * Math.PI / 2, 0] }));
    }
  }
  return g;
}
building(1.15, -0.95, 0.55, 0.5, 0.9, COL.peach, -1);
building(1.85, -1.08, 0.5, 0.52, 1.15, COL.aqua, -1);
building(1.42, 1.05, 0.6, 0.5, 0.7, COL.butter, -1);
building(2.0, 1.22, 0.34, 0.4, 0.5, COL.peach, 0);
// palms and bushes
const trunkM = dmat(COL.trunk), palmM = dmat(COL.palm), nutM = dmat(0x6b4f3a), bushM = dmat(0x6aab4f);
const frondGeo = new THREE.SphereGeometry(1, 14, 8), nutGeo = new THREE.SphereGeometry(0.032, 10, 6), bushGeo = new THREE.SphereGeometry(1, 16, 12);
function palm(x, z, h, lean, rot) {
  const g = new THREE.Group(); g.position.set(x, GRASS_TOP - 0.01, z); g.rotation.y = rot; dio.add(g);
  const curve = new THREE.QuadraticBezierCurve3(V3(0, -0.02, 0), V3(lean * 0.2, h * 0.55, 0), V3(lean, h, 0));
  g.add(mesh(new THREE.TubeGeometry(curve, 12, 0.034, 8, false), trunkM));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    g.add(mesh(frondGeo, palmM, { p: [lean + Math.cos(a) * 0.19, h - 0.03, Math.sin(a) * 0.19], r: [0, -a, -0.38], s: [0.24, 0.024, 0.075] }));
  }
  g.add(mesh(nutGeo, nutM, { p: [lean + 0.035, h - 0.055, 0.03] }));
  g.add(mesh(nutGeo, nutM, { p: [lean - 0.03, h - 0.06, -0.02] }));
}
palm(-1.9, 0.95, 0.72, 0.1, 0.4);
palm(-1.1, 1.12, 0.56, -0.09, 1.3);
palm(-1.05, -1.0, 0.62, 0.08, 2.2);
palm(-1.72, -1.15, 0.48, -0.06, 0.9);
for (const [x, z, r] of [[-1.45, 0.62, 0.11], [-1.6, -0.6, 0.13], [-2.05, 0.55, 0.09], [1.12, 0.52, 0.1], [2.05, 0.72, 0.1], [1.3, -0.48, 0.09], [-1.3, -1.35, 0.1]]) {
  dadd(mesh(bushGeo, bushM, { p: [x, GRASS_TOP + r * 0.55, z], s: [r, r * 0.8, r] }));
}
// shadow catchers on the diorama
dadd(catcher(1.57, 3.06, { p: [-1.445, GRASS_TOP + 0.004, 0] }));
dadd(catcher(1.57, 3.06, { p: [1.445, GRASS_TOP + 0.004, 0] }));
dadd(catcher(1.308, 0.6, { p: [-1.556, ROAD_TOP + 0.004, 0] }));
dadd(catcher(1.308, 0.6, { p: [1.556, ROAD_TOP + 0.004, 0] }));
dadd(catcher(1.8, 0.72, { p: [0, ROAD_TOP + 0.004, 0] }));
dadd(catcher(1.36, 3.0, { p: [0, WATER_TOP + 0.004, 0] }));

// toy cars: a pool of 8, each trip owns a slot
const carBodyGeo = new RoundedBoxGeometry(0.42, 0.12, 0.22, 2, 0.035);
const cabinGeo = new RoundedBoxGeometry(0.22, 0.09, 0.18, 2, 0.03);
const wheelGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14).rotateX(Math.PI / 2);
const glassM = dmat(COL.glass), wheelM = dmat(COL.dark), lightM = dmat(0xfff3c4);
const lampGeo = new THREE.PlaneGeometry(0.04, 0.03);
const CAR_COLS = [COL.sky, COL.saffron, COL.milk, COL.steel, COL.peach, COL.aqua, COL.butter, COL.milk];
const cars = CAR_COLS.map((c) => {
  const g = new THREE.Group(); g.visible = false; dio.add(g);
  g.add(mesh(carBodyGeo, dmat(c), { p: [0, 0.105, 0] }));
  g.add(mesh(cabinGeo, glassM, { p: [-0.025, 0.2, 0] }));
  for (const x of [-0.13, 0.13]) for (const z of [-0.1, 0.1]) g.add(mesh(wheelGeo, wheelM, { p: [x, 0.045, z] }));
  for (const z of [-0.065, 0.065]) g.add(decal(lampGeo, lightM, { p: [0.21 + LIFT, 0.12, z], r: [0, Math.PI / 2, 0] }));
  return { g };
});
const G_F = 10.5 / (FPS * FPS);                               // fall gravity, units / frame²
const FALL_D = Math.sqrt((2 * (ROAD_TOP - WATER_TOP)) / G_F);  // frames from the deck to the water
const TRIPS = [
  { slot: 0, t0: 8, x0: -1.45, dir: 1, v: 0.0203, z: 0.15, xf: -0.15, drop: true },
  { slot: 1, t0: 48, x0: -2.0, dir: 1, v: 0.04, z: 0.15, xf: -0.12 },
  { slot: 2, t0: 40, x0: 2.0, dir: -1, v: 0.04, z: -0.15, xf: 0.15 },
  { slot: 3, t0: 100, x0: -2.0, dir: 1, v: 0.04, z: 0.15, xf: -0.1 },
  { slot: 4, t0: 140, x0: 2.0, dir: -1, v: 0.04, z: -0.15, xf: 0.12 },
  { slot: 5, t0: 196, x0: -2.0, dir: 1, v: 0.04, z: 0.15, xf: -0.1 },
  { slot: 6, t0: 236, x0: 2.0, dir: -1, v: 0.04, z: -0.15, xf: 0.12 },
];
for (let k = 0; 300 + 52 * k < 1100; k++) TRIPS.push({ slot: k % 4, t0: 300 + 52 * k, x0: -2.05, dir: 1, v: 0.035, z: 0.15 });
for (let k = 0; 326 + 58 * k < 1100; k++) TRIPS.push({ slot: 4 + (k % 4), t0: 326 + 58 * k, x0: 2.05, dir: -1, v: 0.033, z: -0.15 });
for (const tr of TRIPS) if (tr.xf !== undefined) { tr.tf = Math.abs(tr.xf - tr.x0) / tr.v; tr.splashT = tr.t0 + tr.tf + FALL_D; }
const _cp = { vis: false, x: 0, y: 0, pitch: 0 };
function tripPose(tr, T, o) {
  o.pitch = 0; o.y = ROAD_TOP; o.vis = false;
  if (tr.drop && T < tr.t0) { o.vis = true; o.x = tr.x0; o.y = T < 5 ? ROAD_TOP + 0.7 * (1 - (Math.max(0, T) / 5) ** 2) : ROAD_TOP; return o; }
  if (T < tr.t0) return o;
  const d = T - tr.t0;
  if (tr.xf === undefined || d < tr.tf) { o.x = tr.x0 + tr.dir * tr.v * d; o.vis = Math.abs(o.x) < 1.96; return o; }
  const e = d - tr.tf;
  if (e < FALL_D) { o.vis = true; o.x = tr.xf + tr.dir * tr.v * e; o.y = ROAD_TOP - 0.5 * G_F * e * e; o.pitch = Math.min(0.55, e * 0.08); return o; }
  const e2 = e - FALL_D;
  if (e2 > 15) return o;
  o.vis = true; o.x = tr.xf + tr.dir * tr.v * (FALL_D + e2 * 0.15); o.y = WATER_TOP - 0.018 * e2; o.pitch = 0.55 + 0.01 * e2;
  return o;
}

// the boat (bow toward -z): it bonks the invisible wall, later passes under the bridge
const boat = new THREE.Group(); dio.add(boat);
{
  const sh = new THREE.Shape();
  sh.moveTo(-0.1, -0.2); sh.lineTo(0.1, -0.2); sh.lineTo(0.1, 0.05); sh.quadraticCurveTo(0.1, 0.16, 0, 0.24); sh.quadraticCurveTo(-0.1, 0.16, -0.1, 0.05); sh.lineTo(-0.1, -0.2);
  const hullGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 10 }).rotateX(-Math.PI / 2);
  boat.add(mesh(hullGeo, dmat(COL.white), { p: [0, -0.02, 0] }));
  const stripeGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.018, bevelSegments: 1, curveSegments: 10 }).rotateX(-Math.PI / 2);
  boat.add(mesh(stripeGeo, dmat(COL.sky), { p: [0, 0.02, 0], line: false }));
  boat.add(mesh(new RoundedBoxGeometry(0.13, 0.075, 0.13, 2, 0.02), dmat(COL.milk), { p: [0, 0.085, 0.05] }));
  boat.add(mesh(new THREE.BoxGeometry(0.142, 0.022, 0.1), dmat(COL.window), { p: [0, 0.095, 0.04], line: false }));
  boat.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.14, 6), dmat(COL.dark), { p: [0, 0.145, 0.09] }));
  const fl = new THREE.Shape(); fl.moveTo(0, 0); fl.lineTo(0, 0.045); fl.lineTo(0.06, 0.022); fl.lineTo(0, 0);
  boat.add(mesh(new THREE.ShapeGeometry(fl), dmat(COL.peach, { side: THREE.DoubleSide }), { p: [0.004, 0.17, 0.09], line: false }));
}
function boatZ(T) {
  if (T < 350) return 1.2 + 0.02 * Math.sin(T * 0.05);
  if (T < 379) return lerp(1.2 + 0.02 * Math.sin(350 * 0.05), 0.67, easeIn((T - 350) / 29));
  if (T < 396) return lerp(0.67, 0.86, easeOut((T - 379) / 17));
  if (T < 566) return 0.86;
  if (T < 640) return lerp(0.86, -1.1, easeInOut((T - 566) / 74));
  return -1.1;
}

// the invisible wall under the bridge: transparent red, outlined via a depth prepass
const zoneG = new THREE.Group(); zoneG.position.set(0, WATER_TOP + 0.005, 0); dio.add(zoneG);
{
  const zg = new THREE.BoxGeometry(1.24, 0.22, 0.88).translate(0, 0.11, 0);
  const pre = new THREE.Mesh(zg, new THREE.MeshBasicMaterial({ colorWrite: false })); pre.renderOrder = 10;
  const hull = new THREE.Mesh(hullGeometry(zg), outlineMat); hull.renderOrder = 11; hull.userData.outline = true;
  const col = new THREE.Mesh(zg, new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: 0.62, depthWrite: false })); col.renderOrder = 12;
  for (const m of [pre, hull, col]) { m.castShadow = false; zoneG.add(m); }
}
inGame(dio);

// ---------- props (explanation layer, not in the game view) ----------
function pmat(c, o) { const m = toon(c, o); m.userData.base = m.color.clone(); return m; }
const labelMat = (tex) => decalMat(new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
function decalMat(m) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4; return m; }

// code placard "bridge.collision = true;"
const codeG = new THREE.Group(); codeG.position.set(0, ROAD_TOP, 0); scene.add(codeG);
const codePlateM = pmat(COL.white);
{
  codeG.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.64, 10), pmat(COL.dark), { p: [0, 0.3, 0] }));
  codeG.add(mesh(new RoundedBoxGeometry(1.6, 0.62, 0.07, 2, 0.03), codePlateM, { p: [0, 0.9, 0] }));
  const tex = canvasTex(1024, 397, (x, w, h) => {
    x.fillStyle = INK; x.font = 'bold 94px Menlo, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('bridge.collision', w / 2, 128); x.fillText('= true;', w / 2, 272);
  });
  codeG.add(decal(new THREE.PlaneGeometry(1.52, 0.59), labelMat(tex), { p: [0, 0.9, 0.035 + LIFT] }));
}
// counter plate (child of the placard): "0..10 MIN"
const counterG = new THREE.Group(); counterG.position.set(0.48, 1.58, 0.02); codeG.add(counterG);
const counterTex = canvasTex(512, 305, () => {});
function drawCounter(n) {
  const x = counterTex.userData.ctx; x.clearRect(0, 0, 512, 305);
  x.textBaseline = 'alphabetic'; x.textAlign = 'center';
  x.font = capFont(190); const nw = x.measureText(String(n)).width;
  x.font = capFont(86); const uw = x.measureText('MIN').width;
  const total = nw + 22 + uw, x0 = 256 - total / 2;
  x.textAlign = 'left'; x.fillStyle = DATA; x.font = capFont(190); x.fillText(String(n), x0, 222);
  x.fillStyle = INK; x.font = capFont(86); x.fillText('MIN', x0 + nw + 22, 222);
  counterTex.needsUpdate = true;
}
{
  counterG.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), pmat(COL.dark), { p: [0, -0.31, 0] }));
  counterG.add(mesh(new RoundedBoxGeometry(0.84, 0.5, 0.06, 2, 0.03), pmat(COL.white), { p: [0, 0, 0] }));
  counterG.add(decal(new THREE.PlaneGeometry(0.8, 0.476), labelMat(counterTex), { p: [0, 0, 0.03 + LIFT] }));
}
// REGRESSION placard rising from the water
const regG = new THREE.Group(); regG.position.set(0, WATER_TOP - 0.02, 0.5); scene.add(regG);
{
  regG.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 10), pmat(COL.dark), { p: [0, 0.55, 0] }));
  regG.add(mesh(new RoundedBoxGeometry(1.7, 0.42, 0.07, 2, 0.03), pmat(COL.red), { p: [0, 1.3, 0] }));
  const tex = canvasTex(1024, 253, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.font = capFont(150); x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '2px';
    x.fillText('REGRESSION', w / 2, h / 2 + 6);
  });
  regG.add(decal(new THREE.PlaneGeometry(1.62, 0.4), labelMat(tex), { p: [0, 1.3, 0.035 + LIFT] }));
}
// upload button
const BTN = V3(0.15, Y0, 3.55);
const btnG = new THREE.Group(); btnG.position.copy(BTN); scene.add(btnG);
const plungerM = pmat(COL.sky);
const plunger = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 40), plungerM, { p: [0, 0.28, 0] });
{
  btnG.add(mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.2, 40), pmat(COL.dark), { p: [0, 0.095, 0] }));
  btnG.add(plunger);
  const sign = mesh(new RoundedBoxGeometry(0.96, 0.34, 0.05, 2, 0.02), pmat(COL.white), { p: [0, 0.135, 0.66], r: [-0.62, 0, 0] });
  btnG.add(sign);
  const tex = canvasTex(512, 192, (x, w, h) => {
    x.fillStyle = INK; x.font = capFont(92); x.textAlign = 'left'; x.textBaseline = 'middle';
    const tw = x.measureText('UPLOAD').width, x0 = (w - (tw + 110)) / 2;
    x.beginPath(); x.moveTo(x0 + 46, 36); x.lineTo(x0 + 92, 94); x.lineTo(x0 + 64, 94); x.lineTo(x0 + 64, 156); x.lineTo(x0 + 28, 156); x.lineTo(x0 + 28, 94); x.lineTo(x0, 94); x.closePath(); x.fill();
    x.fillText('UPLOAD', x0 + 110, 102);
  });
  sign.add(decal(new THREE.PlaneGeometry(0.9, 0.3), labelMat(tex), { p: [0, 0, 0.025 + LIFT] }));
}
const plungerTop = (s) => 0.36 - 0.09 * lin(295, 297, s) * (1 - lin(330, 333, s));

// rulebook: drops in front of the cast, opens (cover swings back), ticks, one rule fails,
// closes and flies away on the rewind. Spine at the back (local -z); text reads from the front.
const BOOK = V3(0.05, Y0, 3.45);        // spans z 2.94..3.96: on the mat (ends 3.9), clear of the desk edge (4.1)
const bookG = new THREE.Group(); bookG.position.copy(BOOK); bookG.rotation.y = 0; bookG.scale.setScalar(0.72); scene.add(bookG);
const bookBody = new THREE.Group(); bookG.add(bookBody);
const coverPivot = new THREE.Group(); coverPivot.position.set(0.54, 0.23, 0);
const rulesTex = canvasTex(500, 650, () => {});
const RULES = ['NO CRASHES', 'SAVE DATA', 'FRAME RATE', 'LOAD TIMES', 'TROPHIES', 'AGE RATING'];
const ROW_Y = (i) => 150 + i * 82;
let rulesKey = '';
function drawRules(ticks, fail) {
  const key = ticks + '|' + fail; if (key === rulesKey) return; rulesKey = key;
  const x = rulesTex.userData.ctx;
  x.fillStyle = '#f3ecd9'; x.fillRect(0, 0, 500, 650);
  x.fillStyle = INK; x.font = capFont(46); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CHECKLIST', 250, 62);
  x.fillRect(70, 96, 360, 6);
  x.textAlign = 'left'; x.font = capFont(38);
  for (let i = 0; i < 6; i++) {
    const y = ROW_Y(i), bad = fail && i === 3;
    if (bad) { x.fillStyle = 'rgba(232,74,47,0.22)'; rrect(x, 26, y - 34, 448, 68, 14); x.fill(); }
    x.lineWidth = 6; x.strokeStyle = bad ? SIGRED : INK; rrect(x, 44, y - 22, 44, 44, 8); x.stroke();
    x.fillStyle = bad ? SIGRED : INK; x.fillText(RULES[i], 108, y + 2);
    if (i < ticks) { x.strokeStyle = INK; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(52, y); x.lineTo(63, y + 12); x.lineTo(84, y - 16); x.stroke(); }
    if (bad) { x.strokeStyle = SIGRED; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(53, y - 13); x.lineTo(79, y + 13); x.moveTo(79, y - 13); x.lineTo(53, y + 13); x.stroke(); }
  }
  rulesTex.needsUpdate = true;
}
drawRules(0, false);
{
  const slate = pmat(COL.slate), pages = pmat(COL.page);
  bookBody.add(mesh(new RoundedBoxGeometry(1.12, 0.04, 1.42, 2, 0.015), slate, { p: [0, 0.015, 0] }));
  bookBody.add(mesh(new THREE.BoxGeometry(1.06, 0.166, 1.36), pages, { p: [-0.004, 0.107, 0] }));
  bookBody.add(mesh(new THREE.BoxGeometry(0.05, 0.25, 1.42), slate, { p: [0.565, 0.12, 0] }));
  bookBody.add(decal(new THREE.PlaneGeometry(1.0, 1.3), decalMat(new THREE.MeshBasicMaterial({ map: rulesTex, toneMapped: false })), { p: [-0.01, 0.19 + LIFT, 0], r: [-Math.PI / 2, 0, 0] }));
  const edgeM = new THREE.MeshBasicMaterial({ color: 0xcfc3a6 });
  for (const y of [0.08, 0.12, 0.16]) bookBody.add(decal(new THREE.PlaneGeometry(1.0, 0.008), edgeM, { p: [-0.004, y, 0.68 + LIFT] }));
  bookBody.add(coverPivot);
  coverPivot.add(mesh(new RoundedBoxGeometry(1.12, 0.04, 1.42, 2, 0.015), slate, { p: [-0.56, 0, 0] }));
  const lab = canvasTex(420, 160, (x, w, h) => {
    x.strokeStyle = '#ffffff'; x.lineWidth = 8; rrect(x, 8, 8, w - 16, h - 16, 22); x.stroke();
    x.fillStyle = '#ffffff'; x.font = capFont(96); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RULES', w / 2, h / 2 + 4);
  });
  coverPivot.add(decal(new THREE.PlaneGeometry(0.78, 0.3), labelMat(lab), { p: [-0.56, 0.02 + LIFT, -0.2], r: [-Math.PI / 2, 0, 0] }));
  coverPivot.add(decal(new THREE.PlaneGeometry(1.04, 1.34), new THREE.MeshBasicMaterial({ color: 0xe4dcc6 }), { p: [-0.56, -0.02 - LIFT, 0], r: [Math.PI / 2, 0, 0] }));
}
// red arrow lying on the open cover, pointing left at the failed rule (keeps the checklist clear)
const arrowG = new THREE.Group(); bookG.add(arrowG);
{
  const s = new THREE.Shape();
  s.moveTo(-0.08, 0.55); s.lineTo(0.08, 0.55); s.lineTo(0.08, 0.22); s.lineTo(0.2, 0.22); s.lineTo(0, 0); s.lineTo(-0.2, 0.22); s.lineTo(-0.08, 0.22); s.lineTo(-0.08, 0.55);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }).translate(0, 0, -0.04);
  arrowG.add(mesh(g, pmat(COL.red)));
  arrowG.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
}
const ARROW_LOCAL = V3(0.47, 0.33, -0.65 + (ROW_Y(3) / 650) * 1.3);

// tent calendar
const CAL_POS = V3(0, Y0, -2.5), RISER = 0.8;
{
  scene.add(mesh(new RoundedBoxGeometry(1.8, 0.42, 1.0, 2, 0.03), pmat(COL.sky), { p: [CAL_POS.x, Y0 + 0.21 - 0.008, CAL_POS.z] }));
  scene.add(mesh(new RoundedBoxGeometry(1.6, 0.39, 0.9, 2, 0.03), pmat(COL.cream), { p: [CAL_POS.x, Y0 + 0.42 + 0.19 - 0.014, CAL_POS.z] }));
  scene.add(catcher(1.56, 0.86, { p: [CAL_POS.x, Y0 + 0.791 + 0.004, CAL_POS.z] }));
}
const calG = new THREE.Group(); calG.position.set(CAL_POS.x, Y0 + RISER - 0.018, CAL_POS.z); calG.scale.setScalar(1.1); scene.add(calG);
const calFront = new THREE.Group(); calFront.position.set(0, 1.3, 0); calFront.rotation.x = -0.27; calG.add(calFront);
const calBack = new THREE.Group(); calBack.position.set(0, 1.3, 0); calBack.rotation.x = 0.27; calG.add(calBack);
const boardM = pmat(COL.dark);
calFront.add(mesh(new THREE.BoxGeometry(1.4, 1.35, 0.03), boardM, { p: [0, -0.675, -0.015] }));
calBack.add(mesh(new THREE.BoxGeometry(1.4, 1.35, 0.03), boardM, { p: [0, -0.675, 0.015] }));
const ringGeo2 = new THREE.TorusGeometry(0.07, 0.014, 6, 18).rotateY(Math.PI / 2);
const ringM2 = pmat(COL.steel);
for (const x of [-0.42, 0, 0.42]) calG.add(mesh(ringGeo2, ringM2, { p: [x, 1.3, 0] }));
function calTexDraw(tex, n, unit) {
  const x = tex.userData.ctx, w = 520, h = 460;
  x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#79b4e3'; x.fillRect(0, 0, w, 76);
  x.fillStyle = INK; x.fillRect(0, 76, w, 6);
  x.lineWidth = 8; x.strokeStyle = INK; x.strokeRect(4, 4, w - 8, h - 8);
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.fillStyle = DATA; x.font = capFont(unit === 'MONTHS' ? 210 : 230); x.fillText(String(n), w / 2, 318);
  x.fillStyle = INK; x.font = capFont(70); x.fillText(unit, w / 2, 410);
  tex.needsUpdate = true;
}
const calBaseTex = canvasTex(520, 460, () => {}), calFlipTex = canvasTex(520, 460, () => {});
const calBase = decal(new THREE.PlaneGeometry(1.3, 1.15), new THREE.MeshBasicMaterial({ map: calBaseTex, toneMapped: false }), { p: [0, -0.65, LIFT] });
calFront.add(calBase);
const flipPivot = new THREE.Group(); flipPivot.position.set(0, 0, 0.012); calFront.add(flipPivot);
const pageM = new THREE.MeshBasicMaterial({ color: 0xeeeadf });
// back of a torn-off sheet: pale header band and faint ruled lines, so it never reads as a missing texture
const calBackTex = canvasTex(520, 460, (x, w, h) => {
  x.fillStyle = '#f1ede2'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#b9d6ee'; x.fillRect(0, 0, w, 76);
  x.fillStyle = INK; x.fillRect(0, 76, w, 6);
  x.fillStyle = '#d8d1c0'; for (let y = 140; y < h - 30; y += 46) x.fillRect(46, y, w - 92, 5);
  x.lineWidth = 8; x.strokeStyle = INK; x.strokeRect(4, 4, w - 8, h - 8);
});
const flipPage = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.15, 0.004), [pageM, pageM, pageM, pageM, new THREE.MeshBasicMaterial({ map: calFlipTex, toneMapped: false }), new THREE.MeshBasicMaterial({ map: calBackTex, toneMapped: false })]);
flipPage.position.set(0, -0.65, 0); flipPivot.add(flipPage);
const CAL = [];
const calAdd = (s, n, unit, back = false) => CAL.push({ s, n, unit: unit ?? (n === 1 ? 'DAY' : 'DAYS'), back });
calAdd(-1e9, 1);
calAdd(215, 14); calAdd(247, 3, 'MONTHS'); calAdd(272, 0); calAdd(412, 1); calAdd(483, 2);
for (let i = 0; i < 7; i++) calAdd(516 + 10 * i, 3 + i);
calAdd(588, 10); calAdd(596, 11); calAdd(604, 12);
for (let i = 0; i < 12; i++) calAdd(684 + 2 * i, 11 - i, undefined, true);
for (let i = 0; i < 10; i++) calAdd(727 + 2.2 * i, i + 1, i === 0 ? 'YEAR' : 'YEARS');
calAdd(780, 0); // "The fix took ten minutes": the count restarts as the placard pops up over it
for (let i = 0; i < 14; i++) calAdd(828 + (34 / 13) * i, i + 1);
calAdd(sOf(970), 1, undefined, true); // after the VO: flip back to the opening page so the loop dissolve has no double exposure
CAL.forEach((c, i) => { const nx = CAL[i + 1]; c.dur = Math.min(5, nx ? nx.s - c.s : 5, c.s < FZ0 ? FZ0 - c.s : 5); });
const FLIP_END = -5.66;
let calBaseKey = '', calFlipKey = '';
function poseCalendar(s) {
  let i = 0;
  while (i + 1 < CAL.length && CAL[i + 1].s <= s) i++;
  const c = CAL[i], k = i === 0 ? 1 : (s - c.s) / c.dur;
  let base = c, flip = null, ang = 0;
  if (k < 1) {
    const prev = CAL[i - 1];
    if (!c.back) { flip = prev; ang = FLIP_END * easeInOut(k); } else { base = prev; flip = c; ang = FLIP_END * (1 - easeInOut(k)); }
  }
  const bk = base.n + base.unit;
  if (bk !== calBaseKey) { calBaseKey = bk; calTexDraw(calBaseTex, base.n, base.unit); }
  flipPivot.visible = !!flip;
  if (flip) {
    const fk = flip.n + flip.unit;
    if (fk !== calFlipKey) { calFlipKey = fk; calTexDraw(calFlipTex, flip.n, flip.unit); }
    flipPivot.rotation.x = ang;
  }
}

// ---------- beat tables ----------
// who looks at what (later rows win)
const LOOKS = [
  [-1e9, 8, 'all', 'cam'], [8, 70, 'all', 'carA'], [70, 128, 'all', 'splash'],
  [128, 150, 'mug', 'cam'], [128, 150, 'duck', 'mug'], [128, 150, 'pad', 'deck'],
  [150, 210, 'all', 'code'], [210, 268, 'all', 'cal'], [268, 300, 'all', 'button'],
  [300, 350, 'all', 'deck'], [350, 392, 'all', 'boat'], [392, 412, 'all', 'zone'],
  [412, 437, 'all', 'mug'], [412, 437, 'mug', 'cam'],
  [437, 483, 'all', 'zone'], [483, 512, 'all', 'regress'],
  [512, 539, 'all', 'pad'], [512, 590, 'pad', 'monitor'], [539, 590, 'mug', 'scan'], [539, 590, 'duck', 'scan'],
  [590, 646, 'all', 'book'], [646, 680, 'all', 'arrow'], [680, 724, 'all', 'cal'],
  [724, 775, 'all', 'sky'], [775, 796, 'all', 'code'], [796, 828, 'all', 'counter'],
  [828, 898, 'all', 'cal'], [898, 1e9, 'all', 'cam'],
];
function targetPos(name, ch, st, out) {
  switch (name) {
    case 'cam': return out.copy(camera.position);
    case 'carA': return cars[0].g.getWorldPosition(out).add(_v.set(0, 0.12, 0));
    case 'splash': return out.set(-0.15, 0.5, 0.15);
    case 'mug': case 'duck': case 'pad': return headPos(castBy[name], out);
    case 'deck': return out.set(0, 0.92, 0);
    case 'code': return out.set(0, ROAD_TOP + 0.9, 0);
    case 'cal': return calFront.localToWorld(out.set(0, -0.62, 0));
    case 'button': return out.set(BTN.x, Y0 + 0.4, BTN.z);
    case 'boat': return out.copy(boat.position).add(_v.set(0, 0.1, 0));
    case 'zone': return out.set(0, 0.58, 0.44);
    case 'regress': return regG.localToWorld(out.set(0, 1.3, 0));
    case 'monitor': return out.copy(screenCenter);
    case 'scan': return out.set(1.6 * Math.sin(st * 0.09), 0.95, 0.5 * Math.cos(st * 0.05));
    case 'book': return bookG.localToWorld(out.set(0, 0.3, 0));
    case 'arrow': return bookG.localToWorld(out.copy(ARROW_LOCAL).add(_v.set(0, 0.25, 0)));
    case 'sky': return out.set(3 * Math.sin(st * 0.13), 3.2 + 1.5 * Math.sin(st * 0.21), 2 + 3 * Math.cos(st * 0.11));
    case 'counter': return counterG.getWorldPosition(out);
  }
  return out.copy(camera.position);
}
function lookTarget(ch, fr, st, out) {
  let name = 'cam';
  for (const [a, b, who, tgt] of LOOKS) if (fr >= a && fr < b && (who === 'all' || who === ch.key)) name = tgt;
  return targetPos(name, ch, st, out);
}
const ACTS = [
  [80, 'mug', 'surprise'], [82, 'duck', 'surprise'], [84, 'pad', 'surprise'], [152, 'mug', 'hop'],
  [216, 'all', 'tilt'], [248, 'all', 'surprise'], [271, 'duck', 'hop'], [283, 'duck', 'squash'],
  [295, 'duck', 'land'], [320, 'mug', 'hop'], [340, 'duck', 'land'], [380, 'all', 'surprise'],
  [413, 'mug', 'shake'], [438, 'all', 'surprise'], [484, 'all', 'tilt'], [486, 'mug', 'shake'],
  [514, 'pad', 'hop'], [540, 'pad', 'hop'], [603, 'all', 'surprise'], [658, 'all', 'surprise'],
  [660, 'duck', 'shake'], [683, 'mug', 'tilt'], [748, 'duck', 'surprise'], [786, 'mug', 'hop'],
  [902, 'all', 'hop'], [950, 'mug', 'gag'],
];
function act(ch, a) {
  const s = ch.st;
  if (a === 'surprise') { hop(ch, ch.hopV * 0.75); s.vtilt -= 2.4; }
  else if (a === 'hop') hop(ch, ch.hopV);
  else if (a === 'tilt') s.vtilt -= 2.4;
  else if (a === 'squash') s.vsq -= 3.2;
  else if (a === 'shake') s.shake = 0.9;
  else if (a === 'land') landFx(ch, 2.4);
  else if (a === 'gag' && ch.gag) ch.gag();
}
const EVENTS = new Map();
const on = (f, fn) => { const k = Math.round(f); if (!EVENTS.has(k)) EVENTS.set(k, []); EVENTS.get(k).push(fn); };
for (const [f, who, a] of ACTS) on(f, () => { for (const ch of cast) if (who === 'all' || who === ch.key) act(ch, a); });
on(5, () => dustRing(V3(-1.45, ROAD_TOP, 0.15), 6, 0.2, 0.12, 0.6, 0.05));
on(150, () => dustRing(V3(0, ROAD_TOP, 0), 7, 0.2, 0.18, 0.7, 0.06));
on(270, () => dustRing(BTN, 9, 0.48, 0.48, 0.9, 0.08));
on(319, () => dustRing(V3(0, ROAD_TOP, 0), 9, 0.8, 0.32, 0.8, 0.07));
on(379, () => splash(V3(0, 0, 0.67), 0.8));
on(483, () => splash(V3(0, 0, 0.5), 1.3));
on(602, () => dustRing(BOOK, 12, 0.45, 0.55, 1.3, 0.1));
on(706, () => dustRing(BTN, 9, 0.48, 0.48, 0.9, 0.08));
on(784, () => dustRing(V3(0, ROAD_TOP, 0), 7, 0.2, 0.18, 0.7, 0.06));
for (const tr of TRIPS) if (tr.splashT !== undefined) {
  const x = tr.xf + tr.dir * tr.v * FALL_D;
  on(tr.splashT, () => splash(V3(x, 0, tr.z)));
}

// ---------- camera rail (scene-time keys, Hermite with Catmull-Rom tangents) ----------
const CAM = [
  [0, [0.9, 7.4, 11.8], [0, 0.95, 0.4]],
  [64, [0.3, 4.4, 9.2], [-0.1, 0.85, 0.9]],
  [130, [-0.3, 4.2, 8.8], [0, 1.3, 0.6]],
  [215, [0.5, 8.0, 9.8], [0.1, 1.5, -0.6]],
  [252, [0.7, 7.4, 10.4], [0.2, 1.3, 0.1]],
  [288, [0.7, 3.0, 11.2], [0.1, 0.4, 1.6]],
  [330, [0.3, 3.05, 10.8], [0, 0.4, 1.5]],
  [375, [0.1, 2.6, 3.7], [0, 0.4, 0.4]],
  [404, [-0.2, 2.7, 3.9], [-0.05, 0.4, 0.4]],
  [432, [-0.4, 3.0, 7.4], [-0.2, 0.8, 0.9]],
  [490, [0.5, 4.6, 9.6], [0, 1.3, 0.6]],
  [548, [-1.5, 5.4, 9.6], [-1.7, 1.2, -1.1]],
  [590, [0.3, 6.8, 11.4], [0, 0.9, 0.3]],
  [614, [0.2, 4.0, 11.5], [0, 0.2, 0.5]],
  [638, [0.55, 4.2, 7.8], [0.45, 0.3, 3.4]],
  [664, [0.35, 3.9, 7.6], [0.4, 0.3, 3.4]],
  [702, [0.3, 6.4, 11.4], [0, 1.1, 0.4]],
  [745, [0.6, 10.4, 14.6], [0, 1.2, -0.2]],
  [795, [0.2, 3.3, 7.0], [0.25, 1.75, 0]],
  [810, [0.03, 3.3, 7.1], [0.2, 1.75, 0]],
  [826, [-0.15, 3.3, 7.3], [0.15, 1.75, 0]],
  [866, [0.4, 9.2, 11.6], [0, 1.3, -0.5]],
  [935, [0.7, 6.8, 11.6], [0, 0.95, 0.5]],
  [1007, [0.9, 7.4, 11.8], [0, 0.95, 0.4]],
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

// the monitor's gameplay camera: a slow orbit that speeds up while the testers replay the game
const GR = 4.3, GH = 2.5;
const GANG = new Map();
{
  let a = 0.5;
  for (let s = -PRE - 2; s < 1200; s++) { a += 0.006 + 0.03 * (sstep(505, 520, s) - sstep(575, 590, s)); GANG.set(s, a); }
}
const gameAngle = (s) => GANG.get(Math.round(s)) ?? 0.5;

// night time-lapse ("10 years")
const nightK = (s) => (s > 724 && s < 769 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * (s - 724)) / 15) : 0);

// ---------- pose: pure function of (frame, scene time) ----------
function poseWorld(f, s) {
  const T = Tof(s);
  splineAt(CAM, s, 'p', camera.position); splineAt(CAM, s, 't', _camT); camera.lookAt(_camT);

  const nk = nightK(s);
  amb.color.copy(AMB_DAY).lerp(AMB_NIGHT, nk); amb.intensity = Math.PI * lerp(0.45, 0.3, nk);
  sun.color.copy(SUN_DAY).lerp(SUN_NIGHT, nk); sun.intensity = Math.PI * lerp(0.55, 0.1, nk);
  const az = s > 724 && s < 769 ? Math.sin((2 * Math.PI * (s - 724)) / 15) * 1.1 : 0;
  sun.position.copy(SUN_POS).applyAxisAngle(THREE.Object3D.DEFAULT_UP, az);
  if (roomH.bulbMat) roomH.bulbMat.color.copy(bulbBase).lerp(BULB_ON, nk);

  // diorama colours: deck red while the bug lives, lime when named; the whole game lime on "the game"
  for (const m of dioMats) m.color.copy(m.userData.base);
  deckMat.color.lerp(RED, lin(71, 75, f) * (1 - lin(319, 323, f))).lerp(LIME, Math.max(flashK(f, 332, 16), flashK(f, 412, 16)));
  const dk = 0.75 * flashK(f, 539, 16);
  if (dk > 0) for (const m of dioMats) if (!m.userData.noFlash) m.color.lerp(LIME, dk);
  waterTex.offset.y = -s * 0.004;

  for (const c of cars) c.g.visible = false;
  for (const tr of TRIPS) {
    tripPose(tr, T, _cp);
    if (!_cp.vis) continue;
    const g = cars[tr.slot].g;
    g.visible = true; g.position.set(_cp.x, _cp.y, tr.z); g.rotation.set(0, tr.dir > 0 ? 0 : Math.PI, -_cp.pitch);
  }
  boat.position.set(0, WATER_TOP - 0.03 + 0.006 * Math.sin(s * 0.25), boatZ(T));
  boat.rotation.x = T >= 379 ? Math.sin((T - 379) * 0.55) * 0.22 * Math.exp(-(T - 379) / 30) : 0;

  let zs = popInOut(f, 382, 560);
  if (f >= 437 && f < 447) zs *= 1 + 0.1 * Math.sin((Math.PI * (f - 437)) / 10);
  zoneG.visible = zs > 1e-3; zoneG.scale.setScalar(Math.max(zs, 1e-3));

  // code placard: in on "one line of code", squashed into the deck as the patch, back on "the fix"
  let sxz = 0, sy = 0;
  if (f >= 150 && f < 280) sxz = sy = popScale(f - 150);
  else if (f >= 280 && f < 294) { const k = easeIn(lin(280, 294, f)); sxz = 1 - 0.3 * k; sy = 1 - k; }
  else if (f >= 784 && f < 826) sxz = sy = popScale(f - 784);
  else if (f >= 826 && f < 840) { const k = easeIn(lin(826, 840, f)); sxz = 1 - 0.3 * k; sy = 1 - k; }
  codeG.visible = sy > 1e-3; codeG.scale.set(Math.max(sxz, 1e-3), Math.max(sy, 1e-3), Math.max(sxz, 1e-3));
  codePlateM.color.copy(codePlateM.userData.base).lerp(LIME, Math.max(flashK(f, 155, 18), flashK(f, 788, 18)));
  const cs = popInOut(f, 796, 826);
  counterG.visible = cs > 1e-3; counterG.scale.setScalar(Math.max(cs, 1e-3));
  const cn = Math.round(10 * lin(796, 810, f));
  if (cn !== counterG.userData.n) { counterG.userData.n = cn; drawCounter(cn); }

  const rs = popInOut(f, 483, 522);
  regG.visible = rs > 1e-3; regG.scale.setScalar(Math.max(rs, 1e-3));

  const bs = f < 706 ? popInOut(f, 270, 352) : popInOut(f, 706, 740);
  btnG.visible = bs > 1e-3; btnG.scale.setScalar(Math.max(bs, 1e-3));
  plunger.position.y = plungerTop(s) - 0.08;
  plungerM.color.copy(plungerM.userData.base).lerp(LIME, flashK(f, 295, 14));

  // rulebook
  bookG.visible = f >= 594 && f < 704;
  let by = 0;
  if (f < 602) by = 5 * (1 - ((f - 594) / 8) ** 2);
  else if (f >= 694) { const k = lin(694, 704, f); by = 5 * (1 - (1 - k) ** 2); }
  bookG.position.y = Y0 - 0.006 + Math.max(0, by);
  bookG.rotation.y = f >= 694 ? 1.2 * easeIn(lin(694, 704, f)) : 0;
  bookBody.scale.y = 1 - 0.16 * Math.sin(Math.PI * lin(602, 608, f));
  let th = 0;
  if (f >= 612 && f < 684) th = 1.04 * Math.PI * easeInOut(lin(612, 628, f));
  else if (f >= 684) th = 1.04 * Math.PI * (1 - easeInOut(lin(684, 692, f)));
  coverPivot.rotation.z = -th;
  drawRules((f >= 632) + (f >= 638) + (f >= 644), f >= 657);
  const ar = popInOut(f, 657, 680);
  arrowG.visible = bookG.visible && ar > 1e-3;
  arrowG.scale.setScalar(Math.max(ar, 1e-3));
  arrowG.position.copy(ARROW_LOCAL); arrowG.position.x += 0.035 * (1 + Math.sin(f * 0.5));

  poseCalendar(s);
  boardM.color.copy(boardM.userData.base).lerp(LIME, flashK(f, 874, 20));

  // cast roots: the duck's jump onto the button; the pad turning to the monitor
  const D0 = V3(1.25, CH_Y + 0.006, 2.7), onBtn = (ss) => _p.set(BTN.x, Y0 + plungerTop(ss) - 0.004, BTN.z);
  if (s >= 286 && s < 295) { const k = (s - 286) / 9; duck.root.position.lerpVectors(D0, onBtn(s), k); duck.root.position.y += 0.9 * 4 * k * (1 - k); }
  else if (s >= 295 && s < 330) duck.root.position.copy(onBtn(s));
  else if (s >= 330 && s < 340) { const k = (s - 330) / 10; duck.root.position.lerpVectors(onBtn(s), D0, k); duck.root.position.y += 0.7 * 4 * k * (1 - k); }
  else duck.root.position.copy(D0);
}

// ---------- simulation (replay-to-seek) ----------
let simFrame = null;
function resetSim() {
  prng = mulberry32(31337); spawnN = 0;
  for (const p of parts) { p.alive = false; p.mesh.visible = false; }
  for (const ch of cast) resetChar(ch);
  simFrame = -PRE;
  poseWorld(-PRE, -PRE);
  scene.updateMatrixWorld();
}
function stepFrame(f) {
  if (f > FZ0 && f < FZ1) return;              // the freeze: nothing moves
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
function renderGame(s) {
  const a = gameAngle(s);
  gameCam.position.set(Math.sin(a) * GR, GH, Math.cos(a) * GR);
  gameCam.lookAt(0, 0.72, 0);
  outlineU.uRes.value.set(RT_W, RT_H); outlineU.uWidth.value = 1.6; hatchU.uPeriod.value = 7;
  renderer.setClearColor(GAME_CLEAR);
  renderer.setRenderTarget(rt);
  renderer.clear();
  renderer.render(scene, gameCam);
  renderer.setRenderTarget(null);
  outlineU.uRes.value.set(W, H); outlineU.uWidth.value = 2.6; hatchU.uPeriod.value = 11;
  renderer.setClearColor(ROOM_CLEAR);
}
const _tk = new THREE.Vector3();
const f0Canvas = document.createElement('canvas'); f0Canvas.width = W; f0Canvas.height = H;
let f0Ready = false;
function renderFrame(n) {
  seek(n);
  const s = sOf(n);
  poseWorld(n, s);
  scene.updateMatrixWorld();
  renderGame(s);
  renderer.render(scene, camera);
  const tp = calFront.localToWorld(_tk.set(0.72, -0.6, 0)).project(camera);
  fctx.globalAlpha = 1; fctx.globalCompositeOperation = 'source-over'; fctx.filter = 'none';
  if (window.__dbgGame) {
    outlineU.uRes.value.set(RT_W, RT_H); outlineU.uWidth.value = 1.6; hatchU.uPeriod.value = 7;
    renderer.setScissorTest(true); renderer.setScissor(0, H - RT_H, RT_W, RT_H); renderer.setViewport(0, H - RT_H, RT_W, RT_H);
    renderer.setClearColor(GAME_CLEAR); renderer.clear(); renderer.render(scene, gameCam);
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.setClearColor(ROOM_CLEAR);
    outlineU.uRes.value.set(W, H); outlineU.uWidth.value = 2.6; hatchU.uPeriod.value = 11;
  }
  fctx.drawImage(glCanvas, 0, 0, W, H);
  if (OVL) OVL.drawOverlays(fctx, n, { f0Canvas: f0Ready ? f0Canvas : null, night: 0.45 * nightK(s), calAt: [(tp.x + 1) / 2 * W, (1 - tp.y) / 2 * H] });
}

if (OVL) await OVL.initOverlays();
renderFrame(0);
f0Canvas.getContext('2d').drawImage(film, 0, 0);
f0Ready = true;
window.renderFrame = renderFrame;
window.__film = { scene, camera, poseWorld, sOf, seek, cast, dio, renderer };
{
  const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
  window.glInfo = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
}
window.filmReady = true;
