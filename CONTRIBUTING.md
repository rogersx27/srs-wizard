# Contribuir a SRS Wizard

Las reglas completas de ramas, commits y versionado viven en [AGENTS.md](AGENTS.md) (sección "Reglas del repositorio") — es la fuente de verdad, incluida la que siguen los agentes de IA que trabajen en este repo. Este archivo es el resumen rápido para humanos.

## Resumen

- **Ramas:** Gitflow — `main` (producción) / `develop` (integración) / `feature/*`, `release/*`, `hotfix/*`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/) — `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Se valida automáticamente en cada PR.
- **Versionado:** [Semantic Versioning](https://semver.org/lang/es/).
- **Changelog:** [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) — toda funcionalidad o fix nuevo agrega una línea a `CHANGELOG.md` bajo `[Unreleased]`.

## Flujo de trabajo

1. Crea tu rama desde `develop`: `git checkout -b feature/lo-que-sea develop`.
2. Desarrolla y prueba localmente con `docker compose up --build` (ver [README.md](README.md)).
3. Commitea siguiendo Conventional Commits.
4. Agrega tu cambio a `CHANGELOG.md` bajo `[Unreleased]`.
5. Abre un Pull Request hacia `develop` usando la plantilla (`.github/PULL_REQUEST_TEMPLATE.md`).
6. CI corre lint + build + valida los mensajes de commit del PR.

## Checklist antes de pedir revisión

- [ ] `pnpm lint` pasa
- [ ] `docker compose up --build` levanta sin errores
- [ ] Probaste manualmente el flujo afectado (dashboard y/o wizard `/s/[slug]`)
- [ ] `CHANGELOG.md` actualizado
- [ ] Los commits siguen Conventional Commits
