const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

async function registerVerifyLogin(email, password = 'Valid123') {
  const registerRes = await request(app).post('/auth/register').send({
    email,
    password,
    firstName: 'Profile',
    lastName: 'User'
  });
  expect(registerRes.status).toBe(201);

  const verifyMail = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
  expect(verifyMail).toBeDefined();
  const verifyRes = await request(app).post('/auth/verify').send({ token: verifyMail.meta.token });
  expect(verifyRes.status).toBe(204);

  const loginRes = await request(app).post('/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  return loginRes.body.accessToken;
}

describe('Contract: Profile', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('GET /profile returns profile for authenticated user', async () => {
    const email = `profile-${Date.now()}@example.com`;
    const token = await registerVerifyLogin(email);

    const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', email.toLowerCase());
    expect(Array.isArray(res.body.addresses)).toBe(true);
  });

  test('PUT /profile updates names and default payment token', async () => {
    const email = `profile-update-${Date.now()}@example.com`;
    const token = await registerVerifyLogin(email);

    const res = await request(app)
      .put('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'New', lastName: 'Name', defaultPaymentTokenId: 'tok_123' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ firstName: 'New', lastName: 'Name', defaultPaymentTokenId: 'tok_123' });
  });

  test('GET /profile requires authentication', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
  });
});
