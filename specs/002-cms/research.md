# Phase 0 Research — CMS (002-cms)

## Decisions (to confirm)
- Preview Access: Temporarily via header `x-preview-role: editor|admin` until 009-auth-profile provides roles.
- Scheduling: Store `schedule.startAt` and `schedule.endAt` in UTC (ISO 8601). Visibility determined on read via scheduling service; no background scheduler for MVP.
- Workflow: Draft → Review → Approved → Published. Transitions gated via workflow service with audit entries.
- Banner Priority: Overlapping banners resolved by latest `publishedAt`; tie-break by higher `order` field.

## Open Questions
- Auth Integration: Map preview roles to auth system (009-auth-profile). How are roles propagated (JWT claims, session, header)?
- Audit Storage: Separate audit table vs. embedded `audit[]` array on entity. MVP: embed array.
- Theme Assets: Will theme config reference static assets (CDN) or inline JSON only for MVP?

## Constraints (from umbrella)
- Propagation: Content visibility changes reflect within ≤ 5 minutes.
- Accessibility: WCAG 2.1 AA applies to presentation components (outside API scope but influences content structure fields).

## Risks
- Clock Skew: Rely on server time for schedule checks; document requirement to sync time.
- Future DB: In-memory for tests; plan for Postgres tables later (content, banners, themes).

---

