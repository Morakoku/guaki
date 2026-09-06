# GUAKI — LÍNEA BASE DE ANALÍTICA Y MEDICIÓN (P9 ANALYTICS BASELINE)

**Fecha:** 2026-08-23  
**Fase:** P9 Founder Launch  
**Objetivo:** Auditar la capacidad actual del sistema para medir cada etapa del embudo y documentar lo implementado vs lo pendiente.

---

## 1. Matriz de Capacidad de Medición

| Área de Medición | Métrica Específica | Estado Actual | Mecanismo Técnico | Acción Requerida |
|---|---|---|---|---|
| **Adquisición (B2B)** | Prospectos identificados | `PARCIAL` | Tabla de prospección manual documentada en el reporte P9. | Mantener registro estructurado en el CRM de fundador. |
| | Contactos iniciados | `PARCIAL` | Registro manual de conversaciones de WhatsApp enviadas. | Registrar fecha, canal y respuesta. |
| | Tasa de respuesta / interés | `PARCIAL` | Registro de objeciones y aceptaciones por prospecto. | Clasificar en las 4 categorías estándar de objeción. |
| **Producto (Plataforma)** | Fichas creadas (Drafts) | `IMPLEMENTADO` | Supabase `businesses` (con `status = 'draft'`). | Disponible vía API `/api/businesses`. |
| | Fichas en auditoría | `IMPLEMENTADO` | Supabase `businesses` (con `status = 'in_audit'`). | Visible en `/admin/dashboard`. |
| | Fichas publicadas | `IMPLEMENTADO` | Supabase `businesses` (con `status = 'published'`). | Indexadas automáticamente en sitemap. |
| **Conversión (B2C)** | Búsquedas realizadas | `IMPLEMENTADO` | Tabla `events` (`event_name = 'search_query'`). | Persiste término y ciudad detectada. |
| | Fichas visualizadas | `PARCIAL` | Server-rendering en `/proveedores/[slug]`. | Añadir registro de vista en `events` (`event_name = 'provider_view'`). |
| | Clics a WhatsApp | `PARCIAL` | Enlace directo `wa.me/57...`. | Añadir micro-ping asíncrono no bloqueante antes del redireccionamiento. |
| | Clics a Llamada / GPS | `PARCIAL` | Enlaces nativos `tel:` y Google Maps. | Registrar evento de intención en tabla `events`. |
| **Actividad Proveedor** | Sesiones activas | `IMPLEMENTADO` | Supabase Auth logs y cookies de sesión httpOnly. | Verificable en Supabase Dashboard. |
| | Ediciones de afiche | `IMPLEMENTADO` | `businesses.updated_at` y endpoints `PATCH /api/businesses/[id]`. | Trazabilidad por timestamp. |

---

## 2. Definición de Métricas Clave del Experimento (KPIs)

```
1. Acquisition Rate (Tasa de Interés B2B):
   = Proveedores Interesados / Negocios Contactados
   Meta: >= 50%

2. Onboarding Rate (Tasa de Creación de Ficha):
   = Fichas Creadas / Proveedores Interesados
   Meta: >= 80%

3. Publication Rate (Tasa de Publicación):
   = Fichas Publicadas / Fichas Creadas
   Meta: 100%

4. Activation Rate (Tasa de Activación con Visitas):
   = Fichas con al menos 1 visita en 7 días / Fichas Publicadas
   Meta: >= 90%

5. Contact Conversion Rate (Tasa de Clic a WhatsApp):
   = Clics a WhatsApp / Visitas a la Ficha
   Meta: >= 10%
```

---

## 3. Estado de Datos Inicial

> **Declaración de Honestidad:**  
> Actualmente no existen métricas inventadas. Todas las métricas inician en **`NO DATA / BASELINE CERO`** hasta que el fundador inicie el contacto con los primeros prospectos reales.
