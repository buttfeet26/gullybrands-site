"""Share image (assets/og.jpg, 1200x630) in the cream editorial look.  python3 scripts/mia/make_og.py"""
from PIL import Image, ImageDraw, ImageFont
R = "."
F_IT = R + "/assets/fonts/Fraunces-Italic-VF.ttf"; F_BB = R + "/assets/fonts/Fraunces-72pt-SuperSoft-BlackItalic.ttf"
W, H = 1200, 630; INK = (27, 19, 22); PINK = (255, 79, 163); MUTE = (122, 102, 112)
img = Image.open(R + "/assets/decor/paper.jpg").convert("RGB").resize((W, W)).crop((0, 0, W, H))

def vf(path, size, **axes):
    f = ImageFont.truetype(path, size); names = [a["name"].decode() if isinstance(a["name"], bytes) else a["name"] for a in f.get_variation_axes()]
    vals = [a["default"] for a in f.get_variation_axes()]
    for k, v in axes.items():
        if k in names: vals[names.index(k)] = v
    f.set_variation_by_axes(vals); return f

def arch(path, w, h, pos):
    im = Image.open(path).convert("RGB"); iw, ih = im.size
    im = im.crop((0, 0, iw, int(ih * .8)))                     # head + top
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; im = im.crop((x, 0, x + w, h))
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m)
    d.ellipse((0, 0, w, w), fill=255); d.rounded_rectangle((0, w // 2, w, h), 14, fill=255)
    img.paste(im, pos, m)

arch(R + "/assets/mia/crystal-bow-crop-top__black__life.jpg", 230, 470, (640, 100))
arch(R + "/assets/mia/leopard-star-crop-top__black__life.jpg", 230, 470, (900, 60))
# bow decor
bow = Image.open(R + "/assets/decor/bow.webp").convert("RGBA"); bow.thumbnail((190, 190)); bow = bow.rotate(-14, expand=True, resample=Image.BICUBIC)
img.paste(bow, (560, 400), bow)
d = ImageDraw.Draw(img)
logo = ImageFont.truetype(F_BB, 30); d.text((64, 54), "Gully", font=logo, fill=INK); d.text((64 + d.textlength("Gully ", font=logo), 54), "Brands", font=logo, fill=PINK)
lab = vf(F_IT, 16, **{"Weight":400}); d.text((66, 130), "Y2K  GRAPHIC  CROP  TOPS  ·  PRINTED  IN  INDIA", font=lab, fill=MUTE)
thin = vf(F_IT, 112, **{"Optical Size":144,"Weight":300,"Softness":40})
d.text((58, 165), "Born to be", font=thin, fill=INK)
loud = ImageFont.truetype(F_BB, 96); d.text((62, 300), "adored.", font=loud, fill=PINK)
sub = vf(F_IT, 28, **{"Optical Size":144,"Weight":300,"Softness":40}); d.text((66, 440), "crop tops for it girls & hopeless romantics", font=sub, fill=INK)
body = vf(F_IT, 20, **{"Weight":400}); d.text((66, 500), "₹499  ·  free shipping across India  ·  sizes XS–XXL", font=body, fill=MUTE)
img.save(R + "/assets/og.jpg", quality=88); print("og.jpg", img.size)
