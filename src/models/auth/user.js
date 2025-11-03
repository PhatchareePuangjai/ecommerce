const crypto = require('crypto');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Create a user aggregate root with default auth state.
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string|null} [params.firstName]
 * @param {string|null} [params.lastName]
 * @param {Date} [params.now]
 * @returns {object}
 */
function createUser({ email, passwordHash, firstName = null, lastName = null, now = new Date() }) {
  if (!email) {
    throw new Error('email required');
  }
  if (!passwordHash) {
    throw new Error('passwordHash required');
  }

  const timestamp = now;
  return {
    id: crypto.randomUUID(),
    email: normalizeEmail(email),
    passwordHash,
    firstName,
    lastName,
    isVerified: false,
    verificationIssuedAt: timestamp,
    lockedUntil: null,
    failedLoginCount: 0,
    defaultPaymentTokenId: null,
    addresses: [],
    auditLog: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

module.exports = {
  createUser,
  normalizeEmail
};
