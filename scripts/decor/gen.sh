#!/bin/bash
# Generate a decor asset with Gemini (gemini-3-pro-image).
#   GEMINI_API_KEY=... scripts/decor/gen.sh <name> <aspect> "<prompt>"   -> scripts/decor/out/<name>.png
# Ask for the object "isolated on a plain solid pure black background (hex 000000), no shadow"
# and key it with key.py. Only a key on a project with image generation enabled works
# (free-tier keys return RESOURCE_EXHAUSTED with limit 0).
set -e
[ -n "$GEMINI_API_KEY" ] || { echo "set GEMINI_API_KEY"; exit 1; }
D=$(dirname "$0")/out; mkdir -p "$D"
python3 - "$2" "$3" <<'PY' > "$D/$1.req.json"
import json,sys; ar,p=sys.argv[1:]
print(json.dumps({"contents":[{"parts":[{"text":p}]}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":ar,"imageSize":"2K"}}}))
PY
curl -s -o "$D/$1.json" -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
 "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent" -d @"$D/$1.req.json"
python3 - "$D/$1.json" "$1" <<'PY'
import json,sys,base64
f,n=sys.argv[1:]; d=json.load(open(f))
if 'error' in d: print(f"{n}: {d['error'].get('status')} {d['error'].get('message','')[:100]}"); sys.exit(1)
parts=d.get('candidates',[{}])[0].get('content',{}).get('parts',[])
img=[p for p in parts if 'inlineData' in p]
if img: open(f.replace('.json','.png'),'wb').write(base64.b64decode(img[0]['inlineData']['data'])); print(f"{n}: OK")
else: print(f"{n}: no image", str(d)[:120]); sys.exit(1)
PY
