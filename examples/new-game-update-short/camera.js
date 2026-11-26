// Camera rail for new-game-update-short.
// Pure key→key interpolation (never falls back to a default/outro pose).
// Landings hit 0–4 frames before the named VO word; consecutive landings use
// different move kinds; holds never exceed MAX_HOLD frames (drift keys keep motion).
import { easeInOut, lin, clamp } from './core.js';

export const MAX_HOLD = 12;
export const NEAR_PLANE = 0.35;
export const OCCLUSION_MAX = 0.15;

export const MOVE_KINDS = [
  'push-in', 'pull-out', 'top-down', 'crane', 'orbit',
  'fly-through', 'low-hero', 'whip', 'cut',
];

/** Absolute world pose. Booths: bedroom 0, factory 20, studio 40, cert 60, coaster 80. */
function P(bx, bz, ox, oy, oz, lx, ly, lz, fov = 40) {
  return {
    x: bx + ox, y: oy, z: bz + oz,
    lx: bx + lx, ly, lz: bz + lz,
    fov,
  };
}

// Landings + drift. `lands` = VO-named landing; `kind` = how we ARRIVED.
// Render frames = word f_start - 1. Non-cut landing spans 12–30; drift ≤ MAX_HOLD.
// No two consecutive landings share a kind.
export const CAM_KEYS = [
  // —— bedroom hook ——
  { f: 0,   kind: 'cut',         lands: 'hook',           booth: 'bedroom',
    ...P(0, 0, 0.55, 1.72, 6.55, 0.02, 1.38, 1.85, 42) },
  { f: 12,  kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.48, 1.78, 6.35, 0.02, 1.40, 1.90, 42) },
  { f: 28,  kind: 'crane',       lands: 'Game',           booth: 'bedroom',
    ...P(0, 0, 0.35, 2.05, 5.85, 0.05, 1.45, 1.95, 42) },
  { f: 42,  kind: 'push-in',     lands: 'Update?',        booth: 'bedroom',
    ...P(0, 0, 0.18, 1.58, 5.35, 0.05, 1.42, 2.05, 40) },
  { f: 54,  kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.22, 1.62, 5.45, 0.04, 1.40, 2.00, 40) },

  // —— buy Call of Duty on disc ——
  { f: 66,  kind: 'pull-out',    lands: 'Lets',           booth: 'bedroom',
    ...P(0, 0, 0.55, 1.85, 6.40, 0.10, 1.35, 1.80, 42) },
  { f: 78,  kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.70, 1.80, 6.10, 0.15, 1.30, 1.70, 42) },
  { f: 90,  kind: 'orbit',       lands: 'Call',           booth: 'bedroom',
    ...P(0, 0, 1.15, 1.70, 5.55, 0.35, 1.55, 0.40, 40) },
  { f: 98,  kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 1.05, 1.55, 5.20, 1.00, 0.90, 1.10, 38) },
  { f: 110, kind: 'whip',        lands: 'disc!',          booth: 'bedroom',
    ...P(0, 0, 1.35, 1.25, 4.35, 1.40, 0.75, 1.05, 36) },
  { f: 122, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 1.10, 1.45, 4.70, 1.20, 0.90, 1.00, 38) },
  { f: 134, kind: 'top-down',    lands: 'Before',         booth: 'bedroom',
    ...P(0, 0, 1.10, 3.40, 4.00, 0.30, 1.75, -2.20, 42) },
  { f: 146, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 1.20, 2.60, 3.40, 0.30, 1.80, -2.40, 40) },
  { f: 164, kind: 'fly-through', lands: 'download',       booth: 'bedroom',
    ...P(0, 0, 1.35, 1.90, 2.20, 0.30, 1.85, -2.60, 38) },
  { f: 178, kind: 'low-hero',    lands: '200',            booth: 'bedroom',
    ...P(0, 0, 1.45, 1.15, 1.10, 0.30, 1.85, -2.70, 34) },
  { f: 190, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 1.20, 1.40, 2.40, 0.25, 1.70, -1.80, 38) },
  { f: 202, kind: 'pull-out',    lands: 'patch',          booth: 'bedroom',
    ...P(0, 0, 0.45, 1.70, 5.10, 0.10, 1.40, 1.80, 40) },
  { f: 214, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.30, 1.68, 5.25, 0.10, 1.38, 1.70, 40) },
  { f: 228, kind: 'orbit',       lands: 'why',            booth: 'bedroom',
    ...P(0, 0, -0.55, 1.65, 5.60, -0.05, 1.40, 2.00, 40) },
  { f: 240, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, -0.40, 1.62, 5.40, 0.00, 1.40, 2.05, 40) },
  { f: 252, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, -0.25, 1.60, 5.20, 0.02, 1.42, 2.10, 40) },
  { f: 268, kind: 'push-in',     lands: 'fixing',        booth: 'bedroom',
    ...P(0, 0, -0.10, 1.52, 4.85, 0.00, 1.45, 2.15, 38) },
  { f: 280, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, -0.05, 1.55, 4.95, 0.00, 1.42, 2.10, 38) },
  { f: 292, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.05, 1.58, 5.15, 0.00, 1.40, 2.05, 40) },

  // —— why not finished on the disc ——
  { f: 301, kind: 'cut',         lands: 'Why',            booth: 'bedroom',
    ...P(0, 0, 0.45, 1.75, 5.90, -0.02, 1.38, 1.95, 40) },
  { f: 313, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.55, 1.70, 5.70, 0.00, 1.35, 1.90, 40) },
  { f: 325, kind: 'orbit',       lands: 'finished',       booth: 'bedroom',
    ...P(0, 0, 0.95, 1.60, 5.20, 0.20, 1.30, 1.70, 38) },
  { f: 330, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 1.00, 1.40, 4.70, 0.80, 0.85, 1.10, 36) },
  { f: 342, kind: 'whip',        lands: 'disc?',          booth: 'bedroom',
    ...P(0, 0, 1.20, 1.15, 4.20, 1.40, 0.75, 1.05, 34) },
  { f: 354, kind: 'drift',       booth: 'bedroom',
    ...P(0, 0, 0.80, 1.40, 5.00, 0.40, 1.20, 1.50, 38) },

  // —— factory ——
  { f: 366, kind: 'cut',         lands: 'Millions',       booth: 'factory',
    ...P(20, 0, 0.80, 2.10, 7.40, 0.15, 1.25, 1.80, 42) },
  { f: 378, kind: 'drift',       booth: 'factory',
    ...P(20, 0, 0.60, 2.25, 7.10, 0.10, 1.30, 1.50, 42) },
  { f: 390, kind: 'crane',       lands: 'weeks',          booth: 'factory',
    ...P(20, 0, 0.30, 3.20, 6.20, 0.10, 1.40, 0.20, 44) },
  { f: 402, kind: 'drift',       booth: 'factory',
    ...P(20, 0, 0.10, 2.40, 5.80, 0.05, 1.20, -0.40, 40) },
  { f: 414, kind: 'fly-through', lands: 'print',          booth: 'factory',
    ...P(20, 0, -0.80, 1.55, 4.40, 0.10, 0.95, -0.85, 36) },
  { f: 426, kind: 'push-in',     lands: 'ship',           booth: 'factory',
    ...P(20, 0, 1.40, 1.35, 4.10, 1.70, 0.90, 0.70, 34) },
  { f: 438, kind: 'pull-out',    lands: 'done',           booth: 'factory',
    ...P(20, 0, 0.55, 1.80, 6.30, 0.15, 1.20, 2.20, 40) },
  { f: 450, kind: 'drift',       booth: 'factory',
    ...P(20, 0, 0.40, 1.75, 6.10, 0.15, 1.22, 2.30, 40) },
  { f: 462, kind: 'orbit',       lands: 'early',          booth: 'factory',
    ...P(20, 0, -0.70, 1.70, 5.90, 0.10, 1.25, 2.35, 38) },
  { f: 474, kind: 'drift',       booth: 'factory',
    ...P(20, 0, -0.30, 1.75, 6.20, 0.12, 1.22, 2.25, 38) },

  // —— gold master (CUT across booths — never interpolate through the void) ——
  { f: 485, kind: 'cut',         lands: 'This is',        booth: 'studio',
    ...P(40, 0, -0.35, 1.85, 6.20, -0.10, 1.40, 2.20, 40) },
  { f: 493, kind: 'drift',       booth: 'studio',
    ...P(40, 0, -0.25, 2.40, 5.70, -0.10, 1.40, 2.10, 42) },
  { f: 505, kind: 'top-down',    lands: 'going gold',     booth: 'studio',
    ...P(40, 0, -0.15, 3.40, 5.10, -0.10, 1.45, 2.15, 44) },
  { f: 517, kind: 'drift',       booth: 'studio',
    ...P(40, 0, -0.35, 1.50, 4.80, -0.10, 1.45, 2.20, 36) },
  { f: 529, kind: 'low-hero',    lands: 'gold hold',      booth: 'studio',
    ...P(40, 0, -0.55, 0.95, 4.60, -0.10, 1.45, 2.25, 34) },
  { f: 541, kind: 'drift',       booth: 'studio',
    ...P(40, 0, -0.40, 1.10, 4.70, -0.08, 1.40, 2.15, 36) },
  { f: 553, kind: 'pull-out',    lands: 'So your',        booth: 'studio',
    ...P(40, 0, -0.20, 1.75, 5.60, 0.00, 1.30, 2.00, 40) },
  { f: 565, kind: 'orbit',       lands: 'disc ago',       booth: 'studio',
    ...P(40, 0, 0.85, 1.55, 5.10, 0.20, 1.25, 1.80, 38) },
  { f: 572, kind: 'drift',       booth: 'studio',
    ...P(40, 0, 0.55, 1.70, 5.30, 0.10, 1.30, 1.90, 38) },
  { f: 584, kind: 'crane',       lands: 'weeks ago',      booth: 'studio',
    ...P(40, 0, 0.25, 2.40, 5.70, 0.05, 1.35, 1.90, 42) },

  // —— bugs ——
  { f: 591, kind: 'cut',         lands: 'team',           booth: 'studio',
    ...P(40, 0, 0.70, 1.70, 5.80, 0.10, 1.35, 2.10, 40) },
  { f: 603, kind: 'drift',       booth: 'studio',
    ...P(40, 0, 0.55, 1.65, 5.50, 0.15, 1.40, 1.60, 38) },
  { f: 615, kind: 'push-in',     lands: 'bugs',           booth: 'studio',
    ...P(40, 0, 0.35, 1.50, 4.40, 0.40, 1.55, 0.20, 36) },
  { f: 627, kind: 'drift',       booth: 'studio',
    ...P(40, 0, 0.25, 1.55, 4.70, 0.20, 1.45, 0.80, 38) },
  { f: 639, kind: 'whip',        lands: 'launch',         booth: 'studio',
    ...P(40, 0, -0.30, 1.85, 4.20, 0.00, 2.10, -2.20, 36) },
  { f: 651, kind: 'drift',       booth: 'studio',
    ...P(40, 0, 0.10, 1.70, 5.00, 0.10, 1.40, 1.50, 38) },
  { f: 663, kind: 'fly-through', lands: 'fixes',          booth: 'studio',
    ...P(40, 0, 0.45, 1.55, 4.60, 0.30, 1.50, 0.40, 36) },
  { f: 675, kind: 'drift',       booth: 'studio',
    ...P(40, 0, 0.35, 1.60, 5.10, 0.15, 1.35, 1.80, 38) },
  { f: 687, kind: 'pull-out',    lands: 'patch',          booth: 'studio',
    ...P(40, 0, 0.20, 1.80, 5.90, 0.10, 1.30, 2.10, 40) },

  // —— cert / Sony ——
  { f: 699, kind: 'cut',         lands: 'Sony',           booth: 'cert',
    ...P(60, 0, 0.50, 1.75, 6.40, -0.05, 1.35, 2.20, 40) },
  { f: 711, kind: 'drift',       booth: 'cert',
    ...P(60, 0, 0.70, 1.70, 6.00, 0.10, 1.40, 1.50, 38) },
  { f: 723, kind: 'orbit',       lands: 'checks',         booth: 'cert',
    ...P(60, 0, 1.10, 1.65, 5.40, 0.30, 1.70, -1.50, 38) },
  { f: 735, kind: 'low-hero',    lands: 'Fail',           booth: 'cert',
    ...P(60, 0, 0.15, 0.90, 3.80, 0.00, 1.05, -0.80, 34) },
  { f: 747, kind: 'drift',       booth: 'cert',
    ...P(60, 0, 0.25, 1.20, 4.20, 0.05, 1.15, -0.60, 36) },
  { f: 759, kind: 'crane',       lands: 'start',          booth: 'cert',
    ...P(60, 0, -0.40, 2.50, 5.50, 0.00, 1.80, -1.80, 42) },
  { f: 771, kind: 'push-in',     lands: 'over',           booth: 'cert',
    ...P(60, 0, -0.20, 1.85, 4.80, 0.00, 1.90, -2.20, 36) },
  { f: 783, kind: 'drift',       booth: 'cert',
    ...P(60, 0, 0.10, 1.70, 5.40, -0.05, 1.40, 1.50, 38) },
  { f: 795, kind: 'pull-out',    lands: 'again',          booth: 'cert',
    ...P(60, 0, 0.35, 1.85, 6.20, -0.05, 1.30, 2.20, 40) },

  // —— coaster ——
  { f: 805, kind: 'cut',         lands: 'This',           booth: 'coaster',
    ...P(80, 0, 0.45, 1.75, 6.30, 0.08, 1.35, 2.00, 40) },
  { f: 817, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.65, 1.70, 5.80, 0.40, 1.20, 1.60, 38) },
  { f: 829, kind: 'crane',       lands: 'disc is',        booth: 'coaster',
    ...P(80, 0, 0.70, 2.35, 5.50, 0.55, 1.35, 1.50, 40) },
  { f: 841, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.85, 1.85, 5.00, 0.90, 1.15, 1.35, 38) },
  { f: 853, kind: 'push-in',     lands: 'coaster',        booth: 'coaster',
    ...P(80, 0, 0.95, 1.55, 4.55, 1.15, 1.00, 1.25, 36) },
  { f: 865, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.70, 1.65, 5.10, 0.50, 1.25, 1.70, 38) },

  // —— finale ——
  { f: 877, kind: 'whip',        lands: 'The disc',       booth: 'coaster',
    ...P(80, 0, -0.35, 1.70, 5.80, -0.05, 1.40, 2.05, 40) },
  { f: 889, kind: 'orbit',       lands: 'finished',       booth: 'coaster',
    ...P(80, 0, 0.55, 1.55, 5.20, 0.00, 1.42, 2.10, 38) },
  { f: 901, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.40, 1.58, 5.35, 0.00, 1.40, 2.05, 38) },
  { f: 913, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.20, 1.62, 5.50, -0.02, 1.38, 2.00, 40) },
  { f: 925, kind: 'pull-out',    lands: "wasn't",         booth: 'coaster',
    ...P(80, 0, -0.15, 1.85, 6.20, -0.05, 1.35, 1.90, 42) },
  { f: 937, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.05, 1.80, 6.00, -0.02, 1.38, 1.95, 40) },
  { f: 949, kind: 'top-down',    lands: 'Congratulations', booth: 'coaster',
    ...P(80, 0, 0.10, 3.80, 5.40, -0.05, 1.45, 1.80, 44) },
  { f: 961, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.05, 2.60, 5.50, -0.05, 1.42, 1.95, 40) },
  { f: 973, kind: 'crane',       lands: "you're",         booth: 'coaster',
    ...P(80, 0, -0.20, 1.90, 5.70, -0.05, 1.40, 2.05, 40) },
  { f: 985, kind: 'push-in',     lands: 'developer!',     booth: 'coaster',
    ...P(80, 0, -0.05, 1.55, 4.95, -0.05, 1.45, 2.10, 36) },
  { f: 997, kind: 'drift',       booth: 'coaster',
    ...P(80, 0, 0.00, 1.58, 5.05, -0.05, 1.42, 2.05, 36) },
  { f: 1009, kind: 'drift',      booth: 'coaster',
    ...P(80, 0, 0.05, 1.62, 5.15, -0.05, 1.40, 2.00, 38) },
  { f: 1018, kind: 'drift',      booth: 'coaster',
    ...P(80, 0, 0.08, 1.65, 5.25, -0.05, 1.38, 1.95, 38) },
];

function validateKeyTable() {
  if (CAM_KEYS[0].f !== 0) throw new Error('camera: first key must be f=0');
  if (CAM_KEYS[CAM_KEYS.length - 1].f < 1010) throw new Error('camera: last key too early');
  let prevLandKind = null;
  for (let i = 1; i < CAM_KEYS.length; i++) {
    const a = CAM_KEYS[i - 1], b = CAM_KEYS[i];
    if (b.f <= a.f) throw new Error(`camera: non-increasing keys ${a.f} → ${b.f}`);
    const span = b.f - a.f;
    if (b.kind === 'cut') {
      if (span > MAX_HOLD) {
        throw new Error(`camera: pre-cut hold ${a.f}→${b.f} span ${span} > ${MAX_HOLD}`);
      }
    } else if (b.lands) {
      if (span < 12 || span > 30) {
        throw new Error(`camera: landing ${a.f}→${b.f} (${b.kind}/${b.lands}) span ${span} not in 12–30`);
      }
    } else if (span > MAX_HOLD) {
      throw new Error(`camera: drift ${a.f}→${b.f} span ${span} > MAX_HOLD ${MAX_HOLD}`);
    }
    if (b.lands) {
      if (prevLandKind && b.kind === prevLandKind) {
        throw new Error(`camera: consecutive landing kinds both "${b.kind}" at f${b.f} (${b.lands})`);
      }
      prevLandKind = b.kind;
    }
  }
}

validateKeyTable();

function lerpPose(a, b, t) {
  const e = easeInOut(t);
  return {
    x: lin(a.x, b.x, e),
    y: lin(a.y, b.y, e),
    z: lin(a.z, b.z, e),
    lx: lin(a.lx, b.lx, e),
    ly: lin(a.ly, b.ly, e),
    lz: lin(a.lz, b.lz, e),
    fov: lin(a.fov ?? 40, b.fov ?? 40, e),
    booth: e < 0.5 ? a.booth : b.booth,
    from: a.f,
    to: b.f,
    kind: b.kind,
    lands: b.lands || null,
    t: e,
  };
}

/** Resolve camera pose for frame f. Strict key→key only — never a default pose. */
export function cameraAt(f) {
  f = clamp(f, 0, 1018) | 0;
  const keys = CAM_KEYS;
  if (f <= keys[0].f) {
    const k = keys[0];
    return { ...k, from: k.f, to: k.f, t: 0 };
  }
  if (f >= keys[keys.length - 1].f) {
    const k = keys[keys.length - 1];
    return { ...k, from: k.f, to: k.f, t: 1 };
  }
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].f < f) i++;
  const a = keys[i], b = keys[i + 1];
  if (b.kind === 'cut') {
    if (f < b.f) return { ...a, from: a.f, to: b.f, t: 0, kind: a.kind, lands: a.lands || null };
    return { ...b, from: b.f, to: b.f, t: 1 };
  }
  const span = b.f - a.f;
  const t = span <= 0 ? 1 : (f - a.f) / span;
  return lerpPose(a, b, t);
}

export function landingKeys() {
  return CAM_KEYS.filter((k) => k.lands);
}

export function assertMaxHold(eps = 0.012) {
  let run = 0, maxRun = 0, maxAt = 0;
  let prev = cameraAt(0);
  for (let f = 1; f < 1019; f++) {
    const c = cameraAt(f);
    const d = Math.hypot(c.x - prev.x, c.y - prev.y, c.z - prev.z)
      + Math.hypot(c.lx - prev.lx, c.ly - prev.ly, c.lz - prev.lz) * 0.5;
    if (d < eps) {
      run++;
      if (run > maxRun) { maxRun = run; maxAt = f; }
    } else {
      run = 0;
    }
    prev = c;
  }
  if (maxRun > MAX_HOLD) {
    throw new Error(`camera max hold ${maxRun} frames ending ~f${maxAt} exceeds MAX_HOLD ${MAX_HOLD}`);
  }
  return { maxRun, maxAt, MAX_HOLD };
}

export function midMoveFrames() {
  const out = [];
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i], b = CAM_KEYS[i + 1];
    if (b.kind === 'cut' || b.f - a.f < 2) continue;
    out.push(Math.floor((a.f + b.f) / 2));
  }
  return out;
}

export function cameraKeySummary() {
  return landingKeys().map((k) => ({ f: k.f, kind: k.kind, lands: k.lands, booth: k.booth }));
}
