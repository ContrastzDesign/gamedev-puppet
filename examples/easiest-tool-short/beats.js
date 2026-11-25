// Beat + caption data for "The easiest tool for a first game" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 998 → frames 0..997.
export const FPS = 24;
export const FRAMES = 998; // 41.583… s; VO is 41.560816 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based, contiguous).
// Species NOT reused from prior Shorts (quokka/red panda/axolotl/pangolin/lemur/
// capybara/wombat/hedgehog/ferret/sugar glider/otter/beaver).
export const SHOTS = [
  { id: 'hook',     f0: 0,   f1: 68,  char: 'alpaca',     booth: 'workshop', label: 'FIRST GAME LAB' },
  { id: 'question', f0: 68,  f1: 239, char: 'alpaca',     booth: 'workshop', label: 'FIRST GAME LAB' },
  { id: 'twine',    f0: 239, f1: 478, char: 'chinchilla', booth: 'story',    label: 'TWINE' },
  { id: 'gdevelop', f0: 478, f1: 760, char: 'meerkat',    booth: 'logic',    label: 'GDEVELOP' },
  { id: 'nilo',     f0: 760, f1: 998, char: 'fennec',     booth: 'world3d',  label: 'NILO' },
];

// Word-exact caption groups (spoken text). Captions spell "Nilo" (VO says Neelo).
// Times from audio/vo-words.json → 0-based. band: 'low' (below feet; avoids signs/screens).
export const CAPTIONS = [
  { f: 0,   end: 52,  text: 'The easiest tool for a first game', band: 'low' },
  { f: 68,  end: 128, text: 'Which game-making tool is easiest to learn?', band: 'low' },
  { f: 144, end: 236, text: 'For a first project, the answer depends on what the game has to do.', band: 'low' },
  { f: 239, end: 294, text: 'Number one, Twine for branching stories.', band: 'low' },
  { f: 307, end: 352, text: 'Each passage holds a piece of the story.', band: 'low' },
  { f: 362, end: 405, text: 'Linking two passages creates a choice,', band: 'low' },
  { f: 412, end: 463, text: 'and a basic story requires no programming.', band: 'low' },
  { f: 478, end: 547, text: 'Number two, GDevelop for 2D game logic.', band: 'low' },
  { f: 556, end: 614, text: 'Its event editor pairs conditions with actions.', band: 'low' },
  { f: 614, end: 684, text: '“Player touches key” can trigger “open door.”', band: 'low' },
  { f: 696, end: 747, text: 'Beginners can read the rule directly in the editor.', band: 'low' },
  { f: 760, end: 832, text: 'Number three, Nilo for a first 3D game world.', band: 'low' },
  { f: 841, end: 900, text: 'You can type in a text description and it starts the build.', band: 'low' },
  { f: 908, end: 991, text: 'That gives beginners a way to practice playtesting before writing code.', band: 'low' },
];
