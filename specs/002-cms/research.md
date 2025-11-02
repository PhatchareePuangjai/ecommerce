# Phase 0 Research — CMS (002-cms)

## Decisions (to confirm)
- Preview Access: Temporarily via header `x-preview-role: admin` until 009-auth-profile provides role claims; checklist follow-up created to replace header with delegated token.
- Scheduling: Store `schedule.startAt` and `schedule.endAt` in UTC (ISO 8601). Visibility determined on read via scheduling service; no background scheduler for MVP. Propagation SLA ≤5 minutes with monitoring.
- Workflow: Draft → Review → Approved → Published. Transitions gated via workflow service with audit entries containing actor, timestamps, from/to status, and notes kept ≥18 months.
- Banner Priority: Overlapping banners resolved by latest `publishedAt`; tie-break by higher `order` value, then stable lexicographic id.
- Theme Config: Themes publish palette, typography, layout slots, and asset policy metadata, with preview flag support.

## Open Questions
- Auth Integration: Map Admin role claim from 009-auth-profile into CMS tokens (JWT claims vs delegated header) — follow-up required for replacing temporary header.
- Audit Storage: Separate audit table vs. embedded `audit[]` array on entity. MVP: embed array.
- Theme Assets: Will theme config reference static assets (CDN) or inline JSON only for MVP?
- Monitoring: Define alert destinations when propagation breaches SLA twice consecutively.
- Coordination Needed:
  - Auth/Profile (009): Deliver role claim shape and preview token flow to replace `x-preview-role` header; schedule joint design review.
  - Ops/Observability: Configure SLA breach alert (≤5 minute propagation) with pager/on-call routing; document runbook expectations.
- Coordination Plan:
  1. Draft integration brief outlining required Admin claim format, token TTL, and preview scope mapping; share with 009-auth-profile by 2025-11-05.
  2. Host joint design review (CMS + Auth) to finalize token exchange and migration timeline; target week of 2025-11-10.
  3. Update CMS OpenAPI once claims finalized; replace temporary header in code/tests; track via follow-up tasks.

## Constraints (from umbrella)
- Propagation: Content visibility changes reflect within ≤ 5 minutes.
- Accessibility: WCAG 2.1 AA applies to presentation components (outside API scope but influences content structure fields).

## Risks
- Clock Skew: Rely on server time for schedule checks; document requirement to sync time.
- Future DB: In-memory for tests; plan for Postgres tables later (content, banners, themes).

---
