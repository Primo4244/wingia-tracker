"""Temporary score, synthesized: a cold drone, wind, and a pulse locked to 120 BPM.
Every cut gets a riser into a low hit exactly on the beat. Usage: make-music.py out.wav seconds cut,cut,..."""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

out, seconds, cuts = sys.argv[1], float(sys.argv[2]), [float(c) for c in sys.argv[3].split(',')]
SR, BPM = 48000, 120
BEAT = 60 / BPM
n = int(SR * seconds)
t = np.arange(n) / SR
rng = np.random.default_rng(3)

def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)

def env(start, attack, decay, length=None):
    e = np.zeros(n)
    i = int(start * SR)
    a = max(1, int(attack * SR))
    d = int((length or decay * 6) * SR)
    seg = np.concatenate([np.linspace(0, 1, a), np.exp(-np.arange(d) / (decay * SR))])
    seg = seg[: max(0, n - i)]
    e[i : i + len(seg)] = seg
    return e

# Drone: A minor, detuned, through a filter that opens across the spot.
drone = np.zeros(n)
for f, g in [(55, 1.0), (82.41, 0.6), (110, 0.5), (130.81, 0.32), (164.81, 0.22)]:
    for det in (-0.25, 0.25):
        ph = 2 * np.pi * (f + det) * t
        drone += g * (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph))
drone = lp(drone, 900) * (0.25 + 0.75 * np.clip(t / 2.5, 0, 1))

# Wind: filtered noise breathing on a slow cycle, wider than the drone.
def wind(seed):
    w = np.random.default_rng(seed).standard_normal(n)
    return bp(w, 250, 1800) * (0.55 + 0.45 * np.sin(2 * np.pi * t / 5.3 + seed))
wind_l, wind_r = wind(1), wind(2)

# Pulse: a low tom on every beat from the first cut, a muted tick off-beat.
pulse = np.zeros(n)
first = cuts[0]
b = first
while b < seconds - 0.01:
    i = int(b * SR)
    m = min(n - i, int(0.35 * SR))
    tt = np.arange(m) / SR
    freq = 46 + 40 * np.exp(-tt * 28)
    pulse[i : i + m] += 0.8 * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 9)
    j = int((b + BEAT / 2) * SR)
    if j < n:
        k = min(n - j, int(0.05 * SR))
        pulse[j : j + k] += 0.12 * bp(rng.standard_normal(k), 3000, 8000) * np.exp(-np.arange(k) / (0.008 * SR))
    b += BEAT

# Cuts: a half-second riser into a deep hit on the beat.
hits = np.zeros(n)
for c in cuts:
    i0 = int((c - 0.5) * SR)
    i1 = int(c * SR)
    if i0 > 0:
        r = np.random.default_rng(int(c * 10)).standard_normal(i1 - i0)
        ramp = np.linspace(0, 1, i1 - i0) ** 3
        hits[i0:i1] += 0.5 * bp(r, 800, 6000) * ramp
    m = min(n - i1, int(1.6 * SR))
    tt = np.arange(m) / SR
    freq = 38 + 70 * np.exp(-tt * 18)
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 2.6)
    crash = lp(np.random.default_rng(int(c * 7)).standard_normal(m), 2500) * np.exp(-tt * 5) * 0.35
    hits[i1 : i1 + m] += 1.3 * boom + crash

mix_l = 0.35 * drone + 0.22 * wind_l + 0.55 * pulse + 0.6 * hits
mix_r = 0.35 * drone + 0.22 * wind_r + 0.55 * pulse + 0.6 * hits
fade = np.clip((seconds - t) / 0.6, 0, 1)
mix = np.stack([mix_l * fade, mix_r * fade], axis=1)
mix /= np.abs(mix).max() / 0.8
wavfile.write(out, SR, mix.astype(np.float32))
print(out)
