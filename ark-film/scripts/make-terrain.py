"""Photographic-looking alpine terrain, rendered from a procedural heightfield (no photo).

Ridged multifractal relief with a dominant massif, snow placed by altitude and slope, cavity
darkening, lambert light from a low sun and blue-hour sky light, then a voxel-space perspective
render with atmospheric haze. Writes depth layers so the film can keep the site's parallax:
  <out>-far.png   sky + terrain beyond the split distance (opaque)
  <out>-near.png  terrain nearer than the split (transparent above its crest)
Usage: make-terrain.py <out-prefix> <preset> [--preview]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter, map_coordinates

out, preset = sys.argv[1], sys.argv[2]
preview = '--preview' in sys.argv

P = {
    # Hero summit: a telephoto view of one massif at blue hour, a dark ridge in front.
    'summit': dict(seed=11, peak=(0.5, 0.66), peak_m=4700, base_m=900, cam=(0.5, 0.06), cam_m=2000, horizon=0.47,
                   fov=24, split=0.20, near=(0.15, 1905), sun=(-0.8, 0.25, 0.32), snowline_m=1950,
                   sky=((28, 40, 53), (64, 86, 108), (150, 172, 190), (190, 205, 216)), haze=(140, 160, 180), haze_k=1.4),
    # Wind: a broad, storm-lit range, more snow in the air.
    'wind': dict(seed=23, peak=(0.36, 0.6), peak_m=4200, base_m=1100, cam=(0.52, 0.05), cam_m=2100, horizon=0.5,
                 fov=30, split=0.18, near=(0.15, 1950), sun=(-0.6, 0.2, 0.22), snowline_m=1600,
                 sky=((14, 20, 28), (34, 48, 62), (78, 98, 118), (120, 140, 158)), haze=(108, 128, 146), haze_k=0.9),
}[preset]

rng = np.random.default_rng(P['seed'])
N = 1024 if preview else 2048
WORLD = 20000.0  # metres across the map

def noise(n, size=N):
    g = rng.random((n + 1, n + 1)).astype(np.float32)
    return np.asarray(Image.fromarray(g).resize((size, size), Image.BICUBIC), dtype=np.float32)

# Ridged multifractal: sharp crests, eroded-looking flanks.
def ridged(base, octaves):
    out = np.zeros((N, N), np.float32)
    weight = np.ones((N, N), np.float32)
    for o in range(octaves):
        n = noise(base * 2**o) * 2 - 1
        r = (1 - np.abs(n)) ** 2 * weight
        weight = np.clip(r * 1.8, 0, 1)
        out += r * 0.5**o
    return out / out.max()

h = ridged(4, 9)
# Domain warp: bends the crests so they read as eroded arêtes, not a grid of bumps.
jj, ii = np.mgrid[0:N, 0:N].astype(np.float32)
warp = 0.06 * N
h = map_coordinates(h, [jj + (noise(5) - 0.5) * warp, ii + (noise(5) - 0.5) * warp], order=1, mode='reflect')
h = (h - h.min()) / (h.max() - h.min())

yy, xx = np.mgrid[0:N, 0:N].astype(np.float32) / N
px, py = P['peak']
massif = np.exp(-(((xx - px) / 0.16) ** 2 + ((yy - py) / 0.13) ** 2)) ** 0.8
ny, near_m = P['near']
# The ground falls away in front of the camera, then rises into one ridge just under its eye line.
ramp = np.clip((yy - P['cam'][1] - 0.04) / 0.3, 0, 1)
# Fine relief for the near ridge, so its crest is jagged.
h4 = ridged(24, 5)
ridge = np.exp(-(((yy - ny) / 0.03) ** 2)) * (0.9 + 0.32 * (h4 - h4.mean()) + 0.06 * noise(6))
height = P['base_m'] * h * ramp + P['peak_m'] * massif * (0.22 + 0.78 * h ** 1.25) + near_m * ridge + 250 * noise(2)
height = np.clip(height, 0, None).astype(np.float32)
HMAX = float(height.max())

# Surface: normals, slope, cavities.
cell = WORLD / N
gy, gx = np.gradient(height, cell)
nrm = np.stack([-gx, -gy, np.ones_like(gx)], -1)
nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
slope = 1 - nrm[..., 2]
# Snow settles where the terrain is gentle at the scale of a few cells, not pixel by pixel.
soft = gaussian_filter(height, 2.5)
sgy, sgx = np.gradient(soft, cell)
soft_slope = 1 - 1 / np.sqrt(1 + sgx**2 + sgy**2)
blur = gaussian_filter(height, 6)
cavity = np.clip((height - blur) / 60, -1, 1)

alt = height / HMAX
jitter = noise(64) * 0.12 + noise(200) * 0.06
snow = np.clip((height / P['snowline_m'] - 1 + jitter) * 3, 0, 1) * np.clip((0.66 - soft_slope) * 4, 0, 1)
snow = np.maximum(snow, np.clip((alt - 0.8) * 4, 0, 1) * np.clip((0.62 - soft_slope) * 4, 0, 1))


rock = np.array([42, 48, 56], np.float32) / 255 * (0.7 + 0.6 * noise(300)[..., None])
white = np.array([240, 245, 249], np.float32) / 255
albedo = rock * (1 - snow[..., None]) + white * snow[..., None]

sun = np.array(P['sun'], np.float32)
sun /= np.linalg.norm(sun)
lambert = np.clip((nrm * sun).sum(-1), 0, 1)
skylight = 0.5 + 0.5 * nrm[..., 2]
light = (np.array([1.0, 0.97, 0.94]) * 1.3 * lambert[..., None]
         + np.array([0.45, 0.56, 0.70]) * 0.95 * skylight[..., None])
color = albedo * light * (0.85 + 0.3 * cavity[..., None])
color = np.clip(color, 0, 1.2)

# Voxel-space render, back to front.
W, H = (720, 1280) if preview else (1500, 1920)
VW = 1080 * W / 1500 if not preview else W  # visible width (overscan on the full render)
f = (VW / 2) / np.tan(np.radians(P['fov'] / 2))
horizon = H * P['horizon']
cx, cy = P['cam'][0] * WORLD, P['cam'][1] * WORLD
cam_h = P['cam_m']

def sample(arr, x, y):
    i = np.clip(x / cell, 0, N - 2)
    j = np.clip(y / cell, 0, N - 2)
    i0 = i.astype(int); j0 = j.astype(int)
    fi = i - i0; fj = j - j0
    if arr.ndim == 3:
        fi = fi[:, None]; fj = fj[:, None]
    return (arr[j0, i0] * (1 - fi) * (1 - fj) + arr[j0, i0 + 1] * fi * (1 - fj)
            + arr[j0 + 1, i0] * (1 - fi) * fj + arr[j0 + 1, i0 + 1] * fi * fj)

cols = (np.arange(W) - W / 2) / f
sky_top, sky_mid, sky_low, sky_hor = [np.array(c, np.float32) / 255 for c in P['sky']]
rows = np.arange(H, dtype=np.float32)[:, None] / horizon
sky = np.where(rows < 0.55, sky_top + (sky_mid - sky_top) * (rows / 0.55),
               np.where(rows < 0.9, sky_mid + (sky_low - sky_mid) * ((rows - 0.55) / 0.35), sky_low + (sky_hor - sky_low) * np.clip((rows - 0.9) / 0.15, 0, 1)))
sky = np.broadcast_to(sky[:, None, :] if sky.ndim == 2 else sky, (H, W, 3)).copy()
haze = np.array(P['haze'], np.float32) / 255

far = sky.copy()
near_rgb = np.zeros((H, W, 3), np.float32)
near_a = np.zeros((H, W), np.float32)
row_idx = np.arange(H)[:, None]
zmax = WORLD * (0.95 - P['cam'][1])
steps = [150.0]
while steps[-1] < zmax:
    steps.append(steps[-1] + max(cell * 0.7, steps[-1] * (0.0016 if not preview else 0.003)))
zs = np.array(steps)[::-1]
split = P['split'] * WORLD
for z in zs:
    x = cx + cols * z
    y = np.full(W, cy + z)
    hgt = sample(height, x, y)
    sy = horizon - (hgt - cam_h) / z * f
    c = sample(color, x, y)
    k = 1 - np.exp(-z / (WORLD * P['haze_k']))
    c = c * (1 - k[..., None] if np.ndim(k) else 1 - k) + haze * k
    mask = row_idx >= sy[None, :]
    if z > split:
        far = np.where(mask[..., None], c[None, :, :], far)
    else:
        near_rgb = np.where(mask[..., None], c[None, :, :], near_rgb)
        near_a = np.where(mask, 1.0, near_a)

def save(arr, path, alpha=None):
    a = (np.clip(arr, 0, 1) ** (1 / 1.1) * 255).astype(np.uint8)
    img = Image.fromarray(a, 'RGB')
    if alpha is not None:
        img.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)))
    img.save(path)

save(far, f'{out}-far.png')
save(near_rgb, f'{out}-near.png', near_a)
if preview:
    comp = far * (1 - near_a[..., None]) + near_rgb * near_a[..., None]
    save(comp, f'{out}-preview.png')
print('ok', W, H)
