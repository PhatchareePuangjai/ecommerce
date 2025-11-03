const crypto = require('crypto');

const TOKEN_TTL_MINUTES = 120;

class VerificationError extends Error {
  constructor(message = 'invalid_token') {
    super(message);
    this.name = 'VerificationError';
  }
}

const defaultClock = () => new Date();

/**
 * Create verification service backed by token repository.
 * @param {object} deps
 * @param {{ sendVerification(payload: { email: string, token: string, expiresAt: Date }): Promise<void> }} deps.mailer
 * @param {{
 *   replaceVerificationToken(params: { userId: string, token: string, issuedAt: Date, expiresAt: Date }): Promise<void>,
 *   findVerificationToken(token: string): Promise<object|null>,
 *   markTokenConsumed(id: string, consumedAt: Date): Promise<object|null>,
 *   deleteVerificationToken(id: string): Promise<void>
 * }} deps.tokenStore
 * @param {() => Date} [deps.clock]
 * @returns {{ issue({userId, email}): Promise<{ token: string, expiresAt: Date }>, verify(token: string): Promise<{userId: string}> }}
 */
function createVerificationService({ mailer, tokenStore, clock = defaultClock } = {}) {
  if (!mailer || typeof mailer.sendVerification !== 'function') {
    throw new Error('mailer.sendVerification is required');
  }
  if (
    !tokenStore ||
    typeof tokenStore.replaceVerificationToken !== 'function' ||
    typeof tokenStore.findVerificationToken !== 'function' ||
    typeof tokenStore.markTokenConsumed !== 'function' ||
    typeof tokenStore.deleteVerificationToken !== 'function'
  ) {
    throw new Error('tokenStore with verification methods is required');
  }

  const ttlMs = TOKEN_TTL_MINUTES * 60 * 1000;

  return {
    async issue({ userId, email }) {
      if (!userId) {
        throw new Error('userId required');
      }
      if (!email) {
        throw new Error('email required');
      }

      const now = clock();
      const expiresAt = new Date(now.getTime() + ttlMs);
      const token = crypto.randomBytes(32).toString('hex');

      await tokenStore.replaceVerificationToken({
        userId,
        token,
        issuedAt: now,
        expiresAt
      });

      await mailer.sendVerification({ email, token, expiresAt });

      return { token, expiresAt };
    },

    async verify(token) {
      const record = await tokenStore.findVerificationToken(token);
      if (!record) {
        throw new VerificationError();
      }

      const now = clock();

      const expiresAt = record.expiresAt instanceof Date ? record.expiresAt : new Date(record.expiresAt);
      const consumedAt = record.consumedAt instanceof Date ? record.consumedAt : record.consumedAt ? new Date(record.consumedAt) : null;

      if (consumedAt || expiresAt <= now) {
        await tokenStore.deleteVerificationToken(record.id);
        throw new VerificationError();
      }

      await tokenStore.markTokenConsumed(record.id, now);
      await tokenStore.deleteVerificationToken(record.id);
      return { userId: record.userId };
    }
  };
}

module.exports = {
  TOKEN_TTL_MINUTES,
  createVerificationService,
  VerificationError
};
