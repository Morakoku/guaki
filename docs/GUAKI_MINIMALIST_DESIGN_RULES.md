# 🌿 REGLA SUPREMA DE DISEÑO GUAKI (HERMES ORCHESTRATION STANDARD)

Este estándar es de obligatorio cumplimiento para todas las creaciones, interfaces y modificaciones dentro del ecosistema **GUAKI**:

---

## 1. 📐 Centrado y Simetría Universal (0% Elementos Desalineados a la Izquierda)
- **Centrado Universal:** Todo contenedor principal debe tener `margin-left: auto !important; margin-right: auto !important;` y un `max-width` óptimo de lectura (860px para fichas de detalle, 1120px para feeds/grids y 1200px para directorio).
- **Tipografía y Bloques Hero:** Los títulos principales, subtítulos y barras de búsqueda deben estar perfectamente centrados en la pantalla.
- **Grids Responsivos:** Los afiches y tarjetas deben auto-ajustarse de manera simétrica con `justify-content: center` o `grid-template-columns: repeat(auto-fill, minmax(310px, 1fr))`.

---

## 2. 🪄 Divulgación Progresiva & Minimalismo Radical (Progressive Disclosure)
- **Principio:** *"Si se puede enseñar con lo mínimo estilizado, se enseña con lo mínimo y se despliega al tocar"*.
- **Ejemplo Maestro - Horarios de Atención:**
  - *Estado por defecto:* 1 sola línea horizontal limpia: `🟢 Abierto Hoy: 8:00 AM – 7:00 PM · [Ver semana completa ▼]`.
  - *Al hacer clic:* Se despliega el acordeón suave con los días de la semana y el tag `HOY`.
- **Ejemplo Maestro - Opiniones de Clientes:**
  - *Estado por defecto:* Botón elegante `⭐ 4.9 (12 opiniones) ▼` alineado junto a `⚡ Responde en 1 minuto`.
  - *Al hacer clic:* Se expanden suavemente las reseñas y el formulario de opinión.
- **Ejemplo Maestro - Garantía de Comercio:**
  - *Estado por defecto:* Badge interactivo `✓ Verificado por Guaki`.
  - *Al hacer clic:* Se abre un modal popup con los detalles de RUT y sede física, más una tarjeta discreta al final de la página.

---

## 3. 💬 Enfoque 100% en la Conversión Directa
- Cero distracciones, cero bloques de cotización invasivos y cero publicidad de terceros.
- El botón primario de WhatsApp 1-clic con micro-vibración háptica (`navigator.vibrate(10)`) es siempre el rey de la pantalla.
