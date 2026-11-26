// Beat + caption data for "Why Can't GTA VI Just Fix a Bug Overnight?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 1027 → frames 0..1026.
export const FPS = 24;
export const FRAMES = 1027; // 42.762449 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based, contiguous).
// Fresh cast (not reused): pika, aardvark, walrus, kinkajou, binturong + outfit variants.
export const SHOTS = [
  { id: 'hook',    f0: 0,   f1: 84,   char: 'pika',      booth: 'bedroom', label: 'GAMER DEN' },
  { id: 'cars',    f0: 84,  f1: 177,  char: 'pika',      booth: 'bedroom', label: 'GAMER DEN' },
  { id: 'code',    f0: 177, f1: 324,  char: 'aardvark',  booth: 'studio',  label: 'BUG FIX' },
  { id: 'upload',  f0: 324, f1: 377,  char: 'aardvark',  booth: 'studio',  label: 'UPLOAD' },
  { id: 'bridge',  f0: 377, f1: 472,  char: 'worker',    booth: 'harbour', label: 'HARBOUR' },
  { id: 'boats',   f0: 472, f1: 564,  char: 'walrus',    booth: 'harbour', label: 'INVISIBLE WALL' },
  { id: 'qa',      f0: 564, f1: 636,  char: 'kinkajou',  booth: 'qa',      label: 'QA LAB' },
  { id: 'cert',    f0: 636, f1: 769,  char: 'binturong', booth: 'cert',    label: 'CERT LAB' },
  { id: 'years',   f0: 769, f1: 841,  char: 'tired',     booth: 'years',   label: 'YEAR 10' },
  { id: 'finale',  f0: 841, f1: 958,  char: 'tired',     booth: 'years',   label: 'PROVE IT' },
  { id: 'grad',    f0: 958, f1: 1027, char: 'grad',      booth: 'years',   label: 'GRAD' },
];

// Word-exact caption groups from script/spoken.txt / vo-words.json.
// Must spell: GTA VI, rulebooks, 10 years, ten minutes, regression, Sony,
// "Congratulations, you're now a true game developer!"
// f/end are 0-based (f_start-1 .. f_end-1).
export const CAPTIONS = [
  { f: 0,    end: 70,   text: "Why Can't GTA VI Just Fix a Bug Overnight?", band: 'low' },
  { f: 84,   end: 167,  text: 'Say a bug makes every car in GTA VI fall through one bridge.', band: 'low' },
  { f: 176,  end: 234,  text: 'To fix this you only need one line of code.', band: 'low' },
  { f: 242,  end: 311,  text: 'But why does the patch take two weeks or even months?', band: 'low' },
  { f: 324,  end: 365,  text: 'Why not just fix it and hit upload?', band: 'low' },
  { f: 377,  end: 459,  text: 'To fix the bridge, and now boats under it hit an invisible wall.', band: 'low' },
  { f: 471,  end: 509,  text: 'Fixing one thing broke another.', band: 'low' },
  { f: 518,  end: 553,  text: 'This is what you call regression.', band: 'low' },
  { f: 564,  end: 626,  text: 'So testers replay the game, not just the bridge.', band: 'low' },
  { f: 636,  end: 691,  text: 'Then Sony checks it against their own rulebooks.', band: 'low' },
  { f: 691,  end: 758,  text: 'Fail one rule, and you start all over again.', band: 'low' },
  { f: 769,  end: 817,  text: 'This is why they take 10 years to build!', band: 'low' },
  { f: 841,  end: 879,  text: 'The fix took ten minutes.', band: 'low' },
  { f: 891,  end: 941,  text: "Proving it didn't break anything took two weeks.", band: 'low' },
  { f: 957,  end: 1015, text: "Congratulations, you're now a true game developer!", band: 'low' },
];
