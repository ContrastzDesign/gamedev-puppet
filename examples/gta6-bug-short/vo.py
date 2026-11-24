#!/usr/bin/env python3
"""Generate the locked VO with ElevenLabs (eleven_v4, Animation Mike) and write word timings.

Outputs: audio/vo.mp3, audio/vo-take.json (raw response, cached), audio/vo-words.json.
The take is cached by text hash, so reruns never re-bill.
"""
import base64, hashlib, json, os, re, subprocess, sys
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
KEYFILE_NAME = "ElevenLabs API Key.txt"  # kept outside the repo; never committed
VOICE_FALLBACK = "ZauUyVXAz5znrgRuElJ5"  # Animation Mike, from Ricardo's v4 production config

# Locked script: Ricardo's final paste (2026-11-24), words unchanged. Bracketed tags are
# delivery directions only. "GTA VI" is sent as "GTA 6" so it is read as "six";
# captions still spell it "GTA VI".
TEXT = """[curious] Say a bug makes every car in GTA 6 fall through one bridge. To fix this you only need one line of code. But why does the patch take two weeks or even months?

[matter of fact] Why not just fix it and hit upload?

[conversational] To fix the bridge, and now boats under it hit an invisible wall. Fixing one thing broke another. This is what you call regression. So testers replay the game, not just the bridge.

Then Sony checks it against their own rulebooks. [dry delivery] Fail one rule, and you start all over again. [playful] This is why they take 10 years to build!

[warm and deliberate] The fix took ten minutes. Proving it didn't break anything took two weeks. [cheerful] Congratulations, you're now a true game developer!"""


def request(path, key, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = Request("https://api.elevenlabs.io" + path, data=data,
                  headers={"xi-api-key": key, "Content-Type": "application/json"})
    with urlopen(req, timeout=180) as r:
        return json.load(r)


def api_key():
    """ELEVENLABS_API_KEY, else the nearest 'ElevenLabs API Key.txt' in a folder above this one."""
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"]
    for d in ROOT.parents:
        if (d / KEYFILE_NAME).exists():
            return re.search(r"\bsk_[A-Za-z0-9_-]+", (d / KEYFILE_NAME).read_text())[0]
    sys.exit(f"No ElevenLabs key: set ELEVENLABS_API_KEY or put '{KEYFILE_NAME}' in a folder above the repo")


def take():
    tag = hashlib.sha256(("eleven_v4\n" + TEXT).encode()).hexdigest()[:12]
    cache = AUDIO / f"vo-take-{tag}.json"
    if cache.exists():
        return json.loads(cache.read_text())
    key = api_key()
    voice = VOICE_FALLBACK
    try:
        for v in request("/v2/voices?search=Animation%20Mike&page_size=100", key)["voices"]:
            if "animation mike" in v["name"].casefold():
                voice = v["voice_id"]; break
    except Exception as exc:  # keep the known id
        print("voice search failed, using fallback:", exc)
    print("voice", voice, flush=True)
    res = request(f"/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128", key,
                  {"text": TEXT, "model_id": "eleven_v4", "language_code": "en"})
    cache.write_text(json.dumps(res))
    return res


def words(alignment):
    chars = "".join(alignment["characters"])
    st, en = alignment["character_start_times_seconds"], alignment["character_end_times_seconds"]
    visible = re.sub(r"\[[^\]]*\]", lambda m: " " * len(m[0]), chars)
    out = []
    for m in re.finditer(r"[A-Za-z0-9']+", visible):
        out.append({"w": m.group(), "start": round(st[m.start()], 3), "end": round(en[m.end() - 1], 3)})
    return out


def main():
    res = take()
    mp3 = AUDIO / "vo.mp3"
    mp3.write_bytes(base64.b64decode(res["audio_base64"]))
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", str(mp3)], text=True))
    w = words(res["alignment"])
    (AUDIO / "vo-words.json").write_text(json.dumps({"duration": dur, "words": w}, indent=1))
    print(f"duration {dur:.2f}s, {len(w)} words")
    for x in w:
        print(f'{x["start"]:6.2f} {x["end"]:6.2f} f{round(x["start"]*24):4d}  {x["w"]}')


if __name__ == "__main__":
    main()
