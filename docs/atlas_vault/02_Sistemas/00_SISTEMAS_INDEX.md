---
title: Índice de Sistemas - Atlas Vault
type: index_sistemas
status: active
created: 2026-08-21
updated: 2026-08-21
tags:
  - sistemas
  - infraestructura
  - veyra
version: 1.0.0
---

# ⚙️ 02_Sistemas — Arquitectura e Infraestructura Propietaria

> [!NOTE]
> Documentación técnica profunda de las 3 plataformas maestras que componen el ecosistema Veyra / La Trinidad / Guaki.

---

## 🏛️ Las Tres Columnas Tecnológicas

```mermaid
graph TD
    subgraph "La Trinidad Router"
        TR[Trinidad Router] -->|Ingress & Triage| Veyra[DESTINATION: VEYRA]
        TR -->|Direct User| Guaki[DESTINATION: GUAKI]
    end

    subgraph "Mapache Core"
        Veyra --> MC[Mapache Core Worker Engine]
        MC -->|Background Automation| Jobs[Cron & Event Queues]
    end

    subgraph "Guaki Platform"
        Guaki --> GP[Guaki SaaS Platform]
        GP --> DB[(Supabase Shared PostgreSQL + RLS)]
    end
```

### 1. [[02_Sistemas/Mapache_Core/00_Index|Mapache_Core/]]
Motor de orquestación en background, colas asíncronas y automatización de procesos empresariales pesados.

### 2. [[02_Sistemas/Trinidad_Router/00_Index|Trinidad_Router/]]
Capa de enrutamiento omnicanal, detección de intención en tiempo real y triage inteligente de prospectos hacia Veyra o Guaki.

### 3. [[02_Sistemas/Guaki_Platform/00_Index|Guaki_Platform/]]
Plataforma SaaS multi-tenant, esquemas relacionales de Supabase, interfaces de usuario y catálogo de agentes cognitivos.
