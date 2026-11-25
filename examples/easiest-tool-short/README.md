# Example: The easiest tool for a first game

This folder is a **film made with the [content-short skill](../../skill/content-short/SKILL.md)** — **VERSION 1** (hand-drawn SVG animals in a detailed 3D world). Version 2 googly-eye / ink-outline / signal-colour look is not used.

- **Format:** 1080×1920, exactly 24 fps, 998 frames (~41.58 s), H.264 CRF 18 yuv420p + AAC.
- **Look:** Cozy first-game maker's library/workshop with three stations (Twine story-branch, GDevelop 2D logic, Nilo 3D world), original editor-like screen content, plain-lettered signs only.
- **Cast:** alpaca, chinchilla, meerkat, fennec fox (species not reused from prior Shorts).

## Script (locked)

> The easiest tool for a first game
> Which game-making tool is easiest to learn? For a first project, the answer depends on what the game has to do.
> Number one, Twine for branching stories…
> Number two, GDevelop for 2D game logic…
> Number three, Nilo for a first 3D game world…

## Rebuild

```sh
npm install
python3 tools/draw_chars.py          # SVG → PNG characters
python3 tools/make_screens.py        # original in-scene UIs
export CHROME=/path/to/chrome
GPU=0 node render.mjs --stills stills 0 68 239 478 760
GPU=0 node render.mjs --seq frames
python3 mix.py
ffmpeg -framerate 24 -i frames/f%04d.png -i audio/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 -c:a aac -b:a 192k \
  -shortest -movflags +faststart easiest-tool-short.mp4
```

Music/SFX wavs are gitignored (see `SOURCES.json`); download per provenance before `mix.py`.
Final cloud render uses `GPU=0` (SwiftShader) — overrides mac-render.md for this film.
