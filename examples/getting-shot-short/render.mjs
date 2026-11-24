// Render harness. Two modes:
//   node render.mjs --stills <outDir> <frame> [<frame> ...]   PNG stills for QA
//   node render.mjs --seq <outDir> [start] [end]                 lossless PNG sequence f0000.png...
// Serves the project folder over a local HTTP server (ES modules need it), drives
// window.renderFrame(n) in headless Chrome, and reads the composited #film canvas.
//
// Resume-safe: --seq skips frames whose PNG already exists and is non-empty.
// Multi-worker: mac-render-all.sh runs several --seq ranges in parallel (Metal).
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, access, stat } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

const folder = dirname(fileURLToPath(import.meta.url));
const FRAMES = Number((await readFile(join(folder, 'beats.js'), 'utf8')).match(/FRAMES\s*=\s*(\d+)/)[1]);
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

function defaultChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  if (process.platform === 'darwin') {
    return join(homedir(),
      'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
  }
  return '/usr/local/bin/google-chrome';
}
const CHROME = defaultChrome();

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
    ...(gpu
      ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']
      : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])],
});

async function existsNonEmpty(path) {
  try {
    await access(path, FS.F_OK);
    const s = await stat(path);
    return s.size > 1000;
  } catch { return false; }
}

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.error('console', m.text()); });
  await page.setViewport({ width: 600, height: 1000 });
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => window.filmReady === true, { timeout: 60000 });
  console.log('renderer:', await page.evaluate(() => window.glInfo));
  if (process.env.DBG_GAME) await page.evaluate(() => { window.__dbgGame = true; });
  const grab = (n) => page.evaluate((f) => { window.renderFrame(f); return document.querySelector('#film').toDataURL('image/png').split(',')[1]; }, n)
    .then((b) => Buffer.from(b, 'base64'));

  const mode = process.argv[2];
  const out = resolve(process.argv[3] || 'stills');
  await mkdir(out, { recursive: true });
  const t0 = performance.now();
  if (mode === '--stills') {
    for (const n of process.argv.slice(4).map(Number)) {
      await writeFile(resolve(out, `f${String(n).padStart(4, '0')}.png`), await grab(n));
    }
  } else if (mode === '--seq') {
    const a = Number(process.argv[4] ?? 0), b = Number(process.argv[5] ?? FRAMES);
    let wrote = 0, skipped = 0;
    for (let n = a; n < b; n++) {
      const path = resolve(out, `f${String(n).padStart(4, '0')}.png`);
      if (await existsNonEmpty(path)) { skipped++; continue; }
      await writeFile(path, await grab(n));
      wrote++;
      if ((n + 1) % 48 === 0 || n + 1 === b) {
        console.log(`${n + 1}/${b} wrote=${wrote} skipped=${skipped} ${((performance.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
    console.log(`range ${a}..${b - 1}: wrote ${wrote}, skipped ${skipped}`);
  } else throw new Error('usage: --stills <dir> <frames...> | --seq <dir> [start] [end]');
  console.log(`done in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
} finally {
  await browser.close();
  server.close();
}
