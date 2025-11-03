# Tasks — Auth & Profile (009-auth-profile)

Feature Dir: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile  
Plan: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/plan.md  
Spec: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/spec.md

Notes
- TDD-first: write failing tests before implementations.
- [P] indicates tasks that can run in parallel (different files/modules).
- Update agent context with `.specify/scripts/bash/update-agent-context.sh codex` after major plan changes.

## Ordered Task List

[ ] T001 — Capture auth research notes  
- Description: Document Default Policy Table references, token transport decisions, and storage assumptions.  
- Outputs: research.md  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/research.md

[ ] T002 — Define auth data model entities [P]  
- Description: Detail User, Address, Session, VerificationToken, ResetToken entities with fields, constraints, and relationships.  
- Outputs: data-model.md  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/data-model.md  
- Dependency: T001

[ ] T003 — Draft auth quickstart scenarios [P]  
- Description: Write walkthroughs for register→verify→login, password reset, and address management flows. Include curl examples and expected responses.  
- Outputs: quickstart.md  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/quickstart.md  
- Dependency: T001

[ ] T004 — Author OpenAPI contracts for auth/profile endpoints  
- Description: Create OpenAPI 3.0 spec covering register, login/logout, verification, password reset, profile, and address endpoints. Define request/response schemas and error payloads (lockout, unverified).  
- Outputs: contracts/openapi.yaml  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/contracts/openapi.yaml  
- Dependencies: T002, T003

[ ] T005 — Contract tests: registration & verification [US1] [P]  
- Description: Add supertest suites for `POST /auth/register` (201 + verification email stub) and `POST /auth/verify` (204). Include validation and duplicate email cases.  
- Outputs: tests/contract/auth.register.test.js, tests/contract/auth.verify.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/  
- Dependency: T004

[ ] T006 — Unit tests: password policy & verification tokens [US1] [P]  
- Description: Write Jest unit tests for passwordPolicy and verification services (hashing, token expiry, resend guard).  
- Outputs: tests/unit/auth.passwordPolicy.test.js, tests/unit/auth.verification.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/unit/  
- Dependencies: T002, T005

[ ] T007 — Implement password policy & verification services [US1]  
- Description: Add `src/services/auth/passwordPolicy.js` and `verification.js`, ensuring policy errors match spec (mixed case/number, min length, duplicate registration guard).  
- Outputs: src/services/auth/passwordPolicy.js, src/services/auth/verification.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/auth/  
- Dependencies: T006

[ ] T008 — Implement register/verify routes [US1]  
- Description: Create `src/api/routes/auth.js` handlers for register and verify, integrating models, services, and metrics. Persist new users in temporary in-memory store with verification flags.  
- Outputs: src/api/routes/auth.js (register/verify blocks), src/models/auth/user.js, src/models/auth/token.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/, /Users/toy/Desktop/learn/AI/demo-api/src/models/auth/  
- Dependencies: T007

[ ] T009 — Contract tests: login/logout & lockout [US2] [P]  
- Description: Add tests for `POST /auth/login` (success, invalid credentials, lockout escalation) and `POST /auth/logout` (204, invalid token).  
- Outputs: tests/contract/auth.login.test.js, tests/contract/auth.logout.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/  
- Dependency: T005

[ ] T010 — Unit tests: session & lockout services [US2] [P]  
- Description: Cover session issuance/validation and lockout timing (5 failed attempts → 15-minute block) with deterministic clock stubs.  
- Outputs: tests/unit/auth.session.test.js, tests/unit/auth.lockout.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/unit/  
- Dependencies: T002, T009

[ ] T011 — Implement session & lockout services [US2]  
- Description: Add `src/services/auth/session.js` (JWT issuance, revocation) and `lockout.js` (attempt tracking). Wire metrics counters.  
- Outputs: src/services/auth/session.js, src/services/auth/lockout.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/auth/  
- Dependencies: T010

[ ] T012 — Add login/logout route handlers [US2]  
- Description: Extend `src/api/routes/auth.js` with login/logout endpoints, applying password hashing, lockout checks, verification status enforcement.  
- Outputs: src/api/routes/auth.js (login/logout), src/observability/authMetrics.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/, /Users/toy/Desktop/learn/AI/demo-api/src/observability/  
- Dependencies: T011

[ ] T013 — Contract tests: password reset flow [US3] [P]  
- Description: Test `POST /auth/password/forgot` (202) and `POST /auth/password/reset` (204) including invalid/expired tokens and lockout reset behaviour.  
- Outputs: tests/contract/auth.passwordReset.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/  
- Dependency: T009

[ ] T014 — Unit tests: reset token service & email adapter [US3] [P]  
- Description: Validate token issuance, replay protection, and mock email sender interactions.  
- Outputs: tests/unit/auth.resetTokens.test.js, tests/unit/auth.mailer.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/unit/  
- Dependencies: T002, T013

[ ] T015 — Implement password reset services & routes [US3]  
- Description: Create `src/services/auth/reset.js` and extend `src/api/routes/auth.js` for forgot/reset endpoints, integrating with passwordPolicy and lockout reset.  
- Outputs: src/services/auth/reset.js, src/api/routes/auth.js (forgot/reset), src/services/auth/mailer.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/services/auth/, /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/  
- Dependencies: T014

[ ] T016 — Contract tests: profile & address management [US4] [P]  
- Description: Cover `GET/PUT /profile` and `POST/DELETE /profile/addresses` with validation, address limits, and verification gating.  
- Outputs: tests/contract/profile.test.js, tests/contract/profile.addresses.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/contract/  
- Dependencies: T005, T009

[ ] T017 — Unit tests: address model & profile service [US4] [P]  
- Description: Validate address normalization, default flag handling, and profile updates.  
- Outputs: tests/unit/auth.address.test.js, tests/unit/auth.profileService.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/unit/  
- Dependencies: T002, T016

[ ] T018 — Implement profile models & service layer [US4]  
- Description: Add `src/models/auth/address.js`, `src/services/auth/profile.js`, and persistence adapters for profile state.  
- Outputs: src/models/auth/address.js, src/services/auth/profile.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/models/auth/, /Users/toy/Desktop/learn/AI/demo-api/src/services/auth/  
- Dependencies: T017

[ ] T019 — Implement profile routes [US4]  
- Description: Create `src/api/routes/profiles.js`, mount on Express app, enforce auth middleware, and integrate with profile service.  
- Outputs: src/api/routes/profiles.js, src/api/app.js (route registration)  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/api/routes/, /Users/toy/Desktop/learn/AI/demo-api/src/api/  
- Dependencies: T018

[ ] T020 — Integration tests: register → verify → login → update profile  
- Description: Add Jest integration suite to cover full happy path including address add/delete and session persistence.  
- Outputs: tests/integration/auth.happyPath.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/integration/  
- Dependencies: T012, T019

[ ] T021 — Integration tests: lockout and password reset recovery  
- Description: Validate lockout threshold, countdown expiry, and reset unlock behaviour in integration context.  
- Outputs: tests/integration/auth.lockout.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/integration/  
- Dependencies: T015, T020

[ ] T022 — Observability & metrics wiring  
- Description: Expose auth metrics via observability module (logins, failed attempts, resets) and ensure logging covers security events.  
- Outputs: src/observability/metrics.js (augmented), tests/observability/auth.metrics.test.js  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/src/observability/, /Users/toy/Desktop/learn/AI/demo-api/tests/observability/  
- Dependencies: T012, T021

[ ] T023 — Documentation updates  
- Description: Update `specs/009-auth-profile/quickstart.md` with final curl responses, and add Auth section to root README.md.  
- Outputs: specs/009-auth-profile/quickstart.md (updated), README.md (updated)  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/, /Users/toy/Desktop/learn/AI/demo-api/README.md  
- Dependencies: T021, T022

[ ] T024 — Performance smoke & validation  
- Description: Run `npm test` and auth perf smoke (if needed) ensuring lockout/reset flows meet SLA; document results.  
- Outputs: Test run logs, docs/perf-notes.md (optional)  
- Paths: /Users/toy/Desktop/learn/AI/demo-api/tests/, /Users/toy/Desktop/learn/AI/demo-api/docs/  
- Dependencies: T023
