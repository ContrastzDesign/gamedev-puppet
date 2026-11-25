// Beat + caption data for "Why Does a Brand New Game Need an Update?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 1019 → frames 0..1018.
export const FPS = 24;
export const FRAMES = 1019; // 42.458… s; VO is 42.44898 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based, contiguous).
// Species NOT reused from prior Shorts (quokka/red panda/axolotl/pangolin/lemur/
// capybara/wombat/hedgehog/ferret/sugar glider/otter/beaver/alpaca/chinchilla/
// meerkat/fennec/raccoon/wallaby/puffin/tortoise/tapir/flamingo/armadillo/platypus).
export const SHOTS = [
  { id: 'hook',    f0: 0,   f1: 66,   char: 'shiba',    booth: 'bedroom', label: 'GAMER DEN' },
  { id: 'buy',     f0: 66,  f1: 301,  char: 'shiba',    booth: 'bedroom', label: 'GAMER DEN' },
  { id: 'why',     f0: 301, f1: 366,  char: 'shiba',    booth: 'bedroom', label: 'GAMER DEN' },
  { id: 'factory', f0: 366, f1: 485,  char: 'okapi',    booth: 'factory', label: 'DISC PRESS' },
  { id: 'gold',    f0: 485, f1: 591,  char: 'narwhal',  booth: 'studio',  label: 'GOLD MASTER' },
  { id: 'bugs',    f0: 591, f1: 700,  char: 'badger',   booth: 'studio',  label: 'BUG FIX' },
  { id: 'cert',    f0: 700, f1: 805,  char: 'mandrill', booth: 'cert',    label: 'CERT LAB' },
  { id: 'coaster', f0: 805, f1: 876,  char: 'coast',    booth: 'coaster', label: 'COASTER' },
  { id: 'grad',    f0: 876, f1: 1019, char: 'grad',     booth: 'coaster', label: 'GRAD' },
];

// Word-exact caption groups (spoken text from script/spoken.txt / vo-words.json).
// Must spell: disc (not disk), Call of Duty, 200 Gigabyte, going gold, Sony.
// f/end are 0-based (f_start-1 .. f_end-1).
export const CAPTIONS = [
  { f: 0,    end: 54,   text: 'Why Does a Brand New Game Need an Update?', band: 'low' },
  { f: 66,   end: 119,  text: 'Lets Say you buy the new Call of Duty on disc!', band: 'low' },
  { f: 129,  end: 150,  text: 'Before you can play,', band: 'low' },
  { f: 156,  end: 217,  text: 'it makes you download a 200 Gigabyte patch.', band: 'low' },
  { f: 228,  end: 290,  text: 'But why does a brand new game need fixing already?', band: 'low' },
  { f: 301,  end: 351,  text: 'Why not just put the finished game on the disc?', band: 'low' },
  { f: 366,  end: 422,  text: 'Millions of discs take weeks to print and ship.', band: 'low' },
  { f: 428,  end: 474,  text: 'So the game has to be done weeks early.', band: 'low' },
  { f: 484,  end: 524,  text: 'This is what you call going gold.', band: 'low' },
  { f: 533,  end: 583,  text: 'So your disc is the game from weeks ago.', band: 'low' },
  { f: 591,  end: 647,  text: 'But the team keeps fixing bugs until launch.', band: 'low' },
  { f: 647,  end: 726,  text: 'Those fixes become a patch, and Sony checks that too.', band: 'low' },
  { f: 736,  end: 795,  text: 'Fail one rule, and you start all over again.', band: 'low' },
  { f: 805,  end: 862,  text: 'This is why your disc is basically a coaster.', band: 'low' },
  { f: 876,  end: 944,  text: "The disc was finished. The game wasn't.", band: 'low' },
  { f: 950,  end: 1010, text: "Congratulations, you're now a true game developer!", band: 'low' },
];
