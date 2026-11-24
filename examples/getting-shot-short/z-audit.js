// z-audit.js: the automatic half of the z-fighting ("Z flipping") final pass.
//
// It finds the places where two surfaces can share a depth and flicker:
//   coplanar  two faces from different meshes face the same way, overlap, and are less than eps apart
//             (a decal lifted too little, two boxes sharing a face, an eye resting on a body).
//   touching  two parts rest flat against each other, face to face, embedded less than eps
//             (a roof resting on a carton, a puck floating on a body). The inked hull of one
//             fights the other along the seam. A negative gap is a crack, and a positive one is too
//             shallow an embed.
//   mirrored  a mesh whose world matrix has a negative determinant (a scale of -1 on an axis).
//             Its winding is flipped, so its faces cull and light inside out.
// A pair is skipped when the two use different polygonOffset settings, because the depth buffer
// can then tell them apart. It's also skipped when both share one material, because a fight
// between identical colours can't be seen.
//
// Usage, after the scene is built and posed:
//   import { zAudit } from './z-audit.js';
//   console.table(zAudit(scene, { skip: [ground, shadowLayer, sky] }));
// An empty list means pass. Remodel everything it reports, then look at the stills as well,
// because this only checks flat faces. It doesn't see curved surfaces, which rarely fight anyway.
// eps is in world units. The default, 0.004, fits this rig: characters about 1 unit tall,
// camera near 0.3, never more than about 26 units from what it frames.
import * as THREE from 'three';

const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
const E1 = new THREE.Vector3(), E2 = new THREE.Vector3(), N = new THREE.Vector3();

// Group a mesh's world-space triangles into flat faces: same normal, same plane offset and same
// coarse cell. The cell keeps a ring's facets from merging into one box that covers its hole.
function flatFaces(mesh, minArea, cell) {
  const pos = mesh.geometry.attributes.position, idx = mesh.geometry.index, mw = mesh.matrixWorld;
  const count = (idx ? idx.count : pos.count) / 3, faces = new Map();
  for (let t = 0; t < count; t++) {
    const i = idx ? [idx.getX(3 * t), idx.getX(3 * t + 1), idx.getX(3 * t + 2)] : [3 * t, 3 * t + 1, 3 * t + 2];
    A.fromBufferAttribute(pos, i[0]).applyMatrix4(mw);
    B.fromBufferAttribute(pos, i[1]).applyMatrix4(mw);
    C.fromBufferAttribute(pos, i[2]).applyMatrix4(mw);
    N.crossVectors(E1.subVectors(B, A), E2.subVectors(C, A));
    const len = N.length();
    if (len < 1e-10) continue;
    N.divideScalar(len);
    if (mesh.matrixWorld.determinant() < 0) N.negate();
    const d = N.dot(A);
    const cx = Math.floor((A.x + B.x + C.x) / 3 / cell), cy = Math.floor((A.y + B.y + C.y) / 3 / cell), cz = Math.floor((A.z + B.z + C.z) / 3 / cell);
    const key = `${Math.round(N.x * 300)},${Math.round(N.y * 300)},${Math.round(N.z * 300)},${Math.round(d * 1000)},${cx},${cy},${cz}`;
    let f = faces.get(key);
    if (!f) faces.set(key, (f = { n: N.clone(), d, area: 0, box: new THREE.Box3() }));
    f.area += len / 2;
    f.box.expandByPoint(A).expandByPoint(B).expandByPoint(C);
  }
  return [...faces.values()].filter((f) => f.area >= minArea);
}

const offsetOf = (m) => {
  const mat = [].concat(m.material).find((x) => x.polygonOffset);
  return mat ? `${mat.polygonOffsetFactor}/${mat.polygonOffsetUnits}` : '';
};

function label(m) {
  const names = [];
  for (let o = m; o; o = o.parent) if (o.name) names.unshift(o.name);
  const mat = [].concat(m.material)[0];
  const col = mat && mat.color ? ` #${mat.color.getHexString()}` : '';
  const owner = m.userData.ch ? `${m.userData.ch.key}: ` : '';
  return `${owner}${names.join('/') || m.geometry.type}${col}`;
}

export function zAudit(root, { eps = 0.004, minArea = 2e-5, cell = 0.05, skip = [] } = {}) {
  root.updateMatrixWorld(true);
  const skipped = new Set();
  for (const s of skip) s && s.traverse((o) => skipped.add(o));
  const items = [];
  root.traverseVisible((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.outline || skipped.has(o)) return;
    if (!o.geometry || !o.geometry.attributes.position) return;
    items.push({ m: o, box: new THREE.Box3().setFromObject(o).expandByScalar(eps), faces: flatFaces(o, minArea, cell), off: offsetOf(o) });
  });

  const out = [];
  for (const it of items) {
    if (it.m.matrixWorld.determinant() < 0) out.push({ kind: 'mirrored', a: label(it.m), b: '', gap: '', note: 'negative scale: winding is flipped' });
  }
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const p = items[i], q = items[j];
      if (p.off !== q.off || p.m.material === q.m.material || !p.box.intersectsBox(q.box)) continue;
      let worst = null;
      for (const f of p.faces) {
        for (const g of q.faces) {
          const dot = f.n.dot(g.n);
          if (Math.abs(dot) < 0.9995) continue;
          const fb = f.box.clone().expandByScalar(eps * 0.5), gb = g.box.clone().expandByScalar(eps * 0.5);
          if (!fb.intersectsBox(gb)) continue;
          // Measure the planes' separation where the faces overlap, not at the world origin, so a
          // tiny angle between two faces far from the origin doesn't read as a gap.
          const o = fb.clone().intersect(gb).getCenter(B);
          const sf = f.n.dot(o) - f.d, sg = g.n.dot(o) - g.d;
          let kind, gap;
          if (dot > 0) { kind = 'coplanar'; gap = Math.abs(sf - sg); }
          else { kind = 'touching'; gap = -(sf + sg); }   // signed: how deep one is embedded in the other
          if (Math.abs(gap) >= eps) continue;
          const shared = fb.intersect(gb).getSize(A);
          const sorted = [shared.x, shared.y, shared.z].sort((a, b) => b - a);
          if (sorted[0] * sorted[1] < 1e-6) continue;   // edges or corners meeting, not faces overlapping
          if (!worst || (kind === 'coplanar' && worst.kind !== 'coplanar') || (kind === worst.kind && Math.abs(gap) < Math.abs(worst.gap))) worst = { kind, gap, n: f.n, at: o.clone() };
        }
      }
      const r3 = (v) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
      if (worst) out.push({ kind: worst.kind, a: label(p.m), b: label(q.m), gap: +worst.gap.toFixed(4), normal: r3(worst.n), at: r3(worst.at), note: worst.kind === 'coplanar' ? 'lift or sink by at least eps, or give the top one polygonOffset' : 'sink one part at least eps into the other' });
    }
  }
  return out;
}
