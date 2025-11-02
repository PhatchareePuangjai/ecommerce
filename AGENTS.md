# Repository Guidelines

## Project Structure & Module Organization
- `src/`: API and domain code
  - `src/api/`: Express app, routes, Swagger (`src/api/app.js`, `src/api/routes/*.js`)
  - `src/services/`: business logic (payments, inventory, CMS)
  - `src/models/`: lightweight data models/value objects
  - `src/db/`: migrations and DB bootstrap
- `tests/`: Jest suites (`unit`, `integration`, `contract`, `perf`, `observability`)
- `docs/`: supplemental docs (e.g., `docs/a11y-checklist.md`)
- API runs on port `3000`; Swagger at `/api-docs`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm start`: Start the API on port `3000`.
- `npm run dev`: Start with auto‑reload (nodemon).
- `npm test`: Run all Jest tests.
- `npm run db:migrate`: Run database migrations.
- Perf smoke: `PORT=3000 node tests/perf/perf-runner.js`.

## Coding Style & Naming Conventions
- **Language**: Node.js 20, Express 4, CommonJS (`require`/`module.exports`).
- **Indentation**: 2 spaces; always use semicolons.
- **Naming**: camelCase for variables/functions; PascalCase for classes.
- **Filenames**: lowercase, concise (e.g., `orders.js`, `store.memory.js`).
- **Routes**: define under `src/api/routes` and export `{ router }`.

## Testing Guidelines
- **Framework**: Jest 29; tests live under `tests/**/*.test.js`.
- **Deterministic**: keep tests fast; avoid real network calls.
- **Mocking**: mock external services (Stripe, Shippo/carriers) with Jest.
- **Run**: `npm test`; add/update tests alongside feature changes.

## Commit & Pull Request Guidelines
- **Commits**: use Conventional Commits (e.g., `feat(cms): add banner publishing`, `fix(orders): correct total rounding`).
- **PRs**: include clear description, linked issues, test coverage/status, and any migration/env var notes. Update Swagger/README for new endpoints and include sample curl requests.

## Security & Configuration Tips
- Do not commit secrets; use environment variables (`.env` is git‑ignored).
- Common env vars: `STRIPE_API_KEY`, `SHIPPO_TOKEN` (or carrier‑specific), `CMS_STORE`, `PG*`.
- Prefer sandbox/test keys and mocks in tests; avoid real network access.

