---
title: "Playbook: {{playbook_title}}"
type: playbook_operativo
status: activo # [borrador | revision | activo | obsoleto]
domain: "{{domain}}" # [backend | frontend | ia_prompts | inbound_ventas | devops | qa]
origin_project: "[[01_Clientes/{{origin_client_name}}/00_Ficha_Cliente|{{origin_client_name}}]]"
author: "[[Equipo/{{author_name}}]]"
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
estimated_execution_time_minutes: 30
difficulty_level: intermedio # [basico | intermedio | avanzado]
tags:
  - playbook
  - sop
  - veyra/ingenieria
  - estandarizacion
version: 1.0.0
---

# 📖 Playbook Operativo: {{playbook_title}}

> [!NOTE]
> **Propósito:** Procedimiento estandarizado y determinista (0% Cartón) para ejecutar {{playbook_title}} en proyectos de clientes o infraestructura interna de Veyra.

---

## 🎯 Requisitos Previos y Entorno

- [ ] Acceso de administrador a Supabase y GCP / Vercel.
- [ ] Variables de entorno configuradas: `{{required_env_vars}}`.
- [ ] Dependencias instaladas: `{{required_packages}}`.

---

## 🛠️ Procedimiento de Ejecución Paso a Paso

### Paso 1: Inicialización & Scaffolding
```bash
# Comando de inicialización
{{step_1_command}}
```
*Explicación:* {{step_1_explanation}}

### Paso 2: Configuración de Lógica & Conectores
```python
# Snippet de integración de referencia
{{step_2_code_snippet}}
```
*Puntos Críticos de Validación:*
- Asegurarse de validar esquemas con Pydantic.
- Comprobar que los timeouts de conexión sean `< 5000ms`.

### Paso 3: Pruebas de Humo & Verificación
1. Ejecutar prueba unitaria local:
   ```bash
   {{step_3_test_command}}
   ```
2. Validar respuesta HTTP esperada: `200 OK` con payload JSON estructurado.

---

## 🚨 Manejo de Excepciones & Errores Comunes

| Error / Fallo | Causa Probable | Solución Inmediata |
| :--- | :--- | :--- |
| `{{error_code_1}}` | {{error_cause_1}} | {{error_solution_1}} |
| `{{error_code_2}}` | {{error_cause_2}} | {{error_solution_2}} |

---

## 🔄 Historial de Versiones y Mejoras (Post-Mortem Feed)

| Versión | Fecha | Proyecto Origen | Cambio Implementado | Autor |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | {{date:YYYY-MM-DD}} | `{{origin_client_name}}` | Creación inicial cosechada de Post-Mortem | `{{author_name}}` |
