# Feature Specification: Cart & Wishlist

**Feature Branch**: `005-cart-wishlist`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: Derived from umbrella spec: ../001-basic-functional-requirements/spec.md

## Related Specs
- Umbrella: /Users/toy/Desktop/learn/AI/demo-api/specs/001-basic-functional-requirements/spec.md
- Depends on: /Users/toy/Desktop/learn/AI/demo-api/specs/008-inventory-warehousing/spec.md, /Users/toy/Desktop/learn/AI/demo-api/specs/009-auth-profile/spec.md

## Execution Flow (main)
```
1. Parse Input and scope boundaries
2. Extract actors: Visitor, Registered User
3. Generate user scenarios and testable requirements
4. Identify entities (Cart, Cart Item, Wishlist)
5. Review checklist
```

---

## ⚡ Quick Guidelines
- Focus on cart operations, persistence, Save‑for‑Later, limits
- Excludes payment and order creation

<a id="user-scenarios"></a>
## User Scenarios & Testing (mandatory)

### Primary User Story
Users add products to cart, adjust quantities, remove items, and manage a wishlist.

<a id="acceptance-scenarios"></a>
### Acceptance Scenarios
1. Given a product with stock S, When adding quantity Q, Then cart accepts if Q ≤ S and shows error if Q > S; totals update immediately.
2. Given a signed‑in user, When items are saved for later, Then they persist per the Save‑for‑Later policy in the Default Policy Table (umbrella spec) and remain separate from cart items.
3. Given a guest user, When items are added, Then cart persistence and cleanup follow the Default Policy Table; signed‑in carts sync across devices.

### Edge Cases
- Limits enforced: max 100 items in cart, 100 per order, max qty 50 per line; wishlist max 200 items.

<a id="requirements"></a>
## Requirements (mandatory)

<a id="functional-requirements"></a>
### Functional Requirements
- FR-CART-001: Add, remove, and update item quantities; realtime total updates.
- FR-CART-002: Enforce stock constraints at add/update time.
- FR-CART-003: Save‑for‑Later policy follows the Default Policy Table; unavailable for guests in v1.
- FR-CART-004: Persistence rules (guest/signed‑in, cleanup) follow the Default Policy Table.
- FR-CART-005: Enforce limits per the Default Policy Table (cart items, per‑line max, wishlist max).

<a id="key-entities"></a>
### Key Entities (include if feature involves data)
- Cart, Cart Item, Wishlist

---

## Review & Acceptance Checklist
- [ ] No implementation details
- [ ] Testable, unambiguous requirements
- [ ] Scope limited to Cart/Wishlist

---

## Execution Status

## Permalinks
- User Scenarios: specs/005-cart-wishlist/spec.md#user-scenarios
- Acceptance Scenarios: specs/005-cart-wishlist/spec.md#acceptance-scenarios
- Functional Requirements: specs/005-cart-wishlist/spec.md#functional-requirements
- Key Entities: specs/005-cart-wishlist/spec.md#key-entities
- Default Policy Table (umbrella): specs/001-basic-functional-requirements/spec.md#default-policy-table
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
