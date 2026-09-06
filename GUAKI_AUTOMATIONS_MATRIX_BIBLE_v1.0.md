# ⚡ GUAKI — AUTOMATIONS MATRIX & EVENT-DRIVEN ENGINE BIBLE v1.0
> **MATRIZ MAESTRA DE AUTOMATIZACIONES Y ARQUITECTURA BASADA EN EVENTOS (EVENT-DRIVEN ARCHITECTURE)**
> **TODO EVENTO TIENE UNA CONDICIÓN, UNA ACCIÓN, UN RESULTADO, ALIMENTA A ATLAS Y ES SUPERVISADO POR HERMES**

---

## 🏛️ PARTE I — FILOSOFÍA DE AUTOMATIZACIÓN

En Guaki, las automatizaciones no se diseñan como "flujos de trabajo rígidos en herramientas específicas" (como N8N o Zapier). Se diseñan como **Procesos Reactivos Basados en Eventos (Event-Driven Reactive Processes)**.

Cualquier cambio de estado en el ecosistema emite un **Evento Inmutable en el Event Bus (Apache Kafka)**. Este evento es evaluado por un **Motor de Reglas de Negocio**, el cual desencadena **Acciones Autónomas** ejecutadas por Agentes Sintéticos o Servicios Backend, actualizando el estado, notificando a los actores, retroalimentando el Grafo de Conocimiento de Atlas y bajo la auditoría de Hermes OS.

---

## 🔄 PARTE II — CATALOGO MAESTRO DE PROCESOS AUTOMATIZADOS (50+ AUTOMATIZACIONES)

---

### 🚀 BLOQUE 01: REGISTRO, VALIDACIÓN & ONBOARDING

#### AUT-01: Registro e Iniciación de Proveedor
- **Evento Disparador:** `provider.account.registered`
- **Condición:** Email y teléfono válidos; no existe registro previo con el mismo NIT/RUT o teléfono.
- **Acción:**
  1. Emitir credenciales temporales y crear registro en Data Lake (Bronze).
  2. Disparar `Verification Agent` para escaneo de antecedentes y presencia digital.
  3. Disparar `Onboarding Agent` para iniciar secuencia de bienvenida en WhatsApp.
- **Resultado Esperado:** Proveedor registrado, checklist de onboarding creado en DB y primer mensaje de bienvenida entregado por WhatsApp en <5 segundos.
- **Atlas Aprende:** Canal de origen del cliente (SEO, ad, referral) y tiempo de respuesta inicial.
- **Hermes Coordina:** Monitorea que el mensaje de bienvenida se entregue en <10s; si la API de WhatsApp falla, commuta a Email (Resend).

#### AUT-02: Verificación de Identidad Legal (OCR & DB Check)
- **Evento Disparador:** `provider.documents.uploaded`
- **Condición:** Documentos de identidad y registro mercantil cargados en la plataforma.
- **Acción:**
  1. `Verification Agent` procesa imágenes mediante OCR (Textract) y extrae datos clave.
  2. Consultar base de datos gubernamental (RUES/DIAN/SAT) vía API.
  3. Si la coincidencia es >95%, otorgar insignia `Guaki Verificado` y disparar `provider.identity.verified`.
- **Resultado Esperado:** Perfil verificado en <60 segundos sin intervención humana.
- **Atlas Aprende:** Patrones de autenticidad de documentos por provincia/estado.
- **Hermes Coordina:** Si la coincidencia es <95%, escala a revisión humana Nivel 2 y pausa la publicación del sello.

#### AUT-03: Seguimiento de Activación (Días 1, 3, 5, 7)
- **Evento Disparador:** `cron.onboarding.daily_check`
- **Condición:** Proveedor en etapa "Nuevo" y porcentaje de completitud de perfil < 100%.
- **Acción:**
  1. `Onboarding Agent` evalúa qué campos faltan (fotos, servicios, precios, horarios).
  2. Enviar micro-mensaje por WhatsApp con link directo para completar la sección específica faltante.
- **Resultado Esperado:** Perfil completado al 100% en menos de 7 días.
- **Atlas Aprende:** Qué secciones generan mayor fricción de llenado según la industria.
- **Hermes Coordina:** Si en día 5 el perfil sigue <50%, notifica al Customer Success Manager para llamada de asistencia.

---

### 🏭 BLOQUE 02: FÁBRICA DE SEO & CREACIÓN DE CONTENIDO

#### AUT-04: Descubrimiento de Keywords y Generación de Páginas SEO
- **Evento Disparador:** `seo.keyword_opportunity.detected`
- **Condición:** Volumen de búsqueda mensual > 100 y competencia en SERP < 40.
- **Acción:**
  1. `SEO Agent` define el slug, estructura H1/H2/H3 y esquema JSON-LD.
  2. `Content Agent` redacta el contenido base de la landing page (800+ palabras).
  3. `Argus QA` valida HTML, semantic tags, performance y Schema.
  4. Publicar la página en Next.js (Vercel ISR) y notificar a IndexNow API.
- **Resultado Esperado:** Landing page compilada, publicada e indexada en Google en <15 minutos desde la detección.
- **Atlas Aprende:** Relaciones entre intenciones de búsqueda locales y tipos de servicio.
- **Hermes Coordina:** Detiene la publicación si Argus QA detecta fallos de performance (LCP > 2.5s).

#### AUT-05: Cascada de Reciclaje de Contenido (1 a 12 Formatos)
- **Evento Disparador:** `content.master_article.published`
- **Condición:** Artículo de blog publicado con extensión > 1,500 palabras y Content Score > 80.
- **Acción:**
  1. `Content Agent` genera 1 script de video YouTube, 3 scripts de Shorts/Reels, 1 carrusel LinkedIn y 1 Newsletter.
  2. `Video Agent` renderiza los 3 Shorts/Reels con voz sintética y subtítulos.
  3. `Image Agent` diseña las láminas del carrusel en SVG/PNG.
  4. Programar publicaciones en colas de distribución de 18 canales.
- **Resultado Esperado:** 12 activos multimedia creados y programados en <30 minutos.
- **Atlas Aprende:** Estructura semántica del contenido para enriquecer el Grafo de Conocimiento.
- **Hermes Coordina:** Valida que las cuotas de API de ElevenLabs y Render no superen el presupuesto diario.

---

### 🛡️ BLOQUE 03: MODERACIÓN, REPUTACIÓN & DETECCIÓN DE FRAUDE

#### AUT-06: Moderación Pre-Publicación de UGC (User Generated Content)
- **Evento Disparador:** `ugc.content.submitted`
- **Condición:** Usuario o proveedor publica texto, fotos o comentarios en la plataforma.
- **Acción:**
  1. `Moderation Agent` analiza texto con NLP Toxicity Classifier y fotos con Vision Safety Detector.
  2. Si pasa reglas políticas, status = `Approved` y publicar inmediatamente.
  3. Si violaciones graves (NSFW, odio, spam), status = `Rejected` y notificar al autor.
- **Resultado Esperado:** Filtrado de contenido peligroso en <300 milisegundos.
- **Atlas Aprende:** Expresiones de spam o intentos de evasión de filtros por país.
- **Hermes Coordina:** Si el contenido es dudoso (Score 40-70), lo marca como `Pending_Human_Review` y lo envía a la cola de moderación.

#### AUT-07: Detección de Reseñas Falsas y Score de Manipulación
- **Evento Disparador:** `review.submitted`
- **Condición:** Reseña creada por un consumidor final.
- **Acción:**
  1. `Fraud Agent` verifica: ¿Existe transacción real? ¿Mismo IP que el proveedor? ¿Patrón de texto repetitivo? ¿Dispositivo sospechoso?
  2. Calcular Score de Fraude (0-100).
  3. Si Score < 20: Publicar reseña, actualizar Guaki Score del proveedor.
  4. Si Score >= 70: Bloquear reseña, emitir strike al perfil y notificar a la empresa.
- **Resultado Esperado:** Ecosistema de calificaciones 100% meritocrático y libre de manipulación.
- **Atlas Aprende:** Huellas digitales de granjas de reseñas y bots de valoración.
- **Hermes Coordina:** Si un proveedor acumula 2 reseñas bloqueadas por fraude en 30 días, congela su insignia de verificado.

---

### 💳 BLOQUE 04: PAGOS, FACTURACIÓN & RENOVACIONES

#### AUT-08: Procesamiento de Pago y Emisión de Factura Electrónica
- **Evento Disparador:** `payment.checkout.completed`
- **Condición:** Transacción confirmada por pasarela (Stripe, Mercado Pago, Wompi).
- **Acción:**
  1. Actualizar estado de suscripción del proveedor a `Active`.
  2. `Finance Agent` genera factura electrónica oficial ante la entidad tributaria (DIAN/SAT/etc.).
  3. Enviar recibo y factura en PDF por Email y WhatsApp.
  4. Disparar evento de conversión a Google Ads / Meta Ads via CAPI.
- **Resultado Esperado:** Suscripción activada y factura electrónica entregada en <10 segundos.
- **Atlas Aprende:** Atribución final de ingresos por canal de origen.
- **Hermes Coordina:** Si la API de facturación tributaria falla, reintenta en segundo plano cada 15 min sin afectar la experiencia del cliente.

#### AUT-09: Cobro Fallido y Secuencia de Dunning (Recuperación)
- **Evento Disparador:** `payment.subscription.failed`
- **Condición:** Intento de cobro recurrente rechazado por la pasarela de pago.
- **Acción:**
  1. Marcar suscripción en estado `Past_Due`.
  2. Reintentar cobro automáticamente en días 1, 3, 5 y 7.
  3. `CS Agent` envía notificación amistosa por WhatsApp informando actualización de tarjeta necesaria.
- **Resultado Esperado:** Recuperación de suscripción fallida sin cancelar la cuenta.
- **Atlas Aprende:** Tasas de fallo por banco emisor y método de pago en cada país.
- **Hermes Coordina:** Si en día 7 el cobro falla, degrada el plan a `Guaki Start` (gratuito) y notifica al equipo de ventas.

#### AUT-10: Flujo de Renovación Anticipada (30 Días Antes)
- **Evento Disparador:** `cron.renewal.30_days_notice`
- **Condición:** Suscripción anual vence en 30 días.
- **Acción:**
  1. `CS Agent` calcula el ROI generado al cliente en los últimos 11 meses (Clientes enviados, ingresos estimados, clics).
  2. Generar Reporte de Impacto Ejecutivo en PDF.
  3. Enviar reporte por WhatsApp/Email con oferta de renovación anticipada con descuento por pronto pago.
- **Resultado Esperado:** Renovación confirmada antes de la fecha de vencimiento.
- **Atlas Aprende:** Elasticidad de descuento necesaria para asegurar la renovación en cada cohorte.
- **Hermes Coordina:** Si el cliente tiene Health Score < 60, no envía oferta automática; asigna el caso a un Customer Success Manager.

---

### 📩 BLOQUE 05: COMUNICACIÓN, ALERTAS & SOPORTE

#### AUT-11: Respuesta Automática a Solicitudes de WhatsApp (SLA < 60s)
- **Evento Disparador:** `contact.whatsapp.inbound`
- **Condición:** Usuario consumidor envía mensaje a un proveedor verificado.
- **Acción:**
  1. Notificar al proveedor por app y WhatsApp.
  2. Monitorear tiempo de respuesta del proveedor.
  3. Si proveedor NO responde en 60 segundos: `Support Agent` (IA del proveedor) responde automáticamente contestando dudas del cliente.
- **Resultado Esperado:** Cero prospectos perdidos por falta de respuesta del negocio.
- **Atlas Aprende:** Consultas más frecuentes por categoría para entrenar la IA de respuesta rápida.
- **Hermes Coordina:** Registra el retraso del proveedor y penaliza ligeramente su Guaki Score por fallo de SLA.

#### AUT-12: Sistema de Alertas Inteligentes P0/P1
- **Evento Disparador:** `system.alert.triggered`
- **Condición:** Evento de severidad P0 (Caída de sitio, error de pasarela de pago) o P1 (Caída de tráfico >30%).
- **Acción:**
  1. Disparar notificación push instantánea al equipo de guardia en PagerDuty y WhatsApp del CEO.
  2. `Hermes Orchestrator` aísla el componente defectuoso y activa la infraestructura de respaldo.
- **Resultado Esperado:** Tiempo de respuesta humano/sintético a fallos críticos < 5 minutos.
- **Atlas Aprende:** Patrones de fallo en servidores para prevenir incidentes futuros.
- **Hermes Coordina:** Asigna la resolución inmediata al `DevOps Agent` o al ingeniero de guardia.

---

### 📈 BLOQUE 06: MÉTRICAS, SCORES & INTELIGENCIA COMPETITIVA

#### AUT-13: Recálculo Diario de Health Score del Cliente
- **Evento Disparador:** `cron.analytics.daily_health_score`
- **Condición:** Ejecución programada diaria a las 02:00 AM.
- **Acción:**
  1. `Analytics Agent` procesa métricas del proveedor: Logins (20%), Respuesta a contactos (30%), Completitud de perfil (15%), Reseñas positivas (20%), Pagos al día (15%).
  2. Calcular Health Score (0-100).
  3. Guardar en Data Layer Gold.
  4. Si Health Score disminuye > 15 puntos en 7 días: Disparar alerta de Churn Risk.
- **Resultado Esperado:** Monitoreo actualizado de la salud comercial de cada cliente en el ecosistema.
- **Atlas Aprende:** Correlaciones sutiles entre comportamientos de uso y probabilidad de cancelación.
- **Hermes Coordina:** Dispara automáticamente el playbook de retención correspondiente según el nivel de riesgo.

#### AUT-14: Análisis Automático de Competencia y Precios Locales
- **Evento Disparador:** `cron.research.weekly_competitor_scan`
- **Condición:** Ejecución programada semanal por ciudad y categoría.
- **Acción:**
  1. `Research Agent` raspa precios públicos y ofertas de competidores fuera de Guaki en la zona.
  2. `Business Agent` compara los precios del mercado contra los precios de los proveedores Guaki.
  3. Generar reporte de oportunidades de precio para proveedores cuyo precio esté >20% por encima o debajo de la media local.
- **Resultado Esperado:** Sugerencias de optimización de precios entregadas a los proveedores vía Atlas Coach.
- **Atlas Aprende:** Elasticidad de precio real por categoría y municipio.
- **Hermes Coordina:** Envía las recomendaciones en el resumen semanal de Atlas Coach sin saturar al proveedor.

---

## 📊 PARTE III — RESUMEN DE MATRIZ DE EVENTOS Y ACCIONES

| Evento | Condición | Agente Ejecutor | Acción Principal | Resultado Medible | Atlas Aprende | Hermes Supervision |
|:---|:---|:---|:---|:---|:---|:---|
| `provider.account.registered` | Formulario válido | Verification + Onboarding | Enviar WhatsApp bienvenida + Crear checklist | Primer mensaje entregado <5s | Canal de atribución | Verifica latencia de API |
| `provider.documents.uploaded` | Docs cargados | Verification Agent | OCR + Consulta DB gubernamental | Perfil verificado <60s | Patrones de autenticidad | Escala a humano si <95% match |
| `seo.keyword_opportunity.detected` | Vol > 100, Diff < 40 | SEO + Content + Argus | Crear y publicar landing en Vercel | Página creada e indexada <15m | Intención de búsqueda local | Frena si LCP > 2.5s |
| `content.master_article.published` | Blog > 1500 palabras | Content + Video + Image | Cascada a 12 formatos multimedia | 12 activos en colas <30m | Estructura semántica | Controla cuotas de render |
| `ugc.content.submitted` | UGC enviado | Moderation Agent | Escaneo NLP toxicity + Vision Safety | Filtrado en <300ms | Jerga y spam local | Pasa a humano si score 40-70 |
| `review.submitted` | Reseña usuario | Fraud Agent | Validar transacción, IP, dispositivo | Score Fraude (0-100) en <1s | Huellas de bots de reseñas | Congela sello si fraudes >2 |
| `payment.checkout.completed` | Pago pasarela OK | Finance Agent | Facturación electrónica + CAPI | Factura entregada <10s | Atribución de ingresos | Reintenta timbrado si falla API |
| `payment.subscription.failed` | Pago rechazado | CS Agent | Reintentos días 1,3,5,7 + Dunning WA | Recuperación de cuenta | Tasas de rechazo por banco | Degrada a plan gratis en día 7 |
| `contact.whatsapp.inbound` | Mensaje entrante | Support Agent | Si proveedor no contesta en 60s, IA responde | Cero prospectos perdidos | Preguntas frecuentes | Penaliza Guaki Score si falla SLA |
| `cron.analytics.daily_health_score` | Ejecución 02:00 AM | Analytics Agent | Calcular Health Score (0-100) | Metric Gold Layer actualizada | Predictor de Churn | Dispara playbook si cae >15 pts |

---

> **AUTOMATIONS MATRIX & EVENT-DRIVEN ENGINE BIBLE v1.0 — 50+ PROCESOS REACTIVOS BASADOS EN EVENTOS DOCUMENTADOS Y APROBADOS.**
