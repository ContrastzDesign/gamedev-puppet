// Test page for ../overlays.js: a fake "3D" frame (gradient + shapes) under the 2D layer,
// and a different fake cached frame 0 for the loop dissolve.
import { initOverlays, drawOverlays, captionInfo } from '../overlays.js';

const W = 1080, H = 1920;
const film = document.querySelector('#film');
const ctx = film.getContext('2d', { willReadFrequently: true });

function rr(x, c, y, w, h, r) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
}

// stand-in for the 3D render: workshop-ish colours, with dark and light patches behind both caption bands
function fakeScene(c, f) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#c5dcca'); g.addColorStop(0.55, '#d2c5ad'); g.addColorStop(0.56, '#b98d5e'); g.addColorStop(1, '#8a6648');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // pegboard dots
  c.fillStyle = 'rgba(60,50,40,0.25)';
  for (let y = 60; y < 1000; y += 70) for (let x = 40; x < W; x += 70) { c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); }
  // dark monitor behind the left of the top band
  c.lineWidth = 5; c.strokeStyle = '#1c1c20';
  rr(60, c, 150, 420, 300, 24); c.fillStyle = '#2c3038'; c.fill(); c.stroke();
  rr(84, c, 174, 372, 252, 10); c.fillStyle = '#79b4e3'; c.fill();
  // white page behind the right of the top band
  rr(700, c, 200, 300, 160, 8); c.fillStyle = '#f3ecd9'; c.fill(); c.stroke();
  // blue cutting mat with grid across the low band
  rr(40, c, 1150, 1000, 420, 18); c.fillStyle = '#6f9fc0'; c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
  for (let x = 80; x < 1040; x += 60) { c.beginPath(); c.moveTo(x, 1150); c.lineTo(x, 1570); c.stroke(); }
  for (let y = 1190; y < 1570; y += 60) { c.beginPath(); c.moveTo(40, y); c.lineTo(1040, y); c.stroke(); }
  // a coral box sliding with the frame number, a saffron disc, an ink bar
  c.strokeStyle = '#1c1c20'; c.lineWidth = 5;
  const bx = 160 + ((f * 3) % 600);
  rr(bx, c, 1280, 240, 150, 26); c.fillStyle = '#e06d58'; c.fill(); c.stroke();
  c.beginPath(); c.arc(820, 700, 150, 0, 7); c.fillStyle = '#e8b84a'; c.fill(); c.stroke();
  rr(300, c, 560, 480, 90, 20); c.fillStyle = '#3a3f46'; c.fill(); c.stroke();
  // frame counter, small, bottom left
  c.fillStyle = '#1c1c20'; c.font = '600 34px sans-serif'; c.fillText(`f${f}`, 30, 1880);
}

// a clearly different frame 0 (outdoor field) for the loop dissolve
const f0Canvas = document.createElement('canvas');
f0Canvas.width = W; f0Canvas.height = H;
{
  const c = f0Canvas.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#76a2db'); g.addColorStop(0.5, '#d3e6f1'); g.addColorStop(0.51, '#9ccd67'); g.addColorStop(1, '#80a857');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = '#1c1c20'; c.lineWidth = 5;
  c.beginPath(); c.arc(540, 1200, 220, 0, 7); c.fillStyle = '#e06d58'; c.fill(); c.stroke();
  rr(140, c, 1500, 300, 200, 30); c.fillStyle = '#e9e1d4'; c.fill(); c.stroke();
  c.fillStyle = '#3d518c'; c.globalAlpha = 0.94; c.beginPath(); c.ellipse(700, 1720, 260, 50, 0, 0, 7); c.fill(); c.globalAlpha = 1;
  c.fillStyle = '#fff'; c.beginPath(); c.ellipse(260, 300, 140, 60, 0, 0, 7); c.fill(); c.stroke();
}

window.renderFrame = (f, night = 0) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  fakeScene(ctx, f);
  drawOverlays(ctx, f, { f0Canvas, night });
};

function hashImage(data) {
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 3) { h ^= data[i]; h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}
const grabHash = (f, night = 0) => { window.renderFrame(f, night); return hashImage(ctx.getImageData(0, 0, W, H).data); };

window.runChecks = () => {
  const out = {};
  // 1. loop tail is exactly f0Canvas
  const ref = f0Canvas.getContext('2d').getImageData(0, 0, W, H).data;
  out.loop = [];
  for (const f of [1001, 1002, 1003, 1004, 1005, 1006, 1007]) {
    window.renderFrame(f);
    const d = ctx.getImageData(0, 0, W, H).data;
    let diff = 0, maxd = 0;
    for (let i = 0; i < d.length; i++) { const e = Math.abs(d[i] - ref[i]); if (e) { diff++; if (e > maxd) maxd = e; } }
    out.loop.push({ f, differingChannels: diff, maxDelta: maxd });
  }
  // 2. purity: same frames in forward and shuffled order give identical pixels
  const frames = [33, 36, 66, 70, 74, 150, 680, 700, 712, 928, 934, 968, 980, 990, 999];
  const fwd = frames.map((f) => grabHash(f));
  const order = [...frames].reverse().concat([700, 33, 990]);
  const again = {};
  for (const f of order) again[f] = grabHash(f);
  out.purity = frames.map((f, i) => ({ f, same: fwd[i] === again[f] }));
  out.pure = out.purity.every((p) => p.same);
  // 3. ctx state is reset after a call (caller state restored)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  window.renderFrame(930, 0.7);
  const t = ctx.getTransform();
  out.state = {
    filter: ctx.filter, globalAlpha: ctx.globalAlpha, op: ctx.globalCompositeOperation,
    shadowBlur: ctx.shadowBlur, shadowColor: ctx.shadowColor, identity: t.isIdentity,
  };
  return out;
};

// every frame once, timing drawOverlays alone (fake scene excluded)
window.sweep = () => {
  let total = 0, worst = 0, worstF = 0;
  for (let f = 0; f < 1008; f++) {
    fakeScene(ctx, f);
    const t = performance.now();
    drawOverlays(ctx, f, { f0Canvas, night: f >= 483 && f < 526 ? 1 : 0 });
    ctx.getImageData(0, 0, 1, 1); // flush
    const d = performance.now() - t;
    total += d; if (d > worst) { worst = d; worstF = f; }
  }
  return { frames: 1008, avgMs: +(total / 1008).toFixed(2), worstMs: +worst.toFixed(2), worstF };
};

await initOverlays();
window.captionInfo = captionInfo;
window.testReady = true;
