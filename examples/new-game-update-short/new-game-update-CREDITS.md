# new-game-update — credits

## Cast
- Hook / buy / why: shiba — gaming headset, round shades, hoodie vest, sealed game case
- Factory / print & ship: okapi — yellow hard hat, safety shades, high-vis vest
- Going gold: narwhal — tiny gold crown, gold-rim shades, GOLD MASTER sash + medal
- Bug fix: badger — knit beanie, bug-hunter shades, FIX tee, fly swatter
- Cert / Sony check: mandrill — inspector visor, red-frame shades, clipboard + FAIL stamp
- Coaster gag: coast (shiba) — backwards cap, purple tee, disc under soda
- Finale: grad (shiba) — mortarboard, gown, gold sash, diploma

## Set
Gamer bedroom (GAMER DEN) with TV showing a 200 GB day-one download, high shelves, posters and string lights; busy disc-press factory with presses, dual conveyors, shrink-wrap, disc/case stacks, pallets, shipping crates, forklift/jack, hazard stripes, pipes/vents and warning signs; game studio with bug tickets, sticky wall and LAUNCH IN 4 DAYS board under packed shelves; certification lab with test consoles/monitors, filing cabinets, clipboards, stamp desk, PASS/FAIL bins, dev-kit shelves and checklist wall; bedroom COASTER MODE gag with disc under a soda. Original screen UIs; generic plain lettering only. No Activision / Call of Duty / Sony footage or logos.

## Camera (v3 rebuild)
Free key→key rail with varied move kinds (never the same kind twice in a row), landings 0–4 frames before named VO words, moves 12–30 eased frames, max hold ≤ 12 (boot assertion), near plane 0.35, path-clearance assertion. Booth changes use CUT so interpolation never flies through the void between sets.

## Technical
1080×1920, 24 fps, 1019 frames, H.264 CRF 18 yuv420p + AAC. Integrated loudness −14.0 LUFS, true peak ≤ −1.5 dBTP. Rendered online with GPU=0 (SwiftShader). Captions sit in one lower band below the character’s feet, fully opaque, max 2 lines, hard-clamped to an 80 px side safe zone, bbox bottom ≤ y=1840, and fail boot if any caption box overlaps a sign/screen mesh. Captions spell **disc**, **Call of Duty**, **200 Gigabyte**, **going gold**, **Sony**. Artifacts: `/opt/cursor/artifacts/new-game-update-final/`.

## Paste-ready YouTube description

```
Why Does a Brand New Game Need an Update?

"Hidden Agenda" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

Call of Duty is a trademark of its owner and mentioned for commentary only. This video is not affiliated with or endorsed by Activision, Sony Interactive Entertainment, or the makers of those products.

Sound effects from Freesound (CC0): 541993, 372519, 416054, 878253, 242501, 154648, 534104, 253886, 390863, 450282, 511788, 391660, 264981, 31769, 411087, 511490, 521947.
3D environment: original procedural set. Character art: original hand-drawn SVG animals.
```

## Music
- Hidden Agenda — Kevin MacLeod (incompetech.com) — CC BY 4.0
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100863

## SFX (CC0)
See `SOURCES.json` / `audio/sfx/SOURCES.json`.

## Voice-over
- Supplied ElevenLabs eleven_v4 take in audio/vo.mp3 (not regenerated for this build).
