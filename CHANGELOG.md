# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- Diccionarios de ideas y ejemplos editables en modales para describir el proyecto y sus usuarios, sin IA; funcionalidades sugeridas que se pueden adaptar o complementar con opciones propias.
- Opción explícita para indicar que no se necesitan integraciones, conservada en el progreso y el SRS.

- Redacción asistida por IA (opcional) para la Introducción y Descripción General del SRS generado, con Gemini (capa gratuita), Anthropic u OpenAI como proveedor (`AI_PROVIDER`). Sin ninguna clave configurada, o si el proveedor falla, el documento muestra el texto tal como lo escribió el cliente sin interrumpir la generación. Puerto agnóstico de proveedor (`IAiAssistant`) para poder cambiar de proveedor de IA sin tocar el dominio ni la aplicación.
- Revisión de calidad de requisitos (`/dashboard/[projectId]/quality`): advertencias de vaguedad y posibles duplicados detectadas por IA, más requisitos sin prioridad asignada (chequeo determinista, sin IA). Es solo informativo — no bloquea completar el proyecto ni modifica el documento SRS. El chequeo de prioridad sigue funcionando aunque no haya ningún proveedor de IA configurado.
- Los resultados de IA (redacción del SRS, revisión de calidad) ahora se cachean por proyecto en base de datos: solo se vuelve a consultar el proveedor cuando cambian las respuestas que los generaron, en vez de en cada visita a la página. Un resultado degradado (sin proveedor configurado, o si la IA falló) nunca se cachea, para reintentar en la siguiente consulta.

### Changed

- La pregunta de velocidad, seguridad y facilidad de uso permite seleccionar varias cualidades comunes y conserva las respuestas anteriores.

### Fixed

- Enter agrega un elemento y enfoca su campo; cada requisito guarda su propia prioridad, también en borradores y en el SRS, manteniendo las prioridades de respuestas anteriores.

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
