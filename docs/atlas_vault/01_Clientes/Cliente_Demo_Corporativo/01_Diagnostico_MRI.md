---
title: "Business MRI™ Diagnóstico: Logística Andina Express"
type: diagnostico_mri
status: aprobado
client: "[[00_Ficha_Cliente|Logística Andina Express]]"
auditor: "[[Equipo/Alejandro_Veyra]]"
audit_date: 2026-06-02
digital_maturity_score: 42
leakage_cost_usd_monthly: 4300
tags:
  - diagnostico
  - mri
  - logistica
version: 1.0.0
---

# 🩺 Business MRI™ — Logística Andina Express

> [!IMPORTANT]
> **Score de Madurez Digital Inicial:** `42 / 100`  
> **Fuga de Capital Estimada:** `$4,300 USD / mes` debida a cotizaciones lentas (demoras de 4 a 6 horas por WhatsApp), pérdida de un 32% de leads en frío y conciliación manual de guías en hojas de cálculo compartidas.

---

## 🔬 Matriz de Evaluación

### 1. Pilar A — Captación & Conversión
- **Tiempo de Primera Respuesta (T1R):** 4 horas y 18 minutos promedio.
- **Tasa de Abandono:** 32% de clientes potenciales contrataban con la competencia por falta de respuesta inmediata.
- **Canales:** WhatsApp Comercial saturado y formularios web sin notificación automática.

### 2. Pilar B — Eficiencia Operativa
- **Horas Manuales:** 34 horas semanales de coordinadores respondiendo "¿Dónde va mi envío?" y calculando tarifas a mano.
- **Costo de Fricción:** $2,800 USD en nómina dedicada a soporte transaccional repetitivo.

### 3. Pilar C — Stack Tecnológico
- Servidor legacy on-premise para tracking desconectado de WhatsApp.
- Sin base de datos relacional para CRM (usaban hojas de Excel).

### 4. Pilar D — Fuga de Capital Oculta
- Fuga mensual total calculada: **$4,300 USD / mes**.

---

## 🎯 Prescripción de Solución Veyra
- **Quick Win:** Triage automático WhatsApp con Trinidad Router en < 30 seg.
- **Core Engine:** Agente de cotización instantánea y webhook de consulta a base de datos de guías.
- **Dashboard:** Panel Next.js en tiempo real para gerencia de operaciones.
