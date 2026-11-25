// Gamer-sites Short — content-short VERSION 1 (drawn SVG animals in a detailed 3D cafe).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H, clamp, easeInOut, lin } from './core.js';
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
  // Slightly smaller so feet sit above the lower-third caption band
  return { side, z: 2.2, scale: shot.id === 'hook' ? 0.95 : 0.9 };
}

function cameraFor(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const t = easeInOut(clamp((f - shot.f0) / Math.max(1, shot.f1 - shot.f0 - 1)));
  const cl = charLocal(shot);
  const charX = booth.x + cl.side;
  const charZ = booth.z + cl.z;
  // Eye-level aisle cameras, pulled back so feet clear the lower-third caption band.
  if (shot.id === 'hook') {
    return {
      x: lin(charX + 0.5, charX + 0.2, t),
      y: lin(1.55, 1.45, t),
      z: lin(charZ + 5.0, charZ + 4.2, t),
      lx: charX - 0.08,
      ly: 0.85,
      lz: charZ - 0.1,
    };
  }
  if (shot.id === 'steam') {
    return {
      x: lin(charX + 0.85, charX + 0.5, t),
      y: lin(1.5, 1.42, t),
      z: lin(charZ + 4.8, charZ + 4.1, t),
      lx: charX - 0.06,
      ly: 0.85,
      lz: charZ - 0.15,
    };
  }
  if (shot.id === 'poki') {
    return {
      x: lin(charX - 0.8, charX - 0.4, t),
      y: lin(1.55, 1.45, t),
      z: lin(charZ + 4.9, charZ + 4.15, t),
      lx: charX + 0.06,
      ly: 0.88,
      lz: charZ - 0.1,
    };
  }
  if (shot.id === 'roblox') {
    return {
      x: lin(charX - 0.9, charX - 0.45, t),
      y: lin(1.5, 1.42, t),
      z: lin(charZ + 4.85, charZ + 4.1, t),
      lx: charX + 0.08,
      ly: 0.85,
      lz: charZ - 0.1,
    };
  }
  // twitch: straight-on — full body + floor under feet for captions
  return {
    x: lin(charX + 0.3, charX + 0.08, t),
    y: lin(1.5, 1.42, t),
    z: lin(charZ + 4.95, charZ + 4.15, t),
    lx: charX - 0.03,
    ly: 0.85,
    lz: charZ - 0.08,
  };
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
