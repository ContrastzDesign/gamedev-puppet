// Beat + caption data for "Why Are There Two Minecrafts?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 919 → frames 0..918.
export const FPS = 24;
export const FRAMES = 919; // 38.269388 s
export const W = 1080;
export const H = 1920;

// Fresh cast: hamster, koala, panda, mole, lynx.
export const SHOTS = [
  { id: 'hook',     f0: 0,   f1: 52,   char: 'hamster', booth: 'bedroom', label: 'TWO?' },
  { id: 'farm',     f0: 60,  f1: 216,  char: 'hamster', booth: 'bedroom', label: 'FARM' },
  { id: 'merge',    f0: 228, f1: 273,  char: 'lynx',    booth: 'merge',   label: 'MERGE?' },
  { id: 'java',     f0: 284, f1: 402,  char: 'koala',   booth: 'java',    label: 'JAVA' },
  { id: 'bedrock',  f0: 402, f1: 468,  char: 'panda',   booth: 'bedrock', label: 'BEDROCK' },
  { id: 'parity',   f0: 478, f1: 599,  char: 'mole',    booth: 'yard',    label: 'PARITY' },
  { id: 'library',  f0: 612, f1: 754,  char: 'lynx',    booth: 'library', label: 'WORLDS' },
  { id: 'arena',    f0: 772, f1: 833,  char: 'hamster', booth: 'arena',   label: 'COMMENTS' },
  { id: 'finale',   f0: 838, f1: 919,  char: 'hamster', booth: 'store',   label: 'ONE BOX' },
];

// Word-exact caption groups from script/spoken.txt / vo-words.json.
// Capitalise proper noun "Minecraft"; write "it's" in normal case.
// f/end are 0-based (f_start-1 .. f_end-1).
/**
 * VO-timed camera landings (Ricardo content-short camera rules).
 * landF = 0-based arrival frame (0–4 frames before the named VO word).
 * kind never repeats consecutively. Moves are 12–30 frames.
 * aim = framing target inside the active booth.
 */
export const LANDINGS = [
  // hook — "Minecrafts?"
  { landF: 24,  len: 22, kind: 'push',   shot: 'hook',    aim: 'char',     frame: 'full' },
  // farm — redstone farm / Java / Bedrock / breaks / versions
  { landF: 65,  len: 18, kind: 'follow', shot: 'farm',    aim: 'tv',       frame: 'full' },
  { landF: 93,  len: 24, kind: 'pull',   shot: 'farm',    aim: 'javaSign', frame: 'full' },
  { landF: 126, len: 16, kind: 'whip',   shot: 'farm',    aim: 'bedSign',  frame: 'chest' },
  { landF: 148, len: 20, kind: 'drop',   shot: 'farm',    aim: 'char',     frame: 'chest' },
  { landF: 204, len: 26, kind: 'crane',  shot: 'farm',    aim: 'room',     frame: 'full' },
  // merge — merge / one
  { landF: 244, len: 18, kind: 'orbit',  shot: 'merge',   aim: 'pillars',  frame: 'full' },
  { landF: 261, len: 14, kind: 'low',    shot: 'merge',   aim: 'char',     frame: 'chest' },
  // java — Java / original code / consoles / phones
  { landF: 285, len: 14, kind: 'cut',    shot: 'java',    aim: 'crt',      frame: 'full' },
  { landF: 305, len: 20, kind: 'push',   shot: 'java',    aim: 'crt',      frame: 'chest' },
  { landF: 377, len: 16, kind: 'follow', shot: 'java',    aim: 'room',     frame: 'full' },
  { landF: 390, len: 18, kind: 'pull',   shot: 'java',    aim: 'char',     frame: 'full' },
  // bedrock — Bedrock / programming language
  { landF: 409, len: 16, kind: 'whip',   shot: 'bedrock', aim: 'devices',  frame: 'full' },
  { landF: 443, len: 22, kind: 'crane',  shot: 'bedrock', aim: 'char',     frame: 'chest' },
  // parity — feature / twice / match / parity
  { landF: 490, len: 18, kind: 'orbit',  shot: 'parity',  aim: 'scaffold', frame: 'full' },
  { landF: 511, len: 20, kind: 'drop',   shot: 'parity',  aim: 'scaffold', frame: 'full' },
  { landF: 548, len: 24, kind: 'push',   shot: 'parity',  aim: 'match',    frame: 'chest' },
  { landF: 586, len: 16, kind: 'low',    shot: 'parity',  aim: 'parity',   frame: 'chest' },
  // library — merge / worlds / mods / break / love
  { landF: 621, len: 18, kind: 'follow', shot: 'library', aim: 'shelves',  frame: 'full' },
  { landF: 655, len: 22, kind: 'pull',   shot: 'library', aim: 'worlds',   frame: 'full' },
  { landF: 665, len: 14, kind: 'orbit',  shot: 'library', aim: 'shelves',  frame: 'chest' },
  { landF: 707, len: 16, kind: 'whip',   shot: 'library', aim: 'lever',    frame: 'chest' },
  { landF: 728, len: 20, kind: 'push',   shot: 'library', aim: 'char',     frame: 'chest' },
  // arena — comments / fighting
  { landF: 789, len: 18, kind: 'drop',   shot: 'arena',   aim: 'banners',  frame: 'full' },
  { landF: 808, len: 22, kind: 'crane',  shot: 'arena',   aim: 'char',     frame: 'chest' },
  // finale — one / box / games / code
  { landF: 840, len: 14, kind: 'cut',    shot: 'finale',  aim: 'box',      frame: 'full' },
  { landF: 859, len: 18, kind: 'push',   shot: 'finale',  aim: 'box',      frame: 'chest' },
  { landF: 888, len: 20, kind: 'orbit',  shot: 'finale',  aim: 'towers',   frame: 'full' },
  { landF: 902, len: 16, kind: 'low',    shot: 'finale',  aim: 'towers',   frame: 'chest' },
];

export const CAPTIONS = [
  { f: 0,   end: 51,  text: 'Why Are There Two Minecrafts?', band: 'low' },
  { f: 60,  end: 104, text: 'Say your redstone farm works on Java.', band: 'low' },
  { f: 113, end: 158, text: 'Then you open Bedrock, and it breaks.', band: 'low' },
  { f: 172, end: 215, text: 'But why did they even make two versions?', band: 'low' },
  { f: 228, end: 272, text: 'And why not just merge them into one?', band: 'low' },
  { f: 284, end: 354, text: 'Well Java is the original code Minecraft was written in', band: 'low' },
  { f: 356, end: 401, text: "but doesn't run on consoles or phones,", band: 'low' },
  { f: 406, end: 467, text: 'so Bedrock was built in another programming language.', band: 'low' },
  { f: 478, end: 556, text: 'Now every feature gets built twice, and both have to match.', band: 'low' },
  { f: 565, end: 598, text: 'This is what you call parity.', band: 'low' },
  { f: 612, end: 691, text: 'Now if you merge them, millions of worlds and mods stop working.', band: 'low' },
  { f: 691, end: 753, text: "So you'd break the thing players love most.", band: 'low' },
  { f: 772, end: 832, text: 'This is why the comments are still fighting about it.', band: 'low' },
  { f: 838, end: 869, text: "It's one game on the box.", band: 'low' },
  { f: 875, end: 918, text: "But it's two games in the code.", band: 'low' },
];
