# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Changed

- Mejorada la accesibilidad del wizard y dashboard: navegación por teclado, foco visible, etiquetas semánticas, progreso anunciado, feedback de autoguardado con reintento, logout y tour contextual.

## [0.1.0] - 2026-09-21

### Added

- Dashboard interno protegido por contraseña para crear proyectos y ver su estado (`No iniciado` / `En progreso` / `Completo`).
- Wizard público (`/s/[slug]`) para que los clientes completen su ERS sin fricción: un paso a la vez, autosave con indicador visual, barra de progreso y recorrido guiado con `driver.js` la primera visita.
- Catálogo de preguntas en lenguaje llano mapeado a las 4 categorías de IEEE 830 (usuario, sistema, funcional, no funcional), con selector de prioridad (esencial / condicional / opcional).
- Generador de documento SRS en Markdown: introducción, descripción general y requisitos trazables (`RU/RS/RF/RNF-###`) por categoría.
- Vista de impresión y descarga `.md` del SRS compilado.
- Entorno de desarrollo con Docker Compose (Next.js 16 + Prisma 6 + SQLite), pensado para evitar los límites de ruta de Windows.

[Unreleased]: https://github.com/rogersx27/srs-wizard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rogersx27/srs-wizard/releases/tag/v0.1.0
