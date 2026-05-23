# refract-ui — Copilot Instructions

Standalone visualization UI for Refract. Vanilla TypeScript + Vite.

## Quick Commands

```bash
bun install && bun run dev    # Vite dev server
bun run build                 # tsc + vite build
bun run test                  # Typecheck + vitest
bun run preview               # Vite preview
bun run lint                  # Biome check
```

## Key Paths

- `src/` — Component source (vanilla TypeScript)
- `src/language/` — Viz-specific UI components
- `tests/` — Vitest test suite
- `public/` — Static assets and sample data

## Conventions

- **Package manager:** Bun
- **Framework:** None — vanilla TS, DOM manipulation, no JSX
- **Linter/Formatter:** Biome
- **Tests:** Vitest
- **Pre-commit:** Husky runs Biome on staged files
- **Commit style:** Conventional Commits

## Pre-Commit Rule

```bash
bun run lint   # Run before pushing.
```
