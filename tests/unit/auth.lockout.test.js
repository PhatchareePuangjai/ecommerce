const { createLockoutService } = require('../../src/services/auth/lockout');

const baseUser = {
  id: 'user-1',
  failedLoginCount: 0,
  lockedUntil: null
};

describe('Lockout Service', () => {
  let now;
  let store;
  let service;

  beforeEach(() => {
    now = new Date('2025-11-02T06:00:00.000Z');
    store = {
      updateLockout: jest.fn(async (userId, patch) => ({
        ...baseUser,
        ...patch,
        id: userId
      }))
    };
    service = createLockoutService({
      store,
      clock: () => new Date(now)
    });
  });

  test('recordFailure increments failed count and reports remaining attempts', async () => {
    const result = await service.recordFailure({ ...baseUser });
    expect(store.updateLockout).toHaveBeenCalledWith('user-1', {
      failedLoginCount: 1,
      lockedUntil: null
    });
    expect(result.locked).toBe(false);
    expect(result.remainingAttempts).toBe(4);
  });

  test('recordFailure locks account after threshold and returns retryAfter seconds', async () => {
    const user = { ...baseUser, failedLoginCount: 4, lockedUntil: null };
    const result = await service.recordFailure(user);
    expect(store.updateLockout).toHaveBeenCalledWith('user-1', {
      failedLoginCount: 5,
      lockedUntil: new Date('2025-11-02T06:15:00.000Z')
    });
    expect(result.locked).toBe(true);
    expect(result.retryAfter).toBe(900);
  });

  test('isLocked returns true when lockedUntil is in the future', () => {
    const user = { ...baseUser, lockedUntil: new Date('2025-11-02T06:05:00.000Z') };
    const status = service.isLocked(user);
    expect(status.locked).toBe(true);
    expect(status.retryAfter).toBe(300);
  });

  test('recordSuccess resets failed login counters and lockedUntil', async () => {
    await service.recordSuccess({
      ...baseUser,
      failedLoginCount: 3,
      lockedUntil: new Date('2025-11-02T06:05:00.000Z')
    });
    expect(store.updateLockout).toHaveBeenCalledWith('user-1', {
      failedLoginCount: 0,
      lockedUntil: null
    });
  });
});
