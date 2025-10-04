const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: POST /checkout address validation', () => {
  const items = [{ skuId: 'SKU123', quantity: 1 }];

  test('422 on invalid postal validation', async () => {
    const invalid = { line1: '123', city: 'X', region: 'YY', postalCode: '00000', country: 'US' };
    const res = await request(app)
      .post('/checkout')
      .send({ shippingAddress: invalid, paymentMethod: { provider: 'stripe', token: 'tok_card_123' }, items, totals: { total: 20, currency: 'USD' }, email: 'a@b.com' });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  test('201 on valid address', async () => {
    const valid = { line1: '1 Market St', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'US' };
    const res = await request(app)
      .post('/checkout')
      .send({ shippingAddress: valid, paymentMethod: { provider: 'stripe', token: 'tok_card_123' }, items, totals: { total: 20, currency: 'USD' }, email: 'a@b.com' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('orderCreated', true);
  });
});

