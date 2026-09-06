---
title: "Arquitectura Técnica: Logística Andina Express"
type: arquitectura_tecnica
status: implementada
client: "[[00_Ficha_Cliente|Logística Andina Express]]"
architect: "[[Equipo/Santiago_AI_Lead]]"
created: 2026-06-08
tags:
  - arquitectura
  - supabase
  - fastapi
  - gemini
version: 1.0.0
---

# 🏗️ Arquitectura Técnica Implementada: Andina Engine

```mermaid
graph LR
    Lead([Cliente WhatsApp]) --> Meta[WhatsApp Cloud API]
    Meta --> TR[Trinidad Router Webhook]
    TR --> BE[FastAPI Engine - Cloud Run]
    BE --> AI[Gemini 1.5 Flash Quotation Tool]
    BE --> DB[(Supabase DB - PostgreSQL 16 + RLS)]
    BE --> Legacy[API Guías Andina Legacy]
    FE[Next.js Dashboard - Vercel] --> DB
```

- **Base de Datos:** Supabase PostgreSQL con RLS particionado por rutas nacionales.
- **Inferencia:** Google Gemini 1.5 Flash con latencia < 700ms y función `calculate_shipping_rate(origin, destination, weight, volume)`.
