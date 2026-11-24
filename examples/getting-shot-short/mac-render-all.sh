#!/usr/bin/env bash
# Unattended Mac final render for getting-shot-short (1080x1920, 24 fps, 1267 frames).
# Requires: macOS on Apple Silicon (M1/M2+), Homebrew node + ffmpeg, and a Chrome /
# chrome-headless-shell binary (Playwright's cached shell by default, or set CHROME=).
#
# What it does:
#   1. npm install
#   2. Renders frames/f0000.png .. f1266.png with 4 Metal workers (resume-safe)
#   3. python3 mix.py  -> audio/mix.wav
#   4. ffmpeg encode   -> out/getting-shot-final.mp4  (H.264 CRF 18, yuv420p, AAC, faststart)
#
# Progress is appended to out/render.log. Re-running skips frames that already exist.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

FRAMES=1267
FPS=24
WORKERS="${WORKERS:-4}"
OUT_DIR="${OUT_DIR:-$ROOT/out}"
FRAMES_DIR="${FRAMES_DIR:-$ROOT/frames}"
LOG="$OUT_DIR/render.log"

mkdir -p "$OUT_DIR" "$FRAMES_DIR"
exec > >(tee -a "$LOG") 2>&1

echo "==== getting-shot-short mac-render-all $(date -u +%Y-%m-%dT%H:%M:%SZ) ===="
echo "ROOT=$ROOT WORKERS=$WORKERS FRAMES=$FRAMES"

# --- Chrome (Metal) ---
if [[ -z "${CHROME:-}" ]]; then
  CANDIDATES=(
    "$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell"
    "$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-headless-shell-mac-arm64/chrome-headless-shell"
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  )
  for c in "${CANDIDATES[@]}"; do
    if [[ -x "$c" ]]; then CHROME="$c"; break; fi
  done
fi
if [[ -z "${CHROME:-}" || ! -x "$CHROME" ]]; then
  echo "ERROR: no Chrome found. Install Playwright's chrome-headless-shell or set CHROME=..." >&2
  echo "  npx playwright install chromium" >&2
  exit 1
fi
export CHROME
# Metal path (do NOT set GPU=0 on the Mac)
unset GPU || true
echo "CHROME=$CHROME (Metal)"

# --- deps ---
command -v node >/dev/null || { echo "ERROR: node missing (brew install node)"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ERROR: ffmpeg missing (brew install ffmpeg)"; exit 1; }
command -v python3 >/dev/null || { echo "ERROR: python3 missing"; exit 1; }
echo "node $(node -v)  ffmpeg $(ffmpeg -version | head -1)"

if [[ ! -d node_modules/puppeteer-core ]]; then
  echo "npm install..."
  npm install
else
  echo "node_modules present"
fi

# Seed VO must be the locked take
VO_SHA="$(shasum -a 256 audio/vo.mp3 | awk '{print $1}')"
echo "vo.mp3 sha256=$VO_SHA"
if [[ "$VO_SHA" != "b3545430cbbbc40bd2a7819d5ad902e3fdf54aa9d3a8dc802dbf9cc09f7c0558" ]]; then
  echo "ERROR: audio/vo.mp3 hash mismatch — do not regenerate the VO" >&2
  exit 1
fi

# --- count existing frames ---
have=0
for ((n=0; n<FRAMES; n++)); do
  f="$FRAMES_DIR/f$(printf '%04d' "$n").png"
  if [[ -s "$f" ]]; then have=$((have+1)); fi
done
echo "existing frames: $have / $FRAMES"

# --- parallel Metal workers ---
if [[ "$have" -lt "$FRAMES" ]]; then
  echo "rendering with $WORKERS workers..."
  pids=()
  chunk=$(( (FRAMES + WORKERS - 1) / WORKERS ))
  for ((w=0; w<WORKERS; w++)); do
    a=$((w * chunk))
    b=$((a + chunk))
    if (( b > FRAMES )); then b=$FRAMES; fi
    if (( a >= FRAMES )); then break; fi
    echo "worker $w: frames $a .. $((b-1))"
    (
      export CHROME
      unset GPU || true
      node render.mjs --seq "$FRAMES_DIR" "$a" "$b"
    ) >"$OUT_DIR/worker-$w.log" 2>&1 &
    pids+=($!)
  done
  fail=0
  for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
      echo "ERROR: worker pid $pid failed — see $OUT_DIR/worker-*.log" >&2
      fail=1
    fi
  done
  if [[ "$fail" -ne 0 ]]; then exit 1; fi
else
  echo "all frames present — skipping render"
fi

# --- verify consecutive sequence ---
missing=0
for ((n=0; n<FRAMES; n++)); do
  f="$FRAMES_DIR/f$(printf '%04d' "$n").png"
  if [[ ! -s "$f" ]]; then
    echo "MISSING $f"
    missing=$((missing+1))
  fi
done
if [[ "$missing" -ne 0 ]]; then
  echo "ERROR: $missing frame(s) missing after render" >&2
  exit 1
fi
echo "frame sequence OK ($FRAMES files)"

# --- mix ---
if [[ ! -f audio/sfx/thud.wav || ! -f audio/music/sneaky-snitch.wav ]]; then
  echo "ERROR: music/SFX missing under audio/ — see CREDITS.md" >&2
  exit 1
fi
echo "mixing audio..."
python3 mix.py
if [[ ! -s audio/mix.wav ]]; then
  echo "ERROR: audio/mix.wav not written" >&2
  exit 1
fi

# --- encode ---
MP4="$OUT_DIR/getting-shot-final.mp4"
echo "encoding $MP4 ..."
ffmpeg -y -hide_banner -loglevel error \
  -framerate "$FPS" -i "$FRAMES_DIR/f%04d.png" \
  -i audio/mix.wav \
  -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r "$FPS" \
  -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  "$MP4"

echo "---- ffprobe ----"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames \
  -show_entries format=duration,size \
  -of default=noprint_wrappers=1 "$MP4"
echo "wrote $MP4"
echo "==== done $(date -u +%Y-%m-%dT%H:%M:%SZ) ===="
