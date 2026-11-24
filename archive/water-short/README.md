# Game Water

A 44.75-second vertical picture cut. The 3D cove, dock, shoreline, roof, reef, and camera are Three.js geometry. The software renderer projects those meshes into a 270 × 480 framebuffer. The generated otter uses six transparent pose crops of the same character, positioned at world depth. The scenery, effects, and sprites share a 4 × 4 ordered-dither pass and nearest-neighbor upscaling. Captions are drawn at 1080 × 1920.

## Preview and render

Serve this directory locally and open `index.html` for a looping picture preview. `script.js` holds caption starts and the frame count. `storyboard()` in `film.js` holds the camera moves and the otter's actions. Frame states are deterministic at 24 fps.

Install `puppeteer-core` in the project or set `PUPPETEER_PACKAGE` to its installed package directory. Use a local Chromium Headless Shell executable and FFmpeg.

```sh
CHROME=/path/to/chrome-headless-shell \
WATER_MIX="$PWD/assets/picture-mix.m4a" \
node render.mjs game-water.mp4
```

To inspect individual frames, run `node render.mjs --stills /path/to/output 0 211 679 1057` with the same `CHROME` setting.

## Assets and sound

- `assets/otter-sheet.png` was generated with the built-in ImageGen tool. The character prompt requested one cinnamon-brown river otter with a cream muzzle, small paws, mint goggles, a mustard two-stripe swim vest, and a tapered tail. The six transparent poses were curious, crouched, diving, two swimming strokes, and breath-holding. The reference from the content-short bundle guided the proportions and painterly shading. The pixel style comes from the render pass.
- The temporary mix uses “Playful And Quirky Orchestral” and the “ES_Whip Whoosh 2” excerpt from the adjacent `New video` project. That project's source records mark both as cleared by Ricardo. The mix starts after the first spoken line's caption and low-passes the music at the underwater transition.
- The caption timing is provisional until narration is available. The export contains the temporary mix. The requested music cue is [“Moon Men” by Jake Chudnow](https://www.youtube.com/watch?v=AsxsQkKnmBI).
