#!/usr/bin/env python3
"""Narración Veyra: edge-tts es-MX-JorgeNeural (sobria, B2B) para reel V-03."""
import asyncio
from pathlib import Path

import edge_tts

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
AUDIO = ROOT / "GUAKI_CREATIVES/_pipeline/reel-pro-veyra/audio"
AUDIO.mkdir(parents=True, exist_ok=True)

VOICE = "es-MX-JorgeNeural"  # sobria/ejecutiva — decisión owner (diferencia del cálido de Guaki)
RATE = "-2%"  # un pelín más lento para autoridad

TEXTS = {
    "veyra_mri_30s": (
        "Tu empresa tiene una nota. De cero a cien. "
        "El Business MRI evalúa tu madurez operativa: cuellos de botella y prioridades "
        "con impacto estimado. Con datos, no con opiniones. "
        "Un plan claro, en catorce días hábiles. Cortesía de los datos, no del Excel. "
        "Empieza por el Chequeo Express: gratis, en cinco minutos. "
        "Veyra soluciones punto com."
    ),
}


async def main():
    for name, text in TEXTS.items():
        out = AUDIO / f"{name}.mp3"
        await edge_tts.Communicate(text=text, voice=VOICE, rate=RATE).save(str(out))
        print(f"OK  {out.name}  ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    asyncio.run(main())