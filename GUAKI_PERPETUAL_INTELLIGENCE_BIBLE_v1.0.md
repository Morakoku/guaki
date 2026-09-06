# 🛰️ GUAKI — PERPETUAL MARKET INTELLIGENCE & OSINT SYSTEM BIBLE v1.0
> **SISTEMA DE INVESTIGACIÓN PERMANENTE, ESPECTRO COMPLETO Y MONITOREO AMBIENTAL VIVO**
> **GUAKI NO INVESTIGA UNA VEZ: INVESTIGA SIEMPRE, EN TIEMPO REAL, ALIMENTANDO EL GRAFO COGNITIVO DE ATLAS Y LA ORQUESTACIÓN DE HERMES**

---

## 🏛️ PARTE I — FILOSOFÍA DEL SISTEMA VIVO DE INTELIGENCIA

El conocimiento estático caduca en cuestión de días. Guaki opera un **Sistema de Inteligencia Permanente (Perpetual OSINT Engine)** que monitorea continuamente el entorno digital, económico, legal y tecnológico de Latinoamérica y el mundo.

Este sistema no se activa por demanda: corre de forma ininterrumpida como un conjunto de demonios de extracción y análisis autónomos gestionados por el `Research Agent (Mapache/Ardilla Engine)`, canalizados hacia `Atlas AI Core` para su síntesis cognitiva, ordenados por `Hermes OS` según prioridad de ejecución y explotados por `AI Studio Enterprise` para crear nuevos activos comerciales.

---

## 🔄 PARTE II — LA ARQUITECTURA DE INFORMACIÓN DEL SISTEMA VIVO

```mermaid
flowchart TD
    subgraph CAPTURA PERPETUA (14 FUENTES)
        Google[Google SERPs & Trends]
        Social[TikTok, Instagram, LinkedIn, Reddit, YouTube]
        News[Noticias & Medios Sectoriales]
        Gov[Boletines Oficiales & Leyes]
        Tech[Nuevos Modelos IA & GitHub]
        Market[Precios Competencia & Scrapers]
    end

    subgraph PROCESAMIENTO & FILTRADO
        Mapache[Research Agent - Scrapers & Collectors] --> |Raw OSINT Data| DataLake[(Bronze Data Lake)]
        DataLake --> |Ardilla Enricher & NLP| Clean[(Silver Data Layer)]
    end

    subgraph SÍNTESIS & ACCIÓN COGNITIVA
        Clean --> Atlas[Atlas AI Core - Brain]
        Atlas --> |Grafo de Conocimiento| Hermes[Hermes OS - Priorizador & COO]
        Hermes --> |Oportunidades de Negocio| AIS[AI Studio Enterprise & Product]
    end
```

---

## 📡 PARTE III — MATRIZ MAESTRA DE LAS 14 FUENTES DE MONITORIZACIÓN PERPETUA

---

### 01. GOOGLE (SERPs, Google Trends & AI Overviews)
- **Frecuencia:** Diaria.
- **Qué se captura:** Cambios de algoritmo en SERP, fluctuaciones de posiciones de keywords core, nuevos competidores rankeando, cambios en estructuras de AI Overviews.
- **Mecanismo:** Scrapeo de SERPs vía Apify/Google Search API + Google Trends RSS Feeds.
- **Filtro de Relevancia:** Keywords con caída > 2 posiciones o surgimiento de nuevas búsquedas locales con crecimiento > 50% WoW.
- **Atlas Sintetiza:** Tendencias de búsqueda emergentes por ciudad y patrones de actualización del algoritmo de Google.
- **Hermes Prioriza:** Dispara tarea a `SEO Agent` para re-compilar landings afectadas o crear nuevos clusters.

### 02. REDDIT (Comunidades & Pain Points Reales)
- **Frecuencia:** Cada 6 horas.
- **Qué se captura:** Subreddits de emprendimiento, negocios en LATAM, tecnología, freelancing y soporte (ej. r/Colombia, r/mexico, r/entrepreneur, r/SaaS).
- **Mecanismo:** Reddit API + PRAW Scraper filtrando por menciones de problemas con proveedores o herramientas SaaS.
- **Filtro de Relevancia:** Posts con > 15 comentarios discutiendo dolores no resueltos de digitalización o búsqueda de servicios.
- **Atlas Sintetiza:** Lenguaje natural del consumidor, objeciones reales y necesidades no cubiertas.
- **Hermes Prioriza:** Asigna a `Content Agent` la creación de blogs/guías que respondan directamente a esos dolores.

### 03. LINKEDIN (B2B Trends, Decisores & Competencia)
- **Frecuencia:** Cada 12 horas.
- **Qué se captura:** Contrata de ejecutivos B2B, lanzamientos de agencias de IA competidoras, publicaciones de líderes de opinión, vacantes de empleo en tecnología.
- **Mecanismo:** LinkedIn Company & Post Scraper + Sales Navigator Intelligence Engine.
- **Filtro de Relevancia:** Movimientos de competidores directos (ADAIA, AY Automate) o empresas buscando servicios de IA ($2,850+ USD).
- **Atlas Sintetiza:** Perfiles BANT de compradores corporativos y estrategias de pricing/posicionamiento B2B.
- **Hermes Prioriza:** Entrega leads calificados a `Athena / Sales Agent` para prospección fría con Business MRI.

### 04. TIKTOK & INSTAGRAM (Tendencias de Formato & Contenido Viral)
- **Frecuencia:** Cada 4 horas.
- **Qué se captura:** Audios virales, hashtags emergentes, formatos de video de alta conversión, contenido de competidores.
- **Mecanismo:** TikTok Research API / Instagram Hashtag Scraper.
- **Filtro de Relevancia:** Videos en categorías de servicios (Salud, Belleza, Remodelación) con > 100K views en < 48 horas.
- **Atlas Sintetiza:** Ganchos visuales y estructuras de guion con mayor retención de atención en LATAM.
- **Hermes Prioriza:** Dispara instrucción a `Video Agent` para replicar la estructura del gancho viral adaptada a Guaki.

### 05. YOUTUBE (Educación, Reviews & Análisis Profundo)
- **Frecuencia:** Diaria.
- **Qué se captura:** Reviews de herramientas SaaS, tutoriales de IA, webinars de competidores, podcasts de negocios.
- **Mecanismo:** YouTube Data API v3 + Transcriptor automático de canales clave.
- **Filtro de Relevancia:** Videos largos (> 10 min) con alta tasa de comentarios analizando software o servicios profesionales.
- **Atlas Sintetiza:** Brechas de conocimiento en los proveedores para alimentar el plan de estudios de la Guaki Academy.
- **Hermes Prioriza:** Dispara orden a `Education Agent` para crear micro-lecciones de WhatsApp.

### 06. FOROS Y COMUNIDADES LOCALES (Quora, Facebook Groups, WhatsApp)
- **Frecuencia:** Cada 6 horas.
- **Qué se captura:** Preguntas frecuentes en Quora, grupos de Facebook de comerciantes de ciudades target, datos de recomendación local.
- **Mecanismo:** Graph Scraper + Parsers de grupos públicos de comerciantes por municipio.
- **Filtro de Relevancia:** Menciones repetidas buscando "recomendación de [servicio] en [ciudad]".
- **Atlas Sintetiza:** Mapas de demanda local desatendida por vecindario.
- **Hermes Prioriza:** Dispara a `Research Agent` para raspar y registrar nuevos proveedores en esa zona.

### 07. NOTICIAS Y MEDIOS SECTORIALES (La República, Forbes, El Tiempo, Portafolio)
- **Frecuencia:** Cada 2 horas.
- **Qué se captura:** Indicadores macroeconómicos, inflación, regulación del comercio, inversiones en startups, aperturas comerciales.
- **Mecanismo:** RSS News Aggregator + Newspaper3k Python Parser.
- **Filtro de Relevancia:** Noticias sobre cambios tributarios, subsidios a PYMEs o tendencias del consumidor en LATAM.
- **Atlas Sintetiza:** Impacto macroeconómico en la capacidad de pago de los proveedores por sector.
- **Hermes Prioriza:** Genera alertas de contexto para `Finance Agent` y `Legal Agent`.

### 08. BOLETINES GUBERNAMENTALES & LEYES (DIAN, SAT, Ministerios, RUES)
- **Frecuencia:** Diaria.
- **Qué se captura:** Cambios en normativas de facturación electrónica, regulaciones de protección de datos (Habeas Data), estatutos del consumidor.
- **Mecanismo:** Web Archiver & Diff Checker en portales legislativos y tributarios oficiales.
- **Filtro de Relevancia:** Proyectos de ley o decretos aprobados que afecten el comercio electrónico o la IA.
- **Atlas Sintetiza:** Riesgos normativos y requerimientos de compliance legal por país.
- **Hermes Prioriza:** Dispara tarea a `Legal Agent` para actualizar los términos de servicio y contratos.

### 09. MONITOREO DE COMPETENCIA DIRECTA (Scrapeo de Sitios & Precios)
- **Frecuencia:** Diaria.
- **Qué se captura:** Cambios en landings de competidores, variaciones de precios, nuevos servicios lanzados, testimonios agregados.
- **Mecanismo:** Visual Web Diff Scraper (Playwright) + Extraction de precios via LLM parser.
- **Filtro de Relevancia:** Modificaciones en modelos de precios o nuevos programas lanzados por la competencia.
- **Atlas Sintetiza:** Análisis de movimiento estratégico de la competencia y matriz de características (Feature Matrix).
- **Hermes Prioriza:** Notifica en el Dashboard Ejecutivo e instruye a `SEM Agent` a ajustar pujas defensivas.

### 10. NUEVOS MODELOS DE IA & GITHUB (ArXiv, GitHub Trending, HuggingFace)
- **Frecuencia:** Diaria.
- **Qué se captura:** Lanzamientos de nuevos modelos LLM (OpenAI, Anthropic, Google, Meta), librerías open-source de agentes, reducciones de costos de API.
- **Mecanismo:** GitHub API + ArXiv AI Paper Summarizer + HuggingFace Trend Tracker.
- **Filtro de Relevancia:** Nuevos modelos con > 30% menor costo por token o librerías de agentes con > 1,000 estrellas en una semana.
- **Atlas Sintetiza:** Oportunidades de optimización de infraestructura de IA y reducción de costos operativos.
- **Hermes Prioriza:** Ordena a `DevOps Agent` realizar benchmarks en sandbox para evaluar migración de modelos.

### 11. MERCADO Y NUEVAS CATEGORÍAS EN LATAM
- **Frecuencia:** Semanal.
- **Qué se captura:** Servicios emergentes en ciudades (ej. instalación de paneles solares, mantenimiento de scooters, consultoría en IA local).
- **Mecanismo:** Clusterizador semántico de búsquedas sin resultados (`search.zero_results`) en Guaki.
- **Filtro de Relevancia:** Más de 50 búsquedas sin oferta disponible en una ciudad durante 30 días.
- **Atlas Sintetiza:** Vacíos de oferta comercial de alto potencial.
- **Hermes Prioriza:** Dispara campaña de captación masiva a `Research Agent` para reclutar proveedores de esa nueva categoría.

### 12. DEMANDA EN TIEMPO REAL (Analítica Interna de Guaki)
- **Frecuencia:** Tiempo real (Stream).
- **Qué se captura:** Comportamiento del usuario en la plataforma: clics, tiempo de permanencia, abandono de búsquedas, horas pico.
- **Mecanismo:** Kafka Stream Analytics + ClickHouse Materialized Views.
- **Filtro de Relevancia:** Anomalías en tasas de conversión (> 20% de desviación sobre el promedio histórico).
- **Atlas Sintetiza:** Intención situacional inmediata del consumidor final.
- **Hermes Prioriza:** Re-ordena las colas de procesamiento de servidores para priorizar las categorías de alta demanda.

### 13. OFERTA Y CAPACIDAD OPERATIVA DE PROVEEDORES
- **Frecuencia:** Tiempo real (Stream).
- **Qué se captura:** Disponibilidad de agendamiento, velocidad de respuesta en WhatsApp, tasa de cancelación de citas de los proveedores.
- **Mecanismo:** Event Tracker de Brenda App / WhatsApp API logs.
- **Filtro de Relevancia:** Proveedores que no responden > 3 mensajes seguidos o cancelan > 10% de las citas.
- **Atlas Sintetiza:** Calidad operativa real de la oferta por ciudad.
- **Hermes Prioriza:** Dispara orden a `Ranking Agent` para degradar temporalmente el Guaki Score del proveedor.

### 14. ECONOMÍA Y CAPACIDAD DE PAGO EN CIUDADES TARGET
- **Frecuencia:** Mensual.
- **Qué se captura:** Salario mínimo por país, índices de desempleo regional, volumen de remesas, costo de vida por municipio.
- **Mecanismo:** API de Bancos Centrales (Banco de la República, BANXICO, etc.) + Fuentes de datos abiertos.
- **Filtro de Relevancia:** Variaciones en el poder adquisitivo que afecten la fijación de precios de los planes SaaS.
- **Atlas Sintetiza:** Modelos de elasticidad de precios por nivel socioeconómico de la ciudad.
- **Hermes Prioriza:** Recomienda ajustes en las tarifas de los planes `Guaki Start/Growth` en regiones afectadas.

---

## 📊 PARTE IV — CICLO OPERATIVO DEL SISTEMA VIVO DE INTELIGENCIA

```
[MONITOREO PERPETUO 14 FUENTES]
         │
         ▼
[MAPACHE SCRAPER / ARDILLA ENRICHER]
         │ (Extrae, limpia y cataloga)
         ▼
[BRONZE & SILVER DATA LAKE]
         │ (Almacenamiento estructurado)
         ▼
[ATLAS COGNITIVE SYNTHESIS]
         │ (Sintetiza tendencias, detecta anomalías y actualiza el Grafo)
         ▼
[HERMES OS PRIORITIZATION]
         │ (Transforma el hallazgo en una tarea ejecutable con prioridad P0-P3)
         ▼
[EJÉRCITO DE AGENTES / AI STUDIO ENTERPRISE]
         │ (Ejecuta la mejora, crea el contenido, ajusta la campaña o cierra la venta)
         ▼
[NUEVO ESTADO DEL ECOSISTEMA]
```

---

> **PERPETUAL MARKET INTELLIGENCE & OSINT SYSTEM BIBLE v1.0 — SISTEMA VIVO DE INVESTIGACIÓN Y MONITOREO CONTINUO DOCUMENTADO Y APROBADO.**
