// Beat + caption data for "The biggest games, 2000s to 2011" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 1247 → frames 0..1246.
export const FPS = 24;
export const FRAMES = 1247; // 51.958… s; VO is 51.957551 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based, contiguous).
// Species NOT reused from prior Shorts (quokka/red panda/axolotl/pangolin/lemur/
// capybara/wombat/hedgehog/ferret/sugar glider/otter/beaver/alpaca/chinchilla/
// meerkat/fennec/raccoon/wallaby/puffin/tortoise).
export const SHOTS = [
  { id: 'hook',     f0: 0,   f1: 92,   char: 'tapir',     booth: 'museum', label: 'SALES MUSEUM' },
  { id: 'question', f0: 92,  f1: 384,  char: 'tapir',     booth: 'museum', label: 'SALES MUSEUM' },
  { id: 'vice',     f0: 384, f1: 620,  char: 'flamingo',  booth: 'shop02', label: '2002 SHOP' },
  { id: 'guitar',   f0: 620, f1: 950,  char: 'armadillo', booth: 'living', label: '2007 LIVING' },
  { id: 'finale',   f0: 950, f1: 1247, char: 'platypus',  booth: 'launch', label: '2011 LAUNCH' },
];

// Word-exact caption groups (spoken text from script/spoken.txt / vo-words.json).
// Must spell: Grand Theft Auto: Vice City, Madden NFL 2003, Guitar Hero III: Legends of Rock,
// Madden NFL 08, Call of Duty: Modern Warfare 3, The Elder Scrolls V: Skyrim, 2002, 2007, 2011.
// f/end are 0-based (f_start-1 .. f_end-1).
export const CAPTIONS = [
  { f: 0,    end: 71,   text: 'The biggest games, 2000s to 2011', band: 'low' },
  { f: 92,   end: 142,  text: 'Which games earned the most in the United States', band: 'low' },
  { f: 152,  end: 209,  text: 'in the early 2000s, late 2000s,', band: 'low' },
  { f: 212,  end: 243,  text: 'and early 2010s?', band: 'low' },
  { f: 254,  end: 316,  text: 'Here\u2019s one annual sales leader from each period,', band: 'low' },
  { f: 322,  end: 368,  text: 'ranked by tracked full-game dollars.', band: 'low' },
  { f: 384,  end: 454,  text: 'Number one, 2002. Grand Theft Auto: Vice City', band: 'low' },
  { f: 469,  end: 550,  text: 'led the annual chart, ahead of Madden NFL 2003.', band: 'low' },
  { f: 560,  end: 620,  text: 'An open-world action game took the top spot.', band: 'low' },
  { f: 620,  end: 735,  text: 'Number two, 2007. Guitar Hero III: Legends of Rock', band: 'low' },
  { f: 735,  end: 798,  text: 'ranked first, ahead of Madden NFL 08.', band: 'low' },
  { f: 810,  end: 856,  text: 'Its guitar-controller bundle matters here', band: 'low' },
  { f: 856,  end: 936,  text: 'because a higher-priced bundle can generate more dollars per sale.', band: 'low' },
  { f: 950,  end: 1041, text: 'Number three, 2011. Call of Duty: Modern Warfare 3', band: 'low' },
  { f: 1041, end: 1060, text: 'finished first.', band: 'low' },
  { f: 1074, end: 1126, text: 'The Elder Scrolls V: Skyrim was second.', band: 'low' },
  { f: 1138, end: 1166, text: 'Across these three years,', band: 'low' },
  { f: 1175, end: 1240, text: 'three different genres led the same US sales chart.', band: 'low' },
];
