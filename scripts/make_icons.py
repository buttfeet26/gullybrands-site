"""Favicon set in the cream look: python3 scripts/make_icons.py  ->  assets/favicon-*.png, favicon.ico,
assets/icon.svg, assets/apple-touch-icon.png, assets/icon-512.png, assets/icon-192.png"""
from PIL import Image, ImageDraw, ImageFont
PAPER, INK, PINK = (247, 239, 223), (27, 19, 22), (255, 79, 163)
F = "assets/fonts/Fraunces-Italic-VF.ttf"
def vf(size, w=400):
    f = ImageFont.truetype(F, size); f.set_variation_by_axes([144, w, 40, 1]); return f
def icon(px, radius=True):
    s = 1024; im = Image.new("RGBA", (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if radius: d.rounded_rectangle((0, 0, s - 1, s - 1), 220, fill=PAPER)
    else: d.rectangle((0, 0, s, s), fill=PAPER)
    d.text((s * .47, s * .50), "G", font=vf(760, 450), fill=INK, anchor="mm")
    d.text((s * .80, s * .25), "✦", font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 190), fill=PINK, anchor="mm")
    return im.resize((px, px), Image.LANCZOS)
icon(512).save("assets/icon-512.png"); icon(192).save("assets/icon-192.png")
icon(180, radius=False).convert("RGB").save("assets/apple-touch-icon.png")
for px in (48, 32, 16): icon(px, radius=False).convert("RGB").save(f"assets/favicon-{px}.png")
icon(64, radius=False).convert("RGB").save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
open("assets/icon.svg", "w").write(
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#F7EFDF"/>'
'<text x="30" y="46" font-family="Georgia,\'Times New Roman\',serif" font-style="italic" font-size="46" text-anchor="middle" fill="#1B1316">G</text>'
'<text x="51" y="20" font-size="13" text-anchor="middle" fill="#FF4FA3">✦</text></svg>')
open("site.webmanifest", "w").write('{"name":"Gully Brands Clothing","short_name":"Gully Brands","description":"Y2K crop tops for it girls and hopeless romantics. ₹499, free shipping across India.","start_url":"/","display":"standalone","background_color":"#F7EFDF","theme_color":"#F7EFDF","icons":[{"src":"/assets/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/assets/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}')
print("icons written")
