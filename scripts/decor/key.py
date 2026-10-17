"""Key a Gemini render made on pure black into a transparent WebP for assets/decor/.
   python3 scripts/decor/key.py <in.png> <out.webp> [threshold=40] [min_component=3000] [max_px=1200]
Brightness threshold (no flood-fill, so open shapes like a pearl strand keep their holes),
tiny components dropped, soft edge, colour un-premultiplied from black. Needs numpy, scipy, Pillow."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1:3]
thr = float(sys.argv[3]) if len(sys.argv) > 3 else 40
min_comp = int(sys.argv[4]) if len(sys.argv) > 4 else 3000
max_px = int(sys.argv[5]) if len(sys.argv) > 5 else 1200

a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
lum = a.max(axis=2)
mask = lum > thr
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool); keep[1:] = sizes >= min_comp
mask = keep[lab]
alpha = np.clip((lum - thr) / 60.0, 0, 1); alpha[~mask] = 0
alpha = ndimage.gaussian_filter(alpha, 1.5)
alpha[~ndimage.binary_dilation(mask, iterations=2)] = 0
rgb = np.clip(a / np.clip(alpha, 1e-3, 1)[..., None], 0, 255)
img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
img = img.crop(img.getbbox()); img.thumbnail((max_px, max_px))
img.save(dst, "WEBP", quality=85); print(dst, img.size)
