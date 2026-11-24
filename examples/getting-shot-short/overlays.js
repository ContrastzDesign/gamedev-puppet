// 2D overlay layer for the GTA VI bug Short, drawn on the #film canvas after the 3D frame.
//   await initOverlays()                       font load + caption layouts (call once)
//   drawOverlays(ctx, f, { f0Canvas, night })  draw frame f's 2D layer onto a 1080x1920 context
// drawOverlays is a pure function of the integer frame f: nothing carries over between calls
// (the two scratch canvases are fully cleared on every use), so frames can be drawn in any order.
// Order: night tint, keyword captions, rewind badge, mint tick (+ frame tint), sparkle dissolve to f0.
import { W, H, popScale, popOut, lin, easeInOut, hash1 } from './core.js';
import { CAPTIONS } from './beats.js';

const INK = '#1c1c20', RED = '#e8341f', MINT = '#54d890', WHITE = '#ffffff';

// ---------- captions: look ----------
const FONT_PX = 78;
const FONT = `800 ${FONT_PX}px Caption`;
const TRACK = -0.01 * FONT_PX;          // -1% tracking = -0.78 px
const BAND_Y = { top: 259, low: 1325 }; // band centres (top 192-326, low 1248-1402)
const MAX_W = 918;                      // 85% of the width, then wrap to two balanced lines
const LINE_H = 86;                      // baseline-to-baseline for a wrapped caption
// a wrapped first line shouldn't end on a dangling connective ("two weeks or / even months");
// such a split is charged this many px, so it only wins when the alternative is far less balanced
const WRAP_DANGLE = new Set(['a', 'an', 'the', 'or', 'and', 'of', 'in', 'on', 'to', 'at', 'by', 'for', 'with']);
const WRAP_DANGLE_PX = 120;
const MAX_HOLD = 96;
// motion: each letter goes blurred+transparent -> sharp+opaque over LETTER frames; the
// left-to-right stagger spreads the letter starts over SPREAD frames, so the whole reveal
// (and the exit) covers REVEAL = SPREAD + LETTER = 7 frames.
const LETTER = 4, SPREAD = 3, REVEAL = SPREAD + LETTER;
const BLUR_MAX = 9;                     // px (std dev) on a letter at the start of its reveal
// glow: the letters' silhouette dilated by GLOW_GROW px, painted white, then laid down twice:
// a tight bright rim and a wider soft falloff (~60% at the letter edge, fading out by ~10-12 px)
const GLOW_GROW = 3;
const GLOW_LAYERS = [{ sigma: 1.6, a: 0.42 }, { sigma: 5, a: 0.5 }];
// scratch canvas around a band centre (two wrapped lines + blur + glow fit inside)
const SCR_H = 380, SCR_HALF = SCR_H / 2;

let LAYOUTS = null;
let scr = null, scrX = null, glw = null, glwX = null;

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (t) => t * t * (3 - 2 * t);

export async function initOverlays() {
  await document.fonts.load(FONT);
  if (!document.fonts.check(FONT)) throw new Error('overlays: Caption font did not load');

  const m = document.createElement('canvas').getContext('2d');
  m.font = FONT;
  m.letterSpacing = `${TRACK}px`;
  m.textBaseline = 'alphabetic';
  const mw = (s) => m.measureText(s).width;
  // Whether measureText counts the spacing after the last letter differs by engine; measure it.
  const m0 = document.createElement('canvas').getContext('2d');
  m0.font = FONT;
  const trailing = mw('a') - m0.measureText('a').width;  // = TRACK if trailing spacing is counted, else 0
  const visW = (s) => mw(s) - trailing;

  // Vertical centring: the span from cap height to descender depth sits on the band centre,
  // so every caption shares one baseline per band regardless of its letters.
  const asc = m.measureText('H').actualBoundingBoxAscent;
  const desc = m.measureText('g').actualBoundingBoxDescent;
  const baseOff = (asc - desc) / 2;

  LAYOUTS = CAPTIONS.map((c, idx) => {
    const next = CAPTIONS[idx + 1];
    const end = Math.min(c.end ?? Infinity, next ? next.f : Infinity, c.f + MAX_HOLD);
    const words = c.text.split(/\s+/).filter(Boolean);
    const redSet = Array.isArray(c.red) ? new Set(c.red.map((w) => w.toLowerCase())) : null;
    const wordCol = words.map((w) => (c.red === true || (redSet && redSet.has(w.toLowerCase())) ? RED : INK));

    // line breaking: one line if it fits, else the word split with the smallest longer line
    // (plus a penalty for ending line one on a connective)
    const oneLine = words.join(' ');
    const fullWidth = visW(oneLine);
    let lines = [[0, words.length]];
    if (fullWidth > MAX_W && words.length > 1) {
      let best = 1, bestW = Infinity;
      for (let k = 1; k < words.length; k++) {
        const w = Math.max(visW(words.slice(0, k).join(' ')), visW(words.slice(k).join(' ')))
          + (WRAP_DANGLE.has(words[k - 1].toLowerCase()) ? WRAP_DANGLE_PX : 0);
        if (w < bestW) { bestW = w; best = k; }
      }
      lines = [[0, best], [best, words.length]];
    }

    const cy = BAND_Y[c.band] ?? BAND_Y.top;
    const glyphs = [];
    const lineInfo = [];
    lines.forEach(([a, b], li) => {
      const str = words.slice(a, b).join(' ');
      const lw = visW(str);
      const x0 = W / 2 - lw / 2;
      const baseline = cy + baseOff + (lines.length === 1 ? 0 : (li - 0.5) * LINE_H);
      lineInfo.push({ text: str, width: lw, baseline });
      // char -> word colour
      let wi = a;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === ' ') { wi++; continue; }
        // x of glyph i from prefix widths: width(prefix incl. i) - width(i) keeps the kern pair (i-1, i)
        const x = x0 + mw(str.slice(0, i + 1)) - mw(ch);
        const adv = mw(ch) - trailing;
        glyphs.push({ ch, x, y: baseline, cx: x + adv / 2, color: wordCol[wi] });
      }
    });
    // left-to-right stagger by glyph centre: a wipe that also works across two wrapped lines
    const xs = glyphs.map((g) => g.cx);
    const lo = Math.min(...xs), hi = Math.max(...xs);
    for (const g of glyphs) g.t = hi > lo ? ((g.cx - lo) / (hi - lo)) * SPREAD : 0;

    return { f: c.f, end, text: c.text, band: c.band, cy, glyphs, lines: lineInfo, width: fullWidth, wrapped: lines.length > 1 };
  });

  scr = document.createElement('canvas'); scr.width = W; scr.height = SCR_H;
  scrX = scr.getContext('2d');
  glw = document.createElement('canvas'); glw.width = W; glw.height = SCR_H;
  glwX = glw.getContext('2d');
}

// QA helper: measured caption widths, wraps and timing
export function captionInfo() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  return LAYOUTS.map((L) => ({
    f: L.f, end: L.end, text: L.text, band: L.band, width: +L.width.toFixed(1), wrapped: L.wrapped,
    lines: L.lines.map((l) => ({ text: l.text, width: +l.width.toFixed(1) })),
  }));
}

// visibility 0..1 of one letter at frame f (reveal at L.f, exit ending at L.end)
function letterVis(L, g, f) {
  const inK = clamp01((f - L.f + 1 - g.t) / LETTER);
  const outK = clamp01((f - (L.end - REVEAL) + 1 - g.t) / LETTER);
  return Math.min(inK, 1 - outK);
}

function drawCaption(ctx, L, f) {
  const y0 = L.cy - SCR_HALF;
  // 1. letters onto the scratch canvas, each with its own blur and alpha
  scrX.setTransform(1, 0, 0, 1, 0, 0);
  scrX.globalCompositeOperation = 'source-over';
  scrX.clearRect(0, 0, W, SCR_H);
  scrX.font = FONT;
  scrX.letterSpacing = `${TRACK}px`;
  scrX.textBaseline = 'alphabetic';
  scrX.textAlign = 'left';
  let any = false;
  for (const g of L.glyphs) {
    const v = letterVis(L, g, f);
    if (v <= 0) continue;
    any = true;
    const k = smooth(v);
    scrX.globalAlpha = k;
    const b = BLUR_MAX * (1 - k);
    scrX.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
    scrX.fillStyle = g.color;
    scrX.fillText(g.ch, g.x, g.y - y0);
  }
  scrX.filter = 'none';
  scrX.globalAlpha = 1;
  if (!any) return;

  // 2. glow mask: the letters' alpha, dilated a few px, painted white
  glwX.setTransform(1, 0, 0, 1, 0, 0);
  glwX.globalAlpha = 1;
  glwX.filter = 'none';
  glwX.globalCompositeOperation = 'source-over';
  glwX.clearRect(0, 0, W, SCR_H);
  glwX.drawImage(scr, 0, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    glwX.drawImage(scr, Math.cos(a) * GLOW_GROW, Math.sin(a) * GLOW_GROW);
  }
  glwX.globalCompositeOperation = 'source-in';
  glwX.fillStyle = WHITE;
  glwX.fillRect(0, 0, W, SCR_H);
  glwX.globalCompositeOperation = 'source-over';

  // 3. soft white glow, then the letters
  for (const { sigma, a } of GLOW_LAYERS) {
    ctx.filter = `blur(${sigma}px)`;
    ctx.globalAlpha = a;
    ctx.drawImage(glw, 0, y0);
  }
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.drawImage(scr, 0, y0);
}

// ---------- night tint ----------
const NIGHT = [122, 144, 200]; // multiply colour at night = 1: ~44% darker luminance, blue cast
function drawNight(ctx, night) {
  const n = clamp01(night);
  const c = NIGHT.map((v) => Math.round(255 + (v - 255) * n));
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- rewind badge (unused in this film; kept inert) ----------
const RW = { a: 9999, out: 9999, end: 9999, x: 540, y: 420, w: 230, h: 130, r: 32 };
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawRewind(ctx, f, at) {
  if (f < RW.a || f >= RW.end) return;
  const s = f < RW.out ? popScale(f - RW.a) : popOut(f - RW.out);
  if (s <= 0.001) return;
  ctx.save();
  ctx.translate(at ? at[0] : RW.x, at ? at[1] : RW.y);
  ctx.scale(s, s);
  // badge: dark rounded plate with a thin light rim
  roundRectPath(ctx, -RW.w / 2, -RW.h / 2, RW.w, RW.h, RW.r);
  ctx.fillStyle = 'rgba(28,28,32,0.9)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.stroke();
  // white rewind glyph: two left-pointing triangles; they nudge left in short rewind pulses
  const ph = ((f - RW.a) % 9) / 9;
  const dx = -7 * Math.sin(Math.PI * ph) ** 2;
  const tw = 56, th = 70;
  ctx.fillStyle = WHITE;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  for (const ox of [-tw, 0]) {
    ctx.beginPath();
    ctx.moveTo(ox + dx, 0);
    ctx.lineTo(ox + tw + dx, -th / 2);
    ctx.lineTo(ox + tw + dx, th / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- mint tick: "solved" on the recap (f1113+) ----------
const TK = {
  x: 540, y: 640, r: 105,
  ring: [1120, 1128], tick: [1124, 1132], out: 1178,
  tintIn: [1120, 1130], tintOut: [1174, 1186], tint: 0.09,
  mintW: 17, inkW: 28,
  pts: [[-52, 2], [-17, 37], [55, -37]],
};
function drawMintTint(ctx, f) {
  const k = Math.min(lin(TK.tintIn[0], TK.tintIn[1], f), 1 - lin(TK.tintOut[0], TK.tintOut[1], f));
  if (k <= 0) return;
  ctx.globalAlpha = TK.tint * easeInOut(k);
  ctx.fillStyle = MINT;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}
function tickPath(ctx, p) {
  // partial polyline along the tick, p in 0..1 of its total length
  const [a, b, c] = TK.pts;
  const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
  let d = p * (l1 + l2);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  if (d <= l1) { const t = d / l1; ctx.lineTo(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t); return; }
  ctx.lineTo(b[0], b[1]);
  const t = (d - l1) / l2;
  ctx.lineTo(b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t);
}
function drawTick(ctx, f, at) {
  if (f < TK.ring[0] || f >= TK.out + 7) return;
  const ringP = easeInOut(lin(TK.ring[0], TK.ring[1], f));
  const tickP = easeInOut(lin(TK.tick[0], TK.tick[1], f));
  const s = f < TK.out ? 1 : popOut(f - TK.out);
  if (s <= 0.001 || ringP <= 0) return;
  ctx.save();
  ctx.translate(at ? at[0] : TK.x, at ? at[1] : TK.y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // opaque off-white badge inside the ring, so the tick reads cleanly over the busy set
  const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * ringP;
  ctx.globalAlpha = Math.min(1, 1.6 * ringP);
  ctx.fillStyle = '#f7f7f2';
  ctx.beginPath();
  ctx.arc(0, 0, TK.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // ring, clockwise from 12 o'clock: ink under mint
  for (const [w, col] of [[TK.inkW, INK], [TK.mintW, MINT]]) {
    ctx.beginPath();
    ctx.arc(0, 0, TK.r, a0, a1);
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    ctx.stroke();
  }
  // tick
  if (tickP > 0) {
    for (const [w, col] of [[TK.inkW + 2, INK], [TK.mintW + 2, MINT]]) {
      tickPath(ctx, tickP);
      ctx.lineWidth = w;
      ctx.strokeStyle = col;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- sparkle dissolve back to frame 0 (1248-1265), exact f0 from 1265 ----------
const LOOP = { a: 1248, b: 1265 };
const SPK = { n: 44, cols: 4, rows: 11, t0: 1244, t1: 1258, life: 12, min: 26, max: 80 };
function sparklePath(ctx, R) {
  // four-point star: sharp tips joined by concave curves pinched toward the centre
  const c = R * 0.24;
  ctx.beginPath();
  ctx.moveTo(0, -R);
  ctx.quadraticCurveTo(c, -c, R, 0);
  ctx.quadraticCurveTo(c, c, 0, R);
  ctx.quadraticCurveTo(-c, c, -R, 0);
  ctx.quadraticCurveTo(-c, -c, 0, -R);
  ctx.closePath();
}
function drawSparkles(ctx, f) {
  const cw = W / SPK.cols, rh = H / SPK.rows;
  for (let i = 0; i < SPK.n; i++) {
    const start = SPK.t0 + Math.floor(hash1(i * 7 + 3) * (SPK.t1 - SPK.t0 + 1));
    const k = (f - start) / SPK.life;
    if (k <= 0 || k >= 1) continue;
    const sc = Math.sin(Math.PI * k);
    const size = SPK.min + hash1(i * 7 + 4) * (SPK.max - SPK.min);
    const R = (size / 2) * sc;
    if (R < 0.5) continue;
    // jittered grid: one sparkle per cell keeps them spread over the whole frame
    const col = i % SPK.cols, row = Math.floor(i / SPK.cols);
    const x = (col + 0.12 + 0.76 * hash1(i * 7 + 1)) * cw;
    const y = (row + 0.12 + 0.76 * hash1(i * 7 + 2)) * rh;
    const spin = hash1(i * 7 + 6) < 0.5 ? -1 : 1;
    const rot = (hash1(i * 7 + 5) - 0.5) * 0.5 + spin * (k - 0.5) * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    sparklePath(ctx, R);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.lineWidth = Math.min(4, R * 0.24);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }
}
function drawF0(ctx, img) {
  if (img.width === W && img.height === H) ctx.drawImage(img, 0, 0);
  else ctx.drawImage(img, 0, 0, W, H);
}

// ---------- entry ----------
// calAt: the calendar's right-edge midpoint in screen px; the rewind and tick badges sit just right of it
const beside = (at, gap, half) => at && [Math.min(at[0] + gap + half, W - half - 28), at[1]];
export function drawOverlays(ctx, f, { f0Canvas, night = 0, calAt = null, damage = 0, blood = 0, shake = [0, 0] } = {}) {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.imageSmoothingEnabled = true;
  try {
    // loop tail: exactly the cached frame 0, nothing on top
    if (f0Canvas && f >= LOOP.b) {
      ctx.globalCompositeOperation = 'copy';
      drawF0(ctx, f0Canvas);
      return;
    }
    if (shake[0] || shake[1]) {
      ctx.translate(shake[0], shake[1]);
    }
    if (night > 0) drawNight(ctx, night);
    // red screen-edge vignette (damage feedback) — problem red
    if (damage > 0.01) {
      const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.28, W / 2, H / 2, W * 0.72);
      g.addColorStop(0, 'rgba(232,74,47,0)');
      g.addColorStop(1, `rgba(232,74,47,${(0.55 * damage).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(-40, -40, W + 80, H + 80);
    }
    // toon blood marks (non-gory ink splats)
    if (blood > 0.01) {
      const spots = [
        [180, 420, 38], [860, 510, 28], [240, 1100, 44], [780, 1280, 32], [520, 380, 22],
      ];
      ctx.fillStyle = `rgba(232,74,47,${(0.72 * blood).toFixed(3)})`;
      for (const [x, y, r] of spots) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        for (let i = 1; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const rr = r * (0.65 + 0.35 * Math.sin(i * 2.7 + x));
          ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
    for (const L of LAYOUTS) if (f >= L.f && f < L.end) drawCaption(ctx, L, f);
    drawRewind(ctx, f, beside(calAt, 26, RW.w / 2));
    drawMintTint(ctx, f);
    drawTick(ctx, f, [TK.x, TK.y]);
    if (f0Canvas && f > LOOP.a) {
      ctx.globalAlpha = easeInOut(lin(LOOP.a, LOOP.b, f));
      drawF0(ctx, f0Canvas);
      ctx.globalAlpha = 1;
    }
    if (f > SPK.t0) drawSparkles(ctx, f);
  } finally {
    ctx.restore();
  }
}
