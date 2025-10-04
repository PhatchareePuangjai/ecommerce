const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: POST /cart stock enforcement', () => {
  test('rejects when quantity exceeds stock (409)', async () => {
    const res = await request(app).post('/cart').send({ skuId: 'SKU-LOW', quantity: 1 });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('accepts when quantity is within stock', async () => {
    const res = await request(app).post('/cart').send({ skuId: 'SKU123', quantity: 1 });
    expect(res.status).toBe(201);
  });
});

