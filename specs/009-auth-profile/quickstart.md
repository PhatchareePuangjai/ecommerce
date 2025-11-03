# Quickstart — Auth & Profile (009)

## Scenario 1 — Register → Verify → Login (Happy Path)
1. **Register**
   ```bash
   curl -i -X POST http://localhost:3000/auth/register \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "pat@example.com",
       "password": "Secure123",
       "firstName": "Pat",
       "lastName": "Lee"
     }'
   ```
   **Expected**: `201 Created` with payload  
   ```json
   {
     "id": "user_123",
     "email": "pat@example.com",
     "isVerified": false,
     "verification": {
       "status": "pending",
       "expiresAt": "2025-11-02T20:00:00.000Z"
     }
   }
   ```
   Verification email is simulated. During local development, inspect `app.locals.mailbox` (or the in-memory test mailbox) to read the latest verification token. In shared dev/staging, query `auth_verification_tokens` for the user's token.

2. **Submit verification token**
   ```bash
   curl -i -X POST http://localhost:3000/auth/verify \
     -H 'Content-Type: application/json' \
     -d '{
       "token": "verify-token-from-email"
     }'
   ```
   **Expected**: `204 No Content`. Subsequent `GET /profile` reflects `isVerified: true`.

3. **Login**
   ```bash
   curl -i -X POST http://localhost:3000/auth/login \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "pat@example.com",
       "password": "Secure123"
     }'
   ```
   **Expected**: `200 OK` with session payload  
   ```json
   {
     "accessToken": "jwt-access-token",
     "tokenType": "Bearer",
     "expiresIn": 900
   }
   ```
   Reuse `accessToken` in the `Authorization: Bearer <token>` header for subsequent profile and address endpoints.

## Scenario 2 — Password Reset
1. **Request reset**
   ```bash
   curl -i -X POST http://localhost:3000/auth/password/forgot \
     -H 'Content-Type: application/json' \
     -d '{ "email": "pat@example.com" }'
   ```
   **Expected**: `202 Accepted`. Response omits whether user exists. For local dev read the token from `app.locals.mailbox` (type `reset`); in shared environments query `auth_reset_tokens`.

2. **Submit new password**
   ```bash
   curl -i -X POST http://localhost:3000/auth/password/reset \
     -H 'Content-Type: application/json' \
     -d '{
       "token": "reset-token-from-email",
       "newPassword": "Another123"
     }'
   ```
   **Expected**: `204 No Content`. Failed login counter cleared and lockout lifted.

## Scenario 3 — Manage Profile & Addresses
1. **Fetch profile**
   ```bash
   curl -i http://localhost:3000/profile \
     -H 'Authorization: Bearer jwt-access-token'
   ```
   **Expected**: `200 OK`  
   ```json
   {
     "id": "user_123",
     "email": "pat@example.com",
     "isVerified": true,
     "addresses": [],
     "defaultPaymentTokenId": null
   }
   ```

2. **Add address**
   ```bash
   curl -i -X POST http://localhost:3000/profile/addresses \
     -H 'Authorization: Bearer jwt-access-token' \
     -H 'Content-Type: application/json' \
     -d '{
       "label": "Home",
       "recipient": "Pat Lee",
       "line1": "123 Market St",
       "city": "San Francisco",
       "state": "CA",
       "postalCode": "94105",
       "country": "US",
       "isDefaultShipping": true
     }'
   ```
   **Expected**: `201 Created`  
   ```json
   {
     "id": "addr_001",
     "label": "Home",
     "isDefaultShipping": true
   }
   ```

3. **Update profile names / payment token**
   ```bash
   curl -i -X PUT http://localhost:3000/profile \
     -H 'Authorization: Bearer jwt-access-token' \
     -H 'Content-Type: application/json' \
     -d '{
       "firstName": "Patricia",
       "lastName": "Lee",
       "defaultPaymentTokenId": "tok_test_123"
     }'
   ```
   **Expected**: `200 OK` with updated profile snapshot.

4. **Delete address**
   ```bash
   curl -i -X DELETE http://localhost:3000/profile/addresses/addr_001 \
     -H 'Authorization: Bearer jwt-access-token'
   ```
   **Expected**: `204 No Content`. Removing last default requires next addition to set `isDefaultShipping`.

## Scenario 4 — Lockout & Recovery
1. Trigger five failed logins with incorrect password → expect `403` on the fifth attempt with payload:
   ```json
   {
     "error": "account_locked",
     "retryAfter": 900
   }
   ```
2. Wait 15 minutes or perform the password reset flow (Scenario 2) to unlock the account. Successful reset clears the lockout counter and invalidates the old password.
