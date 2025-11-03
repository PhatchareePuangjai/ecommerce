const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

describe('Contract: Auth Verification', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('POST /auth/verify confirms user using issued token', async () => {
    const email = `verify${Date.now()}@example.com`;
    const registerRes = await request(app).post('/auth/register').send({
      email,
      password: 'Valid123'
    });
    expect(registerRes.status).toBe(201);

    const lastMail = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
    expect(lastMail).toBeDefined();
    expect(lastMail).toMatchObject({
      to: email,
      type: 'verify'
    });

    const token = lastMail?.meta?.token;
    expect(typeof token).toBe('string');

    const verifyRes = await request(app).post('/auth/verify').send({ token });
    expect(verifyRes.status).toBe(204);
  });

  test('POST /auth/verify rejects invalid token', async () => {
    const res = await request(app).post('/auth/verify').send({ token: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'invalid_token');
  });
});
