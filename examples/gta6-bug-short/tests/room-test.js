// Test harness for room.js: room + plain placeholders in the keep-clear spots, fixed lights/cameras.
import { THREE, W, H, toon, mesh, canvasTex, COL } from '../core.js';
import { buildRoom } from '../room.js';
import { zAudit } from '/content-short/assets/z-audit.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xff00ff);   // magenta: any void shows up
scene.add(new THREE.AmbientLight(0xffffff, 0.45 * Math.PI));
const sun = new THREE.DirectionalLight(0xfff6ea, 0.55 * Math.PI);
sun.position.set(-6, 11, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const SH = Number(new URLSearchParams(location.search).get('sh') || 12);
Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 1, far: 45 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

const screenTexture = canvasTex(512, 296, (x, w, h) => { x.fillStyle = '#8a9096'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f757c'; x.fillRect(20, 20, w - 40, 40); });
const { bulbMat, screenCenter, monitorGroup, room } = buildRoom(scene, { screenTexture });

// debug: ?hide=name,name hides room children by name
for (const n of (new URLSearchParams(location.search).get('hide') || '').split(',').filter(Boolean)) room.traverse((o) => { if (o.name === n) o.visible = false; });

// placeholders (the coordinator's props), standing on the mat top y 0.02
const ph = new THREE.Group(); ph.name = 'placeholders'; scene.add(ph);
const grey = toon(0x9a9a9a), dgrey = toon(0x777777);
const MT = 0.02;
ph.add(mesh(new THREE.BoxGeometry(4.7, 0.6, 3.3), grey, { p: [0, MT + 0.3, 0] }));                         // diorama
ph.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 24), dgrey, { p: [-1.8, MT + 0.5, 2.5] }));     // mug
ph.add(mesh(new THREE.SphereGeometry(0.45, 24, 16), dgrey, { p: [1.85, MT + 0.45, 2.45] }));            // duck
ph.add(mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.25, 24), dgrey, { p: [0.9, MT + 0.125, 3.3] }));     // upload button
ph.add(mesh(new THREE.BoxGeometry(0.75, 0.25, 0.75), dgrey, { p: [-2.0, MT + 0.125, -2.3] }));           // sticky-note pad
ph.add(mesh(new THREE.BoxGeometry(1.6, 1.35, 0.9), grey, { p: [3.1, MT + 0.675, -2.0], r: [0, -0.35, 0] })); // calendar
ph.add(mesh(new THREE.BoxGeometry(1.3, 0.25, 1.6), grey, { p: [3.3, MT + 0.125, 0.9] }));                // rulebook

// ---- checks ----
const ZONES = [
  { name: 'diorama', box: [-2.35, 2.35, -1.65, 1.65], ymax: 9 },
  { name: 'mug', c: [-1.8, 2.5], r: 0.6, ymax: 9 },
  { name: 'duck', c: [1.85, 2.45], r: 0.7, ymax: 9 },
  { name: 'button', c: [0.9, 3.3], r: 0.55, ymax: 9 },
  { name: 'pad', c: [-2.0, -2.3], r: 0.6, ymax: 1.0 },
  { name: 'calendar', obb: [3.1, -2.0, 0.8, 0.45, -0.35], ymax: 2.2 },
  { name: 'rulebook', box: [3.3 - 0.65, 3.3 + 0.65, 0.9 - 0.8, 0.9 + 0.8], ymax: 9 },
];
function inZone(z, p) {
  if (p.y <= 0.021 || p.y > z.ymax) return false;
  if (z.box) return p.x > z.box[0] && p.x < z.box[1] && p.z > z.box[2] && p.z < z.box[3];
  if (z.c) return Math.hypot(p.x - z.c[0], p.z - z.c[1]) < z.r;
  const [cx, cz, hx, hz, ry] = z.obb, dx = p.x - cx, dz = p.z - cz;
  // object rotation.y = ry: local x = dx cos + (-dz) sin ... (rotate world back by -ry)
  const lx = dx * Math.cos(ry) - dz * Math.sin(ry), lz = dx * Math.sin(ry) + dz * Math.cos(ry);
  return Math.abs(lx) < hx && Math.abs(lz) < hz;
}
scene.updateMatrixWorld(true);
const SKIPN = new Set(['desk-top', 'mat', 'floor', 'wall']);
const hits = new Map();
const v = new THREE.Vector3(), cen = new THREE.Vector3();
room.traverse((o) => {
  if (!o.isMesh || o.userData.outline || o.material.isShadowMaterial || SKIPN.has(o.name)) return;
  const pos = o.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
    for (const z of ZONES) if (inZone(z, v)) {
      let n = o; while (n.parent && n.parent !== room && !n.name) n = n.parent;
      const key = `${z.name} <- ${n.name || o.parent?.name || '?'}`;
      hits.set(key, (hits.get(key) || 0) + 1);
    }
  }
});
window.keepClear = [...hits].map(([k, n]) => `${k} (${n} verts)`);
const lampHead = room.getObjectByName('lamp-head');
const lb = new THREE.Box3().setFromObject(lampHead);
window.lampMinY = lb.min.y;
window.screenCenter = screenCenter.toArray().map((n) => +n.toFixed(3));
window.zaudit = zAudit(scene, { skip: [ph] }).map((r) => ({ ...r, gap: +(+r.gap).toFixed(4) }));

const camera = new THREE.PerspectiveCamera(38, W / H, 0.3, 200);
const VIEWS = {
  wide: [[0.2, 7.2, 15.2], [-0.6, 1.0, -0.6]],
  front: [[1.4, 5.4, 12.6], [0, 0.85, 0.3]],
  left: [[-1.8, 4.2, 9.4], [-1.9, 1.5, -1.6]],
  right: [[3.8, 4.0, 9.4], [2.7, 0.6, 0.5]],
  overview: [[0, 11, 26], [0, 0.5, -1]],
  top: [[0, 17, 3.5], [0, 0, -0.4]],
  pegboard: [[1.6, 3.4, 4.5], [1.3, 3.2, -4.4]],
  lamp: [[6.5, 3.5, 3], [4.3, 2.0, -2.8]],
  poster: [[-4, 4.5, 5], [-5.4, 3.5, -4.5]],
  under: [[0.5, -3, 12], [-1, -6, -2]],
  leftdesk: [[-7.5, 4.5, 6], [-4.5, 0.8, -1.8]],
  rightdesk: [[8.5, 4.0, 5.5], [4.8, 1.0, -1.5]],
};
window.renderView = (name, night = false) => {
  const [p, t] = VIEWS[name];
  camera.position.set(...p); camera.lookAt(...t);
  bulbMat.color.set(night ? 0xfff3c0 : 0xf4eedf);
  renderer.render(scene, camera);
};
window.views = Object.keys(VIEWS);
window.magentaCount = () => {
  const gl = renderer.getContext(), px = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let n = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] > 240 && px[i + 1] < 20 && px[i + 2] > 240) n++;
  return n;
};
window.glInfo = (() => { const gl = renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; })();
let tris = 0; room.traverse((o) => { if (o.isMesh && o.geometry.index) tris += o.geometry.index.count / 3; else if (o.isMesh) tris += o.geometry.attributes.position.count / 3; });
window.roomTris = tris;
window.roomReady = true;
