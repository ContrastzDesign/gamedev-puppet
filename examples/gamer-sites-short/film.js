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
// Fill from the window side so booths aren't muddy
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
  const charX = booth.x;
  const charZ = booth.z + 1.7;
  // Varied framing: character always clear in aisle; neighbours/shelves/neon read in BG.
  if (shot.id === 'hook') {
    // Wide establish — ceiling lamps, neighbour glow, WEB MAP
    return {
      x: lin(-5.8, -7.2, t),
      y: lin(2.55, 2.1, t),
      z: lin(6.2, 4.6, t),
      lx: -8.2,
      ly: lin(1.55, 1.35, t),
      lz: -3.5,
    };
  }
  if (shot.id === 'steam') {
    // Three-quarter from right — desk props + slot neighbour
    return {
      x: lin(charX + 2.6, charX + 1.8, t),
      y: lin(2.0, 1.85, t),
      z: lin(charZ + 5.0, charZ + 3.9, t),
      lx: charX - 0.1,
      ly: 1.4,
      lz: charZ - 0.5,
    };
  }
  if (shot.id === 'poki') {
    // High wide — ceiling + neon + BROWSER PLAY
    return {
      x: lin(charX - 2.2, charX - 1.2, t),
      y: lin(2.85, 2.4, t),
      z: lin(charZ + 5.2, charZ + 4.0, t),
      lx: charX + 0.15,
      ly: 1.45,
      lz: charZ - 0.45,
    };
  }
  if (shot.id === 'roblox') {
    // Side wide — BLOCK WORLD + right shelves / DUO BAY
    return {
      x: lin(charX - 3.2, charX - 2.1, t),
      y: lin(2.2, 1.95, t),
      z: lin(charZ + 5.0, charZ + 3.9, t),
      lx: charX + 0.4,
      ly: 1.4,
      lz: charZ - 0.35,
    };
  }
  // twitch: wide enough for LIVE WATCH + neighbour + ceiling cove
  return {
    x: lin(charX + 2.6, charX + 1.6, t),
    y: lin(2.35, 2.05, t),
    z: lin(charZ + 5.3, charZ + 4.1, t),
    lx: charX - 0.2,
    ly: 1.4,
    lz: charZ - 0.35,
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
  // Offset slightly so desk RGB / drinks / headset stay readable beside the character
  const sideNudge = ({ hook: -0.35, steam: 0.4, poki: -0.45, roblox: 0.35, twitch: -0.4 })[shot.id] || 0;
  const scale = shot.id === 'hook' ? 1.0 : 0.92;
  bill.group.scale.set(scale, scale, scale);
  bill.group.position.set(booth.x + lean + sideNudge, bob, booth.z + 1.55);
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
  window.captionInfo = captionInfo;
  window.assertCaptionSafeZone = assertCaptionSafeZone;
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
