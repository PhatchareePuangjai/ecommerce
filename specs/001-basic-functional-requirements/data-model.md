# Data Model — Basic Functional Requirements (Umbrella)

This umbrella captures shared entities and relationships. Epics may extend these.

## Entities
- Product: id, sku, name, description, images[], price, attributes{}, status, createdAt, updatedAt
- Category: id, name, slug, parentId?, seo{title,meta,canonical,noindex}
- Variant/SKU: id, productId, options{size,color,...}, price, stockQty, warehouseId?
- Cart: id, userId?, sessionId?, items[], subtotal, discounts[], total, updatedAt
- CartItem: id, cartId, skuId, quantity, unitPrice
- Wishlist: id, userId, items[]
- Order: id, userId?, email, addresses{shipping,billing}, items[], totals{}, paymentStatus, shippingMethod, statusTimeline[], createdAt
- OrderItem: id, orderId, skuId, quantity, unitPrice, discounts[]
- User: id, email, passwordHash, name, phone?, verified, roles[]
- Address: id, userId?, name, line1, line2?, city, region, postalCode, country, phone?
- Payment: id, orderId, provider, status, amount, currency, providerRef
- Shipment: id, orderId, carrier, method, trackingNumber?, status
- Review: id, productId, userId?, orderItemId, rating(1–5), text, status

## Relationships
- Product 1—* Variant/SKU
- Category 1—* Category (self), Category 1—* Product (through join)
- User 1—* Address, User 1—* Order, User 1—* Wishlist
- Cart 1—* CartItem; Order 1—* OrderItem; Order 1—* Shipment; Order 1—* Payment
- Review links Product + (optional) User + OrderItem

## Validation & Constraints (from policy)
- Email unique per User; verified before ordering
- Address must pass postal service validation (hard fail) at checkout
- Out-of-stock policy: show in search with label; block add-to-cart if qty exceeded
- Returns: within 30 days of delivery; no exchanges
- Cancellations: allowed until shipped

## State Transitions
- Order.status: Pending Payment → Processing → Shipped → Delivered → (Cancelled|Returned|Partially Refunded)
- Review.status: pending → (approved|rejected)

