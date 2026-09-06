---
title: "Playbook: Despliegue de Agente de Voz y Texto Omnicanal"
type: playbook_operativo
status: activo
domain: ia_prompts
origin_project: "Trinidad Router Core"
author: "[[Equipo/Santiago_AI_Lead]]"
created: 2026-08-21
updated: 2026-08-21
estimated_execution_time_minutes: 60
difficulty_level: avanzado
tags:
  - playbook
  - ia
  - whatsapp
  - whisper
  - voice
version: 1.0.0
---

# 📖 Playbook: Agente de Voz y Texto Omnicanal (WhatsApp + Whisper + Gemini)

## 🎯 Objetivo
Configurar el pipeline de recepción de notas de voz en WhatsApp, transcripción asíncrona mediante OpenAI Whisper / Gemini Audio Ingestion, y generación de respuesta contextual de texto/audio en < 3 segundos.

## 🛠️ Pipeline de Audio
```mermaid
sequenceDiagram
    participant User as Usuario WhatsApp
    participant Meta as Meta Cloud API
    participant BE as FastAPI Ingress
    participant Whisper as Gemini / Whisper Audio
    participant LLM as Gemini 1.5 Pro
    participant DB as Supabase pgvector

    User->>Meta: Envía Nota de Voz (.ogg)
    Meta->>BE: Webhook payload (media_id)
    BE->>Meta: Descargar buffer de audio
    BE->>Whisper: Transcribir audio a texto
    Whisper-->>BE: Texto transcrito
    BE->>DB: Búsqueda vectorial de contexto
    DB-->>BE: Fragmentos relevantes
    BE->>LLM: Prompt con contexto + texto transcrito
    LLM-->>BE: Respuesta estructurada
    BE->>Meta: Enviar mensaje de respuesta WhatsApp
    Meta-->>User: Entrega en chat (< 3s)
```
