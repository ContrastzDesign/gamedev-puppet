---
name: content-short
description: >-
  Use this when making Ricardo's narrated Jake YouTube Shorts: one continuous
  2.5D build with original drawn animals, checked-script-tab tracking, detailed
  3D worlds, automatic captions, pre-render fixes, and final 24-fps rendering on
  his Mac.
---
# Content Short — one film at a time

The complete tested engine, SVG animal rig, references, caption/audio tools and Mac-render helpers are in the shared working skill download (`content-short-complete.zip`). Read its `SKILL.md`, `feedback.md`, `references/drawn-characters.md`, `references/audio-captions.md`, and `references/mac-render.md` before building. Treat `$S` as that downloaded skill folder, not a separate old phase-based system.

## Script document tabs and ✅ completion status

- In Ricardo's **Scripts for Game Dev Puppet** Google Doc (`1RHjbTuqVWSASSzIQZPIpcWt55Osr9341zqoPAhVOSas`), a script-tab title beginning with **✅ means that video is COMPLETED AND POSTED**. Never pick it for a new film or think early tabs with a ✅ are still pending.
- Read the tab inventory EVERY time before selecting a new script or marking one complete. Choose the first **unticked** script tab for the next film unless Ricardo names another. Use the returned tab ID when reading/editing, never just a matching title.
- When a video is completed **and posted**, prepend **✅ plus one space** to that tab's existing name. Preserve the tab's exact title and use its exact tab ID; e.g. `Why WASD?` → `✅ Why WASD?`. Do not alter script content or add ✅ to its body.
- Merely generated, rendered or delivered videos are not posted yet, so leave their tab unticked until publication is genuine and verified. If current tools cannot rename a tab, say which tab needs ✅ instead of claiming it was marked. Verify the returned tab inventory after a successful rename.

## Non-negotiables from Ricardo (2026-11-06)

- Build **one current Short only**. Reuse the current project and existing render tools; add only what this script needs. No future-proof architecture, backwards-compatible migration, generalized platform, asset-management add-ons or separate phase orchestration.
- **No storyboard review phase, approval gallery or Kanban.** Make the shot and acting plan privately from the script and VO word timings; use simple current shot data only internally, not as an artifact Ricardo reviews.
- **Never use an image generator for the characters.** Actually draw original anthropomorphic **animal** SVG art: oversized rounded head, little round or species-shaped ears, simple muzzle/nose, tiny dot eyes, chunky little body, short paws/feet, simple clothing and muted warm colors. Ricardo's ten-animal traveller image is the current visual direction, not the former human silhouettes. Choose fitting species and original clothes for each script, not a copy of an existing reference animal. **Add sunglasses, hats, funny clothes and other outfits/accessories to fit the theme and moments of each video; draw these as simple original SVG shapes rather than keeping a generic uniform.** Simple SVG elements and thoughtful flat shading are desired—not human hand-authorship claims, generated image sheets, supplied pixel tracing or old 3D puppet models. Draw the faces/pose shapes yourself in the workflow.
- **Keep detailed 3D environments, meaningful props and real gameplay on in-scene screens.** Never plain/solid/void backgrounds. Background quality does not decrease just because characters are flat.
- **Captions automatically**, without asking for confirmation. Include them in pre-render composition and QA, time them to the VO, keep text exact and in the vertical safe zone.
- **No HyperFrames default/generated/substituted SFX.** Use the two existing sound-design/pacing reference videos and actual selected permitted recorded sounds; never procedural stand-in beeps, stings, generic pops or algorithmic noise generators.
- **Handle valid feedback before final full-film render.** Inspect/edit scene, artwork, captions and audio, and recheck affected frames before exporting one complete movie. No full-movie draft as default feedback and no pending known defects in the render.
- **Actual video uses exactly 24 fps, never 30 fps.** Set this in shot timing, transcription/caption mapping, animation data, scene/render config and ffmpeg. Held drawing styles must be scheduled within that clock without changing the output frame rate. All source visual actions, clocks, SFX and captions are a deterministic function of the same 24-fps frame. Do not carry an old 30-fps config into a new film; set explicit 24-fps production settings at its start. A still-frame art proof has no movie frame rate but must not become a 30-fps film.
- **Full final render is last and happens on Ricardo's connected MacBook Air**, exact `ListMachines` id `8283ed40-1b26-401c-9d49-9dee2d929353`. Transfer only minimal render payload. Frame by frame at 1080×1920, **24 fps**, lossless sequence + ffmpeg/captions/VO/mix. If his Mac isn't connected, report/wait instead of quietly using another worker.

## Sequence

1. Read script-tab titles; skip every ✅ completed/posted script. Lock the selected unticked script exactly; don't fact-check or rewrite. Generate only approved paid VO through box-held credentials. Its exact spoken transcript and word timings determine shot boundaries and final duration. Never estimate timings from a duration.
2. Internally derive shots, acting, staging and varied cameras, plus their 24-fps frame data. Start building immediately without storyboard/gallery/board work.
3. Source needed 3D environment props first from Poly Pizza/Poly Haven; reuse the existing scene. Build complete detailed worlds and relevant media/props. **Actually draw original SVG animals per current film.** No thin-limbed human protagonist and no generated art. **Theme each character with original sunglasses, hats, funny clothes or props that fit this video's topic/comedy; not the same uniform on every animal.** Use Ricardo's ten-animal reference only for simplified rounded geometry, tiny dot/oval eyes, very small expressions, big round head, small body/paws/feet and simple accessory shapes—not its exact combinations. Draw every needed expression/pose/mouth only.
4. Use a transparent SVG around 600×800 or other character-suited viewBox, roughly 25–70 intentional paths/ellipses, a soft round torso and large head, muzzle, small round ear shapes, distinct species anatomy, warm flat colors with at most simple flat darker/highlight shapes to imply gently rounded volume. No required heavy ink line, generic human zippers, tall skinny arms, small head or elongated rectangle. Rasterize the finished SVG to PNG; put it on the same 3D world camera-facing plane, grounded feet, real contact shadow, correct depth/scale and occlusion. No rigid 3D human mesh, no photo/source pixels, no faked full-scene illustration. Swap pose/expression shapes using VO-aligned 24-fps frames; not generic tweened cutout movement.
5. Add timed readable captions without asking and purposeful sparse actual SFX/music tied to meaningful actions/punchlines with VO dominant, music ducked. Use existing sound-rhythm references, not soundtracks to reproduce. Existing provenance and sound source rules apply.
6. Review the **editable film** before rendering: actual engine-rendered stills or limited focused motion diagnostics, never a complete draft movie. Check all shot starts, important actions/expressions, camera landings and ends, transitions, detailed environments, original character drawing, clipping/contact/occlusion, props/screens, caption spelling/wrapping/timing/safe zone, and sound placement/mix. Any valid feedback fixes are incorporated before final rendering. No known defects are deferred.
7. Render final whole movie only after all fixes, on Ricardo's connected Mac through the tested existing Metal frame-step/frame-worker path. Don't develop on user's computer: finish project code in cloud repository. Transfer minimal project assets/frame workers/VO/audio and needed local fonts/art; never personal sessions, editor toolchains, credentials or unrelated data. **Do not render the full movie in the cloud.** Render whole film deterministically at **24 fps**, not selective frames; then ffmpeg encode on Mac. No new render platform.
8. Verify technical output by ffprobe dimensions/**24 fps**/expected frames/audio duration and representative decoded captioned frames, then deliver finished video. Apply the ✅ tab status once the film is genuinely posted. No extra creative phase or board work.

## Quality gate

A shot isn't done on code availability. Character acting is readable, world space detailed, props meaningful, screen media real, captions present, sound supports rather than genericizes, and valid feedback actually fixed before Mac rendering. One finished caption ed 24-fps 2.5D Short—not a plan, partial render or code commit—is completion. A ✅ tab means its film is completed **and posted**.
