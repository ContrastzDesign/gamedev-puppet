# getting-shot brief (doc tab position 35, t.rcq2ctolbmi1) — content-short Version 2

Title line: Why does getting shot in a game doesn't kill you in real life?
Upload title (Ricardo, pt156u): Why does getting shot in a game doesn't kill you
Length: 52.767347 s, video_end 1267 @ 24 fps exactly. 1080x1920.
Script is spoken word for word (script/spoken.txt = Doc tab text; no rewrite, no fact-check, no Nilo line; original wording such as "to top it of" and "like your shot" stays as written). No delivery tags were used; audio/body.json text equals spoken.txt.
Word timings: audio/vo-words.json (173/173 words aligned, faster-whisper medium.en; frames f=round(t*24)+1). Line timings: audio/vo-timing.json. Draft SRT: audio/captions-draft.srt (reference only; final captions are keyword spans).

## Beats (frames from audio/vo-timing.json) and problem-ladder roles
1. f1-75 HOOK / title question: "Why does getting shot in a game doesn't kill you in real life?"
2. f92-147 NAIVE scene: "Think about the last time you got shot in Call of duty?" (generic toon shooter on an in-scene monitor; NO Call of Duty logos/HUD/footage)
3. f162-211 PROBLEM: "Why didn't you feel the bullets go through your screen?" (red on the screen surface)
4. f228-298 TURN: "Games have a clever way of making it look like you got shot."
5. f313-565 FIX 1 + NAME: invisible line from the gun (raycast), invisible box around the body, "counts as a hit", "This is what you call a hit box." (lime flash on the box at "hit box")
6. f577-857 FIX 2 (tricking your brain): camera shakes, screen edges turn red, blood marks on screen (toon, non-gory splats), red arrow showing where the shot came from
7. f867-1101 FIX 3 (sound): sharp thud per hit, grunt/heavy breathing, heartbeat, muffled sound as health drops (show as visual waveform/health bar devices)
8. f1113-1186 RECAP: "All of these combined make your game feel like your shot." (all parts light up together, mint tick)
9. f1197-1261 KICKER / title answer: "But In real life, there's no respawn button." (generic respawn button prop; last frame matches first)
New maps, shots and cuts per beat are allowed and expected (e.g. desk/monitor set -> inside-the-game toon arena -> x-ray hit-box view -> sound/audio set), as long as each traces to a beat above. Something new every 24-48 frames.

## Style (Version 2)
Follow the attached content-short Version 2 skill (SKILL.md, references/style.md, references/characters.md, references/script-ladder.md, references/audio-captions.md, assets/googly-cast.html, assets/z-audit.js, assets/style-guide.html + assets/guide/*.jpg; the 41 guide frames are in content-short-v2.zip).
- Toon-3D Three.js world, 2-3 flat toon steps, even ink outlines (~2.6 px at 1080w), hard solid blue cast shadows #3d518c. Detailed sets, never a void. No Poly Haven photo textures or HDRIs, no bloom/DOF/lens flares/2D title stamps.
- Cast: 3 real household objects from one fitting room with two stuck-on googly eyes, built in Three.js from code (no limbs/mouths/eyebrows/blinks; pupils do the acting; at most 1 accessory across the cast). Do NOT use v1 drawn SVG animals. No image-generated or downloaded character models.
- Signal colours reserved: lime #bbd935 ("this part"), red #e84a2f (problem), mint #54d890 (solved). Never as ordinary prop colours. (Damage-red screen edges/arrow are problem signals and fit red.)
- Camera keeps moving (except deliberate freeze); cuts on beat start frames; last frame matches first.
- Captions: automatic verbatim keyword captions (lowercase except proper nouns/units, Montserrat ExtraBold 800, soft white glow, red problem words, one band at a time) timed to audio/vo-words.json.
- Sound: cleared licensed music + real recorded CC0 SFX only (thud, grunt, heartbeat fit the script), VO dominant (~-14 LUFS). No generated/procedural SFX.

## Final QA
Engine stills at every beat start/signal moment/caption change; run assets/z-audit.js at every beat start and fix all z-fighting before final render; ffprobe 1080x1920, 24 fps, 1267 frames, audio 52.77 s; blackdetect; contact sheet.

## Final render
Render online in the cloud at exactly 24 fps with GPU=0 (software rendering): 1080x1920, deterministic, H.264 CRF 18, yuv420p, AAC, split into .mp4.part* files under ~10 MB each. Ricardo reconfirmed online cloud rendering on 2026-11-24, overriding mac-render.md.

## Repo / PR
Toolkit & example repo: https://github.com/ContrastzDesign/gamedev-puppet. Branch from main and open the PR in ContrastzDesign/gamedev-puppet (Ricardo, 2026-11-24: Short PRs go there now; not nilo/jake-shorts). Reuse examples/gta6-bug-short/ render, mix and audit tooling (GPU=0) plus research/shirusekaii/; put this film under examples/getting-shot-short/.
