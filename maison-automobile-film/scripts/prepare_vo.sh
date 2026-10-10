#!/usr/bin/env bash
# Prepare ElevenLabs voice-over lines for the film.
# Usage: scripts/prepare_vo.sh NN source.mp3 [NN source.mp3 ...]
#   -> public/audio/vo/NN.wav (48 kHz mono)
# Per line: trim leading silence (keep 20 ms), keep the natural tail
# (trailing silence capped at 250 ms), level to -18 LUFS, gentle
# compression so every line sits at the same density, 15 ms fade-in and
# 120 ms fade-out so no edit is audible.
set -euo pipefail
OUT=public/audio/vo
mkdir -p "$OUT"
while [ $# -ge 2 ]; do
  N=$1; SRC=$2; shift 2
  I=$(ffmpeg -hide_banner -nostats -i "$SRC" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
  G=$(python3 -c "print(round(-18-($I),2))")
  TMP=$(mktemp --suffix=.wav)
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" -af "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.25,areverse,volume=${G}dB,acompressor=threshold=0.2:ratio=2.5:attack=8:release=120:makeup=1,alimiter=limit=0.89:level=false,aresample=48000" -c:a pcm_s16le "$TMP"
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP")
  FO=$(python3 -c "print(max(0, round($D-0.12,3)))")
  ffmpeg -hide_banner -loglevel error -y -i "$TMP" -af "afade=t=in:d=0.015,afade=t=out:st=${FO}:d=0.12" -c:a pcm_s16le "$OUT/$N.wav"
  rm -f "$TMP"
  printf '%s  %.3fs  (%s dB)\n' "$N" "$D" "$G"
done
