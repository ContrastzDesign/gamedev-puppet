// Shared helpers for the build-game Short (V1 look — no toon ink / signal colours).
export const W = 1080, H = 1920;

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lin = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeInOut = (t) => smooth(clamp(t));
export const hash1 = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
