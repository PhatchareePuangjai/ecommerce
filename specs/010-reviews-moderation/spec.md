# Feature Specification: Reviews & Moderation

**Feature Branch**: `010-reviews-moderation`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: Derived from umbrella spec: ../001-basic-functional-requirements/spec.md

## Related Specs
- Umbrella: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/spec.md
- Depends on: /Users/toy/Desktop/learn/AI/demo-api/specs/007-orders-notifications/spec.md

## Execution Flow (main)
```
1. Parse Input and scope boundaries
2. Extract actors: Verified Buyer, Admin/Moderator
3. Generate user scenarios and testable requirements
4. Identify entities (Review)
5. Review checklist
```

---

## ⚡ Quick Guidelines
- 1–5 integer ratings; verified buyer within 90 days; moderation

<a id="user-scenarios"></a>
## User Scenarios & Testing (mandatory)

### Primary User Story
Verified buyers submit ratings/reviews; admins moderate and publish or remove.

<a id="acceptance-scenarios"></a>
### Acceptance Scenarios
1. Given a delivered order within the verification window, When the buyer submits a review, Then one review per order item is accepted; rating scale follows the Default Policy Table; status pending until moderation passes.
2. Given moderation, When a review is hidden/removed, Then the action logs actor, timestamp, and reason.

<a id="requirements"></a>
## Requirements (mandatory)

<a id="functional-requirements"></a>
### Functional Requirements
- FR-REV-001: Accept reviews from verified buyers only (delivered within 90 days) with 1–5 integer ratings.
- FR-REV-002: Provide moderation with audit trail; apply profanity filtering and disallow PII and links.

<a id="key-entities"></a>
### Key Entities (include if feature involves data)
- Review

---

## Review & Acceptance Checklist
- [ ] No implementation details
- [ ] Testable, unambiguous requirements
- [ ] Scope limited to Reviews/Moderation

---

## Execution Status

## Permalinks
- User Scenarios: specs/010-reviews-moderation/spec.md#user-scenarios
- Acceptance Scenarios: specs/010-reviews-moderation/spec.md#acceptance-scenarios
- Functional Requirements: specs/010-reviews-moderation/spec.md#functional-requirements
- Key Entities: specs/010-reviews-moderation/spec.md#key-entities
- Default Policy Table (umbrella): specs/001-basic-functional-requirements/spec.md#default-policy-table
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
