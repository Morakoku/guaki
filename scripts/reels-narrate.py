#!/usr/bin/env python3
"""
Genera MP3 de narración (edge-tts, voz es-CO-GonzaloNeural) para los 4 reels de Guaki,
usando el caption de cada escena como guía de narración.
"""
import asyncio
import os
import sys
from pathlib import Path

import edge_tts

ROOT = Path("C:/Users/edwin/Documents/Trinidad")
WORK = ROOT / "GUAKI_CREATIVES/_pipeline/reel-pro"
AUDIO = WORK / "audio"
AUDIO.mkdir(parents=True, exist_ok=True)

VOICE = "es-CO-GonzaloNeural"
RATE = "+3%"

NARRATIONS = {
    "reel-1_lavadora": (
        "POV: se te dañó la lavadora un domingo. "
        "¿Alguien conoce un técnico? Tres respuestas… cero teléfonos. "
        "En Guaki buscas por categoría y ciudad, y le escribes directo por WhatsApp. "
        "guaki punto online."
    ),
    "reel-2_cerrado": (
        "Viajaste cuarenta minutos y el cartel dice cerrado. "
        "El horario estaba… en un comentario de hace ocho meses. "
        "Antes de salir, mira su ficha: horarios claros y WhatsApp directo. "
        "No adivines. guaki punto online."
    ),
    "reel-3_3cosas": (
        "Si tu negocio no tiene esto, estás perdiendo clientes. "
        "Tus clientes solo quieren saber tres cosas: qué haces, dónde estás y cómo te escriben. "
        "Con Guaki, WhatsApp a un clic, sin comisiones. "
        "Publica tu ficha gratis. guaki punto online."
    ),
    "reel-4_sincomisiones": (
        "POV: un cliente llegó por Guaki. "
        "Venta: ochenta mil pesos. Comisión Guaki: cero. "
        "Tú negocias y tú cobras, sin intermediarios. "
        "Cero comisión, siempre. Publica gratis. guaki punto online."
    ),
}


async def main():
    tasks = []
    for name, text in NARRATIONS.items():
        out = AUDIO / f"{name}.mp3"
        tasks.append((name, out, edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)))
    for name, out, comm in tasks:
        await comm.save(str(out))
        print(f"OK  {name}.mp3  ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    asyncio.run(main())