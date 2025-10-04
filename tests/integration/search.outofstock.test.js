const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: GET /search out-of-stock labeling', () => {
  test('includes out-of-stock items with label', async () => {
    const res = await request(app).get('/search').query({ q: 'Hat' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    const hat = res.body.items.find((x) => x.name === 'Hat');
    expect(hat).toBeTruthy();
    expect(hat.inStock).toBe(false);
    expect(hat.stockLabel).toBe('Out of stock');
  });
});

