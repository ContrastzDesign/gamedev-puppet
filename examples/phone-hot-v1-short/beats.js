// Beat + caption data for "Why Does Your Phone Get Hot Playing Games?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 940 → frames 0..939.
export const FPS = 24;
export const FRAMES = 940; // 39.166667 s
export const W = 1080;
export const H = 1920;

// Fresh cast (not reused): coati, numbat, yak, gecko (chip+dev outfits), arctic fox.
export const SHOTS = [
  { id: 'hook',     f0: 0,   f1: 69,   char: 'coati', booth: 'living',   label: 'GAMER DEN' },
  { id: 'great',    f0: 69,  f1: 158,  char: 'coati', booth: 'living',   label: 'SMOOTH' },
  { id: 'cool',     f0: 158, f1: 275,  char: 'coati', booth: 'patio',    label: 'COOL DOWN' },
  { id: 'fan',      f0: 275, f1: 319,  char: 'numbat', booth: 'workshop', label: 'ADD A FAN' },
  { id: 'holes',    f0: 319, f1: 409,  char: 'numbat', booth: 'workshop', label: 'AIR HOLES' },
  { id: 'seal',     f0: 409, f1: 501,  char: 'yak',    booth: 'seal',     label: 'WATERPROOF' },
  { id: 'heat',     f0: 501, f1: 569,  char: 'yak',    booth: 'interior', label: 'HEAT TRAP' },
  { id: 'throttle', f0: 569, f1: 623,  char: 'chip',   booth: 'racetrack', label: 'SAFE MODE' },
  { id: 'dev',      f0: 623, f1: 780,  char: 'gecko',  booth: 'studio',   label: 'DEV DESK' },
  { id: 'warmer',   f0: 780, f1: 864,  char: 'fox',    booth: 'cabin',    label: 'HAND WARMER' },
  { id: 'finale',   f0: 864, f1: 940,  char: 'coati',  booth: 'living',   label: 'HOTTER' },
];

// Word-exact caption groups from script/spoken.txt / vo-words.json.
// Must spell: hand warmer (two words), app store, thermal throttling, "so it waterproof".
// f/end are 0-based (f_start-1 .. f_end-1).
export const CAPTIONS = [
  { f: 0,   end: 56,  text: 'Why Does Your Phone Get Hot Playing Games?', band: 'low' },
  { f: 69,  end: 147, text: 'Say your phone game runs great, then slows to a crawl.', band: 'low' },
  { f: 158, end: 218, text: 'To fix this, you only need to cool the phone down.', band: 'low' },
  { f: 229, end: 264, text: 'But why does it get so hot?', band: 'low' },
  { f: 275, end: 306, text: 'Why not just add a fan?', band: 'low' },
  { f: 319, end: 350, text: 'A fan needs air holes.', band: 'low' },
  { f: 364, end: 398, text: 'Holes let in water and dust.', band: 'low' },
  { f: 409, end: 449, text: 'So phones are sealed so it waterproof,', band: 'low' },
  { f: 458, end: 491, text: 'and the heat has nowhere to go.', band: 'low' },
  { f: 501, end: 560, text: 'Then the chip slows itself down to stay safe.', band: 'low' },
  { f: 569, end: 612, text: 'This is what you call thermal throttling.', band: 'low' },
  { f: 623, end: 690, text: "Now developers can't lower the heat, only the game.", band: 'low' },
  { f: 690, end: 765, text: 'They cut graphics and frame rate, and your game looks worse.', band: 'low' },
  { f: 780, end: 841, text: 'This is why your phone is a hand warmer with an app store.', band: 'low' },
  { f: 864, end: 892, text: "The game didn't get harder.", band: 'low' },
  { f: 901, end: 930, text: 'Your phone got hotter.', band: 'low' },
];
