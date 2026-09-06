# 👑 GUAKI — PRODUCT GOVERNANCE FRAMEWORK BIBLE v1.0
> **MARCO DE GOBIERNO DE PRODUCTO Y CICLO DE VIDA DE FUNCIONALIDADES (FEATURE LIFECYCLE GOVERNANCE)**
> **DESDE LA CONCEPCIÓN HASTA EL RETIRO O GRADUACIÓN: NADA SE CONSTRUYE SIN ALINEACIÓN DE IMPACTO, PRD ESTRUCTURADO, EVALUACIÓN DE HERMES E INGESTA EN ATLAS.**

---

## 🏛️ PARTE I — FILOSOFÍA DE GOBIERNO DE PRODUCTO

En Guaki, la construcción de producto no está guiada por impulsos, peticiones caprichosas de clientes o la intuición de un desarrollador. **El Producto Guaki es un sistema vivo optimizado para maximizar el valor del Ecosistema y reducir la fricción operativa.**

El **Framework de Product Governance** establece las reglas no negociables para evaluar, aprobar, priorizar, validar, documentar, desplegar, versionar, comunicar y retirar cualquier funcionalidad en la plataforma:

1. **El Costo del Foco (Focus Tax):** Cada nueva funcionalidad añade complejidad técnica y cognitiva. Si una función no incrementa directamente la retención (NRR), la adquisición o la eficiencia del ecosistema, **SE RECHAZA**.
2. **Evidencia Previa a Código:** Ninguna línea de código se escribe sin un PRD (Product Requirement Document) validado y un experimento empírico o prueba de concepto aprobada.
3. **Gobierno Agénico-Ejecutivo:** `Hermes OS` actúa como el Guardián de Arquitectura y Prioridades, mientras `Atlas AI Core` evalúa el impacto histórico y simula el efecto de la nueva funcionalidad en el Grafo de Conocimiento.

---

## 🔄 PARTE II — EL CICLO DE VIDA COMPLETO DE UNA FUNCIONALIDAD (9 ETAPAS)

```mermaid
flowchart TD
    PROP[1. PROPUESTA & ICE SCORE] --> EVAL[2. EVALUACIÓN DE HERMES & ATLAS]
    EVAL -->|Rechazado| REJ[FIN: Rechazo & Archivo en KB]
    EVAL -->|Aprobado| PRD[3. REDACCIÓN DE PRD & ARQUITECTURA]
    PRD --> VAL[4. VALIDACIÓN & EXPERIMENTO]
    VAL --> DEV[5. DESARROLLO SINTÉTICO/HUMANO]
    DEV --> DEP[6. DESPLIEGUE PROGRESIVO (CANARY)]
    DEP --> COM[7. COMUNICACIÓN & ANUNCIO]
    COM --> VER[8. VERSIONADO & INDEXACIÓN EN ATLAS]
    VER --> MON[9. MONITOREO & RETIRO (SUNSETTING)]
```

---

### ETAPA 1: PROPUESTA Y PRIORIZACIÓN (RICE / ICE Framework)
- **Origen:** Propuestas surgidas de `Research Agent`, feedback de clientes en `Support Agent`, necesidades de `AI Studio Enterprise` o directivas del CEO.
- **Formato Mandatorio:** Feature Request Card (FRC) de 1 página.
- **Puntuación ICE Adaptada para Guaki:**
  $$\text{ICE Score} = \frac{\text{Impacto (1-10)} \times \text{Confianza (1-10)}}{\text{Esfuerzo (1-10)}}$$
  - **Impacto:** ¿Cuánto mueve el MRR, NRR o Health Score?
  - **Confianza:** Basada en datos empíricos de Atlas (10 = Probado en experimento, 1 = Solo idea).
  - **Esfuerzo:** Días/hombre o cómputo de agente necesario para desplegar.
- **Regla de Priorización:** Se aprueban para evaluación solo las propuestas con **ICE Score > 15**.

### ETAPA 2: EVALUACIÓN Y APROBACIÓN / RECHAZO
- **Evaluador Cognitivo:** `Atlas AI Core` simula el impacto en la arquitectura de datos y verifica si la función ya fue probada en el pasado en la `Biblioteca de Experimentos`.
- **Evaluador Operativo:** `Hermes OS` verifica la disponibilidad de recursos de desarrollo y compatibilidad con el roadmap de 20 años.
- **Criterios de Aprobación (Green Light):**
  1. Mueve una métrica North Star sin degradar métricas guardrail.
  2. Es reutilizable para más de 100 proveedores o 1,000 usuarios.
  3. No genera deuda técnica inmanejable.
- **Criterios de Rechazo (Red Light / Kill):**
  1. Petición custom exclusiva para 1 solo cliente (debe ir a AI Studio como servicio custom, no a la plataforma core).
  2. Aumenta la fricción en el onboarding de WhatsApp.
  3. Duplica funcionalidades existentes en LANZA SaaS.
- **Resultado del Rechazo:** Se envía plantilla formal de respuesta al solicitante explicando el costo de oportunidad y se archiva en la `Biblioteca de Decisiones (ADRs)`.

### ETAPA 3: DOCUMENTACIÓN Y REDACCIÓN DE PRD
- **Responsable:** `Business Agent` + Líder de Producto Humano.
- **Formato:** Product Requirement Document (PRD) en Markdown.
- **Estructura Requerida:**
  - **Problema & Contexto:** Datos empíricos que respaldan la necesidad.
  - **User Stories:** Flujos de usuario final, proveedor y agente IA.
  - **Especificación Técnica:** Schemas de base de datos, APIs requeridas, Eventos Kafka a emitir.
  - **Métricas de Éxito:** Target cuantitativo a 30 y 90 días pos-lanzamiento.
  - **Plan de Rollback:** Pasos para desactivar la función si falla.

### ETAPA 4: VALIDACIÓN EMPÍRICA (Sandbox & Prototype)
- **Mecanismo:** Creación de un prototipo interactivo (Figma / Web Sandbox) o test A/B de humo (Fake Door Test).
- **Prueba de Humo:** Se muestra el botón o la opción en la UI a un 10% del tráfico antes de construir el backend. Si el CTR > 5%, se confirma la construcción del backend.

### ETAPA 5: DESARROLLO Y QUALITY ASSURANCE (QA)
- **Ejecución:** Desarrolladores humanos + Agentes de código.
- **Auditoría de Calidad:** `Argus QA Agent` ejecuta suite automatizada:
  - 100% de cobertura en tests unitarios.
  - Verificación de accesibilidad WCAG A11y.
  - Rendimiento Core Web Vitals (LCP < 2.5s, INP < 200ms).
  - Seguridad WAF y penetración básica.

### ETAPA 6: DESPLIEGUE PROGRESIVO (Canary / Feature Flags)
- **Estrategia de Despliegue:**
  - **Fase 1 (Interna):** 100% empleados y agentes Guaki (24 horas).
  - **Fase 2 (Canary):** 5% de usuarios/proveedores en 1 ciudad secundaria (48 horas).
  - **Fase 3 (General):** Despliegue al 100% mediante Feature Flags de Vercel/Statsig.
- **Monitoreo de Anomalías:** Si `Fraud Agent` o `Support Agent` detectan un incremento de errores >2%, `Hermes OS` ejecuta **Rollback Automático** en <60 segundos.

### ETAPA 7: COMUNICACIÓN Y ANUNCIO DE LANZAMIENTO
- **Estrategia Omnicanal de Anuncio:**
  - **Para Proveedores:** Micro-video de 45s enviado por WhatsApp por `Onboarding/CS Agent` + In-app notification.
  - **Para Consumidores:** Notificación push contextual en App Brenda + Banner en la web.
  - **Para el Mercado:** Publicación en el changelog público (`guaki.com/changelog`) compilado por `Content Agent`.

### ETAPA 8: VERSIONADO E INDEXACIÓN EN ATLAS
- **Versionado Semántico (SemVer):**
  - **MAJOR (v2.0.0):** Cambios estructurales en el ecosistema (ej. lanzamiento de LANZA SaaS).
  - **MINOR (v1.4.0):** Nuevas funcionalidades compatibles (ej. nuevo método de pago en checkout).
  - **PATCH (v1.4.2):** Correcciones de errores o mejoras de rendimiento.
- **Indexación Cognitiva:** `Knowledge Agent` convierte el PRD y el CHANGELOG en vectores e inyecta la nueva funcionalidad en la `Biblioteca SEO` y la `Biblioteca de Prompts` de los agentes para que sepan invocarla.

### ETAPA 9: MONITOREO DE ADOPCIÓN Y RETIRO (Sunsetting)
- **Monitoreo a 90 Días:** `Analytics Agent` evalúa si la función alcanzó la tasa de adopción target (ej. >30% de proveedores activos la utilizan).
- **Protocolo de Retiro (Sunsetting):**
  - Si la adopción es < 5% a los 90 días, la función entra en estado **Deprecation Warning**.
  - **Notificación:** Se anuncia el retiro con 30 días de anticipación.
  - **Eliminación:** Se desactiva el Feature Flag, se elimina el código del repositorio para reducir deuda técnica y se archiva el expediente en la `Biblioteca de Decisiones (ADRs)`.

---

## 📋 PARTE III — PLANTILLA ESTÁNDAR DE PRD (PRODUCT REQUIREMENT DOCUMENT)

```markdown
---
id: PRD-2026-042
titulo: "Asistente de Agendamiento Inteligente por WhatsApp (Guaki Auto-Book)"
version: "v1.0.0"
autor: "Equipo de Producto & Business Agent"
aprobado_por: "Hermes OS & CEO"
ice_score: 22.5
---

### 1. Problema & Justificación Empírica
El 38% de los consumidores abandonan la intención de reserva porque el proveedor tarda más de 15 minutos en confirmar la disponibilidad de horarios por chat (Dato de Atlas Data Lake).

### 2. Solución Propuesta
Un módulo de agendamiento conversacional en WhatsApp sincronizado en tiempo real con el calendario del proveedor que permite al cliente consultar slots disponibles y reservar en <60 segundos.

### 3. Historias de Usuario (User Stories)
- **Como Consumidor:** Quiero ver las horas libres de un cerrajero en WhatsApp para agendar una cita sin esperar respuesta manual.
- **Como Proveedor:** Quiero que Atlas agende citas solo en mis horarios de trabajo definidos sin traslapes.

### 4. Requerimientos Técnicos & Eventos
- **Eventos a Emitir:** `appointment.slot.viewed`, `appointment.created`, `appointment.confirmed`.
- **Integraciones:** WhatsApp Business API, Google Calendar API, Guaki Core DB.

### 5. Métricas de Éxito & Guardrails
- **Métrica Primaria:** Increase de Contact-to-Appointment Rate del 15% al 30%.
- **Métrica Guardrail:** No-show Rate debe mantenerse < 10%. Latencia de respuesta en WhatsApp < 3s.

### 6. Plan de Rollback
Desactivar la Feature Flag `enable_autobook_whatsapp` en Vercel Edge Config. El flujo retornará al chat directo tradicional inmediatamente.
```

---

## 📊 PARTE IV — MATRIZ DE RESPONSABILIDAD EN EL GOBIERNO DE PRODUCTO

| Etapa del Gobierno | Agente Sintético / Entidad | Rol Humano (CEO / CPO) |
|:---|:---|:---|
| **1. Priorización (ICE)** | `Business Agent` calcula ICE score automático | Valida alineación estratégica general |
| **2. Aprobación / Rechazo** | `Atlas` simula impacto / `Hermes` evalúa compatibilidad | Emite veto ejecutivo si viola la visión |
| **3. Redacción de PRD** | `Knowledge Agent` genera borrador de PRD | Revisa y firma los requerimientos |
| **4. Validación Empírica** | `Growth Agent` ejecuta prueba de humo | Revisa resultados de la prueba de humo |
| **5. Desarrollo & QA** | `Argus QA Agent` ejecuta auditoría de código | Aprueba el paso a staging |
| **6. Despliegue (Canary)** | `DevOps Agent` gestiona Vercel Feature Flags | Monitorea dashboard de despliegue |
| **7. Comunicación** | `Content Agent` redacta CHANGELOG y avisos WA | Aprueba comunicados de prensa o PR |
| **8. Indexación Cognitiva** | `Atlas AI Core` absorbe la nueva feature en su RAG | N/A (100% Automatizado) |
| **9. Retiro (Sunsetting)** | `Analytics Agent` detecta baja adopción (<5%) | Confirma el retiro definitivo del código |

---

> **PRODUCT GOVERNANCE FRAMEWORK BIBLE v1.0 — MARCO DE GOBIERNO DE PRODUCTO Y CICLO DE VIDA DE FUNCIONALIDADES DOCUMENTADO Y APROBADO.**
