---
title: "Playbook: Scaffolding de Motor FastAPI + Supabase + Gemini"
type: playbook_operativo
status: activo
domain: backend
origin_project: "[[01_Clientes/Cliente_Demo_Corporativo/00_Ficha_Cliente|Logística Andina Express]]"
author: "[[Equipo/Santiago_AI_Lead]]"
created: 2026-08-21
updated: 2026-08-21
estimated_execution_time_minutes: 45
difficulty_level: intermedio
tags:
  - playbook
  - backend
  - fastapi
  - supabase
  - gemini
version: 1.0.0
---

# 📖 Playbook: Scaffolding de Motor FastAPI + Supabase + Gemini

## 🎯 Objetivo
Desplegar un backend robusto en FastAPI con integración asíncrona a Supabase y capacidades de Tool Calling con Google Gemini 1.5 en menos de 45 minutos.

## 🛠️ Procedimiento
### 1. Inicialización del Entorno
```bash
python -m venv venv
source venv/bin/activate  # En Windows: .\venv\Scripts\activate
pip install fastapi uvicorn supabase google-generativeai pydantic-settings python-dotenv
```

### 2. Estructura de Proyecto
```
app/
├── core/config.py
├── db/supabase_client.py
├── services/ai_agent.py
└── api/v1/routes.py
```

### 3. Conexión Supabase Asíncrona
Utilizar el componente estandarizado [[04_Componentes_Reutilizables/00_COMPONENTES_INDEX|Supabase_Async_Client]].
