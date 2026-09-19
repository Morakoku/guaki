#!/usr/bin/env python3
"""
Muxea los MP3 de narración EdgeTTS (de reels/_audio/) a los MP4 de Remotion
(de _remotion/out/). Sobrescribe los MP4 de Remotion con versiones con audio.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
REMOTION_OUT = ROOT / "GUAKI_CREATIVES/_remotion/out"
AUDIO_DIR = ROOT / "GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels/_audio"

REELS = [
    "reel-1_lavadora",
    "reel-2_cerrado",
    "reel-3_3cosas",
    "reel-4_sincomisiones",
]


def mux(stem: str):
    video = REMOTION_OUT / f"{stem}.mp4"
    audio = AUDIO_DIR / f"{stem}.mp3"
    if not video.exists():
        print(f"SKIP {stem}: video missing", file=sys.stderr)
        return
    if not audio.exists():
        print(f"SKIP {stem}: audio missing", file=sys.stderr)
        return
    tmp = video.with_suffix(".tmp.mp4")
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video),
        "-i", str(audio),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        str(tmp),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"FAIL {stem}:\n{proc.stderr[-2000:]}", file=sys.stderr)
        return
    os.replace(tmp, video)
    print(f"OK   {stem}.mp4  +  {stem}.mp3")


for r in REELS:
    mux(r)
