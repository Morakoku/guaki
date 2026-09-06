---
title: "Sistema: Mapache Core"
type: sistema_doc
status: production
maintainer: "[[Equipo/Alejandro_Veyra]]"
created: 2026-08-21
version: 2.4.0
tags:
  - sistema
  - mapache_core
  - backend
  - worker
---

# 🦝 Mapache Core — Motor de Orquestación & Background Workers

> [!INFO]
> **Mapache Core** es el motor asíncrono y orquestador de tareas de Veyra. Ejecuta flujos programados, tareas pesadas de inferencia, auditorías periódicas y sincronizaciones multicanal con tolerancia a fallos.

---

## ⚡ Capacidades Principales
- **Ejecución Asíncrona:** Workers en Python / Redis para tareas no bloqueantes.
- **Circuit Breakers & Retries:** Reintento exponencial automático ante fallos de APIs externas (OpenAI, WhatsApp, Twilio).
- **Métricas & Logs:** Telemetría integrada con Prometheus y alertas automáticas a Discord / Telegram.

---

## 🔌 Principales Endpoints y Workers
- `POST /api/v1/jobs/schedule`: Encolar tarea diferida o recurrente.
- `GET /api/v1/jobs/health`: Estado de salud de los workers activos.
