---
title: "Sistema: Trinidad Router"
type: sistema_doc
status: production
maintainer: "[[Equipo/Santiago_AI_Lead]]"
created: 2026-08-21
version: 3.1.0
tags:
  - sistema
  - trinidad_router
  - routing
  - triage
---

# 🌐 Trinidad Router — Enrutador Omnicanal & Triage Inteligente

> [!IMPORTANT]
> **Trinidad Router** es la puerta de entrada inteligente para todos los canales de captación (WhatsApp, Web, API). Evalúa la intención y presupuesto del usuario en tiempo real y decide el enrutamiento óptimo.

---

## 🚦 Reglas de Enrutamiento
1. **`DESTINATION: VEYRA`**: Leads corporativos con presupuesto > $1,500 USD o necesidades de automatización a medida -> Dispara alerta al squad y agenda MRI.
2. **`DESTINATION: GUAKI`**: Usuarios individuales, microempresas o adopción directa de SaaS -> Enruta al onboarding de Guaki Platform.
3. **`DESTINATION: SOPORTE`**: Clientes activos con incidencias -> Enrutamiento prioritario con SLA < 15 min.
