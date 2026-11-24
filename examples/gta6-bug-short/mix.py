#!/usr/bin/env python3
"""Final audio mix for gta6-bug-short (1080x1920, 24 fps, 1008 frames = 42.000 s).

Builds audio/mix.wav (48 kHz stereo, exactly 42.000 s, about -14 LUFS, true peak <= -2 dBTP) from:
  * audio/vo.mp3              voice-over, starts at frame 0 (first decoded sample = t 0)
  * audio/music/...wav        cleared music bed, ducked under speech using audio/vo-stt.json
  * audio/sfx/*.wav           trimmed library effects (provenance in audio/sfx/SOURCES.json)

Every effect is placed so its transient (anchor) lands on its cue frame (time = frame / 24).
Only python3 stdlib + ffmpeg. Deterministic: same inputs give the same file.
Edit the data block below and rerun:  python3 mix.py
"""
import array, json, math, re, subprocess, sys, tempfile
from pathlib import Path

# ---------------------------------------------------------------- data (edit me)
FPS, FRAMES, SR = 24, 1008, 48000

# (frame, file in audio/sfx, gain dB, anchor)
# anchor: "peak"  = loudest sample lands on the frame
#         "onset" = first sample within 6 dB of the peak lands on the frame (sounds whose
#                   loudest point is late: the boom body, buzzer, ticking, drip, shine)
#         float   = explicit offset in seconds inside the file
CUES = [
    (5,   "toy-clack.wav",       -9.0, "peak"),   # toy car drops onto the road
    (79,  "river-plop.wav",     -11.0, "onset"),  # car falls through the bridge into the river
    (150, "placard-pop.wav",    -15.0, "peak"),   # "one line of code" placard pops in
    (215, "page-flip-a.wav",    -22.0, "peak"),   # calendar flip ("two weeks")
    (247, "page-flip-b.wav",    -21.0, "peak"),   # calendar flip ("months")
    (295, "button-click.wav",    -7.0, "peak"),   # duck presses the UPLOAD button
    (319, "patch-zip.wav",      -10.0, "peak"),   # patch zips into the bridge
    (379, "boat-bonk.wav",      -11.0, "peak"),   # boat bonks the invisible wall (problem)
    (483, "regression-boom.wav", -18.0, "onset"), # REGRESSION sign (problem)
    (602, "book-thud.wav",      -13.0, "peak"),   # rulebook drops on the desk
    (657, "wrong-buzzer.wav",   -17.0, "onset"),  # one rule fails, turns red (problem)
    (678, "rewind-swipe.wav",   -20.0, "peak"),   # rewind badge (bed also plays backwards, below)
    (726, "clock-ticking.wav",   -2.0, "onset"),  # time skip, ~10 ticks to frame 770
    (784, "placard-pop.wav",    -15.0, "peak"),   # code placard pops back in
    (927, "solved-ding.wav",    -11.0, "peak"),   # mint "solved" tick
    (972, "sparkle-shine.wav",   -5.0, "onset"),  # sparkle dissolve back to the opening
]

VO_FILE, VO_GAIN_DB = "vo.mp3", 0.0
# gentle VO compressor so the final limiter does little work (threshold -21 dBFS, 3:1)
VO_COMP = "acompressor=threshold=0.0891:ratio=3:attack=3:release=80:knee=2"

MUSIC_FILE = "music/playful-quirky-orchestral.wav"   # 128 bpm
MUSIC_REENTRY_SRC = 56.262      # s in the track: downbeat after its own break ...
MUSIC_REENTRY_FRAME = 898       # ... lands exactly where the bed returns after the freeze
BED_GAIN_DB = -18.0             # bed level in speech gaps
DUCK_DB = -13.0                 # extra drop under speech
DUCK_ATTACK, DUCK_RELEASE = 0.12, 0.35   # s before word start / after word end
DUCK_MERGE_GAP = 0.6            # speech gaps shorter than this stay ducked (no pumping)
FREEZE = (866, 898)             # bed silent for frames 866..897, back at 898
REWIND = (678, 712, 2.0)        # frames; bed plays backwards at 2x speed in this window
REWIND_BOOST_DB = 3.0           # let the backwards bed through a little (still under VO)
BED_FADE_IN = 0.03              # s
BED_FADE_OUT = (40.9, 41.96)    # s, squared-amplitude fade to silence for a clean loop

TARGET_LUFS, TP_MAX = -14.0, -2.0
# ---------------------------------------------------------------- end of data

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
DUR = FRAMES / FPS
NS = FRAMES * SR // FPS          # 2,016,000 samples


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr[-3000:])
    return r.stderr


def decode_mono(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af", "asetpts=PTS-STARTPTS",
                          "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    a = array.array("h"); a.frombytes(raw)
    return a


def anchor_seconds(path, mode):
    if isinstance(mode, (int, float)):
        return float(mode)
    a = decode_mono(path)
    ipk = max(range(len(a)), key=lambda i: abs(a[i]))
    if mode == "peak":
        return ipk / SR
    thr = abs(a[ipk]) * 10 ** (-6 / 20)
    return next(i for i in range(len(a)) if abs(a[i]) >= thr) / SR


def speech_segments():
    words = [w for w in json.loads((AUDIO / "vo-stt.json").read_text())["words"] if w.get("type") == "word"]
    segs = []
    for w in words:
        s, e = w["start"] - DUCK_ATTACK, w["end"] + DUCK_RELEASE
        if segs and s - segs[-1][1] < DUCK_MERGE_GAP:
            segs[-1][1] = max(segs[-1][1], e)
        else:
            segs.append([s, e])
    return words, segs


def trap(a0, a1, b0, b1):
    """0 outside [a0,b1], ramps to 1 over [a0,a1], holds, ramps down over [b0,b1]."""
    return f"clip((t-({a0:.4f}))/{a1 - a0:.4f},0,1)*clip(({b1:.4f}-t)/{b1 - b0:.4f},0,1)"


def bed_expr(segs):
    duck = []
    for s, e in segs:
        a0, a1 = s, s + DUCK_ATTACK
        if a0 < 0.3:                                 # speech starts right away: start ducked
            a0, a1 = -1.0, -0.5
        duck.append(trap(a0, a1, e - DUCK_RELEASE, e))
    rw0, rw1 = REWIND[0] / FPS, REWIND[1] / FPS
    fz0, fz1 = FREEZE[0] / FPS, FREEZE[1] / FPS
    db = f"{BED_GAIN_DB}+({DUCK_DB})*({'+'.join(duck)})+{REWIND_BOOST_DB}*{trap(rw0 - 0.05, rw0, rw1, rw1 + 0.05)}"
    fo0, fo1 = BED_FADE_OUT
    mask = (f"(1-{trap(fz0 - 0.032, fz0 - 0.002, fz1, fz1 + 0.01)})"
            f"*clip(t/{BED_FADE_IN},0,1)*pow(clip(({fo1}-t)/{fo1 - fo0:.4f},0,1),2)")
    return f"pow(10,({db})/20)*{mask}"


def build_graph(placed, segs):
    off = MUSIC_REENTRY_SRC - MUSIC_REENTRY_FRAME / FPS
    rw0, rw1, speed = REWIND[0] * SR // FPS, REWIND[1] * SR // FPS, REWIND[2]
    rwlen = rw1 - rw0
    src_len = int(round(rwlen * speed))
    g = [
        f"[0:a]asetpts=PTS-STARTPTS,aresample={SR},highpass=f=70,{VO_COMP},volume={VO_GAIN_DB}dB,"
        f"pan=stereo|c0=c0|c1=c0,apad=whole_len={NS},atrim=end_sample={NS},asplit=2[vo][vostem]",
        f"[1:a]asetpts=PTS-STARTPTS,aresample={SR},atrim=start={off:.6f},asetpts=PTS-STARTPTS,"
        f"atrim=end_sample={NS},asplit=3[m0][m1][m2]",
        # before the rewind
        f"[m0]atrim=end_sample={rw0},afade=t=out:st={rw0 / SR - 0.01:.4f}:d=0.01[ma]",
        # the rewind: the music just heard, reversed and played at `speed`
        f"[m1]atrim=start_sample={rw0 - src_len}:end_sample={rw0},asetpts=PTS-STARTPTS,areverse,"
        f"asetrate={int(SR * speed)},aresample={SR},apad=whole_len={rwlen},atrim=end_sample={rwlen},"
        f"afade=t=in:d=0.01,afade=t=out:st={rwlen / SR - 0.01:.4f}:d=0.01[mr]",
        # after the rewind the bed continues on its normal timeline
        f"[m2]atrim=start_sample={rw1},asetpts=PTS-STARTPTS,afade=t=in:d=0.01[mb]",
        f"[ma][mr][mb]concat=n=3:v=0:a=1,asetnsamples=n=64,"
        f"volume=volume='{bed_expr(segs)}':eval=frame,apad=whole_len={NS},atrim=end_sample={NS},"
        f"asplit=2[bed][bedstem]",
    ]
    labels = ["[vo]", "[bed]"]
    for i, p in enumerate(placed):
        d = int(round(p["start"] * SR))
        shift = f"adelay=delays={d}S:all=1" if d >= 0 else f"atrim=start_sample={-d},asetpts=PTS-STARTPTS"
        g.append(f"[{i + 2}:a]asetpts=PTS-STARTPTS,aresample={SR},aformat=channel_layouts=stereo,"
                 f"volume={p['gain']}dB,{shift},apad=whole_len={NS},atrim=end_sample={NS}[s{i}]")
        labels.append(f"[s{i}]")
    g.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=longest,"
             f"atrim=end_sample={NS}[mix]")
    return ";\n".join(g)


def loudness(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"])
    summ = err[err.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", summ).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", summ).group(1))
    return i, tp


def momentary(path):
    """K-weighted momentary loudness every 100 ms: list of (t_end, LUFS)."""
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-af",
                          "asetnsamples=n=4800,ebur128=metadata=1,ametadata=print:key=lavfi.r128.M:file=-",
                          "-f", "null", "-"], capture_output=True, text=True).stdout
    ts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", out)]
    ms = [float(x) for x in re.findall(r"lavfi.r128.M=(-?[\d.]+|-inf)", out)]
    return [(t + 0.1, m) for t, m in zip(ts, ms)]


def master(premix, out, gain_db, ceiling_db):
    run(["ffmpeg", "-v", "error", "-y", "-i", str(premix), "-af",
         f"volume={gain_db:.3f}dB,aresample=192000,"
         f"alimiter=limit={10 ** (ceiling_db / 20):.5f}:attack=1:release=60:level=0:latency=1,"
         f"aresample={SR},apad=whole_len={NS},atrim=end_sample={NS},afade=t=out:st={DUR - 0.02:.4f}:d=0.02",
         "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(out)])


def main():
    words, segs = speech_segments()
    placed = []
    for frame, name, gain, mode in CUES:
        path = AUDIO / "sfx" / name
        anc = anchor_seconds(path, mode)
        placed.append(dict(frame=frame, name=name, path=path, gain=gain, anchor=anc,
                           start=frame / FPS - anc))
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / "graph.txt").write_text(build_graph(placed, segs))
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(AUDIO / VO_FILE), "-i", str(AUDIO / MUSIC_FILE)]
        for p in placed:
            cmd += ["-i", str(p["path"])]
        cmd += ["-/filter_complex", str(tmp / "graph.txt"),
                "-map", "[mix]", "-c:a", "pcm_f32le", str(tmp / "premix.wav"),
                "-map", "[vostem]", "-c:a", "pcm_f32le", str(tmp / "vo.wav"),
                "-map", "[bedstem]", "-c:a", "pcm_f32le", str(tmp / "bed.wav")]
        run(cmd)

        # two-pass loudness: measure, gain, true-peak limit (4x oversampled), re-measure, refine
        i_pre, _ = loudness(tmp / "premix.wav")
        gain, ceiling, out = TARGET_LUFS - i_pre, TP_MAX - 0.5, AUDIO / "mix.wav"
        for _ in range(6):
            master(tmp / "premix.wav", out, gain, ceiling)
            i_out, tp_out = loudness(out)
            ok_i, ok_tp = abs(i_out - TARGET_LUFS) <= 0.2, tp_out <= TP_MAX - 0.05
            if ok_i and ok_tp:
                break
            if not ok_tp:
                ceiling -= tp_out - (TP_MAX - 0.2)
            if not ok_i:
                gain += TARGET_LUFS - i_out

        # objective checks
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout)
        vo_m, bed_m = momentary(tmp / "vo.wav"), momentary(tmp / "bed.wav")
        spans = []                       # continuous speech: words joined across gaps < 0.25 s
        for w in words:
            if spans and w["start"] - spans[-1][1] < 0.25:
                spans[-1][1] = w["end"]
            else:
                spans.append([w["start"], w["end"]])
        diffs = []                       # only 400 ms windows lying wholly inside speech
        for (t, mv), (_, mb) in zip(vo_m, bed_m):
            if any(s <= t - 0.4 and t <= e for s, e in spans):
                diffs.append(mv - max(mb, -120.0))
        diffs.sort()
        bed = decode_mono(tmp / "bed.wav")
        fz = bed[FREEZE[0] * SR // FPS: FREEZE[1] * SR // FPS]
        tail = decode_mono(out)[-SR // 100:]

    print("cue  frame  t(s)    file                  gain   anchor  file starts at")
    for p in placed:
        print(f"     {p['frame']:4d}  {p['frame'] / FPS:6.3f}  {p['name']:21s} {p['gain']:+5.1f}  "
              f"{p['anchor']:.3f}s  {p['start']:7.3f}s")
    print(f"music offset {MUSIC_REENTRY_SRC - MUSIC_REENTRY_FRAME / FPS:.3f}s into the track; "
          f"{len(segs)} ducked speech span(s)")
    print(f"pre-master {i_pre:.1f} LUFS -> gain {gain:+.2f} dB, limiter ceiling {ceiling:.2f} dBFS (4x oversampled)")
    print(f"VO minus bed inside speech (momentary 400 ms windows): median {diffs[len(diffs) // 2]:.1f} dB, "
          f"10th pct {diffs[len(diffs) // 10]:.1f} dB, min {diffs[0]:.1f} dB over {len(diffs)} windows")
    print(f"bed peak during freeze frames {FREEZE[0]}-{FREEZE[1] - 1}: "
          f"{max(abs(x) for x in fz) if fz else 0} (int16 units)")
    print(f"last 10 ms peak: {20 * math.log10(max(1, max(abs(x) for x in tail)) / 32768):.1f} dBFS")
    print(f"wrote {out}  ({dur:.3f} s, {SR} Hz stereo)")
    print(f"MEASURED: integrated {i_out:.1f} LUFS, true peak {tp_out:.1f} dBTP")


if __name__ == "__main__":
    main()
