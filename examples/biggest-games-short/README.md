# biggest-games-short

Jake Short: **The biggest games, 2000s to 2011**  
content-short **VERSION 1** (hand-drawn SVG animals on camera-facing planes in detailed 3D worlds).

- 1080×1920, exactly 24 fps, 1247 frames (~51.96 s)
- Cast: tapir, flamingo, armadillo, platypus (new species)
- Set: sales-chart museum with 2002 shop / 2007 living room / 2011 midnight-launch booths
- VO: supplied `audio/vo.mp3` (ElevenLabs eleven_v4) — do not regenerate
- Bed: Kevin MacLeod “Investigations” (CC BY 4.0)
- Final render: online GPU=0 (SwiftShader), H.264 CRF 18 yuv420p + AAC

## Build

```bash
npm install
python3 tools/draw_chars.py
python3 tools/make_screens.py
python3 mix.py
GPU=0 node render.mjs --stills stills 0 40 384 620 950 1200
GPU=0 node render.mjs --seq frames 0 1247
ffmpeg -y -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -shortest biggest-games-short.mp4
```
