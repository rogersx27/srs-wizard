# SRS Wizard

[![CI](https://github.com/rogersx27/srs-wizard/actions/workflows/ci.yml/badge.svg)](https://github.com/rogersx27/srs-wizard/actions/workflows/ci.yml)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)

Formulario guiado para que los clientes de un desarrollador entreguen sus requerimientos de software en formato de Especificación de Requisitos de Software (ERS), siguiendo el estándar **IEEE 830-1998**.

El desarrollador crea un proyecto por cliente y obtiene una URL única (`/s/[slug]`). El cliente responde un wizard de un paso a la vez, en lenguaje llano, con autosave y un recorrido guiado (`driver.js`). Al finalizar, el desarrollador ve en su dashboard un documento SRS compilado, trazable (IDs `RU/RS/RF/RNF-###`) y priorizado, listo para descargar en Markdown o imprimir.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Prisma 6** + SQLite
- **Tailwind CSS 4**
- **driver.js** para el tour guiado del wizard
- Arquitectura por capas: `domain` → `application` → `infrastructure` → `app` (ver estructura abajo)
- **Docker** (build multi-stage de producción) para correrlo localmente

## Cómo levantarlo (Docker)

Requiere Docker Desktop corriendo.

```bash
cp .env.example .env   # y cambia DASHBOARD_PASSWORD / DASHBOARD_SESSION_SECRET
docker compose up --build
```

Abre [http://localhost:3000](http://localhost:3000). La contraseña del dashboard es la que definiste en `DASHBOARD_PASSWORD`.

`docker compose up` corre la app en **modo producción** (`next start` sobre un build ya compilado), no en modo desarrollo: es más liviano y arranca en milisegundos, pero **no tiene hot reload**. Cada vez que cambies código, vuelve a correr `docker compose up --build` para reconstruir la imagen.

La base de datos SQLite vive en el volumen con nombre `db_data` (montado en `/data` dentro del contenedor), separada del código de la imagen — así persiste entre reconstrucciones y solo se borra si corres `docker compose down -v`.

> **Nota (Windows):** el `pnpm install` y el build de Next.js se ejecutan **dentro** del Dockerfile a propósito — hacerlo en el host puede exceder el límite de ruta de Windows (260 caracteres) por el anidamiento de `node_modules/.pnpm/`.

### Comandos útiles

```bash
docker compose logs -f app     # ver logs del servidor
docker compose up --build      # reconstruir tras un cambio de código
docker compose down            # apagar (los datos persisten en el volumen db_data)
docker compose down -v         # apagar y borrar también los datos
```

## Estructura del proyecto

```
src/
├── domain/            entidades (Project, Answer) e interfaces de repositorio
├── application/       casos de uso (crear proyecto, guardar respuesta, generar SRS...)
├── infrastructure/     Prisma, autenticación del dashboard, generador de SRS
├── wizard-catalog/     catálogo de preguntas del wizard (fuente única de verdad)
├── container/          composition root (inyección de dependencias)
├── app/                rutas de Next.js (dashboard, wizard público, API)
└── components/         componentes de React (wizard, dashboard, SRS)
```

Ver [prisma/schema.prisma](prisma/schema.prisma) para el modelo de datos.

## Variables de entorno

Ver [.env.example](.env.example):

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite dentro del contenedor (`file:/data/app.db`, en el volumen persistente) |
| `DASHBOARD_PASSWORD` | Contraseña compartida para entrar al dashboard |
| `DASHBOARD_SESSION_SECRET` | Clave para firmar la cookie de sesión (HMAC) |
| `AI_PROVIDER` | Opcional. `"gemini"`, `"anthropic"`, `"openai"` o `"gateway"` — decide qué proveedor usar cuando hay más de una clave configurada. Sin definir, se prefiere Gemini, luego Anthropic, luego OpenAI, luego Vercel AI Gateway, según cuál tenga clave |
| `GEMINI_API_KEY` | Opcional. Habilita la redacción asistida por IA (Gemini, capa gratuita) de la Introducción y Descripción General del SRS. Sin ninguna clave de IA configurada, el documento usa el texto tal como lo escribió el cliente — el wizard y la generación del SRS funcionan igual. Clave gratuita en [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Opcional. Modelo de Gemini a usar (default `gemini-flash-latest`) |
| `ANTHROPIC_API_KEY` | Opcional. Alternativa a Gemini para la misma redacción asistida. Clave en [Anthropic Console](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | Opcional. Modelo de Claude a usar (default `claude-haiku-4-5-20251001`) |
| `OPENAI_API_KEY` | Opcional. Otra alternativa para la misma redacción asistida. Clave en [OpenAI Platform](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | Opcional. Modelo de OpenAI a usar (default `gpt-5-mini`) |
| `AI_GATEWAY_API_KEY` | Opcional. Clave de [Vercel AI Gateway](https://vercel.com/ai-gateway). Habilita el gateway como proveedor de redacción y, además, el modelo de evaluación para detectar requisitos vagos en la revisión de calidad (independiente de `AI_PROVIDER`) |
| `AI_GATEWAY_MODEL` | Opcional. Modelo de texto del gateway para la redacción y la detección de duplicados (default `anthropic/claude-haiku-4.5`) |
| `AI_GATEWAY_EVALUATION_MODEL` | Opcional. Modelo de evaluación del gateway para la detección de vaguedad (default [`typesafe-ai/jev`](https://vercel.com/ai-gateway/models/jev)) |

## Contribuir

### Utilidades de interfaz

- `ui-button` junto con `ui-button-primary` o `ui-button-secondary` unifica altura táctil, espaciado y estados de los enlaces de acción y botones. `ui-field` y `ui-progress` estilizan controles HTML nativos. Las clases viven en la capa CSS `components`, de modo que las utilidades Tailwind pueden ajustar cada contexto.
- `RequirementListInput` mantiene la identidad del DOM y mueve el foco al agregar o eliminar filas. Los datos persistidos siguen siendo listas de texto.
- `createAutosaveQueue` conserva los pendientes de cada pregunta y serializa las peticiones. `useWizardAutosave` integra la cola, el estado React y la recuperación tras reconectar. Los borradores locales contienen solo cambios sin confirmar y se validan antes de restaurar.
- Usa HTML semántico antes de agregar ARIA: enlaces para navegar, botones para acciones, `fieldset`/`legend` para grupos y una región `main` por página. Mantén el foco visible y respeta movimiento reducido.

Valida lint y las regresiones del autoguardado en la etapa de build de Docker (Node 22, sin instalar dependencias en Windows):

```bash
docker build --target builder -t srs-wizard-check .
docker run --rm srs-wizard-check pnpm lint
docker run --rm srs-wizard-check pnpm test
```

Este repo sigue Gitflow, Conventional Commits y Keep a Changelog. Las reglas completas están en [AGENTS.md](AGENTS.md) y el flujo de trabajo en [CONTRIBUTING.md](CONTRIBUTING.md). Los cambios notables se registran en [CHANGELOG.md](CHANGELOG.md). Al participar en este proyecto aceptas el [Código de Conducta](CODE_OF_CONDUCT.md).

## Seguridad

¿Encontraste una vulnerabilidad? No abras un issue público — sigue el proceso de reporte privado en [SECURITY.md](SECURITY.md).

## Licencia

[MIT](LICENSE) © 2026 Juan Pablo
