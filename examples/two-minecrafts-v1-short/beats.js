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
