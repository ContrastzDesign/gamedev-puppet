// Motivated free camera for easiest-tool-short (content-short camera.md).
// Spherical poses around booth/character pivots; landings 0–4 frames before the named word.
// Move kinds never repeat back-to-back. Between landings the camera always drifts.
import { clamp, easeInOut, lin } from './core.js';
import { FRAMES } from './beats.js';

const DEG = Math.PI / 180;

/** Character aisle offset / scale (must match film.js placeCharacter). */
export function charLocal(shotId) {
  const side = ({
    hook: 0, question: 0.1, twine: -0.15, gdevelop: 0.2, nilo: -0.2,
  })[shotId] || 0;
  const scale = shotId === 'hook' || shotId === 'question' ? 1.18 : 0.9;
  return { side, z: 2.15, scale };
}

function boothOf(meta, id) {
  return meta[id] || meta.workshop;
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
    vo: opts.vo || '',
  };
}

/**
 * Landing / whip / drift keys. Frame numbers are 0-based render frames.
 * Successive *landings* alternate move kinds (camera.md / feedback.md §2).
 *
 * Landing sequence:
 *   fly-through → push-in → cut → orbit → crane → pull-out → whip → push-in
 *   → top-down → orbit → pull-out → whip → low-hero → push-in → follow
 *   → crane → whip → fly-through → push-in → orbit → crane
 */
function buildKeys() {
  return [
    // --- HOOK: already flying into FIRST GAME LAB ---
    // Keep sign + ceiling lamps in frame (no empty brick band).
    P(0,   'fly-through', 'workshop', 'hook',  22, 14, 4.85, 1.55, {
      fov: 44, lookZOff: -0.55, land: true, vo: 'open',
    }),
    P(8,   'drift',       'workshop', 'hook',  12, 13, 4.55, 1.42, {
      fov: 43, lookZOff: -0.35,
    }),
    P(16,  'push-in',     'workshop', 'hook',   3, 11, 4.05, 1.22, {
      fov: 42, lookZOff: -0.18, land: true, vo: 'easiest/tool',
    }),
    P(28,  'drift',       'workshop', 'hook',  -2, 12, 4.2, 1.28, { fov: 42, lookZOff: -0.22 }),
    P(44,  'drift',       'workshop', 'hook',  -8, 13, 4.4, 1.35, {
      fov: 42, lookSide: -0.3, lookZOff: -0.28,
    }),
    P(58,  'drift',       'workshop', 'hook', -12, 13, 4.55, 1.38, {
      fov: 43, lookSide: -0.4, lookZOff: -0.32,
    }),

    // --- QUESTION: cut, then orbit ---
    P(66,  'cut',         'workshop', 'question', 18, 12, 4.7, 1.35, {
      cut: true, fov: 43, lookSide: 0.35, lookZOff: -0.3, land: true, vo: 'Which',
    }),
    P(78,  'drift',       'workshop', 'question', 10, 12, 4.55, 1.30, {
      fov: 42, lookSide: 0.2, lookZOff: -0.25,
    }),
    P(86,  'orbit',       'workshop', 'question', -18, 12, 4.45, 1.28, {
      fov: 42, lookSide: -0.3, lookZOff: -0.22, land: true, vo: 'game-making tool',
    }),
    P(104, 'drift',       'workshop', 'question', -12, 13, 4.6, 1.35, {
      fov: 42, lookZOff: -0.3,
    }),
    P(122, 'drift',       'workshop', 'question', -4, 15, 4.85, 1.55, {
      fov: 44, lookZOff: -0.55,
    }),
    // crane toward wall banners — host stays medium; look at chest so feet clear captions
    P(146, 'crane',       'workshop', 'question', 6, 17, 4.7, 1.35, {
      fov: 44, lookZOff: -0.75, lookSide: 0.1, land: true, vo: 'first project',
    }),
    P(162, 'drift',       'workshop', 'question', 4, 16, 4.65, 1.32, {
      fov: 44, lookZOff: -0.65,
    }),
    // pull-out reveal — still readable host + neighbouring desks
    P(178, 'pull-out',    'workshop', 'question', 0, 15, 5.25, 1.4, {
      fov: 45, lookZOff: -0.8, land: true, vo: 'depends',
    }),
    P(196, 'drift',       'workshop', 'question', -4, 14, 5.0, 1.32, {
      fov: 44, lookZOff: -0.55,
    }),
    P(214, 'drift',       'workshop', 'question', -10, 13, 4.75, 1.25, {
      fov: 43, lookSide: -0.5, lookZOff: -0.35,
    }),

    // --- WHIP to TWINE (before "Twine" f260; shot 239) ---
    // Arc stays aimed at desks (not empty aisle floor).
    P(220, 'ease',        'workshop', 'question', -10, 13, 4.9, 1.35, {
      fov: 43, lookSide: -0.55, lookZOff: -0.3,
    }),
    P(232, 'arc',         'story', 'twine', -4, 16, 5.15, 1.55, {
      lookSide: 0.25, lookZOff: -0.55,
    }),
    P(248, 'whip',        'story', 'twine', 10, 12, 4.25, 1.28, {
      lookZOff: -0.28, land: true, vo: 'Twine',
    }),
    P(268, 'drift',       'story', 'twine', 8, 12, 4.25, 1.22, { lookZOff: -0.18 }),
    // push-in on passage cards
    P(298, 'push-in',     'story', 'twine', 2, 11, 3.95, 1.15, {
      lookSide: -0.4, lookZOff: -0.05, land: true, vo: 'passage',
    }),
    P(318, 'drift',       'story', 'twine', 0, 12, 4.1, 1.2, { lookSide: -0.28 }),
    P(340, 'drift',       'story', 'twine', -4, 13, 4.25, 1.28, { lookSide: -0.15, lookZOff: -0.1 }),
    // top-down onto linking / choice cards — keep TWINE sign fully in frame
    P(348, 'ease',        'story', 'twine', -2, 14, 4.35, 1.35, { lookZOff: -0.15 }),
    P(354, 'arc',         'story', 'twine', 8, 24, 4.55, 1.55, {
      lookSide: -0.4, lookZOff: -0.05,
    }),
    P(360, 'top-down',    'story', 'twine', 4, 16, 4.25, 1.45, {
      lookSide: -0.4, lookZOff: -0.35, land: true, vo: 'Linking',
    }),
    P(380, 'drift',       'story', 'twine', 2, 15, 4.3, 1.35, { lookSide: -0.25, lookZOff: -0.15 }),
    P(400, 'drift',       'story', 'twine', -2, 13, 4.4, 1.22, { lookZOff: -0.1 }),
    // orbit across story desk
    P(420, 'orbit',       'story', 'twine', -20, 12, 4.4, 1.2, {
      lookSide: 0.25, lookZOff: -0.15, land: true, vo: 'choice/programming',
    }),
    P(440, 'drift',       'story', 'twine', -14, 13, 4.55, 1.28, { lookSide: 0.15, lookZOff: -0.2 }),
    P(458, 'drift',       'story', 'twine', -8, 13, 4.7, 1.32, { lookZOff: -0.22 }),

    // --- WHIP to GDEVELOP (before "GDevelop" f496; shot 478) ---
    P(462, 'ease',        'story', 'twine', -6, 13, 4.8, 1.35),
    P(470, 'arc',         'logic', 'gdevelop', 4, 17, 5.4, 1.55, {
      lookSide: -0.85, lookZOff: -0.4,
    }),
    P(486, 'whip',        'logic', 'gdevelop', -14, 11, 4.35, 1.22, {
      lookZOff: -0.2, land: true, vo: 'GDevelop',
    }),
    P(510, 'drift',       'logic', 'gdevelop', -10, 11, 4.25, 1.18, { lookZOff: -0.15 }),
    // low hero on event editor (close, low el, aim at chest — fills empty top)
    P(548, 'low-hero',    'logic', 'gdevelop', -4, 5, 3.75, 1.15, {
      lookSide: 0.25, lookZOff: -0.25, land: true, vo: 'event editor',
    }),
    P(568, 'drift',       'logic', 'gdevelop', -2, 7, 3.9, 1.2, { lookSide: 0.18, lookZOff: -0.22 }),
    P(590, 'drift',       'logic', 'gdevelop', 4, 9, 4.1, 1.25, { lookSide: 0.12, lookZOff: -0.2 }),
    // push-in on "Player touches key"
    P(610, 'push-in',     'logic', 'gdevelop', 8, 10, 3.85, 1.1, {
      lookSide: 0.5, lookZOff: -0.05, land: true, vo: 'Player touches key',
    }),
    P(630, 'drift',       'logic', 'gdevelop', 6, 11, 4.0, 1.15, { lookSide: 0.4, lookZOff: -0.1 }),
    // follow toward open-door prop
    P(654, 'follow',      'logic', 'gdevelop', -4, 12, 4.15, 1.22, {
      lookSide: 0.6, lookZOff: -0.1, land: true, vo: 'open door',
    }),
    P(676, 'drift',       'logic', 'gdevelop', -1, 12, 4.25, 1.25, { lookSide: 0.35, lookZOff: -0.15 }),
    // crane up to editor screen / GDEVELOP sign
    P(702, 'crane',       'logic', 'gdevelop', 5, 17, 4.5, 1.65, {
      lookZOff: -0.7, land: true, vo: 'read the rule',
    }),
    P(724, 'drift',       'logic', 'gdevelop', 2, 15, 4.4, 1.45, { lookZOff: -0.45 }),
    P(742, 'drift',       'logic', 'gdevelop', -4, 13, 4.5, 1.3, { lookZOff: -0.25 }),

    // --- WHIP to NILO (before "Nilo" f785; shot 760) ---
    P(748, 'ease',        'logic', 'gdevelop', -2, 13, 4.65, 1.35),
    P(754, 'arc',         'world3d', 'nilo', 6, 17, 5.45, 1.55, {
      lookSide: -0.95, lookZOff: -0.4,
    }),
    P(770, 'whip',        'world3d', 'nilo', -12, 11, 4.35, 1.22, {
      lookZOff: -0.2, land: true, vo: 'Nilo',
    }),
    P(798, 'drift',       'world3d', 'nilo', -8, 12, 4.25, 1.25, { lookZOff: -0.18 }),
    // fly-through toward mini world / TYPE→BUILD
    P(830, 'fly-through', 'world3d', 'nilo', -2, 14, 4.1, 1.4, {
      lookSide: 0.45, lookZOff: -0.4, land: true, vo: '3D game world',
    }),
    P(848, 'drift',       'world3d', 'nilo', 2, 13, 4.05, 1.3, {
      lookSide: 0.3, lookZOff: -0.28,
    }),
    // push-in on "type"
    P(860, 'push-in',     'world3d', 'nilo', 6, 11, 3.85, 1.15, {
      lookSide: -0.4, lookZOff: -0.05, land: true, vo: 'type',
    }),
    P(880, 'drift',       'world3d', 'nilo', 4, 12, 4.05, 1.22, { lookZOff: -0.12 }),
    P(900, 'drift',       'world3d', 'nilo', 0, 13, 4.25, 1.32, { lookZOff: -0.22 }),
    // orbit on playtesting
    P(930, 'orbit',       'world3d', 'nilo', 20, 12, 4.4, 1.25, {
      lookSide: 0.25, lookZOff: -0.2, land: true, vo: 'playtesting',
    }),
    P(955, 'drift',       'world3d', 'nilo', 14, 13, 4.35, 1.3, { lookSide: 0.12, lookZOff: -0.25 }),
    // crane finish
    P(972, 'crane',       'world3d', 'nilo', 6, 16, 4.55, 1.55, {
      lookZOff: -0.5, land: true, vo: 'writing code',
    }),
    P(990, 'drift',       'world3d', 'nilo', 4, 15, 4.45, 1.42, { lookZOff: -0.35 }),
    P(997, 'drift',       'world3d', 'nilo', 3, 14, 4.4, 1.35, { lookZOff: -0.28 }),
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
    shotId: key.shotId,
  };
}

function lerpResolved(a, b, t) {
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
  if (ka.boothId !== kb.boothId) {
    const ra = resolvePose(meta, ka);
    const rb = resolvePose(meta, { ...kb, phi: phiB });
    return lerpResolved(ra, rb, t);
  }
  return resolvePose(meta, blended);
}

export function cameraMovesSummary() {
  return KEYS.filter((k) => k.land).map((k) => ({
    f: k.f, kind: k.kind, booth: k.boothId, shot: k.shotId, vo: k.vo,
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

export function maxStaticRun(meta, eps = 0.002) {
  let prev = null;
  let run = 0;
  let maxRun = 0;
  let maxAt = 0;
  for (let f = 0; f < FRAMES; f++) {
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
  f = clamp(f, 0, FRAMES - 1);
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1].f <= f) i += 1;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];

  if (b.f === a.f || f <= a.f) {
    return resolvePose(meta, a);
  }
  if (b.cut) {
    return resolvePose(meta, f < b.f ? a : b);
  }
  const t = easeInOut(clamp((f - a.f) / (b.f - a.f)));
  return lerpSpherical(meta, a, b, t);
}

export { KEYS as CAMERA_KEYS };
