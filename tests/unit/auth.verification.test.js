const { createVerificationService, VerificationError } = require('../../src/services/auth/verification');

const fixedNow = new Date('2025-11-02T18:00:00.000Z');

describe('Verification Service', () => {
  let now;
  let mailer;
  let service;
  let tokenStore;

  beforeEach(() => {
    now = new Date(fixedNow);
    mailer = { sendVerification: jest.fn().mockResolvedValue() };
    const tokens = new Map();
    const tokensByUser = new Map();
    tokenStore = {
      async replaceVerificationToken({ userId, token, issuedAt, expiresAt }) {
        const previous = tokensByUser.get(userId);
        if (previous) {
          tokens.delete(previous.token);
          tokensByUser.delete(userId);
        }
        const record = {
          id: `${userId}-${token}`,
          userId,
          token,
          issuedAt,
          expiresAt,
          consumedAt: null
        };
        tokens.set(token, record);
        tokensByUser.set(userId, record);
        return record;
      },
      async findVerificationToken(token) {
        const record = tokens.get(token);
        return record ? { ...record } : null;
      },
      async markTokenConsumed(id, consumedAt) {
        const record = Array.from(tokens.values()).find((t) => t.id === id);
        if (!record) return null;
        record.consumedAt = consumedAt;
        return { ...record };
      },
      async deleteVerificationToken(id) {
        const entry = Array.from(tokens.entries()).find(([, value]) => value.id === id);
        if (!entry) return;
        const [token, record] = entry;
        tokens.delete(token);
        const current = tokensByUser.get(record.userId);
        if (current && current.id === id) {
          tokensByUser.delete(record.userId);
        }
      }
    };
    service = createVerificationService({
      mailer,
      tokenStore,
      clock: () => new Date(now)
    });
  });

  test('issues verification token with 2-hour expiry and sends mail', async () => {
    const result = await service.issue({
      userId: 'user-1',
      email: 'verify@example.com'
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThanOrEqual(32);
    expect(result.expiresAt.toISOString()).toBe('2025-11-02T20:00:00.000Z');
    expect(mailer.sendVerification).toHaveBeenCalledWith({
      email: 'verify@example.com',
      token: result.token,
      expiresAt: result.expiresAt
    });
  });

  test('valid token verifies once and returns userId', async () => {
    const { token } = await service.issue({ userId: 'user-2', email: 'user@example.com' });
    const result = await service.verify(token);
    expect(result).toEqual({ userId: 'user-2' });

    await expect(service.verify(token)).rejects.toThrow(VerificationError);
  });

  test('expired token cannot be verified', async () => {
    const { token } = await service.issue({ userId: 'user-3', email: 'user3@example.com' });
    now = new Date('2025-11-02T21:00:00.000Z'); // Advance beyond expiry

    await expect(service.verify(token)).rejects.toThrow(VerificationError);
  });

  test('issuing new token invalidates previous one', async () => {
    const first = await service.issue({ userId: 'user-4', email: 'user4@example.com' });
    const second = await service.issue({ userId: 'user-4', email: 'user4@example.com' });

    await expect(service.verify(first.token)).rejects.toThrow(VerificationError);
    const verified = await service.verify(second.token);
    expect(verified.userId).toBe('user-4');
  });

  test('invalid token throws VerificationError', async () => {
    await expect(service.verify('nope')).rejects.toThrow(VerificationError);
  });
});
