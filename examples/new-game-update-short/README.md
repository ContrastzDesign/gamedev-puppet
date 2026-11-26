# new-game-update-short

Jake Short: **Why Does a Brand New Game Need an Update?**  
content-short **VERSION 1** (hand-drawn SVG animals on camera-facing planes in detailed 3D worlds).

- 1080×1920, exactly 24 fps, 1019 frames (~42.46 s)
- Cast: shiba (gamer), okapi (factory), narwhal (gold master), badger (bug fixer), mandrill (cert inspector), coast / grad (shiba outfit variants)
- Sets: gamer bedroom (200 GB download TV), disc-press factory, game studio, certification office, bedroom coaster gag
- VO: supplied `audio/vo.mp3` (ElevenLabs eleven_v4) — do not regenerate
- Bed: Kevin MacLeod “Hidden Agenda” (CC BY 4.0)
- Final render: online GPU=0 (SwiftShader), H.264 CRF 18 yuv420p + AAC

## Build

```bash
npm install
python3 tools/draw_chars.py
python3 tools/make_screens.py
python3 mix.py
GPU=0 node render.mjs --stills stills 0 40 66 366 485 700 805 876
GPU=0 node render.mjs --seq frames 0 1019
ffmpeg -y -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -shortest new-game-update-short.mp4
```
