# Why Are There Two Minecrafts? (content-short V1)

Narrated Jake YouTube Short — drawn SVG animals in detailed 3D worlds.

- **Resolution:** 1080×1920
- **Frame rate:** exactly 24 fps
- **Frames:** 919 (38.269388 s)
- **Cast:** hamster, koala, panda, mole, lynx
- **Music:** Kevin MacLeod — Bit Quest (CC BY 4.0)

## Build

```bash
npm install
python3 tools/draw_chars.py
python3 tools/make_screens.py
GPU=0 npm run stills -- 0 100 250 350 450 550 650 800 880
python3 mix.py
GPU=0 npm run render
ffmpeg -y -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart out.mp4
```

See `BRIEF.md` for full production rules. Leave other example films untouched.
