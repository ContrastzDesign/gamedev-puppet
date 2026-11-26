// New-game-update Short — content-short VERSION 1 (drawn SVG animals in detailed 3D worlds).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H, clamp } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays, captionInfo, assertCaptionSafeZone, captionBoxes, assertCaptionBottom } from './overlays.js';
import {
  cameraAt, assertMaxHold, landingKeys, midMoveFrames, cameraKeySummary,
  NEAR_PLANE, OCCLUSION_MAX, MAX_HOLD,
} from './camera.js';

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
scene.background = new THREE.Color('#5a5a60');
scene.fog = new THREE.Fog('#5a5a60', 30, 55);

const camera = new THREE.PerspectiveCamera(40, W / H, NEAR_PLANE, 60);

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

const CHAR_NAMES = ['shiba', 'okapi', 'narwhal', 'badger', 'mandrill', 'coast', 'grad'];
const POSES = ['neutral', 'talk', 'point', 'wow'];
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
    if (local > 20) return 'point';
    if (local > 8) return 'talk';
    return 'wow';
  }
  if (shot.id === 'buy' || shot.id === 'why') {
    if (local > 150) return 'wow';
    if (local % 16 < 8) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'factory') {
    if (local > 60) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'gold') {
    if (local > 40) return 'wow';
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'bugs') {
    if (local % 12 < 6) return 'talk';
    return 'point';
  }
  if (shot.id === 'cert') {
    if (local > 50) return 'wow';
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'coaster') {
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  // grad
  if (local > 40) return 'point';
  if (local % 14 < 7) return 'talk';
  return 'wow';
}

/** Character stands readable mid-frame (~40-50% height on hook). */
function charLocal(shot) {
  const side = ({
    hook: 0.05, buy: 0.1, why: -0.05, factory: 0.15, gold: -0.1,
    bugs: 0.1, cert: -0.12, coaster: 0.08, grad: -0.05,
  })[shot.id] || 0;
  const scale = (shot.id === 'hook' || shot.id === 'buy' || shot.id === 'why' || shot.id === 'coaster' || shot.id === 'grad')
    ? 1.18 : 0.95;
  const z = ({ factory: 2.5, cert: 2.55, studio: 2.35 })[shot.id] || 2.15;
  return { side, z, scale };
}

function applyCamera(cam) {
  const wantFov = cam.fov ?? 40;
  if (Math.abs(camera.fov - wantFov) > 0.01) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(cam.lx, cam.ly, cam.lz);
}

function syncBoothVisibility(boothId) {
  const b = room.booths;
  for (const id of Object.keys(b)) {
    b[id].visible = (id === boothId);
  }
}

function placeCharacter(shot, f, boothId) {
  const bid = boothId || shot.booth;
  syncBoothVisibility(bid);
  const booth = room.boothMeta[bid];
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
  const sampleSet = new Set();
  for (const shot of SHOTS) {
    sampleSet.add(shot.f0);
    sampleSet.add(Math.floor((shot.f0 + shot.f1 - 1) / 2));
    sampleSet.add(shot.f1 - 1);
  }
  for (const k of landingKeys()) sampleSet.add(k.f);
  for (const f of sampleSet) {
    if (frames && frames !== 'all' && !frames.includes(f)) continue;
    const shot = shotAt(f);
    const cam = cameraAt(f);
    applyCamera(cam);
    placeCharacter(shot, f, cam.booth);
    scene.updateMatrixWorld(true);
    const bill = chars[shot.char];
    const frac = measureCharacterOcclusion(bill);
    const row = { shot: shot.id, f, booth: cam.booth, occlusion: +frac.toFixed(3) };
    results.push(row);
    if (frac > OCCLUSION_MAX + 1e-6) fails.push(row);
  }
  if (fails.length) {
    throw new Error(
      `Character occlusion > ${(OCCLUSION_MAX * 100).toFixed(0)}%:\n`
      + fails.map((r) => `  ${r.shot} f${r.f}: ${(r.occlusion * 100).toFixed(1)}%`).join('\n'),
    );
  }
  return results;
}

/** Path clearance: camera not inside set geometry; near plane clear; no heavy foreground occluder. */
export function assertPathClearance() {
  const fails = [];
  const solid = [];
  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj === shadowCatch) return;
    if (obj.name === 'characterPlane') return;
    if (obj.material && obj.material.transparent && (obj.material.opacity ?? 1) < 0.5) return;
    solid.push(obj);
  });
  const samples = [];
  for (let f = 0; f < FRAMES; f += 2) samples.push(f);
  for (const f of samples) {
    const cam = cameraAt(f);
    applyCamera(cam);
    const shot = shotAt(f);
    placeCharacter(shot, f, cam.booth);
    scene.updateMatrixWorld(true);

    // Camera must stay above the floor and not sit inside a mesh AABB.
    if (cam.y < 0.45) {
      fails.push({ f, reason: `camera y ${cam.y.toFixed(2)} too low (under/through set)` });
      continue;
    }
    _p.set(cam.x, cam.y, cam.z);
    for (const mesh of solid) {
      let hidden = false;
      let o = mesh;
      while (o) {
        if (o.visible === false) { hidden = true; break; }
        o = o.parent;
      }
      if (hidden) continue;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      _box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      // shrink a bit so resting near walls is OK; fail only if deeply inside
      _box.min.addScalar(0.08);
      _box.max.addScalar(-0.08);
      if (_box.max.x > _box.min.x && _box.containsPoint(_p)) {
        fails.push({ f, reason: `camera inside mesh ${mesh.name || mesh.parent?.name || 'anon'} booth=${cam.booth}` });
        break;
      }
    }

    // Near-plane / look direction: nothing solid within NEAR_PLANE of the lens along view.
    camera.getWorldDirection(_n);
    raycaster.set(camera.position, _n);
    raycaster.near = 0;
    raycaster.far = NEAR_PLANE + 0.05;
    const nearHits = raycaster.intersectObjects(solid, false)
      .filter((h) => {
        let o = h.object;
        while (o) {
          if (o.visible === false) return false;
          o = o.parent;
        }
        return true;
      });
    if (nearHits.length && nearHits[0].distance < NEAR_PLANE) {
      fails.push({ f, reason: `near-plane hit at ${nearHits[0].distance.toFixed(3)} (< ${NEAR_PLANE})` });
    }
  }
  if (fails.length) {
    const uniq = fails.slice(0, 24);
    throw new Error(
      `Path clearance failed (${fails.length} frames):\n`
      + uniq.map((r) => `  f${r.f}: ${r.reason}`).join('\n'),
    );
  }
  return { checked: samples.length, near: NEAR_PLANE };
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
      const cam = cameraAt(f);
      applyCamera(cam);
      placeCharacter(shot, f, cam.booth);
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

function renderFrame(f) {
  f = ((f % FRAMES) + FRAMES) % FRAMES | 0;
  const shot = shotAt(f);
  const cam = cameraAt(f);
  applyCamera(cam);
  placeCharacter(shot, f, cam.booth);

  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  drawOverlays(ctx, f);
}

async function boot() {
  const screens = {
    title: await loadTex('assets/screens/title.png'),
    download: await loadTex('assets/screens/download.png'),
    factory: await loadTex('assets/screens/factory.png'),
    bugs: await loadTex('assets/screens/bugs.png'),
    cert: await loadTex('assets/screens/cert.png'),
    gold: await loadTex('assets/screens/gold.png'),
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
  assertCaptionBottom();
  const holdInfo = assertMaxHold();
  const occl = assertCharacterVisible('all');
  const signClear = assertCaptionClearOfSigns();
  const pathClear = assertPathClearance();
  window.captionInfo = captionInfo;
  window.captionBoxes = captionBoxes;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
  window.assertCaptionBottom = assertCaptionBottom;
  window.assertCaptionClearOfSigns = assertCaptionClearOfSigns;
  window.assertCharacterVisible = assertCharacterVisible;
  window.assertPathClearance = assertPathClearance;
  window.assertMaxHold = assertMaxHold;
  window.cameraKeySummary = cameraKeySummary;
  window.landingKeys = landingKeys;
  window.midMoveFrames = midMoveFrames;
  window.occlusionInfo = occl;
  window.signClearInfo = signClear;
  window.pathClearInfo = pathClear;
  window.holdInfo = holdInfo;
  window.MAX_HOLD = MAX_HOLD;
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
