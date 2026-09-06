---
title: "Playbook: Veyra Inbound Triage & MRI Dispatch"
type: playbook_operativo
status: activo
domain: inbound_ventas
origin_project: "Operación Veyra Core"
author: "[[Equipo/Alejandro_Veyra]]"
created: 2026-08-21
updated: 2026-08-21
estimated_execution_time_minutes: 15
difficulty_level: basico
tags:
  - playbook
  - ventas
  - triage
  - mri
version: 1.0.0
---

# 📖 Playbook: Inbound Triage & Despacho de MRI (Paso 01 & 02)

## 🎯 Objetivo
Procesar cualquier lead entrante en `< 5 minutos`, calificar según el filtro 0% Cartón y agendar la sesión de Diagnóstico Business MRI™.

## 🛠️ Procedimiento
1. **Recepción del Webhook:** Verificar payload entrante en `/api/veyra/intake`.
2. **Validación de Criterios:**
   - Facturación o presupuesto > $1,500 USD.
   - Cargo con poder de decisión (CEO / CTO / Gerente).
3. **Despacho Automatizado:**
   - Enviar mensaje de confirmación por WhatsApp vía template aprobado de Meta.
   - Notificar al Squad en canal `#leads-hot` con score preliminar.
4. **Creación en Atlas Vault:**
   - Generar carpeta `01_Clientes/[Nuevo_Cliente]/` a partir de `Template_Ficha_Cliente`.
