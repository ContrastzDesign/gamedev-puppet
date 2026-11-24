// node tests/render-room.mjs [view ...]  -> tests/stills/room-<view>.png, plus z-audit / keep-clear report
// Debug env: SH=<n> widens the shadow ortho box, HIDE=name,name hides named room objects.
// Server and Chrome launch copied from render.mjs. Serves the parent folder so content-short/assets is reachable.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const folder = resolve(project, '..');
const require = createRequire(join(project, 'render.mjs'));
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(folder, p);
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
  await page.goto(`http://127.0.0.1:${port}/gta6-bug-short/tests/room-test.html?sh=${process.env.SH || 12}&hide=${process.env.HIDE || ''}`);
  await page.waitForFunction(() => window.roomReady === true, { timeout: 60000 });
  const info = await page.evaluate(() => ({ gl: window.glInfo, lampMinY: window.lampMinY, screenCenter: window.screenCenter, keepClear: window.keepClear, zaudit: window.zaudit, tris: window.roomTris, views: window.views }));
  console.log('renderer:', info.gl, '| room tris:', info.tris);
  console.log('lampMinY:', info.lampMinY.toFixed(3), '| screenCenter:', info.screenCenter.join(', '));
  console.log('keep-clear hits:', info.keepClear.length ? info.keepClear : 'none');
  console.log(`z-audit: ${info.zaudit.length} rows`);
  for (const r of info.zaudit) console.log(' ', r.kind, '|', r.a, '|', r.b, '| gap', r.gap, '|', r.note || '');
  const out = join(here, 'stills');
  await mkdir(out, { recursive: true });
  const want = process.argv.slice(2).length ? process.argv.slice(2) : info.views;
  for (const v of want) {
    const [name, night] = v.split(':');
    const b64 = await page.evaluate((n, nt) => { window.renderView(n, nt); return document.querySelector('#c').toDataURL('image/png').split(',')[1]; }, name, night === 'night');
    const mag = await page.evaluate(() => window.magentaCount());
    await writeFile(join(out, `room-${v.replace(':', '-')}.png`), Buffer.from(b64, 'base64'));
    console.log(`room-${v}.png  magenta px: ${mag}`);
  }
} finally {
  await browser.close();
  server.close();
}
