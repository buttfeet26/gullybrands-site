"""Cut Veo clips into reels. python3 assemble.py [reel_id ...]  -> reels/out/reel-<id>.mp4 (1080x1920, 30fps, silent)"""
import subprocess, os, sys, json
from PIL import Image, ImageDraw, ImageFont
S = "/tmp/claude-0/-home-user/71973502-d1de-56cd-8349-0c6aa920dee6/scratchpad/camp"; REPO = "/home/user/gullybrands-site"
F_IT, F_BB, F_SC = REPO + "/assets/fonts/Fraunces-Italic-VF.ttf", REPO + "/assets/fonts/Fraunces-72pt-SuperSoft-BlackItalic.ttf", None
INK, PINK, PAPER = (27, 19, 22), (255, 79, 163), (247, 239, 223)
os.makedirs(S + "/out", exist_ok=True); os.makedirs(S + "/cards", exist_ok=True)
def vf(size, w=300): f = ImageFont.truetype(F_IT, size); f.set_variation_by_axes([144, w, 40, 1]); return f
def overlay(name, lines, color=PAPER, shadow=True):
    """transparent 1080x1920 PNG with centred text lines [(text, size, weight)]"""
    im = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = 1920 * .70
    for i in range(520): d.line((0, 1920 - i, 1080, 1920 - i), fill=(0, 0, 0, int(150 * (1 - i / 520) ** 1.4)))
    for text, size, w in lines:
        f = vf(size, w)
        if shadow: d.text((542, y + 3), text, font=f, fill=(0, 0, 0, 160), anchor="mm")
        d.text((540, y), text, font=f, fill=color + (255,), anchor="mm"); y += size * 1.05
    p = f"{S}/cards/{name}.png"; im.save(p); return p
def endcard():
    im = Image.open(REPO + "/assets/decor/paper.jpg").convert("RGB").resize((1080, 1080)); bg = Image.new("RGB", (1080, 1920)); bg.paste(im, (0, 0)); bg.paste(im, (0, 1080))
    d = ImageDraw.Draw(bg); bb = ImageFont.truetype(F_BB, 64)
    d.text((540 - d.textlength("Gully ", font=bb) / 2 - d.textlength("Brands", font=bb) / 2, 700), "Gully", font=bb, fill=INK, anchor="lm")
    d.text((540 - d.textlength("Gully ", font=bb) / 2 - d.textlength("Brands", font=bb) / 2 + d.textlength("Gully ", font=bb), 700), "Brands", font=bb, fill=PINK, anchor="lm")
    d.text((540, 880), "born to be adored", font=vf(120), fill=INK, anchor="mm")
    d.text((540, 1040), "₹499 · free shipping across India", font=vf(52, 400), fill=INK, anchor="mm")
    d.text((540, 1140), "shop.gullybrands.in · link in bio", font=vf(52, 400), fill=PINK, anchor="mm")
    bow = Image.open(REPO + "/assets/decor/bow.webp").convert("RGBA"); bow.thumbnail((260, 260)); bow = bow.rotate(-14, expand=True, resample=Image.BICUBIC); bg.paste(bow, (120, 1240), bow)
    p = S + "/cards/end.png"; bg.save(p); return p
GRAIN = "noise=alls=7:allf=t+u,eq=contrast=1.06:saturation=1.08"
def label(name, text):
    im = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = vf(64, 400)
    d.text((542, 1543), text, font=f, fill=(0, 0, 0, 170), anchor="mm"); d.text((540, 1540), text, font=f, fill=PAPER + (255,), anchor="mm")
    p = f"{S}/cards/lab-{name}.png"; im.save(p); return p
def reel(rid, title_lines, cuts, flash=False, labels=None):
    """cuts: [(clip, start, dur)]; labels: optional per-cut caption shown during that cut"""
    inputs, filt, n = [], [], 0
    for i, (clip, st, du) in enumerate(cuts):
        inputs += ["-ss", str(st), "-t", str(du), "-i", f"{S}/clips/{clip}.mp4"]
        filt.append(f"[{i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,setpts=PTS-STARTPTS[v{i}]"); n += 1
    end = endcard(); inputs += ["-loop", "1", "-t", "2.4", "-i", end]; filt.append(f"[{n}:v]scale=1080:1920,fps=30,setsar=1,format=yuv420p,setpts=PTS-STARTPTS[v{n}]"); n += 1
    total = sum(c[2] for c in cuts)
    filt.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cat]")
    fl = ",".join(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.85:t=fill:enable='between(t,{round(sum(c[2] for c in cuts[:k]),3)},{round(sum(c[2] for c in cuts[:k])+0.067,3)})'" for k in range(1, len(cuts))) if flash else "null"
    filt.append(f"[cat]{fl},{GRAIN}[g0]")
    ov = [(overlay(rid, title_lines), 0.3, (cuts[0][2] + 0.0) if labels else total - 0.2)]
    if labels:
        t = 0
        for k, (c, lab) in enumerate(zip(cuts, labels)):
            ov.append((label(f"{rid}-{k}", lab), t + 0.25, t + c[2] - 0.1)); t += c[2]
        ov[0] = (ov[0][0], 0.3, total - 0.2)
    cur = "g0"
    for j, (png, a_, b_) in enumerate(ov):
        inputs += ["-loop", "1", "-i", png]
        nxt = f"g{j+1}"; filt.append(f"[{cur}][{n+j}:v]overlay=0:0:enable='between(t,{round(a_,3)},{round(b_,3)})':format=auto:shortest=1[{nxt}]"); cur = nxt
    out = f"{S}/out/reel-{rid}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", f"[{cur}]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], check=True)
    print(out, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip() + "s")
# Cuts sit on a 100 BPM grid (4 beats = 2.4 s, 6 beats = 3.6 s) so any ~100 BPM song added in the IG editor lands on the cuts.
B4, B6 = 2.4, 3.6
REELS = {
 "1-old-hollywood": dict(title=[("old hollywood,", 112, 350), ("after midnight", 112, 350)], flash=True,
   cuts=[("spider-crop-top", 1.2, B4), ("leopard-star-crop-top", 1.0, B4), ("star-girl-crop-top", 1.6, B4)]),
 "2-summertime": dict(title=[("summertime,", 112, 350), ("and the living's pretty", 92, 350)], flash=True,
   cuts=[("national-anthem-kisses-crop-top", 1.2, B4), ("lucky-8-ball-crop-top", 1.2, B4), ("life-is-better-blonde-crop-top", 1.2, B4)]),
 "3-soft-sweet": dict(title=[("soft, sweet,", 112, 350), ("a little dangerous", 104, 350)], flash=True,
   cuts=[("crystal-bow-crop-top", 1.2, B4), ("life-is-better-brunette-crop-top", 1.6, B4), ("lucky-girl-crop-top", 1.2, B4)]),
 "4-adored": dict(title=[("born to be adored", 116, 350)], flash=True,
   cuts=[("circuit-de-monaco-1968-crop-top", 1.2, B4), ("8-ball-trio-crop-top", 1.4, B4), ("radio-silence-live-crop-top", 1.2, B4)]),
 "5-blonde-or-brunette": dict(title=[("which one are you?", 104, 350)], flash=True,
   cuts=[("life-is-better-blonde-crop-top", 1.0, B6), ("life-is-better-brunette-crop-top", 1.2, B6)], labels=["Life Is Better Blonde", "Life Is Better Brunette"]),
 "6-lucky": dict(title=[("which lucky are you?", 104, 350)], flash=True,
   cuts=[("lucky-girl-crop-top", 1.0, B6), ("lucky-8-ball-crop-top", 1.0, B6)], labels=["Lucky Girl", "Lucky 8 Ball"]),
 "7-sweet-or-sinister": dict(title=[("sweet or sinister?", 104, 350)], flash=True,
   cuts=[("crystal-bow-crop-top", 1.0, B6), ("spider-crop-top", 1.0, B6)], labels=["Crystal Bow", "Spider"]),
 "8-riviera-or-motel": dict(title=[("riviera or", 104, 350), ("the motel?", 104, 350)], flash=True,
   cuts=[("circuit-de-monaco-1968-crop-top", 1.0, B6), ("leopard-star-crop-top", 1.0, B6)], labels=["Circuit de Monaco", "Leopard Star"]),
}
for rid in (sys.argv[1:] or REELS):
    r = REELS[rid]; missing = [c for c, _, _ in r["cuts"] if not os.path.exists(f"{S}/clips/{c}.mp4")]
    if missing: print(rid, "waiting for", missing); continue
    reel(rid, r["title"], r["cuts"], r["flash"], r.get("labels"))
