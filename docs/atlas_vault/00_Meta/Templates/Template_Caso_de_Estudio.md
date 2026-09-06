---
title: "Caso de Estudio: {{client_name}}"
type: caso_de_estudio
status: publicado # [borrador | revision | publicado]
client: "[[00_Ficha_Cliente|{{client_name}}]]"
industry: "{{industry_sector}}"
solution_deployed: "{{solution_summary}}"
metrics:
  response_time_reduction_pct: 95
  leads_conversion_increase_pct: 35
  hours_saved_weekly: 28
  roi_achieved_multiplier: 4.2
published_date: {{date:YYYY-MM-DD}}
tags:
  - caso_de_estudio
  - roi
  - marketing
  - veyra
version: 1.0.0
---

# 🏆 Caso de Estudio: Cómo {{client_name}} Automatizó su Operación con Veyra

> [!TIP]
> **Resultados Comprobados:**  
> ⚡ **-{{metrics.response_time_reduction_pct}}%** en tiempo de respuesta a leads.  
> 📈 **+{{metrics.leads_conversion_increase_pct}}%** en ventas cerradas.  
> ⏳ **{{metrics.hours_saved_weekly}} horas semanales** de trabajo manual eliminadas.

---

## 🛑 El Desafío Previo (Antes de Veyra)
{{description_of_the_chaos_and_bottlenecks_prior_to_intervention}}
- Tiempo de respuesta promedio: `{{before_response_time}}`.
- Pérdida mensual estimada en leads sin atender: `$ {{before_leakage_usd}} USD`.
- Procesos 100% manuales y desconectados.

---

## ⚡ La Intervención Veyra (La Solución)
Implementación en sprint de {{sprint_weeks}} semanas:
1. Despliegue de **Trinidad Router** y triage omnicanal instantáneo.
2. Agente conversacional con IA sobre **Supabase + Gemini 1.5**.
3. Dashboard de gestión operativa para toma de decisiones en tiempo real.

---

## 📈 Resultados Medibles (Auditoría Día 30)

| Métrica | Antes de Veyra | Con Veyra (Día 30) | Impacto |
| :--- | :--- | :--- | :--- |
| **Tiempo de Respuesta** | {{before_t1r}} | {{after_t1r}} | **{{t1r_improvement}}** |
| **Leads Procesados / Mes** | {{before_leads_volume}} | {{after_leads_volume}} | **+{{volume_increase}}%** |
| **Conversión a Venta** | {{before_conversion_rate}}% | {{after_conversion_rate}}% | **+{{conversion_boost}}%** |
| **Horas Hombre en Tareas Repetitivas** | {{before_manual_hours}} hrs | {{after_manual_hours}} hrs | **-{{hours_reduced}} hrs/sem** |

---

## 💬 Testimonio del Cliente
> *"{{client_testimonial_quote}}"*  
> — **{{client_testimonial_author}}**, {{client_testimonial_role}} en {{client_name}}.
