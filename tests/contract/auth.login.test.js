const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

function buildEmail(suffix) {
  return `login-${suffix}-${Date.now()}@example.com`;
}

async function registerUser(email, password = 'Valid123') {
  const payload = {
    email,
    password,
    firstName: 'Test',
    lastName: 'User'
  };
  const res = await request(app).post('/auth/register').send(payload);
  expect(res.status).toBe(201);
  return res;
}

async function verifyLatestToken(email) {
  const message = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
  expect(message).toBeDefined();
  const token = message.meta?.token;
  expect(typeof token).toBe('string');
  const verifyRes = await request(app).post('/auth/verify').send({ token });
  expect(verifyRes.status).toBe(204);
}

describe('Contract: Auth Login & Logout', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('POST /auth/login authenticates verified user and returns token metadata', async () => {
    const email = buildEmail('success');
    const password = 'Valid123';
    await registerUser(email, password);
    await verifyLatestToken(email);

    const loginRes = await request(app).post('/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(typeof loginRes.body.accessToken).toBe('string');
    expect(loginRes.body).toHaveProperty('expiresIn');
    expect(typeof loginRes.body.expiresIn).toBe('number');
  });

  test('POST /auth/login rejects unverified users', async () => {
    const email = buildEmail('unverified');
    const password = 'Valid123';
    await registerUser(email, password);

    const loginRes = await request(app).post('/auth/login').send({ email, password });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body).toHaveProperty('error', 'email_unverified');
  });

  test('POST /auth/login rejects invalid credentials and locks after five attempts', async () => {
    const email = buildEmail('lockout');
    const password = 'Valid123';
    await registerUser(email, password);
    await verifyLatestToken(email);

    for (let i = 0; i < 4; i += 1) {
      const res = await request(app).post('/auth/login').send({ email, password: 'WrongPass1' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'invalid_credentials');
    }

    const fifth = await request(app).post('/auth/login').send({ email, password: 'WrongPass1' });
    expect(fifth.status).toBe(403);
    expect(fifth.body).toHaveProperty('error', 'account_locked');
    expect(typeof fifth.body.retryAfter).toBe('number');
  });

  test('POST /auth/login accepts credentials again after successful authentication and resets failures', async () => {
    const email = buildEmail('reset');
    const password = 'Valid123';
    await registerUser(email, password);
    await verifyLatestToken(email);

    const firstFail = await request(app).post('/auth/login').send({ email, password: 'WrongPass1' });
    expect(firstFail.status).toBe(401);

    const success = await request(app).post('/auth/login').send({ email, password });
    expect(success.status).toBe(200);
    expect(success.body).toHaveProperty('accessToken');

    const secondFail = await request(app).post('/auth/login').send({ email, password: 'WrongPass1' });
    expect(secondFail.status).toBe(401);
  });

  test('POST /auth/logout revokes active session', async () => {
    const email = buildEmail('logout');
    const password = 'Valid123';
    await registerUser(email, password);
    await verifyLatestToken(email);

    const loginRes = await request(app).post('/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    const { accessToken } = loginRes.body;

    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expect(logoutRes.status).toBe(204);

    const secondLogout = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expect(secondLogout.status).toBe(401);
  });
});
