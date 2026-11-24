# Captions and purposeful sound

## Captions: automatic keyword captions, always

Generate them straight from the VO transcript and word timings, with no confirmation step. They're baked into the final picture; a sidecar SRT alone doesn't count.

**What a caption says:**
- **One short, verbatim span of what's being said**, usually 1–4 words: the named term ("yaw control"), the problem ("too much light"), the number with its unit ("608 mm²"), or the key noun. Never paraphrase, and never show words that weren't spoken. Spelling follows the script.
- Each caption appears on the frame its first word is spoken (from the word timings) and stays until the next caption, or 96 frames at most.
- Change captions every 48–96 frames. One caption at a time. Lines with nothing worth a keyword can go without one.
- Mapping from ladder beats: name gets the term, problem gets the problem words in red, number gets the number, and congratulations gets "you just built a [thing]". The full table is in `script-ladder.md`.

**How it looks**, measured on the 1080×1920 frame [caption-specimens]:

| Property | Value |
|---|---|
| Font | Montserrat ExtraBold 800, tracking -1%. Bundle the local font file (OFL, from Google Fonts) with the render payload. |
| Size | 76–80 px, which is 7.2% of the width. Long captions can run to 85% of the width on one line. |
| Case | Lowercase, except units and proper nouns ("608 mm²", "EUV", "WASD") |
| Colour | Ink `#1c1c20`; problem words red `#e8341f` |
| Glow | Soft white outer glow, 8–12 px at 50–70%. No box, no hard stroke, no drop shadow. |
| Bands | Top band 10–17% down (y 192–326) or lower band 65–73% down (y 1248–1402). Use whichever band the hero isn't in, never both at once. Stay clear of the Shorts bottom strip and right-hand button column. |
| Motion | Reveal left to right with a per-letter blur and fade over about 7 frames, staggered, and exit the same way. No bounce, scale or pop. Compute it as a pure function of the frame. |

QA: check the opening caption, long or fast words, every beat change, the final caption, spelling against the script, wrapping, the safe zone, and that no caption covers a face, the lime part or key action.

## Ricardo's two sound reference Shorts

- [How a Log Becomes a Raft — You Made It](https://www.youtube.com/shorts/KnZBe5wyIUA)
- [How Nature Can Expose Buried Bodies — Zack D. Films](https://www.youtube.com/shorts/C1dD5-OauvQ)

When you can, listen to them before designing the sound. Take their informative rhythm, their deliberate sounds on objects, actions and punchlines, and the way the emphasis follows the narration. They're pacing examples, not soundtracks to copy. Every effect or music file must be a permitted recorded source, with its provenance stored in the project. If Ricardo meant different raw reference files, ask for those exact files instead of reusing an unrelated finished movie or voice-over as sound material.

**Never use HyperFrames default, generated, synthetic or substituted SFX.** No procedural beeps, hums, whirs, stings, honks or jingles, and no generic repeated UI pops. A real recorded funny or themed sound is good, and silence is better than filler. Don't solve this by writing a sine or noise generator or pulling in another unreviewed library pipeline.

Good places for a sound in this style:
- part pop-ins and dust landings;
- the explode at the opening;
- a red problem beat;
- a lime naming beat (sparingly; not every one);
- the mint tick;
- character gags such as the toaster pop or the clock ring;
- the rewind badge.

Each has to be a real recorded file.

## Downloading songs with yt-dlp

Download music beds and songs with `yt-dlp`, which is installed with Homebrew at `/opt/homebrew/bin/yt-dlp`. Only download a track you're allowed to use: one that's free to use or licensed (YouTube Audio Library, Creative Commons, a no-copyright channel) or that Ricardo has the rights to. Keep its licence in the provenance.

```sh
yt-dlp --no-playlist -x --audio-format wav --audio-quality 0 \
  --write-info-json -o "audio/music/%(title)s [%(id)s].%(ext)s" "<URL>"
```

- Use WAV so trims and fades stay lossless until the final ffmpeg encode.
- `--write-info-json` keeps the source URL, uploader and description next to the file. Copy the URL, the artist and the licence into the project's provenance notes.
- To take only part of a long track, add `--download-sections "*1:05-1:50"`.
- If a download fails, run `brew upgrade yt-dlp` first, because YouTube changes often break old versions.

## Mix

VO leads. Choose meaningful audio events from the actions and punchlines, and put each effect's audible impact on its word or action frame. Align the transient peaks, not the file start, when a file has lead-in silence. Duck the bed under speech, trim tails, and listen through every transition for balance and doubling. The final measured output should be around -14 LUFS and at or below -2 dBTP, unless the project already has an approved target. This is sound selection, timing and editing, not procedural sound generation.
