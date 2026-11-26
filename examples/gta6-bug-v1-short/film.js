// GTA VI Bug Short — content-short VERSION 1 (drawn SVG animals in detailed 3D worlds).
import * as THREE from 'three';
import { FPS, FRAMES, SHOTS } from './beats.js';
import { W, H, clamp, easeInOut, lin } from './core.js';
import { buildRoom } from './room.js';
import { initOverlays, drawOverlays, captionInfo, assertCaptionSafeZone, captionBoxes } from './overlays.js';

// --- Ricardo camera rules (content-short): VO-synced landings -----------------
// Fly to whatever the VO names; land 0–4 frames before the word. Moves are
// 12–30 frames, eased. Vary kind each landing (never same kind twice in a
// row). Whips = EASE → ARC → land. Between landings: drift (slow push / rise /
// small turn). No hold > 12 frames. Characters chest-up or full figure.
const HOLD_MAX = 12;

function lerpCam(a, b, t) {
  return {
    x: lin(a.x, b.x, t), y: lin(a.y, b.y, t), z: lin(a.z, b.z, t),
    lx: lin(a.lx, b.lx, t), ly: lin(a.ly, b.ly, t), lz: lin(a.lz, b.lz, t),
  };
}

function copyCam(c) {
  return { x: c.x, y: c.y, z: c.z, lx: c.lx, ly: c.ly, lz: c.lz };
}

/** Whip: ease out of A, arc through a perpendicular mid, ease into B. */
function whipInterp(a, b, u) {
  const mid = {
    x: (a.x + b.x) * 0.5 + (b.z - a.z) * 0.22,
    y: (a.y + b.y) * 0.5 + 0.28,
    z: (a.z + b.z) * 0.5 - (b.x - a.x) * 0.22,
    lx: (a.lx + b.lx) * 0.5,
    ly: (a.ly + b.ly) * 0.5 + 0.06,
    lz: (a.lz + b.lz) * 0.5,
  };
  if (u < 0.32) {
    return lerpCam(a, mid, easeInOut(u / 0.32) * 0.5);
  }
  if (u < 0.68) {
    const t = easeInOut((u - 0.32) / 0.36);
    return lerpCam(lerpCam(a, mid, 0.5), lerpCam(mid, b, 0.5), t);
  }
  return lerpCam(mid, b, 0.5 + easeInOut((u - 0.68) / 0.32) * 0.5);
}

/** Drop (top-down → hero): rise above the aisle, then ease into hero framing. */
function dropInterp(a, b, u) {
  const high = {
    x: lin(a.x, b.x, 0.4),
    y: Math.max(a.y, b.y) + 1.8,
    z: Math.max(a.z, b.z) + 0.15, // stay audience-side
    lx: b.lx, ly: b.ly - 0.1, lz: b.lz,
  };
  if (u < 0.45) return lerpCam(a, high, easeInOut(u / 0.45));
  return lerpCam(high, b, easeInOut((u - 0.45) / 0.55));
}

function moveInterp(kind, a, b, u) {
  if (kind === 'whip') return whipInterp(a, b, u);
  if (kind === 'drop') return dropInterp(a, b, u);
  return lerpCam(a, b, easeInOut(u));
}

/** Slow continuous drift so the camera never parks (hold ≤12f then drift). */
function driftCam(pose, f, seed) {
  const t = f * 0.017 + seed * 1.7;
  return {
    x: pose.x + Math.sin(t) * 0.055,
    y: pose.y + Math.sin(t * 0.7 + 1.1) * 0.035,
    z: pose.z + Math.cos(t * 0.55) * 0.07,
    lx: pose.lx + Math.sin(t * 0.4) * 0.03,
    ly: pose.ly + Math.cos(t * 0.5) * 0.02,
    lz: pose.lz + Math.sin(t * 0.35 + 0.5) * 0.04,
  };
}

/**
 * Build a landed camera pose aimed at a world look-target.
 * framing: 'full' | 'chest'
 * kind biases the approach angle (orbit side, crane height, low angle, etc).
 * Camera always stays on the audience side of `hero` (never behind the cast).
 */
function poseAt(look, kind, framing, side = 1, hero = null) {
  const chest = framing === 'chest';
  // Harbour needs extra distance so wide signs (INVISIBLE WALL) stay inside 9:16.
  const harbour = look && look._harbour;
  const dist = chest ? 3.55 : (harbour ? 5.6 : 4.55);
  const anchor = hero || look;
  // Bias look only gently toward the VO prop — cast must stay chest-up / full-figure.
  const lx = lin(anchor.x, look.x, hero ? 0.22 : 1);
  const ly0 = lin(anchor.y + (chest ? 0.3 : 0.05), look.y, hero ? 0.2 : 1);
  const lz = lin(anchor.z, look.z, hero ? 0.18 : 1);
  let x = anchor.x + side * 0.15;
  let y = chest ? anchor.y + 0.2 : anchor.y + 0.4;
  let z = anchor.z + dist;
  if (kind === 'orbit') {
    x = anchor.x + side * 1.05;
    z = anchor.z + dist * 0.9;
    y = anchor.y + 0.45;
  } else if (kind === 'crane') {
    y = anchor.y + 1.35;
    z = anchor.z + dist * 1.05;
    x = anchor.x + side * 0.4;
  } else if (kind === 'low') {
    y = 0.9;
    z = anchor.z + dist * 0.95;
    x = anchor.x + side * 0.3;
  } else if (kind === 'pull') {
    z = anchor.z + dist * 1.3;
    y = anchor.y + 0.75;
    x = anchor.x + side * 0.55;
  } else if (kind === 'push') {
    z = anchor.z + (chest ? 3.35 : 4.15);
    x = anchor.x + side * 0.2;
    y = chest ? anchor.y + 0.15 : anchor.y + 0.35;
  } else if (kind === 'fly' || kind === 'follow') {
    x = anchor.x + side * 0.9;
    z = anchor.z + dist * 0.95;
    y = anchor.y + 0.5;
  } else if (kind === 'drop') {
    // Landed after the aerial drop — still audience-side, slightly high.
    z = anchor.z + dist * 0.98;
    y = anchor.y + 0.85;
    x = anchor.x + side * 0.35;
  } else if (kind === 'whip') {
    x = anchor.x + side * 0.75;
    z = anchor.z + dist * 0.92;
    y = anchor.y + 0.4;
  }
  return { x, y, z, lx, ly: ly0, lz };
}

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

const camera = new THREE.PerspectiveCamera(40, W / H, 0.3, 60);

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

const CHAR_NAMES = ['pika', 'aardvark', 'worker', 'walrus', 'kinkajou', 'binturong', 'tired', 'grad'];
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
    if (local > 30) return 'point';
    if (local > 10) return 'talk';
    return 'wow';
  }
  if (shot.id === 'cars') {
    if (local > 50) return 'wow';
    if (local % 16 < 8) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'code') {
    if (local > 80) return 'point';
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'upload') {
    if (local > 20) return 'point';
    if (local % 12 < 6) return 'talk';
    return 'wow';
  }
  if (shot.id === 'bridge') {
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'boats') {
    if (local > 40) return 'wow';
    if (local % 12 < 6) return 'talk';
    return 'neutral';
  }
  if (shot.id === 'qa') {
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'cert') {
    if (local > 60) return 'wow';
    if (local % 14 < 7) return 'talk';
    return 'point';
  }
  if (shot.id === 'years' || shot.id === 'finale') {
    if (local % 14 < 7) return 'talk';
    return 'neutral';
  }
  // grad
  if (local > 30) return 'point';
  if (local % 14 < 7) return 'talk';
  return 'wow';
}

/** Character stands readable mid-frame (chest-up or full figure). */
function charLocal(shot) {
  const side = ({
    hook: 0.05, cars: 0.1, code: -0.05, upload: 0.15,
    bridge: 0.1, boats: -0.1, qa: 0.08, cert: -0.12,
    years: 0.05, finale: -0.05, grad: 0.0,
  })[shot.id] || 0;
  const scale = (shot.id === 'hook' || shot.id === 'cars' || shot.id === 'grad' || shot.id === 'finale')
    ? 1.18 : 0.98;
  const z = ({ harbour: 2.4, qa: 2.35, cert: 2.45, studio: 2.3, years: 2.25 })[shot.booth] || 2.15;
  return { side, z, scale };
}

/** World-space look targets named by the VO (per booth origin). */
function lookTargets(shot) {
  const booth = room.boothMeta[shot.booth];
  const bx = booth.x;
  const bz = booth.z;
  const cl = charLocal(shot);
  const hero = { x: bx + cl.side, y: 1.25, z: bz + cl.z };
  const chest = { x: hero.x, y: 1.55, z: hero.z };
  if (shot.booth === 'bedroom') {
    return {
      hero, chest,
      tv: { x: bx + 0.3, y: 1.85, z: bz - 2.7 },
      bridgeTv: { x: bx + 0.3, y: 1.9, z: bz - 2.7 },
      sign: { x: bx + 0.3, y: 2.35, z: bz - 2.7 },
    };
  }
  if (shot.booth === 'studio') {
    return {
      hero, chest,
      code: { x: bx + 0.0, y: 1.25, z: bz - 1.95 },
      calendar: { x: bx + 0.0, y: 2.15, z: bz - 2.9 },
      upload: { x: bx + 2.35, y: 1.2, z: bz - 0.25 },
    };
  }
  if (shot.booth === 'harbour') {
    const mark = (o) => Object.assign(o, { _harbour: true });
    return {
      hero: mark({ ...hero }),
      chest: mark({ ...chest }),
      bridge: mark({ x: bx + 0.0, y: 2.45, z: bz - 1.55 }),
      boats: mark({ x: bx + 0.85, y: 0.85, z: bz + 1.0 }),
      wall: mark({ x: bx + 0.0, y: 2.4, z: bz + 0.9 }),
      wide: mark({ x: bx + 0.0, y: 1.6, z: bz + 0.2 }),
    };
  }
  if (shot.booth === 'qa') {
    return {
      hero, chest,
      testers: { x: bx + 0.0, y: 1.35, z: bz + 1.6 },
      map: { x: bx + 0.0, y: 2.15, z: bz - 3.0 },
      bridgePin: { x: bx + 0.2, y: 2.0, z: bz - 3.0 },
    };
  }
  if (shot.booth === 'cert') {
    return {
      hero, chest,
      rulebooks: { x: bx - 1.5, y: 1.6, z: bz - 2.75 },
      fail: { x: bx + 1.2, y: 2.55, z: bz - 2.85 },
      stamp: { x: bx + 1.75, y: 1.5, z: bz + 0.15 },
    };
  }
  // years booth (years / finale / grad)
  return {
    hero, chest,
    year10: { x: bx - 1.75, y: 2.35, z: bz - 2.85 },
    timer: { x: bx - 1.0, y: 1.25, z: bz - 1.45 },
    reports: { x: bx + 1.7, y: 1.05, z: bz + 0.95 },
  };
}

/**
 * VO landings (0-based render frames). Each lands 0–4 frames before the named
 * word (vo-words f_start is 1-based → render = f_start-1). Kinds never repeat
 * back-to-back (cuts between shots count). dur = move length 12–30.
 *
 * word → land (approx): GTA~18→16, Bug~55→52, car~113→110, bridge~159→156,
 * one~209→206, two weeks~270→268, months~302→300, upload~357→354,
 * bridge~391→388, boats~411→409, wall~438→435, broke~492→490,
 * regression~541→538, testers~568→566, replay~576→586 (map), bridge~620→617,
 * Sony~643→641, rulebooks~677→674, Fail~691→700 (stamp beat), start~730→732,
 * 10 years~791→789, ten minutes~861→859, two weeks~925→923,
 * Congratulations cut@958, true~992→990.
 */
function buildLandings() {
  // [landF, shotId, kind, targetKey, framing, side, dur]
  const rows = [
    [16,  'hook',   'push',   'chest',     'chest',  1, 18],
    [52,  'hook',   'orbit',  'hero',      'full',  -1, 24],
    [80,  'hook',   'pull',   'tv',        'full',   1, 20],
    // cut @84
    [110, 'cars',   'fly',    'tv',        'full',  -1, 22],
    [156, 'cars',   'crane',  'bridgeTv',  'full',   1, 26],
    // cut @177
    [206, 'code',   'push',   'code',      'chest',  1, 24],
    [268, 'code',   'drop',   'calendar',  'full',  -1, 28],
    [300, 'code',   'low',    'hero',      'full',   1, 22],
    // cut @324 — whip lands chest-up on aardvark with UPLOAD readable over-shoulder
    [354, 'upload', 'whip',   'upload',    'chest',  1, 26],
    // cut @377
    [388, 'bridge', 'crane',  'bridge',    'full',   1, 24],
    [409, 'bridge', 'follow', 'boats',     'full',  -1, 20],
    [435, 'bridge', 'pull',   'wall',      'full',   0, 22],
    // cut @472
    [490, 'boats',  'push',   'chest',     'chest',  1, 18],
    [538, 'boats',  'pull',   'wide',      'full',  -1, 26],
    // cut @564 — short fly onto testers, then map / bridge-pin
    [568, 'qa',     'fly',    'testers',   'full',   1, 12],
    [588, 'qa',     'orbit',  'map',       'full',  -1, 18],
    [617, 'qa',     'push',   'bridgePin', 'full',   1, 22],
    // cut @636
    [643, 'cert',   'whip',   'chest',     'chest', -1, 16],
    [674, 'cert',   'pull',   'rulebooks', 'full',   1, 26],
    [700, 'cert',   'drop',   'fail',      'full',  -1, 24],
    [732, 'cert',   'crane',  'stamp',     'full',   1, 26],
    // cut @769
    [789, 'years',  'push',   'year10',    'full',  -1, 20],
    // cut @841
    [859, 'finale', 'low',    'timer',     'full',   1, 18],
    [923, 'finale', 'follow', 'reports',   'full',  -1, 28],
    // cut @958 (= Congratulations) — orbit into "you're now", push on "true"
    [974, 'grad',   'orbit',  'chest',     'chest',  1, 16],
    [990, 'grad',   'push',   'hero',      'full',  -1, 14],
  ];

  // Validate no consecutive kinds (cuts implied between different shotIds).
  let prevKind = null;
  let prevShot = null;
  for (const r of rows) {
    if (prevShot && r[1] !== prevShot) {
      if (prevKind === 'cut') throw new Error('double cut');
      prevKind = 'cut';
    }
    if (r[2] === prevKind) throw new Error(`repeat kind ${r[2]} at f${r[0]}`);
    prevKind = r[2];
    prevShot = r[1];
  }
  // follow → pull is fine; pull after orbit was changed from orbit→orbit risk across boats.

  return rows.map(([land, shotId, kind, target, framing, side, dur]) => {
    const shot = SHOTS.find((s) => s.id === shotId);
    const start = Math.max(shot.f0, land - dur);
    return {
      land, shotId, kind, target, framing, side,
      start,
      dur: Math.max(1, land - start),
    };
  });
}

let LANDINGS = null;
let landingPoses = null; // parallel poses once room exists

function ensureLandings() {
  if (LANDINGS) return;
  LANDINGS = buildLandings();
  landingPoses = LANDINGS.map((L) => {
    const shot = SHOTS.find((s) => s.id === L.shotId);
    const looks = lookTargets(shot);
    const look = looks[L.target] || looks.hero;
    const hero = looks.hero;
    return poseAt(look, L.kind, L.framing, L.side, hero);
  });
}

function shotFov(shot) {
  if (shot.id === 'hook' || shot.id === 'cars') return 42;
  if (shot.id === 'bridge' || shot.id === 'boats') return 46;
  return 40;
}

/** Cut-in / pre-move pose for a shot (hard cut lands here, then drifts). */
function cutInPose(shot) {
  const looks = lookTargets(shot);
  const hero = looks.hero;
  if (shot.booth === 'bedroom') return poseAt(looks.tv || hero, 'pull', 'full', 1, hero);
  if (shot.booth === 'harbour') return poseAt(looks.wide || hero, 'pull', 'full', -1, hero);
  return poseAt(hero, 'pull', 'full', 1, hero);
}

function cameraFor(shot, f) {
  ensureLandings();
  const wantFov = shotFov(shot);
  if (camera.fov !== wantFov) {
    camera.fov = wantFov;
    camera.updateProjectionMatrix();
  }

  // Only landings that belong to this shot (cuts reset the camera).
  const idx = [];
  for (let i = 0; i < LANDINGS.length; i++) {
    if (LANDINGS[i].shotId === shot.id) idx.push(i);
  }
  const cutPose = cutInPose(shot);

  if (!idx.length) return driftCam(cutPose, f, shot.f0);

  const first = LANDINGS[idx[0]];
  if (f < first.start) {
    return driftCam(cutPose, f, shot.f0);
  }

  // Active landing within this shot = last whose move has started.
  let k = 0;
  while (k < idx.length - 1 && LANDINGS[idx[k + 1]].start <= f) k++;
  const gi = idx[k];
  const L = LANDINGS[gi];
  const pose = landingPoses[gi];

  if (f < L.land) {
    const u = clamp((f - L.start) / Math.max(1, L.dur));
    let from;
    if (k === 0) {
      from = cutPose;
    } else {
      const prevGi = idx[k - 1];
      from = driftCam(landingPoses[prevGi], L.start, prevGi);
    }
    return moveInterp(L.kind, from, pose, u);
  }

  const seed = f <= L.land + HOLD_MAX ? gi + 10 : gi + 30;
  return driftCam(pose, f, seed);
}

function syncBoothVisibility(shot) {
  const b = room.booths;
  for (const id of Object.keys(b)) {
    b[id].visible = (id === shot.booth);
  }
}

/** Extra QA tester billboards seated at side stations (not the speaker). */
const QA_EXTRAS = [
  { name: 'kinkajou', side: -1.2, z: 1.5, scale: 0.9, pose: 'talk' },
  { name: 'kinkajou', side: 1.2, z: 1.45, scale: 0.88, pose: 'point' },
]

function placeCharacter(shot, f) {
  syncBoothVisibility(shot);
  const booth = room.boothMeta[shot.booth];
  const name = shot.char;
  for (const n of CHAR_NAMES) chars[n].group.visible = false;
  // hide extras by default (reuse same mesh slots via temporary clones stored on chars)
  if (chars._extras) {
    for (const e of chars._extras) e.group.visible = false;
  }
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

  // QA: show two additional testers at side desks (smaller, midground)
  if (shot.id === 'qa' && chars._extras) {
    QA_EXTRAS.forEach((spec, i) => {
      const ex = chars._extras[i];
      if (!ex) return;
      setPose(ex, chars.kinkajou.poses[spec.pose]);
      ex.group.visible = true;
      ex.group.scale.set(spec.scale, spec.scale, spec.scale);
      const eb = Math.sin(f * 0.17 + i) * 0.015;
      ex.group.position.set(booth.x + spec.side, eb, booth.z + spec.z);
      ex.group.rotation.y = Math.atan2(
        camera.position.x - ex.group.position.x,
        camera.position.z - ex.group.position.z,
      );
    });
  }
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
    city: await loadTex('assets/screens/city.png'),
    code: await loadTex('assets/screens/code.png'),
    upload: await loadTex('assets/screens/upload.png'),
    harbour: await loadTex('assets/screens/harbour.png'),
    qa: await loadTex('assets/screens/qa.png'),
    cert: await loadTex('assets/screens/cert.png'),
    years: await loadTex('assets/screens/years.png'),
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
  // Extra kinkajou billboards for QA lab (several testers)
  chars._extras = [];
  for (let i = 0; i < QA_EXTRAS.length; i++) {
    const poses = chars.kinkajou.poses;
    const bill = makeBillboard(poses.neutral);
    bill.poses = poses;
    bill.group.visible = false;
    scene.add(bill.group);
    chars._extras.push(bill);
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
