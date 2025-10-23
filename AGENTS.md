# Repository Guidelines

## Project Structure & Module Organization
- src: API and domain code
  - src/api: Express app, routes, Swagger (`src/api/app.js`, `src/api/routes/*.js`)
  - src/services: business logic (payments, inventory, CMS, etc.)
  - src/models: lightweight data models/value objects
  - src/db: migrations and DB bootstrap
- tests: Jest tests
  - tests/unit, tests/integration, tests/contract, tests/perf, tests/observability
- docs: supplemental docs (e.g., `docs/a11y-checklist.md`)

## Build, Test, and Development Commands
- npm install: install dependencies
- npm test: run all Jest tests
- npm start: start API on port 3000 (Swagger at /api-docs)
- npm run dev: start with auto-reload (nodemon)
- npm run db:migrate: run database migrations
- Perf example: `PORT=3000 node tests/perf/perf-runner.js`

## Coding Style & Naming Conventions
- Language: Node.js 20, Express 4, CommonJS (`require`/`module.exports`)
- Indentation: 2 spaces; use semicolons
- Naming: camelCase for variables/functions; PascalCase for classes
- Files: keep lowercase, concise; follow existing patterns (`orders.js`, `store.memory.js`)
- HTTP routes: define routers under `src/api/routes` and export `{ router }`

## Testing Guidelines
- Framework: Jest 29 (`tests/**/*.test.js`)
- Types: unit, integration, contract, perf, observability test suites
- Add tests alongside feature changes; mock external services (Stripe, Shippo/carriers) with Jest
- Run `npm test` locally; keep tests deterministic and fast

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits when possible
  - Examples: `feat(cms): add banner publishing`, `fix(orders): correct total rounding`
- PRs: clear description, linked issues, test coverage, and any migration or env var notes
  - Include sample requests or curl snippets for new endpoints; update README/Swagger as needed

## Security & Configuration Tips
- Never commit secrets; use environment variables (.env is git-ignored)
- Common env vars: `STRIPE_API_KEY`, `SHIPPO_TOKEN` (or carrier-specific), `CMS_STORE`, `PG*`
- Prefer sandbox/test keys and mocks in tests; avoid network calls in unit tests
