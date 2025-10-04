# Phase 0 Research — Basic Functional Requirements (Umbrella)

## Decisions
- Payments: Stripe only with single CTA; express wallet when available, otherwise card.
- Address Validation: Postal service validation with hard fail on mismatch.
- Orders: Cancel until shipped; returns within 30 days; no exchanges (return + reorder).
- Notifications: Provider handoff ≤ 5 minutes; end-user delivery depends on provider SLA; promotional emails OFF.
- Status Reflection: Order/shipping status reflected in system within ≤ 1 minute of event.
- Accessibility: WCAG 2.1 AA.

## Rationale
Centralized defaults reduce inconsistency across epics and enable measurable acceptance criteria. Policies match common e-commerce expectations and simplify implementation (e.g., Stripe-only).

## Alternatives Considered
- Multiple payment methods (Stripe + PayPal): Rejected to keep a single, easy payment path.
- Address override on validation: Rejected to reduce delivery failures and chargebacks.
- Exchanges flow: Rejected for v1 simplicity; returns + reorder is simpler operationally.

## Open Research (Deferred to Epics)
- Identity & uniqueness rules (SKU format, product code policy, user email uniqueness).
- Rate limiting & throttling standards per API gateway.
- External provider failure modes (retry/backoff, idempotency keys) details.

