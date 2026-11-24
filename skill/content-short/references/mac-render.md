# Final render on Ricardo's Mac

Target: `Ricardos-MacBook-Air.local`, machine id `8283ed40-1b26-401c-9d49-9dee2d929353`. Confirm this exact id through `ListMachines`, and don't choose a similarly named worker. Rendering on this personal computer is authorized for this video workflow only.

The order is: **feedback and scene QA, then the final Mac render, then technical file checks and delivery.** Don't start while a fix is pending. The default feedback route is inspecting the editable browser scene, not repeated full-film draft renders.

1. **Confirm everything is final and available locally:** the original VO, the current source code, the character and prop scene code, three.js and its addons vendored locally at the version the project uses, the Montserrat ExtraBold font file, the actual sound and media files (including gameplay clips for in-scene screens), and the frame-deterministic beat data.
2. **Transfer the minimal self-contained render package** from the box with the normal copy tool. Don't copy development caches, credentials, browser sessions, unrelated old projects, large unused libraries or new editor tooling.
3. **Reconfirm the Mac connection.** Use machine-targeted Read and Shell only for this render and its output, with the required approval prompts. Don't explore personal files or accounts, or install unrelated software. If the Mac is offline, report and wait rather than choosing another cloud worker.
4. **Render the frames.** Use the existing tested Metal frame-step and frame-worker setup (`--use-angle=metal`), with four workers on the M1 where available. Render the entire 1080×1920, **24 fps** film to a consecutive lossless image sequence. Scene state comes from the integer frame number, never the wall clock. Render settings:
   - pixel ratio 1;
   - outline `uWidth` 2.6 with `uRes` 1080×1920;
   - shadow map 2048, PCF;
   - antialias on.

   Each worker resets the simulation and silently steps frames 1..N before rendering its first frame N (see Determinism in `characters.md`). Then check that two neighbouring frames across a worker boundary match the single-worker result. No live browser recording and no partial start or end stand-ins.
5. **Encode.** Provide the exact VO, SFX, music and caption layers aligned to the same frame count. Encode the whole sequence on the Mac with ffmpeg in the existing tested configuration: H.264 CRF 18, yuv420p, AAC audio, faststart. Make sure every frame is present, and don't freeze over missing frames.
6. **Check and deliver.** Run `ffprobe` for the actual width and height, fps (24), the expected frame count and the audio duration. Compare against the VO length. Inspect representative decoded frames from the opening, a lime beat, a red beat, cuts, the freeze and the ending, and check that the last frame matches the first. Deliver the real output file or link, then stop production. After the final-render attempt, only technical failure recovery is allowed; creative feedback belongs before it.
