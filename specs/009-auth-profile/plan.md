# Implementation Plan: Auth & Profile

**Branch**: `009-auth-profile` | **Date**: 2025-11-02 | **Spec**: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/spec.md  
**Input**: Feature specification from `/specs/009-auth-profile/spec.md`

## Summary
Deliver end-to-end account management covering registration, authentication, password recovery, email verification gating, and profile/address book maintenance. AuthN/AuthZ responsibilities include enforcing the umbrella Default Policy Table (password policy, lockout, email verification before checkout) while emitting audit and observability signals. MVP persistence can remain in-memory but must codify the migration path to Postgres when `AUTH_STORE=db` is set.

## Technical Context
**Language/Version**: Node.js 20.x  
**Primary Dependencies**: Express 4.x, Node crypto (scrypt for password hashing), jsonwebtoken (session tokens), nodemailer-compatible adapter (for verification/reset emails, mocked in tests)  
**Storage**: In-memory repository with swap-to-Postgres toggle (documented), Redis-style store for tokens (mocked) — NEEDS CLARIFICATION for production target  
**Testing**: Jest 29.x (unit, integration, contract)  
**Target Platform**: Backend API on Node (port 3000)  
**Project Type**: Backend API within existing repo  
**Performance Goals**: Login and registration p95 ≤ 300ms; password reset flow completes within 2 steps  
**Constraints**: Password policy enforcement, lockout after 5 failed attempts for 15 minutes, verification required before ordering, deterministic token expiry (2 hours)  
**Scale/Scope**: Single storefront with thousands of users; anticipate future SSO integration (deferred)

## Constitution Check
- TDD-first: plan fronts contract/unit tests ahead of implementation tasks.  
- Security gates align with umbrella policies; all verification and lockout paths surfaced in tests/docs.  
- Complexity bounded to single API service; no additional projects introduced.

Initial Constitution Check: PASS

## Project Structure

### Documentation (this feature)
```text
specs/009-auth-profile/
├── plan.md              # This file (planning output)
├── research.md          # Phase 0 findings (policies, dependencies)
├── data-model.md        # Phase 1 entity definitions (User, Address, Tokens)
├── quickstart.md        # Phase 1 walkthroughs (register, verify, reset)
├── contracts/           # OpenAPI specs for auth/profile endpoints
└── tasks.md             # Generated via Phase 2 (/tasks)
```

### Source Code (repository root)
```text
src/
├── api/
│   └── routes/
│       ├── auth.js               # Register/login/logout/reset endpoints
│       └── profiles.js           # Address management, profile view/update
├── models/
│   └── auth/
│       ├── user.js               # User aggregate with verification status
│       ├── address.js            # Address value object with validators
│       └── token.js              # Verification/reset token model
├── services/
│   └── auth/
│       ├── passwordPolicy.js     # Policy enforcement utilities
│       ├── lockout.js            # Failed-attempt tracking
│       ├── verification.js       # Email verification workflow
│       └── session.js            # Session issuance & validation
├── db/
│   └── migrations/               # Future Postgres migration placeholders
└── observability/
    └── authMetrics.js            # Counters for login, lockout, resets

tests/
├── unit/auth/                    # Password policy, lockout, token services
├── integration/auth/             # End-to-end flows (register→verify→login)
└── contract/auth/                # OpenAPI contract coverage
```

**Structure Decision**: Single backend Node project; auth/profile modules live under `src/{api,services,models}/auth` with complementary Jest suites.

## Phase 0: Research & Clarifications
1. Document umbrella Default Policy Table cross-references (password complexity, lockout timings, verification requirements).  
2. Confirm temporary email delivery adapter approach (mock transport vs actual service).  
3. Decide token storage strategy (in-memory map vs pluggable store) and document migration triggers.  
**Output**: `research.md` capturing policy sources, open questions, and assumptions.

## Phase 1: Design Artifacts
1. Define entities in `data-model.md` (User, Address, VerificationToken, ResetToken, Session).  
2. Produce OpenAPI contracts under `contracts/` for:
   - `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
   - `POST /auth/password/forgot`, `POST /auth/password/reset`
   - `POST /auth/verify` (token submit)  
   - `GET/PUT /profile`, `POST/DELETE /profile/addresses`  
3. Draft `quickstart.md` scenarios: register → verify → login, reset password path, address CRUD.  
**Gate**: Re-run Constitution Check ensuring tests precede implementation.

## Phase 2: Task Planning Approach
- Organize tasks by user journeys: Registration & Verification (US1), Login & Session Management (US2), Password Recovery (US3), Profile & Address Management (US4).  
- For each journey: author contract tests → unit tests → services/models → routes → integration tests.  
- Include observability and documentation updates as final phase.  
- Clearly mark parallelizable work ([P]) when files don't overlap.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| *(none)*  |            |                                       |
