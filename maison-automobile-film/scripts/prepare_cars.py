"""
Prepare the fleet photos for the film.

Usage:  python scripts/prepare_cars.py <folder with the site photos> [out_dir]
        (defaults to public/cars)

The photos come from the vehicle pages of maisonautomobile.ca (Sanity CDN,
files named <slug>-<n>.<ext>; see PHOTOS below). For each photo this script:
  1. blurs every brand logo, badge, wheel centre cap, tyre lettering and any
     licence plate (the "MAISON AUTOMOBILE" placards are the client's own
     branding and are kept),
  2. crops / resizes it to the size the film uses,
  3. writes a JPEG to public/cars/.
Blur boxes are in the ORIGINAL pixel coordinates of each photo. Re-check them
by eye whenever a photo is replaced.
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

# name -> (source file, [blur regions], crop box in original px or None, output width)
# a region is ("box", x0, y0, x1, y1) or ("disc", cx, cy, r)
PHOTOS = {
    "k4": ("kia-k4-3.png", [
        ("box", 350, 486, 460, 532),          # Kia logo on the grille
        ("disc", 892, 680, 30),               # front wheel centre cap
        ("disc", 1373, 619, 24),              # rear wheel centre cap
    ], None, 1672),
    "a3": ("audi-a3-2.jpg", [
        ("box", 448, 692, 564, 754),          # Audi rings
        ("disc", 982, 836, 28),               # front wheel centre cap
        ("disc", 1484, 804, 24),              # rear wheel centre cap
        ("box", 1048, 616, 1108, 650),        # fender badge
    ], None, 1800),
    "rav4": ("toyota-rav4-1.jpg", [
        ("box", 1205, 585, 1335, 695),        # Toyota logo
        ("disc", 624, 924, 36),               # front wheel centre cap
        ("disc", 150, 876, 34),               # rear wheel centre cap
        ("box", 640, 770, 708, 945),          # tyre lettering
    ], None, 1800),
    "gle": ("mercedes-gle-1.jpg", [
        ("box", 425, 1295, 585, 1450),        # star on the grille
        ("box", 495, 1215, 580, 1280),        # star on the bonnet
        ("box", 650, 1338, 805, 1392),        # lettering on the grille bar
        ("box", 1190, 1290, 1300, 1340),      # fender lettering
        ("disc", 1170, 1584, 50),             # front wheel centre cap
        ("disc", 1647, 1590, 44),             # rear wheel centre cap
    ], (0, 800, 1800, 2000), 1800),           # 3:2 crop around the car
    "cayenne": ("porsche-cayenne-2.jpg", [
        ("box", 1250, 528, 1400, 592),        # "Turbo GT" script
        ("box", 1130, 492, 1345, 545),        # PORSCHE lettering in the light bar
        ("disc", 300, 792, 32),               # left wheel crest
        ("disc", 708, 828, 36),               # right wheel crest
    ], None, 1800),
    "a3-night": ("audi-a3-1.jpg", [
        ("box", 328, 618, 492, 702),          # Audi rings
    ], None, 1800),
    "k4-portrait": ("kia-k4-4.jpg", [
        ("box", 2380, 3340, 2660, 3470),      # Kia logo on the grille
        ("disc", 884, 3867, 44),              # front wheel centre cap
        ("disc", 128, 3280, 30),              # rear wheel centre cap
    ], None, 2160),                           # exact 9:16 frame, kept near full resolution for the macro push
    "gle-portrait": ("mercedes-gle-1.jpg", [
        ("box", 425, 1295, 585, 1450),
        ("box", 495, 1215, 580, 1280),
        ("box", 650, 1338, 805, 1392),
        ("box", 1190, 1290, 1300, 1340),
        ("disc", 1170, 1584, 50),
        ("disc", 1647, 1590, 44),
    ], (200, 0, 1719, 2700), 1296),           # 9:16 crop around the car, for the opening pass
}


def blur_regions(im, regions):
    for kind, *a in regions:
        mask = Image.new("L", im.size, 0)
        d = ImageDraw.Draw(mask)
        if kind == "box":
            x0, y0, x1, y1 = a
            d.rounded_rectangle([x0, y0, x1, y1], radius=min(x1 - x0, y1 - y0) // 3, fill=255)
            span = max(x1 - x0, y1 - y0)
            box = (x0 - 40, y0 - 40, x1 + 40, y1 + 40)
        else:
            cx, cy, r = a
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
            span = 2 * r
            box = (cx - r - 40, cy - r - 40, cx + r + 40, cy + r + 40)
        # strong blur inside the region only, feathered edge so it does not look pasted
        blurred = im.filter(ImageFilter.GaussianBlur(max(10, span / 5)))
        feather = mask.filter(ImageFilter.GaussianBlur(max(3, span / 25)))
        im.paste(blurred, (0, 0), feather)
    return im


def main():
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join("public", "cars")
    os.makedirs(out, exist_ok=True)
    for name, (fname, regions, crop, width) in PHOTOS.items():
        path = os.path.join(src, fname)
        im = Image.open(path).convert("RGB")
        im = blur_regions(im, regions)
        if crop:
            im = im.crop(crop)
        if im.size[0] != width:
            h = round(im.size[1] * width / im.size[0])
            im = im.resize((width, h), Image.LANCZOS)
        dest = os.path.join(out, f"{name}.jpg")
        im.save(dest, quality=92, optimize=True, progressive=True)
        print(f"{name:10s} {im.size[0]}x{im.size[1]}  {os.path.getsize(dest) // 1024} KB")


if __name__ == "__main__":
    main()
