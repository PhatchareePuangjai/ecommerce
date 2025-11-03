# Data Model — Auth & Profile (009)

## Entities

### User
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Internal identifier |
| `email` | string | Lower-cased, unique, RFC 5321/5322 validated |
| `passwordHash` | string | bcrypt hash (cost 12) |
| `isVerified` | boolean | True after successful verification |
| `verificationIssuedAt` | datetime (UTC) | Timestamp of latest verification token |
| `lockedUntil` | datetime (UTC) \| null | Lockout window end (null when not locked) |
| `failedLoginCount` | integer | Rolling counter reset on successful login |
| `createdAt` / `updatedAt` | datetime (UTC) | Audit timestamps |
| `addresses` | Address[] | Embedded collection (max 5) |
| `defaultPaymentTokenId` | string \| null | Optional reference to Payment Token |
| `auditLog` | [{ at, actor, action, meta }] | Minimal audit trail for security events |

Constraints:
- Email unique across users.  
- Password policy enforced before hash stored.  
- Unverified users blocked from checkout (downstream guard).  
- `addresses.length ≤ 5`.

### Address
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Unique per address |
| `label` | string | Friendly name (e.g., "Home") |
| `recipient` | string | Person receiving shipment |
| `line1` | string | Required |
| `line2` | string \| null | Optional |
| `city` | string | Required |
| `state` | string | Region/province |
| `postalCode` | string | Format validation per country |
| `country` | string (ISO 3166-1 alpha-2) | Required |
| `phone` | string \| null | Optional contact |
| `isDefaultShipping` | boolean | Only one address per user may be true |
| `createdAt` / `updatedAt` | datetime (UTC) | Audit timestamps |

Constraints:
- Normalized to uppercase country codes.  
- Validation ensures all required fields present; default shipping uniqueness enforced at service layer.

### VerificationToken
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Token identifier provided in verification email |
| `userId` | UUID | Owning user |
| `token` | string | Random opaque string (32+ chars) |
| `purpose` | enum(`verify`) | Future-proofing for multi-purpose tokens |
| `issuedAt` | datetime (UTC) | Creation timestamp |
| `expiresAt` | datetime (UTC) | `issuedAt + 2h` per Default Policy |
| `consumedAt` | datetime (UTC) \| null | Set when successfully used |

Constraints:
- Single active verification token per user; issuing new token invalidates prior.  
- Token cannot be reused after `consumedAt` or expiry.

### ResetToken
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Identifier |
| `userId` | UUID | Reference to user |
| `token` | string | Secure random |
| `issuedAt` | datetime (UTC) | Creation time |
| `expiresAt` | datetime (UTC) | `issuedAt + 2h` |
| `consumedAt` | datetime (UTC) \| null | Tracks successful usage |

Constraints:
- Only one active reset token per user; new request revokes previous tokens.  
- Reset completion resets `failedLoginCount` and clears lockout state.

### Session
| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Internal tracking id |
| `userId` | UUID | Associated user |
| `jwtId` | string | `jti` claim tracked for revocation |
| `issuedAt` | datetime (UTC) | Token issue time |
| `expiresAt` | datetime (UTC) | 15-minute default TTL |
| `revokedAt` | datetime (UTC) \| null | Set on logout or forced invalidation |
| `userAgent` | string \| null | Optional client metadata |
| `ip` | string \| null | Recorded for security monitoring |

Constraints:
- Logout marks session revoked; middleware must reject revoked `jti`.  
- Session store retains revoked tokens until expiry to prevent reuse.

### PaymentToken (placeholder)
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stripe token id reference |
| `userId` | UUID | Associated user |
| `label` | string \| null | Friendly name |
| `brand` | string \| null | e.g., Visa |
| `last4` | string | Last four digits |
| `createdAt` | datetime (UTC) | Timestamp |

Constraints:
- Stored as reference only; sensitive data remains with Stripe.  
- Future integration; for this epic we only persist tokens linked to user preferences.

## Relationships
- `User` 1—* `Address` (embedded collection).  
- `User` 1—1 `VerificationToken` (active) / 1—1 `ResetToken` (active).  
- `User` 1—* `Session`.  
- `User` 1—* `PaymentToken` (future).  
- Tokens and sessions reference `userId`; cascading delete removes associated records on user purge.

## Storage Strategy
- Default implementation: in-memory repositories (`Map`) for users, tokens, sessions, and addresses.  
- Configurable adapter interface to swap to Postgres (users, addresses) and Redis (tokens, sessions).  
- Persistence migration triggered via `AUTH_STORE=db` runtime flag; migration docs to outline schema parity.

## Derived / Computed Data
- `User.isLocked(now)` computed from `lockedUntil` compared to current time.  
- `Address.isDefaultShipping` ensures exactly one default; derived getter may compute fallback to first address.  
- `Session.isActive(now)` derived from `revokedAt` and `expiresAt`.  
- Password policy errors enumerate missing requirements for client display.
