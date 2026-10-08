import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S, repo = sys.argv[1], sys.argv[2]
F_BB = repo + "/assets/fonts/Fraunces-72pt-SuperSoft-BlackItalic.ttf"
F_VF = repo + "/assets/fonts/Fraunces-VF.ttf"
W, H = 1200, 630
PINK = (255, 79, 163); CREAM = (255, 241, 247)
img = Image.new("RGB", (W, H), (10, 10, 10))
# pink glow
glow = Image.new("RGB", (W, H), (10, 10, 10)); g = ImageDraw.Draw(glow)
g.ellipse((-200, -350, 800, 450), fill=(120, 20, 70)); glow = glow.filter(ImageFilter.GaussianBlur(140))
img = Image.blend(img, glow, .85)
d = ImageDraw.Draw(img)

def card(path, box, angle):
    im = Image.open(path).convert("RGB"); w, h = im.size
    im = im.crop((int(w*.06), int(h*.02), int(w*.94), int(h*.66)))          # face + top
    bw, bh = box; im = im.resize((bw, int(im.height * bw / im.width)))
    im = im.crop((0, 0, bw, min(bh, im.height)))
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, *im.size), 28, fill=255)
    tile = Image.new("RGBA", (im.width + 12, im.height + 12), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle((0, 0, im.width + 11, im.height + 11), 32, fill=PINK + (255,))
    tile.paste(im, (6, 6), m)
    return tile.rotate(angle, expand=True, resample=Image.BICUBIC)

tiles = [("8-ball-trio-crop-top__light-baby-pink__life", (230, 300), 7, (700, 60)),
         ("crystal-bow-crop-top__black__life", (230, 300), -5, (950, 140)),
         ("lucky-girl-crop-top__white__life", (230, 300), -8, (650, 300))]
for name, box, ang, pos in tiles:
    t = card(f"{repo}/assets/mia/{name}.jpg", box, ang); img.paste(t, pos, t)

d = ImageDraw.Draw(img)
logo = ImageFont.truetype(F_BB, 40)
d.text((64, 52), "Gully", font=logo, fill=CREAM); d.text((64 + d.textlength("Gully ", font=logo), 52), "Brands", font=logo, fill=PINK)
big = ImageFont.truetype(F_BB, 104)
d.text((60, 170), "Baddie Era.", font=big, fill=CREAM)
# chrome pink second line
txt = Image.new("L", (W, 140), 0); ImageDraw.Draw(txt).text((60, 0), "Made Loud.", font=big, fill=255)
grad = Image.new("RGB", (W, 140)); gd = ImageDraw.Draw(grad)
stops = [(0, (255, 227, 241)), (.38, (255, 140, 198)), (.52, PINK), (.62, (194, 24, 91)), (1, (255, 159, 208))]
for y in range(140):
    f = y / 139
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if a <= f <= b:
            t = (f - a) / (b - a); gd.line((0, y, W, y), fill=tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))); break
img.paste(grad, (0, 290), txt)
sub = ImageFont.truetype(F_VF, 30); sub.set_variation_by_axes([600]) if hasattr(sub, "set_variation_by_axes") else None
d.text((64, 455), "Y2K crop tops for baddies & it girls", font=sub, fill=CREAM)
pill = ImageFont.truetype(F_VF, 24)
x = 64
for label in ["₹499", "Free shipping India", "Printed fresh"]:
    w = d.textlength(label, font=pill) + 40
    d.rounded_rectangle((x, 520, x + w, 566), 23, outline=PINK, width=2)
    d.text((x + 20, 528), label, font=pill, fill=CREAM); x += w + 14
img.save(repo + "/assets/og.jpg", quality=88, optimize=True)

# icons: pink chrome "G" on black
for size, name in [(180, "apple-touch-icon.png"), (512, "icon-512.png"), (48, "favicon-48.png")]:
    ic = Image.new("RGB", (size, size), (10, 10, 10)); dd = ImageDraw.Draw(ic)
    f = ImageFont.truetype(F_BB, int(size * .78))
    bb = dd.textbbox((0, 0), "G", font=f)
    dd.text(((size - (bb[2] - bb[0])) / 2 - bb[0], (size - (bb[3] - bb[1])) / 2 - bb[1]), "G", font=f, fill=PINK)
    ic.save(repo + "/assets/" + name)
print("ok")
