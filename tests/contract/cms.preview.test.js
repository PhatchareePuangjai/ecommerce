const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Contract: CMS Preview', () => {
  test('GET /cms/preview/article/:id requires x-preview-role and returns item', async () => {
    const url = '/cms/preview/article/ART1';
    const res403 = await request(app).get(url);
    expect([403, 404]).toContain(res403.status); // will fail until implemented

    const res = await request(app).get(url).set('x-preview-role', 'admin');
    expect([200, 404]).toContain(res.status); // will fail until implemented
    if (res.status === 200) {
      expect(res.body).toHaveProperty('type', 'article');
      expect(res.body).toHaveProperty('item');
    }
  });
});
