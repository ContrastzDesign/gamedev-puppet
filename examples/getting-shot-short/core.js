// Shared toolkit for the GTA VI bug Short: look constants, toon ramp, ink outlines,
// hatched blue shadow catchers, seeded randomness and small easing helpers.
// Rig code copied from content-short/assets/googly-cast.html (toon, outlineMat, hullGeometry, mesh).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE, RoundedBoxGeometry };
export const W = 1080, H = 1920;

export const COL = {
  // signals (reserved: never ordinary prop colours)
  lime: 0xbbd935, red: 0xe84a2f, mint: 0x54d890, data: 0x2f6eb1,
  ink: 0x1c1c20, shadow: 0x3d518c, pupil: 0x121619,
  // workshop desk kit
  wall: 0xc5dcca, peg: 0xd2c5ad, floor: 0xd2c5ad, mat: 0x6f9fc0, desk: 0xb98d5e,
  // cast + props
  coral: 0xe06d58, cream: 0xe9e1d4, saffron: 0xe8b84a, steel: 0xc3cad1, plum: 0x8e5fa8,
  milk: 0xf1f2ee, sky: 0x79b4e3, lav: 0x9d78c4, white: 0xf7f7f2, dark: 0x3a3f46, bezel: 0x2c3038,
  glass: 0xcfe6f5, page: 0xf3ecd9, slate: 0x4a5a6a, beak: 0xf29a38,
  // diorama
  grass: 0x9ccd67, mound: 0x86bb5c, earth: 0xa9805c, base: 0xcaa57a, road: 0x4a4f58, water: 0x8cc8ea,
  peach: 0xf4c39a, aqua: 0x9fd3dc, butter: 0xf0dca0, palm: 0x3f7f3a, trunk: 0x8a6648, window: 0x56708f,
};

// ---------- small math ----------
export const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t) => 1 - (1 - t) * (1 - t);
export const easeIn = (t) => t * t;
export const lin = (a, b, x) => clamp((x - a) / (b - a), 0, 1);
export const sstep = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); };
export const V2 = (x, y) => new THREE.Vector2(x, y);
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// pure per-index noise in [0,1): same input, same output
export const hash1 = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

// ---------- signal timing (pure functions of the frame) ----------
// lime flash: up 4 frames, hold, fade 7
export function flashK(f, f0, hold = 18) {
  const d = f - f0;
  if (d < 0) return 0; if (d < 4) return d / 4; if (d < 4 + hold) return 1;
  if (d < 11 + hold) return 1 - (d - 4 - hold) / 7; return 0;
}
// part pop-in: 0 -> 1.08 -> 1 over 7 frames
export function popScale(d) {
  if (d < 0) return 0; if (d < 5) return 1.08 * (1 - (1 - d / 5) ** 2); if (d < 7) return 1.08 - 0.04 * (d - 5); return 1;
}
// part pop-out: small swell then shrink to 0 over 7 frames
export function popOut(d) {
  if (d < 0) return 1; if (d < 2) return 1 + 0.03 * d; if (d < 7) return 1.06 * (1 - easeIn((d - 2) / 5)); return 0;
}
export const popInOut = (f, a, b) => (f < b ? popScale(f - a) : popOut(f - b));

// ---------- toon ramp ----------
function makeRamp(vals) {
  const t = new THREE.DataTexture(new Uint8Array(vals), vals.length, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}
export const RAMP = makeRamp([46, 139, 255]);
export const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: RAMP, ...o });
export const inkMat = new THREE.MeshBasicMaterial({ color: COL.ink });

// ---------- ink outline (inverted hull, constant pixel width) ----------
export const outlineU = { uRes: { value: new THREE.Vector2(W, H) }, uWidth: { value: 2.6 }, uColor: { value: new THREE.Color(COL.ink) } };
export const outlineMat = new THREE.ShaderMaterial({
  uniforms: outlineU,
  side: THREE.BackSide,
  vertexShader: `
    uniform vec2 uRes;
    uniform float uWidth;
    void main() {
      vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normal);
      vec2 d = (projectionMatrix * vec4(n, 0.0)).xy;
      float l = length(d);
      if (l > 1e-5) d /= l;
      clip.xy += d * (uWidth * 2.0 / uRes) * clip.w;
      gl_Position = clip;
    }`,
  fragmentShader: `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
      #include <colorspace_fragment>
    }`,
});
const hullCache = new Map();
export function hullGeometry(geo) {
  let h = hullCache.get(geo.uuid);
  if (h) return h;
  h = geo.clone();
  for (const k of Object.keys(h.attributes)) if (k !== 'position') h.deleteAttribute(k);
  h = mergeVertices(h, 1e-3);
  h.computeVertexNormals();
  h.computeBoundingBox();
  const c = h.boundingBox.getCenter(new THREE.Vector3());
  const p = h.attributes.position, n = h.attributes.normal;
  let s = 0;
  for (let i = 0; i < p.count; i++) s += (p.getX(i) - c.x) * n.getX(i) + (p.getY(i) - c.y) * n.getY(i) + (p.getZ(i) - c.z) * n.getZ(i);
  if (s < 0 && h.index) {
    const idx = h.index.array;
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    h.index.needsUpdate = true;
    h.computeVertexNormals();
  }
  hullCache.set(geo.uuid, h);
  return h;
}
export function addOutline(m) {
  const o = new THREE.Mesh(hullGeometry(m.geometry), outlineMat);
  o.userData.outline = true;
  m.add(o);
  return o;
}
// mesh(geo, mat, { p:[x,y,z], r:[x,y,z], s:[x,y,z], shadow:false, line:false })
export function mesh(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  if (o.p) m.position.set(o.p[0], o.p[1], o.p[2]);
  if (o.r) m.rotation.set(o.r[0], o.r[1], o.r[2]);
  if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
  m.castShadow = o.shadow !== false;
  if (o.line !== false) addOutline(m);
  return m;
}
// a flat decal (no outline, no shadow), lifted with polygonOffset so it never z-fights its surface
export function decal(geo, mat, o = {}) {
  mat.polygonOffset = true; mat.polygonOffsetFactor = -2; mat.polygonOffsetUnits = -4;
  return mesh(geo, mat, { ...o, line: false, shadow: false });
}

// ---------- hatched blue shadows (indoor) ----------
// ShadowMaterial whose shadow term = flat blue tone + screen-space diagonal hatch lines.
export const hatchU = { uPeriod: { value: 11 }, uTone: { value: 0.3 }, uLine: { value: 0.4 } };
export const hatchMat = new THREE.ShadowMaterial({ color: COL.shadow, opacity: 1, depthWrite: false });
hatchMat.polygonOffset = true; hatchMat.polygonOffsetFactor = -1; hatchMat.polygonOffsetUnits = -2;
hatchMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, hatchU);
  sh.fragmentShader = 'uniform float uPeriod;\nuniform float uTone;\nuniform float uLine;\n' + sh.fragmentShader.replace(
    'gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );',
    `float sm = 1.0 - getShadowMask();
     float hd = fract((gl_FragCoord.x + gl_FragCoord.y) / uPeriod);
     float hl = smoothstep(0.0, 0.1, hd) * (1.0 - smoothstep(0.36, 0.46, hd));
     gl_FragColor = vec4( color, sm * (uTone + uLine * hl) );`);
};
// a shadow-catching plane (receives only). Default orientation: horizontal, facing up.
export function catcher(w, h, { p = [0, 0, 0], r = [-Math.PI / 2, 0, 0] } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), hatchMat);
  m.position.set(p[0], p[1], p[2]); m.rotation.set(r[0], r[1], r[2]);
  m.receiveShadow = true; m.castShadow = false;
  return m;
}

// ---------- layers ----------
// Layer 1 = "the game": what the in-scene monitor's gameplay camera sees (the diorama only).
export const GAME = 1;
export function inGame(obj) { obj.traverse((o) => o.layers.enable(GAME)); return obj; }

// ---------- canvas textures ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData.canvas = c; t.userData.ctx = x;
  return t;
}
export const hex = (c) => '#' + c.toString(16).padStart(6, '0');
