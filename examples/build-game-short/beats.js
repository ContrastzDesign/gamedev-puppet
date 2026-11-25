// Beat + caption data for "Where should you build your game?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 1136 → frames 0..1135.
export const FPS = 24;
export const FRAMES = 1136; // 47.333… s; VO is 47.307755 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (0-based). Characters are NEW species
// (not quokka / red panda / axolotl / pangolin / lemur from gamer-sites).
export const SHOTS = [
  { id: 'hook',     f0: 0,    f1: 51,   char: 'capybara', booth: 'street',  label: 'GAME STREET' },
  { id: 'platform', f0: 51,   f1: 120,  char: 'capybara', booth: 'street',  label: 'GAME STREET' },
  { id: 'roblox',   f0: 120,  f1: 413,  char: 'wombat',   booth: 'blocks',  label: 'ROBLOX STUDIO' },
  { id: 'godot',    f0: 413,  f1: 804,  char: 'hedgehog', booth: 'open',    label: 'GODOT' },
  { id: 'nilo',     f0: 804,  f1: 1003, char: 'ferret',   booth: 'portal',  label: 'NILO' },
  { id: 'outro',    f0: 1003, f1: 1136, char: 'sugarglider', booth: 'portal', label: 'NILO' },
];

// Word-exact caption groups (spoken text). Captions spell "Nilo" (VO says Neelo).
// Times from audio/vo-words.json → 0-based. band: 'top' or 'low'.
// All captions sit in the lower band (below character feet) so they never collide
// with booth signs / screens — same placement as the Godot section.
export const CAPTIONS = [
  { f: 0,    end: 35,   text: 'Where should you build your game?', band: 'low' },
  { f: 51,   end: 102,  text: 'What’s the best platform for making a game?', band: 'low' },
  { f: 120,  end: 157,  text: 'Number one, Roblox Studio', band: 'low' },
  { f: 169,  end: 233,  text: 'by far the easiest platform to get started on.', band: 'low' },
  { f: 241,  end: 302,  text: 'It completely free to start making games and publishing,', band: 'low' },
  { f: 310,  end: 364,  text: 'But Roblox does take more than 70%', band: 'low' },
  { f: 373,  end: 398,  text: 'of your future earnings', band: 'low' },
  { f: 413,  end: 443,  text: 'Number two, Godot', band: 'low' },
  { f: 451,  end: 499,  text: 'it’s the complete opposite of roblox,', band: 'low' },
  { f: 506,  end: 552,  text: 'you can basically get everything for free', band: 'low' },
  { f: 555,  end: 604,  text: 'but it isn’t as easy to publish your game.', band: 'low' },
  { f: 613,  end: 696,  text: 'You still have to pay publishing fees on any platform you put your game on.', band: 'low' },
  { f: 708,  end: 785,  text: 'And depending on how big your game gets it can get pretty expensive!', band: 'low' },
  { f: 804,  end: 834,  text: 'Number three, Nilo', band: 'low' },
  { f: 842,  end: 899,  text: 'for a playable 3D world in a browser.', band: 'low' },
  { f: 910,  end: 994,  text: 'Even non-developers can describe a game, edit it, and publish a link.', band: 'low' },
  { f: 1003, end: 1078, text: 'That makes it a practical choice when the first release is a playtest', band: 'low' },
  { f: 1079, end: 1123, text: 'people should be able to join immediately.', band: 'low' },
];
