const crypto = require('crypto');

const DEFAULT_TTL_SECONDS = 900;

function createSessionService({ store, clock = () => new Date(), ttlSeconds = DEFAULT_TTL_SECONDS } = {}) {
  if (!store || typeof store.createSession !== 'function') {
    throw new Error('store.createSession is required');
  }
  if (typeof store.findSessionByToken !== 'function') {
    throw new Error('store.findSessionByToken is required');
  }
  if (typeof store.revokeSession !== 'function') {
    throw new Error('store.revokeSession is required');
  }

  return {
    async issue(userId, metadata = {}) {
      const now = clock();
      const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
      const token = crypto.randomBytes(32).toString('hex');

      await store.createSession({
        id: crypto.randomUUID(),
        userId,
        jwtId: token,
        issuedAt: now,
        expiresAt,
        revokedAt: null,
        userAgent: metadata.userAgent || null,
        ip: metadata.ip || null
      });

      return {
        token,
        expiresIn: ttlSeconds,
        expiresAt
      };
    },

    async validate(token) {
      const record = await store.findSessionByToken(token);
      if (!record) return null;

      const now = clock();
      const expiresAt = record.expiresAt instanceof Date ? record.expiresAt : new Date(record.expiresAt);
      const revokedAt = record.revokedAt ? (record.revokedAt instanceof Date ? record.revokedAt : new Date(record.revokedAt)) : null;

      if (revokedAt || expiresAt <= now) {
        return null;
      }

      return record;
    },

    async revoke(token) {
      const now = clock();
      return store.revokeSession(token, now);
    }
  };
}

module.exports = {
  createSessionService,
  DEFAULT_TTL_SECONDS
};
