const crypto = require('crypto');

const TOKEN_PURPOSES = {
  VERIFY: 'verify',
  RESET: 'reset'
};

function createToken({ userId, purpose, tokenValue, issuedAt, expiresAt }) {
  if (!userId) {
    throw new Error('userId required');
  }
  if (!purpose) {
    throw new Error('purpose required');
  }
  if (!tokenValue) {
    throw new Error('tokenValue required');
  }

  return {
    id: crypto.randomUUID(),
    userId,
    purpose,
    token: tokenValue,
    issuedAt,
    expiresAt,
    consumedAt: null
  };
}

function markTokenConsumed(record, at) {
  return {
    ...record,
    consumedAt: at
  };
}

module.exports = {
  TOKEN_PURPOSES,
  createToken,
  markTokenConsumed
};
