"""World for "The line": a real-scale alpine massif with one knife-edge arête, baked for three.js.

Outputs in public/world/:
  height.bin   float32 heights, (N+1)^2, row 0 = far edge (most negative z), metres
  albedo.jpg   snow / rock colour with strata and cavity darkening, same orientation
  normal.png   tangent-space normal map of the fine detail the mesh is too coarse to carry
  far.bin      float32 heights of the distant ranges (FN+1)^2 over FAR_SIZE metres
  line.json    the crest line, one point per metre: [x, y, z] on the rendered mesh
  meta.json    sizes, so the scene and this script agree
"""
import json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates, zoom

OUT = 'public/world/'
rng = np.random.default_rng(2026)

SIZE = 1600.0          # metres, square
N = 1024               # mesh cells per side
TEX = 2048             # texture resolution
X0, Z_FAR = -800.0, -1400.0   # x from -800 to 800, z from -1400 (far) to +200 (near)
START_Z, SUMMIT_Z = 140.0, -1120.0
FAR_SIZE, FN = 16000.0, 512

def noise(res, size):
    g = rng.random((res + 1, res + 1)).astype(np.float32)
    return zoom(g, size / res, order=3)[:size, :size]

def ridged(size, base, octaves, warp=0.05):
    out = np.zeros((size, size), np.float32)
    w = np.ones((size, size), np.float32)
    for o in range(octaves):
        n = noise(base * 2 ** o, size) * 2 - 1
        r = (1 - np.abs(n)) ** 2 * w
        w = np.clip(r * 1.9, 0, 1)
        out += r * 0.5 ** o
    out /= out.max()
    jj, ii = np.mgrid[0:size, 0:size].astype(np.float32)
    out = map_coordinates(out, [jj + (noise(4, size) - 0.5) * warp * size, ii + (noise(4, size) - 0.5) * warp * size], order=1, mode='reflect')
    return (out - out.min()) / (out.max() - out.min())

def crest_x(z):
    return 70 * np.sin(z * 0.0031) + 32 * np.sin(z * 0.0085 + 1.3) + 10 * np.sin(z * 0.021)

def crest_y(z):
    t = np.clip((START_Z - z) / (START_Z - SUMMIT_Z), 0, None)
    rise = 980 + 330 * np.minimum(t, 1) ** 1.2
    summit = 90 * np.exp(-((z - SUMMIT_Z) / 110) ** 2)
    saddle = -45 * np.exp(-((z + 470) / 70) ** 2)
    beyond = -2.2 * np.maximum(0, SUMMIT_Z - z)
    steps = 7 * np.sin(z * 0.045) + 4 * np.sin(z * 0.11)
    return rise + summit + saddle + beyond + steps

def world_height(res, fine=False):
    zs = np.linspace(Z_FAR, Z_FAR + SIZE, res)          # row 0 = far
    xs = np.linspace(X0, X0 + SIZE, res)
    X, Z = np.meshgrid(xs, zs)
    d = np.abs(X - crest_x(Z))
    cy = crest_y(Z)
    # Gullies cut into the walls, stronger lower down.
    gully = ridged(res, 10, 6, 0.03)
    # The arête: a narrow top with snow pillows, then walls of about 55-60 degrees cut by
    # couloirs and standing out in rock buttresses.
    pillows = 1.6 * (noise(140, res) - 0.5) + 0.8 * (noise(420, res) - 0.5)
    wall = 1.55 * np.maximum(0, d - 3.5) ** 1.04 * (0.85 + 0.35 * gully)
    buttress = (ridged(res, 46, 5, 0.02) - 0.45) * np.minimum(np.maximum(0, d - 4), 90) * 0.55
    arete = cy + pillows - 0.06 * np.minimum(d, 3.5) ** 2 - wall + buttress
    # Neighbouring peaks: jagged ridged relief, held down near the line so it stays clear.
    peaks = ridged(res, 3, 9, 0.06)
    hold = np.clip((d - 60) / 260, 0, 1)
    massif = 620 + 820 * peaks ** 1.6 * (0.35 + 0.65 * hold)
    h = np.maximum(arete, np.minimum(massif, cy - 40 + 400 * hold))
    if fine:
        h += (noise(400, res) - 0.5) * 2.2 + (noise(900, res) - 0.5) * 0.9
    return h.astype(np.float32), X, Z

print('mesh heights')
h_mesh, X, Z = world_height(N + 1)
h_mesh.tofile(OUT + 'height.bin')

print('textures')
h_tex, XT, ZT = world_height(TEX, fine=True)
cell = SIZE / (TEX - 1)
gz, gx = np.gradient(h_tex, cell)                      # rows = z, cols = x
nrm = np.stack([-gx, np.ones_like(gx), -gz], -1)
nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
up = nrm[..., 1]

# Snow holds where the slope allows it, more of it higher up, with drift noise.
soft_up = gaussian_filter(up, 1.5)
alt = (h_tex - 600) / 900
drift = noise(60, TEX) * 0.18 + noise(220, TEX) * 0.08
snow = np.clip((soft_up - 0.62 + drift + 0.1 * alt) * 9, 0, 1)

# Rock: dark granite with horizontal strata and lichen-cold variation.
strata = 0.5 + 0.5 * np.sin(h_tex * 0.55 + noise(30, TEX) * 6)
rock_tone = 0.75 + 0.35 * noise(300, TEX) + 0.12 * strata
rock = np.stack([0.21 * rock_tone, 0.23 * rock_tone, 0.26 * rock_tone], -1)
snow_col = np.stack([0.93 + 0 * up, 0.95 + 0 * up, 0.98 + 0 * up], -1)
cavity = np.clip((h_tex - gaussian_filter(h_tex, 4)) / 3, -1, 1)
snow_col = snow_col * (0.9 + 0.1 * cavity[..., None])
albedo = rock * (1 - snow[..., None]) + snow_col * snow[..., None]
albedo *= (0.88 + 0.12 * np.clip(cavity + 0.5, 0, 1))[..., None]
Image.fromarray((np.clip(albedo, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)).save(OUT + 'albedo.jpg', quality=90)

# Detail normal: fine height minus what the mesh already carries.
coarse = zoom(h_mesh, TEX / (N + 1), order=1)[:TEX, :TEX]
detail = h_tex - coarse
dz, dx = np.gradient(detail, cell)
tn = np.stack([-dx, dz, np.ones_like(dx)], -1)
tn /= np.linalg.norm(tn, axis=-1, keepdims=True)
Image.fromarray(((tn * 0.5 + 0.5) * 255).astype(np.uint8)).save(OUT + 'normal.png')

print('far ranges')
far = ridged(FN + 1, 5, 8, 0.05)
fz = np.linspace(-FAR_SIZE / 2 - 400, FAR_SIZE / 2 - 400, FN + 1)
fx = np.linspace(-FAR_SIZE / 2, FAR_SIZE / 2, FN + 1)
FX, FZ = np.meshgrid(fx, fz)
ring = np.clip((np.maximum(np.abs(FX), np.abs(FZ + 600)) - 900) / 1800, 0, 1)
far_h = (200 + 2200 * far ** 1.7) * ring - 300 * (1 - ring)
far_h.astype(np.float32).tofile(OUT + 'far.bin')

print('line')
def mesh_at(x, z):
    gx_ = (x - X0) / SIZE * N
    gz_ = (z - Z_FAR) / SIZE * N
    return map_coordinates(h_mesh, [[gz_], [gx_]], order=1)[0]
pts = []
zs = np.arange(START_Z, SUMMIT_Z - 1, -0.25)
xs = crest_x(zs)
seg = np.hypot(np.diff(xs), np.diff(zs))
s = np.concatenate([[0], np.cumsum(seg)])
for target in np.arange(0, s[-1], 1.0):
    i = np.searchsorted(s, target)
    i = min(max(i, 1), len(s) - 1)
    t = (target - s[i - 1]) / (s[i] - s[i - 1])
    x = xs[i - 1] + (xs[i] - xs[i - 1]) * t
    z = zs[i - 1] + (zs[i] - zs[i - 1]) * t
    pts.append([round(float(x), 3), round(float(mesh_at(x, z)), 3), round(float(z), 3)])
json.dump(pts, open(OUT + 'line.json', 'w'))
json.dump({'size': SIZE, 'n': N, 'x0': X0, 'zFar': Z_FAR, 'farSize': FAR_SIZE, 'fn': FN, 'farZ0': float(fz[0]),
           'summit': pts[-1]}, open(OUT + 'meta.json', 'w'))
print('line length', len(pts), 'm, summit', pts[-1])
