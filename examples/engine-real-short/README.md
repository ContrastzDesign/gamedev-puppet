# Example: Which engine looks the most real?

This folder is a **film made with the [content-short skill](../../skill/content-short/SKILL.md)** — **VERSION 1** (hand-drawn SVG animals in a detailed 3D world). Version 2 googly-eye / ink-outline / signal-colour look is not used.

- **Format:** 1080×1920, exactly 24 fps, 1253 frames (~52.21 s), H.264 CRF 18 yuv420p + AAC.
- **Look:** Realism-test screening lab with stations CITY (street-level detail + lighting), FACE (close-up eye/skin/hair), BUDGET (16.7 ms frame clock). Original screen UIs; plain-lettered signs only.
- **Cast:** raccoon, wallaby, puffin, tortoise (species not reused from prior Shorts).

## Script (locked)

> Which engine looks the most real?
> Which game engine comes closest to real-world footage? …
> Number one, Unreal Engine 5 for a city at street level…
> Number two, Unity for a close-up face…
> Number three, the frame budget…

## Rebuild

```sh
npm install
python3 tools/draw_chars.py          # SVG → PNG characters
python3 tools/make_screens.py        # original in-scene UIs
export CHROME=/path/to/chrome
GPU=0 node render.mjs --stills stills 0 56 284 592 901
GPU=0 node render.mjs --seq frames
python3 mix.py
ffmpeg -framerate 24 -i frames/f%04d.png -i audio/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 -c:a aac -b:a 192k \
  -shortest -movflags +faststart engine-real-short.mp4
```

Music/SFX wavs are gitignored (see `SOURCES.json`); download per provenance before `mix.py`.
Final cloud render uses `GPU=0` (SwiftShader) — overrides mac-render.md for this film.
