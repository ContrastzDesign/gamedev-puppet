// Two Minecrafts Short — content-short VERSION 1 (drawn SVG animals in detailed 3D worlds).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS, LANDINGS } from './beats.js';
import { W, H, clamp, easeInOut, lin } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays, captionInfo, assertCaptionSafeZone, captionBoxes } from './overlays.js';

const glCanvas = document.querySelector('#gl');
const film = document.querySelector('#film');
const ctx = film.getContext('2d', { alpha: false });

const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: false, powerPreference: 'low-power' });
renderer.setSize(W, H, false);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Soft contact blob under characters only — map shadows on SwiftShader draw black scratch lines on floors.
renderer.shadowMap.enabled = false;

window.glInfo = (() => {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
})();

const scene = new THREE.Scene();
scene.background = new THREE.Color('#5a5a60');
scene.fog = new THREE.Fog('#5a5a60', 30, 55);

const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 60);

const hemi = new THREE.HemisphereLight('#fff8f0', '#6a5a4c', 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d8', 1.9);
sun.position.set(5, 11, 7);
sun.castShadow = false;
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

const CHAR_NAMES = ['hamster', 'koala', 'panda', 'mole', 'lynx'];
const POSES = ['neutral', 'talk', 'point', 'wow'];
const OCCLUSION_MAX = 0.15;

let room, chars = {}, shadowCatch;
let ready = false;
const raycaster = new THREE.Raycaster();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _p = new THREE.Vector3();
const _box = new THREE.Box3();

function makeBillboard(tex) {
  const g = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.8),
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
    if (local > 25) return 'point';
    if (local > 8) return 'talk';
    return 'wow';
  }
  if (shot.id === 'farm') {
    if (local > 90) return 'wow';
    if (local > 50) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'merge') {
    if (local > 20) return 'point';
    if (local % 10 < 5) return 'talk';
    return 'wow';
  }
  if (shot.id === 'java') {
    if (local > 70) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'bedrock') {
    if (local > 30) return 'wow';
    if (local % 12 < 6) return 'talk';
    return 'point';
  }
  if (shot.id === 'parity') {
    if (local > 80) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'library') {
    if (local > 100) return 'wow';
    if (local > 40) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'arena') {
    if (local % 12 < 6) return 'wow';
    return 'talk';
  }
  // finale
  if (local > 40) return 'point';
  if (local % 14 < 7) return 'talk';
  return 'wow';
}

/** Character stands readable mid-frame (~40-50% height). */
function charLocal(shot) {
  const side = ({
    hook: 0.05, farm: 0.08, merge: 0.0, java: -0.08,
    bedrock: 0.1, parity: 0.0, library: -0.05, arena: 0.05, finale: 0.0,
  })[shot.id] || 0;
  const scale = (shot.id === 'hook' || shot.id === 'farm' || shot.id === 'finale' || shot.id === 'arena')
    ? 1.18 : (shot.id === 'merge' ? 1.05 : 1.0);
  const z = ({
    bedroom: 2.15, merge: 2.35, java: 2.25, bedrock: 2.3,
    yard: 2.4, library: 2.2, arena: 2.35, store: 2.2,
  })[shot.booth] || 2.15;
  return { side, z, scale };
}

/**
 * Ricardo content-short camera rules:
 * - Fly to whatever the VO names; land 0–4 frames before the word (see LANDINGS).
 * - Vary move kind; never the same kind twice in a row.
 * - Moves 12–30 frames, eased. Whips: EASE → ARC → land.
 * - Never stop: drift between landings. No hold > 12 frames.
 * - Characters chest-up or full figure. Signs stay inside the portrait frame.
 */
function setFovFor(shot) {
  const wantFov = (shot.id === 'hook' || shot.id === 'farm' || shot.id === 'finale') ? 42
    : (shot.id === 'arena' || shot.id === 'parity') ? 44
    : 40;
  if (camera.fov !== wantFov) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }
}

function lerpPose(a, b, t) {
  return {
    x: lin(a.x, b.x, t), y: lin(a.y, b.y, t), z: lin(a.z, b.z, t),
    lx: lin(a.lx, b.lx, t), ly: lin(a.ly, b.ly, t), lz: lin(a.lz, b.lz, t),
  };
}

/** Hero framing pose for a landing aim inside the active shot's booth. */
function landingPose(shot, landing) {
  const booth = room.boothMeta[shot.booth];
  const cl = charLocal(shot);
  const cx = booth.x + cl.side;
  const cz = booth.z + cl.z;
  const chest = landing.frame === 'chest';
  const dist = chest ? 4.15 : 5.25;
  const camY = chest ? 1.48 : 1.68;
  const lookY = chest ? 1.35 : 1.28;

  // Aim offsets (local booth space) — kept near center so signs stay in portrait FOV.
  const aims = {
    char:     { lx: 0,     ly: lookY, lz: -0.25, dx: 0.04,  dy: 0,    dz: dist },
    room:     { lx: 0,     ly: 1.45,  lz: -0.6,  dx: 0.08,  dy: 0.15, dz: dist + 0.35 },
    tv:       { lx: 0.15,  ly: 1.55,  lz: -1.4,  dx: 0.1,   dy: 0.05, dz: dist + 0.1 },
    javaSign: { lx: -0.35, ly: 1.7,   lz: -1.5,  dx: -0.12, dy: 0.12, dz: dist + 0.15 },
    bedSign:  { lx: 0.4,   ly: 1.7,   lz: -1.5,  dx: 0.18,  dy: 0.1,  dz: dist + 0.1 },
    pillars:  { lx: 0,     ly: 1.5,   lz: -0.8,  dx: 0,     dy: 0.08, dz: dist + 0.45 },
    crt:      { lx: -0.15, ly: 1.35,  lz: -1.2,  dx: 0.05,  dy: 0.02, dz: dist - 0.15 },
    devices:  { lx: 0.2,   ly: 1.35,  lz: -0.9,  dx: 0.15,  dy: 0.05, dz: dist + 0.1 },
    scaffold: { lx: 0,     ly: 1.55,  lz: -0.9,  dx: 0.1,   dy: 0.18, dz: dist + 0.4 },
    match:    { lx: 0,     ly: 1.75,  lz: -1.6,  dx: 0,     dy: 0.15, dz: dist + 0.2 },
    parity:   { lx: 0,     ly: 1.85,  lz: -1.6,  dx: 0.05,  dy: 0.2,  dz: dist + 0.15 },
    shelves:  { lx: 0,     ly: 1.7,   lz: -1.4,  dx: -0.1,  dy: 0.12, dz: dist + 0.25 },
    worlds:   { lx: 0,     ly: 1.65,  lz: -1.3,  dx: 0.08,  dy: 0.1,  dz: dist + 0.2 },
    lever:    { lx: 0,     ly: 1.2,   lz: 0.1,   dx: 0.05,  dy: -0.05, dz: dist - 0.2 },
    banners:  { lx: 0,     ly: 1.7,   lz: -1.5,  dx: 0,     dy: 0.15, dz: dist + 0.3 },
    box:      { lx: 0,     ly: 1.25,  lz: -0.6,  dx: 0.05,  dy: 0,    dz: dist },
    towers:   { lx: 0,     ly: 1.7,   lz: -1.6,  dx: 0,     dy: 0.18, dz: dist + 0.2 },
  };
  const a = aims[landing.aim] || aims.char;
  return {
    x: cx + a.dx,
    y: camY + a.dy,
    z: cz + a.dz,
    lx: cx + a.lx,
    ly: a.ly,
    lz: cz + a.lz,
  };
}

/** Start pose for a move kind, relative to the landing pose. */
function startPoseFor(kind, end, seed) {
  const s = end;
  switch (kind) {
    case 'push':
      return { ...s, z: s.z + 0.95, y: s.y + 0.12, x: s.x + 0.18 };
    case 'pull':
      return { ...s, z: s.z - 0.55, y: s.y - 0.05, x: s.x - 0.12 };
    case 'drop':
      return { ...s, y: s.y + 1.15, z: s.z + 0.35, ly: s.ly + 0.35 };
    case 'crane':
      return { ...s, y: s.y - 0.55, z: s.z + 0.7, x: s.x + 0.2 };
    case 'orbit':
      return { ...s, x: s.x - 0.55, z: s.z + 0.25, y: s.y + 0.08 };
    case 'follow':
      return { ...s, x: s.x - 0.7, z: s.z + 0.15 };
    case 'low':
      return { ...s, y: s.y + 0.45, z: s.z + 0.5, ly: s.ly - 0.15 };
    case 'whip':
      return { ...s, x: s.x + (seed % 2 ? 0.85 : -0.85), y: s.y + 0.2, z: s.z + 0.4 };
    case 'cut':
      return { ...s }; // unused — cut jumps
    default:
      return { ...s, z: s.z + 0.7 };
  }
}

/** Whip: EASE → ARC → land. Returns eased t in 0..1 with arc lateral offset factor. */
function whipProgress(u) {
  // u in 0..1 along the move
  let t;
  if (u < 0.32) t = easeInOut(u / 0.32) * 0.22;
  else if (u < 0.68) t = 0.22 + easeInOut((u - 0.32) / 0.36) * 0.55;
  else t = 0.77 + easeInOut((u - 0.68) / 0.32) * 0.23;
  const arc = Math.sin(Math.PI * clamp(u)) * 0.35; // peak mid-move
  return { t, arc };
}

function driftPose(base, framesSinceLand, seed) {
  // Continuous micro-motion — never a hold > 12 frames.
  const d = framesSinceLand;
  const push = (d % 48) / 48;
  const rise = Math.sin(d * 0.07 + seed) * 0.04;
  const turn = Math.sin(d * 0.045 + seed * 1.7) * 0.06;
  return {
    x: base.x + turn,
    y: base.y + rise + push * 0.03,
    z: base.z - push * 0.12,
    lx: base.lx + turn * 0.3,
    ly: base.ly + rise * 0.4,
    lz: base.lz,
  };
}

function cameraFor(shot, f) {
  setFovFor(shot);
  // Landings that belong to this shot (or global timeline — filter by shot id).
  const mine = LANDINGS.filter((L) => L.shot === shot.id);
  if (!mine.length) {
    const booth = room.boothMeta[shot.booth];
    const cl = charLocal(shot);
    return landingPose(shot, { aim: 'char', frame: 'full' });
  }

  // Find surrounding landings on the global timeline for this shot.
  let prev = null;
  let next = null;
  for (const L of mine) {
    if (L.landF <= f) prev = L;
    if (L.landF > f && !next) next = L;
  }

  const seed = shot.f0;
  if (!prev && next) {
    // Before first landing: ease from a wide start into the first move window.
    const end = landingPose(shot, next);
    const start = startPoseFor(next.kind === 'cut' ? 'push' : next.kind, end, seed);
    const moveStart = next.landF - next.len;
    if (f < moveStart) {
      return driftPose(start, f - shot.f0, seed);
    }
    if (next.kind === 'cut') return end;
    const u = clamp((f - moveStart) / next.len);
    return interpolateMove(next.kind, start, end, u, seed);
  }

  if (prev && !next) {
    // After last landing in this shot: drift (never park).
    const base = landingPose(shot, prev);
    return driftPose(base, f - prev.landF, seed + prev.landF);
  }

  // Between prev and next.
  const end = landingPose(shot, next);
  const prevPose = landingPose(shot, prev);
  const moveStart = next.landF - next.len;

  if (f < moveStart) {
    // Drift from prev landing — cap static feel by continuous drift.
    return driftPose(prevPose, f - prev.landF, seed + prev.landF);
  }

  if (next.kind === 'cut') {
    return f >= next.landF - 1 ? end : driftPose(prevPose, f - prev.landF, seed);
  }

  const start = startPoseFor(next.kind, end, seed + next.landF);
  // Blend start from where drift actually is, for continuity.
  const from = lerpPose(prevPose, start, 0.55);
  const u = clamp((f - moveStart) / next.len);
  return interpolateMove(next.kind, from, end, u, seed + next.landF);
}

function interpolateMove(kind, start, end, u, seed) {
  if (kind === 'whip') {
    const { t, arc } = whipProgress(u);
    const pose = lerpPose(start, end, t);
    const side = (seed % 2) ? 1 : -1;
    pose.x += arc * side;
    pose.y += arc * 0.25;
    return pose;
  }
  if (kind === 'orbit') {
    const t = easeInOut(u);
    // Arc around the look-at while pushing in.
    const pose = lerpPose(start, end, t);
    pose.x += Math.sin(Math.PI * t) * 0.28;
    return pose;
  }
  if (kind === 'follow') {
    const t = easeInOut(u);
    const pose = lerpPose(start, end, t);
    pose.x = lin(start.x, end.x, easeInOut(clamp(u * 1.15)));
    return pose;
  }
  // push / pull / drop / crane / low — eased lerp
  return lerpPose(start, end, easeInOut(u));
}

function syncBoothVisibility(shot) {
  const b = room.booths;
  for (const id of Object.keys(b)) {
    b[id].visible = (id === shot.booth);
  }
}

function placeCharacter(shot, f) {
  syncBoothVisibility(shot);
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

function measureCharacterOcclusion(bill) {
  bill.plane.updateWorldMatrix(true, false);
  const mw = 1.35 * bill.group.scale.x;
  const mh = 1.8 * bill.group.scale.y;
  const nu = 9, nv = 11;
  let total = 0, occluded = 0;
  const camPos = camera.position;
  for (let iv = 1; iv < nv; iv++) {
    for (let iu = 1; iu < nu; iu++) {
      const u = (iu / nu) - 0.5;
      const v = (iv / nv) - 0.5;
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

function collectSignScreenMeshes() {
  const out = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.userData && obj.userData.isSignOrScreen) out.push(obj);
  });
  return out;
}

function meshScreenBBox(mesh) {
  mesh.updateWorldMatrix(true, false);
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  _box.copy(geo.boundingBox);
  _box.expandByScalar(0.02);
  const corners = [
    new THREE.Vector3(_box.min.x, _box.min.y, _box.min.z),
    new THREE.Vector3(_box.min.x, _box.min.y, _box.max.z),
    new THREE.Vector3(_box.min.x, _box.max.y, _box.min.z),
    new THREE.Vector3(_box.min.x, _box.max.y, _box.max.z),
    new THREE.Vector3(_box.max.x, _box.min.y, _box.min.z),
    new THREE.Vector3(_box.max.x, _box.min.y, _box.max.z),
    new THREE.Vector3(_box.max.x, _box.max.y, _box.min.z),
    new THREE.Vector3(_box.max.x, _box.max.y, _box.max.z),
  ];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let any = false;
  for (const c of corners) {
    c.applyMatrix4(mesh.matrixWorld);
    _p.copy(c).project(camera);
    if (_p.z < -1 || _p.z > 1) continue;
    if (_p.x < -1.15 || _p.x > 1.15 || _p.y < -1.15 || _p.y > 1.15) continue;
    const sx = (_p.x * 0.5 + 0.5) * W;
    const sy = (-_p.y * 0.5 + 0.5) * H;
    minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
    minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    any = true;
  }
  if (!any) return null;
  if (maxX - minX < 8 || maxY - minY < 8) return null;
  return { left: minX, right: maxX, top: minY, bottom: maxY };
}

function boxesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function assertCaptionClearOfSigns() {
  const meshes = collectSignScreenMeshes();
  if (!meshes.length) throw new Error('No sign/screen meshes tagged for caption overlap check');
  const boxes = captionBoxes();
  const fails = [];
  for (const cap of boxes) {
    const mid = Math.floor((cap.f + cap.end) / 2);
    const samples = [cap.f + 4, mid, Math.max(cap.f + 4, cap.end - 4)];
    for (const f of samples) {
      if (f < cap.f || f > cap.end) continue;
      const shot = shotAt(f);
      const cam = cameraFor(shot, f);
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);
      placeCharacter(shot, f);
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      for (const mesh of meshes) {
        let hidden = false;
        let o = mesh;
        while (o) {
          if (o.visible === false) { hidden = true; break; }
          o = o.parent;
        }
        if (hidden) continue;
        const mb = meshScreenBBox(mesh);
        if (!mb) continue;
        if (boxesOverlap(cap, mb)) {
          fails.push({
            f,
            text: cap.text,
            sign: mesh.userData.signText || mesh.name,
            cap: {
              l: +cap.left.toFixed(1), r: +cap.right.toFixed(1),
              t: +cap.top.toFixed(1), b: +cap.bottom.toFixed(1),
            },
            mesh: {
              l: +mb.left.toFixed(1), r: +mb.right.toFixed(1),
              t: +mb.top.toFixed(1), b: +mb.bottom.toFixed(1),
            },
          });
        }
      }
    }
  }
  const seen = new Set();
  const uniq = fails.filter((row) => {
    const k = `${row.text}|${row.sign}|${row.f}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (uniq.length) {
    throw new Error(
      `Caption overlaps sign/screen mesh:\n`
      + uniq.map((r) => `  f${r.f} "${r.text}" vs ${r.sign} cap=[${r.cap.l},${r.cap.t}-${r.cap.r},${r.cap.b}] mesh=[${r.mesh.l},${r.mesh.t}-${r.mesh.r},${r.mesh.b}]`).join('\n'),
    );
  }
  return { checked: boxes.length, meshes: meshes.length, samples: boxes.length * 3 };
}

/** Signs/labels must sit fully inside the frame (80 px safe margin). Screens excluded. */
const SIGN_EDGE_MARGIN = 80;
export function assertSignsInFrame() {
  const fails = [];
  for (const shot of SHOTS) {
    const samples = [
      shot.f0,
      Math.floor((shot.f0 + shot.f1 - 1) / 2),
      shot.f1 - 1,
    ];
    for (const f of samples) {
      const cam = cameraFor(shot, f);
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.lx, cam.ly, cam.lz);
      placeCharacter(shot, f);
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const meshes = collectSignScreenMeshes().filter((m) => {
        const t = (m.userData.signText || '').toUpperCase();
        // Only text signs — skip in-scene screens/TV/monitors/devices
        if (!t || /^(TV|MONITOR|CRT|PHONE|TABLET|CHECKLIST|BOX ART|CODE TOWERS)$/.test(t)) return false;
        let o = m;
        while (o) {
          if (o.visible === false) return false;
          o = o.parent;
        }
        return true;
      });
      for (const mesh of meshes) {
        const mb = meshScreenBBox(mesh);
        if (!mb) {
          fails.push({ shot: shot.id, f, sign: mesh.userData.signText, reason: 'offscreen/clipped' });
          continue;
        }
        if (
          mb.left < SIGN_EDGE_MARGIN
          || mb.right > W - SIGN_EDGE_MARGIN
          || mb.top < SIGN_EDGE_MARGIN
          || mb.bottom > H - SIGN_EDGE_MARGIN
        ) {
          fails.push({
            shot: shot.id,
            f,
            sign: mesh.userData.signText,
            box: {
              l: +mb.left.toFixed(1), r: +mb.right.toFixed(1),
              t: +mb.top.toFixed(1), b: +mb.bottom.toFixed(1),
            },
          });
        }
      }
    }
  }
  if (fails.length) {
    throw new Error(
      `Signs cut by frame edge (need ${SIGN_EDGE_MARGIN}px margin):\n`
      + fails.map((r) => `  ${r.shot} f${r.f} "${r.sign}" ${r.reason || JSON.stringify(r.box)}`).join('\n'),
    );
  }
  return { shots: SHOTS.length, margin: SIGN_EDGE_MARGIN };
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
    farmOk: await loadTex('assets/screens/farm-ok.png'),
    farmBreak: await loadTex('assets/screens/farm-break.png'),
    codeJava: await loadTex('assets/screens/code-java.png'),
    codeBedrock: await loadTex('assets/screens/code-bedrock.png'),
    checklist: await loadTex('assets/screens/checklist.png'),
    worlds: await loadTex('assets/screens/worlds.png'),
    boxArt: await loadTex('assets/screens/box-art.png'),
    codeTowers: await loadTex('assets/screens/code-towers.png'),
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
  assertCaptionSafeZone();
  const occl = assertCharacterVisible('all');
  const signClear = assertCaptionClearOfSigns();
  const signsInFrame = assertSignsInFrame();
  window.captionInfo = captionInfo;
  window.captionBoxes = captionBoxes;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
  window.assertCaptionClearOfSigns = assertCaptionClearOfSigns;
  window.assertSignsInFrame = assertSignsInFrame;
  window.assertCharacterVisible = assertCharacterVisible;
  window.occlusionInfo = occl;
  window.signClearInfo = signClear;
  window.signsInFrameInfo = signsInFrame;
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
