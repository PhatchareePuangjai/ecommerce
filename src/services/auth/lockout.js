const DEFAULT_THRESHOLD = 5;
const DEFAULT_LOCKOUT_MINUTES = 15;

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function secondsBetween(from, to) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 1000));
}

function createLockoutService({
  store,
  clock = () => new Date(),
  threshold = DEFAULT_THRESHOLD,
  lockoutMinutes = DEFAULT_LOCKOUT_MINUTES
} = {}) {
  if (!store || typeof store.updateLockout !== 'function') {
    throw new Error('store.updateLockout is required');
  }

  const lockoutMs = lockoutMinutes * 60 * 1000;

  return {
    isLocked(user, now = clock()) {
      const lockedUntil = toDate(user.lockedUntil);
      if (lockedUntil && lockedUntil > now) {
        return {
          locked: true,
          retryAfter: secondsBetween(now, lockedUntil)
        };
      }
      return { locked: false, retryAfter: 0 };
    },

    async recordFailure(user) {
      const currentFailures = Number(user.failedLoginCount || 0);
      const nextFailures = currentFailures + 1;
      const now = clock();
      let lockedUntil = null;

      if (nextFailures >= threshold) {
        lockedUntil = new Date(now.getTime() + lockoutMs);
      }

      await store.updateLockout(user.id, {
        failedLoginCount: nextFailures,
        lockedUntil
      });

      if (lockedUntil) {
        return {
          locked: true,
          retryAfter: secondsBetween(now, lockedUntil)
        };
      }

      return {
        locked: false,
        remainingAttempts: Math.max(threshold - nextFailures, 0)
      };
    },

    async recordSuccess(user) {
      await store.updateLockout(user.id, {
        failedLoginCount: 0,
        lockedUntil: null
      });
    }
  };
}

module.exports = {
  createLockoutService,
  DEFAULT_THRESHOLD,
  DEFAULT_LOCKOUT_MINUTES
};
