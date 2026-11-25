# Example: What websites do gamers visit the most?

Jake YouTube Short built with **content-short VERSION 1** (hand-drawn SVG animals in a detailed 3D cyber-cafe). Not Version 2 (googly-eye toon 3D).

- **Format:** 1080×1920, exactly 24 fps, 731 frames (~30.46 s), H.264 CRF 18 + AAC
- **Look:** oversized-head animal billboards, warm wood/brick cafe, generic booth signs, original screen UIs
- **Cast:** quokka, red panda, axolotl, pangolin, ring-tailed lemur — each with themed hats/headset/outfits
- **Audio:** supplied ElevenLabs `audio/vo.mp3` (do not regenerate) + Kevin MacLeod “Carefree” (CC BY 4.0) ducked under VO + Freesound/Kenney CC0 SFX

## Rebuild

```sh
npm install
python3 tools/draw_chars.py          # SVG → PNG characters
python3 mix.py                       # audio/mix.wav (~-14 LUFS)
export CHROME=/usr/local/bin/google-chrome
GPU=0 node render.mjs --stills stills 0 75 196 363 507 720
GPU=0 node render.mjs --seq frames
ffmpeg -framerate 24 -i frames/f%04d.png -i audio/mix.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 \
  -c:a aac -b:a 192k -shortest -movflags +faststart gamer-sites-short.mp4
```

`GPU=0` forces SwiftShader software rendering (required for cloud VMs).

## Notes

- Script and VO are locked word-for-word from the seed (`script/spoken.txt`, `audio/vo.mp3`).
- Signs say WEB MAP / PC LIBRARY / BROWSER PLAY / BLOCK WORLD / LIVE WATCH — no real Steam/Poki/Roblox/Twitch logos.
- Final deliverable parts live under `/opt/cursor/artifacts/gamer-sites-final/` on the build agent.
