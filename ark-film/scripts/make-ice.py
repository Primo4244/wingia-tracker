"""Procedural ice texture for the DEEP COLD letters (no photo): fractal noise, cracks, frost."""
import numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(7)
W = H = 1400

def fbm(w, h, octaves=6, base=4):
    out = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = base * 2**o
        g = rng.random((n + 1, n + 1))
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(img) / 255.0)
        total += amp
        amp *= 0.5
    return out / total

base = fbm(W, H)
# Long diagonal pressure streaks, like compressed glacier ice.
yy, xx = np.mgrid[0:H, 0:W]
streak = np.sin((xx * 0.6 + yy) / 18 + fbm(W, H, 4, 3) * 9) * 0.5 + 0.5
# Cracks: thin bright ridges from the absolute value of a centred noise.
crack = 1 - np.clip(np.abs(fbm(W, H, 5, 6) - 0.5) * 22, 0, 1)
v = 0.55 * base + 0.25 * streak + 0.35 * crack**3
v = (v - v.min()) / (v.max() - v.min())

dark = np.array([0x12, 0x1A, 0x23]) / 255
mid = np.array([0x6F, 0x8A, 0xA1]) / 255
light = np.array([0xE9, 0xEE, 0xF2]) / 255
v3 = v[..., None]
rgb = np.where(v3 < 0.55, dark + (mid - dark) * (v3 / 0.55), mid + (light - mid) * ((v3 - 0.55) / 0.45))
img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=80))
img.save('public/textures/ice.jpg', quality=88)
print('ok')
