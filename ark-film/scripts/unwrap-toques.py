"""Turns each Bird toque packshot (front view on white) into a wrap texture for the 3D toque.

The toque is masked off the white, then every column of the mask is stretched to the full
height, so the dome becomes a rectangle: the knit and the bird graphic keep their look when
the texture is wrapped around the lathe. The back is the front mirrored.
Usage: unwrap-toques.py <packshot dir> <out dir>"""
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, binary_opening, map_coordinates

src, out = sys.argv[1], sys.argv[2]
made = {}
for f in sorted(os.listdir(src)):
    m = re.match(r'\d+-arcteryx-bird-head-toque-(.+?)(_[0-9a-f-]{20,})?\.png$', f)
    if not m:
        continue
    key = m.group(1)
    im = np.asarray(Image.open(os.path.join(src, f)).convert('RGB')).astype(np.float32) / 255
    whiteness = im.min(-1)
    spread = im.max(-1) - im.min(-1)
    mask = (whiteness < 0.88) | (spread > 0.08)
    mask = binary_fill_holes(binary_opening(mask, iterations=3))
    ys, xs = np.nonzero(mask)
    x0, x1 = np.percentile(xs, [1, 99]).astype(int)
    W, H = 512, 512
    tex = np.zeros((H, W, 3), np.float32)
    for i, x in enumerate(np.linspace(x0 + 6, x1 - 6, W)):
        col = mask[:, int(x)]
        rows = np.nonzero(col)[0]
        if len(rows) < 10:
            continue
        top, bot = rows[0] + 4, rows[-1] - 4
        yy = np.linspace(top, bot, H)
        for c in range(3):
            tex[:, i, c] = map_coordinates(im[:, :, c], [yy, np.full(H, x)], order=1)
    wrap = np.concatenate([tex, tex[:, ::-1]], axis=1)
    name = f'{key}.jpg'
    Image.fromarray((np.clip(wrap, 0, 1) * 255).astype(np.uint8)).save(os.path.join(out, name), quality=90)
    made[key] = name
json.dump(made, open(os.path.join(out, 'index.json'), 'w'), indent=1)
print(len(made), sorted(made))
