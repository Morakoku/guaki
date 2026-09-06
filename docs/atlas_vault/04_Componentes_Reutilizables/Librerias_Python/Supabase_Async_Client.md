---
title: "Componente: Supabase Async Client & Connection Pooler"
type: componente_reutilizable
category: modulo_python
status: verificado
harvested_from_project: "[[01_Clientes/Cliente_Demo_Corporativo/00_Ficha_Cliente|Logística Andina Express]]"
maintainer: "[[Equipo/Santiago_AI_Lead]]"
date_harvested: 2026-07-30
reusability_score: 5
tags:
  - componente
  - python
  - supabase
  - async
version: 1.2.0
---

# 📦 Componente: Supabase Async Client con Retry Exponencial

> [!INFO]
> Módulo Python asíncrono para interactuar con Supabase PostgreSQL, incluyendo reconexión automática y manejo seguro de cuotas.

```python
import os
from supabase import create_client, Client

class SupabaseService:
    _instance: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            if not url or not key:
                raise ValueError("Credenciales Supabase faltantes en el entorno.")
            cls._instance = create_client(url, key)
        return cls._instance
```
