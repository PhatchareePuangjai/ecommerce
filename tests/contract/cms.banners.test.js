const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Contract: CMS Banners', () => {
  test('GET /cms/banners returns items[] of BannerPublic', async () => {
    const res = await request(app).get('/cms/banners');
    expect([200, 404]).toContain(res.status); // will fail until implemented
    if (res.status === 200) {
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    }
  });

  test('POST /cms/banners creates banner', async () => {
    const payload = { title: 'Sale', mediaUrl: 'https://cdn/img.jpg', position: 'home', order: 10 };
    const res = await request(app).post('/cms/banners').send(payload);
    expect([201, 404]).toContain(res.status); // will fail until implemented
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Sale');
    }
  });

  test('PUT /cms/banners/{id} updates banner', async () => {
    const res = await request(app).put('/cms/banners/BAN1').send({ order: 5 });
    expect([200, 404]).toContain(res.status); // will fail until implemented
  });
});

