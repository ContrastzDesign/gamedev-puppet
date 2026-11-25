// Gamer-sites Short — content-short VERSION 1 (drawn SVG animals in a detailed 3D cafe).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H, clamp, easeInOut, lin } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays } from './overlays.js';

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
scene.background = new THREE.Color('#1a221c');
scene.fog = new THREE.Fog('#1a221c', 16, 32);

const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 60);

const hemi = new THREE.HemisphereLight('#f0e6d0', '#3a2e24', 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffe2b8', 1.15);
sun.position.set(4, 10, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 40;
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);
scene.add(new THREE.AmbientLight('#d8c8b0', 0.35));

const loader = new THREE.TextureLoader();
const loadTex = (url) => new Promise((res, rej) => loader.load(url, (t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  res(t);
}, undefined, rej));

const CHAR_NAMES = ['quokka', 'redpanda', 'axolotl', 'pangolin', 'lemur'];
const POSES = ['neutral', 'talk', 'point', 'wow'];

let room, chars = {}, shadowCatch;
let ready = false;

function makeBillboard(tex) {
  const g = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.8),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  plane.position.y = 0.9;
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
  // Talk while VO for that line is active-ish; point/wow at punchy moments
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
  // twitch
  if (local > 190) return 'wow';
  if (local > 140) return 'point';
  if (local % 16 < 8) return 'talk';
  return 'neutral';
}

function cameraFor(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const t = easeInOut(clamp((f - shot.f0) / Math.max(1, shot.f1 - shot.f0 - 1)));
  const bx = booth.x, bz = booth.z;
  const charX = bx;
  const charZ = bz + 1.7;
  // Hook: quokka at the WEB MAP booth, slight push-in (character always framed)
  if (shot.id === 'hook') {
    return {
      x: lin(-6.4, -7.6, t),
      y: lin(1.95, 1.7, t),
      z: lin(5.8, 4.7, t),
      lx: -8.4,
      ly: lin(1.35, 1.15, t),
      lz: -3.6,
    };
  }
  const dist = lin(4.0, 3.45, t);
  const height = lin(1.8, 1.65, t);
  const side = SHOTS.indexOf(shot) % 2 === 0 ? 0.62 : -0.62;
  return {
    x: charX + side * dist * 0.75,
    y: height,
    z: charZ + dist * 0.92,
    lx: charX,
    ly: 1.15,
    lz: charZ - 0.45,
  };
}

function placeCharacter(shot, f) {
  const booth = room.boothMeta[shot.booth];
  const name = shot.char;
  for (const n of CHAR_NAMES) chars[n].group.visible = false;
  const bill = chars[name];
  bill.group.visible = true;
  const pose = poseFor(shot, f);
  setPose(bill, chars[name].poses[pose]);
  const bob = Math.sin(f * 0.21) * 0.025;
  const lean = Math.sin(f * 0.09) * 0.03;
  // Slightly smaller billboards so faces clear the caption band and screens stay readable
  const scale = shot.id === 'hook' ? 1.05 : 0.95;
  bill.group.scale.set(scale, scale, scale);
  bill.group.position.set(booth.x + lean, bob, booth.z + 1.7);
  bill.group.rotation.y = Math.atan2(
    camera.position.x - bill.group.position.x,
    camera.position.z - bill.group.position.z,
  );
  shadowCatch.position.set(bill.group.position.x, 0.035, bill.group.position.z);
  shadowCatch.scale.setScalar(scale);
  shadowCatch.visible = true;
}

function renderFrame(f) {
  f = ((f % FRAMES) + FRAMES) % FRAMES | 0;
  const shot = shotAt(f);
  const cam = cameraFor(shot, f);
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(cam.lx, cam.ly, cam.lz);
  placeCharacter(shot, f);

  // Subtle screen flicker on active booth monitor (already baked textures)
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
  ready = true;
  window.filmReady = true;
  window.renderFrame = renderFrame;
  // Preview loop when opened in a browser
  if (!window.__HEADLESS) {
    let f = 0;
    const tick = () => { renderFrame(f); f = (f + 1) % FRAMES; requestAnimationFrame(tick); };
    tick();
  } else {
    renderFrame(0);
  }
}

boot().catch((e) => { console.error(e); window.filmReady = false; });
