# gta6-bug-v1-short

Jake Short: **Why Can't GTA VI Just Fix a Bug Overnight?**  
content-short **VERSION 1** (hand-drawn SVG animals on camera-facing planes in detailed 3D worlds).

- 1080×1920, exactly 24 fps, 1027 frames (~42.76 s)
- Cast: pika (gamer), aardvark (developer), worker (aardvark hard-hat), walrus (captain), kinkajou (QA), binturong (cert), tired / grad (aardvark outfit variants)
- Sets: gamer bedroom (city TV), game studio (code + upload), harbour (invisible wall), QA lab, certification office, year-10 / graduation studio
- VO: supplied `audio/vo.mp3` (ElevenLabs eleven_v4) — do not regenerate
- Bed: Kevin MacLeod “Monkeys Spinning Monkeys” (CC BY 4.0)
- Final render: online GPU=0 (SwiftShader), H.264 CRF 18 yuv420p + AAC

> `examples/gta6-bug-short/` is the retired **V2** look of this script — leave it untouched.

## Build

```bash
npm install
python3 tools/draw_chars.py
python3 tools/make_screens.py
python3 mix.py
GPU=0 node render.mjs --stills stills 0 40 90 200 400 650 790 960
GPU=0 node render.mjs --seq frames 0 1027
ffmpeg -y -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -shortest gta6-bug-v1-short.mp4
```
