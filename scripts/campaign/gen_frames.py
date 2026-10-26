import sys,os,json,base64,time,urllib.request
S="/tmp/claude-0/-home-user/71973502-d1de-56cd-8349-0c6aa920dee6/scratchpad"
sys.path.insert(0,S+"/camp"); from brief import B
key=[l.split("|")[2].strip() for l in open(S+"/keys/keys.txt") if l.startswith("4|")][0]
from PIL import Image
MIA_DIR="/home/user/gullybrands-site/assets/mia"
def mock(h,col):
    slug=col.lower().replace(" ","-"); m=f"{S}/shoot/mock/{h}__{slug}.jpg"; c=m.replace(".jpg","__print.jpg")
    if not os.path.exists(c): Image.open(m).crop((170,230,510,540)).save(c,quality=92)
    return m,c
def gen(out,imgs,prompt):
    if os.path.exists(out): return True
    parts=[{"inlineData":{"mimeType":"image/jpeg" if f.endswith(".jpg") else "image/png","data":base64.b64encode(open(f,"rb").read()).decode()}} for f in imgs]+[{"text":prompt}]
    body=json.dumps({"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"9:16","imageSize":"2K"}}}).encode()
    req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent",data=body,headers={"x-goog-api-key":key,"Content-Type":"application/json"})
    for a in range(3):
        try: d=json.load(urllib.request.urlopen(req,timeout=600)); break
        except urllib.error.HTTPError as e:
            print(out,"HTTP",e.code,e.read()[:200],flush=True)
            if e.code in (429,500,503) and a<2: time.sleep(60); continue
            return False
    img=[p for p in d.get("candidates",[{}])[0].get("content",{}).get("parts",[]) if "inlineData" in p]
    if not img: print(out,"no image",str(d)[:300],flush=True); return False
    open(out,"wb").write(base64.b64decode(img[0]["inlineData"]["data"])); print(out,"OK",flush=True); return True
only=sys.argv[1:]
for h,col,ref,scene,motion in B:
    if only and h not in only: continue
    m,c=mock(h,col); face=f"{MIA_DIR}/{h}__{ref}__studio.jpg"
    hair=", long glossy honey-blonde hair" if "blonde" in h else ", long dark wavy hair"
    p=("Image 1 shows the model Mia: keep her exact same face — eyes, brows, nose, full lips, bone structure"+hair+". "
       "She is a slim woman in her mid-twenties with an hourglass figure; confident adult it-girl, NOT a teenager. No necklace or chain — the chest must stay clear. "
       f"Image 2 is the exact product: a fitted {col.lower()} cropped baby tee, crew neck, short sleeves, ending at the waist. Image 3 is a close-up of its chest print. "
       "Copy the print exactly as in image 3 — same artwork, colours, text and spelling, proportions — centred on the chest at the same size as in image 2. Nothing may cover or overlap the print. "
       f"Scene: {scene}. Cinematic Lana Del Rey music-video still, 35mm film, warm grain, soft halation, romantic and a little melancholic, Pinterest it-girl. "
       "Vertical 9:16 frame, she is framed from the knees or thighs up with headroom, the print clearly visible. Photographic. No text, no captions, no watermark, no readable brand names, logos or signage anywhere.")
    gen(f"{S}/camp/img/{h}.png",[face,m,c],p)
