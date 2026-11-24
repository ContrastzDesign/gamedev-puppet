# Scripts: everything learned

Everything Claude knows about writing scripts for Ricardo's Game Dev Puppet Shorts. Read this before writing, rewriting, proofreading or suggesting a script, and when choosing a topic.

The file has three layers, in priority order:
1. **Ricardo's rules.** Worked out on 2026-11-24 from his two edits of the GTA VI script. They win over everything below.
2. **The reference channel.** A teardown of all 35 @shirusekaii Shorts (Nov 3–21, 2026), the source of the format. Use it for ideas, titles and line craft, not for length.
3. **Idea bank, proofreading, staging and delivery.**

Write or rewrite a script only when Ricardo asks. A script he has locked for production is never changed (see `SKILL.md`, step 1).

---

# 1. Ricardo's rules

## The shape

```
TITLE     Why can't / Why does [real game or thing gamers know] [frustration]?   (no emoji)

HOOK      Say [a specific, slightly funny problem in that game].
          To fix this, you only need [something tiny].
          But why does [the slow, annoying result]?

SHORTCUT  Why not just [the obvious shortcut]?

WALL 1    [The shortcut backfires: the fix breaks something else.]
          This is what you call [TERM].
          So [what that costs].

WALL 2    [The gatekeeper or a bigger obstacle.]
          Fail [one thing], and you start all over again.

(WALL 3)  Optional. Only if it is as strong as the first two.

FAN JOKE  [Blow the cost up to something fans already joke about.]
          "This is why they take 10 years to build!"

ENDING    [Short contrast line that answers the title.]
          Congratulations, you're now a true [role]!
```

## Rules

1. **About 100–120 words, 30–45 seconds.** Never more than about 150. Ricardo rejected a 400-word version as "way too long for a YouTube short". His final GTA script is 121 words. If a draft runs long, cut a wall before cutting the hook, the joke or the ending.
2. **Two walls is enough.** In his second edit Ricardo cut the four-console wall and kept two. Add a third only if it is as strong as the other two. One idea per wall, in 1–3 short sentences, with no examples stacked inside a wall.
3. **Open with "Say…" and one concrete scene** the viewer can picture (every car falls through one bridge). "Say" keeps it hypothetical, so the script never claims a real game has a real bug.
4. **Name the real game in the first line** if the title names it. The title can't promise something the script doesn't deliver. **No emojis** in the title or anywhere in the script, even though the reference channel uses them.
5. **The shortcut is a bare question.** "Why not just fix it and hit upload?" stands on its own, and the next line answers it by showing what goes wrong. No "Not even close."
6. **The first wall is self-inflicted:** the fix causes the next problem.
7. **Name terms in plain words:** "This is what you call regression." One term per wall at most.
8. **Each wall ends with what it costs, and the cost grows:** replay the whole game, then start all over again.
9. **One fan joke after the last wall.** Blow the cost up to something the audience already jokes about in the real game. For GTA VI that is the long wait: "This is why they take 10 years to build!" It is the biggest cost in the script, played for a laugh, so exaggeration is fine. Each topic needs its own joke, taken from what fans of that game say.
10. **End on a contrast line, then the sign-off.** The contrast answers the title ("The fix took ten minutes. Proving it didn't break anything took two weeks."). The sign-off is "Congratulations, you're now a true [role]!", usually "game developer".
11. **Simple beats complete.** Name one gatekeeper people know (Sony), not every company that certifies. Ricardo kept "Sony" alone, and "two weeks or even months" in the hook, after both were flagged. Treat both as settled and don't raise them again.
12. **Simple words, short sentences, "you" throughout.** No paragraphs explaining how something works, no analogies or scale conversions, unless one line does the job.
13. **Check any number that is stated as a fact.** Numbers inside the fan joke are exaggeration and don't need checking.

## What Ricardo changed, and why it matters

**First edit** (Claude's draft → his version):
- Cut it from ~400 words to ~100.
- Dropped "Not even close." after the shortcut question.
- Dropped the controller-unplug example inside the certification wall: one idea per wall.
- Named terms as "This is what you call…" instead of "That's called…".
- "Go to the back of the line" became "start all over again", which is plainer.
- Added the channel's sign-off back in, aimed at the viewer: "Congratulations, you're now a true game developer!"
- Widened the hook's stakes: "two weeks or even months".

**Second edit** (2026-11-24):
- Cut the four-console wall ("But GTA VI runs on four. So every test runs four times."). Two walls now.
- Added the fan joke after the certification wall: "This is why they take 10 years to build!"
- Kept "Sony" as the only gatekeeper and kept "or even months", after both were flagged.
- From the proofread he took "you're" and the comma after "Congratulations". He kept "what you call regression", "their own rulebooks" and "To fix this you" as written (see Proofreading, section 4).

## Reference script (Ricardo's version, as he wrote it)

**Why Can't GTA VI Just Fix a Bug Overnight?**

Say a bug makes every car in GTA VI fall through one bridge. To fix this you only need one line of code. But why does the patch take two weeks or even months?

Why not just fix it and hit upload?

To fix the bridge, and now boats under it hit an invisible wall. Fixing one thing broke another. This is what you call regression. So testers replay the game, not just the bridge.

Then Sony checks it against their own rulebooks. Fail one rule, and you start all over again.
This is why they take 10 years to build!

The fix took ten minutes. Proving it didn't break anything took two weeks. Congratulations, you're now a true game developer!

121 words. One open point: "To fix the bridge, and now boats…" has no main verb when read aloud. "You fix the bridge, and now boats…" would fix it, if Ricardo wants that.

---

# 2. What the reference channel taught

Source: script teardown of all 35 @shirusekaii Shorts, published at https://claude.ai/artifact/CDMpmsEr9ha7twCCN6YMj2. Views as of Nov 23, 2026. Auto-captions only; visuals are covered in `style.md`.

## The numbers

- 35 Shorts in 19 days, 13.1M views.
- 23 of 35 use one format, the **problem ladder** (below). With its pet-care variant it brought in about 78% of views.
- Same format, different titles: "How to Build X From Scratch" titles had a median of 6.3k views; question titles had a median of 204k. The submarine Short, posted a day after three "From Scratch" ones with the same structure, got 110k (13–28 times more).
- Top videos: wind turbine 3.2M, GPU chip 2.6M, solar 1.4M, bowling pins 959k, turtle 948k, vending machine 926k.
- The channel's hits ran 100–170 s at about 200 words a minute. Ricardo's rule 1 overrides this.

## How the channel grew

| When | What happened |
|---|---|
| Nov 3–9 | Testing: ~70 s fact Shorts (animal studies, myths) and a few "From Scratch" builds. 4k–22k views each. |
| Nov 6 | The submarine: the same build format with a fear-question title. 110k. |
| Nov 10–17 | Committed to builds with question titles. Four videos near or above 1M. |
| Nov 18–21 | Spin-offs: pet-care builds, "why can't we just…?" teardowns, one scale ladder. Weak titles slipped to 30k–55k. |

## The problem ladder

Each step has four parts, and almost every sentence either opens a problem or closes one.

1. **The naive version:** "If you [do the simplest thing], you've got [a THING]." Technically true, a little funny, 2–4 s in.
2. **Break it** as a tiny scene: "But / Except / Until / Then [it fails]."
3. **Fix it:** "So you [add a part]." One sentence on how it works.
4. **Name it after the viewer needed it:** "That's the [term]."
5. **Repeat.** The best steps are self-inflicted: "Better wind, bigger problem." / "You just sealed out the thing you came for." / "Except those were your cleanup crew."
6. **Close:** "So next time you [see it]…", then "And congratulations, you just built a [THING]," then a kicker. 14 of the 16 main builds end on "congratulations" or "you've officially built".

Why it works:
- A broken machine every few seconds keeps an open loop; a list of parts doesn't.
- The viewer is the engineer ("you"), so each part feels invented, not listed.
- Jargon arrives as a reward, after the viewer already knows why it exists.
- The opener is a joke that's technically true: "Drop uranium in a pool of water and you've got a nuclear reactor, technically."
- Any machine fits, so the channel could post daily.

## The "why can't we just…?" teardown

This is the format Ricardo's rules are built on. The viewer tries the obvious shortcut and hits a wall each time.

- GPU chip (2.6M, best like rate on the channel at 4.5%): "Why can't anyone copy a graphics card just by taking it apart?" → take it apart → microscope → 10+ wiring layers → photos aren't a blueprint → printing needs EUV → one company builds EUV → software lock-in. Ends: "Good luck. Follow me for more."
- Saturn V (186k): "Did today's engineers become stupid?" → blueprints exist → one engine → 2013 teardown → fixes never written down → 400,000 people. Ends: "NASA didn't lose the recipe. It lost the cooks."
- Both open on a question people already argue about, both get bigger at every wall, and both end on a short saying.

## Titles

- **Point at one detail, fear or frustration** the viewer has seen or felt. Several hits don't name the machine at all ("Why Does It Spin One Extra Time?" is a vending machine).
- **Hidden-answer words:** "Who *actually* resets…", "Where does your poop *actually* go", "What happens if…".
- **Fear and mistake framing** for care topics: "This Tiny Mistake Can Harm Your Turtle".
- **33 of 35 titles end with an emoji** that names the object. Ricardo doesn't want this: no emojis in his titles or scripts (rule 4).
- **Hold the title's answer.** Vending machine held it to ~80% and got 926k. Camera answered its title in the first 10 seconds and got 53k.
- **Deliver what the title promises.** The garbage truck title asked where trash goes, but the script only covered the truck; it had the lowest like rate of the builds (1.9%).
- **Low-stakes questions underperform.** "Why Is Soft Serve Mostly Air?" got 32k. Nobody was wondering.

## Line-level tools

| Tool | Example from the channel |
|---|---|
| Failure as a tiny scene | "Look up. Your bag is hanging off the edge of the shelf." |
| Self-inflicted problem | "You just sealed out the thing you came for." |
| Personified objects | "Your refrigerator alone would like a word." / "Your river has moods." |
| Deadpan scale | "The world's most expensive kettle." / "A chip with no software is just expensive sand." |
| One everyday analogy | "like water flowing through a hose that's been stepped on" |
| Human-scale numbers | "two and a half bathtubs for an animal that fit in your palm" |
| Time skip | "A few months go by, and then the shell starts to go soft." |
| Myth corrected in passing | "nothing is burning in there. It's just water vapor." |
| "Next time you…" callback | "next time you press B4 and hear a second little whir…" |
| Recurring anchor | "B4" coming back three times in the vending script |
| Light hedging | "about", "can", "vets warn". Too much reads stiff (the electric fence script). |

Kickers that worked:
- "You didn't buy a pet, you signed a lease."
- "Just tell the neighbors first."
- "Now, you just need to convince the sun to work the night shift."
- "Just don't become its first customer."
- "NASA didn't lose the recipe. It lost the cooks."

Personified lines suit the googly-eye cast: give them to a cast member's reaction.

## Other formats the channel tried

- **Pet-care build** (median 364k): "If you put a [pet] in a tank, it has a home. Except…" Each step is a health risk, with a time skip and a recap list ("Tank, filter, dock, heat, UVB.").
- **Scale ladder** (36k): the viewer is the unit of measurement. It had a high like rate but low reach, because the title promised DNA and the first two minutes were about floppy disks.
- **Fact or study Shorts** (median 5.7k, dropped after Nov 10): claim, study, objection, control, twist. They explain a process with no problems to solve, so there's nothing pulling the viewer forward.

## What failed, in one line each

- Generic "How to Build X" titles: nothing specific to be curious about.
- Answering the title early (camera, 53k).
- A title that promises more than the script covers (garbage truck).
- Low-stakes curiosity (soft serve, 32k).
- A niche detail plus drifting scope plus 149 s (security cameras, 55k).
- Very slow delivery: the washing machine script ran 87 words a minute and got the fewest views (3.9k).

---

# 3. Idea bank

Seeds in Ricardo's shape, ready to write up when he asks. Check the listed facts before writing. They list three walls, so pick the two strongest, and find a fan joke for the topic (rule 9).

**Why Can't GTA VI Just Fix a Bug Overnight?**: written; see the reference script above.

**Why Do Games Make You Ride Elevators?** (how engines stream worlds)
- Say: you build a huge open world, and the console runs out of memory before the first town loads.
- Shortcut: Why not just load the whole world at once?
- Walls: split it into levels, but players hate loading screens → load the next area while you play (streaming) → the player outruns the disk, so designers slow you down with an elevator or a squeeze through a crack.
- Contrast: "That elevator wasn't going up. It was waiting for your hard drive."
- Check: which games famously used elevators or cracks to hide loading.

**Why Do Bullets Sometimes Go Through Walls?** (game loop and physics)
- Say: you fire at a wall in your game, and the bullet comes out the other side.
- Shortcut: Why not just check if the bullet touches the wall?
- Walls: the game only checks every frame, and a fast bullet jumps past a thin wall between checks (tunneling) → trace the bullet's whole path instead (costs more) → a thousand bullets means a million checks, so split the map into a grid.
- Contrast: "The wall never let it through. The game just blinked."

**Why Do You Die After You're Already Behind Cover?** (online multiplayer)
- Say: you dive behind a wall, you're safe, and you still die.
- Shortcut: Why not just send everyone's position instantly?
- Walls: data takes a tenth of a second, so everyone stutters → show other players slightly in the past (interpolation) → the enemy shot where you *were* on their screen, so the server rewinds time to check the hit (lag compensation).
- Contrast: "You were behind cover. Just not in the past."

**Why Does a Tiny Patch Make You Download 40 GB?** (how game stores deliver updates)
- Say: a game fixes one typo, and you're downloading 40 gigabytes.
- Shortcut: Why not just send the file that changed?
- Walls: games pack everything into a few giant files so they load faster → one changed texture shifts everything after it → the store compares the file in small chunks and needs room for the old and new copies ("Allocating disk space").
- Contrast: "The fix was tiny. It was just packed inside something huge."
- Check: how Steam's chunk-based patching works (reportedly ~1 MB chunks).

## Second batch (2026-11-24): two walls and a fan joke each

**Why Are There Two Minecrafts?** (two codebases)
- Say: your redstone farm works on Java, then breaks on Bedrock.
- Shortcut: Why not just merge them into one game?
- Walls: they're two games written in two languages (Java and C++), so every feature gets built twice. "This is what you call parity." → Merging them breaks millions of worlds and mods on one side.
- Fan joke: "This is why the comments are still fighting about it."
- Contrast: "It's one game on the box. It's two games in the code."
- Check: Bedrock is C++ and Java Edition is Java; Mojang's own use of "parity".

**Why Can't Call of Duty Just Stop Cheaters?** (anti-cheat)
- Say: someone tracks you through a wall and headshots you.
- Shortcut: Why not just ban the cheat?
- Walls: your game has to tell their PC where you are, even behind walls, so it can play your footsteps; the cheat just reads it. "This is what you call a wallhack." So the anti-cheat has to watch their whole PC. → Cheaters move to a second computer plugged into the first, and a ban just means a new free account.
- Fan joke: "This is why everyone who beats you is definitely cheating."
- Contrast: "The cheat didn't see through the wall. Your game told it where you were."
- Check: Warzone is free to play; Ricochet runs at kernel level; DMA-card cheats.

**Why Does a Brand New Game Need an Update?** (going gold and day-one patches)
- Say: you buy Call of Duty on disc, and it makes you download a patch before you can play.
- Shortcut: Why not just put the finished game on the disc?
- Walls: discs are printed weeks before launch. "This is what you call going gold." The team keeps fixing bugs the whole time. → That fix is a patch, and the patch goes through certification too.
- Fan joke: "This is why the disc is basically a coaster."
- Contrast: "The disc was finished. The game wasn't."
- Check: the usual gap between going gold and launch.

**Why Can't Helldivers 2 Just Add More Servers?** (launch-day queues)
- Say: a game plans for fifty thousand players, and half a million show up.
- Shortcut: Why not just add more servers?
- Walls: the match servers can grow, but every login goes through one central database. "This is what you call a bottleneck." → Splitting the database means rebuilding it while the game is live.
- Fan joke: "This is why launch day is a queue simulator."
- Contrast: "They had plenty of rooms. They only had one front door."
- Check: the 450k player cap in Feb 2024, and how many players Arrowhead planned for.

**Why Does Every Fallout 4 Update Break Your Mods?** (script extenders)
- Say: Bethesda patches Fallout 4, and your 200 mods stop working.
- Shortcut: Why not just keep the mods working?
- Walls: big mods plug into exact spots in the game's code through a script extender, and a patch rebuilds the game so every spot moves. "This is what you call a script extender." → Volunteers fix the extender, then every mod that needs it updates one by one.
- Fan joke: "This is why Fallout players turn off updates like it's a survival skill."
- Contrast: "The patch changed a few lines. Your mods needed every line to stay put."
- Check: the April 2024 next-gen update breaking F4SE.

**Why Can't Ubisoft Just Leave The Crew Online?** (always-online and licences)
- Say: you bought The Crew, and one day it just stops working.
- Shortcut: Why not just patch in an offline mode?
- Walls: the game asks the server for everything, even your garage. "This is what you call always-online." So offline means rebuilding half the game. → The car licences have also run out, so they can't ship an update with those cars.
- Fan joke: "This is why you own the box, not the game."
- Contrast: "You bought the game. You rented the server."
- Check: the shutdown on March 31, 2024; the reasons Ubisoft gave.

**Why Do Skyrim Guards Walk Into Walls?** (pathfinding)
- Say: a guard in Skyrim walks into the same wall forever.
- Shortcut: Why not just tell him where to go?
- Walls: he doesn't see the world, only a simple map of the floor. "This is what you call a navmesh." So anything that moved, like a cart, isn't on his map. → Rebuilding the map for every NPC every frame costs too much.
- Fan joke: "This is why your horse climbs mountains and the guard can't find a door."
- Contrast: "He's not stupid. He's reading an old map."

**Why Do Capes Go Through Horses?** (collision)
- Say: in Elden Ring, your cape goes straight through your horse.
- Shortcut: Why not just make the cape solid?
- Walls: checking every bit of cloth against every bit of horse, 60 times a second, is too slow. So the game wraps the horse in a few invisible capsules. "This is what you call a collider." → The cape only bumps the capsules, and the gaps between them leak.
- Fan joke: "This is why every hero's cape is part ghost."
- Contrast: "The cape isn't going through the horse. The horse is mostly invisible capsules."
- Very visual for the googly cast: show the capsules.

## Third batch (2026-11-24): two walls and a fan joke each

**Why Do PC Games Stutter the First Time You See an Explosion?** (shader compilation)
- Say: you launch a PC game, and it freezes for a second at the first explosion. Shortcut: Why not just ship it ready?
- Wall 1: graphics code has to be compiled for your exact graphics card, and there are thousands of cards. Term: shader compilation.
- Wall 2: compile everything up front, and you stare at a loading bar for 20 minutes.
- Joke: "This is why the loading bar is now a hobby." Contrast: "The game wasn't broken. It was learning your graphics card."
- Check: games that compile shaders at first launch vs on the fly.

**Why Can't a PS5 Just Play PS3 Games?** (emulation)
- Say: you put a PS3 disc in a PS5. Shortcut: Why not just run it?
- Wall 1: PS3 games talk straight to the PS3's chip, which is a different language from the PS5's. Term: emulation.
- Wall 2: translating costs power, so the new console has to be far stronger than the old one just to match it.
- Joke: "This is why you buy the same game a fourth time." Contrast: "The game didn't get old. The chip it spoke to disappeared."
- Check: PS3's Cell chip being hard to emulate.

**Why Do Games Get Slower the Longer You Play?** (memory leaks)
- Say: four hours in, your game slows down, then crashes. Shortcut: Why not just clean up the memory?
- Wall 1: the game keeps asking for memory and forgets to give it back. Term: memory leak.
- Wall 2: the leak is one line in millions, and finding it means replaying hours of game.
- Joke: "This is why restarting is a feature." Contrast: "It didn't break at hour four. It started breaking at minute one."

**Why Can't a Late Game Just Hire More Developers?** (adding people to a late project)
- Say: a game is six months late, so the studio hires 100 more people. Shortcut: Why not just add people?
- Wall 1: every new person has to learn the code first, and the veterans stop working to teach them. Term: onboarding.
- Wall 2: more people means more changes landing in the same files at once. Term: merge conflict.
- Joke: "This is why the delay trailer gets delayed." Contrast: "You can't make a game faster by making the room louder."
- Check: the "adding people to a late project makes it later" idea (Brooks's law).

**Why Can't Studios Just Remaster Old Games With One Button?** (lost assets)
- Say: a studio remasters a 2005 game. Shortcut: Why not just upscale it?
- Wall 1: the textures were made tiny, and the original source files are often long gone. Term: assets.
- Wall 2: the old engine won't run on modern machines, so they rebuild it from scratch.
- Joke: "This is why the remaster costs more than the original." Contrast: "The game was easy to find. The files that built it weren't."

**Why Can Speedrunners Walk Through Walls?** (glitches and physics)
- Say: a speedrunner skips half the game in ten seconds. Shortcut: Why not just patch the glitch?
- Wall 1: the glitch comes from the physics, the same math that makes everything else move. This is a regression waiting to happen.
- Wall 2: change the physics, and every jump, car and door in the game behaves differently, so everything gets retested.
- Joke: "This is why bugs get promoted to features." Contrast: "It's not a hole in the game. It's the game's math, showing."

**Why Does a Reloaded Save Give You the Same Loot?** (random seeds)
- Say: you reload your save, open the chest, and get the same item. Shortcut: Why not just roll again?
- Wall 1: computers don't pick truly random numbers; they start from a number and follow a formula. Term: seed.
- Wall 2: if the seed wasn't saved, players could reload until they got the best loot.
- Joke: "This is why you reload forty times anyway." Contrast: "The dice weren't rigged. They were saved."

**Why Does Your Phone Get Hot Playing Games?** (thermal throttling)
- Say: your phone game runs great, then slows to a crawl. Shortcut: Why not just add a fan?
- Wall 1: phones are sealed, so the chip slows itself down when it gets hot. Term: thermal throttling.
- Wall 2: developers can't lower the heat, only the game, so graphics get cut.
- Joke: "This is why your phone is a hand warmer with an app store." Contrast: "The game didn't get harder. Your phone got hotter."

Spare titles:
- Why Can't You Skip the Logos When a Game Starts? (the game loads behind them: "You weren't watching logos. You were watching a loading screen in disguise.")
- Why Do PC Games Stutter the First Time You See an Explosion? (compiling graphics code on the fly)
- Why Do Characters T-Pose When a Game Breaks? (animation rigs)
- Why Don't Save Files Work Across Consoles?

---

# 4. Proofreading, staging and delivering

## Proofreading

When Ricardo asks for a proofread, fix spelling, grammar and punctuation, and keep his wording and choices. Then list what changed. Point out a rule from section 1 that the script breaks only in a short note after the corrected text, and don't rewrite it unless he asks. This is a voice-over script, so only fix what sounds wrong when read aloud: "your" for "you're", a sentence with no main verb, a company name in lower case ("rockstar"). Casual spoken forms stay as written: "their" for a company, "what you call regression" with no "a", a missing comma that a speaker wouldn't pause for. Once Ricardo keeps something you flagged, it's settled, so don't flag it again.

## Staging a short script

These beats map onto the table in `script-ladder.md`:

| Beat | Treat as |
|---|---|
| "Say [problem]…" | Naive version, then Problem: show the scene and tint the fault red |
| "Why not just…?" | Failed attempt: the shortcut plays, then the rewind badge |
| Wall | Problem, then Fix if there is one |
| "This is what you call [TERM]." | Name: lime flash on that part |
| "So [cost]" | Number: a data-blue counter that grows wall to wall |
| Fan joke ("This is why they take 10 years to build!") | Kicker: the counter spins up to the joke's number, and the cast reacts on the punch word |
| Contrast line | Title's answer: the freeze |
| "Congratulations, you're now a true…" | The sign-off: lime flash, then the mint tick and a group hop |

## Delivering

Give a written script as text in chat, or write it into a tab of the **Scripts for Game Dev Puppet** doc (`1RHjbTuqVWSASSzIQZPIpcWt55Osr9341zqoPAhVOSas`) when Ricardo asks. Before writing into a tab, read it, and ask before replacing any text already in it. Never touch a ✅ tab.
