"""Cuts one continuous voice-over take at its silences and places each line on the picture.

The take is first sped up very slightly (atempo, pitch kept), then split where it is silent;
each phrase keeps its own intonation, only the gaps between phrases change. Writes a 48 kHz
mono WAV the length of the film, the voice normalised to -16 LUFS before the final master.
Usage: place-vo.py <take> <out.wav> <seconds> <tempo> <start,start,...>
A start of "+0.3" means: 0.3 s after the previous phrase ends (two phrases in one shot).
"""
import re
import subprocess
import sys

take, out, seconds, tempo, starts = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5].split(',')
TMP = out + '.tempo.wav'

subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', take, '-af', f'highpass=f=80,atempo={tempo},aresample=48000', '-ac', '1', TMP], check=True)

log = subprocess.run(['ffmpeg', '-hide_banner', '-i', TMP, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', TMP],
                           capture_output=True, text=True).stdout)
sil = [(float(a), float(b)) for a, b in zip(re.findall(r'silence_start: ([\d.]+)', log), re.findall(r'silence_end: ([\d.]+)', log))]

# Speech = the gaps between silences; merge blips shorter than 50 ms into their neighbours.
speech, t = [], 0.0
for a, b in sil:
    if a - t > 0.05:
        speech.append([t, a])
    t = b
if dur - t > 0.05:
    speech.append([t, dur])
merged = []
for seg in speech:
    if merged and seg[0] - merged[-1][1] < 0.12:
        merged[-1][1] = seg[1]
    else:
        merged.append(seg)
print('phrases', [(round(a, 2), round(b, 2)) for a, b in merged])
assert len(merged) == len(starts), f'{len(merged)} phrases in the take, {len(starts)} placements'

pad = 0.04
placed, filters, inputs = [], [], []
prev_end = 0.0
for i, ((a, b), s) in enumerate(zip(merged, starts)):
    start = prev_end + float(s[1:]) if s.startswith('+') else float(s)
    length = b - a
    placed.append((round(start, 2), round(start + length, 2)))
    prev_end = start + length
    lo = max(0, a - pad)
    filters.append(f'[0:a]atrim={lo:.3f}:{b + pad:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b + pad - lo - 0.04:.3f}:d=0.04,adelay={int((start - (a - lo)) * 1000)}[p{i}]')
print('placed', placed)
assert prev_end <= seconds - 0.1, f'the last phrase ends at {prev_end:.2f} s, past the film'
filters.append(''.join(f'[p{i}]' for i in range(len(merged))) + f'amix=inputs={len(merged)}:normalize=0,apad,atrim=0:{seconds},loudnorm=I=-16:TP=-2:LRA=7[out]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', TMP, '-filter_complex', ';'.join(filters), '-map', '[out]', '-ar', '48000', out], check=True)
subprocess.run(['rm', TMP])
