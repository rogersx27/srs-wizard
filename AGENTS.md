<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del repositorio (SRS Wizard)

Estas reglas aplican a cualquier persona o agente que contribuya a este repositorio. `CONTRIBUTING.md` resume esto mismo para lectura humana en GitHub; este archivo es la fuente de verdad.

## Modelo de ramas: Gitflow

- **`main`** — código en producción. Solo recibe merges desde `release/*` o `hotfix/*`. Cada merge a `main` se etiqueta `vMAJOR.MINOR.PATCH`.
- **`develop`** — rama de integración. Todo el trabajo terminado vive aquí antes de salir en un release.
- **`feature/<slug>`** — una funcionalidad o cambio puntual. Sale de `develop`, vuelve a `develop` vía Pull Request.
- **`release/<version>`** — prepara una versión (bump de versión en `package.json`, cierre del `CHANGELOG.md`, últimos ajustes). Sale de `develop`, se mergea a `main` **y** a `develop`.
- **`hotfix/<slug>`** — corrige un bug urgente ya en producción. Sale de `main`, se mergea a `main` **y** a `develop`.

Nombres de rama en minúsculas y con guiones, con prefijo del tipo: `feature/wizard-autosave`, `hotfix/dashboard-login-cookie`, `release/0.2.0`.

Nunca se commitea directo a `main` ni a `develop`: todo entra por Pull Request.

## Commits: Conventional Commits

Formato:

```
<tipo>(<scope opcional>): <descripción corta en imperativo>

<cuerpo opcional: explica el porqué, no el qué>

<footer opcional: BREAKING CHANGE:, Refs #123>
```

Tipos permitidos:

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un bug |
| `docs` | Cambios solo de documentación |
| `style` | Formato, espacios — sin cambio de lógica |
| `refactor` | Cambio de código que no arregla un bug ni agrega una funcionalidad |
| `perf` | Mejora de rendimiento |
| `test` | Agregar o corregir tests |
| `build` | Dependencias, Docker, configuración de build |
| `ci` | GitHub Actions u otra integración continua |
| `chore` | Mantenimiento que no encaja en las anteriores |
| `revert` | Revierte un commit anterior |

Ejemplos:

```
feat(wizard): agregar autosave con debounce a las respuestas
fix(proxy): corregir verificación de cookie expirada
docs(changelog): registrar la versión 0.2.0
```

Un `!` después del tipo/scope (`feat!:`) o un footer `BREAKING CHANGE:` indica un cambio incompatible (sube el MAJOR). Los Pull Requests se validan automáticamente contra este formato (ver `.github/workflows/commitlint.yml`).

## Versionado: Semantic Versioning

`MAJOR.MINOR.PATCH`:

- **MAJOR** — cambio incompatible (ej. se elimina una ruta pública, cambia el esquema de datos sin migración de compatibilidad).
- **MINOR** — nueva funcionalidad compatible hacia atrás.
- **PATCH** — corrección de bug compatible hacia atrás.

Cada release actualiza `version` en `package.json`, cierra la sección `[Unreleased]` de `CHANGELOG.md` con la nueva versión y fecha, y se etiqueta en git como `vMAJOR.MINOR.PATCH` sobre `main`.

## Changelog

Este proyecto usa [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Todo Pull Request que agregue una funcionalidad, corrija un bug o cambie el comportamiento visible debe agregar una línea bajo `## [Unreleased]` en `CHANGELOG.md`, en la categoría correspondiente: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. PRs de solo documentación o de tooling interno (`docs`, `ci`, `chore` sin impacto visible) pueden omitirlo.

## Pull Requests

1. Rama desde `develop` (o desde `main` si es `hotfix/*`).
2. Un PR = un tema. Cambios no relacionados van en PRs separados.
3. La descripción explica el *porqué*, no solo el *qué*.
4. Antes de pedir revisión: `pnpm lint` pasa, `docker compose up --build` levanta sin errores, y probaste manualmente el flujo afectado.
5. `CHANGELOG.md` actualizado como parte del mismo PR (ver regla arriba).
6. Usa la plantilla de `.github/PULL_REQUEST_TEMPLATE.md`.

## Reglas específicas de este proyecto (contexto para agentes)

- **Prisma está fijado en la línea 6.x** (`6.19.3`). No actualizar a Prisma 7+ sin una decisión explícita: esa versión mayor cambió `datasource.url`, requiere adaptadores nativos (`@prisma/adapter-*`) y un `prisma.config.ts` — rompe este proyecto tal como está estructurado.
- **`pnpm install` corre dentro de Docker**, nunca en el host de Windows: la ruta anidada de `node_modules/.pnpm/` puede exceder el límite de 260 caracteres de Windows.
- Next.js usa **`proxy.ts`** (no `middleware.ts` — deprecado en Next 16) para proteger `/dashboard/*`.
- El catálogo de preguntas del wizard vive hardcodeado en `src/wizard-catalog/wizardCatalog.ts`, no en base de datos: es una decisión de diseño, no un descuido.
- Si editas código desde el host y no ves el cambio en `http://localhost:3000`, Turbopack puede no detectar el bind mount de Docker en Windows — correr `docker compose restart app`.
