// Word-exact caption overlays — warm cream/yellow with dark outline (V1).
// Hard safe zone: 80 px side margins → max rendered line width 920 px (incl. stroke).
import { W, H, clamp, smooth } from './core.js';
import { CAPTIONS } from './beats.js';

const SIDE_MARGIN = 80;
const MAX_RENDER_W = W - SIDE_MARGIN * 2; // 920
const STROKE_W = 14;
// Stroke is centered on the glyph path → half extends past each edge.
const MAX_TEXT_W = MAX_RENDER_W - STROKE_W; // 906
const BASE_FONT_PX = 70;
const MIN_FONT_PX = 42;
const TRACK_RATIO = -0.01;
// Stroke + small pad — must match captionBoxes() vertical extent.
const BOX_VPAD = STROKE_W / 2 + 4;
// top: above heads; low: lower third — kept below typical character feet so faces stay clear
const BAND_Y = { top: 200, low: 1840 };
// Hard floor: bbox bottom ≤ 1840 → ≥ 80 px clear of the 1080×1920 frame bottom.
// (Multi-line blocks move up as needed; bottom clearance always wins over feet clearance.)
const BOTTOM_CLEAR = 80;
const MAX_BOTTOM = H - BOTTOM_CLEAR; // 1840
const WRAP_DANGLE = new Set(['a', 'an', 'the', 'or', 'and', 'of', 'in', 'on', 'to', 'at', 'by', 'for', 'with', 'its', "it's", 'where', 'can']);
const FILL = '#f5e6b8';
const STROKE = '#1c1810';
// Fully opaque while held (fade only the first/last 3 frames).
const CAP_FADE = 3;

let LAYOUTS = null;

function measureKit(fontPx) {
  const font = `800 ${fontPx}px Caption`;
  const track = TRACK_RATIO * fontPx;
  const m = document.createElement('canvas').getContext('2d');
  m.font = font;
  m.letterSpacing = `${track}px`;
  m.textBaseline = 'alphabetic';
  const mw = (s) => m.measureText(s).width;
  const m0 = document.createElement('canvas').getContext('2d');
  m0.font = font;
  const trailing = mw('a') - m0.measureText('a').width;
  const visW = (s) => Math.max(0, mw(s) - trailing);
  const asc = m.measureText('H').actualBoundingBoxAscent;
  const desc = m.measureText('g').actualBoundingBoxDescent;
  const baseOff = (asc - desc) / 2;
  const lineH = Math.round(fontPx * 1.17);
  return { font, track, visW, baseOff, lineH, fontPx };
}

/** Balanced multi-line wrap: try 1..maxLines splits; pick the layout whose longest line is shortest. */
function wrapWords(words, visW, maxW, maxLines = 5) {
  const n = words.length;
  if (n === 0) return [];
  if (n === 1 || visW(words.join(' ')) <= maxW) return [[0, n]];

  let best = null;
  let bestScore = Infinity;
  const maxL = Math.min(maxLines, n);

  // Dynamic programming: best wrap into exactly L lines for prefix of words
  // For small n (captions), brute-force partitions are fine.
  function search(start, linesLeft, acc) {
    if (linesLeft === 1) {
      const last = [start, n];
      const widths = [...acc, last].map(([a, b]) => visW(words.slice(a, b).join(' ')));
      const longest = Math.max(...widths);
      let score = longest;
      // mild dangle penalty
      for (const [a, b] of [...acc, last]) {
        if (b - a >= 1 && WRAP_DANGLE.has(words[b - 1].toLowerCase().replace(/[^\w']/g, ''))) score += 40;
      }
      if (score < bestScore) {
        bestScore = score;
        best = [...acc, last];
      }
      return;
    }
    for (let end = start + 1; end <= n - (linesLeft - 1); end++) {
      search(end, linesLeft - 1, [...acc, [start, end]]);
    }
  }

  for (let L = 2; L <= maxL; L++) {
    best = null;
    bestScore = Infinity;
    search(0, L, []);
    if (best && Math.max(...best.map(([a, b]) => visW(words.slice(a, b).join(' ')))) <= maxW) {
      return best;
    }
  }
  // Even with max lines, return the best we found (caller may shrink font).
  best = null;
  bestScore = Infinity;
  search(0, maxL, []);
  return best || [[0, n]];
}

function layoutCaption(c, kit, maxLines = 2) {
  const words = c.text.split(/\s+/).filter(Boolean);
  const lines = wrapWords(words, kit.visW, MAX_TEXT_W, maxLines);
  // Pin low-band captions to the bottom safe strip so they sit below character feet
  // even on chest-up / medium framings (never float mid-body). Tall wraps move UP
  // so the bbox bottom stays ≤ MAX_BOTTOM (80 px clear of the frame edge).
  let cy = BAND_Y[c.band] ?? BAND_Y.top;
  if (c.band === 'low') {
    const half = ((lines.length - 1) / 2) * kit.lineH;
    const blockHalf = half + kit.lineH * 0.55;
    // Match captionBoxes(): bottom = lastBaseline + lineH*0.55 + BOX_VPAD
    // with lastBaseline = cy + baseOff + half → bottom = cy + baseOff + blockHalf + BOX_VPAD.
    // Tall wraps move UP so the block stays inside the lower band.
    cy = MAX_BOTTOM - kit.baseOff - blockHalf - BOX_VPAD;
  }
  const lineInfo = lines.map(([a, b], li) => {
    const str = words.slice(a, b).join(' ');
    const lw = kit.visW(str);
    const renderW = lw + STROKE_W;
    const baseline = cy + kit.baseOff + (li - (lines.length - 1) / 2) * kit.lineH;
    return { text: str, width: lw, renderW, baseline };
  });
  const maxRender = lineInfo.length ? Math.max(...lineInfo.map((l) => l.renderW)) : 0;
  return { ...c, fontPx: kit.fontPx, font: kit.font, track: kit.track, lineInfo, maxRender, cy };
}

export async function initOverlays() {
  await document.fonts.load(`800 ${BASE_FONT_PX}px Caption`);
  if (!document.fonts.check(`800 ${BASE_FONT_PX}px Caption`)) throw new Error('Caption font missing');

  // Prefer ≤2 lines (slightly smaller font) so the lower band stays clear of the
  // bottom edge; fall back to 3 lines only if width still overflows at MIN_FONT.
  LAYOUTS = CAPTIONS.map((c) => {
    let fontPx = BASE_FONT_PX;
    let layout = layoutCaption(c, measureKit(fontPx), 2);
    while (layout.maxRender > MAX_RENDER_W + 0.5 && fontPx > MIN_FONT_PX) {
      fontPx -= 2;
      layout = layoutCaption(c, measureKit(fontPx), 2);
    }
    if (layout.maxRender > MAX_RENDER_W + 0.5) {
      layout = layoutCaption(c, measureKit(fontPx), 3);
      while (layout.maxRender > MAX_RENDER_W + 0.5 && fontPx > MIN_FONT_PX) {
        fontPx -= 2;
        layout = layoutCaption(c, measureKit(fontPx), 3);
      }
    }
    return layout;
  });

  // Hard fail if any line still overflows the 80 px side safe zone,
  // or if any caption bbox hangs below y = 1840.
  assertCaptionSafeZone();
  assertCaptionBottomSafe();
}

/** Measure every caption line's rendered width; throw if any exceeds the safe zone. */
export function assertCaptionSafeZone() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  const overflows = [];
  for (const c of LAYOUTS) {
    for (const line of c.lineInfo) {
      const left = W / 2 - line.renderW / 2;
      const right = W / 2 + line.renderW / 2;
      if (line.renderW > MAX_RENDER_W + 0.5 || left < SIDE_MARGIN - 0.5 || right > W - SIDE_MARGIN + 0.5) {
        overflows.push({
          text: c.text,
          line: line.text,
          renderW: +line.renderW.toFixed(1),
          max: MAX_RENDER_W,
          left: +left.toFixed(1),
          right: +right.toFixed(1),
          fontPx: c.fontPx,
        });
      }
    }
  }
  if (overflows.length) {
    throw new Error(`Caption overflow (safe zone ${SIDE_MARGIN}px / max ${MAX_RENDER_W}px):\n`
      + overflows.map((o) => `  "${o.line}" renderW=${o.renderW} font=${o.fontPx} left=${o.left} right=${o.right}`).join('\n'));
  }
  return true;
}

/** Hard fail if any caption bounding box bottom is below y = 1840 (80 px from frame bottom). */
export function assertCaptionBottomSafe() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  const fails = [];
  for (const box of captionBoxes()) {
    if (box.bottom > MAX_BOTTOM + 0.5) {
      fails.push({
        text: box.text,
        bottom: +box.bottom.toFixed(1),
        max: MAX_BOTTOM,
        top: +box.top.toFixed(1),
        band: box.band,
      });
    }
  }
  if (fails.length) {
    throw new Error(`Caption bottom overflow (must be ≤ y=${MAX_BOTTOM}):\n`
      + fails.map((o) => `  "${o.text}" bottom=${o.bottom} top=${o.top} band=${o.band}`).join('\n'));
  }
  return true;
}

export function captionInfo() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  return LAYOUTS.map((L) => ({
    f: L.f,
    end: L.end,
    text: L.text,
    band: L.band,
    fontPx: L.fontPx,
    maxRender: +L.maxRender.toFixed(1),
    lines: L.lineInfo.map((l) => ({
      text: l.text,
      width: +l.width.toFixed(1),
      renderW: +l.renderW.toFixed(1),
    })),
  }));
}

/** Screen-space axis-aligned boxes for every caption (incl. stroke padding). */
export function captionBoxes() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  const vPad = BOX_VPAD;
  return LAYOUTS.map((L) => {
    const lineH = Math.round(L.fontPx * 1.17);
    const tops = L.lineInfo.map((l) => l.baseline - lineH * 0.55 - vPad);
    const bots = L.lineInfo.map((l) => l.baseline + lineH * 0.55 + vPad);
    const maxW = L.lineInfo.length ? Math.max(...L.lineInfo.map((l) => l.renderW)) : 0;
    return {
      f: L.f,
      end: L.end ?? L.f + 90,
      text: L.text,
      band: L.band,
      left: W / 2 - maxW / 2,
      right: W / 2 + maxW / 2,
      top: Math.min(...tops),
      bottom: Math.max(...bots),
    };
  });
}

export function drawOverlays(ctx, f) {
  if (!LAYOUTS) return;
  for (const c of LAYOUTS) {
    if (f < c.f || f > (c.end ?? c.f + 90)) continue;
    const life = f - c.f;
    const fadeIn = smooth(clamp(life / CAP_FADE));
    const fadeOut = c.end != null ? smooth(clamp(((c.end) - f) / CAP_FADE)) : 1;
    const a = fadeIn * fadeOut;
    if (a <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = c.font;
    ctx.letterSpacing = `${c.track}px`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    for (const line of c.lineInfo) {
      const x = W / 2 - line.width / 2;
      ctx.strokeStyle = STROKE;
      ctx.lineWidth = STROKE_W;
      ctx.strokeText(line.text, x, line.baseline);
      ctx.fillStyle = FILL;
      ctx.fillText(line.text, x, line.baseline);
    }
    ctx.restore();
  }
}
