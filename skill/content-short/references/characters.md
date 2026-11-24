# The googly-eye cast and its Three.js rig

`$S/assets/googly-cast.html` is a working build of everything below: six characters, the field world, toon ramp, outlines, blue shadows, eyes, pupil physics and acting. Serve the folder (`python3 -m http.server`) and open it to see the target. Copy its code; don't redesign it. It uses three@0.170.0 with the `OrbitControls`, `RoundedBoxGeometry` and `BufferGeometryUtils` addons.

The page runs on the wall clock and uses `Math.random`, which is fine for a viewer but not for a film. The changes a film needs are in **Determinism** below.

## Casting rules

- **The object stays the object.** Keep the real shape, proportions and details. Add two googly eyes and nothing else: no limbs, no drawn mouth, no eyebrows, no cartoon head, no blinks.
- **Its own features make the face.** A mug handle is an ear, a salt shaker's holes are freckles, a sponge's scrub pad is hair, a toaster's dial is a nose, and clock hands at 10:10 are a smile. Allow at most one costume accessory (a bow tie) for the whole cast.
- **Cast in threes,** from one room that suits the topic. Use either the same object in three colours, or three related objects. Examples:
  - kitchen: mug, salt shaker, sponge;
  - desk: mug, rubber duck, sticky-note pad;
  - breakfast: toaster, milk carton, alarm clock.
- **Keep cast colours away from lime, red and mint.**
- **They act on the explanation.** They watch it, react to it, and appear inside it: on in-scene screens, in projected images, in photos. To put them on an in-scene monitor, render them to a `WebGLRenderTarget`.
- **Bodies act as whole objects.** They pop or slide in with a dust puff, squash a little on landing, lean toward the action, tilt back on surprise, and huddle. A character can cross close to the camera as a foreground cameo while the hero object stays the focus.
- **Scale:** characters are about 0.8–1.6 units tall, and the hero object is bigger. Relative sizes can be compressed so the cast reads as a group.

## Rendering setup

```js
const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.3, 600);   // near 0.3, never lower: depth precision depends on it
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;        // default sRGB output, no tone mapping
scene.add(new THREE.AmbientLight(0xffffff, 0.45 * Math.PI));
const sun = new THREE.DirectionalLight(0xfff6ea, 0.55 * Math.PI);
sun.position.set(-6, 11, 7);                          // high front-left
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);                   // ortho box about ±12 around the action
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;

// Toon ramp: 3 steps, hard edges. The shadow step comes out about 23% darker than lit.
const ramp = new THREE.DataTexture(new Uint8Array([46, 139, 255]), 3, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o });

// Ground: unlit lime plus a ShadowMaterial layer on top, so shadows are solid blue.
const shadowLayer = new THREE.Mesh(new THREE.PlaneGeometry(48, 48),
  new THREE.ShadowMaterial({ color: 0x3d518c, opacity: 0.94 }));
shadowLayer.rotation.x = -Math.PI / 2; shadowLayer.position.y = 0.003; shadowLayer.receiveShadow = true;
Object.assign(shadowLayer.material, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });

// Z-fighting guard (see the Z-fighting section): no two faces may share a depth.
const LIFT = 0.005;
const decal = (mat, layer = 1) => Object.assign(mat, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 * layer });
```

Characters and props `castShadow` but don't `receiveShadow`; only the shadow layer receives. For indoor hatched shadows, replace the `ShadowMaterial` with a small shader that multiplies a screen-space diagonal hatch into the shadow term. This isn't built yet, so check it in a still before relying on it.

## Ink outlines: inverted hull, constant pixel width

One shared material for every outline:

```js
const outlineMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: { uRes: { value: new THREE.Vector2(1080, 1920) }, uWidth: { value: 2.6 }, uColor: { value: new THREE.Color(0x1c1c20) } },
  vertexShader: `uniform vec2 uRes; uniform float uWidth;
    void main() {
      vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec2 d = (projectionMatrix * vec4(normalize(normalMatrix * normal), 0.0)).xy;
      float l = length(d); if (l > 1e-5) d /= l;
      clip.xy += d * (uWidth * 2.0 / uRes) * clip.w;
      gl_Position = clip;
    }`,
  fragmentShader: `uniform vec3 uColor; void main() { gl_FragColor = vec4(uColor, 1.0); #include <colorspace_fragment> }`
});
```

- **Hull geometry:** clone the mesh geometry and delete every attribute except `position`. Run `mergeVertices(geo, 1e-3)` and `computeVertexNormals()` so hard-edged boxes get smooth normals and the hull doesn't split at corners. If the summed normals point inward, flip the winding. Cache one hull per geometry. Add the hull as a child mesh of the original, with `raycast` disabled. Copy `hullGeometry()` and `addOutline()` from `googly-cast.html`.
- **Width:** `uRes` is the drawing-buffer size in device pixels. `uWidth = 2.6 * min(W, H) / 1080`, which is 2.6 for the 1080×1920 film at pixel ratio 1.
- Flat decals (labels, pores, clock ticks) and clouds get no hull.
- **An outline must never lie on a surface.** If an outlined part's silhouette edge touches another face, its hull fights that face and the ink line breaks into dots. Outlined parts that sit on a surface (eyes, buttons) stand `LIFT` proud of it. An outlined rim around a face sits clear of it: the clock's bezel is 0.01 in front of the dial.
- **Creases:** the hull only draws silhouettes. For a major crease the hull misses (a lid seam, a panel line), add thin ink geometry: a dark box strip, or `LineSegments2` from `three/addons/lines/` with `linewidth: 2.6` in pixels. `LineSegments2` isn't in the reference build yet, so check it in a still.

## The googly eye

The eye is built in its local frame with +z out of the face. `R` is the eye radius.

| Part | Build |
|---|---|
| Puck | `CylinderGeometry(1, 1, 1, 40).rotateX(π/2).rotateZ(π/2)`, scaled to radius R and depth 0.3R, so its axis is z and the front cap's texture sits upright. Side colour `#d5d9d0`. It stands `LIFT` proud of the body (its back is at z = `LIFT`), so the hull's ink ring stays whole. |
| Face | The puck's own front cap, through a material array `[side, face, side]`. It isn't a disc laid on top, so it has nothing to fight. Canvas texture: eye white `#e6e8df` over a grey lower crescent `#c9d1cd`. Unlit (`MeshBasicMaterial`). |
| Pupil | Flat black `#121619` circle at radius 0.5R, `LIFT` in front of the face, with a `decal()` material. No shine dot. Travel to the rim is 0.46R. |
| Dome | Hemisphere scaled to R × R × 0.42R, sitting on the face, with a fresnel shader (white, alpha 0.6·(1 − \|n·v\|)²) and `depthWrite: false`. It only shows at the edge. |

**Placement:**
- Eye width (2R) is about 0.29 × the object's width, capped by height on wide objects.
- Eye centres sit about 1.45 eye-widths apart (1.25–1.85 across the reference cast).
- Eyes go on the main front face, centred, about a quarter of the way down. On short, wide objects use the main body, not a lid or pad.
- Give `flatEyes()` the surface's exact z. The eye adds its own `LIFT`.
- On round bodies, wrap the eyes onto the curve: angle `a = asin(gap / 2 / radius)`, position `(±sin(a)·radius, y, cos(a)·radius)`, `rotation.y = ±a`.

Tested placements from the reference build (units; `h` is height):

| Character | Body | R | Eye centres |
|---|---|---|---|
| Mug | Lathe, radius 0.42, h 1.0, half-torus handle | 0.12 | On the curve, gap 0.35, y 0.70 |
| Salt shaker | Lathe, radius about 0.31, h 1.05, steel cap with five holes | 0.09 | On the curve, gap 0.26, y 0.45 |
| Sponge | Rounded box 1.15 × 0.62 × 0.48, pad 0.15 on top sunk 0.005 into it, decal pores | 0.13 | Flat front, gap 0.48, y 0.40 |
| Toaster | Rounded box 1.6 × 0.98 × 0.9 sunk 0.02 into a 0.12 base, two slots half sunk, extruded toast | 0.15 | Flat front, gap 0.52, y 0.72 |
| Milk carton | Box 0.72 × 1.22 × 0.72, extruded gable roof sunk 0.01, a fin, and a decal "MILK" label | 0.105 | Flat front, gap 0.30, y 0.92 |
| Alarm clock | Cylinder r 0.55 with its axis on z and a cream front cap as the dial, bezel torus 0.01 forward, sunk ticks and hands, bells, legs | 0.12 | On the dial, gap 0.30, y 0.92 |

## Pupil physics

The offset `u` is in eye space, normalised so the rim is at 1. Constants: spring stiffness 350, damping 13, rim bounce 0.5, inertia 0.35 (divided by travel), gravity sag 50, own drift 0.07. The pupil settles in about 0.4 s (10 frames) with an overshoot.

```js
function stepEye(eye, target, dt, t) {
  const e = eye.userData;
  eye.getWorldPosition(wp);
  vel.subVectors(wp, e.prev).divideScalar(dt);
  acc.subVectors(vel, e.prevVel).divideScalar(dt);   // the eye's own acceleration
  e.prev.copy(wp); e.prevVel.copy(vel);
  if (acc.lengthSq() > 62500) acc.setLength(250);
  eye.getWorldQuaternion(q).invert();                // world to eye space
  acc.applyQuaternion(q);
  dir.subVectors(target, wp).applyQuaternion(q).normalize();
  grav.set(0, -1, 0).applyQuaternion(q);
  let tx = dir.x * 1.25 + 0.07 * Math.sin(t * 0.9 + e.phase);
  let ty = dir.y * 1.25 + 0.07 * Math.sin(t * 1.3 + e.phase * 1.7);
  const tl = Math.hypot(tx, ty); if (tl > 0.92) { tx *= 0.92 / tl; ty *= 0.92 / tl; }
  const inv = 0.35 / e.travel;
  e.v.x += (350 * (tx - e.u.x) - 13 * e.v.x - acc.x * inv + grav.x * 50) * dt;
  e.v.y += (350 * (ty - e.u.y) - 13 * e.v.y - acc.y * inv + grav.y * 50) * dt;
  e.u.x += e.v.x * dt; e.u.y += e.v.y * dt;
  const r = Math.hypot(e.u.x, e.u.y);
  if (r > 1) {                                      // hit the rim: clamp and bounce
    const nx = e.u.x / r, ny = e.u.y / r; e.u.set(nx, ny);
    const vr = e.v.x * nx + e.v.y * ny;
    if (vr > 0) { e.v.x -= 1.5 * vr * nx; e.v.y -= 1.5 * vr * ny; }
  }
  e.pupil.position.x = e.u.x * e.travel; e.pupil.position.y = e.u.y * e.travel;
}
```

**Look targets come from the beat map, not the mouse.** Give each character a frame-keyed list such as `{ f: 312, look: 'part:yawMotor' }`, `{ f: 360, look: 'camera' }` or `{ f: 410, look: 'char:salt' }`.
- Point both pupils at the subject: the lime part, the red problem, a character that's talking or reacting, or the camera on reaction and kicker beats.
- Between beats, let them wander: alternate between the camera, a cast mate and a nearby point every 40–100 frames. Choose these from the seeded random generator.

## Acting

Each body has springs for squash (`scale.y` with volume kept on x and z), tilt (rot x), lean (rot z) and yaw. A small helper steps them:

```js
const spring = (x, v, target, k, c, dt) => { v += (k * (target - x) - c * v) * dt; return [x + v * dt, v]; };
// yaw → target, k 40, c 9 · lean, k 60, c 8 · tilt → 0, k 90, c 7 · squash → 1 ± 0.012 breathing, k 260, c 9
```

- **Turn toward the look target:** `yawTarget = clamp(atan2(local.x, max(0.4, local.z)) * 0.4, -0.45, 0.45)`, and lean up to ±0.06 toward it.
- **Hop:** launch at `vy` 2.6–4.4 (heavier objects lower) under gravity 22. On landing, kick the squash velocity by `-min(6, impact * 0.85)`, add a random tilt kick, and spawn a dust ring.
- **Surprise:** a tilt kick of -2.4 plus a hop.
- **Shake:** rotate z by `sin(t * 46) * 0.07` for 0.9 s (22 frames), easing out over the last 6 frames.
- **Drop-in entrance:** start 3.6 units up plus 0.55 per character, so the landings stagger.
- **Signature gags from the reference build:** steam from the mug, salt from the shaker, bubbles from the sponge, toast popping from the toaster, a full spin for the carton, and the clock ringing (hammer, ring arcs, spinning hands). Reuse them on kicker beats.

## Signals on characters and parts

Give every part that can be named or flagged **its own material**, so a flash only touches that part. Store its base colour on the material and drive flashes as pure functions of the frame:

```js
const LIME = new THREE.Color(0xbbd935), RED = new THREE.Color(0xe84a2f);
function flashK(f, f0, hold = 18) {            // up 4, hold, fade 7
  const d = f - f0;
  return d < 0 ? 0 : d < 4 ? d / 4 : d < 4 + hold ? 1 : Math.max(0, 1 - (d - 4 - hold) / 7);
}
for (const m of part.mats) m.color.copy(m.userData.base).lerp(LIME, flashK(f, beat.f0));
const popScale = (d) => d < 5 ? 1.08 * (1 - (1 - d / 5) ** 2) : d < 7 ? 1.08 - 0.04 * (d - 5) : 1;   // pop-in over 7 frames
```

## Z-fighting ("Z flipping"): build rules and the final pass

Z-fighting happens when two surfaces sit at (almost) the same depth. They flicker and crawl between each other as the camera moves. It hardly shows in a still but is obvious in the film, so build to avoid it and then hunt for it as the last pass before the Mac render.

**Build rules.** The reference build follows all of these.
- **Camera depth range:** `near` 0.3, never 0.01–0.1, because depth precision depends almost entirely on near. Keep `far` no bigger than the sky dome plus the farthest camera distance (600 here). Don't turn on `logarithmicDepthBuffer`: it writes depth in the shader, which cancels every `polygonOffset`.
- **No face rests exactly on another.** `LIFT = 0.005` world units, sized for characters about 1 unit tall with the camera within about 26 units. For a bigger set, scale `LIFT` and the audit's `eps` with the farthest camera distance.
  - **Solid parts sink at least `LIFT` into what they sit on,** so the seam is an intersection. Examples: a roof on a carton, a toaster on its base, a knob on a body, ticks and hands on a dial, a monitor on a desk.
  - **Flush decals sit `LIFT` off the surface and also use `decal()`.** Examples: labels, pores, pupils, highlights, stickers, and gameplay screens on a bezel. A decal on a decal gets `decal(mat, 2)` and 2 × `LIFT`.
  - **Outlined parts on a surface stand `LIFT` proud instead of sinking,** so their ink rim never crosses the surface. The eyes are the main case.
- **Paint the face onto the part when you can.** Use a material array on the geometry's groups. The eye's face is the puck's front cap, and the clock's dial is the body's front cap, so there's one face fewer to fight.
- **Parts that overlap on one plane each get their own depth.** For example, the clock's hour and minute hands end at 0.191 and 0.2, with the centre cap at 0.21.
- **Hidden coplanar faces count too.** The mountains are open-ended cones, because their buried bases all shared one height.
- **Never flip faces.** A negative scale mirrors the winding, so faces cull and light inside out. Mirror the geometry and fix its winding, or build the other side. A closed mesh that only looks right with `DoubleSide` is inside out, so reverse its winding (for a lathe, reverse the profile). The hull code already flips inside-out hulls.

**The final pass** (step 9 in `SKILL.md`) comes after every other fix, because a remodel can break a pose or a contact.
1. **Audit.** Copy `assets/z-audit.js` next to the scene. Pose the scene at every beat start, since parts pop in and props move. At each one, run `zAudit(scene, { skip: [ground, shadowLayer, sky] })`, which reports these:
   - **coplanar:** same-facing faces closer than `eps`. Lift or sink one by at least `LIFT`; a decal also gets `decal()`.
   - **touching:** faces pressed back to back. A negative gap is a crack and a positive one is a shallow embed. Sink the part at least `LIFT`, or for an outlined part, stand it `LIFT` proud.
   - **mirrored:** a mesh with a negative scale. Rebuild it without one.

   Repeat until the audit returns `[]`. The reference build went from 108 findings to 0.
2. **Look.** The audit only checks flat faces and skips outlines. Render stills at the widest and closest camera distances the film uses, plus one grazing view across each face with decals (labels, dials, eyes, screens). Inspect them at 200%. Look for dotted or broken ink lines where parts meet, stripes or speckles where two colours share a surface, a decal that sinks into its surface, and holes where back faces show through.
3. **Motion.** Render a 24–48-frame diagnostic of the slowest push-in or orbit across the hero and the cast. This is a short check, not a draft movie. Compare consecutive frames: any patch that changes colour while the camera barely moves is a fight.
4. **Remodel, don't hide.** Fix the geometry, then repeat steps 1–3. Don't paper over a fight by adding `polygonOffset` to everything, thickening the outline, or avoiding the camera angle. Camera moves change after feedback, so the model has to be safe from any angle.

## Determinism (required for the film)

- **Fixed step.** Run the simulation at 24 fps with 4 substeps (`dt = 1/96`). Pose the scene from the beat map as a pure function of time, then step the body springs, update world matrices, step the eyes, and step the particles. Never read a clock.

  ```js
  for (let s = 1; s <= 4; s++) { const t = (f - 1 + s / 4) / 24; poseScene(t); stepBodies(1/96, t); scene.updateMatrixWorld(); stepEyes(1/96, t); stepParticles(1/96, t); }
  ```

- **Seeded randomness.** Replace every `Math.random` with a seeded generator (for example mulberry32), with one stream per character and one for particles. Eye phases come from the seed too.
- **Seeking.** Springs, pupils and particles carry state. A frame worker that starts at frame N must reset, then step frames 1..N without rendering, before it renders. This replay is cheap. Never jump straight to frame N with fresh state, or pupils snap and the chunks won't match.
- **Pure functions where possible.** Flashes, pop-ins, captions and camera paths are pure functions of the frame. Only springs, pupils and particles need the replay.
