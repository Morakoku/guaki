# 🥑 GUAKI — REPORTE DE REVISIÓN VISUAL LOCAL MOBILE UI/UX
**Fecha:** 2026-08-23 | **Ambiente:** LOCAL EXCLUSIVO (`http://127.0.0.1:3000`)  
**Estado:** `LOCAL_VISUAL_QA_PASS / DEPLOY_NOT_AUTHORIZED`

---

## 1. RESUMEN EJECUTIVO Y POLÍTICA DE DESPLIEGUE

* **Deploy a Producción:** **NO EJECUTADO** *(Bloqueado por protocolo hasta autorización explícita del fundador)*.
* **Mapache CRM / Ecosistema La Trinidad:** **INTACTO Y PROTEGIDO** *(Ningún proceso, puerto ni contenedor fue interrumpido o modificado)*.
* **Servidor Local Activo:** Node.js Next.js Production Server en `http://127.0.0.1:3000`.

---

## 2. AUDITORÍA DE INFRAESTRUCTURA Y PUERTOS

| Servicio / Proceso | Puerto | Estado | Acción Realizada |
| :--- | :--- | :--- | :--- |
| **GUAKI Web** | `3000` | 🟢 **ACTIVO (PID 17016)** | Reutilizado e iniciado en segundo plano sin interrumpir servicios |
| **Mapache Backend** | `8000` | ⚪ **PROTEGIDO** | No tocado, no afectado por scripts |
| **Supabase Local** | `54321` | ⚪ **INACTIVO (Local Stack)** | No requerido para navegación visual; fallback resiliente activo |

---

## 3. INVESTIGACIÓN Y RESOLUCIÓN DEL `NetworkError`

### Diagnóstico Técnico
1. **Causa A (API `/api/businesses`):** Cuando `.env.local` tiene configurado el stack de Supabase local (`http://127.0.0.1:54321`) y este se encuentra apagado, la ruta `/api/businesses?status=published` antes fallaba con 500 al no capturar el error de conexión.  
   **Solución implementada:** Se integró un `try/catch` con fallback automático a `BusinessStore.getByStatus('published')`. Ahora responde **`200 OK`** de forma inmediata y resiliente.
2. **Causa B (Auth / Login Client-Side):** El formulario de autenticación de Supabase en cliente intenta conectar a `http://127.0.0.1:54321`. En local sin Docker, el navegador reporta `NetworkError`. En producción en Vercel, esto conecta directamente con Supabase Cloud oficial.

---

## 4. MATRIZ DE VERIFICACIÓN VISUAL MOBILE

**Dispositivos y Viewports Evaluados:**
* `360 × 800` (Galaxy S8+ / Android estándar)
* `375 × 812` (iPhone X / 11 Pro / 12 mini)
* `390 × 844` (iPhone 12 / 13 / 14)
* `414 × 896` (iPhone XR / 11 / Plus)

---

### Componente por Componente

| Módulo | Elemento Evaluado | Resultado Visual | Estado |
| :--- | :--- | :--- | :--- |
| **1. Header Superior** | Logo 🥑 GUAKI a la izquierda, botón `+ Mi Negocio` a la derecha en 1 sola fila sin quiebres de línea ni textos encimados. Enlaces de texto ocultos en móvil (provistos por `SoftBottomNav`). | Limpio, balanceado, cero desbordamiento horizontal. | `PASS` |
| **2. Barra de Búsqueda** | Eliminación de la sombra/halo oscuro accidental en `:focus` y `:focus-visible`. Borde esmeralda suave (`1.5px solid #17382D`) con sombra ambiental difusa. | Sin halos rotos, sin marcos azules nativos. Focus deliberado y elegante. | `PASS` |
| **3. Botón de Audio** | Microinteracción completa: `INACTIVO → PRESIONAR → ESCUCHANDO → FINALIZAR`. Ondas suaves animadas (`guaki-audio-wave`), pulso respiratorio (`guaki-listening-pulse`) y banner *"Escuchando tu voz..."*. | Transición intuitiva y minimalista sin estética gaming ni saturación. | `PASS` |
| **4. Mi Negocio / Login** | Centrado vertical/horizontal perfecto. Ancho controlado (`maxWidth: 420px`), inputs de ancho uniforme (100%), etiquetas alineadas y selector de pestañas *Iniciar Sesión* / *Crear Cuenta*. | Formulario cohesivo, tipografía alineada, cero scroll horizontal en 360px. | `PASS` |
| **5. Directorio — Selector** | Selector `Tarjeta / Lista / Mapa` centrado horizontalmente en móvil (`margin: 0 auto`), distribución balanceada, indicadores visuales de pestaña activa de alto contraste. | Perfectamente centrado en móvil sin desalineación ni overflow. | `PASS` |
| **6. Dock Inferior** | `SoftBottomNav` con Inicio, Directorio, Botón Central de Voz flotante, Nosotros y Mi Negocio. | Ergonomía táctil completa con safe-area inferior. | `PASS` |

---

## 5. GATE TÉCNICO Y PRUEBAS AUTOMATIZADAS

```text
TypeScript Check:  tsc --noEmit              → PASS (0 errores)
Unit Tests Suite:  node --test tests/*.test  → PASS (119/119 tests pass)
ESLint Audit:      next lint                 → PASS (0 errores)
Production Build:  next build                → PASS (23 páginas compiladas)
Endpoints Ping:    6/6 URLs locales          → PASS (200 OK)
```

---

## 6. URLs LOCALES LISTAS PARA REVISIÓN DEL FUNDADOR

* 📱 **Página Principal (Buscador & Audio):** [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
* 🧭 **Directorio (Vistas Tarjeta / Lista / Mapa centradas):** [http://127.0.0.1:3000/directorio](http://127.0.0.1:3000/directorio)
* 🔐 **Mi Negocio (Login & Registro Mobile centrado):** [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login)
* 🥑 **Nosotros:** [http://127.0.0.1:3000/nosotros](http://127.0.0.1:3000/nosotros)

---

## 7. VEREDICTO FINAL

`LOCAL_VISUAL_QA_PASS / DEPLOY_NOT_AUTHORIZED`
