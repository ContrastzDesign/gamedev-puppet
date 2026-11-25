// Beat + caption data for "What websites do gamers visit the most?" — 24 fps.
// Frame numbers are 0-based render frames. VO word timings use 1-based f=round(t*fps)+1;
// so renderFrame = f_start - 1. video_end 731 → frames 0..730.
export const FPS = 24;
export const FRAMES = 731; // 30.4583 s; VO is 30.432653 s
export const W = 1080;
export const H = 1920;

// Shot windows from audio/vo-timing.json (converted to 0-based inclusive start, exclusive-ish end)
export const SHOTS = [
  { id: 'hook',   f0: 0,   f1: 75,  char: 'quokka',   booth: 'map',     label: 'WEB MAP' },
  { id: 'steam',  f0: 75,  f1: 196, char: 'redpanda', booth: 'library', label: 'PC LIBRARY' },
  { id: 'poki',   f0: 196, f1: 363, char: 'axolotl',  booth: 'arcade',  label: 'BROWSER PLAY' },
  { id: 'roblox', f0: 363, f1: 507, char: 'pangolin', booth: 'blocks',  label: 'BLOCK WORLD' },
  { id: 'twitch', f0: 507, f1: 731, char: 'lemur',    booth: 'live',    label: 'LIVE WATCH' },
];

// Word-exact caption groups (spoken text only). Times from audio/vo-words.json.
// band: 'top' or 'low' — keep off the character face.
export const CAPTIONS = [
  { f: 0,   end: 59,  text: 'What websites do gamers visit the most?', band: 'top' },
  { f: 75,  end: 106, text: 'Number five, Steam.', band: 'top' },
  { f: 117, end: 184, text: 'By far where all most of the best games are in!', band: 'low' },
  { f: 196, end: 230, text: 'Number four, Poki.', band: 'top' },
  { f: 234, end: 275, text: 'Its a games platform run in the browser.', band: 'top' },
  { f: 286, end: 348, text: 'It’s the place where people can play Mobile games on their browser!', band: 'low' },
  { f: 363, end: 416, text: 'Number three, roblox.com.', band: 'top' },
  { f: 425, end: 493, text: 'Probably the most played game platform of all time!', band: 'top' },
  { f: 507, end: 549, text: 'And finally Number two,', band: 'top' },
  { f: 556, end: 593, text: 'It’s not even a gaming platform.', band: 'top' },
  { f: 600, end: 701, text: 'It’s the only place where gamers can watch livestreams of every game being played!', band: 'low' },
  { f: 701, end: 730, text: 'Twitch', band: 'top' },
];
