"""Storm ambience for The line while the music is chosen: gusting wind, whooshes when the
drone passes close to the toques, calmer air at the summit. Usage: make-wind.py out.wav seconds"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

out, seconds = sys.argv[1], float(sys.argv[2])
SR = 48000
n = int(SR * seconds)
t = np.arange(n) / SR
rng = np.random.default_rng(4)

def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)

def env(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

storm = env([(0, 1.0), (1.5, 0.6), (9, 0.45), (11, 0.2), (15, 0.12)])
gust = 0.6 + 0.4 * np.sin(2 * np.pi * t / 2.7) * np.sin(2 * np.pi * t / 1.3 + 1)
chans = []
for c in range(2):
    w = rng.standard_normal(n)
    low = bp(w, 80, 400) * 1.2
    mid = bp(w, 400, 1800) * (0.4 + 0.6 * gust)
    hiss = bp(w, 2500, 7000) * 0.25
    # Whooshes: a rising, then falling band as the drone skims past (pass times in seconds).
    whoosh = np.zeros(n)
    for p in [1.6, 2.9, 4.1, 5.3, 6.4, 8.3, 9.4, 10.4]:
        e = np.exp(-((t - p) / 0.22) ** 2)
        whoosh += bp(rng.standard_normal(n), 600, 3500) * e * 0.9
    chans.append((low + mid + hiss) * storm + whoosh * env([(0, 0.4), (2, 1), (10, 1), (11.5, 0)]))
mix = np.stack(chans, 1)
fade = np.clip(t / 0.3, 0, 1) * np.clip((seconds - t) / 0.8, 0, 1)
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.8
wavfile.write(out, SR, mix.astype(np.float32))
print(out)
