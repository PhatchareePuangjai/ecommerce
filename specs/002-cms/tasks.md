# Tasks — CMS (002-cms)

Feature Dir: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms
Plan: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/plan.md
Spec: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/spec.md

Notes
- TDD-first: write tests before implementation.
- [P] indicates tasks that can run in parallel (different files/modules).
- Use `.specify/scripts/bash/update-agent-context.sh codex` after major plan changes.

## Ordered Task List

[X] T001 — Initialize CMS design artifacts
- Description: Create CMS docs skeletons: research.md, data-model.md, quickstart.md, contracts/ folder.
- Outputs: research.md (skeleton), data-model.md (skeleton), quickstart.md (skeleton), contracts/ (empty)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/
- Agent Command Hint: apply_patch to add empty files and folder placeholders.

[X] T002 — Author OpenAPI contracts for CMS endpoints
- Description: Write OpenAPI 3.0 spec covering admin and public endpoints: /cms/articles (GET, POST, PUT), /cms/banners (GET, POST, PUT), /cms/preview/{type}/{id} (GET). Include schemas (Content, Banner, Theme) and workflow/status fields, schedule windows (startAt/endAt UTC), and preview access notes.
- Outputs: contracts/openapi.yaml with endpoints and components/schemas
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/contracts/openapi.yaml
- Dependency: T001
- Agent Command Hint: apply_patch to write YAML based on spec.md and plan.md.

[X] T003 — Generate contract test skeletons for CMS [P]
- Description: For each endpoint in contracts: create tests asserting request/response shapes via supertest against app, skipping auth details (use header stub for preview role). Files: tests/contract/cms.articles.test.js, cms.banners.test.js, cms.preview.test.js.
- Outputs: tests/contract/*.test.js (CMS)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/
- Dependency: T002
- Agent Command Hint: apply_patch to add Jest tests; import { app } from src/api/app.

[ ] T004 — Define CMS data model entities [P]
- Description: Fill data-model.md with entities: Content (id, title, body, status[Draft|Review|Approved|Published], schedule{startAt,endAt}, section, authorId?, audit[]), Banner (id, title, mediaUrl, linkUrl, position, order, schedule{startAt,endAt}, status), Theme (id, name, config{}), with relationships and constraints (UTC schedule; overlapping banners priority by most recent publishAt).
- Outputs: specs/002-cms/data-model.md
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/data-model.md
- Dependency: T001
- Agent Command Hint: apply_patch to update markdown with tables/fields.

[ ] T005 — Add CMS quickstart scenarios [P]
- Description: Add quickstart walkthroughs: create draft article → preview (401 without role, 200 with role); approve and publish article → visible on GET; create scheduled banner → visibility toggles by time window.
- Outputs: specs/002-cms/quickstart.md
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/quickstart.md
- Dependency: T001
- Agent Command Hint: apply_patch to write quickstart examples with curl commands.

[X] T006 — Create CMS models [P]
- Description: Implement model modules with field validation and defaults.
- Outputs: src/models/cms/content.js, src/models/cms/banner.js, src/models/cms/theme.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/models/cms/
- Dependencies: T004
- Agent Command Hint: apply_patch to add JS modules exporting constructors/validators.

[X] T007 — Implement CMS workflow service
- Description: State transitions Draft→Review→Approved→Published with guards; write audit entries {at, actor, action, from,to, notes}. Export functions: transition(content, action, actor), canTransition(from, action).
- Outputs: src/services/cms/workflow.js; unit tests in tests/unit/cms.workflow.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/cms/workflow.js, /Users/toy/Desktop/learn/AI/demo-api/tests/unit/cms.workflow.test.js
- Dependencies: T006
- Agent Command Hint: apply_patch to add service and tests (Jest).

[X] T008 — Implement CMS scheduling service
- Description: Visibility predicate for content/banner based on schedule windows (UTC) and status; overlapping banner resolution by most recent publishAt then higher order. Export: isVisible(item, now), resolveBanners(list, now).
- Outputs: src/services/cms/scheduling.js; unit tests in tests/unit/cms.scheduling.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/cms/scheduling.js, /Users/toy/Desktop/learn/AI/demo-api/tests/unit/cms.scheduling.test.js
- Dependencies: T006
- Agent Command Hint: apply_patch to add service and tests.

[X] T009 — Implement CMS preview access middleware
- Description: Middleware stub checking preview role; until 009-auth-profile, accept header `x-preview-role: admin`. Reject others with 403. Export: requirePreviewRole(roles=['admin']).
- Outputs: src/services/cms/previewAuth.js; unit tests in tests/unit/cms.previewAuth.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/cms/previewAuth.js, /Users/toy/Desktop/learn/AI/demo-api/tests/unit/cms.previewAuth.test.js
- Dependencies: T006
- Agent Command Hint: apply_patch to add middleware and tests.

[X] T010 — Scaffold CMS routes
- Description: Create router files and mount under /cms in app: articles.js, banners.js, preview.js; do not implement handlers yet.
- Outputs: src/api/routes/cms/articles.js, banners.js, preview.js; wire-up in src/api/app.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/cms/, /Users/toy/Desktop/learn/AI/demo-api/src/api/app.js
- Dependencies: T003, T006–T009
- Agent Command Hint: apply_patch to add routers and import in app.js.

[ ] T011 — Contract tests: make articles endpoints fail first [P]
- Description: Write failing tests per contracts for /cms/articles (GET list, POST create, PUT update). Ensure schema validation assertions.
- Outputs: tests/contract/cms.articles.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/cms.articles.test.js
- Dependencies: T003, T010
- Agent Command Hint: apply_patch to flesh out tests referencing /cms/articles.

[ ] T012 — Contract tests: make banners endpoints fail first [P]
- Description: Write failing tests per contracts for /cms/banners (GET list, POST create, PUT update). Ensure schedule fields present.
- Outputs: tests/contract/cms.banners.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/cms.banners.test.js
- Dependencies: T003, T010
- Agent Command Hint: apply_patch to flesh out tests referencing /cms/banners.

[ ] T013 — Contract tests: make preview endpoint fail first [P]
- Description: Write failing tests per contracts for /cms/preview/{type}/{id} requiring preview role header.
- Outputs: tests/contract/cms.preview.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/cms.preview.test.js
- Dependencies: T003, T010
- Agent Command Hint: apply_patch to flesh out tests referencing /cms/preview.

[X] T014 — Implement articles endpoints
- Description: In-memory storage backed by arrays for test purposes; handlers use workflow service and validation; respect status: only Published visible on GET public; POST creates Draft; PUT updates fields and can change status via workflow action param.
- Outputs: src/api/routes/cms/articles.js (handlers implemented)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/cms/articles.js
- Dependencies: T011, T006–T009
- Agent Command Hint: apply_patch to implement endpoints making contract tests pass.

[X] T015 — Implement banners endpoints
- Description: In-memory storage; handlers validate schedule and position/order; GET returns only currently visible banners based on scheduling service; POST/PUT allow scheduling fields.
- Outputs: src/api/routes/cms/banners.js (handlers implemented)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/cms/banners.js
- Dependencies: T012, T006–T008
- Agent Command Hint: apply_patch to implement endpoints making contract tests pass.

[X] T016 — Implement preview endpoint
- Description: GET /cms/preview/:type/:id returns draft/review items for preview when header indicates allowed role; otherwise 403. Uses preview middleware and reads from in-memory stores.
- Outputs: src/api/routes/cms/preview.js (handlers implemented)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/cms/preview.js
- Dependencies: T013, T009, T014–T015
- Agent Command Hint: apply_patch to implement endpoint making contract tests pass.

[X] T017 — Integration tests: scheduled banner visibility [P]
- Description: Given a banner scheduled in future/past/active windows, visibility toggles correctly via GET /cms/banners based on `now` (mock Date or inject now param for tests); overlapping banners resolve by publishAt then order.
- Outputs: tests/integration/cms.banners.schedule.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/integration/
- Dependencies: T015
- Agent Command Hint: apply_patch to add Jest tests with supertest.

[X] T018 — Integration tests: preview access control [P]
- Description: Without preview role header, /cms/preview/:type/:id returns 403; with admin role returns 200 and draft content.
- Outputs: tests/integration/cms.preview.auth.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/integration/
- Dependencies: T016
- Agent Command Hint: apply_patch to add Jest tests.

[X] T019 — Integration tests: workflow publishing
- Description: Draft → Review → Approved → Published transitions; after Published, GET public list shows the content; add audit entries.
- Outputs: tests/integration/cms.workflow.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/integration/
- Dependencies: T014
- Agent Command Hint: apply_patch to add Jest tests.

[X] T020 — Observability: log CMS operations
- Description: Add structured logs for publish/unpublish and banner schedule changes; expose counters via existing observability module.
- Outputs: src/observability/metrics.js (augmented), optional src/services/cms/logging.js; tests/observability/cms.metrics.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/observability/metrics.js, /Users/toy/Desktop/learn/AI/demo-api/tests/observability/
- Dependencies: T014–T016
- Agent Command Hint: apply_patch to add metrics increments and tests.

[X] T021 — Documentation updates [P]
- Description: Update quickstart.md with CMS endpoints and examples; update root README.md to mention CMS routes.
- Outputs: specs/002-cms/quickstart.md (updated), README.md (updated)
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/002-cms/quickstart.md, /Users/toy/Desktop/learn/AI/demo-api/README.md
- Dependencies: T014–T016
- Agent Command Hint: apply_patch to update docs succinctly.

[X] T022 — Performance test scaffolding [P]
- Description: Add simple perf tests for /cms/banners and /cms/articles list endpoints; target P95 ≤ 500ms.
- Outputs: tests/perf/cms.banners.perf.test.js, tests/perf/cms.articles.perf.test.js
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/perf/
- Dependencies: T014–T015
- Agent Command Hint: apply_patch to add perf test skeletons.

[X] T023 — Update agent context
- Description: Run update script to capture CMS tech choices.
- Command: `.specify/scripts/bash/update-agent-context.sh codex`
- Dependencies: T002, T004–T006

## Parallelization Guide
- Group A [P] after T001: T003 (contract tests skeletons), T004 (data model), T005 (quickstart)
- Group B [P]: T006 (models), T007–T009 (services) can run in parallel once data model is defined
- Group C [P] after routers: T011–T013 contract tests (per endpoint)
- Group D [P] Integration: T017, T018 (independent); T019 sequential after T014
- Group E [P] Polish: T021, T022 in parallel after endpoints

## Dependency Summary
- Setup (T001) → Contracts (T002) → Contract Tests (T003, T011–T013) → Models (T006) → Services (T007–T009) → Routes (T010) → Endpoints (T014–T016) → Integration/Obs (T017–T020) → Docs/Perf (T021–T022) → Agent Context (T023)
