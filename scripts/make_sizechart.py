"""Branded crop-top size chart (4:5, matches the product photos). Run from repo root:
    python3 scripts/make_sizechart.py   ->  assets/gully-sizechart.png
Numbers are Qikink's crop-top garment chart (inches); cm rounded."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1600, 2000
INK, PANEL, LINE = (10, 10, 10), (26, 19, 23), (52, 38, 46)
CREAM, DIM, PINK = (255, 241, 247), (201, 179, 190), (255, 79, 163)
F = "assets/fonts/"
BB = lambda s: ImageFont.truetype(F + "Fraunces-72pt-SuperSoft-BlackItalic.ttf", s)
def VF(s, w):
    f = ImageFont.truetype(F + "Fraunces-VF.ttf", s); f.set_variation_by_axes([72, w, 0, 0]); return f
SPARK = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
INTER = lambda s, w="SemiBold": ImageFont.truetype(f"/usr/share/fonts/opentype/inter/Inter-{w}.otf", s)

SIZES = [("XS", 32, 81, 15.5, 39), ("S", 34, 86, 16.5, 42), ("M", 36, 91, 17.5, 44),
         ("L", 38, 97, 18.5, 47), ("XL", 40, 102, 19.5, 50), ("XXL", 42, 107, 20.5, 52)]

img = Image.new("RGB", (W, H), INK)
glow = Image.new("RGB", (W, H), INK); ImageDraw.Draw(glow).ellipse((-500, -700, 1100, 500), fill=(110, 18, 64))
img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(220)), .9)
d = ImageDraw.Draw(img)

def chrome_text(xy, text, font):
    """pink-chrome gradient text, like the site headline"""
    x, y = xy; bb = d.textbbox((0, 0), text, font=font); w, h = bb[2] + 10, bb[3] + 30
    mask = Image.new("L", (w, h), 0); ImageDraw.Draw(mask).text((0, 0), text, font=font, fill=255)
    grad = Image.new("RGB", (w, h)); g = ImageDraw.Draw(grad)
    stops = [(0, (255, 227, 241)), (.38, (255, 140, 198)), (.52, PINK), (.62, (194, 24, 91)), (1, (255, 159, 208))]
    for yy in range(h):
        f = yy / (h - 1)
        for (a, ca), (b, cb) in zip(stops, stops[1:]):
            if a <= f <= b:
                t = (f - a) / (b - a); g.line((0, yy, w, yy), fill=tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))); break
    img.paste(grad, (x, y), mask)

M = 110
# header
lf = BB(58); d.text((M, 86), "Gully", font=lf, fill=CREAM)
d.text((M + d.textlength("Gully ", font=lf), 86), "Brands", font=lf, fill=PINK)
tag = "CROP TOP SIZE CHART"; tf = VF(30, 650); sp = SPARK(26)
tx_ = W - M - d.textlength(tag, font=tf) - 40
d.text((tx_ - 40, 106), "✦", font=sp, fill=PINK); d.text((tx_, 104), tag, font=tf, fill=DIM); d.text((W - M - 26, 106), "✦", font=sp, fill=PINK)

# title
big = BB(170)
d.text((M, 210), "Find your", font=big, fill=CREAM)
chrome_text((M + int(d.textlength("Find your ", font=big)), 210), "fit.", big)
d.text((M + 4, 430), "Garment measurements in inches (cm in brackets)", font=INTER(40, "Regular"), fill=DIM)

# table
top, rowh = 520, 102
cols = [M, 560, 1090]                          # SIZE | CHEST | LENGTH
hf = VF(34, 700)
for x, label in zip(cols, ["SIZE", "CHEST", "LENGTH"]):
    d.text((x + 34, top), label, font=hf, fill=PINK)
d.line((M, top + 66, W - M, top + 66), fill=PINK, width=3)
y = top + 90
for i, (s, ci, cc, li, lc) in enumerate(SIZES):
    if i % 2 == 0:
        d.rounded_rectangle((M, y - 8, W - M, y + rowh - 22), 26, fill=PANEL)
    cy = y + (rowh - 30) // 2
    d.text((cols[0] + 34, cy), s, font=BB(62), fill=PINK, anchor="lm")
    for x, a, b in [(cols[1], f"{ci}″", f"({cc} cm)"), (cols[2], f"{li:g}″", f"({lc} cm)")]:
        vf = INTER(58, "Bold"); d.text((x + 34, cy), a, font=vf, fill=CREAM, anchor="lm")
        d.text((x + 34 + d.textlength(a, font=vf) + 18, cy + 6), b, font=INTER(34, "Regular"), fill=DIM, anchor="lm")
    y += rowh

# how to measure: crop-top outline with arrows
by = y + 20
d.line((M, by, W - M, by), fill=LINE, width=2)
ox, oy, s = M + 20, by + 60, 0.95
top_pts = [(130, 0), (210, 0), (230, 30), (300, 30), (320, 0), (400, 0), (500, 70), (455, 160), (410, 130),
           (410, 330), (120, 330), (120, 130), (75, 160), (30, 70)]
pts = [(ox + x * s, oy + yy * s) for x, yy in top_pts]
d.polygon(pts, fill=PANEL, outline=CREAM, width=4)
d.arc((ox + 205, oy - 30, ox + 325, oy + 50), 0, 180, fill=CREAM, width=4)
def arrow(p1, p2, label, lx, ly):
    d.line((p1, p2), fill=PINK, width=6)
    for (ax, ay), (bx, bz) in [(p1, p2), (p2, p1)]:
        import math
        ang = math.atan2(ay - bz, ax - bx)
        for da in (.45, -.45):
            d.line(((ax, ay), (ax - 26 * math.cos(ang + da), ay - 26 * math.sin(ang + da))), fill=PINK, width=6)
    d.text((lx, ly), label, font=VF(30, 750), fill=PINK)
arrow((ox + 120, oy + 143), (ox + 384, oy + 143), "CHEST", ox + 200, oy + 158)
arrow((ox + 428, oy + 27), (ox + 428, oy + 310), "LENGTH", ox + 372, oy + 326)

tx = M + 600; ty = by + 50
tips = [("Chest", "Measure around the fullest part of your chest, tape level under your arms."),
        ("Length", "From the highest point of the shoulder straight down to the hem."),
        ("Between sizes?", "Size up for a relaxed fit, stay true for a snatched one.")]
for t, body in tips:
    d.text((tx, ty), t, font=VF(40, 800), fill=CREAM); ty += 52
    words, line = body.split(), ""
    for w_ in words:                                # simple word wrap to the right column
        test = (line + " " + w_).strip()
        if d.textlength(test, font=INTER(31, "Regular")) > W - M - tx:
            d.text((tx, ty), line, font=INTER(31, "Regular"), fill=DIM); ty += 42; line = w_
        else:
            line = test
    d.text((tx, ty), line, font=INTER(31, "Regular"), fill=DIM); ty += 62

# footer
fy = H - 120
d.line((M, fy - 40, W - M, fy - 40), fill=LINE, width=2)
x_ = M
for k, part in enumerate(["180 GSM cotton", "Pre-shrunk", "Printed fresh in India"]):
    if k: d.text((x_ + 14, fy + 2), "✦", font=SPARK(24), fill=PINK); x_ += 58
    d.text((x_, fy), part, font=INTER(30, "Regular"), fill=DIM); x_ += d.textlength(part, font=INTER(30, "Regular"))
site = "shop.gullybrands.in"; sf = VF(36, 800)
d.text((W - M - d.textlength(site, font=sf), fy - 4), site, font=sf, fill=PINK)

assert ty < fy - 50, ('tips overflow', ty, fy)
img.save("assets/gully-sizechart.png", optimize=True)
print("saved", img.size)
