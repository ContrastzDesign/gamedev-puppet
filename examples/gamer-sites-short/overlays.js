// Word-exact caption overlays — warm cream/yellow with dark outline (V1).
import { W, H, clamp, smooth } from './core.js';
import { CAPTIONS } from './beats.js';

const FONT_PX = 70;
const FONT = `800 ${FONT_PX}px Caption`;
const TRACK = -0.01 * FONT_PX;
const BAND_Y = { top: 280, low: 1380 };
const MAX_W = 920;
const LINE_H = 82;
const WRAP_DANGLE = new Set(['a', 'an', 'the', 'or', 'and', 'of', 'in', 'on', 'to', 'at', 'by', 'for', 'with', 'its', "it's"]);
const FILL = '#f5e6b8';
const STROKE = '#1c1810';

let LAYOUTS = null;

export async function initOverlays() {
  await document.fonts.load(FONT);
  if (!document.fonts.check(FONT)) throw new Error('Caption font missing');

  const m = document.createElement('canvas').getContext('2d');
  m.font = FONT;
  m.letterSpacing = `${TRACK}px`;
  m.textBaseline = 'alphabetic';
  const mw = (s) => m.measureText(s).width;
  const m0 = document.createElement('canvas').getContext('2d');
  m0.font = FONT;
  const trailing = mw('a') - m0.measureText('a').width;
  const visW = (s) => mw(s) - trailing;
  const asc = m.measureText('H').actualBoundingBoxAscent;
  const desc = m.measureText('g').actualBoundingBoxDescent;
  const baseOff = (asc - desc) / 2;

  LAYOUTS = CAPTIONS.map((c) => {
    const words = c.text.split(/\s+/).filter(Boolean);
    const one = words.join(' ');
    let lines = [[0, words.length]];
    if (visW(one) > MAX_W && words.length > 1) {
      let best = 1, bestW = Infinity;
      for (let k = 1; k < words.length; k++) {
        const w = Math.max(visW(words.slice(0, k).join(' ')), visW(words.slice(k).join(' ')))
          + (WRAP_DANGLE.has(words[k - 1].toLowerCase()) ? 100 : 0);
        if (w < bestW) { bestW = w; best = k; }
      }
      // Prefer up to 3 lines for long captions
      if (visW(words.slice(0, best).join(' ')) > MAX_W || visW(words.slice(best).join(' ')) > MAX_W) {
        let b1 = 1, b2 = words.length - 1, score = Infinity;
        for (let i = 1; i < words.length - 1; i++) {
          for (let j = i + 1; j < words.length; j++) {
            const ww = Math.max(
              visW(words.slice(0, i).join(' ')),
              visW(words.slice(i, j).join(' ')),
              visW(words.slice(j).join(' ')),
            );
            if (ww < score) { score = ww; b1 = i; b2 = j; }
          }
        }
        lines = [[0, b1], [b1, b2], [b2, words.length]];
      } else {
        lines = [[0, best], [best, words.length]];
      }
    }
    const cy = BAND_Y[c.band] ?? BAND_Y.top;
    const lineInfo = lines.map(([a, b], li) => {
      const str = words.slice(a, b).join(' ');
      const lw = visW(str);
      const baseline = cy + baseOff + (li - (lines.length - 1) / 2) * LINE_H;
      return { text: str, width: lw, baseline };
    });
    return { ...c, lineInfo };
  });
}

export function drawOverlays(ctx, f) {
  if (!LAYOUTS) return;
  for (const c of LAYOUTS) {
    if (f < c.f || f > (c.end ?? c.f + 90)) continue;
    const life = f - c.f;
    const fadeIn = smooth(clamp(life / 4));
    const fadeOut = c.end != null ? smooth(clamp(((c.end) - f) / 4)) : 1;
    const a = fadeIn * fadeOut;
    if (a <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = FONT;
    ctx.letterSpacing = `${TRACK}px`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    for (const line of c.lineInfo) {
      const x = W / 2 - line.width / 2;
      ctx.strokeStyle = STROKE;
      ctx.lineWidth = 14;
      ctx.strokeText(line.text, x, line.baseline);
      ctx.fillStyle = FILL;
      ctx.fillText(line.text, x, line.baseline);
    }
    ctx.restore();
  }
}
