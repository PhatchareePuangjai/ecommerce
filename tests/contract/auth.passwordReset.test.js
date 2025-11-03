const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

function buildEmail(tag) {
  return `reset-${tag}-${Date.now()}@example.com`;
}

async function registerAndVerify(email, password = 'Valid123') {
  const registerRes = await request(app).post('/auth/register').send({
    email,
    password,
    firstName: 'Reset',
    lastName: 'User'
  });
  expect(registerRes.status).toBe(201);

  const message = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
  expect(message).toBeDefined();
  const token = message.meta?.token;
  expect(typeof token).toBe('string');

  const verifyRes = await request(app).post('/auth/verify').send({ token });
  expect(verifyRes.status).toBe(204);
}

function findResetToken(email) {
  const msg = mailbox.find((mail) => mail.to === email && mail.type === 'reset');
  return msg?.meta?.token;
}

describe('Contract: Auth Password Reset', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('POST /auth/password/forgot issues reset token and /reset accepts new password', async () => {
    const email = buildEmail('happy');
    const originalPassword = 'Valid123';
    await registerAndVerify(email, originalPassword);

    const forgotRes = await request(app).post('/auth/password/forgot').send({ email });
    expect(forgotRes.status).toBe(202);

    const token = findResetToken(email);
    expect(typeof token).toBe('string');

    const resetRes = await request(app)
      .post('/auth/password/reset')
      .send({ token, newPassword: 'Newpass123' });
    expect(resetRes.status).toBe(204);

    const loginOld = await request(app).post('/auth/login').send({ email, password: originalPassword });
    expect(loginOld.status).toBe(401);

    const loginNew = await request(app).post('/auth/login').send({ email, password: 'Newpass123' });
    expect(loginNew.status).toBe(200);
  });

  test('POST /auth/password/forgot always returns 202 even when email missing/unknown', async () => {
    const resInvalid = await request(app).post('/auth/password/forgot').send({ email: 'not-an-email' });
    expect(resInvalid.status).toBe(202);

    const resUnknown = await request(app).post('/auth/password/forgot').send({ email: buildEmail('unknown') });
    expect(resUnknown.status).toBe(202);
  });

  test('POST /auth/password/reset rejects invalid token', async () => {
    const res = await request(app).post('/auth/password/reset').send({ token: 'invalid', newPassword: 'Valid123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'invalid_token');
  });

  test('POST /auth/password/reset enforces password policy', async () => {
    const email = buildEmail('policy');
    await registerAndVerify(email);
    await request(app).post('/auth/password/forgot').send({ email });
    const token = findResetToken(email);
    expect(typeof token).toBe('string');

    const res = await request(app)
      .post('/auth/password/reset')
      .send({ token, newPassword: 'short' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'invalid_password');
  });
});
