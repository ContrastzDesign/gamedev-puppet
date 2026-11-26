# engine-real — credits

## Cast
- Hook / question: raccoon — film-critic beret, dark round sunglasses, cream scarf, dark jacket
- Number one / Unreal Engine 5 city: wallaby — city cap, thin explorer shades, urban jacket, neck camera
- Number two / Unity face: puffin — photographer beret, gold round glasses, makeup apron, close-up lens
- Number three / frame budget: tortoise — referee cap, sport sunglasses, striped shirt, shell plates, stopwatch

## Set
Realism-test screening lab labeled REALISM LAB, with stations CITY (street-level fly-through + geometry/light viz), FACE (close-up eye/skin/hair layers + softboxes), BUDGET (16.7 ms timer bar split city vs face). Neighbouring plate/grade desks, equipment racks, posters, lamps. Original screen UIs; generic plain lettering only. No Epic/Unity demo footage.

## Technical
1080×1920, 24 fps, 1253 frames, H.264 CRF 18 yuv420p + AAC. Integrated loudness −14.0 LUFS, true peak ≤ −1 dBTP. Rendered online with GPU=0 (SwiftShader). Camera rebuilt to land 0–4 frames before each named VO beat with a different move kind each time (push-in, orbit, crane, pull-out, cut, low-hero, top-down, fly-through, whip); `assertMaxHold(12)` and a static-frame difference check (YAVG&lt;0.15) both pass. Captions are fully opaque in one lower band below the feet (bbox bottom ≤ y=1840), hard-clamped to an 80 px side safe zone, max 2 lines, and fail boot if any caption box overlaps a sign/screen mesh. Captions spell **Unreal Engine 5**, **The Matrix Awakens**, **Nanite**, **Lumen**, **Enemies**, **High Definition Render Pipeline**, **sixty**, **16.7**.

## Paste-ready YouTube description

```
Which engine looks the most real?

"Lobby Time" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

Unreal Engine, Unity, The Matrix Awakens and Enemies are trademarks of their owners and mentioned for commentary only. This video is not affiliated with or endorsed by Epic Games, Unity Technologies, Warner Bros., or the makers of those demos.

Sound effects from Freesound (CC0): 541993, 372519, 416054, 878253, 242501, 154648, 534104, 253886, 390863, 450282, 511788.
Additional UI clicks: Kenney UI Audio (CC0).
3D environment: original procedural set. Character art: original hand-drawn SVG animals.
```

## Music
- Lobby Time — Kevin MacLeod (incompetech.com) — CC BY 4.0
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100345

## SFX (CC0)
See `SOURCES.json` / `audio/sfx/SOURCES.json`.

## Voice-over
- Supplied ElevenLabs eleven_v4 take in audio/vo.mp3 (not regenerated for this build).
