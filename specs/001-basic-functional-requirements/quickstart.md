# Quickstart — Basic Functional Requirements (Umbrella)

## What’s here
- plan.md: Implementation plan
- research.md: Phase 0 research decisions
- data-model.md: Umbrella data model
- contracts/openapi.yaml: Representative API contracts for search, cart, checkout, orders

## Validate the design
1. Review Default Policy Table in the spec to confirm shared SLAs/policies.
2. Inspect `contracts/openapi.yaml` and ensure endpoints align with acceptance criteria (single payment option; postal address hard fail; out-of-stock labeling).
3. Confirm data-model aligns with entities and constraints in the spec.

## Next steps
- Install and run tests:
  - `npm install`
  - `npm test`
- Start the API locally:
  - `npm start` (serves Express app on PORT, default 3000)
- Exercise endpoints:
  - `GET http://localhost:3000/search?q=Hat`
  - `POST http://localhost:3000/cart` with `{ "skuId": "SKU123", "quantity": 1 }`
  - `POST http://localhost:3000/checkout` with body per contracts/openapi.yaml
- Swagger UI:
  - `http://localhost:3000/api-docs` (interactive docs)
  - Raw spec: `http://localhost:3000/openapi.json`
- Update agent context after plan changes:
  - `.specify/scripts/bash/update-agent-context.sh codex`
