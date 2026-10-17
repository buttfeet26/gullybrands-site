"""Instagram profile kit in the cream editorial look: profile photo, highlight covers, highlight story slides.
Run from repo root: python3 scripts/make_ig_kit.py  ->  instagram-kit/"""
from PIL import Image, ImageDraw, ImageFont
import os
OUT = "instagram-kit"; os.makedirs(OUT, exist_ok=True)
INK, PINK, MUTE, BLUSH = (27, 19, 22), (255, 79, 163), (122, 102, 112), (246, 220, 226)
F = "assets/fonts/"
BB = lambda s: ImageFont.truetype(F + "Fraunces-72pt-SuperSoft-BlackItalic.ttf", s)
def IT(s, w=300, soft=40, opsz=144):
    f = ImageFont.truetype(F + "Fraunces-Italic-VF.ttf", s); f.set_variation_by_axes([opsz, w, soft, 1]); return f
SPARK = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", s)
INTER = lambda s, w="Regular": ImageFont.truetype(f"/usr/share/fonts/opentype/inter/Inter-{w}.otf", s)
PAPER = Image.open("assets/decor/paper.jpg").convert("RGB")
BOW = Image.open("assets/decor/bow.webp").convert("RGBA")

def paper(w, h):
    t = PAPER.resize((w, w)); img = Image.new("RGB", (w, h))
    for y in range(0, h, w): img.paste(t, (0, y))
    return img

def bow(img, size, pos, angle):
    b = BOW.copy(); b.thumbnail((size, size)); b = b.rotate(angle, expand=True, resample=Image.BICUBIC); img.paste(b, pos, b)

def arch(img, path, w, h, pos, top_crop=.8):
    im = Image.open(path).convert("RGB"); iw, ih = im.size; im = im.crop((0, 0, iw, int(ih * top_crop)))
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; im = im.crop((x, 0, x + w, h))
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m); d.ellipse((0, 0, w, w), fill=255); d.rounded_rectangle((0, w // 2, w, h), 16, fill=255)
    img.paste(im, pos, m)

def logo(d, xy, size, anchor="mm"):
    f = BB(size); x, y = xy
    if anchor == "mm":
        wl = d.textlength("Gully ", font=f); wb = d.textlength("Brands", font=f); x = x - (wl + wb) / 2; anchor = "lm"
    d.text((x, y), "Gully", font=f, fill=INK, anchor=anchor); d.text((x + d.textlength("Gully ", font=f), y), "Brands", font=f, fill=PINK, anchor=anchor)

# 1. profile photo (IG crops a circle; keep content in the middle 70%)
p = paper(1080, 1080); d = ImageDraw.Draw(p)
d.text((540, 470), "GB", font=IT(520), fill=INK, anchor="mm")
bow(p, 300, (590, 560), -18)
d.text((540, 790), "it girl crop tops", font=IT(66), fill=PINK, anchor="mm")
p.save(f"{OUT}/profile-photo.jpg", quality=95)

# 2. highlight covers (1080x1920; IG shows the centre circle)
covers = [("shop", "Shop", "✦"), ("new", "New", "✦"), ("sizes", "Sizes", "XS–XXL"), ("shipping", "Shipping", "✦"), ("faq", "FAQ", "?")]
for slug, word, mark in covers:
    c = paper(1080, 1920); d = ImageDraw.Draw(c)
    d.ellipse((190, 610, 890, 1310), fill=BLUSH, outline=INK, width=4)
    d.text((540, 870), mark, font=SPARK(110) if mark == "✦" else IT(90 if len(mark) > 1 else 140, w=400), fill=PINK, anchor="mm")
    d.text((540, 1040), word, font=IT(170 if len(word) < 6 else 130), fill=INK, anchor="mm")
    c.save(f"{OUT}/highlight-cover-{slug}.jpg", quality=95)

# 3. highlight story slides
def slide(name, title, lines, photo=None, footer="shop.gullybrands.in"):
    s = paper(1080, 1920); d = ImageDraw.Draw(s)
    logo(d, (540, 200), 56)
    d.text((540, 300), "Y2K GRAPHIC CROP TOPS · PRINTED IN INDIA", font=INTER(26, "Medium"), fill=MUTE, anchor="mm")
    d.text((540, 470), title, font=IT(190), fill=INK, anchor="mm")
    y = 660
    if photo:
        arch(s, photo, 520, 640, (280, 640)); bow(s, 220, (160, 1080), -14); y = 1340
    for ln in lines:
        if ln == "": y += 30; continue
        bold = ln.startswith("*"); ln = ln.lstrip("*")
        d.text((540, y), ln, font=IT(62, w=400) if bold else INTER(42), fill=INK if bold else MUTE, anchor="mm"); y += 88 if bold else 64
    d.text((540, 1760), footer, font=IT(60, w=400), fill=PINK, anchor="mm")
    s.save(f"{OUT}/story-{name}.jpg", quality=95)

slide("shop", "The Collection", ["*Twelve prints, one price", "₹499 · Sizes XS–XXL", "", "*Tap the link in our bio"],
      photo="assets/mia/crystal-bow-crop-top__black__life.jpg")
slide("shipping", "Shipping", ["*Free shipping across India", "27,000+ pin codes", "",
      "*Printed to order", "Dispatched in 2–3 working days", "", "*Delivered in 5–8 days",
      "Tracking link by email", "", "*Secure online payment", "UPI · cards · net banking · wallets"])
slide("faq", "Questions", ["*₹499, every crop top", "Free shipping, no hidden fees", "",
      "*Fabric", "100% super-combed cotton, 180 GSM", "", "*Returns",
      "Damaged or misprinted? We replace it.", "Email us within 7 days of delivery", "",
      "*Help", "gullybrands.in@gmail.com"])
ch = Image.open("assets/gully-sizechart.png").convert("RGB"); ch.thumbnail((1000, 1250))
s = paper(1080, 1920); s.paste(ch, ((1080 - ch.width) // 2, 320)); d = ImageDraw.Draw(s); logo(d, (540, 180), 56)
d.text((540, 1720), "between sizes? size up for a relaxed fit", font=IT(52, w=400), fill=PINK, anchor="mm")
s.save(f"{OUT}/story-sizes.jpg", quality=95)
print(sorted(os.listdir(OUT)))
