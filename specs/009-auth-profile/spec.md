# Feature Specification: Auth & Profile

**Feature Branch**: `009-auth-profile`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: Derived from umbrella spec: ../001-basic-functional-requirements/spec.md

## Related Specs
- Umbrella: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/spec.md

## Execution Flow (main)
```
1. Parse Input and scope boundaries
2. Extract actors: Visitor, Registered User, Admin
3. Generate user scenarios and testable requirements
4. Identify entities (User, Address, Payment Token)
5. Review checklist
```

---

## ⚡ Quick Guidelines
- Email/password auth; email verification required before ordering
- Password policy and reset; saved addresses; Stripe tokens only

<a id="user-scenarios"></a>
## User Scenarios & Testing (mandatory)

### Primary User Story
Visitors register/login/logout; manage profiles and addresses; recover passwords.

<a id="acceptance-scenarios"></a>
### Acceptance Scenarios
1. Given registration, When signing up, Then password policy and email verification requirements follow the Default Policy Table (umbrella) and are enforced before ordering.
2. Given password reset request, When submitted, Then token validity and lockout thresholds follow the Default Policy Table.
3. Given profile changes, When adding/editing/deleting an address, Then changes reflect immediately and validate for completeness.

<a id="requirements"></a>
## Requirements (mandatory)

<a id="functional-requirements"></a>
### Functional Requirements
- FR-AUTH-001: Register, login, logout via email/password; require email verification before placing orders.
- FR-AUTH-002: Password policy: minimum 8 characters with mixed case or number; password reset via 2‑hour token; lockout after 5 failed attempts for 15 minutes.
- FR-AUTH-003: Manage profile and address book; saved payment methods stored as Stripe tokens only.

<a id="key-entities"></a>
### Key Entities (include if feature involves data)
- User, Address, Payment Token

---

## Review & Acceptance Checklist
- [ ] No implementation details
- [ ] Testable, unambiguous requirements
- [ ] Scope limited to Auth/Profile

---

## Execution Status

## Permalinks
- User Scenarios: specs/009-auth-profile/spec.md#user-scenarios
- Acceptance Scenarios: specs/009-auth-profile/spec.md#acceptance-scenarios
- Functional Requirements: specs/009-auth-profile/spec.md#functional-requirements
- Key Entities: specs/009-auth-profile/spec.md#key-entities
- Default Policy Table (umbrella): specs/001-basic-functional-requirements/spec.md#default-policy-table
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
