#!/usr/bin/env python3
"""
Ensambla los reels de Guaki:
1. Cada escena PNG -> clip 4s con zoompan (Ken Burns sutil).
2. Crossfade (0.5s) entre escenas via xfade.
3. Mux narración MP3 (audio).
Salida: reel-pro/out/reel-N_*.mp4
"""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
WORK = ROOT / "GUAKI_CREATIVES/_pipeline/reel-pro"
SCENES = WORK / "scenes"
AUDIO = WORK / "audio"
OUT = WORK / "out"
TMP = WORK / "tmp_clips"
OUT.mkdir(exist_ok=True)
TMP.mkdir(exist_ok=True)

REELS = ["reel-1_lavadora", "reel-2_cerrado", "reel-3_3cosas", "reel-4_sincomisiones"]
SCENE_T = 4.0          # segundos por escena
XFADE_D = 0.5          # duración crossfade
FPS = 30


def run(cmd):
    print(">>", " ".join(str(c) for c in cmd)[:220])
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stderr[-3000:], file=sys.stderr)
        raise SystemExit(proc.returncode)


for name in REELS:
    # --- Paso 1: clips por escena (zoompan Ken Burns) ---
    clips = []
    for i in range(1, 5):
        png = SCENES / f"{name}-s0{i}.png"
        clip = TMP / f"{name}-c{i}.mp4"
        zoom = "min(zoom+0.0012,1.10)"
        vf = (
            f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={int(SCENE_T * FPS)}:s=1080x1920:fps={FPS}"
        )
        # loop input image -> single clip (sin audio)
        run([
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(png),
            "-vf", vf,
            "-t", f"{SCENE_T}",
            "-r", str(FPS),
            "-pix_fmt", "yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            str(clip),
        ])
        clips.append(clip)

    # --- Paso 2: xfade chain + audio ---
    n = len(clips)
    total_v = SCENE_T * n - XFADE_D * (n - 1)
    inputs = []
    for c in clips:
        inputs += ["-i", str(c)]
    inputs += ["-i", str(AUDIO / f"{name}.mp3")]

    # labels
    parts = [f"[0:v]setpts=PTS-STARTPTS[v0]"]
    prev = "v0"
    offset = SCENE_T - XFADE_D
    for k in range(1, n):
        parts.append(f"[{k}:v]setpts=PTS-STARTPTS[v{k}]")
        lab = f"x{k}"
        parts.append(
            f"[{prev}][v{k}]xfade=transition=fade:duration={XFADE_D}:offset={offset:.3f}[{lab}]"
        )
        prev = lab
        offset += SCENE_T - XFADE_D

    fg = ";".join(parts)
    outfile = OUT / f"{name}.mp4"
    run([
        "ffmpeg", "-y", *inputs,
        "-filter_complex", fg,
        "-map", f"[{prev}]", "-map", f"{n}:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "aac", "-b:a", "128k",
        "-t", f"{total_v:.3f}",
        "-movflags", "+faststart",
        str(outfile),
    ])
    print(f"OK  {outfile}")

# limpiar clips temporales
for f in TMP.glob("*.mp4"):
    f.unlink()
print("tmp limpiado.")