import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fps, frames } from './script.js';

const folder = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_PACKAGE || 'puppeteer-core');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME,
  headless: 'shell',
  pipe: true,
  userDataDir: process.env.WATER_BROWSER,
  args: ['--no-sandbox','--single-process','--disable-gpu','--disable-gpu-compositing',
    '--disable-crash-reporter','--disable-breakpad','--hide-scrollbars','--allow-file-access-from-files'],
});

let encoder;
try {
  const page = await browser.newPage();
  page.on('pageerror', error => console.error(error));
  const url = pathToFileURL(resolve(folder, 'index.html'));
  url.searchParams.set('capture', '1');
  await page.goto(url.href);
  await page.waitForFunction(() => window.renderFrame, {timeout:12000});
  const capture = (frame, format, quality) => page.evaluate((n,type,q) => {
    window.renderFrame(n);
    return document.querySelector('#film').toDataURL(type,q).split(',')[1];
  }, frame, format, quality).then(b64 => Buffer.from(b64, 'base64'));

  const stills = process.argv[2] === '--stills';
  if (stills) {
    const out = process.argv[3];
    await mkdir(out,{recursive:true});
    for (const frame of process.argv.slice(4).map(Number)) {
      await writeFile(resolve(out,`f${frame}.png`),await capture(frame,'image/png'));
    }
  } else {
    const target = process.argv[2] || resolve(folder,'game-water.mp4');
    const count = Number(process.env.WATER_FRAME_COUNT || frames);
    const voice = process.env.WATER_MIX ? ['-i',process.env.WATER_MIX,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k'] : [];
    encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(fps),
      '-f','image2pipe','-c:v','png','-i','pipe:0',...voice,'-c:v','libx264','-preset','fast',
      '-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-t',String(count/fps),target],{stdio:['pipe','ignore','inherit']});
    const finished = new Promise((resolve,reject)=>{
      encoder.once('error',reject);
      encoder.once('close',code=>code===0?resolve():reject(Error('FFmpeg exited '+code)));
    });
    // Handle failure even if the encoder closes before the current frame finishes.
    finished.catch(() => {});
    encoder.stdin.on('error',error=>{ if(error.code!=='EPIPE') console.error(error); });
    const start=performance.now();
    for(let frame=0;frame<count;frame++){
      const data=await capture(frame,'image/png');
      if(encoder.exitCode!==null) await finished;
      await new Promise((resolve,reject)=>{
        encoder.stdin.write(data,error=>error?reject(error):resolve());
      });
      if((frame+1)%120===0) console.log(`${frame+1}/${count} frames in ${((performance.now()-start)/1000).toFixed(1)}s`);
    }
    encoder.stdin.end();
    await finished;
  }
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
}
