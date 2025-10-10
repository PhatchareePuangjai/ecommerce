# Data Model — CMS (002-cms)

## Entities
- Content: id, title, body, status(enum: draft|review|approved|published), section, authorId?, schedule{startAt,endAt}, publishedAt?, audit[]
- Banner: id, title, mediaUrl, linkUrl, position, order(int), status(enum: draft|published), schedule{startAt,endAt}, publishedAt?
- Theme: id, name, config{}

## Relationships
- Content authored by users (from 009-auth-profile) via authorId (optional for MVP)
- Banners are independent display units (homepage/section) with ordering

## Validation & Constraints
- Schedule fields are UTC ISO 8601 strings; endAt may be null
- Visibility: item is visible when status=published AND now ∈ [startAt,endAt] (open interval ends if endAt missing)
- Overlapping banners: resolve by latest publishedAt, then higher order
- Workflow: Draft → Review → Approved → Published (transitions only via workflow service)

## State Transitions
- Content.status: draft → review → approved → published
- Banner.status: draft → published

