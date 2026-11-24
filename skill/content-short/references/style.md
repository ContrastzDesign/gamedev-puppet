# The look

Distilled from `$S/assets/style-guide.html`, which was built from four shirusekaii Shorts. The frame names in brackets are files in `$S/assets/guide/`. Open them when a rule isn't enough.

All timings are given in frames at **24 fps**. The reference videos run at 60 fps; the seconds were converted and rounded.

## Rendering

| Element | Rule |
|---|---|
| Shading | `MeshToonMaterial` with a 2–3 step ramp and hard edges between steps. The shadow step is only 15–25% darker than the lit step, so colours stay bright. No specular highlights, except one soft band on glass and chrome. [detail-1, detail-4] |
| Outlines | Silhouette plus major creases, about 2–3 px at 1080 wide (we use 2.6). Near-black `#1c1c20`, or dark brown on wood. Even weight with no taper. Small parts keep the same pixel width, so they read slightly bolder. [detail-2] |
| Cast shadows | Outdoors: one sun, hard edges, solid `#3d518c` at about 94% opacity. Indoors: a tone about 10% darker plus diagonal hatch lines. [detail-3] |
| Lighting | One warm-white key light (`#fff6ea`) from high front-left, plus a bright ambient fill so nothing goes dark. Minimal ambient occlusion. |
| Texture | Very light: faint noise on big flat areas, hatch lines on metal trim, loose ink grain strokes on wood. Never photographic. |
| Glass and x-ray walls | Pale blue (around `#b9d6ee`) at 40–60% opacity. Keep the outline and add one or two lighter ring bands. |
| Atmosphere | Slight haze toward the horizon (fog from about 60 to 230 units). No depth-of-field blur, bloom or lens effects. Everything stays crisp at phone size. |

## Palette

Signals are **reserved**. Never use them on ordinary props or cast members.

| Role | Colour |
|---|---|
| Lime: the part being named, useful forces | `#bbd935` |
| Problem red: faulty part, bad force | `#e84a2f` (caption problem words `#e8341f`) |
| Mint: the "solved" tick | `#54d890` |
| Data blue: counters, weight arrows | `#2f6eb1` |
| Ink: outlines, captions, dimension lines | `#1c1c20` |

| Outdoor world | | Indoor world | |
|---|---|---|---|
| Sky, top | `#76a2db` | Mint wall | `#c5dcca` |
| Sky, horizon haze | `#d3e6f1` | Pegboard, floor wood | `#d2c5ad` |
| Field | `#9ccd67` | Cutting mat | `#6f9fc0` |
| Field shade, tufts | `#80a857` (tuft blades `#3e6b2a`) | Cleanroom white | `#eef0f1` |
| Cast shadow | `#3d518c` | | |
| Storm sky | `#5d6973` | | |

The cast colours tested in `googly-cast.html` are coral `#e06d58`, cream `#e9e1d4`, saffron `#e8b84a`, steel `#c3cad1`, plum `#8e5fa8`, milk white `#f1f2ee` and sky `#79b4e3`. The eye white is `#e6e8df` and the pupil `#121619`.

## World kits

Use as many sets as the beat sheet needs. Start from these kits or build an entirely new map in the same look: toon ramp, ink outlines, blue shadows, never a void. Cut between sets or shots whenever a beat calls for it.

- **Field** [world-field]: a gradient sky, puffy toon clouds, flat grey-blue mountains on a thin black horizon line, and a lime field with ink grass tufts. Lollipop trees and clover bushes are outlined. `googly-cast.html` builds this kit.
- **Field plus town** [world-town]: roads with white dashes, low buildings, toy cars and power poles. White streaks show moving air.
- **Workshop desk** [world-indoor]: mint wall, beige pegboard with tools, a wooden desk with a blue grid cutting mat, a monitor, a lamp and a mug. Shadows are hatched. **This is the default for game-dev topics.** Monitors and phones show real gameplay inside a toon bezel.
- **Cleanroom** [world-cleanroom]: near-white floor grid, yellow safety lines and a pale blue wall stripe. Reach it only by a fade to white.
- **Storm variant** [world-storm]: the same set under a grey sky with diagonal white rain streaks. It's a weather change on the same set. A time skip can use it, or cut to a new map.

## Objects and props

- Use true proportions with simplified detail. Keep the real silhouette and two or three signature details (brass corners, hex nuts, screw heads, fins), then stop. Round or chamfer every edge a little.
- Materials read by colour, not texture. Wood is brown with ink grain, metal is flat grey with one highlight band, and glass is pale blue and translucent.
- In medium shots the hero object fills 40–60% of the frame width and sits just below centre.
- Cutaways are clean slices with flat interior colours [sig-cutaway].
- Analogy props (a car, a hand, a burger, a school bus) live in the same world with the same render, never as photos or 2D clip art [sig-analogy, sig-scale].
- Labels are 3D placards: small white plates with black caps text, attached to the object ("PINHOLE", "×1,000,000").
- Software ideas become physical toy objects in the same world: a keyboard whose keys pop in, a stack of labelled blocks, a monitor showing real gameplay.

## Signal devices

Use each device with the same meaning every time, so viewers learn them in the first 20 seconds.

| Device | Meaning and build | Timing at 24 fps |
|---|---|---|
| Lime part [sig-lime-part] | "This part" (the one being named). Lerp the part's material colour to lime but keep the toon ramp and outline, then fade back. | Up 4 frames, hold 12–24, fade 7 |
| Lime system [sig-lime-mass] | The same for a whole assembly. Inner detail stays readable. | Same |
| Red part or arrow [sig-red-part] | "The problem". Tint the faulty part red, or push it with a chunky red 3D arrow. | Until the fix lands |
| Red zone [sig-red-zone] | An invisible problem area, shown as a translucent red volume | Until the fix lands |
| Mint tick [sig-tick] | "Solved". A tick in a circle draws on and the whole frame takes a slight green tint. **Only for the final "it works".** | Draw-on about 10 frames |
| X-ray wall [sig-xray] | A wall turns to pale glass, outline kept, so the camera can push inside | About 12 frames to fade |
| Light as rods [sig-rods] | Rays are yellow and blue rods with white ball ends | n/a |
| Light cones [sig-cones] | Rods become translucent cones when focusing matters. Flat colour, no glow. | n/a |
| Force arrows [sig-arrows] | Chunky 3D arrows: lime for the useful force, blue for its components. Airflow is dashed lines. | Pop in like a part |
| Comparison arcs [sig-arcs] | A lime arc against a red arc: bigger against smaller in the same time | n/a |
| Inset bubble [sig-bubble] | A white circle with an ink rim and a dotted leader line, holding a mini diagram beside the real part. It pops in with no cut. | Pop 6–8 frames |
| Counter [sig-counter] | A big data-blue number with a tiny label, ticking upward in place | n/a |
| Dust puffs [sig-dust] | White and grey toon spheres at contact points whenever something lands, swaps or appears | Life 10–14 frames |
| Explode and assemble [sig-explode] | The opening blows the finished object apart, then builds it up from its simplest part | Explode about 17 frames |
| Smash [sig-smash] | Shatter into chunky low-poly bits for "a huge number of parts" | n/a |
| Rewind badge [sig-rewind] | A dark rounded badge with a white ◀◀. Undo a failed attempt, then play the action backwards. | n/a |
| Freeze [sig-freeze] | All motion stops and the camera holds still. **The only legal camera hold.** Use it for the title's answer. | As long as the line |
| Spotlight [sig-spot] | A pale yellow cone from above singles out one thing | n/a |
| Light effects [sig-plasma] | Lasers, plasma and beams are flat translucent shapes in one hue, with no bloom | n/a |
| Dimension lines [sig-dims] | Ink lines with end ticks | n/a |

## Camera and framing

- **Always moving.** Use slow orbits around the hero, push-ins (often through a wall that turns see-through), and pull-backs to a wide shot to re-establish. Moves are long ease-in-out curves of 72–192 frames that overlap the next move.
- **Three distances in rotation** [cam-wide, cam-medium, cam-inside]: wide (hero small, sky visible), medium (hero 40–60% of the width), and inside or close (one part fills the frame). Return to wide after each big reveal.
- **Lens:** moderate perspective, about 35–40° vertical FOV (`googly-cast.html` uses 38°). No fisheye.
- On medium shots the horizon sits in the upper half, so the field fills the lower frame and the blue shadows read.
- **Cut when the beat sheet calls for it.** Hard-cut to another shot or a new set on the beat's start frame. Use a fade to white for a big change of world, like the cleanroom. Every shot still moves, so cut from a move into a move.
- **Loop:** clear the stage with a sparkle dissolve back to the opening composition, so the last frame matches the first.

## Motion timing at 24 fps

| Move | Frames |
|---|---|
| First object lands or explodes | Within 7 frames of frame 0 |
| Explode apart | About 17 |
| Something new on screen (prop, highlight, arrow or caption) | Every 24–48 |
| Caption change | Every 48–96 |
| Pupil settle after a body move | About 10, with overshoot |
| Part pop-in | Scale 0 → 1.08 → 1 over 6–8, with a dust puff |
| Lime flash | Up 4, hold 12–24, fade 7 |
| Caption reveal or exit | About 7, staggered per letter |
| Dust puff life | 10–14: grow, then shrink away |
| Camera move | 72–192, eased, overlapping |

## Do and don't

**Do:** keep every set and shot in the same toy look, tie every set, shot and cut to a beat, paint cast shadows blue and hard, keep outlines on everything (glass too), flash only the named part lime, keep objects at real proportions with googly eyes as the only addition, aim the pupils at what matters, keep captions in the band the hero isn't in, and end on the opening frame.

**Don't:** use flat backdrops, photo textures or realistic materials; use bloom, blur, flares or glow; give objects arms, legs, mouths, eyebrows or blinks; use signal colours on props; put boxes or thick strokes behind captions, or bounce them in; use 2D title stamps or flat cel shading (the channel's older look, since dropped); add a set, shot or cut that no beat calls for; or hold the camera still outside a freeze.
