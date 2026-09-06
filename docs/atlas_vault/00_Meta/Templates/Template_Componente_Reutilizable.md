---
title: "Componente: {{component_name}}"
type: componente_reutilizable
category: "{{category}}" # [modulo_python | componente_nextjs | prompt_golden | webhook_n8n | sql_migration]
status: verificado # [candidato | verificado | deprecado]
harvested_from_project: "[[01_Clientes/{{origin_client_name}}/00_Ficha_Cliente|{{origin_client_name}}]]"
maintainer: "[[Equipo/{{maintainer_name}}]]"
date_harvested: {{date:YYYY-MM-DD}}
reusability_score: 5 # 1 a 5 estrellas
tags:
  - componente
  - modular
  - acelerador
  - libreria
version: 1.0.0
---

# 📦 Componente Reutilizable: {{component_name}}

> [!TIP]
> **Ahorro Estimado de Ingeniería:** `{{hours_saved_per_project}} horas por proyecto`.  
> **Dependencias:** `{{dependencies}}`

---

## 🎯 Propósito y Casos de Uso
{{description_of_the_component_and_problems_it_solves}}

---

## 💻 Código Fuente / Especificación

```{{language}}
{{component_code_snippet}}
```

---

## 🧪 Instrucciones de Integración Rápida
1. Copiar el archivo o módulo a la ruta del nuevo proyecto.
2. Inyectar variables de entorno requeridas:
   ```env
   {{env_vars_example}}
   ```
3. Importar y consumir:
   ```{{language}}
   {{import_example}}
   ```
