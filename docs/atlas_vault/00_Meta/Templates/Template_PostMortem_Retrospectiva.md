---
title: "Post-Mortem & Retrospectiva: {{client_name}}"
type: postmortem_retrospectiva
status: completado # [en_analisis | completado | estandarizado]
client: "[[00_Ficha_Cliente|{{client_name}}]]"
auditor_lead: "[[Equipo/{{project_lead}}]]"
date: {{date:YYYY-MM-DD}}
project_duration_days: 0
financials:
  quoted_budget_usd: 0
  actual_cost_usd: 0
  margin_achieved_pct: 0
  quoted_hours: 0
  actual_hours: 0
  hours_variance_pct: 0
playbook_harvested: true # Indica si derivo en un nuevo playbook o actualizacion
reusable_components_count: 0
tags:
  - postmortem
  - retrospectiva
  - fabricadeplaybooks
  - mejora_continua
version: 1.0.0
---

# 🔍 Retrospectiva Post-Mortem & Auditoría de Cierre (Paso 20)

> [!IMPORTANT]
> **Propósito:** Analizar la varianza del proyecto, extraer aprendizajes forenses, cosechar componentes reutilizables y alimentar la **Fábrica de Playbooks de Veyra** para acelerar futuros proyectos en +10% de velocidad y +20% de margen.

---

## ⏱️ 1. Análisis Forense de Varianza (Tiempo & Presupuesto)

| Métrica | Estimado / Cotizado | Real Ejecutado | Varianza (%) | Causa Raíz |
| :--- | :--- | :--- | :--- | :--- |
| **Tiempo de Entrega (Días)** | {{estimated_days}} d | {{actual_days}} d | `{{days_variance}}%` | {{days_variance_root_cause}} |
| **Horas Hombre Invertidas** | {{estimated_hours}} h | {{actual_hours}} h | `{{hours_variance}}%` | {{hours_variance_root_cause}} |
| **Margen de Utilidad** | {{target_margin}}% | {{actual_margin}}% | `{{margin_variance}}%` | {{margin_variance_root_cause}} |
| **Costos de APIs / Infra** | `$ {{est_infra_usd}}` | `$ {{act_infra_usd}}` | `{{infra_variance}}%` | {{infra_variance_root_cause}} |

---

## 🚦 2. Análisis Retrospectivo de 3 Preguntas Clave

### 🟢 ¿Qué funcionó de manera sobresaliente (Keep Doing)?
- {{what_went_great_1}}
- {{what_went_great_2}}

### 🔴 ¿Qué causó fricción, retraso o sobrecosto (Stop Doing)?
- **Fricción 1:** {{friction_point_1}}  
  * *Causa Raíz:* {{root_cause_1}}  
  * *Acción Preventiva:* {{preventative_action_1}}
- **Fricción 2:** {{friction_point_2}}  
  * *Causa Raíz:* {{root_cause_2}}  
  * *Acción Preventiva:* {{preventative_action_2}}

### 🟡 ¿Qué debemos empezar a hacer diferente (Start Doing)?
- {{start_doing_1}}
- {{start_doing_2}}

---

## 🌾 3. Cosecha de Componentes Reutilizables (Asset Harvesting)

> [!TIP]
> Todo módulo de código, prompt optimizado o flujo validado que sirva para futuros clientes debe registrarse aquí y moverse a `04_Componentes_Reutilizables/`.

| Componente Cosechado | Tipo | Ubicación Repositorio / Vault | Beneficio para Futuros Sprints |
| :--- | :--- | :--- | :--- |
| `{{component_name_1}}` | Backend / API | `[[04_Componentes_Reutilizables/{{comp_1_link}}]]` | Ahorro estimado: 8 horas dev |
| `{{component_name_2}}` | UI Next.js | `[[04_Componentes_Reutilizables/{{comp_2_link}}]]` | Ahorro estimado: 6 horas UI |
| `{{component_name_3}}` | Golden Prompt | `[[04_Componentes_Reutilizables/{{comp_3_link}}]]` | 0% alucinaciones en triage |

---

## 🏭 4. Disparador de la Fábrica de Playbooks (Playbook Factory Trigger)

- [ ] **Nuevo Playbook Generado:** [[03_Playbooks/{{new_playbook_name}}|{{new_playbook_name}}]]
- [ ] **Playbook Existente Actualizado:** [[03_Playbooks/{{updated_playbook_name}}|{{updated_playbook_name}}]] (Versión incrementada).
- [ ] **Skill de Agente Actualizada:** `.agents/skills/{{agent_skill_name}}` sincronizada.

---

## ✍️ Aprobación & Firma de Cierre
- **Project Lead:** `[[Equipo/{{project_lead}}]]` — Fecha: `{{date:YYYY-MM-DD}}`
- **CTO / Architect:** `[[Equipo/{{cto_name}}]]` — Estado: `APROBADO PARA PRODUCCIÓN`
