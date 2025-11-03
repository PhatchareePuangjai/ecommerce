const { createResetService, ResetError, RESET_TTL_MINUTES } = require('../../src/services/auth/reset');

describe('Reset Service', () => {
  let now;
  let store;
  let mailer;
  let lockoutService;
  let passwordHasher;
  let service;
  let issuedTokens;

  beforeEach(() => {
    now = new Date('2025-11-02T06:00:00.000Z');
    issuedTokens = new Map();
    store = {
      findUserByEmail: jest.fn(async (email) => (email === 'user@example.com' ? { id: 'user-1', email, failedLoginCount: 2 } : null)),
      replaceResetToken: jest.fn(async ({ userId, token, issuedAt, expiresAt }) => {
        issuedTokens.set(token, { id: `${userId}-${token}`, userId, token, issuedAt, expiresAt, consumedAt: null });
      }),
      findResetToken: jest.fn(async (token) => issuedTokens.get(token) || null),
      deleteResetToken: jest.fn(async (id) => {
        for (const [key, value] of issuedTokens.entries()) {
          if (value.id === id) issuedTokens.delete(key);
        }
      }),
      markResetTokenConsumed: jest.fn(async (id, consumedAt) => {
        for (const value of issuedTokens.values()) {
          if (value.id === id) value.consumedAt = consumedAt;
        }
      }),
      getUserById: jest.fn(async (id) => (id === 'user-1' ? { id: 'user-1', email: 'user@example.com', failedLoginCount: 2 } : null)),
      updatePasswordHash: jest.fn(async () => true)
    };
    mailer = { sendPasswordReset: jest.fn(async () => {}) };
    lockoutService = { recordSuccess: jest.fn(async () => {}) };
    passwordHasher = { hashPassword: jest.fn(async () => 'hashed-password') };
    service = createResetService({
      store,
      mailer,
      lockoutService,
      passwordHasher,
      clock: () => new Date(now)
    });
  });

  test('requestReset issues token and sends email when user exists', async () => {
    const result = await service.requestReset('user@example.com');
    expect(result.delivered).toBe(true);
    expect(store.replaceResetToken).toHaveBeenCalled();
    expect(mailer.sendPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com'
      })
    );
  });

  test('requestReset returns false when user not found without throwing', async () => {
    const result = await service.requestReset('unknown@example.com');
    expect(result.delivered).toBe(false);
    expect(store.replaceResetToken).not.toHaveBeenCalled();
  });

  test('completeReset updates password and clears lockout', async () => {
    await service.requestReset('user@example.com');
    const token = Array.from(issuedTokens.keys())[0];
    const result = await service.completeReset({ token, newPassword: 'NewPass123' });
    expect(result.userId).toBe('user-1');
    expect(passwordHasher.hashPassword).toHaveBeenCalledWith('NewPass123');
    expect(store.updatePasswordHash).toHaveBeenCalledWith('user-1', 'hashed-password');
    expect(lockoutService.recordSuccess).toHaveBeenCalled();
    expect(store.deleteResetToken).toHaveBeenCalled();
  });

  test('completeReset rejects invalid password per policy', async () => {
    await service.requestReset('user@example.com');
    const token = Array.from(issuedTokens.keys())[0];
    await expect(service.completeReset({ token, newPassword: 'short' })).rejects.toThrow(ResetError);
  });

  test('completeReset fails for expired token', async () => {
    await service.requestReset('user@example.com');
    const token = Array.from(issuedTokens.keys())[0];
    now = new Date(new Date(now).getTime() + (RESET_TTL_MINUTES + 10) * 60 * 1000);
    await expect(service.completeReset({ token, newPassword: 'Valid123' })).rejects.toThrow(ResetError);
  });
});
