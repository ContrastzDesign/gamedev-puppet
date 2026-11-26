// Free-moving camera for biggest-games (content-short camera.md).
// Lands 0–4 frames before the named VO word; varies move kind every beat;
// eases 12–30 frames; never freezes (>12-frame hold fails assertMaxHold).
// Key→key interpolation only — never falls back to a default/outro pose mid-move.
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
 *
 * Word leads (1-based f_start → 0-based land):
 *   biggest@1→0, 2000s@36→32, 2011@57→54, Which@93→90, most@112→109,
 *   States@133→130, early@153→150, late@183→180, early(2010s)@216→213,
 *   leader@285→282, dollars@357→354, Number@385→382, Grand@421→418,
 *   Madden@522→519, open-world@565→562, Number@621→618, Guitar@676→673,
 *   Madden@772→769, guitar-controller@813→810, Number@951→948,
 *   Call@984→981, Skyrim@1099→1096, genres@1189→1186.
 */
export const LANDINGS = [
  // Hook — already moving into the sales museum (character medium)
  { f: 0,    kind: 'push-in',     booth: 'museum', pivot: 'char',     phi: 8,   el: 14, d: 5.2,  lookY: 1.05, label: 'hook' },
  // "2000s" title beat — orbit the chart wall
  { f: 32,   kind: 'orbit',       booth: 'museum', pivot: 'chart',    phi: -22, el: 16, d: 4.6,  lookY: 1.85, label: '2000s' },
  // "2011" — crane up to year plaques
  { f: 54,   kind: 'crane',       booth: 'museum', pivot: 'years',    phi: 18,  el: 28, d: 4.9,  lookY: 1.55, label: '2011-title' },
  // "Which games" — hard cut into the question
  { f: 90,   kind: 'cut',         booth: 'museum', pivot: 'char',     phi: -8,  el: 12, d: 5.0,  lookY: 1.0,  label: 'which' },
  // "most" — pull back to show the hall
  { f: 109,  kind: 'pull-out',    booth: 'museum', pivot: 'char',     phi: 12,  el: 18, d: 6.0,  lookY: 1.1,  label: 'most' },
  // "States" — fly along the aisle past the chart
  { f: 130,  kind: 'fly-through', booth: 'museum', pivot: 'aisle',    phi: -16, el: 12, d: 4.4,  lookY: 1.35, label: 'states' },
  // "early 2000s" — top-down onto the 2002 plaque
  { f: 150,  kind: 'top-down',    booth: 'museum', pivot: 'era2002',  phi: 6,   el: 48, d: 3.5,  lookY: 1.7,  label: 'early-2000s' },
  // "late 2000s" — whip to the 2007 plaque
  { f: 180,  kind: 'whip',        booth: 'museum', pivot: 'era2007',  phi: -10, el: 14, d: 3.3,  lookY: 1.7,  label: 'late-2000s' },
  // "early 2010s" — low hero on the 2011 plaque
  { f: 213,  kind: 'low-hero',    booth: 'museum', pivot: 'era2011',  phi: 14,  el: 8,  d: 3.1,  lookY: 1.7,  label: 'early-2010s' },
  // "leader" — push into host + chart
  { f: 282,  kind: 'push-in',     booth: 'museum', pivot: 'char',     phi: -6,  el: 13, d: 4.6,  lookY: 1.05, label: 'leader' },
  // "dollars" — orbit the chart screen (keep aim high so era plaques stay above caption band)
  { f: 354,  kind: 'orbit',       booth: 'museum', pivot: 'chart',    phi: 22,  el: 20, d: 4.5,  lookY: 2.05, label: 'dollars' },
  // "Number one, 2002" — cut into the 2002 shop
  { f: 382,  kind: 'cut',         booth: 'shop02', pivot: 'char',     phi: 10,  el: 12, d: 5.0,  lookY: 0.95, label: 'num1' },
  // "Grand Theft Auto: Vice City" — low hero on CRT
  { f: 418,  kind: 'low-hero',    booth: 'shop02', pivot: 'screen',   phi: -14, el: 8,  d: 3.2,  lookY: 1.55, label: 'vice' },
  // "Madden NFL 2003" — crane to shelf games
  { f: 519,  kind: 'crane',       booth: 'shop02', pivot: 'shelf',    phi: 22,  el: 24, d: 3.6,  lookY: 1.35, label: 'madden03' },
  // "open-world" — push into CRT drive scene
  { f: 562,  kind: 'push-in',     booth: 'shop02', pivot: 'screen',   phi: 4,   el: 10, d: 2.9,  lookY: 1.6,  label: 'openworld' },
  // "Number two, 2007" — cut to living room
  { f: 618,  kind: 'cut',         booth: 'living', pivot: 'char',     phi: -12, el: 12, d: 5.0,  lookY: 0.95, label: 'num2' },
  // "Guitar Hero III" — whip to rhythm TV (wide enough that tip signs stay fully in frame)
  { f: 673,  kind: 'whip',        booth: 'living', pivot: 'screen',   phi: 8,   el: 12, d: 4.2,  lookY: 1.95, label: 'guitar' },
  // "Madden NFL 08" — orbit the TV + host
  { f: 769,  kind: 'orbit',       booth: 'living', pivot: 'char',     phi: -28, el: 14, d: 4.5,  lookY: 1.0,  label: 'madden08' },
  // "guitar-controller bundle" — top-down onto the bundle box
  { f: 810,  kind: 'top-down',    booth: 'living', pivot: 'bundle',   phi: 8,   el: 55, d: 2.9,  lookY: 1.15, label: 'bundle' },
  // "sale." beat — pull out on the living-room host before the era cut
  { f: 926,  kind: 'pull-out',    booth: 'living', pivot: 'char',     phi: 8,   el: 16, d: 5.6,  lookY: 1.05, label: 'sale' },
  // "Number three, 2011" — cut to midnight launch (wide aisle, clear of side pillars)
  { f: 948,  kind: 'cut',         booth: 'launch', pivot: 'char',     phi: 4,   el: 14, d: 5.8,  lookY: 1.05, label: 'num3' },
  // "Call of Duty: Modern Warfare 3" — fly to shooter screen (keep booth title fully in frame)
  { f: 981,  kind: 'fly-through', booth: 'launch', pivot: 'shooter',  phi: -8,  el: 14, d: 4.4,  lookY: 1.75, label: 'mw3' },
  // "Skyrim" — orbit to reveal both screens (not pull-out: previous fly-through, next crane)
  { f: 1096, kind: 'orbit',       booth: 'launch', pivot: 'fantasy',  phi: 18,  el: 15, d: 4.8,  lookY: 1.8,  label: 'skyrim' },
  // "genres" — crane onto the three trophies
  { f: 1186, kind: 'crane',       booth: 'launch', pivot: 'trophies', phi: -4,  el: 22, d: 4.0,  lookY: 1.45, label: 'genres' },
];

function deg(d) { return d * Math.PI / 180; }

function boothMeta(room, id) {
  return room.boothMeta[id];
}

/** World-space pivot for a landing, given booth centres from room.js. */
export function resolvePivot(room, landing, charLocal) {
  const b = boothMeta(room, landing.booth);
  const shotId = ({
    museum: 'hook', shop02: 'vice', living: 'guitar', launch: 'finale',
  })[landing.booth] || 'hook';
  const cl = charLocal({ id: shotId, booth: landing.booth });
  const charX = b.x + cl.side;
  const charZ = b.z + cl.z;
  const lookY = landing.lookY ?? 1.0;
  switch (landing.pivot) {
    case 'char':
      return { x: charX, y: lookY, z: charZ };
    case 'chart':
      return { x: b.x, y: lookY, z: b.z - 0.2 };
    case 'years':
      return { x: b.x, y: lookY, z: b.z + 0.1 };
    case 'aisle':
      return { x: b.x + 0.25, y: lookY, z: b.z + 1.35 };
    case 'era2002':
      return { x: b.x - 0.75, y: lookY, z: b.z + 0.35 };
    case 'era2007':
      return { x: b.x, y: lookY, z: b.z + 0.35 };
    case 'era2011':
      return { x: b.x + 0.75, y: lookY, z: b.z + 0.35 };
    case 'screen':
      return { x: b.x + (landing.booth === 'shop02' ? 0.15 : 0), y: lookY, z: b.z - 0.1 };
    case 'shelf':
      return { x: b.x - 0.55, y: lookY, z: b.z + 0.2 };
    case 'bundle':
      return { x: b.x + 0.75, y: lookY, z: b.z + 0.4 };
    case 'shooter':
      return { x: b.x - 0.55, y: lookY, z: b.z - 0.1 };
    case 'fantasy':
      return { x: b.x + 0.35, y: lookY, z: b.z - 0.05 };
    case 'trophies':
      return { x: b.x, y: lookY, z: b.z + 0.45 };
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
 * Interpolation is strictly key→key between consecutive landings (no default/outro pose mid-path).
 */
export function buildCamera(room, charLocal) {
  const abs = LANDINGS.map((L) => absoluteLanding(room, L, charLocal));

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
    const nextStart = i + 1 < abs.length ? starts[i + 1] : A.f + 80;
    if (f <= A.f) return { ...A, pivot: { ...A.pivot } };
    if (f >= nextStart) return { ...A, pivot: { ...A.pivot } };
    // Continuous multi-frequency drift so no >MAX_HOLD still run (camera.md: never stops).
    // Include a steady linear component — pure sinusoids flatten at their peaks and can
    // produce >12-frame holds on long gaps (bundle→num3, post-genres outro).
    const span = Math.max(1, nextStart - A.f);
    const t = (f - A.f) / span;
    const frames = f - A.f;
    const wob = 0.35 * Math.sin(t * Math.PI * 2.3) + 0.2 * Math.sin(t * Math.PI * 5.1);
    // Steady linear component sized so frame-to-frame cam motion stays well above assertMaxHold eps (0.0025)
    const linPhi = 0.12 * frames;            // ~0.12°/frame → ~0.006 m at d=3
    const linEl = 0.035 * frames;
    const linD = 1 - 0.0012 * frames;        // slow push-in
    const driftPhi = A.phi + 5.5 * Math.sin(t * Math.PI) + 1.2 * wob + linPhi;
    const driftEl = A.el + 2.4 * Math.sin(t * Math.PI * 0.7) + 0.6 * wob + linEl;
    const driftD = A.d * (linD + 0.015 * Math.sin(t * Math.PI * 3));
    return {
      ...A,
      phi: driftPhi,
      el: driftEl,
      d: Math.max(0.8, driftD),
      pivot: {
        x: A.pivot.x + 0.06 * Math.sin(t * Math.PI * 0.5) + 0.02 * wob + 0.003 * frames,
        y: A.pivot.y + 0.015 * Math.sin(t * Math.PI * 1.3) + 0.001 * frames,
        z: A.pivot.z + 0.03 * Math.sin(t * Math.PI * 0.9) + 0.002 * frames,
      },
    };
  }

  function camAt(f) {
    // Before first landing — push-in from a slightly wider start into landing 0
    if (f <= abs[0].f) {
      const P = drifted(0, abs[0].f);
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
      const nextStart = next ? starts[i + 1] : null;

      // Holding / drifting on landing i (before the next move departs)
      if (f >= land.f && (nextStart == null || f < nextStart)) {
        const D = drifted(i, f);
        return poseToCam(D.pivot, D.phi, D.el, D.d);
      }

      // Moving into the next landing — ALWAYS key→key (never a default/outro pose)
      if (next && nextStart != null && f >= nextStart && f <= next.f) {
        const from = drifted(i, Math.max(land.f, nextStart - 1));
        const to = poseAtLanding(i + 1);
        if (next.kind === 'cut') {
          return poseToCam(to.pivot, to.phi, to.el, to.d);
        }
        const span = Math.max(1, next.f - nextStart);
        const u = (f - nextStart) / span;
        if (next.kind === 'whip') {
          const apexT = 0.45;
          // Cap apex elevation so the whip never punches through the ceiling beams
          const apexEl = Math.min(42, Math.max(from.el, to.el) + (from.el > 30 ? 4 : 12));
          const apex = {
            pivot: {
              x: lin(from.pivot.x, to.pivot.x, apexT),
              y: lin(from.pivot.y, to.pivot.y, apexT) + (from.el > 30 ? 0.15 : 0.55),
              z: lin(from.pivot.z, to.pivot.z, apexT),
            },
            phi: lin(from.phi, to.phi, apexT),
            el: apexEl,
            d: Math.sqrt(from.d * to.d) * 1.25,
          };
          if (u <= apexT) {
            return lerpPose(from, apex, u / apexT);
          }
          return lerpPose(apex, to, (u - apexT) / (1 - apexT));
        }
        // fly-through: stay chest-height in the aisle (never under desks / through towers)
        if (next.kind === 'fly-through') {
          const mid = {
            pivot: {
              x: lin(from.pivot.x, to.pivot.x, 0.5),
              y: Math.max(1.35, lin(from.pivot.y, to.pivot.y, 0.5)),
              z: lin(from.pivot.z, to.pivot.z, 0.5) + 0.35,
            },
            phi: lin(from.phi, to.phi, 0.5),
            el: 12,
            d: Math.max(3.4, lin(from.d, to.d, 0.5)),
          };
          if (u < 0.5) return lerpPose(from, mid, u / 0.5);
          return lerpPose(mid, to, (u - 0.5) / 0.5);
        }
        // top-down: start high then drop (cap height so ceiling beams stay out of near plane)
        if (next.kind === 'top-down') {
          const high = {
            pivot: { ...to.pivot },
            phi: to.phi,
            el: 62,
            d: to.d * 1.12,
          };
          if (u < 0.35) return lerpPose(from, high, u / 0.35);
          return lerpPose(high, to, (u - 0.35) / 0.65);
        }
        return lerpPose(from, to, u);
      }
    }

    // Past last landing — keep drifting off the last key (never a default/outro pose)
    const last = abs[abs.length - 1];
    const D = drifted(abs.length - 1, Math.max(f, last.f));
    const extraF = Math.max(0, f - last.f);
    const extra = extraF / 40;
    return poseToCam(
      {
        x: D.pivot.x + 0.0015 * extraF,
        y: D.pivot.y + 0.0005 * extraF,
        z: D.pivot.z + 0.001 * extraF,
      },
      D.phi + 3 * Math.sin(extra * Math.PI) + 0.05 * extraF,
      D.el + 1.2 * extra + 0.015 * extraF,
      Math.max(0.8, D.d * (1 - 0.06 * clamp(extra) - 0.0004 * extraF)),
    );
  }

  function landingIndexAt(f) {
    let idx = 0;
    for (let i = 0; i < abs.length; i++) if (f >= abs[i].f) idx = i;
    return idx;
  }

  function boothAt(f) {
    return abs[landingIndexAt(f)].booth;
  }

  return {
    abs,
    starts,
    camAt,
    landingIndexAt,
    boothAt,
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
  }));
}
