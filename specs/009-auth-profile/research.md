# Research — Auth & Profile (009)

## Default Policy Table References
- **Password policy** (Umbrella FR-021 / Default Policy DFT-AUTH-01): minimum 8 characters, must include mixed case or numeric character.  
- **Login lockout** (Default Policy LOCK-005): after 5 failed attempts within 15 minutes, user account enters 15-minute lockout window; successful login resets counter.  
- **Email verification** (Default Policy VERIFY-003): registration response issues verification challenge; all order-related endpoints must reject unverified users.  
- **Password reset tokens** (Default Policy RESET-004): token validity 2 hours; single-use; requesting a new token invalidates prior tokens.

## Assumptions & Decisions
- **Token storage**: MVP uses in-memory map keyed by token id with created/expiry timestamps. Provide adapter interface to swap for Redis/Postgres when `AUTH_STORE=db`.  
- **Email transport**: Use nodemailer-style transport abstraction. Tests stub with in-memory collector; production wiring deferred.  
- **Session tokens**: Short-lived JWT (default 15 minutes) with refresh handled by future epic; store revoked token ids until expiry.  
- **Address management**: Limit 5 saved addresses per user; enforce default shipping flag uniqueness.  
- **Password hashing**: `bcrypt` with cost factor 12; ensure async usage to avoid event loop blocking.

## Open Questions / Follow-ups
1. Confirm whether verification emails require branded templates or plain text is acceptable for MVP.  
2. Determine persistence migration trigger (user count threshold vs configuration flag) and data seeding expectations.  
3. Clarify if login lockout state must persist across restarts when using in-memory store (likely yes → document limitation).  
4. Decide on audit logging schema once analytics/observability team provides format (tie-in with CMS logging).  
5. Align on session revocation strategy for logout (blacklist vs token versioning) before production release.
