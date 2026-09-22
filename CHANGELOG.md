# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [0.3.1] - 2026-09-22

### Added

- Licencia MIT (`LICENSE`), `CODE_OF_CONDUCT.md`, `SECURITY.md` y plantillas de issues (`.github/ISSUE_TEMPLATE/`) para preparar el repo como público.

## [0.3.0] - 2026-09-22

### Added

- Utilidades reutilizables de autoguardado por pregunta, borradores validados y controles CSS compartidos.

### Changed

- Wizard con posición visible, navegación junto a las respuestas y foco estable al agregar o eliminar requisitos; HTML semántico con regiones, grupos y progreso nativo.
- Campos y botones consistentes, confirmación visible al copiar enlaces y alternativa seleccionable si el portapapeles falla; dashboard y tablas SRS adaptados a pantallas pequeñas.

### Fixed

- El autoguardado conserva todas las preguntas al avanzar rápido, serializa respuestas y espera los pendientes antes de finalizar; recupera borradores sin diferencias de hidratación.
- El recorrido guiado limpia su DOM al salir y tolera errores de almacenamiento; los formularios conservan el texto después de un error.

## [0.2.0] - 2026-09-22

### Added

- Botón de cerrar sesión en el dashboard.

### Changed

- Mejorada la accesibilidad del wizard y dashboard: navegación por teclado, foco visible, etiquetas semánticas, progreso anunciado, feedback de autoguardado con reintento, logout y tour contextual.
- El entorno Docker pasó de un contenedor de desarrollo (bind mount + `next dev`, con hot reload) a una imagen multi-stage de producción (`next build` en el build, `next start` en runtime): arranque más rápido y liviano, sin hot reload. La base de datos SQLite ahora vive en el volumen `db_data` (`/data/app.db`), separada del código.

### Fixed

- `react-markdown` truena `next build` si se renderiza dentro de un Server Component puro (usa hooks internamente); aislado en `MarkdownView`, un Client Component dedicado.

## [0.1.0] - 2026-09-21

### Added

- Dashboard interno protegido por contraseña para crear proyectos y ver su estado (`No iniciado` / `En progreso` / `Completo`).
- Wizard público (`/s/[slug]`) para que los clientes completen su ERS sin fricción: un paso a la vez, autosave con indicador visual, barra de progreso y recorrido guiado con `driver.js` la primera visita.
- Catálogo de preguntas en lenguaje llano mapeado a las 4 categorías de IEEE 830 (usuario, sistema, funcional, no funcional), con selector de prioridad (esencial / condicional / opcional).
- Generador de documento SRS en Markdown: introducción, descripción general y requisitos trazables (`RU/RS/RF/RNF-###`) por categoría.
- Vista de impresión y descarga `.md` del SRS compilado.
- Entorno de desarrollo con Docker Compose (Next.js 16 + Prisma 6 + SQLite), pensado para evitar los límites de ruta de Windows.

[Unreleased]: https://github.com/rogersx27/srs-wizard/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/rogersx27/srs-wizard/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/rogersx27/srs-wizard/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/rogersx27/srs-wizard/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/rogersx27/srs-wizard/releases/tag/v0.1.0
