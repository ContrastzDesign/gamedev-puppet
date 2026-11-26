# build-game — credits (camera re-render)

## Cast
- Hook / platform Q: capybara — safari hat, round sunglasses, khaki explorer shirt
- Number one / Roblox Studio: wombat — hard hat, blocky sunglasses, builder vest
- Number two / Godot: hedgehog — reading glasses, tinkerer apron, receipt pocket
- Number three / Nilo: ferret — portal goggles, teal hoodie, orange scarf
- Outro: sugar glider — aviator hat, small shades, mint hoodie, join scarf

## Set
Game-maker's street with booths labeled ROBLOX STUDIO, GODOT, NILO. Blocky build studio with a 70% earnings jar, free open workshop with publishing-fee receipts and a toll gate, glowing browser-portal stall with a joinable link. Neighbouring work benches, neon/LED strips, posters, shelves, lamps, snacks, aisle runners, planters, hanging banners. Original screen UIs; generic plain lettering only.

## Technical
1080×1920, 24 fps, 1136 frames, H.264 CRF 18 yuv420p + AAC. Integrated loudness −14.0 LUFS, true peak −1.6 dBTP. Rendered online with GPU=0 (SwiftShader). Captions sit in one lower band below the character’s feet, hard-clamped to an 80 px side safe zone (max line render width 920 px), and fail boot if any caption box overlaps a sign/screen mesh. Captions spell **Nilo**.

## Camera moves (landings / major beats)
| Frame | Kind | Beat |
|------:|------|------|
| 0 | fly-through | hook open (already moving) |
| 16 | push-in | “build” |
| 51 | cut | platform Q |
| 63 | orbit | “platform” |
| 139 | whip | “Roblox” |
| 187 | push-in | “easiest” |
| 253 | crane | “free” / screens |
| 350 | top-down | “70%” earnings |
| 435 | whip | “Godot” |
| 468 | low-hero | “opposite” |
| 543 | pull-out | Godot “free” |
| 643 | crane | “fees” |
| 771 | push-in | “expensive” |
| 825 | whip | “Nilo” |
| 846 | fly-through | “playable” / portal |
| 887 | push-in | “browser” |
| 920 | orbit | “non-developers” |
| 987 | low-hero | “link” |
| 1003 | cut | outro |
| 1066 | push-in | “playtest” |
| 1103 | crane | “join” |

Static-run QA (108×192 gray, tblend difference, YAVG &lt; 0.15): max consecutive run = **1** (limit 12).

## Paste-ready YouTube description

```
Where should you build your game?

"Wallpaper" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

Roblox Studio, Godot and Nilo are trademarks of their owners and mentioned for commentary only. This video is not affiliated with or endorsed by Roblox Corporation, the Godot project, or Nilo.

Sound effects from Freesound (CC0): 511788, 390863, 510735, 450282, 534104, 687108, 181774, 541993, 154648, 878253, 416054, 372519.
Additional UI clicks: Kenney UI Audio (CC0).
3D environment: original procedural set. Character art: original hand-drawn SVG animals.
```

## Music
- Wallpaper — Kevin MacLeod (incompetech.com) — CC BY 4.0
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1500075

## SFX (CC0)
See `SOURCES.json` / `audio/sfx/SOURCES.json`.

## Voice-over
- Supplied ElevenLabs take in audio/vo.mp3 (not regenerated for this build).
