// Gamer-sites Short — content-short VERSION 1 (drawn SVG animals in a detailed 3D cafe).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H, clamp, easeInOut, easeIn, easeOut, lin } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays, captionInfo, assertCaptionSafeZone } from './overlays.js';

const glCanvas = document.querySelector('#gl');
const film = document.querySelector('#film');
const ctx = film.getContext('2d', { alpha: false });

const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: false, powerPreference: 'low-power' });
renderer.setSize(W, H, false);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.glInfo = (() => {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
})();

const scene = new THREE.Scene();
// Lifted cafe air — warm mid-tones so set dressing reads (not murky brown void)
scene.background = new THREE.Color('#4a5248');
scene.fog = new THREE.Fog('#4a5248', 28, 52);

const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 60);

const hemi = new THREE.HemisphereLight('#fff8f0', '#6a5a4c', 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d8', 1.9);
sun.position.set(5, 11, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 45;
sun.shadow.camera.left = -14;
sun.shadow.camera.right = 14;
sun.shadow.camera.top = 14;
sun.shadow.camera.bottom = -14;
scene.add(sun);
scene.add(new THREE.AmbientLight('#f0e6d4', 0.85));
const fill = new THREE.DirectionalLight('#e8f4f8', 0.85);
fill.position.set(-8, 6, 4);
scene.add(fill);
const rim = new THREE.DirectionalLight('#f5e0b0', 0.5);
rim.position.set(2, 4, -6);
scene.add(rim);

const loader = new THREE.TextureLoader();
const loadTex = (url) => new Promise((res, rej) => loader.load(url, (t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  res(t);
}, undefined, rej));

const CHAR_NAMES = ['quokka', 'redpanda', 'axolotl', 'pangolin', 'lemur'];
const POSES = ['neutral', 'talk', 'point', 'wow'];
const OCCLUSION_MAX = 0.15; // set geometry may cover at most 15% of the character plane

let room, chars = {}, shadowCatch;
let ready = false;
const raycaster = new THREE.Raycaster();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();

function makeBillboard(tex) {
  const g = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.8),
    // Billboard cards composite on top of the set (depthTest off) so chairs/desks never hide them.
    // Geometric occlusion is still measured via raycast in assertCharacterVisible.
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }),
  );
  plane.position.y = 0.9;
  plane.name = 'characterPlane';
  g.add(plane);
  return { group: g, plane, mats: { [tex.image?.src || '']: plane.material } };
}

function setPose(billboard, tex) {
  billboard.plane.material.map = tex;
  billboard.plane.material.needsUpdate = true;
}

function shotAt(f) {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].f0) return SHOTS[i];
  return SHOTS[0];
}

function poseFor(shot, f) {
  const local = f - shot.f0;
  if (shot.id === 'hook') {
    if (local > 35) return 'point';
    if (local > 10) return 'talk';
    return 'wow';
  }
  if (shot.id === 'steam') {
    if (local > 70) return 'point';
    if (local % 18 < 9) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'poki') {
    if (local > 100) return 'wow';
    if (local > 40 && local % 16 < 8) return 'talk';
    return 'point';
  }
  if (shot.id === 'roblox') {
    if (local > 80) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (local > 190) return 'wow';
  if (local > 140) return 'point';
  if (local % 16 < 8) return 'talk';
  return 'neutral';
}

/** Character stands well into the aisle in front of the desk (full body readable). */
function charLocal(shot) {
  // Slight side offset for variety, but never enough to hide behind a partition
  const side = ({ hook: -0.15, steam: 0.2, poki: -0.2, roblox: 0.15, twitch: -0.1 })[shot.id] || 0;
  // z ≥ 2.15 keeps the desk top behind the feet in projection (no neck-gap slab)
  return { side, z: 2.2, scale: shot.id === 'hook' ? 1.0 : 0.95 };
}

/**
 * Motivated camera landings (offsets relative to the active character).
 * Land 0–4 frames before the VO word; move kinds never repeat back-to-back
 * (cut at shot opens resets). Move durations 12–30 frames.
 *
 * Beat moves:
 *   hook   cut → drop → orbit → push
 *   steam  cut → whip → follow → push → orbit
 *   poki   cut → crane → orbit → low → pull
 *   roblox cut → follow → push → crane → orbit
 *   twitch cut → drop → orbit → whip → push → pull
 */
const LANDINGS = [
  // —— hook / WEB MAP ("What websites…") ——
  { f: 0,   dur: 1,  kind: 'cut',    dx: 0.55, dy: 3.6,  dz: 5.6,  lx: -0.06, ly: 0.75, lz: -0.35, vo: 'open' },
  { f: 16,  dur: 16, kind: 'drop',   dx: 0.22, dy: 1.48, dz: 4.25, lx: -0.04, ly: 1.02, lz: -0.12, vo: 'websites' },
  { f: 40,  dur: 18, kind: 'orbit',  dx: -0.42, dy: 1.5, dz: 4.15, lx: 0.06, ly: 1.05, lz: -0.1, vo: 'gamers' },
  { f: 64,  dur: 14, kind: 'push',   dx: 0.12, dy: 1.42, dz: 4.05, lx: -0.02, ly: 1.05, lz: -0.08, vo: 'most' },

  // —— steam / PC LIBRARY ("Number five, Steam…") ——
  { f: 75,  dur: 1,  kind: 'cut',    dx: 1.15, dy: 1.55, dz: 5.1,  lx: -0.12, ly: 0.95, lz: -0.2, vo: 'Number' },
  { f: 97,  dur: 20, kind: 'whip',   dx: 0.28, dy: 1.18, dz: 4.15, lx: -0.04, ly: 1.12, lz: -0.1, vo: 'Steam' },
  { f: 128, dur: 18, kind: 'follow', dx: -0.62, dy: 1.46, dz: 4.25, lx: 0.1, ly: 1.02, lz: -0.14, vo: 'far' },
  { f: 162, dur: 16, kind: 'push',   dx: 0.18, dy: 1.4,  dz: 3.95, lx: 0, ly: 1.08, lz: -0.08, vo: 'best games' },
  { f: 186, dur: 14, kind: 'orbit',  dx: 0.72, dy: 1.52, dz: 4.15, lx: -0.08, ly: 1.05, lz: -0.1, vo: 'in' },

  // —— poki / BROWSER PLAY ("Number four, Poki…") ——
  { f: 196, dur: 1,  kind: 'cut',    dx: -0.95, dy: 1.25, dz: 4.9, lx: 0.12, ly: 1.0, lz: -0.15, vo: 'Number' },
  { f: 219, dur: 22, kind: 'crane',  dx: -0.28, dy: 1.58, dz: 4.15, lx: 0.05, ly: 1.08, lz: -0.1, vo: 'Poki' },
  { f: 268, dur: 18, kind: 'orbit',  dx: 0.58, dy: 1.48, dz: 4.25, lx: -0.05, ly: 1.05, lz: -0.12, vo: 'browser' },
  { f: 316, dur: 20, kind: 'low',    dx: 0.12, dy: 1.05, dz: 3.95, lx: 0, ly: 1.22, lz: -0.05, vo: 'Mobile' },
  { f: 346, dur: 16, kind: 'pull',   dx: -0.38, dy: 1.62, dz: 4.55, lx: 0.05, ly: 1.0, lz: -0.18, vo: 'browser!' },

  // —— roblox / BLOCK WORLD ("Number three, roblox.com…") ——
  { f: 363, dur: 1,  kind: 'cut',    dx: -1.05, dy: 1.62, dz: 5.15, lx: 0.14, ly: 0.92, lz: -0.22, vo: 'Number' },
  { f: 391, dur: 24, kind: 'follow', dx: 0.22, dy: 1.42, dz: 4.1,  lx: -0.04, ly: 1.06, lz: -0.1, vo: 'roblox.com' },
  { f: 436, dur: 18, kind: 'push',   dx: 0.08, dy: 1.38, dz: 3.95, lx: 0, ly: 1.1, lz: -0.08, vo: 'most played' },
  { f: 468, dur: 20, kind: 'crane',  dx: 0.48, dy: 2.05, dz: 4.45, lx: -0.05, ly: 1.0, lz: -0.18, vo: 'platform' },
  { f: 494, dur: 14, kind: 'orbit',  dx: -0.58, dy: 1.5,  dz: 4.15, lx: 0.08, ly: 1.05, lz: -0.1, vo: 'time' },

  // —— twitch / LIVE WATCH ("And finally Number two… Twitch") ——
  { f: 507, dur: 1,  kind: 'cut',    dx: 0.85, dy: 3.15, dz: 5.45, lx: -0.1, ly: 0.82, lz: -0.28, vo: 'And' },
  { f: 534, dur: 24, kind: 'drop',   dx: 0.18, dy: 1.45, dz: 4.2,  lx: -0.03, ly: 1.05, lz: -0.12, vo: 'Number two' },
  { f: 575, dur: 18, kind: 'orbit',  dx: -0.52, dy: 1.5,  dz: 4.1,  lx: 0.06, ly: 1.08, lz: -0.1, vo: 'platform' },
  { f: 648, dur: 22, kind: 'whip',   dx: 0.32, dy: 1.4,  dz: 4.0,  lx: -0.04, ly: 1.08, lz: -0.08, vo: 'livestreams' },
  { f: 701, dur: 20, kind: 'push',   dx: 0.06, dy: 1.38, dz: 3.9,  lx: 0, ly: 1.1, lz: -0.05, vo: 'Twitch' },
  { f: 724, dur: 14, kind: 'pull',   dx: 0.18, dy: 1.5,  dz: 4.2,  lx: 0, ly: 1.05, lz: -0.1, vo: 'hold' },
];

function copyPose(p) {
  return { dx: p.dx, dy: p.dy, dz: p.dz, lx: p.lx, ly: p.ly, lz: p.lz, fov: p.fov || 40 };
}

function lerpPose(a, b, t) {
  return {
    dx: lin(a.dx, b.dx, t),
    dy: lin(a.dy, b.dy, t),
    dz: lin(a.dz, b.dz, t),
    lx: lin(a.lx, b.lx, t),
    ly: lin(a.ly, b.ly, t),
    lz: lin(a.lz, b.lz, t),
    fov: lin(a.fov || 40, b.fov || 40, t),
  };
}

function movePose(from, to, kind, u) {
  if (kind === 'cut' || from === to) return copyPose(to);
  const e = easeInOut(u);
  if (kind === 'push' || kind === 'pull' || kind === 'follow') {
    return lerpPose(from, to, e);
  }
  if (kind === 'orbit') {
    const mid = lerpPose(from, to, 0.5);
    mid.dx += (to.dx >= from.dx ? 1 : -1) * 0.55;
    mid.dy += 0.12;
    mid.dz += 0.15;
    if (u < 0.5) return lerpPose(from, mid, easeInOut(u * 2));
    return lerpPose(mid, to, easeInOut((u - 0.5) * 2));
  }
  if (kind === 'crane') {
    const mid = lerpPose(from, to, 0.45);
    mid.dy = Math.max(from.dy, to.dy) + 0.45;
    mid.dz = lin(from.dz, to.dz, 0.35);
    if (u < 0.55) return lerpPose(from, mid, easeInOut(u / 0.55));
    return lerpPose(mid, to, easeInOut((u - 0.55) / 0.45));
  }
  if (kind === 'drop') {
    const hi = copyPose(to);
    hi.dy = to.dy + 1.15;
    hi.dz = to.dz + 0.55;
    hi.ly = to.ly + 0.2;
    if (u < 0.35) return lerpPose(from, hi, easeOut(u / 0.35));
    return lerpPose(hi, to, easeInOut((u - 0.35) / 0.65));
  }
  if (kind === 'low') {
    const mid = lerpPose(from, to, 0.4);
    mid.dy = Math.min(from.dy, to.dy) - 0.25;
    mid.ly = to.ly + 0.15;
    if (u < 0.45) return lerpPose(from, mid, easeInOut(u / 0.45));
    return lerpPose(mid, to, easeInOut((u - 0.45) / 0.55));
  }
  if (kind === 'whip') {
    const side = (to.dx >= from.dx ? 1 : -1);
    const arc = lerpPose(from, to, 0.5);
    arc.dx += side * 1.35;
    arc.dy += 0.25;
    arc.dz = lin(from.dz, to.dz, 0.4) - 0.2;
    arc.lx += side * 0.4;
    if (u < 0.22) return lerpPose(from, lerpPose(from, arc, 0.35), easeIn(u / 0.22));
    if (u < 0.72) return lerpPose(lerpPose(from, arc, 0.35), arc, easeInOut((u - 0.22) / 0.5));
    return lerpPose(arc, to, easeOut((u - 0.72) / 0.28));
  }
  return lerpPose(from, to, e);
}

/** Continuous drift so holds never exceed ~12f. */
function driftPose(pose, f, landF) {
  const age = Math.max(0, f - landF);
  const o = copyPose(pose);
  const turn = Math.sin((f + landF) * 0.045) * 0.012;
  const rise = age * 0.0045;
  const push = age * 0.007;
  o.dx += turn;
  o.dy += Math.min(0.18, rise);
  o.dz = Math.max(3.55, o.dz - Math.min(0.35, push));
  o.lx += turn * 0.25;
  return o;
}

function resolveOffsets(shot, f) {
  let prev = LANDINGS[0], next = null;
  for (let i = 0; i < LANDINGS.length; i++) {
    if (LANDINGS[i].f <= f) prev = LANDINGS[i];
    else { next = LANDINGS[i]; break; }
  }
  if (prev.f < shot.f0) {
    const open = LANDINGS.find((L) => L.f === shot.f0);
    if (open && f >= shot.f0) prev = open;
  }

  if (next && next.kind !== 'cut') {
    const start = next.f - next.dur;
    if (f >= start && f <= next.f) {
      const from = (start <= prev.f) ? prev : driftPose(prev, start, prev.f);
      const u = (f - start) / Math.max(1, next.dur);
      return movePose(from, next, next.kind, clamp(u));
    }
  }

  if (next && next.kind === 'cut' && f >= next.f) {
    return copyPose(next);
  }
  return driftPose(prev, f, prev.f);
}

function cameraFor(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const cl = charLocal(shot);
  const charX = booth.x + cl.side;
  const charZ = booth.z + cl.z;
  const r = resolveOffsets(shot, f);
  const wantFov = r.fov || 40;
  if (Math.abs(camera.fov - wantFov) > 0.05) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }
  return {
    x: charX + r.dx,
    y: r.dy,
    z: charZ + r.dz,
    lx: charX + r.lx,
    ly: r.ly,
    lz: charZ + r.lz,
  };
}

/** Expose landings for QA / reports. */
export function cameraMoveList() {
  return LANDINGS.map((L) => {
    const shot = SHOTS.find((s) => L.f >= s.f0 && L.f < s.f1) || SHOTS[SHOTS.length - 1];
    return { f: L.f, dur: L.dur, kind: L.kind, vo: L.vo, shot: shot.id, booth: shot.booth };
  });
}

function placeCharacter(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const name = shot.char;
  for (const n of CHAR_NAMES) chars[n].group.visible = false;
  const bill = chars[name];
  bill.group.visible = true;
  setPose(bill, chars[name].poses[poseFor(shot, f)]);
  const bob = Math.sin(f * 0.21) * 0.025;
  const lean = Math.sin(f * 0.09) * 0.03;
  const cl = charLocal(shot);
  bill.group.scale.set(cl.scale, cl.scale, cl.scale);
  bill.group.position.set(booth.x + lean + cl.side, bob, booth.z + cl.z);
  bill.group.rotation.y = Math.atan2(
    camera.position.x - bill.group.position.x,
    camera.position.z - bill.group.position.z,
  );
  shadowCatch.position.set(bill.group.position.x, 0.035, bill.group.position.z);
  shadowCatch.scale.setScalar(cl.scale);
  shadowCatch.visible = true;
}

function isCharacterHit(obj) {
  let o = obj;
  while (o) {
    if (o.name === 'characterPlane') return true;
    o = o.parent;
  }
  return false;
}

function isIgnoredHit(obj) {
  let o = obj;
  while (o) {
    if (o === shadowCatch) return true;
    if (o.isLight) return true;
    o = o.parent;
  }
  return false;
}

/**
 * Sample the character plane with rays from the camera.
 * Returns the fraction of samples whose nearest hit is set geometry (not the character).
 */
function measureCharacterOcclusion(bill) {
  bill.plane.updateWorldMatrix(true, false);
  const mw = 1.35 * bill.group.scale.x;
  const mh = 1.8 * bill.group.scale.y;
  // Sample a dense grid over the plane (skip extreme edges / transparent margins a bit)
  const nu = 9, nv = 11;
  let total = 0, occluded = 0;
  const camPos = camera.position;
  for (let iv = 1; iv < nv; iv++) {
    for (let iu = 1; iu < nu; iu++) {
      const u = (iu / nu) - 0.5;
      const v = (iv / nv) - 0.5;
      // local plane point (geometry is centered at plane.position.y = 0.9 within group)
      _v.set(u * mw, 0.9 + v * mh, 0);
      bill.group.localToWorld(_v);
      _n.copy(_v).sub(camPos).normalize();
      raycaster.set(camPos, _n);
      raycaster.far = camPos.distanceTo(_v) + 0.35;
      const hits = raycaster.intersectObjects(scene.children, true)
        .filter((h) => !isIgnoredHit(h.object));
      if (!hits.length) continue;
      total++;
      if (!isCharacterHit(hits[0].object)) occluded++;
    }
  }
  return total ? occluded / total : 0;
}

export function assertCharacterVisible(frames) {
  const results = [];
  const fails = [];
  for (const shot of SHOTS) {
    const samples = [
      shot.f0,
      Math.floor((shot.f0 + shot.f1 - 1) / 2),
      shot.f1 - 1,
    ];
    for (const f of samples) {
      if (frames && !frames.includes(f) && frames !== 'all') continue;
      const cam = cameraFor(shot, f);
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);
      placeCharacter(shot, f);
      // Ensure matrices are current for raycasts
      scene.updateMatrixWorld(true);
      const bill = chars[shot.char];
      const frac = measureCharacterOcclusion(bill);
      const row = { shot: shot.id, f, occlusion: +frac.toFixed(3) };
      results.push(row);
      if (frac > OCCLUSION_MAX + 1e-6) fails.push(row);
    }
  }
  if (fails.length) {
    throw new Error(
      `Character occlusion > ${(OCCLUSION_MAX * 100).toFixed(0)}%:\n`
      + fails.map((r) => `  ${r.shot} f${r.f}: ${(r.occlusion * 100).toFixed(1)}%`).join('\n'),
    );
  }
  return results;
}

function renderFrame(f) {
  f = ((f % FRAMES) + FRAMES) % FRAMES | 0;
  const shot = shotAt(f);
  const cam = cameraFor(shot, f);
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(cam.lx, cam.ly, cam.lz);
  placeCharacter(shot, f);

  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  drawOverlays(ctx, f);
}

async function boot() {
  const screens = {
    map: await loadTex('assets/screens/map.png'),
    library: await loadTex('assets/screens/library.png'),
    arcade: await loadTex('assets/screens/arcade.png'),
    blocks: await loadTex('assets/screens/blocks.png'),
    live: await loadTex('assets/screens/live.png'),
  };
  const built = buildRoom(screens);
  room = built;
  shadowCatch = built.shadowCatch;
  scene.add(built.root);

  for (const name of CHAR_NAMES) {
    const poses = {};
    for (const p of POSES) {
      poses[p] = await loadTex(`assets/chars/${name}-${p}.png`);
    }
    const bill = makeBillboard(poses.neutral);
    bill.poses = poses;
    scene.add(bill.group);
    chars[name] = bill;
  }

  await initOverlays();
  const occl = assertCharacterVisible('all');
  window.captionInfo = captionInfo;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
  window.assertCharacterVisible = assertCharacterVisible;
  window.cameraMoveList = cameraMoveList;
  window.occlusionInfo = occl;
  ready = true;
  window.filmReady = true;
  window.renderFrame = renderFrame;
  if (!window.__HEADLESS) {
    let f = 0;
    const tick = () => { renderFrame(f); f = (f + 1) % FRAMES; requestAnimationFrame(tick); };
    tick();
  } else {
    renderFrame(0);
  }
}

boot().catch((e) => { console.error(e); window.filmReady = false; window.filmBootError = String(e && e.stack || e); });
