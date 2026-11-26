# Example: Where should you build your game?

This folder is a **film made with the [content-short skill](../../skill/content-short/SKILL.md)** — **VERSION 1** (hand-drawn SVG animals in a detailed 3D world). Version 2 googly-eye / ink-outline / signal-colour look is not used.

- **Format:** 1080×1920, exactly 24 fps, 1136 frames (~47.33 s), H.264 CRF 18 yuv420p + AAC.
- **Look:** Game-maker's street with three booths (Roblox Studio, Godot, Nilo), original editor/browser screen content, plain-lettered signs only.
- **Camera:** Motivated free 3D moves in `camera.js` (fly-through, push-in, cut, orbit, whip, crane, top-down, low-hero, pull-out) landing 0–4 frames before named VO words; continuous drift between landings.
- **Cast:** capybara, wombat, hedgehog, ferret, sugar glider (species not reused from gamer-sites).

## Script (locked)

> Where should you build your game?
> What's the best platform for making a game?
> Number one, Roblox Studio … But Roblox does take more than 70% of your future earnings
> Number two, Godot … it can get pretty expensive!
> Number three, Nilo for a playable 3D world in a browser…
> That makes it a practical choice when the first release is a playtest people should be able to join immediately.

## Rebuild

```sh
npm install
python3 tools/draw_chars.py          # SVG → PNG characters
export CHROME=/path/to/chrome
GPU=0 node render.mjs --stills stills 0 120 413 804 1003
GPU=0 node render.mjs --seq frames
python3 mix.py
ffmpeg -framerate 24 -i frames/f%04d.png -i audio/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 -c:a aac -b:a 192k \
  -shortest -movflags +faststart build-game-short.mp4
```

Music/SFX wavs are gitignored (see `SOURCES.json`); download per provenance before `mix.py`.
