// Motivated free camera for build-game-short (content-short camera.md).
// Spherical poses around booth/character pivots; landings 0–4 frames before the named word.
// Move kinds never repeat back-to-back. Between landings the camera always drifts.
import { clamp, easeInOut, lin } from './core.js';

const DEG = Math.PI / 180;

/** Character aisle offset / scale (must match film.js charLocal). */
export function charLocal(shotId) {
  const side = ({
    hook: 0, platform: 0.1, roblox: -0.15, godot: 0.2, nilo: -0.2, outro: 0.1,
  })[shotId] || 0;
  const scale = shotId === 'hook' || shotId === 'platform' ? 1.18 : 0.9;
  return { side, z: 2.15, scale };
}

function boothOf(meta, id) {
  return meta[id] || meta.open;
}

function pivotAt(meta, boothId, shotId, lookY, lookSide = 0, lookZOff = 0) {
  const b = boothOf(meta, boothId);
  const cl = charLocal(shotId);
  return [
    b.x + cl.side + lookSide,
    lookY,
    b.z + cl.z + lookZOff,
  ];
}

/**
 * Pose in orbit form. φ=0 is in front (+Z side of pivot looking toward −Z / the booths).
 * eye = pivot + d·(sinφ·cos el, sin el, cosφ·cos el)
 */
function P(f, kind, boothId, shotId, phi, el, d, lookY, opts = {}) {
  return {
    f,
    kind,
    boothId,
    shotId,
    phi,
    el,
    d,
    lookY,
    lookSide: opts.lookSide || 0,
    lookZOff: opts.lookZOff || 0,
    fov: opts.fov ?? 40,
    cut: !!opts.cut,
    land: !!opts.land,
  };
}

/**
 * Landing / whip / drift keys. Frame numbers are 0-based render frames.
 * Kinds on successive *landings* (and major beats) alternate.
 */
function buildKeys() {
  // Move-kind sequence (landings / major beats):
  // fly-through → push-in → cut → orbit → whip → push-in → crane → top-down
  // → whip → low-hero → pull-out → crane → push-in → whip → fly-through
  // → push-in → orbit → low-hero → cut → push-in → crane
  return [
    // --- HOOK: already flying in (fly-through), land before "build" (f18) ---
    // Keep look on torso + booth signs; fill frame with desk/wall (not empty floor/ceiling).
    P(0,   'fly-through', 'street', 'hook',  22, 12, 5.0, 1.25, { fov: 42, lookZOff: -0.35, land: true }),
    P(8,   'drift',       'street', 'hook',  12, 11, 4.7, 1.18, { fov: 42, lookZOff: -0.25 }),
    P(16,  'push-in',     'street', 'hook',   4, 10, 4.25, 1.12, { fov: 42, lookZOff: -0.15, land: true }), // build-2
    P(28,  'drift',       'street', 'hook',   2, 10, 4.15, 1.10, { fov: 42, lookZOff: -0.1 }),
    P(40,  'drift',       'street', 'hook',  -4, 11, 4.35, 1.15, { fov: 42, lookSide: -0.4 }),

    // --- PLATFORM Q: cut, then orbit — φ swing reveals neighbors; keep host fully in frame ---
    P(51,  'cut',         'street', 'platform', -16, 11, 4.9, 1.22, {
      cut: true, fov: 43, lookSide: -0.35, lookZOff: -0.3, land: true,
    }),
    P(63,  'orbit',       'street', 'platform',   0, 11, 4.75, 1.18, {
      fov: 42, lookSide: 0.0, lookZOff: -0.25, land: true,
    }), // platform-2
    P(80,  'drift',       'street', 'platform',  14, 11, 4.85, 1.20, { fov: 43, lookSide: 0.35, lookZOff: -0.3 }),
    P(96,  'drift',       'street', 'platform',   8, 11, 4.8, 1.18, { fov: 42, lookSide: 0.15, lookZOff: -0.2 }),

    // --- WHIP to ROBLOX (land before "Roblox" f141) — low arcs, signs fully in frame ---
    P(104, 'ease',        'street', 'platform', 8, 11, 4.95, 1.25, { fov: 42, lookSide: 0.3 }),
    P(118, 'arc',         'blocks', 'roblox',  4, 13, 5.2, 1.35, { lookSide: 0.2, lookZOff: -0.25 }),
    P(139, 'whip',        'blocks', 'roblox',  6, 10, 4.65, 1.15, { lookZOff: -0.2, land: true }), // Roblox-2

    // --- push-in on "easiest" ---
    P(155, 'drift',       'blocks', 'roblox',   8, 11, 4.65, 1.10, { lookZOff: -0.15 }),
    P(170, 'drift',       'blocks', 'roblox',   6, 10, 4.45, 1.05, { lookZOff: -0.1 }),
    P(187, 'push-in',     'blocks', 'roblox',   4, 10, 4.15, 1.00, { land: true }), // easiest-2
    P(210, 'drift',       'blocks', 'roblox',   3, 11, 4.25, 1.08),
    P(230, 'drift',       'blocks', 'roblox',   2, 13, 4.4, 1.22, { lookZOff: -0.25 }),

    // --- crane up onto free / publishing screens ---
    P(253, 'crane',       'blocks', 'roblox',  -2, 17, 4.55, 1.45, { lookZOff: -0.55, land: true }), // free-2
    P(280, 'drift',       'blocks', 'roblox',   2, 15, 4.45, 1.30, { lookZOff: -0.35 }),
    P(310, 'drift',       'blocks', 'roblox',   8, 13, 4.4, 1.15, { lookSide: 0.25 }),

    // --- top-down drop onto 70% earnings (keep jar + character readable, no empty floor) ---
    P(322, 'ease',        'blocks', 'roblox',  10, 13, 4.5, 1.20, { lookSide: 0.2 }),
    P(336, 'arc',         'blocks', 'roblox',  16, 24, 4.7, 1.40, { lookSide: 0.55, lookZOff: 0.05 }),
    P(350, 'top-down',    'blocks', 'roblox',  12, 22, 4.15, 1.40, { lookSide: 0.6, lookZOff: 0.15, land: true }), // 70%-2
    P(370, 'drift',       'blocks', 'roblox',  10, 18, 4.35, 1.25, { lookSide: 0.4, lookZOff: 0.05 }),
    P(388, 'drift',       'blocks', 'roblox',   5, 14, 4.5, 1.15),

    // --- whip to GODOT (land before "Godot" f437) ---
    P(395, 'ease',        'blocks', 'roblox',   3, 13, 4.6, 1.20),
    P(412, 'arc',         'open',   'godot',    2, 14, 5.4, 1.35, { lookSide: -0.9, lookZOff: -0.25 }),
    P(435, 'whip',        'open',   'godot',  -10, 10, 4.6, 1.10, { lookZOff: -0.15, land: true }), // Godot-2

    // --- low hero on "opposite" ---
    P(450, 'drift',       'open', 'godot', -10, 10, 4.5, 1.00),
    P(468, 'low-hero',    'open', 'godot',  -6,  7, 4.05, 0.85, { land: true }), // opposite-2
    P(500, 'drift',       'open', 'godot',  -4,  9, 4.25, 0.95),
    P(520, 'drift',       'open', 'godot',  -2, 11, 4.45, 1.05),

    // --- pull-out on free / workshop ---
    P(543, 'pull-out',    'open', 'godot',   6, 13, 5.2, 1.25, { lookZOff: -0.2, land: true }), // free-2
    P(565, 'drift',       'open', 'godot',   8, 12, 5.0, 1.18, { lookZOff: -0.15 }),

    // --- crane toward publishing fees / toll ---
    P(585, 'drift',       'open', 'godot',  10, 14, 4.8, 1.25, { lookSide: 0.35, lookZOff: 0.1 }),
    P(610, 'drift',       'open', 'godot',  12, 15, 4.55, 1.30, { lookSide: 0.5, lookZOff: 0.2 }),
    P(643, 'crane',       'open', 'godot',  14, 18, 4.25, 1.35, { lookSide: 0.6, lookZOff: 0.3, land: true }), // fees-2
    P(670, 'drift',       'open', 'godot',  10, 14, 4.4, 1.20, { lookSide: 0.3 }),
    P(700, 'drift',       'open', 'godot',   4, 11, 4.35, 1.05),

    // --- push-in on "expensive" ---
    P(720, 'ease',        'open', 'godot',   2, 11, 4.4, 1.00),
    P(745, 'arc',         'open', 'godot',  -8, 15, 4.9, 1.15),
    P(771, 'push-in',     'open', 'godot',  -2,  9, 3.95, 0.95, { land: true }), // expensive-2
    P(790, 'drift',       'open', 'godot',   0, 10, 4.15, 1.00),

    // --- whip to NILO (land before "Nilo" f827) ---
    P(798, 'ease',        'open',   'godot',  2, 11, 4.4, 1.10),
    P(812, 'arc',         'portal', 'nilo',   4, 14, 5.35, 1.35, { lookSide: -0.9, lookZOff: -0.25 }),
    P(825, 'whip',        'portal', 'nilo',  -8, 10, 4.55, 1.10, { lookZOff: -0.15, land: true }), // Nilo-2

    // --- fly-through / follow toward portal on "playable" ---
    P(846, 'fly-through', 'portal', 'nilo',  -8, 12, 4.4, 1.20, { lookSide: 0.4, lookZOff: -0.25, land: true }),
    P(870, 'drift',       'portal', 'nilo',  -4, 13, 4.25, 1.30, { lookSide: 0.5, lookZOff: -0.3 }),

    // --- push-in on browser / portal ring ---
    P(887, 'push-in',     'portal', 'nilo',  -1, 14, 4.0, 1.35, { lookSide: 0.55, lookZOff: -0.35, land: true }), // browser-2
    P(910, 'drift',       'portal', 'nilo',   3, 12, 4.25, 1.15),

    // --- orbit on non-developers ---
    P(920, 'orbit',       'portal', 'nilo',  16, 11, 4.55, 1.05, { land: true }),
    P(950, 'drift',       'portal', 'nilo',  20, 10, 4.4, 1.00),
    P(970, 'drift',       'portal', 'nilo',  12, 11, 4.3, 1.05, { lookSide: -0.4 }),

    // --- low hero on "link" ---
    P(987, 'low-hero',    'portal', 'nilo',   5,  7, 4.0, 0.88, { lookSide: -0.55, lookZOff: 0.0, land: true }), // link-2
    P(995, 'drift',       'portal', 'nilo',   3,  8, 4.15, 0.95, { lookSide: -0.35 }),

    // --- CUT to outro sugar glider, then push-in to playtest / crane finish ---
    P(1003, 'cut',        'portal', 'outro',  -8, 11, 4.7, 1.10, { cut: true, lookZOff: -0.15, land: true }),
    P(1020, 'drift',      'portal', 'outro',  -4, 11, 4.5, 1.05, { lookZOff: -0.1 }),
    P(1040, 'drift',      'portal', 'outro',   0, 10, 4.3, 1.00),
    P(1066, 'push-in',    'portal', 'outro',   4,  9, 4.0, 0.95, { land: true }), // playtest-2
    P(1088, 'drift',      'portal', 'outro',   5, 11, 4.15, 1.05),
    P(1103, 'crane',      'portal', 'outro',   6, 15, 4.4, 1.20, { lookZOff: -0.15, land: true }), // join-2
    P(1120, 'drift',      'portal', 'outro',   4, 14, 4.3, 1.15, { lookZOff: -0.1 }),
    P(1135, 'drift',      'portal', 'outro',   2, 13, 4.2, 1.10),
  ];
}

const KEYS = buildKeys();

function unwrapPhi(prev, next) {
  let p = next;
  while (p - prev > 180) p -= 360;
  while (p - prev < -180) p += 360;
  return p;
}

function resolvePose(meta, key) {
  const [px, py, pz] = pivotAt(
    meta, key.boothId, key.shotId, key.lookY, key.lookSide, key.lookZOff,
  );
  const phi = key.phi * DEG;
  const el = key.el * DEG;
  const c = Math.cos(el);
  return {
    x: px + key.d * Math.sin(phi) * c,
    y: py + key.d * Math.sin(el),
    z: pz + key.d * Math.cos(phi) * c,
    lx: px,
    ly: py,
    lz: pz,
    fov: key.fov,
    kind: key.kind,
    boothId: key.boothId,
  };
}

function lerpResolved(a, b, t, geometricD = true) {
  // Re-lerp in spherical space when both share a booth for cleaner push/orbit;
  // otherwise lerp eye/look in world space (fly-through / whip across aisle).
  return {
    x: lin(a.x, b.x, t),
    y: lin(a.y, b.y, t),
    z: lin(a.z, b.z, t),
    lx: lin(a.lx, b.lx, t),
    ly: lin(a.ly, b.ly, t),
    lz: lin(a.lz, b.lz, t),
    fov: lin(a.fov, b.fov, t),
  };
}

/** Spherical lerp when keys share a booth (smoother push / crane / orbit). */
function lerpSpherical(meta, ka, kb, t) {
  const phiB = unwrapPhi(ka.phi, kb.phi);
  const phi = lin(ka.phi, phiB, t);
  const el = lin(ka.el, kb.el, t);
  const d = Math.exp(lin(Math.log(Math.max(0.5, ka.d)), Math.log(Math.max(0.5, kb.d)), t));
  const lookY = lin(ka.lookY, kb.lookY, t);
  const lookSide = lin(ka.lookSide, kb.lookSide, t);
  const lookZOff = lin(ka.lookZOff, kb.lookZOff, t);
  const fov = lin(ka.fov, kb.fov, t);
  const blended = {
    f: ka.f, kind: kb.kind, boothId: kb.boothId, shotId: kb.shotId,
    phi, el, d, lookY, lookSide, lookZOff, fov, cut: false,
  };
  // Cross-booth: blend booth pivots in world space via resolved eyes.
  if (ka.boothId !== kb.boothId) {
    const ra = resolvePose(meta, ka);
    const rb = resolvePose(meta, { ...kb, phi: phiB });
    return lerpResolved(ra, rb, t);
  }
  return resolvePose(meta, blended);
}

export function cameraMovesSummary() {
  return KEYS.filter((k) => k.land).map((k) => ({
    f: k.f, kind: k.kind, booth: k.boothId, shot: k.shotId,
  }));
}

export function assertMoveVariety() {
  const lands = cameraMovesSummary();
  const bad = [];
  for (let i = 1; i < lands.length; i++) {
    if (lands[i].kind === lands[i - 1].kind) {
      bad.push(`${lands[i - 1].kind} @${lands[i - 1].f} then @${lands[i].f}`);
    }
  }
  if (bad.length) throw new Error(`Repeated camera move kinds back-to-back:\n  ${bad.join('\n  ')}`);
  return lands;
}

/** Longest hold (identical eye within epsilon) — used by unit-ish checks. */
export function maxStaticRun(meta, eps = 0.002) {
  let prev = null;
  let run = 0;
  let maxRun = 0;
  let maxAt = 0;
  for (let f = 0; f < 1136; f++) {
    const c = cameraFor(meta, f);
    const same = prev && Math.hypot(c.x - prev.x, c.y - prev.y, c.z - prev.z) < eps
      && Math.hypot(c.lx - prev.lx, c.ly - prev.ly, c.lz - prev.lz) < eps;
    if (same) {
      run += 1;
      if (run > maxRun) { maxRun = run; maxAt = f; }
    } else run = 0;
    prev = c;
  }
  return { maxRun, maxAt };
}

export function cameraFor(meta, f) {
  f = clamp(f, 0, 1135);
  // Find surrounding keys
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1].f <= f) i += 1;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];

  if (b.f === a.f || f <= a.f) {
    return resolvePose(meta, a);
  }
  // Cut on b's frame: hold a until the cut, then jump (no interpolate)
  if (b.cut) {
    return resolvePose(meta, f < b.f ? a : b);
  }
  const t = easeInOut(clamp((f - a.f) / (b.f - a.f)));
  return lerpSpherical(meta, a, b, t);
}

export { KEYS as CAMERA_KEYS };
