// Beat + caption data for "Which engine looks the most real?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 1253 → frames 0..1252.
export const FPS = 24;
export const FRAMES = 1253; // 52.208… s; VO is 52.192653 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based, contiguous).
// Species NOT reused from prior Shorts (quokka/red panda/axolotl/pangolin/lemur/
// capybara/wombat/hedgehog/ferret/sugar glider/otter/beaver/alpaca/chinchilla/
// meerkat/fennec).
export const SHOTS = [
  { id: 'hook',     f0: 0,   f1: 56,   char: 'raccoon',  booth: 'lab',    label: 'REALISM LAB' },
  { id: 'question', f0: 56,  f1: 284,  char: 'raccoon',  booth: 'lab',    label: 'REALISM LAB' },
  { id: 'unreal',   f0: 284, f1: 592,  char: 'wallaby',  booth: 'city',   label: 'CITY' },
  { id: 'unity',    f0: 592, f1: 901,  char: 'puffin',   booth: 'face',   label: 'FACE' },
  { id: 'budget',   f0: 901, f1: 1253, char: 'tortoise', booth: 'budget', label: 'BUDGET' },
];

// Word-exact caption groups (spoken text from script/spoken.txt / vo-words.json).
// Must spell: Unreal Engine 5, The Matrix Awakens, Nanite, Lumen, Enemies,
// High Definition Render Pipeline, sixty, 16.7.
export const CAPTIONS = [
  { f: 0,    end: 41,   text: 'Which engine looks the most real?', band: 'low' },
  { f: 56,   end: 122,  text: 'Which game engine comes closest to real-world footage?', band: 'low' },
  { f: 140,  end: 202,  text: 'Two real-time demos show what developers can achieve,', band: 'low' },
  { f: 212,  end: 265,  text: 'and one production constraint explains the difference.', band: 'low' },
  { f: 284,  end: 367,  text: 'Number one, Unreal Engine 5 for a city at street level.', band: 'low' },
  { f: 378,  end: 403,  text: 'In The Matrix Awakens,', band: 'low' },
  { f: 414,  end: 503,  text: 'Nanite handled highly detailed geometry and Lumen calculated lighting.', band: 'low' },
  { f: 515,  end: 583,  text: 'The player could move through the city while the engine rendered it.', band: 'low' },
  { f: 592,  end: 653,  text: 'Number two, Unity for a close-up face.', band: 'low' },
  { f: 653,  end: 736,  text: 'Its Enemies demo used the High Definition Render Pipeline,', band: 'low' },
  { f: 745,  end: 809,  text: 'detailed eye and skin shaders, and simulated hair.', band: 'low' },
  { f: 820,  end: 885,  text: 'Those details matter because the face fills the frame.', band: 'low' },
  { f: 901,  end: 939,  text: 'Number three, the frame budget.', band: 'low' },
  { f: 950,  end: 1073, text: 'At sixty frames per second, an engine has about 16.7 milliseconds to draw each frame.', band: 'low' },
  { f: 1085, end: 1180, text: 'A realistic city and a realistic face spend that budget on different work.', band: 'low' },
  { f: 1192, end: 1244, text: 'Both engines can produce photorealistic shots.', band: 'low' },
];
