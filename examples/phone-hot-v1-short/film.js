// Phone Hot Short — content-short VERSION 1 (drawn SVG animals in detailed 3D worlds).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
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

const CHAR_NAMES = ['coati', 'numbat', 'yak', 'gecko', 'chip', 'fox'];
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
    if (local > 35) return 'point';
    if (local > 12) return 'talk';
    return 'wow';
  }
  if (shot.id === 'great') {
    if (local > 50) return 'wow';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'cool') {
    // Avoid point pose — the drawn phone/arm extends past the portrait edge.
    if (local % 12 < 6) return 'talk';
    return 'wow';
  }
  if (shot.id === 'fan') {
    if (local > 15) return 'point';
    return 'wow';
  }
  if (shot.id === 'holes') {
    if (local > 50) return 'wow';
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'seal') {
    if (local > 40) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'heat') {
    if (local % 12 < 6) return 'wow';
    return 'talk';
  }
  if (shot.id === 'throttle') {
    if (local > 25) return 'point';
    if (local % 10 < 5) return 'talk';
    return 'wow';
  }
  if (shot.id === 'dev') {
    if (local > 80) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'warmer') {
    if (local > 30) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  // finale
  if (local > 40) return 'point';
  if (local % 14 < 7) return 'talk';
  return 'wow';
}

/** Character stands readable mid-frame (~40-50% height on hook). */
function charLocal(shot) {
  const side = ({
    hook: 0.05, great: 0.1, cool: -0.22, fan: 0.1,
    holes: -0.08, seal: 0.05, heat: 0.0, throttle: 0.0,
    dev: -0.1, warmer: 0.08, finale: 0.0,
  })[shot.id] || 0;
  const scale = (shot.id === 'hook' || shot.id === 'great' || shot.id === 'finale' || shot.id === 'warmer')
    ? 1.18 : (shot.id === 'throttle' ? 1.1 : (shot.id === 'cool' ? 0.92 : 0.98));
  const z = ({
    living: 2.15, patio: 2.45, workshop: 2.25, seal: 2.35,
    interior: 2.2, racetrack: 2.45, studio: 2.3, cabin: 2.2,
  })[shot.booth] || 2.15;
  return { side, z, scale };
}

function cameraFor(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const t = easeInOut(clamp((f - shot.f0) / Math.max(1, shot.f1 - shot.f0 - 1)));
  const cl = charLocal(shot);
  const charX = booth.x + cl.side;
  const charZ = booth.z + cl.z;
  const wantFov = (shot.id === 'hook' || shot.id === 'great' || shot.id === 'finale') ? 42
    : (shot.id === 'throttle' || shot.id === 'heat') ? 46
    : 40;
  if (camera.fov !== wantFov) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }
  if (shot.id === 'hook' || shot.id === 'great' || shot.id === 'finale' || shot.id === 'warmer') {
    return {
      x: lin(charX + 0.28, charX + 0.08, t),
      y: lin(1.7, 1.55, t),
      z: lin(charZ + 4.7, charZ + 4.1, t),
      lx: charX - 0.02,
      ly: 1.35,
      lz: charZ - 0.25,
    };
  }
  if (shot.id === 'cool') {
    // Wide, centered pull-back so wall signs stay fully inside the portrait frame.
    return {
      x: lin(charX, charX, t),
      y: lin(1.68, 1.55, t),
      z: lin(charZ + 6.6, charZ + 5.9, t),
      lx: charX,
      ly: 1.35,
      lz: charZ - 0.35,
    };
  }
  if (shot.id === 'heat' || shot.id === 'throttle') {
    return {
      x: lin(charX + 0.15, charX, t),
      y: lin(1.95, 1.75, t),
      z: lin(charZ + 5.4, charZ + 4.7, t),
      lx: charX,
      ly: 1.4,
      lz: charZ - 0.6,
    };
  }
  if (shot.id === 'fan' || shot.id === 'holes') {
    return {
      x: lin(charX - 0.3, charX - 0.05, t),
      y: lin(1.85, 1.7, t),
      z: lin(charZ + 5.3, charZ + 4.5, t),
      lx: charX + 0.05,
      ly: 1.4,
      lz: charZ - 0.5,
    };
  }
  // seal / dev
  return {
    x: lin(charX + 0.3, charX + 0.1, t),
    y: lin(1.9, 1.72, t),
    z: lin(charZ + 5.5, charZ + 4.6, t),
    lx: charX,
    ly: 1.4,
    lz: charZ - 0.55,
  };
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
    smooth: await loadTex('assets/screens/game-smooth.png'),
    slow: await loadTex('assets/screens/game-slow.png'),
    worse: await loadTex('assets/screens/game-worse.png'),
    temp: await loadTex('assets/screens/temp.png'),
    sliders: await loadTex('assets/screens/sliders.png'),
    appstore: await loadTex('assets/screens/appstore.png'),
    blueprint: await loadTex('assets/screens/blueprint.png'),
    circuit: await loadTex('assets/screens/circuit.png'),
    racetrack: await loadTex('assets/screens/racetrack.png'),
    harder: await loadTex('assets/screens/harder-hotter.png'),
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
  window.captionInfo = captionInfo;
  window.captionBoxes = captionBoxes;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
  window.assertCaptionClearOfSigns = assertCaptionClearOfSigns;
  window.assertCharacterVisible = assertCharacterVisible;
  window.occlusionInfo = occl;
  window.signClearInfo = signClear;
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
