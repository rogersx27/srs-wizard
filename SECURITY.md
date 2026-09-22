# Política de seguridad

## Versiones soportadas

Este proyecto no mantiene ramas de versiones anteriores: solo se dan parches de seguridad sobre la última versión publicada en `main`.

| Versión | Soportada |
|---|---|
| última (`main`) | :white_check_mark: |
| anteriores | :x: |

## Reportar una vulnerabilidad

**No abras un issue público para vulnerabilidades de seguridad.**

Usa el reporte privado de GitHub: pestaña [Security → Report a vulnerability](../../security/advisories/new) de este repositorio. Esto crea una conversación privada visible solo para los mantenedores hasta que el problema se resuelva.

Incluye, si es posible:

- Una descripción del problema y su impacto (ej. exposición de datos de un proyecto, bypass de autenticación del dashboard).
- Pasos para reproducirlo.
- Versión o commit afectado.

Intentaremos confirmar la recepción en un plazo razonable y coordinar la divulgación una vez que exista un fix.

## Alcance

Este proyecto maneja datos sensibles de configuración (`DASHBOARD_PASSWORD`, `DASHBOARD_SESSION_SECRET`) y respuestas de clientes vía URLs de wizard (`/s/[slug]`). Son de especial interés reportes sobre:

- Bypass de la autenticación del dashboard (`proxy.ts`).
- Acceso a proyectos o respuestas de un cliente distinto al del slug/sesión correspondiente.
- Fugas de secretos de entorno o de la base de datos SQLite.
