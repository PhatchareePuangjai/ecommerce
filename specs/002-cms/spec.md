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
2. Extract actors: Admin, Content Editor, Visitor
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
Admins and Content Editors manage site themes, banners, and news/articles with preview and scheduling.

<a id="acceptance-scenarios"></a>
### Acceptance Scenarios
1. Given a scheduled banner, When the start time passes, Then it appears on the homepage within 5 minutes and hides after end time.
2. Given a draft article, When preview is opened, Then only authorized preview roles can view it and it is not public (see Default Policy Table in umbrella spec).
3. Given an article in Review, When Approved and Published, Then it becomes visible and appears in the correct section per the configured workflow (see Default Policy Table in umbrella spec).

### Edge Cases
- Overlapping banner schedules prioritize by most recent publish time.
- Timezone for scheduling stored in UTC, displayed in site locale.

<a id="requirements"></a>
## Requirements (mandatory)

<a id="functional-requirements"></a>
### Functional Requirements
- FR-CMS-001: Manage themes, banners, and articles/news with create/edit/publish/unpublish.
- FR-CMS-002: Support scheduling windows for content visibility (start/end) within the propagation time defined in the Default Policy Table (umbrella spec).
- FR-CMS-003: Provide preview visible only to configured preview roles (Default Policy Table).
- FR-CMS-004: Content workflow follows Default Policy Table (Draft → Review → Approved → Published) with audit trail.
- FR-CMS-005: Homepage banners support ordering and visibility windows.

<a id="key-entities"></a>
### Key Entities (include if feature involves data)
- Content: Article/news with title, body, status, schedule.
- Banner: Visual unit with media, link, position, schedule.
- Theme: Styling configuration and assets.

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
