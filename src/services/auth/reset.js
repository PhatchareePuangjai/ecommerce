const crypto = require('crypto');
const { validatePassword } = require('./passwordPolicy');

const RESET_TTL_MINUTES = 120;

class ResetError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.name = 'ResetError';
    this.code = code;
    this.details = details;
  }
}

function createResetService({
  store,
  mailer,
  lockoutService,
  passwordHasher,
  clock = () => new Date()
} = {}) {
  if (!store) throw new Error('store is required');
  if (!mailer || typeof mailer.sendPasswordReset !== 'function') throw new Error('mailer.sendPasswordReset is required');
  if (!lockoutService || typeof lockoutService.recordSuccess !== 'function') throw new Error('lockoutService.recordSuccess is required');
  if (!passwordHasher || typeof passwordHasher.hashPassword !== 'function') throw new Error('passwordHasher.hashPassword is required');

  const ttlMs = RESET_TTL_MINUTES * 60 * 1000;

  return {
    async requestReset(email) {
      if (!email) return { delivered: false };
      const normalizedEmail = email.trim().toLowerCase();
      const user = await store.findUserByEmail(normalizedEmail);
      if (!user) {
        return { delivered: false };
      }

      const now = clock();
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(now.getTime() + ttlMs);

      await store.replaceResetToken({
        userId: user.id,
        token,
        issuedAt: now,
        expiresAt
      });

      await mailer.sendPasswordReset({
        email: user.email,
        token,
        expiresAt
      });

      return { delivered: true };
    },

    async completeReset({ token, newPassword }) {
      if (!token || typeof token !== 'string') {
        throw new ResetError('invalid_token');
      }

      const policy = validatePassword(newPassword);
      if (!policy.valid) {
        throw new ResetError('invalid_password', { errors: policy.errors });
      }

      const record = await store.findResetToken(token);
      if (!record) {
        throw new ResetError('invalid_token');
      }

      const now = clock();
      const expiresAt = record.expiresAt instanceof Date ? record.expiresAt : new Date(record.expiresAt);
      const consumedAt = record.consumedAt ? (record.consumedAt instanceof Date ? record.consumedAt : new Date(record.consumedAt)) : null;

      if (consumedAt || expiresAt <= now) {
        await store.deleteResetToken(record.id);
        throw new ResetError('invalid_token');
      }

      const user = await store.getUserById(record.userId);
      if (!user) {
        await store.deleteResetToken(record.id);
        throw new ResetError('invalid_token');
      }

      const passwordHash = await passwordHasher.hashPassword(newPassword);
      await store.updatePasswordHash(user.id, passwordHash);
      await lockoutService.recordSuccess(user);
      await store.markResetTokenConsumed(record.id, now);
      await store.deleteResetToken(record.id);

      return { userId: user.id };
    }
  };
}

module.exports = {
  createResetService,
  ResetError,
  RESET_TTL_MINUTES
};
