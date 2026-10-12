"""Objective read of a voice-over take: pitch, melody per phrase, pace, timbre.
Usage: analyze-vo.py <take>"""
import re, subprocess, sys
import numpy as np

take = sys.argv[1]
SR = 16000
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', take, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32)

LINES = [("Jackets and toques, for the cold.", 7), ("The shell, the outer layer, meets the weather first.", 12),
         ("And the last layer, on top.", 7), ("In powder pink.", 4), ("Insulation holds the warmth in.", 8),
         ("Winter here is not a season.", 8), ("Link in bio.", 4)]

def yin(frame, fmin=75, fmax=450, thr=0.15):
    n = len(frame); tmax = SR // fmin; tmin = SR // fmax
    d = np.array([np.sum((frame[:n - tmax] - frame[t:n - tmax + t]) ** 2) for t in range(tmax + 1)])
    cmnd = d[1:] * np.arange(1, tmax + 1) / np.maximum(np.cumsum(d[1:]), 1e-9)
    cand = np.where(cmnd[tmin:] < thr)[0]
    if not len(cand): return np.nan
    t = cand[0] + tmin
    while t + 1 < len(cmnd) and cmnd[t + 1] < cmnd[t]: t += 1
    return SR / (t + 1)

hop, win = 160, 640
times, f0, rms = [], [], []
for i in range(0, len(x) - win, hop):
    fr = x[i:i + win]
    e = np.sqrt(np.mean(fr ** 2))
    times.append((i + win / 2) / SR); rms.append(e)
    f0.append(yin(fr) if e > 0.01 else np.nan)
times, f0, rms = map(np.array, (times, f0, rms))

log = subprocess.run(['ffmpeg', '-hide_banner', '-i', take, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
dur = len(x) / SR
sil = list(zip(map(float, re.findall(r'silence_start: ([\d.]+)', log)), map(float, re.findall(r'silence_end: ([\d.]+)', log))))
segs, t = [], 0.0
for a, b in sil:
    if a - t > 0.05: segs.append([t, a])
    t = b
if dur - t > 0.05: segs.append([t, dur])
m = []
for s_ in segs:
    if m and s_[0] - m[-1][1] < 0.12: m[-1][1] = s_[1]
    else: m.append(s_)

st = lambda hz: 12 * np.log2(hz / 100)
allv = f0[~np.isnan(f0)]
print(f'take {dur:.1f} s · median F0 {np.median(allv):.0f} Hz · range (10-90%) {st(np.percentile(allv,90)) - st(np.percentile(allv,10)):.1f} semitones')
# Spectral centroid: brightness of the timbre.
spec = np.abs(np.fft.rfft(x[: len(x) // 2048 * 2048].reshape(-1, 2048) * np.hanning(2048), axis=1))
freqs = np.fft.rfftfreq(2048, 1 / SR)
loud = spec.sum(1) > np.percentile(spec.sum(1), 40)
print(f'spectral centroid {np.sum(spec[loud] * freqs, 1).sum() / spec[loud].sum():.0f} Hz')
print()
print(f'{"line":52} {"dur":>5} {"syl/s":>6} {"medF0":>6} {"peak at":>8} {"end move":>9} {"ends"}')
for (a, b), (text, syl) in zip(m, LINES):
    sel = (times >= a) & (times <= b) & ~np.isnan(f0)
    tt, ff = times[sel], st(f0[sel])
    if len(ff) < 5:
        print(text, 'no pitch'); continue
    med = np.median(ff)
    peak = tt[np.argmax(ff)]
    # End movement: last voiced 250 ms against the 400 ms before it.
    # End movement: last quarter of the voiced frames against the quarter before it.
    q = max(2, len(ff) // 4)
    move = np.median(ff[-q:]) - np.median(ff[-2 * q:-q])
    verdict = 'falls' if move < -1 else ('RISES' if move > 1 else 'flat')
    print(f'{text:52} {b-a:5.2f} {syl/(b-a):6.1f} {100*2**(med/12):6.0f} {(peak-a)/(b-a)*100:7.0f}% {move:+8.1f}st {verdict}')
