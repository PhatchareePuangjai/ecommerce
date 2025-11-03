const request = require('supertest');
const { app } = require('../../src/api/app');
const { mailbox } = require('../../src/api/routes/auth');
const authStore = require('../../src/services/auth/store');

async function bootstrapUser(tag) {
  const email = `addr-${tag}-${Date.now()}@example.com`;
  const password = 'Valid123';
  const registerRes = await request(app).post('/auth/register').send({
    email,
    password,
    firstName: 'Address',
    lastName: 'User'
  });
  expect(registerRes.status).toBe(201);
  const verifyMail = mailbox.find((mail) => mail.to === email && mail.type === 'verify');
  const verifyRes = await request(app).post('/auth/verify').send({ token: verifyMail.meta.token });
  expect(verifyRes.status).toBe(204);
  const loginRes = await request(app).post('/auth/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  return { token: loginRes.body.accessToken, email };
}

function baseAddress(label = 'Home') {
  return {
    label,
    recipient: 'Pat Lee',
    line1: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
    isDefaultShipping: true
  };
}

describe('Contract: Profile Addresses', () => {
  beforeEach(() => {
    if (typeof authStore.resetForTest === 'function') {
      authStore.resetForTest();
    }
    mailbox.length = 0;
    app.locals.mailbox = mailbox;
  });

  test('POST /profile/addresses adds address and DELETE removes it', async () => {
    const { token } = await bootstrapUser('crud');

    const createRes = await request(app)
      .post('/profile/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(baseAddress());
    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('id');
    const addressId = createRes.body.id;

    const listRes = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.addresses).toHaveLength(1);

    const deleteRes = await request(app)
      .delete(`/profile/addresses/${addressId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);
  });

  test('POST /profile/addresses enforces validation and limit', async () => {
    const { token } = await bootstrapUser('limit');

    const invalidRes = await request(app)
      .post('/profile/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'Bad' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body).toHaveProperty('error', 'invalid_address');

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post('/profile/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...baseAddress(`Addr ${i}`), isDefaultShipping: i === 0 });
      expect(res.status).toBe(201);
    }

    const limitRes = await request(app)
      .post('/profile/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(baseAddress('Overflow'));
    expect(limitRes.status).toBe(400);
    expect(limitRes.body).toHaveProperty('error', 'address_limit');
  });
});
