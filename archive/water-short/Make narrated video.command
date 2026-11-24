#!/usr/bin/env python3
"""Generate this Short's Eleven v4 voice, sync the existing picture, mix, and play."""
import base64
import hashlib
import json
import math
import os
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
FPS = 24
SOURCE_FRAMES = 1074
os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:" + os.environ.get("PATH", "")


def request(path, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"xi-api-key": key, "Content-Type": "application/json"}
    req = Request("https://api.elevenlabs.io" + path, data=data, headers=headers)
    with urlopen(req, timeout=120) as response:
        return json.load(response)


def generate(text):
    # Keep a successful take across reruns if the mix or video export fails.
    cache_tag = hashlib.sha256(("eleven_v4\n" + text).encode()).hexdigest()[:12]
    cache = ASSETS / ("eleven-v4-" + cache_tag + ".json")
    if cache.exists():
        return json.loads(cache.read_text())
    key_text = (ROOT.parents[2] / "ElevenLabs API Key.txt").read_text()
    key = re.search(r"\bsk_[a-zA-Z0-9_-]+", key_text)
    if not key:
        raise ValueError("The specified key file does not contain an ElevenLabs key.")
    # The first narrator from Ricardo's existing v4 production config.
    voice = "ZauUyVXAz5znrgRuElJ5"
    try:
        voices = request("/v2/voices?search=Animation%20Mike&page_size=100", key[0])
        for entry in voices["voices"]:
            if "animation mike" in entry["name"].casefold():
                voice = entry["voice_id"]
                break
    except HTTPError as exc:
        if exc.code not in (401, 403):
            raise
    print("Generating the tagged Eleven v4 narration…", flush=True)
    take = request("/v1/text-to-speech/" + voice + "/with-timestamps?output_format=mp3_44100_128",
                   key[0], {"text": text, "model_id": "eleven_v4", "language_code": "en"})
    with tempfile.NamedTemporaryFile(dir=ASSETS, mode="w", delete=False) as saved:
        json.dump(take, saved)
    Path(saved.name).replace(cache)
    return take


def anchors(alignment, duration):
    chars = "".join(alignment["characters"])
    starts = alignment["character_start_times_seconds"]
    if len(chars) != len(starts):
        raise ValueError("Unexpected character timing data from ElevenLabs.")
    visible = re.sub(r"\[[^\]]*\]", lambda m: " " * len(m[0]), chars)
    words = list(re.finditer(r"[^\W_]+", visible.casefold()))
    cursor = 0
    mapping = []
    cues = re.findall(r'\[(\d+), "([^"]+)"\]', (ROOT / "script.js").read_text())
    for source, caption in cues:
        tokens = re.findall(r"[^\W_]+", caption.casefold())
        spoken = words[cursor:cursor+len(tokens)]
        if [w.group() for w in spoken] != tokens:
            raise ValueError("The returned speech alignment differs at: " + caption)
        start = starts[spoken[0].start()]
        mapping.append((int(source), start if mapping else 0))
        cursor += len(tokens)
    if cursor != len(words) or not mapping:
        raise ValueError("The timing data does not match the full script.")
    mapping.append((SOURCE_FRAMES, math.ceil(duration * FPS) / FPS))
    if any(b[1] <= a[1] for a,b in zip(mapping,mapping[1:])):
        raise ValueError("ElevenLabs returned overlapping caption starts.")
    return mapping


def export(take, work, target):
    voice = work / "voice.mp3"
    voice.write_bytes(base64.b64decode(take["audio_base64"], validate=True))
    duration = float(subprocess.check_output([
        "ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(voice)
    ], text=True).strip())
    mapping = anchors(take["alignment"], duration)
    # Map original frame number to the new speech clock with linear motion between cues.
    terms = [f"clip((N-{a})/{b-a},0,1)*{end-start:.8f}"
             for (a,start),(b,end) in zip(mapping,mapping[1:])]
    pts = "+".join(terms)
    end = mapping[-1][1]
    def timing(frame):
        for (a,x),(b,y) in zip(mapping,mapping[1:]):
            if a <= frame <= b:
                return x+(frame-a)/(b-a)*(y-x)
        raise ValueError("Frame outside edit")

    filters = [f"[0:v]settb=AVTB,setpts='({pts})/TB',fps=24,tpad=stop_mode=clone:stop_duration=1[v]"]
    boundaries = [0,59,676,SOURCE_FRAMES]
    for i,(a,b) in enumerate(zip(boundaries,boundaries[1:])):
        length = timing(b) - timing(a)
        rate = (b-a) / FPS / length
        filters.append(f"[0:a]atrim=start={a/FPS}:end={b/FPS},asetpts=PTS-STARTPTS,"
                       f"atempo=sqrt({rate}),atempo=sqrt({rate}),apad,atrim=duration={length}[m{i}]")
    filters += ["[m0][m1][m2]concat=n=3:v=0:a=1,volume=0.17[bed]",
                "[1:a]loudnorm=I=-16:TP=-2:LRA=7[voice]",
                "[bed][voice]amix=inputs=2:normalize=0,alimiter=limit=0.83:level=0[a]"]
    stage = work / "narrated.mp4"
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(ROOT/"game-water.mp4"),
                    "-i",str(voice),"-filter_complex",";".join(filters),"-map","[v]","-map","[a]",
                    "-c:v","libx264","-preset","fast","-crf","18","-pix_fmt","yuv420p","-c:a","aac",
                    "-ar","48000","-b:a","192k","-t",str(end),"-movflags","+faststart",str(stage)],check=True)
    subprocess.run(["ffmpeg","-v","error","-xerror","-i",str(stage),"-map","0","-f","null","-"],check=True)
    os.replace(stage,target)


def main():
    take = generate((ROOT/"narration-v4.txt").read_text().strip())
    target = ROOT/"game-water-narrated.mp4"
    with tempfile.TemporaryDirectory(dir=ROOT) as temp:
        print("Syncing captions and picture, then mixing the voice and music…",flush=True)
        export(take,Path(temp),target)
    print(target)
    subprocess.run(["open",str(target)],check=True)


if __name__ == "__main__":
    try:
        main()
    except HTTPError as exc:
        raise SystemExit(f"ElevenLabs returned HTTP {exc.code}: {exc.reason}")
    except URLError as exc:
        raise SystemExit(f"Could not connect to ElevenLabs: {exc.reason}")
