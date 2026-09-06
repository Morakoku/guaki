---
title: "Cliente: {{client_name}}"
type: ficha_cliente
status: prospecto # [prospecto | activo | entregado | retenido | archivado]
client_id: "{{client_id}}"
lead_source: "{{lead_source}}" # [web_mri | trinidad_router | whatsapp_concierge | inbound_direct]
contract_tier: "{{contract_tier}}" # [tier_1_quick_engine | tier_2_full_mri | tier_3_fractional_cto]
budget_usd: 0
mrr_usd: 0
primary_contact:
  name: "{{contact_name}}"
  role: "{{contact_role}}"
  email: "{{contact_email}}"
  phone: "{{contact_phone}}"
squad_assigned:
  project_lead: "[[Equipo/{{lead_name}}]]"
  ai_engineer: "[[Equipo/{{ai_eng_name}}]]"
  frontend_engineer: "[[Equipo/{{front_eng_name}}]]"
  qa_specialist: "[[Equipo/{{qa_name}}]]"
dates:
  intake: {{date:YYYY-MM-DD}}
  kickoff: null
  go_live_target: null
  closed: null
tags:
  - cliente
  - veyra/operaciones
version: 1.0.0
---

# 🏢 Ficha Maestra de Cliente: {{client_name}}

> [!INFO]
> **Resumen Ejecutivo:** {{one_line_summary_of_the_client_and_challenge}}

---

## 🧭 Índice Documental del Cliente

- 🩺 **Diagnóstico Inicial:** [[01_Diagnostico_MRI|01_Diagnostico_MRI]]
- 📑 **Propuesta & Blueprint:** [[02_Propuesta_Comercial|02_Propuesta_Comercial]]
- 🏗️ **Arquitectura Técnica:** [[03_Arquitectura_Tecnica|03_Arquitectura_Tecnica]]
- 📝 **Historial de Actas & Sprints:** [[04_Actas_Reuniones|04_Actas_Reuniones]]
- 🏆 **Caso de Estudio & ROI:** [[05_Casos_de_Estudio|05_Casos_de_Estudio]]
- 🔍 **Post-Mortem & Lecciones:** [[06_PostMortem_Cierre|06_PostMortem_Cierre]]

---

## 📊 Datos Clave del Negocio

| Atributo | Detalle |
| :--- | :--- |
| **Industria / Sector** | {{industry_sector}} |
| **Tamaño de Empresa** | {{company_size}} (Empleados / Facturación Anual) |
| **Dolor Principal** | {{primary_operational_bottleneck}} |
| **Stack Actual del Cliente** | {{existing_tools_stack}} |
| **Infraestructura Desplegada** | {{cloud_and_db_infrastructure}} |
| **Estado Financiero** | 50% Anticipo `[ ]` \| 30% Hito Core `[ ]` \| 20% Liquidación `[ ]` |

---

## 🎯 Objetivos de Negocio & KPIs Clave (OKRs)

1. **Objetivo 1:** {{objective_1_description}}
   - *Métrica de Éxito:* {{metric_1}}
2. **Objetivo 2:** {{objective_2_description}}
   - *Métrica de Éxito:* {{metric_2}}

---

## 🔒 Bóveda de Accesos y Entorno Seguro

> [!WARNING]
> Nunca escribas credenciales en texto plano aquí. Enlaza al baúl seguro (Bitwarden / 1Password) bajo la referencia: `{{vault_item_id}}`.

- **Repositorio GitHub:** [GitHub Repo]({{github_repo_url}})
- **Entorno Staging:** [URL Staging]({{staging_url}})
- **Entorno Producción:** [URL Producción]({{production_url}})
- **Canal de Comunicación:** WhatsApp Concierge / Slack `{{channel_name}}`
