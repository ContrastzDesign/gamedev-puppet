---
name: content-short
description: >-
  Use this when making Ricardo's narrated Jake YouTube Shorts (Game Dev Puppet):
  toon-3D Three.js worlds and shots built to the beat sheet, googly-eye household-object
  characters, the checked-script-tab workflow, problem-ladder beat mapping,
  reserved signal colours, automatic keyword captions, fixes before render,
  and the final 24-fps render on his Mac.
---
# Content Short: googly-eye toon 3D, one film at a time

Version 2, 2026-11-23. The look comes from the shirusekaii Shorts: a toy-like toon-3D world with ink outlines and blue shadows. The cast is real household objects with stuck-on googly eyes, and colour explains what's happening. Version 1 (drawn SVG animals on camera-facing planes) is archived in this repo under `archive/content-short-v1-drawn-animals/`. Don't use it. A finished example film made with this version of the skill is in `examples/gta6-bug-short/`; reuse its render, mix and audit tools for the next Short.

`$S` is this skill folder. Read these before building:

| File | What it holds |
|---|---|
| `$S/references/style.md` | The look: rendering, palette, world kits, props, signal devices, camera, timing in frames |
| `$S/references/characters.md` | Casting rules and the Three.js rig: toon ramp, outlines, blue shadows, googly eyes, pupil physics, acting |
| `$S/references/script-ladder.md` | How to read a script as a problem ladder and turn each beat into a visible change. |
| `$S/references/script-writing.md` | Everything learned about scripts: Ricardo's short-script rules (about 100 words, three walls), the reference channel's findings, the idea bank, proofreading, staging a "Why not just…?" script, and delivery. Read before writing, rewriting or proofreading a script, which happens only when Ricardo asks. |
| `$S/references/audio-captions.md` | Keyword captions and sound rules |
| `$S/references/mac-render.md` | Final render on Ricardo's Mac |
| `$S/assets/googly-cast.html` | Working reference build of six characters in the target look. Serve the folder and open it to see the target. Copy the rig code from it. |
| `$S/assets/z-audit.js` | The z-fighting audit for the final pass (step 9). It lists faces that share a depth and meshes with flipped faces. |
| `$S/assets/style-guide.html` and `assets/guide/*.jpg` | The visual source of truth, with 41 native-resolution reference frames. When a look question isn't settled here, compare against these frames. |

## Script document tabs and ✅ completion status

- In Ricardo's **Scripts for Game Dev Puppet** Google Doc (`1RHjbTuqVWSASSzIQZPIpcWt55Osr9341zqoPAhVOSas`), a tab title starting with **✅ means that video is COMPLETED AND POSTED**. Never pick it for a new film, and don't assume early ✅ tabs are still pending.
- Read the tab inventory EVERY time before selecting a script or marking one complete. Choose the first **unticked** tab unless Ricardo names another. Use the returned tab ID for reads and edits, never just a matching title.
- When a video is completed **and posted**, prepend **✅ plus one space** to that tab's existing name, using its exact tab ID. Example: `Why WASD?` becomes `✅ Why WASD?`. Don't change the script content or add ✅ to its body.
- Generated, rendered or delivered videos aren't posted yet. Leave their tab unticked until publication is real and verified. If the tools can't rename a tab, say which tab needs the ✅ instead of claiming it was marked. Check the returned tab inventory after a rename.

## Non-negotiables

From Ricardo, 2026-11-06, carried over:

- Build **one current Short only**. Reuse the current project and render tools, and add only what this script needs. No future-proof architecture, migration layers, general platform, asset-management add-ons or separate phase orchestration.
- **No storyboard review phase, approval gallery or Kanban.** Make the beat map and shot plan privately from the script and VO word timings.
- **Captions automatically**, without asking. They're keyword captions now; see `audio-captions.md`.
- **No HyperFrames default, generated or substituted SFX.** Use real recorded, permitted sounds with provenance; silence beats filler.
- **Handle valid feedback before the final render.** Fix and recheck affected frames in the editable scene. No full-movie drafts as the default feedback route, and no known defects in the render.
- **Exactly 24 fps, never 30 or 60.** Ricardo reconfirmed this on 2026-11-23, although the reference channel runs at 60. Set 24 fps in shot timing, caption mapping, animation data, scene and render config, and ffmpeg. Every visual action, spring, particle, caption and sound is a deterministic function of the integer 24-fps frame number.
- **Final full render happens last, on Ricardo's MacBook Air**, `ListMachines` id `8283ed40-1b26-401c-9d49-9dee2d929353`, at 1080×1920, 24 fps. If it isn't connected, report and wait.

From the 2026-11-23 restyle:

- **The look is the style guide's**, in every set and shot. Toon shading with two or three flat steps, even ink outlines about 2.6 px at 1080 wide, and hard cast shadows in solid blue `#3d518c`. No flat backdrops, photo textures, realistic materials, bloom, depth of field, lens flares or 2D title stamps.
- **The cast are real household objects with two googly eyes**, built in Three.js from code: primitives, lathes, extrusions and rounded boxes. The eyes are the only addition: no limbs, mouths, eyebrows or blinks. The pupils do the acting. Never use an image generator or a downloaded character model for the cast.
- **Signal colours are reserved.** Lime `#bbd935` means "this part" (the one being named). Red `#e84a2f` means the problem. A mint `#54d890` tick means solved. Never use them as ordinary prop colours.
- **New maps, shots and cuts are fine if they fit the beat sheet.** From Ricardo, 2026-11-24: build entirely new sets, maps and shots whenever a beat needs them, and cut to another shot when that tells the beat better than a camera move. Every set, shot and cut must trace back to a beat in the beat map. Nothing goes in just for variety.
- **Keep every set detailed and the screens real.** Never a void or solid background. Game-dev topics show real gameplay on in-scene monitors and phones with toon bezels.
- **The camera never parks**, except on a deliberate freeze. The last frame matches the first.

## Sequence

1. **Lock the script.** Read the tab titles and skip every ✅ tab. Lock the chosen unticked script exactly; don't fact-check or rewrite it.
2. **Voice-over.** Generate only approved paid VO through the box-held credentials. Its exact transcript and word timings set the beat frames and the film's length. Never estimate timings from a duration.
3. **Beat map (internal).** Tag every sentence with its ladder role (naive version, problem, fix, mechanism, name, title answer, callback, congratulations, kicker). A "Say… / Why not just…?" script uses the short beats in `script-writing.md`, section 4, which map onto the same table. Then give each beat its set and shot, the visible change, signal device, camera move or cut, caption span and cast reaction from the mapping table in `script-ladder.md`. Aim for something new on screen every 24 to 48 frames. Start building right away.
4. **Worlds and props.** Build every set the beat map calls for. Start from a world kit in `style.md` (the workshop desk for most game-dev topics, the field for outdoor and physical ones), or build an entirely new map in the same look. Build the hero object or system so it can start at its naive version and gain one part per fix. Build props from primitives. Poly Pizza low-poly models are allowed if every material is converted to the toon ramp, outlined, and stripped of textures. No Poly Haven photo textures or HDRIs.
5. **Cast.** Cast three household objects from one room that suits the topic, with at most one accessory for the whole cast. Build them with the rig in `characters.md`. Point their pupils at whatever the beat is about: the lime part, the problem, or the camera on reaction beats.
6. **Camera and cuts.** Within a shot, use long overlapping eased moves of 72 to 192 frames: orbits, push-ins through x-ray walls, and pull-backs to wide. Rotate through three distances: wide, medium, and inside or close. Cut to another shot or set wherever the beat map has a cut, on that beat's start frame. Every shot keeps moving; hold still only on a freeze. End by dissolving back to the opening composition.
7. **Captions and sound.** Set keyword captions from the VO word timings automatically. Place sparse real SFX on meaningful actions, with the VO leading. Download songs and music beds with `yt-dlp`; the command and the licence rule are in `audio-captions.md`.
8. **Review the editable film before rendering.** Render engine stills at every beat start, every lime/red/mint moment, every camera landing, the first and last frames, and every caption change. Use short motion diagnostics only for pupils, pops and dust timing; never a full draft movie. Check against the quality gate below and fix everything valid first.
9. **Final pass: watch out for z-fighting ("Z flipping").** Do this last, after every other fix, because remodelling can break a pose or a contact. At each beat start, run `assets/z-audit.js` until it reports nothing. Then check stills at the closest and widest camera distances and at grazing angles across decals. Look for flicker, stripes, dotted or broken outlines where parts meet, sunken decals and flipped faces. Then render one short diagnostic of the slowest camera move. Remodel the geometry rather than hiding the problem: sink solid parts, lift decals with `polygonOffset`, and stand outlined parts proud. The rules and recipes are in `characters.md`, under "Z-fighting".
10. **Final render on the Mac.** Follow `mac-render.md`: the whole film, deterministic, 24 fps, lossless sequence, then ffmpeg.
11. **Verify and deliver.** Run ffprobe for 1080×1920, 24 fps, the expected frame count and audio duration. Inspect decoded frames. Deliver the file. Add the ✅ only once the film is actually posted.

## Quality gate

A shot isn't done just because the code runs. Before the Mac render, every item below has to be true:

- Every set is detailed, with the horizon line (outdoors) or a furnished interior (indoors). Nothing flat. Every set, shot and cut serves a beat in the beat map.
- Toon steps are visible but colours stay bright (the shadow step is only 15 to 25% darker). Outlines are even on everything, including glass.
- Every cast shadow is hard-edged and blue. Characters cast shadows but don't receive them.
- Lime, red and mint appear only as signals, each with the same meaning every time. Only the part being named goes lime.
- The characters stay real objects at real proportions. Eyes are off-white pucks with an ink rim and flat black pupils with no shine. Pupils lag, overshoot and settle in about 10 frames, and they look at the subject.
- Something new appears every 24 to 48 frames. The camera is always moving except on a freeze. The last frame matches the first.
- Captions are verbatim keyword spans, lowercase, in one band at a time, clear of the hero and the Shorts interface. Problem words are red. Spelling is checked.
- The sound supports the action without turning generic, and the VO stays dominant.
- No z-fighting: the audit is clean at every beat, and in the close and grazing stills nothing flickers or stripes. No outline breaks into dots and no face is flipped. The camera's near plane is at least 0.3.

Completion means one finished, captioned 24-fps Short, not a plan, a partial render or a code commit. A ✅ tab means its film is completed **and posted**.
