# Tasks — Basic Functional Requirements (Umbrella)

Feature Dir: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements
Plan: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/plan.md
Spec: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/spec.md
Contracts: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/contracts/openapi.yaml

Notes
- TDD-first: write tests before implementation.
- [P] indicates tasks that can run in parallel (different files/modules).
- Use `.specify/scripts/bash/update-agent-context.sh codex` after major plan changes.

## Ordered Task List

[X] T001 — Select stack + scaffold repo structure
- Description: Propose and document backend stack (e.g., Node.js + Express + Jest or Python + FastAPI + pytest), justify against umbrella constraints, and scaffold minimal src/tests layout.
- Outputs: Update plan.md (Technical Context), create `src/` and `tests/` trees, baseline README.
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/plan.md
- Agent Command Hint: apply_patch to write files; record decision in plan.md.

[X] T002 — Generate OpenAPI-derived contract test skeletons [P]
- Description: For each endpoint in openapi.yaml (/search GET, /cart POST, /checkout POST, /orders/{orderId} GET), generate contract test files asserting request/response schemas.
- Outputs: tests/contract/search.test.*, tests/contract/cart.test.*, tests/contract/checkout.test.*, tests/contract/orders.test.*
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/contracts/openapi.yaml
- Dependency: T001

[X] T003 — Create domain models from data-model.md [P]
- Description: Create model files per entity (Product, Category, Variant/SKU, Cart, CartItem, Wishlist, Order, OrderItem, User, Address, Payment, Shipment, Review) with fields and basic validation.
- Outputs: src/models/*.ts (or .py), one file per entity.
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/data-model.md
- Dependency: T001

[X] T004 — Implement address validation service (postal, hard fail)
- Description: Implement service that calls postal/carrier API for address validation; returns actionable errors on mismatch; no overrides allowed.
- Outputs: src/services/addressValidation.*; unit tests in tests/unit/addressValidation.*
- Dependency: T003

[X] T005 — Implement inventory service (reserve/decrement, availability)
- Description: Implement reserve at order placement, decrement at capture; compute ATS; enforce add-to-cart stock constraints.
- Outputs: src/services/inventory.*; unit tests in tests/unit/inventory.*
- Dependency: T003

[X] T006 — Implement payment service (Stripe single option)
- Description: Single payment option via Stripe; support express wallet where available; card otherwise; return provider refs.
- Outputs: src/services/payment.*; unit tests in tests/unit/payment.*
- Dependency: T001

[X] T007 — Implement notification handoff service
- Description: Enqueue/send transactional notifications; guarantee provider handoff ≤ 5 minutes; structured payloads.
- Outputs: src/services/notifications.*; tests in tests/unit/notifications.*
- Dependency: T001

[X] T008 — Implement /search GET endpoint
- Description: Endpoint honoring sort defaults (see policy table); include out-of-stock items with label; exclude hidden/discontinued.
- Outputs: src/api/search.*; wire routes; pass contract tests.
- Dependencies: T002, T003

[X] T009 — Implement /cart POST endpoint
- Description: Add item to cart, enforce stock constraint (409 on exceed); persist cart state; pass contract tests.
- Outputs: src/api/cart.*; tests update as needed.
- Dependencies: T002, T003, T005

[X] T010 — Implement /checkout POST endpoint
- Description: Validate address (hard fail), create order, reserve/decrement inventory at correct lifecycle, handoff confirmation to provider; Stripe single option.
- Outputs: src/api/checkout.*
- Dependencies: T002, T003, T004, T005, T006, T007

[X] T011 — Implement /orders/{orderId} GET endpoint
- Description: Fetch order by ID; ensure user unlink semantics do not expose PII; pass contract tests.
- Outputs: src/api/orders.*
- Dependencies: T002, T003

[X] T012 — Integration tests: search out-of-stock labeling [P]
- Description: Given a keyword K, when searching, then results include out-of-stock items labeled; exclude hidden/discontinued.
- Outputs: tests/integration/search.outofstock.test.*
- Dependencies: T008

[X] T013 — Integration tests: cart stock enforcement [P]
- Description: Given stock S, when adding quantity Q>S, then 409; Q<=S succeeds.
- Outputs: tests/integration/cart.stock.test.*
- Dependencies: T009

[X] T014 — Integration tests: checkout address validation hard fail [P]
- Description: Given invalid/mismatched postal address, then 422 and actionable error; valid address proceeds.
- Outputs: tests/integration/checkout.address.test.*
- Dependencies: T010

[X] T015 — Integration tests: order cancellation and returns windows [P]
- Description: Cancel allowed until shipped; returns within 30 days; exchanges not supported.
- Outputs: tests/integration/orders.policy.test.*
- Dependencies: T010, T011

[X] T016 — Observability: status reflection and notification latency metrics
- Description: Add metrics/logging to measure ≤1 minute status reflection and ≤5 minutes provider handoff; add alert hooks.
- Outputs: src/observability/metrics.*; tests/observability/*
- Dependencies: T007, T010, T011

T017 — Update agent context file
- Description: Run update script to capture tech choices from plan.
- Command: `.specify/scripts/bash/update-agent-context.sh codex`
- Dependencies: T001

[X] T018 — Documentation polish [P]
- Description: Update quickstart.md with stack-specific commands; add README run/test instructions.
- Outputs: specs/001-basic-functional-requirements/quickstart.md, README.md
- Dependencies: T001, T008–T011

[X] T019 — Performance test scaffolding [P]
- Description: Add basic load test harness for search/listing/cart P95 targets.
- Outputs: tests/perf/*
- Dependencies: T008, T009

[X] T020 — Accessibility checklist [P]
- Description: Add a11y checks for web-facing flows (if frontend present) per WCAG 2.1 AA.
- Outputs: docs/a11y-checklist.md
- Dependencies: None

## Parallelization Guide
- Group A [P] after T001: T002 (contract tests), T003 (models)
- Group B [P] after endpoints: T012, T013, T014, T015 (integration tests per endpoint)
- Group C [P]: T018 (docs), T019 (perf), T020 (a11y)

## Dependency Summary
- Setup (T001) → Tests (T002) → Models (T003) → Services (T004–T007) → Endpoints (T008–T011) → Integrations/Obs (T016) → Docs/Perf/A11y (T018–T020)
