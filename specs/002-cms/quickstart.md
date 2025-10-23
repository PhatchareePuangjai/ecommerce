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

Preview the draft (requires header):
```bash
curl -s http://localhost:3000/cms/preview/article/ART1 -H 'x-preview-role: editor'
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
## Use Postgres for CMS (optional)

By default, CMS uses an in-memory store. To persist CMS data in Postgres:

```
export CMS_STORE=db
npm run db:migrate
npm start
```

Ensure your PG env vars are set (see repo README).

