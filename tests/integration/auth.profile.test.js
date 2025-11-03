const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

async function registerVerifyLogin(email, password = 'Valid123') {
  const registerRes = await request(app).post('/auth/register').send({
    email,
    password,
    firstName: 'Integration',
    lastName: 'Tester'
  });
  expect(registerRes.status).toBe(201);

  const verifyMail = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
  expect(verifyMail).toBeDefined();
  const verifyRes = await request(app).post('/auth/verify').send({ token: verifyMail.meta.token });
  expect(verifyRes.status).toBe(204);

  const loginRes = await request(app).post('/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  return { token: loginRes.body.accessToken, email };
}

describe('Integration: Auth Profile & Addresses', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') authStore.resetForTest();
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('Happy path: register → verify → login → update profile → add address → delete address', async () => {
    const email = `integration-profile-${Date.now()}@example.com`;
    const { token } = await registerVerifyLogin(email);

    const initialProfile = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(initialProfile.status).toBe(200);
    expect(initialProfile.body.addresses).toHaveLength(0);

    const updateRes = await request(app)
      .put('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated', lastName: 'Name' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.firstName).toBe('Updated');

    const addrRes = await request(app)
      .post('/profile/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        label: 'Home',
        recipient: 'Integration Tester',
        line1: '1 Infinite Loop',
        city: 'Cupertino',
        state: 'CA',
        postalCode: '95014',
        country: 'US',
        isDefaultShipping: true
      });
    expect(addrRes.status).toBe(201);
    const addressId = addrRes.body.id;

    const profileAfterAddr = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(profileAfterAddr.status).toBe(200);
    expect(profileAfterAddr.body.addresses).toHaveLength(1);

    const deleteRes = await request(app)
      .delete(`/profile/addresses/${addressId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    const profileFinal = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(profileFinal.body.addresses).toHaveLength(0);
  });

  test('Password reset unlocks account and clears lockout during end-to-end flow', async () => {
    const email = `integration-reset-${Date.now()}@example.com`;
    const password = 'Valid123';
    await registerVerifyLogin(email, password);

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app).post('/auth/login').send({ email, password: 'WrongPass1' });
      expect([401, 403]).toContain(res.status);
    }

    const forgotRes = await request(app).post('/auth/password/forgot').send({ email });
    expect(forgotRes.status).toBe(202);

    const resetMail = mailbox.find((mail) => mail.to === email && mail.type === 'reset');
    expect(resetMail).toBeDefined();

    const resetRes = await request(app)
      .post('/auth/password/reset')
      .send({ token: resetMail.meta.token, newPassword: 'NewPass123' });
    expect(resetRes.status).toBe(204);

    const newLogin = await request(app).post('/auth/login').send({ email, password: 'NewPass123' });
    expect(newLogin.status).toBe(200);
  });
});
