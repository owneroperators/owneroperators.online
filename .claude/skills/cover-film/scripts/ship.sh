#!/bin/sh
# ship.sh <film.mp4> — web-encode a cover-lab cut (1080px, crf 23) and install
# it as static/video/cover-film.mp4. Run from the site repo root. Does NOT
# commit — that stays a deliberate step.
set -e
SRC=${1:?usage: ship.sh <path-to-lab-cut.mp4>}
[ -f hugo.toml ] || { echo "ship.sh: run from the site repo root" >&2; exit 1; }
[ -f "$SRC" ] || { echo "ship.sh: no such file: $SRC" >&2; exit 1; }

TMP=$(mktemp -t coverfilm-XXXX).mp4
ffmpeg -y -loglevel error -i "$SRC" -vf "scale=1080:-2" -c:v libx264 -crf 23 \
  -preset slow -pix_fmt yuv420p -movflags +faststart "$TMP"
cp "$TMP" static/video/cover-film.mp4
rm -f "$TMP"
ls -la static/video/cover-film.mp4
echo "ship.sh: installed (not committed)"
