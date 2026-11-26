// Free-moving camera for engine-real (content-short camera.md).
// Lands 0–4 frames before the named VO word; varies move kind every beat;
// eases 12–30 frames; never freezes (>12-frame hold fails assertMaxHold).
import { clamp, easeInOut, lin } from './core.js';
import { SHOTS } from './beats.js';

export const MAX_HOLD = 12;
export const MOVE_MIN = 12;
export const MOVE_MAX = 30;

/** Move kinds — never repeat the same kind on consecutive landings. */
export const MOVE_KINDS = [
  'push-in', 'pull-out', 'top-down', 'crane', 'orbit',
  'fly-through', 'low-hero', 'whip', 'cut',
];

/**
 * Landings: `f` is the 0-based render frame the pose settles on
 * (0–4 frames before the VO word's f_start-1). `kind` is the move into this pose.
 * Pose is orbit-style: pivot + d·(sinφ·cos el, sin el, cosφ·cos el) in three.js axes.
 */
export const LANDINGS = [
  // Hook — already moving into the realism lab (character medium)
  { f: 0,   kind: 'push-in',     booth: 'lab',    pivot: 'char',     phi: 10,  el: 14, d: 5.4,  lookY: 1.05, label: 'hook' },
  // "footage?" f_start 112 → land ~108
  { f: 108, kind: 'orbit',       booth: 'lab',    pivot: 'screens',  phi: -28, el: 16, d: 4.0,  lookY: 1.75, label: 'footage' },
  // "demos" f_start 157 → land ~153
  { f: 153, kind: 'crane',       booth: 'lab',    pivot: 'screens',  phi: 18,  el: 28, d: 4.6,  lookY: 1.85, label: 'demos' },
  // "difference." f_start 257 → land ~253
  { f: 253, kind: 'pull-out',    booth: 'lab',    pivot: 'char',     phi: 6,   el: 18, d: 6.2,  lookY: 1.15, label: 'difference' },
  // "Unreal" f_start 302 → land ~298
  { f: 298, kind: 'cut',         booth: 'city',   pivot: 'char',     phi: -12, el: 12, d: 5.0,  lookY: 0.95, label: 'unreal' },
  // "city" f_start 340 → land ~336 (street-level mini set) — keep desk + screen in frame, no dark void
  { f: 336, kind: 'low-hero',    booth: 'city',   pivot: 'street',   phi: 18,  el: 14, d: 3.1,  lookY: 1.35, label: 'street' },
  // "Matrix" f_start 385 → land ~381
  { f: 381, kind: 'push-in',     booth: 'city',   pivot: 'screen',   phi: 4,   el: 10, d: 3.2,  lookY: 1.85, label: 'matrix' },
  // "Nanite" f_start 415 → land ~411
  { f: 411, kind: 'top-down',    booth: 'city',   pivot: 'wire',     phi: -10, el: 48, d: 3.3,  lookY: 1.65, label: 'nanite' },
  // "Lumen" f_start 474 → land ~470
  { f: 470, kind: 'crane',       booth: 'city',   pivot: 'screen',   phi: 30,  el: 22, d: 3.8,  lookY: 1.8,  label: 'lumen' },
  // "move" f_start 529 → land ~525 (fly through the city desk)
  { f: 525, kind: 'fly-through', booth: 'city',   pivot: 'aisle',    phi: -28, el: 12, d: 3.6,  lookY: 1.35, label: 'flythrough' },
  // "Unity" f_start 617 → land ~613
  { f: 613, kind: 'cut',         booth: 'face',   pivot: 'char',     phi: 14,  el: 12, d: 5.0,  lookY: 0.95, label: 'unity' },
  // "Enemies" f_start 672 → land ~668
  { f: 668, kind: 'whip',        booth: 'face',   pivot: 'screen',   phi: -8,  el: 11, d: 3.1,  lookY: 1.85, label: 'enemies' },
  // "High" (HDRP) f_start 700 → land ~696
  { f: 696, kind: 'orbit',       booth: 'face',   pivot: 'screen',   phi: 35,  el: 14, d: 3.4,  lookY: 1.8,  label: 'hdrp' },
  // "eye" f_start 751 → land ~747
  { f: 747, kind: 'low-hero',    booth: 'face',   pivot: 'skin',     phi: -20, el: 6,  d: 2.6,  lookY: 1.7,  label: 'eye' },
  // "face" (fills) f_start 856 → land ~852
  { f: 852, kind: 'push-in',     booth: 'face',   pivot: 'screen',   phi: 2,   el: 9,  d: 2.7,  lookY: 1.85, label: 'fills' },
  // "frame" (budget) f_start 924 → land ~920
  { f: 920, kind: 'whip',        booth: 'budget', pivot: 'char',     phi: -16, el: 13, d: 5.1,  lookY: 0.95, label: 'budget' },
  // "sixty" f_start 955 → land ~951 — tighter on timer/desk so floor doesn't read empty
  { f: 951, kind: 'top-down',    booth: 'budget', pivot: 'timer',    phi: 8,   el: 52, d: 2.7,  lookY: 1.4,  label: 'sixty' },
  // "16.7" f_start 1007 → land ~1003
  { f: 1003, kind: 'push-in',    booth: 'budget', pivot: 'timer',    phi: -6,  el: 12, d: 2.3,  lookY: 1.3,  label: 'ms167' },
  // "city" (vs face) f_start 1096 → land ~1092
  { f: 1092, kind: 'crane',      booth: 'budget', pivot: 'split',    phi: 18,  el: 26, d: 3.6,  lookY: 1.55, label: 'cityface' },
  // "photorealistic" f_start 1217 → land ~1213
  { f: 1213, kind: 'low-hero',   booth: 'budget', pivot: 'char',     phi: 8,   el: 7,  d: 4.6,  lookY: 0.95, label: 'photo' },
];

function deg(d) { return d * Math.PI / 180; }

function boothMeta(room, id) {
  return room.boothMeta[id];
}

/** World-space pivot for a landing, given booth centres from room.js. */
export function resolvePivot(room, landing, charLocal) {
  const b = boothMeta(room, landing.booth);
  const cl = charLocal({ id: landing.booth === 'lab' ? 'hook' : landing.booth === 'city' ? 'unreal' : landing.booth === 'face' ? 'unity' : 'budget', booth: landing.booth });
  const charX = b.x + cl.side;
  const charZ = b.z + cl.z;
  const lookY = landing.lookY ?? 1.0;
  switch (landing.pivot) {
    case 'char':
      return { x: charX, y: lookY, z: charZ };
    case 'screens':
      return { x: b.x, y: lookY, z: b.z - 0.15 };
    case 'screen':
      return { x: b.x, y: lookY, z: b.z - 0.2 };
    case 'wire':
      return { x: b.x + 0.95, y: lookY, z: b.z - 0.2 };
    case 'street':
      return { x: b.x + 0.35, y: lookY, z: b.z + 0.35 };
    case 'aisle':
      return { x: b.x + 0.2, y: lookY, z: b.z + 1.2 };
    case 'skin':
      return { x: b.x + 0.95, y: lookY, z: b.z - 0.15 };
    case 'timer':
      return { x: b.x + 0.1, y: lookY, z: b.z + 0.4 };
    case 'split':
      return { x: b.x - 0.7, y: lookY, z: b.z + 0.2 };
    default:
      return { x: b.x, y: lookY, z: b.z };
  }
}

/** Orbit pose → camera + look-at. */
export function poseToCam(pivot, phi, el, d) {
  const p = deg(phi), e = deg(el);
  return {
    x: pivot.x + d * Math.sin(p) * Math.cos(e),
    y: pivot.y + d * Math.sin(e),
    z: pivot.z + d * Math.cos(p) * Math.cos(e),
    lx: pivot.x,
    ly: pivot.y,
    lz: pivot.z,
    phi, el, d,
  };
}

function lerpPose(a, b, t) {
  const u = easeInOut(clamp(t));
  // φ unwrapped
  let dPhi = b.phi - a.phi;
  while (dPhi > 180) dPhi -= 360;
  while (dPhi < -180) dPhi += 360;
  const phi = a.phi + dPhi * u;
  const el = lin(a.el, b.el, u);
  // geometric d (camera.md)
  const d = Math.exp(lin(Math.log(Math.max(0.4, a.d)), Math.log(Math.max(0.4, b.d)), u));
  const pivot = {
    x: lin(a.pivot.x, b.pivot.x, u),
    y: lin(a.pivot.y, b.pivot.y, u),
    z: lin(a.pivot.z, b.pivot.z, u),
  };
  return poseToCam(pivot, phi, el, d);
}

/** Departure frame for the move into landing i (whip gets a longer run-up). */
function moveStart(i) {
  if (i <= 0) return 0;
  const land = LANDINGS[i];
  const prev = LANDINGS[i - 1];
  if (land.kind === 'cut') return land.f;
  const gap = land.f - prev.f;
  let span = land.kind === 'whip' ? Math.min(MOVE_MAX, Math.max(18, Math.floor(gap * 0.55)))
    : Math.min(MOVE_MAX, Math.max(MOVE_MIN, Math.floor(gap * 0.45)));
  // Keep a short settle after the previous landing before departing
  const earliest = prev.f + 2;
  let start = land.f - span;
  if (start < earliest) {
    start = earliest;
    span = land.f - start;
  }
  if (span < MOVE_MIN && land.kind !== 'cut') {
    // Short hop: still ease over whatever gap we have (≥ 4)
    start = Math.max(prev.f + 1, land.f - Math.max(4, span));
  }
  return start;
}

/**
 * Resolve absolute orbit pose for a landing once room + charLocal are known.
 */
function absoluteLanding(room, landing, charLocal) {
  const pivot = resolvePivot(room, landing, charLocal);
  return {
    f: landing.f,
    kind: landing.kind,
    label: landing.label,
    booth: landing.booth,
    pivot,
    phi: landing.phi,
    el: landing.el,
    d: landing.d,
  };
}

/**
 * Build a per-frame camera sampler. Also injects micro-drift so holds never exceed MAX_HOLD.
 */
export function buildCamera(room, charLocal) {
  const abs = LANDINGS.map((L) => absoluteLanding(room, L, charLocal));

  // Validate kinds
  for (let i = 1; i < abs.length; i++) {
    if (abs[i].kind === abs[i - 1].kind) {
      throw new Error(`camera: consecutive landings share kind "${abs[i].kind}" (${abs[i - 1].label} → ${abs[i].label})`);
    }
  }

  const starts = abs.map((_, i) => moveStart(i));

  function poseAtLanding(i) {
    return abs[i];
  }

  /** Drift pose after landing i, progressing toward the next departure. */
  function drifted(i, f) {
    const A = poseAtLanding(i);
    const nextStart = i + 1 < abs.length ? starts[i + 1] : A.f + 40;
    const holdEnd = Math.min(A.f + MAX_HOLD, nextStart);
    if (f <= A.f) return { ...A, pivot: { ...A.pivot } };
    if (f >= nextStart) return { ...A, pivot: { ...A.pivot } };
    // Continuous multi-frequency drift so no >MAX_HOLD still run (camera.md: never stops)
    const t = (f - A.f) / Math.max(1, nextStart - A.f);
    const wob = 0.35 * Math.sin(t * Math.PI * 2.3) + 0.2 * Math.sin(t * Math.PI * 5.1);
    const driftPhi = A.phi + 5.5 * Math.sin(t * Math.PI) + 1.2 * wob;
    const driftEl = A.el + 2.4 * Math.sin(t * Math.PI * 0.7) + 0.6 * wob;
    const driftD = A.d * (1 - 0.055 * t + 0.015 * Math.sin(t * Math.PI * 3));
    return {
      ...A,
      phi: driftPhi,
      el: driftEl,
      d: driftD,
      pivot: {
        x: A.pivot.x + 0.06 * Math.sin(t * Math.PI * 0.5) + 0.02 * wob,
        y: A.pivot.y + 0.015 * Math.sin(t * Math.PI * 1.3),
        z: A.pivot.z + 0.03 * Math.sin(t * Math.PI * 0.9),
      },
    };
  }

  function camAt(f) {
    // Before first landing
    if (f <= abs[0].f) {
      const P = drifted(0, abs[0].f);
      // Pre-roll: push-in from a slightly wider start into landing 0
      const pre = {
        ...P,
        phi: P.phi + 6,
        el: P.el + 3,
        d: P.d * 1.18,
      };
      const t = abs[0].f === 0 ? 1 : clamp(f / abs[0].f);
      return lerpPose(
        { pivot: pre.pivot, phi: pre.phi, el: pre.el, d: pre.d },
        { pivot: P.pivot, phi: P.phi, el: P.el, d: P.d },
        t,
      );
    }

    for (let i = 0; i < abs.length; i++) {
      const land = abs[i];
      const next = abs[i + 1];
      const start = starts[i];

      if (next && f >= starts[i + 1] && f < next.f) {
        // Moving into next landing
        continue;
      }
      if (next && f >= starts[i + 1]) {
        // handled by next iteration / below
      }

      if (!next || f < starts[i + 1]) {
        // Holding / drifting on landing i
        if (f >= land.f && (!next || f < starts[i + 1])) {
          const D = drifted(i, f);
          return poseToCam(D.pivot, D.phi, D.el, D.d);
        }
      }

      if (next && f >= starts[i + 1] && f <= next.f) {
        const from = drifted(i, starts[i + 1]);
        const to = poseAtLanding(i + 1);
        if (next.kind === 'cut') {
          return poseToCam(to.pivot, to.phi, to.el, to.d);
        }
        // Whip: ease out of from, arc apex mid-way, ease into to
        const span = Math.max(1, next.f - starts[i + 1]);
        const u = (f - starts[i + 1]) / span;
        if (next.kind === 'whip') {
          const apexT = 0.45;
          const apex = {
            pivot: {
              x: lin(from.pivot.x, to.pivot.x, apexT),
              y: lin(from.pivot.y, to.pivot.y, apexT) + 0.55,
              z: lin(from.pivot.z, to.pivot.z, apexT),
            },
            phi: lin(from.phi, to.phi, apexT),
            el: Math.max(from.el, to.el) + 12,
            d: Math.sqrt(from.d * to.d) * 1.25,
          };
          if (u <= apexT) {
            return lerpPose(from, apex, u / apexT);
          }
          return lerpPose(apex, to, (u - apexT) / (1 - apexT));
        }
        // fly-through: keep low, lerp pivot through aisle
        if (next.kind === 'fly-through') {
          const mid = {
            pivot: {
              x: lin(from.pivot.x, to.pivot.x, 0.5) + 0.3,
              y: 1.1,
              z: lin(from.pivot.z, to.pivot.z, 0.5) + 0.6,
            },
            phi: lin(from.phi, to.phi, 0.5),
            el: 6,
            d: lin(from.d, to.d, 0.5),
          };
          if (u < 0.5) return lerpPose(from, mid, u / 0.5);
          return lerpPose(mid, to, (u - 0.5) / 0.5);
        }
        // top-down: start high then drop
        if (next.kind === 'top-down') {
          const high = {
            pivot: { ...to.pivot },
            phi: to.phi,
            el: 78,
            d: to.d * 1.15,
          };
          if (u < 0.35) return lerpPose(from, high, u / 0.35);
          return lerpPose(high, to, (u - 0.35) / 0.65);
        }
        return lerpPose(from, to, u);
      }
    }

    // Past last landing — slow drift outro
    const last = abs[abs.length - 1];
    const D = drifted(abs.length - 1, f);
    const extra = (f - last.f) / 40;
    return poseToCam(
      D.pivot,
      D.phi + 3 * Math.sin(extra * Math.PI),
      D.el + 1.2 * extra,
      D.d * (1 - 0.06 * clamp(extra)),
    );
  }

  function landingIndexAt(f) {
    let idx = 0;
    for (let i = 0; i < abs.length; i++) if (f >= abs[i].f) idx = i;
    return idx;
  }

  return {
    abs,
    starts,
    camAt,
    landingIndexAt,
    landings: LANDINGS,
  };
}

/**
 * Code assertion: no run of still frames longer than MAX_HOLD.
 * A frame is "still" when camera position moves < eps from the previous frame.
 */
export function assertMaxHold(camAt, frameCount, eps = 0.0025) {
  let run = 0;
  let maxRun = 0;
  let maxAt = 0;
  let prev = null;
  const fails = [];
  for (let f = 0; f < frameCount; f++) {
    const c = camAt(f);
    if (prev) {
      const dist = Math.hypot(c.x - prev.x, c.y - prev.y, c.z - prev.z)
        + 0.35 * Math.hypot(c.lx - prev.lx, c.ly - prev.ly, c.lz - prev.lz);
      if (dist < eps) {
        run += 1;
        if (run > maxRun) { maxRun = run; maxAt = f - run + 1; }
        if (run > MAX_HOLD) {
          fails.push({ f0: f - run + 1, f1: f, run });
        }
      } else {
        run = 0;
      }
    }
    prev = c;
  }
  // Collapse overlapping fail windows
  const uniq = [];
  for (const fail of fails) {
    const last = uniq[uniq.length - 1];
    if (last && fail.f0 <= last.f1 + 1) {
      last.f1 = fail.f1;
      last.run = last.f1 - last.f0 + 1;
    } else uniq.push({ ...fail });
  }
  if (uniq.length) {
    throw new Error(
      `camera hold > ${MAX_HOLD} frames:\n`
      + uniq.map((r) => `  f${r.f0}-${r.f1} (run ${r.run})`).join('\n'),
    );
  }
  return { maxRun, maxAt, maxHold: MAX_HOLD };
}

export function shotForFrame(f) {
  for (let i = SHOTS.length - 1; i >= 0; i--) if (f >= SHOTS[i].f0) return SHOTS[i];
  return SHOTS[0];
}

export function landingReport() {
  return LANDINGS.map((L, i) => ({
    i,
    f: L.f,
    kind: L.kind,
    label: L.label,
    booth: L.booth,
    pivot: L.pivot,
    wordLead: null,
  }));
}
