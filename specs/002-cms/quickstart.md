# Quickstart — CMS (002-cms)

## What’s here
- plan.md: Implementation plan
- research.md: Decisions and open questions
- data-model.md: CMS entities and constraints
- contracts/openapi.yaml: CMS API contracts

## Try it (after implementation tasks complete)

Create a draft article:
```bash
curl -s -X POST http://localhost:3000/cms/articles \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"World","section":"news","schedule":{"startAt":"2025-10-10T00:00:00Z"}}'
```

Preview the draft (requires Admin header):
```bash
curl -s http://localhost:3000/cms/preview/article/ART1 -H 'x-preview-role: admin'
```

Preview without a role returns 403:
```bash
curl -i http://localhost:3000/cms/preview/article/ART1 | head -n 1
# HTTP/1.1 403 Forbidden
```

Publish the article:
```bash
curl -s -X PUT http://localhost:3000/cms/articles/ART1 \
  -H 'Content-Type: application/json' \
  -d '{"action":"publish"}'
```

Create a scheduled banner:
```bash
curl -s -X POST http://localhost:3000/cms/banners \
  -H 'Content-Type: application/json' \
  -d '{"title":"Sale","mediaUrl":"https://cdn/img.jpg","linkUrl":"/sale","position":"home","order":10,"schedule":{"startAt":"2025-10-10T10:00:00Z","endAt":"2025-10-11T10:00:00Z"}}'
```

List visible banners:
```bash
curl -s http://localhost:3000/cms/banners
```

Zero-state example (no banners scheduled):
```bash
curl -s http://localhost:3000/cms/banners | jq
# {
#   "status": "empty",
#   "message": "No banners scheduled. Schedule a banner in the CMS admin."
# }
```

Publish a theme update:
```bash
curl -s -X PUT http://localhost:3000/cms/themes/default \
  -H 'Content-Type: application/json' \
  -d '{"action":"publish","config":{"palette":{"primary":"#0044ff"},"typography":{"heading":"Inter"},"layout":{"hero":"full-bleed"}}}'
```
## Use Postgres for CMS (optional)

By default, CMS uses an in-memory store. To persist CMS data in Postgres:

```
export CMS_STORE=db
npm run db:migrate
npm start
```

Ensure your PG env vars are set (see repo README).

When running with Postgres, confirm that migrations populate audit tables and that CMS data stays consistent between in-memory and database-backed runs.
