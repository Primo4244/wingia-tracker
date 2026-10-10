#!/usr/bin/env bash
# Two-pass loudness master for social delivery: -14 LUFS integrated, -1 dBTP.
# Usage: scripts/master.sh in.mp4 out.mp4
set -euo pipefail
IN=$1; OUT=$2
STATS=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -hide_banner -loglevel error -y -i "$IN" -c:v copy \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -movflags +faststart "$OUT"
echo "mastered -> $OUT"
