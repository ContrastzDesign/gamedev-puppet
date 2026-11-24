// Beat data for "Why Can't GTA VI Just Fix a Bug Overnight?" — 24 fps.
// Every frame number below comes from the VO word timings in audio/vo-stt.json
// (ElevenLabs speech-to-text on audio/vo.mp3), rounded to the nearest 24-fps frame.
export const FPS = 24;
export const FRAMES = 1008;            // 42.0 s: VO ends f968, then the sparkle dissolve loops to f0
export const FREEZE = [866, 898];      // "took two weeks": frames 867..897 hold the f866 pose (title answer)

// Keyword captions: verbatim spans, lowercase except proper nouns. A caption starts on the
// frame its first word is spoken and holds until the next caption (96 frames at most).
// red: true colours the whole span as the problem; an array colours only those words.
// band: 'top' (y 192-326) or 'low' (y 1248-1402), whichever the hero is not in.
export const CAPTIONS = [
  { f: 32, text: 'every car in GTA VI', band: 'top' },
  { f: 71, text: 'fall through one bridge', red: ['fall', 'through'], band: 'top' },
  { f: 150, text: 'one line of code', band: 'low' },
  { f: 215, text: 'two weeks or even months', band: 'top', end: 267 },
  { f: 295, text: 'hit upload', band: 'top', end: 334 },
  { f: 382, text: 'invisible wall', red: true, band: 'top', end: 406 },
  { f: 437, text: 'broke another', red: true, band: 'top' },
  { f: 483, text: 'regression', red: true, band: 'low' },
  { f: 526, text: 'replay the game', band: 'top' },
  { f: 594, text: 'Sony', band: 'top', end: 616 },
  { f: 649, text: 'fail one rule', red: ['fail'], band: 'top', end: 675 },
  { f: 747, text: '10 years', band: 'top', end: 779 },
  { f: 803, text: 'ten minutes', band: 'low', end: 828 },
  { f: 874, text: 'two weeks', band: 'top' },
  { f: 942, text: 'true game developer', end: 984, band: 'top' },
];
