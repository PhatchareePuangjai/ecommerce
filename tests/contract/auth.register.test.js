const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

describe('Contract: Auth Register & Verification', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('POST /auth/register creates user and returns verification metadata', async () => {
    const payload = {
      email: `user${Date.now()}@example.com`,
      password: 'Valid123',
      firstName: 'Test',
      lastName: 'User'
    };

    const res = await request(app).post('/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', payload.email.toLowerCase());
    expect(res.body).toHaveProperty('isVerified', false);
    expect(res.body).toHaveProperty('verification');
    expect(res.body.verification).toHaveProperty('status', 'pending');
    expect(res.body.verification).toHaveProperty('expiresAt');
  });

  test('POST /auth/register enforces password policy', async () => {
    const res = await request(app).post('/auth/register').send({
      email: `weak${Date.now()}@example.com`,
      password: 'short'
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'invalid_password');
  });
});
