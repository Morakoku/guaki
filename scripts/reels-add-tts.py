#!/usr/bin/env python3
"""
Cierra G2: añade narración EdgeTTS a los 4 reels de Guaki.

Genera 4 MP3 (uno por reel) y los muxea con ffmpeg a un nuevo MP4
con audio AAC. El video original se copia (sin re-encoding).

Output:
  reels/reel-1_lavadora.mp4         (overwrite, ahora con audio)
  reels/reel-2_cerrado.mp4          (overwrite, ahora con audio)
  reels/reel-3_3cosas.mp4           (overwrite, ahora con audio)
  reels/reel-4_sincomisiones.mp4    (overwrite, ahora con audio)
  reels/_audio/reel-1_lavadora.mp3  (narración sola, para subtítulos)
  reels/_audio/reel-2_cerrado.mp3
  reels/_audio/reel-3_3cosas.mp3
  reels/_audio/reel-4_sincomisiones.mp3
"""
import asyncio
import os
import shutil
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
REELS_DIR = ROOT / "GUAKI_CREATIVES/01_LISTO_PARA_PUBLICAR/reels"
AUDIO_DIR = REELS_DIR / "_audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Voz cálida colombiana — alinea con GUAKI_BIBLE.md §3 (tú, frases cortas, cero corporativés).
# es-CO-GonzaloNeural es la voz masculina colombiana por defecto.
VOICE = "es-CO-GonzaloNeural"

REELS = [
    {
        "video": REELS_DIR / "reel-1_lavadora.mp4",
        "text": (
            "POV: se te dañó la lavadora un domingo. "
            "¿Alguien conoce un técnico? Tres respuestas… cero teléfonos. "
            "En Guaki buscas por categoría y ciudad, y le escribes directo por WhatsApp. "
            "guaki punto online."
        ),
        "rate": "+0%",
    },
    {
        "video": REELS_DIR / "reel-2_cerrado.mp4",
        "text": (
            "Llegaste al local y estaba cerrado. "
            "El horario estaba… en un comentario de hace ocho meses. "
            "Antes de salir, mira su ficha: horarios claros y WhatsApp directo. "
            "guaki punto online."
        ),
        "rate": "+0%",
    },
    {
        "video": REELS_DIR / "reel-3_3cosas.mp4",
        "text": (
            "Tus clientes solo quieren saber tres cosas. "
            "Uno: qué haces. Dos: dónde estás. Tres: cómo te escribo. "
            "Tu ficha Guaki responde las tres y te deja WhatsApp directo. "
            "Publica tu ficha gratis. guaki punto online."
        ),
        "rate": "+0%",
    },
    {
        "video": REELS_DIR / "reel-4_sincomisiones.mp4",
        "text": (
            "POV: un cliente llegó por Guaki. "
            "Venta: ochenta mil pesos. Comisión Guaki: cero. "
            "Publica tu ficha gratis. guaki punto online."
        ),
        "rate": "+0%",
    },
]


async def synth(reel):
    mp3_path = AUDIO_DIR / (reel["video"].stem + ".mp3")
    communicate = edge_tts.Communicate(
        text=reel["text"], voice=VOICE, rate=reel["rate"]
    )
    await communicate.save(str(mp3_path))
    return mp3_path


def mux(video: Path, audio: Path, out: Path):
    # -c:v copy = sin re-encode del video; -c:a aac = encode audio AAC; -shortest = corta al más corto.
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video),
        "-i", str(audio),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        str(out),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"FFMPEG FAIL ({video.name}):\n{proc.stderr[-2000:]}", file=sys.stderr)
        raise SystemExit(proc.returncode)


async def main():
    # 1) sintetizar las 4 narraciones en paralelo
    tasks = [synth(r) for r in REELS]
    audios = await asyncio.gather(*tasks)

    # 2) muxear audio + video. Backup primero para no destruir el original sin audio.
    backup_dir = REELS_DIR / "_backup_sin_audio"
    backup_dir.mkdir(exist_ok=True)
    for reel, audio in zip(REELS, audios):
        src = reel["video"]
        bkp = backup_dir / src.name
        if not bkp.exists():
            shutil.copy2(src, bkp)
        tmp = src.with_suffix(".tmp.mp4")
        mux(src, audio, tmp)
        os.replace(tmp, src)
        print(f"OK  {src.name}  <-  {audio.name}")


if __name__ == "__main__":
    asyncio.run(main())
