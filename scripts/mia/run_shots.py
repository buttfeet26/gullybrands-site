"""Make every shot: Krea pose (Mia LoRA) -> Qwen 2.1 swaps in the exact product. Resumable.
usage: python3 run_shots.py [--only id-substring] [--redo-final] [--workers N]"""
import os, json, pathlib, subprocess, sys, shutil, glob, time, argparse
from concurrent.futures import ThreadPoolExecutor

S = pathlib.Path(__file__).parent
GULLY = "/home/user/gully-media/gully.py"
ap = argparse.ArgumentParser()
ap.add_argument("--only"); ap.add_argument("--workers", type=int, default=6)
ap.add_argument("--redo-final", action="store_true"); ap.add_argument("--redo-base", action="store_true")
ap.add_argument("--seed-bump", type=int, default=0)
a = ap.parse_args()
shots = [s for s in json.load(open(S / "shots.json")) if not a.only or a.only in s["id"]]

def gully(args, outdir, log):
    # Money guard: one attempt, 15-minute cap. A failure stops the whole run for a human look
    # instead of retrying into a stuck GPU queue.
    if outdir.exists(): shutil.rmtree(outdir)
    try:
        r = subprocess.run(["python3", "-I", GULLY, *args, "--out", str(outdir)],
                           capture_output=True, text=True, timeout=900)
    except subprocess.TimeoutExpired:
        log.write("TIMEOUT after 15 min\n"); log.flush(); return None
    log.write(r.stdout + r.stderr); log.flush()
    files = glob.glob(str(outdir / "*" / "*"))
    return files[0] if r.returncode == 0 and files else None

def make(s):
    d = S / "full" / s["id"]; d.mkdir(parents=True, exist_ok=True)
    log = open(d / "log.txt", "a")
    base, final = d / "base.png", d / "final.png"
    if a.redo_base and base.exists(): base.unlink()
    if (a.redo_base or a.redo_final) and final.exists(): final.unlink()
    if not base.exists():
        f = gully(["t2i", "--model", "krea2", "--identity", "mia", "--ar", "4:5", "--seed", str(s["seed"] + a.seed_bump),
                   "--prompt", s["krea"]], d / "_t2i", log)
        if not f: return s["id"], "BASE FAILED"
        shutil.copy(f, base)
    if not final.exists():
        f = gully(["edit", "--model", "qwen21", "--image", str(base), "--ref", str(S / s["ref"]),
                   "--seed", str(7 + a.seed_bump), "--prompt", s["qwen"]], d / "_edit", log)
        if not f: return s["id"], "EDIT FAILED"
        shutil.copy(f, final)
    return s["id"], "ok"

with ThreadPoolExecutor(a.workers) as ex:
    for sid, status in ex.map(make, shots):
        print(time.strftime("%H:%M:%S"), status, sid, flush=True)
        if status != "ok":
            print("STOPPING on first failure - not spending more GPU time", flush=True)
            os._exit(1)
