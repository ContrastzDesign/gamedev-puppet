// Word-exact caption overlays — warm cream/yellow with dark outline (V1).
// Hard safe zone: 80 px side margins → max rendered line width 920 px (incl. stroke).
// Fully opaque lower band; max 2 lines; bbox bottom ≤ 1840.
import { W, H } from './core.js';
import { CAPTIONS } from './beats.js';

const SIDE_MARGIN = 80;
const MAX_RENDER_W = W - SIDE_MARGIN * 2; // 920
const STROKE_W = 14;
// Stroke is centered on the glyph path → half extends past each edge.
const MAX_TEXT_W = MAX_RENDER_W - STROKE_W; // 906
const BASE_FONT_PX = 70;
const MIN_FONT_PX = 36;
const TRACK_RATIO = -0.01;
const MAX_LINES = 2;
// One lower caption band below character feet. BBox bottom must be ≤ CAP_BOTTOM_MAX.
const BAND_Y = { top: 200, low: 1720 };
const LOW_TOP_MIN = 1620;
const CAP_BOTTOM_MAX = 1840; // assertion: bbox.bottom <= 1840
const WRAP_DANGLE = new Set(['a', 'an', 'the', 'or', 'and', 'of', 'in', 'on', 'to', 'at', 'by', 'for', 'with', 'its', "it's", 'where', 'can']);
const FILL = '#f5e6b8';
const STROKE = '#1c1810';

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
function wrapWords(words, visW, maxW, maxLines = MAX_LINES) {
  const n = words.length;
  if (n === 0) return [];
  if (n === 1 || visW(words.join(' ')) <= maxW) return [[0, n]];

  let best = null;
  let bestScore = Infinity;
  const maxL = Math.min(maxLines, n);

  function search(start, linesLeft, acc) {
    if (linesLeft === 1) {
      const last = [start, n];
      const widths = [...acc, last].map(([a, b]) => visW(words.slice(a, b).join(' ')));
      const longest = Math.max(...widths);
      let score = longest;
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
  best = null;
  bestScore = Infinity;
  search(0, maxL, []);
  return best || [[0, n]];
}

function layoutCaption(c, kit) {
  const words = c.text.split(/\s+/).filter(Boolean);
  const lines = wrapWords(words, kit.visW, MAX_TEXT_W, MAX_LINES);
  if (lines.length > MAX_LINES) {
    throw new Error(`Caption exceeds ${MAX_LINES} lines: "${c.text}"`);
  }
  let cy = BAND_Y[c.band] ?? BAND_Y.top;
  if (c.band === 'low') {
    const half = ((lines.length - 1) / 2) * kit.lineH;
    const topY = cy - half - kit.lineH * 0.55;
    if (topY < LOW_TOP_MIN) cy += (LOW_TOP_MIN - topY);
    const botY = cy + half + kit.lineH * 0.55;
    if (botY > CAP_BOTTOM_MAX) cy -= (botY - CAP_BOTTOM_MAX);
  }
  const lineInfo = lines.map(([a, b], li) => {
    const str = words.slice(a, b).join(' ');
    const lw = kit.visW(str);
    const renderW = lw + STROKE_W;
    const baseline = cy + kit.baseOff + (li - (lines.length - 1) / 2) * kit.lineH;
    return { text: str, width: lw, renderW, baseline };
  });
  const maxRender = lineInfo.length ? Math.max(...lineInfo.map((l) => l.renderW)) : 0;
  return { ...c, fontPx: kit.fontPx, font: kit.font, track: kit.track, lineInfo, maxRender, cy, lineCount: lines.length };
}

export async function initOverlays() {
  await document.fonts.load(`800 ${BASE_FONT_PX}px Caption`);
  if (!document.fonts.check(`800 ${BASE_FONT_PX}px Caption`)) throw new Error('Caption font missing');

  LAYOUTS = CAPTIONS.map((c) => {
    let fontPx = BASE_FONT_PX;
    let layout = layoutCaption(c, measureKit(fontPx));
    while (layout.maxRender > MAX_RENDER_W + 0.5 && fontPx > MIN_FONT_PX) {
      fontPx -= 2;
      layout = layoutCaption(c, measureKit(fontPx));
    }
    return layout;
  });

  assertCaptionSafeZone();
}

/** Measure every caption line's rendered width; throw if any exceeds the safe zone. */
export function assertCaptionSafeZone() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  const overflows = [];
  const bottomFails = [];
  const lineFails = [];
  for (const c of LAYOUTS) {
    if (c.lineInfo.length > MAX_LINES) {
      lineFails.push({ text: c.text, lines: c.lineInfo.length });
    }
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
  for (const box of captionBoxes()) {
    if (box.bottom > CAP_BOTTOM_MAX + 0.5) {
      bottomFails.push({
        text: box.text,
        bottom: +box.bottom.toFixed(1),
        max: CAP_BOTTOM_MAX,
      });
    }
  }
  if (lineFails.length) {
    throw new Error(`Caption exceeds ${MAX_LINES} lines:\n`
      + lineFails.map((o) => `  "${o.text}" lines=${o.lines}`).join('\n'));
  }
  if (overflows.length) {
    throw new Error(`Caption overflow (safe zone ${SIDE_MARGIN}px / max ${MAX_RENDER_W}px):\n`
      + overflows.map((o) => `  "${o.line}" renderW=${o.renderW} font=${o.fontPx} left=${o.left} right=${o.right}`).join('\n'));
  }
  if (bottomFails.length) {
    throw new Error(`Caption bbox bottom below y=${CAP_BOTTOM_MAX}:\n`
      + bottomFails.map((o) => `  "${o.text}" bottom=${o.bottom}`).join('\n'));
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

/** Screen-space axis-aligned boxes for every caption (opaque plate + stroke). */
export function captionBoxes() {
  if (!LAYOUTS) throw new Error('overlays: call initOverlays() first');
  const vPad = STROKE_W / 2 + 10;
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
      left: W / 2 - maxW / 2 - 18,
      right: W / 2 + maxW / 2 + 18,
      top: Math.min(...tops),
      bottom: Math.min(CAP_BOTTOM_MAX, Math.max(...bots)),
    };
  });
}

export function drawOverlays(ctx, f) {
  if (!LAYOUTS) return;
  for (const c of LAYOUTS) {
    if (f < c.f || f > (c.end ?? c.f + 90)) continue;
    // Fully opaque caption block in the lower band (no fade, solid plate + solid glyphs).
    ctx.save();
    ctx.globalAlpha = 1;
    const lineH = Math.round(c.fontPx * 1.17);
    const vPad = STROKE_W / 2 + 10;
    const tops = c.lineInfo.map((l) => l.baseline - lineH * 0.55 - vPad);
    const bots = c.lineInfo.map((l) => l.baseline + lineH * 0.55 + vPad);
    const maxW = Math.max(...c.lineInfo.map((l) => l.renderW));
    const left = W / 2 - maxW / 2 - 18;
    const right = W / 2 + maxW / 2 + 18;
    const top = Math.min(...tops);
    const bottom = Math.min(CAP_BOTTOM_MAX, Math.max(...bots));
    ctx.fillStyle = '#14110c';
    ctx.beginPath();
    ctx.roundRect(left, top, right - left, bottom - top, 18);
    ctx.fill();
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
