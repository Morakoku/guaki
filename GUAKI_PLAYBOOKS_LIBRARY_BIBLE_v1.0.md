# GUAKI PLAYBOOKS LIBRARY BIBLE v1.0

Este documento contiene los 19 playbooks operativos completos y detallados que rigen el funcionamiento, crecimiento y escalabilidad de Guaki, la plataforma SaaS líder en crecimiento de negocios en América Latina.

---

## 1. PLAYBOOK COMERCIAL

**Objetivo del playbook:**
Ejecutar el ciclo de ventas completo, desde la detección inicial de leads calificados hasta la firma del contrato y la activación del servicio, maximizando la tasa de conversión mediante la orquestación entre agentes de IA y ejecutivos de ventas humanos.

**Cuándo se activa (triggers):**
- Diariamente a las 08:00 AM (generación de batch).
- Cuando Mapache identifica una nueva PyME o proveedor de servicios en línea.
- Cuando un prospecto llena el formulario en la web o interactúa con contenido de la SEO Factory.

**Pasos detallados:**
1. **Prospección (Agente Mapache):** Escaneo continuo de redes sociales, directorios locales y Google Maps para identificar negocios sin digitalización óptima.
2. **Enriquecimiento (Agente Ardilla):** Recopilación de datos de contacto (WhatsApp, email), nombre del dueño, tamaño estimado y sector.
3. **Calificación BANT (Atlas AI):** Atlas procesa los datos y asigna un "Lead Score". Leads > 70 pasan a la siguiente fase.
4. **Acercamiento Inicial (Agente Kronos):** Envío de secuencia automatizada vía WhatsApp/Email mostrando el "Business Score" actual del prospecto y áreas de mejora.
5. **Reunión/Demo (Humano - Closer):** Si el prospecto muestra interés, Kronos agenda una demo. El Closer humano presenta cómo Guaki (Start, Growth, Pro, etc.) resolverá sus dolores específicos.
6. **Generación de Propuesta (Agente Hephaestus):** Basado en las notas de la demo, se genera un PDF interactivo y un contrato digital en 60 segundos.
7. **Manejo de Objeciones (Humano + Atlas):** Atlas provee al Closer argumentos en tiempo real según la objeción (precio, tiempo, competencia).
8. **Cierre y Activación (Agente Kronos):** Firma electrónica vía WhatsApp. Cobro de la primera mensualidad usando Stripe/MercadoPago y pase a Onboarding.

**Responsable:** Agentes Mapache, Ardilla, Kronos, Hephaestus, Atlas AI y Ejecutivo Comercial (Humano).

**Métricas de éxito:**
- Costo de Adquisición de Clientes (CAC).
- Tasa de Conversión (Lead a Cierre).
- Tiempo de ciclo de ventas (Sales Cycle Time).

**Escalación si falla:**
Si un lead BANT > 90 no responde tras 5 toques, escala a Sales Manager para llamada directa de rescate (Tier 2).

**Templates/Mensajes asociados:**
- Template_WA_Prospecto_Frio_v3 (Con Business Score).
- Template_Email_Propuesta_Pro.

**Tiempo máximo de ejecución:**
14 días desde la detección hasta el cierre.

---

## 2. PLAYBOOK SEO

**Objetivo del playbook:**
Dominar los resultados de búsqueda locales y de larga cola para servicios en LATAM, pasando desde la detección de intención de búsqueda hasta la indexación y ranking de millones de páginas programáticas.

**Cuándo se activa (triggers):**
- Semanalmente para la generación masiva.
- Cuando Atlas detecta una nueva tendencia de búsqueda o nicho desatendido (ej. "plomeros 24 hrs en Bogotá").

**Pasos detallados:**
1. **Atlas Demand Intelligence:** Análisis de volúmenes de búsqueda, dificultad de palabras clave y vacíos de contenido en mercados locales.
2. **Estructuración de Datos (Atlas + Knowledge Graph):** Mapeo de la intención de búsqueda con los perfiles de proveedores activos en Guaki.
3. **Compilación (SEO Factory):** Generación automática de landing pages geo-optimizadas ("Servicio + Ciudad + Barrio") inyectando datos reales, reseñas y perfiles de proveedores.
4. **Validación QA (Agente Argus):** Argus revisa que el contenido generado no sea spam, tenga correcta densidad de palabras clave, meta tags, schema markup local y pase los Core Web Vitals.
5. **Despliegue (Deploy):** Inserción de las páginas en el sitemap dinámico y publicación en la infraestructura Edge.
6. **Indexación:** Envío programático mediante la Google Indexing API.
7. **Monitoreo (Hermes):** Tracking de posiciones diarias usando APIs de SEO (Ahrefs/Semrush).
8. **Bucle de Optimización:** Si una página no llega al Top 10 en 30 días, Atlas reescribe el contenido y ajusta el enlazado interno (PageRank sculpting).

**Responsable:** Atlas AI, SEO Factory, Agente Argus, Especialista SEO (Humano para estrategia macro).

**Métricas de éxito:**
- Tráfico Orgánico Non-Branded.
- Número de páginas indexadas en Top 3 y Top 10.
- Clics a perfiles de clientes desde landing SEO.

**Escalación si falla:**
Si hay caída masiva de tráfico (>15% en 48h), alerta roja a Lead SEO y equipo de Ingeniería para revisión de penalizaciones.

**Templates/Mensajes asociados:**
- Prompt_Generacion_Landing_Local_v5.
- Schema_LocalBusiness_Dynamic.

**Tiempo máximo de ejecución:**
48 horas desde la detección de la keyword hasta la indexación de la URL.

---

## 3. PLAYBOOK SEM

**Objetivo del playbook:**
Gestionar, optimizar y escalar campañas de publicidad paga (Google Ads, Meta Ads) para captar tanto proveedores para la plataforma (B2B) como clientes finales para los proveedores (B2C), maximizando el ROAS y controlando el CPA.

**Cuándo se activa (triggers):**
- Lanzamiento de nueva ciudad o categoría.
- Cuando el CPA cae por debajo del target (señal de escalar).
- Diariamente para la optimización de presupuestos.

**Pasos detallados:**
1. **Creación de Campañas:** Atlas sugiere estructura de campañas basadas en datos históricos. Creación de AdGroups por intención (transaccional vs. exploratoria).
2. **Generación de Creatividades:** Content Factory genera copys (textos) e imágenes/videos adaptados a la plataforma (Meta, Google, TikTok).
3. **Pruebas A/B (Testing):** Lanzamiento de 5 variaciones de copy y 5 creatividades por AdGroup con bajo presupuesto durante 72 horas.
4. **Optimización de Presupuesto:** Agentes evalúan el Costo por Adquisición (CPA) y el Valor del Tiempo de Vida (LTV) proyectado. Se reasigna presupuesto a las combinaciones ganadoras.
5. **Monitoreo de ROAS (Return on Ad Spend):** Integración con el CRM de Guaki para asegurar que los leads generados se conviertan en ingresos reales.
6. **Reglas de Pausa/Escala:**
   - Si CPA > 20% del límite: Pausar anuncio automáticamente.
   - Si CPA < 15% del objetivo y ROAS > 3: Aumentar presupuesto diario en 15%.
7. **Rotación Creativa:** Cada 14 días, reemplazar el 20% de las creatividades de menor rendimiento para evitar "ad fatigue".

**Responsable:** Agente Kronos (Gestión de Ads), Content Factory (Creativos), Performance Manager (Humano).

**Métricas de éxito:**
- Costo Por Adquisición (CPA).
- Retorno de Inversión Publicitaria (ROAS).
- Click-Through Rate (CTR) de anuncios.

**Escalación si falla:**
Si el CPA excede el límite por 3 días consecutivos, el sistema pausa la campaña y requiere revisión humana de segmentación y landing page.

**Templates/Mensajes asociados:**
- Template_Copy_Meta_Urgencia.
- Framework_A/B_Test_Log.

**Tiempo máximo de ejecución:**
Optimización continua; rotación creativa cada 14 días.

---

## 4. PLAYBOOK GROWTH

**Objetivo del playbook:**
Activar y acelerar el "Growth Flywheel" de Guaki mediante tácticas orgánicas, viralidad, programas de referidos y crecimiento impulsado por el producto (Product-Led Growth), logrando efectos de red masivos en LATAM.

**Cuándo se activa (triggers):**
- Cuando un cliente alcanza un "Guaki Score" > 80 (momento "Aha!").
- En el aniversario de suscripción de un usuario.
- Tras la recepción de una reseña de 5 estrellas.

**Pasos detallados:**
1. **Activación de Referidos:** Cuando un cliente alcanza éxito demostrable (ej. 10 ventas por Guaki), se envía un mensaje de WhatsApp (Agente Kronos) ofreciendo 1 mes gratis del plan Premium por cada colega referido.
2. **Programa de Embajadores:** Identificación de usuarios "Power Users" mediante Atlas. Invitación a un grupo exclusivo de embajadores donde obtienen comisiones (revenue share) por afiliar a otros negocios.
3. **Viral Loops (B2C to B2B):** Cada vez que un usuario final (cliente del proveedor) hace una reserva o pago a través de Guaki, ve un banner "Impulsado por Guaki - Haz crecer tu negocio".
4. **Tácticas Product-Led Growth (PLG):** Funcionalidades freemium que requieren invitar a otros (ej. colaborar con otro proveedor para un paquete de servicios) desbloquean características premium temporales.
5. **Amplificación de Efectos de Red:** A medida que aumenta la densidad de proveedores en una ciudad, se lanzan campañas B2C mostrando el "Directorio Dinámico Guaki" para esa zona, lo que atrae más clientes finales, que a su vez atraen más proveedores.

**Responsable:** Growth Lead (Humano), Agente Kronos (Mensajería), Atlas AI (Segmentación).

**Métricas de éxito:**
- Coeficiente Viral (K-factor).
- Porcentaje de Nuevos Usuarios Orgánicos / Referidos.
- Network Density por ciudad.

**Escalación si falla:**
Si el coeficiente viral cae debajo de 0.1, el equipo de Producto y Growth realiza entrevistas cualitativas para rediseñar los incentivos.

**Templates/Mensajes asociados:**
- Template_WA_Referral_Incentive.
- Badge_Web_PoweredByGuaki.

**Tiempo máximo de ejecución:**
Ciclos de experimentación de 2 semanas.

---

## 5. PLAYBOOK CUSTOMER SUCCESS

**Objetivo del playbook:**
Gestionar el ciclo de vida completo del cliente (Nuevo → Configurando → Optimizado → Creciendo → Escalando → Referente) asegurando retención, satisfacción y aumento constante del "Health Score".

**Cuándo se activa (triggers):**
- Cambio de etapa en el ciclo de vida.
- Caída del Health Score en >15 puntos.
- Alerta de "Churn Risk" (Riesgo de abandono) emitida por Atlas.

**Pasos detallados:**
1. **Monitoreo del Health Score:** Atlas evalúa uso de la plataforma, completitud del perfil, tiempo de respuesta a clientes y pagos.
2. **Fase "Configurando" (Días 1-7):** Guiar al usuario para que complete el 100% de su perfil (fotos, precios, horarios). Intervenciones automatizadas si hay estancamiento.
3. **Fase "Optimizado" (Días 8-30):** Asegurar la primera transacción exitosa. El Agente Kronos envía tips personalizados.
4. **Fases "Creciendo" a "Escalando" (Mes 2+):** Customer Success Manager (Humano) realiza "Business Reviews" trimestrales (EBR) con clientes Pro y Premium para mostrar ROI y sugerir mejoras.
5. **Intervenciones de Riesgo:** Si Atlas detecta bajo login o pagos fallidos, se genera un ticket prioritario. Kronos intenta contacto automatizado; si falla, un CSM llama directamente para identificar fricciones.
6. **Consagración a "Referente":** Clientes con alto Health Score son invitados a crear casos de estudio o webinars conjuntos, alimentando la máquina de Marketing.

**Responsable:** Customer Success Manager (Humano), Atlas AI, Agente Kronos.

**Métricas de éxito:**
- Net Revenue Retention (NRR).
- Customer Health Score Promedio.
- Churn Rate (Tasa de cancelación) < 2% mensual.

**Escalación si falla:**
Cuentas Premium en riesgo inminente de churn se escalan a Head of CS o directamente a un Founder (dependiendo del MRR de la cuenta).

**Templates/Mensajes asociados:**
- Script_Llamada_Rescate_Churn.
- QBR_Presentation_Template (Generada por Hephaestus).

**Tiempo máximo de ejecución:**
Continuo (monitoreo diario, intervenciones < 24h).

---

## 6. PLAYBOOK IA

**Objetivo del playbook:**
Garantizar la precisión, velocidad y relevancia del "cerebro cognitivo" (Atlas AI Core), manejando el entrenamiento, evaluación, despliegue, detección de deriva (drift) y actualización de modelos y embeddings.

**Cuándo se activa (triggers):**
- Semanalmente para reentrenamiento de modelos predictivos.
- Cuando la precisión de un modelo cae por debajo del umbral del 92%.
- Ante el lanzamiento de nuevas capacidades (ej. nuevo idioma).

**Pasos detallados:**
1. **Recolección y Limpieza de Datos:** Extracción de interacciones de la semana (transcripciones, resultados de ventas, soporte). Argus anonimiza PII (Personal Identifiable Information).
2. **Entrenamiento de Modelos (Atlas):** Fine-tuning de LLMs (modelos de lenguaje) y actualización de modelos predictivos (Lead Scoring, Churn Prediction).
3. **Evaluación (Shadow Mode):** Los nuevos modelos se despliegan en "modo sombra", procesando datos reales sin afectar al usuario, comparando resultados contra la versión en producción.
4. **Detección de Deriva (Drift Detection):** Monitoreo estadístico para asegurar que el comportamiento del modelo no se degrade por cambios en los datos del mundo real.
5. **Despliegue y A/B Testing:** Si el nuevo modelo supera al anterior, se enruta el 10% del tráfico al nuevo modelo. Si las métricas de negocio mejoran, se despliega al 100%.
6. **Actualización de Embeddings (Vector Memory):** Refresco de la base de datos vectorial con los nuevos artículos de ayuda, productos y perfiles de proveedores para mejorar la búsqueda semántica.
7. **Rollback automático:** Si tras el despliegue se detectan latencias altas (>2s) o aumento de errores, Hermes revierte a la versión anterior automáticamente.

**Responsable:** Equipo de AI/ML Engineering (Humano), Agente Argus (QA), Hermes OS (Orquestación).

**Métricas de éxito:**
- Precisión del Modelo (F1 Score, Accuracy).
- Latencia de Inferencia (< 500ms).
- Tasa de Errores/Alucinaciones.

**Escalación si falla:**
Caídas en producción o alucinaciones severas activan una alerta P0 al equipo de guardia de AI.

**Templates/Mensajes asociados:**
- Dashboard_Model_Drift_Grafana.
- Prompt_Evaluation_Matrix.

**Tiempo máximo de ejecución:**
Ciclo completo de reentrenamiento: 48 horas. Rollback: < 2 minutos.

---

## 7. PLAYBOOK ATLAS

**Objetivo del playbook:**
Mantener y optimizar el Knowledge Graph (Grafo de Conocimiento) y la Vector Memory de Atlas para asegurar la más alta calidad en recomendaciones, matching de clientes/proveedores y "recirculación cognitiva" en la plataforma.

**Cuándo se activa (triggers):**
- Diariamente durante horas valle (02:00 AM).
- Cuando se añaden más de 1,000 nuevos nodos (usuarios, servicios, ubicaciones) al sistema.

**Pasos detallados:**
1. **Ingesta de Nodos y Aristas:** Actualización del Knowledge Graph con las nuevas relaciones del día (Ej. "Usuario X compró Servicio Y en Ciudad Z").
2. **Resolución de Entidades (Entity Resolution):** Atlas fusiona perfiles duplicados (ej. "Juan Perez Plomería" y "Plomero Juan Perez") usando algoritmos de similitud.
3. **Actualización de Pesos:** Ajuste de la fuerza de las conexiones en el grafo basado en interacciones recientes (clics, compras, reseñas).
4. **Optimización de Vector Memory:** Re-indexación de la base de datos vectorial (Pinecone/Milvus) utilizando técnicas de compresión (HNSW) para mantener búsquedas sub-milisegundo.
5. **Quality Assurance de Recomendaciones:** Argus ejecuta un conjunto de pruebas sintéticas simulando búsquedas complejas (ej. "Busco un electricista barato en la Roma Norte que acepte tarjeta").
6. **Recirculación Cognitiva:** Atlas analiza qué búsquedas no arrojaron resultados satisfactorios hoy, y programa a la SEO Factory para generar contenido o a Mapache para prospectar proveedores en ese nicho.

**Responsable:** Data Engineering Team (Humano), Atlas AI, Agente Argus.

**Métricas de éxito:**
- Cobertura del Grafo de Conocimiento (Densidad de conexiones).
- NDCG (Normalized Discounted Cumulative Gain) en resultados de búsqueda.
- Tiempo de respuesta de consultas vectoriales.

**Escalación si falla:**
Si la resolución de entidades falla o agrupa entidades incorrectas masivamente, se congela la ingesta y se requiere intervención humana.

**Templates/Mensajes asociados:**
- Cypher_Query_Optimization_Log.
- KG_Health_Report.

**Tiempo máximo de ejecución:**
Proceso batch de 3 horas durante la madrugada.

---

## 8. PLAYBOOK HERMES

**Objetivo del playbook:**
Garantizar que Hermes OS (el COO autónomo) orqueste de manera impecable a todos los agentes (Mapache, Ardilla, Kronos, Argus, Hephaestus), maneje incidentes de automatización y provea visibilidad total al equipo directivo.

**Cuándo se activa (triggers):**
- 24/7 (Hermes es el sistema operativo residente).
- A las 07:00 AM para la generación del Daily Briefing.
- Ante la caída de cualquier microservicio o agente.

**Pasos detallados:**
1. **Asignación de Tareas y Balanceo de Carga:** Hermes evalúa la cola de tareas (leads por enriquecer, páginas por crear) y asigna recursos computacionales a los agentes de IA según SLAs.
2. **Monitoreo de SLAs:** Verifica constantemente que Mapache esté prospectando al ritmo adecuado y que Kronos responda en menos de 1 minuto a los chats.
3. **Respuesta a Incidentes (Self-Healing):** Si el agente Ardilla choca con un límite de API externa, Hermes lo pausa, usa credenciales de respaldo y reporta el evento.
4. **Squad Health Management:** Evaluación del estado de cada agente (memoria, latencia, tasa de éxito). Si Argus está rechazando demasiadas páginas, Hermes notifica a los ingenieros sobre posible fallo en los prompts.
5. **Generación del Daily Briefing:** A las 07:00 AM, Hermes compila un resumen ejecutivo para los founders de Guaki: Ingresos de ayer, nuevos clientes, incidentes resueltos, y objetivos para el día.
6. **Coordinación Inter-Agentes:** Facilita el paso de testigo (handoff). Ejemplo: Asegura que Hephaestus no genere una propuesta hasta que Ardilla haya confirmado los datos fiscales.

**Responsable:** Hermes OS (Totalmente autónomo), DevOps/SRE (Humano - Supervisión).

**Métricas de éxito:**
- Uptime del enjambre de agentes (99.99%).
- Tasa de cumplimiento de SLAs internos.
- Tiempo medio de recuperación (MTTR) para agentes.

**Escalación si falla:**
Fallo de Hermes OS es un Incidente P0. PagerDuty alerta instantáneamente a CTO y Lead SRE.

**Templates/Mensajes asociados:**
- Hermes_Daily_Executive_Briefing.md.
- Agent_SLA_Violation_Alert.

**Tiempo máximo de ejecución:**
Operación en tiempo real (monitoreo cada segundo).

---

## 9. PLAYBOOK VENTAS

**Objetivo del playbook:**
Estandarizar y perfeccionar el proceso de cierre ejecutado por los Closers humanos (apoyados por IA), transformando prospectos interesados en clientes de pago mediante un enfoque consultivo y de alto valor.

**Cuándo se activa (triggers):**
- Cuando el Agente Kronos agenda una demo o reunión en el calendario del Closer.
- Cuando un prospecto responde positivamente a un cold email/WhatsApp pidiendo más información.

**Pasos detallados:**
1. **Preparación (Pre-Call):** El Closer revisa el "Dossier del Prospecto" generado por Atlas (datos de Ardilla, Business Score, competidores locales, posibles objeciones pre-calculadas).
2. **Primer Contacto & Diagnóstico (Discovery):** Reunión de 15-20 mins. Preguntas de calificación profunda (SPIN selling). Identificación del dolor principal (Ej. falta de visibilidad online, procesos manuales).
3. **Presentación de Solución (Demo):** Mostrar la plataforma Guaki adaptada a su nicho. Enfoque en cómo el programa (Growth/Pro) resolverá su dolor específico.
4. **Generación de Propuesta:** Usar Hephaestus para enviar una propuesta interactiva durante la llamada o máximo 10 minutos después.
5. **Seguimiento (Follow-up):** Agente Kronos realiza seguimiento automatizado a los 2, 5 y 7 días si no hay firma. El Closer hace seguimiento humano estratégico a los 3 y 6 días.
6. **Manejo de Objeciones:** Uso del "Battlecard" en tiempo real provisto por Atlas. Si la objeción es "precio", demostrar ROI con la calculadora integrada.
7. **Cierre y Activación:** Firma del contrato. El Closer hace la transición oficial al equipo de Customer Success/Onboarding.

**Responsable:** Ejecutivo de Ventas (Closer Humano), Atlas AI, Agente Hephaestus.

**Métricas de éxito:**
- Win Rate (% de demos convertidas a cierres).
- Average Revenue Per User (ARPU) inicial.
- Tiempo de respuesta post-demo.

**Escalación si falla:**
Si un negocio "Enterprise" (alto valor) se estanca en la etapa de propuesta por más de 10 días, interviene el Sales Director para negociaciones finales.

**Templates/Mensajes asociados:**
- SPIN_Questions_Script.
- Guion_Demo_Personalizada.

**Tiempo máximo de ejecución:**
1-3 semanas desde la primera llamada.

---

## 10. PLAYBOOK SOPORTE

**Objetivo del playbook:**
Brindar resolución rápida, precisa y empática a los problemas de los usuarios, escalando eficientemente desde la IA (Tier 1) hasta especialistas senior (Tier 3), manteniendo alta satisfacción y bajos costos operativos.

**Cuándo se activa (triggers):**
- Un usuario abre un chat de soporte en la plataforma.
- Envío de un correo a ayuda@guaki.com.
- Interacción en redes sociales buscando ayuda.

**Pasos detallados:**
1. **Tier 1 - Resolución Autónoma (Agente IA - Kronos/Atlas):** Recepción inmediata. Comprensión semántica del problema. Respuesta instantánea consultando la base de conocimientos. Ejecución de tareas simples (reset de contraseña, actualización de tarjeta).
2. **Clasificación y Triage:** Si la IA no puede resolverlo (Confianza < 85%), clasifica el ticket por urgencia, tema y sentimiento del usuario, y lo asigna al humano correcto.
3. **Tier 2 - Soporte Humano Asistido:** Agente de soporte humano toma el chat/ticket. Atlas lee el contexto previo y sugiere 3 posibles respuestas o acciones al humano (Copilot mode). El humano aprueba, edita y envía.
4. **Gestión de SLAs:** Hermes monitorea que el Tier 2 responda en < 5 minutos en chat o < 2 horas en ticket.
5. **Tier 3 - Escalación Técnica/Senior:** Problemas de facturación complejos, bugs o caídas se escalan a especialistas de producto o ingeniería.
6. **Cierre y CSAT:** Al resolver, Kronos envía una breve encuesta de Satisfacción del Cliente (CSAT).
7. **Retroalimentación (Feedback loop):** Si un ticket recurrente se resolvió en Tier 2, Atlas ingesta la solución para que el Tier 1 pueda resolverlo automáticamente en el futuro.

**Responsable:** Agente de IA, Agente de Soporte Humano (Tier 2/3).

**Métricas de éxito:**
- First Contact Resolution (FCR).
- Porcentaje de deflexión (tickets resueltos por IA sin toque humano, meta > 60%).
- Customer Satisfaction Score (CSAT).

**Escalación si falla:**
Ticket P1 (usuario no puede cobrar/acceder) sin respuesta en 30 minutos escala a Support Manager por SMS.

**Templates/Mensajes asociados:**
- Auto_Reply_Triage.
- Plantilla_Escalacion_Bug_Jira.

**Tiempo máximo de ejecución:**
Tier 1: < 5 segundos. Tier 2: < 2 horas. Tier 3: < 24 horas.

---

## 11. PLAYBOOK ONBOARDING

**Objetivo del playbook:**
Garantizar que los nuevos proveedores experimenten el "Time to Value" (TTV) más corto posible durante sus primeros 7 días, logrando un perfil 100% completo y preparado para recibir clientes.

**Cuándo se activa (triggers):**
- Inmediatamente tras la firma del contrato y cobro inicial.

**Pasos detallados:**
1. **Día 0 - Bienvenida y Setup Básico:** Recepción de credenciales. El Agente Kronos (vía WhatsApp) guía al usuario para descargar la app y acceder.
2. **Día 1 - Completitud de Perfil:** Asistente interactivo pide nombre, descripción (Atlas la optimiza para SEO), horarios y área de cobertura.
3. **Día 2 - Catálogo y Precios:** Subida de los servicios principales. Si el usuario no sabe qué cobrar, Atlas sugiere precios basados en el mercado local.
4. **Día 3 - Verificación y Fotos:** Subida de logos e imágenes. El Agente Argus analiza las imágenes (calidad, contenido apropiado) y aprueba el perfil. Validación de identidad si aplica.
5. **Día 4 - Conexión de Canales:** Integración del botón de WhatsApp del proveedor y configuración de la pasarela de pagos.
6. **Día 5-6 - Capacitación:** Envío de píldoras de video cortas sobre cómo manejar solicitudes, cotizar y pedir reseñas.
7. **Día 7 - Activación SEO y Primer Cliente:** El perfil se marca como "Activo", entra en la SEO Factory. Se realiza un push inicial (SEM/Directorio) para intentar generar el primer lead al proveedor y demostrar valor.

**Responsable:** Onboarding Specialist (Humano) para cuentas Pro/Premium; Agente Kronos para cuentas Start/Growth.

**Métricas de éxito:**
- Time to Value (TTV - Días hasta el primer lead recibido).
- Activation Rate (% de perfiles completados al 100%).
- Drop-off rate durante onboarding.

**Escalación si falla:**
Si al Día 4 el perfil está incompleto, se detienen los mensajes automatizados y el Onboarding Specialist llama por teléfono.

**Templates/Mensajes asociados:**
- Mensaje_WA_Dia1_CompletarPerfil.
- Check-list_Onboarding_Dashboard.

**Tiempo máximo de ejecución:**
7 días estrictos.

---

## 12. PLAYBOOK RENOVACIÓN

**Objetivo del playbook:**
Asegurar la renovación de contratos (especialmente anuales), maximizando la retención de ingresos demostrando proactivamente el valor generado y previniendo el churn sorpresivo.

**Cuándo se activa (triggers):**
- 30 días antes de la fecha de expiración de un contrato anual (o cambio de ciclo de facturación).

**Pasos detallados:**
1. **D-30: Health Check (Atlas):** Atlas analiza el uso del cliente en el último año: ROI estimado, leads generados, posición en SEO, Health Score actual.
2. **D-25: Demostración de Valor:** Generación automática (Hephaestus) del "Year in Review" (Resumen del año). Un reporte visual mostrando cómo Guaki ayudó a crecer su negocio.
3. **D-20: Oferta de Renovación:** Envío de la propuesta de renovación. Se incluyen incentivos por renovación temprana (ej. "Renueva hoy y mantén el precio de 2024").
4. **D-15: Intervención Humana (Si aplica):** Para cuentas de alto valor (Pro/Enterprise) o aquellas con Health Score bajo (<60), el CSM agenda una llamada de revisión de cuenta.
5. **D-10: Negociación/Ajustes:** Manejo de objeciones (ej. "no tuve suficientes clientes"). El CSM puede aplicar descuentos condicionados o agregar meses gratis de extensiones.
6. **D-5: Recordatorio Final de Cobro Automático:** Notificación legal de que la tarjeta será cargada, para evitar contracargos.
7. **D-0: Confirmación:** Cobro exitoso, emisión de factura automatizada y mensaje de agradecimiento.

**Responsable:** Agente Kronos (Notificaciones), Customer Success Manager (Renovaciones complejas), Atlas AI (Análisis de datos).

**Métricas de éxito:**
- Renewal Rate (Tasa de renovación > 85%).
- Net Retention Rate (NRR > 100%).
- % de Renovaciones Automáticas (Sin toque humano).

**Escalación si falla:**
Si el cliente expresa intención de cancelar (D-15), entra inmediatamente al "Playbook Customer Success - Alerta de Churn Risk" para retención intensiva.

**Templates/Mensajes asociados:**
- Reporte_Year_In_Review_Guaki.
- Email_D5_Auto_Renewal_Notice.

**Tiempo máximo de ejecución:**
30 días previos a la fecha de corte.

---

## 13. PLAYBOOK UPSELLING

**Objetivo del playbook:**
Aumentar el Average Revenue Per User (ARPU) identificando momentos precisos donde un cliente se beneficiaría de un plan superior (Upsell) o servicios adicionales (Cross-sell), ejecutando la venta de forma natural y consultiva.

**Cuándo se activa (triggers):**
- Cliente alcanza el límite de características de su plan actual (ej. límite de leads mensuales).
- Atlas detecta alta adopción de funcionalidades clave y un Health Score > 90.
- El cliente tiene un ticket promedio alto y se beneficiaría de herramientas Enterprise.

**Pasos detallados:**
1. **Identificación de Oportunidad (Atlas):** Algoritmos analizan patrones de uso. Si un cliente "Growth" tiene picos de tráfico y requiere automatizaciones que solo están en "Pro", se marca como prospecto de Upsell.
2. **Generación de Business Case:** Atlas compila un mini-reporte de ROI: "Si te pasas a Pro, automatizarás X horas y podrías cerrar Y clientes más."
3. **Acercamiento Consultivo (In-app o Humano):**
   - *In-app:* Banners contextuales en momentos de fricción (ej. al intentar usar una función bloqueada).
   - *Humano:* El CSM contacta al cliente con el reporte de ROI generado.
4. **Prueba (Opcional):** Otorgar un "Trial" de 7 días de las funciones premium para que el usuario experimente el valor sin riesgo.
5. **Negociación y Cierre:** El CSM maneja dudas, aprueba la actualización y prorrata el pago restante del mes.
6. **Activación de Add-ons:** Si no hay Upsell de plan, sugerir la activación de Add-ons (ej. Paquete extra de SMS, SEO Booster).
7. **Onboarding del Nuevo Plan:** Asegurar que el usuario adopte rápidamente las nuevas funcionalidades adquiridas.

**Responsable:** Atlas AI (Detección), Account Manager / CSM (Humano para planes altos), Plataforma (Automatizado para Start/Growth).

**Métricas de éxito:**
- Expansion Revenue (Ingresos por expansión).
- % de Clientes que hacen Upgrade anualmente.
- Tasa de adopción de funciones premium.

**Escalación si falla:**
Si el intento de upsell es rechazado, se registra la objeción en el CRM y no se vuelve a intentar agresivamente por 90 días para evitar fricción.

**Templates/Mensajes asociados:**
- In_App_Modal_Limit_Reached.
- Script_CSM_Upsell_ROI.

**Tiempo máximo de ejecución:**
Oportunista; típicamente 1-2 semanas desde la detección.

---

## 14. PLAYBOOK CRISIS

**Objetivo del playbook:**
Gestionar rápida y eficientemente situaciones críticas (caídas de plataforma, brechas de datos, crisis de PR, o cobertura mediática negativa) para minimizar el impacto en la reputación, los ingresos y la confianza de los usuarios.

**Cuándo se activa (triggers):**
- Caída de la plataforma (Downtime) mayor a 15 minutos.
- Detección de brecha de seguridad (Data Breach) o exposición de PII.
- Crisis de Relaciones Públicas (PR) en redes sociales (trending negativo).

**Pasos detallados:**
1. **Detección y Triage:** Hermes o herramientas de monitoreo alertan. Se clasifica la severidad (P0 Crítica, P1 Severa).
2. **War Room Setup:** Creación automática de un canal de Slack/Teams exclusivo `#crisis-activa` y videollamada puente con Founders, CTO, Lead PR y Legal.
3. **Contención Inicial (T+15 mins):** Acciones técnicas para detener el sangrado (ej. apagar servidor comprometido).
4. **Comunicación Externa (T+30 mins):** Publicación en Status Page (status.guaki.com). Preparación de mensaje holding para redes sociales (Ej. "Estamos experimentando problemas, nuestro equipo está trabajando en ello").
5. **Comunicación a Clientes Afectados:** Si hay impacto directo (ej. citas perdidas, pagos fallidos), el Agente Kronos envía notificaciones por email/WhatsApp informando la situación y los pasos a seguir de forma transparente.
6. **Resolución:** Los equipos técnicos/legales solucionan la causa raíz.
7. **Post-Mortem y Compensación:** Redacción de un documento "Post-Mortem" detallando qué falló y cómo se evitará. Si la interrupción fue severa, ofrecer créditos en la plataforma a los usuarios afectados.

**Responsable:** Crisis Management Team (Founders, CTO, Head of Comms), Hermes OS (Alertas iniciales).

**Métricas de éxito:**
- Tiempo de Detección (MTTD).
- Tiempo de Resolución (MTTR).
- Sentimiento de marca post-crisis.

**Escalación si falla:**
No aplica escalación posterior, este es el nivel máximo de respuesta.

**Templates/Mensajes asociados:**
- Holding_Statement_Breach.
- Plantilla_Post_Mortem_5_Whys.

**Tiempo máximo de ejecución:**
Depende de la crisis; contención inicial en < 30 minutos.

---

## 15. PLAYBOOK INCIDENTES

**Objetivo del playbook:**
Estandarizar la gestión de incidentes técnicos y operativos del día a día (P1 a P3), asegurando rápida resolución, comunicación clara entre equipos (Ingeniería, Producto, Soporte) y aprendizaje continuo.

**Cuándo se activa (triggers):**
- Alerta de Datadog/Sentry sobre tasas de error elevadas.
- Reporte múltiple de usuarios sobre un mismo bug a través de Soporte.
- Fallo recurrente en la ejecución de un Agente IA (ej. Argus rechaza todo).

**Pasos detallados:**
1. **Detección y Clasificación:**
   - P1: Funcionalidad core rota (pagos, login).
   - P2: Degradación de servicio (lentitud severa).
   - P3: Bug menor (error de UI sin bloqueo).
2. **Asignación (Triage):** Hermes asigna el incidente al ingeniero "On-call" (de guardia) según el microservicio afectado.
3. **Investigación:** El ingeniero de guardia analiza logs y trazas. Si no puede resolverlo en 30 minutos, escala al Lead Engineer.
4. **Comunicación Interna:** Soporte es notificado para que puedan usar "Respuestas Prediseñadas" (Macros) informando a los usuarios que se está trabajando en ello.
5. **Resolución y Deploy (Hotfix):** El ingeniero desarrolla, prueba y despliega el parche de urgencia saltando el ciclo normal (con aprobación rápida de un par).
6. **Cierre de Ticket:** Se confirma la estabilidad mediante monitoreo por 30 minutos. Soporte avisa a los usuarios que reportaron el fallo que ya está resuelto.
7. **Registro (RCA):** Para P1/P2, se realiza un Root Cause Analysis asíncrono.

**Responsable:** Ingeniero On-call, Soporte Tier 2, Hermes OS (Asignación).

**Métricas de éxito:**
- Mean Time to Acknowledge (MTTA).
- Mean Time to Resolve (MTTR).
- Tasa de reincidencia de bugs.

**Escalación si falla:**
P1 no resuelto en 2 horas escala automáticamente a CTO.

**Templates/Mensajes asociados:**
- Macro_Soporte_Incidente_Conocido.
- Template_Jira_Bug_Report.

**Tiempo máximo de ejecución:**
P1: < 4 hrs. P2: < 24 hrs. P3: Próximo sprint.

---

## 16. PLAYBOOK REPUTACIÓN

**Objetivo del playbook:**
Proteger, construir y amplificar activamente la reputación de la marca Guaki y la de sus proveedores en internet, gestionando reseñas, menciones en medios y aplicando escucha social (social listening).

**Cuándo se activa (triggers):**
- Recepción de una reseña (positiva o negativa) de Guaki en Trustpilot/Google.
- Mención de Guaki en redes sociales o prensa.
- Cuando un proveedor en la plataforma recibe una alerta de reseña < 3 estrellas.

**Pasos detallados:**
1. **Social Listening Permanente:** Agentes escanean Twitter, LinkedIn, foros y sitios de reseñas buscando la palabra "Guaki".
2. **Respuesta a Reseñas de Guaki:**
   - *5 Estrellas:* Agradecimiento automático, invitación a referir.
   - *1-3 Estrellas:* Alerta a Soporte Tier 2. Contacto directo con el usuario para resolver su problema offline, pidiendo luego amablemente actualizar la reseña.
3. **Gestión de Reseñas para Proveedores:** Guaki notifica al proveedor si recibe una mala calificación en su perfil y Atlas le sugiere 3 respuestas profesionales (empáticas y resolutivas) para mitigar el daño.
4. **Relaciones con Medios (PR Proactivo):** Mensualmente, el equipo de Marketing extrae datos interesantes de Atlas (ej. "Los servicios más demandados post-pandemia en LATAM") y los envía como comunicados de prensa a medios locales.
5. **Construcción de Autoridad:** Publicación quincenal de casos de estudio detallados mostrando el crecimiento real de los negocios en Guaki.

**Responsable:** Marketing Manager (Humano), Agente de IA (Social Listening), Atlas (Sugerencias de respuesta).

**Métricas de éxito:**
- Net Promoter Score (NPS).
- Calificación promedio en Trustpilot/Google (> 4.5).
- Sentiment Score (Positivo vs Negativo en menciones sociales).

**Escalación si falla:**
Acumulación de reseñas negativas sobre el mismo tema (>5 en una semana) escala a Producto para solucionar la raíz del problema.

**Templates/Mensajes asociados:**
- Template_Respuesta_Review_Negativa.
- Pitch_Prensa_Data_Insights.

**Tiempo máximo de ejecución:**
Respuesta a reseñas < 24 horas.

---

## 17. PLAYBOOK MODERACIÓN

**Objetivo del playbook:**
Mantener un ecosistema seguro, confiable y libre de fraude mediante la revisión rigurosa de perfiles, la detección de reseñas falsas y la resolución justa de disputas entre clientes finales y proveedores.

**Cuándo se activa (triggers):**
- Creación de un nuevo perfil de proveedor o actualización de servicios sensibles (ej. salud).
- Intento de publicación de una reseña (Review).
- Cliente levanta una "Disputa" o solicita un contracargo.

**Pasos detallados:**
1. **Verificación Inicial (KYB/KYC):** En el onboarding, Argus analiza documentos de identidad, comprobantes de domicilio y cruza datos con listas negras gubernamentales (OFAC, SAT).
2. **Moderación de Contenido (Agente Argus):** Todo texto e imagen subido (descripciones, fotos) pasa por filtros de IA para detectar contenido explícito, spam, o promesas ilegales/falsas.
3. **Detección de Reseñas Falsas:** Atlas analiza el patrón de reseñas. Si un perfil recibe 20 reseñas de 5 estrellas en 1 hora de IPs similares, las oculta (Shadowban) y alerta a un moderador humano.
4. **Resolución de Disputas:**
   - Si un cliente acusa servicio no prestado: Retención de los fondos (Escrow).
   - Solicitud de pruebas al proveedor (fotos del trabajo, mensajes de confirmación).
   - Un moderador humano (Trust & Safety) evalúa y decide el reembolso o la liberación de fondos.
5. **Penalizaciones:** Sistema de "Strikes". Al tercer strike por mal servicio o fraude comprobado, el proveedor es expulsado (Baneo definitivo) de la plataforma.

**Responsable:** Agente Argus (Filtro IA), Atlas (Detección de fraude), Equipo Trust & Safety (Humano).

**Métricas de éxito:**
- Tasa de Fraude/Contracargos (< 0.5% del TPV).
- Tiempo de resolución de disputas.
- Precisión de la moderación automática (Falsos positivos).

**Escalación si falla:**
Casos de fraude organizado o amenazas a la integridad física se escalan al equipo Legal para reporte a autoridades.

**Templates/Mensajes asociados:**
- Notificacion_Cuenta_Suspendida_Strike.
- Formulario_Aportacion_Pruebas_Disputa.

**Tiempo máximo de ejecución:**
Moderación de contenido: milisegundos. Disputas: 72 horas.

---

## 18. PLAYBOOK ESCALABILIDAD

**Objetivo del playbook:**
Preparar y ejecutar la expansión de la infraestructura tecnológica, los procesos operativos y la estructura organizacional para soportar crecimientos acelerados (2x, 5x, 10x) sin degradación del servicio ni rotura de cultura.

**Cuándo se activa (triggers):**
- Utilización de servidores sostenida > 70%.
- Crecimiento proyectado de Headcount (personal) > 20% en el próximo trimestre.
- Eventos de tráfico masivo programados (Ej. HotSale, Black Friday).

**Pasos detallados:**
1. **Escalabilidad Técnica (Infraestructura):**
   - Configuración de Auto-scaling groups en AWS/GCP para los microservicios.
   - Ejecución de pruebas de carga (Load Testing) mensuales simulando picos de 10x el tráfico actual.
   - Particionamiento (Sharding) preventivo de bases de datos antes de alcanzar límites de I/O.
2. **Escalabilidad de Procesos:**
   - Auditoría de cuellos de botella manuales cada Quarter (Trimestre). Si un proceso humano toma > 10% del tiempo de un equipo, se programa la automatización con un Agente.
3. **Escalabilidad Organizacional (Contratación):**
   - Mantenimiento de un "Pipeline" continuo (Evergreen) para roles clave (Ingenieros, Sales).
   - Onboarding automatizado de empleados (30-60-90 days plan) para asegurar rápida adaptación cultural y técnica.
4. **Gestión de Capacidad de IA:** Asegurar cuotas y límites de API (OpenAI, Anthropic, Pinecone) con proveedores externos para evitar bloqueos por volumen (Rate Limits). Negociación de instancias dedicadas (Provisioned Throughput).

**Responsable:** CTO/VPEngineering (Infraestructura), Head of People (Cultura), COO (Procesos).

**Métricas de éxito:**
- Tiempo de respuesta de la app en percentil 99 (p99 latency) bajo carga.
- Tiempo para llenar una vacante (Time to Fill).
- Cero downtime durante picos de tráfico esperados.

**Escalación si falla:**
Si las pruebas de carga fallan sistemáticamente, se congela el desarrollo de nuevos "features" (Code Freeze) hasta resolver la deuda técnica de escalabilidad.

**Templates/Mensajes asociados:**
- Plan_Load_Testing_Q3.
- Template_30_60_90_Employee_Onboarding.

**Tiempo máximo de ejecución:**
Planificación Trimestral (OKRs); Pruebas mensuales.

---

## 19. PLAYBOOK INTERNACIONALIZACIÓN

**Objetivo del playbook:**
Ejecutar la apertura de Guaki en un nuevo país o mercado importante, abarcando desde la investigación inicial hasta la obtención de los primeros 100 proveedores activos (Liquidez inicial del marketplace).

**Cuándo se activa (triggers):**
- Decisión estratégica del Board de directores para expandirse a un nuevo país (ej. México a Colombia).
- Financiamiento asegurado para la expansión.

**Pasos detallados:**
1. **Fase 1: Market Research y Legal (Mes 1):**
   - Atlas analiza volumen de búsquedas y competidores en el país objetivo.
   - Constitución legal de la filial, registro de marca y adaptación a leyes de privacidad locales (ej. LGPD en Brasil).
2. **Fase 2: Setup Financiero y Localización (Mes 2):**
   - Integración de pasarelas de pago locales (ej. Pix, PSE).
   - Localización de producto: adaptación de moneda, formatos de teléfono, modismos en copys (ej. "Coche" vs "Carro").
   - Fine-tuning de los Agentes de IA para comprender el dialecto local.
3. **Fase 3: Siembra de Oferta - B2B (Mes 3):**
   - Despliegue del "Playbook Comercial" agresivo enfocado en captar los primeros 100 proveedores "Seed".
   - Ofrecimiento de incentivos fuertes (ej. Guaki gratis por 6 meses) a los "Early Adopters" clave.
4. **Fase 4: Lanzamiento de Demanda - SEO/SEM (Mes 4):**
   - Encendido de la "SEO Factory" para indexar páginas masivamente en la nueva geografía.
   - Activación del "Playbook SEM" para generar los primeros leads B2C hacia los proveedores Seed.
5. **Fase 5: Contratación Local (Mes 5):**
   - Contratación de un Country Manager y un pequeño equipo local (Ventas y Soporte) para manejar cultura y alianzas estratégicas in-situ.

**Responsable:** Expansion Squad (Founders, Expansion Manager, Product Lead localization).

**Métricas de éxito:**
- Time to Market (Meses hasta lanzar).
- Liquidez Inicial (Alcanzar 100 proveedores activos y con transacciones).
- Costo de Apertura de País vs. Presupuesto.

**Escalación si falla:**
Retrasos > 4 semanas en Setup Financiero paralizan el lanzamiento B2C. Requiere escalación a nivel Founders para presionar a proveedores de pagos o pivotar estrategia.

**Templates/Mensajes asociados:**
- Checklist_Apertura_Pais.
- Early_Adopter_Pitch_Deck_Localized.

**Tiempo máximo de ejecución:**
3-5 meses desde la decisión hasta el primer lead transaccionado.

---
*Documento generado y mantenido por Hermes OS - Guaki Business Growth Platform.*
