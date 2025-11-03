const crypto = require('crypto');
const db = require('../../db');
const { normalizeEmail } = require('../../models/auth/user');

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    isVerified: row.is_verified,
    verificationIssuedAt: new Date(row.verification_issued_at),
    lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
    failedLoginCount: row.failed_login_count,
    defaultPaymentTokenId: row.default_payment_token_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapVerificationToken(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    issuedAt: new Date(row.issued_at),
    expiresAt: new Date(row.expires_at),
    consumedAt: row.consumed_at ? new Date(row.consumed_at) : null
  };
}

async function createUser({ email, passwordHash, firstName = null, lastName = null, now = new Date() }) {
  const id = crypto.randomUUID();
  const normalizedEmail = normalizeEmail(email);
  const verificationIssuedAt = now;
  const params = [
    id,
    normalizedEmail,
    passwordHash,
    firstName,
    lastName,
    false,
    verificationIssuedAt,
    null,
    0,
    null,
    now,
    now
  ];
  const { rows } = await db.query(
    `INSERT INTO auth_users (
      id, email, password_hash, first_name, last_name, is_verified,
      verification_issued_at, locked_until, failed_login_count,
      default_payment_token_id, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    params
  );
  return mapUser(rows[0]);
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const { rows } = await db.query('SELECT * FROM auth_users WHERE email = $1 LIMIT 1', [normalizedEmail]);
  return mapUser(rows[0]);
}

async function getUserById(id) {
  const { rows } = await db.query('SELECT * FROM auth_users WHERE id = $1 LIMIT 1', [id]);
  return mapUser(rows[0]);
}

async function markUserVerified(userId, at = new Date()) {
  const { rows } = await db.query(
    'UPDATE auth_users SET is_verified = $2, verification_issued_at = $3, updated_at = $3 WHERE id = $1 RETURNING *',
    [userId, true, at]
  );
  return mapUser(rows[0]);
}

async function updateLockout(userId, { failedLoginCount, lockedUntil }) {
  const updatedAt = new Date();
  const { rows } = await db.query(
    'UPDATE auth_users SET failed_login_count = $2, locked_until = $3, updated_at = $4 WHERE id = $1 RETURNING *',
    [userId, failedLoginCount, lockedUntil, updatedAt]
  );
  return mapUser(rows[0]);
}

async function replaceVerificationToken({ userId, token, issuedAt, expiresAt }) {
  const id = crypto.randomUUID();
  await db.query('DELETE FROM auth_verification_tokens WHERE user_id = $1', [userId]);
  await db.query(
    `INSERT INTO auth_verification_tokens
      (id, user_id, token, issued_at, expires_at, consumed_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, userId, token, issuedAt, expiresAt, null]
  );
  return { id, userId, token, issuedAt, expiresAt, consumedAt: null };
}

async function findVerificationToken(token) {
  const { rows } = await db.query('SELECT * FROM auth_verification_tokens WHERE token = $1 LIMIT 1', [token]);
  return mapVerificationToken(rows[0]);
}

async function markTokenConsumed(id, consumedAt) {
  const { rows } = await db.query(
    'UPDATE auth_verification_tokens SET consumed_at = $2 WHERE id = $1 RETURNING *',
    [id, consumedAt]
  );
  return mapVerificationToken(rows[0]);
}

async function deleteVerificationToken(id) {
  await db.query('DELETE FROM auth_verification_tokens WHERE id = $1', [id]);
}

function mapResetToken(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    issuedAt: new Date(row.issued_at),
    expiresAt: new Date(row.expires_at),
    consumedAt: row.consumed_at ? new Date(row.consumed_at) : null
  };
}

async function replaceResetToken({ userId, token, issuedAt, expiresAt }) {
  const id = crypto.randomUUID();
  await db.query('DELETE FROM auth_reset_tokens WHERE user_id = $1', [userId]);
  await db.query(
    `INSERT INTO auth_reset_tokens
      (id, user_id, token, issued_at, expires_at, consumed_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, userId, token, issuedAt, expiresAt, null]
  );
  return { id, userId, token, issuedAt, expiresAt, consumedAt: null };
}

async function findResetToken(token) {
  const { rows } = await db.query('SELECT * FROM auth_reset_tokens WHERE token = $1 LIMIT 1', [token]);
  return mapResetToken(rows[0]);
}

async function markResetTokenConsumed(id, consumedAt) {
  const { rows } = await db.query(
    'UPDATE auth_reset_tokens SET consumed_at = $2 WHERE id = $1 RETURNING *',
    [id, consumedAt]
  );
  return mapResetToken(rows[0]);
}

async function deleteResetToken(id) {
  await db.query('DELETE FROM auth_reset_tokens WHERE id = $1', [id]);
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    jwtId: row.jwt_id,
    issuedAt: new Date(row.issued_at),
    expiresAt: new Date(row.expires_at),
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    userAgent: row.user_agent,
    ip: row.ip
  };
}

async function createSession(session) {
  await db.query(
    `INSERT INTO auth_sessions
      (id, user_id, jwt_id, issued_at, expires_at, revoked_at, user_agent, ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      session.id,
      session.userId,
      session.jwtId,
      session.issuedAt,
      session.expiresAt,
      session.revokedAt,
      session.userAgent,
      session.ip
    ]
  );
  return session;
}

async function findSessionByToken(token) {
  const { rows } = await db.query('SELECT * FROM auth_sessions WHERE jwt_id = $1 LIMIT 1', [token]);
  return mapSession(rows[0]);
}

async function revokeSession(token, revokedAt = new Date()) {
  const { rowCount } = await db.query(
    'UPDATE auth_sessions SET revoked_at = $2 WHERE jwt_id = $1 AND revoked_at IS NULL',
    [token, revokedAt]
  );
  return rowCount > 0;
}

async function updatePasswordHash(userId, passwordHash) {
  const updatedAt = new Date();
  const { rows } = await db.query(
    `UPDATE auth_users
       SET password_hash = $2,
           updated_at = $3,
           failed_login_count = 0,
           locked_until = NULL
     WHERE id = $1 RETURNING *`,
    [userId, passwordHash, updatedAt]
  );
  return mapUser(rows[0]);
}

function mapAddress(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    recipient: row.recipient,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    isDefaultShipping: row.is_default_shipping,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

async function listAddresses(userId) {
  const { rows } = await db.query('SELECT * FROM auth_addresses WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
  return rows.map(mapAddress);
}

async function addAddress(userId, address) {
  if (address.isDefaultShipping) {
    await db.query('UPDATE auth_addresses SET is_default_shipping = false WHERE user_id = $1', [userId]);
  }
  const { rows } = await db.query(
    `INSERT INTO auth_addresses
      (id, user_id, label, recipient, line1, line2, city, state, postal_code, country, phone, is_default_shipping, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      address.id,
      userId,
      address.label,
      address.recipient,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
      address.phone,
      address.isDefaultShipping,
      address.createdAt,
      address.updatedAt
    ]
  );
  return mapAddress(rows[0]);
}

async function removeAddress(userId, addressId) {
  const { rowCount } = await db.query('DELETE FROM auth_addresses WHERE user_id = $1 AND id = $2', [userId, addressId]);
  return rowCount > 0;
}

async function updateProfile(userId, payload) {
  const current = await getUserById(userId);
  if (!current) return null;

  const next = {
    firstName: Object.prototype.hasOwnProperty.call(payload, 'firstName') ? payload.firstName : current.firstName,
    lastName: Object.prototype.hasOwnProperty.call(payload, 'lastName') ? payload.lastName : current.lastName,
    defaultPaymentTokenId: Object.prototype.hasOwnProperty.call(payload, 'defaultPaymentTokenId')
      ? (payload.defaultPaymentTokenId === undefined ? current.defaultPaymentTokenId : payload.defaultPaymentTokenId)
      : current.defaultPaymentTokenId
  };

  const updatedAt = new Date();
  const { rows } = await db.query(
    `UPDATE auth_users
        SET first_name = $2,
            last_name = $3,
            default_payment_token_id = $4,
            updated_at = $5
      WHERE id = $1 RETURNING *`,
    [userId, next.firstName, next.lastName, next.defaultPaymentTokenId, updatedAt]
  );
  return mapUser(rows[0]);
}

function resetForTest() {
  if (typeof db.__resetAuth === 'function') {
    db.__resetAuth();
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  markUserVerified,
  updateLockout,
  replaceVerificationToken,
  findVerificationToken,
  markTokenConsumed,
  deleteVerificationToken,
  replaceResetToken,
  findResetToken,
  markResetTokenConsumed,
  deleteResetToken,
  createSession,
  findSessionByToken,
  revokeSession,
  updatePasswordHash,
  listAddresses,
  addAddress,
  removeAddress,
  updateProfile,
  resetForTest
};
