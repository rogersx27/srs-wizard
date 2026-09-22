# SRS Wizard

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

## Contribuir

Este repo sigue Gitflow, Conventional Commits y Keep a Changelog. Las reglas completas están en [AGENTS.md](AGENTS.md) y el flujo de trabajo en [CONTRIBUTING.md](CONTRIBUTING.md). Los cambios notables se registran en [CHANGELOG.md](CHANGELOG.md).
