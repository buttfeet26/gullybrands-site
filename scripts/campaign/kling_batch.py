import sys,os,json,time,urllib.request
S="/tmp/claude-0/-home-user/71973502-d1de-56cd-8349-0c6aa920dee6/scratchpad"
sys.path.insert(0,S+"/wiro"); sys.path.insert(0,S+"/camp")
from wiro import call; from brief import B
only=sys.argv[1:]
for h,col,ref,scene,motion in B:
    if only and h not in only: continue
    out=f"{S}/camp/clips/{h}.mp4"
    if os.path.exists(out): continue
    img=f"https://shop.gullybrands.in/assets/campaign/{h}.jpg"
    p=(f"Cinematic 35mm film, Lana Del Rey music video mood. {motion}. Natural, elegant, realistic movement. "
       "Her face stays exactly the same person throughout. The printed graphic on her top stays sharp, centred and unchanged. No text, no logos.")
    for attempt in range(40):
        r=call("/Run/klingai/kling-v3",{"mode":"pro","inputImage":img,"prompt":p,"duration":"5","ratio":"9:16","sound":"off","multiShot":"false"})
        if r.get("taskid"): break
        print(h,"submit err",r.get("errors"),flush=True); time.sleep(30)
    else: continue
    tid=r["taskid"]; print(h,"task",tid,flush=True)
    while True:
        time.sleep(20)
        t=(call("/Task/Detail",{"taskid":tid}).get("tasklist") or [{}])[0]; st=t.get("status")
        if st in ("task_postprocess_end","task_cancel"): break
    urls=[o.get("url") for o in (t.get("outputs") or []) if (o.get("url") or "").endswith(".mp4")]
    if t.get("pexit")!="0" or not urls: print(h,"FAILED",(t.get("debugoutput") or "")[-300:],flush=True); continue
    open(out,"wb").write(urllib.request.urlopen(urllib.request.Request(urls[0],headers={"User-Agent":"curl/8.5.0"})).read())
    print(h,"saved",flush=True)
