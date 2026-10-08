"""Instagram profile kit: profile photo, highlight covers, highlight story slides.
Run from repo root: python3 scripts/make_ig_kit.py  ->  instagram-kit/"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
OUT = "instagram-kit"; os.makedirs(OUT, exist_ok=True)
INK, PANEL, CREAM, DIM, PINK = (10, 10, 10), (26, 19, 23), (255, 241, 247), (201, 179, 190), (255, 79, 163)
F = "assets/fonts/"
BB = lambda s: ImageFont.truetype(F + "Fraunces-72pt-SuperSoft-BlackItalic.ttf", s)
def VF(s, w):
    f = ImageFont.truetype(F + "Fraunces-VF.ttf", s); f.set_variation_by_axes([72, w, 0, 0]); return f
SPARK = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
INTER = lambda s, w="Regular": ImageFont.truetype(f"/usr/share/fonts/opentype/inter/Inter-{w}.otf", s)
STOPS = [(0, (255, 227, 241)), (.38, (255, 140, 198)), (.52, PINK), (.62, (194, 24, 91)), (1, (255, 159, 208))]

def base(w, h, glow=True):
    img = Image.new("RGB", (w, h), INK)
    if glow:
        g = Image.new("RGB", (w, h), INK); ImageDraw.Draw(g).ellipse((-w*.4, -h*.35, w*.9, h*.35), fill=(110, 18, 64))
        img = Image.blend(img, g.filter(ImageFilter.GaussianBlur(w // 5)), .85)
    return img

def chrome(img, xy, text, font, anchor="mm"):
    d = ImageDraw.Draw(img); bb = d.textbbox(xy, text, font=font, anchor=anchor)
    w, h = bb[2] - bb[0] + 20, bb[3] - bb[1] + 20
    mask = Image.new("L", (w, h), 0); ImageDraw.Draw(mask).text((10 - bb[0] + bb[0], 10), text, font=font, fill=255, anchor="la") if False else None
    mask = Image.new("L", img.size, 0); ImageDraw.Draw(mask).text(xy, text, font=font, fill=255, anchor=anchor)
    grad = Image.new("RGB", img.size); gd = ImageDraw.Draw(grad)
    for y in range(bb[1], bb[3] + 1):
        f = (y - bb[1]) / max(1, bb[3] - bb[1])
        for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
            if a <= f <= b:
                t = (f - a) / (b - a); gd.line((0, y, img.size[0], y), fill=tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))); break
    img.paste(grad, (0, 0), mask)

# 1. profile photo (circle-cropped by IG; keep content in the middle 70%)
p = base(1080, 1080)
chrome(p, (540, 470), "GB", BB(430))
d = ImageDraw.Draw(p)
d.text((540, 760), "GULLY BRANDS", font=VF(64, 700), fill=CREAM, anchor="mm")
for x, y, s in [(300, 250, 70), (800, 300, 44), (790, 660, 56)]:
    d.text((x, y), "✦", font=SPARK(s), fill=PINK, anchor="mm")
p.save(f"{OUT}/profile-photo.jpg", quality=95)

# 2. highlight covers (story 1080x1920; IG shows the centre circle)
covers = [("shop", "Shop", "✦"), ("new", "New", "★"), ("sizes", "Sizes", "✦"), ("shipping", "Shipping", "✦"), ("faq", "FAQ", "?")]
for slug, word, mark in covers:
    c = base(1080, 1920, glow=False); d = ImageDraw.Draw(c)
    d.ellipse((190, 610, 890, 1310), fill=PANEL, outline=PINK, width=10)
    d.text((540, 830), mark, font=SPARK(150) if mark != "?" else BB(200), fill=PINK, anchor="mm")
    chrome(c, (540, 1050), word, BB(150 if len(word) < 6 else 112))
    c.save(f"{OUT}/highlight-cover-{slug}.jpg", quality=95)

# 3. highlight story slides (posted as stories, then saved to highlights)
def slide(name, title, lines, footer="shop.gullybrands.in"):
    s = base(1080, 1920); d = ImageDraw.Draw(s)
    d.text((540, 250), "Gully Brands", font=BB(64), fill=CREAM, anchor="mm")
    chrome(s, (540, 460), title, BB(150))
    y = 700
    for ln in lines:
        if ln == "":
            y += 40; continue
        bold = ln.startswith("*"); ln = ln.lstrip("*")
        d.text((540, y), ln, font=VF(56, 750) if bold else INTER(46), fill=CREAM if bold else DIM, anchor="mm"); y += 84 if bold else 70
    f = VF(48, 750); half = d.textlength(footer, font=f) / 2
    d.text((540, 1700), footer, font=f, fill=PINK, anchor="mm")
    for x in (540 - half - 50, 540 + half + 50):
        d.text((x, 1700), "✦", font=SPARK(40), fill=PINK, anchor="mm")
    s.save(f"{OUT}/story-{name}.jpg", quality=95)

slide("shipping", "Shipping.", ["*Free shipping across India", "27,000+ pin codes", "",
      "*Printed fresh for you", "Dispatched in 2–3 working days", "", "*Delivered in 5–8 days",
      "Tracking link by email", "", "*Secure online payment", "UPI · cards · net banking · wallets"])
slide("faq", "FAQ.", ["*₹499, every crop top", "Free shipping, no hidden fees", "",
      "*Fabric", "100% super-combed cotton, 180 GSM", "", "*Returns",
      "Damaged or misprinted? We replace it.", "Email us within 7 days of delivery", "",
      "*Help", "gullybrands.in@gmail.com"])
slide("shop", "Shop.", ["*12 Y2K graphic crop tops", "Coquette · Leopard · Grunge · Slogans", "",
      "*₹499 · Sizes XS–XXL", "", "*Tap the link in our bio", "or visit the site below"])
# sizes: branded size chart on a story canvas
ch = Image.open("assets/gully-sizechart.png").convert("RGB"); ch = ch.resize((1080, 1350))
s = Image.new("RGB", (1080, 1920), INK); s.paste(ch, (0, 285)); s.save(f"{OUT}/story-sizes.jpg", quality=95)
print(sorted(os.listdir(OUT)))
