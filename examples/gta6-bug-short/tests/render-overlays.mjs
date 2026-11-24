// Overlay test renderer: serves the project folder, opens tests/overlays.html in headless
// chrome-headless-shell (same launch as render.mjs), prints caption widths/wraps and the
// loop/purity/state checks, and writes PNG stills.
//   node tests/render-overlays.mjs [outDir] [frame[nN]] ...   e.g. 215 483n1 (night = 1)
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const folder = resolve(here, '..');
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(folder, p === '/' ? 'tests/overlays.html' : p);
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

const DEFAULT = [0, 32, 34, 36, 39, 64, 68, 71, 75, 150, 215, 483, 680, 684, 700, 712, 874, 925, 928, 932, 936, 950, 968, 978, 985, 995, 1002, 1007];

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.error('console', m.text()); });
  await page.setViewport({ width: 600, height: 1000 });
  await page.goto(`http://127.0.0.1:${port}/tests/overlays.html`);
  await page.waitForFunction(() => window.testReady === true, { timeout: 60000 });

  const info = await page.evaluate(() => window.captionInfo());
  console.log('captions (limit 918 px):');
  for (const c of info) {
    console.log(`  f${String(c.f).padStart(4)}-${String(c.end).padEnd(4)} ${c.band.padEnd(3)} ${String(c.width).padStart(6)} px  ${c.wrapped ? 'WRAPPED' : 'one line'}  "${c.text}"` +
      (c.wrapped ? `  -> ${c.lines.map((l) => `"${l.text}" ${l.width}`).join(' / ')}` : ''));
  }
  const checks = await page.evaluate(() => window.runChecks());
  console.log('loop tail vs f0Canvas:', JSON.stringify(checks.loop));
  console.log('purity (forward vs shuffled order identical):', checks.pure, checks.pure ? '' : JSON.stringify(checks.purity));
  console.log('ctx state after call:', JSON.stringify(checks.state));
  console.log('sweep f0-1007:', JSON.stringify(await page.evaluate(() => window.sweep())));

  const out = resolve(process.argv[2] || join(here, 'stills'));
  await mkdir(out, { recursive: true });
  const specs = process.argv.length > 3 ? process.argv.slice(3) : DEFAULT.map(String);
  for (const s of specs) {
    const [fs, ns] = s.split('n');
    const f = Number(fs), night = ns ? Number(ns) : 0;
    const b64 = await page.evaluate((f, night) => { window.renderFrame(f, night); return document.querySelector('#film').toDataURL('image/png').split(',')[1]; }, f, night);
    const name = `f${String(f).padStart(4, '0')}${night ? `-night${night}` : ''}.png`;
    await writeFile(resolve(out, name), Buffer.from(b64, 'base64'));
  }
  console.log(`wrote ${specs.length} stills to ${out}`);
} finally {
  await browser.close();
  server.close();
}
