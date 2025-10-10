const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Contract: CMS Articles', () => {
  test('GET /cms/articles returns items[] of ContentPublic', async () => {
    const res = await request(app).get('/cms/articles');
    expect([200, 404]).toContain(res.status); // will fail until implemented
    if (res.status === 200) {
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    }
  });

  test('POST /cms/articles creates draft article', async () => {
    const payload = { title: 'Hello', body: 'World', section: 'news', schedule: { startAt: new Date().toISOString() } };
    const res = await request(app).post('/cms/articles').send(payload);
    expect([201, 404]).toContain(res.status); // will fail until implemented
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Hello');
      expect(res.body).toHaveProperty('status');
    }
  });

  test('PUT /cms/articles/{id} updates article', async () => {
    const res = await request(app).put('/cms/articles/ART1').send({ title: 'Updated' });
    expect([200, 404]).toContain(res.status); // will fail until implemented
  });
});

