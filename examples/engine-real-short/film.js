// Engine-real Short — content-short VERSION 1 (drawn SVG animals in a detailed 3D realism lab).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays, captionInfo, assertCaptionSafeZone, captionBoxes } from './overlays.js';
import { buildCamera, assertMaxHold, LANDINGS } from './camera.js';

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
scene.background = new THREE.Color('#3a3840');
scene.fog = new THREE.Fog('#3a3840', 28, 52);

const camera = new THREE.PerspectiveCamera(40, W / H, 0.35, 60);

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

const CHAR_NAMES = ['raccoon', 'wallaby', 'puffin', 'tortoise'];
const POSES = ['neutral', 'talk', 'point', 'wow'];
const OCCLUSION_MAX = 0.15;

let room, chars = {}, shadowCatch;
let camSys = null;
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
  if (shot.id === 'question') {
    if (local > 140) return 'point';
    if (local % 16 < 8) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'unreal') {
    if (local > 220) return 'wow';
    if (local > 40 && local % 16 < 8) return 'talk';
    if (local > 20) return 'point';
    return 'neutral';
  }
  if (shot.id === 'unity') {
    if (local > 220) return 'point';
    if (local % 16 < 8) return 'talk';
    return 'neutral';
  }
  // budget
  if (local > 200) return 'point';
  if (local % 14 < 7) return 'talk';
  return 'wow';
}

/** Character stands in the aisle in front of the station (medium, readable). */
function charLocal(shot) {
  const id = typeof shot === 'string' ? shot : shot.id;
  const side = ({
    hook: 0, question: 0.1, unreal: -0.15, unity: 0.2, budget: -0.2,
    lab: 0.05, city: -0.15, face: 0.2,
  })[id] || 0;
  const scale = (id === 'hook' || id === 'question' || id === 'lab') ? 1.12 : 0.95;
  return { side, z: 2.15, scale };
}

function cameraFor(_shot, f) {
  if (!camSys) throw new Error('camera system not ready');
  return camSys.camAt(f);
}

function syncBoothVisibility(shot) {
  // Center pad is shared by lab + face; show the matching desk for the beat.
  const b = room.booths;
  if (!b.lab || !b.face) return;
  const centerIsFace = shot.id === 'unity';
  b.lab.visible = !centerIsFace;
  b.face.visible = centerIsFace;
  if (b.city) b.city.visible = true;
  if (b.budget) b.budget.visible = true;
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

/** Near-plane / path clearance: camera stays in open air with clear sightline to look-at. */
export function assertCameraPathClear(step = 3) {
  const NEAR_MIN = 0.35;
  const FLOOR_MIN = 0.85;
  const CEIL_MAX = 5.6;
  const fails = [];
  const samples = [];
  for (let f = 0; f < FRAMES; f += step) {
    const shot = shotAt(f);
    const cam = cameraFor(shot, f);
    placeCharacter(shot, f);
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.lx, cam.ly, cam.lz);
    scene.updateMatrixWorld(true);

    if (cam.y < FLOOR_MIN || cam.y > CEIL_MAX) {
      fails.push({ f, why: `cam y=${cam.y.toFixed(2)} outside aisle band` });
      continue;
    }

    // Forward ray toward look-at: first solid hit must be past near plane and not fill as a wall-hug
    _n.set(cam.lx - cam.x, cam.ly - cam.y, cam.lz - cam.z);
    const aimDist = _n.length();
    _n.normalize();
    raycaster.set(camera.position, _n);
    raycaster.near = 0.02;
    raycaster.far = Math.max(0.5, aimDist - 0.05);
    const hits = raycaster.intersectObjects(scene.children, true)
      .filter((h) => !isIgnoredHit(h.object) && !isCharacterHit(h.object));
    if (hits.length && hits[0].distance < NEAR_MIN) {
      fails.push({
        f,
        why: `near-plane hit @ ${hits[0].distance.toFixed(3)} (${hits[0].object.name || hits[0].object.type})`,
      });
      continue;
    }

    // Sample a 3×5 grid over the view: foreground occluders (closer than 55% of aim) ≤ 15%
    let total = 0, occluded = 0;
    for (let iy = 0; iy < 5; iy++) {
      for (let ix = 0; ix < 3; ix++) {
        const ndcX = (ix / 2) * 1.6 - 0.8;
        const ndcY = (iy / 4) * 1.5 - 0.55;
        _v.set(ndcX, ndcY, 0.5).unproject(camera);
        _n.copy(_v).sub(camera.position).normalize();
        raycaster.set(camera.position, _n);
        raycaster.near = 0.02;
        raycaster.far = aimDist * 0.55;
        const gh = raycaster.intersectObjects(scene.children, true)
          .filter((h) => !isIgnoredHit(h.object) && !isCharacterHit(h.object));
        total++;
        if (gh.length) occluded++;
      }
    }
    const frac = total ? occluded / total : 0;
    samples.push({ f, occl: +frac.toFixed(3) });
    if (frac > OCCLUSION_MAX + 1e-6) {
      fails.push({ f, why: `foreground occluder ${(frac * 100).toFixed(0)}% > 15%` });
    }
  }
  if (fails.length) {
    const show = fails.slice(0, 24);
    throw new Error(
      `Camera path clearance failed (${fails.length} samples):\n`
      + show.map((r) => `  f${r.f}: ${r.why}`).join('\n')
      + (fails.length > 24 ? `\n  … +${fails.length - 24} more` : ''),
    );
  }
  return { checked: samples.length, step, maxOccl: Math.max(0, ...samples.map((s) => s.occl)) };
}

function isWorldVisible(obj) {
  let o = obj;
  while (o) {
    if (o.visible === false) return false;
    o = o.parent;
  }
  return true;
}

function collectSignScreenMeshes() {
  const out = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.userData && obj.userData.isSignOrScreen && isWorldVisible(obj)) out.push(obj);
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
  const cam = cameraFor(shot, f);
  // Slight FOV breathe with move kind
  const land = camSys ? camSys.abs[camSys.landingIndexAt(f)] : null;
  const wantFov = land && (land.kind === 'low-hero' || land.kind === 'push-in') ? 38
    : land && land.kind === 'pull-out' ? 44 : 40;
  if (Math.abs(camera.fov - wantFov) > 0.05) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(cam.lx, cam.ly, cam.lz);
  placeCharacter(shot, f);

  renderer.render(scene, camera);
  ctx.drawImage(glCanvas, 0, 0, W, H);
  drawOverlays(ctx, f);
}

async function boot() {
  const screens = {
    lab: await loadTex('assets/screens/lab.png'),
    city: await loadTex('assets/screens/city.png'),
    face: await loadTex('assets/screens/face.png'),
    budget: await loadTex('assets/screens/budget.png'),
    wire: await loadTex('assets/screens/wire.png'),
    skin: await loadTex('assets/screens/skin.png'),
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

  camSys = buildCamera(room, charLocal);
  const holdInfo = assertMaxHold(camSys.camAt, FRAMES);
  await initOverlays();
  assertCaptionSafeZone();
  const occl = assertCharacterVisible('all');
  const signClear = assertCaptionClearOfSigns();
  const pathClear = assertCameraPathClear(2);
  window.captionInfo = captionInfo;
  window.captionBoxes = captionBoxes;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
  window.assertCaptionClearOfSigns = assertCaptionClearOfSigns;
  window.assertCharacterVisible = assertCharacterVisible;
  window.assertCameraPathClear = assertCameraPathClear;
  window.assertMaxHold = () => assertMaxHold(camSys.camAt, FRAMES);
  window.cameraLandings = LANDINGS;
  window.camAt = (f) => camSys.camAt(f);
  window.holdInfo = holdInfo;
  window.occlusionInfo = occl;
  window.signClearInfo = signClear;
  window.pathClearInfo = pathClear;
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
