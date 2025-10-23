const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: CMS Preview auth', () => {
  test('403 without preview role; 200 with role', async () => {
    // Create a draft article
    const create = await request(app)
      .post('/cms/articles')
      .send({ title: 'Draft', body: '...', section: 'news' });
    const id = create.body.id;

    const noRole = await request(app).get(`/cms/preview/article/${id}`);
    expect(noRole.status).toBe(403);

    const ok = await request(app).get(`/cms/preview/article/${id}`).set('x-preview-role', 'editor');
    expect(ok.status).toBe(200);
    expect(ok.body).toHaveProperty('type', 'article');
    expect(ok.body).toHaveProperty('item.id', id);
  });
});

