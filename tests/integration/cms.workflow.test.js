const request = require('supertest');
const { app } = require('../../src/api/app');

describe('Integration: CMS Workflow publishing', () => {
  test('Draft → Review → Approved → Published shows in list and has audit', async () => {
    const create = await request(app)
      .post('/cms/articles')
      .send({ title: 'Article', body: 'Body', section: 'news' });
    const id = create.body.id;
    expect(create.status).toBe(201);

    let put = await request(app).put(`/cms/articles/${id}`).send({ action: 'submit' });
    expect(put.status).toBe(200);
    expect(put.body.status).toBe('review');

    put = await request(app).put(`/cms/articles/${id}`).send({ action: 'approve' });
    expect(put.status).toBe(200);
    expect(put.body.status).toBe('approved');

    put = await request(app).put(`/cms/articles/${id}`).send({ action: 'publish' });
    expect(put.status).toBe(200);
    expect(put.body.status).toBe('published');
    expect(put.body.publishedAt).toBeTruthy();

    const list = await request(app).get('/cms/articles');
    expect(list.status).toBe(200);
    const ids = list.body.items.map((a) => a.id);
    expect(ids).toContain(id);

    // Check audit trail exists via direct GET preview with role
    const prev = await request(app).get(`/cms/preview/article/${id}`).set('x-preview-role', 'editor');
    expect(prev.status).toBe(200);
    expect(Array.isArray(prev.body.item.audit)).toBe(true);
    expect(prev.body.item.audit.length).toBeGreaterThanOrEqual(1);
  });
});

