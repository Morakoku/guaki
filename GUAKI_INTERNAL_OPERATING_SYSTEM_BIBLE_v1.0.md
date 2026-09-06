# 🏢 GUAKI — INTERNAL OPERATING SYSTEM (GOS) BIBLE v2.0
> **CONSTITUCIÓN OPERATIVA INTERNA COMPLETA DE 19 DEPARTAMENTOS × 14 DIMENSIONES**
> **CADA DEPARTAMENTO OPERADO POR COMBINACIÓN DE PERSONAS + IA**

---

## 🏛️ PARTE I — PRINCIPIOS OPERATIVOS FUNDACIONALES

### Principio 1: PERSONA + IA EN CADA FUNCIÓN
Ningún departamento opera exclusivamente con humanos ni exclusivamente con IA. Cada función combina criterio humano con ejecución autónoma de agentes IA.

### Principio 2: DOCUMENTAR TODO O NO EXISTE
Si un proceso no tiene un SOP escrito, ese proceso no existe oficialmente. Todo se documenta, se versiona y se audita.

### Principio 3: AUTOMATIZAR PRIMERO, CONTRATAR DESPUÉS
Antes de contratar a una persona, Guaki evalúa si un agente IA puede ejecutar la tarea con supervisión humana. Solo se contrata cuando el criterio humano es irremplazable.

### Principio 4: MÉTRICAS SOBRE OPINIONES
Cada decisión se toma con datos. Atlas BI alimenta cada departamento con inteligencia en tiempo real.

---

## 📊 PARTE II — LOS 19 DEPARTAMENTOS DEL SISTEMA OPERATIVO GUAKI

---

### 🏛️ DEPTO 01/19: CEO & DIRECCIÓN ESTRATÉGICA

**Objetivo:** Definir la visión, proteger la misión constitucional, aprobar decisiones irreversibles y representar la empresa ante inversores, gobierno y medios.

**Responsabilidades:**
- Roadmap estratégico trimestral y anual.
- Relaciones institucionales con gobiernos, universidades e inversores.
- Cultura organizacional y valores del equipo.
- Aprobación final de pricing, partnerships y adquisiciones.

**Entradas:** Informes semanales de Hermes OS, métricas de Atlas BI, propuestas de inversión, alertas P0 escaladas, feedback del board.

**Salidas:** Directivas estratégicas, priorización de OKRs trimestrales, aprobación de alianzas, comunicados públicos.

**KPIs:** Revenue Growth MoM (> 15%), NPS de equipo interno (> 85), Runway financiero (> 12 meses), NPS de clientes Enterprise (> 90).

**SOPs:**
- `SOP-CEO-001`: Proceso de aprobación de partnerships estratégicos.
- `SOP-CEO-002`: Protocolo de comunicación de crisis.
- `SOP-CEO-003`: Revisión trimestral de OKRs con el equipo completo.

**Automatizaciones:** Resumen automático de KPIs diarios entregado a las 07:00 AM por WhatsApp vía Hermes OS. Alerta inmediata si MRR cae > 5% en una semana.

**IA Involucrada:** Hermes OS genera el briefing ejecutivo diario. Atlas BI produce dashboards estratégicos en tiempo real.

**Prompts:**
- *"Hermes, genera el briefing ejecutivo del día con las 3 métricas más relevantes, 1 riesgo crítico y 1 oportunidad."*
- *"Atlas, ¿cuál es la tendencia de churn de los últimos 30 días segmentada por plan?"*

**Plantillas:**
- `TPL-CEO-001`: Template de OKRs trimestrales.
- `TPL-CEO-002`: Template de board deck para inversores.
- `TPL-CEO-003`: Template de comunicado de prensa.

**Checklists:**
- ☐ Revisar briefing ejecutivo diario (07:00 AM).
- ☐ Aprobar/rechazar propuestas pendientes de Hermes (antes de 10:00 AM).
- ☐ Revisión semanal de MRR, CAC, LTV y Churn (Lunes 09:00 AM).
- ☐ Call con inversores / board (Mensual).

**Reportes:** Reporte Ejecutivo Semanal (auto-generado por Hermes). Reporte Trimestral para Board.

**Alertas:** MRR cae > 5% semanal. Incidente P0 no resuelto en 2h. Mención negativa en medios nacionales.

**Escalabilidad:** El CEO delega progresivamente a VPs de área. Hermes OS absorbe el 60% de la toma de decisiones operativas rutinarias.

---

### ⚙️ DEPTO 02/19: OPERACIONES (HERMES OS — COO SINTÉTICO)

**Objetivo:** Orquestar la ejecución simultánea de todos los departamentos, agentes y procesos en tiempo real 24/7.

**Responsabilidades:**
- Asignación y re-priorización dinámica de tareas a sub-agentes.
- Monitoreo de SLAs de todos los departamentos.
- Gestión de incidentes operativos y escalaciones.
- Coordinación inter-departamental.

**Entradas:** Eventos de Apache Kafka, alertas de Argus QA, métricas de salud de agentes, tickets de soporte escalados, órdenes del CEO.

**Salidas:** Órdenes de ejecución a sub-agentes, reportes de incidentes, escalaciones a humanos, re-asignación de recursos.

**KPIs:** Uptime de la escuadra (> 99.5%), Tareas completadas a tiempo (> 92%), Incidentes P0 resueltos < 30 min, MTTR (< 15 min).

**SOPs:**
- `SOP-OPS-001`: Respuesta ante caída de agente IA.
- `SOP-OPS-002`: Escalación de incidentes P0/P1/P2.
- `SOP-OPS-003`: Re-priorización de cola de tareas por cambio de prioridad.
- `SOP-OPS-004`: Protocolo de deployment multi-país.

**Automatizaciones:** Reinicio automático de agentes caídos (< 30s). Re-priorización dinámica de tareas por urgencia. Health-check cada 60s a todos los agentes. Failover automático si un agente falla 3 veces consecutivas.

**IA Involucrada:** Hermes OS opera como COO autónomo 24/7. Es el director de orquesta de toda la operación.

**Prompts:**
- *"Hermes, estado de la escuadra: agentes activos, tareas en cola, SLA actual, alertas pendientes."*
- *"Hermes, re-prioriza: la tarea de prospección de Medellín tiene urgencia P0 por evento comercial mañana."*

**Plantillas:**
- `TPL-OPS-001`: Template de reporte de incidentes.
- `TPL-OPS-002`: Template de post-mortem de caída.

**Checklists:**
- ☐ Health-check de escuadra completa (automático cada 60s).
- ☐ Revisión de cola de tareas pendientes (cada 30 min).
- ☐ Validación de SLAs departamentales (diario).
- ☐ Post-mortem de incidentes P0 (dentro de 24h del incidente).

**Reportes:** Reporte Operativo Diario. Dashboard de Salud de Agentes en tiempo real. Reporte Semanal de Incidentes.

**Alertas:** Agente caído > 60s. SLA departamental por debajo del umbral. Cola de tareas > 50 pendientes. Error rate > 2%.

**Escalabilidad:** Hermes OS escala horizontalmente con más workers de Kafka. En Año 5, Hermes coordina 50+ agentes simultáneos en 10 países.

---

### 💰 DEPTO 03/19: VENTAS & PROSPECCIÓN

**Objetivo:** Captar proveedores verificados e incorporarlos a los programas SaaS de Guaki con cierre autónomo.

**Responsabilidades:**
- Prospección nocturna automatizada (Mapache + Ardilla).
- Scoring BANT de leads.
- Envío de propuestas personalizadas.
- Cierre de contratos y activación de pagos recurrentes.
- Seguimiento de pipeline.

**Entradas:** Leads extraídos por Mapache/Ardilla Scrapers, diagnósticos Audit MRI™, señales de demanda de Atlas, referidos de embajadores.

**Salidas:** Contratos firmados, onboarding completado, pagos recurrentes activados, pipeline actualizado.

**KPIs:** Tasa de conversión lead➔cierre (> 8%), Revenue por closer (> $5,000 USD/mes), Pipeline value (> 3x del MRR objetivo), Tiempo medio de cierre (< 7 días).

**SOPs:**
- `SOP-SALES-001`: Flujo de Prospección Firecrawl nocturno.
- `SOP-SALES-002`: Guión de Abordaje WhatsApp (primer mensaje).
- `SOP-SALES-003`: Guión de Follow-Up (día 2, 5, 10).
- `SOP-SALES-004`: Protocolo de envío de propuesta comercial.
- `SOP-SALES-005`: Cierre de contrato con firma digital.

**Automatizaciones:** Bucle nocturno 8-a-8 de prospección local (Mapache + Ardilla). Envío automático de propuestas personalizadas por Kronos Closer. Scoring BANT automático por Atlas. Recordatorio automático de follow-up en día 2/5/10.

**IA Involucrada:** Mapache/Ardilla (extracción de leads), Kronos Closer (cierre automatizado), Atlas (scoring de leads), Hermes (asignación de leads a closers).

**Prompts:**
- *"Mapache, extrae las 50 mejores empresas de odontología en Bogotá con WhatsApp visible y sin perfil en Guaki."*
- *"Kronos, envía propuesta Growth al lead ID-4523 con diagnóstico personalizado adjunto."*
- *"Atlas, score BANT de este lead: tiene 15 empleados, 3 sucursales, responde en < 2h, tiene Google Business pero sin fotos."*

**Plantillas:**
- `TPL-SALES-001`: Propuesta comercial Guaki Growth.
- `TPL-SALES-002`: Propuesta comercial Guaki Pro.
- `TPL-SALES-003`: Propuesta comercial Guaki Premium.
- `TPL-SALES-004`: Contrato SaaS estándar.
- `TPL-SALES-005`: Primer mensaje WhatsApp de abordaje.

**Checklists:**
- ☐ Verificar que Mapache completó el ciclo de prospección nocturno (08:00 AM).
- ☐ Revisar leads con score BANT > 70 (prioridad alta).
- ☐ Enviar propuestas a leads calificados antes del mediodía.
- ☐ Follow-up a propuestas enviadas hace 48h sin respuesta.
- ☐ Actualizar pipeline en CRM al cierre de cada día.

**Reportes:** Pipeline Diario. Conversion Funnel Semanal. Revenue Report Mensual.

**Alertas:** Lead de alto valor (BANT > 90) sin atender en > 1h. Pipeline por debajo del 3x del objetivo. Closer con tasa de conversión < 5%.

**Escalabilidad:** En Año 1, Kronos maneja el 40% de cierres autónomamente. En Año 3, sube al 70%. Los closers humanos se enfocan en Enterprise.

---

### 📢 DEPTO 04/19: MARKETING & GROWTH

**Objetivo:** Alimentar el volante de inercia de crecimiento sin depender de campañas de pago aisladas. Construir marca.

**Responsabilidades:**
- Estrategia de contenido orgánico (LinkedIn, YouTube, Blog).
- Programa de embajadores y referidos.
- Alianzas institucionales (universidades, cámaras, medios).
- Gestión de PR y reputación de marca.
- Viralidad de producto (product-led growth).

**Entradas:** Métricas de Atlas Growth Intelligence, datos de CAC y LTV, feedback de embajadores, tendencias de búsqueda.

**Salidas:** Campañas de contenido, convenios institucionales, eventos Guaki Summit, materiales de marca.

**KPIs:** CAC (< $5 USD), LTV/CAC ratio (> 8x), Tasa de referral orgánico (> 20%), Brand awareness en target (> 30% en ciudades activas).

**SOPs:**
- `SOP-MKT-001`: Calendario editorial semanal.
- `SOP-MKT-002`: Protocolo de lanzamiento en nueva ciudad.
- `SOP-MKT-003`: Proceso de onboarding de embajadores.
- `SOP-MKT-004`: Protocolo de gestión de crisis de reputación.

**Automatizaciones:** Envío automático de invitaciones de referral post-servicio exitoso. Publicación programada de contenido en 4 redes sociales. Detección automática de menciones de marca (social listening).

**IA Involucrada:** Atlas predice qué canales generan mayor ROI por ciudad. Atlas genera copy para posts de redes sociales.

**Prompts:**
- *"Atlas, ¿cuál fue el canal de adquisición con mejor ROI en Barranquilla este mes?"*
- *"Atlas, genera 5 opciones de copy para un post de LinkedIn sobre el caso de éxito de [empresa]."*

**Plantillas:**
- `TPL-MKT-001`: Kit de marca para embajadores.
- `TPL-MKT-002`: Template de caso de éxito.
- `TPL-MKT-003`: Template de comunicado de prensa.
- `TPL-MKT-004`: Template de email de invitación a evento.

**Checklists:**
- ☐ Publicar contenido diario en LinkedIn del CEO.
- ☐ Revisar métricas de engagement semanal.
- ☐ Contactar 3 medios por mes para PR.
- ☐ Revisar NPS de embajadores mensualmente.

**Reportes:** Reporte de Growth Semanal. Reporte de CAC/LTV Mensual. Reporte de Brand Awareness Trimestral.

**Alertas:** CAC sube > 50% en una semana. Mención negativa viral en redes sociales. Embajador desactivado por inactividad.

**Escalabilidad:** Marketing escala mediante contenido programático (Atlas genera el 70% del copy) y red de embajadores (sin costo fijo).

---

### 🎯 DEPTO 05/19: SEM & PUBLICIDAD PAGADA

**Objetivo:** Ejecutar campañas de publicidad digital de alta eficiencia para acelerar la captura de proveedores y usuarios en mercados nuevos.

**Responsabilidades:**
- Gestión de Google Ads, Meta Ads, TikTok Ads.
- Optimización de campañas por CPA y ROAS.
- A/B testing de creativos y landing pages.
- Retargeting de usuarios que no convirtieron.

**Entradas:** Presupuesto aprobado por CEO/Finanzas, datos de Atlas Advertising Intelligence, creativos de Marketing.

**Salidas:** Campañas activas, reportes de performance, leads capturados por SEM.

**KPIs:** CPA de proveedor (< $8 USD), CPA de usuario (< $0.50 USD), ROAS (> 5x), CTR (> 3%).

**SOPs:**
- `SOP-SEM-001`: Configuración de campaña Google Ads para nueva ciudad.
- `SOP-SEM-002`: Protocolo de A/B testing de creativos.
- `SOP-SEM-003`: Optimización semanal de pujas y presupuestos.

**Automatizaciones:** Pausa automática de campañas con CPA > 2x del objetivo. Generación automática de reportes de performance diarios. Rotación automática de creativos según CTR.

**IA Involucrada:** Atlas Advertising Intelligence sugiere keywords, audiencias y presupuestos óptimos por ciudad.

**Prompts:**
- *"Atlas, ¿cuáles son las 20 keywords de mayor intención de compra para 'odontología en Bogotá' con CPC estimado?"*
- *"Atlas, genera 3 variantes de headline para Google Ads dirigido a proveedores de plomería en CDMX."*

**Plantillas:**
- `TPL-SEM-001`: Estructura de campaña Google Ads estándar.
- `TPL-SEM-002`: Briefing de creativos para Meta Ads.

**Checklists:**
- ☐ Revisar performance de campañas activas (diario).
- ☐ Ajustar pujas y presupuestos (semanal).
- ☐ Lanzar nuevas variantes de A/B test (quincenal).
- ☐ Reporte de ROAS consolidado (mensual).

**Reportes:** Dashboard de Performance SEM Diario. Reporte de ROAS Semanal. Análisis de Keywords Mensual.

**Alertas:** CPA sube > 2x del objetivo. Presupuesto diario agotado antes de las 14:00. CTR cae < 1%.

**Escalabilidad:** SEM escala linealmente con presupuesto. Atlas optimiza automáticamente la distribución entre mercados.

---

### 🛍️ DEPTO 06/19: PRODUCTO & EXPERIENCIA

**Objetivo:** Diseñar, prototipar y evolucionar la experiencia de búsqueda, descubrimiento y contratación de Guaki.

**Responsabilidades:**
- Roadmap de producto trimestral.
- Pruebas A/B de experiencia.
- Investigación UX con usuarios reales.
- Sistema de categorías y taxonomía.
- Gestión del backlog de features.

**Entradas:** Telemetría de comportamiento (Mixpanel/PostHog), reportes de Atlas BI, feedback de Customer Success, tickets de bugs.

**Salidas:** Especificaciones de features (PRDs), wireframes funcionales, priorización de backlog, resultados de A/B tests.

**KPIs:** Tiempo de carga (< 800ms), Tasa de conversión búsqueda➔contacto (> 18%), Task completion rate (> 85%), Bounce rate (< 35%).

**SOPs:**
- `SOP-PROD-001`: Proceso de ideación ➔ PRD ➔ desarrollo ➔ release.
- `SOP-PROD-002`: Protocolo de A/B testing.
- `SOP-PROD-003`: Investigación UX con usuarios reales (5 entrevistas/mes).

**Automatizaciones:** Alertas de degradación de Core Web Vitals. Tracking automático de feature adoption. Encuestas in-app automáticas post-interacción.

**IA Involucrada:** Atlas genera insights de comportamiento. Atlas Coach sugiere mejoras de conversión.

**Prompts:**
- *"Atlas, ¿cuál es la tasa de drop-off en cada paso del funnel de agendamiento por ciudad?"*
- *"Atlas, ¿qué categorías tienen la mayor tasa de búsqueda sin resultados relevantes?"*

**Plantillas:**
- `TPL-PROD-001`: Template de PRD (Product Requirements Document).
- `TPL-PROD-002`: Template de resultado de A/B test.

**Checklists:**
- ☐ Revisar métricas de Core Web Vitals (diario).
- ☐ Priorizar backlog con equipo de desarrollo (semanal).
- ☐ Revisar resultados de A/B tests activos (semanal).
- ☐ Entrevistas UX con 5 usuarios (mensual).

**Reportes:** Reporte de Product Metrics Semanal. Funnel Analysis Mensual.

**Alertas:** LCP > 2.5s. Tasa de conversión cae > 10% en 48h. Bounce rate sube > 50%.

**Escalabilidad:** El equipo de producto crece con PMs por vertical (Salud PM, Legal PM, etc.).

---

### 💻 DEPTO 07/19: DESARROLLO & INGENIERÍA

**Objetivo:** Construir y mantener la infraestructura técnica con arquitectura limpia DDD/CQRS/Event Sourcing.

**Responsabilidades:**
- Desarrollo de microservicios backend.
- Frontend SSR con Next.js/Vercel.
- CI/CD pipelines.
- Revisión de código y pair programming.
- Resolución de bugs y deuda técnica.
- Observabilidad (logs, traces, metrics).

**Entradas:** PRDs de Producto, tickets de bugs, reportes de Argus QA, alertas de observabilidad.

**Salidas:** Código desplegado en producción, documentación técnica, tests automatizados, APIs versionadas.

**KPIs:** Deployment frequency (> 5/semana), MTTR (< 30 min), Change failure rate (< 5%), Code coverage (> 80%).

**SOPs:**
- `SOP-DEV-001`: Git Flow (feature branches ➔ PR ➔ review ➔ staging ➔ production).
- `SOP-DEV-002`: Protocolo de hotfix para producción.
- `SOP-DEV-003`: Rollback automático ante error rate > 2%.
- `SOP-DEV-004`: Onboarding técnico de nuevo desarrollador.

**Automatizaciones:** Pipeline CI/CD con rollback automático. Linting y formatting automático en pre-commit. Tests E2E automáticos en staging antes de merge a production.

**IA Involucrada:** Argus QA audita automáticamente la calidad del código, endpoints y performance.

**Prompts:**
- *"Argus, ejecuta auditoría completa del endpoint /api/v1/search incluyendo latencia, seguridad y rate limiting."*

**Plantillas:**
- `TPL-DEV-001`: Template de Pull Request.
- `TPL-DEV-002`: Template de Post-Mortem de incidente.
- `TPL-DEV-003`: Template de RFC (Request for Comments) para cambios arquitectónicos.

**Checklists:**
- ☐ Code review completado antes de merge (obligatorio).
- ☐ Tests pasando en CI antes de deploy (obligatorio).
- ☐ Observabilidad configurada para nuevo endpoint (obligatorio).
- ☐ Documentación de API actualizada (obligatorio).

**Reportes:** Velocity Report Semanal. Incidentes & MTTR Mensual. Deuda Técnica Trimestral.

**Alertas:** Error rate > 2% en producción. Latencia P95 > 500ms. Deployment fallido.

**Escalabilidad:** Equipos por dominio (Search Squad, Payments Squad, AI Squad). Cada squad autónomo con su propio backlog.

---

### 🧠 DEPTO 08/19: IA & ATLAS AI CORE

**Objetivo:** Evolucionar el cerebro cognitivo del ecosistema: memorias, embeddings, Knowledge Graph y modelos predictivos.

**Responsabilidades:**
- Entrenamiento y fine-tuning de modelos RLHF.
- Mantenimiento del Knowledge Graph (Neo4j).
- Optimización de Vector Memory (Qdrant 1536d).
- Evaluación de calidad de recomendaciones.
- Investigación de nuevos modelos y técnicas.

**Entradas:** Eventos de transacciones, reseñas, búsquedas, logs de agentes, feedback de usuarios sobre recomendaciones.

**Salidas:** Modelos actualizados desplegados, recomendaciones prescriptivas, predicciones de demanda, embeddings actualizados.

**KPIs:** Precisión de recomendaciones (> 85%), Latencia de Vector Search (< 20ms), Knowledge Graph coverage (> 90% de entidades del ecosistema).

**SOPs:**
- `SOP-AI-001`: Pipeline de re-entrenamiento semanal de embeddings.
- `SOP-AI-002`: Evaluación A/B de nuevos modelos vs. baseline.
- `SOP-AI-003`: Protocolo de fallback si modelo nuevo degrada métricas.

**Automatizaciones:** Re-entrenamiento semanal de embeddings. Evaluación automática de drift de modelo. Generación automática de features desde el Knowledge Graph.

**IA Involucrada:** Atlas AI Core es simultáneamente el departamento y el producto.

**Prompts:**
- *"Atlas, evalúa la precisión de las recomendaciones prescriptivas del último mes con métricas de precision@k y recall@k."*

**Plantillas:**
- `TPL-AI-001`: Template de Model Card para nuevo modelo.
- `TPL-AI-002`: Template de Experiment Report.

**Checklists:**
- ☐ Monitorear drift de modelo diariamente.
- ☐ Re-entrenar embeddings semanalmente.
- ☐ Evaluar nuevos modelos vs. baseline mensualmente.
- ☐ Auditar sesgos del modelo trimestralmente.

**Reportes:** Model Performance Dashboard (real-time). Experiment Results Weekly. Knowledge Graph Health Monthly.

**Alertas:** Precisión cae < 80%. Latencia de Vector Search > 50ms. Knowledge Graph orphan nodes > 5%.

**Escalabilidad:** Atlas escala horizontalmente con shards de Qdrant y réplicas de Neo4j. GPU scaling para re-entrenamiento.

---

### 🔍 DEPTO 09/19: SEO & CONTENIDO PROGRAMÁTICO

**Objetivo:** Posicionar +5,000,000 de páginas programáticas en Google para capturar tráfico orgánico de intención local en toda LATAM.

**Responsabilidades:**
- Arquitectura de silos de URL y taxonomía de categorías.
- Generación masiva de Schema JSON-LD.
- Optimización de CTR en SERPs.
- Detección y corrección de canibalizaciones.
- Link building orgánico con aliados.

**Entradas:** Datos de categorías/ciudades/barrios de Atlas, proveedores verificados, datos de Google Search Console.

**Salidas:** Páginas SSR indexadas, sitemaps diarios actualizados, reportes de posicionamiento.

**KPIs:** Tráfico orgánico mensual (> 1,000,000), Páginas indexadas (> 500,000), Posición promedio (< 5 para long-tail local), CTR orgánico (> 8%).

**SOPs:**
- `SOP-SEO-001`: Creación de nueva landing page programática.
- `SOP-SEO-002`: Protocolo de detección de canibalizaciones.
- `SOP-SEO-003`: Auditoría técnica SEO mensual.
- `SOP-SEO-004`: Proceso de hreflang para nuevo país.

**Automatizaciones:** Compilación nocturna de nuevas landings por picos de demanda detectados por Atlas. Generación automática de sitemaps. Alertas de deindexación masiva.

**IA Involucrada:** Atlas genera meta-descriptions únicas, detecta canibalizaciones y sugiere nuevas keywords basadas en Search Intelligence.

**Prompts:**
- *"Atlas, genera meta-description única para la landing 'mejores odontólogos en Barranquilla' que maximice CTR."*
- *"Atlas, detecta canibalizaciones entre las landings de odontología en Barranquilla y odontología en el norte de Barranquilla."*

**Plantillas:**
- `TPL-SEO-001`: Template de landing page programática.
- `TPL-SEO-002`: Template de Schema JSON-LD por tipo de servicio.

**Checklists:**
- ☐ Verificar indexación de nuevas páginas en GSC (diario).
- ☐ Revisar posiciones de keywords target (semanal).
- ☐ Auditoría técnica SEO (mensual).
- ☐ Actualizar sitemaps (automático nocturno).

**Reportes:** Dashboard de Tráfico Orgánico (real-time). Ranking Report Semanal. Indexation Health Mensual.

**Alertas:** Deindexación de > 1,000 páginas en 24h. Posición promedio cae > 3 posiciones para keywords core. Tráfico orgánico cae > 20% WoW.

**Escalabilidad:** SEO programático escala con la base de datos. Cada nuevo proveedor verificado = 1 nueva landing page indexada automáticamente.

---

### 🎧 DEPTO 10/19: ATENCIÓN AL CLIENTE

**Objetivo:** Resolver el 100% de las consultas, quejas y problemas de usuarios y proveedores con satisfacción medible.

**Responsabilidades:**
- Soporte Tier 1 (preguntas frecuentes — resueltas por IA).
- Soporte Tier 2 (problemas técnicos — resueltas por humano asistido por IA).
- Soporte Tier 3 (escalaciones críticas — resueltas por equipo senior).
- Gestión de quejas formales y mediación de disputas.

**Entradas:** Tickets de soporte (WhatsApp, email, chat in-app), alertas de Atlas, feedback post-interacción.

**Salidas:** Tickets resueltos, feedback procesado, escalaciones a Producto/Desarrollo, CSAT medido.

**KPIs:** Tiempo de primera respuesta (< 2 min para Tier 1), Resolución en primer contacto (> 75%), CSAT (> 90%), Tickets abiertos > 24h (< 5%).

**SOPs:**
- `SOP-ATC-001`: Clasificación automática de tickets (Tier 1/2/3).
- `SOP-ATC-002`: Guión de respuesta para quejas de facturación.
- `SOP-ATC-003`: Protocolo de mediación de disputas proveedor-usuario.
- `SOP-ATC-004`: Escalación a Desarrollo para bugs reproducibles.

**Automatizaciones:** Respuesta automática de Tier 1 por IA (80% del volumen). Clasificación automática de sentimiento. Encuesta CSAT automática post-resolución.

**IA Involucrada:** Guaki IA Assistant resuelve Tier 1 autónomamente. Atlas analiza sentimiento y detecta patrones de queja recurrentes.

**Prompts:**
- *"Atlas, ¿cuáles son las 5 quejas más recurrentes de esta semana y qué departamento debe resolver cada una?"*

**Plantillas:**
- `TPL-ATC-001`: Respuesta estándar de bienvenida.
- `TPL-ATC-002`: Respuesta de escalación con timeline.
- `TPL-ATC-003`: Template de resolución con disculpa + compensación.

**Checklists:**
- ☐ Todos los tickets Tier 1 respondidos < 2 min (automático).
- ☐ Tickets Tier 2 asignados a humano < 15 min.
- ☐ Tickets abiertos > 24h revisados manualmente.
- ☐ Reporte de CSAT enviado a Producto semanalmente.

**Reportes:** Dashboard de Tickets en Tiempo Real. CSAT Report Semanal. Análisis de Quejas Recurrentes Mensual.

**Alertas:** Ticket P0 sin asignar > 5 min. CSAT cae < 85%. Volumen de tickets sube > 50% en 24h.

**Escalabilidad:** El 80% del volumen lo resuelve IA autónomamente. El equipo humano se enfoca en Tier 2/3 de alto valor.

---

### 🤝 DEPTO 11/19: CUSTOMER SUCCESS

**Objetivo:** Garantizar que cada proveedor suscrito logre resultados medibles de crecimiento y renueve su plan.

**Responsabilidades:**
- Onboarding asistido de nuevos suscriptores.
- Revisiones mensuales de rendimiento (QBRs para Premium/Enterprise).
- Detección proactiva de riesgo de churn.
- Educación continua mediante Atlas Academy.
- Upsell/cross-sell hacia planes superiores y add-ons.

**Entradas:** Alertas de riesgo de churn de Atlas, métricas de uso del plan, tickets de soporte, NPS.

**Salidas:** Acciones de retención ejecutadas, playbooks de éxito activados, upgrades de plan, renewals confirmados.

**KPIs:** Churn mensual (< 3%), NPS de plan (> 80), Net Revenue Retention (> 110%), Time-to-first-value (< 48h).

**SOPs:**
- `SOP-CS-001`: Onboarding Day 1 del nuevo suscriptor.
- `SOP-CS-002`: Revisión mensual de rendimiento.
- `SOP-CS-003`: Protocolo anti-churn (intervención proactiva).
- `SOP-CS-004`: Proceso de upsell consultivo.

**Automatizaciones:** Atlas detecta riesgo de churn 15 días antes de cancelación. Envío automático de micro-cápsulas educativas personalizadas. Alertas de bajo uso del plan.

**IA Involucrada:** Atlas Coach genera el informe semanal personalizado con recomendaciones prescriptivas para cada proveedor.

**Prompts:**
- *"Atlas, lista los 20 proveedores con mayor riesgo de churn este mes, con la razón probable y la acción recomendada."*
- *"Atlas, genera el informe semanal para [empresa] con las 3 acciones que más impactarían su crecimiento."*

**Plantillas:**
- `TPL-CS-001`: Email de bienvenida Day 1.
- `TPL-CS-002`: Template de QBR (Quarterly Business Review).
- `TPL-CS-003`: Propuesta de upgrade de plan.

**Checklists:**
- ☐ Onboarding completado en < 48h para cada nuevo suscriptor.
- ☐ Revisión mensual con proveedores Premium/Enterprise.
- ☐ Intervención anti-churn en los 20 proveedores de mayor riesgo.
- ☐ Encuesta NPS trimestral a todos los suscriptores activos.

**Reportes:** Churn Prediction Dashboard. NPS Report Mensual. Net Revenue Retention Trimestral.

**Alertas:** Proveedor no accede al panel en > 14 días. NPS individual < 6. Proveedor solicita cancelación.

**Escalabilidad:** En Año 1, CS es 90% IA + 10% humano. En Año 5, los CS Managers humanos se dedican exclusivamente a Enterprise.

---

### 💵 DEPTO 12/19: FINANZAS & TESORERÍA

**Objetivo:** Gestionar la salud financiera, cash flow, presupuestos y relaciones con inversores.

**Responsabilidades:**
- Control de MRR/ARR y proyecciones financieras.
- Gestión de cash flow y runway.
- Presupuestos departamentales.
- Relación con inversores y reportería de board.
- Control de gastos y aprobación de compras.

**Entradas:** Transacciones de pasarelas de pago, nómina, facturas de proveedores, métricas de MRR.

**Salidas:** Reportes financieros, proyecciones de cash flow, aprobaciones de presupuesto, reportes para inversores.

**KPIs:** MRR Growth (> 12% MoM), Burn rate (< 80% del revenue), Runway (> 12 meses), Gross Margin (> 75%).

**SOPs:**
- `SOP-FIN-001`: Cierre financiero mensual.
- `SOP-FIN-002`: Aprobación de gastos > $500 USD.
- `SOP-FIN-003`: Conciliación bancaria semanal.

**Automatizaciones:** Cálculo automático de MRR/ARR diario. Alertas de cash flow bajo. Proyecciones de runway automáticas.

**IA Involucrada:** Atlas genera forecasts de revenue basados en pipeline de ventas y churn prediction.

**Prompts:**
- *"Atlas, proyecta el MRR para los próximos 6 meses basado en la tasa de conversión actual y churn histórico."*

**Plantillas:**
- `TPL-FIN-001`: Template de P&L mensual.
- `TPL-FIN-002`: Template de Board Financial Report.

**Checklists:**
- ☐ Revisar cash flow diariamente.
- ☐ Conciliación bancaria semanal.
- ☐ Cierre financiero mensual antes del día 5.
- ☐ Board report trimestral.

**Reportes:** P&L Mensual. Cash Flow Dashboard (real-time). Board Financial Report Trimestral.

**Alertas:** Runway < 6 meses. MRR decrece 2 meses consecutivos. Gasto departamental > 120% del presupuesto.

**Escalabilidad:** En Año 1, el CEO gestiona Finanzas directamente. En Año 3, se contrata CFO.

---

### ⚖️ DEPTO 13/19: LEGAL & COMPLIANCE

**Objetivo:** Proteger legalmente a Guaki, garantizar cumplimiento regulatorio multi-país y gestionar contratos.

**Responsabilidades:**
- Contratos SaaS con proveedores.
- Términos y Condiciones de uso.
- Política de Privacidad y GDPR/LGPD.
- Compliance de facturación electrónica por país.
- Protección de propiedad intelectual.
- Mediación de disputas legales.

**Entradas:** Contratos generados por Kronos, regulaciones locales, quejas legales, auditorías de compliance.

**Salidas:** Contratos firmados legalmente válidos, políticas actualizadas, resoluciones de disputas.

**KPIs:** Compliance (100%), Contratos firmados con cláusulas pre-validadas (> 95%), Disputas resueltas < 15 días.

**SOPs:**
- `SOP-LEG-001`: Revisión de contrato estándar antes de firma.
- `SOP-LEG-002`: Actualización de Términos y Condiciones por nuevo país.
- `SOP-LEG-003`: Protocolo de respuesta ante reclamación legal.

**Automatizaciones:** Kronos genera contratos automáticos con cláusulas pre-validadas por país. Alertas de cambios regulatorios relevantes.

**IA Involucrada:** Kronos Closer genera borradores de contratos. Atlas monitorea cambios regulatorios por país.

**Prompts:**
- *"Kronos, genera contrato SaaS Guaki Pro para empresa registrada en México con facturación SAT."*

**Plantillas:**
- `TPL-LEG-001`: Contrato SaaS estándar (por país: CO, MX, CL, PE, BR, AR).
- `TPL-LEG-002`: Política de Privacidad multi-jurisdicción.
- `TPL-LEG-003`: Términos y Condiciones de uso.

**Checklists:**
- ☐ Verificar que todos los contratos nuevos usan la plantilla vigente.
- ☐ Auditar compliance de facturación mensualmente.
- ☐ Actualizar T&C antes de lanzar en nuevo país.

**Reportes:** Compliance Report Mensual. Contratos Activos Dashboard. Disputas Legales Tracker.

**Alertas:** Regulación nueva que impacte operaciones. Contrato firmado sin revisión legal. Disputa legal no atendida > 48h.

**Escalabilidad:** En Año 1, asesoría legal externa on-demand. En Año 4, equipo legal interno con Head of Legal.

---

### 🧾 DEPTO 14/19: FACTURACIÓN ELECTRÓNICA

**Objetivo:** Emitir facturas electrónicas legalmente válidas en cada país de operación de forma automática.

**Responsabilidades:**
- Emisión de facturas electrónicas (DIAN Colombia, SAT México, SII Chile, SUNAT Perú, NFe Brasil, AFIP Argentina).
- Gestión de notas crédito y anulaciones.
- Cobro de cartera vencida.
- Conciliación de pagos vs. facturas.

**Entradas:** Pagos confirmados de Stripe/Mercado Pago/Wompi/PayU, datos fiscales del proveedor.

**Salidas:** Facturas electrónicas emitidas, notas crédito, reportes de cartera.

**KPIs:** Facturas emitidas correctamente (> 99.5%), Aging de cartera (< 5%), Tiempo de emisión post-pago (< 5 min).

**SOPs:**
- `SOP-FACT-001`: Emisión automática de factura post-pago.
- `SOP-FACT-002`: Proceso de nota crédito por error de facturación.
- `SOP-FACT-003`: Cobro de cartera vencida (WhatsApp automático día 3, 7, 15).

**Automatizaciones:** Facturación electrónica automática el día 1 de cada ciclo. Envío automático de factura por email/WhatsApp. Cobro automático de cartera vencida.

**IA Involucrada:** Kronos gestiona la facturación automática y la recuperación de cartera.

**Prompts:**
- *"Kronos, emite factura electrónica DIAN para el cobro de $99 USD a empresa NIT 900.123.456-7 por plan Guaki Pro."*

**Plantillas:**
- `TPL-FACT-001`: Template de factura electrónica por país.
- `TPL-FACT-002`: Template de nota crédito.
- `TPL-FACT-003`: Template de recordatorio de pago vencido.

**Checklists:**
- ☐ Todas las facturas del mes emitidas antes del día 3.
- ☐ Conciliación pagos vs. facturas semanalmente.
- ☐ Cartera vencida > 30 días: escalación a Customer Success.

**Reportes:** Dashboard de Facturación (real-time). Aging de Cartera Semanal.

**Alertas:** Factura rechazada por la autoridad tributaria. Cartera vencida > 30 días > 10% del total. Error de emisión no corregido en 24h.

**Escalabilidad:** Cada nuevo país requiere integración con la autoridad tributaria local. Kronos absorbe el 100% de la emisión automática.

---

### 👥 DEPTO 15/19: RRHH & CULTURA

**Objetivo:** Atraer, desarrollar y retener al mejor talento humano complementario a los agentes IA.

**Responsabilidades:**
- Reclutamiento y selección.
- Onboarding de nuevos empleados.
- Evaluaciones de desempeño.
- Cultura y bienestar.
- Nómina y beneficios.

**Entradas:** Requisiciones de contratación de departamentos, feedback de equipo, métricas de desempeño.

**Salidas:** Contrataciones, evaluaciones de desempeño, planes de desarrollo, nómina procesada.

**KPIs:** Time-to-hire (< 30 días), Employee NPS (> 85), Rotación voluntaria (< 10% anual).

**SOPs:**
- `SOP-RRHH-001`: Proceso de reclutamiento de A-Z.
- `SOP-RRHH-002`: Onboarding del nuevo empleado (primera semana).
- `SOP-RRHH-003`: Evaluación de desempeño trimestral 360°.

**Automatizaciones:** Publicación automática de vacantes en LinkedIn/Indeed. Screening inicial de CVs por IA. Encuesta de clima organizacional automática mensual.

**IA Involucrada:** Atlas filtra CVs por keywords y fit cultural. Hermes coordina el onboarding del nuevo empleado.

**Prompts:**
- *"Atlas, filtra los 10 mejores candidatos para el puesto de Frontend Developer con experiencia en Next.js y SSR."*

**Plantillas:**
- `TPL-RRHH-001`: Job Description estándar.
- `TPL-RRHH-002`: Guía de Onboarding.
- `TPL-RRHH-003`: Template de evaluación 360°.

**Checklists:**
- ☐ Publicar vacante en 3 plataformas (LinkedIn, Indeed, Turing).
- ☐ Completar onboarding en 5 días hábiles.
- ☐ Evaluación 360° trimestral de todo el equipo.

**Reportes:** Headcount Dashboard. Employee NPS Mensual. Rotación Trimestral.

**Alertas:** Vacante abierta > 45 días. Employee NPS < 70. Renuncia de empleado clave.

**Escalabilidad:** En Año 1, RRHH lo gestiona el CEO directamente. En Año 3, se contrata Head of People.

---

### 🤝 DEPTO 16/19: PARTNERS & ALIANZAS

**Objetivo:** Construir y gestionar la red de alianzas estratégicas con universidades, gobierno, cámaras y corporaciones.

**Responsabilidades:**
- Prospección y cierre de alianzas institucionales.
- Gestión de programa de embajadores.
- Relación con cámaras de comercio y gremios.
- Convenios con gobiernos municipales y nacionales.
- Gestión de franquicias tecnológicas.

**Entradas:** Oportunidades identificadas por Atlas, referidos de embajadores, convocatorias gubernamentales.

**Salidas:** Convenios firmados, embajadores activos, franquicias operando, bases de datos compartidas.

**KPIs:** Partners activos (> 50 por país), Proveedores referidos por partners (> 20% del total), NPS de partners (> 85).

**SOPs:**
- `SOP-PART-001`: Proceso de acercamiento a cámara de comercio.
- `SOP-PART-002`: Onboarding de nuevo embajador.
- `SOP-PART-003`: Activación de franquicia tecnológica.

**Automatizaciones:** Reporte mensual automático de performance para cada partner. Alertas de partner inactivo > 30 días.

**IA Involucrada:** Atlas identifica oportunidades de alianza por demanda no cubierta en una ciudad/categoría.

**Prompts:**
- *"Atlas, ¿en qué ciudades hay demanda alta de servicios pero baja oferta de proveedores, que justifique una alianza con la cámara local?"*

**Plantillas:**
- `TPL-PART-001`: Propuesta de alianza institucional.
- `TPL-PART-002`: Convenio marco con universidad.
- `TPL-PART-003`: Contrato de franquicia tecnológica.

**Checklists:**
- ☐ Contactar 5 potenciales partners nuevos por mes.
- ☐ Revisión mensual de rendimiento de embajadores.
- ☐ Reporte trimestral de impacto de alianzas.

**Reportes:** Partners Dashboard. Embajadores Performance Mensual. Franquicias Status Trimestral.

**Alertas:** Partner inactivo > 30 días. Embajador con 0 referidos en 60 días. Franquicia con SLA < 80%.

**Escalabilidad:** Red de partners escala orgánicamente. En Año 5, cada país tiene un Partner Manager dedicado.

---

### ✅ DEPTO 17/19: CALIDAD & QA

**Objetivo:** Garantizar que la calidad del producto, los datos y el servicio cumplan los estándares Guaki en todo momento.

**Responsabilidades:**
- QA funcional y de regresión de la plataforma.
- Auditoría de calidad de datos de proveedores.
- Verificación de integridad del Guaki Score.
- Tests de seguridad y penetración.
- Auditoría de calidad de respuestas del IA Assistant.

**Entradas:** Builds de desarrollo, datos de proveedores, logs de IA Assistant, reportes de bugs.

**Salidas:** Reportes de QA, bugs documentados, certificaciones de release, auditorías de datos.

**KPIs:** Bugs críticos en producción (< 1/mes), Cobertura de tests (> 80%), Datos de proveedores con inconsistencias (< 2%).

**SOPs:**
- `SOP-QA-001`: Checklist de release antes de deploy.
- `SOP-QA-002`: Auditoría mensual de datos de proveedores.
- `SOP-QA-003`: Test de penetración trimestral.

**Automatizaciones:** Argus QA ejecuta auditorías automáticas de endpoints, código y datos. Tests E2E automáticos en staging.

**IA Involucrada:** Argus QA es el agente autónomo de calidad. Audita código, endpoints, datos y respuestas de IA.

**Prompts:**
- *"Argus, ejecuta suite completa de regresión en staging y reporta resultados."*
- *"Argus, audita la consistencia de datos de los 100 proveedores más recientes."*

**Plantillas:**
- `TPL-QA-001`: Checklist de release.
- `TPL-QA-002`: Template de Bug Report.
- `TPL-QA-003`: Template de Auditoría de Datos.

**Checklists:**
- ☐ Suite de regresión pasada antes de cada deploy (obligatorio).
- ☐ Auditoría de datos de proveedores nuevos (semanal).
- ☐ Test de penetración (trimestral).
- ☐ Auditoría de respuestas de IA Assistant (mensual).

**Reportes:** QA Release Report (por deploy). Data Quality Dashboard. Security Audit Trimestral.

**Alertas:** Bug crítico en producción. Data inconsistency > 5%. Vulnerabilidad de seguridad detectada.

**Escalabilidad:** Argus QA absorbe el 90% del testing funcional. QA humano se enfoca en tests exploratorios y de seguridad.

---

### 🧠 DEPTO 18/19: ATLAS (COMO DEPARTAMENTO TRANSVERSAL)

**Objetivo:** Operar como el sistema nervioso central de inteligencia que alimenta a todos los departamentos con datos, insights y predicciones.

**Responsabilidades:**
- Proveer Market/Business/Category/City Intelligence a demanda.
- Generar informes semanales de Atlas Coach para cada proveedor suscrito.
- Mantener las 5 memorias cognitivas (Vector, Graph, Business, Client, Market).
- Servir recomendaciones prescriptivas en tiempo real.

**Entradas:** Todos los eventos del ecosistema (26 plataformas integradas vía Kafka).

**Salidas:** Guaki Score, recomendaciones prescriptivas, predicciones de demanda, informes de coaching, alertas de oportunidad.

**KPIs:** Cobertura de inteligencia (100% de ciudades activas), Precisión de predicciones (> 80%), Tiempo de generación de informe semanal (< 30s).

**SOPs:**
- `SOP-ATLAS-001`: Proceso de ingestión de nuevos eventos.
- `SOP-ATLAS-002`: Validación de calidad de datos antes de persistencia.
- `SOP-ATLAS-003`: Protocolo de rollback de modelo con drift.

**Automatizaciones:** Ingestión continua de eventos 24/7. Generación automática de informes semanales para cada proveedor. Recálculo automático de Guaki Score cada 24h.

**IA Involucrada:** Atlas ES la IA. Es el cerebro cognitivo del ecosistema completo.

**Prompts:**
- *"Atlas, genera reporte de Market Intelligence para la categoría 'odontología' en 'Bogotá' incluyendo demanda, oferta, precio promedio y predicción a 3 meses."*

**Plantillas:** Atlas genera todos sus outputs de forma autónoma. No requiere plantillas humanas.

**Checklists:**
- ☐ Verificar ingestión de eventos sin gaps (diario automático).
- ☐ Validar coherencia del Knowledge Graph (semanal).
- ☐ Evaluar precision/recall de recomendaciones (mensual).

**Reportes:** Atlas genera sus propios reportes para cada departamento que lo consume.

**Alertas:** Gap de ingestión > 5 minutos. Precisión de recomendaciones < 80%. Knowledge Graph inconsistency.

**Escalabilidad:** Atlas escala horizontalmente. En Año 10, procesa > 1B de eventos diarios.

---

### 👑 DEPTO 19/19: HERMES OS (COMO DEPARTAMENTO TRANSVERSAL)

**Objetivo:** Operar como el COO sintético 24/7 que orquesta la ejecución de todos los departamentos, agentes y procesos.

**Responsabilidades:**
- Coordinar la escuadra completa de agentes IA (Mapache, Ardilla, Kronos, Argus, Hephaestus).
- Asignar y re-priorizar tareas en tiempo real.
- Monitorear SLAs interdepartamentales.
- Generar el briefing ejecutivo diario para el CEO.
- Escalar incidentes según matriz de severidad.

**Entradas:** Eventos de todos los departamentos, alertas de Atlas, órdenes del CEO, estado de salud de agentes.

**Salidas:** Órdenes de ejecución, re-asignaciones, briefings, escalaciones, reportes de estado.

**KPIs:** Uptime de la escuadra (> 99.5%), Tareas completadas on-time (> 92%), Incidentes P0 resueltos < 30 min.

**SOPs:**
- `SOP-HERMES-001`: Boot sequence de la escuadra al inicio del día.
- `SOP-HERMES-002`: Protocolo de escalación P0/P1/P2.
- `SOP-HERMES-003`: Re-configuración dinámica de la escuadra por cambio de prioridad.

**Automatizaciones:** Hermes ES la automatización. Opera autónomamente 24/7 sin intervención humana para el 92% de las decisiones operativas.

**IA Involucrada:** Hermes OS es el agente IA principal de operaciones.

**Prompts:**
- *"Hermes, estado de la escuadra completa: agentes activos, tareas pendientes, SLAs, próximas 3 acciones programadas."*
- *"Hermes, prioridad máxima: prospección en Bogotá para evento comercial mañana. Re-asigna Mapache y Ardilla."*

**Plantillas:**
- `TPL-HERMES-001`: Template de briefing ejecutivo diario.
- `TPL-HERMES-002`: Template de post-mortem operativo.

**Checklists:**
- ☐ Boot sequence de la escuadra completado (06:00 AM automático).
- ☐ Briefing ejecutivo entregado al CEO (07:00 AM automático).
- ☐ Health-check de todos los agentes (cada 60s automático).
- ☐ Resumen de cierre de día (11:00 PM automático).

**Reportes:** Operational Dashboard (real-time). Daily Briefing. Weekly Operations Summary.

**Alertas:** Agente caído > 60s. SLA departamental roto. Tarea P0 sin asignar > 5 min.

**Escalabilidad:** Hermes escala con la complejidad operativa. En Año 1 coordina 8 agentes. En Año 10, coordina 100+ agentes en 20 países.

---

> **SISTEMA OPERATIVO INTERNO GUAKI (GOS) v2.0 — 19 DEPARTAMENTOS × 14 DIMENSIONES — APROBADO.**
