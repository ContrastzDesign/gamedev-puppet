# phone-hot-v1-short

Jake Short: **Why Does Your Phone Get Hot Playing Games?**  
content-short **VERSION 1** (hand-drawn SVG animals on camera-facing planes in detailed 3D worlds).

- 1080×1920, exactly 24 fps, 940 frames (~39.17 s)
- Cast: coati (gamer), numbat (inventor), yak (engineer), gecko (developer), chip (gecko racing suit), arctic fox (hand warmer)
- Sets: living room, patio/AC, workshop, waterproof seal bay, phone interior, circuit racetrack, game studio, snowy cabin
- VO: supplied `audio/vo.mp3` (ElevenLabs eleven_v4) — do not regenerate
- Bed: Kevin MacLeod “Pixel Peeker Polka - faster” (CC BY 4.0)
- Final render: online GPU=0 (SwiftShader), H.264 CRF 18 yuv420p + AAC

## Build

```bash
npm install
python3 tools/draw_chars.py
python3 tools/make_screens.py
python3 mix.py
GPU=0 node render.mjs --stills stills 0 30 69 158 275 409 501 569 623 780 864
GPU=0 node render.mjs --seq frames 0 940
ffmpeg -y -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -shortest phone-hot-v1-short.mp4
```
