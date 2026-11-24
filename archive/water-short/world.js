import * as THREE from './vendor/three.module.js';

export const vec = (x, y, z) => new THREE.Vector3(x, y, z);
export function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const rand = random(57819);
const pick = colors => colors[Math.floor(rand() * colors.length)];
const above = new THREE.Group();
const below = new THREE.Group();
const ledge = ['#967660', '#a78468', '#af8d70', '#bd9273'];
const leaves = ['#1d6d60', '#267e62', '#3b9267', '#699e63', '#81ad6d'];
const reef = ['#dc8161', '#e0ae77', '#e8a88b', '#bf6578', '#886c9a'];

function mesh(parent, geometry, tint, pos, scale, rotation) {
  const object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: tint}));
  object.position.set(...pos);
  if (scale) object.scale.set(...scale);
  if (rotation) object.rotation.set(...rotation);
  parent.add(object);
  return object;
}
const cube = new THREE.BoxGeometry(1, 1, 1);
const stone = new THREE.IcosahedronGeometry(1, 0);
const round = new THREE.IcosahedronGeometry(1, 1);
const block = (g, tint, x, y, z, width, height, depth, ry = 0) =>
  mesh(g, cube, tint, [x, y, z], [width, height, depth], [0, ry, 0]);
function rock(g, x, y, z, r, tint, height = .68) {
  return mesh(g, stone, tint, [x, y, z], [r, r * height, r * (.68 + rand() * .4)], [0, rand() * Math.PI, .2]);
}
function rod(g, a, b, radius, tint, thin = radius) {
  const p = vec(...a), q = vec(...b), d = q.clone().sub(p);
  const tube = new THREE.CylinderGeometry(thin, radius, d.length(), 5, 1);
  const object = mesh(g, tube, tint, p.clone().addScaledVector(d, .5).toArray());
  object.quaternion.setFromUnitVectors(vec(0, 1, 0), d.normalize());
  return object;
}
function sail(g, color, points) {
  const data = new THREE.BufferGeometry();
  data.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  data.computeVertexNormals();
  mesh(g, data, color, [0, 0, 0]);
}
function palm(x, y, z, height, bend) {
  for (let i = 0; i < 5; i++) {
    const a = i / 5, b = (i + 1) / 5;
    rod(above, [x + bend * a * a, y + height * a, z],
      [x + bend * b * b, y + height * b, z], .135 - .06 * a,
      i % 2 ? '#a37956' : '#8e624a', .13 - .07 * b);
  }
  const root = [x + bend, y + height, z];
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + .2;
    const length = height * (.38 + rand() * .23);
    const tip = [root[0] + Math.cos(a) * length, root[1] - .55, z + Math.sin(a) * length];
    const mid = [root[0] + Math.cos(a) * length * .48, root[1] + .46, z + Math.sin(a) * length * .48];
    const dx = Math.sin(a) * .33, dz = -Math.cos(a) * .33;
    sail(above, pick(leaves), [root, [mid[0] + dx, mid[1] - .12, mid[2] + dz], mid, mid, [mid[0] + dx, mid[1] - .12, mid[2] + dz], tip]);
    sail(above, pick(leaves), [root, mid, [mid[0] - dx, mid[1] - .18, mid[2] - dz], mid, tip, [mid[0] - dx, mid[1] - .18, mid[2] - dz]]);
  }
  for (let i = 0; i < 3; i++) rock(above, root[0] + (rand() - .5) * .36, root[1] - .12, z + (rand() - .5) * .35, .2, '#764e37', 1.1);
}

// The cove wraps around the action, with an open channel out to the horizon.
for (let i = 0; i < 64; i++) {
  const z = 11 - rand() * 38;
  const edge = -3.1 + Math.sin(z * .24) * 1.4;
  const x = edge - rand() * 7;
  const r = .78 + rand() * 2.6;
  rock(above, x, -.35 - rand() * .6, z, r, pick(ledge), .65);
  if (rand() < .65) rock(above, x - .28, .7, z, r * .8, pick(['#d6b27e','#e8c48b','#bc9a71']), .4);
}
for (let i = 0; i < 22; i++) {
  const x = -4.7 - rand() * 6, z = 9 - rand() * 27;
  if (i % 3 === 0) palm(x, .7, z, 2.9 + rand() * 2.6, (rand() - .42) * 1.8);
  for (let j = 0; j < 4; j++) {
    mesh(above, stone, pick(leaves), [x + rand(), .83 + rand() * .46, z + rand()], [.4, .3 + rand() * .55, .48]);
  }
}
for (let i = 0; i < 28; i++) {
  const x = -31 + rand() * 62, z = -31 - rand() * 19;
  rock(above, x, -.45, z, 1 + rand() * 5, pick(['#678479','#4c8b84','#75a091','#7faaa0']), .35 + rand() * .25);
}
for (let i = 0; i < 4; i++) palm(-6.2 + i * 3.3, .53, -29 + rand(), 2.5 + rand(), (rand() - .3) * 2);

// A weathered dock and a small lifeguard hut give the jump a physical starting point.
for (let i = 0; i < 18; i++) {
  block(above, pick(['#bd8159','#d59767','#d9a271','#aa7150']), -4.75 + i * .24, .6, .0, .221, .14, 2.23);
}
for (let i = 0; i < 5; i++) {
  for (const z of [-.94,.94]) block(above, '#845941', -4.64 + i * .97, .22, z, .19, 1.83, .2);
}
block(above, '#6d4436', -2.78, .35, 1.01, 4.48, .19, .15);
block(above, '#6d4436', -2.78, .35, -1.01, 4.48, .19, .15);
for (const x of [-1.82,-1.52]) block(above, '#b9d0b9', x, -.47, 1.07, .055, 1.82, .09);
for (let i = 0; i < 7; i++) block(above, '#b9d0b9', -1.67, -1.26 + i * .244, 1.08, .34, .055, .09);

const hutX = -7.2, hutZ = -6.8;
block(above, '#bd7355', hutX, 1.9, hutZ, 2.9, 2.4, 2.6);
for (let i = 0; i < 9; i++) block(above, i % 3 ? '#d18a5f' : '#c9825a', hutX, .8 + i * .265, hutZ + 1.32, 2.94, .238, .08);
block(above, '#394d4b', hutX + .32, 1.98, hutZ + 1.42, 1.29, .89, .09);
block(above, '#a6d3b2', hutX + .32, 1.98, hutZ + 1.49, 1.04, .663, .1);
block(above, '#f5c67f', hutX + .32, 1.98, hutZ + 1.55, .10, .70, .1);
block(above, '#e5b475', hutX + .32, 1.5, hutZ + 1.55, 1.38, .11, .32);
for (let i = 0; i < 10; i++) {
  const z = hutZ - 1.49 + i * .331;
  rod(above, [hutX - 1.81, 3.04, z], [hutX, 4.39, z], .17, pick(['#d99263','#c57754','#af6551','#e7a472']));
  rod(above, [hutX + 1.81, 3.04, z], [hutX, 4.39, z], .17, pick(['#d99263','#c57754','#af6551','#e7a472']));
}
sail(above, '#bb7556', [[hutX-1.7,3,hutZ+1.5],[hutX+1.7,3,hutZ+1.5],[hutX,4.37,hutZ+1.5]]);

for (let i = 0; i < 4; i++) {
  const x = 3 + i * 1.69, z = -4.2 - i * 2.3;
  mesh(above, round, i % 2 ? '#f5bc65' : '#e98862', [x, .04, z], [.19, .19, .19]);
}

// The seabed uses real Three.js meshes. It continues under the dock and out to the reef.
block(below, '#329296', 0, -4.65, -6, 110, .3, 110);
for (let i = 0; i < 92; i++) {
  const x = -15 + rand() * 35, z = 12 - rand() * 42;
  const r = .25 + rand() * (i > 45 ? 1.21 : 2.15);
  rock(below, x, -4.37, z, r, pick(['#378a90','#256778','#3b7c82','#466b76','#5ea8a1','#4ca299']), .5 + rand() * .38);
  if (i < 34) {
    const shade = pick(reef);
    for (let j = 0; j < 3; j++) {
      const base = [x + (rand() - .5) * .41, -4.1, z + (rand() - .5) * .7];
      const h = .26 + rand() * .92;
      const tip = [base[0] + (rand() - .5) * h, base[1] + h, base[2] + (rand() - .5) * h];
      rod(below, base, tip, .11, shade, .07);
      rod(below, [base[0],base[1]+h*.34,base[2]], [tip[0]+.29,tip[1]-.16,tip[2]-.23], .083, shade, .051);
    }
  }
  if (i % 3 === 0) {
    for (let j = 0; j < 8; j++) {
      const dx = (rand() - .5) * .8, dz = (rand() - .5) * .8;
      const h = .6 + rand() * 1.4;
      const shade = pick(['#187a72','#2e9c83','#4fa78a','#4cb699']);
      sail(below, shade, [[x+dx-.13,-4.47,z+dz],[x+dx+.15,-4.47,z+dz],[x+dx+.11,-4.47+h*.55,z+dz-.12],
        [x+dx-.13,-4.47,z+dz],[x+dx+.11,-4.47+h*.55,z+dz-.12],[x+dx-.24,-4.47+h*.55,z+dz-.12],
        [x+dx-.24,-4.47+h*.55,z+dz-.12],[x+dx+.11,-4.47+h*.55,z+dz-.12],[x+dx-.37,-4.47+h,z+dz-.34]]);
    }
  }
}
for (const z of [-.94,.94]) for (let j=0;j<5;j++) block(below, '#4b7770', -4.64+j*.97, -1.48, z, .2, 3.16, .2);

above.updateMatrixWorld(true);
below.updateMatrixWorld(true);

// Flatten static mesh triangles once for the Canvas 2D software rasterizer.
// Three.js remains responsible for the geometry and perspective camera.
export function triangles(group) {
  const result = [];
  const light = vec(-.7, 1.4, 1.0).normalize();
  group.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry;
    const p = geometry.attributes.position;
    const indices = geometry.index;
    const vertices = [];
    for (let i=0;i<p.count;i++) vertices.push(vec(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(object.matrixWorld));
    const color = object.material.color.clone().convertLinearToSRGB();
    for (let i=0;i<(indices ? indices.count : p.count);i+=3) {
      const points = [0,1,2].map(j => vertices[indices ? indices.getX(i+j) : i+j]);
      const center = points[0].clone().add(points[1]).add(points[2]).multiplyScalar(1/3);
      const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize();
      const lit = .70 + Math.max(0,normal.dot(light)) * .38;
      result.push({points,center,normal,color:[color.r * lit,color.g * lit,color.b * lit]});
    }
  });
  return result;
}
export const dryGeometry = triangles(above);
export const wetGeometry = triangles(below);
