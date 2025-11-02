# Feature Specification: CMS

**Feature Branch**: `002-cms`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: Derived from umbrella spec: ../001-basic-functional-requirements/spec.md

## Related Specs
- Umbrella: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/spec.md
- Depends on: /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/spec.md

## Execution Flow (main)
```
1. Parse Input and scope boundaries
2. Extract actors: Admin, User, Visitor
3. Generate user scenarios and testable requirements
4. Identify entities (Content, Banner, Theme)
5. Review checklist
```

---

## ⚡ Quick Guidelines
- Focus on content authoring and presentation controls
- No product/catalog or checkout logic here

<a id="user-scenarios"></a>
## User Scenarios & Testing (mandatory)

### Primary User Story
Admins manage site themes, banners, and news/articles with preview and scheduling, while Visitors and authenticated Users consume published content only.

<a id="acceptance-scenarios"></a>
### Acceptance Scenarios
1. Given a scheduled banner, When the start time passes, Then it appears on the homepage within 5 minutes and hides after the defined end time (UTC window respected) while start/end timestamps are rendered in the visitor’s locale (e.g., `Oct 10, 2025 10:00 AM PDT`).
2. Given a draft article, When preview is requested, Then only Admin roles can view it and the response is excluded from public caches (Default Policy Table alignment).
3. Given an article in Review, When it is Approved and Published, Then it becomes visible in the configured section and records an audit entry with actor, timestamps, and status transition.
4. Given an updated theme draft, When the theme is published, Then the active theme switches within 5 minutes and applies the documented palette, typography, and layout slots.
5. Given a preview request without an authorized role, When preview is opened, Then the request is rejected with a 403 error and the action is logged for audit review.
6. Given a Visitor or authenticated User, When they attempt to access a CMS management endpoint, Then the system rejects the request with a 403 response and audit note citing insufficient role.

### Exception & Recovery Scenarios
- Given an invalid schedule window (end before start), When saving content, Then the system rejects the change with a validation requirement describing the correction path.
- Given a workflow transition that violates the Default Policy Table, When attempted, Then the request is denied and the spec must state the user-facing message and rollback expectations.

### Edge Cases
- Overlapping banner schedules prioritize by most recent publish time, and ties with identical publishedAt resolve by highest `order` value; if still equal, sort lexicographically by id for deterministic ordering.
- Timezone for scheduling is stored in UTC; display formatting must use the site locale’s IANA timezone (default `America/Los_Angeles`) with pattern `MMM d, yyyy h:mm a z`. If locale data is missing, fall back to UTC with `UTC` suffix.
- When no content matches (empty homepage or theme preview), the experience must surface a zero-state payload containing `status: "empty"` and `message` guidance for each asset class (home banners, news list, theme preview).

<a id="requirements"></a>
## Requirements (mandatory)

<a id="functional-requirements"></a>
### Functional Requirements
- FR-CMS-001: Articles/news support create, edit, submit for review, approve, publish, unpublish, and archive operations; each transition logs an audit entry capturing actor, timestamp, action, from-status, to-status, and optional notes retained for ≥18 months and viewable by Admin and Compliance roles via audit reporting endpoints.
- FR-CMS-002: Banners support create, edit, publish/unpublish, ordering updates, and schedule windows; overlapping banners resolve by latest `publishedAt` then highest `order` and must specify display targets (homepage, section).
- FR-CMS-003: Themes support create, edit, preview, publish/unpublish with configuration fields for palette, typography, layout slots, and linked asset policies; publishing a theme swaps the active theme within ≤5 minutes.
- FR-CMS-004: Scheduling windows for all content types store `startAt`/`endAt` in UTC, require validation of window integrity, and propagate visibility changes within ≤5 minutes of workflow transitions or schedule updates (stated locally, not only via umbrella spec).
- FR-CMS-005: Preview endpoints enforce Admin-only access per 009-auth-profile roles and must reject Visitor or User roles (or anonymous access) with 403 responses and audit logging.
- FR-CMS-006: Workflow rules follow the Default Policy Table (Draft → Review → Approved → Published) and define rollback/rejection flows, including required messaging and remediation steps when transitions fail.
- FR-CMS-007: Public endpoints must define zero-state responses for articles, banners, and themes, returning `200` with payload `{status:"empty", message:"<actionable guidance>"}` to ensure predictable rendering in downstream clients.

<a id="key-entities"></a>
### Key Entities (include if feature involves data)
- Content: Article/news with title, body, status(enum Draft|Review|Approved|Published|Archived), section, authorId, schedule, audit[] (timestamp, actorId, action, fromStatus, toStatus, notes).
- Banner: Visual unit with media, link, position, order, status(enum Draft|Published), schedule, publishedAt, locale visibility rules.
- Theme: Styling configuration with name, version, palette, typography, layout slots, asset references, preview flag, and audit history mirroring content.

### Access Control Requirements
- Visitor: May read published content only; cannot preview, create, edit, or access CMS management endpoints.
- User: Authenticated end-user (non-admin) may manage personal profile (outside CMS scope) but cannot modify CMS entities or access preview routes.
- Admin: Full CMS control — create, edit, approve, publish/unpublish, archive, and manage content visibility, including preview approvals.
- Preview access relies on temporary header `x-preview-role: admin` during MVP; requirement must track replacement with delegated auth token once 009-auth-profile delivers role claims.
- All access decisions must be documented with traceability back to 009-auth-profile Spec §FR-AUTH-002 (Default Policy Table).

| Workflow State | Default Policy Table Entry | Allowed Roles | Enforced Actions |
| --- | --- | --- | --- |
| Draft | DFT-001 | Admin | create, edit, submit for review, preview |
| Review | RVW-002 | Admin | approve, reject, comment, preview |
| Approved | APR-003 | Admin | publish, request changes |
| Published | PUB-004 | Admin | unpublish, archive, schedule update |
| Archived | ARC-005 | Admin | restore to Draft (with audit) |

### Non-Functional Requirements
- NFR-CMS-001: Propagation of workflow or schedule changes must complete within 5 minutes, with monitoring/alerting when breaches exceed two consecutive intervals.
- NFR-CMS-002: Public GET endpoints (`/cms/articles`, `/cms/banners`, `/cms/themes`) shall maintain P95 latency ≤500ms under baseline load (perf runner SLA).
- NFR-CMS-003: Servers must synchronize clocks via NTP ±2s to prevent schedule drift; the spec must call out remediation when skew exceeds tolerance.
- NFR-CMS-004: Timezone presentation must follow site locale formatting rules, including daylight saving adjustments and fallback to UTC display when locale data is unavailable.
- NFR-CMS-004a: Locale formatting must use IANA timezone identifiers surfaced by the site settings service; formatting library choice and sample patterns must be documented for QA parity.

### Dependencies & Assumptions
- Temporary preview header authentication is a stopgap; requirement includes follow-up to replace with 009-auth-profile issued tokens once available.
- CMS persistence defaults to in-memory but must document parity expectations and migration trigger to Postgres when `CMS_STORE=db` is set, including data seeding and compatibility.
- All audit, workflow, and preview requirements inherit policy nuance from the Default Policy Table; conflicts must be resolved in favor of the umbrella spec with clarifying notes here.
- Authorization ownership remains with 009-auth-profile; this spec defines CMS enforcement points and must not redefine core role semantics.

---

## Review & Acceptance Checklist
- [ ] No implementation details
- [ ] Testable, unambiguous requirements
- [ ] Scope limited to CMS

---

## Execution Status

## Permalinks
- User Scenarios: specs/002-cms/spec.md#user-scenarios
- Acceptance Scenarios: specs/002-cms/spec.md#acceptance-scenarios
- Functional Requirements: specs/002-cms/spec.md#functional-requirements
- Key Entities: specs/002-cms/spec.md#key-entities
- Default Policy Table (umbrella): specs/001-basic-functional-requirements/spec.md#default-policy-table
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
