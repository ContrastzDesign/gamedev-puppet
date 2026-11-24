# Example: Why does getting shot in a game doesn't kill you

This folder is an **example film made with the [content-short skill](../../skill/content-short/SKILL.md)**. Format: 1080×1920, exactly 24 fps, 1267 frames (~52.79 s), H.264 with AAC audio.

- **Look:** Version 2 toon-3D — workshop desk, toon shooter arena, ink outlines, hatched blue shadows `#3d518c`, signal colours (lime / red / mint).
- **Cast:** plum mug, cream gamepad, saffron soda can — googly eyes only.
- **VO:** seed `audio/vo.mp3` (do not regenerate). Word timings in `audio/vo-words.json`.

## Final render on Ricardo's Mac

One self-contained script does the whole Mac final (Metal, 4 workers, mix, encode):

```sh
cd examples/getting-shot-short
./mac-render-all.sh
# -> out/getting-shot-final.mp4   (progress in out/render.log)
```

It is resume-safe (skips existing `frames/f####.png`). Override workers with `WORKERS=4` and Chrome with `CHROME=/path/to/chrome-headless-shell`.

## Manual / QA

```sh
npm install
# Mac Metal (default). For cloud software GL only: export GPU=0
node render.mjs --stills stills 0 92 313 553 867 1197
node tests/zaudit-film.mjs 1 92 313 553 867 1197
```

## Notes

Final full render is on Ricardo's Mac per `skill/content-short/references/mac-render.md`. Music: Kevin MacLeod "Sneaky Snitch" (CC BY 4.0). SFX: Mixkit — see `CREDITS.md` and `audio/*/SOURCES.json`. VO is locked (`audio/vo.mp3`); do not regenerate.