---
title: "Acta de Reunión: {{session_title}} - {{client_name}}"
type: acta_reunion
status: finalizada
client: "[[00_Ficha_Cliente|{{client_name}}]]"
meeting_type: kickoff # [kickoff | discovery | sprint_sync | demo_day | handover | postmortem]
date: {{date:YYYY-MM-DD}}
time: "10:00 AM COT"
duration_minutes: 45
attendees:
  veyra:
    - "[[Equipo/{{lead_name}}]]"
    - "[[Equipo/{{ai_eng_name}}]]"
  client:
    - "{{client_attendee_1}}"
    - "{{client_attendee_2}}"
tags:
  - acta
  - sprint
  - reunion
version: 1.0.0
---

# 📝 Acta de Reunión: {{session_title}}

> [!NOTE]
> **Sesión:** {{session_title}} | **Fecha:** {{date:YYYY-MM-DD}} | **Objetivo:** {{session_objective}}

---

## 🎯 Puntos Clave Tratados en la Agenda
1. {{agenda_item_1}}
2. {{agenda_item_2}}
3. {{agenda_item_3}}

---

## 💡 Decisiones Tomadas (0% Cartón)

| Decisión | Justificación / Razón de Negocio | Responsable |
| :--- | :--- | :--- |
| {{decision_1}} | {{decision_reason_1}} | {{owner_1}} |
| {{decision_2}} | {{decision_reason_2}} | {{owner_2}} |

---

## ✅ Acuerdos y Compromisos de Acción (Action Items)

- [ ] **{{action_item_1}}** — Responsable: `{{assignee_1}}` — Fecha Límite: `{{due_date_1}}`
- [ ] **{{action_item_2}}** — Responsable: `{{assignee_2}}` — Fecha Límite: `{{due_date_2}}`
- [ ] **{{action_item_3}}** — Responsable: `{{assignee_3}}` — Fecha Límite: `{{due_date_3}}`

---

## 🎥 Grabación & Recursos
- **Grabación Loom / Meet:** [Enlace a Grabación]({{recording_url}})
- **Documento / Pizarra Miro:** [Enlace a Tablero]({{board_url}})
