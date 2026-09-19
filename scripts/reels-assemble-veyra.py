#!/usr/bin/env python3
"""
Ensamble reel Veyra: 4 escenas PNG (durations 5/8/9/8s) + crossfades + narración con apad.
Salida: reel-pro-veyra/out/veyra_mri_30s.mp4
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
WORK = ROOT / "GUAKI_CREATIVES/_pipeline/reel-pro-veyra"
SCENES = WORK / "scenes"
AUDIO = WORK / "audio"
OUT = WORK / "out"
TMP = WORK / "tmp_clips"
OUT.mkdir(exist_ok=True)
TMP.mkdir(exist_ok=True)

DUR = [5, 8, 9, 8]      # segundos por escena
XFADE = 0.5
FPS = 30
NAME = "veyra_mri_30s"


def run(cmd):
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stderr[-3000:], file=sys.stderr)
        raise SystemExit(proc.returncode)


clips = []
for i, d in enumerate(DUR):
    png = SCENES / f"s0{i + 1}.png"
    clip = TMP / f"c{i + 1}.mp4"
    run([
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(png),
        "-vf", (
            f"zoompan=z='min(zoom+0.0012,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={int(d * FPS)}:s=1080x1920:fps={FPS}"
        ),
        "-t", str(d), "-r", str(FPS),
        "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        str(clip),
    ])
    clips.append(clip)

inputs = []
for c in clips:
    inputs += ["-i", str(c)]
inputs += ["-i", str(AUDIO / f"{NAME}.mp3")]

parts = ["[0:v]setpts=PTS-STARTPTS[v0]"]
prev = "v0"
offset = DUR[0] - XFADE
for k in range(1, len(clips)):
    parts.append(f"[{k}:v]setpts=PTS-STARTPTS[v{k}]")
    parts.append(
        f"[{prev}][v{k}]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}[x{k}]"
    )
    prev = f"x{k}"
    offset += DUR[k] - XFADE

total = sum(DUR) - XFADE * (len(clips) - 1)
fg = ";".join(parts)
outfile = OUT / f"{NAME}.mp4"
run([
    "ffmpeg", "-y", *inputs,
    "-filter_complex", fg,
    "-map", f"[{prev}]", "-map", f"{len(clips)}:a",
    "-af", "apad",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-c:a", "aac", "-b:a", "128k",
    "-t", f"{total:.3f}",
    "-movflags", "+faststart",
    str(outfile),
])
print(f"OK {outfile}  ({total:.1f}s)")

for f in TMP.glob("*.mp4"):
    f.unlink()
print("tmp limpiado.")