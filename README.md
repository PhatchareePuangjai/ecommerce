# Demo API — Umbrella (Basic Functional Requirements)

## Prerequisites
- Node.js 20+

## Install
```
npm install
```

## Run tests
```
npm test
```

## Start API
```
npm start
# http://localhost:3000
# Swagger UI: http://localhost:3000/api-docs
# OpenAPI JSON: http://localhost:3000/openapi.json
```

## Dev mode (auto-reload)
```
npm run dev
# Restarts automatically on changes in src/ or OpenAPI YAML
```

## Endpoints (umbrella)
- GET `/search?q=Hat`
- POST `/cart` { skuId, quantity }
- POST `/checkout` { shippingAddress, paymentMethod, items, totals }
- GET `/orders/{orderId}`
 
## Endpoints (CMS)
- GET `/cms/articles` — list published, scheduled articles
- POST `/cms/articles` — create draft article
- PUT `/cms/articles/{id}` — update fields or apply workflow action `{ action: submit|approve|publish|unpublish }`
- GET `/cms/banners` — list visible banners (sorted by publishedAt desc, then order desc)
- POST `/cms/banners` — create draft banner
- PUT `/cms/banners/{id}` — update fields or `{ action: publish|unpublish }`
- GET `/cms/preview/{type}/{id}` — preview draft/review items (requires header `x-preview-role: editor|admin`)
 
## API Docs (Swagger)
- UI: http://localhost:3000/api-docs
- Spec: http://localhost:3000/openapi.json

## Perf (quick check)
```
PORT=3000 node tests/perf/perf-runner.js
```

## Accessibility
See `docs/a11y-checklist.md` for WCAG 2.1 AA considerations.

## Postgres (local dev)
Default connection (env overrides supported):
- Host: 127.0.0.1
- Port: 5432
- Database: ecommerce
- User: ecommerce
- Password: ecommerce

Setup (example):
```
# Using psql
createuser ecommerce --createdb --pwprompt   # set password to ecommerce
createdb -O ecommerce ecommerce

# Run migrations from repo root
npm run db:migrate
```

Environment variables (optional): PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

### CMS store: memory vs database
By default CMS uses an in-memory store suitable for tests and local development. To use Postgres:
```
export CMS_STORE=db
npm run db:migrate   # ensures CMS tables exist
npm start
```
Tables created:
- `cms_articles(id, title, body, section, status, schedule_start, schedule_end, published_at, author_id, audit)`
- `cms_banners(id, title, media_url, link_url, position, sort_order, status, schedule_start, schedule_end, published_at, audit)`
- `cms_themes(id, name, config)`

### Performance indexes
This repo includes a migration to add useful indexes and pg_trgm extension for substring email search:
```
npm run db:migrate
```
Note: Creating the `pg_trgm` extension may require sufficient privileges in your database. If it fails, run as a superuser on your local dev DB:
```
psql -d ecommerce -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```
