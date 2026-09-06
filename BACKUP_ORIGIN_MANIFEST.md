# BACKUP / ORIGIN MANIFEST — Guaki

**Fecha de captura:** 2026-08-12  
**Candidato:** `GUA-OC` — candidato técnico provisional  
**Estado:** `PROVISIONAL / NOT_CANONICAL`

## Procedencia

- **Origen leído:** `D:\Proyectos IA\AI_STUDIO_RECOVERY\04_PROJECTS\AI_STUDIO_ECOSYSTEM\02_GUAKI_MARKETPLACE`
- **Destino de trabajo:** `D:\Proyectos IA\AI_STUDIO\GUAKI`
- **Fuente:** copia recuperada atribuida a OpenCode; no se demostró Git local en la copia.
- **Commit local:** `UNKNOWN / NOT_FOUND`.
- **Propietario operativo/legal:** `UNKNOWN`.
- **Relación con deployment:** `UNKNOWN`; `vercel.json` es solo indicio de configuración.

## Integridad de la copia

Hash lógico de árbol SHA-256, calculado sobre rutas, tamaño y SHA-256 de archivos de código/manifiestos, excluyendo artefactos generados y secretos locales:

```text
SOURCE:  be04dcaff1423c917e9de24e34d6e91503fc60fec994354a074ecd63a6aa20a1  (captura inicial; 71 archivos)
LOGICAL: a55db36ab53aeb43e3b85d7984404f6d8303e493f63e8cb4a43da7c76d583d1c  (70 archivos)
TARGET:  a55db36ab53aeb43e3b85d7984404f6d8303e493f63e8cb4a43da7c76d583d1c  (70 archivos)
MATCH:   PASS
```

Hashes de archivos de referencia:

| Archivo | SHA-256 |
|---|---|
| `package.json` | `2cee735699c2dc13d7f2539bed8b9659aa51dc08323c0959344f7f6c9914a707` |
| `package-lock.json` | `2fa610fe82691843bfb5669fc8c2378e23ebbba8bd71f7b8635737dd051691e6` |
| `.env.example` | `3151262d7ab9c8467ead82effbdcd3d9fe30347e95438cd2e88117cc47ae3388` |

## Exclusiones y cambios de evaluación

- No se copiaron `.env` reales ni archivos locales de secretos.
- No se copiaron desde Recovery `node_modules`, `.next` ni `.vercel`; `node_modules` se instaló después en el destino usando `npm ci --offline`.
- `type-check`/`build` generaron artefactos locales en el destino; esos artefactos no forman parte del hash lógico.
- No se modificó la bóveda; en esta fase solo se leyeron rutas y hashes.

## Límites

Este manifest demuestra procedencia y equivalencia de la copia de trabajo, no canonicidad, autenticación efectiva, tenant isolation, datos reales ni deployment.
