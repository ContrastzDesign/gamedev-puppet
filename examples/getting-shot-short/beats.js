// Beat data for "Why does getting shot in a game doesn't kill you" — 24 fps.
// Frame numbers from audio/vo-words.json (f=round(t*24)+1) and audio/vo-timing.json.
export const FPS = 24;
export const FRAMES = 1267;           // video_end 1267 @ 24 fps (VO 52.767 s)
export const FREEZE = [1237, 1255];   // "no respawn button": hold pose briefly on the answer

// Keyword captions: verbatim spans from the VO. red = problem colour.
// band: 'top' or 'low' — whichever the hero is not in.
export const CAPTIONS = [
  { f: 12, text: 'getting shot', band: 'top' },
  { f: 49, text: "doesn't kill you", band: 'top', end: 75 },
  { f: 133, text: 'Call of Duty', band: 'top', end: 155 },
  { f: 182, text: 'bullets go through', red: true, band: 'top', end: 220 },
  { f: 245, text: 'clever way', band: 'low', end: 298 },
  { f: 331, text: "bullet isn't real", band: 'top', end: 360 },
  { f: 385, text: 'invisible line', band: 'top', end: 430 },
  { f: 449, text: 'invisible box', band: 'top', end: 500 },
  { f: 496, text: 'counts as a hit', band: 'low', end: 540 },
  { f: 553, text: 'hit box', band: 'low', end: 575 },
  { f: 604, text: 'tricking your brain', band: 'top', end: 640 },
  { f: 645, text: 'camera shakes', band: 'top', end: 680 },
  { f: 678, text: 'edges turn red', red: ['red'], band: 'top', end: 720 },
  { f: 721, text: 'blood marks', red: true, band: 'low', end: 770 },
  { f: 802, text: 'red arrow', red: true, band: 'top', end: 860 },
  { f: 889, text: 'the sound', band: 'top', end: 920 },
  { f: 913, text: 'sharp thud', band: 'top', end: 960 },
  { f: 972, text: 'grunts and breathes', band: 'low', end: 1020 },
  { f: 1022, text: 'health drops', red: true, band: 'top', end: 1055 },
  { f: 1054, text: 'heartbeat', band: 'top', end: 1090 },
  { f: 1089, text: 'muffled', band: 'low', end: 1112 },
  { f: 1124, text: 'feel like your shot', band: 'top', end: 1190 },
  { f: 1237, text: 'no respawn button', red: ['no'], band: 'top', end: 1260 },
];

// Beat start frames for z-audit and stills QA
export const BEAT_STARTS = [1, 92, 162, 228, 313, 385, 449, 553, 577, 645, 678, 721, 802, 867, 913, 972, 1022, 1054, 1113, 1197];
