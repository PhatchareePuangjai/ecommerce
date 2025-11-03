const { createSessionService } = require('../../src/services/auth/session');

describe('Session Service', () => {
  let now;
  let store;
  let service;

  beforeEach(() => {
    now = new Date('2025-11-02T06:00:00.000Z');
    store = {
      createSession: jest.fn(async (record) => record),
      findSessionByToken: jest.fn(),
      revokeSession: jest.fn(async () => true)
    };
    service = createSessionService({
      store,
      clock: () => new Date(now),
      ttlSeconds: 900
    });
  });

  test('issue creates session with token and expiry', async () => {
    const result = await service.issue('user-1', { userAgent: 'jest', ip: '127.0.0.1' });
    expect(store.createSession).toHaveBeenCalled();
    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
    expect(result).toHaveProperty('expiresIn', 900);
  });

  test('validate returns null for missing session', async () => {
    store.findSessionByToken.mockResolvedValue(null);
    const session = await service.validate('token');
    expect(session).toBeNull();
  });

  test('validate returns session when active', async () => {
    store.findSessionByToken.mockResolvedValue({
      userId: 'user-1',
      jwtId: 'token',
      issuedAt: new Date(now),
      expiresAt: new Date('2025-11-02T06:10:00.000Z'),
      revokedAt: null
    });
    const session = await service.validate('token');
    expect(session).not.toBeNull();
    expect(session.userId).toBe('user-1');
  });

  test('validate returns null when revoked or expired', async () => {
    store.findSessionByToken.mockResolvedValue({
      userId: 'user-1',
      jwtId: 'token',
      issuedAt: new Date(now),
      expiresAt: new Date('2025-11-02T05:59:00.000Z'),
      revokedAt: null
    });
    expect(await service.validate('token')).toBeNull();

    store.findSessionByToken.mockResolvedValue({
      userId: 'user-1',
      jwtId: 'token',
      issuedAt: new Date(now),
      expiresAt: new Date('2025-11-02T06:10:00.000Z'),
      revokedAt: new Date('2025-11-02T06:05:00.000Z')
    });
    expect(await service.validate('token')).toBeNull();
  });

  test('revoke marks session as revoked', async () => {
    const result = await service.revoke('token');
    expect(result).toBe(true);
    expect(store.revokeSession).toHaveBeenCalled();
  });
});
