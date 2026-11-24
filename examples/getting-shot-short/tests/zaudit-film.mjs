// z-audit harness (copied from render.mjs): node tests/zaudit-film.mjs <frames...>\n// Render harness. Two modes:
//   node render.mjs --stills <outDir> <frame> [<frame> ...]   PNG stills for QA
//   node render.mjs --seq <outDir> [start] [end]                 lossless PNG sequence f0000.png...
// Serves the project folder over a local HTTP server (ES modules need it), drives
// window.renderFrame(n) in headless Chrome, and reads the composited #film canvas.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const folder = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FRAMES = Number((await readFile(join(folder, 'beats.js'), 'utf8')).match(/FRAMES\s*=\s*(\d+)/)[1]);
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME ||
  (process.platform === 'darwin'
    ? `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell`
    : '/usr/local/bin/google-chrome');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(folder, p === '/' ? 'index.html' : p);
    if (!file.startsWith(folder)) throw new Error('outside');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const gpu = process.env.GPU !== '0';
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell', pipe: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--disable-crash-reporter', '--disable-breakpad',
    ...(gpu ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])],
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.error('console', m.text()); });
  await page.setViewport({ width: 600, height: 1000 });
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => window.filmReady === true, { timeout: 60000 });
  console.log('renderer:', await page.evaluate(() => window.glInfo));
  if (process.env.DBG_GAME) await page.evaluate(() => { window.__dbgGame = true; });
  const frames = process.argv.slice(2).map(Number);
  const res = await page.evaluate(async (frames) => {
    const { zAudit } = await import('/z-audit.js');
    const out = {};
    const skipRe = /dust|steam|sky|catcher|shadow|ground/i;
    for (const n of frames) {
      window.renderFrame(n);
      const skip = [];
      window.__film.scene.traverse((o) => {
        if (!o.isMesh) return;
        const name = o.name || '';
        if (skipRe.test(name) || o.userData.particle || o.userData.skipZAudit) skip.push(o);
      });
      out[n] = zAudit(window.__film.scene, { skip });
    }
    return out;
  }, frames);
  const seen = new Map();
  for (const [n, rows] of Object.entries(res)) for (const r of rows) {
    const k = `${r.kind}|${r.a}|${r.b}`;
    if (!seen.has(k)) seen.set(k, { ...r, frames: [] });
    seen.get(k).frames.push(Number(n));
  }
  console.log(`frames audited: ${frames.length}, distinct issues: ${seen.size}`);
  for (const r of seen.values()) console.log(JSON.stringify(r));
} finally {
  await browser.close();
  server.close();
}
