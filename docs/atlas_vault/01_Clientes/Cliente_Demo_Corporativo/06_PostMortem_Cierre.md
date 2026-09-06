---
title: "Post-Mortem & Cierre: Logística Andina Express"
type: postmortem_retrospectiva
status: estandarizado
client: "[[00_Ficha_Cliente|Logística Andina Express]]"
auditor_lead: "[[Equipo/Alejandro_Veyra]]"
date: 2026-07-30
project_duration_days: 53
financials:
  quoted_budget_usd: 8500
  actual_cost_usd: 5100
  margin_achieved_pct: 40
  quoted_hours: 160
  actual_hours: 142
  hours_variance_pct: -11.25
playbook_harvested: true
reusable_components_count: 2
tags:
  - postmortem
  - retrospectiva
  - fabricadeplaybooks
version: 1.0.0
---

# 🔍 Retrospectiva Post-Mortem: Logística Andina Express

> [!IMPORTANT]
> **Resultado Financiero:** Margen del **40%**, entrega completada 3 días antes de lo proyectado y 18 horas hombre ahorradas respecto a la cotización inicial.

---

## ⏱️ 1. Análisis de Varianza

| Métrica | Estimado | Real | Varianza | Diagnóstico |
| :--- | :--- | :--- | :--- | :--- |
| **Tiempo de Entrega** | 56 días | 53 días | `-5.3%` | Ejecución acelerada en frontend gracias a componentes reutilizables de Next.js |
| **Horas Hombre** | 160 hrs | 142 hrs | `-11.2%` | La conexión de Gemini con Supabase fue más rápida de lo previsto |
| **Costos de Infra Staging** | $120 USD | $85 USD | `-29%` | Uso eficiente de tier serverless en Cloud Run |

---

## 🌾 2. Componentes Cosechados (Asset Harvesting)

1. **`Supabase_Async_Client`**: Cliente asíncrono optimizado con pool de conexiones y decorador de retry para FastAPI. Enlazado en [[04_Componentes_Reutilizables/00_COMPONENTES_INDEX|04_Componentes_Reutilizables]].
2. **`B2B_Sales_Triage_Prompt`**: Prompt maestro para clasificación de leads con extracción estructurada en JSON.

---

## 🏭 3. Playbooks Derivados / Actualizados
- Se creó el playbook: [[03_Playbooks/FastAPI_Supabase_AI_Engine_Scaffolding|FastAPI_Supabase_AI_Engine_Scaffolding]].
- Se actualizó el playbook: [[03_Playbooks/Omnichannel_WhatsApp_Voice_Agent|Omnichannel_WhatsApp_Voice_Agent]] con soporte para audios OGG nativos de WhatsApp.
