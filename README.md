# Game Dev Puppet

A Claude skill and toolkit for making narrated YouTube Shorts about game development. Each film is a toy-like toon-3D world built in Three.js, with ink outlines, hard blue shadows and a cast of household objects with googly eyes. Every frame is a deterministic function of its frame number, rendered at exactly 24 fps.

## What's in the repo

| Path | What it is |
|---|---|
| [`skill/content-short/`](skill/content-short/SKILL.md) | The skill (version 2). `SKILL.md` is the workflow: script, voice-over, beat map, sets, cast, camera, captions, sound, review, z-fighting pass and render. `references/` holds the detailed rules; `assets/` holds the style guide, the character rig reference and the z-fighting audit. |
| [`examples/gta6-bug-short/`](examples/gta6-bug-short/README.md) | **An example film made with the skill:** "Why Can't GTA VI Just Fix a Bug Overnight?". It's the complete source of a finished 42-second Short, built by following `SKILL.md` step by step. |
| `research/shirusekaii/` | The style research the skill's look came from: a visual teardown, the style guide and the character lab. |
| `archive/` | Earlier work kept for reference: version 1 of the skill (drawn animals) and the water Short. Neither is used any more. |

## The example

`examples/gta6-bug-short/` is an example of what the skill produces, not a template generator. It was made from a locked script, an ElevenLabs voice-over and its word timings, a beat map, one Three.js workshop set with a diorama of the bug, three cast members (a mug, a rubber duck and a sticky-note pad), keyword captions, a sound mix, a QA pass and a z-fighting audit. The result is 1080×1920 at 24 fps, 1008 frames and 42.0 s long. Its README explains every file and how to rebuild the video.

## Not included

This repo is public, so third-party material stays on the author's machine and is gitignored:

- Reference frames from the shirusekaii channel (`research/shirusekaii/frames/`, `research/shirusekaii/guide/` and `skill/content-short/assets/guide/`). The style guide pages show missing images without them.
- `research/references/`, a folder of saved reference images and pages.
- The example's sound effects and music (`examples/gta6-bug-short/audio/sfx/` and `audio/music/`), which come from sound-effect packs and aren't cleared for redistribution. `mix.py` lists the file names it expects.
- Renders and QA output (`frames/`, `stills/`, `*.mp4`, `mix.wav`) and the packaged skill in `dist/`. All of it can be rebuilt.
- Secrets. The ElevenLabs API key is never in the repo: `vo.py` reads `ELEVENLABS_API_KEY` or a file named `ElevenLabs API Key.txt` in a folder above the repo.

## Requirements

Node 18 or later, Python 3, ffmpeg and a Chrome headless shell (set `CHROME` to its path). Rendering uses the GPU through ANGLE Metal on macOS; set `GPU=0` for software rendering.

## Licences

No licence has been chosen for this repo yet. Vendored third-party code keeps its own licence: three.js is MIT (`examples/gta6-bug-short/vendor/THREE-LICENSE.txt`) and the Montserrat caption font is OFL (`examples/gta6-bug-short/assets/Montserrat-OFL.txt`).
