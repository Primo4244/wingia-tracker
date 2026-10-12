"""Tileable close-range snow detail: wind ripples (sastrugi) and grain, as a normal map (RGB)
and a brightness variation (A). Spectral synthesis keeps it seamless."""
import numpy as np
from PIL import Image

N = 512
rng = np.random.default_rng(9)
ky, kx = np.meshgrid(np.fft.fftfreq(N), np.fft.fftfreq(N), indexing='ij')
k = np.hypot(kx, ky) + 1e-6

def field(power, aniso=1.0, angle=0.0):
    a = np.cos(angle) * kx + np.sin(angle) * ky
    b = -np.sin(angle) * kx + np.cos(angle) * ky
    kk = np.hypot(a * aniso, b) + 1e-6
    spec = (rng.normal(size=(N, N)) + 1j * rng.normal(size=(N, N))) * kk ** -power
    spec[0, 0] = 0
    f = np.real(np.fft.ifft2(spec))
    return (f - f.mean()) / f.std()

ripples = field(1.6, aniso=5.0, angle=0.5)       # long wind ripples
grain = field(0.9)                               # fine grain
h = 0.8 * ripples + 0.35 * grain
gy, gx = np.gradient(h)
s = 0.9
n = np.stack([-gx * s, -gy * s, np.ones_like(gx)], -1)
n /= np.linalg.norm(n, axis=-1, keepdims=True)
tone = np.clip(0.5 + 0.18 * field(1.2) + 0.08 * grain, 0, 1)
rgba = np.concatenate([(n * 0.5 + 0.5), tone[..., None]], -1)
Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save('public/world/snow-detail.png')
print('ok')
