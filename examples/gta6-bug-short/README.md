# Example: Why Can't GTA VI Just Fix a Bug Overnight?

This folder is an **example film made with the [content-short skill](../../skill/content-short/SKILL.md)**. It holds the complete source of one finished Game Dev Puppet Short, built by following the skill's sequence from a locked script to the final render. Use it as a worked reference, and reuse its render, mix and audit tools when you make the next Short.

- **Format:** 1080×1920, exactly 24 fps, 1008 frames (42.0 s), H.264 with AAC audio.
- **Look:** toon-3D workshop desk with a diorama of the game world, ink outlines, hatched blue shadows, and signal colours (lime means "this part", red means the problem, mint means solved).
- **Cast:** a mug (the developer), a rubber duck (eager, hits upload) and a sticky-note pad (the tester), each with googly eyes.

## The script

> Say a bug makes every car in GTA VI fall through one bridge. To fix this you only need one line of code. But why does the patch take two weeks or even months?
>
> Why not just fix it and hit upload?
>
> To fix the bridge, and now boats under it hit an invisible wall. Fixing one thing broke another. This is what you call regression. So testers replay the game, not just the bridge.
>
> Then Sony checks it against their own rulebooks. Fail one rule, and you start all over again. This is why they take 10 years to build!
>
> The fix took ten minutes. Proving it didn't break anything took two weeks. Congratulations, you're now a true game developer!

## Files

| File | What it does |
|---|---|
| `index.html` | Hosts the film canvas. `window.renderFrame(n)` draws frame `n`. |
| `beats.js` | Frame count, the freeze frame, and the keyword captions with their frame timings. |
| `film.js` | The film: diorama, cast, props, beat tables, camera rail and the per-frame pose. Seeking replays the simulation, so any frame renders the same every time. |
| `core.js` | Shared look: toon ramp, ink outlines, hatched blue shadow catchers, easing and signal timing. |
| `room.js` | The workshop room around the desk. |
| `overlays.js` | The 2D layer: captions, rewind and tick badges, night tint and the closing dissolve back to frame 0. |
| `render.mjs` | Headless Chrome render harness for QA stills or the full lossless PNG sequence. |
| `vo.py` | Generates the voice-over with ElevenLabs and writes the word timings. Takes are cached by text hash, so reruns don't re-bill. |
| `mix.py` | The final audio mix: voice-over, a music bed ducked under speech, and sound effects placed on their cue frames. |
| `z-audit.js`, `tests/zaudit-film.mjs` | The z-fighting audit, run at each beat start. |
| `tests/` | Test pages for the overlays and the room. |
| `vendor/` | three.js r170 (MIT). |
| `assets/` | The caption font, Montserrat (OFL). |
| `audio/` | `vo.mp3`, `vo-words.json` and `vo-stt.json`. The sound effects and music aren't in the repo (see below). |

## Rebuilding the video

```sh
npm install
export CHROME=/path/to/chrome-headless-shell   # defaults to Playwright's cache on macOS

node render.mjs --stills stills 0 150 300      # QA stills of chosen frames
node tests/zaudit-film.mjs 0 150 300            # z-fighting audit at chosen frames
node render.mjs --seq frames                    # all 1008 frames as lossless PNGs
python3 mix.py                                  # audio/mix.wav
ffmpeg -framerate 24 -i frames/f%04d.png -i audio/mix.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 -c:a aac -b:a 192k \
  -shortest -movflags +faststart gta6-bug-short.mp4
```

On an Apple M5 the full sequence renders in about 27 seconds. Check the result with ffprobe: 1080×1920, 24 fps, 1008 frames, 42.0 s of audio.

## What's missing from the public repo

- **Sound effects and music.** `mix.py` expects `audio/sfx/*.wav` and `audio/music/playful-quirky-orchestral.wav`, which come from sound-effect packs and aren't redistributed here. The `CUES` list in `mix.py` names every file and its cue frame. Without them you can still render the picture.
- **Raw ElevenLabs responses** (`audio/vo-take-*.json`). The voice-over and its timings are committed, so you don't need to run `vo.py` again. If you do, it needs `ELEVENLABS_API_KEY` or a file named `ElevenLabs API Key.txt` in a folder above the repo.
- **Renders** (`frames/`, `stills/`, the MP4 and `audio/mix.wav`). They're all rebuilt by the commands above.
