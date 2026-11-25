#!/usr/bin/env python3
"""Final audio mix for gamer-sites-short (1080x1920, 24 fps, 731 frames).

VO + Kevin MacLeod "Carefree" (CC BY 4.0) ducked under speech + Freesound CC0 SFX.
Target ~-14 LUFS, true peak <= -2 dBTP. Deterministic.
"""
import array, json, math, re, subprocess, sys, tempfile
from pathlib import Path

FPS, FRAMES, SR = 24, 731, 48000

# (frame, file in audio/sfx, gain dB, anchor)
CUES = [
    (2,   "soft-pop.wav",     -14.0, "peak"),   # hook settle
    (75,  "whoosh-short.wav", -12.0, "peak"),   # cut to Steam
    (98,  "ui-pop.wav",       -11.0, "peak"),   # "Steam"
    (130, "keyboard-short.wav", -16.0, "onset"),
    (196, "whoosh-short.wav", -12.0, "peak"),   # cut to Poki
    (220, "kenney-switch.wav", -10.0, "peak"),  # "Poki"
    (280, "mouse-click.wav",   -8.0, "peak"),
    (320, "ui-pop.wav",       -12.0, "peak"),
    (363, "whoosh-long.wav",  -13.0, "peak"),   # cut to roblox.com
    (392, "kenney-click.wav",  -7.0, "peak"),
    (450, "soft-pop.wav",     -13.0, "peak"),
    (507, "swish-short.wav",  -11.0, "peak"),   # cut to Twitch
    (534, "ui-pop.wav",       -10.0, "peak"),   # "Number two"
    (650, "keyboard-short.wav", -18.0, "onset"),
    (702, "cheer-short.wav",  -16.0, "onset"),  # "Twitch"
]

VO_FILE, VO_GAIN_DB = "vo.mp3", 0.0
VO_COMP = "acompressor=threshold=0.0891:ratio=3:attack=3:release=80:knee=2"

MUSIC_FILE = "music/carefree.wav"
BED_GAIN_DB = -19.0
DUCK_DB = -12.0
DUCK_ATTACK, DUCK_RELEASE = 0.12, 0.35
DUCK_MERGE_GAP = 0.6
BED_FADE_IN = 0.05
BED_FADE_OUT = (29.6, 30.4)

TARGET_LUFS, TP_MAX = -14.0, -2.0

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
DUR = FRAMES / FPS
NS = FRAMES * SR // FPS


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
    if not a:
        return 0.0
    ipk = max(range(len(a)), key=lambda i: abs(a[i]))
    if mode == "peak":
        return ipk / SR
    thr = abs(a[ipk]) * 10 ** (-6 / 20)
    return next(i for i in range(len(a)) if abs(a[i]) >= thr) / SR


def speech_segments():
    data = json.loads((AUDIO / "vo-words.json").read_text())
    words = [{"start": w["start"], "end": w["end"], "word": w["w"]} for w in data["words"]]
    segs = []
    for w in words:
        s, e = w["start"] - DUCK_ATTACK, w["end"] + DUCK_RELEASE
        if segs and s - segs[-1][1] < DUCK_MERGE_GAP:
            segs[-1][1] = max(segs[-1][1], e)
        else:
            segs.append([s, e])
    return words, segs


def trap(a0, a1, b0, b1):
    return f"clip((t-({a0:.4f}))/{a1 - a0:.4f},0,1)*clip(({b1:.4f}-t)/{b1 - b0:.4f},0,1)"


def bed_expr(segs):
    duck = []
    for s, e in segs:
        a0, a1 = s, s + DUCK_ATTACK
        if a0 < 0.3:
            a0, a1 = -1.0, -0.5
        duck.append(trap(a0, a1, e - DUCK_RELEASE, e))
    db = f"{BED_GAIN_DB}+({DUCK_DB})*({'+'.join(duck) if duck else '0'})"
    fo0, fo1 = BED_FADE_OUT
    mask = (f"clip(t/{BED_FADE_IN},0,1)*pow(clip(({fo1}-t)/{fo1 - fo0:.4f},0,1),2)")
    return f"pow(10,({db})/20)*{mask}"


def build_graph(placed, segs):
    g = [
        f"[0:a]asetpts=PTS-STARTPTS,aresample={SR},highpass=f=70,{VO_COMP},volume={VO_GAIN_DB}dB,"
        f"pan=stereo|c0=c0|c1=c0,apad=whole_len={NS},atrim=end_sample={NS},asplit=2[vo][vostem]",
        f"[1:a]asetpts=PTS-STARTPTS,aresample={SR},atrim=end_sample={NS},"
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
        if not path.exists():
            sys.exit(f"missing sfx: {path}")
        anc = anchor_seconds(path, mode)
        placed.append(dict(frame=frame, name=name, path=path, gain=gain, anchor=anc,
                           start=frame / FPS - anc))
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / "graph.txt").write_text(build_graph(placed, segs))
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(AUDIO / VO_FILE), "-i", str(AUDIO / MUSIC_FILE)]
        for p in placed:
            cmd += ["-i", str(p["path"])]
        cmd += ["-filter_complex_script", str(tmp / "graph.txt"),
                "-map", "[mix]", "-c:a", "pcm_f32le", str(tmp / "premix.wav"),
                "-map", "[vostem]", "-c:a", "pcm_f32le", str(tmp / "vo.wav"),
                "-map", "[bedstem]", "-c:a", "pcm_f32le", str(tmp / "bed.wav")]
        run(cmd)

        i_pre, _ = loudness(tmp / "premix.wav")
        gain, ceiling, out = TARGET_LUFS - i_pre, TP_MAX - 0.5, AUDIO / "mix.wav"
        i_out = tp_out = 0.0
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

        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout)
    print("cue  frame  t(s)    file                  gain   anchor  file starts at")
    for p in placed:
        print(f"     {p['frame']:4d}  {p['frame'] / FPS:6.3f}  {p['name']:21s} {p['gain']:+5.1f}  "
              f"{p['anchor']:.3f}s  {p['start']:7.3f}s")
    print(f"{len(segs)} ducked speech span(s)")
    print(f"pre-master {i_pre:.1f} LUFS -> gain {gain:+.2f} dB, limiter ceiling {ceiling:.2f} dBFS")
    print(f"wrote {out}  ({dur:.3f} s, {SR} Hz stereo)")
    print(f"MEASURED: integrated {i_out:.1f} LUFS, true peak {tp_out:.1f} dBTP")


if __name__ == "__main__":
    main()
