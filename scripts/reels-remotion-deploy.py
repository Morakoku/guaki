#!/usr/bin/env python3
"""
Mueve los 4 MP4 Remotion (de _remotion/out/) a su destino canónico
(GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels/). Backup previo de los Wan
originales en reels/_backup_sin_audio_remotion/ para rollback.
"""
import os
import shutil
from pathlib import Path

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
REMOTION_OUT = ROOT / "GUAKI_CREATIVES/_remotion/out"
DEST = ROOT / "GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels"
BACKUP = DEST / "_backup_sin_audio_remotion"
BACKUP.mkdir(exist_ok=True)

REELS = [
    "reel-1_lavadora",
    "reel-2_cerrado",
    "reel-3_3cosas",
    "reel-4_sincomisiones",
]

for stem in REELS:
    src = REMOTION_OUT / f"{stem}.mp4"
    dst = DEST / f"{stem}.mp4"
    if not src.exists():
        print(f"SKIP {stem}: missing")
        continue
    # backup del Wan original si existe (es el mp4 que ya tenia audio EdgeTTS de G2)
    if dst.exists():
        bkp = BACKUP / dst.name
        if not bkp.exists():
            shutil.copy2(dst, bkp)
    shutil.copy2(src, dst)
    print(f"OK   {stem}.mp4 -> {dst}")

# Limpiar frames de validación
for f in REMOTION_OUT.glob("*-frame*.jpg"):
    f.unlink()
print("Frames de validación eliminados.")
