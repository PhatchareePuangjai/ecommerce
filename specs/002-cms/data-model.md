# Data Model — CMS (002-cms)

## Entities
- Content: id, title, body, status(enum: draft|review|approved|published|archived), section, authorId, schedule{startAt,endAt}, publishedAt?, audit[] (timestamp, actorId, action, fromStatus, toStatus, notes)
- Banner: id, title, mediaUrl, linkUrl, position, order(int), status(enum: draft|published), schedule{startAt,endAt}, publishedAt?, localeVisibility[], audit[]
- Theme: id, name, version, config{palette, typography, layoutSlots, assets[]}, previewFlag, audit[]

## Relationships
- Content authored by users (from 009-auth-profile) via authorId (optional for MVP)
- Banners are independent display units (homepage/section) with ordering

## Validation & Constraints
- Schedule fields are UTC ISO 8601 strings; `endAt` may be null but must not precede `startAt`
- Visibility: item is visible when status=published AND now ∈ [startAt,endAt] (open interval ends if endAt missing); timezone display derived from site locale with DST awareness
- Overlapping banners: resolve by latest publishedAt, then higher order; if both equal, fall back to lexicographic id stability
- Workflow: Draft → Review → Approved → Published (transitions only via workflow service); archive only allowed from Published
- Audit retention: maintain audit entries for minimum 18 months; purge policy requires downstream export before deletion
- Audit visibility: expose audit[] via admin/compliance reporting endpoints; prevent modification post-write
- Clock sync: schedule evaluation assumes server time within ±2s of NTP; skew detection must flag items for re-evaluation

## State Transitions
- Content.status: draft → review → approved → published → archived → draft (restore workflow)
- Banner.status: draft → published
