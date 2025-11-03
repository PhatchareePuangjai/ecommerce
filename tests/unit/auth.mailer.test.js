const { createMailer } = require('../../src/services/auth/mailer');

describe('Auth Mailer', () => {
  test('sends verification email via transport with correct payload', async () => {
    const sent = [];
    const transport = { send: jest.fn(async (msg) => sent.push(msg)) };
    const mailer = createMailer({ transport });

    const expiresAt = new Date('2025-11-02T08:00:00.000Z');
    await mailer.sendVerification({
      email: 'user@example.com',
      token: 'verify-token',
      expiresAt
    });

    expect(transport.send).toHaveBeenCalledTimes(1);
    expect(sent[0]).toMatchObject({
      to: 'user@example.com',
      type: 'verify',
      subject: 'Verify your account',
      meta: {
        token: 'verify-token',
        expiresAt
      }
    });
  });

  test('sends password reset email via transport with correct payload', async () => {
    const sent = [];
    const transport = { send: jest.fn(async (msg) => sent.push(msg)) };
    const mailer = createMailer({ transport });

    const expiresAt = new Date('2025-11-02T09:00:00.000Z');
    await mailer.sendPasswordReset({
      email: 'user@example.com',
      token: 'reset-token',
      expiresAt
    });

    expect(transport.send).toHaveBeenCalledTimes(1);
    expect(sent[0]).toMatchObject({
      to: 'user@example.com',
      type: 'reset',
      subject: 'Reset your password',
      meta: {
        token: 'reset-token',
        expiresAt
      }
    });
  });
});
